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
| eam-05 answer blocks for AI citation | OK: Pew 2025-07-22, Ahrefs 2026-02-04, Indig 2026-07-27, Google 2025-05-21 | Real studies, but they measure clicks and big-brand conversions, not small sites | **Yes.** `41974c9` "/faq, 20 AI-citation-optimized Q&As" and `f5514ac` "/glossary + /llms-full.txt for AI-search citation" (both 2026-05-19); PR F year-suffix titles and CitedStat ("+30-40% AI citation lift"); the AEO tracker. About 4 months on, the owner reports zero results | **Poor:** brands in the bottom 50% average 0-3 AIO mentions (Ahrefs) | **false** | Move "collect real questions from communities" into eam-06, and answer them **where they are asked** |
| eam-04 scenario library in batches | OK: spam policies updated 2026-08-28, gen-AI doc updated 2025-12-10, spam updates confirmed | The policy docs are real; the traffic case rests on a vendor and on HubSpot-scale results | **Yes.** `5be3503` (2026-05-19) added "39 draft scenario stubs" and noindex draft infrastructure. PR #45 (2026-09-05) is a **frozen** 2-page indexing test that is still running | **Poor now:** effort L; each page needs a PR #45-grade audit (14 references); indexing is unproven; Google's September spam update started 16:15Z today | **false** | Revisit only after PR #45 is read, which with its 28-day gate is 2026-10-03 at the earliest. Publishing scenarios before then contaminates the frozen test |
| eam-10 glossary anchors and links | OK | UNVERIFIED: HubSpot's "glossary for bots" detail is paywalled (read ~18:49Z) | **Yes, already live:** 30 anchors and 7 tool/scenario links (18:48:23Z); glossary shipped in `f5514ac` (2026-05-19) | Negligible | **false** | Nothing to do |
| eam-08 share cards | Next.js docs updated 2026-07-09 (v16.3.6) | **None**; the lens marks the lift UNVERIFIED | **Yes** for share buttons (2026-01-22); page OG images were done 2026-01-24 and 2026-02-02 | Near-zero users means near-zero shares | **false** | Keep one piece: add `opengraph-image` to the 3 AI tool routes inside the eam-07 PR, so eam-06 link previews show an image |
| eam-09 embeddable widget | Spam policy 2026-08-28 | **None**; the only source cited is a risk, not a benefit | No | No demand; risk under the widget-link spam policy | **false** | Drop |

## Kept tactics: what to do instead of the lens text

### eam-00: measure first (mixed, S)

**Owner, today:**
- Merge PR #57. It was mergeable with state clean at 18:53:02Z.
- Turn on Vercel -> mayaallan -> Analytics.

PR #58 (read 18:46:45Z) lists both as open owner decisions. On Hobby, only page views are needed from Vercel.

