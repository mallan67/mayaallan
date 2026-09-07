/**
 * Acquisition aggregation for the admin analytics dashboard.
 *
 * `marketing_visitors` already records, per visitor, the first page they
 * landed on and the referrer that sent them. Nothing surfaced it. These are
 * the pure functions the dashboard uses to turn those rows into "where
 * visitors come from" and "what they land on", so the grouping rules are
 * tested directly instead of through a page render.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { referrerLabel, landingPathLabel, summarizeAcquisition } from "../../src/lib/analytics-acquisition.ts"

// ---------------------------------------------------------------------------
// referrerLabel — a human-readable source per visitor
// ---------------------------------------------------------------------------

test("referrerLabel reports a bare source host, with www. and the scheme dropped", () => {
  assert.equal(referrerLabel("https://www.google.com/search?q=psilocybin+integration"), "google.com")
  assert.equal(referrerLabel("http://t.co/abc"), "t.co")
  assert.equal(referrerLabel("https://news.ycombinator.com/item?id=1"), "news.ycombinator.com")
})

test("referrerLabel calls a missing referrer Direct — that is a real answer, not an error", () => {
  assert.equal(referrerLabel(null), "Direct")
  assert.equal(referrerLabel(""), "Direct")
  assert.equal(referrerLabel("   "), "Direct")
})

test("referrerLabel separates the site's own pages from outside traffic", () => {
  assert.equal(referrerLabel("https://www.mayaallan.com/blog"), "Internal")
  assert.equal(referrerLabel("https://mayaallan.com/"), "Internal")
})

test("referrerLabel never throws on a malformed referrer", () => {
  assert.equal(referrerLabel("not a url"), "Other")
  assert.equal(referrerLabel("android-app://com.example"), "com.example")
})

// ---------------------------------------------------------------------------
// landingPathLabel — the page, without tracking noise
// ---------------------------------------------------------------------------

test("landingPathLabel strips query strings and fragments so one page counts once", () => {
  assert.equal(landingPathLabel("/blog?utm_source=instagram&utm_medium=bio"), "/blog")
  assert.equal(landingPathLabel("/scenarios/ego-dissolution#what-it-feels-like"), "/scenarios/ego-dissolution")
  assert.equal(landingPathLabel("/"), "/")
})

test("landingPathLabel normalizes a trailing slash and a missing value", () => {
  assert.equal(landingPathLabel("/books/"), "/books")
  assert.equal(landingPathLabel(null), "(unknown)")
  assert.equal(landingPathLabel(""), "(unknown)")
})

// ---------------------------------------------------------------------------
// summarizeAcquisition — the numbers the dashboard prints
// ---------------------------------------------------------------------------

const rows = [
  { visitor_id: "a", first_seen_at: "2026-09-01T10:00:00Z", last_seen_at: "2026-09-01T10:04:00Z", first_landing_page: "/blog?utm_source=x", first_referrer: "https://www.google.com/search?q=a" },
  { visitor_id: "b", first_seen_at: "2026-09-02T10:00:00Z", last_seen_at: "2026-09-05T09:00:00Z", first_landing_page: "/blog", first_referrer: "https://www.google.com/" },
  { visitor_id: "c", first_seen_at: "2026-09-03T10:00:00Z", last_seen_at: "2026-09-03T10:00:00Z", first_landing_page: "/books/psilocybin-integration-guide", first_referrer: null },
  { visitor_id: "d", first_seen_at: "2026-09-04T10:00:00Z", last_seen_at: "2026-09-06T11:00:00Z", first_landing_page: "/", first_referrer: "https://www.instagram.com/" },
]

test("summarizeAcquisition ranks sources by visitor count, most first", () => {
  const s = summarizeAcquisition(rows)
  assert.deepEqual(s.referrers, [
    { label: "google.com", visitors: 2 },
    { label: "Direct", visitors: 1 },
    { label: "instagram.com", visitors: 1 },
  ])
})

test("summarizeAcquisition ranks landing pages and merges the same page arriving with different tracking parameters", () => {
  const s = summarizeAcquisition(rows)
  assert.deepEqual(s.landingPages, [
    { label: "/blog", visitors: 2 },
    { label: "/", visitors: 1 },
    { label: "/books/psilocybin-integration-guide", visitors: 1 },
  ])
})

test("summarizeAcquisition counts a visitor as returning only when they came back on a later day", () => {
  const s = summarizeAcquisition(rows)
  assert.equal(s.totalVisitors, 4)
  assert.equal(s.returningVisitors, 2, "b and d came back on a later date; a and c did not")
  assert.equal(s.newVisitors, 2)
})

test("summarizeAcquisition honours a limit per list without changing the totals", () => {
  const s = summarizeAcquisition(rows, { limit: 1 })
  assert.deepEqual(s.referrers, [{ label: "google.com", visitors: 2 }])
  assert.deepEqual(s.landingPages, [{ label: "/blog", visitors: 2 }])
  assert.equal(s.totalVisitors, 4, "the limit truncates the lists, never the headline count")
})

test("summarizeAcquisition returns empty lists and zero counts for no data, so the dashboard renders on day one", () => {
  const s = summarizeAcquisition([])
  assert.deepEqual(s.referrers, [])
  assert.deepEqual(s.landingPages, [])
  assert.deepEqual([s.totalVisitors, s.newVisitors, s.returningVisitors], [0, 0, 0])
})

test("summarizeAcquisition tolerates rows with missing timestamps instead of throwing", () => {
  const s = summarizeAcquisition([{ visitor_id: "x", first_seen_at: null, last_seen_at: null, first_landing_page: null, first_referrer: null }])
  assert.equal(s.totalVisitors, 1)
  assert.equal(s.returningVisitors, 0)
  assert.deepEqual(s.landingPages, [{ label: "(unknown)", visitors: 1 }])
})

test("ties break alphabetically so the dashboard ordering is stable between renders", () => {
  const tie = [
    { visitor_id: "1", first_landing_page: "/zebra", first_referrer: "https://zebra.com/" },
    { visitor_id: "2", first_landing_page: "/apple", first_referrer: "https://apple.com/" },
  ]
  assert.deepEqual(summarizeAcquisition(tie).referrers.map((r) => r.label), ["apple.com", "zebra.com"])
  assert.deepEqual(summarizeAcquisition(tie).landingPages.map((r) => r.label), ["/apple", "/zebra"])
})
