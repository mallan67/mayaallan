import "server-only"
import { SITE_URL } from "@/lib/identity"
import {
  inspectSearchConsoleUrl,
  listSearchConsoleSitemaps,
  querySearchAnalytics,
  searchConsoleSiteUrl,
} from "@/lib/search-console/client"
import {
  buildSearchOpportunities,
  rowsToQueryPageMetrics,
  type QueryPageMetric,
} from "@/lib/search-console/opportunities"
import {
  saveSearchConsoleSnapshot,
  type SearchConsoleSnapshot,
  type UrlInspectionSummary,
} from "@/lib/search-console/storage"

function isoDateDaysAgo(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function pageRows(rows: Awaited<ReturnType<typeof querySearchAnalytics>>) {
  return rows
    .filter((row) => Array.isArray(row.keys) && row.keys.length >= 1)
    .map((row) => ({
      page: row.keys?.[0] ?? "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      ctr: Number(row.ctr) || 0,
      position: Number(row.position) || 0,
    }))
    .filter((row) => row.page.length > 0)
}

function dailyRows(rows: Awaited<ReturnType<typeof querySearchAnalytics>>) {
  return rows
    .filter((row) => Array.isArray(row.keys) && row.keys.length >= 1)
    .map((row) => ({
      date: row.keys?.[0] ?? "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      ctr: Number(row.ctr) || 0,
      position: Number(row.position) || 0,
    }))
    .filter((row) => row.date.length > 0)
}

function inspectionSummary(url: string, payload: Record<string, unknown>): UrlInspectionSummary {
  const root = (payload.inspectionResult ?? {}) as Record<string, unknown>
  const index = (root.indexStatusResult ?? {}) as Record<string, unknown>
  return {
    url,
    verdict: typeof index.verdict === "string" ? index.verdict : undefined,
    coverageState: typeof index.coverageState === "string" ? index.coverageState : undefined,
    indexingState: typeof index.indexingState === "string" ? index.indexingState : undefined,
    pageFetchState: typeof index.pageFetchState === "string" ? index.pageFetchState : undefined,
    robotsTxtState: typeof index.robotsTxtState === "string" ? index.robotsTxtState : undefined,
    lastCrawlTime: typeof index.lastCrawlTime === "string" ? index.lastCrawlTime : undefined,
    googleCanonical: typeof index.googleCanonical === "string" ? index.googleCanonical : undefined,
    userCanonical: typeof index.userCanonical === "string" ? index.userCanonical : undefined,
  }
}

const CRITICAL_PATHS = [
  "/",
  "/about",
  "/books/psilocybin-integration-guide",
  "/belief-inquiry",
  "/nervous-system-reset",
  "/integration-reflection",
  "/integration-journal",
  "/scenarios/ego-dissolution",
  "/blog/psilocybin-integration-research",
]

export async function collectSearchConsoleSnapshot(): Promise<SearchConsoleSnapshot> {
  // Search Console data is typically finalized with a delay. End three days
  // back so the opportunity engine compares stable windows instead of partial data.
  const endDate = isoDateDaysAgo(3)
  const startDate = isoDateDaysAgo(30)
  const previousEndDate = isoDateDaysAgo(31)
  const previousStartDate = isoDateDaysAgo(58)

  const [currentRows, previousRows, pageData, dailyData, imagePageData, appearanceData, sitemapResult] = await Promise.all([
    querySearchAnalytics({
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit: 10_000,
      dataState: "final",
    }),
    querySearchAnalytics({
      startDate: previousStartDate,
      endDate: previousEndDate,
      dimensions: ["query", "page"],
      rowLimit: 10_000,
      dataState: "final",
    }),
    querySearchAnalytics({
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 5_000,
      dataState: "final",
    }),
    querySearchAnalytics({
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 100,
      dataState: "final",
    }),
    querySearchAnalytics({
      startDate,
      endDate,
      dimensions: ["page"],
      type: "image",
      rowLimit: 5_000,
      dataState: "final",
    }).catch(() => []),
    querySearchAnalytics({
      startDate,
      endDate,
      dimensions: ["searchAppearance"],
      rowLimit: 1_000,
      dataState: "final",
    }).catch(() => []),
    listSearchConsoleSitemaps().catch((error) => [{ error: error instanceof Error ? error.message : String(error) }]),
  ])

  const current: QueryPageMetric[] = rowsToQueryPageMetrics(currentRows)
  const previous: QueryPageMetric[] = rowsToQueryPageMetrics(previousRows)

  const inspections: UrlInspectionSummary[] = []
  for (const path of CRITICAL_PATHS) {
    const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`
    try {
      const result = await inspectSearchConsoleUrl(url)
      inspections.push(inspectionSummary(url, result))
    } catch (error) {
      inspections.push({ url, error: error instanceof Error ? error.message : String(error) })
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    siteUrl: searchConsoleSiteUrl(),
    period: { startDate, endDate },
    previousPeriod: { startDate: previousStartDate, endDate: previousEndDate },
    current,
    previous,
    opportunities: buildSearchOpportunities(current, previous),
    pages: pageRows(pageData),
    daily: dailyRows(dailyData),
    imagePages: pageRows(imagePageData),
    searchAppearances: appearanceData
      .filter((row) => Array.isArray(row.keys) && row.keys.length >= 1)
      .map((row) => ({
        appearance: row.keys?.[0] ?? "",
        clicks: Number(row.clicks) || 0,
        impressions: Number(row.impressions) || 0,
        ctr: Number(row.ctr) || 0,
        position: Number(row.position) || 0,
      }))
      .filter((row) => row.appearance.length > 0),
    sitemaps: sitemapResult,
    inspections,
  }
}

export async function collectAndSaveSearchConsoleSnapshot(): Promise<SearchConsoleSnapshot> {
  const snapshot = await collectSearchConsoleSnapshot()
  await saveSearchConsoleSnapshot(snapshot)
  return snapshot
}
