# Resend Broadcasts Newsletter Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync website newsletter signups into a Resend "Maya Allan Newsletter" Segment (Resend Broadcasts becomes the newsletter platform) without building any bulk sender, token system, or unsubscribe endpoint.

**Architecture:** A plain-ESM shared module (`src/lib/resend-newsletter.mjs`) holds the sync algorithm against the installed `resend@6.8.0` SDK (global Contacts + explicit Segment membership). The `/api/subscribe` route awaits it (nonfatal); a `--dry-run`-default node script backfills existing active subscribers reusing the same module. Supabase `email_subscribers` stays the signup ledger; Resend owns marketing suppression.

**Tech Stack:** Next.js (App Router, TS), `resend@6.8.0`, `@supabase/supabase-js`, plain ESM `.mjs` modules, `node --test` (Node v20.20).

## Global Constraints

- Installed SDK is `resend@6.8.0`. **Do not upgrade `resend`. Do not make raw Resend HTTP calls.** Use only the installed SDK surface: `contacts.get`, `contacts.create`, `contacts.segments.list/add/remove`, `segments.create`.
- `CreateContactOptions` in 6.8.0 has **no `segments` field** → create-then-add (two calls); no atomic create-into-Segment.
- Every Resend SDK call returns `{ data, error }`; recognize not-found via `error.statusCode === 404`. Catch thrown exceptions too (not the sole error path).
- **Never** call `resend.contacts.update({ unsubscribed: false })` or otherwise change an existing Contact's global unsubscribe status.
- Env var name: `RESEND_NEWSLETTER_SEGMENT_ID`. Segment name (created by Maya): `Maya Allan Newsletter`.
- Supabase write must stay conflict-ignoring: `.upsert({ email }, { onConflict: "email", ignoreDuplicates: true })` — preserves `unsubscribed_at`.
- Shared module is `.mjs` (plain ESM + JSDoc), imported by the TS route (`allowJs:true`, `moduleResolution:"bundler"`) and the node script, with explicit `.mjs` extension. No `tsx`, no new dependency.
- Website unsubscribe copy, verbatim: **"You can unsubscribe at any time using the link included in every newsletter."**
- Out of scope (do not touch): resend upgrades, raw HTTP, custom unsubscribe endpoints, DB migrations/columns, DNS/sending-domain, operator-notification promise cleanup, welcome Automation creation, transactional purchase/PDF/contact/alert emails.
- Do not (until separately authorized): create the Segment, set Vercel vars, disable the live welcome email in production, push, open a PR.

---

## File structure

- `src/lib/resend-newsletter.mjs` — **new.** Shared sync algorithm + config resolver + rate-limit wrapper. Pure/injectable; no `alertAdmin` import (single-layer alerting lives in callers).
- `tests/lib/resend-newsletter.test.mjs` — **new.** `node --test` unit tests for the module.
- `src/app/api/subscribe/route.ts` — **modify.** Await the sync (nonfatal, alert on failure/missing-segment); remove the subscriber-facing welcome email; keep the operator notification.
- `scripts/import-subscribers-to-resend.mjs` — **new.** One-time backfill; `--dry-run` default (write-free), `--apply` mode; reuses the module.
- `tests/scripts/import-subscribers.test.mjs` — **new.** `node --test` unit tests for the import loop.
- `src/components/NewsletterSection.tsx` — **modify.** Unsubscribe copy.
- `src/app/privacy/page.tsx` — **modify.** Marketing-email opt-out copy.
- `.env.example` — **modify.** Document `RESEND_NEWSLETTER_SEGMENT_ID`.

---

### Task 1: Shared sync module + unit tests

**Files:**
- Create: `src/lib/resend-newsletter.mjs`
- Test: `tests/lib/resend-newsletter.test.mjs`

