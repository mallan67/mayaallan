# 06 — Measurement engineering: see every visitor, click and lead on mayaallan.com

**Lens:** how top developers instrument a small Next.js/Vercel site so the owner sees traffic, clicks and leads (2025–2026 practice). Tactic ids: `meas-`.
**Prepared:** 2026-09-24 by Claude (research subagent). All facts below were read live between **2026-09-24T18:21:37Z and 18:37:59Z** (UTC).
**Live sources used:** `https://www.mayaallan.com` (GET/HEAD only; production deployment `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4`), GitHub `mallan67/mayaallan` **metadata only** (commit titles, PR titles/bodies/check runs, PR file *names*), and the vendor docs / practitioner write-ups in §13.
**Not used:** local files, Vercel/Supabase dashboards, Gmail. Anything that depends on them is marked **UNVERIFIED** (§12).
**Definition of lead (owner, 2026-09-24):** newsletter signup, contact/inquiry, book purchase, event registration, or tool user who leaves an email.

---

## 1. Bottom line

The site is **not** missing analytics code. A lot was built (first-party attribution, server-side lead events, an admin dashboard, email alerts on signups and contact messages). Most visitors still go uncounted, because of five specific gaps. All five were confirmed on the live site today:

1. **Page views are recorded only for visitors who click "Accept all".** The Vercel Web Analytics component is wrapped in `GatedAnalytics`, which renders only when `localStorage["mayaallan_consent_v1"] === "accepted"`. The banner is shown to **every visitor worldwide**; there is no region check in the code. A visitor who ignores the banner or clicks "Reject analytics" is never counted, even though Vercel Web Analytics sets no cookies.
2. **The Vercel project switch for Web Analytics may be off.** PR #57 (2026-09-07) and PR #58 (updated 2026-09-24T18:24Z) both say it is disabled. But `/_vercel/insights/script.js` returned **200** at 18:22:46Z, and Vercel's troubleshooting doc links a **404** on that script to "not enabled". The live evidence conflicts. **UNVERIFIED**: the owner has to check Vercel → project → Analytics.
3. **The main buying exits are not measured.** The book page links to 7 retailers (Amazon, Barnes & Noble, Bookshop.org, Google Play, Waterstones, AbeBooks, Bokus) and has 1 PayPal button. No retailer click fires any event. The Amazon link is a social-share link (`ref=cm_sw_r_ffobk…`) with no Amazon Attribution tag, so Amazon sales driven by the site cannot be seen. The AbeBooks link carries **someone else's affiliate click ID** (`ref_=aff_ir_353196_77798`, `afsrc=1`, copied from a search result).
4. **Tool engagement events are silently dropped.** `/belief-inquiry`, `/nervous-system-reset`, `/integration-reflection` and `/integration-journal` send `tool_viewed`, `tool_started`, `turn_reached_N`, `session_completed`, `time_to_first_message`, `export_cta_viewed`, `export_cta_clicked` and `session_feedback` **only** through `window.va` (Vercel custom events). When the gated Analytics component is not mounted, `window.va` is undefined and the call is a no-op. Vercel custom events also do **not exist on the Hobby plan**.
5. **The two extra domains send untagged traffic.** `psilocybinintegrationguide.com` and `psilowire.com` (apex and www) return a 308 redirect to `https://www.mayaallan.com/` with no UTM tag. Anyone arriving through them looks like Direct traffic, or like whatever page linked to them.

**The smallest fix that lets the owner see visitors, sources, clicks and every lead within 24 hours of deploy:**

1. Merge PR #57. It has been green, `mergeable_state=clean`, and unmerged since 2026-09-07T03:45Z.
2. Turn on Web Analytics in Vercel.
3. Ship one small PR that sends retailer clicks, CTA clicks and tool steps to the site's **existing** first-party event table (`/api/marketing/event` → Supabase `marketing_events`).
4. Add a weekly digest email.

No new vendor, no new cookie and no change to the Content Security Policy (CSP) are needed.

---

## 2. What exists today (live inventory)

