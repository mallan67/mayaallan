# every-action — adversarial senior review (2026-09-24)

Reviewed document: `docs/operations/monitoring/2026-09-24/01-every-visitor-every-action-analytics.md` on branch `work/site-visibility`, commit `96fa88ec7a355e5591932ccd09daf947861308ca` (blob `1e93c098a452efa2cd47f5d1fc5e76f8b8d0edb4`), read live from GitHub at 2026-09-24T18:58:32Z.
Reviewer: Claude (senior software engineer role), for Maya Allan.
Scope: website measurement only. **The audiobook is out of scope** (Maya, 2026-09-24: "the audio book is not finished, so please focus on the other stuff first"). No audio work is proposed. One live book-page copy problem that mentions the audiobook is flagged because it affects visitors today (M10).
Method: every claim below was re-read **live on 2026-09-24 between 18:58Z and 19:20Z** from the GitHub API (`mallan67/mayaallan`), HTTP GET to www.mayaallan.com, the Vercel API scoped to project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`, and vendor or regulator pages (dated below). No local files, no forms, no purchases, no admin/cron/IndexNow calls, no workflow dispatch. Not readable live = **UNVERIFIED**; deduced = **INFERRED**. Engineering review, not legal advice.

---

## 1. Verdict

1. **The diagnosis is right.** Web Analytics is still disabled (re-read ~19:00Z), undecided visitors are invisible, there is no sale alert, and retailer clicks and journal downloads are unmeasured.
2. **The first step is wrong as written: do not merge PR #57 as-is.** At head `fa5d59b` the banner button still says **"Reject analytics"** while Web Analytics keeps running after Reject; the new privacy text claims cookieless JS measurement "is not the kind of storage access that requires consent", which EDPB Guidelines 2/2023 ¶33 contradicts; and nothing redacts `/download/<token>` paths (bearer links to paid files) before Vercel WA records them. Three small amendments in the same PR fix all three (ana-1).
3. **The build plan (ana-2, ana-4) is overbuilt for one owner with near-zero traffic:** two new crons, a snapshot table, an in-app Vercel token the lens calls "read-only" (no such token type exists), a 24-hour "zero page views" alarm that will fire on quiet days, and clicks nobody will read (nav, menu, DOI links). Slim versions below keep Maya’s goal — one living system that reports results and flags failures — with about half the code.
4. **The lens missed business problems on the live book page:** 3 of 7 retailer URLs carry junk tracking parameters and the AbeBooks one carries **a third-party affiliate click-id**; the page shows an **"Audiobook $15.99" price card with no way to buy**; and **$9.99 PDF-export sales are stored nowhere durable** (invisible to the site’s own revenue view).
5. **Plan tier (INFERRED): almost certainly Pro, not Hobby.** Not exposed to project-scoped calls, but Vercel accepted **182 preview deployments in 52 minutes** today, above Hobby’s 100/hour and 100/day. If it were Hobby, the PayPal checkout would breach Vercel’s Hobby non-commercial rule (M1).

---

## 2. Fact re-checks (the 22 input facts)

| # | Lens fact (short) | Holds? | Live re-read (UTC, 2026-09-24) | Note |
|---|---|---|---|---|
| 1 | WA not enabled: `count_pageviews` / `count_events` → 400 `web_analytics_not_enabled` | **Yes** | Vercel API, range 2026-08-24→2026-09-24, ~19:00Z | Both still `web_analytics_not_enabled` (the endpoint also requires `until`). |
| 2 | Prod `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` READY 2026-09-08T07:57Z from main ed7461a; `/api/health` ed7461a, 7 checks ok | **Yes** | `list_deployments`/`get_deployment` ~18:59Z; GET /api/health 19:03:11Z | Health `mode: cheap`; database, resend, blob, paypal, session, admin, upstash ok. `main` still ed7461a (2026-09-06T15:23Z) at 19:00:56Z. |
| 3 | Homepage: 13 first-party chunks, 0 third-party trackers | **Yes** | GET / 19:03:05Z | 13 chunks; 0 tracker matches. Also 0 `google-site-verification` meta (M8). |
| 4 | Chunk `312c5210c9c35dc5.js`: `@vercel/analytics` sdkv 2.0.1; both gates need `"accepted"`; 2-year visitor + 30-min session cookie; POST `/api/marketing/visitor` | **Yes** | GET chunk 19:03:18Z | `"accepted"!==useConsent()?null:`; `63072e3` ×3; `1800`; `/api/marketing/visitor`; `globalPrivacyControl` 0 matches. |
| 5 | Banner for every undecided visitor, no geo check; text/buttons as quoted | **Yes** | same chunk; main `ConsentBanner.tsx` ~19:01Z | "Reject analytics", "Accept all", "No advertising trackers" present; no geo/country reference in the component. |
| 6 | CSP as quoted | **Yes (exact)** | response headers GET / 19:03:05Z | Also `Cache-Control: private, no-store`, `X-Vercel-Cache: MISS` on the homepage (M14). |
| 7 | /privacy "May 20, 2026"; identifiers consent-gated; no WA name; no GPC | **Yes** | GET /privacy 19:03:26Z–19:04Z | Also "Analytics events are retained for current product analysis" — **no retention period** (M7). |
| 8 | PR #57 open, head fa5d59b, 14 files +781/−91, clean, ahead 5 / behind 0, gates + Vercel green, Codex "Didn’t find any major issues" | **Yes** | `gh api` pulls/57, compare, check-runs, reviews 19:00:56Z / 19:10:38Z | Unchanged after 17 days. The automated review did not catch the consent and token issues (ana-1). |
| 9 | 11 allowlisted names; only BookViewTracker posts from the browser; 4 server events; `download_started` never fired | **Yes** | main@ed7461a `marketing-events.ts`; code search 19:12:38Z | Search `"/api/marketing/event"` → route + BookViewTracker only; `download_started` → `marketing-events.ts` only. The zod enum is **derived from** `ALLOWED_EVENT_NAMES`, so "extend the zod enum" is not a separate step. |
| 10 | Tool-funnel events only via Vercel `track()` → discarded today | **Yes** | main@ed7461a `src/lib/analytics.ts` | PR #57 routes them through `emit()` → `hasAnalyticsConsent()`; its comment promises the behavioural layer is "only sent for visitors who explicitly accepted". |
| 11 | PayPal webhook ~27 `alertAdmin` calls, all failures/anomalies; no sale alert; contact + subscribe email the operator | **Partly** — substance yes, count no | main@ed7461a webhook (1,320 lines) ~19:02Z | **23** `alertAdmin(` calls, not ~27; all failures, anomalies, refunds or disputes. Contact/subscribe use `resolveOperatorRecipient`. |
| 12 | Journal "No email required"; route records no marketing event | **Yes** | GET /integration-journal 19:04:23Z; route on main | Rate limit + same-origin check; no `trackMarketingEvent`. |
| 13 | Book page: PayPal $9.99, "8 retailer links" (7 names), IG share, Copy link, PayPal sign-out; no outbound tracking | **Partly** | GET book page 19:04:07Z and 19:12:38Z–19:12:56Z | **7 retailers, 9 links** (`a.co` ×3). Inventory missed **8 more share targets**: Facebook, X, LinkedIn, Reddit, Pinterest, WhatsApp, Telegram, TikTok. 0 `data-track`. |
| 14 | Health check `*/15` but runs 2h19m–5h42m apart | **Yes** | `gh api` health-check runs 19:02:35Z | **49 runs in 7 days vs 672 scheduled (~7%)**, all success. |
| 15 | Measured JS sizes | **Yes (exact)** | re-measured 19:10:47Z | posthog-js 1.434.12 `array.js` 313,792 / 98,204 gz9; insights 4,469 / 2,014; Plausible 2,841 / 1,279. |
| 16 | Vercel WA plans (Hobby 50k, no custom events, 1 month; Pro $0.03/1k, 2 props, 12 months; Plus +$10) | **Yes** | vercel.com/docs/analytics/limits-and-pricing (last_updated 2026-08-25) ~19:05Z | Addition: over the Hobby limit there is a 3-day grace, then collection stops (wait 7 days or upgrade). |
| 17 | WA: no third-party cookies; request hash discarded after 24 h | **Yes** | vercel.com/docs/analytics/privacy-policy (2026-06-26) | WA stores URL path and "Query Params (Filtered)", so secrets in paths reach it (ana-1). v2 "Resilient Intake" builds script/intake URLs from a build-time random seed (ana-5). |
| 18 | Vercel cron Hobby: 100/project, once per day, ±59 min | **Yes** | vercel.com/docs/cron-jobs/usage-and-pricing (2026-07-15) | More frequent expressions fail the deployment on Hobby. Pro: once per minute. |
| 19 | PostHog: 1M events + 5k recordings free, no card; $0.005/rec 5k–15k; replay 1 mo free / 3 mo paid; heatmaps free; cookieless `always`/`on_reject` (2025-08-27) | **Yes** | posthog.com/pricing, /docs/session-replay/pricing, /docs/toolbar/heatmaps, /docs/product-analytics/cookieless-tracking ~19:06–19:11Z | Clickmaps **require autocapture**. `on_reject` "will still be able to count those users with a privacy-preserving hash if consent is denied" (ana-7). |
| 20 | Clarity: EEA/UK/CH consent enforced since 2025-10-31; 100k sessions/project/day; 30-day recordings; third-party cookies "to support operational purposes like advertising" | **Yes** | learn.microsoft.com consent-mode (updated 2025-12-05); FAQ (updated 2026-09-21) 19:07:44Z | FAQ also: "You need to delete the entire project to delete user’s data" — cannot honour the privacy page’s per-person deletion promise. |
| 21 | Plausible $9/$14/$19 at 10k; props/funnels/revenue Business-only; 30-day trial; no cookies | **Yes** | plausible.io ~19:06Z | — |
| 22 | CA AG: GPC must be honoured; >$25M threshold. WA MHMDA: no size threshold, inferred health data, private right of action | **Yes, with nuance** | oag.ca.gov/privacy/ccpa (updated 2026-08-28); atg.wa.gov MHMDA page ~19:08Z | The MHMDA page gives small businesses a **later start date** (2024-06-30), not an exemption. Private action exists because a violation is a per se violation of the WA Consumer Protection Act. |

---

## 3. Recommendation verdicts

### ana-1 — Merge PR #57, then enable WA → **REJECT as written; amend #57 first**

Why:
- **Consent UI contradicts behaviour.** At head fa5d59b `ConsentBanner.tsx` still renders "Reject analytics" and its header comment still says "rejected → analytics + attribution stay off", but `CookielessAnalytics` renders `<Analytics />` unconditionally. A button labelled Reject analytics that does not stop analytics is a misleading consent UI.
- **The legal claim is wrong for EU visitors.** #57’s privacy text says the cookieless count "is not the kind of storage access that requires consent". EDPB Guidelines 2/2023 v2 (adopted 2024-10-16) ¶33: "JavaScript code, where the accessing entity instructs the browser of the user to send asynchronous requests with the targeted information. Such access clearly falls within the scope of Article 5(3) ePD". The site serves EU readers (/de, /fr, /es, /pt all 200 at 19:10:21Z; Waterstones UK and Bokus SE on the book page). Audience-measurement exemptions are national (the CNIL sheet the lens cites is French); the page should not assert a blanket no-consent rule.
- **Bearer tokens would leak into analytics.** `src/app/download/[token]/page.tsx` puts the buyer’s download token in the URL path; the repo has no `beforeSend` (code search: 0). With WA on, live download links for paid files land in the WA dashboard. First-party data has the same flaw: `MarketingAttributionClient` stores `url.pathname + url.search` as `landing_page` (tokens, and the PayPal `orderId` on /checkout/success), and #57 adds a "Landing pages" admin panel that would display them.

Correction (~1 hour, same PR):
1. `CookielessAnalytics` returns `null` when consent is `"rejected"` or `navigator.globalPrivacyControl === true`.
2. One `sanitizePath()` in `src/lib`: `/download/<anything>` → `/download/[token]`; drop query strings except `utm_*`. Use it in `<Analytics beforeSend>` and for `landing_page` in `MarketingAttributionClient`.
3. Privacy text: delete the "not the kind of storage access that requires consent" sentence; state that Reject and GPC stop the count; state a retention period (M7); keep naming Vercel Web Analytics.
4. Tests: Reject/GPC unmounts the counter; sanitizer handles a download token and an `orderId`.
5. Then Maya merges → Vercel → project → Analytics → **Enable** → live check: `count_pageviews` returns a number, and a `/download/...` visit never appears raw in WA.

Cost line: the relevant plan is almost certainly Pro (M1): $0.03 per 1k events (= $3 per 100k), drawn from the $20 monthly usage credit (vercel.com/pricing, read ~19:05Z).

### ana-2 — "every-action capture" → **REJECT as written; replace with a slim business-actions PR**

Why:
- **Consent contradictions.** `consent_decided` with choice=rejected fires exactly when a visitor refuses analytics, which breaks the lens’s own "skip on reject" rule. Mirroring tool-funnel events for **undecided** visitors breaks #57’s promise ("only sent for visitors who explicitly accepted"); these come from reflection tools about nervous-system states and beliefs — the inferred-health class MHMDA covers.
- **Dead-dashboard risk.** nav_click, menu_open, outbound DOI/PubMed clicks and a `client_error` beacon produce rows nobody reads at today’s traffic. `client_error` would also pollute a marketing table; `src/app/error.tsx` and `global-error.tsx` already exist, and server failures already email via `alertAdmin`.
- **Client events are not results.** `/api/marketing/event` has an origin check and a rate limit but no bot filter, and non-browser clients can send any Origin header. Treat client events as **intent signals** only.

Correction (S–M):
- **Client** (one delegated listener, `sendBeacon`, no IDs unless consent is accepted, skipped on Reject/GPC): `retailer_click` (host map for the 7 retailers), `buy_click` (PayPal button), `share_click` (method = instagram, copy, facebook, x, linkedin, reddit, pinterest, whatsapp, telegram, tiktok).
- **Server** (no browser beacon): `journal_downloaded` (phase + booleans only), `download_started` (download route), `export_purchased` (export webhook, with amount — also fixes M6), `not_found_view` (logged server-side from `not-found.tsx`, path sanitized).
- **Tool funnel: do not mirror.** On Pro (M1), #57’s consent-gated `track()` works. If an ungated count is wanted, keep a per-tool, per-day counter on the server in the chat route, with no visitor or session ID.
- **Drop:** nav_click, menu_open, outbound_click, client_error, consent_decided.
- **Add** a known-bot user-agent filter to `/api/marketing/event`.
- **Tests:** keep the contract test (every emitted name is allowlisted) and the sanitizer test; drop the size budget (~1 KB of code).

### ana-3 — Instant sale and lead alerts → **KEEP, simplified**

Why keep: a sale is the one event Maya must hear about at once; today 23 alerts cover failures and 0 cover success.

Correction (S) — no new helper, no new Upstash key, no rewrite of the contact/newsletter notices:
- **PayPal webhook:** after the delivery email succeeds inside the branch that won `claim_download_email_send`, call the existing `alertAdmin({ severity: "info", subject: "SALE $9.99 — <title> (utm_source=…)", dedupKey: "sale:<order id>" })`. The atomic claim already guarantees one worker per order, and `alertAdmin` already dedups through Upstash.
- **Export webhook:** same call after `renderAndEmailSessionPdf` succeeds, `dedupKey: "export-sale:<sessionId>"`.
- **Phone push:** not in v1; email reaches the phone. If added later, a public ntfy.sh topic is readable by anyone who knows its name, so send no buyer data.
- PayPal may already email the seller for each payment (**UNVERIFIED** this run); the site alert still adds attribution (UTM, landing page).

### ana-4 — Weekly digest + tracking-dark alarm → **REJECT as written; replace with one daily cron**

Why:
- **No read-only token exists.** The narrowest Vercel token is project-scoped and "can only read and write resources belonging to that one project" (vercel.com/docs/accounts/access-tokens, last_updated 2026-09-08). A read-write, deploy-capable token in the app runtime just to fetch a page-view count is a poor trade, and a token with an expiry is a scheduled failure that silently kills the digest.
- **Too many schedules.** Two new crons plus the existing Monday `aeo-track` cron = three schedules for one owner. One is enough.
- **Noise alarm.** "WA page views in 24 h = 0" will fire on ordinary quiet days at current traffic → ignored alarms → the dead system Maya asked to avoid.
- **Unneeded table.** `site_metrics_weekly` only exists to outlive Hobby’s 1-month WA window. The evidence says Pro (12 months, M1), and `marketing_events` / `orders` already keep history in Supabase.

Correction (S–M):
- **One cron** `/api/cron/daily-check` at `0 12 * * *` (valid on Hobby and Pro), guarded by `CRON_SECRET` like `aeo-track`.
- **Daily:** synthetic end-to-end probe (write a `heartbeat` row through the normal insert path, read it back, delete it); `alertAdmin` only on real failure (probe fails, Supabase or Resend down); "checkout started but no purchase after 24 h" is a digest line, not an alarm; purge analytics rows older than the stated retention (M7).
- **Mondays:** ONE digest email — last 7 days of server events (sales, export sales, leads, journal downloads, retailer/buy/share clicks, 404s), the latest AEO probe result that `aeo-track` already stores, the number of alerts sent, and a link to the Vercel Analytics tab for page views. Footer: "If this email does not arrive on a Monday, monitoring is broken." The digest is its own dead-man switch.
- **Page views inside the digest:** later and optional, only if Maya accepts a project-scoped token with an expiry plus an alert on 401/403.
- **Admin:** one "System status" card on `/admin/analytics` showing the last daily-check result. No new dashboard.

### ana-5 — Privacy copy + CSP tidy → **KEEP, folded into the #57 amendment**

Correction: #57 already names Vercel Web Analytics. What is still missing is the GPC statement, what Reject does, a retention period, and removal of the no-consent legal claim (ana-1). CSP tidy is safe but optional: WA v2 loads from same-origin randomized paths (Resilient Intake, Vercel WA privacy doc 2026-06-26); in the live chunk `va.vercel-scripts.com` appears once (the SDK dev path) and `vitals.vercel-insights.com` does not appear. Check a Preview for CSP violations before removing.

### ana-6 — Uptime → **KEEP, reworded: keep the existing GitHub probe, add no vendor**

Why: the repo is **public** (`gh api repos`, 19:00:56Z), and GitHub-hosted runners are "free … for public repositories that use standard GitHub-hosted runners" (GitHub Actions billing docs). The low run rate is documented: "The `schedule` event can be delayed during periods of high loads … some queued jobs may be dropped." Two risks the lens missed:
1. "In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days." The probe will stop quietly once Maya stops committing.
2. A failure opens a GitHub issue — a second alert channel whose email delivery depends on GitHub notification settings (**UNVERIFIED**).

Correction: the ana-4 daily check plus the Monday digest is the primary liveness signal; the GitHub probe stays as a free backup. Do not sign up for free external monitors: their free plans are framed for non-commercial use (UptimeRobot free: "Good for hobby and non-profit projects"; Better Stack: "Free for personal projects"; pricing pages ~19:08Z). Minute-level uptime means paying (UptimeRobot Solo $13/mo monthly), which current traffic does not justify.

### ana-7 — PostHog later → **KEEP as deferred, with corrections**

- `cookieless_mode: "on_reject"` keeps counting rejecting visitors, which breaks the "Reject stops counting" rule. If ever adopted, do not load PostHog at all on Reject/GPC.
- Clickmaps need autocapture, and autocapture on the three tool pages would record starter-prompt button text. Exclude the tool pages and /contact from PostHog **entirely**, not just from replay.
- It must replace part of the one system, not add to it: adopt only when the digest raises a concrete question that clicks cannot answer.

---

## 4. What the lens missed

**M1. Plan tier and Vercel’s Hobby commercial rule.** No allowed project-scoped call exposes the plan. But GitHub shows **182 Vercel Preview deployments between 18:17:18Z and 19:09:02Z** (`gh api` deployments, 19:09:40Z; sampled statuses "success"), all from docs commits to `work/site-visibility`, and Vercel lists them READY. Vercel’s limits page (last_updated 2026-09-16) caps Hobby at 100 deployments per hour and 100 per day. So the team is on Pro or a Pro trial (**INFERRED**). Consequences: Vercel custom events and the 12-month WA window are available (no snapshot table needed); and if it is a 14-day trial it will fall back to Hobby — Vercel’s Fair Use Guidelines (last_updated 2026-09-14) say "Hobby teams are restricted to non-commercial personal use only" and list "Any method of requesting or processing payment from visitors of the site" as commercial. **This site cannot run on Hobby.** Maya: confirm in Vercel → Settings → Billing (owner, 1 minute).

**M2. Every docs commit rebuilds the whole site.** 182 full Next.js preview builds in 52 minutes, triggered by markdown-only commits. On Pro this burns build capacity; on Hobby it would exhaust the 100/day deployment limit and block a production deploy (for example the #57 merge) until the window resets. Fix (owner, S): set the project **Ignored Build Step** in Vercel settings to exit 0 when only `docs/**` changed. `ignoreCommand` or `git.deploymentEnabled` in `vercel.json` (vercel.com/docs/project-configuration) also work, but `vercel.json` is read from the commit being built, so the project setting takes effect on all branches at once.

**M3. Bearer tokens and order ids in URLs** (see ana-1): `/download/[token]` in the path, `/checkout/success?orderId=…` in the query, both copied into `landing_page`. One shared sanitizer for WA, the attribution client and every new event.

**M4. The consent-copy and legal-claim defects in #57** (see ana-1). The Codex review passed them, so "green and clean" is not enough evidence to merge.

**M5. Dirty retailer links on the live book page** (19:04:07Z). AbeBooks carries Impact affiliate parameters (`clickid=…`, `cm_mmc=aff-_-ir-_-353196-_-77798`, `ref_=aff_ir_353196_77798`) that look copied from someone else’s affiliate link — they would credit that affiliate for Maya’s traffic (ownership **UNVERIFIED**). Barnes & Noble contains a `jsessionid`; Bokus a Google `srsltid` click-id; Bookshop.org `source=IndieBound&ref=https://www.google.com/`; Amazon is a bare `a.co` short link with no attribution. Fix (owner, S, no code): paste clean canonical URLs in `/admin/books/psilocybin-integration-guide/retailers`. Retailer-side attribution (a Bookshop.org affiliate ID, Amazon attribution tags for authors) is a growth decision; current terms not read this run (**UNVERIFIED**).

**M6. Export ($9.99 PDF) revenue is invisible.** `src/app/api/export/webhook/route.ts` (main@ed7461a) writes no `orders` row and no `marketing_events` row; the session is deleted after delivery and the Upstash TTL is 24 h. Export sales exist only in PayPal. The lens had this UNVERIFIED; it is now confirmed. Fix: the `export_purchased` server row in ana-2, with the amount.

**M7. No analytics retention period.** /privacy says only "Analytics events are retained for current product analysis". Pick one (13 months matches the CNIL sheet the lens cites), purge in the daily check, and state it on /privacy.

**M8. Google Search Console is not mentioned.** It is the free, cookieless, script-free source for "how do people find the book": Google Search clicks, impressions, CTR and average position (support.google.com/webmasters/answer/7576553). The homepage has no `google-site-verification` meta tag; DNS verification cannot be checked from the allowed sources, so whether a property exists is **UNVERIFIED**. Owner action (S): verify the property and submit `/sitemap.xml` (200). The Monday digest links to it.

**M9. Existing parts to reuse, not rebuild.** `/admin/aeo` plus the Monday `aeo-track` cron (AI-answer visibility) already exist — the digest should report their result. `alertAdmin` already supports `severity: "info"` and Upstash dedup. The health check already alerts via GitHub issues. The lens designed beside these parts instead of plugging into them.

**M10. The live book page offers an audiobook nobody can buy.** A format card shows "Audiobook $15.99", and the copy says "Paperback, hardcover and audiobook via retailers below", but there is no audiobook retailer link (19:12:38Z). This is a site-copy fix, not audiobook work: hide the card until release, or label it "Coming soon" with a notify-me form that feeds the existing newsletter (`location=audiobook`), which turns it into a lead source. Owner decision (S).

**M11. Share inventory is incomplete.** The page also links Facebook, X, LinkedIn, Reddit, Pinterest, WhatsApp, Telegram and TikTok; `share_click` must map them.

**M12. Client events are intent only.** The event endpoint accepts any caller that sends an allowed Origin header (rate-limited per IP) and has no bot filter. Never alarm on client-event counts alone; count results only from verified webhooks and database inserts.

**M13. Server logs do not last.** Runtime logs are kept 1 hour on Hobby and 1 day on Pro (Vercel limits page). A server error is only seen if it calls `alertAdmin`. The daily check should report "alerts sent in the last 24 h", and any new catch that matters must call `alertAdmin`.

**M14. Out of lens, reliability note.** The homepage is rendered per request (`Cache-Control: private, no-store`, `X-Vercel-Cache: MISS`), and the layout reads Supabase: a Supabase outage takes the homepage down, and every visit is a function call. Hand this to the performance/reliability lens.

**M15. This repo is public.** Monitoring docs describe alert logic, webhook guards and project IDs. Low risk, but keep exploit-level detail (endpoint weaknesses, bypass steps) out of `docs/` on this branch.

---

## 5. Revised plan — one living system, in order

| Step | What | Owner | Effort |
|---|---|---|---|
| 0 | Confirm the plan in Billing (M1); clean the retailer URLs (M5); hide or relabel the audiobook card (M10); set the Ignored Build Step for docs-only commits (M2); verify Search Console (M8) | Maya (dashboard/admin only) | S |
| 1 | Amend PR #57: Reject/GPC gate, `sanitizePath` + `beforeSend`, privacy wording + retention, tests. Merge, then **Enable** WA; live check | code-pr, then Maya | S |
| 2 | Sale alerts through the existing `alertAdmin` (PayPal + export) and a durable `export_purchased` row | code-pr | S |
| 3 | Slim action capture: `retailer_click`, `buy_click`, `share_click` (client); `journal_downloaded`, `download_started`, `not_found_view` (server); bot filter | code-pr | S–M |
| 4 | One daily-check cron: synthetic probe, retention purge, Monday digest email (server events + AEO + alert count + WA link); one status card | code-pr | S–M |
| — | PostHog: deferred (ana-7 conditions). External uptime vendor: not needed | — | — |

Result: one inbox (alerts + Monday digest), one admin screen (`/admin/analytics` with a status card), one data store (Supabase), plus Vercel WA for page views. No new vendor, cookie or CSP host.