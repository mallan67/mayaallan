# PayPal Setup — Pick up here after restart

**Saved:** 2026-04-27
**Branch:** `main`
**Last commit:** `a0cd035` "Switch $9.99 PDF checkout from Lemon Squeezy to PayPal"
**Pushed to GitHub?** No — still local only

---

## Where you left off

Lemon Squeezy did not approve your account. We pivoted the $9.99 PDF
checkout flow to PayPal Business. The code, tests, and docs are all
updated and committed locally. You still need to:

1. Create the PayPal sandbox app + webhook (gets you credentials)
2. Add env vars to Vercel
3. Test on a Vercel preview
4. Repeat in PayPal live mode for production
5. Push the commit to GitHub when you're satisfied

Nothing in this list requires me to be in the loop. You can do it solo,
or come back here and I'll walk through it with you step by step.

---

## NY sales tax — short answer

**You do NOT need to collect NY/NYC sales tax on the $9.99 PDF.**
Don't change the checkout. The current flat $9.99 is correct.

Two reasons:
- Digital goods that aren't prewritten software aren't taxable in NY
- Even if classified as an "information service," personal/individual
  data is exempt — your PDFs are 1:1 transcripts of one person's session

**What you DO owe:** federal + NY State income tax on the revenue.
Handled at year-end on your income tax return, not at checkout.

**Cheap defensive move:** book a 30-min consult with a NY-licensed CPA
who handles small online businesses. Ask: "I'm a NYC sole-prop selling
a custom-generated PDF for $9.99. Do I need a Certificate of Authority?"
Get a written opinion in your records. Typically $150–$250.

Watch for two things that would change the picture:
- NY changes the law (proposed many times since 2010, never passed as of 2026)
- Out-of-state sales spike — most other states tax digital goods. Each
  has its own threshold (typically $100K or 200 transactions per state).
  Below that, no obligation.

**Sources** (in case you want to show your CPA):
- https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/quick_reference_guide_for_taxable_and_exempt_property_and_services.htm
- https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/do_i_need_to_register_for_sales_tax.htm
- https://www.tax.ny.gov/bus/st/register.htm
- https://www.salestaxhandbook.com/new-york/sales-tax-taxability/software-and-digital-products

---

## PayPal sandbox setup (do this first)

### 1. Create the sandbox app

1. Go to https://developer.paypal.com and sign in with your PayPal Business account
2. Top-right: make sure **Sandbox** is selected (not Live)
3. Click **Apps & Credentials**
4. Click **Create App**
   - App Name: `Maya Allan Site (sandbox)`
   - Type: Merchant
5. Save. You will land on a page showing the **Client ID** and **Secret**
   - Copy both somewhere safe (a password manager, not a chat or text file)

### 2. Create the sandbox webhook

⚠️ You need a Vercel preview URL before this step. If you haven't pushed
the commit yet, push first (see "Push the commit" below) so Vercel
generates a preview URL for the latest code.

1. Still on developer.paypal.com in Sandbox mode
2. Click **Webhooks** in the left sidebar (under your app, or top-level under "My Apps & Credentials")
3. Click **Add Webhook**
   - URL: `https://<your-vercel-preview-url>/api/export/webhook`
   - Event types: check **only** `Payment capture completed` (event name `PAYMENT.CAPTURE.COMPLETED`)
4. Save. Copy the **Webhook ID** that appears

### 3. Add env vars to Vercel (Preview environment)

Go to Vercel → your project → Settings → Environment Variables.
Add these, scoped to the **Preview** environment:

| Variable | Value |
|---|---|
| `PAYPAL_CLIENT_ID` | (from step 1) |
| `PAYPAL_CLIENT_SECRET` | (from step 1) |
| `PAYPAL_WEBHOOK_ID` | (from step 2) |
| `PAYPAL_ENV` | `sandbox` |
| `RESEND_API_KEY` | (your Resend API key — needed for emailing the PDF) |

