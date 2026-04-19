# Belief Inquiry Redesign — Phase 1 Design

**Date:** 2026-04-19
**Status:** Draft — awaiting user review
**Author:** Maya Allan (with AI pairing)

---

## 1. Summary

The existing Belief Audit tool is framed as a forensic evaluation ("find the bad belief, fix it"). Research on what actually shifts limiting beliefs — ACT, IFS, Motivational Interviewing, Clean Language, Coherence Therapy — points to a different stance: **curious exploration**, with evaluation happening *inside* curiosity rather than against it.

Phase 1 updates the two existing AI-assisted exploration tools (Belief Audit → Belief Inquiry; Nervous System Reset), builds one new tool (Integration), and introduces a single monetization path: a $9.99 save-this-session PDF, delivered through a fully stateless flow (no backend database, no user accounts, no persistent message storage).

## 2. Research foundation

This redesign is grounded in five evidence-based approaches. Each contributes a specific role — the tools are not "inspired by therapy," they draw on named techniques with published research.

| Approach | Contribution to the design | Evidence |
|---|---|---|
| **IFS (Internal Family Systems)** — 6 Fs protocol, 8 Cs of Self | Somatic body-first phrasing; "parts have positive intent" framing | NREPP evidence-based registry (2015); comparable to CBT for depression |
| **Clean Language (David Grove)** | Core question pattern for Belief Inquiry: "What kind of X?" / "Is there anything else about X?" | Used extensively in coaching / trauma therapy; designed to introduce zero facilitator assumptions |
| **ACT — Cognitive Defusion** | Framing move: belief as a mental event, not a truth | RCT + meta-analytic support across anxiety, depression, chronic pain |
| **MI (Motivational Interviewing)** — OARS micro-skills | Conversational grammar: open questions, complex reflections, summaries | Meta-analytic support; change talk predicts behavior change |
| **Coherence Therapy** — memory reconsolidation | The Integration tool's core move: juxtaposition of belief + contradicting memory | Linked to neural memory reconsolidation research |

**Important finding driving the redesign:** Memory reconsolidation research (Ecker et al.) indicates that affirmation-based replacement of beliefs (the current SOFTEN step) is less effective than *juxtaposition* — holding the old belief alongside a contradictory lived experience simultaneously. This is why the new design removes affirmation-style endings and introduces juxtaposition as a distinct step/tool.

## 3. Phasing

### Phase 1 — this spec

