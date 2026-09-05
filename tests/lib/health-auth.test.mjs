/**
 * Tests for src/lib/health-auth.ts — the two pure decisions behind /api/health:
 *
 *   isDeepHealthAuthorized  — may this request run the expensive `?deep=1`
 *                             probes? Only an authenticated admin session or
 *                             a dedicated HEALTH_CHECK_SECRET bearer token.
 *   evaluateAdminHealth     — is the admin login path configured? Mirrors the
 *                             real precedence in admin-credentials.ts: a
 *                             DB-managed hash is sufficient on its own; the
 *                             ADMIN_PASSWORD_HASH env var is only a fallback.
 *
 * Dependency-free (node:crypto only). Runs under Node >= 22.18 / 24.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { isDeepHealthAuthorized, evaluateAdminHealth } from "../../src/lib/health-auth.ts"

// ---------------------------------------------------------------------------
// isDeepHealthAuthorized
// ---------------------------------------------------------------------------

test("anonymous request with no secret configured is refused", () => {
  assert.equal(isDeepHealthAuthorized({ authorizationHeader: null, secret: undefined, hasAdminSession: false }), false)
})

test("an authenticated admin session is sufficient on its own", () => {
  assert.equal(isDeepHealthAuthorized({ authorizationHeader: null, secret: undefined, hasAdminSession: true }), true)
})

test("a matching bearer token for the dedicated secret is sufficient", () => {
  assert.equal(isDeepHealthAuthorized({ authorizationHeader: "Bearer s3cret", secret: "s3cret", hasAdminSession: false }), true)
})

test("a wrong bearer token is refused", () => {
  assert.equal(isDeepHealthAuthorized({ authorizationHeader: "Bearer nope", secret: "s3cret", hasAdminSession: false }), false)
})

test("a bearer token is refused when no secret is configured (empty secret never matches)", () => {
  assert.equal(isDeepHealthAuthorized({ authorizationHeader: "Bearer ", secret: "", hasAdminSession: false }), false)
  assert.equal(isDeepHealthAuthorized({ authorizationHeader: "Bearer anything", secret: undefined, hasAdminSession: false }), false)
})

test("the secret must be presented as a Bearer token, not bare", () => {
  assert.equal(isDeepHealthAuthorized({ authorizationHeader: "s3cret", secret: "s3cret", hasAdminSession: false }), false)
})

// ---------------------------------------------------------------------------
// evaluateAdminHealth
// ---------------------------------------------------------------------------

test("DB-managed credential present + ADMIN_EMAIL → ok even without ADMIN_PASSWORD_HASH", () => {
  const r = evaluateAdminHealth({ adminEmailConfigured: true, dbCredential: "present", envHashConfigured: false })
  assert.deepEqual(r, { ok: true })
})

test("no DB credential but env hash configured → ok (env fallback path is live)", () => {
  const r = evaluateAdminHealth({ adminEmailConfigured: true, dbCredential: "absent", envHashConfigured: true })
  assert.deepEqual(r, { ok: true })
})

test("neither credential configured → not ok, generic reason", () => {
  const r = evaluateAdminHealth({ adminEmailConfigured: true, dbCredential: "absent", envHashConfigured: false })
  assert.equal(r.ok, false)
  assert.equal(r.error, "No admin credential configured (admin_auth row or ADMIN_PASSWORD_HASH)")
})

test("DB unreadable (unknown) falls back to env hash presence: ok when env hash exists", () => {
  const r = evaluateAdminHealth({ adminEmailConfigured: true, dbCredential: "unknown", envHashConfigured: true })
  assert.deepEqual(r, { ok: true })
})

test("DB unreadable (unknown) and no env hash → not ok, reason names the read failure", () => {
  const r = evaluateAdminHealth({ adminEmailConfigured: true, dbCredential: "unknown", envHashConfigured: false })
  assert.equal(r.ok, false)
  assert.equal(r.error, "Admin credential unverifiable (admin_auth unreadable, no ADMIN_PASSWORD_HASH)")
})

test("missing ADMIN_EMAIL is still a failure regardless of credentials", () => {
  const r = evaluateAdminHealth({ adminEmailConfigured: false, dbCredential: "present", envHashConfigured: true })
  assert.deepEqual(r, { ok: false, error: "ADMIN_EMAIL not configured" })
})

test("results never carry hashes, secrets or upstream error text", () => {
  for (const dbCredential of ["present", "absent", "unknown"]) {
    for (const envHashConfigured of [true, false]) {
      const r = evaluateAdminHealth({ adminEmailConfigured: true, dbCredential, envHashConfigured })
      assert.deepEqual(Object.keys(r).sort(), r.ok ? ["ok"] : ["error", "ok"])
      if (!r.ok) assert.doesNotMatch(r.error, /\$2[aby]\$/, "no bcrypt hash in error text")
    }
  }
})
