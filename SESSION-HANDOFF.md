# Session Handoff — Belief Inquiry redesign + content system

**Last session date:** 2026-04-27 (PayPal pivot)
**Branch:** `belief-inquiry-phase-1`
**Remote:** pushed to GitHub at `origin/belief-inquiry-phase-1`
**Main branch / live site:** untouched (still on previous `main` state)

> **2026-04-27 update:** Lemon Squeezy did not approve the account. Pivoted the
> $9.99 PDF flow to PayPal (Business). Code, tests, and docs below are updated.

---

## What was built

### 1. Three AI reflection tools redesigned (all on the branch, not yet merged to main)

| Tool | URL | Basis |
|---|---|---|
| `/reset` | Nervous System Reset | IFS-informed somatic regulation, 5-step arc |
| `/belief-inquiry` (renamed from `/beliefaudit`, with 301 redirect) | Belief Inquiry | Clean Language (Grove) + Coherence Therapy close |
| `/integration` (new) | Integration | Coherence Therapy juxtaposition, psilocybin-neutral |

Each prompt has few-shot DO/DO-NOT examples to prevent AI drift. All routed through Vercel AI Gateway with `MODEL = "google/gemini-2.5-flash"` — swap providers with a one-line change.

### 2. Supporting pages

- `/tools` — three-card landing page
- `/methods` — attributions to IFS, Clean Language, Coherence Therapy, Motivational Interviewing (legal posture)
- `/blog` + `/blog/[slug]` — markdown-driven blog reading from `content/posts/`
- `/export/success` — post-purchase landing page
- Psilocybin Integration Guide book page now has a cross-link card to `/integration` (conditional on slug only)

### 3. $9.99 PDF monetization (code written, not yet live — PayPal as of 2026-04-27)

