# Audit evidence — LIVE errors, operations and the SEO cron (lens `ops-`)

| Field | Value |
|---|---|
| Lens | Live errors, operations and the weekly AEO/SEO cron |
| Site | https://www.mayaallan.com (Vercel project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`, team `team_kZQh5NYLyrOKqffK0r9EXf4E`) |
| UTC window of all reads | 2026-09-24T18:18:42Z → 2026-09-24T18:34:19Z |
| Live sources used | Vercel MCP (`get_runtime_errors`, `get_runtime_logs`, `get_observability_schema`, `create_observability_query`, `list_deployments`, `get_deployment`, `get_project`, `list_deployment_events`, `filter_project_envs`); Vercel REST API read via the logged-in Vercel CLI `vercel api` (same live API; used where the MCP wrapper failed or its output was too large to return inline); `curl` GET/HEAD against the project domains; GitHub live API via `gh api` (`mallan67/mayaallan` Actions runs, jobs, run logs, issues, PRs, deployments, GraphQL review threads) |
| Not used | No local files, no scratchpad, no Desktop checkout, no repository source files. Env **names only** (values never requested or printed). No POST to the site, no cron/admin/indexnow calls, no logins. |
| Saved by | Claude (sub-agent), assembled in memory from GitHub blobs and committed via the GitHub API to branch `work/site-visibility` |

> Caveat on log counts: Vercel runtime-log "counts" are **log entries**, not unique requests. One page view can produce a middleware entry and a function entry. Treat the numbers as relative, not as visitor counts.

> Caveat on the audit window: from about 2026-09-24T17:00Z several audit agents (this audit) were probing the site at the same time. Everything logged after 17:00Z is mostly audit traffic. The **organic baseline** used below is the 23-hour window **2026-09-23T18:00Z → 2026-09-24T17:00Z**.

---

## 0. Bottom line for this lens

1. **Nothing is crashing.** Zero runtime error clusters, zero 5xx, zero error/warning/fatal log lines (two independent queries each). Health endpoint 200, every dependency `ok`. Health monitor 95/95 green over 14 days.
2. **What fails is visibility, not uptime.** In the 23 hours before this audit, the site served about 391 successful log entries, mostly in a crawler-like pattern (38 entries for `/robots.txt`, 15-21 entries on every nav page). There were **zero** first-party visitor-beacon calls (`/api/marketing/*`), **zero** contact, subscribe or checkout calls, and zero real-user 404s. Every 404 in that window was a vulnerability scanner.
3. **Nobody can see who visits.** Vercel Web Analytics is **not enabled** (400). Observability Plus is **not enabled** (404, and queries return 402). Runtime logs are kept for about 24 hours. PR #57 (visitor counting) is green, `CLEAN` and mergeable, but has not been merged in 17 days.
4. **The weekly SEO/AEO cron can't be shown to run.** It is registered on production (`/api/cron/aeo-track`, `0 9 * * 1`), but no live source keeps a record of the Monday runs (09-21, 09-14, 09-07, 08-31). There is also **no `CRON_SECRET`** in any environment. Status: **UNPROVEN**.
5. **Nothing has shipped for 16+ days.** Production is still `ed7461a` from 2026-09-06, and `main` has not moved since then.

---

## 1. Runtime errors — get_runtime_errors

| # | Call (Vercel MCP) | UTC read | Result |
|---|---|---|---|
| 1.1 | `get_runtime_errors(projectId=prj_Ckws…, teamId=team_kZQh…, since="7d")` | 2026-09-24T18:18:55Z | "No runtime errors found in the selected time range." (0 clusters) |
| 1.2 | `get_runtime_errors(…, since="24h")` | 2026-09-24T18:26:50Z | "No runtime errors found in the selected time range." (0 clusters) |

The tool returned no clusters, so there are no names, counts, routes or first/last-seen times to list. We could not check independently whether this pre-aggregated table really covers 7 days, because raw logs are kept for only about 24h (section 2).

## 2. Runtime logs (retention about 24 h)

### 2.1 Retention proof
| Call | UTC read | Result |
|---|---|---|
| `get_runtime_logs(since=7d, group_by=statusCode)` | 18:18:55Z | 200=5143, 404=158, 304=3 (4 distinct values) |
| `get_runtime_logs(since=24h, group_by=statusCode)` | 18:19:45Z | 200=5200, 404=158, 304=3. The totals match the 7-day query, so only about 24 hours of logs are kept |
| `get_runtime_logs(since=7d, level=[error,warning,fatal])` | 18:19:28Z | Tool: "window likely exceeds your plan runtime-log retention (Pro 1 day)" |
| REST `/v13/deployments/dpl_5ug8…` | 18:24:23Z | `plan: "pro"`, so logs are kept for 1 day |

