# Adversarial review: engineering-as-marketing (eam), 2026-09-24

**Reviewed:** `docs/operations/growth/2026-09-24/03-engineering-as-marketing.md` at commit `170bf0f3e95a` (committed 18:44:53Z; commit metadata read live 18:53:14Z).
**Checks per tactic:**
- (a) recency;
- (b) real evidence (numbers, case, study) versus opinion or vendor hype;
- (c) rehash of what this site already did without results, checked against live GitHub PR, commit and issue metadata of `mallan67/mayaallan`;
- (d) fit for a solo author with a near-zero audience and psychedelic-content restrictions.

A tactic that fails any check gets keep=false. Useful parts of a dropped tactic are moved into a kept one, as the table states.
All times are UTC on 2026-09-24. No app source files, local files, forms or logins were used.

## Verdict
- **Kept (4):** eam-00, eam-01, eam-07, eam-06, each with the changes below.
- **Dropped (7):** eam-02, eam-03, eam-04, eam-05, eam-08, eam-09, eam-10.
- **Order:**
  1. eam-00 (days).
  2. eam-01 and eam-07 in **one** code PR.
  3. eam-06 (owner) starts the same week.

  eam-06 is the only kept tactic that brings new people. Without it, eam-01 and eam-07 capture a share of roughly zero visitors.

## Errors in the lens (fix before acting on it)
1. **The eam-07 claim "AI tools have no /books link in their SSR HTML" is false.** A live GET at 18:47:47Z found `href="/books"` twice (nav and footer) on each of `/belief-inquiry`, `/nervous-system-reset` and `/integration-reflection`. What is missing is a link to the book itself: none of the three pages contains `href="/books/psilocybin-integration-guide"`. By comparison, the scenario page has 3 such links and the glossary has 1 (18:48:05Z).
2. **The lens leaves out the tools' existing paid exit.** Live `/practices` (18:47:47Z): "No signup. Save a session as a PDF for $9.99 if you want to keep it." Commit `1f9413b` (2026-05-11) added this: "Save for $9.99 ... names the format (PDF) and delivery (email)". Two consequences:
   - eam-01's "email a copy of the reflection" gives that paid product away for free.
   - eam-07's $9.99 book CTA competes with it at the same moment. The book is also $9.99; the live book page shows the price 5 times (18:48:05Z).
3. **The HubSpot AI Search Grader is not an example of "results with no form, then an offer".** The live page (18:49:40Z) says "No Account Required", but it carries a HubSpot form modal: `data-form-title="Unlock Your Report" data-form-description="All fields are required."` (`data-modal-id="llm-grader-form"`). The report is gated behind that form. Its fields are rendered by JavaScript, so which fields it asks for is UNVERIFIED. "No account" does not mean "no email".
4. **eam-00 step 2 rebuilds events that already exist.**
   - PR #12 (merged 2026-05-13) already records `book_viewed`, `checkout_started`, `purchase_completed`, `newsletter_subscribed` and `contact_submitted`, and writes attribution to `orders`.
   - Commit `2e559a0` (2026-04-20), "Wire analytics events into three chat components", already added tool events.
   - Vercel's pricing doc (last_updated 2026-08-25, read ~18:52Z) shows Custom Events as **"-" on Hobby** (Pro includes them, with 2 properties). UTM parameters are **only on Pro with Web Analytics Plus**. If the April tool events call `@vercel/analytics` `track()` on a Hobby team, they record nothing. The project's plan was not read (UNVERIFIED).
5. **eam-10's anchors are already live.** `/glossary` (18:48:23Z) has 30 term `id`s, 30 in-page `#anchor` links, and 7 links to tools and the scenario.
6. **eam-08's share buttons already exist** (commits `d500614` and `46ad44f`, 2026-01-22). The real gap is that the three AI tool pages have **0 `og:image` and 0 `twitter:image`** (18:48:23Z), while `/` has 10 and the book page has 18. A shared tool link therefore previews without an image.
7. **eam-04 and eam-05 repeat work done in May 2026**, and the lens does not say so. Details are in the table below.
8. **Evidence strength is overstated:**
   - The Growth Method "~65,000 visits/month" figure has no source, and the article advertises Growth Method's own platform (read ~18:49Z).
   - HubSpot's 2025-01-03 mini-tools post is founder anecdotes with no numbers (read ~18:49Z).
   - Interact's 40.1% "start-to-lead" rate does not separate optional from gated email (read ~18:49Z).
   - Riddle's 34.25% vs 24.07% A/B test states no sample size, significance or duration, and it is vendor content written by Riddle's co-founder (read ~18:49Z).
   - theStacc's data is one client's 512 pages, and theStacc itself says: "Programmatic SEO is a scale tool. It is not a starting point." (read ~18:51Z).
