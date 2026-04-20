import { track } from "@vercel/analytics/react"

export type AnalyticsTool = "reset" | "belief_inquiry" | "integration"

export function trackToolViewed(tool: AnalyticsTool) {
  track("tool_viewed", { tool })
}

export function trackToolStarted(tool: AnalyticsTool) {
  track("tool_started", { tool })
}

export function trackTurnReached(tool: AnalyticsTool, count: 3 | 6 | 10) {
  track(`turn_reached_${count}`, { tool })
}

export function trackSessionCompleted(
  tool: AnalyticsTool,
  totalTurns: number
) {
  track("session_completed", { tool, total_turns: totalTurns })
}

export function trackTimeToFirstMessage(
  tool: AnalyticsTool,
  milliseconds: number
) {
  track("time_to_first_message", { tool, ms: milliseconds })
}

export function trackExportCtaViewed(tool: AnalyticsTool) {
  track("export_cta_viewed", { tool })
}

export function trackExportCtaClicked(tool: AnalyticsTool) {
  track("export_cta_clicked", { tool })
}

export function trackExportPurchased(tool: AnalyticsTool) {
  track("export_purchased", { tool })
}

export type FeedbackRating = "grounded" | "uncertain" | "not_for_me" | "skip"

export function trackSessionFeedback(tool: AnalyticsTool, rating: FeedbackRating) {
  track("session_feedback", { tool, rating })
}