Trigger a fresh preview deploy so the new env vars are picked up.
Easiest way: push any tiny commit, or in Vercel's dashboard:
Deployments → click the latest → "Redeploy".

### 4. Test end-to-end on the preview

1. Open the preview URL in a browser
2. Run a session in `/reset`, `/belief-inquiry`, or `/integration` until
   the export CTA appears
3. Enter an email and click "Save for $9.99"
4. You'll be redirected to PayPal's sandbox checkout
5. Sign in with a sandbox buyer account (developer.paypal.com →
   **Sandbox** → **Accounts** → there's a default personal-buyer login
   you can use, password is also shown there)
6. Approve the payment
7. Check the email inbox — your PDF should arrive within a couple
   minutes
8. Bonus: in Vercel → your project → Logs, confirm the webhook fired
   and the email send succeeded

---

## PayPal live setup (only after sandbox works)

Repeat the sandbox steps in **Live** mode:

1. developer.paypal.com → top-right → switch to **Live**
2. Apps & Credentials → Create App → name it `Maya Allan Site (live)`
3. Copy live Client ID + Secret
4. Webhooks → Add Webhook → URL: `https://mayaallan.com/api/export/webhook`
   → subscribe to `PAYMENT.CAPTURE.COMPLETED`
5. Copy live Webhook ID

In Vercel, add the same five env vars but scoped to the **Production**
environment, with:
- `PAYPAL_CLIENT_ID` = your live Client ID
- `PAYPAL_CLIENT_SECRET` = your live Secret
- `PAYPAL_WEBHOOK_ID` = your live Webhook ID
- `PAYPAL_ENV` = `live`
- `RESEND_API_KEY` = same value as preview (or a separate live key)

Redeploy production.

---

## Push the commit to GitHub

When you're ready to share / deploy / or just to back it up:

```bash
git push origin main
```

Vercel will auto-deploy a preview from the push. Use that preview URL
for the sandbox webhook.

---

## What changed in the code (for reference)

| File | Status |
|---|---|
| `src/lib/paypal.ts` | NEW — PayPal Orders v2 + webhook verification |
| `src/lib/lemonsqueezy.ts` | DELETED |
| `src/app/api/export/route.ts` | Calls PayPal instead of LS |
| `src/app/api/export/webhook/route.ts` | Verifies PayPal signature, listens for PAYMENT.CAPTURE.COMPLETED, idempotent on missing blob |
| `src/components/ExportCta.tsx` | Footer copy updated (no MoR claim) |
| `src/lib/pdf/template.tsx` | Same fix in PDF footer |
| `tests/lib/paypal-custom-id.test.mjs` | NEW — 7 tests, all pass |
| `tests/lib/lemonsqueezy-signature.test.mjs` | DELETED |
| `package.json` | Removed `@lemonsqueezy/lemonsqueezy.js` |
| `SESSION-HANDOFF.md` | Updated env vars + checklist for PayPal |

`stripe` is still in `package.json` from earlier (was the planned LS
fallback). Unused — can remove later when convenient. Not blocking.

---

## When you come back

Open a new Claude Code session in this directory and paste:

> Resuming the PayPal pivot from `PAYPAL-SETUP.md`. Read it for context,
> then [pick one]: walk me through the sandbox setup / I have my
> credentials ready and need help with Vercel env vars / sandbox is
> working and I want to do live setup / something else.

That gets you back where we are now in seconds.

---

## Loose ends not part of the PayPal pivot

These are uncommitted in your work tree, leftover from prior sessions:

- `next-env.d.ts` — Next.js auto-regenerates this; safe to discard with
  `git checkout next-env.d.ts`
- `content/BOOK-METADATA.md` — your book metadata edits, separate from
  PayPal work
- Several `.docx` files in `docs/book-review/` and Python/PowerShell
  scripts in `scripts/` — book-review work
- `generate_voiceover.py`, `tmp-spelling.tsv` — Desktop workflow files

Triage them whenever; they don't affect PayPal.
