-- =============================================================================
-- PORTED SQL FUNCTIONS — app_private
-- =============================================================================
-- The six application functions, recreated in the private `app_private` schema
-- with a HARDENED search_path.
--
-- Why search_path = '' (was SET search_path TO 'public'):
--   All six are SECURITY DEFINER. A mutable/`public` search_path on a
--   SECURITY DEFINER function is a privilege-escalation vector — a caller who
--   can create objects in a searched schema could shadow a table/operator the
--   function relies on and have it run with the definer's rights. Pinning to an
--   empty search_path and fully-qualifying every application object (every ref
--   below is app_private.<table>) removes that surface. Built-in types,
--   operators and functions (text, timestamptz, now(), count(), coalesce, …)
--   still resolve because pg_catalog is always implicitly available.
--
-- Behavior is otherwise byte-for-byte identical to the public definitions:
-- same signatures, same FOR UPDATE row locks, same status strings, same
-- atomicity. The application already calls these by unqualified name; the
-- connection role's search_path (repointed to app_private at cutover) resolves
-- them here.
--
-- NOT a standalone auto-migration: this file is applied as PART of the single
-- atomic cutover migration, AFTER `create schema app_private` and AFTER the
-- tables have been moved into it. Running it on its own (before the tables
-- exist in app_private) will fail. It is committed here for independent review.
-- =============================================================================

-- ── download-count: atomic conditional increment (FOR UPDATE) ────────────────
CREATE OR REPLACE FUNCTION app_private.increment_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer, max_downloads integer, expires_at timestamp with time zone, order_id bigint, book_id bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  DECLARE
    v_id       BIGINT;
    v_expires  TIMESTAMPTZ;
    v_count    INTEGER;
    v_max      INTEGER;
    v_order_id BIGINT;
    v_book_id  BIGINT;
  BEGIN
    SELECT dt.id, dt.expires_at,
           COALESCE(dt.download_count, 0),
           COALESCE(dt.max_downloads, 5),
           dt.order_id, dt.book_id
      INTO v_id, v_expires, v_count, v_max, v_order_id, v_book_id
      FROM app_private.download_tokens AS dt
     WHERE dt.token = p_token
     FOR UPDATE;

    IF NOT FOUND THEN
      RETURN QUERY SELECT 'not_found'::TEXT, NULL::INTEGER, NULL::INTEGER,
                          NULL::TIMESTAMPTZ, NULL::BIGINT, NULL::BIGINT;
      RETURN;
    END IF;

    IF v_expires IS NOT NULL AND v_expires < NOW() THEN
      RETURN QUERY SELECT 'expired'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
      RETURN;
    END IF;

    IF v_count >= v_max THEN
      RETURN QUERY SELECT 'maxed'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
      RETURN;
    END IF;

    IF v_order_id IS NULL THEN
      RETURN QUERY SELECT 'no_order'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
      RETURN;
    END IF;

    UPDATE app_private.download_tokens AS dt
       SET download_count = COALESCE(dt.download_count, 0) + 1,
           last_used_at   = NOW()
     WHERE dt.id = v_id
     RETURNING dt.download_count INTO v_count;

    RETURN QUERY SELECT 'ok'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
  END;
  $function$;

-- ── download-count: compensating decrement (clamped at 0) ────────────────────
CREATE OR REPLACE FUNCTION app_private.decrement_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  DECLARE
    v_id    BIGINT;
    v_count INTEGER;
  BEGIN
    SELECT dt.id, COALESCE(dt.download_count, 0)
      INTO v_id, v_count
      FROM app_private.download_tokens AS dt
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

    UPDATE app_private.download_tokens AS dt
       SET download_count = GREATEST(COALESCE(dt.download_count, 0) - 1, 0)
     WHERE dt.id = v_id
     RETURNING dt.download_count INTO v_count;

    RETURN QUERY SELECT 'ok'::TEXT, v_count;
  END;
  $function$;

-- ── exactly-once email-send claim (FOR UPDATE + stale-claim recovery) ─────────
CREATE OR REPLACE FUNCTION app_private.claim_download_email_send(p_token text, p_worker_id text, p_stale_timeout_seconds integer DEFAULT 600)
 RETURNS TABLE(status text, token_id bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_id           BIGINT;
  v_sent_at      TIMESTAMPTZ;
  v_claim_at     TIMESTAMPTZ;
  v_stale_before TIMESTAMPTZ;
BEGIN
  v_stale_before := NOW() - (p_stale_timeout_seconds || ' seconds')::INTERVAL;

  SELECT id, email_sent_at, email_send_claimed_at
    INTO v_id, v_sent_at, v_claim_at
    FROM app_private.download_tokens
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
  UPDATE app_private.download_tokens
     SET email_send_claimed_at = NOW(),
         email_send_claimed_by = p_worker_id
   WHERE id = v_id;

  RETURN QUERY SELECT 'ok'::TEXT, v_id;
END;
$function$;

-- ── release the email-send claim (only the original claimant) ────────────────
CREATE OR REPLACE FUNCTION app_private.release_download_email_claim(p_token text, p_worker_id text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  UPDATE app_private.download_tokens
     SET email_send_claimed_at = NULL,
         email_send_claimed_by = NULL
   WHERE token = p_token
     -- Only the original claimant can release. A stale-claim stealer would
     -- have a different worker_id and shouldn't clobber the new claim.
     AND email_send_claimed_by = p_worker_id
     AND email_sent_at IS NULL;
$function$;

-- ── analytics: per-event counts since a timestamp ────────────────────────────
CREATE OR REPLACE FUNCTION app_private.marketing_event_counts_since(p_since timestamp with time zone)
 RETURNS TABLE(event_name text, n bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT event_name, COUNT(*)::BIGINT AS n
    FROM app_private.marketing_events
   WHERE created_at >= p_since
   GROUP BY event_name
   ORDER BY n DESC;
$function$;

-- ── analytics: per-campaign revenue summary (exact numeric) ──────────────────
CREATE OR REPLACE FUNCTION app_private.marketing_campaign_summary_since(p_since timestamp with time zone, p_limit integer DEFAULT 10)
 RETURNS TABLE(campaign text, events bigint, checkouts bigint, purchases bigint, revenue numeric)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT
    utm_campaign AS campaign,
    COUNT(*)::BIGINT                                                  AS events,
    COUNT(*) FILTER (WHERE event_name = 'checkout_started')::BIGINT   AS checkouts,
    COUNT(*) FILTER (WHERE event_name = 'purchase_completed')::BIGINT AS purchases,
    COALESCE(
      SUM(
        CASE
          WHEN event_name = 'purchase_completed'
            AND (properties ->> 'amount') ~ '^[0-9]+(\.[0-9]+)?$'
          THEN ((properties ->> 'amount')::NUMERIC)
          ELSE 0
        END
      ),
      0
    )::NUMERIC AS revenue
  FROM app_private.marketing_events
  WHERE created_at >= p_since
    AND utm_campaign IS NOT NULL
  GROUP BY utm_campaign
  ORDER BY events DESC
  LIMIT GREATEST(COALESCE(p_limit, 10), 1);
$function$;
