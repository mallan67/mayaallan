-- ============================================================================
-- PR A — Critical payment & fulfillment fixes
-- ============================================================================
-- Run this migration once on the Supabase SQL editor BEFORE the code in
-- fix/critical-payment-fulfillment is deployed. The code calls the RPC
-- defined below and assumes the unique index exists.
--
-- All statements are idempotent — re-running is safe.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Backstop webhook idempotency at the database level
-- ----------------------------------------------------------------------------
-- The application now pre-checks for an existing order by paypal_order_id and
-- uses .upsert(... onConflict: "paypal_order_id"), but a UNIQUE index makes
-- the invariant impossible to violate even under racing concurrent webhooks.
--
-- We use a PARTIAL unique index (WHERE paypal_order_id IS NOT NULL) so that
-- legacy / Stripe-only rows with a NULL paypal_order_id don't collide.
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_paypal_order_id
  ON public.orders (paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 2) Atomic download counter
-- ----------------------------------------------------------------------------
-- Replaces the read-then-update pattern in /api/download/[token]/route.ts that
-- has a TOCTOU race: two concurrent requests can both read download_count=N
-- and both succeed, bypassing the max-downloads cap.
--
-- This function takes a token string, atomically increments the count if
-- under cap AND not expired, and returns the resulting state. The caller
-- branches on `status`:
--   'ok'         -> increment succeeded; redirect / stream the file
--   'not_found'  -> no such token
--   'expired'    -> token past expires_at
--   'maxed'      -> at or above max_downloads
--   'no_order'   -> token has no associated order (defensive)
--
-- `FOR UPDATE` is used to lock the row for the duration of the check+update
-- inside a single statement-level transaction, eliminating the race.
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
  SELECT id, expires_at, download_count, max_downloads, order_id, book_id
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
     SET download_count = download_count + 1,
         last_used_at   = NOW()
   WHERE id = v_id
   RETURNING download_count INTO v_count;

  RETURN QUERY SELECT
    'ok'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
END;
$$;

-- Grant execute to the service role so supabaseAdmin can call it.
-- (RLS is bypassed by service role; this is belt-and-braces.)
GRANT EXECUTE ON FUNCTION public.increment_download_count(TEXT)
  TO service_role;


-- ----------------------------------------------------------------------------
-- 3) Optional: ensure last_used_at exists on download_tokens
-- ----------------------------------------------------------------------------
-- The application code references last_used_at; add it if your existing
-- schema doesn't have it yet. Safe to re-run.
-- ----------------------------------------------------------------------------
ALTER TABLE public.download_tokens
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
