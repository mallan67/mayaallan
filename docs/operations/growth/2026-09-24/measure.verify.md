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

### meas-03: Retailer, button and share click events in the site's own table, plus cleaned retailer URLs. KEEP
- **Live book page** (GET https://www.mayaallan.com/books/psilocybin-integration-guide, 18:50:31Z): outbound hosts are a.co, bookshop.org, play.google.com, abebooks.com, barnesandnoble.com, bokus.com, waterstones.com (7), plus PayPal. The strings `retailer_click` and `cta_click` are absent. The AbeBooks URL carries `cm_mmc=aff-_-ir-_-353196-_-77798` and `ref_=aff_ir_353196_77798`, which is **someone else's affiliate tag**. B&N carries `jsessionid=…`, Bokus carries `srsltid=…`, and Bookshop carries `source=IndieBound&ref=https://www.google.com/`. All confirmed.
- **Evidence nuance:** the Vercel custom-events doc (last_updated 2026-06-26) says server-side tracking is "more useful" for sign-ups and purchases. It says nothing about outbound clicks, which can only be caught in the browser. The beacon approach is sound, but the lens cites no source for it.
- **Rehash check:** no PR or commit title mentions retailer or outbound-click tracking. Closed PR #4 (retailer layout, unmerged) and commit `d1053bd6` (2026-01-22, "Show all retailers") only changed layout. **New.**
- **Build notes:** the beacon must not attach `ma_visitor_id` unless consent was given, and must stay cookieless. Retailer URLs may live in admin book data (`e61f0843` "BOOK-METADATA.md", `ff328383`/`2c8dffbc` admin commits). Whether step 3 is a code change or an owner edit in /admin is **UNVERIFIED**.
- **Impact:** shows purchase intent, not leads. **Measure:** retailer_click by retailer; retailer_click ÷ book_viewed.

### meas-04: Amazon Attribution tags. KEEP, deferred; drop the Bookshop sub-step
- **Live** (GET https://advertising.amazon.com/solutions/products/amazon-attribution, undated, read 18:53:06Z): "Amazon Attribution is a free measurement solution"; usable by "Kindle Direct Publishing (KDP) authors that are part of the advertising console"; "reports have a 14-day attribution window." Confirmed.
- **Live** (GET https://a.co/d/hRppkCZ, 18:50:40Z): 301 to `amazon.com/dp/B0G765BZDL?ref=cm_sw_r_ffobk…&social_share=…`, a share link with no attribution tag. Confirmed.
- **Evidence type:** a vendor capability page with no outcome data. The product has existed for years and the page is still current.
- **Fit:** free, and tags do not run ads. Whether creating tags triggers any Amazon Ads policy review for psilocybin content is **UNVERIFIED**.
- **Bookshop.org affiliate sub-step:** the lens gives no source. https://bookshop.org/info/affiliates and https://bookshop.org/pages/affiliates both returned **404** (18:54:28Z). **UNVERIFIED**, and it is about earning money, not measurement, so remove it from this tactic.
- **Deferral rule:** start only when meas-03 shows about 5 or more Amazon retailer clicks a week. Before then, KDP's own sales report already shows every sale, so attribution adds almost nothing.

### meas-05: UTM tags on the redirects from the owned domains. KEEP (tiny)
- **Live** (HEAD, 18:50:40Z and 18:54:53Z): apex and www of psilocybinintegrationguide.com and psilowire.com return **308** to `https://www.mayaallan.com/…` with path and query **preserved** (`Server: Vercel`). Confirmed.
- **Adversarial finding:** the Wayback CDX query (https://web.archive.org/cdx/search/cdx?url=…, 18:54:53Z) returned **0 captures for both domains**. Nothing shows either domain has ever been linked or visited. Expect about 0 rows unless the domain is printed in the book, a bio or an interview.
- **Material improvement:** send psilocybinintegrationguide.com to `/books/psilocybin-integration-guide?utm_source=psilocybinintegrationguide.com&utm_medium=domain_redirect`, since someone typing the book's name wants the book. Keep path passthrough for deep links.
- **Rehash:** no.