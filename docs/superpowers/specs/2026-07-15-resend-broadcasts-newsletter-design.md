# Resend Broadcasts Newsletter Integration — Design

- **Date (UTC):** 2026-07-15
- **Status:** Approved for spec review (no implementation yet)
- **Owner:** Maya Allan
- **Related:** outstanding item #8 (proper one-click newsletter unsubscribe)

## Problem

The site collects newsletter signups into Supabase (`email_subscribers`) and currently
tells subscribers to use the contact page to unsubscribe — a mechanism that does not
exist. Before any newsletter campaign is sent at scale, we need compliant one-click
unsubscribe, suppression, and unsubscribe headers on outgoing marketing mail.

## Decision

Use **Resend Broadcasts** as the external newsletter platform rather than building an
in-app bulk sender, signed-token unsubscribe system, or RFC 8058 endpoint. Resend owns
deliverability, suppression, unsubscribe flow, bounce/complaint handling, and the
`List-Unsubscribe` headers.

Resend's current model (verified against Resend docs, 2026-07-15):

- **Contacts are global** — `resend.contacts.create({ email, unsubscribed })` (`POST /contacts`); there is **no** `audienceId`. The legacy **Audiences** API is deprecated and must not be used.
- **Segments** group contacts explicitly — `resend.segments.create({ name })` returns a segment id; membership is added via `POST /contacts/{id_or_email}/segments/{segment_id}` (an explicit, idempotent add — segments here are not filter/rule-based).
- Each Contact has a single **global** `unsubscribed` status.

### Source-of-truth split

- **Resend** = source of truth for marketing sends and unsubscribe/suppression.
- **Supabase `email_subscribers`** = website signup ledger / audit record (unchanged schema).

## Non-goals / scope guardrails

- No database migration, no new database columns, no change to `email_subscribers` schema.
- No DNS or sending-domain changes (Broadcasts use the already-verified Resend domain).
- No custom unsubscribe endpoint, signed-token system, or in-app bulk sender.
- No change to transactional email: purchase receipts, download/PDF delivery, contact
  confirmations, and admin alerts remain exactly as-is and are unrelated to newsletter
  unsubscribe status.
- The internal **operator "new subscriber" notification** (email to Maya, not to the
  subscriber) is unchanged and out of scope.
- The pre-existing unawaited-`.catch()` behavior of the operator-notification send is a
  latent serverless issue and is **explicitly out of scope** — this change must not turn
  into a general email-system rewrite.

## Architecture

```
Website signup (/api/subscribe)
  → upsert email_subscribers (Supabase ledger, unchanged; onConflict ignoreDuplicates)
  → await syncSubscriberToResend(email)  [short timeout, nonfatal]
        → global Contact + "Maya Allan Newsletter" Segment membership

One-time import (scripts/import-subscribers-to-resend.mjs)
  → read email_subscribers WHERE unsubscribed_at IS NULL
  → SAME syncSubscriberToResend rules per row (dry-run default, throttled, idempotent)

Campaigns
  → Resend Broadcasts, composed in dashboard, target "Maya Allan Newsletter" Segment,
    must include {{{RESEND_UNSUBSCRIBE_URL}}} (Resend-managed unsubscribe + suppression)
```

## Components (file-by-file) — to be implemented only after spec review

### 1. `src/lib/resend-newsletter.ts` (new)

`syncSubscriberToResend(email): Promise<Result>` where `Result` is a discriminated union
(`created` | `added-to-segment` | `skipped-unsubscribed` | `noop-no-segment-id` | `error`).
The helper **never throws**.

Logic:

