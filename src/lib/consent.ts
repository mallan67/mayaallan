/**
 * Consent state storage — the single source of truth for whether a visitor
 * has agreed to the cookie-based layer.
 *
 * This lives in lib/, with no React, so non-component code can ask the
 * question too. `src/lib/analytics.ts` needs it: page views are counted for
 * everyone (cookieless), but the custom behavioral events — tool usage, turn
 * counts, session timing, export actions, feedback ratings — are only sent
 * for visitors who accepted.
 *
 * ConsentBanner re-exports the pieces components use and owns the UI.
 */

export const CONSENT_STORAGE_KEY = "mayaallan_consent_v1"
export const CONSENT_EVENT = "mayaallan:consent-changed"

export type ConsentState = "accepted" | "rejected" | null

/** Current stored choice. Server-side, private windows and blocked storage all read as null. */
export function readConsent(): ConsentState {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (raw === "accepted" || raw === "rejected") return raw
    return null
  } catch {
    return null
  }
}

/** True only for an explicit acceptance. Undecided is not consent. */
export function hasAnalyticsConsent(): boolean {
  return readConsent() === "accepted"
}

export function writeConsent(value: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
  } catch {
    // Ignore — private windows / storage disabled.
  }
}

export function clearConsent() {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }))
  } catch {
    // Ignore — private windows / storage disabled.
  }
}
