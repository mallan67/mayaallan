import { test } from "node:test"
import assert from "node:assert/strict"
import {
  detectCrisisLanguage,
  containsCrisisInAnyUserMessage,
  findOversizeUserMessage,
  totalConversationCharCount,
  MAX_MESSAGE_CHARS,
  MAX_CONVERSATION_CHARS,
} from "../../src/lib/crisis-detection.ts"

// ─── Patterns that MUST match (operational safety expansion) ───────────
const SHOULD_MATCH = [
  // Explicit
  "I want to kill myself",
  "I'm going to end my life",
  "I'm suicidal",
  "I want to die",
  "I don't want to live anymore",
  // Euphemisms the previous version missed
  "I want to disappear forever",
  "I'm thinking about hurting myself",
  "I can't do this anymore",
  "I don't see a way out",
  "I have no way out",
  "everyone would be better off without me",
  "I'm a burden",
  "I just want the pain to stop",
  "I'm done with everything",
  "nothing matters anymore",
  "I'd rather not be here",
  "I'm tired of being alive",
  // Past-tense overdose disclosure (medical emergency)
  "I took too many pills last night",
  "I OD'd yesterday",
  "I overdosed",
  "I swallowed a bunch of tylenol",
  "I have the pills ready in front of me",
  // Self-harm present tense
  "I have been cutting myself",
  // Plan-disclosure variants — only catch the explicit suicide framing.
  // "I have a plan" alone is too ambiguous; documented in crisis-detection.ts.
  "I'm planning to suicide",
  "planning to suicide",
  "plan to suicide",
]

// ─── Patterns that MUST NOT match (false-positive guards) ──────────────
const SHOULD_NOT_MATCH = [
  "I want to plan my vacation",
  "I have a plan to visit my sister",
  "I have a plan to write a book",
  "this work is killing me",
  "she tried to kill herself in the news article I read",
  "I'm reading about suicide prevention",
  "I want to die laughing at this",
  "I feel done with my project",
  "I'm tired of being late",
  "I want to disappear into a good book",
]

test("crisis-detection: explicit + euphemistic + past-overdose patterns all match", () => {
  for (const phrase of SHOULD_MATCH) {
    assert.equal(
      detectCrisisLanguage(phrase),
      true,
      `expected MATCH for: "${phrase}"`,
    )
  }
})

test("crisis-detection: benign phrasings do not match", () => {
  for (const phrase of SHOULD_NOT_MATCH) {
    assert.equal(
      detectCrisisLanguage(phrase),
      false,
      `expected NO match for: "${phrase}"`,
    )
  }
})

test("session-sticky: ANY user turn in history triggers re-route", () => {
  // Latest message is benign; earlier message disclosed crisis.
  const messages = [
    { role: "user", parts: [{ type: "text", text: "I want to disappear forever" }] },
    { role: "assistant", parts: [{ type: "text", text: "crisis response" }] },
    { role: "user", parts: [{ type: "text", text: "ok, anyway, about my belief about money" }] },
  ]
  assert.equal(containsCrisisInAnyUserMessage(messages), true)
})

test("session-sticky: returns false when no user turn matches", () => {
  const messages = [
    { role: "user", parts: [{ type: "text", text: "I have a belief about myself" }] },
    { role: "assistant", parts: [{ type: "text", text: "tell me more" }] },
    { role: "user", parts: [{ type: "text", text: "it's that I'm too much for people" }] },
  ]
  assert.equal(containsCrisisInAnyUserMessage(messages), false)
})

test("session-sticky: tolerates legacy { role, content } shape", () => {
  const messages = [{ role: "user", content: "I want to die" }]
  assert.equal(containsCrisisInAnyUserMessage(messages), true)
})

test("input cap: oversize message detected", () => {
  const text = "a".repeat(MAX_MESSAGE_CHARS + 100)
  const messages = [{ role: "user", parts: [{ type: "text", text }] }]
  assert.equal(findOversizeUserMessage(messages), text.length)
})

test("input cap: in-bounds message returns null", () => {
  const messages = [
    { role: "user", parts: [{ type: "text", text: "short" }] },
    { role: "user", parts: [{ type: "text", text: "x".repeat(MAX_MESSAGE_CHARS) }] },
  ]
  assert.equal(findOversizeUserMessage(messages), null)
})

test("conversation total char count sums correctly", () => {
  const messages = [
    { role: "user", content: "hello" }, // 5
    { role: "assistant", parts: [{ type: "text", text: "world!" }] }, // 6
    { role: "user", parts: [{ type: "text", text: "again" }, { type: "text", text: "more" }] }, // 9
  ]
  assert.equal(totalConversationCharCount(messages), 20)
})

test("conversation total char count handles arrays without parts", () => {
  assert.equal(totalConversationCharCount(null), 0)
  assert.equal(totalConversationCharCount("not an array"), 0)
  assert.equal(totalConversationCharCount([]), 0)
})

test("MAX_CONVERSATION_CHARS exists and is reasonable", () => {
  assert.equal(typeof MAX_CONVERSATION_CHARS, "number")
  assert.ok(MAX_CONVERSATION_CHARS >= 10_000)
})