1. Resolve `RESEND_NEWSLETTER_SEGMENT_ID`. If unset → return `noop-no-segment-id` and emit a
   one-time (dedup'd) `alertAdmin`. Never break the caller.
2. `resend.contacts.get({ email })`:
   - **404 / not-found only** → contact does not exist → `resend.contacts.create({ email, unsubscribed: false })`, then add to the Segment (`POST /contacts/{email}/segments/{RESEND_NEWSLETTER_SEGMENT_ID}`). Return `created`.
   - **Any other retrieval error** (429, 5xx, network, auth) → treat as a **sync failure**; return `error`. Do **NOT** create a contact on a non-404 error (a transient GET failure must never be interpreted as "does not exist").
   - **Found + `unsubscribed === true`** → return `skipped-unsubscribed`. Do nothing: no update, no reactivate, no add-to-segment.
   - **Found + active (`unsubscribed === false`)** → add to Segment (idempotent). Never modify unsubscribe state. Return `added-to-segment`.
3. **Never** call `resend.contacts.update({ unsubscribed: false })` anywhere in this codebase.

Shared Resend client construction follows the existing pattern (`new Resend(process.env.RESEND_API_KEY)`); if `RESEND_API_KEY` is missing the helper no-ops + alerts, never throws.

### 2. `src/app/api/subscribe/route.ts` (edit)

- After the existing Supabase upsert + `trackMarketingEvent`, **`await syncSubscriberToResend(email)`** wrapped in `Promise.race` with a short timeout (~3–5s) and a try/catch. Failure is **nonfatal**: on `error`/timeout, emit a dedup'd `alertAdmin` and still return `{ success: true }`. **No unawaited promise is launched after the HTTP response returns.**
- **Verify the Supabase upsert does not clear or overwrite `unsubscribed_at`** on an existing subscriber. The current call is `upsert({ email }, { onConflict: "email", ignoreDuplicates: true })`; `ignoreDuplicates: true` means an existing row is left untouched, preserving historical suppression. This invariant must be preserved and asserted in review — a future edit that switches to a non-ignoring upsert or adds column writes must not stomp `unsubscribed_at`.
- **Disable the subscriber-facing welcome email** (the "Welcome to the Newsletter!" send to the subscriber). Keep the **operator** "new subscriber" notification to Maya unchanged. Restoring a compliant welcome via a Resend marketing Automation with `{{{RESEND_UNSUBSCRIBE_URL}}}` is a separate follow-up (see Follow-ups).

### 3. `scripts/import-subscribers-to-resend.mjs` (new)

One-time backfill of existing active subscribers.

- Read only `email_subscribers WHERE unsubscribed_at IS NULL` via `supabaseAdmin`.
- Apply the **exact same rules** as live signup by reusing `syncSubscriberToResend` (no separate, looser implementation). Existing globally-unsubscribed Resend contacts are skipped and never added to the Segment or reactivated.
- `--dry-run` is the **default**; a real run requires an explicit flag. Prints per-outcome counts (`created`, `added-to-segment`, `skipped-unsubscribed`, `error`).
- **Idempotent** and safe to re-run.
- **Rate limiting:** honor Resend `429` responses and `Retry-After`, with safe retry/backoff; steady-state throttle to stay under Resend's API rate limit.

### 4. Website copy (edit)

Replace the "contact the contact page to unsubscribe" wording — everywhere it appears
(at least `src/app/privacy/page.tsx` and `src/components/NewsletterSection.tsx`; grep for
all occurrences) — with exactly:

> You can unsubscribe at any time using the link included in every newsletter.

### 5. `.env.example` (edit, documentation only)

Document `RESEND_NEWSLETTER_SEGMENT_ID` (not a secret; no real value committed).

## Account setup (Maya, in Resend dashboard — at implementation, NOT now)

1. Create a **Segment** named **"Maya Allan Newsletter"**; copy its Segment ID.
2. Set `RESEND_NEWSLETTER_SEGMENT_ID` in Vercel env (preview + production).
3. Broadcasts target the "Maya Allan Newsletter" Segment and **must include `{{{RESEND_UNSUBSCRIBE_URL}}}`**, which renders Resend's managed unsubscribe link; Resend manages the unsubscribe flow and suppression.

## Rollout / import procedure (order-safe; all steps idempotent)

1. Maya creates the Segment and sets `RESEND_NEWSLETTER_SEGMENT_ID`.
2. Deploy the signup-sync code so new signups flow to Resend.
3. **Single controlled-email test (before importing real subscribers):** run one email
   through the flow and confirm: (a) Contact creation, (b) Segment membership,
   (c) re-signup idempotency (no duplicate, no change), (d) unsubscribe preservation
   (unsubscribe the test contact in Resend, re-signup on site, confirm it stays
   unsubscribed and is not re-added/reactivated).
4. Run the import `--dry-run` (verify counts, `unsubscribed_at` rows excluded), then the
   real run.
5. Compose/send campaigns via Resend Broadcasts.

## Failure handling

- **Signup sync failure:** Supabase ledger row is saved; `alertAdmin` (dedup'd); signup
  still returns success; reconcilable by re-running the import (idempotent).
- **Missing `RESEND_NEWSLETTER_SEGMENT_ID`:** helper no-ops + one-time alert; signup never breaks.
- **Non-404 `contacts.get` error:** treated as sync failure — no contact is created.
- **Existing unsubscribed contact:** never updated, reactivated, or added to the Segment.
- **Resend 429:** honor `Retry-After`, backoff; import is safe to re-run.

## Testing plan

Against a Resend **test** Segment (not the production Segment):

1. New signup → Contact created, `unsubscribed:false`, present in the Segment.
2. Re-signup same email → still one Contact, status unchanged, no duplicate membership.
3. Unsubscribe a test Contact in Resend → re-signup on site → **stays unsubscribed**, not
   reactivated, not re-added.
4. Simulate a non-404 `contacts.get` error → helper returns `error`, no Contact created.
5. Import `--dry-run` counts correct and exclude `unsubscribed_at` rows; real run
   idempotent on re-run; 429 handling backs off.
6. Send a test Broadcast → `{{{RESEND_UNSUBSCRIBE_URL}}}` renders a working unsubscribe
   that suppresses future sends.
7. Transactional emails (purchase, PDF, alerts, contact) unaffected; website copy shows
   the new wording; `tsc --noEmit` and production build clean.

## Follow-ups (separate work, not in this spec)

- Restore a subscriber welcome message as a **Resend marketing Automation** with
  `{{{RESEND_UNSUBSCRIBE_URL}}}` (after the core integration works).
- (Optional, out of scope) Address the pre-existing unawaited operator-notification send.

## Recorded decisions

1. External platform = Resend Broadcasts; no in-app bulk sender / token system / RFC 8058 endpoint.
2. Resend model = global Contacts + explicit Segment membership; Audiences API is deprecated and not used.
3. Env var = `RESEND_NEWSLETTER_SEGMENT_ID`; Segment name = "Maya Allan Newsletter".
4. Sync rule = check-then-create with strict 404-only creation; never `contacts.update({ unsubscribed:false })`; unsubscribed contacts are never touched or segment-added.
5. Subscribe route awaits the sync (short timeout, nonfatal); no post-response unawaited promise.
6. Supabase upsert must preserve `unsubscribed_at` (currently via `ignoreDuplicates: true`).
7. Import reuses the same sync helper; `--dry-run` default; idempotent; honors 429/`Retry-After`.
8. Welcome email = **disable-now** (subscriber-facing only); operator notification unchanged/out of scope; Automation restore is a follow-up.
9. Website copy = "You can unsubscribe at any time using the link included in every newsletter."
10. Scope = no DB migration/columns, no DNS/sending-domain change, no custom unsubscribe endpoint.
11. Single controlled-email test precedes any real import.
