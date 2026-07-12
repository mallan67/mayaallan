/**
 * Tiered safety classifier for the AI chat tools (pure, dependency-free).
 *
 * This module is deliberately plain `.mjs` so it can be imported BOTH by the
 * Next.js app (via crisis-detection.ts) AND by a dependency-free Node test
 * script (scripts/test-crisis-detection.mjs) without a TypeScript loader.
 *
 * Three tiers (see the audit findings for rationale):
 *
 *   TIER 1 — EXPLICIT DANGER (`explicit`)
 *     High-confidence, first-person statements of intent/plan to end one's
 *     life, active self-harm, overdose/poisoning, imminent violence toward
 *     others, or command hallucinations paired with a harm instruction.
 *     Handling: deterministic hard redirect, SESSION-STICKY (any prior match
 *     in the history re-routes every later turn), streamed without the LLM.
 *
 *   TIER 2 — POSSIBLE ACUTE STATE (`acute`)
 *     Narrow, phrase-combination markers for possible mania (multi-day
 *     sleeplessness), dissociation/derealization, coercion/abuse (control of
 *     movement), or non-command auditory hallucinations. These phrases are
 *     ambiguous, so the response is SOFT: a grounding + support message with
 *     international resources, NON-STICKY, transcript preserved, method
 *     resumes on the next ordinary turn. A false positive here is cheap
 *     because it never locks the user out.
 *
 *   TIER 3 — ORDINARY DISTRESS (`normal`)
 *     Everything else — the reflection tool continues with normal boundaries.
 *
 * Design rules for Tier 2 (per review): require phrase combinations and
 * context, never broad single-token matching. "I haven't slept in four days"
 * is a marker; "I haven't slept well lately" is not. "won't let me leave" is a
 * marker; "doesn't want me to leave the party" is not.
 */

