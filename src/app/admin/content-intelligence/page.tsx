import fs from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/session"
import { evidenceCoverageByPage, loadEvidenceRegistry } from "@/lib/visibility/evidence"
import { internalLinkRecommendations, loadTopicGraph } from "@/lib/visibility/topic-graph"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function editorialQueue(): Promise<Array<{ path: string; priority: string; reason: string; action: string }>> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "content", "visibility", "editorial-review.json"), "utf8")
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.items) ? parsed.items : []
  } catch {
    return []
  }
}

export default async function ContentIntelligencePage() {
  if (!(await isAuthenticated())) redirect("/admin/login")

  const [graph, linkRecommendations, evidence, coverage, review] = await Promise.all([
    loadTopicGraph(),
    internalLinkRecommendations(),
    loadEvidenceRegistry(),
    evidenceCoverageByPage(),
    editorialQueue(),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Content Intelligence</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Topic graph, evidence provenance, internal-link opportunities, and editorial-risk checks.
          This is the content layer behind SEO/AEO; it does not auto-publish generated articles.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric title="Graph nodes" value={String(graph.nodes.length)} />
        <Metric title="Explicit relationships" value={String(graph.edges.length)} />
        <Metric title="Evidence claims" value={String(evidence.length)} />
        <Metric title="Editorial reviews" value={String(review.length)} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Editorial review before amplification</h2>
        <div className="space-y-3">
          {review.map((item) => (
            <article key={item.path} className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Link href={item.path} target="_blank" className="font-medium text-amber-950 hover:underline">
                  {item.path}
                </Link>
                <span className="text-[10px] uppercase tracking-wide bg-amber-200/70 px-2 py-0.5 rounded">{item.priority}</span>
              </div>
              <p className="text-sm text-amber-900 mt-2">{item.reason}</p>
              <p className="text-xs text-amber-800 mt-2"><strong>Next:</strong> {item.action}</p>
            </article>
          ))}
          {review.length === 0 && <p className="text-sm text-slate-500 italic">No content is currently flagged.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Evidence coverage</h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="text-left px-3 py-2">Page</th><th className="text-right px-3 py-2">Claims</th><th className="text-right px-3 py-2">Sources</th><th className="text-left px-3 py-2">Evidence status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coverage.map((item) => (
                <tr key={item.page}>
                  <td className="px-3 py-2"><Link href={item.page} target="_blank" className="text-blue-700 hover:underline">{item.page}</Link></td>
                  <td className="px-3 py-2 text-right">{item.claims}</td>
                  <td className="px-3 py-2 text-right">{item.sources}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{item.statuses.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Internal-link opportunities</h2>
        <p className="text-xs text-slate-500 mb-3">
          Suggested from shared topic coverage where no explicit graph edge exists. These are review suggestions,
          not automatic links; editorial context still decides whether a link belongs in the page.
        </p>
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="text-left px-3 py-2">From</th><th className="text-left px-3 py-2">To</th><th className="text-left px-3 py-2">Shared topic</th><th className="text-right px-3 py-2">Score</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {linkRecommendations.slice(0, 40).map((item) => (
                <tr key={`${item.from.id}->${item.to.id}`}>
                  <td className="px-3 py-2">{item.from.path}</td>
                  <td className="px-3 py-2">{item.to.path}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{item.sharedTopics.join(", ")}</td>
                  <td className="px-3 py-2 text-right">{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-xs text-slate-400 border-t border-slate-100 pt-6">
        Registry files live in <code>content/visibility/</code> so GitHub remains the source of truth.
      </footer>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{title}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>
}
