# Adversarial verification: lens "visitors-clicks" (analytics)

- **Audit under test:** `docs/operations/evidence/2026-09-24/audit-visitors-clicks.md` on branch `work/site-visibility`, commit `afbf383939335c55057743877ec37f37823515a1`. The file exists live (blob `02284987…`, 30,370 bytes, `gh api contents`, 2026-09-24T18:46:13Z). The findings were checked as the orchestrator supplied them for that file.
- **Verification window (UTC):** 2026-09-24T18:46:13Z to 18:58Z.
- **Sources (all live, read in the window above):**
  - Vercel MCP, project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`, team `team_kZQh5NYLyrOKqffK0r9EXf4E`: count_pageviews, count_events, aggregate_pageviews, get_project, get_deployment, list_deployments, get_runtime_logs, get_runtime_errors, get_observability_schema, create_observability_query, list_drains. One web_fetch_vercel_url attempt on the PR #57 preview returned a 302 redirect to Vercel SSO. I stopped there and did not follow it.
  - curl GET/HEAD requests to `https://www.mayaallan.com/*` (29 pages and 23 JS chunks) and to the project's other domains, to check redirects.
  - `gh api repos/mallan67/mayaallan`: pulls/57 (metadata, reviews, comments, file names), commit status, check-runs, actions/runs, commits/main, compare.
- **Not used:** local files, scratch or temp folders, the Playwright browser, repository source files, any POST to the site, any /api/cron, /api/admin or /api/indexnow call.
- **Method:** every finding was re-run live with at least 2 observations. For each one I tried to refute it by checking for: a transient blip (retries), a wrong URL, a query artefact (checked with positive controls), CDN caching that could hide visits, and a mis-set severity. Severity is judged for a small author site whose owner says it is "not seen anywhere".
- **Saved in parts:** this file was committed in several steps. Each step fetched the live file from GitHub and appended the next section. The final commit holds the complete file.

## Verdict table

| id | verdict | audit severity | verified severity | reason (short) |
|---|---|---|---|---|
| ana-01 | confirmed | critical | **critical** | 3 of 3 Web Analytics API calls returned 400 `web_analytics_not_enabled` at about 18:46Z. PR #57's live description says the same. |
| ana-02 | confirmed | critical | **high** | The live gate `"accepted"!==useConsent()?null:<Analytics/>` was reproduced. It reduces the count to visitors who accept; it does not cause the zero on its own. ana-01 is the single root blocker. |
| ana-03 | confirmed (overstated) | high | **medium** | There are no click events. However, the PayPal Buy button goes to the site's own page `/checkout/privacy-gate?bookId=…`, so buy intent can be seen once ana-01 and ana-02 are fixed. Retailer and outbound clicks are the real gap. |
| ana-04 | confirmed | high | **medium** | ExceedsBillingLimitError came back again. Retention is a rolling ~24 hours. Past data cannot be recovered by any fix, and the forward fix is ana-01. |
| ana-05 | confirmed | high | **high** | Baseline 0 for `/api/marketing*`, `/api/tools*` and `/api/checkout*`, with working positive controls. Pages are served `no-store`, so the CDN cannot hide visits. "No sign" is accurate; "zero humans" is not proven. |
| ana-06 | confirmed | medium | **low** | There is no `@vercel/speed-insights` SDK in 23 chunks. With near-zero real visitors, field data would be empty anyway. |
| ana-07 | partially confirmed | medium | **low** | Vercel Web Analytics is not named, and book_viewed is not described. Showing the banner worldwide is stricter than the policy, not contrary to it. The Supabase claim cannot be shown wrong from live behaviour. |
| ana-08 | confirmed | medium | **medium** | Open, clean, based on the current main HEAD, checks green, preview READY. Production is still built from main `ed7461a`. |
| ana-09 | confirmed | low | **low** | 6 Health check runs match /api/health 6. Both sweeps were reproduced. No repo workflow ran at those times. |
| ana-10 | confirmed (window understated) | info | **info** | 75, then 2,107, then 7,386+ log lines. Pollution continued through the verifier runs, so the polluted window ends about 2026-09-25T19:00Z or later, not 18:40Z. |

No finding was refuted. Five severities were lowered: ana-02, ana-03, ana-04, ana-06 and ana-07.

## Per-finding detail

