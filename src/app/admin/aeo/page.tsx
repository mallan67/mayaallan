/**
 * Admin AEO dashboard — "what actually works" tracker.
 *
 * Reads weekly run JSON blobs from Vercel Blob (aeo/runs/*) populated by
 * the cron at /api/cron/aeo-track. Storage is intentionally separate from
 * the main Supabase database so AEO measurement can't affect site data.
 *
 * Shows:
 *   - Citation rate by engine (last ~6 months)
 *   - Recent runs (with hit count + error count)
 *   - Prompts ranked by citation rate
 *   - Most-cited URLs (which scenarios catch on)
 *   - Recent excerpts (what AI engines actually said)
 *
 * Auth: admin session required.
 */
import Link from "next/link"
import { isAuthenticated } from "@/lib/session"
import { redirect } from "next/navigation"
import { loadRecentRuns, allRows, type CitationRow, type AeoRun } from "@/lib/aeo/storage"
import { RunNowButton } from "./RunNowButton"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Row = CitationRow & { run_id: string; run_at: string }

export default async function AeoDashboardPage() {
  const authed = await isAuthenticated()
  if (!authed) redirect("/admin/login")

  let runs: AeoRun[] = []
  let fetchError: string | null = null
  try {
    runs = await loadRecentRuns(30)
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err)
  }

  const rows: Row[] = allRows(runs)

  const byEngine = aggregateByEngine(rows)
  const byPrompt = aggregateByPrompt(rows)
  const byUrl = aggregateByUrl(rows)
  const recentHits = rows.filter((r) => r.was_cited).slice(0, 25)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">AEO Tracker</h1>
        <p className="mt-2 text-sm text-slate-600">
          Weekly probes of major AI engines (ChatGPT, Claude, Perplexity, Gemini) to measure
          which queries surface this site as a cited source. Storage:{" "}
          <strong>Vercel Blob</strong>{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">aeo/runs/*.json</code> — separate
          from your Supabase data.
        </p>
        {fetchError && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <strong>Could not load runs from Blob:</strong> {fetchError}
            <br />
            <span className="text-xs">
              Make sure <code>BLOB_READ_WRITE_TOKEN</code> is set in Vercel env.
            </span>
          </div>
        )}
        {!fetchError && runs.length === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-sm">
            <strong>No runs yet.</strong> Click <em>Run now</em> below to trigger your first
            probe. Requires at least one AI engine key set in Vercel env —
            <code className="bg-blue-100/50 px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY</code> is
            free and the only one you need to get started.
          </div>
        )}

        {/* Trigger a probe from the dashboard — no terminal needed. */}
        <RunNowButton />
      </header>

      {/* CITATION RATE BY ENGINE */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Citation rate by engine</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {byEngine.length === 0 ? (
            <p className="text-sm text-slate-500 col-span-full italic">No data yet.</p>
          ) : (
            byEngine.map((e) => (
              <div key={e.engine} className="p-4 border border-slate-200 rounded-xl">
                <div className="text-xs uppercase tracking-wider text-slate-500">{e.engine}</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{e.rate.toFixed(1)}%</div>
                <div className="text-xs text-slate-500 mt-1">
                  {e.hits} / {e.total} probes cited
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* RECENT RUNS */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent runs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Run</th>
                <th className="text-left px-3 py-2">Engines</th>
                <th className="text-left px-3 py-2">Probes</th>
                <th className="text-left px-3 py-2">Hits</th>
                <th className="text-left px-3 py-2">Rate</th>
                <th className="text-left px-3 py-2">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((r) => (
                <tr key={r.runId}>
                  <td className="px-3 py-2">{new Date(r.runAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{r.enginesRun.join(", ")}</td>
                  <td className="px-3 py-2">{r.totalProbes}</td>
                  <td className="px-3 py-2 font-semibold">{r.citationHits}</td>
                  <td className="px-3 py-2">
                    {r.totalProbes ? ((r.citationHits / r.totalProbes) * 100).toFixed(1) : "0.0"}%
                  </td>
                  <td className="px-3 py-2 text-amber-700">{r.errors > 0 ? r.errors : "—"}</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500 italic">
                    No runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CITATION RATE BY PROMPT */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Prompts ranked by citation rate</h2>
        <p className="text-xs text-slate-500 mb-3">
          High-rate prompts = the queries you&apos;re winning. Zero-rate prompts = either your
          weakest content area or your highest-leverage growth target.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Prompt</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-left px-3 py-2">Hits</th>
                <th className="text-left px-3 py-2">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byPrompt.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500 italic">
                    No data yet.
                  </td>
                </tr>
              ) : (
                byPrompt.map((p) => (
                  <tr key={p.promptId}>
                    <td className="px-3 py-2 max-w-[400px] truncate">{p.prompt}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{p.category}</td>
                    <td className="px-3 py-2">
                      {p.hits} / {p.total}
                    </td>
                    <td className="px-3 py-2 font-semibold">{p.rate.toFixed(1)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MOST-CITED URLs */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Most-cited URLs</h2>
        <p className="text-xs text-slate-500 mb-3">
          Pages that AI engines linked to in responses. These are working — write more like them.
        </p>
        {byUrl.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No URL citations yet.</p>
        ) : (
          <ul className="space-y-2">
            {byUrl.map((u) => (
              <li key={u.url} className="flex justify-between gap-4 text-sm border-b border-slate-100 pb-2">
                <a href={u.url} className="text-blue-700 hover:underline truncate" target="_blank" rel="noreferrer">
                  {u.url}
                </a>
                <span className="font-semibold text-slate-700 shrink-0">
                  {u.count} cite{u.count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RECENT HITS */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent excerpts</h2>
        <p className="text-xs text-slate-500 mb-3">
          What AI engines actually said when they cited us. Read these — they tell you how the
          site is being framed.
        </p>
        <div className="space-y-4">
          {recentHits.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No citation hits yet.</p>
          ) : (
            recentHits.map((r, i) => (
              <article key={`${r.run_id}-${i}`} className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 rounded font-medium uppercase">
                    {r.engine}
                  </span>
                  <span className="font-medium text-slate-700 truncate">{r.prompt}</span>
                  <span className="ml-auto whitespace-nowrap">
                    {new Date(r.run_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">&ldquo;{r.excerpt}&rdquo;</p>
                {r.cited_urls && r.cited_urls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.cited_urls.map((u) => (
                      <a
                        key={u}
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-700 hover:underline"
                      >
                        {u}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <footer className="text-xs text-slate-400 pt-6 border-t border-slate-100">
        <Link href="/admin" className="hover:text-slate-700">
          ← Back to admin
        </Link>
      </footer>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Aggregations (run client-side on the flattened rows — fine for our scale)
// -----------------------------------------------------------------------------

function aggregateByEngine(rows: Row[]) {
  const map = new Map<string, { hits: number; total: number }>()
  for (const r of rows) {
    if (r.error) continue
    const m = map.get(r.engine) ?? { hits: 0, total: 0 }
    m.total++
    if (r.was_cited) m.hits++
    map.set(r.engine, m)
  }
  return Array.from(map.entries())
    .map(([engine, { hits, total }]) => ({
      engine,
      hits,
      total,
      rate: total ? (hits / total) * 100 : 0,
    }))
    .sort((a, b) => b.rate - a.rate)
}

function aggregateByPrompt(rows: Row[]) {
  const map = new Map<string, { prompt: string; category: string; hits: number; total: number }>()
  for (const r of rows) {
    if (r.error) continue
    const m = map.get(r.prompt_id) ?? {
      prompt: r.prompt,
      category: r.prompt_category ?? "",
      hits: 0,
      total: 0,
    }
    m.total++
    if (r.was_cited) m.hits++
    map.set(r.prompt_id, m)
  }
  return Array.from(map.entries())
    .map(([promptId, m]) => ({ promptId, ...m, rate: m.total ? (m.hits / m.total) * 100 : 0 }))
    .sort((a, b) => b.rate - a.rate)
}

function aggregateByUrl(rows: Row[]) {
  const map = new Map<string, number>()
  for (const r of rows) {
    for (const u of r.cited_urls ?? []) {
      map.set(u, (map.get(u) ?? 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
}
