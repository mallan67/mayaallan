import { test } from "node:test"
import assert from "node:assert/strict"
import {
  extractInsights,
  MIN_USER_TURNS_FOR_EXPORT,
} from "../../src/lib/pdf/extract-insights.ts"

test("extractInsights: belief brought in = first user message", () => {
  const messages = [
    { role: "user", text: "I think I'm not good enough." },
    { role: "assistant", text: "Mhm. Tell me more." },
    { role: "user", text: "It started in childhood." },
  ]
  const r = extractInsights(messages)
  assert.equal(r.beliefBroughtIn, "I think I'm not good enough.")
})

test("extractInsights: closing user reflection = last user message", () => {
  const messages = [
    { role: "user", text: "first" },
    { role: "assistant", text: "ok" },
    { role: "user", text: "middle" },
    { role: "assistant", text: "yes" },
    { role: "user", text: "last user thought" },
  ]
  const r = extractInsights(messages)
  assert.equal(r.closingUserReflection, "last user thought")
})

test("extractInsights: closing anchor = assistant message bearing [SESSION_COMPLETE]", () => {
  const messages = [
    { role: "user", text: "hi" },
    { role: "assistant", text: "early reflection" },
    { role: "user", text: "more" },
    { role: "assistant", text: "the anchor word is enough [SESSION_COMPLETE]" },
    { role: "user", text: "thanks" },
  ]
  const r = extractInsights(messages)
  assert.equal(r.closingAssistantAnchor, "the anchor word is enough")
})

test("extractInsights: anchor falls back to last assistant when no marker", () => {
  const messages = [
    { role: "user", text: "hi" },
    { role: "assistant", text: "one" },
    { role: "user", text: "ok" },
    { role: "assistant", text: "two" },
    { role: "user", text: "ok" },
    { role: "assistant", text: "last assistant message" },
  ]
  const r = extractInsights(messages)
  assert.equal(r.closingAssistantAnchor, "last assistant message")
})

test("extractInsights: midAssistantReflections drops the anchor and shows last-3 before it", () => {
  const messages = [
    { role: "user", text: "u1" },
    { role: "assistant", text: "a1" },
    { role: "user", text: "u2" },
    { role: "assistant", text: "a2" },
    { role: "user", text: "u3" },
    { role: "assistant", text: "a3" },
    { role: "user", text: "u4" },
    { role: "assistant", text: "a4" },
    { role: "user", text: "u5" },
    { role: "assistant", text: "a5" },
  ]
  const r = extractInsights(messages)
  // Anchor falls back to last assistant ("a5"). midReflections = [a2, a3, a4]
  assert.equal(r.closingAssistantAnchor, "a5")
  assert.deepEqual(
    r.midAssistantReflections.map((m) => m.text),
    ["a2", "a3", "a4"],
  )
})

test("extractInsights: transcript appendix has all turns in order", () => {
  const messages = [
    { role: "user", text: "first" },
    { role: "assistant", text: "second" },
    { role: "user", text: "third" },
  ]
  const r = extractInsights(messages)
  assert.equal(r.transcriptForAppendix.length, 3)
  assert.equal(r.transcriptForAppendix[0].text, "first")
  assert.equal(r.transcriptForAppendix[2].text, "third")
})

test("extractInsights: marker stripped from anchor + transcript", () => {
  const messages = [
    { role: "user", text: "hi" },
    { role: "assistant", text: "anchor sentence [SESSION_COMPLETE]" },
  ]
  const r = extractInsights(messages)
  assert.equal(r.closingAssistantAnchor, "anchor sentence")
  assert.equal(r.transcriptForAppendix[1].text, "anchor sentence")
})

test("extractInsights: empty messages → all null/empty", () => {
  const r = extractInsights([])
  assert.equal(r.beliefBroughtIn, null)
  assert.equal(r.closingUserReflection, null)
  assert.equal(r.closingAssistantAnchor, null)
  assert.equal(r.midAssistantReflections.length, 0)
  assert.equal(r.userTurnCount, 0)
})

test("extractInsights: single user turn → no closingUserReflection", () => {
  const r = extractInsights([
    { role: "user", text: "just the one" },
    { role: "assistant", text: "ok" },
  ])
  assert.equal(r.beliefBroughtIn, "just the one")
  assert.equal(r.closingUserReflection, null)
})

test("extractInsights: userTurnCount counts only user role", () => {
  const r = extractInsights([
    { role: "user", text: "u1" },
    { role: "assistant", text: "a1" },
    { role: "user", text: "u2" },
    { role: "user", text: "u3" }, // weird but valid
    { role: "assistant", text: "a2" },
  ])
  assert.equal(r.userTurnCount, 3)
})

test("MIN_USER_TURNS_FOR_EXPORT is at least 3", () => {
  assert.ok(MIN_USER_TURNS_FOR_EXPORT >= 3)
})
