# Adversarial review: measurement-engineering lens (06), 2026-09-24

**Reviewed:** `docs/operations/growth/2026-09-24/06-measurement-engineering.md`, commit `de61b08713e0cd1ad578fa8c892a8114896c226f` (authored 2026-09-24T18:47:12Z). The live compare `de61b087...work/site-visibility` at 18:55:54Z showed the branch 38 commits ahead and 0 behind, so the reviewed commit is on the branch.
**Reviewer window (UTC):** 2026-09-24T18:48:45Z to 18:57:03Z. Every fact below was read live in that window, and each one names its source and read time. Nothing here comes from a local file, clone, cache or earlier answer.
**Rules applied to each tactic:** (a) recency, (b) real evidence or opinion/vendor claim, (c) rehash of earlier work on this site that produced no results, (d) fit for a solo author with almost no audience whose topic has ad restrictions. Any tactic that fails a rule gets `keep=false`.
**Save note:** this file was written in several appending commits, because a single long command would not parse. Each commit changed only this path.

---

## Verdict first

1. **None of these tactics creates a lead.** The lens says this itself. Measurement shows where the funnel breaks. It does not fill the funnel.
2. **This site has already built a lot of measurement, and none of it produced a lead.** Live GitHub history of `mallan67/mayaallan` (read 18:48:45Z to 18:49:37Z):
   - 2026-04-20: `ff0028c4` "Add Vercel Web Analytics", `1029986d` "Add typed analytics event helpers", `2e559a06` "Wire analytics events into three chat components"
   - 2026-05-13: `ae9e9e98` "Add monitoring stack: /api/health + alertAdmin + scheduled GH Actions", then PR #12 "PR E: marketing attribution + conversion analytics + admin dashboard" (merged 2026-05-13T20:01Z)
   - 2026-05-19: `b7a0f8a6` "PR F: AI search + AEO tracker + i18n + linkable assets", plus 8 AEO follow-up commits
   - 2026-05-21: PR #23 consent-banner fix, and `835ec51b` / `478f6663` alertAdmin
   - 2026-09-05: PR #46 AEO classifier, PR #47 and #49 operator notification emails
   - 2026-09-07: PR #57 "count every visitor" is **still open and unmerged** (mergeable_state=clean, read 18:48:52Z)

   That is five months of dashboards and trackers, and still zero leads. Leads (signup, contact, checkout, purchase) have been recorded on the server since PR #12, and the owner is emailed for each one (#47, #49). **So "zero leads" is a measured fact, not a gap in measurement.**
3. **What survives:** only items that are S-effort (small) or take the owner a few minutes, and that reveal a funnel step nobody can see today. Planned build time for everything kept here is 1 to 2 days of PRs plus about 30 minutes of owner clicks. More measurement work should wait until lead-generating tactics from the other lenses are live.

| id | keep | (a) recency | (b) evidence | (c) rehash? | (d) fit | one-line reason |
|---|---|---|---|---|---|---|
| meas-01 | **yes** (prerequisite) | ok (2026-06-26 / 2026-06-19) | real (live site + docs); Plausible 5–25% is an **uncited vendor estimate** | **yes**: finishing PR #57, not new | fits | Owner merges an existing PR in 5 minutes. No lead impact. |
| meas-02 | **yes** | ok (2026-08-25 / 2026-09-14) | real, but the enabled state is **UNVERIFIED** | partly (named in PR #57 and #58) | fits, but a plan-terms issue found | Owner check in minutes. New finding: Hobby is "non-commercial, personal use only" |
| meas-03 | **yes** | ok | real (live page shows 7 untracked retailer exits and a third-party affiliate ID) | no | fits | S; purchase-intent visibility |
| meas-04 | **yes, deferred** | ok (vendor page read live) | vendor capability doc only; no outcome data | no | fits (free, KDP eligible) | Do it only after meas-03 shows Amazon clicks. Drop the Bookshop sub-step (unsourced) |
| meas-05 | **yes** (tiny) | ok | real (live 308s); but **no evidence either domain gets traffic** | no | fits | S; point the book domain at the book page |
| meas-06 | **yes, with a condition** | ok | real (live chunk) | **yes**: April 2026 events never produced data; the new version is materially different | fits only without identifiers | S; aggregate tool funnel with no visitor ID |
| meas-07 | **yes, trimmed** | mixed (2025 data labelled) | real + vendor; one figure misattributed | partly (AEO tracker) but materially different | fits | Bing AI Performance is the valuable part; the AI referral channel will read about 0–4 visits a month |
| meas-08 | **yes** | ok (2025, updated 2026-05-31) | real first-party data (Ahrefs about itself) | no | fits | S; the first leads explain where they came from |
| meas-09 | **no** | ok | real docs | **yes**: more dashboard and alert work on top of #12/#57, alertAdmin and GH Actions monitoring | poor (M effort, weekly zeros) | Keep one S step: a data-flow assertion in the existing monitor |
| meas-10 | **no** | ok | the Clarity policy does not show consent is unneeded elsewhere | no | **poor**: legal risk on a mental-health topic, M effort, only a handful of rows gained | Leave consent as is |

---