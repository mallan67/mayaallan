# Always-on ops and analytics blueprint - part 2 (sections 6 and 7)

This continues `00-ALWAYS-ON-OPS-BLUEPRINT.md` in the same folder (sections 0 to 5). Same date (2026-09-24), same live-read window (22:11:51Z to 22:20:41Z UTC), same rules: only kept recommendations with corrections, review replacements labelled, audiobook paused.

## 6. Implementation: ordered PRs and owner actions

**Order, as set by the reviews:**
1. Stop the noise first.
2. Amend #57 and merge it before touching the ESLint config, because #57 changes `lint-baseline.json` and lowers the lint ceiling.
3. Put the ruleset in place before any automation.
4. Auto-fix comes last.

Maya reviews and merges every PR herself. "Verify live" means the check that proves a PR works after it deploys; until that check passes, the PR does not count as done.

**PR-0: ci, stop Preview builds for `work/**` and make Deploy notify production-only** (ops-03 part A, ops-06)
- **Scope:**
  - `vercel.json` gets `"git": {"deploymentEnabled": {"work/**": false}}` (minimatch patterns are supported: git-configuration docs, 2026-08-25), and the existing cron stays.
  - Both Deploy notify jobs also require `github.event.deployment.environment == 'Production'`.
  - A failed production deploy opens one issue, `deploy:Production`, which the next successful production deploy closes.
  - New rule: no runnable `.js` files under `docs/`.
- **Files:** `vercel.json`, `.github/workflows/deploy-notify.yml`.
- **Tests:** the existing gates, plus a YAML/actionlint check.
- **Verify live:** the next commit to `work/site-visibility` creates no new Preview. Check with gh api deployments (the count stops rising) and with Vercel list_deployments for that branch, and confirm Deploy notify is skipped for it. Which branch's `vercel.json` Vercel reads for a push is UNVERIFIED. If Previews keep coming, add the same key on the `work/*` branch, or use owner action O5.

**PR-1: amend #57 on its branch `feat/analytics-visibility-2026-09-07`** (ops-01; review replacement for ana-1; ana-5)
- **Scope:**
  - `CookielessAnalytics` returns null when consent is "rejected" or `navigator.globalPrivacyControl` is true.
  - New `sanitizePath()`, used in `<Analytics beforeSend>` (the documented hook: returning null drops the event, and the URL can be rewritten; vercel.com/docs/analytics/package, 2026-06-26) and in the `landing_page` of `MarketingAttributionClient`.
  - Privacy page:
    - remove the "no consent needed" claim, which the 01 review says conflicts with EDPB Guidelines 2/2023 v2.0 (adopted 16 Oct 2024) para 33; the paragraph text was not re-read here;
    - say that Reject and GPC stop the count;
    - name Vercel Web Analytics;
    - state a retention period;
    - bump "Last updated".
  - Tidying the CSP is optional, and only after a Preview shows no violations.
- **Files:** `src/components/AnalyticsGated.tsx`, `src/lib/sanitize-path.ts` (new), `src/components/MarketingAttributionClient.tsx`, `src/app/privacy/page.tsx`, banner copy only if needed, tests.
- **Tests:**
  - `sanitizePath`: `/download/abc` becomes `/download/[token]`, `?orderId=` is dropped and `utm_*` is kept.
  - Contract: no page-view component when consent is rejected or GPC is on.
  - Privacy text: the no-consent claim is gone, and GPC and retention are mentioned.
  - A fresh Quality gates run on Node 24.
- **Verify live**, after Maya merges and turns on WA (O3, O4):
  - `count_pageviews` returns a number instead of `web_analytics_not_enabled`.
  - `aggregate_pageviews` by `requestPath` shows no raw `/download/` token and no `orderId`.
  - `/privacy` shows the new date.
  - `/api/health` `version` equals the merge SHA.
  - Maya confirms in her own browser that "Reject analytics" stops the insights request.

**PR-2: alerts, an instant sale email and the export revenue record** (ana-3, kept, corrected; the export part of the ana-2 replacement)
- **Scope:** section 3.1.
- **Files:** `src/app/api/payment/paypal/webhook/route.ts`, `src/app/api/export/webhook/route.ts`, tests.
- **Tests:**
  - A contract test: each order id triggers exactly one info alert, and only after delivery succeeds.
  - None of the failure paths sends a sale alert.
  - `export_purchased` is inserted once.
- **Verify live:** `/api/admin/test-alert` (Maya, signed in) proves the email path works. The first real sale proves the rest, with a "SALE" email within seconds and one `purchase_completed` row on `/admin/analytics`. Until that sale happens, this PR is **deployed but not proven live**.

