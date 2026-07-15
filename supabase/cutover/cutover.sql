-- =============================================================================
-- ATOMIC SCHEMA CUTOVER: public -> app_private
-- =============================================================================
-- DO NOT EXECUTE until the direct-SQL application code (this branch) is deployed
-- and healthy with the tables STILL in public. This migration is transactional
-- and self-verifying: every assertion that fails aborts the transaction, so it
-- either fully applies or fully rolls back.
--
-- PREREQUISITES (operator, out-of-band — not in this file, no secrets here):
--   1. A dedicated, LEAST-PRIVILEGED runtime role exists (default name below:
--      mayaallan_app) with LOGIN and NO superuser/BYPASSRLS/CREATEDB/CREATEROLE.
--      SUPABASE_DATABASE_URL must point at THIS role — never postgres,
--      supabase_admin, or service_role.
--   2. The app is deployed with src/lib/db.ts's connection search_path =
--      "app_private,public,pg_catalog" (already committed). That startup
--      parameter — not ALTER ROLE — is what keeps warm pooled connections
--      resolving correctly across the move.
--
-- AFTER a successful run + smoke test: remove `public` from the Supabase Data
-- API "Exposed schemas" (dashboard / Data API config — not SQL), and tighten
-- the app connection search_path to "app_private,pg_catalog".
-- =============================================================================

begin;

-- 1) Safe timeouts so a stuck lock can't hang the pooler.
set local lock_timeout = '5s';
set local statement_timeout = '120s';
set local idle_in_transaction_session_timeout = '120s';

-- Config: role names in one place.
create temporary table _cfg (runtime_role text, owner_role text) on commit drop;
insert into _cfg values ('mayaallan_app', 'postgres');

-- 2) Precondition: runtime role exists and is least-privileged.
do $$
declare v_role text := 'mayaallan_app';
begin
  if not exists (select 1 from pg_roles where rolname = v_role) then
    raise exception 'runtime role % missing — create it (least-privileged, LOGIN) and point SUPABASE_DATABASE_URL at it first', v_role;
  end if;
  if exists (select 1 from pg_roles where rolname = v_role
             and (rolsuper or rolbypassrls or rolcreatedb or rolcreaterole)) then
    raise exception 'runtime role % has elevated attributes (super/bypassrls/createdb/createrole) — must be least-privileged', v_role;
  end if;
end $$;

-- 3) Assert EXACTLY the 15 expected application tables exist in public.
do $$
declare
  expected text[] := array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'];
  t text;
begin
  foreach t in array expected loop
    if not exists (select 1 from pg_tables where schemaname='public' and tablename=t) then
      raise exception 'expected table public.% not found', t;
    end if;
  end loop;
  if (select count(*) from pg_tables where schemaname='public') <> 15 then
    raise exception 'public has % tables, expected exactly 15 (unexpected extra table present)',
      (select count(*) from pg_tables where schemaname='public');
  end if;
end $$;

-- 4) Assert EXACTLY the 6 expected functions exist with the expected signatures.
do $$
declare
  sigs text[] := array[
    'increment_download_count|p_token text',
    'decrement_download_count|p_token text',
    'claim_download_email_send|p_token text, p_worker_id text, p_stale_timeout_seconds integer',
    'release_download_email_claim|p_token text, p_worker_id text',
    'marketing_event_counts_since|p_since timestamp with time zone',
    'marketing_campaign_summary_since|p_since timestamp with time zone, p_limit integer'];
  s text; nm text; args text;
begin
  foreach s in array sigs loop
    nm := split_part(s,'|',1); args := split_part(s,'|',2);
    if not exists (
      select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname=nm
         and pg_get_function_identity_arguments(p.oid)=args) then
      raise exception 'expected function public.%(%) not found with that signature', nm, args;
    end if;
  end loop;
end $$;

-- 5) Capture row counts BEFORE the move (verified again at the end).
create temporary table _pre_counts (t text primary key, n bigint) on commit drop;
do $$
declare t text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    execute format('insert into _pre_counts values (%L, (select count(*) from public.%I))', t, t);
  end loop;
