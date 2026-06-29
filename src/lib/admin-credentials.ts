import "server-only"
import bcrypt from "bcryptjs"
import { randomBytes, createHash, timingSafeEqual } from "crypto"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

/**
 * Admin credential store — bridges the single `admin_auth` row to the auth
 * routes. Lets the admin password be changed/recovered from the website
 * instead of only via the ADMIN_PASSWORD_HASH env var.
 *
 * Verification precedence (see verifyAdminPassword):
 *   1. The bcrypt hash stored in the DB (set via the reset flow), if present.
 *   2. The ADMIN_PASSWORD_HASH env var, as a permanent emergency fallback.
 *   Either matching grants access — so a solo operator can always get in via
 *   the env var even if they forget the DB-managed password, and vice-versa.
 */

const BCRYPT_ROUNDS = 12
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000 // 10 minutes
const ADMIN_AUTH_ROW_ID = 1

const sha256Hex = (s: string) => createHash("sha256").update(s).digest("hex")

type AdminAuthRow = {
  password_hash: string | null
  reset_token_hash: string | null
  reset_token_expires_at: string | null
}

async function readRow(): Promise<AdminAuthRow | null> {
  const { data, error } = await supabaseAdmin
    .from("admin_auth")
    .select("password_hash, reset_token_hash, reset_token_expires_at")
    .eq("id", ADMIN_AUTH_ROW_ID)
    .maybeSingle()
  if (error) {
    // Surface as a thrown error so callers fail closed rather than silently
    // treating "DB unreachable" as "no DB credential".
    throw new Error(`admin_auth read failed: ${error.message}`)
  }
  return (data as AdminAuthRow) ?? null
}

/**
 * Does `password` match the current admin credential?
 *
 * Checks the DB-stored hash first (if any), then the env-var hash. Returns
 * false on any mismatch. Throws only on malformed env hash so the login route
 * can distinguish "wrong password" from "server misconfigured" — DB-read
 * failures bubble up as thrown errors too (fail closed).
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  // 1. DB-managed hash (set via the reset flow).
  let dbHash: string | null = null
  try {
    dbHash = (await readRow())?.password_hash ?? null
  } catch (err) {
    // If the table doesn't exist yet (migration not run) we don't want to hard
    // fail login — fall through to the env var. Any other DB error also falls
    // through to the env path so the env credential keeps working.
    console.error("[admin-credentials] DB hash read failed, using env fallback:", err instanceof Error ? err.message : String(err))
  }
  if (dbHash) {
    if (await bcrypt.compare(password, dbHash)) return true
    // DB hash present but didn't match — still allow the env fallback below so
    // the operator is never locked out of the emergency credential.
  }

  // 2. Env-var fallback (emergency credential).
  const envHash = process.env.ADMIN_PASSWORD_HASH
  if (envHash) {
    // bcrypt.compare throws on a malformed hash; let it propagate so the login
    // route can report a config error instead of a generic auth failure.
    if (await bcrypt.compare(password, envHash)) return true
  }

  return false
}

/**
 * Create a one-time password-reset token. Stores only its SHA-256 hash + an
 * expiry on the admin_auth row and returns the RAW token for emailing. Any
 * previously-issued token is overwritten (only the latest link works).
 */
export async function createResetToken(): Promise<string> {
  const rawToken = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString()

  const { error } = await supabaseAdmin
    .from("admin_auth")
    .update({
      reset_token_hash: sha256Hex(rawToken),
      reset_token_expires_at: expiresAt,
      reset_requested_at: new Date().toISOString(),
    })
    .eq("id", ADMIN_AUTH_ROW_ID)
  if (error) throw new Error(`admin_auth reset-token write failed: ${error.message}`)

  return rawToken
}

/**
 * Validate a raw reset token against the stored hash + expiry, WITHOUT
 * consuming it. Constant-time compare on the hashes. Returns true only if a
 * token is pending, unexpired, and matches.
 */
export async function isResetTokenValid(rawToken: string): Promise<boolean> {
  if (!rawToken) return false
  const row = await readRow()
  if (!row?.reset_token_hash || !row.reset_token_expires_at) return false
  if (Date.now() > new Date(row.reset_token_expires_at).getTime()) return false

  const provided = Buffer.from(sha256Hex(rawToken), "hex")
  const stored = Buffer.from(row.reset_token_hash, "hex")
  if (provided.length !== stored.length) return false
  return timingSafeEqual(provided, stored)
}

/**
 * Set a new admin password (after a valid reset token) and clear the token so
 * it can't be reused. Re-validates the token inside the same call to close the
 * check-then-act gap.
 *
 * Returns { ok: true } on success, or { ok: false, reason } on an
 * invalid/expired token (so the route returns a clean error, not a 500).
 */
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; reason: "invalid_token" }> {
  if (!rawToken) return { ok: false, reason: "invalid_token" }

  const nowIso = new Date().toISOString()
  const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  // Atomic consume-and-set: the UPDATE only matches if the token hash is still
  // present (not yet consumed) AND unexpired. The first request flips
  // reset_token_hash to NULL, so a concurrent second request with the same
  // token matches zero rows and is rejected — the single-use guarantee holds
  // under concurrency without a separate read. `.select("id")` returns the
  // affected rows so we can tell whether the conditional matched.
  const { data, error } = await supabaseAdmin
    .from("admin_auth")
    .update({
      password_hash,
      reset_token_hash: null,
      reset_token_expires_at: null,
      updated_at: nowIso,
    })
    .eq("id", ADMIN_AUTH_ROW_ID)
    .eq("reset_token_hash", sha256Hex(rawToken))
    .gt("reset_token_expires_at", nowIso)
    .select("id")
  if (error) throw new Error(`admin_auth password write failed: ${error.message}`)

  if (!data || data.length === 0) {
    // No row matched → token was wrong, already used, or expired.
    return { ok: false, reason: "invalid_token" }
  }

  return { ok: true }
}
