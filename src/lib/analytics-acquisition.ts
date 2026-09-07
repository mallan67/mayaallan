import { SITE_URL } from "@/lib/identity"

/**
 * Acquisition aggregation for the admin analytics dashboard.
 *
 * `marketing_visitors` already stores, for every consented visitor, the first
 * page they landed on and the referrer that sent them. Until now nothing read
 * it back, so the dashboard could show conversions but never "where did these
 * people come from and what did they open first".
 *
 * These are pure functions over the stored rows: no database access, no React,
 * so the grouping rules are unit-tested directly.
 */

/** One row of `marketing_visitors`, narrowed to the columns this module reads. */
export type VisitorRow = {
  visitor_id?: string | null
  first_seen_at?: string | null
  last_seen_at?: string | null
  first_landing_page?: string | null
  first_referrer?: string | null
}

export type RankedLabel = { label: string; visitors: number }

export type AcquisitionSummary = {
  totalVisitors: number
  /** Visitors never seen again on a LATER calendar day. Same-evening returns fall here. */
  singleDayVisitors: number
  returningVisitors: number
  referrers: RankedLabel[]
  landingPages: RankedLabel[]
}

const OWN_HOST = (() => {
  try {
    return new URL(SITE_URL).hostname.replace(/^www\./, "")
  } catch {
    return "mayaallan.com"
  }
})()

/**
 * A readable traffic source for one visitor.
 *
 * No referrer is a real answer, not missing data: it means the visitor typed
 * the address, used a bookmark, or arrived from an app that strips referrers.
 * That is reported as "Direct" rather than hidden.
 */
export function referrerLabel(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim()
  if (!value) return "Direct"
  let host: string
  try {
    host = new URL(value).hostname
  } catch {
    return "Other"
  }
  if (!host) return "Other"
  const bare = host.replace(/^www\./, "")
  if (bare === OWN_HOST || bare.endsWith(`.${OWN_HOST}`)) return "Internal"
  return bare
}

/**
 * The landing page, without query strings or fragments, so the same page
 * arriving with different campaign tags counts as one page.
 */
export function landingPathLabel(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim()
  if (!value) return "(unknown)"
  const path = value.split("#")[0].split("?")[0]
  if (!path) return "(unknown)"
  const trimmed = path.replace(/\/+$/, "")
  return trimmed === "" ? "/" : trimmed
}

/**
 * Read every row of a Supabase table through successive row windows.
 *
 * Supabase REST returns at most ~1000 rows per response no matter what
 * `.limit()` asks for — this repo's own migration notes say so, which is why
 * the event counts use Postgres functions. A single select would therefore
 * rank a truncated, arbitrary subset once traffic grows and quietly report the
 * wrong sources. Paging needs no new SQL.
 *
 * `fetchPage(from, to)` returns one inclusive window, or null if the query
 * failed. Stops on a short page (the end), on a failure, or at `maxPages`;
 * the last two set `truncated` so the caller can say the numbers are partial.
 */
export async function collectPaged<T>(
  fetchPage: (from: number, to: number) => Promise<T[] | null>,
  options: { pageSize?: number; maxPages?: number } = {},
): Promise<{ rows: T[]; truncated: boolean }> {
  const pageSize = options.pageSize ?? 1000
  const maxPages = options.maxPages ?? 25
  const rows: T[] = []

  for (let page = 0; page < maxPages; page++) {
    const from = page * pageSize
    const batch = await fetchPage(from, from + pageSize - 1)
    if (batch === null) return { rows, truncated: true }
    rows.push(...batch)
    if (batch.length < pageSize) return { rows, truncated: false }
  }
  return { rows, truncated: true }
}

/** Calendar day of a timestamp, or null when it is missing or unparseable. */
function calendarDay(value: string | null | undefined): string | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

/** Count by label, then rank by visitors descending, ties broken alphabetically. */
function rank(counts: Map<string, number>, limit: number): RankedLabel[] {
  return [...counts.entries()]
    .map(([label, visitors]) => ({ label, visitors }))
    .sort((a, b) => b.visitors - a.visitors || a.label.localeCompare(b.label))
    .slice(0, limit)
}

/**
 * Turn visitor rows into the acquisition figures the dashboard prints.
 *
 * Callers select rows whose `first_seen_at` falls inside the reporting range,
 * so every row is a visitor newly acquired in that range: `totalVisitors` IS
 * the new-visitor count. What varies is whether they came back afterwards, so
 * the split is returning vs single-day — never "first-time", which would read
 * as zero for someone who arrived yesterday and returned today.
 *
 * "Returning" is measured by calendar day, so the complement means "not seen
 * again on a later day", NOT "visited exactly once": a visitor who comes back
 * the same evening still counts as single-day. Label it accordingly.
 *
 * `limit` truncates each ranked list only; the headline counts always describe
 * every row passed in.
 */
export function summarizeAcquisition(rows: readonly VisitorRow[], options: { limit?: number } = {}): AcquisitionSummary {
  const limit = options.limit ?? 10
  const referrers = new Map<string, number>()
  const landingPages = new Map<string, number>()
  let returningVisitors = 0

  for (const row of rows) {
    const source = referrerLabel(row.first_referrer)
    referrers.set(source, (referrers.get(source) ?? 0) + 1)

    const page = landingPathLabel(row.first_landing_page)
    landingPages.set(page, (landingPages.get(page) ?? 0) + 1)

    // Returning means "came back on a later day". Several page views inside one
    // visit refresh last_seen_at within the same day and must not count.
    const first = calendarDay(row.first_seen_at)
    const last = calendarDay(row.last_seen_at)
    if (first && last && last > first) returningVisitors += 1
  }

  return {
    totalVisitors: rows.length,
    singleDayVisitors: rows.length - returningVisitors,
    returningVisitors,
    referrers: rank(referrers, limit),
    landingPages: rank(landingPages, limit),
  }
}