| Area | Live evidence (read time UTC) | Status |
|---|---|---|
| Third-party trackers | Homepage HTML plus 13 homepage JS chunks, and 22 unique chunks across 16 pages, contain no GA/GTM, Clarity, PostHog, Plausible, Umami or Meta pixel code (18:21:44Z, 18:22:57Z) | None, which is consistent with the privacy page ("no advertising trackers") |
| CSP header | `script-src` allows `https://va.vercel-scripts.com`; `connect-src 'self' … https://vitals.vercel-insights.com`; `form-action 'self' https://*.paypal.com` (18:21:37Z) | Same-origin `/_vercel/insights/*` is already allowed by `'self'` |
| Vercel Web Analytics | `@vercel/analytics` "2.0.1" is bundled. It renders only inside `GatedAnalytics`, which returns null unless consent is `"accepted"`. The live RSC payload references `GatedAnalytics` and `GatedMarketing`, **not** `CookielessAnalytics` (18:22:09Z, re-checked 18:37:28Z) | **Consent-gated for everyone** |
| Vercel script endpoint | `GET /_vercel/insights/script.js` → 200, 4469 B. `GET /_vercel/speed-insights/script.js` → 200, but Speed Insights is not mounted (18:22:46Z) | Project enablement: **UNVERIFIED** (see §1.2) |
| First-party attribution | `GatedMarketing` sets the cookies `ma_visitor_id`, `ma_session_id`, `ma_first_touch` and `ma_last_touch` (`Max-Age=63072000`, i.e. 2 years, SameSite=Lax, Secure) and POSTs to `/api/marketing/visitor` (18:22:20Z). Built in PR #12, merged 2026-05-13 | Works only for visitors who consent |
| Consent banner | Shown whenever no choice is stored; nothing in the code checks the visitor's region. Buttons: "Reject analytics" / "Accept all". Text: "We use a small set of first-party cookies to measure how the site is performing — anonymous visitor IDs and UTM-based campaign attribution…" (18:24:40Z, 18:35:02Z) | Global |
| Privacy page promise | "If you are in the EU, the UK, or any other jurisdiction where consent is required for non-essential cookies, these are set only after you accept…" (18:24:27Z) | **The code is stricter than the policy**: it gates everyone, not only visitors in those regions |
| Server-side lead events | PR #12 body: `newsletter_subscribed` (`/api/subscribe`), `contact_submitted` (`/api/contact`), `checkout_started` (`/api/checkout/paypal`), `purchase_completed` (PayPal webhook, with UTM snapshot joined by `paypal_order_id`) → Supabase `marketing_events`; admin view `/admin/analytics` (live HEAD → 307 to `/admin/login`, 18:34:42Z) | Good. This is the practitioner pattern (server-confirmed conversions) |
| Client event | `book_viewed` sent from the book page to `/api/marketing/event`, deduplicated per session, not consent-gated (18:23:52Z) | Works |
| Lead alerts | PR #47/#49 (merged 2026-09-05): an operator SMTP notification on every subscribe and contact submission, each running as its own `after()` task | Exists. Delivery to the owner's inbox is **UNVERIFIED** |
| Email capture points | `type="email"` inputs: `/` = 1 (newsletter, `source:"homepage"`), `/contact` = 1. The other 10 pages checked have **0**: book page, blog, 4 tools, events, about, scenarios, faq (18:26:03Z) | Only 2 places where a visitor can become a lead without paying |
| Tool events | Chunk `9a7cf34cbe809fe3.js`: `window.va?.("event",{name,data})` for the 8 tool events listed in §1.4 (18:30:07Z) | Dropped when there is no consent; need Vercel Pro |
| Retailer links | Book page, 18:23:38Z: `a.co/d/hRppkCZ` → 301 to `amazon.com/dp/B0G765BZDL?ref=cm_sw_r_ffobk…&social_share=…` (18:36:05Z); B&N (`;jsessionid=…`); Bookshop (`source=IndieBound&ref=https://www.google.com/`); Google Play; Waterstones; AbeBooks (third-party Impact affiliate parameters); Bokus (`srsltid=…`, a Google Shopping ID) | Not measured, and carry other parties' tracking parameters |
| Extra domains | Apex and www of both domains → 308 to `https://www.mayaallan.com/` (18:35:46Z) | No UTM tag |
| Events page | "No events are currently scheduled." (18:35:33Z) | No event-registration leads are possible today |
| PR #57 | Open. Checks `gates`, `on-success` and Vercel all passed at 2026-09-07T03:45Z; `mergeable_state=clean` (18:37:28Z). 14 files, including `src/components/AnalyticsGated.tsx`, `ConsentBanner.tsx`, `src/lib/analytics-acquisition.ts`, `src/app/admin/analytics/page.tsx`, `src/app/privacy/page.tsx` | **Unmerged for 17 days**. This is the single biggest measurement fix |

---

## 3. What practitioners do in 2025–2026 (evidence)

1. **Count page views for everyone without cookies, and ask consent only for identifiers.**
   - Vercel Web Analytics identifies visitors "by a hash created from the incoming request"; the session "is automatically discarded after 24 hours"; it uses no third-party cookies (Vercel docs, updated 2026-06-26).
   - UK: under the Data (Use and Access) Act 2025, with all provisions in force per the ICO update of 2026-06-19, some cookies no longer need consent, including cookies "for statistical purposes". The conditions are clear information and a "simple and free" means to object. The exemption does **not** allow "monitoring or tracking individual visitors" (ICO, updated 2026-04-29 / 2026-06-19). Page views qualify; a 2-year visitor ID that links a first visit to a later purchase still needs consent in the UK.
   - Microsoft Clarity itself only **enforces** consent signals for the EEA, UK and Switzerland, from 2025-10-31 (Microsoft Learn, updated 2025-12-05). Scoping consent by region is normal industry practice.