### 2.2 Status codes (whole retained window, all traffic incl. audit)
| Status | Entries | Source / UTC read |
|---|---|---|
| 200 | 5200 | `group_by=statusCode, since=24h` @ 18:19:45Z |
| 404 | 158 | same |
| 304 | 3 | same |
| 307 | 2 | `statusCode=3xx, group_by=statusCode, since=24h` @ 18:26:50Z (the hidden 4th value) |
| 5xx | **0** | `statusCode=5xx, group_by=requestPath, since=7d` @ 18:19:07Z (empty); `statusCode=5xx, group_by=statusCode, since=24h` @ 18:26:50Z (empty) |
| error/warning/fatal lines | **0** | `level=[error,warning,fatal], since=24h` @ 18:19:45Z. The `group_by=level, since=7d` query @ 18:19:07Z came back empty |

Entries by deployment (7d): 100% on `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` (5342), branch `main` (5287). By source (7d): function 5141, middleware 4986, cache 210, redirect 62, rewrite 18. Both read 18:19:28Z.

### 2.3 Organic baseline vs audit traffic (time-sliced)
| Window (UTC) | 200 | 404 | 304 | Notes | UTC read |
|---|---|---|---|---|---|
| 09-23 18:00 → 09-24 12:00 (18h) | 342 | 10 | 1 | no audit activity | 18:21:10Z |
| 09-24 12:00 → 17:00 (5h) | 49 | 2 | – | no audit activity | 18:21:50Z |
| **09-23 18:00 → 09-24 17:00 (23h, organic baseline)** | **391** | **12** | **1** | re-queried as one window | 18:33:30Z |
| 09-24 17:00 → 18:00 (1h) | 2052 | 77 | 2 | audit agents start | 18:21:50Z |
| 09-24 12:00 → now | 5062 | 149 | 2 | mostly audit traffic | 18:21:30Z |

**Top paths, organic 23h** (`statusCode=2xx, group_by=requestPath`, 39 distinct; 18:32:05Z): `/` 80 · `/robots.txt` 38 · `/nervous-system-reset` 21 · `/integration-reflection` 19 · `/belief-inquiry` 18 · `/media` 17 · `/events` 16 · `/about` 15 · `/books` 15 · `/contact` 15 · `/methods` 13 · `/terms` 13 · `/privacy` 12 · `/blog` 10 · `/faq` 8 · `/integration-journal` 8 · `/books/psilocybin-integration-guide` 8 · `/glossary` 7 · `/scenarios` 7 · `/api/health` 6 · `/books/psilocybin-integration-guide/opengraph-image` 6 · `/refunds` 6 · `/scenarios/ego-dissolution` 5 · `/blog/psilocybin-integration-research` 4 · `/sitemap.xml` 4.

What this pattern means: `/robots.txt` is the second most requested path, and every nav page (legal pages included) gets almost the same count. That looks like crawlers sweeping the navigation, not people reading. The runtime-log tool cannot group by user agent, so we can't say which bots these are. The 6 `opengraph-image` fetches of the book page are link-preview fetches, which usually happen when a link is shared somewhere.

**API calls, organic 23h** (two independent observations):
| Query | UTC read | Result |
|---|---|---|
| `deploymentId=dpl_5ug8…`, 09-23T18:00→09-24T17:00, `query="/api/"`, `group_by=requestPath` | 18:31:05Z | only `/api/health` = 6 |
| same window, `query="marketing"`, `group_by=requestPath` | 18:33:30Z | **empty**: zero `/api/marketing/visitor` or `/api/marketing/event` |

So in 23 hours: **0** visitor-beacon calls and **0** `/api/contact`, `/api/subscribe`, `/api/checkout/*`, `/api/chat` or `/api/tools/*` calls. For comparison, when audit browsers loaded pages at 17:00-18:00Z, the beacon did fire (`/api/marketing/visitor` 1, `/api/marketing/event` 1; 18:31:40Z). **The beacon works when a real browser loads the page.** It recorded no such visit in the organic window. Whether the beacon waits for cookie consent was not checked, because that would need source code.

The `/api/subscribe` (2), `/api/contact` (1), `/api/checkout/paypal` (1) and `/api/checkout/paypal/capture-order` (1) entries seen in the last 24h all fall **after 18:00Z today** (18:31:40Z). Status codes for `/api/` after 18:00Z: 200=21, 405=8 (18:32:20Z). These are audit agents sending GET probes to POST-only routes, which return 405. They are not real users.

