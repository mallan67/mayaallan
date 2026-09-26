export interface QueryPageMetric {
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type OpportunityKind = "near-win" | "ctr-review" | "losing-ground" | "gaining-ground"

export interface SearchOpportunity extends QueryPageMetric {
  kind: OpportunityKind
  priority: number
  reason: string
  previousClicks?: number
  previousImpressions?: number
  previousPosition?: number
}

function keyOf(row: Pick<QueryPageMetric, "query" | "page">): string {
  return `${row.query}\u0000${row.page}`
}

function priorityBase(row: QueryPageMetric): number {
  const demand = Math.log10(Math.max(row.impressions, 1) + 1) * 20
  const closeness = row.position <= 20 ? Math.max(0, 22 - row.position) * 2.5 : 0
  return Math.round(demand + closeness)
}

/**
 * Opportunity heuristics are triage rules, not ranking predictions.
 * They use only the property's own Search Console data and deliberately avoid
 * universal "expected CTR" claims.
 */
export function buildSearchOpportunities(
  current: QueryPageMetric[],
  previous: QueryPageMetric[] = [],
): SearchOpportunity[] {
  const prior = new Map(previous.map((row) => [keyOf(row), row]))
  const out: SearchOpportunity[] = []

  for (const row of current) {
    if (row.impressions < 10) continue
    const before = prior.get(keyOf(row))

    if (row.position > 4 && row.position <= 20) {
      out.push({
        ...row,
        kind: "near-win",
        priority: priorityBase(row) + 20,
        reason: "Already receiving impressions near the first page; strengthen the answer, evidence, title, and internal links before creating a new page.",
        previousClicks: before?.clicks,
        previousImpressions: before?.impressions,
        previousPosition: before?.position,
      })
    }

    if (row.position <= 10 && row.impressions >= 25 && row.ctr < 0.015) {
      out.push({
        ...row,
        kind: "ctr-review",
        priority: priorityBase(row) + 12,
        reason: "Visible in search with meaningful impressions but relatively few clicks on this property; review title/snippet alignment with the query.",
        previousClicks: before?.clicks,
        previousImpressions: before?.impressions,
        previousPosition: before?.position,
      })
    }

    if (before && before.impressions >= 10 && row.position - before.position >= 3) {
      out.push({
        ...row,
        kind: "losing-ground",
        priority: priorityBase(row) + 25,
        reason: "Average position is materially worse than the previous comparison window; inspect freshness, intent match, competitors, and technical/indexing changes.",
        previousClicks: before.clicks,
        previousImpressions: before.impressions,
        previousPosition: before.position,
      })
    }

    if (before && row.impressions >= before.impressions && before.position - row.position >= 3) {
      out.push({
        ...row,
        kind: "gaining-ground",
        priority: priorityBase(row) + 8,
        reason: "Average position improved materially; preserve the page and consider reinforcing it with related internal links and supporting content.",
        previousClicks: before.clicks,
        previousImpressions: before.impressions,
        previousPosition: before.position,
      })
    }
  }

  const dedup = new Map<string, SearchOpportunity>()
  const kindWeight: Record<OpportunityKind, number> = {
    "losing-ground": 4,
    "near-win": 3,
    "ctr-review": 2,
    "gaining-ground": 1,
  }
  for (const item of out) {
    const key = `${keyOf(item)}\u0000${item.kind}`
    const existing = dedup.get(key)
    if (!existing || item.priority > existing.priority) dedup.set(key, item)
  }

  return [...dedup.values()]
    .sort((a, b) => b.priority - a.priority || kindWeight[b.kind] - kindWeight[a.kind] || b.impressions - a.impressions)
    .slice(0, 100)
}

export function rowsToQueryPageMetrics(rows: Array<{ keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }>): QueryPageMetric[] {
  return rows
    .filter((row) => Array.isArray(row.keys) && row.keys.length >= 2)
    .map((row) => ({
      query: row.keys?.[0] ?? "",
      page: row.keys?.[1] ?? "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      ctr: Number(row.ctr) || 0,
      position: Number(row.position) || 0,
    }))
    .filter((row) => row.query.length > 0 && row.page.length > 0)
}
