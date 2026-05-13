-- ============================================================================
-- PR B — Money-path hardening + security migrations
-- ============================================================================
-- Run this migration once on the Supabase SQL editor BEFORE the code in
-- fix/pr-b-money-path-and-security is deployed.
--
-- All statements are idempotent (IF NOT EXISTS / CREATE OR REPLACE / ADD
-- COLUMN IF NOT EXISTS) so re-running is safe.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1) Track pending PayPal orders so /api/checkout/paypal/return can validate
--    a returning ?token=<orderId> belongs to a real checkout we created.
-- ----------------------------------------------------------------------------
-- Without this table, anyone who learns a real APPROVED order ID can hit
-- /api/checkout/paypal/return?token=<that-id> and force-capture another
-- customer's payment before the customer themselves returns. The return
-- route now requires every token it captures to be a row in this table
-- with status='pending'; on success it marks the row 'consumed'.
--
-- ip_hash + user_agent_hash are SOFT binding signals (legitimate users
-- can switch networks / devices between create-order and approve-order).
-- They feed an admin warning alert on mismatch but DO NOT block capture.
-- The hard gate is "order ID is in the table AND status='pending' AND not
-- expired" — that alone defeats the replay attack.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_paypal_orders (
  id                BIGSERIAL PRIMARY KEY,
  paypal_order_id   TEXT NOT NULL UNIQUE,
  book_id           BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  book_slug         TEXT NOT NULL,
  ip_hash           TEXT,
  user_agent_hash   TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'consumed', 'expired')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at       TIMESTAMPTZ
);

-- Lookups are always by paypal_order_id; the UNIQUE constraint above already
-- creates an index, but we add a partial index on status to speed up the
-- "any stale pending rows still around?" cleanup queries.
CREATE INDEX IF NOT EXISTS idx_pending_paypal_orders_status_created
  ON public.pending_paypal_orders (status, created_at)
  WHERE status = 'pending';


-- ----------------------------------------------------------------------------
-- 2) Prevent duplicate download_tokens for the same order under webhook
--    retry races. Without this, two concurrent PayPal webhook retries can
--    both fall into the "no existing token" branch and both insert — the
--    customer ends up with two valid tokens, two emails, 10 downloads.
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_download_tokens_order_id
  ON public.download_tokens (order_id)
  WHERE order_id IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 3) Track email delivery state. Three columns work together to prevent
--    duplicate emails under concurrent webhook workers:
--
--    email_sent_at         — Resend confirmed delivery for this token. The
--                            webhook handler dedupes when this is non-null.
--    email_send_claimed_at — A worker has claimed the right to call Resend
--                            and is currently sending. Claims expire after
--                            a stale timeout (default 10 minutes) so a
--                            crashed worker doesn't block forever.
--    email_send_claimed_by — Opaque worker identifier for forensics.
--
--    Without the claim columns, two concurrent webhook workers can BOTH
--    observe email_sent_at IS NULL, BOTH call Resend, and the customer
--    gets two copies of the same email. The claim columns let exactly one
--    worker (the one whose UPDATE acquires the claim) call Resend.
-- ----------------------------------------------------------------------------
ALTER TABLE public.download_tokens
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE public.download_tokens
  ADD COLUMN IF NOT EXISTS email_send_claimed_at TIMESTAMPTZ;
ALTER TABLE public.download_tokens
  ADD COLUMN IF NOT EXISTS email_send_claimed_by TEXT;


