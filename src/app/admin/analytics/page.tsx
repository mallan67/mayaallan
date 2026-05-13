/**
 * Admin analytics dashboard.
 *
 * Reads from marketing_events (and orders for revenue). All aggregation
 * happens server-side — we never pull the raw event stream to the
 * client. The page renders gracefully when there's no data (most likely
 * state on first deploy).
 *
 * Auth: requires admin session (AdminAuthGuard wraps the /admin/ subtree
 * via layout; this page additionally calls isAuthenticated for defense).
 */
import Link from "next/link"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
] as const

type RangeKey = (typeof RANGES)[number]["label"]
type EventCounts = Record<string, number>

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

async function countEventsByName(sinceIso: string): Promise<EventCounts> {
  // Aggregated in Postgres via marketing_event_counts_since RPC. This
  // returns at most one row per distinct event_name (currently 11), so
  // we never hit the supabase REST default row cap of 1000.
  const { data, error } = await supabaseAdmin.rpc("marketing_event_counts_since", { p_since: sinceIso })

  if (error || !data) {
    if (error) console.error("[admin/analytics] event-counts RPC failed:", error.message, error.code)
    return {}
  }
  const out: EventCounts = {}
  for (const row of data as Array<{ event_name: string; n: number }>) {
    out[row.event_name] = Number(row.n) || 0
  }
  return out
}

async function revenueAndOrderCount(sinceIso: string): Promise<{ orders: number; revenue: number }> {
  // Orders are bounded in volume; a direct query with explicit limit is
  // sufficient and avoids needing a fifth RPC. If volume grows we can
  // add an RPC later.
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, amount, status")
    .eq("status", "completed")
    .gte("created_at", sinceIso)
    .limit(10_000)

  if (error || !data) return { orders: 0, revenue: 0 }
  let revenue = 0
  for (const row of data as Array<{ amount: number | null }>) {
    if (typeof row.amount === "number" && Number.isFinite(row.amount)) {
      revenue += row.amount
    }
  }
  return { orders: data.length, revenue }
}

async function topCampaigns(sinceIso: string, limit = 10): Promise<Array<{
  campaign: string
  events: number
  checkouts: number
  purchases: number
  revenue: number
}>> {
  // Aggregated in Postgres via marketing_campaign_summary_since RPC.
  // Revenue is summed inside the function from purchase_completed
  // properties so the dashboard isn't dependent on streaming event rows.
  const { data, error } = await supabaseAdmin.rpc("marketing_campaign_summary_since", {
    p_since: sinceIso,
    p_limit: limit,
  })

  if (error || !data) {
    if (error) console.error("[admin/analytics] campaign-summary RPC failed:", error.message, error.code)
    return []
  }
  return (data as Array<{
    campaign: string
    events: number
    checkouts: number
    purchases: number
    revenue: string | number | null
  }>).map((row) => ({
    campaign: row.campaign,
    events: Number(row.events) || 0,
    checkouts: Number(row.checkouts) || 0,
    purchases: Number(row.purchases) || 0,
    revenue: Number(row.revenue) || 0,
  }))
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-US")
}

function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

function Card({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">{title}</div>
      <div className="text-2xl font-serif font-semibold text-slate-900">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  )
}

async function RangeSection({ days, label }: { days: number; label: RangeKey }) {
  const sinceIso = isoDaysAgo(days)
  const [counts, revenue] = await Promise.all([countEventsByName(sinceIso), revenueAndOrderCount(sinceIso)])

  const bookViews = counts["book_viewed"] ?? 0
  const checkouts = counts["checkout_started"] ?? 0
  const purchases = counts["purchase_completed"] ?? 0
  const subscribers = counts["newsletter_subscribed"] ?? 0
  const contacts = counts["contact_submitted"] ?? 0
  const exportPurchases = counts["export_purchased"] ?? 0
  const toolStarts = counts["tool_started"] ?? 0
  const toolCompletes = counts["tool_completed"] ?? 0

  // Funnel rates (guard against divide-by-zero)
  const checkoutRate = bookViews > 0 ? (checkouts / bookViews) * 100 : 0
  const purchaseRate = checkouts > 0 ? (purchases / checkouts) * 100 : 0

  const campaigns = await topCampaigns(sinceIso)

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-lg font-semibold">{label}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card title="Newsletter signups" value={fmtNum(subscribers)} />
        <Card title="Contact submissions" value={fmtNum(contacts)} />
        <Card title="Checkout starts" value={fmtNum(checkouts)} />
        <Card title="Purchases" value={fmtNum(purchases)} />
        <Card title="Estimated revenue" value={fmtUSD(revenue.revenue)} hint={`${revenue.orders} completed order${revenue.orders === 1 ? "" : "s"}`} />
        <Card title="Book views" value={fmtNum(bookViews)} />
        <Card title="Tool starts" value={fmtNum(toolStarts)} hint={toolCompletes > 0 ? `${fmtNum(toolCompletes)} completed` : undefined} />
        <Card title="Export purchases" value={fmtNum(exportPurchases)} />
      </div>

      <div className="border border-slate-200 rounded-lg p-4 bg-white">
        <h3 className="text-sm font-semibold mb-3">Funnel</h3>
        {bookViews === 0 && checkouts === 0 && purchases === 0 ? (
          <p className="text-sm text-slate-500">No conversion data yet for this window.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500">Book viewed</div>
              <div className="font-semibold">{fmtNum(bookViews)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">→ Checkout started</div>
              <div className="font-semibold">{fmtNum(checkouts)}</div>
              <div className="text-xs text-slate-400">{checkoutRate.toFixed(1)}% of viewers</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">→ Purchase completed</div>
              <div className="font-semibold">{fmtNum(purchases)}</div>
              <div className="text-xs text-slate-400">{purchaseRate.toFixed(1)}% of starters</div>
            </div>
          </div>
        )}
      </div>

      <div className="border border-slate-200 rounded-lg p-4 bg-white">
        <h3 className="text-sm font-semibold mb-3">Top campaigns</h3>
        {campaigns.length === 0 ? (
          <p className="text-sm text-slate-500">No campaign-tagged events yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="py-2">Campaign</th>
                <th className="py-2 text-right">Events</th>
                <th className="py-2 text-right">Checkouts</th>
                <th className="py-2 text-right">Purchases</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.campaign} className="border-b last:border-b-0">
                  <td className="py-2 font-medium">{c.campaign}</td>
                  <td className="py-2 text-right">{fmtNum(c.events)}</td>
                  <td className="py-2 text-right">{fmtNum(c.checkouts)}</td>
                  <td className="py-2 text-right">{fmtNum(c.purchases)}</td>
                  <td className="py-2 text-right">{fmtUSD(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default async function AdminAnalyticsPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login")
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold">Analytics</h1>
        <div className="flex gap-2">
          <Link
            href="/api/admin/analytics/events?from=30d"
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Export 30d CSV
          </Link>
          <Link
            href="/api/admin/analytics/events?from=90d"
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Export 90d CSV
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-6">
        Attribution data starts collecting from the moment PR E deploys. Historical pre-deploy
        traffic won&apos;t appear here. UTM-tagged campaigns surface in the Top campaigns table
        below once they start receiving traffic.
      </p>

      <div className="space-y-10">
        {RANGES.map((r) => (
          <RangeSection key={r.label} days={r.days} label={r.label} />
        ))}
      </div>
    </div>
  )
}