**Interfaces:**
- Consumes: `resend@6.8.0` (`Resend`, `contacts.get/create`, `contacts.segments.list/add`).
- Produces:
  - `syncContact({ resend, segmentId, email }): Promise<{status: "created"|"added-to-segment"|"already-member"|"skipped-unsubscribed"|"error", detail?: string}>`
  - `classifyContact({ resend, segmentId, email }): Promise<{status: "would-create"|"would-add"|"would-skip-unsubscribed"|"already-member"|"error", detail?: string}>` (get + list only; never writes)
  - `resolveConfig(env?): { apiKey: string|null, segmentId: string|null }`
  - `syncSubscriberToResend(email, { env?, makeClient? }?): Promise<{status: ...|"noop-no-api-key"|"noop-no-segment-id"}>`
  - `withRateLimit(resend, { maxRetries?, log?, sleep? }?): resend-like` (retries on `statusCode===429`)
  - `isNotFound(error): boolean`, `isDuplicate(error): boolean`

- [ ] **Step 1: Write the failing test file**

Create `tests/lib/resend-newsletter.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  syncContact,
  classifyContact,
  resolveConfig,
  syncSubscriberToResend,
  withRateLimit,
  isNotFound,
  isDuplicate,
} from "../../src/lib/resend-newsletter.mjs"

const SEG = "seg_123"
const ok = (data) => ({ data, error: null })
const err = (statusCode, extra = {}) => ({ data: null, error: { statusCode, message: "x", ...extra } })

// Build a fake resend client from per-method queues/handlers.
function fakeResend({ get, create, list, add }) {
  const calls = { get: [], create: [], list: [], add: [] }
  const wrap = (name, handler) => async (arg) => {
    calls[name].push(arg)
    return handler ? handler(arg, calls[name].length - 1) : ok({})
  }
  return {
    calls,
    contacts: {
      get: wrap("get", get),
      create: wrap("create", create),
      segments: { list: wrap("list", list), add: wrap("add", add) },
    },
  }
}

test("isNotFound / isDuplicate", () => {
  assert.equal(isNotFound({ statusCode: 404 }), true)
  assert.equal(isNotFound({ statusCode: 500 }), false)
  assert.equal(isNotFound(null), false)
  assert.equal(isDuplicate({ statusCode: 409 }), true)
  assert.equal(isDuplicate({ statusCode: 500, message: "Contact already exists" }), true)
  assert.equal(isDuplicate({ statusCode: 500, message: "boom" }), false)
})

test("404 -> create + add -> created", async () => {
  const r = fakeResend({
    get: () => err(404),
    create: () => ok({ id: "c1" }),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "a@x.com" })
  assert.equal(res.status, "created")
  assert.deepEqual(r.calls.create[0], { email: "a@x.com", unsubscribed: false })
  assert.deepEqual(r.calls.add[0], { email: "a@x.com", segmentId: SEG })
})

test("existing unsubscribed -> skipped, no writes", async () => {
  const r = fakeResend({ get: () => ok({ unsubscribed: true }) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "u@x.com" })
  assert.equal(res.status, "skipped-unsubscribed")
  assert.equal(r.calls.create.length, 0)
  assert.equal(r.calls.add.length, 0)
})

test("existing active not-member -> added-to-segment", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: () => ok({ object: "list", data: [] }),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "b@x.com" })
  assert.equal(res.status, "added-to-segment")
  assert.equal(r.calls.add.length, 1)
})

test("existing active already-member -> already-member, no add", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: () => ok({ object: "list", data: [{ id: SEG }] }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "c@x.com" })
  assert.equal(res.status, "already-member")
  assert.equal(r.calls.add.length, 0)
})

test("non-404 get error -> error, no create", async () => {
  const r = fakeResend({ get: () => err(500) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "e@x.com" })
  assert.equal(res.status, "error")
  assert.equal(r.calls.create.length, 0)
})

test("create duplicate race -> refetch once -> apply rules", async () => {
  let gets = 0
  const r = fakeResend({
    get: () => (gets++ === 0 ? err(404) : ok({ unsubscribed: false })),
    create: () => err(409),
    list: () => ok({ object: "list", data: [] }),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "race@x.com" })
  assert.equal(res.status, "added-to-segment")
  assert.equal(r.calls.get.length, 2)
})

test("created but segment-add fails -> error (partial, self-heals on rerun)", async () => {
  const r = fakeResend({
    get: () => err(404),
    create: () => ok({ id: "c1" }),
    add: () => err(500),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "p@x.com" })
  assert.equal(res.status, "error")
})

test("classifyContact is write-free", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: () => ok({ object: "list", data: [] }),
  })
  const res = await classifyContact({ resend: r, segmentId: SEG, email: "d@x.com" })
  assert.equal(res.status, "would-add")
  assert.equal(r.calls.create.length, 0)
  assert.equal(r.calls.add.length, 0)
})

test("classifyContact: 404 -> would-create; unsubscribed -> would-skip-unsubscribed", async () => {
  const r1 = fakeResend({ get: () => err(404) })
  assert.equal((await classifyContact({ resend: r1, segmentId: SEG, email: "n@x.com" })).status, "would-create")
  const r2 = fakeResend({ get: () => ok({ unsubscribed: true }) })
  assert.equal((await classifyContact({ resend: r2, segmentId: SEG, email: "s@x.com" })).status, "would-skip-unsubscribed")
})

test("resolveConfig reads env", () => {
  const c = resolveConfig({ RESEND_API_KEY: "k", RESEND_NEWSLETTER_SEGMENT_ID: "s" })
  assert.deepEqual(c, { apiKey: "k", segmentId: "s" })
  assert.deepEqual(resolveConfig({}), { apiKey: null, segmentId: null })
})

test("syncSubscriberToResend: no api key -> noop-no-api-key", async () => {
  const res = await syncSubscriberToResend("z@x.com", { env: {} })
  assert.equal(res.status, "noop-no-api-key")
})

test("syncSubscriberToResend: no segment id -> noop-no-segment-id", async () => {
  const res = await syncSubscriberToResend("z@x.com", { env: { RESEND_API_KEY: "k" } })
  assert.equal(res.status, "noop-no-segment-id")
})

test("syncSubscriberToResend: uses injected client via makeClient", async () => {
  const r = fakeResend({ get: () => err(404), create: () => ok({ id: "c1" }), add: () => ok({ id: SEG }) })
  const res = await syncSubscriberToResend("z@x.com", {
    env: { RESEND_API_KEY: "k", RESEND_NEWSLETTER_SEGMENT_ID: SEG },
    makeClient: () => r,
  })
  assert.equal(res.status, "created")
})

test("withRateLimit retries on 429 then succeeds", async () => {
  let n = 0
  const slept = []
  const base = fakeResend({ get: () => (n++ === 0 ? err(429) : ok({ unsubscribed: false })) })
  const wrapped = withRateLimit(base, { sleep: async (ms) => slept.push(ms), log: { warn() {} } })
  const res = await wrapped.contacts.get({ email: "r@x.com" })
  assert.equal(res.error, null)
  assert.equal(slept.length, 1)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/lib/resend-newsletter.test.mjs`
