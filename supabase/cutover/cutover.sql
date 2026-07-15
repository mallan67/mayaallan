-- =============================================================================
-- ATOMIC SCHEMA CUTOVER: public -> app_private
-- =============================================================================
-- DO NOT EXECUTE until the direct-SQL application code (this branch) is deployed
-- and healthy with the tables STILL in public. One self-verifying transaction:
-- it either fully applies or fully rolls back (any failed assertion aborts it).
--
-- RUNTIME ROLE: this script uses the role name `mayaallan_app` throughout. If
-- you created the dedicated least-privileged runtime role under a different
-- name, find-and-replace `mayaallan_app` before running. That role must:
--   - exist, have LOGIN, and be least-privileged (no SUPERUSER / BYPASSRLS /
--     CREATEDB / CREATEROLE / REPLICATION), and not inherit any privileged role;
--   - be the role SUPABASE_DATABASE_URL points at (never postgres / supabase_admin
--     / service_role / authenticator).
--
-- The app must already be deployed with src/lib/db.ts's connection search_path =
-- "app_private,public,pg_catalog" — that per-connection startup parameter (not
-- ALTER ROLE) keeps warm pooled connections resolving correctly across the move.
--
-- Functions are SECURITY INVOKER (the runtime role has direct table CRUD, so no
-- definer privilege is needed) with SET search_path = '' + fully-qualified refs.
--
-- After a successful run + smoke test: remove `public` from the Supabase Data
-- API "Exposed schemas" (dashboard — not SQL) and tighten the app connection
-- search_path to "app_private,pg_catalog".
-- =============================================================================

begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
set local idle_in_transaction_session_timeout = '120s';

-- 1) PRECONDITION: runtime role exists, LOGIN, least-privileged, no inherited
--    privileged membership, no unexpected database privilege.
do $$
declare v_bad text;
begin
  if not exists (select 1 from pg_roles where rolname='mayaallan_app') then
    raise exception 'runtime role mayaallan_app missing — create it least-privileged and point SUPABASE_DATABASE_URL at it first';
  end if;
  if not (select rolcanlogin from pg_roles where rolname='mayaallan_app') then
    raise exception 'runtime role mayaallan_app must have LOGIN';
  end if;
  if exists (select 1 from pg_roles where rolname='mayaallan_app'
             and (rolsuper or rolbypassrls or rolcreatedb or rolcreaterole or rolreplication)) then
    raise exception 'runtime role mayaallan_app has elevated attributes (super/bypassrls/createdb/createrole/replication)';
  end if;
  -- Transitive membership: every role mayaallan_app is (recursively) a member of.
  select string_agg(rolname, ', ') into v_bad from (
    with recursive m as (
      select am.roleid from pg_auth_members am
        where am.member = (select oid from pg_roles where rolname='mayaallan_app')
      union
      select am.roleid from pg_auth_members am join m on am.member = m.roleid
    )
    select r.rolname from m join pg_roles r on r.oid = m.roleid
     where r.rolname in ('postgres','supabase_admin','service_role','authenticator',
                         'anon','authenticated','rds_superuser','supabase_auth_admin',
                         'supabase_storage_admin','supabase_replication_admin','pg_read_all_data','pg_write_all_data')
        or r.rolsuper or r.rolbypassrls or r.rolcreatedb or r.rolcreaterole or r.rolreplication
  ) bad;
  if v_bad is not null then
    raise exception 'runtime role mayaallan_app inherits privileged role(s): %', v_bad;
  end if;
  if has_database_privilege('mayaallan_app', current_database(), 'CREATE') then
    raise exception 'runtime role mayaallan_app has CREATE on the database — too broad';
  end if;
end $$;

-- 2) Assert EXACTLY the 15 expected application tables in public.
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
    raise exception 'public has % tables, expected exactly 15', (select count(*) from pg_tables where schemaname='public');
  end if;
end $$;

-- 3) Assert EXACTLY the 6 expected functions exist with the expected signatures.
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
      raise exception 'expected function public.%(%) not found', nm, args;
    end if;
  end loop;
  if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname = any(array[
         'increment_download_count','decrement_download_count','claim_download_email_send',
         'release_download_email_claim','marketing_event_counts_since','marketing_campaign_summary_since'])) <> 6 then
    raise exception 'expected exactly 6 matching functions in public';
  end if;
