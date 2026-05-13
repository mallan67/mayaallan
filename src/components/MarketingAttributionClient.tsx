"use client"

/**
 * Site-wide marketing attribution bootstrap.
 *
 * Mounted once in the root layout. Runs once on initial page load
 * (guarded by a sessionStorage flag so client-side navigation doesn't
 * re-fire it). Responsibilities:
 *
 *   1. Ensure `ma_visitor_id` cookie exists. If not, mint a UUID v4
 *      and set it with a 2-year max-age.
 *   2. Ensure `ma_session_id` cookie exists. If not, mint a UUID v4
 *      and set it with a 30-minute idle expiry (refreshed on each
 *      page load — same cookie value, renewed expiry).
 *   3. Capture the current touch (landing page, referrer, UTM params).
 *      - If `ma_first_touch` is missing, write it now (immutable for
 *        the visitor's lifetime).
 *      - Always update `ma_last_touch` with the current touch.
 *   4. Send a one-shot fire-and-forget POST to /api/marketing/visitor
 *      so the server can upsert marketing_visitors with the hashed
 *      IP/UA + first-touch attribution.
 *
 * Privacy:
 *   - All cookies are first-party, sameSite=lax, secure on production.
 *   - No PII stored anywhere in cookies — just IDs and UTM strings.
 *   - The server hashes IP/UA before storing.
 */

import { useEffect } from "react"
import {
  ATTRIBUTION_COOKIES,
  VISITOR_ID_MAX_AGE_SECONDS,
  SESSION_ID_MAX_AGE_SECONDS,
  TOUCH_MAX_AGE_SECONDS,
  parseTouchCookie,
  serializeTouchCookie,
  extractUtmParams,
  hasAnyUtm,
  type AttributionTouch,
} from "@/lib/marketing-attribution"

const BOOTSTRAP_FLAG = "ma_bootstrapped"

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const target = `${name}=`
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim()
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length))
    }
  }
  return null
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return
  const isHttps = typeof location !== "undefined" && location.protocol === "https:"
  const parts = [
    `${name}=${value}`,
    `Path=/`,
    `Max-Age=${maxAgeSeconds}`,
    `SameSite=Lax`,
  ]
  if (isHttps) parts.push("Secure")
  document.cookie = parts.join("; ")
}

function generateId(): string {
  // crypto.randomUUID is available everywhere we care about (Chrome 92+,
  // Safari 15.4+, Firefox 95+). Fall back to a non-cryptographic Math.random
  // string in the unlikely event it's missing — the value is just an
  // opaque identifier, not a security token.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

function captureCurrentTouch(): AttributionTouch {
  const url = new URL(window.location.href)
  const utm = extractUtmParams(url.searchParams)
  return {
    landing_page: url.pathname + url.search,
    referrer: document.referrer ? document.referrer.slice(0, 256) : undefined,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    ts: new Date().toISOString(),
  }
}

export default function MarketingAttributionClient() {
  useEffect(() => {
    // Guard against double-fire from React strict mode dev double-render
    // and from client-side navigation re-mounting the layout in some
    // setups.
    try {
      if (sessionStorage.getItem(BOOTSTRAP_FLAG) === "1") return
      sessionStorage.setItem(BOOTSTRAP_FLAG, "1")
    } catch {
      // sessionStorage can throw in private windows / cookie-blocked
      // environments. Fall through — we'll just bootstrap once per
      // page load instead of once per tab session.
    }

    try {
      // ----------------------------------------------------------------
      // 1. visitor_id (long-lived)
      // ----------------------------------------------------------------
      let visitorId = readCookie(ATTRIBUTION_COOKIES.visitorId)
      const visitorWasNew = !visitorId
      if (!visitorId) {
        visitorId = generateId()
        writeCookie(ATTRIBUTION_COOKIES.visitorId, visitorId, VISITOR_ID_MAX_AGE_SECONDS)
      }

      // ----------------------------------------------------------------
      // 2. session_id (rolling)
      // ----------------------------------------------------------------
      let sessionId = readCookie(ATTRIBUTION_COOKIES.sessionId)
      if (!sessionId) sessionId = generateId()
      // Always refresh max-age so an active visitor keeps the same
      // session id rolling for the full 30 min idle window.
      writeCookie(ATTRIBUTION_COOKIES.sessionId, sessionId, SESSION_ID_MAX_AGE_SECONDS)

      // ----------------------------------------------------------------
      // 3. touches
      // ----------------------------------------------------------------
      const currentTouch = captureCurrentTouch()
      const existingFirst = parseTouchCookie(readCookie(ATTRIBUTION_COOKIES.firstTouch))
      if (!existingFirst) {
        writeCookie(
          ATTRIBUTION_COOKIES.firstTouch,
          serializeTouchCookie(currentTouch),
          TOUCH_MAX_AGE_SECONDS,
        )
      }

      // Update last_touch only when the current request actually carries
      // UTM params OR a referrer change worth recording. This stops
      // refreshing the same page from clobbering a meaningful previous
      // touch with a UTM-less internal navigation.
      const url = new URL(window.location.href)
      if (hasAnyUtm(url.searchParams) || !readCookie(ATTRIBUTION_COOKIES.lastTouch)) {
        writeCookie(
          ATTRIBUTION_COOKIES.lastTouch,
          serializeTouchCookie(currentTouch),
          TOUCH_MAX_AGE_SECONDS,
        )
      }

      // ----------------------------------------------------------------
      // 4. visitor upsert — fired on EVERY page bootstrap, not just new
      // visitors. The endpoint inserts if missing and updates last_seen_at
      // (+ hashes) if the row already exists; first-touch fields stay
      // immutable. Returning visitors thus get a fresh last_seen_at.
      // ----------------------------------------------------------------
      // Fire-and-forget. We don't await — even if the network call
      // fails the user's page experience is unaffected.
      // (visitorWasNew kept available for any future per-new-visitor side
      // effect; right now we treat new and returning identically on the
      // wire, the server distinguishes via 23505.)
      void visitorWasNew
      fetch("/api/marketing/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use keepalive so the request survives a fast page nav-away.
        keepalive: true,
        body: JSON.stringify({
          visitorId,
          firstTouch: existingFirst || currentTouch,
        }),
      }).catch(() => {
        // Silent — analytics failures must not surface to users.
      })
    } catch {
      // Swallow everything. Tracking is best-effort.
    }
  }, [])

  return null
}
