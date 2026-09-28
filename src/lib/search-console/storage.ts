import "server-only"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { SearchConsoleRow } from "@/lib/search-console/client"
import type { SearchOpportunity } from "@/lib/search-console/opportunities"

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
  current: SearchConsoleRow[]
  previous: SearchConsoleRow[]
  opportunities: SearchOpportunity[]
  pages: SearchConsoleRow[]
  daily: SearchConsoleRow[]
  imagePages: SearchConsoleRow[]
  searchAppearances: SearchConsoleRow[]
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
      { onConflict: "snapshot_date" }
    )

  if (error) throw new Error(`Search Console snapshot save failed: ${error.message}`)
}

export async function loadLatestSearchConsoleSnapshot(): Promise<SearchConsoleSnapshot | null> {
  const { data, error } = await supabaseAdmin
    .from("search_console_snapshots")
    .select("payload")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[search-console] latest snapshot query failed:", error.message)
    return null
  }
  if (!data?.payload || typeof data.payload !== "object") return null
  return data.payload as SearchConsoleSnapshot
}
