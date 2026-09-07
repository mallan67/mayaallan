/**
 * Contracts for the analytics stack's visibility split.
 *
 * Before this change the site measured nothing: Vercel Web Analytics was
 * mounted only after a visitor clicked "Accept all", so every undecided or
 * rejecting visitor was invisible, and the acquisition data the site already
 * stored in `marketing_visitors` was never shown anywhere.
 *
 * The split these tests lock in:
 *   - Vercel Web Analytics is COOKIELESS — no visitor identifier, no local
 *     storage — so it runs for every visitor and answers "how many people,
 *     which pages, from where".
 *   - The first-party attribution stack (visitor + session COOKIES, UTM
 *     capture) still runs only after explicit consent.
 *   - The privacy page and the consent banner describe exactly that split,
 *     because a policy that misdescribes what runs is worse than no policy.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
const analytics = read("../../src/components/AnalyticsGated.tsx")
const layout = read("../../src/app/layout.tsx")
const privacy = read("../../src/app/privacy/page.tsx")
const banner = read("../../src/components/ConsentBanner.tsx")
const adminAnalytics = read("../../src/app/admin/analytics/page.tsx")

// Body of an exported component, so "does this function check consent" is asked
// about that component only and not about its neighbour in the same file.
function componentBody(src, name) {
  const start = src.indexOf(`export function ${name}(`)
  assert.ok(start > -1, `component ${name} is exported`)
  const next = src.indexOf("\nexport ", start + 1)
  return src.slice(start, next === -1 ? src.length : next)
}

test("the cookieless page-view counter mounts for every visitor, with no consent check", () => {
  const body = componentBody(analytics, "CookielessAnalytics")
  assert.match(body, /<Analytics\b/, "renders the Vercel Web Analytics component")
  assert.doesNotMatch(body, /useConsent|consent\s*!==|consent\s*===/, "no consent gate on the cookieless counter")
  assert.match(analytics, /from\s+"@vercel\/analytics\/next"/, "the Next-specific import, so route paths are reported")
})

test("the cookie-based attribution stack still runs only after explicit consent", () => {
  const body = componentBody(analytics, "GatedMarketing")
  assert.match(body, /useConsent\(\)/)
  assert.match(body, /consent\s*!==\s*"accepted"/)
  assert.match(body, /return null/)
  assert.match(body, /<MarketingAttributionClient\b/)
})

test("the layout mounts the cookieless counter and the consent-gated attribution, and no longer gates page views", () => {
  assert.match(layout, /<CookielessAnalytics\s*\/>/)
  assert.match(layout, /<GatedMarketing\s*\/>/)
  assert.match(layout, /<ConsentBanner\s*\/>/, "the banner still governs the cookie-based stack")
  assert.doesNotMatch(layout, /<GatedAnalytics\s*\/>/, "the old always-gated page-view component is gone")
})

test("the privacy page states that a cookieless measurement runs for everyone and names the processor", () => {
  assert.match(privacy, /cookieless/i, "the page uses the word, because it is the reason consent is not required")
  assert.match(privacy, /Vercel Web Analytics/i, "the processor is named")
  // The claim that must stay true: no identifier is stored for that measurement.
  const idx = privacy.search(/cookieless/i)
  const region = privacy.slice(Math.max(0, idx - 700), idx + 900)
  assert.match(region, /no (cookie|identifier)|without (a )?(cookie|identifier)|does not set/i)
})

test("the privacy page still promises consent before the visitor and session identifiers", () => {
  assert.match(privacy, /consent-gated/i)
  const idx = privacy.search(/Visitor and session identifiers/i)
  assert.ok(idx > -1, "the cookie-based identifiers are still described")
})

test("the consent banner asks only about the cookie-based stack it actually controls", () => {
  const body = banner.slice(banner.indexOf('id="consent-body"'), banner.indexOf('id="consent-body"') + 900)
  assert.match(body, /cookie/i)
  assert.doesNotMatch(body, /we (do not|don&apos;t|don't) (measure|count)/i, "the banner must not claim nothing is measured")
})

// ---------------------------------------------------------------------------
// The admin dashboard has to actually show acquisition, not just conversions.
// ---------------------------------------------------------------------------

test("the admin analytics page reads the stored acquisition data and renders sources and landing pages", () => {
  assert.match(adminAnalytics, /marketing_visitors/, "queries the table that already holds first-touch data")
  assert.match(adminAnalytics, /summarizeAcquisition/, "aggregates through the tested pure helper")
  assert.match(adminAnalytics, /Where visitors come from/i)
  assert.match(adminAnalytics, /Landing pages/i)
  assert.match(adminAnalytics, /\.limit\(/, "the direct query is bounded, like the orders query beside it")
})

test("the admin analytics page tells the operator that cookie-gated data undercounts, so numbers are not misread", () => {
  assert.match(adminAnalytics, /consent/i)
})

test("the visitor query pages past the Supabase row cap rather than trusting a single .limit()", () => {
  // Supabase REST caps a response at ~1000 rows whatever .limit() asks for, as
  // this repo's own migration notes. A single request would silently rank a
  // truncated subset once traffic grows.
  assert.match(adminAnalytics, /collectPaged/, "uses the tested pager")
  assert.match(adminAnalytics, /\.range\(/, "pages through explicit row windows")
  assert.match(adminAnalytics, /truncated/, "surfaces partial results instead of hiding them")
})

// ---------------------------------------------------------------------------
// Behavioral events are NOT page views and must not become always-on with them.
// ---------------------------------------------------------------------------

const trackHelpers = read("../../src/lib/analytics.ts")

test("custom behavioral events stay behind consent even though page views do not", () => {
  // These report tool usage, turn counts, session timing, export actions and
  // feedback ratings. Mounting the analytics runtime for everyone must not
  // start sending them for visitors who declined or have not answered.
  assert.match(trackHelpers, /consent/i, "the module consults consent")
  const emitCalls = trackHelpers.match(/(^|[^.\w])track\(/g) ?? []
  assert.equal(emitCalls.length, 1, "exactly one guarded call site, not one per helper")
  const gate = trackHelpers.search(/consent/i)
  const callSite = trackHelpers.search(/(^|[^.\w])track\(/m)
  assert.ok(gate < callSite, "consent is checked before the event is sent")
})

test("the privacy page's last-updated date moves with this change in data practices", () => {
  const m = privacy.match(/const LAST_UPDATED = "([^"]+)"/)
  assert.ok(m, "LAST_UPDATED is declared")
  assert.notEqual(m[1], "May 20, 2026", "a new always-on processor disclosure cannot keep the old date")
  assert.match(m[1], /2026/)
})