-- ----------------------------------------------------------------------------
-- 3a) Atomic email-send claim. Returns one of:
--       'ok'              -> claim acquired; caller MAY call Resend
--       'already_sent'    -> email_sent_at IS NOT NULL; caller MUST skip send
--       'claimed_by_other'-> another worker holds a fresh claim; caller MUST
--                            NOT send (return retryable response to PayPal)
--       'not_found'       -> no row with that token
--
--    Stale claims (older than p_stale_timeout_seconds) are stolen — covers
--    the case where a worker crashed mid-send. Default 600s = 10 minutes
--    which is far longer than Resend's typical RTT but short enough that
--    a crash doesn't strand the email for hours.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_download_email_send(
  p_token                   TEXT,
  p_worker_id               TEXT,
  p_stale_timeout_seconds   INTEGER DEFAULT 600
)
RETURNS TABLE (
  status     TEXT,
  token_id   BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id           BIGINT;
  v_sent_at      TIMESTAMPTZ;
  v_claim_at     TIMESTAMPTZ;
  v_stale_before TIMESTAMPTZ;
BEGIN
  v_stale_before := NOW() - (p_stale_timeout_seconds || ' seconds')::INTERVAL;

  SELECT id, email_sent_at, email_send_claimed_at
    INTO v_id, v_sent_at, v_claim_at
    FROM public.download_tokens
   WHERE token = p_token
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'not_found'::TEXT, NULL::BIGINT;
    RETURN;
  END IF;

  IF v_sent_at IS NOT NULL THEN
    RETURN QUERY SELECT 'already_sent'::TEXT, v_id;
    RETURN;
  END IF;

  -- Fresh claim held by another worker — refuse.
  IF v_claim_at IS NOT NULL AND v_claim_at > v_stale_before THEN
    RETURN QUERY SELECT 'claimed_by_other'::TEXT, v_id;
    RETURN;
  END IF;

  -- Acquire the claim. Either no prior claim, or the prior claim is stale
  -- (worker likely crashed) and we steal it.
  UPDATE public.download_tokens
     SET email_send_claimed_at = NOW(),
         email_send_claimed_by = p_worker_id
   WHERE id = v_id;

  RETURN QUERY SELECT 'ok'::TEXT, v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_download_email_send(TEXT, TEXT, INTEGER)
  TO service_role;


-- ----------------------------------------------------------------------------
-- 3b) Release a previously-acquired claim WITHOUT marking email_sent_at.
--     Used when Resend rejects the send — the next webhook retry (or a
--     manual resend) should be allowed to try again. Idempotent.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_download_email_claim(
  p_token     TEXT,
  p_worker_id TEXT
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.download_tokens
     SET email_send_claimed_at = NULL,
         email_send_claimed_by = NULL
   WHERE token = p_token
     -- Only the original claimant can release. A stale-claim stealer would
     -- have a different worker_id and shouldn't clobber the new claim.
     AND email_send_claimed_by = p_worker_id
     AND email_sent_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.release_download_email_claim(TEXT, TEXT)
  TO service_role;


-- ----------------------------------------------------------------------------
-- 4) Replace increment_download_count with NULL-safe arithmetic. The PR A
--    version evaluated `v_count >= v_max` against NULL (returning NULL,
--    which is falsy) and then ran `download_count = download_count + 1`
--    (NULL + 1 = NULL) — legacy rows with NULL counters would have
--    effectively unlimited downloads.
--
--    Default max_downloads when NULL is 5 (the product expectation). Default
--    download_count when NULL is 0. Both are normalized in the RETURN values
--    so the caller always sees concrete integers.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_download_count(p_token TEXT)
RETURNS TABLE (
  status         TEXT,
  download_count INTEGER,
  max_downloads  INTEGER,
  expires_at     TIMESTAMPTZ,
  order_id       BIGINT,
  book_id        BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id           BIGINT;
  v_expires      TIMESTAMPTZ;
  v_count        INTEGER;
  v_max          INTEGER;
  v_order_id     BIGINT;
  v_book_id      BIGINT;
BEGIN
  SELECT id, expires_at,
         COALESCE(download_count, 0),
         COALESCE(max_downloads, 5),
         order_id, book_id
    INTO v_id, v_expires, v_count, v_max, v_order_id, v_book_id
    FROM public.download_tokens
   WHERE token = p_token
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      'not_found'::TEXT, NULL::INTEGER, NULL::INTEGER,
      NULL::TIMESTAMPTZ, NULL::BIGINT, NULL::BIGINT;
    RETURN;
  END IF;

  IF v_expires IS NOT NULL AND v_expires < NOW() THEN
    RETURN QUERY SELECT
      'expired'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
    RETURN;
  END IF;

  IF v_count >= v_max THEN
    RETURN QUERY SELECT
      'maxed'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
    RETURN;
  END IF;

  IF v_order_id IS NULL THEN
    RETURN QUERY SELECT
      'no_order'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
    RETURN;
  END IF;

  UPDATE public.download_tokens
     SET download_count = COALESCE(download_count, 0) + 1,
         last_used_at   = NOW()
   WHERE id = v_id
   RETURNING download_count INTO v_count;

  RETURN QUERY SELECT
    'ok'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_download_count(TEXT)
  TO service_role;


-- ----------------------------------------------------------------------------
-- 5) Compensating decrement for use after a post-increment failure (e.g.
--    blob fetch threw, blob returned 502, order/book lookup errored, etc.)
--    Without this, a transient infrastructure failure permanently consumes
--    one of the customer's 5 download attempts.
--
--    Returns 'ok' on success, 'no_token' if the token row vanished, or
--    'at_zero' if the counter is already 0 (the increment never happened,
--    so there's nothing to compensate).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_download_count(p_token TEXT)
RETURNS TABLE (
  status         TEXT,
  download_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id    BIGINT;
  v_count INTEGER;
BEGIN
  SELECT id, COALESCE(download_count, 0)
    INTO v_id, v_count
    FROM public.download_tokens
   WHERE token = p_token
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'no_token'::TEXT, NULL::INTEGER;
    RETURN;
  END IF;

  IF v_count <= 0 THEN
    RETURN QUERY SELECT 'at_zero'::TEXT, v_count;
    RETURN;
  END IF;

  UPDATE public.download_tokens
     SET download_count = GREATEST(COALESCE(download_count, 0) - 1, 0)
   WHERE id = v_id
   RETURNING download_count INTO v_count;

  RETURN QUERY SELECT 'ok'::TEXT, v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_download_count(TEXT)
  TO service_role;