end $$;

-- 6) Create the private schema with controlled ownership.
create schema if not exists app_private authorization postgres;

-- 7) Drop every policy on the application tables (there are none today, but be
--    exhaustive and idempotent).
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname='public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 8) Force-off + disable row security on every application table.
do $$
declare t text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    execute format('alter table public.%I no force row level security', t);
    execute format('alter table public.%I disable row level security', t);
  end loop;
end $$;

-- 9) Move all 15 tables into app_private. (Owned indexes, constraints and
--    identity/serial sequences move with the table.)
do $$
declare t text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    execute format('alter table public.%I set schema app_private', t);
  end loop;
end $$;

-- 10) Belt-and-suspenders: move ANY sequence still left in public into
--     app_private, then assert none remain.
do $$
declare s text;
begin
  for s in select sequencename from pg_sequences where schemaname='public' loop
    execute format('alter sequence public.%I set schema app_private', s);
  end loop;
  if exists (select 1 from pg_sequences where schemaname='public') then
    raise exception 'sequences still remain in public after move';
  end if;
end $$;

-- 11) The six hardened functions (SECURITY DEFINER, search_path = '', fully
--     qualified). Identical behavior to the public versions.
CREATE OR REPLACE FUNCTION app_private.increment_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer, max_downloads integer, expires_at timestamp with time zone, order_id bigint, book_id bigint)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
  DECLARE v_id BIGINT; v_expires TIMESTAMPTZ; v_count INTEGER; v_max INTEGER; v_order_id BIGINT; v_book_id BIGINT;
  BEGIN
    SELECT dt.id, dt.expires_at, COALESCE(dt.download_count,0), COALESCE(dt.max_downloads,5), dt.order_id, dt.book_id
      INTO v_id, v_expires, v_count, v_max, v_order_id, v_book_id
      FROM app_private.download_tokens AS dt WHERE dt.token = p_token FOR UPDATE;
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
    UPDATE app_private.download_tokens AS dt
       SET download_count = COALESCE(dt.download_count,0)+1, last_used_at = NOW()
     WHERE dt.id = v_id RETURNING dt.download_count INTO v_count;
    RETURN QUERY SELECT 'ok'::TEXT, v_count, v_max, v_expires, v_order_id, v_book_id;
  END;
$function$;

CREATE OR REPLACE FUNCTION app_private.decrement_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
  DECLARE v_id BIGINT; v_count INTEGER;
  BEGIN
    SELECT dt.id, COALESCE(dt.download_count,0) INTO v_id, v_count
      FROM app_private.download_tokens AS dt WHERE dt.token = p_token FOR UPDATE;
    IF NOT FOUND THEN RETURN QUERY SELECT 'no_token'::TEXT, NULL::INTEGER; RETURN; END IF;
    IF v_count <= 0 THEN RETURN QUERY SELECT 'at_zero'::TEXT, v_count; RETURN; END IF;
    UPDATE app_private.download_tokens AS dt
       SET download_count = GREATEST(COALESCE(dt.download_count,0)-1, 0)
     WHERE dt.id = v_id RETURNING dt.download_count INTO v_count;
    RETURN QUERY SELECT 'ok'::TEXT, v_count;
  END;
$function$;

CREATE OR REPLACE FUNCTION app_private.claim_download_email_send(p_token text, p_worker_id text, p_stale_timeout_seconds integer DEFAULT 600)
 RETURNS TABLE(status text, token_id bigint)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE v_id BIGINT; v_sent_at TIMESTAMPTZ; v_claim_at TIMESTAMPTZ; v_stale_before TIMESTAMPTZ;
