-- =============================================================================
-- ROLLBACK: app_private -> public  (reverses cutover.sql)
-- =============================================================================
-- Aborts the migration and returns the database to the pre-cutover STATE:
-- objects back in public, original grants/default-privileges restored, app_private
-- dropped. One self-verifying transaction.
--
-- Two deliberate differences from a naive "restore":
--   1. The six functions are recreated HARDENED (SECURITY INVOKER, search_path='',
--      fully-qualified public.*), NOT the original SECURITY DEFINER + search_path
--      'public' — there is never a reason to reintroduce that search-path risk.
--   2. Re-granting anon/authenticated on public restores DB grants only. It does
--      NOT re-expose the Data API: `public` is added back to the Supabase
--      "Exposed schemas" (or not) separately in the dashboard by the operator.
--
-- Runtime role name: mayaallan_app (find-and-replace if different). No secrets.
-- =============================================================================

begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
set local idle_in_transaction_session_timeout = '120s';

-- Precondition: the cutover is applied (15 tables live in app_private).
do $$
begin
  if (select count(*) from pg_tables where schemaname='app_private') <> 15 then
    raise exception 'app_private does not hold 15 tables — nothing to roll back (found %)',
      (select count(*) from pg_tables where schemaname='app_private'); end if;
end $$;

-- Capture app_private row counts to verify after moving back.
create temporary table _rb_counts (t text primary key, n bigint) on commit drop;
do $$
declare t text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    execute format('insert into _rb_counts values (%L, (select count(*) from app_private.%I))', t, t);
  end loop;
end $$;

-- 1) Move tables + sequences back to public.
do $$
declare t text; s text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    execute format('alter table app_private.%I set schema public', t);
  end loop;
  for s in select sequencename from pg_sequences where schemaname='app_private' loop
    execute format('alter sequence app_private.%I set schema public', s);
  end loop;
end $$;

-- 2) Drop the app_private functions.
DROP FUNCTION IF EXISTS app_private.increment_download_count(text);
DROP FUNCTION IF EXISTS app_private.decrement_download_count(text);
DROP FUNCTION IF EXISTS app_private.claim_download_email_send(text, text, integer);
DROP FUNCTION IF EXISTS app_private.release_download_email_claim(text, text);
DROP FUNCTION IF EXISTS app_private.marketing_event_counts_since(timestamptz);
DROP FUNCTION IF EXISTS app_private.marketing_campaign_summary_since(timestamptz, integer);

-- 3) Recreate the six functions in public, HARDENED (INVOKER, search_path='').
CREATE OR REPLACE FUNCTION public.increment_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer, max_downloads integer, expires_at timestamp with time zone, order_id bigint, book_id bigint)
 LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
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
 LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
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
 LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
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
 RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $function$
  UPDATE public.download_tokens
     SET email_send_claimed_at = NULL, email_send_claimed_by = NULL
   WHERE token = p_token AND email_send_claimed_by = p_worker_id AND email_sent_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION public.marketing_event_counts_since(p_since timestamp with time zone)
 RETURNS TABLE(event_name text, n bigint) LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $function$
  SELECT event_name, COUNT(*)::BIGINT AS n FROM public.marketing_events
   WHERE created_at >= p_since GROUP BY event_name ORDER BY n DESC;
$function$;

CREATE OR REPLACE FUNCTION public.marketing_campaign_summary_since(p_since timestamp with time zone, p_limit integer DEFAULT 10)
 RETURNS TABLE(campaign text, events bigint, checkouts bigint, purchases bigint, revenue numeric)
 LANGUAGE sql SECURITY INVOKER SET search_path = ''
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

-- Functions grant EXECUTE to PUBLIC by default on creation — revoke, so we can
-- grant only the runtime role (and restore the anon default separately below).
revoke all on function public.increment_download_count(text),
  public.decrement_download_count(text),
  public.claim_download_email_send(text, text, integer),
  public.release_download_email_claim(text, text),
  public.marketing_event_counts_since(timestamptz),
  public.marketing_campaign_summary_since(timestamptz, integer)
  from public, anon, authenticated;

-- 4) Restore ownership of moved objects to postgres.
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

