# mayaallan.com — Continuous Handoff

> Living document. Updated at every milestone, directly on GitHub (branch `work/site-visibility`).
> Rules: every fact names its **live source** and **UTC read time**; nothing is taken from local files,
> scratch files, old handoffs or memory; anything not re-read live is marked **UNVERIFIED**; the
> **Not done** list is always current.

**Last updated:** 2026-09-24T18:16:09Z · **main at:** `ed7461a07e499694eba25ada437817c35983bd87`

## Owner goals (2026-09-24)
1. The site must be **visible** — in Google, Bing and AI answers.
2. The owner must be able to **see traffic** and **who clicks where**.
3. **Every live failure** reported with a concrete solution; an in-depth report.
4. Work saved directly to git, with this continuous handoff.

## Confirmed live (so far)

| # | Fact | Live source | Read at (UTC) |
|---|------|-------------|---------------|
| 1 | Vercel Web Analytics is **disabled** on project `mayaallan` (`prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`) — API answers `web_analytics_not_enabled`; no visitor or click data exists anywhere in Vercel. | Vercel API `count_pageviews`, `count_events` | 2026-09-24T17:48Z |
| 2 | **PR #57** "feat(analytics): count every visitor, and show where they came from" is **open and unmerged since 2026-09-07T02:58Z**; `mergeable_state=clean`; checks `gates` success, Vercel preview success. Cookieless page-view counting is therefore **not in production**. | `gh api repos/mallan67/mayaallan/pulls/57` (+ check-runs, statuses) | 2026-09-24T18:14:39Z |
| 3 | PR #57 itself states Web Analytics must also be **enabled in the Vercel dashboard** (project `mayaallan` → Analytics → Enable); this cannot be done from code. | PR #57 body | 2026-09-24T18:14:39Z |
| 4 | The scheduled SEO job is a **Vercel Cron** `/api/cron/aeo-track`, schedule `0 9 * * 1` (Mondays 09:00 UTC). It **measures** whether AI engines cite the site; it does nothing to increase visibility. | `vercel.json` @ main `ed7461a` via GitHub API | 2026-09-24T17:19:51Z |
| 5 | Production deployment `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4`, created 2026-09-08T07:57:14Z, READY. | Vercel `get_project` | 2026-09-24T17:20:26Z |
| 6 | Runtime-log retention is ~1 day (a "30d" query returned 6 `/api/health` lines vs ~96/day expected), so logs cannot show any Monday cron run. **Whether the weekly cron runs and succeeds is UNVERIFIED.** | Vercel `get_runtime_logs` | 2026-09-24T17:20Z |

UNVERIFIED (to be re-read live, not relied on): homepage showed `meta robots index, follow`, canonical `https://www.mayaallan.com`, and **no analytics script** (curl at 2026-09-24T17:48Z — that capture passed through a local scratch file, so it is being re-read git-direct).

## In progress
- **Live site audit** (crawl, real browser incl. console errors, crawler access, Vercel errors, cron evidence, visitor data) — relaunched with evidence committed directly to `docs/operations/evidence/2026-09-24/`.
- **Where the site appears** (index presence, brand/book/topic rankings, off-site footprint, archive/crawl datasets) — relaunched, evidence committed directly to git.
- **Visibility research** (official Google/Bing/Vercel/AI-provider docs: indexing, AI-answer eligibility, analytics + click tracking, authority).

## Not done
- [ ] Google Search Console / Bing Webmaster Tools status — unknown; needs the owner to sign in inside the automated browser window (credentials are never typed by the agent).
- [ ] Site admin `/admin/aeo` dashboard review — needs owner sign-in.
- [ ] In-depth report (all failures + solutions) — after the audits land.
- [ ] Fix PRs for each confirmed failure.
- [ ] Merge PR #57 — **owner decision**.
- [ ] Enable Vercel Web Analytics — **owner action** (dashboard toggle).

## Owner decisions waiting
1. **Merge PR #57** (green and conflict-free since 2026-09-07).
2. **Enable Web Analytics** in Vercel → project `mayaallan` → Analytics → Enable.

## Log (append-only)
- 2026-09-24T18:16:09Z — Handoff started. Branch `work/site-visibility` created from main `ed7461a07e499694eba25ada437817c35983bd87`.
- 2026-09-24 (earlier this session) — First audit run was stopped after it went outside the requested scope (4 metadata-only Gmail searches, provider/Vercel documentation fetches); its results were discarded. Later runs that wrote captures to a local scratch folder were stopped on the owner's instruction; nothing from those runs is used.