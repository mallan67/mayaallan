import { test } from "node:test"
import assert from "node:assert/strict"

const SEPARATOR = "|"

function encodeCustomId(blobKey, tool) {
  return `${blobKey}${SEPARATOR}${tool}`
}

function decodeCustomId(customId) {
  const idx = customId.lastIndexOf(SEPARATOR)
  if (idx < 0) return null
  const blobKey = customId.slice(0, idx)
  const tool = customId.slice(idx + 1)
  if (tool !== "reset" && tool !== "belief_inquiry" && tool !== "integration") return null
  if (!blobKey) return null
  return { blobKey, tool }
}

test("roundtrip: encode then decode returns original", () => {
  const blobKey = "sessions/abc-123-def-456.json"
  const tool = "belief_inquiry"
  const encoded = encodeCustomId(blobKey, tool)
  const decoded = decodeCustomId(encoded)
  assert.deepEqual(decoded, { blobKey, tool })
})

test("roundtrip survives all three tool names", () => {
  for (const tool of ["reset", "belief_inquiry", "integration"]) {
    const blobKey = `sessions/${tool}-uuid.json`
    const decoded = decodeCustomId(encodeCustomId(blobKey, tool))
    assert.equal(decoded?.tool, tool)
    assert.equal(decoded?.blobKey, blobKey)
  }
})

test("decode rejects unknown tool", () => {
  assert.equal(decodeCustomId("sessions/x.json|stripe"), null)
})

test("decode rejects empty blobKey", () => {
  assert.equal(decodeCustomId("|reset"), null)
})

test("decode rejects missing separator", () => {
  assert.equal(decodeCustomId("sessions/x.json"), null)
})

test("decode handles blobKey containing pipe (uses last separator)", () => {
  const blobKey = "sessions/weird|key.json"
  const tool = "integration"
  const encoded = encodeCustomId(blobKey, tool)
  const decoded = decodeCustomId(encoded)
  assert.deepEqual(decoded, { blobKey, tool })
})

test("encoded length stays within PayPal custom_id 127-char limit", () => {
  const blobKey = `sessions/${"a".repeat(36)}.json`
  const tool = "belief_inquiry"
  const encoded = encodeCustomId(blobKey, tool)
  assert.ok(encoded.length <= 127, `expected <=127, got ${encoded.length}`)
})
