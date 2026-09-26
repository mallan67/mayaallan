# Every visitor, every action — senior-engineer analytics analysis (2026-09-24)

Lens: **ana — see every visitor and every action** on https://www.mayaallan.com
Author: Claude (senior software / analytics engineer role), for Maya Allan.
Scope: the website and its measurement. **The audiobook is out of scope for now.** Maya said on 2026-09-24: "the audio book is not finished, so please focus on the other stuff first". Audio events are only named here, so the event names don't need to change later. Nothing audio-related gets built.

Method: every fact below was read **live** on 2026-09-24 between 18:36Z and 18:49Z. The sources were the GitHub API (`mallan67/mayaallan`), HTTP GET to www.mayaallan.com, the Vercel API (project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y` only) and the vendor docs and pricing pages cited here. No local files were used. No forms were submitted, nothing was bought, and no admin, cron or IndexNow endpoint was called. Where I could not read something live, it is marked **UNVERIFIED**.

---

## 1. Bottom line

1. **The site measures almost nothing today, and the causes are in configuration, not in the design.** Vercel Web Analytics is **disabled** on the project (the API returns `web_analytics_not_enabled`). The shipped code also loads `<Analytics/>` **only after "Accept all"**, so undecided visitors are invisible even once it is enabled. "One month, zero leads" cannot be diagnosed yet because traffic was never counted.
2. **About 80% of the right system already exists in the code.** It has a first-party event store (`marketing_events` in Supabase) and server-confirmed checkout and purchase events. It emails the operator for contact and newsletter submissions, has a failure-alert system (`alertAdmin`), and has an admin analytics page. What's missing: the page-view switch, capture of clicks and other actions (retailer clicks, shares, journal downloads), an alert when a **sale** happens, a weekly digest, and an alarm when tracking itself goes quiet.
3. **PR #57 is the right first step, and it's ready.** It has been open since 2026-09-07. CI is green, it is mergeable, it is 0 commits behind `main`, and the final Codex review says "Didn't find any major issues". It counts page views without cookies for every visitor and adds acquisition panels. **It needs Maya's merge plus one dashboard toggle (Vercel → Analytics → Enable).**
4. **Recommended single system: Vercel Web Analytics (cookieless page views) + the site's own first-party event store + ONE admin screen + instant email alerts + a weekly digest email.** Don't add PostHog or Clarity now. The reasons: 0 new vendors, 0 CSP changes, about 2 KB of extra JavaScript instead of about 98 KB, and it keeps the site's written privacy promises. It also avoids session-recording a mental-health and psilocybin AI chat.
5. **The biggest blind spot is a business one.** The book page sends buyers to **8 outside retailers** (Amazon, Google Play, B&N, Bookshop, Waterstones, Bokus, AbeBooks), and none of those clicks is measured. The free Integration Journal PDF, the best lead magnet on the site, is "No email required" and isn't measured either.

---

## 2. Live facts (source + UTC read time)

| # | Fact | Source (live) | Read (UTC) |
|---|---|---|---|
| F1 | Vercel Web Analytics is **not enabled**: `count_pageviews` → `400 web_analytics_not_enabled`; `count_events` → same | Vercel API, project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y, team team_kZQh5NYLyrOKqffK0r9EXf4E | 2026-09-24T18:36Z / 18:38Z |
| F2 | Project `mayaallan`: framework nextjs, Node 24.x, created 2025-12-25. Domains: www.mayaallan.com, mayaallan.com, psilowire.com (+www), psilocybinintegrationguide.com (+www), vercel.app aliases. SSO protection `all_except_custom_domains` | Vercel `get_project` | 18:36Z |
| F3 | Production = `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` (READY, created 2026-09-08T07:57Z) from `main` **ed7461a** | Vercel `list_deployments`; live HTML `?dpl=` params; `/api/health` → `"version":"ed7461a"`, all 7 checks ok | 18:36Z–18:45Z |
| F4 | `main` head ed7461a07e49 is "ci(lint): add warning-identity ratchet … (#56)", committed 2026-09-06T15:23Z | `gh api repos/mallan67/mayaallan/commits/main` | 18:39Z |
| F5 | Live homepage HTML loads 13 first-party `/_next/static/chunks/*.js` and **no third-party tracker** (gtag/GTM/GA, PostHog, Clarity, Plausible, Umami, Meta pixel, Hotjar, Segment, Mixpanel, Amplitude: 0 matches) | GET https://www.mayaallan.com/ | 18:36Z |
| F6 | Chunk `312c5210c9c35dc5.js` contains `@vercel/analytics` **sdkv 2.0.1** and the consent banner (localStorage key `mayaallan_consent_v1`). It also contains `GatedAnalytics` and `GatedMarketing`, both of which return `null` unless consent is `"accepted"`. The marketing client sets a visitor cookie (Max-Age 63,072,000 s = 2 years) and a session cookie (1,800 s), then POSTs `/api/marketing/visitor` | GET that chunk | 18:37Z |
| F7 | Banner text: "We use a small set of first-party cookies to measure how the site is performing — anonymous visitor IDs and UTM-based campaign attribution. No advertising trackers, no cross-site sharing." Buttons: **Reject analytics / Accept all**, plus "Cookie preferences" in the footer. The banner has no geo condition, so it shows to every visitor who hasn't chosen yet | same chunk | 18:37Z |
| F8 | CSP: `script-src 'self' 'unsafe-inline'` + PayPal hosts + `va.vercel-scripts.com`; `connect-src 'self' *.supabase.co` + PayPal + `vitals.vercel-insights.com`; `frame-src` PayPal/YouTube/Vimeo; `form-action 'self' *.paypal.com`; `frame-ancestors 'none'` | response headers, GET / | 18:36Z |
| F9 | `/_vercel/insights/script.js` → 200 (4,469 B). `/_vercel/speed-insights/script.js` → 200, but no Speed Insights component exists in the shipped chunks | GET | 18:38Z |
| F10 | `/privacy` "Last updated: May 20, 2026". It says the analytics identifiers are consent-gated and that "We do not run third-party advertising trackers". Processors listed: PayPal, Resend, Vercel (hosting/Blob), Supabase ("aggregated analytics events"), Upstash, AI providers, ElevenLabs. It does **not** name Vercel Web Analytics and has **no GPC statement** | GET /privacy | 18:38Z |
| F11 | **PR #57** "feat(analytics): count every visitor, and show where they came from": open, created 2026-09-07T02:58Z, last updated 03:49Z, head `fa5d59b`, 14 files, +781/−91, `mergeable_state: clean`, **ahead 5 / behind 0** of main. Checks: `gates` success, Vercel success. Last Codex review: "Didn't find any major issues" | `gh api …/pulls/57`, `/files`, `/check-runs`, `/compare` | 18:39Z |
| F12 | First-party pipeline on main: `ALLOWED_EVENT_NAMES` holds 11 names. `POST /api/marketing/event` has an origin check and a 60/min/IP rate limit. **Only `BookViewTracker` calls it from the browser.** Server-side events: `contact_submitted`, `newsletter_subscribed`, `checkout_started`, `purchase_completed` (the PayPal webhook writes attribution too). `download_started` is allowlisted but **never fired** | main@ed7461a: `src/lib/marketing-events.ts`, `src/app/api/marketing/event/route.ts`, GitHub code search | 18:39Z–18:46Z |
| F13 | The AI-tool funnel events (`tool_viewed`, `tool_started`, `turn_reached_*`, `session_completed`, `export_cta_*`, `export_purchased`, `session_feedback`) go **only** to Vercel `track()` (`src/lib/analytics.ts`, called from ResetChat/InquiryChat/IntegrationChat). Today they are **discarded** because Web Analytics is disabled and the component is consent-gated. Vercel custom events also require Pro (F22) | main@ed7461a + code search | 18:46Z |
| F14 | Operator notices: the contact and newsletter routes email the operator. The PayPal webhook has about 27 `alertAdmin` calls, and **every one is a failure or anomaly**. There is **no "you made a sale" notice** | main@ed7461a webhook route (1,319 lines) | 18:45Z |
| F15 | `/integration-journal` offers a free 7-day PDF with "No email required". Its API route has **no** `trackMarketingEvent`, so downloads are unmeasured | GET page; main@ed7461a `src/app/api/tools/integration-journal/route.ts` | 18:40Z / 18:45Z |
| F16 | The book page has a **Buy Ebook with PayPal · $9.99** button, **8 retailer links**, Share on Instagram, Copy link, and a "Sign out of PayPal" link. No code tracks outbound clicks | GET /books/psilocybin-integration-guide | 18:40Z |
| F17 | No `<audio>`/`<video>` elements in the server-rendered HTML of /media or /media/Mushroom-Healing | GET | 18:40Z |
| F18 | The "Health check" workflow is scheduled `*/15 * * * *`, but its last 5 runs were at 22:54, 01:13, 06:12, 11:54 and 16:44 UTC (gaps of **2h19m–5h42m**), all successful | `gh api …/actions/workflows/health-check.yml/runs` | 18:44Z |
| F19 | `vercel.json` has one cron: `/api/cron/aeo-track` at `0 9 * * 1` | main@ed7461a | 18:39Z |
| F20 | JS weight (measured; gzip level 9 by me, so the server's gzip may differ): homepage JS **596,788 B raw / 179,211 B gzip**; Vercel insights script 4,469 / 2,014; posthog-js 1.434.12 `array.js` **313,792 / 98,204**; posthog recorder 214,695 / 66,639; Plausible 2,841 / 1,279; Umami 4,810 / 2,324 | GET www.mayaallan.com + cdn.jsdelivr.net + plausible.io + cloud.umami.is | 18:46Z |
| F21 | Open PRs: #57 and #58 (`work/site-visibility`, docs). No open issues | `gh api …/pulls`, `/issues` | 18:44Z |
| F22 | Vercel WA plans: Hobby 50k events/mo, **custom events not available**, 1-month reporting window. Pro $0.03/1k events, custom events with 2 properties, 12 months. Web Analytics Plus +$10/mo: 8 properties, 24 months, UTM | https://vercel.com/docs/analytics/limits-and-pricing (last_updated 2026-08-25) | 18:47Z |

---

## 3. What is measured today, action by action

| Visitor action | Recorded? | Where | Why it is lost today |
|---|---|---|---|
| Page view (any page) | **No** | Vercel WA | WA is disabled (F1), and even when enabled it only loads after Accept (F6) |
| Referrer / UTM / landing page | Only after Accept | `marketing_visitors` (Supabase) | Consent-gated cookies (F6). Undecided visitors aren't recorded |
| Book page view | Yes (all visitors) | `marketing_events.book_viewed` | — (the only browser-side first-party event) |
| Buy with PayPal click | Partly | server `checkout_started` when the PayPal order is created | The click itself (intent) isn't recorded; abandonment at PayPal is only visible as a gap |
| Purchase | Yes | server `purchase_completed` (signature-verified webhook) + `orders` | **No operator alert** (F14) |
| Retailer click (8 stores) | **No** | — | No outbound tracking (F16) |
| Share on Instagram / Copy link | **No** | — | Not instrumented |
| Newsletter signup | Yes | server `newsletter_subscribed` + operator email | — |
| Contact form | Yes | server `contact_submitted` + operator email | — |
| Journal PDF download | **No** | — | Route not instrumented (F15) |
| AI tool funnel (3 tools) | **No** | Vercel `track()` only | WA disabled, consent-gated, and custom events need Pro (F13, F22) |
| $9.99 "Save Session as PDF" purchase | Unclear | Vercel `track("export_purchased")` | No server-side `marketing_events` write found in the export webhook (code search F12). **UNVERIFIED** whether `orders` covers it |
| JS errors / 404s seen by visitors | **No** | — | No client error capture |
| Consent choice | **No** | localStorage only | So the undercounting from consent can't be measured |

---

## 4. PR #57: what it covers and what it doesn't (metadata only)

**Covers** (per title/body/files, F11): it swaps `GatedAnalytics` for an always-on cookieless `<Analytics/>`, keeps visitor/session cookies behind consent, and routes behavioural `track()` through one consent-guarded call site. It adds `src/lib/analytics-acquisition.ts` plus three `/admin/analytics` panels (visitors, new vs returning, sources, landing pages for 7/30/90 days), and updates the privacy page and banner copy to name Vercel Web Analytics. It includes 21 new tests and a lint-ratchet tightening from 172 to 171 warnings.

**Doesn't cover:**
1. The **Enable** switch in the Vercel dashboard. Owner action; it can't be done in code.
2. Retailer, share, CTA or navigation clicks, journal downloads, 404s or JS errors.
3. The AI-tool funnel still relies on Vercel custom events. Those are **Pro-only** (F22), and the account's plan is **UNVERIFIED**.
4. No sale alert, no weekly digest, no "tracking went dark" alarm.
5. No Global Privacy Control handling, and no stop for the cookieless counter when a visitor explicitly clicks "Reject".
6. On Hobby, the 1-month reporting window means history is lost unless it's snapshotted somewhere.

---

## 5. Options compared (current sources, dated)

| | **Vercel Web Analytics** | **PostHog Cloud** | **Microsoft Clarity** | **Plausible** | **Umami Cloud** |
|---|---|---|---|---|---|
| What it gives | Page views, visitors, referrer, country, device, UTM (Plus), custom events (Pro) | Autocapture, funnels, heatmaps, session replay, surveys, flags | Heatmaps, recordings, "ML insights" | Page views, goals; funnels/props/revenue on Business | Page views, events |
| Price / limits | Hobby: 50k events/mo, **no custom events**, 1-month window. Pro: $0.03/1k events, 2 props, 12 months. Plus +$10/mo: 8 props, 24 months, UTM (docs updated 2026-08-25) | Free: 1M events/mo, 5k recordings/mo, no card, "free forever". Replay $0.005/rec for 5k–15k. Replay retention free 1 month / paid 3 months. Heatmaps "don't contribute to your bill" | Free; 100k sessions/project/day; recordings kept 30 days (favourites up to 9 months); heatmap cap 100k page views (FAQ updated 2026-09-21) | $9 / $14 / $19 per month at 10k page views; 30-day trial; retention 3 y (5 y Business) | **UNVERIFIED** (pricing page returned no content 2026-09-24) |
| Cookies / consent | No cookies; visitors identified by a request hash discarded after 24 h (privacy doc updated 2026-06-26) | `cookieless_mode: "always"` or `"on_reject"` (doc dated 2025-08-27); replay masks inputs by default but **not page text** | Uses third-party cookies "to support operational purposes like advertising". **Consent signal enforced for EEA/UK/CH since 2025-10-31** | "No cookies, no persistent identifiers" | Cookieless (vendor claim; not re-read this run) |
| CSP change | none (same origin) | none if proxied via Next.js rewrites (`/ingest/*` → `us.i.posthog.com`, `us-assets.i.posthog.com`); otherwise add those hosts | add Clarity hosts (list **UNVERIFIED**) | add plausible.io | add cloud.umami.is |
| JS cost (measured, F20) | ~2 KB gz | ~98 KB gz core (+~67 KB recorder when replay is on) = +55% on homepage JS | not measured | ~1.3 KB gz | ~2.3 KB gz |
| Fit for this site | **Best**: already in the code, no new vendor | Strong later, when traffic can feed heatmaps | **Reject**: advertising cookies contradict the banner's "No advertising trackers", and recording a mental-health AI chat is risky | Duplicates Vercel WA; adds a vendor | Duplicates Vercel WA; adds a vendor |

None of these products is discontinued (no DEAD marks). CSP hygiene: `vitals.vercel-insights.com` in `connect-src` and `va.vercel-scripts.com` in `script-src` aren't used by the shipped production code (the script loads from `/_vercel/insights/`, and `va.vercel-scripts.com` is only the SDK's debug/dev path, per chunk code F6). Treat them as candidates for removal. Whether they are "legacy" is **UNVERIFIED**.

---

## 6. Privacy and consent constraints that shape the design

- **Topic sensitivity.** The site covers psilocybin integration and runs AI chats about beliefs and nervous-system states. Washington's **My Health My Data Act** has **no business-size threshold**, covers health data "derived or extrapolated from nonhealth data", and has a private right of action (WA AG page, read 2026-09-24). Design rules that follow from this:
  - never record chat text;
  - no session replay on the tool pages;
  - keep identifiers first-party and consent-gated;
  - never send page-level health inferences to third parties.
- **CCPA.** It applies to businesses with gross annual revenue above $25M, among other thresholds, so it probably doesn't apply here yet. Honouring **GPC** is still expected wherever it does apply (CA AG page, updated 2026-08-28). GPC is cheap to honour: treat `navigator.globalPrivacyControl === true` as "Reject".
- **EU/UK.** CNIL's consent-exemption conditions for audience measurement (Sheet 16, 2020-06-11, still published) are: own-site purpose only, no cross-checking with other data, IP truncation, 13-month tracker lifetime, and an opt-out. EDPB **Guidelines 2/2023** on the technical scope of ePrivacy Art. 5(3) (final version adopted 16 Oct 2024) widen what counts as terminal-equipment access beyond cookies. How they apply to cookieless JS beacons is **UNVERIFIED in this run** (only the adoption date was read). **Practical design:** count cookieless page views by default, **stop on explicit "Reject" or GPC**, and keep all identifiers opt-in. This is my engineering recommendation, not legal advice.
- **The site's own promises (F7, F10)** rule out any advertising tracker (Clarity, Meta pixel). The privacy page must name every processor that is added.

---

## 7. Live DOM inventory (interactive elements, read 18:40Z–18:41Z)

| Page(s) | Elements |
|---|---|
| All pages | Header nav (Home, Books, Belief Inquiry, Nervous System Reset, Integration Reflection, Media, Events, About, Contact); "Open menu" (mobile); footer (Integration Journal, Methods, Blog, Scenarios, Glossary, FAQ, Privacy, Terms, Refunds); **Cookie preferences**; consent banner (Reject analytics / Accept all) |
| `/` | CTAs: Explore My Books, About Me, View All, View Book, Read the Full Story, three tool cards; **newsletter form** (`email` + `company` honeypot, Subscribe) |
| `/books` | Book card → `/books/psilocybin-integration-guide` |
| `/books/psilocybin-integration-guide` | **Buy Ebook with PayPal · $9.99**; **8 retailer links** (Amazon `a.co`, Google Play, Barnes & Noble, Bookshop.org, Waterstones, Bokus, AbeBooks); Share on Instagram; Copy link; "Sign out of PayPal"; Open the Integration tool; scenario/blog links |
| `/belief-inquiry`, `/nervous-system-reset`, `/integration-reflection` | 3 starter-prompt buttons each; free-text `textarea`; **Send message**; "Learn the method →"; after chatting, the export CTA ("Save Session as PDF for $9.99", per /privacy) and feedback rating (per code F13) |
| `/integration-journal` | **Journal form**: phase (Preparation / Journey companion / Integration / Shadow work), intention (optional), journey date (optional), **Download free PDF**; FAQ accordions |
| `/contact` | **Contact form**: name, email, message, `company` honeypot, **Send** |
| `/media`, `/events` | Share on Instagram, Copy link (no audio/video elements, F17) |
| `/blog/*`, `/scenarios/*`, `/faq` | "See the book →", "Read more →", internal cross-links; many outbound DOI/PubMed citation links |
| `/es` `/pt` `/de` `/fr` `/he` (+ `/about`) | "Ver el libro"-style book CTA, "Leer más →" |

---

## 8. Event taxonomy

Rules:
- Names are `object_action` in snake_case.
- Properties are flat, at most 8 per event, strings of at most 128 characters.
- **Never** send an email address, chat text, journal intention text or a free-text form value (`boundProperties` already redacts email-shaped strings).
- Client events carry a visitor/session ID **only if consent = accepted** (the cookies exist only then).
- Anything counted as a **result** is confirmed on the server.

| Event | Trigger | Key properties | Fires from | Server confirmation |
|---|---|---|---|---|
| `page_view` | every route change | path, route, referrer host, UTM, country, device (built into WA) | Vercel `<Analytics/>` cookieless | n/a |
| `nav_click` | header/footer/mobile nav link | location (header/footer/mobile), target | delegated click listener | — |
| `menu_open` | "Open menu" | — | listener | — |
| `cta_click` | any in-content CTA (`data-track="cta:<id>"`) | cta_id, from_path, target | listener | — |
| `book_viewed` | book page mount (exists) | book_id, slug, direct_sale_enabled, ebook_price | BookViewTracker | — |
| `buy_click` | Buy Ebook with PayPal | book_id, price, format | listener | → `checkout_started` |
| `checkout_started` | PayPal order created (exists) | book_id, amount | `/api/checkout/paypal` | **server** |
| `checkout_returned` / `checkout_cancelled` | PayPal return/cancel | outcome | `/api/checkout/paypal/return` | **server** |
| `purchase_completed` | verified PayPal capture (exists) | order_id, amount, currency, book_id, UTM | PayPal webhook | **server** → **SALE alert** |
| `download_started` | buyer download token used (allowlisted, not fired) | book_id, attempt | `/api/download/[token]` | **server** |
| `retailer_click` | outbound to a store | retailer (amazon/google_play/bn/bookshop/waterstones/bokus/abebooks), book_id | listener (`sendBeacon`) | — (intent only; the stores own the sale) |
| `outbound_click` | any other external link (DOI, PubMed, social) | host, from_path | listener | — |
| `share_click` | Share on Instagram / Copy link | method, content_type (book/media/event), slug | listener | — |
| `newsletter_subscribed` | signup stored (exists) | location, email_domain | `/api/subscribe` | **server** → LEAD alert (exists) |
| `newsletter_form_error` | client or server validation error | error_type | form component | — |
| `contact_submitted` | message stored (exists) | message_length bucket, email_domain | `/api/contact` | **server** → LEAD alert (exists) |
| `journal_downloaded` | PDF generated | phase, has_intention (bool), has_date (bool) | `/api/tools/integration-journal` | **server** |
| `tool_viewed` / `tool_started` | tool page mount / first message | tool, starter (prompt_1..3 / free_text) | tool components → first-party endpoint (and Vercel `track` if Pro) | — |
| `tool_turn_reached` | turns 3 / 6 / 10 | tool, turn | tool components | — |
| `session_completed` / `session_feedback` | end of session / rating | tool, total_turns / rating | tool components | — |
| `export_cta_viewed` / `export_cta_clicked` | $9.99 PDF offer shown / clicked | tool | tool components | → `export_purchased` |
| `export_purchased` | PDF checkout captured | tool, amount | `/api/export/webhook` | **server** → **SALE alert** |
| `tool_error` | chat API failure | tool, status | tool components | — |
| `consent_decided` | banner choice | choice (accepted/rejected/gpc) | banner (cookieless) | — |
| `not_found_view` | 404 page render | path, referrer host | `not-found.tsx` | — |
| `client_error` | `window.onerror` / unhandled rejection / error boundary | path, error digest (hashed, truncated) | error listener (rate-limited) | — |
| *(reserved, do not build yet)* `audio_sample_play`, `audio_progress` (25/50/75/100), `audiobook_buy_click` | audiobook sample / purchase | title, chapter, pct | future player | future webhook |

**Funnels, all shown in the same admin screen:**
- **Book:** `page_view(/books/…)` → `buy_click` → `checkout_started` → `purchase_completed`, with `retailer_click` shown alongside as the off-site path.
- **Lead:** landing → `journal_downloaded` / `newsletter_subscribed` / `contact_submitted`.
- **Tool:** `tool_viewed` → `tool_started` → `tool_turn_reached(3)` → `export_cta_viewed` → `export_purchased`.

---

## 9. Recommendation — ONE living system

**Stack:** Vercel Web Analytics (cookieless page views for everyone, stopped on Reject or GPC) **+** the site's own first-party event store (`marketing_events` / `orders` / `marketing_visitors` in Supabase) **+** one screen (`/admin/analytics` with a "System status" card) **+** instant email alerts for sales and leads **+** a weekly digest email **+** a daily "tracking went dark" alarm.

Why this and not a bigger tool:
- **No new vendor, CSP host or cookie.** It is consistent with the banner and the privacy page (F7, F10).
- **It works on either Vercel plan.** Actions go to the first-party store, so Pro-only custom events aren't needed. On Hobby the 50k-events/month quota covers page views, and the weekly snapshot table preserves history beyond the 1-month window.
- **About 2 KB of JS instead of about 98 KB for PostHog** (F20).
- **Results are server-confirmed.** Money and leads are counted from verified webhooks and database inserts, not from browser beacons that ad blockers kill.
- **Heatmaps and recordings need volume.** At today's traffic, which is unmeasured and probably very low, they would show a handful of sessions. **Revisit PostHog** (cookieless `on_reject`, heatmaps on, replay **off** on the three tool pages and masking all text elsewhere, proxied under `/ingest`) once WA shows about **1,000+ visitors/month** for 4 weeks.
- **Clarity is rejected** because of its advertising-related cookies and the EEA consent enforcement since 2025-10-31. **Plausible and Umami are rejected** because they duplicate WA and add a vendor.

---

## 10. Implementation plan (PRs, in order)

**ana-1 — Merge PR #57, then switch Web Analytics on** (owner; S)
Steps:
1. Maya reviews and merges #57 (green, clean, 0 behind as of 18:39Z).
2. Vercel → project `mayaallan` → Analytics → **Enable**.
3. Live check: `count_pageviews` for the project must return a number instead of `web_analytics_not_enabled`. A real browser visit must show a request to the insights endpoint.

Cost: $0 on Hobby within 50k events/month. On Pro, $0.03 per 1k events.

**ana-2 — PR "every-action capture"** (code-pr; M)
- `src/lib/track.ts`: one client `trackAction(name, props)` that uses `navigator.sendBeacon('/api/marketing/event')` and falls back to `fetch(keepalive)`, and skips everything when consent is rejected or GPC is on.
- `<ActionCapture/>` mounted once in `layout.tsx`: one delegated `click` listener. `a[href^=http]` that isn't the site's own host → `retailer_click` (host map) or `outbound_click`. `[data-track]` → `cta_click` / `nav_click` / `share_click` / `buy_click`.
- Add the new names to `ALLOWED_EVENT_NAMES` and to the zod enum.
- Mirror `src/lib/analytics.ts` tool events to the first-party endpoint.
- `not-found.tsx` → `not_found_view`; `client_error` listener capped at 5 per page.
- Server: `journal_downloaded` (journal route), `download_started` (download route), `export_purchased` (export webhook), `checkout_cancelled` (return route).
- Consent: the cookieless `<Analytics/>` renders unless choice = `rejected` or GPC is on. The banner records `consent_decided` with no ID.
- Tests: contract test that every `data-track` id used in `src/` is allowlisted; property sanitizer test that tool events cannot carry text; size budget below 3 KB for the capture code.

**ana-3 — PR "instant sale and lead alerts"** (code-pr; S)
- `src/lib/notify-operator.ts` sends via Resend with the existing `resolveOperatorRecipient`. Subject formats: `[mayaallan] SALE $9.99 — Psilocybin Integration Guide (utm_source=…)` and `[mayaallan] LEAD — newsletter|contact`.
- Deduplicate by order id / event id with Upstash `SET NX` (same pattern as `alertAdmin`).
- Call it after successful fulfillment in the PayPal webhook and in the export webhook. Move the existing contact and newsletter notices onto it so all alerts have one format.
- Optional `OPERATOR_PUSH_URL` env (for example an ntfy topic) so a phone push goes out alongside the email.
- Test: webhook contract test asserts exactly one notify per order id.

**ana-4 — PR "weekly digest + tracking-dark alarm"** (code-pr + owner env; M)
- `vercel.json` gets two crons: `/api/cron/weekly-digest` at `0 13 * * 1` and `/api/cron/tracking-heartbeat` at `0 12 * * *`. Both fit the Hobby limits (once/day, ±59 min, 100 per project; docs updated 2026-07-15). Both are guarded by `CRON_SECRET`.
- The digest pulls:
  - WA `visits/aggregate` by day / route / referrerHostname / utmSource / country, using a read-only `VERCEL_ANALYTICS_TOKEN` (owner creates it);
  - `marketing_events` counts per event and the three funnels;
  - revenue from `orders`;
  - leads;
  - top retailers clicked;
  - 404s and client errors;
  - the number of alerts sent.
  It writes one row to a new `site_metrics_weekly` table (keeps history past Hobby's 1-month window) and emails the digest.
- Heartbeat alarms, each through `alertAdmin`:
  - (a) WA API returns `web_analytics_not_enabled`;
  - (b) WA page views in 24 h > 0 but first-party events = 0 ("event pipeline dark");
  - (c) WA page views in 24 h = 0 ("page-view tracking dark or zero traffic");
  - (d) `checkout_started` > 0 for 7 days with 0 `purchase_completed`, reported as a funnel alert, not an error.
- `/admin/analytics` gets a "System status" card with the same checks, so there is one screen.

**ana-5 — PR "privacy copy + CSP tidy"** (code-pr + content; S)
- Name Vercel Web Analytics and the event categories.
- Add a GPC statement and explain that "Reject" also stops the cookieless count.
- Bump "Last updated".
- Remove the unused `vitals.vercel-insights.com` / `va.vercel-scripts.com` from CSP after a Preview check shows no blocked requests.
- This can be folded into ana-2.

**ana-6 — Health-check cadence** (github-actions; S)
- GitHub ran the 15-minute schedule only every 2–6 hours (F18).
- Either add an external uptime monitor on `/api/health` (owner account) or accept the soft SLA and rely on the ana-4 daily heartbeat. Don't add more GitHub cron.

**ana-7 — Later: PostHog heatmaps** (code-pr; M; gated)
- Start only when WA shows ≥1,000 visitors/month for 4 weeks.
- Configuration: cookieless `on_reject`, proxied `/ingest`, autocapture + heatmaps, replay disabled on the 3 tool pages and `/contact`, `maskTextSelector: '*'` elsewhere.
- Needs a privacy page update and must stay inside the 1M free events.

---

## 11. Not done / open

**Not done in this run:**
- No code was changed and no PRs were opened. PR #57 is still **open, not merged**, and WA is still **disabled** (as of 18:39Z).
- No real-browser check was run: the banner behaviour and the network calls are inferred from shipped JS, not observed in a browser.

**UNVERIFIED:**
- the Vercel plan tier (not exposed by `get_team`);
- the row counts in Supabase `marketing_events` / `orders` / `marketing_visitors` (not an allowed source);
- whether `/_vercel/insights/*` quietly drops events while WA is disabled (the script serves 200);
- whether the export webhook writes `orders`;
- Umami pricing;
- Clarity script size and CSP hosts;
- EDPB 2/2023 wording on JS beacons;
- current US session-replay "wiretap" litigation status.

**Open questions for Maya:**
1. Is the Vercel team on Hobby or Pro?
2. Should the cookieless page-view count also stop for visitors who click "Reject"? (Recommended: yes, and for GPC too.)
3. Should the free journal offer an **optional** "email me the PDF + follow-ups" box? That would turn the best free asset into leads. It's a growth decision outside this lens.
4. Alerts by email only, or also as a phone push?

---

## 12. Sources (URL, date shown on page, read 2026-09-24 UTC)

- GitHub API `mallan67/mayaallan`: repo, `main` ed7461a, PR #57 (`/pulls/57`, `/files`, `/reviews`, `/comments`, check-runs), PR #58, workflows, health-check runs, code search. Read 18:36Z–18:49Z.
- https://www.mayaallan.com/ (+ /privacy, /books/psilocybin-integration-guide, the tool pages, /integration-journal, /contact, /media, /events, /blog, /scenarios, /faq, /es, /sitemap.xml, /robots.txt, /api/health, /_vercel/insights/script.js). Read 18:36Z–18:46Z.
- Vercel API: `count_pageviews`, `count_events`, `get_project`, `list_deployments` (project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y). Read 18:36Z–18:41Z.
- Vercel WA pricing — https://vercel.com/docs/analytics/limits-and-pricing (last_updated 2026-08-25)
- Vercel WA privacy — https://vercel.com/docs/analytics/privacy-policy (2026-06-26)
- Vercel custom events — https://vercel.com/docs/analytics/custom-events (2026-06-26)
- Vercel WA API — https://vercel.com/docs/analytics/web-analytics-api (2026-06-26)
- Vercel Drains — https://vercel.com/docs/drains (2026-09-01): Web Analytics drain on Pro/Enterprise, $0.50/GB
- Vercel Cron limits — https://vercel.com/docs/cron-jobs/usage-and-pricing (2026-07-15)
- PostHog pricing — https://posthog.com/pricing (no date shown)
- PostHog product analytics pricing — https://posthog.com/docs/product-analytics/pricing (no date)
- PostHog replay pricing — https://posthog.com/docs/session-replay/pricing (no date)
- PostHog heatmaps — https://posthog.com/docs/toolbar/heatmaps (no date)
- PostHog cookieless — https://posthog.com/docs/product-analytics/cookieless-tracking (2025-08-27)
- PostHog replay privacy — https://posthog.com/docs/session-replay/privacy (no date)
- PostHog Next.js proxy — https://posthog.com/docs/advanced/proxy/nextjs (no date)
- posthog-js 1.434.12 via https://data.jsdelivr.com/v1/packages/npm/posthog-js/resolved
- Microsoft Clarity consent mode — https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode (updated 2025-12-05)
- Microsoft Clarity FAQ — https://learn.microsoft.com/en-us/clarity/faq (updated 2026-09-21)
- Plausible — https://plausible.io/ (pricing section, no date)
- Umami — https://umami.is/pricing (no content returned; UNVERIFIED)
- CNIL Sheet 16 — https://www.cnil.fr/en/sheet-ndeg16-use-analytics-your-websites-and-applications (2020-06-11)
- EDPB Guidelines 2/2023 — https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en (final 2024-10-16)
- California AG CCPA — https://oag.ca.gov/privacy/ccpa (updated 2026-08-28)
- Washington AG MHMDA — https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy (no date shown)