### 2.4 4xx by path — real users vs scanners vs audit probes
**Organic 23h, all 404s** (`statusCode=404, group_by=requestPath`; 18:21:10Z and 18:21:50Z):
| Path | Entries | Class |
|---|---|---|
| `/sftp-config.json` | 2 | scanner (credential probe) |
| `/.vscode/sftp.json` | 2 | scanner (credential probe) |
| `/xmlrpc.php` | 2 (+2 at 12-17h) | scanner (WordPress) |
| `/wp-login.php` | 1 | scanner (WordPress) |
| `/.well-known/assetlinks.json`, `/.well-known/apple-app-site-association` | 1 + 1 | app-link bot probes |
| `/ads.txt` | 1 | ad-crawler probe |
| **Real-user broken links** | **0** | none observed |

**Audit-window 404s** (24h `statusCode=4xx, group_by=requestPath`, 73 distinct, 18:19:07Z; lines on `dpl_5ug8…` since 6h, 18:20:42Z). These came from this audit's own probes, not from users. Some of them do show real gaps on the live site. Those gaps belong to other lenses and are listed here only as pointers:
| Path(s) | Entries | Pointer |
|---|---|---|
| `/rss.xml` 7, `/blog/rss.xml` 7, `/feed.xml` 7, `/atom.xml` 6, `/blog/feed.xml` 4, `/feed` 4, `/rss` 3, `/blog/feed`, `/index.xml` | ~45 | No RSS/Atom feed at any common path, and the home page has no `rel="alternate"` RSS link (GET `/` 18:34:01Z) |
| `/BingSiteAuth.xml` 7, `/google-site-verification.html` 1 | 8 | No file-based Bing/Google verification. The home page has no `google-site-verification` or `msvalidate.01` meta (GET `/` 18:34:01Z). Verification may exist via DNS, which needs an outside check |
| `/manifest.webmanifest` 3, `/manifest.json` 3, `/site.webmanifest` 3 | 9 | No web manifest and no `rel="manifest"` link (GET `/` 18:34:01Z) |
| `/es/books` 5, `/es/blog` 3, `/es/zzz` | 9 | Localized subpages return 404 while `/es`, `/de`, `/pt`, `/fr/about` return 200 (i18n lens) |
| `/About` 3, `/index.html` 3 | 6 | Case/legacy URLs return 404 (low) |
| `/icon.png`, `/icon`, `/apple-icon` | ~4 | Icons are served from Vercel Blob instead (`rel="icon"` → `…public.blob.vercel-storage.com/uploads/…-icon.jpg`) |
| `/blog/psilocybin-integration-research/opengraph-image` | 1 | Blog post has no route-level OG image (SEO lens) |
| `/this-page-does-not-exist-*`, `/books/does-not-exist-xyz`, `/blog/does-not-exist-xyz`, `/glossary/zzz`, `/download/test-token` | ~20 | Deliberate 404 tests. They correctly return 404 |

## 3. Observability and the weekly AEO cron

### 3.1 Observability availability (2 or more independent observations each)
| Call | UTC read | Result |
|---|---|---|
| MCP `get_observability_schema()` | 18:18:55Z | 404 "Observability Data not found." (the tool takes no team parameter) |
| MCP `create_observability_query` `vercel.request.count`, scope `{type:project, ownerId, projectIds}`, 08-25→09-24, groupBy route+http_status | 18:21:54Z | 404 "Observability Data not found." |
| MCP `create_observability_query` `requests` / `vercel.function_invocation.count` | 18:22-18:23Z | 400 (scope schema) / 404 |
| REST `GET /v2/observability/schema?teamId=…` | 18:25:14Z | 200. Metric catalogue lists `vercel.request.count`, `vercel.function_invocation.*`, `vercel.schedule_operation.*`, `vercel.analytics_pageview.count` … |
| REST `POST /v2/observability/query` (the read-only query behind `create_observability_query`), `vercel.request.count` 30d by `http_status` | 18:26:00Z | **402** "Observability Plus is required to run this query for team mallan." |
| same, 24h ungrouped | 18:26:16Z | **402** |
| same, `vercel.function_invocation.count` 2026-09-21T08:00→10:00 by route (Monday cron window) | 18:26:16Z | **402** |
| REST `GET /v1/observability/manage/configuration/projects` | 18:26:42Z | 404 "Observability Plus is not enabled" |
| REST `GET /v1/query/web-analytics/visits/count?projectId=prj_Ckws…` 09-17→09-24 | 18:26:42Z | **400 "Web Analytics is not enabled for this project"** (the orchestrator saw `web_analytics_not_enabled` at 17:48Z, so this is a second observation) |

**Result:** we could not get requests by route or status, function errors or timeouts, or the slowest routes for any window longer than the ~24h runtime-log retention. The team plan has no Observability Plus and the project has no Web Analytics.

