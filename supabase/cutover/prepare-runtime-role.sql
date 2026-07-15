-- =============================================================================
-- PREPARE RUNTIME ROLE (run BEFORE deploying the direct-SQL app)
-- =============================================================================
-- A freshly-created role has no access to the current public tables. Run this
-- while the tables STILL live in public, so the app can be deployed and verified
-- under the least-privileged runtime role BEFORE the cutover moves anything.
--
-- Grants mayaallan_app exactly the access the website needs on the CURRENT public
-- objects — and nothing more (no CREATE, nothing to anon/authenticated/PUBLIC).
--
-- The role itself + its password are created OUT OF BAND (Supabase dashboard /
-- SQL) and the password is stored only in Vercel/Supabase. This file contains no
-- password and no connection string. Runtime role name: mayaallan_app
-- (find-and-replace if different).
-- =============================================================================

begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- 1) Precondition: role exists, LOGIN, least-privileged, no inherited privileged
--    role/membership (same gate as the cutover).
do $$
declare v_bad text;
begin
  if not exists (select 1 from pg_roles where rolname='mayaallan_app') then
    raise exception 'runtime role mayaallan_app missing — create it least-privileged (LOGIN, password stored in Vercel/Supabase) first';
  end if;
  if not (select rolcanlogin from pg_roles where rolname='mayaallan_app') then
    raise exception 'runtime role mayaallan_app must have LOGIN';
  end if;
  if exists (select 1 from pg_roles where rolname='mayaallan_app'
             and (rolsuper or rolbypassrls or rolcreatedb or rolcreaterole or rolreplication)) then
    raise exception 'runtime role mayaallan_app has elevated attributes';
  end if;
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
end $$;

-- 2) Assert exactly the 15 application tables + 6 functions currently in public.
do $$
declare t text;
begin
  foreach t in array array[
    'admin_auth','book_retailer_links','books','contact_submissions',
    'download_tokens','email_subscribers','events','marketing_events',
    'marketing_visitors','media_items','navigation_items','orders',
    'pending_paypal_orders','retailers','site_settings'] loop
    if not exists (select 1 from pg_tables where schemaname='public' and tablename=t) then
      raise exception 'expected table public.% not found', t; end if;
  end loop;
end $$;

-- 3) Grant exactly the required access.
do $$ begin execute format('grant connect on database %I to mayaallan_app', current_database()); end $$;
grant usage on schema public to mayaallan_app;
grant select, insert, update, delete on
  public.admin_auth, public.book_retailer_links, public.books, public.contact_submissions,
  public.download_tokens, public.email_subscribers, public.events, public.marketing_events,
  public.marketing_visitors, public.media_items, public.navigation_items, public.orders,
  public.pending_paypal_orders, public.retailers, public.site_settings
  to mayaallan_app;
-- Grant USAGE/SELECT on EXACTLY the application-owned sequences (each owned by
-- one of the 15 tables), never "all sequences".
create temporary table _app_seq (seqname text primary key) on commit drop;
insert into _app_seq
  select s.relname from pg_class s
    join pg_depend d on d.objid=s.oid and d.deptype in ('a','i')
      and d.classid='pg_class'::regclass and d.refclassid='pg_class'::regclass
    join pg_class t on t.oid=d.refobjid
   where s.relkind='S' and s.relnamespace='public'::regnamespace
     and t.relnamespace='public'::regnamespace
     and t.relname = any(array[
       'admin_auth','book_retailer_links','books','contact_submissions',
       'download_tokens','email_subscribers','events','marketing_events',
       'marketing_visitors','media_items','navigation_items','orders',
       'pending_paypal_orders','retailers','site_settings']);
do $$
declare r record;
begin
  for r in select seqname from _app_seq loop
    execute format('grant usage, select on sequence public.%I to mayaallan_app', r.seqname);
  end loop;
end $$;
grant execute on function
  public.increment_download_count(text),
  public.decrement_download_count(text),
  public.claim_download_email_send(text, text, integer),
  public.release_download_email_claim(text, text),
  public.marketing_event_counts_since(timestamptz),
  public.marketing_campaign_summary_since(timestamptz, integer)
  to mayaallan_app;

-- 4) Ensure NO create privilege and NOTHING granted to the API roles here.
revoke create on schema public from mayaallan_app;

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
  tname text; fn text; s record;
begin
  -- Can run the app:
  if not has_database_privilege('mayaallan_app', current_database(), 'CONNECT') then
    raise exception 'runtime role missing CONNECT'; end if;
  if not has_schema_privilege('mayaallan_app','public','USAGE') then
    raise exception 'runtime role missing USAGE on public'; end if;
  foreach tname in array tbls loop
    if not (has_table_privilege('mayaallan_app','public.'||tname,'SELECT')
        and has_table_privilege('mayaallan_app','public.'||tname,'INSERT')
        and has_table_privilege('mayaallan_app','public.'||tname,'UPDATE')
        and has_table_privilege('mayaallan_app','public.'||tname,'DELETE')) then
      raise exception 'runtime role missing CRUD on public.%', tname; end if;
  end loop;
  for s in select seqname from _app_seq loop
    if not (has_sequence_privilege('mayaallan_app','public.'||s.seqname,'USAGE')
        and has_sequence_privilege('mayaallan_app','public.'||s.seqname,'SELECT')) then
      raise exception 'runtime role missing USAGE/SELECT on sequence %', s.seqname; end if;
  end loop;
  -- no unexpected public sequence — every one must be application-owned
  if (select count(*) from _app_seq) <> (select count(*) from pg_class where relkind='S' and relnamespace='public'::regnamespace) then
    raise exception 'unexpected public sequence not owned by an application table'; end if;
  foreach fn in array fns loop
    if not has_function_privilege('mayaallan_app',
         (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=fn),'EXECUTE') then
      raise exception 'runtime role missing EXECUTE on public.%', fn; end if;
  end loop;

  -- Cannot do more than the app needs:
  if has_schema_privilege('mayaallan_app','public','CREATE') then
    raise exception 'runtime role must NOT have CREATE on public (cannot create tables)'; end if;
  if has_database_privilege('mayaallan_app', current_database(), 'CREATE') then
    raise exception 'runtime role must NOT have CREATE on the database (cannot create schemas)'; end if;
  raise notice 'PREPARE-RUNTIME-ROLE FINAL ASSERTIONS: ALL PASSED';
end $$;

commit;
