// scripts/test-crisis-detection.mjs
// Dependency-free assertions for the tiered crisis classifier + its routing
// behavior. Run with: `pnpm test:crisis` (or `node scripts/test-crisis-detection.mjs`).
// Exits nonzero on any failure so it is CI-suitable. Uses only Node built-ins.

import assert from "node:assert/strict"
import {
  classifyConversationSafety,
  detectExplicitDanger,
  detectPossibleAcuteState,
  findOversizeUserMessage,
  totalConversationCharCount,
  MAX_MESSAGE_CHARS,
  MAX_CONVERSATION_CHARS,
} from "../src/lib/crisis-classifier.mjs"

let failures = 0
let ran = 0
function check(name, fn) {
  ran++
  try {
    fn()
    console.log(`PASS  ${name}`)
  } catch (err) {
    failures++
    console.error(`FAIL  ${name}\n      ${err.message}`)
  }
}

const userMsg = (text) => ({ role: "user", parts: [{ type: "text", text }] })
const assistantMsg = (text) => ({ role: "assistant", parts: [{ type: "text", text }] })
const tierOf = (text) => classifyConversationSafety([userMsg(text)]).tier

// ─── 1. Classification matrix (the approved acceptance cases + edges) ──
const CASES = [
  // Tier 3 — ordinary distress / benign, must NOT trigger anything
  ["I'm done with this exercise", "normal"],
  ["I feel like a burden at work", "normal"],
  ["Nothing matters about this argument", "normal"],
  ["I haven't slept well lately", "normal"],
  ["My partner doesn't want me to leave the party", "normal"],
  ["I feel watched", "normal"],
  ["I can't do this anymore, this project is exhausting", "normal"],
  ["I want to explore a belief about not being good enough", "normal"],

  // Tier 3 — coercion-tightening regression: benign obstacle / work / rule
  // phrasing must NOT trip the acute classifier.
  ["Work keeps me from seeing my family.", "normal"],
  ["Traffic keeps me from leaving on time.", "normal"],
  ["My boss won't let me leave early.", "normal"],
  ["My manager monitors every move we make.", "normal"],

  // Tier 1 — explicit danger (hard, sticky)
  ["Everyone would be better off without me", "explicit"],
  ["I have a plan to hurt myself tonight", "explicit"],
  ["I want to kill myself", "explicit"],
  ["I have a plan to kill myself", "explicit"],
  ["I'm done with life", "explicit"],
  ["I hear voices telling me to hurt someone", "explicit"],

  // Tier 2 — possible acute state (soft, non-sticky)
  ["I haven't slept in four days and I feel invincible", "acute"],
  ["Nothing feels real right now", "acute"],
  ["My partner won't let me leave the apartment", "acute"],
  ["I hear voices sometimes", "acute"],

  // Tier 2 — genuine coercion / confinement / isolation / fear still caught.
  ["I'm not allowed to leave the house.", "acute"],
  ["They took my keys so I can't leave.", "acute"],
  ["I'm afraid of what he'll do if I leave.", "acute"],
]
for (const [text, tier] of CASES) {
  check(`classify: "${text}" -> ${tier}`, () => assert.equal(tierOf(text), tier))
}

// ─── 2. Routing behavior: sticky flags per tier ───────────────────────
check("explicit tier sets sticky=true", () =>
  assert.equal(classifyConversationSafety([userMsg("I want to kill myself")]).sticky, true),
)
check("acute tier sets sticky=false", () =>
  assert.equal(classifyConversationSafety([userMsg("nothing feels real right now")]).sticky, false),
)
check("normal tier sets sticky=false", () =>
  assert.equal(classifyConversationSafety([userMsg("tell me about my beliefs")]).sticky, false),
)

// ─── 3. Acute is NON-sticky: a later ordinary turn is not locked ──────
check("acute phrase in history does NOT lock a later ordinary turn", () => {
  const convo = [
    userMsg("nothing feels real right now"),
    assistantMsg("<soft support>"),
    userMsg("okay, I want to look at a belief about work"),
  ]
  const r = classifyConversationSafety(convo)
  assert.equal(r.tier, "normal", `expected normal, got ${r.tier}`)
  assert.equal(r.sticky, false)
})

// ─── 4. Explicit danger REMAINS sticky on later turns (unchanged) ─────
check("explicit phrase in history STAYS explicit on a later turn", () => {
  const convo = [
    userMsg("I want to kill myself"),
    assistantMsg("<crisis>"),
    userMsg("nevermind, let's talk about beliefs"),
  ]
  const r = classifyConversationSafety(convo)
  assert.equal(r.tier, "explicit")
  assert.equal(r.sticky, true)
})

// ─── 5. Classifier does NOT mutate / erase / replace the history ──────
check("classify does not mutate the messages array (acute)", () => {
  const convo = [userMsg("nothing feels real right now"), userMsg("hello")]
  const before = JSON.stringify(convo)
  const beforeLen = convo.length
  classifyConversationSafety(convo)
  assert.equal(convo.length, beforeLen, "message count changed")
  assert.equal(JSON.stringify(convo), before, "message contents changed")
})
check("classify does not mutate the messages array (explicit)", () => {
  const convo = [userMsg("I want to kill myself"), assistantMsg("x"), userMsg("hello")]
  const before = JSON.stringify(convo)
  classifyConversationSafety(convo)
  assert.equal(JSON.stringify(convo), before, "message contents changed")
})

// ─── 6. Unit spot-checks on the individual detectors ──────────────────
check("detectExplicitDanger: plan-to-harm false negative fixed", () =>
  assert.equal(detectExplicitDanger("i have a plan to harm myself"), true),
)
check("detectExplicitDanger: bare 'I'm done' is NOT explicit", () =>
  assert.equal(detectExplicitDanger("I'm done"), false),
)
check("detectPossibleAcuteState: vague sleep is NOT acute", () =>
  assert.equal(detectPossibleAcuteState("I haven't slept well lately"), false),
)
check("detectPossibleAcuteState: coercion 'won't let me leave' is acute", () =>
  assert.equal(detectPossibleAcuteState("my partner won't let me leave"), true),
)

// ─── 7. Conversation-size caps (folded in from the retired tests/lib file) ─
check("size cap: oversize single message is detected", () => {
  const text = "a".repeat(MAX_MESSAGE_CHARS + 100)
  assert.equal(findOversizeUserMessage([userMsg(text)]), text.length)
})
check("size cap: in-bounds messages return null", () => {
  assert.equal(
    findOversizeUserMessage([userMsg("short"), userMsg("x".repeat(MAX_MESSAGE_CHARS))]),
    null,
  )
})
check("size cap: total char count sums user + assistant text", () => {
  const convo = [
    { role: "user", content: "hello" }, // 5
    assistantMsg("world!"), // 6
    userMsg("again"), // 5
    userMsg("more"), // 4
  ]
  assert.equal(totalConversationCharCount(convo), 20)
})
check("size cap: non-arrays are tolerated", () => {
  assert.equal(totalConversationCharCount(null), 0)
  assert.equal(totalConversationCharCount("not an array"), 0)
  assert.equal(totalConversationCharCount([]), 0)
})
check("size cap: MAX_CONVERSATION_CHARS is a sane number", () => {
  assert.equal(typeof MAX_CONVERSATION_CHARS, "number")
  assert.ok(MAX_CONVERSATION_CHARS >= 10_000)
})

console.log(`\n${ran - failures}/${ran} checks passed, ${failures} failed`)
if (failures > 0) process.exit(1)
