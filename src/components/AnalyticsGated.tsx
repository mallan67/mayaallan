"use client"

/**
 * The site's two measurement layers, split by what they actually store.
 *
 * - CookielessAnalytics → Vercel Web Analytics. Counts page views and reports
 *   path, referrer, country, device and browser. It sets NO cookie and writes
 *   NO identifier to the visitor's device, so it is not the kind of storage
 *   access that requires consent under ePrivacy, and it runs for every
 *   visitor. Without it the site measured nothing at all: page views were
 *   previously gated behind the consent banner, so every undecided or
 *   declining visitor was invisible.
 *
 * - GatedMarketing → MarketingAttributionClient. This one DOES store a
 *   long-lived visitor ID and a per-visit session ID in first-party cookies
 *   and ties campaign attribution to later purchases. That is consented
 *   storage, so it mounts only after the visitor accepts.
 *
 * Keep this split intact. If a future change makes the page-view layer store
 * an identifier, it belongs behind the consent gate with the other one, and
 * the privacy page has to change with it.
 */

import { Analytics } from "@vercel/analytics/next"
import MarketingAttributionClient from "@/components/MarketingAttributionClient"
import { useConsent } from "@/components/ConsentBanner"

export function CookielessAnalytics() {
  return <Analytics />
}

export function GatedMarketing() {
  const consent = useConsent()
  if (consent !== "accepted") return null
  return <MarketingAttributionClient />
}