Expected: FAIL — cannot resolve `../../src/lib/resend-newsletter.mjs` (module not created yet).

- [ ] **Step 3: Implement `src/lib/resend-newsletter.mjs`**

```js
import { Resend } from "resend"

/**
 * Resend newsletter sync (issue #8). Global Contacts + explicit "Maya Allan
 * Newsletter" Segment membership, against resend@6.8.0. This module NEVER
 * imports alertAdmin (single-layer alerting lives in the callers) and NEVER
 * changes an existing Contact's global unsubscribe status.
 */

/** Genuine "contact not found" from the SDK { data, error } result. */
export function isNotFound(error) {
  return !!error && error.statusCode === 404
}

/** Create duplicate/conflict (concurrent-signup race). Confirm the exact code in
 *  the controlled test; treat 409 and an "already exists" message as the race. */
export function isDuplicate(error) {
  if (!error) return false
  if (error.statusCode === 409) return true
  const msg = (error.message || "").toLowerCase()
  return msg.includes("already exists")
}

async function addAndReport({ resend, segmentId, email }) {
  const added = await resend.contacts.segments.add({ email, segmentId })
  if (added.error) return { status: "error", detail: `segment-add:${added.error.statusCode ?? "unknown"}` }
  return { status: "added-to-segment" }
}

async function ensureExisting({ resend, segmentId, email, contact }) {
  if (contact?.unsubscribed === true) return { status: "skipped-unsubscribed" }
  const list = await resend.contacts.segments.list({ email })
  if (list.error) return { status: "error", detail: `segments-list:${list.error.statusCode ?? "unknown"}` }
  const segments = list.data?.data ?? []
  if (segments.some((s) => s.id === segmentId)) return { status: "already-member" }
  return await addAndReport({ resend, segmentId, email })
}

async function createAndAdd({ resend, segmentId, email }) {
  const created = await resend.contacts.create({ email, unsubscribed: false })
  if (created.error) {
    if (isDuplicate(created.error)) {
      const refetch = await resend.contacts.get({ email })
      if (refetch.error) return { status: "error", detail: `race-refetch:${refetch.error.statusCode ?? "unknown"}` }
      return await ensureExisting({ resend, segmentId, email, contact: refetch.data })
    }
    return { status: "error", detail: `create:${created.error.statusCode ?? "unknown"}` }
  }
  const added = await resend.contacts.segments.add({ email, segmentId })
  if (added.error) return { status: "error", detail: `segment-add-after-create:${added.error.statusCode ?? "unknown"}` }
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
    if (got.data?.unsubscribed === true) return { status: "would-skip-unsubscribed" }
    const list = await resend.contacts.segments.list({ email })
    if (list.error) return { status: "error", detail: `segments-list:${list.error.statusCode ?? "unknown"}` }
    const isMember = (list.data?.data ?? []).some((s) => s.id === segmentId)
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

/** Env-resolving convenience for the route. Config alerting is the caller's job. */
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

function retryAfterMs(error) {
  const h = error?.headers?.["retry-after"] ?? error?.headers?.["Retry-After"]
  if (!h) return null
  const secs = Number(h)
  return Number.isFinite(secs) ? Math.max(0, secs * 1000) : null
}

/** Wrap a resend client so 429s retry with Retry-After (when surfaced) or backoff. */
export function withRateLimit(resend, { maxRetries = 5, log = console, sleep = defaultSleep } = {}) {
  const retry = (fn) => async (arg) => {
    for (let attempt = 0; ; attempt++) {
      const res = await fn(arg)
      if (res?.error?.statusCode === 429 && attempt < maxRetries) {
        const wait = retryAfterMs(res.error) ?? Math.min(30_000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250)
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
      get: retry(c.get.bind(c)),
      create: retry(c.create.bind(c)),
      segments: {
        list: retry(c.segments.list.bind(c.segments)),
        add: retry(c.segments.add.bind(c.segments)),
      },
    },
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lib/resend-newsletter.test.mjs`
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/resend-newsletter.mjs tests/lib/resend-newsletter.test.mjs
git commit -m "feat(newsletter): resend sync module (create-then-add, 404-only, race-safe)"
```

---

### Task 2: Subscribe-route integration + disable welcome email + env docs

**Files:**
- Modify: `src/app/api/subscribe/route.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `syncSubscriberToResend` from Task 1.
- Produces: no new exports (route behavior only).

