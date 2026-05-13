/**
 * Server-side helper to record a marketing event.
 *
 * Design goals (in priority order):
 *
 *   1. NEVER throws. Tracking failure must not break the user-facing
 *      flow (checkout, contact submit, subscribe, purchase fulfillment).
 *      Every caller is wrapped in `await trackMarketingEvent(...)` and
 *      doesn't need its own try/catch — this function swallows
 *      everything to console.error.
 *
 *   2. Bounded payload. `properties` is JSON-serialized and capped at
 *      4 KB. Oversized entries are replaced with `{ "error": "oversize" }`
 *      so the event still records (we know SOMETHING happened) but
 *      doesn't fill the column.
 *
 *   3. Privacy-respecting. IP and user-agent are HASHED on the visitor
 *      row, not stored raw. Email addresses are NEVER stored in
 *      properties — callers should pass the domain only ("gmail.com"
 *      rather than "user@gmail.com"). This file doesn't enforce that
 *      contract beyond a soft warning on `properties.email`.
 *
 *   4. Cookie-aware. If the caller passes a Request, we'll pull
 *      visitor_id / session_id / last_touch out of the cookies if the
 *      caller didn't pass them explicitly. Lets server routes record
 *      well-attributed events without every caller doing cookie parsing.
 */
import "server-only"
import { createHash } from "node:crypto"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import {
  ATTRIBUTION_COOKIES,
  parseTouchCookie,
  type AttributionTouch,
  type UtmParamName,
} from "@/lib/marketing-attribution"

/** Names callers are allowed to pass. */
export const ALLOWED_EVENT_NAMES = [
  "book_viewed",
  "checkout_started",
  "purchase_completed",
  "newsletter_subscribed",
  "contact_submitted",
  "tool_viewed",
  "tool_started",
  "tool_completed",
  "export_cta_clicked",
  "export_purchased",
  "download_started",
] as const

export type MarketingEventName = (typeof ALLOWED_EVENT_NAMES)[number]

const ALLOWED_EVENT_SET = new Set<string>(ALLOWED_EVENT_NAMES)

const MAX_PROPERTIES_BYTES = 4 * 1024 // 4 KB
const MAX_STRING_FIELD_LENGTH = 256

export type TrackInput = {
  /** Optional. If provided we'll extract attribution from cookies. */
  request?: Request | null
  eventName: MarketingEventName
  /** Falls back to cookie if absent. */
  visitorId?: string | null
  /** Falls back to cookie if absent. */
  sessionId?: string | null
  /** Page or API path the event occurred on. */
  path?: string | null
  /** Plain JSON object. Email addresses must NOT appear here. */
  properties?: Record<string, unknown> | null
}

// ----------------------------------------------------------------------------
// Cookie reader
// ----------------------------------------------------------------------------
function parseCookieHeader(header: string | null): Map<string, string> {
  const out = new Map<string, string>()
  if (!header) return out
  for (const part of header.split(";")) {
    const idx = part.indexOf("=")
    if (idx < 0) continue
    const name = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (name) out.set(name, value)
  }
  return out
}

function readAttributionFromRequest(request: Request | null | undefined): {
  visitorId: string | null
  sessionId: string | null
  lastTouch: AttributionTouch | null
  firstTouch: AttributionTouch | null
  ipHeader: string | null
  uaHeader: string | null
} {
  if (!request) {
    return { visitorId: null, sessionId: null, lastTouch: null, firstTouch: null, ipHeader: null, uaHeader: null }
  }
  const cookies = parseCookieHeader(request.headers.get("cookie"))
  const visitorId = cookies.get(ATTRIBUTION_COOKIES.visitorId) || null
  const sessionId = cookies.get(ATTRIBUTION_COOKIES.sessionId) || null
  const lastTouch = parseTouchCookie(cookies.get(ATTRIBUTION_COOKIES.lastTouch))
  const firstTouch = parseTouchCookie(cookies.get(ATTRIBUTION_COOKIES.firstTouch))
  const ipHeader = request.headers.get("x-forwarded-for")
  const uaHeader = request.headers.get("user-agent")
  return { visitorId, sessionId, lastTouch, firstTouch, ipHeader, uaHeader }
}

// ----------------------------------------------------------------------------
// Hashing
// ----------------------------------------------------------------------------
const ATTRIBUTION_HASH_SALT = process.env.SESSION_SECRET || "marketing-events-fallback-salt"

/** Truncated SHA-256 hash for IP / UA. Never reversible. */
export function hashForAttribution(value: string | null | undefined): string | null {
  if (!value) return null
  return createHash("sha256")
    .update(value)
    .update(ATTRIBUTION_HASH_SALT)
    .digest("hex")
    .slice(0, 64)
}

