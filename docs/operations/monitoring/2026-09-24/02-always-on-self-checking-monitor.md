# Always-on site doctor: one self-checking, self-reporting system for mayaallan.com

- Lens: `ops-` (senior SRE). Date: 2026-09-24. Analysis only: nothing on the site, in Vercel or in GitHub settings was changed; the only write is this file.
- Owner's instruction for this run (2026-09-24): "the audio book is not finished, so please focus on the other stuff first". The audiobook check is designed below but **switched off** (`flow.audio-sample = disabled`), and the two audiobook workflows are left out of monitoring.
- Live sources: GitHub API for `mallan67/mayaallan` (main = `ed7461a07e499694eba25ada437817c35983bd87`, read 18:36:35Z); Vercel API (MCP) for project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y` (18:39Z-18:45Z); HTTP GET/HEAD to https://www.mayaallan.com (18:37Z-18:50Z); vendor documentation via WebFetch (18:41Z-18:48Z). All times are UTC on 2026-09-24. Nothing here comes from a local checkout, a cache or an earlier report.

## 1. Bottom line

1. **The site is healthy right now.** 38/38 sitemap URLs return 200. `/api/health` returns ok. Vercel shows no runtime errors in 7 days. All alternate domains redirect (308) to www. Google, Bing, GPTBot, ClaudeBot and Perplexity crawlers all get 200.
2. **The owner cannot "see every visitor" yet.** The Vercel API says Web Analytics is **not enabled** on the project. PR #57 ("count every visitor") has been open and mergeable since 2026-09-07. Fix this first: monitoring can't report visitors that are never counted.
3. **Today's monitoring is thinner than it looks.**
   - The health check is set to run every 15 minutes, but GitHub actually ran it every **3.6 h** (median), up to **6.9 h** apart.
   - It probes one endpoint only: no pages, forms, buy button, SEO signals, analytics or cron.
   - Deploy-failure issues stayed open for 53 and 110 days.
   - `main` has no branch protection.
   - CI is noisy: today's docs-only commits caused 58 preview deploys and 60 CI runs, and PR #58's lint check fails on `.js` evidence files under `docs/`.
4. **Design: one system that lives entirely in GitHub.**
   - A scheduled "site doctor" workflow runs a Playwright crawl plus SEO, flow and heartbeat checks.
   - It writes `ops/status/latest.md` and a dated history to a branch that never deploys.
   - It keeps **one issue per failing check** and closes it automatically on recovery.
   - It sends alerts through **one email channel** (Resend, which the site already uses) and a Monday digest.
   - A free Sentry cron monitor emails the owner if the doctor itself stops running.
   - A Claude Code routine reads the failures and opens **draft** fix PRs. It never merges.
5. **Recurring cost: $0 with current tools.** Actions are free on public repos, and Sentry Developer, Resend Free and Lighthouse CI are free. Claude routine runs count against the owner's Claude subscription.

## 2. Live facts (source + read time, UTC 2026-09-24)

| # | Fact | Source | Read |
|---|---|---|---|
| F1 | Repo `mallan67/mayaallan` is **public**; default branch `main`; 5 active workflows: Health check, Quality gates, Deploy notify, Chapter 1 Independent Audio Analysis, Export Chapter 1 Audio Review | `gh api repos/.../actions/workflows` | 18:36:19Z |
| F2 | `health-check.yml` (blob 65ee85f): cron `*/15 * * * *`; curls `/api/health`; opens/comments/closes issues with label `health-incident`; uses `actions/github-script@v7` | contents API @ main ed7461a | 18:36:35Z |
| F3 | Last 100 scheduled Health check runs (2026-09-09T11:56Z to 2026-09-24T16:44Z): gap between runs min 1.84 h, **median 3.63 h**, p90 5.46 h, **max 6.87 h**. September: 4-9 runs/day instead of 96 | runs API, computed | 18:45:59Z |
| F4 | Health check failures (all time): 4, all infrastructure. 2026-05-26 "Set up job" failed; 2026-07-16 probe ok but "Close incident issues" step failed; 2026-08-06 two runs cancelled. None was a site outage | runs + jobs API | 18:37:20Z |
| F5 | Only real incident on record: issue #14 "Health check failing (HTTP 503)", opened 2026-05-21T01:20Z, auto-closed 05:31Z | issues API | 18:37:07Z |
| F6 | `deploy-failure` issues #13 (opened 2026-05-19) and #38 (opened 2026-07-15) were both closed on 2026-09-06, after **110 and 53 days** open. `deploy-notify.yml` opens a new issue on every failure, never dedupes, never auto-closes | issues API; contents API @ main | 18:37:07Z / 18:36:35Z |
| F7 | `deploy-notify.yml` on-success probes **production** `/api/health` for every deployment, **previews included**, so previews are never checked themselves | contents API @ main | 18:36:35Z |
| F8 | Today: 58 Deploy notify runs for `work/site-visibility` (one per Vercel preview built from a docs-only commit); 60 Quality gates runs (53 cancelled, 2 failed) | runs API | 18:45:33Z |
| F9 | PR #58 (draft, `work/site-visibility`) is red: Lint reports **194 problems (1 error, 193 warnings)** against `--max-warnings 172`. The error is `@typescript-eslint/no-require-imports` in `docs/operations/evidence/2026-09-24/tools/crawl/*.js` | job 107776676358 log | 18:37:47Z |
| F10 | Open items: PR #57 (feat analytics, open since 2026-09-07, `mergeable_state=clean`), PR #58 (draft). No open issues | pulls/issues API | 18:37:47Z |
| F11 | `main` **not protected** (`protected=false`), no rulesets, auto-merge off | branches/rulesets API | 18:45:47Z |
| F12 | Latest Health check run shows two warnings. (a) "Node.js 20 is deprecated... actions/github-script@v7... forced to run on Node.js 24". (b) "ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026" | check-run annotations, job 107734160674 | 18:43:16Z |
| F13 | Last Quality gates on `main`: success, 2026-09-06T15:23Z, sha ed7461a | runs API | 18:37:03Z |
| F14 | `/api/health`: HTTP 200 in 0.33 s. `status: ok`, `mode: cheap`. Checks database (67 ms), resend, blob, paypal, session, admin and upstash all ok. `version: ed7461a` (equals main), `env: production`, `Cache-Control: no-store` | GET | 18:37:55Z (re-checked 200 at 18:50:42Z) |
| F15 | Health route: cheap mode is a single database row read plus a check that env vars exist. `?deep=1` makes real calls to Resend, PayPal, Blob and Upstash, and needs an admin session or `Bearer HEALTH_CHECK_SECRET` | `src/app/api/health/route.ts` @ main | 18:40:17Z |
| F16 | robots.txt 200: allows all named search and AI crawlers, disallows `/admin/ /api/ /download/`, declares the sitemap | GET | 18:38:03Z |
| F17 | sitemap.xml has **38 URLs**, all **200** (0.26-0.95 s), none sends `X-Robots-Tag`. hreflang alternates for es/pt-BR/de/fr/he | GET each URL | 18:38:13Z |
| F18 | Home, book and contact pages: self-canonical and `index, follow`. Home and contact have a form with `type="email"`. The book page mentions PayPal and the audiobook | GET | 18:38:52Z |
| F19 | Googlebot, bingbot, GPTBot, ClaudeBot and PerplexityBot user agents all get 200 on the book page | GET with UA | 18:48:21Z |
| F20 | `mayaallan.com`, `psilowire.com`, `www.psilowire.com`, `psilocybinintegrationguide.com` (+www), `mayaallan.vercel.app` and `http://www` all return 308 to `https://www.mayaallan.com/`. The `-git-main-` alias returns 302 to Vercel SSO | GET | 18:41:25Z |
| F21 | Security headers present: HSTS (2y, preload), CSP, `X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy. HTML is `Cache-Control: private, no-cache, no-store`, so every page view is a server render | GET / | 18:41:39Z |
| F22 | Vercel `get_runtime_errors` (7d): **no runtime errors** | Vercel MCP | 18:39:39Z |
| F23 | Production function log counts (7d) by status: 200=7,613; 404=235; 405=10; 304=3; 307=3 (6 distinct). These include bot traffic and earlier audit probes; they are **not** a visitor count | Vercel MCP `get_runtime_logs` group_by | 18:39:39Z |
| F24 | Top 404 paths (7d): `/feed.xml` 12, `/rss.xml` 12, `/BingSiteAuth.xml` 10, `/blog/rss.xml` 10, `/atom.xml` 8, `/index.html` 7, `/feed` 7, `/manifest.webmanifest` 6, `/es/books` 6, `/About` 5, `/blog/feed.xml` 5, `/media/mushroom-healing` 3, `/en` 3, `/apple-touch-icon.png` 3. Some other entries are deliberate audit probes (`/this-page-does-not-exist-*`). Re-GET at 18:41:39Z: all still 404; `/llms.txt` 200 | Vercel MCP + GET | 18:40:31Z |
| F25 | Vercel Web Analytics: `count_pageviews` returned **400 `web_analytics_not_enabled`: "Web Analytics is not enabled for this project"** | Vercel MCP | 18:39:39Z |
| F26 | `/_vercel/insights/script.js` is served (200). The script **skips sending** when `navigator.webdriver` is true or the UA contains "Headless", so headless monitors don't pollute visitor counts | GET script body | 18:39:52Z |
| F27 | Production deployment `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` is READY, created 2026-09-08T07:57Z from main ed7461a (same SHA deployed 3 times, 09-06 to 09-08). Deployment protection = SSO on everything except custom domains | Vercel MCP `list_deployments`, `get_project` | 18:39Z |
| F28 | `vercel.json` @ main: one cron, `/api/cron/aeo-track` `0 9 * * 1`, protected by `CRON_SECRET`. `/api/health` exposes no heartbeat for it | contents API | 18:40:11Z / 18:44:55Z |
| F29 | Whether the weekly cron ran on 2026-09-21 is **UNVERIFIED**: no per-line logs are retained for the window, and the aggregate query timed out twice and returned 400 once | Vercel MCP | 18:40:31Z-18:45Z |
| F30 | `package.json` @ main: `next ^16.1.0`, `@vercel/analytics ^2.0.1`, `resend ^6.8.0`, `@supabase/supabase-js`, `@upstash/redis`. **No** `@vercel/speed-insights`, no Sentry, no Playwright; pnpm 10.28.1 | contents API | 18:44:18Z |
| F31 | `/api/subscribe` and `/api/contact` have only a `company` honeypot, which returns success without storing or emailing. There is **no test or canary mode**. Existing alert path: `alertAdmin()` emails `ADMIN_EMAIL` via Resend, with a 1 h Upstash dedup | route and lib sources @ main | 18:44:29Z-18:44:44Z |
| F32 | Vercel drains: `list_drains` returns 404 not_found for this scope | Vercel MCP | 18:39:39Z |
| F33 | Audio workflows last ran 2026-07-20 and 2026-07-21 on `audiobook-approved-manifest` (success). Deferred per the owner | runs API | 18:36:25Z |

## 3. Diagnosis

**Working:**
- Uptime and correctness of every sitemap page.
- The health endpoint design (cheap public mode, protected deep mode, no leaked errors).
- The incident issue open/close loop in `health-check.yml`, which did close #14 automatically.
- Domain consolidation, crawler access and security headers.
- Quality gates on `main`.

**Failing or missing:**
- (1) Visitor measurement is off (F25).
- (2) Detection lag is up to about 7 h (F3), and the schedule claims 15 min.
- (3) Nothing checks what a buyer or reader actually does: rendered pages, console errors, broken links and images, the newsletter/contact form, the PayPal button, the tools, the weekly cron, or lead delivery.
- (4) Deploy failure issues pile up and are never auto-resolved (F6). Previews are never verified (F7).
- (5) Nothing checks the monitor itself. If GitHub disables the schedule, no one is told. Scheduled workflows in a public repo are auto-disabled after 60 days without repository activity (GitHub docs, §8).
- (6) CI noise hides real signal (F8, F9).
- (7) `main` is unprotected (F11). That is a hard blocker for any automated fixer.
- (8) The Node 20 action runtime was removed from runners on 2026-09-23 (GitHub changelog). Workflows still pin Node-20 action majors, and are forced onto Node 24 with a warning (F12).

**Recurring 404s worth fixing (F24):**
- RSS/Atom feeds requested about 58 times a week, and there is no feed.
- `BingSiteAuth.xml` requested 10 times: a Bing verification attempt is failing.
- Wrong-case and legacy URLs: `/About`, `/media/mushroom-healing`, `/index.html`, `/en`.
- No web manifest or apple-touch-icon.
- `/es/books` missing.

## 4. Design: one living system

### 4.1 Shape

```
triggers: schedule every 3 h (off the hour) | production deploy success | manual | Monday digest
      |
site-doctor job (GitHub Actions, ubuntu-24.04, Node 24, Playwright Chromium; isolated ops/doctor/package.json)
      |-- run checks (4.2) ................ results.json (one record per check id)
      |-- publish report .................. ops-status branch: ops/status/latest.md, latest.json, history/YYYY-MM-DD.md
      |                                     + job summary ($GITHUB_STEP_SUMMARY) + pinned issue "Site status"
      |-- reconcile issues ................ one issue per failing check id: open / update / auto-close
      |-- alert ........................... Resend email only on issue OPEN (critical) / CLOSE (recovered) + Monday digest
      |-- heartbeat ....................... Sentry cron check-in (dead-man's switch for the doctor itself)
      '-- fire fixer ...................... Claude routine /fire on a NEW auto-fix-candidate issue (max 3/day)
Claude routine (API trigger + daily sweep) -> draft PR on claude/* -> Quality gates -> owner merges -> next doctor run auto-closes the issue
```

There is one place: GitHub. It holds status (the `ops-status` branch and the pinned issue), history (dated files), failures (issues), fixes (PRs) and proof (Actions runs). Email is only a push notification that points back to GitHub. There are no dashboards to maintain.

### 4.2 Check catalogue

Profiles:
- **quick**: health, drift, key pages, buy button. Runs after every production deploy.
- **full**: everything. Runs every 3 h.
- **weekly**: Lighthouse, external links, search engines.

Severity:
- **C** = critical (email immediately).
- **W** = warning (email after two consecutive failures).
- **I** = info (appears in the digest only).

| Check id | What it proves | How (read-only) | Sev | Today | Needs |
|---|---|---|---|---|---|
| `http.health` | App, DB and integrations are up | GET `/api/health`, status 200, every `checks.*.ok` | C | pass (F14) | none |
| `deploy.version-drift` | Production runs the current `main` | `health.version` equals main HEAD short SHA once 30 min have passed since the last push to main | C | pass (ed7461a) | none |
| `ci.main-green` | `main` builds and tests | latest Quality gates run on main = success | W | pass (F13) | none |
| `http.sitemap-urls` | Every published page answers | every sitemap URL returns 200 within 3 s | C | pass 38/38 (F17) | none |
| `page.console-errors` | No JS errors for visitors | Playwright, desktop + mobile (Pixel-class), `console.error` + `pageerror` per URL | W | not measured | doctor |
| `page.failed-requests` | No broken assets or API calls | same-origin responses >= 400, PayPal SDK load failures | W | not measured | doctor |
| `page.broken-images` | Images render | `img.complete && naturalWidth > 0` | W | not measured | doctor |
| `links.internal` | No dead internal links | collect same-origin `a[href]` from all pages, GET each unique target | W | not measured | doctor |
| `links.external` | Retailer and press links alive | weekly GET/HEAD, warning only | I | not measured | doctor |
| `seo.robots` / `seo.sitemap` | Crawlers are guided | robots 200 with Sitemap line; sitemap parses; URL count not lower than last run | C | pass (F16/F17) | none |
| `seo.index-signals` | Nothing is accidentally hidden | per URL: self canonical, no `noindex` meta or X-Robots-Tag, hreflang alternates return 200 and link back | C | pass on 3 sampled pages | doctor |
| `seo.crawler-ua` | Firewall or bot protection doesn't block crawlers | GET home + book page as Googlebot, bingbot, GPTBot, ClaudeBot, PerplexityBot; status 200 | C | pass (F19) | none |
| `domains.redirects` | Alternate domains funnel to www | each attached domain returns 308 to `https://www.mayaallan.com/` | W | pass (F20) | none |
| `sec.headers` | Security headers not regressed | HSTS, CSP, XFO, nosniff present | W | pass (F21) | none |
| `flow.newsletter-form` | Visitors can subscribe | email input + submit visible and enabled on `/` (no submit) | C | form present in HTML | doctor |
| `flow.contact-form` | Visitors can reach the owner | form fields + submit visible on `/contact` (no submit) | C | form present in HTML | doctor |
| `flow.buy-button` | Buyers can pay | on the book page the PayPal button container/iframe becomes visible within 15 s; never clicked | C | UNVERIFIED (client-rendered) | doctor |
| `flow.tools-load` | Free tools work | `/integration-journal`, `/belief-inquiry`, `/nervous-system-reset`, `/integration-reflection`: main interactive element visible, no console error. `/api/chat` is **never** called (it has a cost) | W | not measured | doctor |
| `flow.audio-sample` | Audiobook sample plays | `audio.play()` muted, `currentTime` advances | W | **disabled** (owner deferral) | switch on when the audiobook ships |
| `analytics.script` | Visit counting is wired | the page mounts the Vercel Analytics component and `/_vercel/insights/script.js` returns 200 | C | script 200; mounting gated by consent until #57 | ops-01 |
| `analytics.enabled` | Visits are actually stored | weekly digest: page views over the last 7 days > 0 (Vercel API or the site's own counts endpoint) | C | **fail** (F25) | ops-01, ops-17 |
| `cron.aeo-track` | The weekly job ran | `/api/health` heartbeat `lastRunAt` younger than 8 days | W | UNVERIFIED (F29) | ops-09 |
| `lead.canary` | A signup really lands | daily signed canary POST to `/api/subscribe` and `/api/contact`; expect `stored: true` | C | impossible today (F31) | ops-10 |
| `perf.lighthouse` | Speed/SEO/a11y not regressing | weekly Lighthouse CI on 5 URLs, mobile + desktop; median of 3 runs vs baseline ratchet | W | no baseline | ops-11 |
| `search.gsc` / `search.bing` | Pages are indexed and getting impressions | weekly Search Console URL Inspection (38 URLs, quota 2,000/day/site) + Search Analytics; Bing API crawl issues | W | not connected | ops-12 |
| `watcher.self` | The doctor itself runs | Sentry cron monitor expects a check-in at least every 6 h; digest also lists every workflow's `state` | C | none exists | ops-08 |

Rules for the doctor:
- It sends GET and HEAD requests only, plus the one signed canary once ops-10 exists.
- It never calls `/api/admin/*`, `/api/cron/*`, `/api/indexnow/*`, `/api/chat` or checkout endpoints.
- Headless Chromium is ignored by Vercel Analytics (F26), so crawls don't inflate visitor numbers.

### 4.3 Status report and history

- **Where.** An orphan branch `ops-status`, never merged and never deployed. The branch root holds a `vercel.json` with `{"git":{"deploymentEnabled":false}}`, and `main`'s `vercel.json` also gets `"ops-status": false` (Vercel `git.deploymentEnabled` supports per-branch and glob keys; docs updated 2026-08-25). After the first commit, check live that Vercel created **no** deployment for `ops-status`. Otherwise Deploy notify would raise failure issues.
- **Files.**
  - `ops/status/latest.md` is human-readable: an overall verdict line, a per-check table with first-failing time, and "last successful run" age.
  - `ops/status/latest.json` is machine-readable for the fixer.
  - `ops/status/history/YYYY-MM-DD.md` gets one appended section per run.
  - Retention: 90 days of daily files, then one `history/YYYY-MM.md` rollup per month. The doctor prunes old files itself.
- **Freshness.** `latest.md` starts with `Generated <UTC time> by run <url>`. The digest flags any check that hasn't run in its expected window, so a stale "green" can't hide.
- **Job summary.** The same table goes to `$GITHUB_STEP_SUMMARY` (1 MiB per step limit, GitHub docs).
- **Pinned issue "Site status".** Its body is replaced on every run with the verdict plus links. It is the one URL the owner bookmarks, and it shows in the GitHub mobile app.
- **Public-repo caution.** The repo is public (F1), so status, issues and history are public. Write technical facts only: no emails, order IDs, revenue or visitor counts. Business numbers go only in the private email digest (ops-17).

### 4.4 Issue lifecycle (replaces today's two separate mechanisms)

- **Matching.** One issue per check id, labelled `site-doctor` and `check:<id>` (plus `auto-fix-candidate` when the class is code-fixable). The body carries the fingerprint `<!-- doctor:check=<id> -->`. The doctor finds existing issues by label, never by title.
- **Opening.** A critical check opens its issue on the first failure. A warning opens after 2 consecutive failures (flap guard).
- **While failing.** The doctor comments only when the failure detail changes, or once every 24 h. Each comment gives evidence (URL, status, console excerpt), the run link and the time.
- **Closing.** The issue closes after 2 consecutive passes, with a comment stating the downtime duration.
- **Deploy failures.** One issue per failing ref (fingerprint `deploy:<ref>`). It closes on that ref's next successful deployment. Previews for `work/*` and `ops-status` are ignored.
- **Rate limits.** `GITHUB_TOKEN` allows 1,000 requests/hour/repo. Content-creating calls are capped at 80/min and 500/h. At about 30 checks per run the doctor stays far below these if it creates or updates only on state change.

Workflow skeleton (the logic lives in `ops/doctor/*.mjs` with its own tests):

```yaml
name: Site doctor
on:
  schedule:
    - cron: '23 */3 * * *'   # off the hour; GitHub delivers ~3-4 h anyway (F3)
    - cron: '41 12 * * 1'    # Monday: weekly profile + digest
  deployment_status:          # quick profile after a production deploy succeeds
  workflow_dispatch:
