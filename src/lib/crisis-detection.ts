/**
 * Crisis-language prefilter for the AI chat tools.
 *
 * Why this exists:
 *   The system prompts for the three tools contain excellent crisis-redirect
 *   language, but the *trigger* for emitting that redirect lives inside the
 *   LLM's interpretation of the user message. A model that miscategorizes a
 *   high-risk message (and Gemini 2.5 Flash is the cheapest model in the
 *   family) will not surface 988. For a safety-critical surface, that is
 *   the wrong place to put the only line of defense.
 *
 *   This module is a *deterministic* second line: a small set of
 *   high-confidence patterns that, when matched on the most recent user
 *   message, short-circuit the LLM call entirely and stream a hard-coded
 *   crisis-resources response instead.
 *
 * Design constraints:
 *   - Low false-positive rate. Patterns must match clear self-harm intent,
 *     not just keywords like "depression" / "anxiety" / "suicide" used in
 *     reference / news / academic contexts.
 *   - Conservative: when in doubt, do NOT trigger. The LLM will still see
 *     the message and can route to its own redirect.
 *   - Privacy-safe logging: only emit `[crisis-prefilter] triggered tool=X`,
 *     never the matched substring or the user message.
 *   - Stateless: each user turn is rechecked. We don't track "session has
 *     once triggered" because sessions aren't server-persisted today.
 */

// Curated from 988 Suicide & Crisis Lifeline and Crisis Text Line guidance on
// high-confidence ideation/intent language. Each pattern is conservative:
// either an explicit verb-object construction ("kill myself", "end my life")
// or an unambiguous noun phrase ("suicidal", "want to die"). Avoids matching
// metaphorical or third-person uses (e.g., "this work is killing me", "she
// tried to kill herself in the news article I read").
//
// Anchored to word boundaries to avoid substring false positives.
const CRISIS_PATTERNS: readonly RegExp[] = [
  // Explicit self-directed kill / end-life intent
  /\b(?:kill|killing|kill'?d)\s+(?:my\s*self|myself)\b/i,
  /\b(?:end|ending|ended)\s+(?:my\s+(?:life|own\s+life)|it\s+all)\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\boff\s+myself\b/i,
  /\b(?:do|done|doing)\s+myself\s+in\b/i,
  /\bend\s+myself\b/i,

  // Direct suicide statements
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?(?:commit\s+)?suicide\b/i,
  /\b(?:planning|plan)\s+(?:to|on|my)\s+suicide\b/i,
  /\bsuicidal\b/i,

  // Want-to-die / no-reason-to-live family (first person)
  /\bi\s+(?:want|wanna)\s+to\s+die\b/i,
  /\bi\s+want\s+to\s+be\s+dead\b/i,
  /\bi\s+wish\s+i\s+(?:was|were)\s+dead\b/i,
  /\bdon'?t\s+want\s+to\s+(?:live|be\s+alive|be\s+here)\s+(?:anymore|any\s*more)?\b/i,
  /\b(?:no|nothing)\s+(?:reason|point)\s+(?:to|in|for)\s+(?:living|being\s+alive|going\s+on)\b/i,
  /\bnot\s+worth\s+(?:living|being\s+alive)\b/i,

  // Active self-harm (cutting/burning intent, first person, present/future)
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?(?:cut|burn|hurt|harm)\s+myself\b/i,
  /\bi\s+(?:want|wanna|need)\s+to\s+(?:cut|burn|hurt|harm)\s+myself\b/i,

  // Overdose intent (first person)
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?overdose\b/i,
  /\b(?:take|swallow|down)\s+(?:the|all|every)\s+(?:bottle|pills|tablets)\b/i,

  // Violent intent toward others (first person, action-imminent)
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)(?:kill|shoot|stab|hurt)\s+(?:him|her|them|someone|people|people)\b/i,
] as const

export function detectCrisisLanguage(text: string): boolean {
  if (typeof text !== "string" || text.length === 0) return false
  // Cap scan length to bound regex work on adversarial input.
  const scanText = text.length > 10_000 ? text.slice(0, 10_000) : text
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(scanText)) return true
  }
  return false
}

/**
 * Hard-coded crisis-resource response. Streamed back to the user verbatim
 * when the prefilter matches. No LLM involvement — fully deterministic.
 *
 * Content principles:
 *   - Lead with acknowledgment, not a directive.
 *   - 988 is the primary US resource (call OR text), prominent.
 *   - Include Crisis Text Line as a secondary channel for users who can't talk.
 *   - International users get one global resource (findahelpline.com aggregates
 *     by country) — covers the largest gap without listing 50 countries.
 *   - Explicitly invite the user to continue the conversation if they want;
 *     this is not a brush-off. The chat tool is still here.
 */
export const CRISIS_RESPONSE_TEXT = `I'm hearing something that sounds heavy and I want to make sure you have access to support beyond what this tool can offer.

If you're in the US: please reach out to the 988 Suicide & Crisis Lifeline — call or text 988, anytime. There's a real human on the other end.

If you'd rather text: Crisis Text Line — text HOME to 741741.

If you're outside the US: findahelpline.com lists crisis lines by country.

I'm still here if you want to keep talking — about what's happening, or about anything else. I just wanted to make sure those resources are in your hands first.`

/**
 * Extract the latest user-role message text from a UI message list.
 * Tolerates the AI SDK v6 UIMessage shape (parts[]) and the legacy
 * { role, content } shape. Returns "" if no user message is found.
 */
export function getLatestUserMessageText(messages: unknown): string {
  if (!Array.isArray(messages)) return ""
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (!msg || typeof msg !== "object") continue
    const m = msg as Record<string, unknown>
    if (m.role !== "user") continue

    // Legacy shape: { role, content: string }
    if (typeof m.content === "string") return m.content

    // AI SDK v6 UIMessage shape: { role, parts: [{ type: "text", text: string }] }
    const parts = m.parts
    if (Array.isArray(parts)) {
      const texts: string[] = []
      for (const part of parts) {
        if (!part || typeof part !== "object") continue
        const p = part as Record<string, unknown>
        if (p.type === "text" && typeof p.text === "string") texts.push(p.text)
      }
      if (texts.length > 0) return texts.join("\n")
    }

    // Fallback: stringify in case of unknown shape.
    return ""
  }
  return ""
}
