import Link from "next/link"

// =============================================================================
// CitedStat — inline statistic with attribution.
// =============================================================================
// Research (ConvertMate GEO Benchmark 2026, replicating Princeton's GEO
// study) found pages with statistics + cited authoritative external sources
// get +30-40% AI citation lift. This component is the standard way to embed
// one inline in a scenario or article.
//
// USAGE in a scenario page or any server component:
//
//   <CitedStat
//     stat="44.2% of LLM citations"
//     description="come from the first 30% of the text"
//     source="ConvertMate GEO Benchmark, 2026"
//     sourceUrl="https://www.convertmate.io/research/geo-benchmark-2026"
//   />
//
// Emits inline-friendly markup AND a Citation entry in JSON-LD via the
// citedStatToCitation() helper (call once per page with all stats and pass
// the result to your Article schema's `citation` field).
// =============================================================================

export interface CitedStatProps {
  /** The headline number/phrase. Bolded. e.g. "44.2% of LLM citations" */
  stat: string
  /** The rest of the sentence. e.g. "come from the first 30% of the text" */
  description: string
  /** Source attribution. e.g. "ConvertMate GEO Benchmark, 2026" */
  source: string
  /** Optional URL to the source. Renders as a small link. */
  sourceUrl?: string
}

export function CitedStat({ stat, description, source, sourceUrl }: CitedStatProps) {
  return (
    <aside
      className="my-6 p-4 sm:p-5 border-l-4 border-amber-400 bg-amber-50/40 rounded-r-lg"
      // data-cited-stat lets you find every stat on a page from JS if you
      // ever want to auto-generate a "Sources" section.
      data-cited-stat
    >
      <p className="text-base text-slate-800 leading-relaxed">
        <strong className="font-semibold">{stat}</strong> {description}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Source:{" "}
        {sourceUrl ? (
          <Link
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            {source}
          </Link>
        ) : (
          source
        )}
      </p>
    </aside>
  )
}

/**
 * Convert an array of CitedStatProps into a schema.org Citation[] array
 * suitable for embedding in Article schema's `citation` field. This is what
 * makes AI engines see the inline citations as structured data — and the
 * Princeton GEO research found that this is what produces the citation lift.
 *
 * USAGE in a server component that emits Article schema:
 *
 *   const stats = [
 *     { stat: "...", description: "...", source: "...", sourceUrl: "https://..." },
 *   ]
 *   const articleSchema = {
 *     ...generateArticleSchema({ ... }),
 *     citation: citedStatToCitation(stats),
 *   }
 */
export function citedStatToCitation(stats: CitedStatProps[]) {
  return stats.map((s) => ({
    "@type": "CreativeWork",
    name: s.source,
    ...(s.sourceUrl && { url: s.sourceUrl }),
  }))
}
