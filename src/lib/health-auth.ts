/**
 * Pure decisions behind /api/health. Kept free of `@/` imports and Next APIs
 * so tests/lib/health-auth.test.mjs runs under plain Node; the route supplies
 * the request header, env values and session state.
 */
import { createHash, timingSafeEqual } from "crypto"

// Same length-independent comparison as src/lib/safe-compare.ts, inlined so
// this module stays dependency-free for the test runner.
function safeCompare(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest()
  const bh = createHash("sha256").update(b).digest()
  return timingSafeEqual(ah, bh)
}

/**
 * May this request run the expensive `?deep=1` probes (real Resend, PayPal,
 * Blob and Upstash calls)? Yes only for an authenticated admin session or a
 * `Authorization: Bearer <HEALTH_CHECK_SECRET>` header. An unset or empty
 * secret disables the bearer path entirely.
 */
export function isDeepHealthAuthorized(input: {
  authorizationHeader: string | null
  secret: string | undefined
  hasAdminSession: boolean
}): boolean {
  if (input.hasAdminSession) return true
  const secret = input.secret
  const auth = input.authorizationHeader
  if (!secret || !auth) return false
  return safeCompare(auth, `Bearer ${secret}`)
}

export type DbCredentialState = "present" | "absent" | "unknown"

export type AdminHealth = { ok: true } | { ok: false; error: string }

/**
 * Is the admin login path configured? Mirrors verifyAdminPassword() in
 * src/lib/admin-credentials.ts: a DB-managed bcrypt hash in `admin_auth` is the
 * source of truth once set; the ADMIN_PASSWORD_HASH env var is only the
 * emergency fallback. So the env var being absent is NOT a failure when the DB
 * credential exists. If the DB row could not be read ("unknown"), the env
 * fallback is what would still let the operator in, so its presence decides.
 *
 * Error strings are fixed, generic phrases — never hashes or upstream text.
 */
export function evaluateAdminHealth(input: {
  adminEmailConfigured: boolean
  dbCredential: DbCredentialState
  envHashConfigured: boolean
}): AdminHealth {
  if (!input.adminEmailConfigured) {
    return { ok: false, error: "ADMIN_EMAIL not configured" }
  }
  if (input.dbCredential === "present") return { ok: true }
  if (input.envHashConfigured) return { ok: true }
  if (input.dbCredential === "unknown") {
    return { ok: false, error: "Admin credential unverifiable (admin_auth unreadable, no ADMIN_PASSWORD_HASH)" }
  }
  return { ok: false, error: "No admin credential configured (admin_auth row or ADMIN_PASSWORD_HASH)" }
}
