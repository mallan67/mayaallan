/**
 * Upstash Redis client — shared singleton.
 *
 * Why Upstash + why this wrapper:
 *   - Vercel serverless functions are horizontally scaled and recycled
 *     aggressively. Module-local state (Maps, counters) resets on every
 *     cold start, so in-memory rate limits and session blobs don't survive.
 *     Upstash is a per-request-billed Redis with REST transport, designed
 *     for exactly this scaling shape.
 *   - This wrapper centralizes:
 *       (a) the singleton (one client per warm instance)
 *       (b) graceful fallback for dev/preview when env vars aren't set
 *       (c) production fail-fast detection (caller decides how to surface)
 *
 * Architectural separation enforced by usage:
 *   - **Volatile session data** (chat transcripts staged for paid PDF export,
 *     rate-limit counters) → Upstash. Ephemeral. TTL-managed.
 *   - **Permanent records** (orders, books, subscribers, contact submissions)
 *     → Supabase. ACID. Long-lived.
 *   - **Public assets** (book covers, audiobook MP3s, downloadable PDFs the
 *     buyer is authorized to fetch) → Vercel Blob with `access: "public"`.
 *
 * Never cross those lanes.
 */
import { Redis } from "@upstash/redis"

const URL_ENV = "UPSTASH_REDIS_REST_URL"
const TOKEN_ENV = "UPSTASH_REDIS_REST_TOKEN"

let cached: Redis | null = null
let warnedMissing = false

/**
 * Returns the Upstash Redis client if env is configured, otherwise null.
 * Callers MUST handle the null path — typically by falling back to a
 * less-safe path in dev (in-memory rate limit, blob session storage)
 * or returning a 503 in production.
 *
 * The first call with missing env in production logs a one-time warning
 * via console.error (no PII risk — env names only).
 */
export function getUpstash(): Redis | null {
  if (cached) return cached

  const url = process.env[URL_ENV]
  const token = process.env[TOKEN_ENV]

  if (!url || !token) {
    if (!warnedMissing) {
      warnedMissing = true
      const inProd =
        process.env.VERCEL_ENV === "production" ||
        process.env.NODE_ENV === "production"
      if (inProd) {
        // eslint-disable-next-line no-console
        console.error(
          `[upstash] ${URL_ENV} and/or ${TOKEN_ENV} not set in production. ` +
            "Volatile-storage features (rate-limit / session-export staging) " +
            "will degrade to non-distributed fallbacks. Provision Upstash " +
            "Redis and add both env vars in Vercel Production scope."
        )
      }
    }
    return null
  }

  cached = new Redis({ url, token })
  return cached
}

/**
 * Boolean check: is Upstash available? Useful for health probes and for
 * call sites that want to log "using Upstash" vs "fallback" without
 * actually constructing/using the client.
 */
export function hasUpstash(): boolean {
  return Boolean(process.env[URL_ENV] && process.env[TOKEN_ENV])
}

/**
 * Shape for health probe — does NOT leak the connection URL.
 */
export type UpstashHealth =
  | { ok: true; latencyMs: number }
  | { ok: false; error: string }

export async function probeUpstash(): Promise<UpstashHealth> {
  const client = getUpstash()
  if (!client) {
    return { ok: false, error: "Upstash env vars not configured" }
  }
  const start = Date.now()
  try {
    const result = await client.ping()
    const latencyMs = Date.now() - start
    if (result !== "PONG") {
      return { ok: false, error: `unexpected ping reply: ${String(result)}` }
    }
    return { ok: true, latencyMs }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
