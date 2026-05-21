/**
 * Crisis-language prefilter for the AI chat tools.
 *
 * Why this exists:
 *   The system prompts for the three tools contain crisis-redirect language,
 *   but the *trigger* for emitting that redirect lives inside the LLM's
 *   interpretation of the user message. A model that miscategorizes a
 *   high-risk message (and Gemini 2.5 Flash is the cheapest model in the
 *   family) will not surface 988. For a safety-critical surface, that is
 *   the wrong place to put the only line of defense.
 *
 *   This module is a *deterministic* second line: a set of high-confidence
 *   patterns that, when matched on ANY user message in the conversation,
 *   short-circuit the LLM call entirely and stream a hard-coded crisis-
 *   resources response instead.
 *
 * Design constraints:
 *   - Catch both explicit and euphemistic crisis language. The first version
 *     of this file required explicit verb-object constructions (`kill
 *     myself`, `end my life`) and missed common euphemism — `disappear
 *     forever`, `no way out`, `can't go on`, past-tense overdose
 *     disclosures. Those are exactly the phrasings real users in crisis
 *     reach for. The pattern set is now broader (still first-person where
 *     possible) but ANY match short-circuits to safety resources, so a
 *     false positive only redirects to 988 — never harmful.
 *   - Privacy-safe logging: only emit `[crisis-prefilter] triggered tool=X`,
 *     never the matched substring or the user message.
 *   - Session-sticky: ANY prior crisis match in the conversation history
 *     re-routes every subsequent turn to safety resources. The chat route
 *     calls `containsCrisisInAnyUserMessage` against the full message list
 *     rather than just the latest user turn. This means a user who once
 *     disclosed cannot then re-engage normal belief-exploration in the
 *     same conversation without explicitly starting a new session ("Start
 *     Over" button on the client clears the history).
 */

