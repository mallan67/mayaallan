# Adversarial verification — lens `ops-errors-cron` (2026-09-24)

| Field | Value |
|---|---|
| Lens verified | Live errors, operations and the weekly AEO/SEO cron (`ops-`) |
| Evidence under test | `docs/operations/evidence/2026-09-24/audit-ops-errors.md` at commit `0fece95fa0fc20a0de4e1e5dd725550d6cf93540` (read live from GitHub 2026-09-24T18:58:34Z) |
| UTC window of all re-checks | 2026-09-24T18:58:25Z to 2026-09-24T19:11:36Z |
| Live sources used | Vercel MCP scoped to `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y` / `team_kZQh5NYLyrOKqffK0r9EXf4E` (`get_runtime_errors`, `get_runtime_logs`, `get_deployment`, `list_deployments`, `get_observability_schema`, `create_observability_query`, `count_pageviews`); Vercel REST **GET only** through the logged-in `vercel api` CLI (env **names only**, deployments, build events, observability config, web analytics); `curl` GET/HEAD to the project domains; GitHub live API `gh api` (commits, PRs, PR review comments, Actions runs and job logs, issues, search) |
| Not used | No local files, no scratchpad, no checkout, no repository source files, no Playwright, no POST to the site or to Vercel query endpoints (so the REST 402 observability answer was not re-run), no GraphQL (POST), no `/api/cron/*`, `/api/admin/*`, `/api/indexnow/*`, no logins, no env values |
| Method | Each finding was re-run live and attacked for: transient blip (retries), wrong URL, measurement artefact, scanner noise, severity mis-set, and whether the proposed fix would actually work |
| Saved by | Claude (verifier sub-agent). Assembled in memory, staged only as GitHub blobs, committed through the GitHub API to `work/site-visibility` |

> Caveat: the organic window used by the audit (2026-09-23T18:00Z to 2026-09-24T17:00Z) is now partly past the ~1-day log retention, so it was re-queried as **2026-09-23T19:10Z to 2026-09-24T17:00Z**.

## 1. Verdict summary