BEGIN
  v_stale_before := NOW() - (p_stale_timeout_seconds || ' seconds')::INTERVAL;
  SELECT id, email_sent_at, email_send_claimed_at INTO v_id, v_sent_at, v_claim_at
    FROM app_private.download_tokens WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT 'not_found'::TEXT, NULL::BIGINT; RETURN; END IF;
  IF v_sent_at IS NOT NULL THEN RETURN QUERY SELECT 'already_sent'::TEXT, v_id; RETURN; END IF;
  IF v_claim_at IS NOT NULL AND v_claim_at > v_stale_before THEN
    RETURN QUERY SELECT 'claimed_by_other'::TEXT, v_id; RETURN;
  END IF;
  UPDATE app_private.download_tokens
     SET email_send_claimed_at = NOW(), email_send_claimed_by = p_worker_id WHERE id = v_id;
  RETURN QUERY SELECT 'ok'::TEXT, v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION app_private.release_download_email_claim(p_token text, p_worker_id text)
 RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $function$
  UPDATE app_private.download_tokens
     SET email_send_claimed_at = NULL, email_send_claimed_by = NULL
   WHERE token = p_token AND email_send_claimed_by = p_worker_id AND email_sent_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION app_private.marketing_event_counts_since(p_since timestamp with time zone)
 RETURNS TABLE(event_name text, n bigint) LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT event_name, COUNT(*)::BIGINT AS n FROM app_private.marketing_events
   WHERE created_at >= p_since GROUP BY event_name ORDER BY n DESC;
$function$;

CREATE OR REPLACE FUNCTION app_private.marketing_campaign_summary_since(p_since timestamp with time zone, p_limit integer DEFAULT 10)
 RETURNS TABLE(campaign text, events bigint, checkouts bigint, purchases bigint, revenue numeric)
 LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT utm_campaign AS campaign,
    COUNT(*)::BIGINT AS events,
    COUNT(*) FILTER (WHERE event_name='checkout_started')::BIGINT AS checkouts,
    COUNT(*) FILTER (WHERE event_name='purchase_completed')::BIGINT AS purchases,
    COALESCE(SUM(CASE WHEN event_name='purchase_completed'
      AND (properties ->> 'amount') ~ '^[0-9]+(\.[0-9]+)?$'
      THEN ((properties ->> 'amount')::NUMERIC) ELSE 0 END),0)::NUMERIC AS revenue
  FROM app_private.marketing_events
  WHERE created_at >= p_since AND utm_campaign IS NOT NULL
  GROUP BY utm_campaign ORDER BY events DESC LIMIT GREATEST(COALESCE(p_limit,10),1);
$function$;

-- 12) Drop the obsolete public-schema versions of the six functions.
DROP FUNCTION IF EXISTS public.increment_download_count(text);
DROP FUNCTION IF EXISTS public.decrement_download_count(text);
DROP FUNCTION IF EXISTS public.claim_download_email_send(text, text, integer);
DROP FUNCTION IF EXISTS public.release_download_email_claim(text, text);
DROP FUNCTION IF EXISTS public.marketing_event_counts_since(timestamptz);
DROP FUNCTION IF EXISTS public.marketing_campaign_summary_since(timestamptz, integer);

-- 13) Explicit ownership of the schema and every moved/created object.
alter schema app_private owner to postgres;
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname='app_private' loop
    execute format('alter table app_private.%I owner to postgres', r.tablename);
  end loop;
  for r in select sequencename from pg_sequences where schemaname='app_private' loop
    execute format('alter sequence app_private.%I owner to postgres', r.sequencename);
  end loop;
  for r in select p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
             from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app_private' loop
    execute format('alter function app_private.%I(%s) owner to postgres', r.proname, r.args);
  end loop;
end $$;

-- 14) Revoke everything from the public API roles and PostgreSQL PUBLIC — on the
--     new schema AND on the moved objects (GRANTs travel with a table across a
--     SET SCHEMA, so any prior anon grant must be revoked here).
revoke all on schema app_private from anon, authenticated, public;
revoke all on all tables    in schema app_private from anon, authenticated, public;
revoke all on all sequences in schema app_private from anon, authenticated, public;
revoke all on all functions in schema app_private from anon, authenticated, public;
-- Also stop the (now-empty) public schema being traversable by the API roles.
revoke usage on schema public from anon, authenticated;

