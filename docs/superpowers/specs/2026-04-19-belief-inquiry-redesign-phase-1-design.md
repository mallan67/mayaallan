# Belief Inquiry Redesign — Phase 1 Design

**Date:** 2026-04-19
**Status:** Draft — awaiting user review
**Author:** Maya Allan (with AI pairing)

---

## 1. Summary

The existing Belief Audit tool is framed as a forensic evaluation ("find the bad belief, fix it"). Research on what actually shifts limiting beliefs — ACT, IFS, Motivational Interviewing, Clean Language, Coherence Therapy — points to a different stance: **curious exploration**, with evaluation happening *inside* curiosity rather than against it.

Phase 1 reshapes the existing two tools and adds a third, and introduces the first monetization path: a $9.99 "Keepsake" PDF export per session.

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

## 3. Scope: phases

### Phase 1 — this spec (ships in days, no new infrastructure)

- Rewrite Belief Audit prompt → Belief Inquiry (Clean Language + Coherence close)
- Upgrade Nervous System Reset prompt with IFS-informed phrasing
- **Build new Integration tool** (Coherence Therapy juxtaposition as standalone)
- Add `/tools` landing page with context and recommended order
- Rename route `/beliefaudit` → `/belief-inquiry` (301 redirect from old URL)
- Fix `AuditChat.tsx` missing `tool=` param
- Delete unused `/api/ollama` route + `ollama` npm dependency
- Add Vercel Web Analytics + custom events (`tool_started`, `turn_count`, `session_completed`, `export_purchased`)
- **$9.99 Keepsake PDF export** per session with Stripe checkout + Resend email delivery
- Legal disclaimers on checkout and PDF
- Adaptive fallback behavior (hypothesis offer after 2 stuck turns)

### Phase 2 — deferred (ships in weeks, requires infrastructure)

- Supabase session summaries (anonymous, consented, content-minimal)
- Guided-journey mode chaining Reset → Inquiry → Integration
- Magic-link account creation for returning users

### Phase 3 — deferred (ships after data)

- Longitudinal progress report across multiple sessions ($19–29)
- Report generation via second LLM call over stored summaries

**Explicit non-goals for Phase 1:** no accounts, no persistent message storage, no user dashboard, no history view, no subscription. Revenue path is transactional only (one checkout per PDF).

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

Home page (`/`) gets a prominent link/section pointing to `/tools`.

## 7. Monetization: $9.99 Keepsake PDF

### Flow

1. User completes a session (any of the three tools).
2. At the end of the session, a card appears: *"Want to keep this session? Download a beautifully-formatted PDF keepsake for $9.99."*
3. User enters email, clicks to pay via Stripe Checkout.
4. On successful payment webhook:
   - Generate PDF from in-memory session content
   - Email PDF via Resend
   - Delete in-memory session content
5. User also sees a success page with a direct download link (signed URL, expires after 24h).

### PDF contents (all three tools)

- Header: session date, tool name, Maya Allan brand mark
- "The belief/state/shift you explored" — user's own words, quoted
- Key reflections — 3–6 curated moments from the session (not the full transcript — a selected distillation)
- The integration / juxtaposition / regulation moment
- Journaling prompts — 2 open-ended prompts for continuing the work
- Blank space for handwritten notes
- Footer: disclaimer ("Educational reflection tool, not therapy"), link to Maya's book, copyright

### Technical flow

- Session content stays in the browser (`useChat` message state) — server doesn't persist messages
- Purchase submits the message history + chosen email to a new endpoint (`/api/export`)
- Endpoint verifies Stripe payment, generates PDF server-side (library: `@react-pdf/renderer` or similar — choose during planning), emails via Resend
- In-memory session storage keyed by a short-lived session token (e.g. 1h TTL) so the purchase can complete even if the user closes and reopens the tab within the window

### Pricing rationale

$9.99 matches the book price — creates a coherent value story across Maya's products. Sits in the impulse-purchase range for digital goods. Tested price point for wellness-space digital downloads.

## 8. Analytics plan

**Tool:** Vercel Web Analytics (free tier, no cookies, privacy-safe) — `<Analytics />` in `layout.tsx`.

**Custom events** (no message content ever logged):
- `tool_started` — properties: `tool` (reset / belief_inquiry / integration)
- `turn_count_reached` — properties: `tool`, `count` (fires at 3, 6, 10)
- `session_completed` — properties: `tool`, `total_turns`, `reached_final_step` (bool)
- `export_viewed` — properties: `tool` (PDF CTA was seen)
- `export_purchased` — properties: `tool`, `amount_usd`

This tells Maya: which tool is used most, where people drop off, and which tool has the highest conversion-to-purchase rate.

