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