### 3.2 Cron registration (production)
| Fact | Evidence | UTC read |
|---|---|---|
| Cron registered: `{"path":"/api/cron/aeo-track","schedule":"0 9 * * 1"}` (Mondays 09:00 UTC) | REST `GET /v13/deployments/dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4`, field `crons` | 18:24:23Z |
| Function exists in the production build: `ƒ /api/cron/aeo-track` | Vercel build log of `dpl_5ug8…` (REST `/v3/deployments/…/events?builds=1`) | 18:30:20Z |
| `CRON_SECRET` **absent** from all targets | env **name** listing (45 entries), section 5 | 18:24:05Z |

### 3.3 Did it run on Monday 2026-09-21 / 09-14 / 09-07 / 08-31 at ~09:00 UTC?
| Source tried | Result |
|---|---|
| Runtime logs | Kept for about 24h only, so every Monday run is outside the window. A 7-day full-text query for `aeo-track` (18:19:45Z) timed out. The retained window has no `/api/cron/*` path (all `/api/` groupings in 2.3) |
| Observability query (function invocations by route, Monday 08:00-10:00) | 402, Observability Plus required |
| Vercel REST endpoint list (`vercel api list`, 18:24:36Z) | Has no cron-run history endpoint |
| GitHub (Actions, issues) | No workflow or issue records AEO cron runs (section 7) |
| Calling the endpoint | Not allowed (safety rule) |

**Conclusion: UNPROVEN.** No live source we are allowed to use shows any run of `/api/cron/aeo-track`, successful or failed. Two facts raise the risk:
- (a) `CRON_SECRET` is not set. On Vercel, the cron request carries `Authorization: Bearer <CRON_SECRET>` only when that variable exists. So a route that checks the header rejects every scheduled call, and a route that doesn't check it can be triggered by anyone.
- (b) The next run is **Mon 2026-09-28 09:00 UTC**. Runtime logs keep it only until about Tue 09:00 UTC, so any check has to happen in that window.

## 4. Deployments (30 days) — identity, failures, cadence

