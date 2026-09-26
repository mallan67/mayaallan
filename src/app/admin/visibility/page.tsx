import Link from "next/link"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/session"
import { querySearchConsole, searchConsoleConfiguration, type SearchConsoleRow } from "@/lib/search-console/client"
import { buildSearchOpportunities } from "@/lib/search-console/opportunities"
import { loadRecentRuns, allRows } from "@/lib/aeo/storage"
import { aggregateExternalSources } from "@/lib/aeo/source-gaps"
import { loadCrawlerSummary } from "@/lib/crawler-telemetry"
import { entityReadiness } from "@/lib/visibility/entity-readiness"
import { visualAssetReadiness } from "@/lib/visibility/visual-readiness"
import { VISIBILITY_GRAPH, suggestRelatedNodes } from "@/lib/visibility/topic-graph"
import { EVIDENCE_REGISTRY } from "@/lib/visibility/evidence-registry"
import { loadPrompts } from "@/lib/aeo/prompts"
import { engineReadiness } from "@/lib/aeo/engines"
import { CoveragePanel } from "./CoveragePanel"

export const dynamic = "force-dynamic"
export const revalidate = 0

function iso(daysAgo: number) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export default async function VisibilityPage() {
  if (!(await isAuthenticated())) redirect("/admin/login")

  const config = searchConsoleConfiguration()
  let current: SearchConsoleRow[] = []
  let previous: SearchConsoleRow[] = []
  let searchError: string | null = null

  if (config.configured) {
    try {
      ;[current, previous] = await Promise.all([
        querySearchConsole({
          startDate: iso(29),
          endDate: iso(2),
          dimensions: ["query", "page"],
          rowLimit: 10000,
        }),
        querySearchConsole({
          startDate: iso(57),
          endDate: iso(30),
          dimensions: ["query", "page"],
          rowLimit: 10000,
        }),
      ])
    } catch (error) {
      searchError = error instanceof Error ? error.message : String(error)
    }
  }

  const opportunities = buildSearchOpportunities(current, previous, 30)
  const aeoRows = allRows(await loadRecentRuns(12))
  const grounded = aeoRows.filter((row) => row.classifier_version === 2 && row.search_capable && !row.error)
  const groundedCitations = grounded.filter((row) => row.source_citation).length
  const gaps = aggregateExternalSources(aeoRows).slice(0, 12)
  const crawlers = await loadCrawlerSummary(14)
  const readiness = entityReadiness()
  const visuals = await visualAssetReadiness()
  const prompts = await loadPrompts()
  const graphLinks = VISIBILITY_GRAPH.reduce((sum, node) => sum + node.requiredLinks.length, 0)
  const promptIntents = new Set(prompts.map((prompt) => prompt.intent).filter(Boolean)).size
  const visualReadyCount = visuals.filter((item) => item.ready).length
  const readinessItems = [...readiness.entity, ...readiness.google]
  const engineModes = engineReadiness()
  const linkSuggestions = VISIBILITY_GRAPH.flatMap((node) =>
    suggestRelatedNodes(node.id, 2).map((target) => ({
      from: node.path,
      to: target.path,
      sharedTopics: target.topics.filter((topic) => node.topics.includes(topic)),
    }))
  ).slice(0, 12)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Visibility Command Center</h1>
        <p className="text-sm text-slate-600 mt-2">
          Google search demand, grounded AI-search visibility, citation gaps and the action queue.
        </p>
      </div>

      <section className="grid md:grid-cols-3 gap-3">
        <Metric label="Search opportunities" value={String(opportunities.length)} />
        <Metric
          label="Grounded AI citation rate"
          value={pct(grounded.length ? groundedCitations / grounded.length : 0)}
        />
        <Metric label="Citation-gap domains" value={String(gaps.length)} />
      </section>

      <CoveragePanel
        graphNodes={VISIBILITY_GRAPH.length}
        graphLinks={graphLinks}
        evidenceRecords={EVIDENCE_REGISTRY.length}
        prompts={prompts.length}
        promptIntents={promptIntents}
        visualReady={visualReadyCount}
        visualTotal={visuals.length}
        readiness={readinessItems}
      />

      <section>
        <h2 className="text-lg font-semibold mb-3">AEO engine modes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {engineModes.map((item) => (
            <div key={item.engine} className="border border-slate-200 rounded-xl bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium capitalize">{item.engine}</span>
                <span className={
                  item.mode === "grounded-search"
                    ? "text-xs text-emerald-700"
                    : item.mode === "model-memory"
                      ? "text-xs text-amber-700"
                      : "text-xs text-slate-400"
                }>
                  {item.mode.replace("-", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Google Search Console</h2>
        {!config.configured ? (
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm">
            API connection is ready in code. Missing Vercel environment values: {config.missing.join(", ")}.
          </div>
        ) : searchError ? (
          <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm">{searchError}</div>
        ) : (
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            {opportunities.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No opportunities meet the current thresholds yet.</p>
            ) : (
              <div className="divide-y">
                {opportunities.map((item) => (
                  <div key={item.query + item.page} className="p-4 grid md:grid-cols-[1fr_auto] gap-3">
                    <div>
                      <div className="font-medium">{item.query}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {item.kind.replaceAll("_", " ")} · {item.impressions} impressions · position {item.position.toFixed(1)} · CTR {pct(item.ctr)}
                      </div>
                      <p className="text-xs text-slate-600 mt-2">{item.action}</p>
                    </div>
                    <a href={item.page} target="_blank" rel="noreferrer" className="text-xs text-blue-700 hover:underline">
                      Open page
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="border border-slate-200 rounded-xl bg-white p-4">
        <h2 className="font-semibold">Internal-link opportunities</h2>
        <p className="text-xs text-slate-500 mt-1">
          Suggestions come from shared topics in the visibility graph. They are review cues, not proof that a rendered page is missing the link, and they are never inserted automatically.
        </p>
        {linkSuggestions.length === 0 ? (
          <p className="text-sm text-slate-500 mt-3">No additional graph-based link suggestions.</p>
        ) : (
          <div className="mt-3 divide-y">
            {linkSuggestions.map((item) => (
              <div key={item.from + "->" + item.to} className="py-2 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <span className="break-all">{item.from} → {item.to}</span>
                <span className="text-xs text-slate-500">{item.sharedTopics.join(", ")}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-slate-200 rounded-xl bg-white p-4">
        <h2 className="font-semibold">Crawler activity · last 14 days</h2>
        <p className="text-xs text-slate-500 mt-1">
          User-agent-identified bot name and public pathname only. These counts are not IP-verified crawler identity. No IP addresses, query strings, or human visitor data are stored.
        </p>
        {crawlers.length === 0 ? (
          <p className="text-sm text-slate-500 mt-3">No tracked crawler hits yet, or Upstash is not configured.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {crawlers.map((crawler) => (
              <div key={crawler.name} className="border border-slate-100 rounded-lg p-3">
                <div className="flex justify-between gap-3">
                  <span className="font-medium text-sm">{crawler.name}</span>
                  <span className="text-sm">{crawler.hits}</span>
                </div>
                <div className="mt-2 space-y-1">
                  {crawler.paths.slice(0, 4).map((row) => (
                    <div key={row.path} className="flex justify-between gap-2 text-[11px] text-slate-500">
                      <span className="truncate">{row.path}</span>
                      <span>{row.hits}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="border border-slate-200 rounded-xl bg-white p-4">
          <h2 className="font-semibold">Grounded AI search</h2>
          <p className="text-sm text-slate-600 mt-2">
            {groundedCitations} Maya citations across {grounded.length} grounded probes.
          </p>
          <Link href="/admin/aeo" className="text-xs text-blue-700 hover:underline mt-3 inline-block">
            Open AI Search details →
          </Link>
        </div>
        <div className="border border-slate-200 rounded-xl bg-white p-4">
          <h2 className="font-semibold">Citation gaps</h2>
          <div className="mt-3 space-y-2">
            {gaps.length === 0 ? (
              <p className="text-sm text-slate-500">No grounded source data yet.</p>
            ) : gaps.map((source) => (
              <div key={source.host} className="flex justify-between gap-3 text-sm">
                <span>{source.host}</span>
                <span className="text-xs text-slate-500">{source.prompts} prompts · {source.urls} URLs</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="text-2xl font-serif font-semibold mt-1">{value}</div>
    </div>
  )
}
