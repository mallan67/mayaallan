-- Fix ambiguous column references in the download counter RPCs.
--
-- Background:
--   PR B introduced increment_download_count() and decrement_download_count()
--   with RETURNS TABLE columns whose names happened to match columns of the
--   underlying download_tokens table (`expires_at`, `download_count`,
--   `order_id`, `book_id`). In PL/pgSQL, RETURNS TABLE columns are treated
--   as OUT parameters with the same scope as DECLARE'd variables, so any
--   unqualified reference to one of those names inside the function body is
--   ambiguous between the OUT parameter and the table column.
--
--   Postgres correctly refuses to guess and raises 42702
--     "column reference \"expires_at\" is ambiguous" (or "download_count").
--   That causes the download route to return 503 to the customer.
--
-- Fix:
--   Add a table alias `dt` to every reference to public.download_tokens and
--   qualify every column with that alias inside the function body. This makes
--   every column reference unambiguous (it's a table column, not the OUT
--   parameter). The function signatures and behavior are otherwise identical,
--   so the calling code in src/app/api/download/[token]/route.ts and
--   src/app/api/payment/paypal/webhook/route.ts continues to work unchanged.

-- ----------------------------------------------------------------------------
-- increment_download_count
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
  SELECT dt.id,
         dt.expires_at,
         COALESCE(dt.download_count, 0),
         COALESCE(dt.max_downloads, 5),
         dt.order_id,
         dt.book_id
    INTO v_id, v_expires, v_count, v_max, v_order_id, v_book_id
    FROM public.download_tokens AS dt
   WHERE dt.token = p_token
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

  UPDATE public.download_tokens AS dt
     SET download_count = COALESCE(dt.download_count, 0) + 1,
         last_used_at   = NOW()
   WHERE dt.id = v_id
   RETURNING dt.download_count INTO v_count;

  RETURN QUERY SELECT
    'ok'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_download_count(TEXT)
  TO service_role;


-- ----------------------------------------------------------------------------
-- decrement_download_count
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
  SELECT dt.id, COALESCE(dt.download_count, 0)
    INTO v_id, v_count
    FROM public.download_tokens AS dt
   WHERE dt.token = p_token
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'no_token'::TEXT, NULL::INTEGER;
    RETURN;
  END IF;

  IF v_count <= 0 THEN
    RETURN QUERY SELECT 'at_zero'::TEXT, v_count;
    RETURN;
  END IF;

  UPDATE public.download_tokens AS dt
     SET download_count = GREATEST(COALESCE(dt.download_count, 0) - 1, 0)
   WHERE dt.id = v_id
   RETURNING dt.download_count INTO v_count;

  RETURN QUERY SELECT 'ok'::TEXT, v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_download_count(TEXT)
  TO service_role;
