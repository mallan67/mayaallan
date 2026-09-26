-- =============================================================================
-- 2026-09-26 — Explicit Supabase Data API grants
-- =============================================================================
-- Supabase changes existing projects on 2026-10-30 so NEW tables in public
-- no longer receive Data API grants automatically.
--
-- Existing production tables keep their grants, so this migration is
-- intentionally idempotent hardening: it makes the app's required server-side
-- access explicit today and keeps fresh databases / preview branches / db reset
-- environments working after the cutoff.
--
-- Application architecture:
--   - Database access in the Next.js app is server-side through supabaseAdmin.
--   - The browser does not use a Supabase publishable client.
--   - Therefore these grants are deliberately limited to service_role.
--   - Do NOT broaden these grants to anon/authenticated without an explicit
--     product/security decision and appropriate RLS policies.
--
-- Fresh-database safety:
--   - Some historical feature tables are created by manually-run SQL scripts,
--     not by the dated migration chain.
--   - This remediation migration therefore grants only relations that already
--     exist instead of assuming every historical table is present.
--   - Serial sequences are discovered from each existing table's id column and
--     granted only when a sequence actually exists.
-- =============================================================================

BEGIN;

DO $$
DECLARE
  table_name TEXT;
  relation_name TEXT;
  sequence_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'books',
    'retailers',
    'book_retailer_links',
    'navigation_items',
    'site_settings',
    'email_subscribers',
    'contact_submissions',
    'orders',
    'download_tokens',
    'events',
    'media_items',
    'admin_auth',
    'pending_paypal_orders',
    'marketing_visitors',
    'marketing_events'
  ]
  LOOP
    relation_name := format('public.%I', table_name);

    IF to_regclass(relation_name) IS NOT NULL THEN
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role',
        table_name
      );

      -- UUID/non-serial primary keys and plain INTEGER ids have no owned
      -- sequence; pg_get_serial_sequence returns NULL for those tables.
      sequence_name := pg_get_serial_sequence(relation_name, 'id');
      IF sequence_name IS NOT NULL THEN
        EXECUTE format(
          'GRANT USAGE, SELECT ON SEQUENCE %s TO service_role',
          sequence_name
        );
      END IF;
    END IF;
  END LOOP;
END
$$;

COMMIT;