### ana-01: Web Analytics switched off (CONFIRMED, critical)
| check | source / tool call | UTC read | result |
|---|---|---|---|
| page views, 90 days | count_pageviews since 2026-06-26T00:00Z until 2026-09-24T18:46Z | ~18:46:20Z | 400 `web_analytics_not_enabled` |
| custom events, 1 month | count_events since 2026-08-24 until 18:46Z | ~18:46:20Z | 400 `web_analytics_not_enabled` |
| daily page views | aggregate_pageviews by day, 2026-08-24 to 18:47Z | ~18:46:40Z | 400 `web_analytics_not_enabled` |
| scope sanity | get_project with the same ids | ~18:46:20Z | 200 OK, so the error is not a scope or permission artefact |
| independent statement | PR #57 body (gh api pulls/57) | 18:54:13Z | "Vercel Web Analytics is disabled at the project level" |

- **Refutation attempts:** I tried three tools and different date ranges; the error code was the same explicit one every time.
- **Solution check:** The fix is right and needed: an owner dashboard toggle, with no code or CSP change (see the works checks). Two limits:
  1. Counting starts only when the switch is turned on.
  2. Until PR #57 is merged, only visitors who click Accept are counted.
- **How to check it worked:** count_pageviews returning `0` or any number (not 400) proves the switch is on.

### ana-02: Analytics loads only after "Accept all" (CONFIRMED, severity lowered to high)
| check | source | UTC read | result |
|---|---|---|---|
| gate still live | GET /_next/static/chunks/312c5210c9c35dc5.js (22,515 B); the home page still references it | 18:46:47Z–18:46:54Z | `function P(){return"accepted"!==(0,S.useConsent)()?null:(0,t.jsx)(f,{})}` and `function k(){…(E)}`, exported as GatedAnalytics and GatedMarketing |
| what the gate hides | the same chunk, module 10330 | 18:47:09Z | `f` = Suspense wrapper around the @vercel/analytics 2.0.1 component (script `/_vercel/insights/script.js` or `9de18cd67c0a6252/script.js`). `E` sets `ma_visitor_id` (2 years) and `ma_session_id` (30 minutes), then POSTs /api/marketing/visitor |
| banner scope | the same chunk, module 14873 | 18:47:00Z | Consent is stored in localStorage `mayaallan_consent_v1`. The banner shows whenever the value is null. There is no region check, so everyone worldwide is asked |
| no visitor POST in baseline | get_runtime_logs 2026-09-23T18:00Z to 09-24T17:30Z: `/api/` grouped by path, and `marketing` grouped by status | ~18:50Z, ~18:52Z | only `/api/health` 6; `marketing` returned 0 rows |
| positive control | the same queries for 18:10Z to 18:40Z | ~18:51Z–18:52Z | /api/marketing/visitor 6 and /api/marketing/event 2 (status 200×4, 405×4), so the query method works |

- **Why high and not critical:** While ana-01 is off, 0 visitors are counted with or without the gate. Once ana-01 is on, the gate means only visitors who accept are counted; it undercounts rather than zeroing. The claim that "most visitors never" accept is not measurable here, because the acceptance rate is unknown.
- **Solution check:** PR #57 (live description) replaces GatedAnalytics with an unconditional cookieless `<Analytics/>` and keeps GatedMarketing. That fixes page-view counting only together with ana-01 and a production deploy built from the merge commit. Web Analytics also records referrer and UTM for every counted view, so the "where from" question is covered for everyone. The first-party first-touch record stays consent-only. I could not test the fix on the preview, because it is SSO-protected.

### ana-03: No click tracking (CONFIRMED but overstated, severity lowered to medium)
| check | source | UTC read | result |
|---|---|---|---|
| chunk scan | 20 chunks from 12 pages, plus 3 extra chunks found on /belief-inquiry, /nervous-system-reset and /integration-journal (`93b33527075b290f`, `a3a5de630bb5e7f8`, `5bcaff4db7d4d1ce`): 23 in total | 18:48:11Z–18:49:22Z | Custom `"event"` calls appear only in `9a7cf34cbe809fe3.js`: tool_viewed, tool_started, session_completed, time_to_first_message, export_cta_viewed, export_cta_clicked, session_feedback. `turn_reached_n` is not a literal string there (probably built at run time). The 3 extra chunks have no events. There are no third-party trackers |
| how AI-tool events are sent | 9a7cf34cbe809fe3.js | 18:56:30Z | `null==(i=window.va)\|\|i.call(window,"event",…)`, so nothing is sent unless the consent-gated Analytics component created `window.va` |
| first-party event | fc986f8dd4b371e4.js | 18:49:30Z | `book_viewed` POST to /api/marketing/event, with no consent check |
| retailer links | GET /books/psilocybin-integration-guide | 18:56:56Z | Barnes & Noble and Bookshop.org are plain `<a target="_blank" rel="noopener noreferrer nofollow sponsored">` links with no click handler |
| **counter-evidence** | fc986f8dd4b371e4.js (PaymentButtons) | 18:49:30Z | The "Buy … with PayPal" button runs `window.location.href='/checkout/privacy-gate?bookId=…'`, which is a navigation to the site's own page |

