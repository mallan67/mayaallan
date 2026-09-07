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
  newVisitors: number
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
 * `limit` truncates each ranked list only; the headline visitor counts always
 * describe every row passed in.
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
    newVisitors: rows.length - returningVisitors,
    returningVisitors,
    referrers: rank(referrers, limit),
    landingPages: rank(landingPages, limit),
  }
}
