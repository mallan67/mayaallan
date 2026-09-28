import "server-only"
import { SITE_URL } from "@/lib/identity"
import {
  inspectSearchConsoleUrl,
  listSearchConsoleSitemaps,
  querySearchConsole,
  searchConsoleConfiguration,
  type SearchConsoleRow,
} from "@/lib/search-console/client"
import { buildSearchOpportunities } from "@/lib/search-console/opportunities"
import {
  saveSearchConsoleSnapshot,
  type SearchConsoleSnapshot,
  type UrlInspectionSummary,
} from "@/lib/search-console/storage"

function iso(daysAgo: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function inspectionSummary(url: string, payload: unknown): UrlInspectionSummary {
  const root = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>
  const inspection = (root.inspectionResult ?? {}) as Record<string, unknown>
  const index = (inspection.indexStatusResult ?? {}) as Record<string, unknown>
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
  const config = searchConsoleConfiguration()
  if (!config.configured || !config.siteUrl) {
    throw new Error("Search Console API credentials are not configured")
  }

  const endDate = iso(3)
  const startDate = iso(30)
  const previousEndDate = iso(31)
  const previousStartDate = iso(58)

  const [current, previous, pages, daily, imagePages, searchAppearances, sitemaps] = await Promise.all([
    querySearchConsole({
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit: 10_000,
    }),
    querySearchConsole({
      startDate: previousStartDate,
      endDate: previousEndDate,
      dimensions: ["query", "page"],
      rowLimit: 10_000,
    }),
    querySearchConsole({
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 5_000,
    }),
    querySearchConsole({
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 100,
    }),
    querySearchConsole({
      startDate,
      endDate,
      dimensions: ["page"],
      searchType: "image",
      rowLimit: 5_000,
    }).catch((): SearchConsoleRow[] => []),
    querySearchConsole({
      startDate,
      endDate,
      dimensions: ["searchAppearance"],
      rowLimit: 1_000,
    }).catch((): SearchConsoleRow[] => []),
    listSearchConsoleSitemaps().catch((error) => [
      { error: error instanceof Error ? error.message : String(error) },
    ]),
  ])

  const inspections: UrlInspectionSummary[] = []
  for (const path of CRITICAL_PATHS) {
    const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`
    try {
      inspections.push(inspectionSummary(url, await inspectSearchConsoleUrl(url)))
    } catch (error) {
      inspections.push({ url, error: error instanceof Error ? error.message : String(error) })
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    siteUrl: config.siteUrl,
    period: { startDate, endDate },
    previousPeriod: { startDate: previousStartDate, endDate: previousEndDate },
    current,
    previous,
    opportunities: buildSearchOpportunities(current, previous),
    pages,
    daily,
    imagePages,
    searchAppearances,
    sitemaps,
    inspections,
  }
}

export async function collectAndSaveSearchConsoleSnapshot(): Promise<SearchConsoleSnapshot> {
  const snapshot = await collectSearchConsoleSnapshot()
  await saveSearchConsoleSnapshot(snapshot)
  return snapshot
}
