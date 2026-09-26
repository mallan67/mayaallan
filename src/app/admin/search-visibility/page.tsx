import Link from "next/link"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/session"
import { isSearchConsoleConfigured, searchConsoleSiteUrl } from "@/lib/search-console/client"
import { loadLatestSearchConsoleSnapshot } from "@/lib/search-console/storage"
import { SearchConsoleSyncButton } from "./SearchConsoleSyncButton"

export const dynamic = "force-dynamic"
export const revalidate = 0

const pct = (value: number) => `${(value * 100).toFixed(1)}%`
const num = (value: number) => value.toLocaleString("en-US")

export default async function SearchVisibilityPage() {
  if (!(await isAuthenticated())) redirect("/admin/login")

  const configured = isSearchConsoleConfigured()
  const snapshot = await loadLatestSearchConsoleSnapshot()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Search Visibility</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          First-party Google Search Console data for {searchConsoleSiteUrl()}. This page uses Google&apos;s
          own impressions, clicks, CTR, average position, sitemap state, and URL Inspection output.
          Opportunity labels are triage heuristics, not ranking predictions.
        </p>
        <div className="mt-4">
          <SearchConsoleSyncButton configured={configured} />
        </div>
      </header>

      {!configured && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>One-time Google API connection still required.</strong>
          <p className="mt-2">
            Enable the Search Console API in Google Cloud, create an OAuth service-account credential,
            add that service-account email as a user on the Search Console property, then set
            <code className="mx-1 bg-white/70 px-1 rounded">GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</code>,
            <code className="mx-1 bg-white/70 px-1 rounded">GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY</code>, and
            <code className="mx-1 bg-white/70 px-1 rounded">GOOGLE_SEARCH_CONSOLE_SITE_URL</code> in Vercel.
          </p>
        </section>
      )}

      {!snapshot ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No Search Console snapshot has been stored yet. Once credentials are configured, click
          <strong> Sync Search Console now</strong>; afterward the daily cron keeps this page current.
        </section>
      ) : (
        <>
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Current search window</h2>
                <p className="text-xs text-slate-500">
                  {snapshot.period.startDate} → {snapshot.period.endDate} · snapshot {new Date(snapshot.fetchedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric title="Tracked query/page rows" value={num(snapshot.current.length)} />
              <Metric title="Pages with impressions" value={num(snapshot.pages.length)} />
              <Metric title="Opportunities" value={num(snapshot.opportunities.length)} />
              <Metric
                title="Indexed critical URLs"
                value={`${snapshot.inspections.filter((item) => item.verdict === "PASS").length}/${snapshot.inspections.length}`}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Priority opportunities</h2>
            <p className="text-xs text-slate-500 mb-3">
              Built from this site&apos;s own Search Console data. Prioritize pages already earning impressions before
              producing speculative new content.
            </p>
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Query</th>
                    <th className="text-left px-3 py-2">Page</th>
                    <th className="text-right px-3 py-2">Impr.</th>
                    <th className="text-right px-3 py-2">Clicks</th>
                    <th className="text-right px-3 py-2">CTR</th>
                    <th className="text-right px-3 py-2">Pos.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {snapshot.opportunities.slice(0, 40).map((item, index) => (
                    <tr key={`${item.kind}-${item.query}-${item.page}-${index}`}>
                      <td className="px-3 py-2 text-xs font-medium">{item.kind}</td>
                      <td className="px-3 py-2 max-w-[300px]">{item.query}</td>
                      <td className="px-3 py-2 max-w-[300px] truncate">
                        <a href={item.page} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                          {item.page.replace("https://www.mayaallan.com", "") || "/"}
                        </a>
                        <div className="text-[11px] text-slate-400 mt-1">{item.reason}</div>
                      </td>
                      <td className="px-3 py-2 text-right">{num(item.impressions)}</td>
                      <td className="px-3 py-2 text-right">{num(item.clicks)}</td>
                      <td className="px-3 py-2 text-right">{pct(item.ctr)}</td>
                      <td className="px-3 py-2 text-right">{item.position.toFixed(1)}</td>
                    </tr>
                  ))}
                  {snapshot.opportunities.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-500 italic">No opportunity rows met the current triage thresholds.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Critical URL index state</h2>
            <div className="grid gap-3">
              {snapshot.inspections.map((item) => (
                <div key={item.url} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-blue-700 hover:underline">
                      {item.url.replace("https://www.mayaallan.com", "") || "/"}
                    </a>
                    <span className={`text-xs px-2 py-0.5 rounded ${item.verdict === "PASS" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {item.verdict ?? (item.error ? "error" : "unknown")}
                    </span>
                    {item.coverageState && <span className="text-xs text-slate-500">{item.coverageState}</span>}
                    {item.lastCrawlTime && <span className="text-xs text-slate-400">last crawl {new Date(item.lastCrawlTime).toLocaleDateString()}</span>}
                  </div>
                  {item.error && <p className="text-xs text-red-700 mt-2">{item.error}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <strong>Google generative-AI Search report:</strong> Google now exposes a dedicated generative-AI
            performance report in Search Console. The standard Search Console API does not currently document
            a dedicated endpoint for that new report, so this dashboard does not fabricate one. Review/export it
            in Search Console until Google documents API access for it.
          </section>
        </>
      )}

      <footer className="text-xs text-slate-400 border-t border-slate-100 pt-6">
        <Link href="/admin/aeo" className="hover:text-slate-700">AI citation tracker →</Link>
      </footer>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}