**Privacy commitment:** message content is never sent to analytics. Only structural events.

## 9. Technical changes

### Files changing

- `src/app/api/chat/route.ts` — update both existing system prompts, add `integration` prompt
- `src/components/AuditChat.tsx` — rename to `InquiryChat.tsx`, fix missing `tool=` param, update brand copy
- `src/components/ResetChat.tsx` — update brand copy only (tool logic unchanged)
- `src/components/IntegrationChat.tsx` — new component (mirror of InquiryChat)
- `src/app/belief-inquiry/page.tsx` — new file, contains the former contents of `beliefaudit/page.tsx` (renamed component, updated copy)
- `src/app/beliefaudit/page.tsx` — deleted; 301 redirect from `/beliefaudit` → `/belief-inquiry` added via `next.config.mjs` `redirects()` array (framework-level, not a page-level redirect)
- `src/app/integration/page.tsx` — new
- `src/app/tools/page.tsx` — new landing page
- `src/app/layout.tsx` — add `<Analytics />`, add analytics helper hook/util
- `src/app/api/export/route.ts` — new, handles Stripe session creation + PDF generation + email delivery
- `src/app/api/export/webhook/route.ts` — new, Stripe webhook handler
- `src/app/api/ollama/route.ts` — **delete**
- `package.json` — remove `ollama` dependency, add PDF generation library
- `src/app/sitemap.ts` — update to reference `/belief-inquiry` not `/beliefaudit`
- `src/components/header.tsx` — update nav links
- `src/lib/analytics.ts` — new, thin wrapper for custom event tracking

### Cleanup in scope

- Delete `/api/ollama/route.ts` and remove `ollama` from `package.json` (unused, dead code)
- Fix `AuditChat.tsx` missing `tool=` param (currently works by server-side default)

### Cleanup out of scope

- No refactor of admin routes, Supabase schema, or unrelated components

## 10. Legal + safety requirements

- Checkout page must display: *"This is an educational reflection tool, not therapy, counseling, or medical advice. Purchase is for the digital PDF only. All sales final due to the digital nature of the product unless technical issue."*
- PDF footer must display: *"This document is a record of a reflective conversation. It is not medical, psychological, or therapeutic advice. If you are in crisis, contact the 988 Suicide & Crisis Lifeline."*
- Existing 988 / professional-referral safety behavior stays in all three prompts
- Terms of Service page updates to reference the new tools and the PDF product
- Privacy policy updates to note: no message content is persisted beyond the live session unless a PDF is purchased, in which case it is retained only long enough to deliver the email.

## 11. Success criteria

Phase 1 ships successfully when:

1. All three tools deploy to production and pass a self-test of ≥3 full conversations each
2. `/beliefaudit` 301-redirects to `/belief-inquiry` and no broken links remain in the site
3. `/tools` page is live and linked from the home page
4. Vercel Web Analytics is receiving page views and the four custom events are firing correctly in a test session
5. End-to-end Stripe test purchase generates a real PDF and emails it via Resend
6. Ollama route and dependency are fully removed from the bundle
7. No TypeScript errors, no new lint failures
8. Legal disclaimers live on checkout and in the PDF footer

## 12. Open questions (to resolve during planning)

1. **PDF generation library** — `@react-pdf/renderer` (React-based, nice for branding) vs. `pdfkit` (lower-level, smaller bundle) vs. a serverless-friendly HTML-to-PDF service (Browserless / Puppeteer on Vercel Functions). To decide during planning based on bundle size and branding needs.
2. **In-memory session TTL** — 1 hour suggested; could be 15 min or 24 h. Trade-off: longer TTL = more friction-free purchase flow, but more server memory and less privacy.
3. **Stripe webhook vs. client-side confirmation** — webhook is more reliable but adds complexity. Plan to use webhook as the source of truth, with client-side polling for UX.
4. **Integration tool discoverability** — should the Inquiry tool end with a soft link to Integration? Probably yes, but phrasing needs care (don't make it feel like upsell).
5. **Refund policy specifics** — "all sales final" vs. a 7-day goodwill refund for genuine issues. Business decision for Maya.

## 13. Explicit non-goals for Phase 1

- No user accounts
- No persistent conversation storage beyond the brief purchase window
- No progress dashboard
- No session history viewable by the user later
- No journey/sequence mode (Phase 2)
- No longitudinal report (Phase 3)
- No subscription tier
- No mobile app
- No admin analytics dashboard beyond what Vercel provides

---

**Next step:** after user review and approval of this spec, invoke the `superpowers:writing-plans` skill to produce a step-by-step implementation plan.