**Code PR:**
1. Before adding anything, check which of the existing PR #12 and `2e559a0` events actually fire in production.
2. Send tool events through the first-party `/api/marketing/event` endpoint (PR #12), not through Vercel custom events. Hobby has no custom events, and the project's plan is UNVERIFIED.
3. Add only what is missing: `tool_complete`, `capture_view`, `capture_submit` and `journal_pdf_download`.
4. Count `tool_complete` and `capture_submit` **server-side with no identifier**, so visitors who decline consent still appear in the totals. Attach `visitor_id` only after consent, which is the same split PR #57 uses. The PR #57 dashboard itself warns that its panels "count consented visitors only".
5. Keep the optional "Where did you hear about me?" select.

**Done when:** page views and `tool_complete` both show non-zero counts for two weeks in a row.

**Why this is not a rehash:** the earlier work built the pipes, but they were never switched on and read.

### eam-01: capture at tool completion (code PR, M; legal review first)

**Offer:** "Get 7 short follow-up prompts for this practice by email." The prompts are Maya's own fixed content. They are **not** the user's conversation, which is the $9.99 product (error 2) and is health data. Store only the email, the consent flags, a timestamp and a coarse tool id.

**Legal:** a tool id stored next to an email can itself count as consumer health data. According to the WA Attorney General's MHMDA page (read ~18:52Z):
- the definition covers data "derived or extrapolated from nonhealth data";
- the law applies to anyone who provides "services or products to Washington";
- a violation is a per se CPA violation, and individuals can sue.

Legal review before launch stays mandatory.

**Flow:** the tool stays ungated. The PR #36 crisis layer runs first, and the card appears only after the closing step.

**One component in three places:**
- tool completion (eam-01);
- the book page sample offer (taken from eam-03);
- `/integration-journal`, added later (taken from eam-02).

All three feed one Resend sequence (PR #42).

**Expected:** the capture rate is UNVERIFIED. The 40.1% and 44.9% figures come from quiz funnels, and they mix optional and gated forms. Leads ≈ completions × rate. Completions are unknown and probably near zero until eam-06 is running.

**Measure:** `capture_submit / tool_complete` per tool, unsubscribes, and the Day-3 click rate.

### eam-07: tool -> book bridge (code PR, S; same PR as eam-01)
- **Owner decision:** show one primary CTA at completion: either the book ($9.99, the whole method) or the $9.99 save-this-session PDF. Two $9.99 asks at the same moment split attention. At this traffic level an A/B test cannot reach significance, so decide instead of testing.
- **Attribution:** link to `/books/psilocybin-integration-guide?ref=tool-<slug>`.
  - Do **not** put `utm_*` on internal links. PR #12 keeps first-touch and last-touch UTM cookies, so an internal UTM would overwrite the real outside source (for example a community link from eam-06).
  - Send `ref` in the checkout request and store it on `pending_paypal_orders`. It is not an identifier, so it works without the consent cookie. PR #12's cookie snapshot only exists after consent.
- **Same PR:** add `opengraph-image` for the three AI tool routes (salvaged from eam-08).
- **Measure:** `tool_complete -> book_viewed -> checkout_started -> purchase_completed`, filtered by `ref=tool-*`, using the event names PR #12 already uses.

### eam-06: distribution where people and citations are (owner account, M; start the same week)
1. **Before posting:** Maya lists what has already been posted since April (reel script, Medium, author profiles). GitHub shows only that these were *prepared*, not whether they went out, so the list is what stops repeats.
2. **Links that count everyone:** use short paths such as `/go/yt-reset` that 308-redirect to the tool with `ref=`, counted server-side. Two reasons:
   - On Hobby, Vercel Web Analytics has no UTM reports (pricing doc, read ~18:52Z).
   - PR #12's UTM cookies exist only after consent.
3. **Channels:**
   - Answer 2-3 real questions a week in integration communities, disclosing authorship. This is where eam-05's "real questions" work goes.
   - Pitch podcasts and newsletters, offering the journal.
   - Make one 60-90 s YouTube demo per tool. YouTube's policy (read ~18:51Z) allows educational, documentary, scientific and artistic (EDSA) context, bans selling drugs, and says EDSA content "may be age-restricted". Show the reflection tool, never drug use.
   - Subreddit self-promotion rules could not be read live (HTTP 403 at 18:53:25Z), so they are UNVERIFIED. Read each community's rules before posting.
4. **Domain:** repoint psilocybinintegrationguide.com from `/` to the book page (owner, Vercel domains, S).
5. **Measure:** sessions and captures per `ref`, and `brand_mention` per week in the AEO tracker (the PR #46 split). Judge over weeks, not days. That is the lesson from HubSpot and Indig.

## Live sources read for this review (UTC, 2026-09-24)

**GitHub `mallan67/mayaallan` (gh api):**
- PR list: 18:46:35Z.
- PR bodies #57, #12, #45, #46 and #58: 18:46:45Z.
- `main` commit titles: 18:46:58Z.
- Issues and the messages of commits `1f9413b`, `2e559a0`, `1029986`, `5be3503`, `b7a0f8a`: 18:47:27Z.
- PR #57 mergeability and branch head: 18:53:02Z.
- Reviewed commit `170bf0f`: 18:53:14Z.

**www.mayaallan.com (GET only):**
- Tool pages and `/practices`: 18:47:47Z.
- Links on tool, scenario and glossary pages; the book price; the psilocybinintegrationguide.com 308: 18:48:05Z.
- og:image counts, email inputs and glossary anchors: 18:48:23Z.
- `/_vercel/insights/script.js` returned 200 at 18:53:02Z. That does not show whether Web Analytics is enabled.

**Publication dates** (page metadata via curl, 18:48:44Z):

| Source | Published | Modified |
|---|---|---|
| Growth Unhinged, Indig | 2026-07-15 | 2026-09-15 |
| Growth Unhinged, HubSpot | 2026-09-16 | 2026-09-21 |
| Interact | 2026-09-08 | |
| Riddle | 2026-06-22 | 2026-07-28 |
| Growth Method | 2026-02-13 | |
| HubSpot blog | 2025-01-03 | |
| Pew | 2025-07-22 | |
| Ahrefs, AIO clicks | 2026-02-04 | 2026-08-27 |
| Ahrefs, AI conversions | 2025-06-16 | 2026-08-12 |
| Ahrefs, brand correlation | 2025-05-26 | 2026-04-27 |
| Growth Memo | 2026-07-27 | |
| theStacc | 2026-07-10 | |

**Content reads** (WebFetch and curl, 18:48:44Z to 18:53:02Z):
- Each page in the table above.
- hubspot.com/ai-search-grader (curl, 18:49:40Z).
- vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search (2025-06-10).
- tryprofound.com/blog/ai-platform-citation-patterns (2025-06-05, updated Aug 2025).
- Google Search Central blog 2025-05-21 ("unique, non-commodity content").
- Google spam policies (updated 2026-08-28) and the gen-AI content guidance (updated 2025-12-10), curl 18:50:14Z.
- status.search.google.com/incidents.json, read 18:50:24Z: spam updates began 2026-03-24, 2026-06-24, 2026-08-18 and 2026-09-24T16:15Z (the last still ongoing).
- Vercel docs: analytics custom-events (updated 2026-06-26) and limits-and-pricing (updated 2026-08-25).
- YouTube harmful or dangerous content policy.
- atg.wa.gov MHMDA page.
- Search Console help 7440203 (says "no need to resubmit").
- Next.js opengraph-image docs (updated 2026-07-09).

## Not done / UNVERIFIED
- **No new searches.** The session's web-search budget was used up (200/200 at ~18:52Z), so there was no independent search for counter-evidence or for 2025-26 results from solo authors. Only the lens's own sources and directly fetched primary docs were checked.
- **Not read live:**
  - The Vercel project plan and whether Web Analytics is switched on. Vercel is outside this task's tool scope; the source used is PR #58.
  - The HubSpot grader's form fields, which are rendered by JavaScript.
  - Subreddit rules (HTTP 403).
  - Search Console status of the PR #45 pages.
  - Paid-ad policies for psychedelic content. The plan here is organic only.
- **Out of scope:** whether the April tool events call `@vercel/analytics` `track()` would need the source files.
- **Unknown:** whether any distribution work was ever posted off-site.
- Nothing was built, merged or submitted.