| Fact | Evidence | UTC read |
|---|---|---|
| Production = `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4`, `READY`, target production, region `iad1`, plan `pro`, source `redeploy`, created 2026-09-08T07:57:14Z, ready 07:58:16Z, git `ed7461a` (`main`, PR #56) | MCP `get_deployment` + REST `/v13/deployments` | 18:21:30Z / 18:24:23Z |
| All 9 domains aliased to it (`www.mayaallan.com`, `mayaallan.com`, `psilowire.com`, `www.psilowire.com`, `psilocybinintegrationguide.com`, `www.psilocybinintegrationguide.com`, `mayaallan.vercel.app`, `mayaallan-mallan.vercel.app`, `mayaallan-git-main-mallan.vercel.app`), `aliasError: null` | MCP `get_deployment` | 18:21:30Z |
| Live site reports the same build: `/api/health` → `"version":"ed7461a"` | GET, section 6 | 18:19:07Z, 18:34:03Z |
| 30-day deployments: **67** (production READY 15, preview READY 50, preview BUILDING 2). **ERROR = 0, CANCELED = 0** | REST `/v6/deployments?since=2026-08-31` (18:29:37Z); 08-25→08-31 slice has 0 deployments (18:29:53Z); MCP `list_deployments(state=ERROR,CANCELED)` count 0 (18:21:30Z) | – |
| No deployments at all from 2026-08-25 to 2026-09-05T10:02Z | same | 18:29:53Z |
| Production deployments cluster on **2026-09-05 → 09-06** (13 git-triggered). Then 2 dashboard **redeploys of the same `ed7461a`** on 2026-09-08 07:46Z and 07:57Z. **None since.** | REST `/v6/deployments` | 18:29:37Z |

| Production build: "41/41 checks passed, 0 failed", "Build Completed in /vercel/output [41s]". Warnings: pnpm "Ignored build scripts: bufferutil, sharp, unrs-resolver"; `engines.node ">=22.18.0"` auto-upgrade notice. Next.js 16.1.1 | REST `/v3/deployments/dpl_5ug8…/events?builds=1` (318 events) + MCP `list_deployment_events` | 18:24-18:30Z |
| ERROR/CANCELED build event summaries | none to summarize (0 such builds in 30 days) | 18:21:30Z |
| Project `ssoProtection: all_except_custom_domains`; latest deployment right now = preview `dpl_HnorCsxQNF4bEYR6g7GDsStPnKSZ` BUILDING from `work/site-visibility` (triggered by this audit's evidence commits) | MCP `get_project`, `list_deployments(state=BUILDING,…)` | 18:21:30Z / 18:23:00Z |

Domain behaviour (HEAD, 18:32:27Z): `mayaallan.com`, `psilowire.com`, `www.psilowire.com`, `psilocybinintegrationguide.com`, `www.psilocybinintegrationguide.com` and `mayaallan.vercel.app` → **308 → https://www.mayaallan.com/**. `www.mayaallan.com` → 200. `mayaallan-mallan.vercel.app` and `mayaallan-git-main-mallan.vercel.app` → 302 to Vercel SSO with `x-robots-tag: noindex`, so there is no duplicate-content leak. The book-named domain lands on the home page, not on `/books/psilocybin-integration-guide`.

## 5. Environment variable NAMES (never decrypted)

Source: REST `GET /v10/projects/prj_Ckws…/env?teamId=…` piped through a filter that printed only `key | target | type`, read 2026-09-24T18:24:05Z. MCP `filter_project_envs(decrypt=false)` (18:23:32Z) also returned, but at 81 KB it was too large to return inline, so it was not used. **45 entries.**

| Area | Present in Production | Absent (looked for) |
|---|---|---|
| Cron auth | – | **`CRON_SECRET` (absent in every target)** |
| AEO tracker | `AEO_ENGINES` | – |
| AI providers | `AI_GATEWAY_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `ELEVENLABS_API_KEY` | no `OPENAI_*`, `ANTHROPIC_*`, `PERPLEXITY_*`. Whether the cron needs them can't be told without source |
| Blob | `BLOB_READ_WRITE_TOKEN` | – |
| Email | `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID` (production only), `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`, `ADMIN_EMAIL` | – |
| PayPal | `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_ENV`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_EXPORT_WEBHOOK_ID` | – |
| Supabase / Postgres | `SUPABASE_URL`, `SUPABASE_*KEY*` (4), `SUPABASE_JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_*` (3), `POSTGRES_*` (7) | – |
| Upstash | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | – |
| IndexNow | `INDEXNOW_KEY`, `INDEXNOW_SUBMIT_SECRET` | – |
| Session/admin | `SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, **`ADMIN_PASSWORD`** (legacy plain-name variable still present) | – |
| Site | `NEXT_PUBLIC_SITE_URL`, `PROMO_CODES` | no analytics or search-verification names (`*GA*`, `*GTM*`, `*PLAUSIBLE*`, `*SITE_VERIFICATION*`, `*BING*`) |
| Leftovers | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, even though the live CSP allows only PayPal (section 6) | – |

## 6. /api/health (shallow, GET only)

| Read | UTC | Result |
|---|---|---|
| GET `https://www.mayaallan.com/api/health` | 2026-09-24T18:19:07Z | **HTTP 200** in 0.56s. Body: `status:"ok"`, `mode:"cheap"`, `checks: database ok (56 ms), resend ok, blob ok, paypal ok, session ok, admin ok, upstash ok`, `version:"ed7461a"`, `env:"production"`. `Cache-Control: no-store`, `X-Vercel-Cache: MISS`, region `iad1` |
| GET same, second observation | 2026-09-24T18:34:03Z | HTTP 200 in 1.21s. Same fields, all `ok`, database 566 ms, `version:"ed7461a"` |
| GET `https://mayaallan.com/api/health` | 18:19:08Z | 308 → www (expected) |

Response headers (18:18:55Z): HSTS `max-age=63072000; includeSubDomains; preload`, strict CSP (PayPal, Vercel Blob, Supabase, `va.vercel-scripts.com` script source, `vitals.vercel-insights.com` connect), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy strict-origin-when-cross-origin`, Permissions-Policy. The CSP allows the Vercel Analytics script host, but Web Analytics is **not enabled** on the project (section 3.1).

"cheap" mode only checks that each dependency is reachable. It does not check pages, sitemap, cron or search visibility.

## 7. GitHub live operations (mallan67/mayaallan)

| Item | Evidence (`gh api`) | UTC read | Result |
|---|---|---|---|
| Workflows | `/actions/workflows` | 18:27:37Z | Chapter 1 Independent Audio Analysis, Deploy notify, Export Chapter 1 Audio Review, Health check, Quality gates. All `active`. No workflow for SEO, AEO, indexing or cron |
| Health check, last 14 days (created on or after 2026-09-10) | `/actions/workflows/275861895/runs` | 18:27:45Z | **95 runs, 95 success, 0 failure**, all `schedule`. First 2026-09-10T03:42:49Z, last 2026-09-24T16:44:18Z (average interval about 3.7h) |
| Health check, all time | same, `status=failure` | 18:28:09Z | 2459 runs, 4 "failure": 2026-08-06T18:52Z and 17:23Z (both job **cancelled**), 2026-07-16T22:29Z (probe got **200**, the failing step was "Close incident issues on recovery"), 2026-05-26T12:20Z. So there has been no real outage since May |
| What Health check probes | run 36029439207 jobs and log | 18:28:00-18:28:18Z | One job `probe`: `curl -sS -m 30 "$HEALTH_URL"`, which fails only if the status is not 200. Monitoring covers **only** `/api/health` |
| Latest Quality gates on `main` | `/actions/workflows/351174519/runs?branch=main` | 18:28:29Z | 2026-09-06T15:23:17Z push, **success**, `ed7461a` (9 runs on main in total) |
| Open issues labelled `health-incident` / `outage` | `/issues?labels=…&state=all` | 18:28:43Z | **None open.** Only #14 "Health check failing (HTTP 503)", created 2026-05-21T01:20Z, closed 05:31Z. Label `outage` does not exist in the repo |
| Open issues of any kind | `/issues?state=open` | 18:28:43Z | 0 (the 2 counted as open are PRs) |
| `deploy-failure` issues | `/issues?labels=deploy-failure` | 18:28:55Z | #38 and #13, both closed on 2026-09-06 |
| Deploy notify failures | `/actions/workflows/275861894/runs?status=failure` | 18:28:29Z | 10 failures, **all on 2026-05-21**. None since. The latest runs (including today's `work/site-visibility` previews) succeeded |
| GitHub Production deployments | `/deployments?environment=Production` | 18:29:21Z | Latest 2026-09-06T15:24:25Z `ed7461a` |
| `main` HEAD | `/commits/main` | 18:29:21Z | `ed7461a`, committed 2026-09-06T15:23:14Z (PR #56). Last 8 merges: #49-#56, all 2026-09-05 → 09-06 |

### Open PRs (all)
| PR | Age (on 2026-09-24) | Draft | mergeable / state | Checks at head | Reviews / threads | UTC read |
|---|---|---|---|---|---|---|
| **#57** feat(analytics): count every visitor, and show where they came from, `feat/analytics-visibility-2026-09-07@fa5d59b` → main, 5 commits, 14 files, +781/-91 | **17 days** (created 2026-09-07T02:58:16Z, last update 03:49:42Z) | no | `mergeable=true`, `mergeable_state=clean`, GraphQL `mergeStateStatus=CLEAN`, `reviewDecision=null` | gates=success, on-success=success, on-failure=skipped, Vercel Preview Comments=success. Combined status `success` (Vercel=success) | 14 COMMENTED reviews (owner and Codex bot). **10 threads, 2 unresolved** Codex P2 notes (both 2026-09-07T03:38:47Z): "Preserve the arrival touch before delayed consent" (`src/app/admin/analytics/page.tsx`), "Refresh return activity within an existing browser tab" (`src/lib/analytics-acquisition.ts`) | 18:28:55Z / 18:29:12Z |
| #58 docs(ops): continuous handoff — site visibility, errors, traffic, `work/site-visibility` → main | 0 days (created 2026-09-24T18:16:34Z) | **yes** | `mergeable=null`, state `unknown` (still computing) | Vercel Preview Comments=success. Vercel status pending (preview building) | none | 18:28:55Z |

**Shipped-nothing risk:** #57 is green, conflict-free and has been unmerged for 17 days. It is the only open change that would make visitors countable.

---

## 8. Findings

| id | Severity | Title | Evidence (live source, UTC) | Impact | Solution | Owner |
|---|---|---|---|---|---|---|
| ops-01 | high | Weekly AEO/SEO cron `/api/cron/aeo-track` cannot be shown to run | Registered `0 9 * * 1` on the prod deployment (REST `/v13/deployments`, 18:24:23Z). Runtime logs kept about 24h (2.1). Observability query 402 and Plus 404 (18:26Z). No cron-run endpoint and no GitHub trace (3.3) | Nobody knows whether the tracker that is supposed to measure AI-engine visibility has ever produced data. "Zero results" may partly be "zero measurement" | Owner opens Vercel → Project → Settings → Cron Jobs → "View logs" and records the last run. Add a heartbeat the cron writes (e.g. last-run time and status in `/api/health` or a GitHub issue comment). Check live on **Mon 2026-09-28 09:00 - Tue 09:00 UTC** while logs are still kept | mixed |
| ops-02 | high | `CRON_SECRET` not set in any environment | Env names listing, 45 entries, no `CRON_SECRET` (18:24:05Z) | Vercel sends `Authorization: Bearer <CRON_SECRET>` only when it is set. A route that checks it will reject every scheduled run; a route that doesn't can be triggered by anyone. Route behaviour not verified (source reading and endpoint calls are out of scope) | Add `CRON_SECRET` (Production) in Vercel, redeploy, then confirm the next Monday run returns 200 in runtime logs within 24h | vercel-setting |
| ops-03 | high | No visitor measurement is switched on anywhere | Web Analytics 400 "not enabled" (18:26:42Z, plus orchestrator 17:48Z). Observability Plus 404/402 (18:26Z). Logs kept about 24h. First-party beacon: 0 calls in 23h organic window (2 queries, 18:31:05Z and 18:33:30Z) | We can't answer who looks, where they come from or what they click. Past traffic is gone after 24h | Merge #57 (green and clean). Enable Vercel Web Analytics on the project (the CSP already allows `va.vercel-scripts.com`). Optionally add a log drain or Observability Plus for longer than 24h | mixed |
| ops-04 | high | Organic human activity is about zero in the only window that can be observed | Organic 23h: 391 x 200 log entries in a crawler-like pattern (robots.txt 38, flat 13-21 per nav page). **0** `/api/marketing/*`, **0** contact, subscribe, checkout or chat calls. 12 x 404, all scanners (18:21-18:33Z) | Backs up "not seen anywhere": in those 23h there were no form submissions, no purchases and no beacon-counted page views | Out of scope for ops. Handled by the discovery lenses (indexing, Search Console/Bing verification, backlinks). Re-measure after ops-03 | content / owner-account |
| ops-05 | medium | Nothing shipped for 16+ days; a green PR is waiting | Production = `ed7461a` (2026-09-06); last prod deploys are 2026-09-08 same-SHA redeploys; `main` unchanged since 2026-09-06T15:23Z; #57 `CLEAN` for 17 days with 2 unresolved P2 threads (18:28:55Z-18:29:37Z) | Fixes and measurement never reach users. Work piles up in branches | Resolve or accept the 2 Codex P2 threads on #57, then merge it. Maya merges | code-pr |
| ops-06 | medium | Monitoring shows green but covers only `/api/health` (cheap mode) | Health-check job log: only `curl "$HEALTH_URL"`, fails only if the status is not 200. 95/95 green (18:27:45Z-18:28:18Z). `/api/health` `mode:"cheap"` (18:19:07Z) | Green monitoring gives false comfort. A broken sitemap, noindex, missing pages, a failing cron or broken analytics would all stay green | Add synthetic checks: 200 plus the expected title on key pages, `/sitemap.xml` and `/robots.txt` content, no `noindex`, cron heartbeat age under 8 days, beacon endpoint. Open an issue on failure (the existing issue step can be reused) | code-pr |

| ops-07 | low | Leftover and legacy secrets in project env | Names `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` present while the live CSP allows only PayPal. `ADMIN_PASSWORD` exists next to `ADMIN_PASSWORD_HASH` (18:24:05Z; CSP 18:18:55Z) | Unused credentials widen the exposure if the project is ever compromised | Owner confirms the variables are unused, then removes them in Vercel and rotates the Stripe keys at Stripe | vercel-setting |
| ops-08 | low | Audit-window 404s show missing feed, manifest, verification files and `/es/*` subpages | 404: `/rss.xml`, `/feed.xml`, `/atom.xml`, `/blog/rss.xml`, `/manifest.*`, `/BingSiteAuth.xml`, `/google-site-verification.html`, `/es/books`, `/es/blog`, `/About` (logs 18:19-18:20Z). Home page has no manifest/RSS link and no verification meta (GET `/` 18:34:01Z) | No feed for aggregators. Search-engine verification must be via DNS or does not exist. Localized sections are incomplete | Pass to the SEO/indexing and i18n lenses. Verify Search Console/Bing ownership (outside-source check) | mixed |
| ops-09 | low | Book domain lands on the home page, not the book page | HEAD `psilocybinintegrationguide.com` → 308 `https://www.mayaallan.com/` (18:32:27Z) | Visitors who type the book's name as a domain lose the book context | Redirect `psilocybinintegrationguide.com/*` to `/books/psilocybin-integration-guide` (Vercel domain redirect setting or middleware) | vercel-setting |
| ops-10 | info | Build warnings on production | "Ignored build scripts: bufferutil, sharp, unrs-resolver"; `engines.node >=22.18.0` auto-upgrade notice (build log 18:30:34Z) | Low. A future Node major version could change behaviour without warning | Pin the Node major. Review `pnpm approve-builds` | code-pr |
| ops-11 | info | Each evidence commit to `work/site-visibility` starts a Vercel preview build plus Quality gates and Deploy notify runs | 6 preview deployments on that branch today. Deploy notify runs 18:17Z, 18:23Z, 18:25Z. Quality gates on PR #58 (18:16-18:28Z) | Noise and build minutes only. The previews are SSO-protected and `noindex` | Optional: ignore `docs/**`-only commits with Vercel's "Ignored Build Step" | vercel-setting |
| ops-12 | info | Vercel MCP observability tools unusable for this team | MCP `get_observability_schema` 404 (no team parameter); MCP `create_observability_query` 404 while REST gives 402 (18:18-18:26Z) | Future agents get misleading "not found" errors instead of "plan required" | Use the REST schema to check; expect 402 until Observability Plus is enabled | owner-account |

## 9. What works (verified live)

| Item | Evidence | UTC |
|---|---|---|
| No runtime error clusters | `get_runtime_errors` 7d and 24h both empty | 18:18:55Z, 18:26:50Z |
| No 5xx and no error/warning/fatal log lines in the retained window | 5xx queries 7d and 24h empty; level query 24h empty | 18:19:07Z, 18:26:50Z, 18:19:45Z |
| Health endpoint 200, all 7 dependency checks `ok`, `version ed7461a` = production SHA = `main` HEAD | GET x2 | 18:19:07Z, 18:34:03Z |
| Production deployment READY, all 9 domains aliased, no alias error | `get_deployment` | 18:21:30Z |
| 0 ERROR / 0 CANCELED deployments in 30 days (67 deployments) | REST `/v6/deployments`, MCP `list_deployments` | 18:21:30Z, 18:29:37Z |
| Cron is registered on production (`/api/cron/aeo-track`, Mon 09:00 UTC) and the function exists in the build | REST `/v13/deployments`, build log | 18:24:23Z, 18:30:20Z |
| Alternate domains and apex 308 → `https://www.mayaallan.com/`; team/git `vercel.app` aliases SSO-protected with `noindex` | HEAD x9 | 18:32:27Z |
| Home page served `robots: index, follow` | GET `/` | 18:34:01Z |
| Health monitor 95/95 green over 14 days; no open incidents; last real 503 incident 2026-05-21 (closed) | GitHub Actions and issues | 18:27:45Z-18:28:43Z |
| Quality gates green on `main` (`ed7461a`) | GitHub Actions | 18:28:29Z |
| Deploy notify: no failures since 2026-05-21 | GitHub Actions | 18:28:29Z |
| Production build: 41/41 checks passed | Vercel build log | 18:30:20Z |
| Scanner probes (`xmlrpc.php`, `wp-login.php`, `sftp-config.json`, `.vscode/sftp.json`) get 404, with nothing exposed | runtime logs | 18:21:10Z |
| First-party visitor beacon works when a real browser loads a page (fired during audit browsing) | runtime logs 17:00-18:00Z | 18:31:40Z |
| Security headers present (HSTS preload, CSP, XFO DENY, nosniff, Referrer-Policy, Permissions-Policy) | GET `/api/health` headers | 18:18:55Z |

## 10. Unverified / needs outside-source check

| Item | Why unverified | What would verify it |
|---|---|---|
| Whether `/api/cron/aeo-track` ran on 2026-09-21, 09-14, 09-07, 08-31 and what it returned | Logs kept about 24h; Observability 402; calling the endpoint is not allowed | Vercel dashboard Cron Jobs "View logs" (owner), or live runtime logs on Mon 2026-09-28 09:00 - Tue 09:00 UTC |
| Whether the cron route requires `CRON_SECRET` | Needs source reading (not allowed here) | Code-lens check of the route on live GitHub `main`, or observing the Monday run's status code |
| Whether the AEO tracker has stored any results | Stored in DB / admin only; login not allowed | Owner view of admin AEO page, or Neon/Supabase via the Vercel-bound resource |
| Who the organic crawler-like traffic is (bot names, referrers, countries) | Runtime-log grouping has no user agent; request-level metrics need Observability Plus (402) | Enable Observability Plus / Web Analytics, or a log drain |
| Whether the visitor beacon waits for cookie consent | Needs source or a consent interaction (not done) | Code lens, or a Playwright lens reading network calls without clicking consent |
| Real coverage of `get_runtime_errors` "7d" | Pre-aggregated table; raw logs cover only 24h | Vercel support/docs, or compare after a known error |
| Search Console / Bing Webmaster ownership (no file or meta verification on the live site) | Outside source | Owner's GSC/Bing accounts, or DNS TXT lookup (appears lens) |
| Deep health (`/api/health` deep mode) | Gated and not called (shallow only per instructions) | Owner-run deep probe |

## 11. Not exercised (by rule)

- Every POST endpoint: `/api/contact`, `/api/subscribe`, `/api/checkout/*`, `/api/chat`, `/api/marketing/*`, `/api/tools/*`, `/api/upload*`, `/api/export*`, webhooks.
- `/api/cron/*`, `/api/admin/*` (including `/api/admin/aeo/run-now`), `/api/indexnow/*`.
- Admin login, forms, checkout and PayPal. No Playwright in this lens.
- Env values (names only). Team-wide or account-wide Vercel tools (drains, billing).
