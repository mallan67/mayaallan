import { test } from "node:test"
import assert from "node:assert/strict"
// Import and execute the ACTUAL production exports (not a mirrored copy).
import {
  parseBigIntSafe,
  parseTimestampToIso,
  paypalAmountToCents,
} from "../../src/lib/db-coerce.mjs"

test("bigint above Number.MAX_SAFE_INTEGER is kept as an exact string", () => {
  const huge = "9007199254740993" // 2^53 + 1
  assert.equal(parseBigIntSafe(huge), huge)
  assert.equal(typeof parseBigIntSafe(huge), "string")
})

test("bigint within safe-integer range becomes a JS number", () => {
  assert.equal(parseBigIntSafe("5"), 5)
  assert.equal(typeof parseBigIntSafe("5"), "number")
  assert.equal(parseBigIntSafe(String(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER)
})

test("paypalAmountToCents is exact and never uses floating point", () => {
  // 0.1 and 0.2 are the canonical float-drift cases; parsed exactly.
  assert.equal(paypalAmountToCents("0.1"), 10)
  assert.equal(paypalAmountToCents("0.10"), 10)
  assert.equal(paypalAmountToCents("0.2"), 20)
  assert.equal(paypalAmountToCents("19.99"), 1999)
  assert.equal(paypalAmountToCents("100"), 10000)
  assert.equal(paypalAmountToCents("0.05"), 5)
  assert.equal(paypalAmountToCents("garbage"), 0)
  assert.equal(paypalAmountToCents(null), 0)
  // Exact integer-cent addition — no 0.1 + 0.2 = 0.30000000000000004 drift.
  assert.equal(paypalAmountToCents("0.1") + paypalAmountToCents("0.2"), 30)
  // The float trap this function exists to avoid (documented, not used):
  assert.notEqual(0.1 + 0.2, 0.3)
})

test("timestamp -> ISO-8601 string", () => {
  assert.equal(parseTimestampToIso("2026-01-22T11:34:05.429Z"), "2026-01-22T11:34:05.429Z")
  assert.equal(typeof parseTimestampToIso("2026-01-22 11:34:05.429+00"), "string")
})

test("JSON serialization: safe id -> number, oversized id -> string, ts -> ISO", () => {
  const row = {
    id: parseBigIntSafe("5"),
    bigId: parseBigIntSafe("9007199254740993"),
    ts: parseTimestampToIso("2026-01-22T11:34:05.429Z"),
    price: "9.99", // numeric stays an exact string
  }
  const j = JSON.parse(JSON.stringify(row))
  assert.equal(j.id, 5)
  assert.equal(typeof j.id, "number")
  assert.equal(j.bigId, "9007199254740993")
  assert.equal(typeof j.bigId, "string")
  assert.equal(j.ts, "2026-01-22T11:34:05.429Z")
  assert.equal(typeof j.ts, "string")
  assert.equal(j.price, "9.99")
  assert.equal(typeof j.price, "string")
})
