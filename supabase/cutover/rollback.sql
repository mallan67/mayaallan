-- =============================================================================
-- ROLLBACK: app_private -> public  (reverses cutover.sql)
-- =============================================================================
-- Moves every object back to public, restores the original public function
-- definitions, restores the runtime role's grants + search_path, and drops the
-- (now empty) app_private schema. Transactional and self-verifying.
--
-- Note: this restores APPLICATION FUNCTION, not Data-API exposure. The anon /
-- authenticated roles remain revoked (the app uses the direct-SQL runtime role,
-- not PostgREST), so a rollback does NOT re-open the public schema to the Data
-- API. The app keeps working because src/lib/db.ts's connection search_path
-- ("app_private,public,pg_catalog") resolves via public once app_private is gone.
--
-- No passwords or connection strings appear in this file.
-- =============================================================================

begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
set local idle_in_transaction_session_timeout = '120s';

-- Precondition: the cutover has been applied (15 tables live in app_private).
do $$
begin
  if (select count(*) from pg_tables where schemaname='app_private') <> 15 then
    raise exception 'app_private does not hold 15 tables — nothing to roll back (found %)',
      (select count(*) from pg_tables where schemaname='app_private');
  end if;
end $$;

-- 1) Move all tables back to public.
do $$
declare t text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    execute format('alter table app_private.%I set schema public', t);
  end loop;
end $$;

-- 2) Move any remaining sequences back to public.
do $$
declare s text;
begin
  for s in select sequencename from pg_sequences where schemaname='app_private' loop
    execute format('alter sequence app_private.%I set schema public', s);
  end loop;
end $$;

-- 3) Drop the hardened app_private functions.
DROP FUNCTION IF EXISTS app_private.increment_download_count(text);
DROP FUNCTION IF EXISTS app_private.decrement_download_count(text);
DROP FUNCTION IF EXISTS app_private.claim_download_email_send(text, text, integer);
DROP FUNCTION IF EXISTS app_private.release_download_email_claim(text, text);
DROP FUNCTION IF EXISTS app_private.marketing_event_counts_since(timestamptz);
DROP FUNCTION IF EXISTS app_private.marketing_campaign_summary_since(timestamptz, integer);

-- 4) Restore the ORIGINAL public function definitions (search_path 'public').
CREATE OR REPLACE FUNCTION public.increment_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer, max_downloads integer, expires_at timestamp with time zone, order_id bigint, book_id bigint)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  DECLARE v_id BIGINT; v_expires TIMESTAMPTZ; v_count INTEGER; v_max INTEGER; v_order_id BIGINT; v_book_id BIGINT;
  BEGIN
    SELECT dt.id, dt.expires_at, COALESCE(dt.download_count,0), COALESCE(dt.max_downloads,5), dt.order_id, dt.book_id
      INTO v_id, v_expires, v_count, v_max, v_order_id, v_book_id
      FROM public.download_tokens AS dt WHERE dt.token = p_token FOR UPDATE;
    IF NOT FOUND THEN
      RETURN QUERY SELECT 'not_found'::TEXT, NULL::INTEGER, NULL::INTEGER, NULL::TIMESTAMPTZ, NULL::BIGINT, NULL::BIGINT; RETURN;
    END IF;
    IF v_expires IS NOT NULL AND v_expires < NOW() THEN
      RETURN QUERY SELECT 'expired'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id; RETURN;
    END IF;
    IF v_count >= v_max THEN
      RETURN QUERY SELECT 'maxed'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id; RETURN;
    END IF;
    IF v_order_id IS NULL THEN
      RETURN QUERY SELECT 'no_order'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id; RETURN;
    END IF;
    UPDATE public.download_tokens AS dt
       SET download_count = COALESCE(dt.download_count,0)+1, last_used_at = NOW()
     WHERE dt.id = v_id RETURNING dt.download_count INTO v_count;
    RETURN QUERY SELECT 'ok'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
  END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  DECLARE v_id BIGINT; v_count INTEGER;
  BEGIN
    SELECT dt.id, COALESCE(dt.download_count,0) INTO v_id, v_count
      FROM public.download_tokens AS dt WHERE dt.token = p_token FOR UPDATE;
    IF NOT FOUND THEN RETURN QUERY SELECT 'no_token'::TEXT, NULL::INTEGER; RETURN; END IF;
    IF v_count <= 0 THEN RETURN QUERY SELECT 'at_zero'::TEXT, v_count; RETURN; END IF;
    UPDATE public.download_tokens AS dt
       SET download_count = GREATEST(COALESCE(dt.download_count,0)-1, 0)
     WHERE dt.id = v_id RETURNING dt.download_count INTO v_count;
    RETURN QUERY SELECT 'ok'::TEXT, v_count;
  END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_download_email_send(p_token text, p_worker_id text, p_stale_timeout_seconds integer DEFAULT 600)
 RETURNS TABLE(status text, token_id bigint)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_id BIGINT; v_sent_at TIMESTAMPTZ; v_claim_at TIMESTAMPTZ; v_stale_before TIMESTAMPTZ;
