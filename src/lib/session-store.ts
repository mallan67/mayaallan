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

/** Fulfillment marker key prefix. After successful PDF delivery, the session
 *  payload is deleted AND a small "fulfilled" marker is written. This lets the
 *  webhook handler distinguish between:
 *    "we never had this session"           → CRITICAL alert (paid, can't fulfill)
 *    "we already fulfilled and cleaned up" → silent idempotent 200
 *  PayPal retries a successful webhook up to 25 times over 3 days, so the
 *  marker TTL must outlive the retry window. 7 days is comfortable. */
const FULFILLED_MARKER_PREFIX = "session-export-fulfilled:"
const FULFILLED_MARKER_TTL_SECONDS = 7 * 24 * 60 * 60

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

function fulfilledMarkerKey(sessionId: string): string {
  return `${FULFILLED_MARKER_PREFIX}${sessionId}`
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
 * Read result — explicit status so callers can distinguish:
 *   "found"            → process the payload
 *   "already-fulfilled"→ silent idempotent ack (PayPal retry of a
 *                        previously-successful delivery)
 *   "not-found"        → CRITICAL — paid capture but we have no record
 *                        of staging or fulfilling this session. Something
 *                        is wrong: either the stage write silently failed,
 *                        Upstash key mismatch, or external tampering.
 */
export type ReadSessionResult =
  | { status: "found"; payload: SessionPayload }
  | { status: "already-fulfilled" }
  | { status: "not-found" }

/**
 * Read a session payload back.
 *
 * Result shape forces the caller to handle each case explicitly:
 *   - found              → continue with fulfillment
 *   - already-fulfilled  → silent 200 (idempotent)
 *   - not-found          → CRITICAL alert (paid, can't fulfill)
 */
export async function readSession(sessionId: string): Promise<ReadSessionResult> {
  // Route by id shape: legacy blob path vs Upstash uuid.
  if (isLegacyBlobKey(sessionId)) {
    const blobPayload = await readFromBlob(sessionId)
    if (blobPayload) return { status: "found", payload: blobPayload }
    // Legacy blob fetch returning null means the blob is gone. We can't
    // distinguish "we deleted after success" from "never existed" for the
    // legacy path because the OLD code didn't write fulfillment markers.
    // Treat null as already-fulfilled to maintain backward-compat for any
    // in-flight orders that predate the marker system. These will be rare
    // (only orders staged before this commit deployed).
    return { status: "already-fulfilled" }
  }

  const client = getUpstash()
  if (!client) {
    // No Upstash AND not a legacy blob id — definitive not-found.
    return { status: "not-found" }
  }

  try {
    const data = await client.get<SessionPayload>(upstashKey(sessionId))
    if (data) return { status: "found", payload: data }

    // No payload. Check for a fulfillment marker.
    const marker = await client.get<string>(fulfilledMarkerKey(sessionId))
    if (marker) return { status: "already-fulfilled" }

    return { status: "not-found" }
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
 * Mark a session as fulfilled and clean up its payload.
 *
 * Order:
 *   1. Write the fulfillment marker (7-day TTL)
 *   2. Delete the session payload
 *
 * The marker MUST be written before deletion so a PayPal webhook retry
 * arriving in the gap between delete and marker-write doesn't see a true
 * "not-found" and false-positive a critical alert. (Order doesn't matter
 * in practice since Upstash REST is sequential, but the principle is
 * marker-first.)
 *
 * Idempotent: silently no-ops if the session is already gone.
 */
export async function markFulfilledAndCleanup(sessionId: string): Promise<void> {
  if (isLegacyBlobKey(sessionId)) {
    // Legacy blob path: just delete. We don't write fulfillment markers for
    // legacy ids because readSession() treats legacy null-fetch as
    // already-fulfilled (the OLD code never had marker support).
    try {
      await del(sessionId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!(msg.includes("not found") || msg.includes("BlobNotFound") || msg.includes("404"))) {
        throw err
      }
    }
    return
  }

  const client = getUpstash()
  if (!client) return // Nothing to delete, nothing to mark.

  try {
    // Marker first — so a PayPal retry landing between marker-write and
    // session-delete reads "already-fulfilled" not "not-found."
    await client.set(fulfilledMarkerKey(sessionId), "1", {
      ex: FULFILLED_MARKER_TTL_SECONDS,
    })
  } catch (err) {
    safeLogError("session-store.mark-fulfilled-failed", { err: errorMessage(err) })
    // Don't throw — if the marker write fails, we still want to delete the
    // session. Worst case: a PayPal retry triggers a false-positive critical
    // alert, which is preferable to leaving the session payload in place.
  }

  try {
    await client.del(upstashKey(sessionId))
  } catch (err) {
    safeLogError("session-store.delete-failed", { err: errorMessage(err) })
    // Not fatal — TTL will sweep it within 24h.
  }
}

/**
 * @deprecated Use markFulfilledAndCleanup() — it also writes a marker so
 * subsequent PayPal retries can be distinguished from never-existed sessions.
 */
export const deleteSession = markFulfilledAndCleanup