- [ ] **Step 1: Add the import**

In `src/app/api/subscribe/route.ts`, add to the imports (alongside the existing `alertAdmin` / `emailDomain` imports):

```ts
import { syncSubscriberToResend } from "@/lib/resend-newsletter.mjs"
```

- [ ] **Step 2: Await the sync before the success response (nonfatal, single-layer alert)**

Insert this block immediately **before** the final `return NextResponse.json({ success: true, message: "Subscribed successfully" })` (the current line 172):

```ts
    // issue #8: sync the subscriber to the Resend "Maya Allan Newsletter" Segment
    // (marketing source of truth). Awaited normally — NOT Promise.race, which would
    // not cancel the request and would leave async work after the response. The
    // route/platform timeout is the backstop. Nonfatal: the Supabase signup already
    // succeeded, so we always return success. This route is the single alerting layer
    // for signup-time sync failures.
    try {
      const sync = await syncSubscriberToResend(email)
      if (sync.status === "error") {
        await alertAdmin({
          severity: "error",
          subject: "Resend newsletter sync failed for a signup",
          body:
            "A newsletter signup was saved to Supabase but syncing the contact to the " +
            "Resend newsletter Segment failed. The subscriber is in the ledger; re-run " +
            "the import script to reconcile.",
          details: { subscriberDomain: emailDomain(email), status: sync.status, detail: sync.detail ?? null },
          dedupKey: "resend:newsletter-sync-failed",
        })
      } else if (sync.status === "noop-no-segment-id") {
        await alertAdmin({
          severity: "warning",
          subject: "Resend newsletter sync skipped: RESEND_NEWSLETTER_SEGMENT_ID not set",
          body:
            "RESEND_NEWSLETTER_SEGMENT_ID is not configured, so new signups are not being " +
            "added to the Resend newsletter Segment. Set it in Vercel env.",
          details: { subscriberDomain: emailDomain(email), status: sync.status },
          dedupKey: "resend:newsletter-no-segment-id",
        })
      }
      // noop-no-api-key is already logged inside the helper; alertAdmin needs that
      // same key, so there is nothing to email.
    } catch (syncErr) {
      // The helper is written not to throw; this is pure defense — never fail signup.
      console.error("[subscribe] resend newsletter sync threw:", syncErr)
    }
```

