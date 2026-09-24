# mayaallan.com — Continuous Handoff

> Living document. Updated at every milestone, directly on GitHub (branch `work/site-visibility`).
> Rules: every fact names its **live source** and **UTC read time**; nothing is taken from local files,
> scratch files, old handoffs or memory; anything not re-read live is marked **UNVERIFIED**; the
> **Not done** list is always current.

**Last updated:** 2026-09-24T20:33:18Z · **main at:** `ed7461a07e499694eba25ada437817c35983bd87`

## Owner goals (2026-09-24)
1. **Leads.** One month in, zero leads — the only measure of success is leads (newsletter signups, inquiries, book purchases, event registrations, tool users who leave an email).
2. The site must be **visible** — in Google, Bing and AI answers — and the owner must **see traffic and who clicks where**.
3. **Every live failure** reported with a concrete solution; an in-depth report.
4. **No dead information, no rehash.** What was done before did not produce leads; use what is new (2025-2026) and what top engineers/developers actually do, with evidence of results.
5. Everything saved directly to git, with this continuous handoff. Nothing read from or written to local/scratch files.
6. **Audiobook** organized so it can be properly set up, distributed and sold. — **PAUSED by owner 2026-09-24T18:36:27Z: audiobook not finished; other work first.** Audiobook is **LAST**.
7. **See every visitor and every action**; what works, what tracks, what fails — and an **always-on automatic system** that re-checks, updates and reports results when something fails. **One living system, not dead dashboards across endless sites.**
8. Every agent works as a **senior engineer/developer with market understanding**; the site must be clean and top-notch.

## Confirmed live (so far)

