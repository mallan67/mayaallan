-- ============================================================================
-- 2026-05-21 — events + site_settings: PascalCase → snake_case reconciliation
-- ============================================================================
--
-- BACKGROUND
-- Live production has data in PascalCase "Event" and "SiteSettings" tables
-- (camelCase columns), but the codebase reads them via Tables[*] indirection
-- that pointed at the PascalCase names. Schema.sql defines snake_case `events`
-- and `site_settings` but the code never used them.
--
-- Read-only inspection (/admin/db-inspect, 2026-05-21T18:18:29Z) confirmed:
--   - "Event"        (PascalCase): EXISTS, 1 row of production data
--   - events         (snake_case): EXISTS, 0 rows (safe to drop+recreate)
--   - "SiteSettings" (PascalCase): EXISTS, 1 row of production data
--   - site_settings  (snake_case): MISSING (PGRST205, table not in schema cache)
--
-- WHAT THIS MIGRATION DOES
--   1. Drops the empty snake_case `events` table (confirmed 0 rows — no data loss)
--   2. Creates canonical snake_case `events` matching PascalCase Event 1:1
--   3. (guarded) Copies the 1 row from "Event" → events if the orphan exists
--   4. Creates canonical snake_case `site_settings` table
--   5. (guarded) Copies the 1 row from "SiteSettings" → site_settings if present
--   6. Bumps the BIGSERIAL sequences past MAX(id) so future inserts don't collide
--   7. Prints verification counts at the end
--
-- SAFETY MODEL
--   This migration is designed for FIRST-RUN against the production state
--   confirmed by /admin/db-inspect on 2026-05-21:
--     - public.events exists but is empty (0 rows)
--     - public.site_settings is missing (PGRST205)
--     - public."Event" / public."SiteSettings" hold the canonical 1 row each
--
--   FAIL-CLOSED GUARDS (before each DROP/CREATE):
--     The migration counts rows in public.events and public.site_settings.
--     If EITHER canonical table already contains > 0 rows, the migration
--     RAISEs EXCEPTION and aborts the transaction — refusing to destroy
--     data. This blocks dangerous re-runs and protects any future state
--     where the canonical snake_case tables have been populated by other
--     means (manual import, restored backup, follow-up migration, etc.).
--
--   The DATA-COPY steps (#3, #5) use a separate to_regclass() guard that
--   handles the case where the PascalCase orphan is missing (e.g. fresh
--   DB initialized from schema.sql). Those guards prevent "relation does
--   not exist" failures during the INSERT. They do NOT make destructive
--   operations safe — the row-count check above is the destructive-
--   operation guard.
--
-- WHAT THIS MIGRATION INTENTIONALLY DOES NOT DO
--   - Does NOT drop "Event" or "SiteSettings" — those stay as a rollback
--     safety net. Orphan removal handled separately when directed.
--   - Does NOT modify the schema beyond the rename + data copy. Constraints,
--     triggers, and other database hardening are handled separately if/when
--     directed.
--
-- HOW TO RUN
--   1. Open Supabase SQL Editor against the production project.
--   2. Paste this entire file.
--   3. Run. The final SELECT at the bottom prints row counts.
--   4. Expected output in production (where the orphans had 1 row each):
--        events        | 1
--        site_settings | 1
--      Plus two NOTICEs in the Messages panel:
--        Orphan "Event":        1 rows (kept as rollback safety net)
--        Orphan "SiteSettings": 1 rows (kept as rollback safety net)
--   5. If the row counts diverge from "1 / 1" in production, STOP and
--      investigate before merging the application-code PR.
--
-- ROLLBACK
--   If the new code misbehaves after deploy, the rollback is purely a code
--   revert (the Tables[*] constants flip back to "Event" / "SiteSettings").
--   The PascalCase tables still hold the original 1 row each, untouched.
--   No SQL rollback is needed.
-- ============================================================================

BEGIN;

-- ─── FAIL-CLOSED PRE-FLIGHT CHECKS ──────────────────────────────────
-- Refuse to destroy any canonical snake_case table that already has rows.
-- If either check trips, the transaction aborts and the DB is unchanged.
DO $$
DECLARE
  events_existing_rows BIGINT;
  ss_existing_rows BIGINT;
BEGIN
  -- public.events: only safe to DROP/CREATE if missing or empty.
  IF to_regclass('public.events') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.events' INTO events_existing_rows;
    IF events_existing_rows > 0 THEN
      RAISE EXCEPTION
        'Refusing to run: public.events already has % row(s). This '
        'migration is single-use against the first-run production state '
        'where events is confirmed empty. Re-running against a populated '
        'canonical events table would destroy data. If a re-run is '
        'genuinely needed, audit the rows, export them, and write a '
        'separate migration.',
        events_existing_rows;
    END IF;
  END IF;

  -- public.site_settings: same rule.
  IF to_regclass('public.site_settings') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.site_settings' INTO ss_existing_rows;
    IF ss_existing_rows > 0 THEN
      RAISE EXCEPTION
        'Refusing to run: public.site_settings already has % row(s). This '
        'migration is single-use against the first-run production state '
        'where site_settings is missing/empty. Re-running against a '
        'populated canonical site_settings table would destroy data.',
        ss_existing_rows;
    END IF;
  END IF;
END $$;

-- ─── EVENTS ──────────────────────────────────────────────────────────

-- 1. Drop the snake_case events table. Safety: the pre-flight check above
--    has already verified the table is missing or empty (row count = 0).
DROP TABLE IF EXISTS public.events CASCADE;

-- 2. Recreate with full canonical schema matching PascalCase Event 1:1.
CREATE TABLE public.events (
  id                      BIGSERIAL PRIMARY KEY,
  slug                    TEXT UNIQUE NOT NULL,
  title                   TEXT NOT NULL,
  description             TEXT,
  starts_at               TIMESTAMPTZ,
  ends_at                 TIMESTAMPTZ,
  location_text           TEXT,
  location_url            TEXT,
  event_image_url         TEXT,
  is_published            BOOLEAN NOT NULL DEFAULT false,
  is_visible              BOOLEAN NOT NULL DEFAULT false,
  keep_visible_after_end  BOOLEAN NOT NULL DEFAULT false,
  seo_title               TEXT,
  seo_description         TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Copy all rows from PascalCase "Event" → snake_case events, then
--    advance the sequence. Guarded by to_regclass() so the migration
--    is also safe to run against a fresh DB (initialized from
--    schema.sql with no PascalCase orphans) or a future state where
--    the orphans have been cleaned up.
DO $$
BEGIN
  IF to_regclass('public."Event"') IS NOT NULL THEN
    INSERT INTO public.events (
      id, slug, title, description,
      starts_at, ends_at,
      location_text, location_url,
      event_image_url,
      is_published, is_visible, keep_visible_after_end,
      seo_title, seo_description,
      created_at, updated_at
    )
    SELECT
      id, slug, title, description,
      "startsAt", "endsAt",
      "locationText", "locationUrl",
      "eventImageUrl",
      COALESCE("isPublished", false),
      COALESCE("isVisible", false),
      COALESCE("keepVisibleAfterEnd", false),
      "seoTitle", "seoDescription",
      COALESCE("createdAt", NOW()),
      COALESCE("updatedAt", NOW())
    FROM public."Event";

    -- Sequence advance. If rows were copied, set to MAX(id) with
    -- `called = true` so the next nextval() returns MAX(id)+1.
    -- If the orphan exists but is empty (no rows), leave the
    -- sequence at its CREATE default so the next INSERT gets id=1.
    PERFORM setval(
      pg_get_serial_sequence('public.events', 'id'),
      COALESCE((SELECT MAX(id) FROM public.events), 1),
      EXISTS (SELECT 1 FROM public.events)
    );
  ELSE
    RAISE NOTICE
      'Source table public."Event" does not exist — events table created empty. '
      'Sequence left at CREATE default; next INSERT gets id=1.';
  END IF;
END $$;

-- ─── SITE_SETTINGS ───────────────────────────────────────────────────

-- 1. Drop in case a partial/wrong shape exists (PGRST205 may also mean a
--    table the schema cache hasn't picked up yet — DROP IF EXISTS is safe).
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- 2. Create canonical snake_case site_settings matching PascalCase shape.
CREATE TABLE public.site_settings (
  id                    BIGSERIAL PRIMARY KEY,
  site_name             TEXT,
  tagline               TEXT,
  author_name           TEXT,
  author_bio            TEXT,
  author_photo_url      TEXT,
  contact_email         TEXT,
  footer_text           TEXT,
  site_icon_url         TEXT,
  default_og_image_url  TEXT,
  social_facebook       TEXT,
  social_instagram      TEXT,
  social_tiktok         TEXT,
  social_twitter        TEXT,
  social_x              TEXT,
  social_youtube        TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Copy all rows from PascalCase "SiteSettings" → snake_case
--    site_settings, then advance the sequence. Same to_regclass() guard
--    as the events block above.
DO $$
BEGIN
  IF to_regclass('public."SiteSettings"') IS NOT NULL THEN
    INSERT INTO public.site_settings (
      id, site_name, tagline,
      author_name, author_bio, author_photo_url,
      contact_email, footer_text,
      site_icon_url, default_og_image_url,
      social_facebook, social_instagram, social_tiktok,
      social_twitter, social_x, social_youtube,
      updated_at
    )
    SELECT
      id, "siteName", tagline,
      "authorName", "authorBio", "authorPhotoUrl",
      "contactEmail", "footerText",
      "siteIconUrl", "defaultOgImageUrl",
      "socialFacebook", "socialInstagram", "socialTiktok",
      "socialTwitter", "socialX", "socialYoutube",
      COALESCE("updatedAt", NOW())
    FROM public."SiteSettings";

    PERFORM setval(
      pg_get_serial_sequence('public.site_settings', 'id'),
      COALESCE((SELECT MAX(id) FROM public.site_settings), 1),
      EXISTS (SELECT 1 FROM public.site_settings)
    );
  ELSE
    RAISE NOTICE
      'Source table public."SiteSettings" does not exist — site_settings table '
      'created empty. Sequence left at CREATE default.';
  END IF;
END $$;

COMMIT;

-- ─── VERIFICATION ────────────────────────────────────────────────────
-- Always-safe verification: the canonical snake_case tables always exist
-- after this migration (they're created above unconditionally), so this
-- SELECT works on every run regardless of orphan presence.
--
-- Expected (production, where orphans had 1 row each):
--    events         | 1
--    site_settings  | 1
--
-- Expected (fresh DB with no orphans):
--    events         | 0
--    site_settings  | 0
SELECT 'events'        AS table_name, COUNT(*) AS row_count FROM public.events
UNION ALL
SELECT 'site_settings' AS table_name, COUNT(*) AS row_count FROM public.site_settings;

-- Orphan counts (printed as NOTICEs, gracefully handle missing tables).
-- Watch the SQL Editor "Messages" panel — these don't appear in result rows.
DO $$
DECLARE
  ev_count BIGINT;
  ss_count BIGINT;
BEGIN
  IF to_regclass('public."Event"') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public."Event"' INTO ev_count;
    RAISE NOTICE 'Orphan "Event": % rows (kept as rollback safety net)', ev_count;
  ELSE
    RAISE NOTICE 'Orphan "Event": table not present (fresh DB or already cleaned up)';
  END IF;

  IF to_regclass('public."SiteSettings"') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public."SiteSettings"' INTO ss_count;
    RAISE NOTICE 'Orphan "SiteSettings": % rows (kept as rollback safety net)', ss_count;
  ELSE
    RAISE NOTICE 'Orphan "SiteSettings": table not present';
  END IF;
END $$;
