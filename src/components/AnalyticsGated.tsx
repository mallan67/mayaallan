"use client"

/**
 * Consent-gated wrappers for the analytics + attribution stack. Renders
 * the underlying components ONLY when the user has accepted analytics.
 *
 * - GatedAnalytics  → wraps @vercel/analytics
 * - GatedMarketing  → wraps MarketingAttributionClient (visitor / session
 *                     cookies + UTM capture + /api/marketing/visitor upsert)
 *
 * Both components return null until consent is "accepted". When the user
 * accepts mid-session, the gates rerender and the wrapped components
 * mount and bootstrap. Rejected / undecided users see no analytics at
 * all.
 */

import { Analytics } from "@vercel/analytics/next"
import MarketingAttributionClient from "@/components/MarketingAttributionClient"
import { useConsent } from "@/components/ConsentBanner"

export function GatedAnalytics() {
  const consent = useConsent()
  if (consent !== "accepted") return null
  return <Analytics />
}

export function GatedMarketing() {
  const consent = useConsent()
  if (consent !== "accepted") return null
  return <MarketingAttributionClient />
}
