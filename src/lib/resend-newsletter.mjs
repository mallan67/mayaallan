import { Resend } from "resend"

/**
 * Resend newsletter sync (issue #8). Global Contacts + explicit "Maya Allan
 * Newsletter" Segment membership, against resend@6.8.0. NEVER imports alertAdmin
 * (single-layer alerting lives in the callers) and NEVER changes an existing
 * Contact's global unsubscribe status.
 *
 * resend@6.8.0 response shape: every call returns { data, error, headers }.
 * `headers` is a TOP-LEVEL Record<string,string>|null (NOT inside error);
 * ErrorResponse is only { message, statusCode, name }.
 */

/** Genuine "contact not found" from the SDK { data, error } result. */
export function isNotFound(error) {
  return !!error && error.statusCode === 404
}

async function ensureExisting({ resend, segmentId, email, contact }) {
  // Fail closed on malformed Contact data: only a real boolean drives the branch.
  if (contact?.unsubscribed === true) return { status: "skipped-unsubscribed" }
  if (contact?.unsubscribed !== false) return { status: "error", detail: "malformed:unsubscribed-not-boolean" }
  const list = await resend.contacts.segments.list({ email })
  if (list.error) return { status: "error", detail: `segments-list:${list.error.statusCode ?? "unknown"}` }
  // Fail closed: a successful-but-malformed list (no array) must NOT be treated as
  // "empty" and then followed by an add — that would defeat list-before-add.
  if (!Array.isArray(list.data?.data)) return { status: "error", detail: "segments-list:no-data" }
  if (list.data.data.some((s) => s.id === segmentId)) return { status: "already-member" }
  const added = await resend.contacts.segments.add({ email, segmentId })
  if (added.error) return { status: "error", detail: `segment-add:${added.error.statusCode ?? "unknown"}` }
  return { status: "added-to-segment" }
}

async function createAndAdd({ resend, segmentId, email }) {
  const created = await resend.contacts.create({ email, unsubscribed: false })
  if (created.error) {
    // Deterministic read-after-write recovery: on ANY create error, re-fetch
    // exactly once. If the Contact now exists (a duplicate race, or an ambiguous
    // server error that still created it), apply the normal existing-contact
    // rules. If the re-fetch is missing, errors, OR THROWS, the create genuinely
    // failed -> return the ORIGINAL creation error. Never retry creation; never
    // re-fetch twice; never alter unsubscribe status. A thrown re-fetch is caught
    // LOCALLY so it can't escape to the outer catch and be mislabeled `threw:`.
    const origin = `create:${created.error.statusCode ?? "unknown"}`
    let refetch
    try {
      refetch = await resend.contacts.get({ email })
    } catch {
      return { status: "error", detail: origin }
    }
    if (refetch.error || !refetch.data) return { status: "error", detail: origin }
    return await ensureExisting({ resend, segmentId, email, contact: refetch.data })
  }
  // Contact created. Handle a thrown OR returned Segment-add failure LOCALLY so the
  // partial state (Contact exists WITHOUT membership) is explicit and self-heals on
  // a rerun (the next sync finds the active Contact and adds membership).
  let added
  try {
    added = await resend.contacts.segments.add({ email, segmentId })
  } catch (e) {
    return { status: "error", detail: `partial-contact-created:segment-add-threw:${e?.message ?? e}` }
  }
  if (added.error) {
    return { status: "error", detail: `partial-contact-created:segment-add:${added.error.statusCode ?? "unknown"}` }
  }
  return { status: "created" }
}

/** Core sync: get -> (404 create+add) | (existing ensure-membership). Never throws. */
export async function syncContact({ resend, segmentId, email }) {
  try {
    const got = await resend.contacts.get({ email })
    if (got.error) {
      if (isNotFound(got.error)) return await createAndAdd({ resend, segmentId, email })
      return { status: "error", detail: `get:${got.error.statusCode ?? "unknown"}` }
    }
    if (!got.data) return { status: "error", detail: "get:no-data" } // fail closed
    return await ensureExisting({ resend, segmentId, email, contact: got.data })
  } catch (e) {
    return { status: "error", detail: `threw:${e?.message ?? e}` }
  }
}

