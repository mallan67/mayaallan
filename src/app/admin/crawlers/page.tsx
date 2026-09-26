import Link from "next/link"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const revalidate = 0

type CrawlerRow = {
  created_at: string
  path: string | null
  properties: Record<string, unknown> | null
}

function stringProp(row: CrawlerRow, key: string): string {
  const value = row.properties?.[key]
  return typeof value === "string" ? value : ""
}

export default async function CrawlerVisibilityPage() {
  if (!(await isAuthenticated())) redirect("/admin/login")

  const { data, error } = await supabaseAdmin
    .from("marketing_events")
    .select("created_at, path, properties")
    .eq("event_name", "crawler_visit")
    .order("created_at", { ascending: false })
    .limit(5000)

  const rows = (data ?? []) as CrawlerRow[]
  const byCrawler = new Map<string, number>()
  const byPath = new Map<string, number>()
  for (const row of rows) {
    const crawler = stringProp(row, "crawler") || "unknown"
    const path = row.path || "/"
    byCrawler.set(crawler, (byCrawler.get(crawler) ?? 0) + 1)
    byPath.set(path, (byPath.get(path) ?? 0) + 1)
  }
  const crawlers = [...byCrawler.entries()].sort((a, b) => b[1] - a[1])
  const paths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Crawler Visibility</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          First-party observations of recognized search/AI crawler user agents reaching public pages.
          Logging is asynchronous in Next.js Proxy and does not block page delivery. A user agent is
          evidence of a request that identified itself that way, not cryptographic proof of crawler identity.
        </p>
      </header>

      {!process.env.CRAWLER_TELEMETRY_SECRET && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Crawler telemetry is not active yet.</strong> Set
          <code className="mx-1 bg-white/70 px-1 rounded">CRAWLER_TELEMETRY_SECRET</code> in Vercel to any
          long random secret. Proxy and the ingest route use it only to authenticate the internal event write.
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error.message}</div>}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric title="Recent crawler requests" value={rows.length.toLocaleString()} />
        <Metric title="Crawler types" value={String(crawlers.length)} />
        <Metric title="Public paths crawled" value={String(byPath.size)} />
        <Metric title="OAI-SearchBot" value={String(byCrawler.get("OAI-SearchBot") ?? 0)} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          <h2 className="px-4 py-3 bg-slate-50 font-semibold text-sm">By crawler</h2>
          <div className="divide-y divide-slate-100">
            {crawlers.map(([name, count]) => (
              <div key={name} className="px-4 py-2 flex justify-between text-sm">
                <span>{name}</span><span className="font-medium">{count}</span>
              </div>
            ))}
            {crawlers.length === 0 && <p className="p-4 text-sm text-slate-500 italic">No recognized crawler visits recorded yet.</p>}
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          <h2 className="px-4 py-3 bg-slate-50 font-semibold text-sm">Most-crawled public paths</h2>
          <div className="divide-y divide-slate-100">
            {paths.map(([path, count]) => (
              <div key={path} className="px-4 py-2 flex gap-3 text-sm">
                <Link href={path} target="_blank" className="truncate flex-1 text-blue-700 hover:underline">{path}</Link>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {paths.length === 0 && <p className="p-4 text-sm text-slate-500 italic">No path data yet.</p>}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent recognized requests</h2>
        <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
          {rows.slice(0, 50).map((row, index) => (
            <div key={`${row.created_at}-${row.path}-${index}`} className="px-4 py-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <span className="font-medium">{stringProp(row, "crawler") || "unknown"}</span>
              <span className="text-slate-500">{row.path || "/"}</span>
              <span className="ml-auto text-slate-400">{new Date(row.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{title}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>
}
