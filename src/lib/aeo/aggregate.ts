// =============================================================================
// AEO dashboard aggregations (issue #44). Pure functions over stored rows.
// =============================================================================
// The three dimensions are never summed into one "hit". Rows written before
// the classifier split carry no `classifier_version` and are reported as
// legacy: counted, shown, and excluded from every rate, because their single
// `was_cited` flag mixed brand mentions with real citations.
//
// No imports, so it is unit-testable under Node's test runner directly.
// =============================================================================

export const CLASSIFIER_VERSION = 2

/** The subset of a stored row these aggregations read. */
export interface AggRow {
  engine: string
  prompt: string
  prompt_id: string
  prompt_category?: string
  error: string | null
  classifier_version?: number
  search_capable?: boolean
  brand_mention?: boolean
  domain_reference?: boolean
  source_citation?: boolean
}

export interface DimensionCounts {
  total: number
  brand_mentions: number
  domain_references: number
  source_citations: number
}

export interface EngineStats extends DimensionCounts {
  engine: string
  /** true / false when every classified row agrees; null when mixed or unknown. */
  search_capable: boolean | null
  legacy_probes: number
}

export interface PromptStats extends DimensionCounts {
  prompt_id: string
  prompt: string
  category: string
  legacy_probes: number
  /** Source-citation rate in percent. */
  rate: number
}

export function isClassifiedRow(r: AggRow): boolean {
  return r.classifier_version === CLASSIFIER_VERSION
}

function emptyCounts(): DimensionCounts {
  return { total: 0, brand_mentions: 0, domain_references: 0, source_citations: 0 }
}

function addRow(c: DimensionCounts, r: AggRow) {
  c.total++
  if (r.brand_mention) c.brand_mentions++
  if (r.domain_reference) c.domain_references++
  if (r.source_citation) c.source_citations++
}

export function aggregateByEngine(rows: AggRow[]): EngineStats[] {
  const map = new Map<string, EngineStats & { caps: Set<boolean> }>()
  for (const r of rows) {
    if (r.error) continue
    const m = map.get(r.engine) ?? { engine: r.engine, search_capable: null, legacy_probes: 0, caps: new Set<boolean>(), ...emptyCounts() }
    if (!isClassifiedRow(r)) {
      m.legacy_probes++
    } else {
      addRow(m, r)
      if (typeof r.search_capable === "boolean") m.caps.add(r.search_capable)
    }
    map.set(r.engine, m)
  }
  return Array.from(map.values())
    .map(({ caps, ...m }) => ({ ...m, search_capable: caps.size === 1 ? [...caps][0] : null }))
    .sort((a, b) => rate(b) - rate(a) || a.engine.localeCompare(b.engine))
}

export function aggregateBySearchCapability(rows: AggRow[]): {
  search_capable: DimensionCounts
  non_search: DimensionCounts
  legacy_probes: number
} {
  const out = { search_capable: emptyCounts(), non_search: emptyCounts(), legacy_probes: 0 }
  for (const r of rows) {
    if (r.error) continue
    if (!isClassifiedRow(r)) {
      out.legacy_probes++
      continue
    }
    addRow(r.search_capable ? out.search_capable : out.non_search, r)
  }
  return out
}

export function aggregateByPrompt(rows: AggRow[]): PromptStats[] {
  const map = new Map<string, PromptStats>()
  for (const r of rows) {
    if (r.error) continue
    const m = map.get(r.prompt_id) ?? {
      prompt_id: r.prompt_id,
      prompt: r.prompt,
      category: r.prompt_category ?? "",
      legacy_probes: 0,
      rate: 0,
      ...emptyCounts(),
    }
    if (!isClassifiedRow(r)) m.legacy_probes++
    else addRow(m, r)
    map.set(r.prompt_id, m)
  }
  return Array.from(map.values())
    .map((m) => ({ ...m, rate: rate(m) }))
    .sort((a, b) => b.rate - a.rate || b.brand_mentions - a.brand_mentions || a.prompt_id.localeCompare(b.prompt_id))
}

function rate(c: DimensionCounts): number {
  return c.total ? (c.source_citations / c.total) * 100 : 0
}
