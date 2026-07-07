-- =============================================================================
-- Drop the two remaining legacy PascalCase duplicate tables:
--   public."Event"  and  public."SiteSettings"
-- =============================================================================
-- Background:
--   These are dormant leftovers from an abandoned Prisma setup. The live app
--   reads and writes ONLY the snake_case tables `events` / `site_settings`
--   (via the `Tables` constant in src/lib/supabaseAdmin.ts). The prior orphan
--   cleanup (supabase/drop-prisma-orphan-tables.sql, 2026-05-13) dropped the
--   other 9 Prisma tables but deliberately kept these two as a rollback net
--   until the snake_case path was proven live. It has been (~7 weeks).
--
-- Verified 2026-07-07 before dropping:
--   - "Event"        : 1 row, byte-for-byte identical to events.id=4.
--   - "SiteSettings" : 1 row, an OLDER copy (updated 2026-02-20) of
--                      site_settings.id=1 (updated 2026-06-29). No unique data.
--   - No foreign keys or views reference either table.
--   - Only /admin/db-inspect probes them, and it handles absence gracefully.
--
-- Safety:
--   - RESTRICT (no CASCADE): an unexpected dependency aborts the whole tx.
--   - IDEMPOTENT: IF EXISTS makes a re-run a no-op.
--   - IRREVERSIBLE once committed — but the identical/newer data lives on in
--     the snake_case tables, so nothing is lost.
-- =============================================================================

BEGIN;

DROP TABLE IF EXISTS public."Event";
DROP TABLE IF EXISTS public."SiteSettings";

COMMIT;
