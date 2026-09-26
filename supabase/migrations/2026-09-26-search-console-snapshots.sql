-- =============================================================================
-- 2026-09-26 — Private Search Console snapshot storage
-- =============================================================================
-- Search Console rows can contain exact user queries, clicks, impressions,
-- positions, sitemap state and URL-inspection results. Keep them in the
-- server-only Supabase database, not a public object store.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.search_console_snapshots (
  snapshot_date DATE PRIMARY KEY,
  fetched_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.search_console_snapshots ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.search_console_snapshots
  TO service_role;

CREATE INDEX IF NOT EXISTS search_console_snapshots_fetched_at_idx
  ON public.search_console_snapshots (fetched_at DESC);

COMMIT;
