# Adversarial review: lens "what-was-already-done" (2026-09-24)

Reviewed: the 14 tactics produced for `docs/operations/growth/2026-09-24/01-prior-efforts.md` at commit
`fec56bbee4b17b0222c9e5d731f68eaf39a685fe` (confirmed live on branch `work/site-visibility`, commit time 2026-09-24T18:41:03Z,
one file). Every fact below was re-read live between **2026-09-24T18:43:15Z and 18:52:21Z** from GitHub metadata of
`mallan67/mayaallan` (`gh api`: pulls, commits, issues, deployments, compare, Actions workflows), GET requests to
`https://www.mayaallan.com`, and three public web pages. No local files were used. No form was submitted.

Checks per tactic: (a) recency of sources, (b) real evidence or opinion, (c) rehash of work already done without
results, (d) fit for a solo author with near-zero audience whose subject limits paid ads.

## Verdict

| | Count | Tactic ids |
|---|---|---|
| KEEP | 8 | stop-hygiene-first, stop-copy-rewrites, stop-aeo-tooling, stop-plans-without-execution, stop-side-projects, finish-pr57-analytics, finish-welcome-magnet, finish-capture-everywhere |
| KEEP, conditional (sequenced / amended) | 3 | finish-promo-in-book, finish-tools-free-email, finish-scenarios |
| DROP (stale, already solved, or no evidence) | 3 | stop-direct-to-main, stop-processor-churn, finish-hide-empty |

The lens is **correct in its main finding** and the numbers reproduce exactly (see C6). It has **one material factual
error** (C1: Web Analytics is very likely already enabled) and **one blind spot**: none of its 14 items brings a single
new visitor. Only stop-plans-without-execution produces outside placements. On-site capture multiplied by close to zero
traffic is still close to zero, so these items are necessary but not sufficient. Traffic has to come from other lenses.

## Corrections found by live re-reading

- **C1 Web Analytics is probably already ON (material).** `GET https://www.mayaallan.com/_vercel/insights/script.js` returns
  `200 application/javascript` (4,469 bytes). The same request against four unrelated public Vercel sites whose root
  returns 200 (next-blog-starter, nextjs-boilerplate-five-plum-29, hello-world-next, portfolio `.vercel.app`) returns **404**
  (read 18:45:44Z and 18:46:23Z). Vercel's troubleshooting page (last_updated 2026-06-26, read ~18:46Z) says a 404 on
  `script.js` means Web Analytics was not enabled. The statement in #57 (2026-09-07) and #58 (2026-09-24) that it is
  "disabled at the project level" is therefore stale or wrong. The live homepage HTML still has no analytics tag, which
  fits the code mounting `<Analytics/>` only after consent. **Consequence:** the owner step is no longer "Enable". It is
  "open Vercel, project mayaallan, Analytics, and read what is already there (consenting visitors only)". The blocker is
  only the consent gate that #57 removes. Status: PLAUSIBLE, not proven. Only the Vercel dashboard can confirm it.
