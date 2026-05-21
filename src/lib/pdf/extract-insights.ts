/**
 * Heuristic insight extraction for the session-export PDF.
 *
 * The previous PDF dumped the first 6 assistant messages verbatim into a
 * "Key reflections" section. That meant a 20-turn session printed the
 * opening (where the bot was still figuring out what the user meant)
 * rather than the closing (where the anchor and shift live).
 *
 * This helper extracts a small set of structured fields the PDF can render
 * deterministically, without calling an LLM. Heuristic now; can be
 * replaced with an LLM-based summarization pass once the operator approves
 * the summarization prompt language.
 *
 * Fields extracted:
 *   - belief_brought_in: first user message (verbatim)
 *   - closing_user_reflection: last user message (verbatim)
 *   - closing_assistant_anchor: the assistant message immediately preceding
 *     the [SESSION_COMPLETE] marker; falls back to the last assistant
 *     message if the marker isn't present
 *   - mid_assistant_reflections: the last 3 assistant messages BEFORE the
 *     closing-assistant-anchor (so the PDF surfaces the closing arc, not
 *     the opening warm-up)
 *   - transcript_for_appendix: the full conversation as ordered turns
 *
 * No LLM call. Stateless. Pure function of the message array.
 */

import type { PdfMessage } from "@/lib/pdf/template"

const SESSION_COMPLETE_MARKER = "[SESSION_COMPLETE]"

/**
 * Structural insights extracted from a conversation. Field names are
 * deliberately factual / placeholder so the operator can rewrite the
 * PDF labels later without renaming the data contract.
 */
export type ExtractedInsights = {
  beliefBroughtIn: string | null
  closingUserReflection: string | null
  closingAssistantAnchor: string | null
  midAssistantReflections: PdfMessage[]
  transcriptForAppendix: PdfMessage[]
  /** Number of user turns in the conversation — useful for footer copy. */
  userTurnCount: number
}

function stripCompleteMarker(text: string): string {
  return text.replace(SESSION_COMPLETE_MARKER, "").trim()
}

export function extractInsights(messages: PdfMessage[]): ExtractedInsights {
  // Filter to non-empty messages after marker-strip, preserving order.
  const cleaned: PdfMessage[] = messages
    .map((m) => ({ role: m.role, text: stripCompleteMarker(m.text) }))
    .filter((m) => m.text.length > 0)

  const userMessages = cleaned.filter((m) => m.role === "user")
  const assistantMessages = cleaned.filter((m) => m.role === "assistant")

  const beliefBroughtIn = userMessages[0]?.text ?? null
  const closingUserReflection =
    userMessages.length > 1 ? userMessages[userMessages.length - 1].text : null

  // Locate the SESSION_COMPLETE anchor. The chat client strips the marker
  // before sending to the export route, so the original marker is no longer
  // in `text` — but the marker WAS placed by the model immediately AFTER
  // its anchor message. So the assistant message just before the marker-
  // emitting one is the anchor. Since the marker has been stripped, we
  // check the ORIGINAL messages (with marker) to find the anchor index.
  let anchorIndex = -1
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].text.includes(SESSION_COMPLETE_MARKER)) {
      // The marker-bearing message itself is the anchor (it's the bot's
      // closing statement, often containing the named shift / image / line).
      anchorIndex = i
      break
    }
  }

  let closingAssistantAnchor: string | null = null
  if (anchorIndex >= 0) {
    const anchorMsg = messages[anchorIndex]
    if (anchorMsg.role === "assistant") {
      closingAssistantAnchor = stripCompleteMarker(anchorMsg.text) || null
    }
  }
  // Fallback: last assistant message in the conversation
  if (!closingAssistantAnchor && assistantMessages.length > 0) {
    closingAssistantAnchor = assistantMessages[assistantMessages.length - 1].text
  }

  // Mid reflections: last 3 assistant messages BEFORE the anchor (or last 3
  // overall if no anchor was identified). Reverse-chronological selection
  // surfaces the closing arc rather than the opening warm-up.
  let midReflectionsRaw: PdfMessage[]
  if (assistantMessages.length <= 1) {
    midReflectionsRaw = []
  } else if (closingAssistantAnchor && assistantMessages[assistantMessages.length - 1].text === closingAssistantAnchor) {
    // Drop the anchor itself, take up to the 3 messages before it.
    midReflectionsRaw = assistantMessages.slice(0, -1).slice(-3)
  } else {
    midReflectionsRaw = assistantMessages.slice(-3)
  }

  return {
    beliefBroughtIn,
    closingUserReflection,
    closingAssistantAnchor,
    midAssistantReflections: midReflectionsRaw,
    transcriptForAppendix: cleaned,
    userTurnCount: userMessages.length,
  }
}

/**
 * Minimum number of user turns required before paid export is allowed.
 * Below this, the chat is too thin to produce a useful keepsake — and
 * the customer paying $9.99 for a one-question PDF is a refund risk.
 *
 * Kept as a const so it's referenced consistently by the export route
 * gate AND by the client-side button gate.
 */
export const MIN_USER_TURNS_FOR_EXPORT = 3
