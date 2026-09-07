import { track } from "@vercel/analytics/react"
import { hasAnalyticsConsent } from "@/lib/consent"

/**
 * Custom behavioral events.
 *
 * These are NOT page views. They describe what a person did inside the
 * reflection tools — which tool, how many turns, how long before the first
 * message, whether they bought an export, how they rated the session. Page
 * views are counted cookielessly for every visitor; this behavioral layer is
 * only sent for visitors who explicitly accepted on the consent banner, which
 * is what the privacy page and the banner say.
 *
 * Every helper below goes through `emit`, so there is exactly one guarded call
 * site. Do not call `track` directly from anywhere else.
 */
type EventProps = Record<string, string | number | boolean | null>

function emit(name: string, props?: EventProps) {
  if (!hasAnalyticsConsent()) return
  track(name, props)
}

export type AnalyticsTool = "reset" | "belief_inquiry" | "integration"

export function trackToolViewed(tool: AnalyticsTool) {
  emit("tool_viewed", { tool })
}

export function trackToolStarted(tool: AnalyticsTool) {
  emit("tool_started", { tool })
}

export function trackTurnReached(tool: AnalyticsTool, count: 3 | 6 | 10) {
  emit(`turn_reached_${count}`, { tool })
}

export function trackSessionCompleted(tool: AnalyticsTool, totalTurns: number) {
  emit("session_completed", { tool, total_turns: totalTurns })
}

export function trackTimeToFirstMessage(tool: AnalyticsTool, milliseconds: number) {
  emit("time_to_first_message", { tool, ms: milliseconds })
}

export function trackExportCtaViewed(tool: AnalyticsTool) {
  emit("export_cta_viewed", { tool })
}

export function trackExportCtaClicked(tool: AnalyticsTool) {
  emit("export_cta_clicked", { tool })
}

export function trackExportPurchased(tool: AnalyticsTool) {
  emit("export_purchased", { tool })
}

export type FeedbackRating = "grounded" | "uncertain" | "not_for_me" | "skip"

export function trackSessionFeedback(tool: AnalyticsTool, rating: FeedbackRating) {
  emit("session_feedback", { tool, rating })
}