- [ ] **Step 3: Remove the subscriber-facing welcome email (keep the operator notification)**

Delete the entire "Welcome email to subscriber" block (current lines 144–169), from the comment `// Welcome email to subscriber` through the closing `})` of its `.catch(...)`. Replace it with a single marker comment:

```ts
      // Subscriber-facing welcome email intentionally disabled (issue #8): a
      // marketing-style welcome must carry a managed unsubscribe. It will be
      // restored as a Resend marketing Automation with {{{RESEND_UNSUBSCRIBE_URL}}}
      // (separate follow-up). The operator "new subscriber" notification above is
      // unchanged.
```

Leave the operator-notification `transporter.sendMail({ ... "New Newsletter Subscriber" ... })` block (current lines 110–142) exactly as-is.

- [ ] **Step 4: Document the env var**

In `.env.example`, under the Resend section (near `RESEND_API_KEY=`), add:

```bash
# Resend newsletter Segment id (Contacts synced here for Broadcasts). Not a secret.
RESEND_NEWSLETTER_SEGMENT_ID=
```

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run build`
Expected: exit 0.

(Rationale: the route has heavy external deps — Supabase, Resend, nodemailer — so its automated gate is tsc + build; behavior is verified by the controlled-email test in Rollout. The sync algorithm itself is unit-tested in Task 1.)

- [ ] **Step 6: Commit**

```bash
git add src/app/api/subscribe/route.ts .env.example
git commit -m "feat(newsletter): await resend sync in /api/subscribe; disable subscriber welcome email"
```

---

### Task 3: One-time import script + unit tests

**Files:**
- Create: `scripts/import-subscribers-to-resend.mjs`
- Test: `tests/scripts/import-subscribers.test.mjs`

**Interfaces:**
- Consumes: `syncContact`, `classifyContact`, `withRateLimit` from Task 1; `@supabase/supabase-js`, `resend`.
- Produces: `runImport({ rows, resend, segmentId, apply, sleep?, log? }): Promise<Record<string, number>>`.

- [ ] **Step 1: Write the failing test**

Create `tests/scripts/import-subscribers.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { runImport } from "../../scripts/import-subscribers-to-resend.mjs"

const SEG = "seg_123"
const ok = (data) => ({ data, error: null })
const err = (statusCode) => ({ data: null, error: { statusCode, message: "x" } })

function fakeResend({ get, create, list, add }) {
  const calls = { get: [], create: [], list: [], add: [] }
  const wrap = (name, h) => async (a) => { calls[name].push(a); return h ? h(a, calls[name].length - 1) : ok({}) }
  return {
    calls,
    contacts: { get: wrap("get", get), create: wrap("create", create),
      segments: { list: wrap("list", list), add: wrap("add", add) } },
  }
}

