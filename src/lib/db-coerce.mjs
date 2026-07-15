// Pure, dependency-free value coercers shared by the direct Postgres client
// (src/lib/db.ts, via src/lib/db-types.ts) and the PayPal webhook.
//
// Kept as plain ESM (.mjs) so the EXACT production functions are unit-testable
// by the node:test runner (tests/lib/db-coerce.test.mjs) without a TypeScript
// loader — the tests import and execute these, not a copy.

/**
 * int8 -> JS number when it is a safe integer, else the exact original string.
 * Every id / foreign key in this schema is a small value, so the API/UI number
 * contract holds; a hypothetical out-of-range id can never silently lose
 * precision by being coerced to a lossy float.
 * @param {string} raw
 * @returns {number | string}
 */
export function parseBigIntSafe(raw) {
  const n = Number(raw)
  return Number.isSafeInteger(n) ? n : raw
}

/**
 * timestamp / timestamptz wire value -> ISO-8601 string (the prior PostgREST
 * contract the app was written against).
 * @param {string} raw
 * @returns {string}
 */
export function parseTimestampToIso(raw) {
  return new Date(raw).toISOString()
}

/**
 * Parse a PayPal decimal amount string (e.g. "19.99") to an EXACT integer
 * number of cents. Never routes money through binary floating point (no
 * parseFloat, no Math.round(Number(v) * 100)). PayPal sends canonical decimal
 * strings for USD. Anything unparseable returns 0.
 * @param {string | null | undefined} value
 * @returns {number}
 */
export function paypalAmountToCents(value) {
  if (typeof value !== "string") return 0
  const m = value.trim().match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/)
  if (!m) return 0
  const sign = m[1] === "-" ? -1 : 1
  const dollars = parseInt(m[2], 10)
  const cents = parseInt((m[3] ?? "").padEnd(2, "0"), 10)
  return sign * (dollars * 100 + cents)
}
