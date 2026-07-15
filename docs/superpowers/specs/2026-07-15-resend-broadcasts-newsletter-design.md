# Resend Broadcasts Newsletter Integration — Design

- **Date (UTC):** 2026-07-15
- **Status:** Approved-in-direction; revised spec pending review (no implementation yet)
- **Owner:** Maya Allan
- **Installed SDK:** `resend@6.8.0` (all API details below verified against this version's `dist/index.d.cts`)
- **Related:** outstanding item #8 (proper one-click newsletter unsubscribe)

## Problem

The site collects newsletter signups into Supabase (`email_subscribers`) and currently
tells subscribers to use the contact page to unsubscribe — a mechanism that does not
exist. Before any newsletter campaign is sent at scale we need compliant one-click
unsubscribe, suppression, and unsubscribe headers on outgoing marketing mail.

## Decision

Use **Resend Broadcasts** as the external newsletter platform rather than building an
in-app bulk sender, signed-token unsubscribe system, or RFC 8058 endpoint.

Scope of what Resend provides (precise — no over-claiming): Resend provides the
**Broadcast sending infrastructure, global unsubscribe suppression, the managed
unsubscribe link/mechanics, and the associated `List-Unsubscribe` headers.** Resend does
**not** assume all legal compliance and does **not** guarantee deliverability. Compliant
sender identity and footer content remain our responsibility (see the pre-send checklist).

Resend model as exposed by the installed `resend@6.8.0` SDK:

- **Contacts are global** — `resend.contacts.create({ email, unsubscribed })`. `CreateContactOptions` fields in 6.8.0 are: `email`, `unsubscribed?`, `firstName?`, `lastName?`, `properties?`, `audienceId?` (deprecated). There is **no `segments` field** — a Contact cannot be created into a Segment atomically in this version (see "Create + Segment" below).
- **Segments** group contacts explicitly. `resend.segments.create({ name })` returns `{ id }`. Per-contact segment membership is managed by `resend.contacts.segments`: `.list(...)`, `.add({ email|contactId, segmentId })`, `.remove(...)`.
- Each Contact has a single **global** `unsubscribed` status (applies across all Broadcasts).
- **Error model:** every call returns `{ data, error }`. On a real HTTP response the SDK sets `error.statusCode = response.status` (`number | null`). A missing Contact is `error.statusCode === 404`. Calls can also throw on transport failure, so callers must handle both the returned `error` and thrown exceptions — the returned `error` is not the sole failure path.

### Source-of-truth split

- **Resend** = source of truth for marketing sends and unsubscribe/suppression.
- **Supabase `email_subscribers`** = website signup ledger / audit record (unchanged schema).

## Non-goals / scope guardrails

- No database migration, no new columns, no change to `email_subscribers` schema.
- No DNS or sending-domain changes (Broadcasts use the already-verified Resend domain).
- No custom unsubscribe endpoint, signed-token system, or in-app bulk sender.
- No change to transactional email (purchase receipts, download/PDF delivery, contact
  confirmations, admin alerts) — unrelated to newsletter unsubscribe status.
- The internal **operator "new subscriber" notification** (email to Maya, not the
  subscriber) is unchanged and out of scope, including its pre-existing unawaited-`.catch()`
  send. This change must not become a general email-system rewrite.

## Architecture

```
Website signup (/api/subscribe)
  → upsert email_subscribers (Supabase ledger, unchanged; onConflict ignoreDuplicates)
  → await syncSubscriberToResend(email)   [awaited normally; nonfatal; NO Promise.race]
        → global Contact + "Maya Allan Newsletter" Segment membership

One-time import (scripts/import-subscribers-to-resend.mjs)
  → read email_subscribers WHERE unsubscribed_at IS NULL
  → reuse the SAME shared module's rules per row (dry-run default, throttled, idempotent)

Campaigns
  → Resend Broadcasts, composed in dashboard, target "Maya Allan Newsletter" Segment,
    must include {{{RESEND_UNSUBSCRIBE_URL}}}  (managed unsubscribe + suppression)
```

## Shared-module strategy (resolved — no guesswork)

The sync logic lives in **`src/lib/resend-newsletter.mjs`** — a plain ESM JavaScript module
with JSDoc types. It is imported by **both**:

- the TS route `src/app/api/subscribe/route.ts` (works because `tsconfig` has `allowJs: true`
  and `moduleResolution: "bundler"`), and
- the plain-node script `scripts/import-subscribers-to-resend.mjs` (run via `node`).

This mirrors the existing, working precedent `src/lib/crisis-classifier.mjs`, which is
imported by both a TS file (`src/lib/crisis-detection.ts` → `export * from "./crisis-classifier.mjs"`)
and a node script (`scripts/test-crisis-detection.mjs`). **No `tsx` runner and no new
dependency are required.** Imports use the explicit `.mjs` extension.

## Components (file-by-file) — implemented only after spec review

### 1. `src/lib/resend-newsletter.mjs` (new)

Exports `syncSubscriberToResend(email): Promise<Result>`. `Result.status` is one of:
`created` | `added-to-segment` | `already-member` | `skipped-unsubscribed` |
`noop-no-segment-id` | `noop-no-api-key` | `error`. **The helper never throws** (it wraps
every Resend call and catches thrown exceptions in addition to inspecting `{ data, error }`).

Config gates (checked first):
- **`RESEND_API_KEY` missing** → return `noop-no-api-key` after a prominent
  `console.error("[resend-newsletter] RESEND_API_KEY missing — subscriber not synced")`.
  It does **not** call `alertAdmin`, because `alertAdmin` itself requires `RESEND_API_KEY`
  and would only log a dropped alert.
- **`RESEND_NEWSLETTER_SEGMENT_ID` missing** → return `noop-no-segment-id` and emit a
  **deduplicated** `alertAdmin` (safe here — the Resend key is present).

Per-contact logic (`{ data, error }` inspected on every call; 404 recognized via
`error.statusCode === 404`):

1. `resend.contacts.get({ email })`
   - **`error.statusCode === 404`** → contact does not exist → go to (2, create).
   - **`data` returned** → contact exists → go to (3, existing).
   - **any other `error` or thrown exception** → return `error`. **Never create on a non-404
     failure** — a transient GET error must not be read as "does not exist".
2. **Create + add to Segment** (2 calls — 6.8.0 cannot create into a Segment atomically):
   - `resend.contacts.create({ email, unsubscribed: false })`.
     - **success** → `resend.contacts.segments.add({ email, segmentId })`; on success return
       `created`. If the add fails, return `error` (partial state: contact exists but is not
       in the Segment — self-healing: a re-run or the next signup finds the contact active,
       sees it is not a member, and adds it).
     - **create error indicating the contact already exists (duplicate/conflict)** → this is
       the concurrent-signup race (two requests both saw 404). **Re-fetch once** with
       `contacts.get({ email })` and apply the existing-contact rules (3). The exact
       statusCode/error-name for the duplicate case in 6.8.0 is confirmed by the controlled
       test (Rollout step 3); treat only that indicator as the race path.
     - **any other create error / exception** → return `error`.
3. **Existing contact** (`data.unsubscribed` is authoritative):
   - **`unsubscribed === true`** → return `skipped-unsubscribed`. Do nothing: no update, no
     reactivate, no segment add. (We **never** call `contacts.update({ unsubscribed: false })`
     anywhere in the codebase.)
   - **active (`unsubscribed === false`)** → `resend.contacts.segments.list({ email })`; if
     the target `segmentId` is **absent**, `resend.contacts.segments.add({ email, segmentId })`
     and return `added-to-segment`; if already present return `already-member`. Membership is
     checked via `list` rather than assuming `add` is idempotent. Any list/add error → `error`.

The helper does **not** call `alertAdmin` for per-contact operational `error`s — it returns
the typed result and lets the caller decide (single-layer alerting).

### 2. `src/app/api/subscribe/route.ts` (edit)

- After the existing Supabase upsert + `trackMarketingEvent`, **`await syncSubscriberToResend(email)` normally** (no `Promise.race`, no artificial timeout — `Promise.race` would not cancel the underlying Resend request and would leave async work running after the response). The route/platform function timeout is the backstop.
- Failure is **nonfatal**: wrap in try/catch; if the result is `error` (or the call throws), the route emits **one** deduplicated `alertAdmin` (this is the single alerting layer for live-signup operational failures) and still returns `{ success: true }`. Supabase signup succeeds regardless of Resend availability.
- **Preserve `unsubscribed_at`.** The existing write must remain conflict-ignoring:
  ```ts
  const { error } = await supabaseAdmin
    .from(Tables.emailSubscribers)
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true })
  ```
  The payload is `{ email }` only and `ignoreDuplicates: true` makes a conflict a no-op
  (`INSERT ... ON CONFLICT DO NOTHING`), so an existing row's `unsubscribed_at` is never
  touched. Review must reject any change to a non-ignoring upsert or added column writes.
- **Disable only the subscriber-facing welcome email** (the "Welcome to the Newsletter!"
  send to the subscriber). The **operator** "new subscriber" notification to Maya is
  unchanged. A compliant welcome via a Resend marketing Automation with
  `{{{RESEND_UNSUBSCRIBE_URL}}}` is a separate follow-up.

### 3. `scripts/import-subscribers-to-resend.mjs` (new)

One-time backfill; **imports and reuses `src/lib/resend-newsletter.mjs`** (no separate,
looser logic).

- Reads only `email_subscribers WHERE unsubscribed_at IS NULL` via `supabaseAdmin`.
- **`--dry-run` is the default and is completely write-free:** it may `contacts.get` and
  `contacts.segments.list` to classify each row but must **never** `contacts.create` or
  `contacts.segments.add`. Dry-run counters: **`would-create`, `would-add`,
  `would-skip-unsubscribed`, `error`**. A real run (explicit `--apply` flag) performs the
  writes and reports `created`, `added-to-segment`, `already-member`,
  `skipped-unsubscribed`, `error`.
- Existing globally-unsubscribed contacts are skipped and never added/reactivated.
- **Idempotent** and safe to re-run.
- **Rate limiting:** conservative concurrency (well under Resend's documented default of
  ~10 requests/second). Detect throttling via `error.statusCode === 429`; honor a
  `Retry-After` / `ratelimit-*` value when the installed SDK surfaces response headers, and
  otherwise fall back to exponential backoff with jitter. **No hardcoded requests-per-second
  assumption.** (Whether 6.8.0 surfaces response headers is confirmed during implementation;
  the 429-driven backoff is the guaranteed mechanism.)

### 4. Website copy (edit)

Replace the "contact the contact page to unsubscribe" wording everywhere it appears
(at least `src/app/privacy/page.tsx` and `src/components/NewsletterSection.tsx`; grep for
all occurrences) with exactly:

> You can unsubscribe at any time using the link included in every newsletter.

### 5. `.env.example` (edit, documentation only)

Document `RESEND_NEWSLETTER_SEGMENT_ID` (not a secret; no real value committed).

## Alerting responsibility (single layer per failure)

| Failure | Where alerted | Mechanism |
|---|---|---|
| `RESEND_API_KEY` missing | helper | prominent `console.error` (no email — `alertAdmin` needs the key) |
| `RESEND_NEWSLETTER_SEGMENT_ID` missing | helper | deduplicated `alertAdmin` |
| Per-contact sync `error` at **live signup** | route | one deduplicated `alertAdmin` |
| Per-row `error` during **import** | script | aggregated into counts + a summary log (no per-row alert flood) |

No single failure is alerted by two layers.

## Account setup (Maya, in Resend dashboard — at implementation, NOT now)

1. Create the **Segment** named **"Maya Allan Newsletter"** (this is the real production
   Segment — there is no separate "test Segment"). Copy its Segment ID.
2. Set `RESEND_NEWSLETTER_SEGMENT_ID` in Vercel env (preview + production).
3. Broadcasts target the "Maya Allan Newsletter" Segment.

## Broadcast pre-send checklist (manual, every Broadcast)

- Body includes the managed unsubscribe placeholder **`{{{RESEND_UNSUBSCRIBE_URL}}}`**
  (renders Resend's managed unsubscribe link; drives suppression + `List-Unsubscribe`).
- Compliant **sender identity** (recognizable from-name/address on the verified domain).
- Compliant **footer** (physical mailing address / who is sending / why they're receiving it),
  as required by applicable law — Resend does not supply this for us.
- Targeted to the "Maya Allan Newsletter" Segment.

## Rollout / import procedure (order-safe; all steps idempotent)

1. Maya creates the Segment and sets `RESEND_NEWSLETTER_SEGMENT_ID`.
2. Deploy the signup-sync code so new signups flow to Resend.
3. **Single controlled-email test against the real Segment (before importing anyone else):**
   run one controlled address through the flow and confirm (a) Contact creation, (b) Segment
   membership, (c) re-signup idempotency (no duplicate, no change), (d) unsubscribe
   preservation (unsubscribe the test Contact in Resend, re-signup on site, confirm it stays
   unsubscribed and is neither reactivated nor re-added). Also confirm the exact
   duplicate/conflict error indicator used by the race path. Delete the test Contact
   afterward if desired.
4. Run the import `--dry-run` (verify counters; `unsubscribed_at` rows excluded), then the
   real `--apply` run.
5. Compose/send campaigns via Resend Broadcasts (using the pre-send checklist).

## Failure handling (summary)

- **Signup sync failure:** Supabase ledger row saved; route emits one dedup'd `alertAdmin`;
  signup still returns success; reconcilable by re-running the import (idempotent).
- **Missing `RESEND_API_KEY`:** helper logs prominently, returns `noop-no-api-key`; no email.
- **Missing `RESEND_NEWSLETTER_SEGMENT_ID`:** helper dedup-alerts, returns `noop-no-segment-id`.
- **Non-404 `contacts.get` error:** treated as failure — no contact created.
- **Create race (duplicate after 404):** single re-fetch, then normal rules; never overwrite status.
- **Partial state (created but segment-add failed):** returns `error`; self-heals on re-run.
- **Existing unsubscribed contact:** never updated, reactivated, or segment-added.
- **429:** conservative concurrency + backoff honoring `Retry-After` when available; import safe to re-run.

## Testing plan

Against the real "Maya Allan Newsletter" Segment, using one controlled address (per Rollout 3):

1. New signup → Contact created, `unsubscribed:false`, present in the Segment (`created`).
2. Re-signup same active email → `already-member`; still one Contact; status unchanged.
3. Unsubscribe the Contact in Resend → re-signup on site → `skipped-unsubscribed`; stays
   unsubscribed; not reactivated; not re-added.
4. Simulate a non-404 `contacts.get` error → helper returns `error`; no Contact created.
5. Force a create duplicate/conflict → helper re-fetches once and applies normal rules.
6. Import `--dry-run` is write-free and reports `would-*` counters excluding `unsubscribed_at`
   rows; `--apply` run is idempotent on re-run; 429 handling backs off.
7. Send a test Broadcast → `{{{RESEND_UNSUBSCRIBE_URL}}}` renders a working unsubscribe that
   suppresses future sends.
8. Transactional emails (purchase, PDF, alerts, contact) unaffected; website copy updated;
   `tsc --noEmit` and production build clean.

## Follow-ups (separate work, not in this spec)

- Restore a subscriber welcome as a **Resend marketing Automation** with `{{{RESEND_UNSUBSCRIBE_URL}}}`.
- (Optional, out of scope) Address the pre-existing unawaited operator-notification send.
- (Optional) If true atomic create-into-Segment is later required, evaluate upgrading `resend`
  to a version whose `CreateContactOptions` exposes a `segments` field — a separate dependency
  decision, verified against that version.

## Recorded decisions

1. External platform = Resend Broadcasts; no in-app bulk sender / token system / RFC 8058 endpoint.
2. Resend model = global Contacts + explicit Segment membership; Audiences deprecated/unused.
3. Env var = `RESEND_NEWSLETTER_SEGMENT_ID`; Segment name = "Maya Allan Newsletter" (the real Segment; no separate test Segment).
4. **Create + Segment is two calls** (create, then `contacts.segments.add`) because `resend@6.8.0` `CreateContactOptions` has no `segments` field. Atomic create-with-segments is not available in the installed version.
5. **Race handling:** a create duplicate/conflict after an initial 404 triggers one re-fetch, then the normal existing-contact rules; unsubscribe status is never overwritten.
6. **Segment membership uses `contacts.segments.list` then `add`** — no idempotency assumption about `add`.
7. **No `Promise.race` timeout** — it would not cancel the Resend request. The sync is awaited normally; the route/platform timeout is the backstop.
8. **`{ data, error }` handling on every call**, with `error.statusCode === 404` as the not-found signal; thrown exceptions are also caught but are not the sole error path.
9. **Single-layer alerting** (see table): helper handles config conditions (missing key → server log; missing segment id → dedup alert); route handles live-signup operational errors; import aggregates.
10. **Missing `RESEND_API_KEY` → prominent server log, not `alertAdmin`** (which needs that key).
11. **Shared module = `src/lib/resend-newsletter.mjs`** imported by the TS route and the node script (`allowJs:true` + bundler; precedent `crisis-classifier.mjs`); no `tsx`, no new dependency.
12. **`--dry-run` default and write-free**; counters `would-create`, `would-add`, `would-skip-unsubscribed`, `error`; real run behind `--apply`.
13. **Rate limiting** honors 429 + `Retry-After`/`ratelimit-*` when surfaced, with conservative concurrency and backoff; no hardcoded requests-per-second rule (Resend default ~10 req/s).
14. Supabase upsert preserves `unsubscribed_at` via the existing `ignoreDuplicates: true` write.
15. Welcome email = disable-now (subscriber-facing only); operator notification unchanged/out of scope; Automation restore is a follow-up.
16. Website copy = "You can unsubscribe at any time using the link included in every newsletter."
17. Scope = no DB migration/columns, no DNS/sending-domain change, no custom unsubscribe endpoint.
18. Resend's role stated precisely (infrastructure + suppression + managed unsubscribe + headers), not "owns compliance/deliverability"; a manual per-Broadcast pre-send checklist covers sender/footer + the managed unsubscribe placeholder.