- Rewrite Belief Audit prompt → Belief Inquiry (Clean Language + Coherence close)
- Upgrade Nervous System Reset prompt with IFS-informed phrasing
- **Build new Integration tool** (Coherence Therapy juxtaposition as standalone)
- `/tools` landing page with context and recommended order
- Add cross-link card on the Psilocybin Integration Guide book page pointing to `/integration` (book-page framing only — the tool's own page makes zero psilocybin references)
- Rename route `/beliefaudit` → `/belief-inquiry` (301 redirect from old URL)
- Fix `AuditChat.tsx` missing `tool=` param
- Delete unused `/api/ollama` route + `ollama` npm dependency
- Vercel Web Analytics + custom events for the signal intelligence plan (§8)
- Optional 1-in-3 end-of-session emoji micro-signal for direct efficacy measurement
- **$9.99 "save this session" PDF** on all three tools, via Vercel Blob + Lemon Squeezy + Resend — fully stateless. Lemon Squeezy acts as Merchant of Record, handling all sales tax and VAT compliance on Maya's behalf.
- Adaptive fallback behavior (hypothesis offer after 2 stuck turns)
- Legal disclaimers on checkout and PDF

### Later — no timeline, no backend

These are product ideas that may ship when Maya is ready. They do not require backend infrastructure:

- **Interactive journaling PDF for Psilocybin Integration Guide readers** — a downloadable static PDF (form-fillable if desired) offered from the book page. Sold once or bundled with the book. No backend.
- **Music / guided meditation** — original audio content Maya is creating. Delivery method TBD; curated external links are the lowest-cost MVP if ever needed.

**Anything that would require a backend database, user accounts, or persistent message storage is permanently out of scope** (see §13).

## 4. The three tools

All three share the same safety boundaries (not therapy, 988 for crisis, professional referral for medical/therapeutic advice) and the same voice guidelines (direct, warm, non-guru, body-aware when relevant).

### 4.1 Nervous System Reset — IFS-informed upgrade

**Purpose:** Help the user return to a regulated state.

**What changes from current:** Same 4-step arc (Check In → Identify State → Regulate → Land). New phrasing treats the activated/shutdown state as *a part of you that's been doing a job* rather than a problem. IFS "Feel toward" move added before technique selection — if the user is hostile to their own state, that's addressed first.

**Stance rule (IFS):** If the user expresses judgment of their own state ("I shouldn't be feeling this"), gently surface that as another part, make space for it, and return to the body.

**Sample opener (unchanged spirit, IFS-informed phrasing):**
> "Let's start with your body. Take a breath — not a deep one, just a normal one — and notice what's here. Something in you is working hard right now. What does your body feel like?"

### 4.2 Belief Inquiry (renamed from Belief Audit) — Clean Language–led

**Purpose:** Help the user explore a belief with curiosity so its structure, cost, and contradictions become visible.

**Internal arc (user doesn't see labels):**

1. **Explore** — Clean Language loop on the user's own words. Two primary questions: *"What kind of [their word] is that [their word]?"* / *"Is there anything else about [their word]?"* Most of the conversation lives here. No AI-introduced frames, metaphors, or diagnoses.
2. **Understand** — MI complex reflections + one befriending question: *"What has this belief been doing for you? What is it protecting you from?"* The evaluative insight surfaces here — user-led discovery, not AI labeling. No diagnoses.
3. **Integrate (light close)** — Coherence-style juxtaposition prompt: *"Is there a moment, even a small one, when this belief wasn't fully true? Can you hold that memory and the belief at the same time? What do you notice?"* If user wants to go deeper on the integration, route them to the Integration tool.

**Removed from current design:** the "SOFTEN — find a truer alternative" step. Replaced by juxtaposition. No affirmation installation.

**Sample opener:**
> "Let's start somewhere real. What's a belief you carry about yourself — something that feels more inherited than chosen? Just tell me what it is, in your own words. I'll stay curious with you."

### 4.3 Integration / Reflection (new tool)

**Purpose:** Support the coherence-therapy juxtaposition move as its own focused session. Useful after a Belief Inquiry, after a therapy session, after any moment of insight the user wants to land.

**Psilocybin neutrality rule:** The `/integration` page copy, the tool's in-conversation prompts, and the system prompt itself make **zero explicit reference to psilocybin or psychedelics**. Users arriving from any context should feel the tool is for them. The psilocybin connection is made only on the Psilocybin Integration Guide book page, which adds a contextual cross-link pointing to `/integration`. This preserves the tool's broad market and avoids narrowing associations for users not open to psychedelic topics.

**Internal arc:**

1. **Name what shifted** — "What's the old belief or pattern you're working with? And what's the new experience or insight you've had?"
2. **Hold both** — "Can you recall a specific moment when the new experience was alive? Stay with that. Now, without pushing it away, can you also hold the old belief?"
3. **Notice the juxtaposition** — "What happens in you when both are present? What's different about how the old belief feels now?"
4. **Anchor** — "If you wanted to remember this, what would you write down about it? What image, word, or sentence captures this?"

**Voice rule:** The AI never tells the user the old belief "is wrong now." The integration emerges in the user, not from the AI. The AI's job is holding the frame and staying out of the content.

**Sample opener:**
> "Integration is where the real work lands. Tell me: what's a belief or pattern you've been looking at lately — and what's something new you've experienced or noticed that doesn't quite fit it?"

## 5. Adaptive fallback behavior

All three tools share this rule, written into each system prompt:

If the user responds with "I don't know" / one-word answers / a clear stuck point for **two consecutive turns**, the AI shifts mode: it offers one gentle hypothesis, clearly marked as a guess, not a verdict.

> "Here's something I'm wondering — and it might be totally off. Take it or leave it: [hypothesis based on what they've said]. Does any of that land, or is it somewhere else?"

This addresses the Braun et al. (2022) finding that pure Socratic/curious approaches fail some users with lower cognitive flexibility. The hypothesis is always:
- Framed as a wondering, not a conclusion
- Based strictly on words the user has already used
- Immediately followed by an invitation to correct

## 6. Landing / context page (`/tools`)

New page. Three cards, one per tool, each with:
- Tool name + one-line purpose
- Who it's for / when to use it
- Approx time (~10–15 min per session)
- "Start" button
- Small footer note: *"Not therapy. If you're in crisis, please reach out to a licensed professional."*

Suggested order card at the top: *"New here? Start with **Reset** if your body feels activated or foggy. Start with **Belief Inquiry** if you want to examine a belief. Come back to **Integration** after insight — it's where the new experience lands."*

Home page (`/`) gets a prominent link/section pointing to `/tools`. The Integration tool is also reachable from the Psilocybin Integration Guide book page (see §9) — the `/tools` landing itself does not reference that context.

## 7. Monetization: $9.99 save-this-session PDF

### User flow

1. User completes a session (any of the three tools).
2. At the end of the session, a card appears: *"Want to keep this session? Save a beautifully-formatted PDF for $9.99."*
3. User enters email, clicks to pay via Lemon Squeezy Checkout (embedded overlay or hosted page — implementation choice during planning).
4. On successful `order_created` webhook: PDF is generated, emailed via Resend, session blob is deleted.
5. Success page shows a direct download link (signed URL, expires after 24h).

### PDF contents (all three tools)

- Header: session date, tool name, Maya Allan brand mark
- "The belief/state/shift you explored" — user's own words, quoted
- Key reflections — 3–6 curated moments from the session (not the full transcript — a selected distillation)
- The integration / juxtaposition / regulation moment
- Journaling prompts — 2 open-ended prompts for continuing the work
- Blank space for handwritten notes
- Footer: disclaimer ("Educational reflection tool, not therapy"), link to Maya's book, copyright

### Technical flow — fully stateless, no backend to maintain

The `@vercel/blob` package (already in `package.json` as `^2.0.0`) is used as short-lived staging — a managed blob store, not a database Maya operates.

1. User clicks "Save this session" → client component collects message history + email.
2. Client POSTs `{ messages, email, tool }` to `/api/export`.
3. `/api/export` writes the payload to Vercel Blob under a unique key, with a 24-hour TTL expectation. Server holds no long-term reference.
4. `/api/export` creates a Lemon Squeezy checkout link via the LS API with the blob key stored in the checkout's `custom_data` field. Returns the hosted checkout URL to the client.
5. Client redirects to the Lemon Squeezy hosted checkout. User pays.
6. Lemon Squeezy `order_created` webhook hits `/api/export/webhook` with the `custom_data` (blob key), signed with the LS signing secret for verification.
7. Webhook fetches the blob, renders the PDF, sends via Resend to the user's email, then **deletes the blob immediately** (does not wait for TTL).
8. No content is retained anywhere after delivery. No database writes. No accounts.

If the user abandons checkout, the blob auto-expires via TTL. No cleanup job needed.

### Pricing rationale

$9.99 matches the price of the Psilocybin Integration Guide book — creates coherent value storytelling across Maya's products. Sits in the impulse-purchase range for digital goods.

## 8. Signals & efficacy indicators

The signal plan has three layers, each answering a specific question. Layered together they show not just *whether people come*, but *whether the tools actually help*.

**Privacy commitment:** No message content ever leaves the live session unless a PDF is purchased. All analytics events are structural — counts, timings, booleans. No text.

### Layer 1 — Did it reach them? (acquisition)

Tool: **Vercel Web Analytics** (free, no cookies, zero extra code — `<Analytics />` in `layout.tsx`).

- Page views by referrer (Instagram, podcasts, organic search, direct, specific domains)
- Top entry pages (home, a tool directly, a book page)
- Geography and device split
- Daily / weekly unique visitor trends

### Layer 2 — Did it hold them? (engagement)

Custom events fired from the tool clients:

- `tool_viewed` — user landed on `/belief-inquiry` / `/reset` / `/integration` (fires once per page load)
- `tool_started` — user sent their first message
- `turn_reached_3` / `turn_reached_6` / `turn_reached_10` — depth thresholds
- `session_completed` — AI reached the tool's final step (Land / Integrate / Anchor)
- `time_to_first_message` — milliseconds from page load to first send (proxy for whether the opener lands)

**Key ratios derived from these:**
- `tool_viewed` → `tool_started` (did the pitch land?)
- `tool_started` → `turn_reached_6` (did the content hold them?)
- `turn_reached_6` → `session_completed` (did they finish what they started?)

### Layer 3 — Did it matter? (efficacy proxies)

These are the strongest indicators without intruding on the session itself:

- `export_cta_viewed` — end-of-session offer was shown (fires when session completed)
- `export_cta_clicked` — user opened checkout
- `export_purchased` — Lemon Squeezy `order_created` webhook succeeded
- **PDF purchase rate per completed session** — primary efficacy proxy. People don't pay for sessions that didn't land.
- **30-day return rate** — does the same anonymous visitor (tracked via Vercel Analytics' privacy-safe hashed visitor ID) return within 30 days to any tool?
- **Cross-tool flow** — completed-Inquiry visitors who subsequently do Integration (strong signal that insight is continuing to work in them)

### Direct efficacy micro-signal (1-in-3 sampling)

At session end, on every third completed session, show:

> **"How did this session feel?"**  [✨ Grounded] [🤔 Uncertain] [✋ Not for me] [skip]

Fires a single event: `session_feedback` with one of four values. No free text. No email. Entirely optional. Skip button always visible. This is the **only direct efficacy measurement** in the system. Everything else is a proxy.

### The single most valuable view — referrer × purchase rate

Cross-reference Vercel Analytics referrer data with `export_purchased` events to see which acquisition source produces the highest PDF purchase rate. This one view tells Maya where her real audience lives without surveys, without guessing, and without retaining any message content.

### Review cadence

- **Week 1:** confirm all events fire correctly in production (a success criterion in §11)
- **Week 4:** first data-informed review — engagement funnel shape, emerging referrer patterns, first purchase-rate signal
- **Week 12 / 90 days:** decision point on any of the "Later" items in §3 based on observed demand

## 9. Technical changes

### Files changing

- `src/app/api/chat/route.ts` — update both existing system prompts, add `integration` prompt, add adaptive-fallback instructions to all three
- `src/components/AuditChat.tsx` — rename to `InquiryChat.tsx`, fix missing `tool=` param, update brand copy, add end-of-session export CTA, add 1-in-3 emoji prompt
- `src/components/ResetChat.tsx` — update brand copy, add end-of-session export CTA, add 1-in-3 emoji prompt
- `src/components/IntegrationChat.tsx` — new component (same shape as InquiryChat / ResetChat)
- `src/app/belief-inquiry/page.tsx` — new file; contains the former contents of `beliefaudit/page.tsx` with updated copy
- `src/app/beliefaudit/page.tsx` — deleted; 301 redirect from `/beliefaudit` → `/belief-inquiry` added via `next.config.mjs` `redirects()` array
- `src/app/integration/page.tsx` — new, generic copy, zero psilocybin references
- `src/app/tools/page.tsx` — new landing page (three cards, recommended order)
- `src/app/books/psilocybin-integration-guide/page.tsx` — edit: add a cross-link card near the bottom of the book page pointing to `/integration`, with book-specific framing ("After your journey, our Integration tool…")
- `src/app/layout.tsx` — add `<Analytics />`, wire up analytics helper
- `src/app/api/export/route.ts` — new; writes session blob to Vercel Blob, creates Lemon Squeezy checkout link via LS API, returns checkout URL to client
- `src/app/api/export/webhook/route.ts` — new; Lemon Squeezy webhook handler; verifies LS signature, fetches blob, renders PDF, sends via Resend, deletes blob
- `src/app/api/ollama/route.ts` — **delete**
- `package.json` — remove `ollama` dependency; add PDF generation library (choice deferred to planning); add `@lemonsqueezy/lemonsqueezy.js` (official LS SDK)
- **Environment variables** (to be added to Vercel Project Settings → Environment Variables, all three environments):
  - `LEMONSQUEEZY_API_KEY` — API key generated in LS Settings → API
  - `LEMONSQUEEZY_STORE_ID` — the store's numeric ID from the LS dashboard
  - `LEMONSQUEEZY_WEBHOOK_SECRET` — webhook signing secret generated when creating the webhook in LS Settings → Webhooks
  - `LEMONSQUEEZY_PRODUCT_ID` — ID of the single "Save Your Session (PDF)" product created in LS Products
- `src/app/sitemap.ts` — update `/beliefaudit` → `/belief-inquiry`, add `/integration`, add `/tools`
- `src/components/header.tsx` — update nav links
- `src/lib/analytics.ts` — new; thin wrapper for custom event tracking (`trackEvent(name, props)`)
- `src/lib/session-export.ts` — new; client helpers for posting to `/api/export`

### Cleanup in scope

- Delete `/api/ollama/route.ts` and remove `ollama` from `package.json` (unused, dead code)
- Fix `AuditChat.tsx` missing `tool=` param (currently works by server-side default)

### Cleanup out of scope

- No refactor of admin routes, Supabase schema, or unrelated components

## 10. Legal + safety requirements

- Checkout page must display: *"This is an educational reflection tool, not therapy, counseling, or medical advice. Purchase is for the digital PDF only. All sales final due to the digital nature of the product unless technical issue."*
- PDF footer must display: *"This document is a record of a reflective conversation. It is not medical, psychological, or therapeutic advice. If you are in crisis, contact the 988 Suicide & Crisis Lifeline."*
- Existing 988 / professional-referral safety behavior stays in all three prompts
- The Psilocybin Integration Guide book-page cross-link must use non-promotional language (the tool is a reflection aid, not a substance-use facilitator); the linked Integration tool page itself contains no psychedelic references
- Terms of Service page updates to reference the new tools and the PDF product, plus a clause noting that Lemon Squeezy, Inc. is the Merchant of Record for all PDF transactions and is responsible for sales tax and VAT compliance in all jurisdictions
- Privacy policy updates to note: no message content is persisted; on purchase, content is staged to Vercel Blob only until the PDF is delivered, then deleted; email address is shared with Lemon Squeezy for purchase receipt and with Resend for PDF delivery
- LS buyer receipt language is handled by Lemon Squeezy's own platform copy — Maya's site does not need to produce a receipt

## 11. Success criteria

Phase 1 ships successfully when:

1. All three tools deploy to production and pass a self-test of ≥3 full conversations each
2. `/beliefaudit` 301-redirects to `/belief-inquiry` and no broken links remain in the site
3. `/tools` page is live and linked from the home page
4. The Psilocybin Integration Guide book page contains the cross-link card to `/integration`, and the Integration tool page contains zero psilocybin references
5. Vercel Web Analytics is receiving page views, and all custom events in §8 (including `session_feedback`) are firing correctly in a test session
6. End-to-end Lemon Squeezy test-mode purchase generates a real PDF and emails it via Resend; the Vercel Blob entry is deleted after delivery
7. Ollama route and dependency are fully removed from the bundle
8. No TypeScript errors, no new lint failures
9. Legal disclaimers live on checkout, in the PDF footer, and on the book-page cross-link card

## 12. Open questions (to resolve during planning)

1. **PDF generation library** — `@react-pdf/renderer` (React-based, nice branding) vs. `pdfkit` (lower-level, smaller bundle) vs. a serverless-friendly HTML-to-PDF service. Must be serverless-compatible (runs inside a Vercel Function) and reasonably small in bundle. Decide during planning.
2. **Vercel Blob TTL and retention** — suggested: rely on Vercel Blob's natural lifecycle and delete immediately on delivery. Confirm whether explicit TTL configuration is required in the client library.
3. **Lemon Squeezy webhook reliability** — the `order_created` webhook is the source of truth. Client-side polling on the success page is used only for UX feedback ("your PDF is on its way"). Webhook signature verification is mandatory (prevents spoofed orders triggering PDF generation). Confirm `LEMONSQUEEZY_WEBHOOK_SECRET` configuration in planning.
4. **Integration tool discoverability from Belief Inquiry** — should the Inquiry tool end with a soft link to Integration? Probably yes, but phrasing needs care (don't make it feel like upsell).
5. **Refund policy specifics** — "all sales final" vs. a 7-day goodwill refund for genuine issues. Business decision for Maya.
6. **Emoji signal presentation** — inline in the chat transcript vs. a modal after the final AI message. Inline is lighter-touch; modal has higher response rates.

## 13. Permanent product principles (not just Phase 1 non-goals)

The following are excluded at the product-architecture level, not temporarily deferred. Adding any of these would require explicit reversal of a stated principle:

- **No user accounts** — the site does not offer sign-up / sign-in for site visitors. (Admin auth for Maya's own CMS is a separate, pre-existing system unaffected by this spec.)
- **No backend database for user content** — no conversation storage, no user profile storage, no session history
- **No persistent message storage** — messages live in the browser during the session, stage briefly in Vercel Blob only if a PDF purchase is in flight, and are deleted after delivery
- **No longitudinal progress dashboards or reports** — they would require backend persistence
- **No subscription tier** — revenue is per-transaction only
- **No free-text user feedback capture** — the only feedback signal is the 4-option emoji prompt
- **No retention of analytics data containing message content** — analytics events are structural only

If Maya ever wants to reverse one of these principles, it will require a new spec that explicitly addresses the privacy, operational, and legal implications of adding persistence.

### Phase 1 non-goals (things deliberately not in this spec)

- No client-side "guided journey" mode chaining the three tools (could be added later; pure routing work, no backend)
- No admin analytics dashboard beyond what Vercel provides out-of-the-box
- No mobile app
- No interactive journaling PDF (lives in "Later, no timeline" per §3)
- No music / guided meditation (lives in "Later, no timeline" per §3)

---

**Next step:** after user review and approval of this spec, invoke the `superpowers:writing-plans` skill to produce a step-by-step implementation plan.