**PR-3: ci, Node 24 action majors, a pinned runner, and ESLint ignoring `docs/**`** (ops-04 and ops-03 part B; only after #57 is merged)
- **Scope:**
  - `actions/github-script@v8`. Not v9, which is ESM-only.
  - The Node 24 majors of `actions/checkout`, `actions/setup-node` and `pnpm/action-setup`. Exact versions are to be read at PR time.
  - `runs-on: ubuntu-24.04`, with a dated note to unpin once Ubuntu 26 has been tested.
  - `eslint.config.mjs` ignores `docs/**`.
  - For docs-only changes, Quality gates skips the heavy steps using a changed-files step inside the job, not `paths-ignore`, so that the required `gates` check still reports.
- **Verify live:**
  - The annotations on the next main run show no Node 20 warning (gh api check-runs/<id>/annotations).
  - A docs-only PR's gates run passes in about a minute.

**PR-4: analytics, intent clicks, the missing server events and a bot filter** (review replacement for ana-2)
- **Scope:**
  - `src/lib/track.ts`: sends a beacon to `/api/marketing/event`, is skipped on Reject or GPC, and sends no ID unless the visitor accepted.
  - `data-track` attributes on the book page's retailer links, the PayPal button and the share buttons.
  - Allowlist additions: `retailer_click`, `buy_click`, `share_click`, `journal_downloaded`, `not_found_view`.
  - Server events: `journal_downloaded` in the integration-journal route, `download_started` in `src/app/api/download/[token]/route.ts` and `not_found_view` in `src/app/not-found.tsx`.
  - A known-bot user-agent filter in `/api/marketing/event`.
- **Tests:** an allowlist contract test, sanitizer tests, a bot-filter test, a consent-skip test, and a size budget of under 3 KB for the client code.
- **Verify live:** Maya accepts analytics, clicks one retailer link and opens a missing page. `/admin/analytics` then shows 1 `retailer_click` and 1 `not_found_view` with a sanitized path. The doctor does not POST events.

**PR-5: ops, daily-check cron, Monday digest, status card and health additions** (review replacements for ana-4, ops-10 and ops-17; ops-09; ana-6)
- **Scope:**
  - `vercel.json` gets the cron `/api/cron/daily-check` at `0 12 * * *`. The new route (CRON_SECRET, same pattern as aeo-track) runs A1 and A2, and on Mondays sends the digest (5.3).
  - `/api/health` adds `smtp` (credentials present), `aeo.lastRunAt` and `dailyCheck.lastRunAt`, as timestamps only. The AEO time is read from the Vercel Blob record that `/admin/aeo` already uses (the record's shape is UNVERIFIED).
  - A honeypot-trip counter and an alert counter per severity (Upstash INCR), for the digest.
  - A **System status** card on `/admin/analytics`: the last daily-check and its probe result, whether WA is on, open doctor issues, the last sale and lead times, and the last AEO run.
- **Tests:** 401 without the secret, the probe row is always deleted, the digest has no personal data, the digest goes out only on Monday, and the health fields are present.
- **Verify live:** `/api/health` shows the new fields. The first Monday after deploy brings the digest. The status card shows today's daily-check. Vercel keeps runtime logs only 1 h (Hobby) or 1 day (Pro), so the email and the card are the proof.

**PR-6: ops, doctor-lite, the issue lifecycle and the Sentry check-in** (review replacement for ops-05; ops-06; ops-08; ops-11)
- **Scope:**
  - `health-check.yml` keeps `*/15` and runs `ops/doctor/doctor-lite.mjs` (plain Node, no dependencies) for checks D1 to D11.
  - A weekly job, for example `17 13 * * 1`, runs W1 to W6. Playwright and Lighthouse live in this job only.
  - Issue rules as in 5.1. The 6,000-character body paste is removed.
  - History is kept as Actions artifacts.
  - The final step checks in to the Sentry cron monitor, using the secret SENTRY_CRON_URL.
- **Tests:**
  - Unit tests with fixtures for the fingerprint, the flap guard, close-after-2 and the 7-day reopen.
  - A `--dry-run` flag that prints the issue actions instead of taking them.
- **Verify live:**
  - A run on main shows the check table in the job summary.
  - Sentry shows a check-in for each run.
  - A dry run with a forced failing fixture prints "open" after 2 runs and "close" after 2 passes.
  - D10 shows all three workflows `active`.

**PR-7: site, fix the 404s by hand** (ops-13)
- **Scope:**
  - An RSS feed, justified on its own merits.
  - 308 redirects for `/About`, `/index.html` and `/en`, and for `/media/mushroom-healing` only if a real target exists.
  - A web manifest.
  - A decision on `/es/books`.
- **Verify live:** curl each path and see 308 or 200. The digest's not-found list shrinks.

**PR-8: perf, caching or ISR for static pages** (ops-16)
- **When:** after #57 is merged, because both touch `layout.tsx`, and after 4 weeks of Lighthouse data.
- **Verify live:** a second `GET /` shows `X-Vercel-Cache: HIT` and a public `s-maxage`, and Lighthouse's median is no worse.

**PR-9: ops, the auto-fix workflow, OFF by default** (review replacement for ops-14)
- **When:** not before 2026-10-24, and only when the conditions in 5.4 hold.
- **Verify live:** Maya labels one real doctor issue `autofix-ok`, and a draft PR appears from `claude/`. A fixture that touches a forbidden path fails the guard step, and no PR is opened.

**Later, gated (no PR now):**
- PostHog (ana-7).
- Search Console and Bing API automation (ops-12, after the manual step).
- WA visitor numbers inside the digest.
- The audiobook check X1 and the audiobook card on the book page, both paused by the owner.

### 6.1 Owner actions (toggles, accounts, consents)

| # | Action | When | How to confirm it live |
|---|---|---|---|
| O1 | Confirm the plan in Vercel Billing (Pro or a Pro trial). Hobby does not allow payments, and WA custom events need Pro | Now | Billing page |
| O2 | Add a GitHub ruleset on main: require a PR and the `gates` check, block force-push and deletion. Leave the bypass list empty, or allow bypass for pull requests only. Never let direct pushes bypass it | Now; before PR-9 | `gh api repos/mallan67/mayaallan/rulesets` returns 1 ruleset |
| O3 | Review the PR-1 wording (privacy page and banner), choose the retention period, let the gates re-run, then merge #57 | After PR-1 is pushed | #57 merged; `/api/health` version = the merge SHA |
| O4 | Vercel, project mayaallan, Analytics: Enable | Right after the #57 merge | `count_pageviews` returns a number |
| O5 | If Previews continue after PR-0: set an Ignored Build Step for `work/*` in Vercel project settings (Git) | After PR-0 | No new Preview for `work/*` |
| O6 | GitHub notifications: make sure issue emails for this repo reach the inbox (Watch, Custom, Issues) | Now | A test issue produces an email |
| O7 | Create a free Sentry Developer account (1 user) with: 1 uptime monitor on `https://www.mayaallan.com/api/health` every 5 min, and 1 cron monitor `site-doctor` (interval 6 h, `checkin_margin` 180 min, `failure_issue_threshold` 2). Save the check-in URL as the GitHub secret SENTRY_CRON_URL. The only data Sentry receives is health status | Before PR-6 | The Sentry monitor shows its first check-in |
| O8 | Add HEALTH_CHECK_SECRET as a GitHub secret, with the same value as in Vercel if it is set there (UNVERIFIED; env values were not read) | Before PR-6 | W2 passes |
| O9 | The one-time lead test in 3.2 | Now | Rows in /admin, the SMTP email and the Resend entry |
| O10 | Search Console: confirm the property, submit the sitemap and check coverage. Bing: import the site from Search Console | Now | Both consoles show the sitemap as read |
| O11 | Clean the retailer URLs in `/admin/books/.../retailers`: AbeBooks has Impact affiliate parameters that are likely not hers, B&N has a jsessionid, Bokus has srsltid, and Bookshop has ref=google (01 review, read 19:04Z-19:12Z; not re-read) | Now | Book page links carry no stray parameters |
| O12 | Optional: Vercel team Alerts (5xx anomaly), if it takes only a couple of minutes | Any time | - |
| O13 | Opt in to auto-fix: create the `autofix-ok` label and add the Claude credential secret | Not before 2026-10-24 | 5.4 conditions met |
| O14 | Audiobook: nothing now. When she resumes, decide the book page's "Audiobook" card and switch on X1 | Later | - |

### 6.2 Not done (as of 2026-09-24T22:20Z)

- None of PR-0 to PR-9 exists, and no owner action above has been done.
- Visitors are still not counted (`web_analytics_not_enabled`), and #57 is still open.
- main is still unprotected.
- Plan tier, Search Console status, whether issue emails arrive, and the aeo-track last run are all UNVERIFIED.

## 7. Sources

### 7.1 Live systems, read on 2026-09-24 (UTC)

| Source | What | Read |
|---|---|---|
| `gh api repos/mallan67/mayaallan` | Visibility public, pushed_at | 22:11:51Z |
| `gh api .../branches/main`, `/rulesets`, `/branches/main/protection` | main = ed7461a; 0 rulesets; "Branch not protected" | 22:11:51Z |
| `gh api .../actions/workflows` | 5 active workflows | 22:11:54Z |
| `gh api .../pulls/57`, compare, check-runs; `pulls?state=open`; open issues | #57 state and checks; open PRs #57 and #58 (draft); no open issues | 22:12:07Z-22:12:14Z |
| `gh api .../pulls/57/files`; contents at fa5d59b (`AnalyticsGated.tsx`, `layout.tsx`, `ConsentBanner.tsx`, privacy patch) | Consent, GPC and redaction handling | 22:14:31Z-22:14:50Z |
| `gh api .../actions/workflows/275861895/runs?event=schedule`; run counts today | Cadence, 235/225/5 runs | 22:12:30Z |
| `gh api` contents @main: `vercel.json`, `src/lib/alert-admin.ts`, git tree | Crons, alert API, routes | 22:12:35Z-22:12:37Z |
| `gh api` contents @main: `marketing-events.ts`, PayPal and export webhooks, health, aeo-track, contact, subscribe | Allowlist, alert counts, SMTP, deep mode | 22:12:46Z |
| `gh api` contents @main: `health-check.yml`, `deploy-notify.yml`, `quality-gates.yml`; monitoring docs listing on work/site-visibility | Workflow details | 22:12:57Z |
| `gh api .../deployments` (today) | 235 Preview, 0 Production | 22:13:25Z |
| `gh api` contents @main: `package.json`, tree | Scripts lint/typecheck/test; `@vercel/analytics ^2.0.1`; file paths | 22:20:40Z |
| Vercel MCP `count_pageviews` (project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y) | 400 web_analytics_not_enabled | 22:12Z |
| Vercel MCP `get_project`, `list_deployments` (target production) | Domains, latest Preview, production deployment | 22:13Z |
| `GET https://www.mayaallan.com/api/health` | 200, ok, ed7461a | 22:12:20Z |
| `GET https://www.mayaallan.com/` headers; `/sitemap.xml`; book page | Cache headers, CSP, 38 URLs, audiobook card | 22:12:16Z-22:12:19Z |
| Book page links; security headers; verification meta; alternate domains; `/robots.txt` | Retailer and share hosts; headers; 308s | 22:14:52Z; 22:17:45Z-22:17:56Z |

### 7.2 Documentation (page date where shown; read 2026-09-24)

| URL | Page date | Read |
|---|---|---|
| https://vercel.com/docs/analytics/limits-and-pricing | 2026-08-25 | 22:13:25Z-22:14:07Z |
| https://vercel.com/docs/cron-jobs/usage-and-pricing | 2026-07-15 | same window |
| https://vercel.com/docs/limits | 2026-09-16 | same window |
| https://vercel.com/docs/limits/fair-use-guidelines | 2026-09-14 | same window |
| https://vercel.com/docs/project-configuration/git-configuration | 2026-08-25 | same window |
| https://vercel.com/docs/analytics/package | 2026-06-26 | same window |
| https://sentry.io/pricing/ | not shown | same window |
| https://docs.sentry.io/product/crons/getting-started/http/ | not shown | same window |
| https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows | not shown | same window |
| https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows | not shown | same window |
| https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md | main branch | same window |
| https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/ | 2025-09-19, note 2026-08-25 | 22:14:07Z-22:14:31Z |
| https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en | v2.0 adopted 16 Oct 2024 | 22:14:07Z-22:14:31Z (paragraph 33 not re-read) |

### 7.3 Carried from the reviewed inputs (read earlier on 2026-09-24; not re-read here)

- **01 lens and its review** (commits 96fa88e, d2b28eb):
  - Microsoft Clarity consent and FAQ pages (updated 2025-12-05 and 2026-09-21, read 18:43Z and 19:07:44Z).
  - PostHog pricing, cookieless mode and measured JS sizes (18:46Z-19:11Z).
  - CA AG CCPA page (2026-08-28) and WA MHMDA page (18:48Z).
  - Vercel WA privacy policy (2026-06-26).
  - The retailer URL parameters (19:04Z-19:12Z).
  - "No read-only Vercel token" (Vercel docs 2026-09-08).
  - UptimeRobot Solo pricing.
- **02 lens and its review** (commits e707a6b, d48b432):
  - `treosh/lighthouse-ci-action@v12`.
  - Ubuntu 26 migration dates (runner-images issue #14748).
  - Claude Code routines behaviour (code.claude.com/docs/en/routines, 19:10Z-19:12Z).
  - Vercel alerts (2026-09-09, 2026-09-16) and Drains (2026-09-01) docs.
  - `github-script` v9 being ESM-only.
  - Deployment ref = commit SHA.