BEGIN
  v_stale_before := NOW() - (p_stale_timeout_seconds || ' seconds')::INTERVAL;
  SELECT id, email_sent_at, email_send_claimed_at INTO v_id, v_sent_at, v_claim_at
    FROM public.download_tokens WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT 'not_found'::TEXT, NULL::BIGINT; RETURN; END IF;
  IF v_sent_at IS NOT NULL THEN RETURN QUERY SELECT 'already_sent'::TEXT, v_id; RETURN; END IF;
  IF v_claim_at IS NOT NULL AND v_claim_at > v_stale_before THEN
    RETURN QUERY SELECT 'claimed_by_other'::TEXT, v_id; RETURN;
  END IF;
  UPDATE public.download_tokens
     SET email_send_claimed_at = NOW(), email_send_claimed_by = p_worker_id WHERE id = v_id;
  RETURN QUERY SELECT 'ok'::TEXT, v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.release_download_email_claim(p_token text, p_worker_id text)
 RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  UPDATE public.download_tokens
     SET email_send_claimed_at = NULL, email_send_claimed_by = NULL
   WHERE token = p_token AND email_send_claimed_by = p_worker_id AND email_sent_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION public.marketing_event_counts_since(p_since timestamp with time zone)
 RETURNS TABLE(event_name text, n bigint) LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT event_name, COUNT(*)::BIGINT AS n FROM public.marketing_events
   WHERE created_at >= p_since GROUP BY event_name ORDER BY n DESC;
$function$;

CREATE OR REPLACE FUNCTION public.marketing_campaign_summary_since(p_since timestamp with time zone, p_limit integer DEFAULT 10)
 RETURNS TABLE(campaign text, events bigint, checkouts bigint, purchases bigint, revenue numeric)
 LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT utm_campaign AS campaign,
    COUNT(*)::BIGINT AS events,
    COUNT(*) FILTER (WHERE event_name='checkout_started')::BIGINT AS checkouts,
    COUNT(*) FILTER (WHERE event_name='purchase_completed')::BIGINT AS purchases,
    COALESCE(SUM(CASE WHEN event_name='purchase_completed'
      AND (properties ->> 'amount') ~ '^[0-9]+(\.[0-9]+)?$'
      THEN ((properties ->> 'amount')::NUMERIC) ELSE 0 END),0)::NUMERIC AS revenue
  FROM public.marketing_events
  WHERE created_at >= p_since AND utm_campaign IS NOT NULL
  GROUP BY utm_campaign ORDER BY events DESC LIMIT GREATEST(COALESCE(p_limit,10),1);
$function$;

-- 5) Restore ownership of the moved objects to postgres.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname='public' loop
    execute format('alter table public.%I owner to postgres', r.tablename);
  end loop;
  for r in select sequencename from pg_sequences where schemaname='public' loop
    execute format('alter sequence public.%I owner to postgres', r.sequencename);
  end loop;
end $$;

-- 6) Re-grant the runtime role on public so the app keeps working (it still
--    connects as the runtime role and issues direct SQL against public now).
grant usage on schema public to mayaallan_app;
grant select, insert, update, delete on all tables in schema public to mayaallan_app;
grant usage, select on all sequences in schema public to mayaallan_app;
grant execute on all functions in schema public to mayaallan_app;

-- 7) Restore the runtime role's search_path default (drop the app_private pin).
alter role mayaallan_app in database postgres reset search_path;

-- 8) Drop the now-empty private schema.
drop schema if exists app_private restrict;

-- Final assertions.
do $$
begin
  if (select count(*) from pg_tables where schemaname='app_private') <> 0
     or exists (select 1 from information_schema.schemata where schema_name='app_private') then
    raise exception 'app_private not fully removed';
  end if;
  if (select count(*) from pg_tables where schemaname='public') <> 15 then
    raise exception 'public does not hold 15 tables after rollback (found %)',
      (select count(*) from pg_tables where schemaname='public');
  end if;
  if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname = any(array[
         'increment_download_count','decrement_download_count','claim_download_email_send',
         'release_download_email_claim','marketing_event_counts_since','marketing_campaign_summary_since'])) <> 6 then
    raise exception 'expected 6 restored functions in public';
  end if;
end $$;

commit;
