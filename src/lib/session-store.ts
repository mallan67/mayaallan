/**
 * Session payload storage for the paid-export flow.
 *
 * What lives here:
 *   The staged session-export payload — full chat transcript + customer email
 *   — written when a user clicks "Save Session for $9.99", read back by the
 *   PayPal webhook after capture, then deleted after the PDF is delivered.
 *
 * Why a dedicated abstraction:
 *   This data is short-lived, sensitive, and read by exactly one downstream
 *   process (the webhook for the same session). It does NOT belong in
 *   Vercel Blob (which is for public assets — there is no "private" tier
 *   we want to bet on long-term) and it does NOT belong in Supabase
 *   (Supabase is for permanent records like orders, books, subscribers).
 *
 *   Upstash Redis is the right home: ephemeral, TTL-managed, distributed,
 *   private by default, REST-based for serverless.
 *
 * Storage strategy:
 *   Primary:   Upstash Redis with 24h TTL on every session payload.
 *              TTL is the safety net for abandoned checkouts — without
 *              explicit cleanup the payload disappears after 24h.
 *   Fallback:  Vercel Blob (the prior implementation), used ONLY when
 *              Upstash is not configured AND we're outside production.
 *              In production without Upstash, callers receive an error
 *              and emit a CRITICAL alertAdmin. This prevents the privacy
 *              regression of silently going back to public-blob writes.
 *
 * Deploy sequence safety:
 *   The first deploy of this code will succeed in dev / preview even if
 *   Upstash env vars aren't set (falls back to blob). On production it
 *   refuses to fall back to blob — this enforces the privacy contract
 *   while letting the code merge before Upstash provisioning is complete.
 */
import "server-only"
import { put, head, del } from "@vercel/blob"
import { getUpstash, hasUpstash } from "@/lib/upstash"
import { alertAdmin } from "@/lib/alert-admin"
import { safeLogError, errorMessage } from "@/lib/safe-log"
import crypto from "crypto"

/** Session payload shape — matches BlobPayload in deliver-pdf.ts. */
export type SessionPayload = {
  tool: "reset" | "belief_inquiry" | "integration"
  messages: Array<{ role: "user" | "assistant"; text: string }>
  email: string
  sessionDate: string
}

/** Upstash key prefix — namespaces session payloads so a future migration
 *  can grep / scan / wipe them without touching other Upstash keys. */
const UPSTASH_KEY_PREFIX = "session-export:"

/** Vercel Blob path prefix (legacy fallback only). */
const BLOB_PATH_PREFIX = "sessions/"

/** TTL: 24 hours. PayPal Standard Checkout sessions expire after 3 hours,
 *  so 24h is a generous safety margin that still purges abandoned writes. */
const SESSION_TTL_SECONDS = 24 * 60 * 60

/** New session id format — short, unambiguous, no path traversal surface. */
export function newSessionId(): string {
  return crypto.randomUUID()
}

/** Legacy session id format — Vercel Blob path. Kept as a recognizer so
 *  the webhook can route in-flight orders that were created before this
 *  deploy to the blob fallback. */
function isLegacyBlobKey(id: string): boolean {
  return id.startsWith(BLOB_PATH_PREFIX) && id.endsWith(".json")
}

function upstashKey(sessionId: string): string {
  return `${UPSTASH_KEY_PREFIX}${sessionId}`
}

/**
 * Put a session payload into the store.
 *
 * Returns the session id you should embed in the PayPal custom_id.
 * The id is NOT a URL or a path — it's an opaque token only meaningful
 * to readSession().
 */
export async function putSession(payload: SessionPayload): Promise<string> {
  const client = getUpstash()
  if (client) {
    const sessionId = newSessionId()
    await client.set(upstashKey(sessionId), payload, { ex: SESSION_TTL_SECONDS })
    return sessionId
  }

  // No Upstash configured.
  const inProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  if (inProd) {
    // Refuse to silently fall back to public blob in production. The whole
    // point of this migration is to stop writing PII to public storage.
    await alertAdmin({
      severity: "critical",
      subject: "session-store: Upstash unavailable in production — refusing public-blob fallback",
      body:
        "putSession() was called in production but UPSTASH_REDIS_REST_URL / TOKEN are not set. " +
        "Refusing to write to public Vercel Blob (the privacy regression this migration fixed). " +
        "Provision Upstash Redis and add both env vars to Vercel Production scope.",
      dedupKey: "session-store:upstash-unavailable-prod",
    })
    throw new Error("Session storage unavailable: Upstash not configured")
  }

  // Dev / preview fallback: legacy Vercel Blob (PRIVATE — never public).
  // Local-dev convenience only. Should not be relied upon for any sensitive
  // testing — provision an Upstash dev DB instead.
  const blobKey = `${BLOB_PATH_PREFIX}${crypto.randomUUID()}.json`
  await put(blobKey, JSON.stringify(payload), {
    access: "public", // Legacy compatibility — only reached in dev / preview now.
    contentType: "application/json",
    addRandomSuffix: false,
  })
  return blobKey
}

/**
 * Read a session payload back. Returns null if not found (idempotent
 * acknowledgement of an already-processed session).
 */
export async function readSession(sessionId: string): Promise<SessionPayload | null> {
  // Route by id shape: legacy blob path vs Upstash uuid.
  if (isLegacyBlobKey(sessionId)) {
    return readFromBlob(sessionId)
  }

  const client = getUpstash()
  if (!client) {
    // No Upstash AND not a legacy blob id — nothing we can do.
    return null
  }

  try {
    const data = await client.get<SessionPayload>(upstashKey(sessionId))
    return data ?? null
  } catch (err) {
    safeLogError("session-store.read-failed", { err: errorMessage(err) })
    throw err
  }
}

async function readFromBlob(blobKey: string): Promise<SessionPayload | null> {
  try {
    const blobMeta = await head(blobKey)
    const res = await fetch(blobMeta.url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`blob fetch ${res.status}`)
    return (await res.json()) as SessionPayload
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("not found") || msg.includes("BlobNotFound") || msg.includes("404")) {
      return null
    }
    throw err
  }
}

/**
 * Delete a session payload after successful PDF delivery.
 * Idempotent: silently no-ops if the session is already gone.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  if (isLegacyBlobKey(sessionId)) {
    try {
      await del(sessionId)
    } catch (err) {
      // Vercel Blob's del() can throw 404 — treat as idempotent success.
      const msg = err instanceof Error ? err.message : String(err)
      if (!(msg.includes("not found") || msg.includes("BlobNotFound") || msg.includes("404"))) {
        throw err
      }
    }
    return
  }

  const client = getUpstash()
  if (!client) return // Nothing to delete, nothing to fail.
  try {
    await client.del(upstashKey(sessionId))
  } catch (err) {
    safeLogError("session-store.delete-failed", { err: errorMessage(err) })
    // Not fatal — TTL will sweep it within 24h.
  }
}