test("dry-run is completely write-free and reports would-* counts", async () => {
  const r = fakeResend({
    get: (a) => (a.email === "new@x.com" ? err(404) : ok({ unsubscribed: false })),
    list: () => ok({ object: "list", data: [] }),
  })
  const counts = await runImport({
    rows: [{ email: "new@x.com" }, { email: "active@x.com" }],
    resend: r, segmentId: SEG, apply: false, sleep: async () => {}, log: { info() {}, warn() {} },
  })
  assert.equal(r.calls.create.length, 0)
  assert.equal(r.calls.add.length, 0)
  assert.equal(counts["would-create"], 1)
  assert.equal(counts["would-add"], 1)
})

test("apply mode creates + adds", async () => {
  const r = fakeResend({
    get: () => err(404), create: () => ok({ id: "c1" }), add: () => ok({ id: SEG }),
  })
  const counts = await runImport({
    rows: [{ email: "new@x.com" }], resend: r, segmentId: SEG, apply: true,
    sleep: async () => {}, log: { info() {}, warn() {} },
  })
  assert.equal(counts["created"], 1)
  assert.equal(r.calls.create.length, 1)
})

test("apply mode skips unsubscribed without writing", async () => {
  const r = fakeResend({ get: () => ok({ unsubscribed: true }) })
  const counts = await runImport({
    rows: [{ email: "u@x.com" }], resend: r, segmentId: SEG, apply: true,
    sleep: async () => {}, log: { info() {}, warn() {} },
  })
  assert.equal(counts["skipped-unsubscribed"], 1)
  assert.equal(r.calls.add.length, 0)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/scripts/import-subscribers.test.mjs`
Expected: FAIL — `runImport` not exported / script missing.

- [ ] **Step 3: Implement `scripts/import-subscribers-to-resend.mjs`**

```js
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { syncContact, classifyContact, withRateLimit } from "../src/lib/resend-newsletter.mjs"

/**
 * One-time backfill of active Supabase subscribers into the Resend newsletter
 * Segment. Reuses the SAME rules as live signup. --dry-run is the DEFAULT and is
 * completely write-free; pass --apply to perform writes.
 *
 * Run:
 *   node --env-file=.env.local scripts/import-subscribers-to-resend.mjs            # dry-run
 *   node --env-file=.env.local scripts/import-subscribers-to-resend.mjs --apply    # real
 *
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY),
 *               RESEND_API_KEY, RESEND_NEWSLETTER_SEGMENT_ID
 */

const PACING_MS = 150 // ~6-7 req/s ceiling, comfortably under Resend's ~10 req/s default

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function runImport({ rows, resend, segmentId, apply, sleep: sleepFn = sleep, log = console }) {
  const counts = {}
  const bump = (s) => { counts[s] = (counts[s] ?? 0) + 1 }
  for (const row of rows) {
    const res = apply
      ? await syncContact({ resend, segmentId, email: row.email })
      : await classifyContact({ resend, segmentId, email: row.email })
    bump(res.status)
    if (res.status === "error") log.warn?.(`[import] error for one contact: ${res.detail ?? "unknown"}`)
    await sleepFn(PACING_MS)
  }
  return counts
}

async function main() {
  const apply = process.argv.includes("--apply")
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  const apiKey = process.env.RESEND_API_KEY
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID

  const missing = []
  if (!url) missing.push("SUPABASE_URL")
  if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY")
  if (!apiKey) missing.push("RESEND_API_KEY")
  if (!segmentId) missing.push("RESEND_NEWSLETTER_SEGMENT_ID")
  if (missing.length) {
    console.error(`[import] missing required env: ${missing.join(", ")}`)
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data: rows, error } = await supabase
    .from("email_subscribers")
    .select("email")
    .is("unsubscribed_at", null)
  if (error) {
    console.error("[import] supabase read failed:", error.message)
    process.exit(1)
  }

  const resend = withRateLimit(new Resend(apiKey), { log: console })
  console.log(`[import] mode=${apply ? "APPLY" : "DRY-RUN"} rows=${rows.length} segment=${segmentId}`)
  const counts = await runImport({ rows, resend, segmentId, apply, log: console })
  console.log("[import] done:", JSON.stringify(counts))
}

// Run only when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("import-subscribers-to-resend.mjs")) {
  main().catch((e) => { console.error("[import] fatal:", e); process.exit(1) })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/scripts/import-subscribers.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/import-subscribers-to-resend.mjs tests/scripts/import-subscribers.test.mjs
git commit -m "feat(newsletter): dry-run-default import script reusing the sync module"
```

---

### Task 4: Website unsubscribe copy

**Files:**
- Modify: `src/components/NewsletterSection.tsx:92-95`
- Modify: `src/app/privacy/page.tsx:192-193`

**Interfaces:** none (copy only).

- [ ] **Step 1: Update `NewsletterSection.tsx`**

Replace exactly:

```tsx
          To stop receiving emails, contact us through the{" "}
          <Link href="/contact" className="underline hover:text-charcoal">
            contact page
          </Link>
          . See our{" "}
```

with:

```tsx
          You can unsubscribe at any time using the link included in every newsletter. See our{" "}
```

- [ ] **Step 2: Update `privacy/page.tsx`**

Replace exactly:

```tsx
          You can ask us to access, correct, or delete the personal information we hold about you. You may stop
          receiving marketing emails by contacting us through the contact page. We will
```

with:

```tsx
          You can ask us to access, correct, or delete the personal information we hold about you. You can
          unsubscribe at any time using the link included in every newsletter. We will
```

- [ ] **Step 3: Confirm no other newsletter-unsubscribe copy remains**

Run: `grep -rniE "stop receiving|unsubscrib|contacting us through the contact page" src/components/NewsletterSection.tsx src/app/privacy/page.tsx`
Expected: no line still tells subscribers to use the contact page to stop newsletter emails. (Other unrelated "contact page" references for data-rights requests may remain — they are not newsletter unsubscribe.)

- [ ] **Step 4: Typecheck and build**

Run: `npx tsc --noEmit` → exit 0.
Run: `npm run build` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/NewsletterSection.tsx src/app/privacy/page.tsx
git commit -m "copy(newsletter): unsubscribe via in-email link, not the contact page"
```

---

## Regression / full-suite gate (after all tasks)

- [ ] Run the full unit suite: `node --test tests/lib/resend-newsletter.test.mjs tests/scripts/import-subscribers.test.mjs` → all PASS.
- [ ] Re-run the neighboring money-safety suite to ensure nothing drifted: `node --test tests/lib/db-coerce.test.mjs` (if present) → PASS.
- [ ] `npx tsc --noEmit` → exit 0.
- [ ] `npm run build` → exit 0.
- [ ] `git status --short` → only the intended files changed; `HANDOFF-2026-07-14.md` untracked and unstaged.

---

## Account setup order (Maya + operator — executed at rollout, NOT during coding)

1. **Create the Segment** in the Resend dashboard named exactly **`Maya Allan Newsletter`**; copy its Segment ID.
2. **Set env** `RESEND_NEWSLETTER_SEGMENT_ID` = that ID in Vercel (preview + production), and in local `.env.local` for the import run.
3. **Deploy** the merged code to production.
4. **Controlled-email test** (below) against the real Segment.
5. **Dry-run import**, review counts.
6. **Real import** (`--apply`), review counts.

## Exact commands

Set once for the session (operator's shell): `SITE=https://mayaallan.com`

**Controlled-email test** (use a real inbox you control, e.g. `maya+nltest@mayaallan.com`):

```bash
# 1. First signup -> expect a new Contact in the Segment, unsubscribed=false
curl -sS -X POST "$SITE/api/subscribe" -H "Content-Type: application/json" \
  -d '{"email":"maya+nltest@mayaallan.com"}'
# Verify in Resend dashboard: Contact exists, unsubscribed=false, in "Maya Allan Newsletter".

# 2. Re-signup same address -> expect NO change (already-member); still one Contact
curl -sS -X POST "$SITE/api/subscribe" -H "Content-Type: application/json" \
  -d '{"email":"maya+nltest@mayaallan.com"}'

# 3. In Resend dashboard, UNSUBSCRIBE that Contact. Then re-signup:
curl -sS -X POST "$SITE/api/subscribe" -H "Content-Type: application/json" \
  -d '{"email":"maya+nltest@mayaallan.com"}'
# Verify in Resend dashboard: Contact is STILL unsubscribed (not reactivated, not re-added).

# 4. Cleanup: delete the test Contact in the Resend dashboard if desired.
```

Also note the exact duplicate/conflict error `statusCode` observed if a race is triggered, and confirm it matches `isDuplicate` (adjust the code only if it differs).

**Dry-run import** (write-free):

```bash
node --env-file=.env.local scripts/import-subscribers-to-resend.mjs
# Review printed counts: would-create / would-add / would-skip-unsubscribed / already-member / error
```

**Real import**:

```bash
node --env-file=.env.local scripts/import-subscribers-to-resend.mjs --apply
# Review counts: created / added-to-segment / already-member / skipped-unsubscribed / error
```

**Verification after import**: in the Resend dashboard, confirm the "Maya Allan Newsletter" Segment count ≈ (Supabase active rows) minus any that were already globally unsubscribed in Resend; re-run the dry-run and confirm `would-create`/`would-add` are ~0 (idempotent).

## Rollout & rollback per stage

| Stage | Failure signal | Rollback |
|---|---|---|
| Create Segment | — | Delete the empty Segment (no data impact). |
| Set env var | — | Unset `RESEND_NEWSLETTER_SEGMENT_ID`; helper returns `noop-no-segment-id`, signups still succeed. |
| Deploy code | tsc/build already green pre-merge; runtime errors on `/api/subscribe` | Revert the merge / redeploy previous build. Signups keep working even before revert (sync is nonfatal; Supabase write is unchanged). Reverting also restores the welcome email. |
| Controlled test | Contact not created / wrong state / unsubscribe resurrected | Do NOT proceed to import. Delete the test Contact; fix the module; re-test. |
| Dry-run | Unexpected counts (e.g., would-create for known-existing) | No writes occurred; investigate before `--apply`. |
| Real import | Errors in counts, or a wrong Contact added | Import only ADDS active contacts to the Segment and never changes unsubscribe status, so blast radius is "extra Segment members." Remove specific Contacts from the Segment in the dashboard if a mistake is found; safe to re-run the import (idempotent) after fixing. |

## Broadcast pre-send checklist (manual, every Broadcast)

- [ ] Body includes the managed unsubscribe placeholder **`{{{RESEND_UNSUBSCRIBE_URL}}}`**.
- [ ] Accurate **sender** identity (recognizable from-name/address on the verified domain).
- [ ] Compliant **footer** (physical mailing address / who is sending / why they receive it).
- [ ] Correct **Segment target**: `Maya Allan Newsletter`.

---

## Self-review

**Spec coverage:** create-then-add (Task 1) ✓; 404-only creation + one-refetch race (Task 1 tests) ✓; partial-state → error + self-heal (Task 1) ✓; list-before-add for existing active (Task 1) ✓; never update unsubscribe status (no `contacts.update` anywhere) ✓; route awaits normally, nonfatal (Task 2) ✓; remove only subscriber welcome, keep operator notify (Task 2) ✓; write-free `--dry-run` + `--apply` (Task 3) ✓; 429/Retry-After (Task 1 `withRateLimit`, used in Task 3) ✓; single-layer alerting (helper config-log/route-alert/import-aggregate) ✓; missing API key → server log not email (Task 1) ✓; module strategy `.mjs` + node/TS import ✓; copy change (Task 4) ✓; account-setup order, controlled test, dry-run, real import, verification, rollback, pre-send checklist ✓.

**Placeholder scan:** no TBD/TODO; every code/step is concrete; exact strings for copy edits.

**Type/name consistency:** result statuses used in tests match the module (`created`/`added-to-segment`/`already-member`/`skipped-unsubscribed`/`would-create`/`would-add`/`would-skip-unsubscribed`/`error`/`noop-*`); `syncContact`/`classifyContact`/`withRateLimit`/`resolveConfig`/`syncSubscriberToResend` names consistent across module, route, and script.