| # | Fact | Live source | Read at (UTC) |
|---|------|-------------|---------------|
| 1 | Vercel Web Analytics is **disabled** on project `mayaallan` (`prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`) — API answers `web_analytics_not_enabled`; no visitor or click data exists anywhere in Vercel. | Vercel API `count_pageviews`, `count_events` | 2026-09-24T17:48Z |
| 2 | **PR #57** "feat(analytics): count every visitor, and show where they came from" is **open and unmerged since 2026-09-07T02:58Z**; `mergeable_state=clean`; checks `gates` success, Vercel preview success. Cookieless page-view counting is therefore **not in production**. | `gh api repos/mallan67/mayaallan/pulls/57` (+ check-runs, statuses) | 2026-09-24T18:14:39Z |
| 3 | PR #57 itself states Web Analytics must also be **enabled in the Vercel dashboard** (project `mayaallan` → Analytics → Enable); this cannot be done from code. | PR #57 body | 2026-09-24T18:14:39Z |
| 4 | The scheduled SEO job is a **Vercel Cron** `/api/cron/aeo-track`, schedule `0 9 * * 1` (Mondays 09:00 UTC). It **measures** whether AI engines cite the site; it does nothing to increase visibility. | `vercel.json` @ main `ed7461a` via GitHub API | 2026-09-24T17:19:51Z |
| 5 | Production deployment `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4`, created 2026-09-08T07:57:14Z, READY. | Vercel `get_project` | 2026-09-24T17:20:26Z |
| 6 | Runtime-log retention is ~1 day (a "30d" query returned 6 `/api/health` lines vs ~96/day expected), so logs cannot show any Monday cron run. **Whether the weekly cron runs and succeeds is UNVERIFIED.** | Vercel `get_runtime_logs` | 2026-09-24T17:20Z |
| 7 | **Nothing technical blocks indexing.** robots.txt allows all search and AI crawlers; sitemap has 38 URLs, all 200, self-canonical, indexable; 0 page/asset errors; alternate domains 308 to www; real 404s; no UA blocking; no firewall/SSO on custom domains. | Live audit crawl + crawler-access + verifiers (`evidence/2026-09-24/audit-crawl*.md`, `crawl.verify.md`, `visibility.verify.md`) | 2026-09-24T18:18Z–19:10Z |
| 8 | **Discovery/authority is the problem:** 0 off-site pages link to or mention mayaallan.com (Amazon ×3 + author page, Goodreads, Google Play/Books, B&N, others); Common Crawl 0 captures in 14 indexes (2025-33 → 2026-39); Wayback last capture 2026-01-31. | `appears-offsite-footprint.md`, `appears-crawl-archive.md` + verifiers | 2026-09-24T18:27Z–18:58Z |
| 9 | Site ranks **only for the author name and book title** (Bing #1–#2); **absent from all 8 topic searches** (no mayaallan URL in Bing top 7, read 3–4× each). 0 reviews/ratings on Amazon (3 formats), Goodreads, ThriftBooks. | `appears-rankings*.md`, `rank.verify.md`, `footprint.verify.md` | 2026-09-24T18:20Z–18:55Z |
| 10 | **Measurement blind:** Web Analytics off (re-read 19:19Z); analytics + visitor beacon load **only after "Accept all"**; outbound/retailer clicks untracked; runtime logs keep ~24 h with no UA/referrer. | `audit-visitors-clicks.md`, `analytics.verify.md`, `audit-browser-console.md`, `critic.md` C3 | 2026-09-24T17:48Z–19:19Z |
| 11 | **Weekly SEO/AEO cron almost certainly never runs successfully:** deployed route (`ed7461a`, `src/app/api/cron/aeo-track/route.ts` L33–36) returns 401 when `CRON_SECRET` is unset, and `CRON_SECRET` is absent from the project env (v10 + v9 + shared). Direct log proof pending (logs keep 1 day) — check 2026-09-28T09:00Z–09-29T09:00Z. | Code: GitHub @ed7461a read 19:26:49Z. Env: `ops.verify.md`, `critic.md` §2 (reads 18:24:05Z, 19:00:15Z, 19:00:42Z) | 2026-09-24T19:26:49Z |
| 12 | Production = main = `ed7461a` (2026-09-06): **nothing has shipped for 16+ days**; PR #57 still unmerged. | Vercel list_deployments + gh api pulls/57 (`critic.md` C2, C4) | 2026-09-24T19:19Z |
| 13 | A google-site-verification DNS TXT record exists → Google Search Console verification was at least started; Bing has no verification file/tag. Google index status itself is UNVERIFIED (automated Google reads blocked). | `visibility.verify.md`, `critic.md` N1–N3 | 2026-09-24T18:41Z |
| 14 | Real-browser pass: 0 JS errors, 0 hydration errors, 0 CSP violations, 0 failed requests on 26 desktop + 24 mobile loads; Buy button is 3.3 screens down (desktop) / 5.7 (mobile) on the book page; /events empty, /media 1 item, /scenarios 1 of 40; 19 of 38 pages ≤135 words. | `audit-browser-console.md`, `browser.verify.md`, `critic.md` 1a | 2026-09-24T18:18Z–18:38Z |

UNVERIFIED (to be re-read live, not relied on): homepage showed `meta robots index, follow`, canonical `https://www.mayaallan.com`, and **no analytics script** (curl at 2026-09-24T17:48Z — that capture passed through a local scratch file, so it is being re-read git-direct).

## In progress
- **Always-on ops + analytics** — workflow `wf_a255d729-1d6` (resumed 2026-09-24T18:36:27Z without audiobook lenses): every-visitor/every-action analytics + always-on self-checking "site doctor" with auto-issues, alerts, weekly digest and an auto-fix routine (PRs only) → **always-on ops blueprint** (`docs/operations/monitoring/2026-09-24/`).
- Audiobook lenses — **paused** by owner (not finished). Files already committed before the pause: none.
- **Pioneer playbook** — workflow `wf_f2bd1f48-544` (started 2026-09-24T18:24:29Z): market map with live numbers; the whole Google network; all web + vertical search engines + AI answer engines; book ecosystem (ebook + audiobook); psychedelic-niche venues; open-web entity/profile/link venues with a tag/link (UTM + sameAs) matrix → 5 pioneer strategies (category creator, ecosystem/B2B, search-everywhere, data/PR, community) → 3 judges → **playbook + idea bank + first 14 days**. Output commits to `docs/operations/growth/2026-09-24/pioneer/`.
- **Live site audit** — DONE (2026-09-24T19:27:44Z): 19/19 agents; evidence + verifiers + critic in `docs/operations/evidence/2026-09-24/`. Open gaps G1–G18 listed in `critic.md` §4.
- **Leads growth research** — workflow `wf_d03eba2c-a01` (started 2026-09-24T18:21:58Z): what top engineers/developers do now (2025-2026) — prior-efforts diagnosis (from live GitHub history), live lead-path audit, engineering-as-marketing, AI-assistant citation practice, niche landscape + channels, measurement engineering → **30-day lead plan**. Output commits to `docs/operations/growth/2026-09-24/`.
- Stopped (not used): official-docs SEO research `wf_dbb8efd1-bbd` — stopped 2026-09-24T18:21:58Z on owner instruction (generic checklist = rehash).

## Not done
- [ ] **Owner decision (incident):** the Playwright browser tool wrote a `.playwright-mcp` folder into the local Desktop checkout (`Desktopmayaallan.playwright-mcp`) during the 18:18Z–18:38Z browser pass, against the no-local-files rule. Not opened or deleted by the agent. Owner: delete it, and Playwright stays unused until its output folder is set outside any repo copy.
- [ ] **Owner/Vercel:** add `CRON_SECRET` (or retire the AEO cron) — the weekly job is refused with 401 while it is missing.
- [ ] Confirm cron status live 2026-09-28T09:00Z–09-29T09:00Z (runtime logs scoped to the production deployment, query `aeo-track`).
- [ ] **Owner:** close this Claude Code session, then run `docs/operations/setup-mayaallan-ops.ps1` in PowerShell. It creates `mayaallan-ops` (bootstrap only; PowerShell auto-lands there; `mayaallan` / `mallan` shortcuts) and **removes the old Desktop checkout `C:UsersMayaAllanDesktopmayaallan`** (only if every local commit is on GitHub). Lost with it (never in git, not read by the agent): untracked `AUDIOBOOK-ERROR-AUDIT.md`, `HANDOFF-2026-07-14.md`, `HANDOFF-2026-09-20.md`, any local `.env*` files, and the `.playwright-mcp` folder.
- [ ] Audiobook launch plan — paused by owner until the audiobook is finished.
- [ ] Always-on ops + analytics blueprint (running), then build it as PRs.
- [ ] Pioneer playbook + idea bank (running).
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
- 2026-09-24T18:24:29Z — Owner: "what would a pioneer do… use all search engines, sites, venues to tag and link… Google networks… so much information and ideas". Launched pioneer playbook `wf_f2bd1f48-544` (all output to git).
- 2026-09-24T18:31:00Z — Owner: audiobook must be organized and sold; every agent a senior engineer/developer; see every visitor and action; auto program that re-checks and reports failures; no dead system. Launched `wf_a255d729-1d6`.
- 2026-09-24T18:36:27Z — Owner: "the audiobook is not finished, focus on the other stuff first". Stopped audiobook lenses; resumed always-on ops lenses only.
- 2026-09-24T19:01:54Z — Owner: audiobook is last; all information live; a mayaallan ops folder locally so PowerShell goes into it automatically. Added `docs/operations/OPS-SESSION-BOOTSTRAP.md` (canonical live-read instructions) and `docs/operations/setup-mayaallan-ops.ps1` (owner-run setup). Local profile edit by the agent was blocked by the permission classifier and not attempted further.
- 2026-09-24T19:27:44Z — Live audit complete (19 agents). Key: nothing technical blocks indexing; the problem is discovery/authority (0 off-site links, crawlers absent since Jan), no social proof, measurement blind, cron refused (CRON_SECRET missing), nothing shipped since 09-06. Incident: Playwright MCP wrote `.playwright-mcp` into the Desktop checkout — reported to owner.
- 2026-09-24T20:33:18Z — Owner: remove the Desktop checkout; only an ops folder for bootstrap; everything else direct from the repo. Verified live that the checkout's HEAD `2bdaf24` is on GitHub (contained in remote `audiobook-approved-manifest`, which is 10 ahead). Removal added to the owner-run setup script (it cannot run from inside this session, whose working directory is that folder). Also: the owner's `claude` command failed (`bin/claude.exe` missing after a broken auto-update at ~20:26Z); restored by copying the working 2.1.282 binary from the second npm install — `claude --version` = 2.1.282 at 2026-09-24T20:33:18Z.