9. **Transferability.** The AI-referral conversion figures come from brands with huge mention volume:
   - Ahrefs: 0.5% of traffic produced 12.1% of signups (2025-06-16, "last 30 days").
   - Vercel: ChatGPT brings ~10% of signups (2025-06-10).

   Ahrefs' own 75k-brand study (2025-05-26, updated 2026-04-27, read ~18:51Z) found that brands in the bottom 50% by web mentions average 0-3 AI Overview mentions, and 26% of brands have none. A new author is in that bottom half, so off-site mentions have to come before on-site AEO polish.

## Review table

| id | (a) recency | (b) evidence | (c) rehash? (live GitHub) | (d) fit | keep | required change |
|---|---|---|---|---|---|---|
| eam-00 measure funnel | OK: PR #57 (2026-09-07), PR #58 (2026-09-24), Indig 2026-07-15 (modified 2026-09-15), HubSpot/Aja Frost 2026-09-16 | Real: PR #57 says the site "measures **nothing**"; PR #58 (read 18:46:45Z) says Web Analytics is disabled | **Partly.** WA added 2026-04-20 (`ff0028c`); tool events `2e559a0`; PR #12 funnel and dashboard; AEO tracker (`b7a0f8a`, #46) | Good: cheap, and the owner's part takes minutes | **true** | Remove the duplicate events from step 2. Merge #57 (mergeable, clean at head `fa5d59b`, 18:53:02Z) and enable WA. Add only the missing events, first-party, counted server-side without identifiers |
| eam-01 capture after tool | OK: Interact 2026-09-08; Riddle 2026-06-22 (modified 07-28); WA ATG | Numbers exist but only from vendors, and they measure quizzes, not AI chat. Rate is UNVERIFIED. The gap is verified live: 0 `type="email"` on all 3 tools (18:48:23Z) | **No.** The tools have said "No signup" since Feb-Apr 2026, and no commit or PR has ever added capture | OK with changes: the topic is sensitive and WA MHMDA applies | **true** | Do not email the user's reflection: it is the $9.99 product and it is health data. Email Maya's own 7-day follow-up prompts instead. Get legal review first. Build one component that also covers eam-02 and eam-03 |
| eam-07 tool -> book bridge | OK: HubSpot grader live; Growth Method 2026-02-13 | Weak: a verified practitioner pattern (HubSpot's closing CTA), but no results; the 65k figure has no source | **No.** Book->tool links exist (`e800fc8` 2026-04-20; blog tool CTA `4c073ad`); nothing links tool->book | Good (S) | **true** | Correct the premise (error 1). Owner chooses one primary CTA at completion: the book or the $9.99 save-session PDF. Carry `ref` server-side, not as utm. Add og:image to the 3 tools in the same PR |
| eam-06 distribute tools off-site | Mixed: Ahrefs 2025-05-26 (updated 2026-04-27); Profound data Aug 2024-Jun 2025 (updated Aug 2025, over 12 months old); Vercel 2025-06-10 | Real but correlational: 0.664 vs 0.218, and the author writes "correlation ≠ causation". Profound (680M citations) is a vendor. Vercel's "community seeding" is from a large brand. No solo-author result was found | **Not visible in GitHub.** The repo shows preparation only: `0386fd0` BOOK-EXCERPTS with a "60-second reel script", `91c8f5d` Medium cross-posting, `1573f92` author-profile steps (all 2026-04-20). Whether any of it was posted is UNVERIFIED | **Required:** it is the only tactic that brings visitors. Organic only; YouTube's EDSA rules apply | **true** | Owner first lists what was already posted where, so nothing is repeated. Use tracked short links counted server-side. Point psilocybinintegrationguide.com at the book page (today it 308-redirects to `/`, 18:48:05Z) |
| eam-03 contextual offers per template | Interact 2026-09-08 | **None.** The lens itself says "No 2025-26 A/B numbers" | No; there is only a generic newsletter (`910cf8e` 2026-01-02, Resend #42 2026-07-16) | **Poor:** 5 templates, on pages that are "crawled, currently not indexed" (PR #45) and barely visited | **false** | Keep one placement: the eam-01 component on the book page, which has 0 email inputs (18:48:05Z), offering a free sample scenario. The owner picks the sample |
| eam-02 journal as 7-day email course | HubSpot blog 2025-01-03 (the oldest source) | Opinion and anecdote; Riddle is a vendor and gives no sample size | **Partly.** The journal shipped 2026-05-19 as a "linkable asset" (PR F `b7a0f8a`) and no result was measured | Weak: an optional email box beside a "No email required" download | **false** | Reuse eam-01's Day 1-7 sequence. Put the component on `/integration-journal` only once eam-01 shows capture_submit > 0 |