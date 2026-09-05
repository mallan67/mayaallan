/**
 * Admin AEO dashboard.
 *
 * Reads weekly run JSON blobs from Vercel Blob (aeo/runs/*) populated by
 * the cron at /api/cron/aeo-track. Storage is intentionally separate from
 * the main Supabase database so AEO measurement can't affect site data.
 *
 * Three measures are kept apart and never summed (issue #44):
 *   brand mention    — author or book named in the text
 *   domain reference — the domain as plain text
 *   source citation  — a URL under the site, in the text or the engine's
 *                      citation list. Only this one is a "citation".
 *
 * Rows recorded before the classifier split are shown as legacy and excluded
 * from every rate: their single "hit" flag counted any mention.
 *
 * Auth: admin session required.
 */
import Link from "next/link"
import { isAuthenticated } from "@/lib/session"
import { redirect } from "next/navigation"
import { loadRecentRuns, allRows, type CitationRow, type AeoRun } from "@/lib/aeo/storage"
import { aggregateByEngine, aggregateBySearchCapability, aggregateByPrompt, aggregateByUrl, isClassifiedRow, type DimensionCounts } from "@/lib/aeo/aggregate"
import { RunNowButton } from "./RunNowButton"
import { CopyButton } from "./CopyButton"
import { ClearAllButton } from "./ClearAllButton"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Row = CitationRow & { run_id: string; run_at: string }

