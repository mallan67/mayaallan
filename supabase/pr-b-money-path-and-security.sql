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
-- 3) Track which orders had their delivery email confirmed-sent. The webhook
--    handler uses this to distinguish "fully fulfilled, dedupe the retry"
--    from "token exists but email failed, retry the send instead of
--    returning deduplicated:true".
-- ----------------------------------------------------------------------------
ALTER TABLE public.download_tokens
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;


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
