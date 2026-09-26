import type { SearchConsoleRow } from "@/lib/search-console/client"

export type OpportunityKind =
  | "striking_distance"
  | "low_ctr"
  | "declining"
  | "content_gap"

export interface SearchOpportunity {
  kind: OpportunityKind
  query: string
  page: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  previousImpressions: number
  impressionChangePct: number | null
  priority: number
  action: string
}

type Indexed = {
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

function indexRows(rows: SearchConsoleRow[]): Map<string, Indexed> {
  const map = new Map<string, Indexed>()
  for (const row of rows) {
    const [query = "", page = ""] = row.keys
    if (!query || !page) continue
    map.set(query + "\u0000" + page, {
      query,
      page,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })
  }
  return map
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

export function buildSearchOpportunities(
  currentRows: SearchConsoleRow[],
  previousRows: SearchConsoleRow[],
  limit = 50
): SearchOpportunity[] {
  const current = indexRows(currentRows)
  const previous = indexRows(previousRows)
  const out: SearchOpportunity[] = []

  for (const [key, row] of current) {
    const prior = previous.get(key)
    const previousImpressions = prior?.impressions ?? 0
    const impressionChangePct = pctChange(row.impressions, previousImpressions)

    if (row.impressions >= 20 && row.position >= 5 && row.position <= 25) {
      const proximity = Math.max(0, 26 - row.position)
      out.push({
        kind: "striking_distance",
        ...row,
        previousImpressions,
        impressionChangePct,
        priority: Math.round(row.impressions * (1 + proximity / 20)),
        action:
          "Strengthen this existing page around the exact reader question: improve the short answer, evidence, and internal links before creating anything new.",
      })
    }

    if (row.impressions >= 30 && row.position <= 10 && row.ctr < 0.02) {
      out.push({
        kind: "low_ctr",
        ...row,
        previousImpressions,
        impressionChangePct,
        priority: Math.round(row.impressions * 1.25),
        action:
          "The page is visible but under-clicked. Test a clearer title and description that match the query without changing the page's meaning.",
      })
    }

    if (previousImpressions >= 30 && row.impressions <= previousImpressions * 0.7) {
      out.push({
        kind: "declining",
        ...row,
        previousImpressions,
        impressionChangePct,
        priority: Math.round(previousImpressions),
        action:
          "Visibility fell materially. Check freshness, internal links, intent drift, indexing, and which sources now outrank the page.",
      })
    }

    if (row.impressions >= 20 && row.position > 25) {
      out.push({
        kind: "content_gap",
        ...row,
        previousImpressions,
        impressionChangePct,
        priority: Math.round(row.impressions * 0.8),
        action:
          "Google sees some relevance but the answer is weak. Expand the page or create a focused supporting page only when the intent is genuinely distinct.",
      })
    }
  }

  const dedup = new Map<string, SearchOpportunity>()
  const kindWeight: Record<OpportunityKind, number> = {
    striking_distance: 4,
    low_ctr: 3,
    declining: 2,
    content_gap: 1,
  }

  for (const item of out) {
    const key = item.query + "\u0000" + item.page
    const existing = dedup.get(key)
    const score = item.priority + kindWeight[item.kind] * 100
    const existingScore = existing
      ? existing.priority + kindWeight[existing.kind] * 100
      : -1
    if (!existing || score > existingScore) dedup.set(key, item)
  }

  return Array.from(dedup.values())
    .sort((a, b) => b.priority - a.priority || b.impressions - a.impressions)
    .slice(0, limit)
}
