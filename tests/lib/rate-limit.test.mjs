/**
 * Tests for src/lib/rate-limit.ts — exercises the in-memory fallback path.
 *
 * The Upstash-backed path requires a live Upstash connection to test
 * meaningfully; mocking it would test the mock more than the helper. The
 * dev-fallback in-memory implementation shares the same semantic contract,
 * so testing it gives us confidence in the public API.
 *
 * Production behavior with Upstash is validated by the live deploy
 * (Vercel preview probes + /api/health), not by unit tests.
 *
 * NOTE: these tests REQUIRE that UPSTASH_REDIS_REST_URL / TOKEN env vars
 * are NOT set during the test run. Otherwise the helper routes to Upstash
 * and we'd be hitting the live counter. Most local dev environments have
 * Upstash unset by default; CI must NOT pass these env vars through.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  rateLimit,
  clearRateLimit,
  getClientIp,
  _resetInMemoryForTests,
} from "../../src/lib/rate-limit.ts"

// Safety: refuse to run if Upstash is configured. Otherwise the test would
// hit the live counter and pollute it (or get unexpected results).
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error(
    "[rate-limit.test] Upstash env vars are set — refusing to run. " +
      "These tests are designed for the in-memory fallback. " +
      "Unset UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to run them.",
  )
  process.exit(1)
}

// Safety: refuse to run in production mode (where the helper throws when
// Upstash is missing). Test runs are always dev/local.
if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("[rate-limit.test] Refusing to run with NODE_ENV/VERCEL_ENV=production.")
  process.exit(1)
}

test("first call is allowed", async () => {
  _resetInMemoryForTests()
  const result = await rateLimit({
    scope: "test-first-call",
    ip: "1.1.1.1",
    windowMs: 60_000,
    maxAttempts: 3,
    lockoutMs: 60_000,
  })
  assert.equal(result.allowed, true)
  assert.equal(result.retryAfterSeconds, undefined)
})

test("calls up to maxAttempts are allowed; the next one is locked out", async () => {
  _resetInMemoryForTests()
  const opts = {
    scope: "test-cap",
    ip: "2.2.2.2",
    windowMs: 60_000,
    maxAttempts: 3,
    lockoutMs: 30 * 60_000,
  }
  // 3 allowed
  for (let i = 0; i < 3; i++) {
    const r = await rateLimit(opts)
    assert.equal(r.allowed, true, `attempt ${i + 1} should be allowed`)
  }
  // 4th trips the lock
  const r4 = await rateLimit(opts)
  assert.equal(r4.allowed, false)
  assert.ok(r4.retryAfterSeconds && r4.retryAfterSeconds > 0)
  assert.ok(
    r4.retryAfterSeconds <= 30 * 60,
    `retryAfterSeconds=${r4.retryAfterSeconds} should be <= lockoutMs/1000`,
  )
})

test("clearRateLimit resets the counter for that (scope, ip)", async () => {
  _resetInMemoryForTests()
  const opts = {
    scope: "test-clear",
    ip: "3.3.3.3",
    windowMs: 60_000,
    maxAttempts: 2,
    lockoutMs: 60_000,
  }
  // Exhaust the cap
  await rateLimit(opts)
  await rateLimit(opts)
  const tripped = await rateLimit(opts)
  assert.equal(tripped.allowed, false)

  // Clear
  await clearRateLimit("test-clear", "3.3.3.3")

  // Now allowed again
  const after = await rateLimit(opts)
  assert.equal(after.allowed, true)
})

test("different IPs don't share counters within the same scope", async () => {
  _resetInMemoryForTests()
  const baseOpts = {
    scope: "test-isolation",
    windowMs: 60_000,
    maxAttempts: 2,
    lockoutMs: 60_000,
  }
  // IP A exhausts its 2-attempt cap
  await rateLimit({ ...baseOpts, ip: "10.0.0.1" })
  await rateLimit({ ...baseOpts, ip: "10.0.0.1" })
  const aTripped = await rateLimit({ ...baseOpts, ip: "10.0.0.1" })
  assert.equal(aTripped.allowed, false)

  // IP B should still have a fresh allowance
  const b1 = await rateLimit({ ...baseOpts, ip: "10.0.0.2" })
  assert.equal(b1.allowed, true)
  const b2 = await rateLimit({ ...baseOpts, ip: "10.0.0.2" })
  assert.equal(b2.allowed, true)
})

test("different scopes don't share counters for the same IP", async () => {
  _resetInMemoryForTests()
  const baseOpts = {
    ip: "20.0.0.1",
    windowMs: 60_000,
    maxAttempts: 1,
    lockoutMs: 60_000,
  }
  // Scope-A: exhaust the 1-attempt cap
  await rateLimit({ ...baseOpts, scope: "scope-A" })
  const aTripped = await rateLimit({ ...baseOpts, scope: "scope-A" })
  assert.equal(aTripped.allowed, false)

  // Scope-B with same IP: still fresh
  const b1 = await rateLimit({ ...baseOpts, scope: "scope-B" })
  assert.equal(b1.allowed, true)
})

test("getClientIp pulls the first IP from x-forwarded-for", () => {
  const req = new Request("http://localhost", {
    headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1, 192.168.1.1" },
  })
  assert.equal(getClientIp(req), "203.0.113.1")
})

test("getClientIp returns 'unknown' when x-forwarded-for is absent", () => {
  const req = new Request("http://localhost")
  assert.equal(getClientIp(req), "unknown")
})

test("retryAfterSeconds reflects the lockoutMs configuration", async () => {
  _resetInMemoryForTests()
  const opts = {
    scope: "test-retry-after",
    ip: "4.4.4.4",
    windowMs: 60_000,
    maxAttempts: 1,
    lockoutMs: 120_000, // 2 minutes
  }
  await rateLimit(opts) // 1 allowed
  const tripped = await rateLimit(opts)
  assert.equal(tripped.allowed, false)
  // retryAfterSeconds should be close to lockoutMs/1000 = 120
  assert.ok(
    tripped.retryAfterSeconds && tripped.retryAfterSeconds >= 119 && tripped.retryAfterSeconds <= 120,
    `retryAfterSeconds=${tripped.retryAfterSeconds} should be ~120`,
  )
})

test("defaults are sane when opts omit them", async () => {
  _resetInMemoryForTests()
  // First call should be allowed regardless of defaults
  const r = await rateLimit({ scope: "test-defaults", ip: "5.5.5.5" })
  assert.equal(r.allowed, true)
})
