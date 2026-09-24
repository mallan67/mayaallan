# mayaallan.com — Continuous Handoff

> Living document. Updated at every milestone, directly on GitHub (branch `work/site-visibility`).
> Rules: every fact names its **live source** and **UTC read time**; nothing is taken from local files,
> scratch files, old handoffs or memory; anything not re-read live is marked **UNVERIFIED**; the
> **Not done** list is always current.

**Last updated:** 2026-09-24T18:21:58Z · **main at:** `ed7461a07e499694eba25ada437817c35983bd87`

## Owner goals (2026-09-24)
1. **Leads.** One month in, zero leads — the only measure of success is leads (newsletter signups, inquiries, book purchases, event registrations, tool users who leave an email).
2. The site must be **visible** — in Google, Bing and AI answers — and the owner must **see traffic and who clicks where**.
3. **Every live failure** reported with a concrete solution; an in-depth report.
4. **No dead information, no rehash.** What was done before did not produce leads; use what is new (2025-2026) and what top engineers/developers actually do, with evidence of results.
5. Everything saved directly to git, with this continuous handoff. Nothing read from or written to local/scratch files.

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
- **Live site audit** — workflow `wf_c925e59f-494` (started ~2026-09-24T18:17Z): 9 live checks (crawl, real browser + console, crawler access, errors/ops/SEO-cron, visitors/clicks, index presence, rankings, off-site footprint, crawl/archive datasets). Each check and each adversarial re-check commits to `docs/operations/evidence/2026-09-24/`.
- **Leads growth research** — workflow `wf_d03eba2c-a01` (started 2026-09-24T18:21:58Z): what top engineers/developers do now (2025-2026) — prior-efforts diagnosis (from live GitHub history), live lead-path audit, engineering-as-marketing, AI-assistant citation practice, niche landscape + channels, measurement engineering → **30-day lead plan**. Output commits to `docs/operations/growth/2026-09-24/`.
- Stopped (not used): official-docs SEO research `wf_dbb8efd1-bbd` — stopped 2026-09-24T18:21:58Z on owner instruction (generic checklist = rehash).

## Not done
- [ ] Live audit results + adversarial verdicts (running).
- [ ] 30-day lead plan (running).
- [ ] In-depth report: all live failures + solutions, ranked by effect on leads.
- [ ] Google Search Console / Bing Webmaster Tools status — unknown; needs the owner to sign in inside the automated browser window (agent never types credentials).
- [ ] Site admin `/admin/aeo` dashboard review — needs owner sign-in.
- [ ] Fix PRs for confirmed failures — after the report.
- [ ] PR #57 (open since 2026-09-07) — decide only after the lead plan; not assumed to be the answer.
- [ ] Vercel Web Analytics toggle — owner action; part of the week-1 instrumentation decision in the lead plan.

## Log (append-only)
- 2026-09-24T18:16:09Z — Handoff started. Branch `work/site-visibility` created from main `ed7461a07e499694eba25ada437817c35983bd87`.
- 2026-09-24 (earlier this session) — First audit run was stopped after it went outside the requested scope (4 metadata-only Gmail searches, provider/Vercel documentation fetches); its results were discarded. Later runs that wrote captures to a local scratch folder were stopped on the owner's instruction; nothing from those runs is used.
- 2026-09-24T18:21:58Z — Owner: "do not use dead information… what they have done did not work… zero leads… read what savvy top engineers and developers do". Refocused on leads; stopped generic docs research; launched leads growth research `wf_d03eba2c-a01`. Live audit `wf_c925e59f-494` continues (current live state, not old advice). Draft PR #58 holds this handoff.