// ----------------------------------------------------------------------------
// Properties bounding
// ----------------------------------------------------------------------------
function boundProperties(properties: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!properties || typeof properties !== "object") return {}

  // Quick sanity check: refuse any field that looks like a full email.
  // The contract is "email domain only" but the helper is a soft net.
  for (const [key, value] of Object.entries(properties)) {
    if (
      typeof value === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
      // Allow domain-only strings like "gmail.com" through.
      value.split("@").length > 1
    ) {
      console.warn(
        `[marketing-events] dropped field '${key}' that looks like a full email; ` +
          `callers should pass only the domain (after the @).`,
      )
      properties = { ...properties, [key]: "<email-redacted>" }
    }
  }

  // Cap string field lengths so a hostile value can't blow up the row.
  const bounded: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "string") {
      bounded[key] = value.length > MAX_STRING_FIELD_LENGTH ? value.slice(0, MAX_STRING_FIELD_LENGTH) : value
    } else {
      bounded[key] = value
    }
  }

  // Final size check: serialize and refuse if > 4 KB.
  try {
    const serialized = JSON.stringify(bounded)
    if (serialized.length > MAX_PROPERTIES_BYTES) {
      return { error: "oversize", original_bytes: serialized.length }
    }
  } catch {
    return { error: "unserializable" }
  }

  return bounded
}

// ----------------------------------------------------------------------------
// trackMarketingEvent
// ----------------------------------------------------------------------------
export async function trackMarketingEvent(input: TrackInput): Promise<void> {
  try {
    if (!ALLOWED_EVENT_SET.has(input.eventName)) {
      console.error(`[marketing-events] rejected unknown event name: ${input.eventName}`)
      return
    }

    const fromRequest = readAttributionFromRequest(input.request)

    const visitorId = (input.visitorId ?? fromRequest.visitorId)?.slice(0, 128) || null
    const sessionId = (input.sessionId ?? fromRequest.sessionId)?.slice(0, 128) || null

    // last_touch wins for the event row (current campaign that drove this
    // event), with first_touch as a fallback if a same-visitor event has
    // no last_touch yet.
    const touch = fromRequest.lastTouch ?? fromRequest.firstTouch ?? null

    const properties = boundProperties(input.properties)

    const { error } = await supabaseAdmin.from("marketing_events").insert({
      visitor_id: visitorId,
      session_id: sessionId,
      event_name: input.eventName,
      path: input.path ? input.path.slice(0, 256) : touch?.landing_page ?? null,
      referrer: touch?.referrer ?? null,
      utm_source: touch?.utm_source ?? null,
      utm_medium: touch?.utm_medium ?? null,
      utm_campaign: touch?.utm_campaign ?? null,
      utm_content: touch?.utm_content ?? null,
      utm_term: touch?.utm_term ?? null,
      properties,
    })

    if (error) {
      console.error("[marketing-events] insert failed:", error.message, error.code)
      // Swallow — caller mustn't see this.
    }
  } catch (err) {
    console.error("[marketing-events] track threw:", err instanceof Error ? err.message : String(err))
    // Never throw.
  }
}

// ----------------------------------------------------------------------------
// Helpers callers use
// ----------------------------------------------------------------------------
/** Return only the domain part of an email, lowercased. Safe for properties. */
export function emailDomainOnly(email: string | null | undefined): string | null {
  if (!email) return null
  const idx = email.lastIndexOf("@")
  if (idx < 0 || idx === email.length - 1) return null
  return email.slice(idx + 1).trim().toLowerCase().slice(0, 128)
}

/** Coarse message-length bucket for contact-form analytics. */
export function messageLengthBucket(message: string | null | undefined): "small" | "medium" | "large" | "empty" {
  if (!message) return "empty"
  const len = message.length
  if (len <= 100) return "small"
  if (len <= 1000) return "medium"
  return "large"
}

/**
 * Attribution snapshot pulled from cookies. Returned by callers (e.g.
 * webhook) that need to persist attribution to a database row separate
 * from the events stream (e.g. orders.utm_*).
 */
export function snapshotAttributionFromRequest(request: Request | null | undefined): {
  visitorId: string | null
  sessionId: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  landingPage: string | null
  referrer: string | null
} {
  const r = readAttributionFromRequest(request)
  const touch = r.lastTouch ?? r.firstTouch ?? null
  return {
    visitorId: r.visitorId,
    sessionId: r.sessionId,
    utmSource: touch?.utm_source ?? null,
    utmMedium: touch?.utm_medium ?? null,
    utmCampaign: touch?.utm_campaign ?? null,
    utmContent: touch?.utm_content ?? null,
    utmTerm: touch?.utm_term ?? null,
    landingPage: touch?.landing_page ?? null,
    referrer: touch?.referrer ?? null,
  }
}

// Re-export hashing for the /api/marketing/visitor upsert.
export { ATTRIBUTION_HASH_SALT as _ATTRIBUTION_HASH_SALT_FOR_TESTS_ONLY }
