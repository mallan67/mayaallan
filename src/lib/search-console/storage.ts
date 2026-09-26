import "server-only"
import { put, list } from "@vercel/blob"
import type { SearchOpportunity, QueryPageMetric } from "@/lib/search-console/opportunities"

const PREFIX = "search-console/runs/"

export interface UrlInspectionSummary {
  url: string
  verdict?: string
  coverageState?: string
  indexingState?: string
  pageFetchState?: string
  robotsTxtState?: string
  lastCrawlTime?: string
  googleCanonical?: string
  userCanonical?: string
  error?: string
}

export interface SearchConsoleSnapshot {
  fetchedAt: string
  siteUrl: string
  period: { startDate: string; endDate: string }
  previousPeriod: { startDate: string; endDate: string }
  current: QueryPageMetric[]
  previous: QueryPageMetric[]
  opportunities: SearchOpportunity[]
  pages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>
  daily: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>
  imagePages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>
  searchAppearances: Array<{ appearance: string; clicks: number; impressions: number; ctr: number; position: number }>
  sitemaps: unknown[]
  inspections: UrlInspectionSummary[]
}

export async function saveSearchConsoleSnapshot(snapshot: SearchConsoleSnapshot): Promise<string> {
  const day = snapshot.fetchedAt.slice(0, 10)
  const result = await put(`${PREFIX}${day}.json`, JSON.stringify(snapshot), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  return result.url
}

export async function loadLatestSearchConsoleSnapshot(): Promise<SearchConsoleSnapshot | null> {
  try {
    const result = await list({ prefix: PREFIX, limit: 100 })
    const latest = [...result.blobs].sort((a, b) => (a.pathname < b.pathname ? 1 : -1))[0]
    if (!latest) return null
    const res = await fetch(latest.url, { cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as SearchConsoleSnapshot
  } catch (err) {
    console.warn("[search-console] Unable to load latest snapshot:", err)
    return null
  }
}
