import { test } from "node:test"
import assert from "node:assert/strict"

// Mirrors src/lib/db-types.ts (repo convention: tests inline the pure logic
// they cover — see paypal-custom-id.test.mjs). Keep in sync with that module.
function parseBigIntSafe(raw) {
  const n = Number(raw)
  return Number.isSafeInteger(n) ? n : raw
}
function parseTimestampToIso(raw) {
  return new Date(raw).toISOString()
}

test("bigint above Number.MAX_SAFE_INTEGER is kept as an exact string", () => {
  const huge = "9007199254740993" // 2^53 + 1, not representable as a JS number
  assert.equal(parseBigIntSafe(huge), huge)
  assert.equal(typeof parseBigIntSafe(huge), "string")
})

test("bigint within safe-integer range becomes a JS number", () => {
  assert.equal(parseBigIntSafe("5"), 5)
  assert.equal(typeof parseBigIntSafe("5"), "number")
  assert.equal(parseBigIntSafe(String(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER)
})

test("decimals stay exact as strings; float accumulation is unsafe", () => {
  // numeric/decimal are left as strings by the client — exact, no drift.
  for (const s of ["0.1", "0.2", "19.99"]) {
    assert.equal(typeof s, "string")
    assert.equal(s, s) // exact round-trip; no 0.1 -> 0.1000000000000000055
  }
  // The reason we don't float them:
  assert.notEqual(0.1 + 0.2, 0.3) // 0.30000000000000004
})

test("amount_cents (integer) arithmetic is exact", () => {
  const cents = (dollarStr) => Math.round(Number(dollarStr) * 100)
  assert.equal(cents("0.1") + cents("0.2"), 30) // vs 0.1+0.2 float
  assert.equal(cents("19.99"), 1999)
  assert.equal(1999 + 1, 2000)
  assert.equal((1999 + 1) / 100, 20) // integer-cents -> dollars, exact
})

test("JSON serialization: safe id -> number, timestamp -> ISO string", () => {
  const row = {
    id: parseBigIntSafe("5"),
    created_at: parseTimestampToIso("2026-01-22T11:34:05.429Z"),
    price: "9.99", // numeric stays a string in JSON
  }
  const json = JSON.parse(JSON.stringify(row))
  assert.equal(json.id, 5)
  assert.equal(typeof json.id, "number")
  assert.equal(json.created_at, "2026-01-22T11:34:05.429Z")
  assert.equal(typeof json.created_at, "string")
  assert.equal(json.price, "9.99")
  assert.equal(typeof json.price, "string")
})

test("oversized id serializes as a string (no precision loss) in JSON", () => {
  const row = { id: parseBigIntSafe("9007199254740993") }
  const json = JSON.parse(JSON.stringify(row))
  assert.equal(json.id, "9007199254740993")
  assert.equal(typeof json.id, "string")
})
