/**
 * Safety layer for the AI chat tools.
 *
 * The tiered CLASSIFIER (Tier 1 explicit danger / Tier 2 possible acute state /
 * Tier 3 ordinary) lives in the dependency-free `crisis-classifier.mjs` so it
 * can be unit-tested from a plain Node script without a TypeScript loader
 * (see scripts/test-crisis-detection.mjs). This file re-exports that API for
 * the app and keeps the conversation-size caps.
 *
 * Why deterministic: the LLM (the cheapest model in the family) is not a
 * reliable place for the only line of safety defense, so explicit-danger
 * routing is done deterministically and streamed without an LLM call.
 */

import { extractUserMessageText } from "./crisis-classifier.mjs"

export {
  detectExplicitDanger,
  detectPossibleAcuteState,
  containsExplicitDangerInAnyUserMessage,
  classifyConversationSafety,
  getLatestUserMessageText,
  CRISIS_RESPONSE_TEXT,
  ACUTE_STATE_SUPPORT_TEXT,
} from "./crisis-classifier.mjs"

// ─── Conversation-size caps (unchanged; consumed by the chat route) ───

/** Maximum allowed length of a single user message, in characters.
 *  Mirrors MAX_TEXT_LEN in /api/export/route.ts so the two surfaces
 *  have aligned input-size policy. */
export const MAX_MESSAGE_CHARS = 8000

/** Maximum allowed total characters across the full conversation. At
 *  ~4 chars/token this caps an individual chat session at roughly
 *  25k input tokens — well below model context limits but a hard cap
 *  on cost per request. */
export const MAX_CONVERSATION_CHARS = 100_000

/** Validate one user message length. Returns the first offending length
 *  found, or null if all messages are within the cap. */
export function findOversizeUserMessage(messages: unknown): number | null {
  if (!Array.isArray(messages)) return null
  for (const msg of messages) {
    const text = extractUserMessageText(msg)
    if (text !== null && text.length > MAX_MESSAGE_CHARS) {
      return text.length
    }
  }
  return null
}

/** Aggregate total character count across all message contents — used by the
 *  total-conversation-size gate so a motivated user can't bypass our per-
 *  message cap by sending many medium-sized messages and inflating the
 *  upstream token bill. */
export function totalConversationCharCount(messages: unknown): number {
  if (!Array.isArray(messages)) return 0
  let total = 0
  for (const msg of messages) {
    if (!msg || typeof msg !== "object") continue
    const m = msg as Record<string, unknown>
    if (typeof m.content === "string") {
      total += m.content.length
      continue
    }
    const parts = m.parts
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (!part || typeof part !== "object") continue
        const p = part as Record<string, unknown>
        if (typeof p.text === "string") total += p.text.length
      }
    }
  }
  return total
}