2. **Record conversions on the server, not only in the browser.** Vercel's own docs: "In scenarios such as when a user signs up or makes a purchase, it's more useful to track an event on the server-side" (updated 2026-06-26). Plausible says scripts that are not proxied miss "typically between 5% and 25%" of visitors because of blockers (updated 2026-05-29). This site already records leads on the server. The gap is clicks and tool steps, which run in the browser only.
3. **Collect first-party, on your own domain.** The PostHog Next.js guide routes ingestion through `rewrites` because "the browser only sees requests to your domain". Vercel `@vercel/analytics` v2 "Resilient Intake" uses a randomised same-origin path. This site's `/api/marketing/event` is already same-origin, which is the right sink.
4. **Detect AI referrals explicitly, and ask people how they found you.**
   - Vercel (2025-06-10): "ChatGPT now refers around 10% of new Vercel signups … up from 4.8% the previous month, and 1% six months ago." Their method is to track visits from `chat.openai.com`, `perplexity.ai`, `claude.ai` and similar referrers.
   - OpenAI (Publishers FAQ, updated about 2026-08-28): "ChatGPT automatically includes the UTM parameter utm_source=chatgpt.com in referral URLs."
   - Ahrefs (2025-02-06, 3,000 sites): AI chatbots send 0.12% of views on average, but 0.37% of views and 0.56% of visitors on sites under 999 visits a month. ChatGPT sends 50%, Perplexity 30.7%, Gemini 17.6%. Ahrefs counted "14K+ self-attributed new users from ChatGPT"; a follow-up (2025-03-26) says about 3% of its conversions came from AI, based on "registration data, and qualitative responses".
   - **Practitioner lesson:** referrer data under-counts AI and word of mouth, so add a one-question self-report.
5. **Measure visibility before the click.** Bing Webmaster Tools "AI Performance" (public preview, 2026-02-10) shows total citations, cited pages and grounding queries in Copilot and Bing AI answers. A Microsoft blog post (2025-11-20, vendor source) cites AI-search conversion rates of 7.05% vs 5.81% for organic (Amsive) and 11.4% vs 5.3% (Similarweb). These are vendor-reported numbers: directional only.
6. **Report programmatically.** Vercel shipped a public Web Analytics API (2026-05-18) and Vercel CLI queries (2026-06-26). You can group by `referrerHostname`, `requestPath`, `route`, UTM fields and `eventData/<prop>`. Cron on Hobby runs once a day at most, with ±59 min precision (docs updated 2026-07-15). That is enough for a weekly digest.
7. **Authors measure retailer sales at the source.** Amazon Attribution is "a free measurement solution" with a 14-day window. It reports clicks, detail-page views, add-to-cart, purchases and units, and **KDP authors are eligible** (Amazon Ads page, undated, read live).

---

## 4. Options compared (for this site)

| Tool | Cost / limits (dated source) | Consent | CSP change | Fit here |
|---|---|---|---|---|
| **Vercel Web Analytics** | Hobby: 50,000 events/month, 1-month reporting window, **no custom events**. Pro: $0.03 per 1K events, 12-month window, custom events with 2 properties. Plus add-on: $10/month, 8 properties, UTM parameters (docs updated 2026-08-25) | No cookies; aggregate data (see §3.1) | None (same origin) | **Yes, for page views and sources.** Already installed |
| First-party `marketing_events` (Supabase) | Already paid for (existing DB); no per-event vendor fee | Event rows without an identifier need no cookie; `visitor_id` is present only when the visitor consented | None | **Yes, as the single sink for clicks, tool steps and leads.** Works on any Vercel plan |
| PostHog | Free each month: 1M events, 5K session recordings, 1,500 survey responses, no card (pricing page, undated, read live). Cookieless mode `always` / `on_reject` (tutorial 2025-08-27) | Replay and identified tracking need consent | `us.i.posthog.com` and `us-assets.i.posthog.com`, or none if proxied through Next rewrites | Strong, but a second system to run. Defer |
| Microsoft Clarity | Free | Consent enforced for EEA/UK/CH from 2025-10-31. Default "Balanced" masking hides **only numbers and email addresses**; visible text is recorded | `https://*.clarity.ms https://c.bing.com` | **Not recommended.** Replays would capture on-screen AI-chat text about psilocybin experiences. That is sensitive, and it conflicts with the privacy page ("no advertising trackers") |
| Plausible | Starter $9/month for 10k page views, 1 site, goals and custom events; Growth $14; Business $19 (funnels, revenue, custom properties). 30-day trial (live pricing page; docs updated 2026-09-18) | Cookieless | `plausible.io`, or a proxy | Good product, but it duplicates Vercel Web Analytics, which is already installed |
| Umami Cloud | Pricing page renders client-side; numbers not extracted. **UNVERIFIED** | Cookieless | Unverified hosts | Not needed |

