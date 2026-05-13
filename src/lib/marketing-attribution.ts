/**
 * Shared cookie names, shape, and parsing for the marketing attribution
 * stream. Used by:
 *   - MarketingAttributionClient.tsx  (browser — writes cookies)
 *   - marketing-events.ts            (server — reads cookies)
 *   - /api/marketing/visitor          (server — upserts visitor row)
 *
 * Privacy: cookies are first-party, anonymous, and store no PII. The
 * visitor_id is a randomly-generated UUID, never derived from anything
 * personal. The touch fields hold UTM params + landing page + referrer
 * — exactly the values that show up in your URL bar.
 */

// ----------------------------------------------------------------------------
// Cookie names
// ----------------------------------------------------------------------------
export const ATTRIBUTION_COOKIES = {
  /** Long-lived anonymous visitor id (2 years). */
  visitorId: "ma_visitor_id",
  /** Rolling session id (~30 minutes after last activity). */
  sessionId: "ma_session_id",
  /** First-touch attribution JSON (set once, never overwritten). */
  firstTouch: "ma_first_touch",
  /** Last-touch attribution JSON (updated on every fresh UTM hit). */
  lastTouch: "ma_last_touch",
} as const

/** Visitor id cookie lifetime (seconds). */
export const VISITOR_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2 // 2 years
/** Session id cookie idle lifetime (seconds). */
export const SESSION_ID_MAX_AGE_SECONDS = 60 * 30 // 30 minutes
/** Touch cookies inherit the visitor lifetime. */
export const TOUCH_MAX_AGE_SECONDS = VISITOR_ID_MAX_AGE_SECONDS


// ----------------------------------------------------------------------------
// Touch payload
// ----------------------------------------------------------------------------
/**
 * The shape stored in `ma_first_touch` / `ma_last_touch` cookies as
 * JSON. Every field is optional — UTM params don't always exist on
 * organic traffic.
 */
export type AttributionTouch = {
  landing_page?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  /** ISO timestamp of when this touch was captured. */
  ts?: string
}

/** UTM param names we recognize (kept in one place for both client + server). */
export const UTM_PARAM_NAMES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const

export type UtmParamName = (typeof UTM_PARAM_NAMES)[number]


// ----------------------------------------------------------------------------
// Parsing / serialization
// ----------------------------------------------------------------------------
/**
 * Parse the cookie value back into a touch object. Returns null on any
 * malformed input — caller treats that the same as "no cookie set".
 */
export function parseTouchCookie(value: string | null | undefined): AttributionTouch | null {
  if (!value) return null
  try {
    const decoded = decodeURIComponent(value)
    const parsed = JSON.parse(decoded) as unknown
    if (!parsed || typeof parsed !== "object") return null
    return parsed as AttributionTouch
  } catch {
    return null
  }
}

/** Serialize a touch for storage in a cookie value. */
export function serializeTouchCookie(touch: AttributionTouch): string {
  // Trim fields to reasonable sizes so the cookie can't grow unbounded
  // from a hostile URL.
  const bounded: AttributionTouch = {
    landing_page: bounded64(touch.landing_page, 256),
    referrer: bounded64(touch.referrer, 256),
    utm_source: bounded64(touch.utm_source, 128),
    utm_medium: bounded64(touch.utm_medium, 128),
    utm_campaign: bounded64(touch.utm_campaign, 128),
    utm_content: bounded64(touch.utm_content, 128),
    utm_term: bounded64(touch.utm_term, 128),
    ts: touch.ts || new Date().toISOString(),
  }
  // Strip undefined fields so the JSON stays small.
  for (const key of Object.keys(bounded) as (keyof AttributionTouch)[]) {
    if (bounded[key] === undefined) delete bounded[key]
  }
  return encodeURIComponent(JSON.stringify(bounded))
}

function bounded64(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed
}


// ----------------------------------------------------------------------------
// UTM extraction (works on both client URLSearchParams and server URL)
// ----------------------------------------------------------------------------
export function extractUtmParams(searchParams: URLSearchParams | undefined): Partial<Record<UtmParamName, string>> {
  if (!searchParams) return {}
  const out: Partial<Record<UtmParamName, string>> = {}
  for (const name of UTM_PARAM_NAMES) {
    const v = searchParams.get(name)
    if (v) out[name] = v.trim().slice(0, 128)
  }
  return out
}

/** Quick check: does this URL search contain ANY utm_* param? */
export function hasAnyUtm(searchParams: URLSearchParams | undefined): boolean {
  if (!searchParams) return false
  for (const name of UTM_PARAM_NAMES) {
    if (searchParams.has(name)) return true
  }
  return false
}