- Vercel Blob staging → PayPal Orders v2 checkout → webhook → PDF via `@react-pdf/renderer` → Resend email → blob deleted
- Stateless; no backend database
- Components: `ExportCta`, `SessionFeedback` (1-in-3 emoji), success page
- **Pending from Maya:** PayPal product/webhook setup + env vars: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_ENV` (`sandbox` or `live`), `RESEND_API_KEY`
- **Note on tax:** PayPal is a payment processor, not a Merchant of Record. Sales tax / VAT obligations are now Maya's responsibility (low risk at single-product low-volume scale; revisit if revenue grows or EU sales spike)

### 4. Analytics (live on branch)

- Vercel Web Analytics installed in `layout.tsx`
- Custom events: `tool_viewed`, `tool_started`, `turn_reached_3/6/10`, `session_completed`, `time_to_first_message`, `export_cta_viewed`, `export_cta_clicked`, `export_purchased`, `session_feedback`
- Helper: `src/lib/analytics.ts`

### 5. Quality / eval

- `pnpm eval:prompts` — 5-scenario regression test for prompt adherence
- HMAC webhook signature tests in `tests/lib/`

### 6. Content bank (5 Substack-ready posts + metadata)

All in `content/`:

- `posts/01-audit-is-the-wrong-word.md` — seeds Belief Inquiry
- `posts/02-psilocybin-integration-research.md` — seeds Integration
- `posts/03-curiosity-over-judgment-ifs.md` — seeds Reset
- `posts/04-inherited-beliefs-grandmother-marriage.md` — emotional hook, wider audience
- `posts/05-affirmations-vs-integration.md` — direct current self-help trend
- `DISTRIBUTION-GUIDE.md` — one-time setup (Substack, Amazon Author Central, Goodreads, BookBub, Open Library, LibraryThing) + 15-min-per-post workflow + Medium cross-post instructions
- `BOOK-METADATA.md` — source of truth for all retailer/catalog platforms
- `BOOK-EXCERPTS.md` — 7 pull quotes + back-cover copy + samples + 60-sec reel script

### 7. Medium cross-posting (wired, ready to use)

- `src/lib/medium.ts` — typed API helper
- `scripts/publish-to-medium.mjs` — CLI
- `pnpm publish:medium <slug>` — cross-posts a post to Medium as draft with canonical URL pointing back to mayaallan.com
- **Pending from Maya:** Medium account + `MEDIUM_INTEGRATION_TOKEN` env var

### 8. Book editorial review

- `docs/book-review/psilocybin-integration-guide-review.md`
- Reviewed the hardcover docx
- Confirmed issues: Chapter 3 title inconsistency, Appendix B title inconsistency, em dash/hyphen inconsistency, author bio missing colon, "For Example" capitalization, doubled phrase in risks section, subject-verb in Appendix D, "Maya" used as example name
- Content accuracy flags on Appendix B legal claims (Colorado, Brazil, Czech)
- Praised: Inner Child chapter (Chapter 8), the 40-scenario structure, citation quality
- Priority action list: ~45 min of Maya's time + proofreader

---

## What Maya has to do (in roughly this order, whenever ready)

### Already done by Maya
- [x] Added `AI_GATEWAY_API_KEY` to Vercel env vars
- [x] Lemon Squeezy did not approve — pivoted to PayPal (account opened, ready)

### To do next
- [ ] Verify which ISBN (`-5-3` or `-3-9`) is the correct print vs. ebook identifier
- [ ] Complete Open Library book record (field-by-field help is in `content/BOOK-METADATA.md`)
- [ ] Set up Amazon Author Central, Goodreads, BookBub, LibraryThing (all guided in `content/DISTRIBUTION-GUIDE.md`)
- [ ] Create Substack account, set up as described in DISTRIBUTION-GUIDE (10 min)
- [ ] Act on book editorial review items (~45 min) — then send to a proofreader

### Wire up PayPal
- [ ] Create PayPal app in the **sandbox** developer dashboard → grab Client ID + Secret
- [ ] In sandbox, create a webhook pointing to `https://<vercel-preview-url>/api/export/webhook` subscribed to event `PAYMENT.CAPTURE.COMPLETED` → grab the Webhook ID
- [ ] Add env vars to Vercel (Preview env first): `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_ENV=sandbox`, `RESEND_API_KEY`
- [ ] End-to-end test on preview using a sandbox personal-account buyer login from PayPal dev dashboard
- [ ] Repeat the app + webhook creation in **live** mode → grab live credentials
- [ ] Add live env vars to Vercel Production env (same keys, with `PAYPAL_ENV=live`)
- [ ] Merge branch to main when satisfied

---

## Where to find things

| Thing | Path |
|---|---|
| Implementation plan | `docs/superpowers/plans/2026-04-19-belief-inquiry-redesign-phase-1.md` |
| Design spec | `docs/superpowers/specs/2026-04-19-belief-inquiry-redesign-phase-1-design.md` |
| Book editorial review | `docs/book-review/psilocybin-integration-guide-review.md` |
| Content (posts + guides) | `content/` |
| AI prompts | `src/app/api/chat/route.ts` |
| PDF flow code | `src/app/api/export/` + `src/lib/pdf/template.tsx` + `src/lib/paypal.ts` |
| Medium integration | `src/lib/medium.ts` + `scripts/publish-to-medium.mjs` |
| Analytics helpers | `src/lib/analytics.ts` |

---

## How to resume tomorrow (session restart)

When you open a new session with Claude, paste this:

> *"Resuming work from `SESSION-HANDOFF.md` on branch `belief-inquiry-phase-1`. Read that file for context, then tell me what's top-of-mind. My immediate next step is [LS approval status / Open Library setup / something else]."*

Claude will read the handoff doc, get up to speed in seconds, and you can go directly to the next thing.

If you want to test the tools in a Vercel preview deployment, the branch is already pushed — the preview URL was emailed to you by Vercel after the first push on 2026-04-19.

---

## Known non-blocking status

- `next-env.d.ts` shows as modified in working tree — Next.js auto-generates this; safe to ignore or discard with `git checkout next-env.d.ts`
- `generate_voiceover.py` is an untracked file on your Desktop workflow, predating this session — safe to ignore

---

*Session complete. Branch pushed. Nothing lost. Tomorrow, pick up where you left off.*
