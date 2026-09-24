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

## Per-tactic findings

### meas-01: Merge PR #57 (cookieless page views for everyone). KEEP as a prerequisite, not as growth
- **Live site** (GET https://www.mayaallan.com/, 2026-09-24T18:50:02Z): the RSC payload references `GatedAnalytics` 1× and `CookielessAnalytics` 0×. The claim is confirmed: the page-view component is still gated on consent.
- **PR #57** (GitHub API, 18:48:52Z): state=open, mergeable=true, mergeable_state=clean, head `fa5d59b3`, last updated 2026-09-07T03:49:42Z.
- **Vercel Web Analytics privacy doc** (https://vercel.com/docs/analytics/privacy-policy, last_updated 2026-06-26, read 18:51Z): "without using any third-party cookies, instead end users are identified by a hash created from the incoming request… automatically discarded after 24 hours." Confirmed.
- **ICO DUAA page** (updated 19 June 2026, read 18:51Z): organisations may "set some types of cookies without having to get consent, such as those you may use to collect information for statistical purposes." **ICO exceptions page** (no date shown, read 18:51Z): the exception requires clear information and a simple, free way to object, and **does not cover tracking individual visitors**. Confirmed, and this supports keeping `ma_*` behind consent.
- **Correction:** the "5–25% missed without a proxy" figure (https://plausible.io/docs/proxy/introduction, last updated 2026-05-29) cites no study. It is an **uncited vendor estimate**, not evidence.
- **EU position UNVERIFIED:** EDPB Guidelines 2/2023 on Art. 5(3) scope, final v2 adopted 2024-10-16 (EDPB landing page, read 18:56Z). The guideline text could not be retrieved in this review. Treat "no consent needed in the EU" as unverified, and let owner or counsel decide.
- **Rehash check:** this is the work of PR #57 (2026-09-07), finished rather than new. It stays because every other visitor number depends on it.
- **Impact:** 0 leads. Owner action takes about 5 minutes. **Measure:** a curl of the homepage shows `CookielessAnalytics` and no `GatedAnalytics`, and Vercel shows visitors above 0 within 24h.

### meas-02: Confirm Web Analytics is enabled and record the plan. KEEP, with a new finding
- **Live** (GET https://www.mayaallan.com/_vercel/insights/script.js, 18:50:02Z): 200, `application/javascript`, 4,469 bytes. The troubleshooting doc (last_updated 2026-06-26) links a **404** to "deploying the tracking code before enabling Web Analytics". It does **not** say a 200 proves the feature is enabled. **Status: UNVERIFIED.** This review did not read the Vercel project. The owner has to look at Vercel → mayaallan → Analytics.
- **Plan limits** (https://vercel.com/docs/analytics/limits-and-pricing, last_updated 2026-08-25, read 18:51Z): on Hobby, Custom Events "-", Reporting Window 1 Month, UTM Parameters "-". On Pro, UTM Parameters is "N/A" (only Web Analytics Plus, $10/mo, includes UTM). **Correction to the lens:** Vercel-side UTM reporting needs Pro plus Plus. Until then the site's own table (utm_* since PR #12) is the only UTM source.
- **New finding** (https://vercel.com/docs/plans/hobby, last_updated 2026-09-14, read 18:54Z): "the Hobby plan restricts users to non-commercial, personal use only." The site sells ebooks through PayPal. If the project is on Hobby, that terms issue matters more than analytics. Pro would also bring custom events (2 properties) and a 12-month window. The plan tier is **UNVERIFIED** here.
- **Measure:** the owner records the plan tier and enabled state, with a screenshot date, in the continuous handoff.