// Curated from 988 Suicide & Crisis Lifeline, Crisis Text Line, and
// Columbia Protocol screening guidance. Includes:
//   - Explicit verb-object intent ("kill myself", "end my life")
//   - First-person suicidal-ideation noun phrases ("suicidal", "want to die")
//   - Active self-harm (cutting / burning / hurting)
//   - Overdose intent AND past-tense overdose disclosure (medical emergency)
//   - Euphemistic family ("disappear forever", "no way out", "can't go on",
//     "burden", "better off without me", "make it stop")
//   - Violent intent toward others (first-person, action-imminent)
//
// Anchored to word boundaries to avoid substring false positives.
const CRISIS_PATTERNS: readonly RegExp[] = [
  // ─── Explicit self-directed kill / end-life intent ────────────────
  /\b(?:kill|killing|kill'?d)\s+(?:my\s*self|myself)\b/i,
  /\b(?:end|ending|ended)\s+(?:my\s+(?:life|own\s+life)|it\s+all|things|everything)\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\boff\s+myself\b/i,
  /\b(?:do|done|doing)\s+myself\s+in\b/i,
  /\bend\s+myself\b/i,

  // ─── Direct suicide statements ────────────────────────────────────
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?(?:commit\s+)?suicide\b/i,
  /\b(?:planning|plan)\s+(?:to|on|my)\s+suicide\b/i,
  /\bsuicidal\b/i,
  // Note: a bare "I have a plan" was tested as a generic trigger but it
  // false-positives on benign phrases ("I have a plan to visit my sister").
  // The dangerous variant — "plan to suicide" / "planning to suicide" — is
  // already caught by the pattern above.

  // ─── Want-to-die / no-reason-to-live family (first person) ─────────
  // Exclude the common idiom family ("die laughing", "die of X", "die for X",
  // "die with X") — false-positiving on figurative speech causes user friction.
  /\bi\s+(?:want|wanna)\s+to\s+die(?!\s+(?:laughing|of\s|for\s|already|with))\b/i,
  /\bi\s+want\s+to\s+be\s+dead\b/i,
  /\bi\s+wish\s+i\s+(?:was|were)\s+dead\b/i,
  /\bdon'?t\s+want\s+to\s+(?:live|be\s+alive|be\s+here)\s+(?:anymore|any\s*more)?\b/i,
  /\b(?:no|nothing)\s+(?:reason|point)\s+(?:to|in|for)\s+(?:living|being\s+alive|going\s+on)\b/i,
  /\bnot\s+worth\s+(?:living|being\s+alive)\b/i,
  /\bi'?d\s+rather\s+(?:not\s+be\s+here|be\s+dead)\b/i,

  // ─── Euphemistic family (added in operational-safety pass) ────────
  // "disappear" requires no benign continuation ("into a book", "behind a tree", etc.)
  // The crisis variant is bare or with "forever" / "from <abstract>" etc.
  /\b(?:i\s+want\s+to\s+|want\s+to\s+|wish\s+i\s+could\s+|i\s+just\s+want\s+to\s+)disappear(?!\s+(?:into|under|behind|inside|in\s+to))(?:\s+forever)?\b/i,
  /\bi\s+can'?t\s+(?:do\s+this|go\s+on|keep\s+going|take\s+(?:it|this|much\s+more)|live\s+like\s+this)\s+(?:anymore|any\s*more)?\b/i,
  /\b(?:no|don'?t\s+see\s+a)\s+way\s+out\b/i,
  /\bi'?m\s+(?:a\s+)?burden\b/i,
  /\beveryone\s+(?:would|will)\s+be\s+better\s+off\s+without\s+me\b/i,
  /\b(?:they|everyone|the\s+world|my\s+(?:family|kids|friends))\s+(?:would|will)\s+be\s+better\s+off\s+without\s+me\b/i,
  /\bi\s+just\s+want\s+(?:it|the\s+pain|everything|all\s+of\s+this)\s+to\s+stop\b/i,
  /\bi'?m\s+done(?:\s+with\s+(?:life|everything|this|it\s+all))?\b/i,
  /\bcan'?t\s+(?:see\s+a\s+future|imagine\s+(?:tomorrow|a\s+future|going\s+on))\b/i,
  /\bnothing\s+matters\s+(?:anymore|any\s*more)?\b/i,
  /\bgive\s+up\s+on\s+(?:life|living|everything)\b/i,
  /\bi'?m\s+tired\s+of\s+(?:being\s+alive|living|existing|fighting)\b/i,

  // ─── Active self-harm (first person, present/future or current state) ─
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?(?:cut|burn|hurt|harm)\s+myself\b/i,
  /\bi\s+(?:want|wanna|need)\s+to\s+(?:cut|burn|hurt|harm)\s+myself\b/i,
  // Apostrophe-aware: handle both "I'm thinking about hurting myself" (no
  // whitespace between i and 'm) and "I am thinking about ...". Same for
  // "I've been..." vs "I have been...".
  /\bi(?:\s+am|'?m)\s+thinking\s+about\s+(?:cutting|burning|hurting|harming)\s+myself\b/i,
  /\bi(?:\s+have\s+been|'?ve\s+been)\s+(?:cutting|burning|hurting|harming)\s+myself\b/i,

  // ─── Overdose intent + past-tense overdose disclosure ─────────────
  // Past-tense disclosure is a medical emergency, NOT just ideation.
  // Route the user to Poison Control + 911.
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?overdose\b/i,
  /\b(?:take|taking|swallow|swallowing|down|downing)\s+(?:the|all|every|a\s+(?:bunch|lot)\s+of|too\s+many)\s+(?:bottle|bottles|pills|tablets|capsules|meds)\b/i,
  /\bi\s+(?:took|swallowed|downed|popped|ate)\s+(?:too\s+many|a\s+bunch\s+of|a\s+lot\s+of|all\s+(?:the|of|my))\s+(?:pills|tablets|capsules|meds|tylenol|advil|aspirin|xanax|valium|klonopin|oxy|opiates|opioids)\b/i,
  /\bi\s+(?:od'?d|od'?ed|overdosed)\b/i,
  /\bi\s+have\s+(?:the\s+)?pills\s+(?:ready|in\s+front\s+of\s+me|right\s+here|in\s+my\s+hand)\b/i,

  // ─── Violent intent toward others (first person, action-imminent) ──
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)(?:kill|shoot|stab|hurt|attack)\s+(?:him|her|them|someone|people|my\s+\w+|the\s+\w+)\b/i,
] as const

/** Run the pattern set against a single message. */
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
 * Run the pattern set against EVERY user message in a conversation. The
 * chat route uses this for session-sticky safety routing: once ANY user
 * turn in the history matched, all subsequent turns route to safety
 * resources without calling the LLM. The user "exits" by clicking Start
 * Over (which clears the message history) — no in-conversation reset.
 */
export function containsCrisisInAnyUserMessage(messages: unknown): boolean {
  for (const text of iterateUserMessageTexts(messages)) {
    if (detectCrisisLanguage(text)) return true
  }
  return false
}

/**
 * Hard-coded crisis-resource response. Streamed back to the user verbatim
 * via createUIMessageStream — never goes through the LLM, so the output
 * is byte-for-byte deterministic.
 *
 * Content policy (set by operator): minimal, factual, no therapeutic
 * framing. Lists 911 / 988 / Crisis Text Line / Poison Control / global
 * fallback. Exact copy beyond this minimum is held for operator review.
 */
export const CRISIS_RESPONSE_TEXT = `This tool can't help with what you're describing right now. Please reach a human.

If you are in immediate danger: call 911 (US) or your local emergency number.

US — 988 Suicide & Crisis Lifeline: call or text 988.
US — Crisis Text Line: text HOME to 741741.
US — Poison Control (overdose / poisoning): 1-800-222-1222.
International: findahelpline.com lists crisis lines by country.

This conversation has been paused. To return to belief exploration, start a new session.`

/**
 * Extract the latest user-role message text from a UI message list.
 * Kept for backwards compatibility; new code should use
 * `containsCrisisInAnyUserMessage` which scans the full history.
 */
export function getLatestUserMessageText(messages: unknown): string {
  if (!Array.isArray(messages)) return ""
  for (let i = messages.length - 1; i >= 0; i--) {
    const t = extractUserMessageText(messages[i])
    if (t !== null) return t
  }
  return ""
}

/**
 * Yield the text of every user-role message in order. Tolerates both the
 * AI SDK v6 UIMessage shape (parts[]) and the legacy { role, content }
 * shape.
 */
function* iterateUserMessageTexts(messages: unknown): Generator<string> {
  if (!Array.isArray(messages)) return
  for (const msg of messages) {
    const t = extractUserMessageText(msg)
    if (t !== null) yield t
  }
}

function extractUserMessageText(msg: unknown): string | null {
  if (!msg || typeof msg !== "object") return null
  const m = msg as Record<string, unknown>
  if (m.role !== "user") return null

  // Legacy shape: { role, content: string }
  if (typeof m.content === "string") return m.content

  // AI SDK v6 UIMessage shape: { role, parts: [{ type: "text", text }] }
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
