import "server-only"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { SearchOpportunity, QueryPageMetric } from "@/lib/search-console/opportunities"

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

export async function saveSearchConsoleSnapshot(snapshot: SearchConsoleSnapshot): Promise<void> {
  const snapshotDate = snapshot.fetchedAt.slice(0, 10)
  const { error } = await supabaseAdmin
    .from("search_console_snapshots")
    .upsert(
      {
        snapshot_date: snapshotDate,
        fetched_at: snapshot.fetchedAt,
        payload: snapshot,
      },
      { onConflict: "snapshot_date" },
    )

  if (error) {
    throw new Error(`Search Console snapshot save failed: ${error.message}`)
  }
}

export async function loadLatestSearchConsoleSnapshot(): Promise<SearchConsoleSnapshot | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("search_console_snapshots")
      .select("payload")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[search-console] latest snapshot query failed:", error.message, error.code)
      return null
    }
    if (!data?.payload || typeof data.payload !== "object") return null
    return data.payload as SearchConsoleSnapshot
  } catch (err) {
    console.warn("[search-console] Unable to load latest snapshot:", err)
    return null
  }
}