- **Where the finding is overstated:** It says "who clicks where cannot be answered, even after ana-01 and ana-02 are fixed". That is not fully true:
  - Buy clicks show up as requests to /checkout/privacy-gate in the ~24-hour runtime logs. After ana-01 and PR #57 they would also be Web Analytics page views.
  - Completed orders and newsletter sign-ups are recorded on the server (the /privacy page says orders are stored; `/api/subscribe` exists).
  - The real gap is outbound clicks to retailers (Amazon, Barnes & Noble, Bookshop.org) and other outbound links.
- **Why medium:** With near-zero human traffic (ana-05), click tracking produces nothing until visibility is fixed.
- **Solution check:** Vercel `track()` custom events need a paid Vercel plan. I could not check the plan here (that needs a team-level tool, which is out of scope), so it **needs an outside-source check**. Also, PR #57 deliberately keeps `track()` behind consent (PR comment, 2026-09-07T03:10:00Z), so adding an ungated `track()` would contradict that design.
- **Better fix:** reuse the existing first-party pattern that book_viewed uses (`/api/marketing/event`: no cookie, no identifier). Send `retailer_click {retailer, book}` with `navigator.sendBeacon` on click. This does not depend on the Vercel plan and counts every visitor.
- **Side note:** `rel=noreferrer` hides mayaallan.com as the referrer from the retailers.

### ana-04: ~24-hour log retention (CONFIRMED, severity lowered to medium)
| check | source | UTC read | result |
|---|---|---|---|
| older window | get_runtime_logs 2026-09-17T00:00Z to 09-23T12:00Z | ~18:49:40Z | 400 `ExceedsBillingLimitError` |
| boundary | get_runtime_logs 2026-09-23T12:00Z to 19:00Z | ~18:50Z | Only 2 entries: 2026-09-23T18:54:30Z `GET /` and 18:55:10Z `GET /contact`. That is a rolling ~24 hours; the boundary moved about 30 minutes later than at the audit's 18:21Z read, as expected |
| fields | the same entries | ~18:50Z | Only method, path, status, source, deployment, branch and cache are returned. There is no user agent, referrer, country or IP *in the MCP output* |
| observability | get_observability_schema; create_observability_query (metric `vercel.request.count`, project scope) | ~18:49:40Z, ~18:56Z | 404 "Observability Data not found" on both. **Weak evidence:** the schema tool takes no team parameter, and the metric id was my guess, so this could be an artefact |
| drains | list_drains (team + project) | ~18:49:40Z | 404 "Not Found" was reproduced. It is ambiguous: it could mean no drains exist or no access |

- **Why medium:** The loss is in the past and no fix can bring it back. The need going forward is covered by ana-01. A log drain or Observability Plus is extra cost this site does not need.
- **Solution check:** "Enable Web Analytics now" is correct. The optional paid add-ons are not recommended for this purpose.
- **Needs outside-source check:** whether the dashboard's log detail view shows the user agent or referrer. That needs a dashboard login, which is not allowed here.

