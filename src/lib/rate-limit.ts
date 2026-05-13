/**
 * Soft per-IP rate limiter — resets on serverless cold starts.
 * Adequate for slowing down form spam and password brute-force; for hard
 * limits add a Vercel Firewall WAF rule on the route.
 */

type Attempt = { count: number; firstAttemptAt: number; lockedUntil?: number }

const buckets = new Map<string, Map<string, Attempt>>()

function getBucket(scope: string): Map<string, Attempt> {
  let bucket = buckets.get(scope)
  if (!bucket) {
    bucket = new Map()
    buckets.set(scope, bucket)
  }
  return bucket
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? ""
  return forwardedFor.split(",")[0]?.trim() || "unknown"
}

/**
 * Check whether `ip` may proceed for `scope`. Atomically records the attempt.
 * - windowMs: rolling window
 * - maxAttempts: how many attempts allowed within the window
 * - lockoutMs: how long to lock out after exceeding the window
 */
export function rateLimit(opts: {
  scope: string
  ip: string
  windowMs?: number
  maxAttempts?: number
  lockoutMs?: number
}): { allowed: boolean; retryAfterSeconds?: number } {
  const windowMs = opts.windowMs ?? 15 * 60 * 1000
  const maxAttempts = opts.maxAttempts ?? 10
  const lockoutMs = opts.lockoutMs ?? 30 * 60 * 1000

  const bucket = getBucket(opts.scope)
  const now = Date.now()
  const record = bucket.get(opts.ip)

  if (record?.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000) }
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

/**
 * Clear the rate-limit record for an IP within a scope.
 * Use after a successful action (e.g. successful login) to avoid penalising
 * the user for prior typos.
 */
export function clearRateLimit(scope: string, ip: string) {
  getBucket(scope).delete(ip)
}
