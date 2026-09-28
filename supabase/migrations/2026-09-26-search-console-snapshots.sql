-- Private daily Google Search Console snapshots.
-- Stores search queries and URL-inspection data server-side only.

BEGIN;

CREATE TABLE IF NOT EXISTS public.search_console_snapshots (
  snapshot_date DATE PRIMARY KEY,
  fetched_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.search_console_snapshots ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.search_console_snapshots FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.search_console_snapshots
  TO service_role;

CREATE INDEX IF NOT EXISTS search_console_snapshots_fetched_at_idx
  ON public.search_console_snapshots (fetched_at DESC);

COMMIT;
