/**
 * Source-level contract for src/app/api/health/route.ts.
 *
 *   - cheap mode stays public (the GitHub health-check workflow depends on it);
 *   - `?deep=1` is gated by isDeepHealthAuthorized (admin session or
 *     HEALTH_CHECK_SECRET bearer) and refused with a generic 401 otherwise;
 *   - the admin check uses evaluateAdminHealth (DB-first precedence) instead
 *     of requiring the ADMIN_PASSWORD_HASH env var.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
const src = read("../../src/app/api/health/route.ts")

test("deep mode is gated by isDeepHealthAuthorized before any deep probe runs", () => {
  assert.match(src, /import\s*\{[^}]*isDeepHealthAuthorized[^}]*\}\s*from\s*"@\/lib\/health-auth"/)
  const gate = src.indexOf("isDeepHealthAuthorized(")
  const firstProbe = Math.min(...["deepResend()", "deepBlob()", "deepPaypal()", "probeUpstash()"].map((s) => src.indexOf(s, src.indexOf("export async function GET"))))
  assert.ok(gate > -1, "gate present")
  assert.ok(gate < firstProbe, "gate evaluated before deep probes are invoked")
})

test("unauthorized deep requests get a generic 401 with no check details", () => {
  const gate = src.indexOf("isDeepHealthAuthorized(")
  const region = src.slice(gate, gate + 600)
  assert.match(region, /status:\s*401/)
  assert.match(region, /"Unauthorized"/)
})

test("the secret is a dedicated HEALTH_CHECK_SECRET (not CRON_SECRET, not the session secret)", () => {
  assert.match(src, /process\.env\.HEALTH_CHECK_SECRET/)
  assert.doesNotMatch(src, /process\.env\.CRON_SECRET/)
})

test("admin session is the other accepted credential", () => {
  assert.match(src, /isAdminAuthenticated\(\)/)
})

test("cheap mode is untouched: still one DB read plus env-presence checks, no auth required", () => {
  // The cheap path must not depend on the gate: the gate only wraps `deep`.
  assert.match(src, /const deep = req\.nextUrl\.searchParams\.get\("deep"\) === "1"/)
  assert.match(src, /deep \? await deepResend\(\) : checkEnvPresent\("RESEND_API_KEY"\)/)
  assert.match(src, /deep \? await deepBlob\(\) : checkEnvPresent\("BLOB_READ_WRITE_TOKEN"\)/)
  assert.match(src, /deep \? await deepPaypal\(\) : checkPaypalEnv\(\)/)
})

test("admin health uses evaluateAdminHealth with DB-first precedence", () => {
  assert.match(src, /evaluateAdminHealth\(/)
  assert.match(src, /hasDbManagedAdminCredential\(\)/)
  // The old hard requirement is gone.
  assert.doesNotMatch(src, /ADMIN_PASSWORD_HASH not configured/)
})

test("the health-check workflow still targets the cheap endpoint", () => {
  const wf = read("../../.github/workflows/health-check.yml")
  assert.match(wf, /HEALTH_URL:\s*https:\/\/www\.mayaallan\.com\/api\/health\s*$/m)
  assert.doesNotMatch(wf, /deep=1/)
})
