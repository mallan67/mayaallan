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
import { alertAdmin } from "@/lib/alert-admin"
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
// SESSION_SECRET must be set or the hash is unsalted-by-known-string and
// trivially rainbow-tableable over IPv4 space. Previous behavior fell back
// to a hardcoded literal — if SESSION_SECRET was ever unset in a preview env
// pointed at prod, the privacy policy's "we don't store raw IPs" claim
// would have been violated. We now refuse to produce a hash without it;
// callers must tolerate `null` rather than store a deterministically-reversible
// value.
const ATTRIBUTION_HASH_SALT: string | null = process.env.SESSION_SECRET ?? null

/** Truncated SHA-256 hash for IP / UA. Never reversible. */
export function hashForAttribution(value: string | null | undefined): string | null {
  if (!value) return null
  if (!ATTRIBUTION_HASH_SALT) {
    console.error(
      "[marketing-events] SESSION_SECRET not set — refusing to store IP/UA hash " +
        "to avoid de-anonymization. Set SESSION_SECRET in env.",
    )
    return null
  }
  return createHash("sha256")
    .update(value)
    .update(ATTRIBUTION_HASH_SALT)
    .digest("hex")
    .slice(0, 64)
}

// ----------------------------------------------------------------------------
// Properties bounding
// ----------------------------------------------------------------------------
const EMAIL_LOOKING_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/

/**
 * Recursively walk a value, redacting email-looking strings at any nesting
 * depth and capping individual string lengths. Used by `boundProperties`.
 *
 * Previously this function only checked top-level string values, so a caller
 * passing `{ profile: { email: "user@example.com" } }` would slip a full
 * email into the marketing_events row. Now any string anywhere in the value
 * tree is scanned.
 */
function sanitizeValue(value: unknown, redactedRef: { dropped: boolean }): unknown {
  if (typeof value === "string") {
    if (EMAIL_LOOKING_RE.test(value)) {
      redactedRef.dropped = true
      return "<email-redacted>"
    }
    return value.length > MAX_STRING_FIELD_LENGTH ? value.slice(0, MAX_STRING_FIELD_LENGTH) : value
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v, redactedRef))
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeValue(v, redactedRef)
    }
    return out
  }
  return value
}

function boundProperties(properties: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!properties || typeof properties !== "object") return {}

  // Recursively sanitize every string in the tree.
  const redactedRef = { dropped: false }
  const sanitized = sanitizeValue(properties, redactedRef) as Record<string, unknown>
  if (redactedRef.dropped) {
    console.warn(
      "[marketing-events] redacted one or more email-looking string values from " +
        "properties; callers should pass only the email domain (after the @).",
    )
  }

  // Final size check: serialize and refuse if > 4 KB.
  try {
    const serialized = JSON.stringify(sanitized)
    if (serialized.length > MAX_PROPERTIES_BYTES) {
      return { error: "oversize", original_bytes: serialized.length }
    }
  } catch {
    return { error: "unserializable" }
  }

  return sanitized
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
      // Surface a one-time-per-cold-start alert so a sustained DB schema
      // regression doesn't silently empty the analytics stream. The catch
      // block intentionally never throws back to the caller (the function
      // contract is "never throws"), but losing all analytics without
      // visibility was the pre-PR-5B failure mode.
      await alertAdmin({
        severity: "warning",
        subject: "Marketing events: insert failed",
        body:
          "trackMarketingEvent() supabase insert returned an error. If this " +
          "persists, every event in the analytics stream is being lost — " +
          "revenue-by-campaign + funnel reporting will go quiet. Most common " +
          "causes: missing column, table renamed, or supabase auth issue.",
        details: {
          errorMessage: error.message,
          errorCode: error.code,
          eventName: input.eventName,
        },
        dedupKey: "marketing-events:insert-failed",
        dedupWindowMs: 24 * 60 * 60 * 1000,
      })
    }
  } catch (err) {
    console.error("[marketing-events] track threw:", err instanceof Error ? err.message : String(err))
    // Outer catch — function contract is "never throws". Alert at the
    // same rate as the insert-failed branch so we don't flood when both
    // paths fail (e.g., Supabase down).
    await alertAdmin({
      severity: "warning",
      subject: "Marketing events: track threw",
      body:
        "trackMarketingEvent() outer catch fired. The function contract is " +
        "never-throws, but if it's hitting this catch repeatedly the analytics " +
        "stream is going dark. Check for upstream changes in marketing_events " +
        "schema, attribution cookie format, or supabase auth.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "marketing-events:track-threw",
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
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