-- 5) Re-grant the runtime role ONLY what it needs on public (named objects).
grant usage on schema public to mayaallan_app;
grant select, insert, update, delete on
  public.admin_auth, public.book_retailer_links, public.books, public.contact_submissions,
  public.download_tokens, public.email_subscribers, public.events, public.marketing_events,
  public.marketing_visitors, public.media_items, public.navigation_items, public.orders,
  public.pending_paypal_orders, public.retailers, public.site_settings
  to mayaallan_app;
grant usage, select on all sequences in schema public to mayaallan_app;
-- EXECUTE on ONLY the six application functions (never ALL FUNCTIONS).
grant execute on function public.increment_download_count(text),
  public.decrement_download_count(text),
  public.claim_download_email_send(text, text, integer),
  public.release_download_email_claim(text, text),
  public.marketing_event_counts_since(timestamptz),
  public.marketing_campaign_summary_since(timestamptz, integer)
  to mayaallan_app;

-- 6) Reverse the cutover's grant/default-privilege changes on public (restore the
--    pre-cutover Supabase state). Data-API exposure remains a separate dashboard
--    toggle, so this does not by itself re-open PostgREST.
grant usage on schema public to anon, authenticated;
grant usage, create on schema public to public;
alter default privileges for role postgres in schema public grant all on tables to anon, authenticated;
alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated;
alter default privileges for role postgres in schema public grant execute on functions to public;

-- 7) Restore the runtime role's search_path default (drop the app_private pin).
alter role mayaallan_app in database postgres reset search_path;

-- 8) Drop the now-empty private schema (its default-privilege ACLs vanish with it).
drop schema if exists app_private restrict;

-- =============================================================================
-- FINAL ASSERTIONS.
-- =============================================================================
do $$
declare
  fns text[] := array['increment_download_count','decrement_download_count',
    'claim_download_email_send','release_download_email_claim',
    'marketing_event_counts_since','marketing_campaign_summary_since'];
  tbls text[] := array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'];
  tname text; fn text; v_pre bigint; v_post bigint;
begin
  if exists (select 1 from information_schema.schemata where schema_name='app_private') then
    raise exception 'app_private not fully removed'; end if;
  if (select count(*) from pg_tables where schemaname='public') <> 15 then
    raise exception 'public does not hold 15 tables (found %)', (select count(*) from pg_tables where schemaname='public'); end if;
  -- row counts intact vs the app_private snapshot
  foreach tname in array tbls loop
    select rc.n into v_pre from _rb_counts rc where rc.t = tname;
    execute format('select count(*) from public.%I', tname) into v_post;
    if v_pre is distinct from v_post then raise exception 'rollback row-count mismatch on %: %/%', tname, v_pre, v_post; end if;
  end loop;
  -- six functions restored, hardened (INVOKER, search_path='')
  if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname = any(fns)) <> 6 then
    raise exception 'expected 6 restored functions in public'; end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname = any(fns)
               and (p.prosecdef or coalesce(array_to_string(p.proconfig,','),'') <> 'search_path=""')) then
    raise exception 'a restored function is not hardened (INVOKER + search_path='''')'; end if;
  -- owners, FKs, indexes, sequences intact in public
  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='public' and c.relkind='r' and c.relowner <> 'postgres'::regrole) then
    raise exception 'a public table is not owned by postgres'; end if;
  if (select count(*) from pg_constraint c join pg_class t on t.oid=c.conrelid
       where t.relnamespace='public'::regnamespace and c.contype='f') <> 7 then
    raise exception 'expected 7 foreign keys back in public'; end if;
  if (select count(*) from pg_index i join pg_class t on t.oid=i.indrelid
       where t.relnamespace='public'::regnamespace) <> 40 then
    raise exception 'expected 40 indexes back in public'; end if;
  if (select count(*) from pg_class s where s.relkind='S' and s.relnamespace='public'::regnamespace) <> 13 then
    raise exception 'expected 13 sequences back in public'; end if;
  -- runtime role still functional on public
  foreach tname in array tbls loop
    if not has_table_privilege('mayaallan_app','public.'||tname,'SELECT') then
      raise exception 'runtime role lost SELECT on public.%', tname; end if;
  end loop;
  foreach fn in array fns loop
    if not has_function_privilege('mayaallan_app',
         (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=fn),'EXECUTE') then
      raise exception 'runtime role lost EXECUTE on public.%', fn; end if;
  end loop;
  raise notice 'ROLLBACK FINAL ASSERTIONS: ALL PASSED';
end $$;

commit;