---

## 5. Recommendation: one minimal stack

**Vercel Web Analytics for everyone (cookieless) + the existing Supabase `marketing_events` table as the single place every click, tool step and lead lands + operator email alerts (existing) + a weekly digest (new).**

**Why this stack:**
- It adds nothing new to trust: no new vendor, cookie or CSP host, and no privacy-policy change beyond what PR #57 already writes.
- It fixes the actual failure points (§1).
- It works on the Hobby plan: page views on Vercel; custom events first-party, so the Pro-only restriction on Vercel custom events stops mattering.

**Who sees what, where:**
- **Visitors and sources:** the Vercel → Analytics tab, live within minutes of enabling.
- **Clicks, tool funnel and leads:** `/admin/analytics`, plus the weekly email.
- **Every lead as it happens:** the operator email (already built for subscribe and contact).

---

## 6. Event taxonomy to fire on this site (exact)

**Naming rule:** keep the event names that already exist (so historical rows stay comparable) and add the new ones in the same snake_case style.

**Transport:**
- **Server** means inside the API route, after the database write succeeds, via the existing `trackMarketingEvent()`.
- **Beacon** means the browser sends `navigator.sendBeacon('/api/marketing/event', …)`, falling back to `fetch(…, {keepalive:true})`. Unlike `window.va`, this survives page unloads and works without consent, because it sends no identifier unless the consent cookies exist.

**Never send** an email address, a name, or chat text. Send the email domain only, as the code already does.

