# Tomorrow — Pick up here

**Last session:** 2026-05-11 (evening)
**State:** Almost everything is wired and shipped. You're 2-3 small steps from done.

---

## What got done today (deployed and live)

| Area | Status |
|---|---|
| AI chat (Vercel AI Gateway) | ✅ Working — `AI_GATEWAY_API_KEY` in Vercel env vars |
| PayPal env var fix | ✅ Code accepts both `PAYPAL_SECRET` and `PAYPAL_CLIENT_SECRET` |
| Stripe code | ✅ Removed entirely (admin DB column left, harmless) |
| Belief Inquiry prompt | ✅ Full methodology rewrite — source/agency/shift trajectory, IFS parts, polyvagal regulation, predictive processing, anchoring, no parroting, no fabrication |
| Nervous System Reset prompt | ✅ Overhauled — IFS + polyvagal + SE + co-regulation |
| Integration Reflections prompt | ✅ Overhauled — Coherence Therapy + AEDP + memory reconsolidation |
| Export CTA — turn-count gate | ✅ Replaced with `[SESSION_COMPLETE]` marker emitted by the AI when the arc closes naturally |
| Export CTA — persistent footer link | ✅ "Print this session — $9.99" always available in footer |
| Export CTA — copy | ✅ "Email me the PDF — $9.99" (not vague "Save") |
| Promo code system | ✅ Built — just needs the env var |
| Better PayPal error logging | ✅ Structured fields, log before throw |

---

## ⏳ What you still need to do (~10 minutes total)

### 1. Add `PROMO_CODES` env var in Vercel (~1 min)

This is what enables the promo code feature you wanted for book descriptions.

- https://vercel.com/maya/mayaallan → **Environment Variables** → **Add New**
- Key: `PROMO_CODES`
- Value: `MAYA10,BOOKREADER,WORKSHOP` *(any codes you want, comma-separated)*
- Environments: all three (Production + Preview + Development)
- Save

Then redeploy (Deployments → top → `...` → Redeploy) so it loads.

### 2. Check Resend DNS verification status (~30 sec)

- https://resend.com → Domains
- Look at `mayaallan.com` — has it gone green / "Verified"?
- If yes: emails are ready to flow. Both PayPal-paid PDFs and promo-redeemed PDFs will arrive in customer inboxes.
- If still pending: wait. Up to 4 hours was the estimate; could be less.

### 3. Restore AI Gateway billing (token issue you hit)

The chat went silent because Vercel AI Gateway hit a free-tier ceiling. To prevent that happening to real users:

- https://vercel.com/maya/~/ai → **Billing** (or Plan)
- Add a payment method
- Set a soft cap if you want (e.g. $25/month) so it can't run away

Without this, the chat will go dark again when the next free quota window resets.

### 4. End-to-end test (~3 min, once 1+2+3 are done)

In an incognito tab:

1. Open https://www.mayaallan.com/belief-inquiry
2. Run a real session — try a real belief, let the bot trace source and invite a shift. It should *not* parrot, *not* fabricate, *not* loop the "what kind of X" formula.
3. When the inline CTA appears at the close, enter your email
4. Click "Have a promo code?" → enter one of your `PROMO_CODES` → click "Email me the PDF"
5. Expected: green confirmation card, PDF arrives in your inbox within 1-2 min
6. Repeat the test WITHOUT a promo code → should redirect to `sandbox.paypal.com` for paid checkout

---

## How the methodology actually works now (for marketing copy / about pages)

Each tool is grounded in a distinct change mechanism backed by current neuroscience:

**Belief Inquiry** — *source → agency → shift*. Helps the user trace an inherited belief to its origin (childhood / culture / formative event), recognize it was *installed not chosen*, and hold it alongside a contradicting present-day experience. Draws on **Clean Language** (Grove), **Motivational Interviewing** (Miller & Rollnick — strongest RCT base of any counseling method), **Coherence Therapy** (Ecker — memory reconsolidation), **Internal Family Systems** (Schwartz — SAMHSA evidence-based), **Polyvagal Theory** (Porges), and **Predictive Processing** (Friston, Lisa Feldman Barrett).

