/**
 * Per-IP rate limiter — Upstash-backed in production, in-memory in dev.
 *
 * Why Upstash:
 *   The previous implementation was purely in-memory (module-scoped `Map`s).
 *   Vercel serverless functions are horizontally scaled and recycled
 *   aggressively, so module state resets on every cold start AND lives
 *   only inside a single warm instance. That made the configured limits
 *   (e.g. "5 admin-login attempts / 15 min, 30 min lockout") far more
 *   permissive than they read on paper. An attacker who could trigger
 *   cold starts (different IPs, parallel concurrency) could probe far
 *   beyond the documented cap.
 *
 *   Upstash Redis is a per-request-billed KV store with REST transport.
 *   Counters live across all function instances and survive cold starts,
 *   so the configured limits actually hold.
 *
 * Behavior matrix:
 *   - Production (VERCEL_ENV=production or NODE_ENV=production)
 *       + Upstash env vars set → Upstash atomic INCR + EXPIRE
 *       + Upstash env vars unset → THROW (fail loud — matches the policy
 *         in src/lib/upstash.ts for any session-export / volatile path)
 *   - Dev / preview
 *       + Upstash env vars set → Upstash (parity with prod)
 *       + Upstash env vars unset → in-memory fallback (current behavior
 *         preserved for local work)
 *
 * Algorithm (Upstash path):
 *   Two keys per (scope, ip):
 *     rl:<scope>:<ip>        → integer counter; expires after `windowMs`
 *     rl:<scope>:<ip>:locked → presence indicates active lockout; expires
 *                              after `lockoutMs`
 *
 *   On each call:
 *     1. Check TTL on the lock key. If positive, return { allowed: false,
 *        retryAfterSeconds = ttl }.
 *     2. INCR the counter. If the new value is 1, EXPIRE it (initializing
 *        the rolling window).
 *     3. If counter > maxAttempts, SET the lock key with TTL = lockoutMs
 *        and return { allowed: false, retryAfterSeconds = lockoutMs/1000 }.
 *     4. Otherwise return { allowed: true }.
 *
 * The API is the same shape as the previous in-memory version, except
 * the return type is now `Promise<RateLimitResult>` (callers must `await`).
 */

import { getUpstash } from "@/lib/upstash"

// ─── Public types ────────────────────────────────────────────────────
export type RateLimitOpts = {
  scope: string
  ip: string
  /** Rolling window length in ms. Default 15 minutes. */
  windowMs?: number
  /** How many calls allowed within the window before lockout. Default 10. */
  maxAttempts?: number
  /** Lockout duration in ms after maxAttempts is exceeded. Default 30 minutes. */
  lockoutMs?: number
}

export type RateLimitResult = {
  allowed: boolean
  /** Seconds the caller should wait before retrying, when allowed===false. */
  retryAfterSeconds?: number
}

const DEFAULT_WINDOW_MS = 15 * 60 * 1000
const DEFAULT_MAX_ATTEMPTS = 10
const DEFAULT_LOCKOUT_MS = 30 * 60 * 1000

// ─── Shared helpers ──────────────────────────────────────────────────
//
// Production detection. Used to decide whether to fail loud when Upstash
// is unconfigured. The previous version OR-ed VERCEL_ENV === "production"
// with NODE_ENV === "production", but Next.js sets NODE_ENV=production on
// ALL Vercel builds — preview included. That meant Vercel Preview deploys
// without Upstash would throw, which is wrong for previews: they're for
// iterating, not customer traffic.
//
// Correct policy:
//   VERCEL_ENV === "production"    → fail loud (real prod, no fallback)
//   VERCEL_ENV === "preview"       → fallback OK (preview is iteration)
//   VERCEL_ENV === "development"   → fallback OK (vercel dev local)
//   VERCEL_ENV unset:
//     - on Vercel this never happens; if VERCEL_ENV is unset we're off
//       Vercel entirely (local Node, CI, scripts)
//     - NODE_ENV === "production"  → fail loud (e.g. `next start` locally
//       behind a real reverse proxy is "production-like")
//     - otherwise                  → fallback (true local dev)
function isProduction(): boolean {
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv === "production") return true
  if (vercelEnv) {
    // VERCEL_ENV is set to "preview" or "development" → on Vercel but not prod
    return false
  }
  // Off Vercel entirely. Treat NODE_ENV=production as production-like.
  return process.env.NODE_ENV === "production"
}