const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(1) : "0.0")

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
  const bySearch = aggregateBySearchCapability(rows)
  const byPrompt = aggregateByPrompt(rows)
  const byUrl = aggregateByUrl(rows)
  const legacyRows = rows.filter((r) => !r.error && !isClassifiedRow(r)).length
  const recentDetections = rows
    .filter((r) => isClassifiedRow(r) && (r.source_citation || r.brand_mention || r.domain_reference))
    .slice(0, 25)
  const recentErrors = aggregateErrors(rows)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">AEO Tracker</h1>
        <p className="mt-2 text-sm text-slate-600">
          Weekly probes of four AI engines with the prompts in{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">content/aeo-prompts.json</code>. Each
          response is classified three ways, kept separate: a <strong>brand mention</strong> (author or
          book named in the text), a <strong>domain reference</strong> (the domain as plain text), or a{" "}
          <strong>source citation</strong> (a URL under this site in the text or in the engine&apos;s
          citation list). Only the last one is a citation. Storage: <strong>Vercel Blob</strong>{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">aeo/runs/*.json</code>.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Only Perplexity searches the web. The Claude, ChatGPT and Gemini probes are plain model calls
          that answer from training data; a brand mention from them says nothing about what a consumer
          search product would show.
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
            probe. Any one of these env vars is enough to get started:
            <ul className="mt-2 space-y-1 text-xs">
              <li>
                <code className="bg-blue-100/50 px-1 rounded">ANTHROPIC_API_KEY</code> — direct
                Anthropic API (uses your console credit)
              </li>
              <li>
                <code className="bg-blue-100/50 px-1 rounded">AI_GATEWAY_API_KEY</code> —
                Vercel AI Gateway (unlocks all 4 engines via your Vercel credits)
              </li>
              <li>
                <code className="bg-blue-100/50 px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY</code>{" "}
                — direct Google AI Studio (free tier, often quota-limited)
              </li>
              <li>
                <code className="bg-blue-100/50 px-1 rounded">OPENAI_API_KEY</code> or{" "}
                <code className="bg-blue-100/50 px-1 rounded">PERPLEXITY_API_KEY</code> — direct
                APIs for those providers
              </li>
            </ul>
          </div>
        )}
        {legacyRows > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm">
            <strong>{legacyRows} legacy probe{legacyRows === 1 ? "" : "s"}</strong> from before the
            classifier split (September 2026) are excluded from every rate below. Their single
            &ldquo;hit&rdquo; flag counted any mention as a citation and cannot be re-classified because
            the full responses were not stored.
          </div>
        )}

        <RunNowButton />
        <ClearAllButton runCount={runs.length} />
      </header>

      {/* SEARCH-CAPABLE VS NOT */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">By search capability</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DimensionCard title="Search-capable engines (Perplexity)" counts={bySearch.search_capable} />
          <DimensionCard title="Non-search engines (Claude, ChatGPT, Gemini)" counts={bySearch.non_search} />
        </div>
      </section>

      {/* BY ENGINE */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">By engine</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Engine</th>
                <th className="text-left px-3 py-2">Searches web</th>
                <th className="text-right px-3 py-2">Probes</th>
                <th className="text-right px-3 py-2">Brand mentions</th>
                <th className="text-right px-3 py-2">Domain refs</th>
                <th className="text-right px-3 py-2">Source citations</th>
                <th className="text-right px-3 py-2">Legacy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byEngine.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500 italic">
                    No data yet.
                  </td>
                </tr>
              ) : (
                byEngine.map((e) => (
                  <tr key={e.engine}>
                    <td className="px-3 py-2 uppercase text-xs font-medium">{e.engine}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {e.search_capable === null ? "—" : e.search_capable ? "yes" : "no"}
                    </td>
                    <td className="px-3 py-2 text-right">{e.total}</td>
                    <td className="px-3 py-2 text-right">
                      {e.brand_mentions} <span className="text-slate-400">({pct(e.brand_mentions, e.total)}%)</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {e.domain_references} <span className="text-slate-400">({pct(e.domain_references, e.total)}%)</span>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {e.source_citations} <span className="text-slate-400 font-normal">({pct(e.source_citations, e.total)}%)</span>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400">{e.legacy_probes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                <th className="text-right px-3 py-2">Probes</th>
                <th className="text-right px-3 py-2">Brand</th>
                <th className="text-right px-3 py-2">Domain</th>
                <th className="text-right px-3 py-2">Source citations</th>
                <th className="text-right px-3 py-2">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((r) => {
                const legacy = r.sourceCitations === undefined
                return (
                  <tr key={r.runId}>
                    <td className="px-3 py-2">{new Date(r.runAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{r.enginesRun.join(", ")}</td>
                    <td className="px-3 py-2 text-right">{r.totalProbes}</td>
                    {legacy ? (
                      <td colSpan={3} className="px-3 py-2 text-xs text-slate-400 italic text-right">
                        legacy run: {r.citationHits} &ldquo;hits&rdquo; of any kind, not separated
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2 text-right">{r.brandMentions}</td>
                        <td className="px-3 py-2 text-right">{r.domainReferences}</td>
                        <td className="px-3 py-2 text-right font-semibold">{r.sourceCitations}</td>
                      </>
                    )}
                    <td className="px-3 py-2 text-right text-amber-700">{r.errors > 0 ? r.errors : "—"}</td>
                  </tr>
                )
              })}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500 italic">
                    No runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BY PROMPT — search-capable and non-search reported side by side, never pooled */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Prompts, by search capability</h2>
        <p className="text-xs text-slate-500 mb-3">
          The <strong>search-capable</strong> columns (Perplexity) are the search-visibility measure: an
          engine that looked at the web and pointed at this site. The <strong>non-search</strong> columns
          (Claude, ChatGPT, Gemini) show what models say from memory. The two are never combined.
          Ranked by search-capable citation rate.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2" rowSpan={2}>Prompt</th>
                <th className="text-left px-3 py-2" rowSpan={2}>Category</th>
                <th className="text-center px-3 py-1 border-l border-slate-200" colSpan={3}>Search-capable</th>
                <th className="text-center px-3 py-1 border-l border-slate-200" colSpan={3}>Non-search</th>
                <th className="text-right px-3 py-2 border-l border-slate-200" rowSpan={2}>Legacy</th>
              </tr>
              <tr>
                <th className="text-right px-3 py-1 border-l border-slate-200">Probes</th>
                <th className="text-right px-3 py-1">Brand</th>
                <th className="text-right px-3 py-1">Citations</th>
                <th className="text-right px-3 py-1 border-l border-slate-200">Probes</th>
                <th className="text-right px-3 py-1">Brand</th>
                <th className="text-right px-3 py-1">Citations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byPrompt.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500 italic">
                    No data yet.
                  </td>
                </tr>
              ) : (
                byPrompt.map((p) => (
                  <tr key={p.prompt_id}>
                    <td className="px-3 py-2 max-w-[360px] truncate">{p.prompt}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{p.category}</td>
                    <td className="px-3 py-2 text-right border-l border-slate-200">{p.search.total}</td>
                    <td className="px-3 py-2 text-right">{p.search.brand_mentions}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {p.search.source_citations}{" "}
                      <span className="text-slate-400 font-normal">({p.search.rate.toFixed(0)}%)</span>
                    </td>
                    <td className="px-3 py-2 text-right border-l border-slate-200">{p.non_search.total}</td>
                    <td className="px-3 py-2 text-right">{p.non_search.brand_mentions}</td>
                    <td className="px-3 py-2 text-right">
                      {p.non_search.source_citations}{" "}
                      <span className="text-slate-400">({p.non_search.rate.toFixed(0)}%)</span>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400 border-l border-slate-200">{p.legacy_probes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MOST-CITED URLs — counts labelled by capability, never pooled */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Cited URLs, by capability</h2>
        <p className="text-xs text-slate-500 mb-3">
          Pages an engine linked to, in the text or in its citation list. Search-capable counts are the
          search-visibility measure; non-search counts are links a model produced from memory; legacy
          counts come from rows recorded before the classifier split. Ranked by search-capable count.
        </p>
        {byUrl.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No source citations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">URL</th>
                  <th className="text-right px-3 py-2">Search-capable</th>
                  <th className="text-right px-3 py-2">Non-search</th>
                  <th className="text-right px-3 py-2">Legacy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byUrl.map((u) => (
                  <tr key={u.url}>
                    <td className="px-3 py-2 max-w-[480px] truncate">
                      <a href={u.url} className="text-blue-700 hover:underline" target="_blank" rel="noreferrer">
                        {u.url}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">{u.search}</td>
                    <td className="px-3 py-2 text-right">{u.non_search}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{u.legacy || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RECENT ERRORS */}
      {recentErrors.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent errors</h2>
          <p className="text-xs text-slate-500 mb-3">
            Grouped by engine + error message. Click to expand. If every probe of an engine
            errored, the cause is usually the API key, the model name, or a quota limit.
          </p>
          <div className="space-y-2">
            {recentErrors.map((e, i) => {
              const preview = (e.message.split("\n")[0] ?? "").slice(0, 140)
              return (
                <details
                  key={`${e.engine}-${i}`}
                  className="group border border-red-200 rounded-lg bg-red-50/40 text-sm overflow-hidden"
                >
                  <summary className="cursor-pointer list-none px-3 py-2 flex items-center gap-2 hover:bg-red-50">
                    <span className="px-2 py-0.5 bg-slate-100 rounded font-medium uppercase text-xs text-slate-600">
                      {e.engine}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">×{e.count}</span>
                    <span className="text-xs text-red-900 truncate flex-1 font-mono">
                      {preview}
                    </span>
                    <span className="text-slate-400 group-open:rotate-90 transition-transform text-base shrink-0">
                      ›
                    </span>
                  </summary>
                  <div className="px-3 pb-3 pt-1 border-t border-red-200/60">
                    <div className="flex justify-end mb-1">
                      <CopyButton text={e.message} ariaLabel="Copy error message" />
                    </div>
                    <pre className="text-xs text-red-900 whitespace-pre-wrap break-words font-mono">
                      {e.message}
                    </pre>
                  </div>
                </details>
              )
            })}
          </div>
        </section>
      )}

      {/* RECENT RESPONSES */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent responses</h2>
        <p className="text-xs text-slate-500 mb-3">
          What engines actually said, labelled by what was detected. Read the label before the quote.
        </p>
        <div className="space-y-4">
          {recentDetections.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Nothing detected yet.</p>
          ) : (
            recentDetections.map((r, i) => (
              <article key={`${r.run_id}-${i}`} className="p-4 border border-slate-200 rounded-xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 rounded font-medium uppercase">{r.engine}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">
                    {r.search_capable ? "searches web" : "no search"}
                  </span>
                  {r.source_citation && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-medium">source citation</span>
                  )}
                  {r.brand_mention && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-medium">brand mention</span>
                  )}
                  {r.domain_reference && (
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-900 rounded font-medium">domain reference</span>
                  )}
                  <span className="font-medium text-slate-700 truncate">{r.prompt}</span>
                  <span className="ml-auto whitespace-nowrap">{new Date(r.run_at).toLocaleDateString()}</span>
                </div>
                {r.excerpt && (
                  <p className="text-sm text-slate-700 leading-relaxed italic">&ldquo;{r.excerpt}&rdquo;</p>
                )}
                {r.cited_urls && r.cited_urls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.cited_urls.map((u) => (
                      <a key={u} href={u} target="_blank" rel="noreferrer" className="text-xs text-blue-700 hover:underline">
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

function DimensionCard({ title, counts }: { title: string; counts: DimensionCounts }) {
  return (
    <div className="p-4 border border-slate-200 rounded-xl">
      <div className="text-xs uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xl font-bold text-slate-900">{pct(counts.source_citations, counts.total)}%</div>
          <div className="text-[11px] text-slate-500">source citations</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-slate-700">{pct(counts.brand_mentions, counts.total)}%</div>
          <div className="text-[11px] text-slate-500">brand mentions</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-slate-700">{pct(counts.domain_references, counts.total)}%</div>
          <div className="text-[11px] text-slate-500">domain refs</div>
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-2">{counts.total} classified probe{counts.total === 1 ? "" : "s"}</div>
    </div>
  )
}

function aggregateErrors(rows: Row[]): Array<{ engine: string; message: string; count: number }> {
  const map = new Map<string, { engine: string; message: string; count: number }>()
  for (const r of rows) {
    if (!r.error) continue
    const key = `${r.engine}::${r.error}`
    const existing = map.get(key)
    if (existing) existing.count++
    else map.set(key, { engine: r.engine, message: r.error, count: 1 })
  }
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}