**Nervous System Reset** — *recognize → befriend → regulate → land*. Meets the user in body-first state, names the activation/shutdown as a protective part doing a job, checks the user's stance toward it (IFS unblending if hostile), then guides one matched regulation technique. Draws on **IFS**, **Polyvagal Theory** (Dana 2018 — clinical translation), **Somatic Experiencing** (Levine), and **Self-Compassion** (Gilbert CFT; Neff) as enabling regulator.

**Integration Reflections** — *name both → make vivid → hold simultaneously → notice → anchor*. Consolidates a shift the user has already had elsewhere by holding the old pattern and the new experience together in the felt sense until memory reconsolidation occurs. Draws on **Coherence Therapy** (Ecker), the **Lane et al. 2015** synthesis showing reconsolidation is the common mechanism across effective therapies, **AEDP** (Fosha — transformance and meta-processing), and **Implementation Intentions** (Gollwitzer) for the closing anchor.

**Honest framing**: the synthesis is methodology-faithful but not itself RCT-validated as an AI intervention. Say "draws on" / "informed by," not "clinically proven."

---

## If you want to keep iterating after the basics work

Things that aren't urgent but would polish the product:

- **Marketing page about the methodology** — the bullets above could become an `/about/methodology` page. Real differentiator vs. generic self-help chatbots.
- **Admin UI for promo codes** — instead of editing the env var, a small admin page to add/remove codes with usage counts. Would need a DB column.
- **Single-use codes / expiry dates** — needs DB. Reusable codes are fine for now.
- **Email open / click tracking** — confirm PDFs are actually being opened. Resend exposes this; small frontend visualization.
- **Per-tool promo codes** — code that only works for Integration vs. all three. Small env var refactor.
- **Cleanup of Stripe DB column** — admin form still has a stripe_payment_link field that does nothing. DB migration to drop the column.

---

## Files you might touch

| File | Purpose |
|---|---|
| `src/app/api/chat/route.ts` | All three system prompts (Belief Inquiry, Reset, Integration) |
| `src/lib/paypal.ts` | PayPal Orders v2 + webhook verification |
| `src/lib/deliver-pdf.ts` | Shared PDF render + email helper (used by both paid and promo paths) |
| `src/app/api/export/route.ts` | Export endpoint — handles both paid and promo flows |
| `src/app/api/export/webhook/route.ts` | PayPal webhook → triggers PDF delivery |
| `src/components/ExportCta.tsx` | The export card UI |
| `src/components/InquiryChat.tsx` `ResetChat.tsx` `IntegrationChat.tsx` | Three chat components — share session-complete marker logic |

---

## Recent commits (most recent first)

Run `git log --oneline -15` to see them. The big ones from today:

- `11879e9` — Overhaul Reset and Integration prompts to match Belief Inquiry depth
- `339b7a3` — Add promo-code redemption — free PDF for codes in PROMO_CODES env var
- `43a0f35` — PayPal: accept PAYPAL_SECRET as fallback for PAYPAL_CLIENT_SECRET
- `bd72747` — Improve PayPal error logging — structured fields
- `d799568` — Belief Inquiry: anger is a doorway, anchor realizations, stop regressing
- `821295c` — Belief Inquiry: integrate post-2012 frameworks (predictive processing, IFS, polyvagal, self-compassion, memory reconsolidation)
- `9f5d72b` — Reframe Belief Inquiry around source → agency → shift
- `dd9c61f` — Stop the chatbot fabricating content + jumping to metaphor
- `4c5e31d` — Rewrite Belief Inquiry prompt around full Clean Language + MI methodology
- `b8d24dd` — Delay export CTA to 7 turns, fix awkward Clean Language doubling
- `1db416f` — Gate export CTA on AI session-complete signal + persistent print link
- `1f9413b` — Reword export CTA: print/email framing
- `32b2842` — Remove Stripe — unused
- `fd2dec9` — Sync pnpm-lock.yaml
- `06e72ab` — Harden export checkout: server-derived origin

---

## When you start a fresh Claude session tomorrow

Paste this:

> "Resuming mayaallan work — read TOMORROW.md and tell me where I left off. I'm about to [add PROMO_CODES env var / test the end-to-end flow / something else]."

Good rest. The bot is shipping real work now. 🌿