- **C2 The direct-to-main evidence is inflated and out of date.** 344 main commits since 2026-01-01 is confirmed.
  But the "303 bypassed PRs" count includes branch commits that arrived through PR merge commits (#37 `fdc0772`,
  `840afd2`, `6de3d51`, `94aa0e5`, `7a1a6b6`; #40 `e02072b`; #41 `1dd4bbf`). The PR workflow did not begin
  on 2026-05-13, because #1 and #2 merged on 2026-01-22. GitHub web-editor style subjects ("Update route.ts" and similar)
  number 29, **all in 2026-01**. The last commit straight to main was 2026-07-21 (`c6ea39c`), and September is 13 of 13
  via PR. The problem already stopped. (Read 18:44:37Z and 18:51:03Z.)
- **C3 AEO commits on 2026-05-19:** 9 subjects match (`b7a0f8a` "PR F" plus 8 "AEO" commits), not 10. This does not
  change the finding.
- **C4 Scenarios:** `/scenarios/ego-dissolution` has datePublished 2026-05-18 and dateModified 2026-09-05. #45 rewrote an
  existing page that was "Crawled, currently not indexed". It did not first publish it. There is still only 1 scenario
  live, and the sitemap has 38 URLs (read 18:45:59Z and 18:48:48Z).
- **C5 Payments count:** a keyword count of main commit subjects since 2026-01-01 (paypal, stripe, lemon, payment,
  checkout, capture, security, csrf, rate limit, webhook, refund) gives **49**. The lens's "about 67" could not be
  reproduced, so it is UNVERIFIED. The direction stands.
- **C6 Line shares reproduce exactly.** 47 merged PRs, 52,353 lines. The 13 PRs merged 09-05/06 total 10,202 lines.
  Hygiene #47+#48+#55+#56 = 6,517 lines (63.9%). The identity loop #37+#40+#50+#51+#53+#54 = 1,424 lines, of which
  1,016 fall in the last 30 days (10.0%). #46 = 1,259 lines (12.3%). #49 = 332 lines (3.3%). Last Production deployment:
  2026-09-06T15:24:25Z, which is main `ed7461a` (read 18:44:02Z). Caveat: line counts include generated files (#56
  commits an ESLint baseline, and #1 alone is 13,827 lines, 26% of the total). Counting PRs tells the same story: 0 of 47
  merged PRs did distribution.
- **C7 An idle Substack exists.** `https://mayaallan.substack.com` returns 200, is titled "Maya Allan" and says "Launched 2
  years ago". Its public archive API (`/api/v1/archive`) returned `[]`, meaning 0 posts (read 18:51:14Z). Ownership is
  UNVERIFIED, and the site's sameAs does not list it. If it belongs to the owner, it is a ready channel for the 3 Substack
  drafts from 2026-04-20 (`47365fe`).
- **C8 This research run repeats the pattern it criticises.** PR #58 (open, +1,792/-0, 22 files, all docs) and this
  `growth/2026-09-24` set are new strategy documents. Under stop-plans-without-execution, the set is only worth something
  if it ends in dated owner actions and small PRs. It must not end in another round of docs.

## Tactic-by-tactic review

| id | keep | (a) recency | (b) evidence | (c) rehash? | (d) fit | Amendment / reason |
|---|---|---|---|---|---|---|
| prior-stop-hygiene-first | YES | Live, 2026-09-24 | Real: reproduced exactly (C6); last deploy 2026-09-06 `ed7461a` confirmed | No. It is a stop rule | Yes. A solo owner's scarce time goes to non-lead work | Also absorb the useful part of the two dropped stop rules: every PR body states its lead hypothesis and metric; no payment PRs without an incident issue. Keep "security only for live incidents". |
| prior-stop-copy-rewrites | YES | Live; PRs 2026-07-15..09-06 | Real: 7 PRs, 1,424 lines confirmed; none added a page or capture point | No | Yes | Also count #43 (identity part) and #52 (FAQ schema removal) as part of the same loop. Freeze as written. |
| prior-stop-aeo-tooling | YES | Live; #46 2026-09-05, issue #44 closed 2026-09-05 | Real: #46 = 1,259 lines; #44 confirms the tracker counted brand mentions as citations | No | Yes. It measures, it does not distribute | 9 commits on 05-19, not 10 (C3). Whether the AEO cron still runs is UNVERIFIED here (it would need a source file read). The owner checks the Vercel cron list. |
| prior-stop-plans-without-execution | YES | Live; commits 2026-04-20; site read 2026-09-24 | Real: 4 commits confirmed (`47365fe`, `91c8f5d`, `1573f92`, `0386fd0`); sameAs and llms.txt list only Instagram; 5 posts all dated April 19, 2026 | No. It is the one item that turns past work into distribution | Yes. Organic and owned channels are the fitting ones (paid search is restricted, see Fit note) | Add C7 (idle Substack, 0 posts) as the first place to publish the drafts. Apply the rule to this run too (C8). A Goodreads book page already exists (listed in llms.txt), so it is partly done. |
| prior-stop-processor-churn | **NO** | Evidence ends 2026-07-15 | Real but stale. The churn ended 2026-05-21, the last payment PR was #41 on 2026-07-15, and 0 payment PRs have merged in the 71 days since. "67 commits" not reproduced (C5) | n/a | n/a | It is already the status quo. As a separate tactic it adds nothing. Its rule is folded into stop-hygiene-first. |
| prior-stop-side-projects | YES | Live: compare read 18:47:11Z | Real: `audiobook-approved-manifest` 15 ahead / 15 behind, last commit 2026-07-21, no PR; #39 closed unmerged (+3,262/-1,408); 5 locales x 2 = 10 sitemap URLs; #43 says machine-authored and unvalidated; #35 says English-only flows | No | Yes | Also: two audiobook workflows ("Chapter 1 Independent Audio Analysis", "Export Chapter 1 Audio Review") are still listed as active in Actions. The owner can disable them (S). Leave the locale pages as they are. Do not spend effort on them. |
| prior-stop-direct-to-main | **NO** | Stale: web-editor commits all 2026-01; last direct commit 2026-07-21 | Inflated (C2) | n/a | n/a | Already solved. Since 2026-07-21 every main commit came through a PR. The "lead hypothesis in PR body" rule moves to stop-hygiene-first. |
| prior-finish-pr57-analytics | YES (amended) | Live: #57 read 18:44:55Z; mergeable_state=clean; gates, Vercel and on-success checks green 2026-09-07 | Real: #57 is the only change that counts non-consenting visitors | Partly. PR #12 (2026-05-13) already built attribution and a dashboard, but behind consent. #57 is materially different: it counts every visitor without cookies and reads `marketing_visitors` back | Yes. S effort, owner only | **Change the step (C1):** (1) the owner opens the Vercel Analytics tab now and records what it shows; (2) merges #57; (3) checks for non-zero page views within 24 h. If the tab really shows "Enable", enable it and redeploy. |
| prior-finish-welcome-magnet | YES | Live: #42 (2026-07-16), #49 (2026-09-05), homepage read 18:47:42Z | Real gap: the homepage form offers only "Expect 1–2 emails per month"; /free, /sample, /newsletter and /lead-magnet all return 404; #42 disabled the welcome email and #49 kept that policy | Partly. A welcome email existed before #42. The lead magnet is new: none was ever built. Materially different because it adds an offer, not just delivery | Yes. It uses book content the owner already has | Impact size is UNVERIFIED because there is no baseline and this review could not gather outside evidence. Put this before promo-in-book, because the back matter should point to this offer. |
| prior-finish-capture-everywhere | YES | Live: 17 pages read 18:45:16Z | Real: an email input appears only on `/` (1) and `/contact` (1). There are 0 on the blog post, scenario, FAQ, glossary, 4 tools, /es, book, about, events and media pages | No. The commit history since 2025-12 shows no earlier attempt to put capture on content pages | Yes. S effort, one code PR | Fold the removal of the "In Development" eyebrow into this same PR (see finish-hide-empty). |
| prior-finish-tools-free-email | CONDITIONAL | Live: book page "Free to use. Save a session as a PDF for $9.99" read 18:47:30Z | The gap is real (`b8d24dd` 7-turn delay; #18 $9.99 PDF). The impact rests on no evidence: tool usage is unmeasured | Partly. The paid PDF and the promo PDF already exist and produced no measured leads. The free email is different only if it removes payment and turn friction | Mixed. Emailing a summary of a psychedelic-integration conversation is sensitive, health-adjacent data (see the crisis layer in #36 and the 24 h transcript rule) | Build this only after #57 shows real tool traffic (the owner sets a threshold, for example 50 tool sessions a week). Otherwise it repeats the pattern of building before there are users. It needs explicit consent, no stored transcript, and M-L effort. |
| prior-finish-promo-in-book | CONDITIONAL (amended) | Live: #53 (2026-09-06); KDP Content Guidelines read ~18:49Z (no date shown) | Real: promo redemption has existed since `339b7a3` (2026-05-11) and there is no sign a code was ever distributed. The KDP Content Guidelines page contains no rule against back-matter links; #53's "no URLs" applies to the product description only | No, as long as the code is actually distributed | Yes, but volume depends on book sales, which are UNVERIFIED | **Change the offer.** The promo path needs 5 or more tool turns (#18 test plan), and the export CTA appears only after 7 (`b8d24dd`). That is heavy friction for a reader. Point the back matter at a reader landing page with the lead magnet (a direct email capture), and keep the promo as the secondary offer. Do this after finish-welcome-magnet. |
| prior-finish-scenarios | CONDITIONAL | Live: sitemap 38 URLs, 1 scenario (18:45:59Z) | The #45 indexing-test outcome is UNKNOWN: there is no follow-up comment on #45, and Search Console was not accessible | Partly. #45 was the test; this is scale-up. It is valid only if the test shows the rewritten pages got indexed | Yes. The content already exists in the book | Correct the history (C4). Gate: the owner reads the #45 result in Search Console before any batch. Put capture on the template first. Effort L. |
| prior-finish-hide-empty | **NO** (fold) | Live: "In Development" over the Resources section, /events "No events are currently scheduled", 1 media item | The problem is real, but there is no evidence of any effect on leads (the lens says so itself) | Resembles the polish loop (#22 already reworked the Events surfaces) | n/a | Not a standalone tactic. Delete the one-line eyebrow inside the capture-everywhere PR. Hiding Events and Media is a 2-minute owner action in the existing admin navigation editor (`a8220be`) if the owner wants it. |

## Fit note (ad restrictions)

Google Ads policy "Dangerous products or services" (`https://support.google.com/adspolicy/answer/6014299`, no date
shown, read ~18:49Z) says: "Ads for substances that alter mental state for the purpose of recreation ... are not allowed"
and "Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed." Paid search
for this subject is therefore mostly closed or at risk. All kept items are organic or owned, which fits this constraint.

## What this lens does not cover (limits of this review)

- **Traffic.** No kept item except stop-plans-without-execution brings visitors. The kept capture items only pay off
  once distribution comes from another lens.
- **Outside evidence.** This reviewer could not add 2025-2026 practitioner evidence for the impact of the FINISH
  items: WebSearch returned "used its web search budget (200 of 200)". Every lead-impact size in this lens therefore
  remains **UNVERIFIED**.
- **Unread live systems.** Vercel (Analytics tab, crons), Search Console and Resend were not read. C1, the AEO cron
  state and the #45 outcome stay open until the owner checks them.

## Order of work from the kept items

1. Owner, today (S): open the Vercel Analytics tab (C1) and merge #57.
2. Code PR (S): capture-everywhere, including removal of the "In Development" label.
3. Code PR plus content (M): welcome email with a named lead magnet.
4. Owner (S per post): publish the three April drafts (Substack, C7), each with a UTM link. Log each placement in a
   GitHub issue.
5. Owner (S): book back matter pointing to the reader landing page (promo code as the secondary offer).
6. Only when #57 shows traffic: tools free email (M-L). Only when the #45 result is known: scenario batches (L).

## Live sources read (UTC, 2026-09-24)

- `gh api repos/mallan67/mayaallan/pulls?state=all`: 18:43:15Z. PR sizes #16..#58: 18:43:31Z. All 47 merged PRs summed: 18:49:33Z.
- Production deployments, main head `ed7461a`, issues #13 #14 #32 #38 #44: 18:44:02Z.
- Commits on main since 2026-01-01 (344): 18:44:23Z, 18:44:37Z, 18:51:03Z. Since 2025-01-01 (593): 18:51:26Z.
- #57 body and check-runs: 18:44:55Z. #58, #42 and #49 bodies: 18:46:43Z. #49, #53, #45, #43 and #35: 18:46:53Z. #27, #18, #45 comments, #44, compare `main...audiobook-approved-manifest`: 18:47:11Z. Actions workflows and 33 branches: 18:47:27Z.
- Branch `work/site-visibility` head `7183c7b` and commit `fec56bb`: 18:52:21Z.
- `https://www.mayaallan.com`: 17 pages 18:45:16Z; `/_vercel/insights/script.js`, `/_vercel/speed-insights/script.js`, /free, /sample, /newsletter, /lead-magnet, llms.txt, sitemap.xml: 18:45:44Z-18:45:59Z; homepage, book page, /events, llms.txt and /about sameAs: 18:47:30Z-18:47:42Z; /blog, /scenarios and JSON-LD dates: 18:48:48Z.
- Comparison Vercel sites (`*.vercel.app`, insights script 404): 18:46:23Z.
- `https://vercel.com/docs/analytics/troubleshooting` (last_updated 2026-06-26): ~18:46Z.
- `https://kdp.amazon.com/en_US/help/topic/G200672390` (no date shown) and `https://support.google.com/adspolicy/answer/6014299` (no date shown): between 18:48:48Z and 18:49:33Z.
- `https://mayaallan.substack.com` and its `/api/v1/archive`: 18:51:14Z.