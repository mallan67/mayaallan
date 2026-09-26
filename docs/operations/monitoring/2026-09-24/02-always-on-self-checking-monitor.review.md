# Senior review: lens 02 "always-on self-checking monitor"

- Reviewed documents: `02-always-on-self-checking-monitor.md` (blob `aa05568`) and `-part2.md` (blob `b265f16`) on branch `work/site-visibility`. Both were read from the live remote at 19:03:49Z-19:03:50Z (branch head `58aa782`) and re-confirmed unchanged at 19:18:28Z (head `f02a2b5`).
- Owner instruction for this run (2026-09-24): "the audio book is not finished, so please focus on the other stuff first". Audiobook items are out of scope below. One site-facing observation is noted in one line (M13).
- Live sources:
  - GitHub API for `mallan67/mayaallan`.
  - Vercel MCP scoped to project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`.
  - HTTP GET/HEAD to https://www.mayaallan.com.
  - Vendor pages via WebFetch.
- Every time below is UTC on 2026-09-24. No local files, caches or earlier reports were used. Nothing was changed except this file (assembled from unreferenced chunk blobs because of the Windows command-length limit).
- My own re-check sent one GET to each watched 404 path. That adds about 1 hit per path to Vercel's counts.

## 0. Verdict

The lens is careful and its facts mostly hold. The design, however, is **overbuilt for a solo author with zero leads**, and it points her attention at the wrong place.

1. **Uptime is not why there are zero leads.** The site is healthy: 38/38 pages return 200, there are no runtime errors in 7 days, and `/api/health` is ok. The most valuable work is:
   - measuring visitors (ops-01);
   - proving the lead path once, by hand;
   - confirming that search engines index the site.

   A large Playwright "doctor" with 4-5 new external pieces is not the priority.
2. **"One place: GitHub" is not one place for this owner.** The lens adds:
   - an `ops-status` branch;
   - a pinned issue and per-check issues;
   - Sentry and a new Resend key;
   - a Claude routine;
   - Search Console and Bing APIs;
   - Lighthouse;
   - a private summary endpoint.

   The owner already has a private dashboard at **`/admin/analytics`**, with signups, contacts, checkout starts, purchases, revenue, funnel and campaigns (live source, `main` `ed7461a`). The app also **already emails her on payment, download, SMTP and Resend failures** through `alertAdmin()`. The living system should be **email (push) + `/admin` (pull)**. GitHub stays a backend.
3. **Two design bugs found live.**
   - (a) Vercel's GitHub deployments carry `ref = <commit SHA>`, never a branch name. The lens's per-ref deploy-issue dedup/close logic (ops-06) can never close an issue, and its `work/*` preview filter can't match.
   - (b) The lens reasons that GitHub "delivers ~3-4 h anyway", so it drops the cron from `*/15` to every 3 h. That could make runs *rarer*, not equal.
4. **The biggest live noise and cost source today is this audit itself.** At 19:16:31Z there were:
   - **205** preview deployments today;
   - **176** Deploy notify runs (each one probes production `/api/health`);
   - **170** Quality gates runs.

   The lens's 7-day 404/200 evidence is inflated by audit traffic: 404s went from 235 to 430 in about 34 min. Stopping `work/*` auto-deploys (ops-03) should be step 1.
5. **Policy gap.** Vercel Hobby is **non-commercial only**, and this site takes PayPal payments. Live evidence suggests the team is not on Hobby (see M1), but the lens's "recurring cost $0" ignores the Vercel plan the site must be on.

## 1. Fact re-checks (live)

| # | Lens fact | Holds | Live evidence (read time) |
|---|---|---|---|
| 1 | Repo public; 5 active workflows | **true** | `visibility=public`. Active: Health check, Quality gates, Deploy notify, Ch1 Independent Audio Analysis, Export Ch1 Audio Review (19:05:42Z) |
| 2 | health-check.yml `*/15`, probes only `/api/health`, opens/closes `health-incident` issues with github-script@v7 | **true** | contents @ main `ed7461a` (19:05:50Z). It also posts up to 6,000 chars of the response body into a **public** issue (see M16) |
| 3 | Last 100 scheduled runs: gaps min 1.84 / median 3.63 / p90 5.46 / max 6.87 h | **true** | Recomputed exactly: n=100, 2026-09-09T11:56Z to 2026-09-24T16:44Z, 4-8 runs/day (19:06:02Z) |
| 4 | 4 failures, all infrastructure; only real incident #14 (503), 05-21 01:20Z-05:31Z | **true** | Failures: 05-26 (set-up failed); 07-16 (close step failed); 08-06 x2 (run=failure, job=cancelled). One more run cancelled on 08-06. Only `health-incident` issue is #14 (19:06:17Z) |
| 5 | deploy-failure #13/#38 open 110/53 days; no dedup/auto-close; success path probes production for previews | **true** | #13 05-19 to 09-06; #38 07-15 to 09-06. Issue titles carry a **SHA**, not a branch (19:06:17Z) |
| 6 | Today 58 Deploy notify / 60 Quality gates runs (53 cancelled, 2 failed) | **false (stale)** | At 19:07:02Z: **176** Deploy notify (all `work/site-visibility`, all success) and **170** Quality gates (163 cancelled, 3 success, 2 failed, 2 running). At 19:16:31Z: 205 Preview deployments, 0 Production. The noise triples while the audit runs |
| 7 | PR #58 lint: 194 problems, 1 `no-require-imports` error in `docs/.../crawl/*.js`, vs `--max-warnings 172` | **true** | job 107776676358 (head `7df151f`): error in `crawl/c1.js`, plus unused-var warnings from `c1`-`c4.js` (19:07:25Z). PR head is now `08c74ae`; later runs cancelled |
| 8 | `main` unprotected; no rulesets | **true** | `protected=false`; `/rulesets` returns `[]`; `/protection` returns "Branch not protected" (404, not an upgrade error, so the feature is available) (19:05:42Z) |
| 9 | Latest Health check run: Node 20 deprecation + Ubuntu 26 migration | **true** (nuance) | (a) is a *warning*; (b) is a *notice* (19:07:35Z). Quality gates also warns for `actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4` (19:12:11Z) |
| 10 | `/api/health` 200, ok, cheap, 7 checks, version `ed7461a`, production | **true** | 200 in 0.39 s, database 70 ms (19:07:47Z) |
| 11 | Sitemap 38 URLs all 200, no X-Robots-Tag; robots allows search and AI crawlers | **true** | 38/38 200; slowest 0.84 s (book page) (19:07:56Z-19:08:34Z) |
| 12 | Crawler UAs 200; alternate domains 308 to www | **true** | 5 UAs 200; 7 hosts 308 to `https://www.mayaallan.com/` (19:08:42Z) |
| 13 | Web Analytics not enabled; PR #57 open and clean since 09-07 | **true** | `count_pageviews` returns 400 `web_analytics_not_enabled` (~19:10:30Z). #57: `mergeable_state=clean`, base `ed7461a`, but its checks last ran **2026-09-07**, before Node 20 was removed (19:09:54Z) |
| 14 | 7-day logs: 200=7,613, 404=235, 405=10; top 404s feeds, `/BingSiteAuth.xml` (10), `/About`, ... | **false (counts)** | ~19:13Z: 200=**10,308**, 404=**430**, 405=11. `/BingSiteAuth.xml` 20, `/About` 14, `/media/mushroom-healing` 10, `/feed.xml` 25. Same paths, but counts almost doubled in ~34 min. The evidence is contaminated by audit probes. `get_runtime_errors` 7d: none (**true**) |
| 15 | Insights script skips `navigator.webdriver` / "Headless" | **true** | script 200, function `r()` checks both (19:16:16Z) |
| 16 | Lead forms: honeypot only, no test mode; alertAdmin emails ADMIN_EMAIL via Resend with Upstash dedup | **true, incomplete** | The **owner's lead notifications go through Porkbun SMTP (nodemailer)**, not Resend. `alertAdmin` (Resend) is only the failure path. With no SMTP env there is no notification **and no alert** (`if (transporter)`). See M3 (19:09:21Z-19:09:38Z) |
| 17 | Node 20 removed from runners 2026-09-23; Node 24 default since 2026-06-16 | **true** | GitHub changelog 2025-09-19, editor's note updated 2026-08-25 (19:10:33Z-19:12:11Z) |
| 18 | Claude routines: research preview; 1 h minimum; `/fire` text wrapped untrusted; `claude/` branches; all connectors by default | **true** | code.claude.com/docs/en/routines. Also: GitHub triggers cover **pull requests and releases only**; runs act as the owner's GitHub user; there is a daily run cap; a routine **turns itself off after 72 h** without a GitHub connection (19:10:33Z-19:12:11Z) |
| 19 | Sentry Developer: 5k errors, 1 uptime + 1 cron monitor; uptime 1-60 min; issue after 3 consecutive multi-region failures | **true** | Also "Limited to one user", 30-day lookback, email alerts. The failure threshold is configurable; recovery takes 1 success (19:10:33Z-19:12:11Z) |

Resolved from the lens's UNVERIFIED list: the `deployment_status` environment string is **`Production`**. GitHub environments are `Preview` and `Production`, and production deployments show `env=Production` (19:06:35Z).

## 2. Recommendation verdicts

| Id | Keep | Verdict and correction | Source re-check |
|---|---|---|---|
| ops-01 | **yes** | Right first move. Before merging #57: (1) re-run its Quality gates, since the checks are 17 days old and pre-date the Node 20 removal (an owner action; this review does not dispatch runs); (2) merge #57 **before** the ESLint/`docs/**` change, because #57 lowers the lint ceiling 172 to 171 and regenerates `lint-baseline.json`; (3) the owner reads the privacy page and banner copy #57 changes. #57 makes page views consent-free on the basis that nothing is stored on the device (no cookie or identifier); EU-language pages exist, so the privacy page must name Vercel Web Analytics, and #57 does that. Hobby: 50k events/month, then collection pauses; Pro: $0.03/1k events, no included events; custom events are Pro only | vercel.com/docs/analytics/limits-and-pricing (updated 2026-08-25), read 19:10:33Z-19:12:11Z; PR #57 files/body 19:09:54Z |
| ops-02 | **yes** | Feasible (rulesets API live for this repo). Correction: do **not** let "owner may bypass" cover direct pushes. Any automation that runs as the owner's identity (the lens's routine) would inherit that bypass. Use bypass "for pull requests only", or no bypass. All `main` commits since 09-05 arrived through PR merges (#49-#56), so this matches how she works | gh api branches/main, rulesets 19:05:42Z; commits/pulls 19:14:37Z |
| ops-03 | **yes, do first** | (a) `ignores: ["docs/**"]` is fine, but the root cause is the audit committing runnable `.js` under `docs/`. Store evidence tools as `.txt`/`.md`, or outside the lint scope. (b) Use `"work/**": false`: minimatch `*` does not cross `/`, but `work/*` does match `work/site-visibility`. The docs don't say which `vercel.json` Vercel reads (UNVERIFIED), so the setting must also be present on the existing `work/*` branch commits, not only `main`. (c) Add `if: github.event.deployment.environment == 'Production'` to both Deploy notify jobs. That removes today's 176 preview-triggered production probes | vercel.com/docs/project-configuration/git-configuration (2026-08-25); live counts 19:07:02Z/19:16:31Z |
| ops-04 | **yes** | Also bump `actions/setup-node@v4` and `pnpm/action-setup@v4` (live annotation). The lens listed only checkout and github-script. `github-script` **v9 has breaking changes** (ESM-only; `require('@actions/github')` removed; redeclaring `getOctokit` errors). The current scripts use only `github.rest`/`context`, so v8 is the minimal Node-24 target. This is hygiene, not an outage: the old actions are forced onto Node 24 and runs succeed. Pin `ubuntu-24.04` with a dated note to unpin: the migration runs 2026-10-19 to 2026-11-19 | github.com/actions/checkout (README @v7; v5 = node24), github.com/actions/github-script (README @v9; v8 = Node 24), runner-images issue #14748, read 19:10:33Z-19:12:11Z |
| ops-05 | **no** | Overbuilt (L effort; Playwright desktop + mobile every 3 h; orphan `ops-status` branch with pruning and rollups; pinned issue; a second Vercel-deploy risk). The cron change is also backwards (see M9). **Correction, "doctor-lite":** extend the existing Health check (keep `*/15`) with curl-level checks: sitemap 200 sweep, version drift, robots/sitemap, crawler UAs, security headers, form markup present (forms are server-rendered, confirmed live), workflow `state`. Run **weekly**: Playwright (PayPal button render, console errors), `?deep=1` health (M6) and Lighthouse. Keep history as `results.json` Actions artifacts instead of a branch. Send a `User-Agent: mayaallan-site-doctor/1` so its hits can be filtered from logs (M2) | GitHub docs events-that-trigger-workflows (schedule delays; latest commit on default branch) 19:10:33Z-19:12:11Z |
| ops-06 | **yes, corrected** | One issue per check id, with a flap guard, is right. Build it by generalizing the existing `health-incident` code rather than rewriting. **Bug:** every Vercel GitHub deployment has `ref = <commit SHA>` (live), and `GITHUB_REF` is empty for SHA deployments (GitHub docs). So `deploy:<ref>` never recurs and never closes. Open deploy issues only for `environment == 'Production'` and fingerprint on the environment; ignore Preview failures entirely | gh api deployments 19:06:35Z; GitHub docs deployment_status |
| ops-07 | **no** | It adds a second sender and a new key to rotate. Technical alerts: GitHub already emails the repo owner about new issues opened by `github-actions[bot]` (depends on her watch/notification settings, UNVERIFIED). App failures: the existing `alertAdmin` to ADMIN_EMAIL path. The weekly digest belongs in the app (see ops-17). The Resend numbers are correct if ever needed: Free 3,000/mo, 100/day, 3 domains; `sending_access` + `domain_id` exist | resend.com/pricing; resend.com/docs/api-reference/api-keys/create-api-key, read 19:10:33Z-19:12:11Z |
| ops-08 | **yes, corrected** | Worth it: it is the only external watcher. Uptime on `/api/health` every 5 min with 3 failures means about 15 min detection. **Correction:** "check-in at least every 6 h" will false-alarm, because GitHub's real max gap is 6.87 h (fact 3). Use an interval of 6 h **plus** `checkin_margin` of at least 180 min, and `failure_issue_threshold` 2. The free plan is 1 user, which fits. It emails only, so there is no dashboard to visit | sentry.io/pricing; docs.sentry.io/product/uptime-monitoring; docs.sentry.io/product/crons/getting-started/http (interval schedule, `checkin_margin` in minutes), read 19:10:33Z-19:12:11Z |
| ops-09 | **yes, low priority** | Fine and small. Read the same Vercel Blob record `/admin/aeo` already uses rather than a new store (storage named on that page; exact record shape UNVERIFIED). Timestamps only | `src/app/admin/aeo/page.tsx` @ main 19:12:37Z |
| ops-10 | **no** | It adds an auth-bypass path and a schema change to live lead handlers. It also **skips exactly the parts that fail silently** (SMTP notification, Resend sync), so a passing canary proves little. **Correction:** (1) today the owner submits her own address once on `/` and `/contact`, then confirms the row in `/admin/subscribers` and `/admin/contact`, the "New Newsletter Subscriber" email (Porkbun SMTP), and the Resend segment entry; (2) add `smtp` to `/api/health` (M3); (3) count honeypot trips without PII (M4); (4) the digest shows lead counts from the DB | `src/app/api/subscribe/route.ts`, `contact/route.ts` @ main 19:09:21Z-19:09:38Z |
| ops-11 | **yes, as info only** | GitHub runners are noisy, and a ratchet that opens issues will flap and train the owner to ignore alerts. Put 3 URLs (home, book, contact) on mobile, 3 runs median, into the digest only. Consider ratchets after 4 weeks of variance data | github.com/treosh/lighthouse-ci-action (v12, Lighthouse 12.6; warns single runs are flaky), read 19:10:33Z-19:12:11Z |
| ops-12 | **yes, manual first** | With zero leads, *is the site indexed?* matters more than any uptime check. There is no `google-site-verification` or `msvalidate.01` meta on the home page (live), and it may be DNS-verified (UNVERIFIED). The owner should first check in Search Console that the property is verified and the sitemap submitted. For Bing, "import from Google Search Console" removes the need for `BingSiteAuth.xml`. The `/BingSiteAuth.xml` 404s are at least partly audit probes (10 to 20 in 34 min). API automation comes later. Note: a Bing API key is **per user and covers all her verified sites**, so store it only as a secret | developers.google.com/webmaster-tools/limits (2025-08-28: 2,000 QPD / 600 QPM per site); learn.microsoft.com/en-us/bingwebmaster/getting-access (updated 2022-10-13), read 19:10:33Z-19:12:11Z; home HTML 19:09:02Z |
| ops-13 | **yes, one hand-made PR** | Cheap and fine, but the "why" is weak because the counts are audit-inflated (fact 14). The feed paths recur, but many clients probe for feeds speculatively. A real blog RSS feed is justified on its own (feed readers and aggregators can find the blog). `/About` to `/about` and `/index.html` to `/` are good. Redirect `/media/mushroom-healing` only if a real target exists. An `apple-touch-icon` is already declared via `<link>` to Blob (live), so a root file is low value. **Not** fixer candidates: do it once | Vercel MCP get_runtime_logs group_by ~19:13Z; GETs 19:08:42Z |
| ops-14 | **no (defer 30+ days)** | Premature. The site is healthy and the candidate fixes are one-off. The routine adds a review burden, runs as her GitHub identity, is a research preview, has a daily cap, and **turns itself off after 72 h** without a GitHub connection: another way to become a dead component. Its GitHub triggers cover PRs and releases only, so issue-driven runs need the API token path. If it is ever wanted, use the lens's own fallback: `claude-code-action` on an owner-applied label, so a human starts every run | code.claude.com/docs/en/routines, read 19:10:33Z-19:12:11Z |
| ops-15 | **yes, optional** | Harmless. The docs pages (2026-09-09, 2026-09-16) do not state plan gating, and the minimum-activity thresholds mean it will likely stay silent at this traffic. Do it only if it takes 2 minutes | vercel.com/docs/alerts; /docs/alerts/configure-alerts, read 19:10:33Z-19:12:11Z |
| ops-16 | **yes, later** | Confirmed live: `Cache-Control: private, no-cache, no-store`, `X-Vercel-Cache: MISS` on `/`. This is performance work, not monitoring. Start after #57 merges, since #57 edits `layout.tsx` | GET / headers 19:07:47Z |
| ops-17 | **no** | It duplicates the existing private `/admin/analytics` (signups, contacts, checkout starts, purchases, revenue, funnel, campaigns) and adds a bearer-token endpoint to a public site. **Correction:** a weekly app-side digest. Use a Vercel cron route (the app already has cron and the `CRON_SECRET` pattern) and send through the app's existing email path. It links to `/admin/analytics`, so no business number ever leaves the app for GitHub | `src/app/admin/analytics/page.tsx` @ main 19:12:37Z; `vercel.json` @ main 19:12:11Z |

## 3. What the lens missed

- **M1. Vercel commercial-use policy.**
  - The fair-use guidelines (updated 2026-09-14) say: "Hobby teams are restricted to non-commercial personal use only". "Any method of requesting or processing payment from visitors" counts as commercial. This site sells a $9.99 ebook through PayPal, so it needs **Pro** ($20/mo per seat, vercel.com/pricing, ~19:14Z).
  - Live evidence suggests Pro already. 205 preview deployments were created today; 10 of 10 sampled succeeded, with ~30 inside 5 minutes around 19:01Z-19:06Z. Hobby allows 100 per day and 60 per 5 minutes (vercel.com/docs/limits, 2026-09-16).
  - Still **UNVERIFIED**: the owner confirms in Team Settings > Billing. Either way, the lens's "recurring cost $0" is wrong: Vercel Pro is a recurring cost, and Web Analytics bills against its credit.
- **M2. The audit is the noise.** Today's 205 preview builds, 176 production health probes from Deploy notify, and 170 CI runs come from commits to `work/site-visibility`. Audit GETs also inflate the 7-day log counts that ops-13 relies on.
  - Fix ops-03 before anything else.
  - Give every automated probe an identifying User-Agent so it can be filtered out of logs.
- **M3. The lead-notification path has no health signal.**
  - Owner notifications for signups and contacts go through **Porkbun SMTP** (`smtp.porkbun.com:587`).
  - `/api/health` checks database, resend, blob, paypal, session, admin and upstash, but **not SMTP**.
  - If `SMTP_USER`/`SMTP_PASS` are missing, the routes skip the notification with **no alert**.
  - Fix: add an `smtp` check (env presence in cheap mode, `transporter.verify()` in deep mode).
- **M4. Silent honeypot.** A filled `company` field returns success and is neither stored nor counted.
  - The field is off-screen, `aria-hidden`, `tabindex=-1`, `autoComplete="off"` (live HTML).
  - Autofill or password-manager false positives are unlikely but not impossible, and would be invisible.
  - Fix: count honeypot trips (no PII) in `marketing_events` and show the count in the digest.
- **M5. The existing assets were not used.**
  - `/admin/analytics` has the business numbers.
  - `/api/admin/test-alert` already tests the alert email end to end.
  - Payment and download routes already call `alertAdmin` (9-26 call sites each, live).
  - The monitor should build on these, not run beside them.
- **M6. Deep health is never used.** Cheap mode only checks that Resend, PayPal and Blob keys *exist*, so credential rot is invisible. Run `?deep=1` with `HEALTH_CHECK_SECRET` **weekly**. The route's own comment warns that deep checks every 15 min would burn rate limits.
- **M7. Ebook delivery is by email** ("instant download emailed after payment", live book page), which makes email deliverability revenue-critical. No check covers the sending domain's verification status or DMARC. What `deepResend()` asserts beyond an HTTP 200 on `/domains` is UNVERIFIED.
- **M8. Vercel deployment refs are SHAs** (live). This breaks ops-06 as written (see §2).
- **M9. The cadence logic is inverted.** `*/15` produced about 6-7 runs a day. Nothing shows that a 3-hourly cron would still arrive every 3.6 h; if runs are skipped per trigger, it could arrive much less often (mechanism UNVERIFIED). Keep frequent, cheap curl checks, and let Sentry uptime give the fast signal.
- **M10. Routine failure modes** that are not in the lens:
  - it turns itself off after 72 h without a GitHub connection;
  - a green run status does not mean the task succeeded (docs);
  - it has no issue trigger.
- **M11. Ruleset bypass** would let automation that runs as the owner push to `main` (see ops-02).
- **M12. External-link check realities.**
  - Scripted GETs got **403** from bookshop.org and waterstones.com and **429** from bokus.com, while Amazon, B&N, Google Play and AbeBooks returned 200 (19:13:20Z). Treat 403 and 429 as "unknown", never as a failure.
  - The retailer URLs on the book page carry third-party tracking junk: a `jsessionid`, an Impact affiliate `clickid`, `srsltid` and an IndieBound `ref`. Clean them. Whose affiliate account the AbeBooks click credits is UNVERIFIED.
- **M13. Audiobook (deferred per owner):** the live book page shows an "Audiobook $15.99" format while the audiobook is unfinished. This is noted only; the owner decides when.
- **M14. Search visibility first.** For "zero leads", confirming Search Console and Bing verification, sitemap submission and indexing (a manual 10-minute check) is worth more than Lighthouse or Playwright.
- **M15. PR #57 is stale.** Its CI is from 2026-09-07; re-run it before merging (see ops-01).
- **M16. Public issue bodies.** `health-check.yml` pastes up to 6,000 chars of response body into public issues. In a public repo, keep failure evidence to status codes, URLs and times.

## 4. Corrected plan (smallest thing that works)

1. **Today, owner (about 20 min):**
   - Confirm the Vercel plan (M1).
   - Enable Web Analytics.
   - Submit her own email once on the newsletter form and once on the contact form, then confirm the DB rows in `/admin`, the SMTP notification emails and the Resend segment entry.
   - Trigger the admin test alert (the route exists and needs an admin session; whether the admin UI has a button for it is UNVERIFIED).
   - Check Search Console: property verified, sitemap submitted, pages indexed.
2. **One small PR (code):**
   - ops-03 (with `work/**` and the Deploy notify environment filter);
   - ops-04 (all four action families);
   - the `smtp` health check (M3) and the honeypot counter (M4);
   - the ops-13 hand fixes.
   - Merge #57 first, after re-running its CI.
3. **Owner settings:** ops-02 (bypass for PRs only). Sentry uptime + cron (ops-08, with the margin fix).
4. **Doctor-lite** inside Health check, with the ops-06 lifecycle (production-only deploy issues) and weekly deep health, Playwright and Lighthouse as information.
5. **App-side weekly digest email** (replaces ops-07 and ops-17).
6. **Later, if still wanted:** Search Console and Bing APIs (ops-12), the aeo heartbeat (ops-09), caching (ops-16), Vercel anomaly alerts (ops-15).

**Rejected for now:** full ops-05, ops-07, ops-10, ops-14, ops-17.

## 5. Positions on the lens's open questions

1. **Public status and issues:** acceptable if they carry technical facts only, and no response bodies (M16).
2. **Alert address:** the existing ADMIN_EMAIL and GitHub account email. The corrected plan needs no new Resend key.
3. **Sentry free account:** recommended. It is the only external watcher and only sends email.
4. **Claude routine opening PRs as her user:** not now (ops-14).
5. **Search Console and Bing:** a manual check first; API credentials later.
6. **Audiobook sample check:** deferred per the owner's 2026-09-24 instruction.

## 6. UNVERIFIED / not done

- Vercel team plan: inferred from deployment volume, not read directly, because the Vercel scope is project-only.
- Which `vercel.json` (branch vs `main`) governs `git.deploymentEnabled`.
- Whether GitHub skips scheduled runs per trigger (M9).
- Search Console and Bing verification method and indexing state.
- The owner's GitHub notification settings.
- What `deepResend()` asserts.
- Whose affiliate account the AbeBooks link credits.
- The Vercel Drains page was not re-fetched. The "no Drains" verdict stands without it.
- WebSearch budget was exhausted, so only WebFetch was used for vendor pages.
- Nothing was built or changed, apart from this review file.

## 7. Sources (all read 2026-09-24, UTC)

| Source | Page date | Read |
|---|---|---|
| GitHub API `mallan67/mayaallan`: repo, workflows, runs, jobs, logs, annotations, issues, pulls #57/#58, branches, rulesets, deployments + statuses, environments, contents @ `ed7461a` | live | 19:03:42Z-19:18:28Z |
| Vercel MCP (project scope): `get_project`, `get_runtime_errors` 7d, `count_pageviews`, `get_runtime_logs` group_by statusCode / requestPath (404) | live | ~19:10:30Z; ~19:13Z |
| https://www.mayaallan.com: `/api/health`, `/`, `/contact`, book page, `/sitemap.xml` + 38 URLs, `/robots.txt`, 5 crawler UAs, 7 alternate hosts, 404 watchlist, `/_vercel/insights/script.js`, retailer links | live | 19:07:47Z-19:16:16Z |
| https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/ (Node 20 **DEAD** 2026-09-23) | 2025-09-19, note 2026-08-25 | 19:10:33Z-19:12:11Z |
| https://code.claude.com/docs/en/routines | n/a | 19:10:33Z-19:12:11Z |
| https://sentry.io/pricing/ ; https://docs.sentry.io/product/uptime-monitoring/ ; https://docs.sentry.io/product/crons/getting-started/http/ | n/a | 19:10:33Z-19:12:11Z |
| https://vercel.com/docs/analytics/limits-and-pricing | 2026-08-25 | 19:10:33Z-19:12:11Z |
| https://vercel.com/docs/limits/fair-use-guidelines (Hobby = non-commercial) | 2026-09-14 | 19:10:33Z-19:12:11Z |
| https://vercel.com/docs/project-configuration/git-configuration | 2026-08-25 | 19:10:33Z-19:12:11Z |
| https://vercel.com/docs/alerts ; https://vercel.com/docs/alerts/configure-alerts | 2026-09-09 ; 2026-09-16 | 19:10:33Z-19:12:11Z |
| https://vercel.com/docs/limits (Hobby 100 deployments/day, 60 per 5 min) | 2026-09-16 | ~19:16Z |
| https://vercel.com/pricing (Pro $20/mo per seat; Hobby "personal, non-commercial") | n/a | ~19:14Z |
| https://resend.com/pricing ; https://resend.com/docs/api-reference/api-keys/create-api-key | n/a | 19:10:33Z-19:12:11Z |
| https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows ; .../events-that-trigger-workflows ; .../billing/concepts/product-billing/github-actions ; .../rest/using-the-rest-api/rate-limits-for-the-rest-api | n/a | 19:10:33Z-19:12:11Z |
| https://docs.github.com/en/repositories/.../about-rulesets ; .../about-protected-branches (availability wording inconclusive via summarizer; the live API is the proof) | n/a | ~19:14Z-19:15Z |
| https://github.com/actions/checkout ; https://github.com/actions/github-script ; https://github.com/actions/runner-images/issues/14748 | n/a | 19:10:33Z-19:12:11Z |
| https://playwright.dev/docs/release-notes (1.63) ; https://github.com/treosh/lighthouse-ci-action (v12) | n/a | 19:10:33Z-19:12:11Z |
| https://developers.google.com/webmaster-tools/limits | 2025-08-28 | 19:10:33Z-19:12:11Z |
| https://learn.microsoft.com/en-us/bingwebmaster/getting-access | 2022-10-13 | 19:10:33Z-19:12:11Z |
| https://uptimerobot.com/pricing/ (free "Good for hobby and non-profit projects"; Solo $12/mo) | n/a | 19:10:33Z-19:12:11Z |

Marked DEAD or deprecated (confirmed): Node 20 on GitHub-hosted runners (removed 2026-09-23); Vercel `github.silent` / `github.enabled` (deprecated, git-configuration page, 2026-08-25).