/** Dry-run classifier: get + list ONLY, never create/add. Never throws. */
export async function classifyContact({ resend, segmentId, email }) {
  try {
    const got = await resend.contacts.get({ email })
    if (got.error) {
      if (isNotFound(got.error)) return { status: "would-create" }
      return { status: "error", detail: `get:${got.error.statusCode ?? "unknown"}` }
    }
    if (!got.data) return { status: "error", detail: "get:no-data" } // fail closed
    if (got.data.unsubscribed === true) return { status: "would-skip-unsubscribed" }
    if (got.data.unsubscribed !== false) return { status: "error", detail: "malformed:unsubscribed-not-boolean" }
    const list = await resend.contacts.segments.list({ email })
    if (list.error) return { status: "error", detail: `segments-list:${list.error.statusCode ?? "unknown"}` }
    if (!Array.isArray(list.data?.data)) return { status: "error", detail: "segments-list:no-data" }
    const isMember = list.data.data.some((s) => s.id === segmentId)
    return { status: isMember ? "already-member" : "would-add" }
  } catch (e) {
    return { status: "error", detail: `threw:${e?.message ?? e}` }
  }
}

export function resolveConfig(env = process.env) {
  return {
    apiKey: env.RESEND_API_KEY || null,
    segmentId: env.RESEND_NEWSLETTER_SEGMENT_ID || null,
  }
}

/**
 * Env-resolving convenience for the LIVE route. Builds a plain client — ONE
 * attempt per SDK op, no rate-limit retries — so a signup is never delayed by
 * backoff. Config alerting is the caller's job.
 */
export async function syncSubscriberToResend(email, { env = process.env, makeClient } = {}) {
  const { apiKey, segmentId } = resolveConfig(env)
  if (!apiKey) {
    console.error("[resend-newsletter] RESEND_API_KEY missing — subscriber not synced")
    return { status: "noop-no-api-key" }
  }
  if (!segmentId) return { status: "noop-no-segment-id" }
  const resend = makeClient ? makeClient(apiKey) : new Resend(apiKey)
  return await syncContact({ resend, segmentId, email })
}

const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Read Retry-After from the TOP-LEVEL response headers (numeric seconds or HTTP-date). */
export function retryAfterMs(headers, now = () => Date.now()) {
  const raw = headers?.["retry-after"] ?? headers?.["Retry-After"]
  if (raw == null) return null
  const secs = Number(raw)
  if (Number.isFinite(secs)) return Math.max(0, secs * 1000)
  const when = Date.parse(raw)
  return Number.isFinite(when) ? Math.max(0, when - now()) : null
}

/**
 * Wrap a resend client for the IMPORT path only. Adds (a) shared conservative
 * pacing across every wrapped SDK call — get/create/list/add draw from ONE
 * min-interval gate, so pacing is per-REQUEST not per-row — and (b) 429 retries
 * honoring the TOP-LEVEL `res.headers` Retry-After, else exponential backoff.
 * NOT used by the live signup route.
 */
export function withRateLimit(
  resend,
  { maxRetries = 5, minIntervalMs = 120, log = console, sleep = defaultSleep, now = () => Date.now() } = {},
) {
  let nextAt = 0
  const gate = async () => {
    const wait = nextAt - now()
    if (wait > 0) await sleep(wait)
    nextAt = now() + minIntervalMs
  }
  const call = (fn) => async (arg) => {
    for (let attempt = 0; ; attempt++) {
      await gate()
      const res = await fn(arg)
      if (res?.error?.statusCode === 429 && attempt < maxRetries) {
        const wait = retryAfterMs(res.headers, now) ?? Math.min(30_000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250)
        log.warn?.(`[resend] 429 rate-limited; waiting ${wait}ms (attempt ${attempt + 1}/${maxRetries})`)
        await sleep(wait)
        continue
      }
      return res
    }
  }
  const c = resend.contacts
  return {
    contacts: {
      get: call(c.get.bind(c)),
      create: call(c.create.bind(c)),
      segments: {
        list: call(c.segments.list.bind(c.segments)),
        add: call(c.segments.add.bind(c.segments)),
      },
    },
  }
}