/** Pull the client IP from forwarded headers. Same contract as before. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? ""
  return forwardedFor.split(",")[0]?.trim() || "unknown"
}

// ─── In-memory fallback (dev / local without Upstash) ────────────────
//
// Same shape and semantics as the previous module-state limiter. Kept ONLY
// so `next dev` works without the Upstash env vars set. Production code
// path never reaches this branch.
type InMemoryAttempt = { count: number; firstAttemptAt: number; lockedUntil?: number }
const inMemoryBuckets = new Map<string, Map<string, InMemoryAttempt>>()

function getInMemoryBucket(scope: string): Map<string, InMemoryAttempt> {
  let bucket = inMemoryBuckets.get(scope)
  if (!bucket) {
    bucket = new Map()
    inMemoryBuckets.set(scope, bucket)
  }
  return bucket
}

function rateLimitInMemory(opts: RateLimitOpts): RateLimitResult {
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const lockoutMs = opts.lockoutMs ?? DEFAULT_LOCKOUT_MS

  const bucket = getInMemoryBucket(opts.scope)
  const now = Date.now()
  const record = bucket.get(opts.ip)

  if (record?.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    }
  }

  if (!record || now - record.firstAttemptAt > windowMs) {
    bucket.set(opts.ip, { count: 1, firstAttemptAt: now })
    return { allowed: true }
  }

  record.count += 1
  if (record.count > maxAttempts) {
    record.lockedUntil = now + lockoutMs
    return { allowed: false, retryAfterSeconds: Math.ceil(lockoutMs / 1000) }
  }

  return { allowed: true }
}

function clearInMemory(scope: string, ip: string): void {
  getInMemoryBucket(scope).delete(ip)
}

// ─── Upstash-backed path (prod / preview-with-Upstash) ───────────────
async function rateLimitUpstash(opts: RateLimitOpts): Promise<RateLimitResult> {
  const redis = getUpstash()
  if (!redis) {
    // Should be unreachable — callers only land here after the dispatcher
    // confirmed Upstash is available. Throw rather than silently degrade.
    throw new Error("rateLimitUpstash: Upstash client unavailable")
  }

  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const lockoutMs = opts.lockoutMs ?? DEFAULT_LOCKOUT_MS

  const countKey = `rl:${opts.scope}:${opts.ip}`
  const lockKey = `${countKey}:locked`

  // Step 1: is the IP currently locked out?
  const lockedTtl = await redis.ttl(lockKey)
  if (lockedTtl > 0) {
    return { allowed: false, retryAfterSeconds: lockedTtl }
  }

  // Step 2: atomic increment of the rolling counter
  const count = await redis.incr(countKey)

  // Step 3: set the window expiry on the FIRST increment only. Setting
  // it on every call would reset the window forever and never lock out.
  if (count === 1) {
    await redis.expire(countKey, Math.ceil(windowMs / 1000))
  }

  // Step 4: trip the lock if we've exceeded the cap
  if (count > maxAttempts) {
    const lockSec = Math.ceil(lockoutMs / 1000)
    await redis.set(lockKey, "1", { ex: lockSec })
    return { allowed: false, retryAfterSeconds: lockSec }
  }

  return { allowed: true }
}

async function clearUpstash(scope: string, ip: string): Promise<void> {
  const redis = getUpstash()
  if (!redis) return
  const countKey = `rl:${scope}:${ip}`
  await Promise.all([redis.del(countKey), redis.del(`${countKey}:locked`)])
}

// ─── Public API ──────────────────────────────────────────────────────
//
// Now async: the Upstash path needs network I/O. Callers must `await`.
//
// Dispatcher logic:
//   - Upstash configured  → use it (production + preview-with-Upstash)
//   - Upstash unconfigured + production → throw (fail loud)
//   - Upstash unconfigured + dev/preview → in-memory fallback

let warnedMissing = false
function warnMissingUpstashOnce(): void {
  if (warnedMissing) return
  warnedMissing = true
  // eslint-disable-next-line no-console
  console.warn(
    "[rate-limit] Upstash env vars not set — using in-memory fallback. " +
      "This is acceptable for local development only. Production deploys " +
      "without Upstash will throw at first rate-limit call.",
  )
}

export async function rateLimit(opts: RateLimitOpts): Promise<RateLimitResult> {
  const redis = getUpstash()

  if (redis) {
    return rateLimitUpstash(opts)
  }

  if (isProduction()) {
    throw new Error(
      "rateLimit: Upstash not configured in production. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel " +
        "Production environment variables.",
    )
  }

  warnMissingUpstashOnce()
  return rateLimitInMemory(opts)
}

export async function clearRateLimit(scope: string, ip: string): Promise<void> {
  const redis = getUpstash()
  if (redis) {
    await clearUpstash(scope, ip)
    return
  }
  if (isProduction()) {
    throw new Error(
      "clearRateLimit: Upstash not configured in production. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel.",
    )
  }
  clearInMemory(scope, ip)
}

// ─── Test-only export ────────────────────────────────────────────────
//
// Tests need to reset the module-scoped in-memory state between cases so
// they don't bleed into each other. Production code never calls this.
export function _resetInMemoryForTests(): void {
  inMemoryBuckets.clear()
}