// ─── TIER 1: explicit danger (deterministic, sticky) ──────────────────
// Anchored to word boundaries; first-person where possible. Tightened from
// the previous single-tier set to remove high-false-positive phrases that
// collide with ordinary belief-exploration ("I'm a burden", bare "I'm done",
// "nothing matters"), and extended to catch explicit self-harm PLANS.
const EXPLICIT_DANGER_PATTERNS = [
  // Explicit self-directed kill / end-life intent
  /\b(?:kill|killing)\s+(?:my\s*self|myself)\b/i,
  /\b(?:end|ending|ended)\s+(?:my\s+(?:own\s+)?life|it\s+all)\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\boff\s+myself\b/i,
  /\b(?:do|done|doing)\s+myself\s+in\b/i,
  /\bend\s+myself\b/i,

  // Direct suicide statements
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?(?:commit\s+)?suicide\b/i,
  /\b(?:planning|plan)\s+(?:to|on|my)\s+suicide\b/i,
  /\bsuicidal\b/i,

  // Explicit PLAN to self-harm — false-negative fix ("I have a plan to hurt
  // myself tonight" was previously uncaught).
  /\bplan(?:ning)?\s+to\s+(?:hurt|kill|harm|end)\s+(?:my\s*self|myself|my\s+(?:own\s+)?life)\b/i,

  // Want-to-die / no-reason-to-live family (first person). Figurative "die"
  // idioms excluded.
  /\bi\s+(?:want|wanna)\s+to\s+die(?!\s+(?:laughing|of\s|for\s|already|with))\b/i,
  /\bi\s+want\s+to\s+be\s+dead\b/i,
  /\bi\s+wish\s+i\s+(?:was|were)\s+dead\b/i,
  /\bdon'?t\s+want\s+to\s+(?:live|be\s+alive|be\s+here)\s+(?:anymore|any\s*more)?\b/i,
  /\b(?:no|nothing)\s+(?:reason|point)\s+(?:to|in|for)\s+(?:living|being\s+alive|going\s+on)\b/i,
  /\bnot\s+worth\s+(?:living|being\s+alive)\b/i,
  /\bi'?d\s+rather\s+(?:not\s+be\s+here|be\s+dead)\b/i,

  // Euphemistic — HIGH-CONFIDENCE ONLY (tightened to avoid locking users out
  // for ambiguous distress).
  /\b(?:i\s+want\s+to\s+|want\s+to\s+|wish\s+i\s+could\s+|i\s+just\s+want\s+to\s+)disappear\s+(?:forever|for\s+good)\b/i,
  /\bi\s+can'?t\s+(?:go\s+on|keep\s+going|live\s+like\s+this)\s+(?:anymore|any\s*more)?\b/i,
  /\b(?:everyone|they|the\s+world|my\s+(?:family|kids|friends|wife|husband|partner))\s+(?:would|will|'?d|'?ll)\s+be\s+better\s+off\s+without\s+me\b/i,
  /\bi\s+just\s+want\s+(?:the\s+pain|everything|all\s+of\s+this)\s+to\s+stop\b/i,
  /\bi'?m\s+done\s+with\s+(?:life|living|everything|it\s+all)\b/i,
  /\bcan'?t\s+(?:see\s+a\s+future|imagine\s+(?:tomorrow|a\s+future|going\s+on))\b/i,
  /\bgive\s+up\s+on\s+(?:life|living)\b/i,
  /\bi'?m\s+tired\s+of\s+(?:being\s+alive|living|existing)\b/i,

  // Active self-harm (first person)
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?(?:cut|burn|hurt|harm)\s+myself\b/i,
  /\bi\s+(?:want|wanna|need)\s+to\s+(?:cut|burn|hurt|harm)\s+myself\b/i,
  /\bi(?:\s+am|'?m)\s+thinking\s+about\s+(?:cutting|burning|hurting|harming)\s+myself\b/i,
  /\bi(?:\s+have\s+been|'?ve\s+been)\s+(?:cutting|burning|hurting|harming)\s+myself\b/i,

  // Overdose intent + past-tense overdose disclosure (medical emergency)
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)?overdose\b/i,
  /\b(?:take|taking|swallow|swallowing|down|downing)\s+(?:the|all|every|a\s+(?:bunch|lot)\s+of|too\s+many)\s+(?:bottle|bottles|pills|tablets|capsules|meds)\b/i,
  /\bi\s+(?:took|swallowed|downed|popped|ate)\s+(?:too\s+many|a\s+bunch\s+of|a\s+lot\s+of|all\s+(?:the|of|my))\s+(?:pills|tablets|capsules|meds|tylenol|advil|aspirin|xanax|valium|klonopin|oxy|opiates|opioids)\b/i,
  /\bi\s+(?:od'?d|od'?ed|overdosed)\b/i,
  /\bi\s+have\s+(?:the\s+)?pills\s+(?:ready|in\s+front\s+of\s+me|right\s+here|in\s+my\s+hand)\b/i,

  // Violent intent toward others (first person, imminent)
  /\bi'?m\s+(?:going\s+to\s+|gonna\s+|about\s+to\s+)(?:kill|shoot|stab|hurt|attack)\s+(?:him|her|them|someone|people|my\s+\w+|the\s+\w+)\b/i,
  // Command hallucination PAIRED WITH a harm instruction → Tier 1.
  /\bvoices?\s+(?:are\s+)?(?:telling|tell)\s+me\s+to\s+(?:hurt|kill|harm|attack)\b/i,
]

// ─── TIER 2: possible acute state (deterministic, SOFT, non-sticky) ────
// Narrow, combination/context markers only. Because the response is soft and
// never locks, a false positive costs the user only a gentle check-in.
const ACUTE_STATE_PATTERNS = [
  // Mania — specific multi-day sleeplessness (a phrase combination, not
  // "tired"/"slept badly"). Requires an explicit "in/for N days|nights".
  /\b(?:haven'?t|have\s+not|hardly|barely|not)\s+slept\s+(?:in|for)\s+(?:\d+|two|three|four|five|six|seven|a\s+few|several|many)\s+(?:days|nights)\b/i,

  // Dissociation / derealization — present-state, specific phrasings.
  /\bnothing\s+(?:feels|seems)\s+real\b/i,
  /\bi'?m\s+not\s+real\b/i,
  /\b(?:watching|seeing)\s+myself\s+from\s+(?:outside|above|afar)\b/i,
  /\b(?:outside|above)\s+my\s+(?:own\s+)?body\b/i,
  /\bdetached\s+from\s+(?:my\s+body|reality|myself)\b/i,
  /\blike\s+i'?m\s+not\s+(?:really\s+)?(?:here|real)\b/i,

  // Possible psychosis — hearing voices WITHOUT a harm command (a harm
  // command is caught by Tier 1 first) → soft check.
  /\b(?:i\s+)?(?:hear|hearing|heard)\s+voices?\b/i,
  /\bvoices?\s+in\s+my\s+head\b/i,

  // Coercion / control of movement or isolation — requires a relational
  // subject (partner/spouse/…) OR explicit confinement / isolation / fear.
  // Deliberately does NOT match generic obstacle language such as "work/
  // traffic keeps me from …", "my boss won't let me leave early", or
  // "monitors every move" — all common, benign, non-abuse phrasings.
  /\b(?:partner|spouse|husband|wife|boyfriend|girlfriend)\s+(?:won'?t|will\s+not|does\s*n'?t|doesn'?t|do\s+not)\s+let\s+me\s+(?:leave|go\s+out|go\b|out\b)/i,
  /\bnot\s+allowed\s+to\s+leave\s+(?:the\s+)?(?:house|apartment|flat|room|home)\b/i,
  /\b(?:won'?t|will\s+not|does\s*n'?t|doesn'?t|do\s+not)\s+let\s+me\s+leave\s+(?:the\s+)?(?:house|apartment|flat|room|home)\b/i,
  /\b(?:won'?t|will\s+not|does\s*n'?t|doesn'?t|do\s+not)\s+let\s+me\s+see\s+(?:my\s+)?(?:friends|family|kids|children|parents|mom|dad|mother|father)\b/i,
  /\bcontrols?\s+(?:where\s+i\s+(?:go|can\s+go)|who\s+i\s+(?:see|talk\s+to|can\s+see|can\s+talk\s+to))\b/i,
  /\btook\s+(?:my|the)\s+(?:keys|phone|car\s+keys|wallet|passport)\b[^.!?]{0,40}?\b(?:can'?t|cannot|couldn'?t|could\s+not)\s+leave\b/i,
  /\b(?:afraid|scared|terrified)\s+(?:of\s+)?what\s+(?:he|she|they)(?:'?ll|'?s|\s+will|\s+would|\s+might)?\s+(?:do|happen)\s+if\s+i\s+leave\b/i,
  /\b(?:afraid|scared|terrified)\s+of\s+what\s+will\s+happen\s+if\s+i\s+leave\b/i,
]

/** Cap scan length to bound regex work on adversarial input. */
function boundedScanText(text) {
  if (typeof text !== "string" || text.length === 0) return ""
  return text.length > 10_000 ? text.slice(0, 10_000) : text
}

/** TIER 1 test against a single message. */
export function detectExplicitDanger(text) {
  const scan = boundedScanText(text)
  if (!scan) return false
  for (const pattern of EXPLICIT_DANGER_PATTERNS) {
    if (pattern.test(scan)) return true
  }
  return false
}

/** TIER 2 test against a single message. */
export function detectPossibleAcuteState(text) {
  const scan = boundedScanText(text)
  if (!scan) return false
  for (const pattern of ACUTE_STATE_PATTERNS) {
    if (pattern.test(scan)) return true
  }
  return false
}

/** Extract the text of a single user-role message (both AI-SDK v6 `parts[]`
 *  and legacy `{ role, content }` shapes). Read-only. */
export function extractUserMessageText(msg) {
  if (!msg || typeof msg !== "object") return null
  if (msg.role !== "user") return null
  if (typeof msg.content === "string") return msg.content
  const parts = msg.parts
  if (Array.isArray(parts)) {
    const texts = []
    for (const part of parts) {
      if (!part || typeof part !== "object") continue
      if (part.type === "text" && typeof part.text === "string") texts.push(part.text)
    }
    if (texts.length > 0) return texts.join("\n")
  }
  return null
}

/** Text of the most recent user-role message (the "current turn"), or "". */
export function getLatestUserMessageText(messages) {
  if (!Array.isArray(messages)) return ""
  for (let i = messages.length - 1; i >= 0; i--) {
    const t = extractUserMessageText(messages[i])
    if (t !== null) return t
  }
  return ""
}

/** TIER 1 across the FULL history (session-sticky). Does not mutate input. */
export function containsExplicitDangerInAnyUserMessage(messages) {
  if (!Array.isArray(messages)) return false
  for (const msg of messages) {
    const t = extractUserMessageText(msg)
    if (t !== null && detectExplicitDanger(t)) return true
  }
  return false
}

/**
 * Classify a conversation into a safety tier + routing behavior.
 *
 *   { tier: "explicit", sticky: true }  — Tier 1 anywhere in history
 *   { tier: "acute",    sticky: false } — Tier 2 on the CURRENT turn only
 *   { tier: "normal",   sticky: false } — otherwise
 *
 * Pure and read-only: it never mutates, erases, or replaces the message
 * history. Tier 2 checks ONLY the latest user turn, so an acute phrase in the
 * history never locks a later ordinary turn (non-sticky).
 */
export function classifyConversationSafety(messages) {
  if (containsExplicitDangerInAnyUserMessage(messages)) {
    return { tier: "explicit", sticky: true }
  }
  if (detectPossibleAcuteState(getLatestUserMessageText(messages))) {
    return { tier: "acute", sticky: false }
  }
  return { tier: "normal", sticky: false }
}

/**
 * TIER 1 hard response — international-first. Leads with an international
 * resource + local emergency, then clearly-labelled US numbers, so a non-US
 * user in crisis is not handed US-only numbers as the answer.
 */
export const CRISIS_RESPONSE_TEXT = `This tool can't safely help with what you're describing, and you deserve real support right now. Please reach a person who can help.

Find a crisis line in your country: findahelpline.com
If you are in immediate danger, call your local emergency number.

US — 988 Suicide & Crisis Lifeline: call or text 988
US — Crisis Text Line: text HOME to 741741
US — Poison Control (overdose or poisoning): 1-800-222-1222

This conversation has been paused. To return to reflection, start a new session.`

/**
 * TIER 2 soft response — pauses the reflective method, offers grounding and
 * international support, does NOT diagnose, does NOT lock the session, and
 * preserves the transcript.
 */
export const ACUTE_STATE_SUPPORT_TEXT = `Let's pause here for a moment. What you're describing sounds like a lot to be carrying, and it may be more than a self-guided reflection tool can support well right now.

If you can, take one slow breath and name one thing you can see or touch around you.

It would really help to have someone with you in this — a person you trust, or a professional. You can find support options for your country at findahelpline.com (in the US, call or text 988).

Nothing here has been lost — your reflection is still saved, and we can continue whenever you feel ready.`
