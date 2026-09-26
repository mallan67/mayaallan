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
-- =============================================================================

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.books,
  public.retailers,
  public.book_retailer_links,
  public.navigation_items,
  public.site_settings,
  public.email_subscribers,
  public.contact_submissions,
  public.orders,
  public.download_tokens,
  public.events,
  public.media_items,
  public.admin_auth,
  public.pending_paypal_orders,
  public.marketing_visitors,
  public.marketing_events
TO service_role;

GRANT USAGE, SELECT ON SEQUENCE
  public.books_id_seq,
  public.retailers_id_seq,
  public.book_retailer_links_id_seq,
  public.navigation_items_id_seq,
  public.site_settings_id_seq,
  public.email_subscribers_id_seq,
  public.contact_submissions_id_seq,
  public.orders_id_seq,
  public.download_tokens_id_seq,
  public.events_id_seq,
  public.media_items_id_seq,
  public.pending_paypal_orders_id_seq,
  public.marketing_events_id_seq
TO service_role;

COMMIT;