| Event | Fire when | Where | Properties (small, flat) | Lead? |
|---|---|---|---|---|
| (page view) | every route | Vercel Web Analytics (after PR #57) | automatic: path, referrer, UTM, country, device | — |
| `book_viewed` | book page mount (**exists**) | beacon | `book_id`, `slug`, `direct_sale_enabled`, `ebook_price` | — |
| `retailer_click` **(new)** | click on any retailer link | beacon, before navigation | `retailer` (`amazon`/`bn`/`bookshop`/`google_play`/`waterstones`/`abebooks`/`bokus`), `format` if known, `location` (`book_hero`/`buy_box`/`blog_cta`/…) | intent (not a lead) |
| `cta_click` **(new)** | primary CTAs: nav tool links, "Start Reflecting", book CTAs on home/blog/scenarios/glossary, "Buy Ebook with PayPal" | beacon | `cta_id`, `location`, `dest_path` | — |
| `share_click` **(new)** | share buttons (FB, X, LinkedIn, Reddit, Pinterest, WhatsApp, Telegram, TikTok) | beacon | `network`, `path` | — |
| `checkout_started` | PayPal order created (**exists**) | server | `book_id`, `price`, `paypal_order_id` | — |
| `purchase_completed` | PayPal webhook capture fulfilled (**exists**) | server | `amount`, UTM snapshot | **yes** |
| `newsletter_subscribed` | `/api/subscribe` upsert succeeded (**exists**) | server | `email_domain`, `source`, add **`found_via`** (§7) | **yes** |
| `contact_submitted` | `/api/contact` insert succeeded (**exists**) | server | `email_domain`, length bucket, add **`found_via`** | **yes** |
| `tool_viewed` / `tool_started` / `turn_reached_N` / `session_completed` / `session_feedback` / `export_cta_viewed` / `export_cta_clicked` | as today | **dual-send**: keep `window.va`, add beacon | `tool`, `total_turns`/`rating` as today | — |
| `export_purchased` | session-export PayPal webhook fulfilled | server | `tool`, `amount` | **yes**. Whether it is already tracked is **UNVERIFIED** |
| `tool_email_captured` **(when built)** | a tool offers "email me my reflection / the free chapter" and the server stores the address | server | `tool`, `email_domain`, `found_via` | **yes** |
| `newsletter_submit_error` **(new)** | the subscribe API returns non-2xx | server | `reason` | diagnostic |

**Funnels to show on `/admin/analytics`:**
- **Book:** `book_viewed → (retailer_click ∪ checkout_started) → purchase_completed`.
- **Tools:** `tool_viewed → tool_started → session_completed → export_cta_clicked → export_purchased`.
- **Leads (7d/30d):** `newsletter_subscribed + contact_submitted + purchase_completed + export_purchased + tool_email_captured`, listed one row per lead with its source channel.

**Minimal client helper** (new `src/lib/beacon.ts`; the route may need its event-name allowlist extended; whether an allowlist exists is **UNVERIFIED**):

```ts
export function beacon(eventName: string, properties: Record<string, string | number | boolean | null> = {}) {
  try {
    const body = JSON.stringify({ eventName, path: location.pathname, properties });
    const ok = navigator.sendBeacon?.('/api/marketing/event', new Blob([body], { type: 'application/json' }));
    if (!ok) fetch('/api/marketing/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {}
}
```

---

## 7. Attribution design (first touch / last touch, UTM, AI)

- **Keep** the PR #12 cookie design (first and last touch; UTM snapshot copied onto the PayPal order) for visitors who consent.
- **Classify channels on the server.** Extend `src/lib/analytics-acquisition.ts` (added by PR #57) and the ingest route with a `channel` field:
  - `ai`: referrer host in {`chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `www.perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, `claude.ai`}, or `utm_source=chatgpt.com`. That list comes from the Vercel, OpenAI and Ahrefs sources. Also add `chat.deepseek.com`, `grok.com`, `meta.ai` and `chat.mistral.ai` as a convention, then confirm them against real data.
  - `search`: google.*, bing.com, duckduckgo.com, search.brave.com, ecosia.org, yahoo.
  - `social`: instagram, facebook, l.facebook.com, t.co, x.com, linkedin, lnkd.in, reddit, pinterest, tiktok, youtube, threads.
  - `email`: `utm_medium=email`.
  - `owned_domain`: `utm_medium=domain_redirect`.
  - `referral`: any other host.
  - `direct`: no referrer.
- **Self-reported source (`found_via`).** Add one optional select to the newsletter form, the contact form and the post-purchase page: "How did you find me?" with the options ChatGPT/AI assistant · Google/Bing · Instagram · Facebook · Reddit · Podcast/interview · A friend · Bookstore/Amazon · Other.
  - It stores nothing on the device, so no consent is needed.
  - It catches AI, word-of-mouth and "dark social" visits that referrers miss (Ahrefs relies on exactly this).
- **Tag the owned domains.** Change the 308 targets:
  - `psilocybinintegrationguide.com` → `https://www.mayaallan.com/books/psilocybin-integration-guide?utm_source=psilocybinintegrationguide.com&utm_medium=domain_redirect`
  - `psilowire.com` → `https://www.mayaallan.com/?utm_source=psilowire.com&utm_medium=domain_redirect`
- **Tag every link you post yourself.** Instagram bio, podcast show notes, newsletter and social posts: use `utm_source=<platform>&utm_medium=<social|email|podcast>&utm_campaign=<yyyy-mm-topic>`. Vercel Web Analytics shows UTM fields only on the Plus add-on, but the first-party `ma_first_touch` cookie and the admin dashboard already store them for consenting visitors.
- **Retailers:** see meas-04.

---

## 8. Instant lead alerts and a weekly auto-report

- **Instant alerts:** keep the existing SMTP operator notification for subscribe and contact.
  - Add the same `after()` notification for `purchase_completed` and `export_purchased` if it is missing (**UNVERIFIED**; PayPal also emails the seller about payments).
  - Optional: send a copy to a phone. An email filter to push is enough; a Telegram bot is optional.
- **Weekly digest (new):**
  - Add a Vercel Cron `0 13 * * 1` (Hobby-safe, runs within ±59 min) calling `/api/cron/weekly-digest`, protected by `CRON_SECRET`.
  - The route queries:
    - (a) `marketing_events`: last 7 days, counts per event, with a list of every lead (time, type, channel, `found_via`, `email_domain`);
    - (b) `marketing_visitors`: top first-touch sources and landing pages;
    - (c) the Vercel Web Analytics API: `visits/aggregate` by `referrerHostname`, by `requestPath`, and total visitors. This needs a scoped Vercel token stored as an env var, which the owner creates.
  - It emails the owner through the existing Resend/SMTP path.
  - It prints zeros explicitly, so "nothing happened" cannot be confused with "the report broke".
  - It writes each weekly snapshot to a `weekly_metrics` row. **Hobby keeps Vercel analytics for only 1 month**, so the history has to live in your own database.
- **No-data heartbeat:** a daily cron (Hobby allows one per day) alerts if Vercel page views = 0 in the last 24h, or if no `marketing_events` row arrived in 72h. A silent tracker is the failure that produced "a month of zero".

---

## 9. 24-hour verification after deploy (GET-only checks plus owner checks)

1. The live homepage RSC payload contains `CookielessAnalytics` and no longer contains `GatedAnalytics` (curl the HTML).
2. The owner opens the site in a private window, **ignores the banner**, and visits 3 pages. The Vercel → Analytics tab shows the visit within minutes. If it does not, Web Analytics is not enabled or the deploy predates enabling; redeploy (Vercel troubleshooting doc).
3. The owner visits `/?utm_source=meas_test&utm_medium=test&utm_campaign=2026-09-24`, clicks Amazon on the book page, and returns. `/admin/analytics` shows a `retailer_click` row with `retailer=amazon`.
4. The tool funnel shows `tool_viewed` → `tool_started` for a test session.
5. The first weekly digest arrives. The heartbeat test fires if it is pointed at an empty window.

---

## 10. Tactics

| id | Tactic | Owner | Effort |
|---|---|---|---|
| meas-01 | Merge PR #57 (count every visitor, cookieless) | owner-account | S |
| meas-02 | Turn on Vercel Web Analytics and confirm data arrives | owner-account | S |
| meas-03 | First-party retailer / CTA / share click events plus clean retailer URLs | code-pr | S |
| meas-04 | Amazon Attribution tags plus a Bookshop.org affiliate ID | mixed | M |
| meas-05 | UTM-tag the two domain redirects | code-pr | S |
| meas-06 | Dual-send tool events to the first-party sink and add a tool funnel | code-pr | S |
| meas-07 | AI-referral channel plus Bing AI Performance and Search Console | mixed | S |
| meas-08 | "How did you find me?" self-reported source | code-pr | S |
| meas-09 | Weekly digest, snapshot table and no-data heartbeat | code-pr | M |
| meas-10 | Region-scoped consent (align code with the privacy page) | mixed | M |

### meas-01 — Merge PR #57
- **Steps:** Maya reviews and merges PR #57 (green since 2026-09-07; `mergeable_state=clean` at 18:37:28Z), then re-runs the CI gates on merge.
- **Impact:** page views go from "consented visitors only" to "all visitors, minus blockers". No lead impact, but it is the precondition for seeing anything.
- **Measure:** verification steps 1–2 in §9.

### meas-02 — Enable Web Analytics in the Vercel project
- **Steps:** Vercel → project `mayaallan` → Analytics → Enable, then redeploy production. Note the plan (Hobby or Pro); it decides whether Vercel custom events exist at all.
- **Measure:** visitors appear in the Vercel dashboard within minutes; the weekly digest total is not 0.

### meas-03 — First-party click events
- **Steps:**
  - Add `beacon()`.
  - Fire `retailer_click` on the 7 retailer links, `cta_click` on the main CTAs and `share_click` on the share buttons.
  - Replace the retailer URLs with clean canonical ones (drop `jsessionid`, `srsltid`, `source=IndieBound&ref=…google`, and the third-party AbeBooks affiliate parameters).
  - Add the new names to the ingest route if it uses an allowlist.
- **Impact:** makes the book page's main exits visible. Today 7 of its 8 buy options are invisible.
- **Measure:** retailer_click count by retailer and location in `/admin/analytics`.

### meas-04 — Retailer attribution
- **Steps:**
  - Owner, in an Amazon Ads account (KDP authors are eligible; free): create Amazon Attribution tags, one per placement (book page, blog CTA, newsletter, Instagram bio).
  - Code: swap in the tagged Amazon URLs per `location`.
  - Owner: join the Bookshop.org affiliate programme and use her own ID.
- **Impact:** shows **actual Amazon purchases** driven by the site over a 14-day window (Amazon page, read live). This is likely where most book sales happen; not measured today.
- **Measure:** Amazon Attribution report (clicks → detail-page views → purchases) per tag, weekly.

### meas-05 — UTM on the domain redirects
- **Steps:** change the redirect targets as in §7 (Vercel domain redirect settings, or a `next.config` `redirects()` rule with a `has: host` condition).
- **Measure:** `utm_source=psilowire.com` and `utm_source=psilocybinintegrationguide.com` rows appear in UTM / first-touch data.

### meas-06 — Tool events that survive
- **Steps:** in the tool analytics helper (the function that calls `window.va`), also call `beacon()` with the same name and properties. Add the tool funnel panel to `/admin/analytics`.
- **Impact:** tool usage becomes visible on any Vercel plan and without consent. Needed before any tool email-capture experiment can be judged.
- **Measure:** `tool_started` / `tool_viewed` and `session_completed` / `tool_started` rates per tool.

### meas-07 — AI-referral channel and visibility before the click
- **Steps:**
  - Code: add the `channel` classifier (§7) to the acquisition helper and the digest.
  - Owner: verify the site in Bing Webmaster Tools and open AI Performance; confirm Google Search Console access.
- **Impact:** for small sites AI is 0.37–0.56% of traffic (Ahrefs 2025). It is small but high-intent: vendor-reported conversion is 1.2–3× organic.
- **Measure:** weekly AI visitors and AI-attributed leads; Bing citations and cited pages.

### meas-08 — Self-reported source
- **Steps:** add an optional `found_via` select to the newsletter form, the contact form and the purchase thank-you page. Store it on the lead row and in the event properties.
- **Evidence:** Ahrefs attributes AI conversions from "registration data and qualitative responses".
- **Measure:** share of leads per `found_via` value; the gap between referrer channel and self-report shows how much traffic is "dark".

### meas-09 — Weekly digest and heartbeat
- **Steps:**
  - Add a `vercel.json` cron (weekly digest, daily heartbeat) with a `CRON_SECRET`-guarded route.
  - Query Supabase and the Vercel Web Analytics API (the owner creates a scoped token env var).
  - Send through the existing mailer.
  - Persist a `weekly_metrics` row.
- **Impact:** Maya sees visitors, sources, clicks and every lead every Monday without logging in. A broken tracker raises an alert within a day.
- **Measure:** the digest arrives, the heartbeat fires in a test, and the snapshots accumulate.

### meas-10 — Region-scoped consent
- **Steps:**
  - Owner or counsel decides whether first-party attribution cookies need prior consent outside the EEA/UK/CH. This analysis does not make that legal call; **UNVERIFIED**.
  - If not: read `x-vercel-ip-country` server-side and pass a `requiresConsent` flag to the banner. Show the banner and gate the `ma_*` cookies only for EEA/UK/CH (and any other region counsel names). Elsewhere, set the cookies by default and keep the footer "Cookie preferences" opt-out.
  - Update the privacy page to match.
- **Impact:** first-touch → lead/purchase attribution would cover most US visitors instead of only those who click "Accept all".
- **Measure:** share of `marketing_visitors` rows vs Vercel visitors, before and after.

---

## 11. What not to do (and why)

- **Don't add Clarity or any session replay to the tool pages.** Balanced masking records visible text, and these pages show personal reflections. Clarity also needs consent in the EEA/UK/CH, and it would contradict the privacy page. If heatmaps are ever wanted, use Strict masking on non-tool pages only, after consent.
- **Don't add GA4 or GTM.** They mean another consent surface, another CSP host and another dashboard. The questions GA4 would answer are covered by Vercel Web Analytics plus the first-party events.
- **Don't count leads from browser events.** Leads are the server-written rows only (`newsletter_subscribed`, `contact_submitted`, `purchase_completed`, `export_purchased`, `tool_email_captured`). Browser events are intent.
- **Don't rename existing events.** It would break continuity with the rows collected since 2026-05-13.

---

## 12. UNVERIFIED and not done

- Whether Web Analytics is enabled on the Vercel project right now: the evidence conflicts (§1.2). Needs the Vercel dashboard.
- The Vercel plan (Hobby or Pro): it decides whether the existing `window.va` tool events were ever collectable.
- Whether `marketing_events` / `marketing_visitors` hold any rows, and the counts per event: `/admin/analytics` is behind login.
- Whether operator notification emails reach the owner's inbox. This analysis did not submit any form (GET-only rule).
- Whether the session-export purchase writes a marketing event, and whether purchases trigger an owner alert.
- Whether `/api/marketing/event` enforces an event-name allowlist; source files were not read (metadata-only rule).
- The consent-accept rate on this site: unknown until PR #57 gives an all-visitor denominator.
- Legal conclusion on US / non-EU prior consent for first-party attribution cookies (meas-10): an owner/counsel decision.
- Umami Cloud pricing and hosts; PostHog prices beyond the free tier: not extracted.
- Nothing in this document has been built or deployed. It is research and a plan only.

---

## 13. Sources (URL · publication/update date · read time UTC 2026-09-24)

| # | Source | Published / updated | Read |
|---|---|---|---|
| L1 | https://www.mayaallan.com/ (headers, HTML, JS chunks; deployment dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4) | live | 18:21:37Z–18:37:28Z |
| L2 | https://www.mayaallan.com/books/psilocybin-integration-guide (retailer links, `book_viewed`, PaymentButtons) | live | 18:23:38Z–18:24:10Z |
| L3 | https://www.mayaallan.com/privacy | live | 18:24:27Z |
| L4 | https://www.mayaallan.com/_vercel/insights/script.js (200) | live | 18:22:46Z |
| L5 | Tool pages /belief-inquiry, /nervous-system-reset, /integration-reflection, /integration-journal (chunk 9a7cf34cbe809fe3.js) | live | 18:29:43Z–18:30:07Z |
| L6 | psilocybinintegrationguide.com, psilowire.com (308 → homepage) | live | 18:35:46Z |
| L7 | https://a.co/d/hRppkCZ (301 → amazon.com/dp/B0G765BZDL?ref=cm_sw_r_ffobk…) | live | 18:36:05Z |
| G1 | GitHub PR #57 mallan67/mayaallan (body, checks, file names) | created 2026-09-07T02:58Z | 18:25:22Z, 18:37:28Z, 18:37:59Z |
| G2 | GitHub PR #58 (body) | updated 2026-09-24T18:24:40Z | 18:25:36Z |
| G3 | GitHub PR #12 "PR E: marketing attribution + conversion analytics" (body) | merged 2026-05-13 | 18:29:23Z |
| G4 | GitHub PRs #47, #49 (operator notifications) | merged 2026-09-05 | 18:25:48Z |
| G5 | GitHub main commit list | live | 18:25:03Z, 18:29:12Z |
| V1 | https://vercel.com/docs/analytics/limits-and-pricing | 2026-08-25 | ~18:27:37Z |
| V2 | https://vercel.com/docs/analytics/custom-events | 2026-06-26 | ~18:27:37Z |
| V3 | https://vercel.com/docs/analytics/privacy-policy | 2026-06-26 | ~18:27:37Z |
| V4 | https://vercel.com/docs/analytics/web-analytics-api | 2026-06-26 | ~18:28:02Z |
| V5 | https://vercel.com/changelog/web-analytics-api | 2026-05-18 | 18:32:24Z |
| V6 | https://vercel.com/changelog/query-web-analytics-from-the-vercel-cli | 2026-06-26 | 18:32:04Z |
| V7 | https://vercel.com/docs/analytics/troubleshooting | 2026-06-26 | ~18:28:02Z |
| V8 | https://vercel.com/docs/headers/request-headers (`x-vercel-ip-country`) | 2025-12-13 | ~18:31:14Z |
| V9 | https://vercel.com/docs/cron-jobs/usage-and-pricing | 2026-07-15 | ~18:31:14Z |
| V10 | https://vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search (practitioner, numbers) | 2025-06-10 | ~18:28:43Z |
| N1 | https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client (v15.3+; 16.3 router events) | 2026-07-28 | ~18:28:43Z |
| P1 | https://posthog.com/pricing (vendor) | undated (live) | ~18:28:02Z |
| P2 | https://posthog.com/tutorials/cookieless-tracking (vendor) | 2025-08-27 | ~18:28:02Z |
| P3 | https://posthog.com/docs/advanced/proxy/nextjs (vendor) | undated (live) | ~18:32:52Z |
| C1 | https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2 | ms.date 2025-08-28; updated 2025-12-05 | ~18:28:02Z |
| C2 | https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-csp | updated 2025-12-05 | ~18:28:16Z |
| C3 | https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking | updated 2025-12-05 | ~18:32:52Z |
| PL1 | https://plausible.io/docs/subscription-plans (vendor) | 2026-09-18 | ~18:28:16Z |
| PL2 | https://plausible.io/ (pricing block: $9 / $14 / $19) (vendor) | live | 18:28:16Z |
| PL3 | https://plausible.io/docs/proxy/introduction (5–25% blocked) (vendor) | 2026-05-29 | ~18:34:42Z |
| U1 | https://umami.is/pricing (client-rendered; no numbers extracted) | — | 18:28:16Z |
| O1 | https://help.openai.com/en/articles/12627856-publishers-and-developers-faq (`utm_source=chatgpt.com`) | "Updated 27 days ago" ≈ 2026-08-28 | 18:28:43Z–18:28:54Z |
| A1 | https://ahrefs.com/blog/ai-traffic-study/ (3,000 sites) | 2025-02-06 | ~18:31:45Z |
| A2 | https://ahrefs.com/blog/ai-traffic-research/ (~35,000 sites) | 2025-03-26 | ~18:31:45Z |
| B1 | https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/ | 2026-02-10 | ~18:34:09Z |
| B2 | https://blogs.bing.com/webmaster/2025/11/How-AI-Search-Is-Changing the Way Conversions are Measured (vendor; cites Amsive, Similarweb, Clarity) | 2025-11-20 | ~18:34:42Z |
| I1 | https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-what-does-it-mean-for-organisations/ | 2025-06-19; updated 2026-06-19 | ~18:33:54Z |
| I2 | https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/ | index updated 2026-04-29 | ~18:33:54Z |
| AM1 | https://advertising.amazon.com/solutions/products/amazon-attribution (KDP authors eligible; free; 14-day) | undated (live) | ~18:31:14Z |

*Vendor sources are flagged. Their pricing and claims were current when read, not independently audited. "~" read times were bracketed by `date -u` stamps taken just before and after each fetch batch.*