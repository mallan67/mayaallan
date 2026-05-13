-- Drop the 9 stale Prisma PascalCase tables + _prisma_migrations.
-- Verified 2026-05-13 (Audit/Maya): the active snake_case tables hold the current data;
-- these PascalCase tables are dormant artifacts from a Prisma setup that was abandoned
-- in favour of @supabase/supabase-js. Code (src/lib/supabaseAdmin.ts Tables const) does
-- not reference any of them. PostgREST OpenAPI confirmed they are not bound to any view
-- or function in active use.
--
-- Run once in Supabase SQL Editor. Wrapped in a transaction so if any drop fails (for
-- example, an unexpected foreign-key dependency), nothing is changed.
--
-- IRREVERSIBLE. The row counts at time of drop (you saw these in the audit):
--   Book                  1 row   (duplicate of books.id=1 — same title, slug)
--   BookRetailerLink      4 rows  (stale amazon-only links; active table has 10)
--   ContactSubmission     0 rows
--   DownloadToken         0 rows
--   EmailSubscriber       0 rows
--   MediaItem             0 rows
--   NavigationItem        0 rows
--   Order                 0 rows
--   Retailer              3 rows  (one empty-string row + amazon/Google)
--   _prisma_migrations    3 rows  (Prisma migration history, Dec'25–Jan'26)

BEGIN;

DROP TABLE IF EXISTS public."Book"                CASCADE;
DROP TABLE IF EXISTS public."BookRetailerLink"    CASCADE;
DROP TABLE IF EXISTS public."ContactSubmission"   CASCADE;
DROP TABLE IF EXISTS public."DownloadToken"       CASCADE;
DROP TABLE IF EXISTS public."EmailSubscriber"     CASCADE;
DROP TABLE IF EXISTS public."MediaItem"           CASCADE;
DROP TABLE IF EXISTS public."NavigationItem"      CASCADE;
DROP TABLE IF EXISTS public."Order"               CASCADE;
DROP TABLE IF EXISTS public."Retailer"            CASCADE;
DROP TABLE IF EXISTS public._prisma_migrations    CASCADE;

-- Final state sanity check — should report 0 rows for each name below.
-- If anything errors out, the transaction rolls back automatically.
SELECT
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'
     AND table_name IN ('Book','BookRetailerLink','ContactSubmission','DownloadToken',
                         'EmailSubscriber','MediaItem','NavigationItem','Order','Retailer',
                         '_prisma_migrations')) AS remaining_orphans;

COMMIT;
