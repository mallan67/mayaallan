# Audit evidence — WHO LOOKS, WHO CLICKS WHERE (live visitor data) — 2026-09-24

| Field | Value |
|---|---|
| Lens | Who looks, who clicks where — what visitor data exists LIVE (finding ids `ana-`) |
| Site | https://www.mayaallan.com (mayaallan.com, psilowire.com, psilocybinintegrationguide.com all answer `308 → https://www.mayaallan.com/`, read 2026-09-24T18:35:13Z) |
| Vercel | project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`, team `team_kZQh5NYLyrOKqffK0r9EXf4E`, production deployment `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` (`source: redeploy` of main `ed7461a` "#56", created 2026-09-08T07:57:14Z) |
| UTC read window | 2026-09-24T18:18:42Z → 2026-09-24T18:35:13Z (all reads); saved to GitHub after 18:40Z |
| Live sources used | Vercel MCP: `count_pageviews`, `count_events`, `aggregate_pageviews`, `aggregate_events`, `get_project`, `get_deployment`, `get_runtime_logs`, `get_runtime_errors`, `get_observability_schema`, `create_observability_query`, `get_firewall_config`, `list_drains` (all with the project id + team id above). HTTP GET to www.mayaallan.com pages, response headers, and the `/_next/static/chunks/*.js` files those pages load (piped into memory, never saved). GitHub REST via `gh api` (PR #57 metadata + file names only, commit statuses, check-runs, deployments, Actions workflow runs). |
| Not used | repository source files, any local file/scratch dir, Playwright, logins, any POST to the site, `/api/cron/*`, `/api/admin/*`, `/api/indexnow/*` |
| Contamination warning | The audit itself (this lens and sibling lenses) sent heavy traffic from about **2026-09-24T17:30Z** (2,107 status-coded log entries in 17:30–18:00Z alone vs 75 in the 5.5 h before). All "baseline" numbers below stop at 17:30Z. |

---

## 0. The four questions — answer, source, missing piece, fix

| Question | Answer | Live source + UTC | Exact missing piece | Fix |
|---|---|---|---|---|
| (a) How many people visit? | **NO — nobody can know today.** | `count_pageviews` 2026-06-26→2026-09-24T18:18Z → `400 web_analytics_not_enabled` (read ≈18:19Z, repeated 18:33Z for 2026-09-17→18:30Z) | 1) Vercel Web Analytics is switched **off** for the project; 2) the live code loads the analytics script **only after the visitor clicks "Accept all"**; 3) runtime logs keep ≈24 h and count server requests, not people. | Owner: turn on Web Analytics in Vercel (Project → Analytics → Enable). Code: merge PR #57 (cookieless page views for everyone). |
| (b) From where (referrer, country, device, campaign)? | **NO.** | same Web Analytics error; runtime-log MCP exposes no referrer / user-agent / country (18:19–18:33Z); observability query API → `404 Observability Data not found` (3 calls, 18:20–18:21Z) | referrer + UTM are captured only by the first-party `POST /api/marketing/visitor` beacon, which fires **only after consent**; zero such calls in the 23 h baseline. | Same as (a). After that, Web Analytics reports referrer, country, device, browser, UTM. |
| (c) Which pages? | **PARTIAL — server requests per path, last ≈24 h only, crawler-dominated.** | `get_runtime_logs group_by=requestPath` 2026-09-23T19:00Z→2026-09-24T17:00Z (table §4.3) | No per-visitor page views; nothing older than ≈2026-09-23T18:20Z (`ExceedsBillingLimitError`). | Web Analytics on + PR #57 → page views by path for 90 days+. |
| (d) What do they click? | **NO.** | live JS chunks (§3.3): no click tracking on Buy, retailer, outbound, newsletter or navigation links. Only AI-tool events (consent-dependent, and dropped because Analytics is off) and one server event `book_viewed` (a view, not a click). | click events do not exist in the live code. | Code PR: add `track()` events on Buy/retailer/outbound/subscribe links, after Web Analytics is enabled (see ana-03). |

**Human-signal result for the only observable window (2026-09-23T18:00Z → 2026-09-24T17:30Z, ≈23 h):** zero `POST /api/marketing/event` (the `book_viewed` event fires for **every** JavaScript browser that opens the book page, no consent needed), zero `/api/chat` (AI tools), zero `POST /api/marketing/visitor`. The book page was requested 8 times in that window, and none of those requests ran the page’s JavaScript. So in that window **no real browser session opened the book page, and no one used an AI tool.** (Positive control: these endpoints *are* logged — `POST /api/marketing/visitor 200` at 2026-09-24T18:19:45Z and 2× `/api/marketing/event` during the audit window.)

---

## 1. Vercel Web Analytics (project-scoped query API)

| # | Tool call | Params | Result | UTC |
|---|---|---|---|---|
| 1 | `count_pageviews` | since 2026-06-26T00:00Z, until 2026-09-24T18:18Z (90 d) | `400 {"code":"web_analytics_not_enabled","message":"Web Analytics is not enabled for this project"}` | ≈18:19Z |
| 2 | `count_events` | same 90 d | `400 web_analytics_not_enabled` | ≈18:19Z |
| 3 | `aggregate_pageviews by=[day]` | 90 d | `400 invalid_group_by` ("Can only query up to 62 days") | ≈18:19Z |
| 4 | `aggregate_pageviews by=[week]` | 90 d | `400 web_analytics_not_enabled` | ≈18:19Z |
| 5 | `aggregate_pageviews by=[day]` | 2026-08-01 → 2026-09-24T18:18Z | `400 web_analytics_not_enabled` | ≈18:19Z |
| 6 | `count_pageviews` (repeat) | 2026-09-17 → 2026-09-24T18:30Z | `400 web_analytics_not_enabled` | ≈18:33Z |
| 7 | `aggregate_events by=[eventName]` | 2026-07-26 → 2026-09-24T18:30Z | `400 web_analytics_not_enabled` | ≈18:33Z |

Three independent calls at two different times give the same result, which confirms it. No page views, top paths, referrers, countries, devices, UTM or events can be read, because **Vercel has recorded none**. The API counts only "since Web Analytics was enabled", and it has never been enabled.

## 2. Project settings (`get_project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`)

| Field | Live value | UTC |
|---|---|---|
| name / framework / node | mayaallan / nextjs / 24.x | ≈18:19Z (first call `ECONNRESET`, retry OK) |
| createdAt / updatedAt | 2025-12-25T10:37:10Z / 2026-09-08T07:58:17Z | ≈18:19Z |
| latestDeployment | `dpl_FJq5ArwCSWfjcu7ZNeRQ2zMg1UwC`, target null (preview), 2026-09-24T18:16:18Z (the work/site-visibility branch) | ≈18:19Z |
| ssoProtection | enabled, `all_except_custom_domains` (preview URLs need Vercel login; custom domains public) | ≈18:19Z |
| passwordProtection / trustedIps | disabled / disabled | ≈18:19Z |
| webAnalytics / speedInsights fields | **not returned by the MCP `get_project` response** → toggle state is read indirectly from rows 1–7 above (Analytics = off). Speed Insights toggle = UNVERIFIED. | ≈18:19Z |
| Firewall config | `get_firewall_config configVersion=active` → `404 Seawall Config not found` (no custom firewall rules) | ≈18:30Z |
| Log drains | `list_drains projectId=…` → `404 Not Found` | ≈18:21Z |
| Observability Plus queries | `get_observability_schema` → 404; `create_observability_query` metric `vercel.request.count` groupBy botCategory → 404; metric `edge_requests` → 404 ("Observability Data not found") | 18:20–18:21Z |

## 3. Trackers on the LIVE site

### 3.1 HTML of 12 key pages (GET, UA `mayaallan-audit/1.0`, 2026-09-24T18:24:19Z → 18:25:07Z)

Searched for: `va.vercel-scripts.com`, `/_vercel/insights`, `/_vercel/speed-insights`, `vitals.vercel-insights.com`, `@vercel/analytics`, `gtag`, `googletagmanager`, `google-analytics`, `clarity.ms`, `plausible`, `posthog`, `umami`, `fbq`, `facebook.net`, `/api/marketing/visitor`, `consent`, `cookie`.

| Page | Status | Bytes | Chunks | Tracker hits in HTML |
|---|---|---|---|---|
| / | 200 | 90,273 | 13 | none |
| /about | 200 | 48,263 | 13 | none |
| /books | 200 | 44,939 | 13 | none |
| /books/psilocybin-integration-guide | 200 | 95,452 | 13 | none |
| /blog | 200 | 38,272 | 12 | none |
| /blog/psilocybin-integration-research | 200 | 89,135 | 12 | none |
| /contact | 200 | 32,236 | 13 | none |
| /privacy | 200 | 52,619 | 12 | `consent`×6, `cookie`×8 (policy text only) |
| /events | 200 | 41,319 | 13 | none |
| /media | 200 | 56,904 | 13 | none |
| /faq | 200 | 140,287 | 12 | none |
| /integration-reflection | 200 | 38,521 | 14 | none |

The server-rendered HTML contains no analytics tag. Everything is injected by client JavaScript (next section).

### 3.2 JS chunks those pages load (20 unique, 1,180,767 bytes; GET 18:25:18Z → 18:26:57Z; re-scan 18:28:03Z → 18:28:14Z; API scan 18:31:55Z → 18:32:16Z)

| Chunk | Relevant hits |
|---|---|
| `312c5210c9c35dc5.js` (loaded on every page) | `@vercel/analytics` SDK 2.0.1, `va.vercel-scripts.com`, `/_vercel/insights`, consent code, `/api/marketing/visitor`, `document.cookie`, `localStorage` |
| `9a7cf34cbe809fe3.js` (only on /integration-reflection, /belief-inquiry, /nervous-system-reset; checked on 18 pages 18:28:27Z–18:28:38Z) | `track()` from `@vercel/analytics`; event names in §3.3; `/api/chat`, `/api/export` |
| `fc986f8dd4b371e4.js` (only on /books/psilocybin-integration-guide) | `POST /api/marketing/event` with `eventName:"book_viewed"`; **0 consent references** |
| `bc55967f7a3249cb.js` | `/api/subscribe` |
| `001ea6f2792f6797.js` | `/api/contact` |
| `93b33527075b290f.js`, `a3a5de630bb5e7f8.js`, `c97ba6bd6836d1ee.js` | `/api/chat` |
| all 20 chunks | **0 hits** for gtag, googletagmanager, google-analytics, clarity.ms, plausible, posthog, umami, fbq, `@vercel/speed-insights`, `/_vercel/speed-insights` |

### 3.3 What the served JavaScript does (behaviour read from live chunk `312c5210c9c35dc5.js`, 18:27:04Z–18:27:28Z)

| Behaviour | Live evidence (minified code excerpt) |
|---|---|
| Consent stored in `localStorage["mayaallan_consent_v1"]` = `accepted` / `rejected` / absent | `let r="mayaallan_consent_v1",o="mayaallan:consent-changed"` |
| Banner appears client-side only, after mount, while no choice is stored. Text: "We use a small set of first-party cookies to measure how the site is performing — anonymous visitor IDs and UTM-based campaign attribution…"; buttons "Reject analytics" / "Accept all" | `r&&null===e ? … role:"dialog" …` |
| **Vercel Analytics component mounts only if consent === "accepted"** | `function P(){return"accepted"!==(0,S.useConsent)()?null:(0,t.jsx)(f,{})}` exported as `GatedAnalytics` |
| **First-party visitor beacon mounts only if consent === "accepted"** | `function k(){return"accepted"!==(0,S.useConsent)()?null:(0,t.jsx)(E,{})}` exported as `GatedMarketing` |
| After consent, beacon sets cookies `ma_visitor_id` (Max-Age 63072000 = 2 y), `ma_session_id` (1800 s), `ma_first_touch`, `ma_last_touch` (2 y; landing page, referrer ≤256 chars, utm_*), then `fetch("/api/marketing/visitor",{method:"POST",…,body:{visitorId, firstTouch}})` once per browser session | `let p="ma_visitor_id",m="ma_session_id",h="ma_first_touch",g="ma_last_touch"` |
| Vercel observability config baked into the build: analytics script `/9de18cd67c0a6252/script.js`, endpoints `…/view`, `…/event`, `…/session`; speed-insights `/87c4d7cd412437e3/script.js` + `…/vitals` | `configString … {"analytics":{"scriptSrc":"9de18cd67c0a6252/script.js",…},"speedInsights":{…}}` |
| Custom Vercel events exist **only for the three AI tools**: `tool_viewed`, `tool_started`, `turn_reached_<n>`, `session_completed`, `time_to_first_message`, `export_cta_viewed`, `export_cta_clicked`, `session_feedback`. They call `window.va(...)`, which exists only after the gated Analytics component loads → **no events without consent, and all are dropped while Web Analytics is off** | chunk `9a7cf34cbe809fe3.js`: `function vu(e){vs("tool_viewed",{tool:e})}` … `null==(n=window.va)||n.call(window,"event",…)` |
| **`book_viewed` server-side event is NOT consent-gated**: on /books/psilocybin-integration-guide it posts once per browser session (sessionStorage key `ma_book_viewed:<id>`) to `/api/marketing/event` | chunk `fc986f8dd4b371e4.js`: `fetch("/api/marketing/event",{method:"POST",…eventName:"book_viewed"…})` |
| **No click tracking** for Buy / PayPal / retailer / outbound / newsletter / nav links | no `track(` / `"event"` call sites outside the AI-tool chunk; the only `eventName` value in the whole bundle is `book_viewed` |
| No Speed Insights client | `@vercel/speed-insights` SDK absent from all 20 chunks (two scans) |

### 3.4 Analytics endpoints (GET, 2026-09-24T18:27:45Z → 18:27:49Z)

| URL | Status | Content-Type | Size |
|---|---|---|---|
| /_vercel/insights/script.js | 200 | application/javascript | ≈5 KB |
| /_vercel/speed-insights/script.js | 200 | application/javascript | ≈13 KB |
| /9de18cd67c0a6252/script.js (build-configured analytics path) | 200 | application/javascript | ≈5 KB |
| /87c4d7cd412437e3/script.js (build-configured speed-insights path) | 200 | application/javascript | ≈13 KB |

These scripts are served, but that does not mean data is collected. The collection endpoints (`/view`, `/vitals`) take POST and were not called (safety rule). The Web Analytics API (§1) shows nothing is recorded.

### 3.5 Live security headers on `/` (GET 2026-09-24T18:27:45Z)

| Header | Value (analytics-relevant part) | Effect |
|---|---|---|
| Content-Security-Policy | `script-src 'self' 'unsafe-inline' …paypal… https://va.vercel-scripts.com`; `connect-src 'self' https://*.supabase.co …paypal… https://vitals.vercel-insights.com` | First-party `/_vercel/*` and the build-configured paths are `'self'`, so **CSP does not block** analytics once it is on |
| Set-Cookie | **absent** on `/` | no cookie before consent (consistent with the gate) |
| Cache-Control | `private, no-cache, no-store, max-age=0, must-revalidate`; `X-Vercel-Cache: MISS` | every page view reaches a function, so runtime logs see every page request |
| Referrer-Policy | `strict-origin-when-cross-origin` | outbound sites see only the origin |

## 4. Request-level traffic (Vercel runtime logs) — server requests ≠ visitors

### 4.1 What the log source can and cannot give

| Observation | Tool call | UTC |
|---|---|---|
| Retention ≈24 h: querying 2026-09-17T00:00Z → 2026-09-23T12:00Z fails `ExceedsBillingLimitError`; 2026-09-23T12:00Z → 19:00Z returns only 2 entries | `get_runtime_logs` (production) | ≈18:21–18:22Z |
| Fields shown: time, method, path, status, source (edge-middleware / serverless / static), cache, deployment. **No user-agent, referrer, country or IP** | raw listings | 18:19Z–18:31Z |
| `group_by` supports only statusCode, requestPath, route, level, source, deploymentId, branch → **no bot/human split possible** | tool schema + calls | — |
| One page request can produce several entries (e.g. `GET /` logged by both edge-middleware and serverless at 2026-09-24T18:19:31Z) → entries ≥ requests | raw listing | 18:19:53Z |
| `get_runtime_errors` 7 d → "No runtime errors found" | | ≈18:21Z |

### 4.2 Baseline volume before the audit (status-coded entries, production; read ≈18:30–18:31Z)

| Window (UTC) | 200 | 404 | 304 | Total |
|---|---|---|---|---|
| 2026-09-23T18:00 → 09-24T00:00 (really ≈18:20 → 00:00, retention edge) | 235 | 4 | 0 | 239 |
| 2026-09-24T00:00 → 06:00 | 47 | 3 | 1 | 51 |
| 2026-09-24T06:00 → 12:00 | 60 | 3 | 0 | 63 |
| 2026-09-24T12:00 → 17:30 | 72 | 3 | 0 | 75 |
| **≈23 h baseline** | 414 | 13 | 1 | **428** |
| 2026-09-24T17:30 → 18:00 (audit running) | 2,029 | 76 | 2 | 2,107 |

At least 69 of the 239 entries on the evening of 09-23 are scripted sweeps visible in raw listings (48 at 23:32:37–42Z, 21 at 20:13–20:15Z; §4.6).

### 4.3 Baseline requests per path, 2026-09-23T19:00Z → 2026-09-24T17:00Z (22 h; 46 distinct paths, top 25; read ≈18:22Z)

| Path | Entries | | Path | Entries |
|---|---|---|---|---|
| / | 79 | | /blog | 10 |
| /robots.txt | 38 | | /faq | 8 |
| /nervous-system-reset | 21 | | /integration-journal | 8 |
| /integration-reflection | 19 | | /books/psilocybin-integration-guide | 8 |
| /belief-inquiry | 18 | | /glossary | 7 |
| /media | 17 | | /scenarios | 7 |
| /events | 16 | | /books/psilocybin-integration-guide/opengraph-image | 6 |
| /about | 15 | | /api/health | 6 |
| /books | 15 | | /refunds | 6 |
| /contact | 14 | | /sitemap.xml | 5 |
| /methods | 13 | | /scenarios/ego-dissolution | 5 |
| /terms | 13 | | /blog/psilocybin-integration-research | 4 |
| /privacy | 12 | | | |

Other paths in the 06:00→17:00 split (read ≈18:30Z): `/llms.txt` ×2 (AI-crawler file), `/opengraph-image` ×2 (link-preview scraper), `/xmlrpc.php` ×4, `/wp-login.php` ×1, `/pt`, `/legal`, `/practices`, `/blog/inherited-beliefs-grandmother-marriage`.

### 4.4 Baseline 404s (2026-09-23T18:00Z → 2026-09-24T17:00Z, read ≈18:30Z)

| Path | Count | Meaning |
|---|---|---|
| /xmlrpc.php | 4 | WordPress vulnerability scanner |
| /sftp-config.json, /.vscode/sftp.json | 2 + 2 | credential-file scanner |
| /wp-login.php | 1 | WordPress scanner |
| /.well-known/assetlinks.json, /.well-known/apple-app-site-association | 1 + 1 | app-link crawlers |
| /ads.txt | 1 | ad-network crawler |

### 4.5 Human-signal endpoints in the baseline (two or more independent queries each)

| Endpoint | Fires when | Baseline count | Queries (UTC read) |
|---|---|---|---|
| `POST /api/marketing/event` (`book_viewed`) | any JS browser opens the book page (no consent needed) | **0** | text query `/api/marketing/event` in 18:00→09:00 and 09:00→17:30 windows (≈18:33Z); grouped `/api/` query for 09-23T18:00→09-24T17:30 lists only `/api/health` (≈18:32Z) |
| `/api/chat` | a visitor sends a message in an AI tool | **0** | grouped query `/api/chat` 09-23T18:00→09-24T17:30 (≈18:33Z); grouped `/api/` query (≈18:32Z) |
| `POST /api/marketing/visitor` | a visitor clicked "Accept all" | **0** | text query in 5 windows 09-23T18:00→09-24T17:30 (≈18:22–18:23Z) + grouped `/api/` query |
| `/api/health` | scheduled GitHub "Health check" workflow | 6 | matches exactly the 6 live `schedule` runs: 2026-09-23T19:59:56Z, 22:54:01Z, 09-24T01:13:13Z, 06:12:58Z, 11:54:20Z, 16:44:18Z (`gh api …/actions/runs`, 18:29:26Z) |
| Positive control | — | `POST /api/marketing/visitor 200` at 2026-09-24T18:19:45Z; grouped `/api/` since 17:30Z shows `/api/marketing/visitor` 5, `/api/marketing/event` 2 | proves these endpoints are captured by the logs (the query method works) |

### 4.6 Automated traffic patterns in the baseline

| When (UTC) | Pattern | Read |
|---|---|---|
| 2026-09-23T20:13:34 → 20:13:41 and 20:15:16 → 20:15:18 | ~20 different pages in under 10 s | raw logs, ≈18:21Z |
| 2026-09-23T23:32:37 → 23:32:42 | repeated sweeps of the same 13–15 pages (/, /books, /about, /events, /media, /contact, /privacy, /terms, /methods, the three tools…) within 5 s | raw logs, ≈18:21Z |
| 2026-09-24T08:18:04, 08:21:58, 09:51:27 | `robots.txt` → `llms.txt` → `/` (crawler / AI-crawler signature) | raw logs, ≈18:31Z |
| whole window | `robots.txt` fetched 38× in 22 h | grouped |

These sweeps do not line up with any GitHub Actions run (list read 18:29:26Z). Their origin cannot be identified because no user-agent is exposed.

### 4.7 7-day grouped totals (contaminated by the audit; do not use as traffic)

`group_by=requestPath since=7d` (≈18:19:53Z): `/` 549, `/about` 286, `/books` 270 … `/robots.txt` 102; 130 distinct values; statusCode 200 = 5,204, 404 = 159. Most of this is the audit: `/` has 493 of its 549 entries from 17:00Z onward (read ≈18:22Z). Runtime logs until ≈2026-09-25T18:40Z will be contaminated the same way.

## 5. PR #57 (live metadata only; read 2026-09-24T18:28:49Z → 18:29:05Z)

| Item | Live value |
|---|---|
| Title | "feat(analytics): count every visitor, and show where they came from" |
| State | **open, not merged, not draft**, `mergeable: true`, `mergeable_state: clean`, base `main` (main head still `ed7461a`, 2026-09-06T15:23:14Z) |
| Opened / last updated | 2026-09-07T02:58:16Z / 2026-09-07T03:49:42Z (**17 days idle**) |
| Head | `feat/analytics-visibility-2026-09-07` @ `fa5d59b3eb5e4aa94623d08ef9a2a5e8f0eb0224`, 5 commits, +781 / −91, 14 files |
| CI | combined status `success` (Vercel); check-runs `gates` success, `on-success` success, `Vercel Preview Comments` success, `on-failure` skipped (all 2026-09-07T03:45Z) |
| Review | Codex bot 2026-09-07T03:49:40Z: "Didn’t find any major issues" on `fa5d59b3eb` |
| Preview deployment | `dpl_31rT3aihaj2kw1vkzqDkpV8ZVYCb` READY (built 2026-09-07T03:44:27Z→03:45:21Z; `get_deployment` ≈18:29Z), alias `mayaallan-git-feat-analytics-visibility-2026-09-07-mallan.vercel.app`, SSO-protected (not fetched) |
| Files | modified: `eslint.config.mjs`, `lint-baseline.json`, `package.json`, `src/app/admin/analytics/page.tsx`, `src/app/layout.tsx`, `src/app/privacy/page.tsx`, `src/components/AnalyticsGated.tsx`, `src/components/ConsentBanner.tsx`, `src/lib/analytics.ts`, `tests/scripts/lint-ratchet.test.mjs`; added: `src/lib/analytics-acquisition.ts`, `src/lib/consent.ts`, `tests/app/analytics-visibility.contract.test.mjs`, `tests/lib/analytics-acquisition.test.mjs` |

**What merging it would change (from the live PR description):** `GatedAnalytics` becomes `CookielessAnalytics`, mounted for every visitor, so page views, path, referrer, country, device and browser are counted without cookies. `GatedMarketing` (visitor/session cookies) stays consent-gated. Behavioural `track()` events stay consent-gated. `/admin/analytics` gets "Visitors / First-time / Came back later", "Where visitors come from" and "Landing pages" panels (from the first-party `marketing_visitors` table). The privacy page and banner text are updated. **Limit:** merging alone does nothing while the Vercel Web Analytics toggle is off. Both steps are needed.

## 6. Live /privacy page vs live behaviour (GET 2026-09-24T18:29:38Z–18:29:51Z)

| Privacy page says (live) | Live behaviour | Match? |
|---|---|---|
| "Last updated: May 20, 2026" | — | older than the current code |
| "Usage data. We log basic request information: a one-way hash of your IP address and user-agent…, the referrer URL, the landing page, and any UTM parameters" | referrer/landing/UTM are sent only by the consent-gated visitor beacon; any server-side part cannot be checked here | UNVERIFIED |
| "Visitor and session identifiers… in cookies" | yes: `ma_visitor_id`, `ma_session_id`, `ma_first_touch`, `ma_last_touch`, only after Accept | yes |
| "Analytics (optional, consent-gated)… If you are in the European Union, the United Kingdom, or any other jurisdiction where consent is required… set only after you accept" | the code gates **every visitor worldwide**, including the cookieless Vercel Analytics script | stricter than stated; wording inaccurate |
| Service providers: Vercel (hosting + Blob); "Supabase — … aggregated analytics events are stored" | Vercel Web Analytics is not named as an analytics processor; CSP allows `*.supabase.co` | incomplete |
| "Cookie preferences" footer link | present on the page | yes |
| Not mentioned | the `book_viewed` event posts without consent (no cookie; sessionStorage only) | gap to document |

## 7. Findings

| id | Severity | Finding | Evidence (live, UTC) | Solution (owner) |
|---|---|---|---|---|
| ana-01 | critical | Vercel Web Analytics is **disabled** for the project. No page view or event has ever been recorded, so visitor count, sources, pages and events are all unknowable. | §1 rows 1–7 (≈18:19Z and ≈18:33Z) | Vercel dashboard → mayaallan → Analytics → Enable (vercel-setting, owner), then confirm with `count_pageviews`. |
| ana-02 | critical | Even when enabled, the live code loads Vercel Analytics and the first-party visitor beacon **only after "Accept all"**. Undecided or rejecting visitors are invisible. | chunk `312c5210c9c35dc5.js` `GatedAnalytics` / `GatedMarketing` (18:27Z) | Merge PR #57 (code-pr, Maya) → cookieless page views for everyone; cookies stay gated. |
| ana-03 | high | **No click tracking** exists on the live site: nothing records Buy/PayPal, retailer, outbound, newsletter or navigation clicks. "Who clicks where" cannot be answered even after ana-01 and ana-02 are fixed. | §3.2–3.3; the only event names in the bundle are the AI-tool events + `book_viewed` (18:28–18:32Z) | Code PR: cookieless `track()` calls (no identifiers) on Buy/PayPal, retailer, outbound and subscribe actions. Whether custom events are included in the team’s Vercel plan is UNVERIFIED (§8). |
| ana-04 | high | Request history is **≈24 h only** (`ExceedsBillingLimitError` beyond). The runtime-log MCP exposes no user-agent, referrer or country. The observability query API returns 404, and there is no log drain. So the past month of traffic is gone and cannot be reconstructed. | §2, §4.1 (18:19–18:22Z) | Enable Web Analytics now (it counts from the switch-on date and cannot backfill). Optional: Observability Plus or a log drain (owner-account, cost). |
| ana-05 | high | In the only observable ≈23 h window, the site shows **no human-browser signal**: 0 `book_viewed` (not consent-gated), 0 AI-tool chats, 0 visitor beacons. The 428 log entries are crawlers, scanners, link-preview bots, scripted sweeps and the health check. | §4.2–4.6 (18:21–18:33Z) + positive control 18:19:45Z | Visibility work (search/AI indexing, sharing — other lenses), plus ana-01/02 so that future humans are counted. |
| ana-06 | medium | The Speed Insights client is **not in the bundle** (`@vercel/speed-insights` absent in 2 scans), so real-user Core Web Vitals are not measured. The project toggle state is unverified. | §3.2 (18:25–18:28Z) | Code PR: add `<SpeedInsights/>` (cookieless) + enable Speed Insights in Vercel (owner). |
| ana-07 | medium | The live privacy page (May 20, 2026) does not describe live behaviour. It limits consent to EU/UK-type visitors, but the code gates everyone. It does not name Vercel Web Analytics. It does not mention the `book_viewed` event. | §6 (18:29Z) | Content — PR #57 already rewrites this page; check the wording when merging. |
| ana-08 | medium | PR #57 has been ready for 17 days (clean, CI green, reviewer "no major issues", preview READY) but is **unmerged**. Production is a 2026-09-08 redeploy of main `ed7461a`. | §5 (18:28–18:29Z), `get_deployment` (≈18:29Z) | Maya reviews and merges #57, checks that the production deployment uses the merge commit, then re-runs the §1 calls to confirm page views arrive. |
| ana-09 | low | The scheduled GitHub "Health check" (6 runs/day) and scripted sweeps inflate server counts. Anyone reading Vercel "requests" as visitors will be misled. | §4.5–4.6 (18:29:26Z) | Report only Web Analytics numbers as "visitors"; exclude `/api/health`, robots and sitemap from request counts. |
| ana-10 | info | This audit (from ≈17:30Z) added more than 2,100 log entries in 30 min, so runtime-log views until ≈2026-09-25T18:40Z are polluted. | §4.2, §4.7 | Do not use the next 24 h of runtime logs as a traffic baseline. |

## 8. Unverified / needs outside-source check

| Item | Why unverified | Needed source |
|---|---|---|
| Vercel project `webAnalytics` / `speedInsights` fields | MCP `get_project` response omits them | Vercel dashboard (owner) |
| Speed Insights toggle state | no MCP query tool; a 200 on the script endpoint proves nothing | Vercel dashboard (owner) |
| Contents of first-party analytics tables (`marketing_visitors`, marketing events incl. `book_viewed`, orders) and `/admin/analytics` | requires admin login (forbidden) and database access (not in scope) | **needs outside-source check** — Maya opens `/admin/analytics` |
| Traffic before ≈2026-09-23T18:20Z | runtime-log retention (`ExceedsBillingLimitError`) | none recoverable from Vercel; Google Search Console / Bing Webmaster Tools (outside sources) can show search impressions and clicks for the month |
| User-agent / referrer / country of logged requests; origin of the 20:13Z and 23:32Z sweeps | not exposed by the runtime-log MCP; Observability API 404 | Vercel dashboard Logs/Observability (owner) |
| Whether Vercel custom events (`track`) are included in the team’s plan | team-level billing is out of scope | Vercel plan page (owner) |
| Behaviour of the PR #57 preview | SSO-protected preview; not fetched | Maya, logged in to Vercel |
| Whether the server logs hashed IP/UA/referrer for every request, as the privacy page says | server code and DB not readable here | owner DB/admin check |

**Not exercised:** real-browser rendering of the consent banner (Playwright is not part of this lens); any POST (`/view`, `/vitals`, `/api/marketing/*`); `/admin/*`; `/api/cron/*`; search-engine dashboards.

## 9. What works (live)

| Item | Evidence (UTC) |
|---|---|
| 12 key pages return 200 | §3.1 (18:24–18:25Z) |
| Alternate domains consolidate to www (308), so there is one traffic stream | 18:35:13Z |
| No third-party ad/tracking scripts (no GA/GTM/Clarity/Meta/PostHog/Plausible/Umami) | §3.1–3.2, two scans |
| No cookie is set before consent (no `Set-Cookie` on `/`) | §3.5 (18:27:45Z) |
| Consent banner + "Cookie preferences" re-open link are in the live code/page | §3.3, §6 |
| Analytics scripts are served first-party (200) and CSP allows them, so enabling needs no CSP change | §3.4–3.5 |
| API beacons are logged (positive control) | `POST /api/marketing/visitor 200` 2026-09-24T18:19:45Z |
| No runtime errors in 7 days | `get_runtime_errors` (≈18:21Z) |
| Health-check workflow runs green on schedule | Actions runs list (18:29:26Z) |

## 10. Fix order (smallest steps first)

1. **Vercel toggle (owner, 1 minute):** Project mayaallan → Analytics → Enable Web Analytics (and Speed Insights). Nothing is counted until this is done.
2. **Merge PR #57 (Maya):** cookieless page views for every visitor + acquisition panels + corrected privacy/banner text. Then verify: `count_pageviews` returns a number instead of `web_analytics_not_enabled`, and the production deployment’s commit equals the merge commit.
3. **Code PR (click tracking):** cookieless `track()` on Buy/PayPal, retailer, outbound, subscribe; add `<SpeedInsights/>`.
4. **Content:** the privacy page names Vercel Web Analytics and the `book_viewed` event, and states that the consent gate applies to all visitors (PR #57 covers most of this).
5. **Measure search reach separately:** Google Search Console + Bing Webmaster Tools (outside sources; covered by the "appears" lenses).