end $$;

-- 4) Capture PRE-move state (row counts, FK names, index names) to compare after.
create temporary table _pre_counts (t text primary key, n bigint) on commit drop;
create temporary table _pre_fk (conname text primary key) on commit drop;
create temporary table _pre_idx (indexname text primary key) on commit drop;
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
insert into _pre_fk
  select c.conname from pg_constraint c join pg_class t on t.oid=c.conrelid
   where t.relnamespace='public'::regnamespace and c.contype='f';
insert into _pre_idx
  select ci.relname from pg_index i
    join pg_class t on t.oid=i.indrelid
    join pg_class ci on ci.oid=i.indexrelid
   where t.relnamespace='public'::regnamespace;
-- Exact application-owned sequences (name, owning table, owning column) via pg_depend.
create temporary table _pre_seq (seqname text primary key, tablename text, colname text) on commit drop;
insert into _pre_seq
  select s.relname, t.relname, a.attname
    from pg_class s
    join pg_depend d on d.objid=s.oid and d.deptype in ('a','i')
      and d.classid='pg_class'::regclass and d.refclassid='pg_class'::regclass
    join pg_class t on t.oid=d.refobjid
    join pg_attribute a on a.attrelid=d.refobjid and a.attnum=d.refobjsubid
   where s.relkind='S' and s.relnamespace='public'::regnamespace
     and t.relname = any(array[
       'admin_auth','book_retailer_links','books','contact_submissions',
       'download_tokens','email_subscribers','events','marketing_events',
       'marketing_visitors','media_items','navigation_items','orders',
       'pending_paypal_orders','retailers','site_settings']);
do $$
begin
  -- Every public sequence must be owned by one of the 15 application tables;
  -- fail on any unexpected standalone/foreign sequence.
  if (select count(*) from _pre_seq) <> (select count(*) from pg_class where relkind='S' and relnamespace='public'::regnamespace) then
    raise exception 'unexpected public sequence not owned by an application table';
  end if;
end $$;

-- 5) REFUSE to reuse a pre-existing app_private unless it is empty and correctly
--    owned. Otherwise create it, owned by postgres.
do $$
begin
  if exists (select 1 from pg_namespace where nspname='app_private') then
    if (select nspowner from pg_namespace where nspname='app_private') <> 'postgres'::regrole then
      raise exception 'app_private already exists but is not owned by postgres — refusing to reuse';
    end if;
    if exists (select 1 from pg_class where relnamespace='app_private'::regnamespace)
       or exists (select 1 from pg_proc where pronamespace='app_private'::regnamespace) then
      raise exception 'app_private already exists and is NOT empty — refusing to reuse';
    end if;
  else
    create schema app_private authorization postgres;
  end if;
end $$;

-- 6) Drop every policy on the application tables (idempotent).
do $$
declare r record;
begin
  for r in select tablename, policyname from pg_policies where schemaname='public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 7) NO FORCE + DISABLE row security on every application table.
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

-- 8) Move all 15 tables + every owned sequence into app_private.
do $$
declare t text; s text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    execute format('alter table public.%I set schema app_private', t);
  end loop;
  -- Move ONLY the captured application-owned sequences (exact set).
  for s in select seqname from _pre_seq loop
    execute format('alter sequence public.%I set schema app_private', s);
  end loop;
end $$;

-- 9) The six hardened functions: SECURITY INVOKER, SET search_path = '',
--    fully-qualified app_private refs. Behavior identical to the originals.
CREATE OR REPLACE FUNCTION app_private.increment_download_count(p_token text)
 RETURNS TABLE(status text, download_count integer, max_downloads integer, expires_at timestamp with time zone, order_id bigint, book_id bigint)
 LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
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
 LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
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
 LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
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
 RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $function$
  UPDATE app_private.download_tokens
     SET email_send_claimed_at = NULL, email_send_claimed_by = NULL
   WHERE token = p_token AND email_send_claimed_by = p_worker_id AND email_sent_at IS NULL;