| id | Audit severity | Verdict | Verified severity | One-line reason |
|---|---|---|---|---|
| ops-01 | high | **confirmed** | medium | No live source can show any cron run; but the cron only measures, it cannot cause or cure invisibility. Solution step 1 (dashboard View logs) cannot work for past Mondays |
| ops-02 | high | **confirmed** | medium | `CRON_SECRET` absent in 2 listings plus 0 linked team shared vars; impact is conditional (either the cron is rejected or it is open) |
| ops-03 | high | **confirmed** | high | Web Analytics 400 (MCP and REST), Observability Plus 404, logs 1 day. Wording overstated: a consent-gated first-party beacon exists but counts only visitors who accept |
| ops-04 | high | **uncertain** | high | Counts reproduce (tiny traffic, 0 conversions), but "0 beacon calls = no humans" is invalid: the beacon mounts only after consent (PR #57 description). Bot vs human cannot be separated live |
| ops-05 | medium | **confirmed** | medium | main and production still `ed7461a`; #57 still open, clean, green; both Codex P2 notes answered "not fixed" |
| ops-06 | medium | **confirmed** | medium | Health job log: one curl, fails only on non-200; 95/95 green |
| ops-07 | low | **confirmed** | low | Stripe and `ADMIN_PASSWORD` names present; build route list has no Stripe route and CSP has no Stripe host (supports "leftover", not proof) |
| ops-08 | low | **confirmed** (partly reframed) | low | All listed paths 404 twice; but `/es/books`, `/es/blog`, `/About` are not linked anywhere and not in the sitemap, and `/google-site-verification.html` is not a real Google file name, so those parts are audit artefacts |
| ops-09 | low | **confirmed** | low | 308 to home, 3 times; it is a path-preserving domain redirect. Proposed owner "vercel-setting" cannot target a path |
| ops-10 | info | **confirmed** | info | Build log shows both warnings; harmless on Vercel |
| ops-11 | info | **confirmed** (understated) | low | Not 6 but **182** preview builds on `work/site-visibility` today (18:16Z to 19:08Z) and 353 Actions runs; no build queueing |
| ops-12 | info | **confirmed** | info | MCP observability tools return 404 four times while REST says Observability Plus is not enabled. Proposed check (schema endpoint) is not a plan check |

## 2. Per-finding re-checks

### ops-01 — weekly cron `/api/cron/aeo-track` cannot be shown to run
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Cron still registered on prod | REST GET `/v13/deployments/dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` | 19:00:19Z | `crons=[{path:/api/cron/aeo-track, schedule:"0 9 * * 1"}]`, `plan: pro`, READY, `ed7461a` |
| Monday 2026-09-21 08:30-09:30 logs | MCP `get_runtime_logs` (lines) | 19:01Z | `400 ExceedsBillingLimitError` (retention limit, not "no runs") |
| Same window grouped | MCP `get_runtime_logs group_by=requestPath` | 19:01Z | `Aggregate query failed: 400` |
| Last 24h, text `aeo-track`, prod deployment | MCP `get_runtime_logs` | 19:01:44Z | "No logs found" |
| Last 24h, text `cron` | MCP `get_runtime_logs group_by=requestPath` | 19:01Z | timed out |
| Function invocations by route, Monday 08:00-10:00 | MCP `create_observability_query` | 19:01:18Z | 404 "Observability Data not found" |
| `vercel.schedule_operation.schedule_executions`, 30 days | MCP `create_observability_query` | 19:02Z | 404 |
| Observability Plus | REST GET `/v1/observability/manage/configuration/projects` | 19:02:04Z | 404 "Observability Plus is not enabled" |
| Cron-run history endpoint | `vercel api list` (1018 lines) | 19:02:35Z | no endpoint mentioning cron or schedule |
| GitHub trace | `gh api` workflows; search issues `cron` / `aeo` | 19:06:38Z, 19:10:15Z | no cron workflow; 1 `cron` issue (#44, closed 2026-09-05, a metric-design critique, no run record) |

**Refutation attempt failed:** nothing shows a run, success or failure. **Severity lowered to medium:** the cron measures AI-engine citations; its failure does not make the site less visible and fixing it will not make it more visible. It matters only for proving progress.
**Solution check:** step 1 is flawed. The dashboard "Cron Jobs > View logs" opens the same runtime logs, kept 1 day on Pro, so on 09-24 it cannot show the 09-21 run. Workable now: the owner looks at the date of the newest stored result on the admin AEO page, or presses "Run" on the Cron Jobs page and reads the runtime log within minutes (owner action; agents must not call the route). The heartbeat (last-run time plus status exposed somewhere readable) is the durable fix. The Mon 2026-09-28 09:00 to Tue 09:00 UTC log check is valid.

### ops-02 — `CRON_SECRET` not set
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Env names, observation 1 | REST GET `/v10/projects/prj_Ckws…/env` (names and targets only) | 19:00:15Z | 45 entries; `CRON_SECRET` ABSENT; no name contains `CRON` |
| Team shared env vars linked to this project | REST GET `/v1/env?projectId=prj_Ckws…` | 19:00:38Z | `data: []`, count 0, so it is not hidden as a shared variable |
| Env names, observation 2 | REST GET `/v9/projects/prj_Ckws…/env` | 19:00:42Z | 45 entries; `CRON_SECRET` ABSENT |

**Confirmed.** **Severity medium, not high:** the impact is conditional and route behaviour is still unknown. Either the route checks the secret and every Monday run is rejected (measurement lost), or it does not and anyone can trigger it (AI provider cost, since `AI_GATEWAY_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY` exist). Neither affects whether people find the site.
**Solution check:** correct for the Vercel mechanism (Vercel adds `Authorization: Bearer <CRON_SECRET>` only when the variable exists; env changes apply only after a redeploy). It fixes the problem only if the route compares against `process.env.CRON_SECRET`; that needs a code-lens check of the route on live `main`. Use a random value of at least 16 characters, Production scope.

### ops-03 — no visitor measurement switched on
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Web Analytics, observation 1 | MCP `count_pageviews(prj_Ckws…, 09-17 to 09-24)` | ~19:01Z | 400 `web_analytics_not_enabled` |
| Web Analytics, observation 2 | REST GET `/v1/query/web-analytics/visits/count` | 19:02:11Z | 400 "Web Analytics is not enabled for this project" |
| Observability Plus | REST GET config (see ops-01) + 4 MCP queries | 19:01-19:02Z | 404 not enabled / 404 not found |
| Log retention | MCP logs for 09-21 | 19:01Z | `ExceedsBillingLimitError` |
| First-party beacon, organic window | MCP `get_runtime_logs query=marketing` 09-23T19:10Z to 09-24T17:00Z | ~19:03Z | empty |
| First-party beacon, since 17:00Z (audit browsers) | same, since 17:00Z | ~19:03Z | `/api/marketing/visitor` 7, `/api/marketing/event` 3 |
| How the beacon is gated | PR #57 description (live `gh api`) | 19:06:03Z | "The first-party visitor ID and session ID … still mount only after explicit consent"; "The admin panels count consented visitors only"; current prod mounts `<Analytics />` "only after a visitor pressed Accept" |

**Confirmed, severity high** (the owner explicitly asks who looks and who clicks). **Wording correction:** measurement is not zero by design; a consent-gated first-party beacon exists and works, but it only sees visitors who accept, and it saw none organically in 22h.
**Solution check:** both halves are required. Merging #57 alone records nothing until Web Analytics is switched on in the dashboard; switching Web Analytics on without #57 still counts only visitors who press Accept. After both, `count_pageviews` should return a number instead of 400. A log drain or Observability Plus is optional and costs money.

### ops-04 — almost no human activity in the observable window
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Status mix 09-23T19:10Z to 09-24T17:00Z | MCP `get_runtime_logs group_by=statusCode`, prod deployment | ~19:03Z | 200=389, 404=12, 304=1 (4th value hidden) |
| Top 2xx paths | MCP `group_by=requestPath statusCode=2xx` | ~19:03Z | `/` 79, `/robots.txt` 38, `/nervous-system-reset` 21, `/integration-reflection` 19, `/belief-inquiry` 18, `/media` 17, `/events` 16, `/about` 15, `/books` 15, `/contact` 14 … (39 distinct); same pattern as the audit |
| API calls | MCP `query=/api/ group_by=requestPath` | ~19:03Z | only `/api/health` 6: 0 contact, subscribe, checkout, chat, marketing |
| 404s | MCP `statusCode=404 group_by=requestPath` | ~19:03Z | `/xmlrpc.php` 4, `/sftp-config.json` 2, `/.vscode/sftp.json` 2, `/wp-login.php` 1, `/.well-known/assetlinks.json` 1, `/ads.txt` 1, `/.well-known/apple-app-site-association` 1 |
| User agents / line-level detail | MCP `get_runtime_logs` lines, 3 narrower windows | 19:02-19:03Z | all timed out; grouping has no user-agent dimension |

**Uncertain.** Reproduced: traffic is tiny (about 400 log entries in 22h, and one request can log twice), and there were zero form, subscribe, checkout or chat calls. **Not established:** "almost no human activity". The main argument (0 beacon calls) does not hold, because the beacon only fires after consent (see ops-03), and no live source can split bots from people. Up to ~40 home-page requests could include real visitors. Severity stays high because low traffic is the core of the owner complaint. **Solution check:** re-measure after ops-03 is fixed; that is the right next step.

### ops-05 — nothing shipped for 16+ days; green PR waiting
| Check | Live source | UTC read | Result |
|---|---|---|---|
| `main` HEAD | `gh api commits/main` | 19:05:36Z | `ed7461a`, 2026-09-06T15:23:14Z (#56) |
| Latest production deployments | REST GET `/v6/deployments?target=production&limit=3` | 19:07:30Z | `dpl_5ug8…` 09-08T07:57Z, `dpl_7qLv…` 09-08T07:46Z, `dpl_CsiB…` 09-06T15:23Z, all `ed7461a`; 0 production deployments today |
| PR #57 | `gh api pulls/57` + check-runs + status | 19:05:37-39Z | open, not draft, `mergeable=true`, `mergeable_state=clean`, gates / on-success / Vercel Preview Comments = success, combined `success`; last update 2026-09-07T03:49:42Z |
| The 2 Codex P2 notes | `gh api pulls/57/comments` | 19:05:53Z | comments 3946373799 and 3946373804 each have an owner-account reply: "Correct, and I have not fixed it — flagging … rather than resolving". Thread "resolved" flag not re-read (GraphQL is a POST) |

**Confirmed, medium.** **Solution check:** valid. The two open notes concern attribution accuracy (arrival touch before consent; return visits in a tab that stays open), not the cookieless page-view counter, so Maya can accept them as follow-ups and merge. Merging only produces data once Web Analytics is enabled (ops-03).

### ops-06 — uptime monitoring shallow
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Runs since 2026-09-10 | `gh api actions/workflows/275861895/runs` | 19:06:39Z | 95 total, 95 success; latest 16:44:18Z (run 36029439207) |
| What the job does | job 107734160674 log | 19:06:45Z | step "Probe /api/health": `curl -sS -m 30 … "$HEALTH_URL"`, `HEALTH_URL: https://www.mayaallan.com/api/health`, fails only if `status_code != 200` |
| Health mode | GET `/api/health` x2 | 19:04:08Z, 19:04:09Z | `mode: cheap` |

**Confirmed, medium.** **Solution check:** valid. The cron-heartbeat check needs the ops-01 heartbeat to exist first. The noindex check should read both `<meta name=robots>` and the `X-Robots-Tag` header.

### ops-07 — leftover and legacy secrets
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Env names | REST GET `/v10/projects/…/env` (names only) | 19:00:15Z | `STRIPE_SECRET_KEY` (preview+production), `STRIPE_WEBHOOK_SECRET` (preview+production), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (all), `ADMIN_PASSWORD` (all) next to `ADMIN_PASSWORD_HASH` |
| CSP payment hosts | GET `/` headers | 19:04:10Z | no `stripe`; `paypal` present |
| Routes in the production build | REST GET `/v3/deployments/dpl_5ug8…/events?builds=1` | 19:07:55Z | 46 `/api/*` routes; none contains `stripe`; payment routes are `/api/checkout/paypal*` and `/api/payment/paypal/webhook` |

**Confirmed, low.** Two live signals support "leftover", but a route could still import Stripe, and `ADMIN_PASSWORD` may be a fallback, so "unused" is not proven. **Solution check:** valid as written (confirm first). Removal only takes effect on the next deployment; rotation happens in Stripe (outside source); the `NEXT_PUBLIC_` key is public by design.

### ops-08 — 404s for feed, manifest, verification files, `/es` subpages
| Check | Live source | UTC read | Result |
|---|---|---|---|
| 16 paths, round 1 and 2 | `curl` GET | 19:04:40Z, 19:04:53Z | 404: `/rss.xml`, `/feed.xml`, `/atom.xml`, `/blog/rss.xml`, `/feed`, `/manifest.webmanifest`, `/manifest.json`, `/site.webmanifest`, `/BingSiteAuth.xml`, `/google-site-verification.html`, `/es/books`, `/es/blog`, `/About`, `/ads.txt`. 200: `/es`, `/about` |
| Home head | `curl` GET `/` | 19:05:17Z | no `rel=manifest`, no RSS/Atom alternate, no `google-site-verification`, `msvalidate.01` or `yandex-verification` meta; `robots: index, follow` |
| Are the 404 `/es` pages linked? | GET `/es`, GET `/sitemap.xml` | 19:05:18Z | `/es` links only `/es/about`; sitemap has 38 URLs, the `es` ones are `/es` and `/es/about`; home links no `/es*` |

**Confirmed, reframed.** Real (minor) gaps: no RSS/Atom feed, no web manifest. **Audit artefacts:** `/es/books`, `/es/blog` and `/About` are URLs the audit guessed; nothing links to them and the sitemap does not list them, so they are not broken links. `/google-site-verification.html` is not a Google file name (Google uses `google<token>.html`), so that 404 proves nothing; missing meta tags do not rule out DNS verification (**needs outside-source check**: Search Console / Bing ownership). Severity low is right for the feed; the rest is info.

### ops-09 — book domain lands on the home page
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Apex, 3 tries | `curl -I https://psilocybinintegrationguide.com/` | 19:04:20Z, 19:04:27Z (x2) | 308 to `https://www.mayaallan.com/` each time |
| Deep paths | `curl -I` | 19:04:25Z | `/books` goes to `www…/books`, `www.psilocybinintegrationguide.com/anything` to `www…/anything`: path-preserving domain redirect |
| Target page exists | `curl -I /books/psilocybin-integration-guide` | 19:04:25Z | 200 |

**Confirmed, low.** **Solution check:** the owner tag "vercel-setting" does not work alone. The Vercel domain "Redirect to" option only targets a domain and keeps the path. Sending the root to `/books/psilocybin-integration-guide` needs the domain switched to serve the production deployment plus a host-conditioned redirect (`has: host` in the Next.js or `vercel.json` redirects, or middleware): code-pr plus a Vercel setting. The benefit is small while nothing links to or advertises this domain.

### ops-10 — production build warnings
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Build events of `dpl_5ug8…` | REST GET `/v3/deployments/…/events?builds=1` (318 events) | 19:07:20Z | "Detected engines node >=22.18.0 … will automatically upgrade"; "Ignored build scripts: bufferutil@4.1.0, sharp@0.34.5, …"; "41/41 checks passed, 0 failed"; Next.js 16.1.1 |

**Confirmed, info.** **Solution check:** pinning `"node": "22.x"` removes the auto-upgrade risk. On Vercel the image optimizer does not need a local `sharp` build, so `approve-builds` is optional.

### ops-11 — evidence commits start preview builds and CI
| Check | Live source | UTC read | Result |
|---|---|---|---|
| Deployments today (paginated) | REST GET `/v6/deployments?since=2026-09-24` | 19:08:00Z | **182** today, all preview on `work/site-visibility`, earliest 18:16:18Z; 0 production |
| States / queueing | REST GET by state | 19:09:39Z | QUEUED 0, INITIALIZING 1, BUILDING 3, ERROR 0, CANCELED 0; READY sample: median queue 1.4 s, max 4.1 s, median build 59 s |
| Commits | `gh api compare main...work/site-visibility` | 19:08:21Z | ahead 183 |
| Actions runs today on the branch | `gh api actions/runs?branch=work/site-visibility` | 19:08:21Z | total 353 (Deploy notify and Quality gates) |

**Confirmed, understated** (the audit counted 6 at 18:29Z). **Severity raised to low:** about 3 build-hours and 350 CI runs in under an hour of auditing, plus notification noise that can bury a real alert. It does not queue a production deploy right now. **Solution check:** an Ignored Build Step for commits that only touch `docs/**` stops the Vercel builds; GitHub `paths-ignore: docs/**` on Quality gates and Deploy notify is also needed to stop the CI runs. This verifier commit adds one more build.

### ops-12 — Vercel MCP observability tools return misleading 404s
| Check | Live source | UTC read | Result |
|---|---|---|---|
| MCP schema | `get_observability_schema()` | ~19:01Z | 404 "Observability Data not found." |
| MCP queries (3 metrics) | `create_observability_query` | 19:01-19:02Z | 404 each (`vercel.function_invocation.count`, `vercel.request.count`, `vercel.schedule_operation.schedule_executions`) |
| REST schema | GET `/v2/observability/schema` | 19:01:58Z | 200, 10.7 KB catalogue incl. `vercel.request.count` and 9 `vercel.schedule_operation.*` metrics |
| REST plan state | GET `/v1/observability/manage/configuration/projects` | 19:02:04Z | 404 "Observability Plus is not enabled" |

**Confirmed, info.** The REST 402 on the query endpoint was not re-run (POST avoided). **Solution check:** the proposed check is wrong: the schema endpoint returns 200 whatever the plan, so it cannot show plan state. Use GET `/v1/observability/manage/configuration/projects` (404 means not enabled).

## 3. Spot-checks of the "works" list

| Item | Holds | Live re-check (UTC) |
|---|---|---|
| No runtime error clusters | yes | `get_runtime_errors` 7d and 24h: "No runtime errors found" (~18:59Z, ~19:08Z) |
| No 5xx and no error/warning/fatal lines (retained window) | yes | `get_runtime_logs statusCode=5xx since=24h` empty; `level=[error,warning,fatal] since=24h` empty (~19:00Z) |
| Health 200, 7 checks ok, prod SHA | yes | GET x2 19:04:08Z / 19:04:09Z: 200 in 0.46 s / 0.42 s, `status ok`, all 7 checks true, `version ed7461a`, `env production` |
| Prod deployment READY, 9 aliases | yes | MCP `get_deployment` ~19:08Z: READY, production, iad1, redeploy, 9 aliases, `aliasError: null` |
| No failed or canceled deployments in 30 days | yes | REST `state=ERROR` 0 and `state=CANCELED` 0 since 2026-08-25 (19:09:17Z). Newest ERROR deployment is `dpl_8kQF…` of 2026-07-15, outside the window |
| Cron registered and function built | yes | REST 19:00:19Z; build log 19:07:20Z shows `ƒ /api/cron/aeo-track` and 41/41 checks |
| Domain routing and preview protection | yes | HEAD 19:04:20Z: 6 aliases 308 to `https://www.mayaallan.com/`, www 200; 2 team/git aliases 302 to SSO with `X-Robots-Tag: noindex` (19:04:24Z) |
| Uptime monitor green, no open incidents | yes | 95/95 (19:06:39Z); open non-PR issues 0, open `health-incident` 0, Deploy notify failures since 2026-05-22: 0 (19:10:44Z) |
| Quality gates pass on main | yes | latest main run 2026-09-06T15:23:17Z `ed7461a` push success (19:09:26Z) |
| Only scanner bots hit missing pages | yes | same 7 scanner paths, 12 entries (~19:03Z); the audit-guessed `/es/*` pages are not linked anywhere (19:05:18Z) |
| Beacon works when a real browser loads a page | partly | endpoints do receive calls (visitor 7, event 3 since 17:00Z, ~19:03Z), but per PR #57 the beacon mounts only **after consent**; it measures consenting visitors, not page loads |
| Security headers present | yes | GET 19:04:09Z: HSTS preload, CSP, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy |

## 4. Still unverified / needs outside-source check

| Item | Why | What would verify it |
|---|---|---|
| Any past run of `/api/cron/aeo-track` | 1-day log retention, Observability Plus off, no cron-history API | Owner: newest result date on the admin AEO page, or dashboard "Run" plus live logs; or live logs Mon 2026-09-28 09:00 to Tue 09:00 UTC |
| Whether the cron route requires `CRON_SECRET` | source reading and calling the route are out of scope | code-lens read of the route on live `main` |
| Bots vs people in the organic traffic | no user-agent dimension; line queries time out | Web Analytics (after ops-03), or a log drain |
| Search Console / Bing ownership | outside source | owner accounts or DNS TXT lookup |
| REST observability query 402 | POST not re-run here | the audit observation at 18:26Z stands unrepeated |
| PR #57 thread "resolved" flags | GraphQL is a POST | GitHub PR page (owner) |