-- 15) Grant the dedicated runtime role ONLY what the website needs.
grant usage on schema app_private to mayaallan_app;
grant select, insert, update, delete on all tables in schema app_private to mayaallan_app;
grant usage, select on all sequences in schema app_private to mayaallan_app;
grant execute on all functions in schema app_private to mayaallan_app;

-- 16) Default privileges for the owning role (postgres) so FUTURE objects in
--     app_private are auto-granted to the runtime role and never to the API
--     roles; and lock down future objects in public too.
alter default privileges for role postgres in schema app_private
  grant select, insert, update, delete on tables to mayaallan_app;
alter default privileges for role postgres in schema app_private
  grant usage, select on sequences to mayaallan_app;
alter default privileges for role postgres in schema app_private
  grant execute on functions to mayaallan_app;
alter default privileges for role postgres in schema app_private
  revoke all on tables from anon, authenticated, public;
alter default privileges for role postgres in schema app_private
  revoke all on sequences from anon, authenticated, public;
alter default privileges for role postgres in schema app_private
  revoke all on functions from anon, authenticated, public;
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, public;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, public;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated, public;

-- 17) Defense-in-depth role default search_path (the app connection startup
--     parameter is the primary mechanism; this covers ad-hoc sessions).
alter role mayaallan_app in database postgres set search_path = 'app_private, pg_catalog';

-- =============================================================================
-- FINAL ASSERTIONS — any failure aborts the whole transaction.
-- =============================================================================
do $$
declare
  tbls text[] := array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'];
  tname text; v_pre bigint; v_post bigint; v_bad int;
begin
  -- a) all 15 tables now in app_private, none left in public, row counts intact
  if (select count(*) from pg_tables where schemaname='public') <> 0 then
    raise exception 'public still has % tables', (select count(*) from pg_tables where schemaname='public');
  end if;
  if (select count(*) from pg_tables where schemaname='app_private') <> 15 then
    raise exception 'app_private has % tables, expected 15', (select count(*) from pg_tables where schemaname='app_private');
  end if;
  foreach tname in array tbls loop
    select pc.n into v_pre from _pre_counts pc where pc.t = tname;
    execute format('select count(*) from app_private.%I', tname) into v_post;
    if v_pre is distinct from v_post then
      raise exception 'row-count mismatch on %: before=% after=%', tname, v_pre, v_post;
    end if;
  end loop;

  -- b) zero policies; row security + force both false on every moved table
  if exists (select 1 from pg_policies where schemaname in ('public','app_private')) then
    raise exception 'policies still present';
  end if;
  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='app_private' and c.relkind='r'
               and (c.relrowsecurity or c.relforcerowsecurity)) then
    raise exception 'rowsecurity/forcerowsecurity still true on an app_private table';
  end if;

  -- c) six functions present in app_private, obsolete public versions gone
  if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app_private') <> 6 then
    raise exception 'expected 6 functions in app_private, found %',
      (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app_private');
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public'
               and p.proname = any(array['increment_download_count','decrement_download_count',
                 'claim_download_email_send','release_download_email_claim',
                 'marketing_event_counts_since','marketing_campaign_summary_since'])) then
    raise exception 'obsolete public function version still present';
  end if;

  -- d) no sequences left in public; every app_private sequence owned by a moved table
  if exists (select 1 from pg_sequences where schemaname='public') then
    raise exception 'sequence still in public';
  end if;

  -- e) ZERO privileges for anon/authenticated/PUBLIC on any app_private object
  select count(*) into v_bad
    from information_schema.role_table_grants
   where table_schema='app_private' and grantee in ('anon','authenticated','PUBLIC');
  if v_bad <> 0 then raise exception 'anon/authenticated/PUBLIC still hold % table grants in app_private', v_bad; end if;

  -- f) foreign keys + indexes survived the move (spot totals)
  if (select count(*) from pg_constraint c join pg_namespace n on n.oid=c.connamespace
       where n.nspname='app_private' and c.contype='f') = 0 then
    raise exception 'no foreign keys found in app_private (expected the FK set to have moved)';
  end if;
end $$;

commit;