$function$;

CREATE OR REPLACE FUNCTION app_private.marketing_event_counts_since(p_since timestamp with time zone)
 RETURNS TABLE(event_name text, n bigint) LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $function$
  SELECT event_name, COUNT(*)::BIGINT AS n FROM app_private.marketing_events
   WHERE created_at >= p_since GROUP BY event_name ORDER BY n DESC;
$function$;

CREATE OR REPLACE FUNCTION app_private.marketing_campaign_summary_since(p_since timestamp with time zone, p_limit integer DEFAULT 10)
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
  FROM app_private.marketing_events
  WHERE created_at >= p_since AND utm_campaign IS NOT NULL
  GROUP BY utm_campaign ORDER BY events DESC LIMIT GREATEST(COALESCE(p_limit,10),1);
$function$;

-- 10) Drop the obsolete public-schema versions.
DROP FUNCTION IF EXISTS public.increment_download_count(text);
DROP FUNCTION IF EXISTS public.decrement_download_count(text);
DROP FUNCTION IF EXISTS public.claim_download_email_send(text, text, integer);
DROP FUNCTION IF EXISTS public.release_download_email_claim(text, text);
DROP FUNCTION IF EXISTS public.marketing_event_counts_since(timestamptz);
DROP FUNCTION IF EXISTS public.marketing_campaign_summary_since(timestamptz, integer);

-- 11) Explicit ownership (schema + every moved/created object) = postgres.
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
  for r in select p.proname, pg_get_function_identity_arguments(p.oid) as args
             from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app_private' loop
    execute format('alter function app_private.%I(%s) owner to postgres', r.proname, r.args);
  end loop;
end $$;

-- 12) Revoke from the public API roles and PostgreSQL PUBLIC — new schema AND
--     the moved objects (grants travel with a table across SET SCHEMA), AND the
--     now-empty public schema (fully, including PUBLIC — see correction #1).
-- Revoke from the API roles AND service_role + authenticator (grants travel with
-- a table across SET SCHEMA, so any of these could carry access). The enforced
-- ACL allowlist in the final assertions proves ONLY mayaallan_app remains.
revoke all on schema app_private from anon, authenticated, public, service_role, authenticator;
revoke all on all tables    in schema app_private from anon, authenticated, public, service_role, authenticator;
revoke all on all sequences in schema app_private from anon, authenticated, public, service_role, authenticator;
revoke all on all functions in schema app_private from anon, authenticated, public, service_role, authenticator;
revoke all on schema public from public, anon, authenticated;

-- 13) Grant the dedicated runtime role ONLY what the website needs.
grant usage on schema app_private to mayaallan_app;
grant select, insert, update, delete on all tables in schema app_private to mayaallan_app;
grant usage, select on all sequences in schema app_private to mayaallan_app;
grant execute on all functions in schema app_private to mayaallan_app;

-- 14) Default privileges for the owning role (postgres): future app_private
--     objects auto-granted to the runtime role, never to the API roles; and
--     lock down future public objects.
alter default privileges for role postgres in schema app_private grant select, insert, update, delete on tables to mayaallan_app;
alter default privileges for role postgres in schema app_private grant usage, select on sequences to mayaallan_app;
alter default privileges for role postgres in schema app_private grant execute on functions to mayaallan_app;
alter default privileges for role postgres in schema app_private revoke all on tables from anon, authenticated, public;
alter default privileges for role postgres in schema app_private revoke all on sequences from anon, authenticated, public;
alter default privileges for role postgres in schema app_private revoke all on functions from anon, authenticated, public;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated, public;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated, public;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated, public;

-- 15) Defense-in-depth role default search_path (connection startup param is the
--     primary mechanism; this covers ad-hoc sessions).
alter role mayaallan_app in database postgres set search_path = 'app_private, pg_catalog';

-- =============================================================================
-- FINAL ASSERTIONS — any failure aborts the whole transaction.
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
  sigs text[] := array[
    'increment_download_count|p_token text',
    'decrement_download_count|p_token text',
    'claim_download_email_send|p_token text, p_worker_id text, p_stale_timeout_seconds integer',
    'release_download_email_claim|p_token text, p_worker_id text',
    'marketing_event_counts_since|p_since timestamp with time zone',
    'marketing_campaign_summary_since|p_since timestamp with time zone, p_limit integer'];
  tname text; fn text; s text; nm text; args text; v_pre bigint; v_post bigint; v_oid oid; rec record;