permissions: { contents: write, issues: write }   # contents only used for ops-status
concurrency: { group: site-doctor, cancel-in-progress: false }
jobs:
  doctor:
    if: github.event_name != 'deployment_status' || (github.event.deployment_status.state == 'success' && github.event.deployment.environment == 'Production')
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v5            # Node-24 major (F12)
      - run: cd ops/doctor && npm ci && npx playwright install --with-deps chromium
      - run: node ops/doctor/run.mjs --profile auto --out results.json
      - run: node ops/doctor/publish.mjs results.json   # ops-status commit, pinned issue, issues, email, routine fire
        env: { GH_TOKEN: '${{ github.token }}', RESEND_API_KEY: '${{ secrets.RESEND_ALERTS_KEY }}', ALERT_TO: '${{ secrets.ALERT_TO }}', ROUTINE_FIRE_URL: '${{ secrets.ROUTINE_FIRE_URL }}', ROUTINE_TOKEN: '${{ secrets.ROUTINE_TOKEN }}' }
      - if: always()
        run: curl -fsS -m 10 "${{ secrets.SENTRY_CRON_URL }}?status=${{ job.status == 'success' && 'ok' || 'error' }}" || true
```

The job succeeds when the doctor **ran**. Failing site checks show up as issues, not as a red job. A red job means the doctor itself broke, and Sentry is told.

### 4.5 Alerting and the weekly digest

- **One push channel: email via Resend**, the provider the site already uses (F31).
  - Use a new Resend key with `permission: sending_access`, restricted by `domain_id` to the site's domain, stored as GitHub secret `RESEND_ALERTS_KEY`.
  - The recipient is kept in secret `ALERT_TO` so no address appears in the public repo.
  - Resend Free allows 100 emails/day and 3,000/month. Expected volume is under 5/day.
- **What gets emailed.**
  - (a) An issue opens: critical immediately, warning after the flap guard.
  - (b) An issue closes (recovered).
  - (c) The **Monday digest**: 7-day availability (from run history), incidents opened and closed with durations, Lighthouse trend, search-engine indexing and clicks (once connected), visitors and leads (private numbers via ops-17), and "checks that did not run".
  - Nothing else. Every email links to the issue or the `ops-status` file.
- **Vercel's own alerts are an optional extra, not a second system.** Vercel anomaly alerts (email/Slack/webhook, docs updated 2026-09-16) apply "minimum activity thresholds" to reduce low-volume noise. On a low-traffic site they may never fire. Turn on email for Error anomaly (5xx) if the plan includes it, and treat it as a bonus.

### 4.6 Watching the watcher

- **Sentry Developer (free)** includes 1 cron monitor and 1 uptime monitor. Use both, and nothing else from Sentry for now.
  - **Cron monitor = dead-man's switch.** The doctor's last step always sends a check-in (`ok` if the doctor ran, `error` if it crashed). The schedule is "at least every 6 h" because GitHub's real cadence is about 3.6 h median and 6.9 h max (F3). If GitHub disables the schedule (60-day rule), Actions has an outage, or the workflow breaks, Sentry emails the owner.
  - **Uptime monitor on `/api/health`** at a 5-minute interval. Sentry confirms after 3 consecutive failures from different regions, which means detection in about 15 minutes. That closes the 3.6-7 h blind spot from GitHub cron.
- The Monday digest also lists `state` for every workflow (`gh api .../actions/workflows`). A `disabled_inactivity` state becomes a critical issue.
- **Sentry's error SDK is not recommended now.** Vercel shows zero runtime errors in 7 days (F22), and the doctor's Playwright pass catches client-side console errors. Revisit if real-user JS errors appear that the crawl can't reproduce.


---

Continued in [`02-always-on-self-checking-monitor-part2.md`](./02-always-on-self-checking-monitor-part2.md): 4.7 add-on verdicts, 4.8 auto-fix loop (routine prompt and guardrails), 4.9 existing workflows, 5 recommendations ops-01 to ops-17, 6 rollout order, 7 not done / UNVERIFIED, 8 sources with dates and read times.