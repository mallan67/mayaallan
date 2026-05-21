"use client"

/**
 * Cookie consent banner — GDPR / UK GDPR / ePrivacy compliance.
 *
 * Design:
 *   - Three persistent states stored in localStorage under
 *     `mayaallan_consent_v1`:
 *       "accepted"  → analytics + attribution mount
 *       "rejected"  → analytics + attribution stay off
 *       (null)      → banner is shown; analytics + attribution stay off
 *   - Dispatches a `consent-changed` window event when the choice changes
 *     so peer components (Analytics gate, MarketingAttribution gate) can
 *     react without coupling.
 *   - Strict-necessary cookies (admin session, in-progress checkout,
 *     rate-limit counters) are NOT gated — they don't require consent
 *     under GDPR Art. 6(1)(f) (legitimate interest) / ePrivacy carve-out.
 *   - Only the analytics + attribution stack is gated.
 *
 * Why in-house instead of klaro / cookieyes:
 *   - Single banner copy, single decision, two outcomes — overkill to pull
 *     in a 50KB dependency.
 *   - We control the privacy story end-to-end; readers expect a quiet,
 *     understated UI consistent with the rest of the site.
 *
 * Footer link "Cookie preferences" re-shows the banner so users can
 * change their mind.
 */

import { useEffect, useState } from "react"

const STORAGE_KEY = "mayaallan_consent_v1"
const CONSENT_EVENT = "mayaallan:consent-changed"

export type ConsentState = "accepted" | "rejected" | null

function readConsent(): ConsentState {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === "accepted" || raw === "rejected") return raw
    return null
  } catch {
    return null
  }
}

function writeConsent(value: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
  } catch {
    // Ignore — private windows / storage disabled.
  }
}

/**
 * Hook for peer components to subscribe to consent state. Re-renders the
 * subscriber on mount AND whenever consent changes.
 */
export function useConsent(): ConsentState {
  const [state, setState] = useState<ConsentState>(null)

  useEffect(() => {
    setState(readConsent())
    const handler = () => setState(readConsent())
    window.addEventListener(CONSENT_EVENT, handler)
    // Also listen for cross-tab changes via the storage event.
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener(CONSENT_EVENT, handler)
      window.removeEventListener("storage", handler)
    }
  }, [])

  return state
}

/**
 * Imperative "show the banner again" helper — wired to the footer link.
 * Clears localStorage so the consent state goes back to null; the banner
 * then re-mounts automatically.
 */
export function reopenConsent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }))
  } catch {
    // Ignore.
  }
}

export default function ConsentBanner() {
  const consent = useConsent()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until we've checked localStorage on the client.
  // SSR sees null, client SSR-mismatches if we showed/hid based on initial
  // null state, so we hold the render until after mount.
  if (!mounted) return null
  if (consent !== null) return null

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal text-cream shadow-2xl border-t border-gold/20"
    >
      <div className="max-w-5xl mx-auto px-4 py-5 md:py-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <p id="consent-title" className="font-semibold text-base md:text-lg">
            Privacy choices
          </p>
          <p id="consent-body" className="text-sm text-cream/80 mt-1 leading-relaxed">
            We use a small set of first-party cookies to measure how the site is performing —
            anonymous visitor IDs and UTM-based campaign attribution. No advertising trackers, no
            cross-site sharing.{" "}
            <a href="/privacy" className="underline hover:text-gold">
              See our privacy policy
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => writeConsent("rejected")}
            className="px-5 py-2.5 text-sm font-medium border border-cream/30 rounded-full hover:bg-cream/10 transition-colors"
          >
            Reject analytics
          </button>
          <button
            type="button"
            onClick={() => writeConsent("accepted")}
            className="px-5 py-2.5 text-sm font-semibold bg-gold text-charcoal rounded-full hover:bg-gold/90 transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