begin
  -- (a) tables moved, none left in public, row counts intact
  if (select count(*) from pg_tables where schemaname='public') <> 0 then
    raise exception 'public still has % tables', (select count(*) from pg_tables where schemaname='public'); end if;
  if (select count(*) from pg_tables where schemaname='app_private') <> 15 then
    raise exception 'app_private has % tables, expected 15', (select count(*) from pg_tables where schemaname='app_private'); end if;
  foreach tname in array tbls loop
    select pc.n into v_pre from _pre_counts pc where pc.t = tname;
    execute format('select count(*) from app_private.%I', tname) into v_post;
    if v_pre is distinct from v_post then raise exception 'row-count mismatch on %: %/%', tname, v_pre, v_post; end if;
  end loop;

  -- (b) exact owners = postgres (schema, tables, sequences)
  if (select nspowner from pg_namespace where nspname='app_private') <> 'postgres'::regrole then
    raise exception 'app_private schema not owned by postgres'; end if;
  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='app_private' and c.relkind in ('r','S') and c.relowner <> 'postgres'::regrole) then
    raise exception 'an app_private table/sequence is not owned by postgres'; end if;

  -- (c) policies gone; rowsecurity + forcerowsecurity false everywhere
  if exists (select 1 from pg_policies where schemaname in ('public','app_private')) then
    raise exception 'policies still present'; end if;
  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='app_private' and c.relkind='r' and (c.relrowsecurity or c.relforcerowsecurity)) then
    raise exception 'rowsecurity/forcerowsecurity still true'; end if;

  -- (d) exactly the 6 functions in app_private, correct signature/owner/mode/path
  if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app_private') <> 6 then
    raise exception 'expected 6 functions in app_private'; end if;
  foreach s in array sigs loop
    nm := split_part(s,'|',1); args := split_part(s,'|',2);
    if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                   where n.nspname='app_private' and p.proname=nm
                     and pg_get_function_identity_arguments(p.oid)=args) then
      raise exception 'app_private function %(%) missing or wrong signature', nm, args; end if;
  end loop;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='app_private'
               and (p.prosecdef  -- must be SECURITY INVOKER
                 or p.proowner <> 'postgres'::regrole
                 or coalesce(array_to_string(p.proconfig,','),'') <> 'search_path=""')) then
    raise exception 'a function has wrong security mode / owner / search_path'; end if;

  -- (e) obsolete public function versions gone
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname = any(fns)) then
    raise exception 'obsolete public function still present'; end if;

  -- (f) sequences: none left in public; exact captured set now in app_private,
  --     each with the SAME owning table + column mapping.
  if exists (select 1 from pg_sequences where schemaname='public') then
    raise exception 'sequence still in public'; end if;
  if (select count(*) from pg_class s where s.relkind='S' and s.relnamespace='app_private'::regnamespace) <> (select count(*) from _pre_seq) then
    raise exception 'sequence count in app_private does not match the captured application set'; end if;
  if exists (
    select 1 from _pre_seq ps
    where not exists (
      select 1 from pg_class s
        join pg_depend d on d.objid=s.oid and d.deptype in ('a','i')
        join pg_class t on t.oid=d.refobjid
        join pg_attribute a on a.attrelid=d.refobjid and a.attnum=d.refobjsubid
      where s.relname=ps.seqname and s.relnamespace='app_private'::regnamespace
        and t.relname=ps.tablename and t.relnamespace='app_private'::regnamespace
        and a.attname=ps.colname)) then
    raise exception 'a sequence -> table.column ownership mapping changed across the move'; end if;

  -- (g) exact FK + index sets preserved (moved, same names, now in app_private)
  if (select count(*) from pg_constraint c join pg_class t on t.oid=c.conrelid
       where t.relnamespace='app_private'::regnamespace and c.contype='f')
     <> (select count(*) from _pre_fk) then
    raise exception 'foreign-key count changed across the move'; end if;
  if exists (select conname from _pre_fk
             except
             select c.conname from pg_constraint c join pg_class t on t.oid=c.conrelid
              where t.relnamespace='app_private'::regnamespace and c.contype='f') then
    raise exception 'a pre-move foreign key is missing in app_private'; end if;
  -- no FK on an app_private table may reference a table still in public
  if exists (select 1 from pg_constraint c
               join pg_class t on t.oid=c.conrelid
               join pg_class rt on rt.oid=c.confrelid
              where t.relnamespace='app_private'::regnamespace and c.contype='f'
                and rt.relnamespace='public'::regnamespace) then
    raise exception 'an app_private FK still references a public table'; end if;
  if (select count(*) from pg_index i join pg_class t on t.oid=i.indrelid
       where t.relnamespace='app_private'::regnamespace) <> (select count(*) from _pre_idx) then
    raise exception 'index count changed across the move'; end if;
  if exists (select indexname from _pre_idx
             except
             select ci.relname from pg_index i join pg_class t on t.oid=i.indrelid
               join pg_class ci on ci.oid=i.indexrelid
              where t.relnamespace='app_private'::regnamespace) then
    raise exception 'a pre-move index is missing in app_private'; end if;

  -- (h) schema privileges: runtime role has USAGE on app_private; NONE on
  --     app_private or public for anon/authenticated/PUBLIC.
  if not has_schema_privilege('mayaallan_app','app_private','USAGE') then
    raise exception 'runtime role lacks USAGE on app_private'; end if;
  if has_schema_privilege('mayaallan_app','app_private','CREATE') then
    raise exception 'runtime role should NOT have CREATE on app_private'; end if;
  if has_schema_privilege('anon','app_private','USAGE') or has_schema_privilege('authenticated','app_private','USAGE')
     or has_schema_privilege('anon','app_private','CREATE') or has_schema_privilege('authenticated','app_private','CREATE') then
    raise exception 'anon/authenticated retain a privilege on app_private'; end if;
  if has_schema_privilege('anon','public','USAGE') or has_schema_privilege('authenticated','public','USAGE')
     or has_schema_privilege('anon','public','CREATE') or has_schema_privilege('authenticated','public','CREATE') then
    raise exception 'anon/authenticated retain USAGE/CREATE on public'; end if;
  if exists (select 1 from pg_namespace n, aclexplode(n.nspacl) a
             where n.nspname in ('public','app_private') and a.grantee=0) then
    raise exception 'schema still granted to PUBLIC'; end if;

  -- (i) table/sequence/function privileges for the runtime role; zero for API roles
  foreach tname in array tbls loop
    if not (has_table_privilege('mayaallan_app','app_private.'||tname,'SELECT')
        and has_table_privilege('mayaallan_app','app_private.'||tname,'INSERT')
        and has_table_privilege('mayaallan_app','app_private.'||tname,'UPDATE')
        and has_table_privilege('mayaallan_app','app_private.'||tname,'DELETE')) then
      raise exception 'runtime role missing CRUD on %', tname; end if;
  end loop;
  if exists (select 1 from information_schema.role_table_grants
             where table_schema='app_private' and grantee in ('anon','authenticated','PUBLIC')) then
    raise exception 'anon/authenticated/PUBLIC hold table grants in app_private'; end if;
  if exists (select 1 from information_schema.role_usage_grants  -- sequence USAGE
             where object_schema='app_private' and grantee in ('anon','authenticated','PUBLIC')) then
    raise exception 'anon/authenticated/PUBLIC hold sequence usage in app_private'; end if;
  foreach fn in array fns loop
    select p.oid into v_oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app_private' and p.proname=fn;
    if not has_function_privilege('mayaallan_app', v_oid, 'EXECUTE') then
      raise exception 'runtime role missing EXECUTE on %', fn; end if;
    if has_function_privilege('anon', v_oid, 'EXECUTE') or has_function_privilege('authenticated', v_oid, 'EXECUTE') then
      raise exception 'anon/authenticated retain EXECUTE on %', fn; end if;
    -- PUBLIC: proacl must be explicit (non-null) and carry no grantee=0 EXECUTE.
    if (select proacl is null from pg_proc where oid=v_oid)
       or exists (select 1 from pg_proc pp, aclexplode(pp.proacl) a where pp.oid=v_oid and a.grantee=0 and a.privilege_type='EXECUTE') then
      raise exception 'PUBLIC still has (or defaults to) EXECUTE on %', fn; end if;
  end loop;
  -- runtime role USAGE + SELECT on EVERY app_private sequence
  for rec in select c.relname from pg_class c where c.relkind='S' and c.relnamespace='app_private'::regnamespace loop
    if not (has_sequence_privilege('mayaallan_app','app_private.'||rec.relname,'USAGE')
        and has_sequence_privilege('mayaallan_app','app_private.'||rec.relname,'SELECT')) then
      raise exception 'runtime role missing USAGE/SELECT on sequence %', rec.relname; end if;
  end loop;

  -- (j) default privileges. app_private: runtime role granted for tables(r),
  --     sequences(S), functions(f); API roles + PUBLIC granted none.
  if not exists (select 1 from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace, aclexplode(d.defaclacl) a
                 where n.nspname='app_private' and d.defaclobjtype='r'
                   and a.grantee=(select oid from pg_roles where rolname='mayaallan_app')) then
    raise exception 'app_private default TABLE privilege not set for runtime role'; end if;
  if not exists (select 1 from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace, aclexplode(d.defaclacl) a
                 where n.nspname='app_private' and d.defaclobjtype='S'
                   and a.grantee=(select oid from pg_roles where rolname='mayaallan_app')) then
    raise exception 'app_private default SEQUENCE privilege not set for runtime role'; end if;
  if not exists (select 1 from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace, aclexplode(d.defaclacl) a
                 where n.nspname='app_private' and d.defaclobjtype='f'
                   and a.grantee=(select oid from pg_roles where rolname='mayaallan_app')) then
    raise exception 'app_private default FUNCTION privilege not set for runtime role'; end if;
  if exists (select 1 from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace, aclexplode(d.defaclacl) a
             where n.nspname='app_private'
               and a.grantee in ((select oid from pg_roles where rolname='anon'),
                                 (select oid from pg_roles where rolname='authenticated'), 0)) then
    raise exception 'app_private default privileges still grant an API role / PUBLIC'; end if;
  -- public: default privileges must NOT grant anon/authenticated/PUBLIC.
  if exists (select 1 from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace, aclexplode(d.defaclacl) a
             where n.nspname='public'
               and a.grantee in ((select oid from pg_roles where rolname='anon'),
                                 (select oid from pg_roles where rolname='authenticated'), 0)) then
    raise exception 'public default privileges still grant an API role / PUBLIC'; end if;

  -- (k) ENFORCED ACL ALLOWLIST: on every app_private object the ONLY non-owner
  --     grantee may be mayaallan_app. Any other explicit grantee (PUBLIC=0, anon,
  --     authenticated, service_role, authenticator, or anything else) is a failure.
  if exists (select 1 from pg_namespace n, aclexplode(n.nspacl) a
             where n.nspname='app_private'
               and a.grantee not in ('postgres'::regrole, (select oid from pg_roles where rolname='mayaallan_app'))) then
    raise exception 'app_private schema ACL has a non-allowlisted grantee'; end if;
  if exists (select 1 from pg_class c, aclexplode(c.relacl) a
             where c.relnamespace='app_private'::regnamespace and c.relkind in ('r','S')
               and a.grantee not in ('postgres'::regrole, (select oid from pg_roles where rolname='mayaallan_app'))) then
    raise exception 'an app_private table/sequence ACL has a non-allowlisted grantee'; end if;
  if exists (select 1 from pg_proc p, aclexplode(p.proacl) a
             where p.pronamespace='app_private'::regnamespace
               and a.grantee not in ('postgres'::regrole, (select oid from pg_roles where rolname='mayaallan_app'))) then
    raise exception 'an app_private function ACL has a non-allowlisted grantee'; end if;

  raise notice 'CUTOVER FINAL ASSERTIONS: ALL PASSED';
end $$;

commit;