### ana-05: No sign of a real human in the retained day (CONFIRMED, high)
| check | source | UTC read | result |
|---|---|---|---|
| totals | get_runtime_logs baseline 2026-09-23T18:00Z to 09-24T17:30Z, grouped by status | ~18:50Z | 200=414, 404=13, 304=1, plus 1 unlisted group, so 428+ status lines |
| sources | the same window, grouped by source | ~18:52Z | function 377, middleware 359, cache 55, redirect 3. One page request can log both a middleware line and a function line, so there are roughly half as many real requests as log lines |
| API calls | the same window: query `/api/` grouped by path; `marketing` grouped by status; `checkout` and `tools` grouped by path | ~18:50Z to ~18:57Z | only /api/health 6; `marketing` 0; `checkout` 0; `tools` 0 |
| positive control | 18:10Z to 18:40Z, the same queries | ~18:51Z–18:52Z | /api/marketing/event 2 and /api/marketing/visitor 6 were logged (the audit's own browser) |
| tracker renders on the book page | GET /books/psilocybin-integration-guide | 18:56:18Z | The page data loads module `16166` (BookViewTracker) from `fc986f8dd4b371e4.js`, which sends book_viewed with no consent check, once per tab session |
| CDN not hiding visits | response headers of /, /books/psilocybin-integration-guide and /privacy | 18:55:03Z | `Cache-Control: private, no-cache, no-store`, `X-Vercel-Cache: MISS`. Every page view reaches middleware or a function and is logged |
| top paths | baseline grouped by path | ~18:50Z | / 82, /robots.txt 41 (the audit said 38; minor drift), book page 8, /xmlrpc.php 5, … 46 distinct paths |

- **Refutation attempts:**
  - Query artefact: ruled out by the positive control.
  - CDN caching hiding visits: ruled out by the `no-store` headers.
  - Visitors with JavaScript off or a privacy blocker could suppress book_viewed. I cannot rule that out.
  - Humans who never open the book page leave no trace that can be told apart from bots.
- **Conclusion:** "no sign" is accurate. "Zero humans" is not proven, and the evidence covers only ~23 hours.
- **Solution check:** The direction is correct. Runtime logs cannot separate humans from bots at all, so the only reliable measure will be Web Analytics after ana-01 and PR #57.

### ana-06: Speed Insights not loaded (CONFIRMED, severity lowered to low)
- **Chunk scan:** the 23 chunks (18:48Z–18:49Z) have no `@vercel/speed-insights` SDK. The only mention is Vercel's injected config string `{"speedInsights":{"scriptSrc":"87c4d7cd412437e3/script.js","endpoint":"87c4d7cd412437e3/vitals"}}` inside `312c5210c9c35dc5.js` (read 18:53:21Z).
- **Script URLs:** `/_vercel/speed-insights/script.js` and `/87c4d7cd412437e3/script.js` both returned 200 (12,567 B), twice each, at 18:53:21Z–18:53:25Z.
- **Why low:** With about 0 human visitors, real-visitor speed data would be empty. Lab tools (PageSpeed Insights, Lighthouse) are enough to diagnose SEO issues now.
- **Solution check:** `<SpeedInsights/>` plus the dashboard toggle is correct. PR #57 changes `package.json`, but I did not check whether it adds Speed Insights, because reading repository source is out of scope.

### ana-07: Privacy page does not match behaviour (PARTIALLY CONFIRMED, severity lowered to low)
- **Reads:** GET /privacy twice, 18:53:38Z–18:53:43Z. The text was the same both times and contained:
  - "Last updated: May 20, 2026".
  - "If you are in the EU, the UK, or any other jurisdiction where consent is required for non-essential cookies, these are set only after you accept on the consent banner."
  - "Vercel — hosts the website and stores public assets in Vercel Blob". Vercel Web Analytics is not named.
  - "Supabase — provides the database where orders, contact-form submissions, and aggregated analytics events are stored".
- **Confirmed:**
  - Vercel Web Analytics is not named, although the consent-gated component loads it.
  - book_viewed is not described specifically. It carries no identifier and no cookie, so the gap is small.
- **Not a mismatch:**
  - Asking every visitor worldwide is stricter than the policy text requires; it does not contradict it.
  - The Supabase storage claim cannot be shown wrong from live behaviour.
- **Solution check:** The live description of PR #57 says the privacy page "names Vercel Web Analytics". Whether it also covers book_viewed is **unverified**: the preview is SSO-protected and reading source is out of scope.

### ana-08: PR #57 unmerged (CONFIRMED, medium)
| check | source | UTC read | result |
|---|---|---|---|
| PR state | gh api pulls/57 | 18:53:58Z | state=open, merged=false, draft=false, mergeable=true, mergeable_state=clean, created 2026-09-07T02:58:16Z, updated 2026-09-07T03:49:42Z, head `fa5d59b3eb5e4aa94623d08ef9a2a5e8f0eb0224`, 14 files, +781/−91 |
| up to date with main | gh api commits/main; compare `fa5d59b3...main` | 18:54:03Z | main HEAD is `ed7461a07e49…` (#56), which is the PR's base. main is 0 commits ahead, so no rebase is needed |
| checks | commit status and check-runs | 18:54:00Z | Vercel: success; gates: success; on-success: success; on-failure: skipped; Vercel Preview Comments: success |
| review | reviews and issue comments | 18:54:11Z | Codex, 2026-09-07T03:49:40Z: "Didn't find any major issues" |
| preview | get_deployment dpl_31rT3aihaj2kw1vkzqDkpV8ZVYCb | ~18:54:20Z | READY; branch feat/analytics-visibility-2026-09-07; sha fa5d59b3 |
| production | list_deployments target=production, limit 3 | ~18:54:20Z | dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 (READY, sha ed7461a). The two production deployments before it are the same sha |

- **Solution check:** Merge and turn on the toggle, as proposed. Then confirm that the production deployment's `githubCommitSha` is the merge commit, and that count_pageviews returns a number.