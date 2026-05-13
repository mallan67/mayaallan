-- ============================================================================
-- PR E — Marketing attribution + conversion events
-- ============================================================================
-- Adds two new tables (marketing_visitors, marketing_events) plus optional
-- nullable attribution columns on the existing orders table.
--
-- All statements are idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- so re-running is safe. Run once in the Supabase SQL editor before the
-- code from this PR deploys — the trackMarketingEvent helper expects
-- marketing_events to exist, and the admin /admin/analytics dashboard
-- expects marketing_visitors as well.
--
-- Privacy notes (enforced in application code, documented here for
-- reviewers):
--   - ip_hash and user_agent_hash store SHA-256 truncations, never raw
--   - marketing_events.properties NEVER stores full email addresses
--     (we extract the domain only — e.g. "gmail.com")
--   - No PII is stored on these tables outside the hashed identifiers
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1) marketing_visitors — one row per anonymous visitor cookie
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketing_visitors (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id            TEXT NOT NULL UNIQUE,
  first_seen_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_landing_page    TEXT,
  first_referrer        TEXT,
  first_utm_source      TEXT,
  first_utm_medium      TEXT,
  first_utm_campaign    TEXT,
  first_utm_content     TEXT,
  first_utm_term        TEXT,
  user_agent_hash       TEXT,
  ip_hash               TEXT
);


-- ----------------------------------------------------------------------------
-- 2) marketing_events — append-only event stream
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketing_events (
  id              BIGSERIAL PRIMARY KEY,
  visitor_id      TEXT,
  session_id      TEXT,
  event_name      TEXT NOT NULL,
  path            TEXT,
  referrer        TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  utm_term        TEXT,
  properties      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Most common admin-dashboard query is "events of kind X in the last 30/90 days"
CREATE INDEX IF NOT EXISTS idx_marketing_events_name_created
  ON public.marketing_events (event_name, created_at DESC);

-- Per-visitor history lookups (funnel reconstruction)
CREATE INDEX IF NOT EXISTS idx_marketing_events_visitor_created
  ON public.marketing_events (visitor_id, created_at DESC);

-- Top campaigns table on the dashboard
CREATE INDEX IF NOT EXISTS idx_marketing_events_campaign_created
  ON public.marketing_events (utm_campaign, created_at DESC)
  WHERE utm_campaign IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 3) Optional attribution columns on orders (additive, nullable)
-- ----------------------------------------------------------------------------
-- Lets the admin dashboard join paypal orders -> attribution without
-- pulling from marketing_events.properties. All columns are nullable so
-- existing rows (including paid customers from before this migration)
-- remain valid. The webhook writes these AFTER the existing fulfillment
-- branch decides; if those writes fail it does NOT break fulfillment.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS visitor_id      TEXT,
  ADD COLUMN IF NOT EXISTS session_id      TEXT,
  ADD COLUMN IF NOT EXISTS utm_source      TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium      TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign    TEXT,
  ADD COLUMN IF NOT EXISTS landing_page    TEXT,
  ADD COLUMN IF NOT EXISTS referrer        TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign
  ON public.orders (utm_campaign)
  WHERE utm_campaign IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 4) Attribution bridge on pending_paypal_orders
-- ----------------------------------------------------------------------------
-- The checkout flow has the customer's cookies (visitor_id, utm_*) on its
-- inbound request. The PayPal webhook does NOT — it's server-to-server
-- with no cookies. To attribute purchases to campaigns we need to bridge
-- the two halves of the flow.
--
-- The bridge: the checkout writes the attribution snapshot onto the
-- pending_paypal_orders row it already creates (keyed by paypal_order_id).
-- The webhook looks up that row by paypal_order_id and:
--   (a) populates the purchase_completed event with the snapshotted utm_*
--   (b) writes utm_* into the orders.* attribution columns
--
-- All columns are nullable. Existing pending rows from before PR E remain
-- valid; they simply don't carry attribution.
ALTER TABLE public.pending_paypal_orders
  ADD COLUMN IF NOT EXISTS visitor_id      TEXT,
  ADD COLUMN IF NOT EXISTS session_id      TEXT,
  ADD COLUMN IF NOT EXISTS utm_source      TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium      TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign    TEXT,
  ADD COLUMN IF NOT EXISTS utm_content     TEXT,
  ADD COLUMN IF NOT EXISTS utm_term        TEXT,
  ADD COLUMN IF NOT EXISTS landing_page    TEXT,
  ADD COLUMN IF NOT EXISTS referrer        TEXT;


-- ----------------------------------------------------------------------------
-- 5) Aggregate RPCs for the admin /admin/analytics dashboard
-- ----------------------------------------------------------------------------
-- Supabase REST returns at most ~1000 rows by default. Counting events
-- in-memory in the Node handler silently undercounts once traffic grows.
-- These RPCs do the GROUP BY in Postgres and return tiny result sets.
--
-- Both RPCs accept a since-timestamp; the dashboard calls them three
-- times for the 7/30/90-day windows.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.marketing_event_counts_since(
  p_since TIMESTAMPTZ
)
RETURNS TABLE (
  event_name TEXT,
  n          BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT event_name, COUNT(*)::BIGINT AS n
    FROM public.marketing_events
   WHERE created_at >= p_since
   GROUP BY event_name
   ORDER BY n DESC;
$$;

GRANT EXECUTE ON FUNCTION public.marketing_event_counts_since(TIMESTAMPTZ)
  TO service_role;


-- Per-campaign rollup. Counts events, checkouts, purchases, and sums
-- the amount from purchase_completed properties. p_limit caps the
-- result so the dashboard doesn't render hundreds of long-tail UTMs.
CREATE OR REPLACE FUNCTION public.marketing_campaign_summary_since(
  p_since TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  campaign     TEXT,
  events       BIGINT,
  checkouts    BIGINT,
  purchases    BIGINT,
  revenue      NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    utm_campaign AS campaign,
    COUNT(*)::BIGINT                                                  AS events,
    COUNT(*) FILTER (WHERE event_name = 'checkout_started')::BIGINT   AS checkouts,
    COUNT(*) FILTER (WHERE event_name = 'purchase_completed')::BIGINT AS purchases,
    COALESCE(
      SUM(
        CASE
          WHEN event_name = 'purchase_completed'
            AND (properties ->> 'amount') ~ '^[0-9]+(\.[0-9]+)?$'
          THEN ((properties ->> 'amount')::NUMERIC)
          ELSE 0
        END
      ),
      0
    )::NUMERIC AS revenue
  FROM public.marketing_events
  WHERE created_at >= p_since
    AND utm_campaign IS NOT NULL
  GROUP BY utm_campaign
  ORDER BY events DESC
  LIMIT GREATEST(COALESCE(p_limit, 10), 1);
$$;

GRANT EXECUTE ON FUNCTION public.marketing_campaign_summary_since(TIMESTAMPTZ, INTEGER)
  TO service_role;
