# 30-Day Lead Plan: mayaallan.com

- Plan date: 2026-09-24. Window: Day 1 = Thu 2026-09-25, Day 30 = Sat 2026-10-24.
- Status: plan only. Nothing in it has been built, sent or changed yet.
- Lead = a person who leaves contact details or buys: newsletter or journal signup, contact or inquiry (including facilitator and press), book purchase (direct PayPal or retailer), event registration, or a tool user who leaves an email.

**How this plan was built.** Six research lenses and six adversarial verification passes, all saved on branch `work/site-visibility` of `mallan67/mayaallan` (evidence files E1-E12 in Section 6). Only tactics the verification kept (`keep=true`) are used, with the reviewers' corrections applied. IDs in brackets such as `[lead-01]` point to those files. The load-bearing site and GitHub facts were re-read live for this plan at 2026-09-24T19:18:31Z-19:18:55Z, and the external sources were re-checked at 19:21:32Z-19:26:02Z.

**Numbers.** There is no traffic baseline, because the site does not count most visitors today. Benchmarks come from other sites, many of them vendors (labelled). They are context, not forecasts. Targets below are activity targets, first-lead targets and stop rules, not predicted lead counts.

## The plan in 8 lines

1. Day 1: the owner turns measurement on (checks Vercel Analytics, merges PR #57) and confirms that lead alerts reach her inbox.
2. Days 1-5: one code PR puts a single named offer, the free 7-day Integration Journal, on every page where visitors land. Today there is one form, near the bottom of the homepage.
3. Days 2-30: the owner emails licensed psilocybin facilitators and service centers in Oregon and Colorado, about 10 a day, offering a free non-clinical client handout. Asking directly is the fastest route to a first lead within 7 days.
4. Week 1: the owner repairs the Amazon listing (categories, keywords, A+ content) and stays out of KDP Select.
5. Week 2: a 3-email welcome sequence, the buy box above the fold, a tool-to-book link, and the ebook back matter pointing to the journal.
6. Weeks 2-4: borrowed audiences: podcast guest spots published on YouTube, guest essays and third-party book lists, with every link source-tagged.
7. Weeks 3-4: gated items only if the data says so (tool email capture, more scenario pages, a small Amazon ads test).
8. Every Monday: one GitHub issue records leads by source, outreach sent and replied, and pitches sent and accepted. Stop rules decide what continues.

## 1. Why zero leads

- **Almost nothing on the site can turn a visitor into a lead.** Live at 2026-09-24T19:18:43Z, an email field exists only on `/` (1, the generic "Stay Connected" form) and `/contact` (1). The book page, a blog post, `/faq`, `/belief-inquiry`, `/integration-journal` and `/events` have 0. The one newsletter form offers nothing in return. (E1 prior-finish-capture-everywhere, E3, E11; re-checked live.)
- **The best free asset is given away with no capture.** `/integration-journal` says "No email required" (3 occurrences live at 19:18:43Z). In the three AI tools the only email field sits behind the $9.99 session PDF (E3, E5). The subscriber welcome email was disabled in PR #42 (2026-07-16) and kept off in #49, so a new subscriber gets nothing (E1, E2).
- **Nobody is being sent to the site.** 0 of 47 merged PRs did distribution, and distribution got 0% of 52,353 changed lines. The April 2026 distribution plans (Substack drafts, Medium script, Goodreads/BookBub steps, reel script) were committed but not carried out: the Person `sameAs` and `llms.txt` list only Instagram, and `mayaallan.substack.com` shows 0 posts (ownership unverified) (E1, E2).
- **The effort went into the codebase, not into getting leads.** Of all merged PR lines, 63.4% went to engineering, CI and refactors and 19.1% to security and payments. In the 13 PRs merged 2026-09-05/06, 63.9% of lines were quality gates and lint, 12.3% the AEO tracker (#46), and 10.0% yet another rewrite of the same identity copy (7 PRs on one positioning since July) (E1, E2).
- **Nothing has shipped for 18 days.** The last Production deployment is 2026-09-06T15:24:25Z at `ed7461a`, still `main` HEAD (gh api, 19:18:31Z).
- **The site cannot see its visitors, so "zero leads" cannot be told apart from "zero traffic".** The live homepage mounts `GatedAnalytics`, not `CookielessAnalytics` (19:18:43Z), so Vercel Analytics loads only after a visitor clicks "Accept all". The tools' usage events go only to Vercel custom events, which are dropped without consent and do not exist on the Hobby plan. PR #57 fixes the visitor count and has been open, green and `mergeable_state=clean` since 2026-09-07 (re-read 19:18:31Z) (E11 meas-01, meas-06; E12).
- **The on-site AI-search bet has not paid off, and the evidence says why.** The FAQ with 20 AI-citation Q&As, the glossary, `llms-full.txt` and the AEO tracker all date from 2026-05-19, and about four months later the owner reports zero results (E6 eam-05, E8). Measured studies tie AI visibility to off-site mentions (Ahrefs, 75k brands: YouTube mentions ~0.737, branded web mentions 0.66-0.71, Domain Rating 0.27-0.33 [S3]). HubSpot paused its own llms.txt experiment after it got no visits [S4].
- **No sign that anyone has read the book.** Goodreads shows 0 ratings and 0 reviews. The Amazon listings show 0 reviews and a Best Sellers Rank in the millions (paperback #3,949,951, Kindle #3,144,369) (E3, E9, E10, read 18:23Z-19:01Z).

## 2. Stop doing

For the next 30 days:

- **No hygiene-first work.** Merge only PRs that (a) add a capture surface, (b) ship a distribution asset or (c) measure leads. Every PR body states its lead hypothesis and the event that will show whether it worked. Security work happens only for a live incident raised by the existing Health check workflow. No payment or checkout PR without a logged buyer-incident issue. No new audits or "remediation batches". `[prior-stop-hygiene-first]`
- **No more identity, bio, claims, FAQ or glossary rewording.** Freeze `src/lib/identity.ts`, the FAQ and the glossary. Accept a wording change only for a factual or legal error the owner reports, in one PR. `[prior-stop-copy-rewrites]`
- **No new AEO tracker features or admin dashboards.** No AEO PRs. The owner decides separately whether to pause the AEO cron to save API spend. Judge AI search by referral visits and leads, not by the tracker's score. `[prior-stop-aeo-tooling]`
- **No strategy documents that nobody carries out, including this plan.** Every item below is a dated owner action or a PR. Log each off-site placement as a GitHub issue with its date, URL and tracking link. Write no new strategy docs until the existing drafts are published somewhere. PR #58 (+1,792 lines of docs) carries the same risk. `[prior-stop-plans-without-execution]`
- **Park the side projects.** No work on the `audiobook-approved-manifest` branch, the abandoned #39 schema migration, or more machine translations. The owner can disable the two audiobook workflows that are still active in Actions. `[prior-stop-side-projects]`
- **Do not repeat what verification found was already built or already failed:**
  - more on-site AI-citation content: more FAQ Q&As, per-term glossary pages, llms.txt changes, schema tweaks, server-rendered crawler text (dropped: eam-05, eam-10, ai-08, ai-09, ai-13);
  - rebuilding what exists: the PR #12 lead events and `/admin/analytics`, IndexNow (built 2026-05-19), share buttons (2026-01-22), another restyle of the Buy Direct card (PR #5);
  - Medium cross-posting through the Medium API, which Medium archived on 2023-03-02 (ai-11, dropped);
  - a second lead magnet (sample chapter, "3 free scenarios", a separate worksheet pack), which would split near-zero traffic (lead-04, eam-02, eam-03, dropped);
  - mass-publishing scenario pages before the PR #45 indexing readout (eam-04, dropped);
  - a new zero-subscriber YouTube channel, a monthly reading circle, a Third Wave directory listing, or a hub page waiting for 2027 FDA news (ai-04 narrowed; niche-05, -06, -08 and -09 dropped);
  - paid ads on Google, Meta, TikTok or Reddit (Section 5).

## 3. Week-by-week plan

Each item gives **Steps** on this site or channel, **Owner** (code PR, owner account or content), **Effort** (S = under half a day, M = 1-3 days, L = more), **Metric and target**, **Measured by** (events from Section 4) and **Evidence**.

### Week 1 (Days 1-7, 2026-09-25 to 10-01): see visitors, capture on every page, ask for leads directly

**W1-1. Turn measurement on and confirm lead alerts (Day 1)** `[prior-finish-pr57-analytics, meas-01, meas-02, lead-08, eam-00, ai-01]`
- Steps: Section 4, steps A and B.
- Owner: owner account. Effort: S (under 1 hour).
- Metric and target: page views above 0 in Vercel within 24h. A test signup and a test contact message each produce an alert email.
- Measured by: the Vercel Analytics tab, `/admin/analytics` and the owner's inbox.
- Evidence: PR #57 [L1]; Vercel docs [S23, S24]; E11, E12.

**W1-2. Lead-instrumentation PR (Days 1-3)** `[lead-08 step 2 as rewritten, eam-00, meas-03, meas-06, meas-07, meas-08, meas-05]`
- Steps: Section 4, step C. It adds only the missing events and reuses the PR #12 events.
- Owner: code PR. Effort: S-M.
- Metric and target: every new event appears in `/admin/analytics` within 24h of deploy.
- Measured by: `/admin/analytics` and the weekly issue (Section 4, step E).
- Evidence: E11 (meas-03, -06, -07, -08), E12 corrections, E4 (lead-08).

**W1-3. One offer, captured on every page where people land (Days 1-5)** `[lead-01, lead-03, prior-finish-welcome-magnet, prior-finish-capture-everywhere, ai-10, niche-01, lead-10]`
- The offer is the free **7-day Integration Journal**. It already exists as a PDF generator with 4 phase variants, and it is the only lead magnet for these 30 days.
- The owner decides by Day 2, because this reverses a promise the page makes publicly:
  - (a) Email required. The PDF still downloads on screen as soon as the email is entered, and the page copy changes honestly.
  - (b) Email optional. This captures fewer leads.
  - Vendor context only: Riddle reports 34.25% for a mandatory form vs 24.07% for a skippable one, with no sample size given [S8].
- Steps (code PR):
  1. Build one `<LeadCapture offer="journal">` component that posts to the existing `/api/subscribe`. A hidden `source` field carries the pathname and any `src` or `ref` value, so a signup is attributed even when the visitor declined cookies.
  2. Put it under the homepage H1, and replace the "Stay Connected" copy with "Get the free 7-day Integration Journal".
  3. Put it at the end of every blog post and `/scenarios/*` page, before the References.
  4. Put it after the FAQ's Integration and Safety sections, at the top of `/blog`, under the buy box on `/books/psilocybin-integration-guide`, on `/glossary`, in the `/integration-journal` form, and below each tool (never blocking it).
  5. On blog and scenario pages, allow at most a small banner, never a full-screen interstitial [S26].
  6. Add a `/start` page with the same offer. Every off-site link in this plan points to `/start` or to a page with a `src` code.
  7. Replace the inline "Successfully subscribed!" with a `/thanks` page offering the download, one tool and the $9.99 ebook.
  8. PR #42 disabled the subscriber welcome email, so the PDF is delivered on the page at once, and a new Resend send path delivers E0 (W2-1). The owner confirms reversing #42.
  9. Remove the homepage "In Development" label (2 matches live at 19:18:43Z) and add a "Free journal" link to the header nav.
- Content rule: everything stays non-clinical, with no dosing, sourcing or treatment claims. Resend's acceptable-use policy lists pharmaceutical products [S27].
- Owner: code PR, plus the owner's decision. Effort: M.
- Metric and target: signups per week by source page, and signups per 100 page views per template once #57 is live. Target: a first signup from a page other than the homepage by Day 14. Decision rule: if a template gets 200 or more views in 2 weeks and 0 signups, change the offer copy, not the layout.
- Measured by: `newsletter_subscribed{source}` (PR #12 plus the new source field), `journal_generated`, and Vercel page views per path.
- Evidence:
  - live: 0 email inputs on the landing pages (19:18:43Z);
  - Ahrefs, first-party: AI search brought 0.5% of its visitors but 12.1% of its signups [S1];
  - Vercel: ChatGPT refers about 10% of its new signups; this is a developer platform, so it may not transfer [S2];
  - Written Word Media recommends workbooks as nonfiction reader magnets [S5];
  - Kindlepreneur: back matter first, then landing pages [S6];
  - E4 deleted the 7.5-40% forecast.

**W1-4. Direct outreach to licensed facilitators and service centers (Days 2-30; the fastest first lead)** `[niche-02]`
- Steps:
  1. The owner downloads the Oregon OPS Licensee Directory [S13] and Colorado's licensee list from the DPO page [S12]. The contact list stays in the owner's own sheet and is never committed to GitHub.
  2. The offer, from author to professional: "a free, non-clinical client handout (the 7-day Integration Journal PDF), plus author-copy pricing for the book". Say plainly that Maya is an author, not a facilitator (PR #37 removed facilitator signals from the site).
  3. Send about 10 individually written emails a day: about 50 by Day 7 and 150 by Day 21. Each email carries a `?ref=<center-code>` link or asks for a reply.
  4. Follow CAN-SPAM: identify the sender, include a valid physical postal address and an opt-out, and use no deceptive subject lines [S43].
  5. Do not pitch the New Mexico DOH: it runs a medical program and Maya has no clinical credentials. Colorado CE hosting is speculative; raise it only if a partner does.
- Owner: owner account. Kit v1 is content (W3-3), and `/for-facilitators` is a code PR (W2-5). Effort: M.
- Metric and target: replies per 100 emails, and facilitator-tagged leads. Target: 1 or more replies by Day 7. Stop rule (reviewer): after 100 sends, fewer than 5 replies per 100 means change the offer or stop.
- Measured by: a manual count in the weekly issue (counts only, no names), `newsletter_subscribed{source=ref:*}` and `purchase_completed` with a ref.
- Evidence:
  - Oregon: 383 facilitators; 22 of 35 centers operating; 952 clients in Q1-2026 vs 1,565 in Q1-2025, about 40% fewer [S9];
  - licensed facilitators "can't find work" [S10];
  - integration sessions are optional in Oregon, which served 5,935 clients in 2025 [S11];
  - Colorado has 34 licensed healing centers [S14], and its DPO requires continuing education and publishes the licensee list [S12];
  - reviewer correction: about 173 clients per center per year at the Q1-2026 rate, and falling (E10).

**W1-5. Repair the Amazon listing, and do not enroll in KDP Select (Days 3-7)** `[niche-03]`
- Steps (owner, in KDP):
  1. Re-pick 3 categories per format. The paperback is now in Inner Child, Emotional Self Help and Personal Transformation, and the Kindle in Inner Child, Alternative Holistic Medicine and Emotional Self Help. Check the nodes where comparable integration books rank, and drop Inner Child unless the content fits.
  2. Fill all 7 keyword slots with specific terms that are not in the title.
  3. Build A+ content (a scenario map and an author module). It goes live within 8 business days, so start in week 1.
  4. Write no new KDP document. PR #53 already did that, and the listing never changed.
- Owner: owner account. Effort: S.
- Metric and target: rating count, the book's position in Amazon search for "psilocybin integration" (6th on 2026-09-24), and KDP units per week. Target: A+ content live by Day 14.
- Measured by: KDP reports and a live Amazon check, logged in the weekly issue.
- Evidence: live listings [S18]. KDP help: 3 categories, 7 keywords, A+ within 8 business days, and KDP Select forbids selling the ebook on your own website [S17]. E9 and E10 (read 18:23Z-19:01Z). No source shows that these changes raise sales, so treat it as a cheap bet.

### Week 2 (Days 8-14, 2026-10-02 to 10-08): convert, then borrow audiences

**W2-1. Three-email welcome sequence (E0-E2)** `[lead-09]`
- Steps (code PR, after the owner confirms reversing PR #42):
  - E0, immediately: the journal link and how to use it.
  - E1, on day 2-3: one full scenario from the book, non-clinical.
  - E2, on day 5-7: the $9.99 ebook with `ref=welcome`, and "Reply and tell me what came up".
  - Send it with Resend Automations: the Resend changelog lists an Automation API [S28], and plan limits are UNVERIFIED. The fallback is a daily Vercel Cron plus the Resend send API. The content stays non-clinical.
- Owner: code PR, plus content for the copy. Effort: M.
- Metric and target: click rate, not open rate (Apple Mail Privacy Protection inflates opens), and ebook purchases with `ref=welcome`. Target: E2 click rate at or above 2.75%, MailerLite's average for the Author category (vendor) [S7].
- Measured by: the Resend dashboard and `purchase_completed{ref=welcome}`.
- Evidence: E3, E4 (lead-09); MailerLite [S7].

**W2-2. Book page: buy box above the fold, links fixed** `[lead-06 corrected]`
- Steps (code PR):
  1. Move the existing Buy Direct card above the fold, next to the cover. Do not restyle it; PR #5 already did that.
  2. Link the $15.99 audiobook, or remove its price.
  3. Make the "Available at" names on `/books` real links. (The retailer URL cleanup is part of W1-2.)
  4. Keep the Kindle link on `B0G765BZDL`. The research had the ASINs backwards: `B0G7JWDJYQ` is the print book.
- Owner: code PR. Effort: S.
- Metric and target: `checkout_started / book_viewed` and `retailer_click / book_viewed`. Target: record the week-1 baseline, then any increase.
- Measured by: `book_viewed` and `checkout_started` (PR #12), and `retailer_click` (new).
- Evidence: E3; E4 (the lead-06 correction, read 18:54:03Z).

**W2-3. Tool-to-book link, plus og:image on the tool pages** `[eam-07 corrected]`
- Steps (code PR):
  1. At the end of each AI tool, show the single most relevant book scenario with one call to action. The owner picks which, because the $9.99 ebook competes with the $9.99 session PDF.
  2. Link to `/books/psilocybin-integration-guide?ref=tool-<slug>` and carry `ref` on the server into `pending_paypal_orders`. Do not use internal UTMs; they would overwrite PR #12's last-touch attribution.
  3. Add `opengraph-image` to `/belief-inquiry`, `/nervous-system-reset` and `/integration-reflection`, which have 0 og:image tags today.
- Owner: code PR. Effort: S.
- Metric and target: `session_completed -> book_viewed -> checkout_started -> purchase_completed` for `ref=tool-*`. Target: the funnel shows data by Day 21.
- Measured by: first-party tool events (W1-2) and PR #12 checkout events.
- Evidence: E5; E6 (eam-07: the tools link to `/books` only in the nav and footer).

**W2-4. Search Console readout, recorded in an issue (on or after 2026-10-03)** `[ai-03]`
- Steps (owner):
  1. Run URL Inspection on the book page, `/faq`, `/glossary`, `/blog/psilocybin-integration-research` and `/scenarios/ego-dissolution`. This is also the 28-day readout of the PR #45 two-page indexing test.
  2. Record each status and the date in a GitHub issue.
  3. Fix pages that are not indexed with content, not with repeated resubmission.
- Owner: owner account. Effort: S.
- Metric and target: the indexed count. The result gates W4-2.
- Measured by: Search Console "Web" impressions per page; AI features are counted there [S25].
- Evidence: E7, E8, and Google's AI features doc [S25].

**W2-5. `/press` and `/for-facilitators` pages, and source-tagged vanity domains** `[niche-04, niche-02, meas-05]`
- Steps (code PR):
  1. `/press`: a one-sheet with bio, 5 talk topics, 3 scenario summaries, a headshot and a booking form tagged `press`.
  2. `/for-facilitators`: the author-not-facilitator statement, the free handout, author-copy pricing and a request form tagged `facilitator`. Store its `?ref=` code with the lead and pass it into PayPal `custom_id`. Consider `noindex`.
  3. Redirect `psilocybinintegrationguide.com` to `/books/psilocybin-integration-guide?utm_source=psilocybinintegrationguide.com&utm_medium=domain_redirect`, and `psilowire.com` to `/?utm_source=psilowire.com&utm_medium=domain_redirect`.
  4. Both domains 308 to `/` today (19:18:55Z), and there is no evidence either gets traffic. Tag them only because the owner will say or print them.
- Owner: code PR. Effort: S.
- Metric and target: press- and facilitator-tagged inquiries, and sessions from the tagged redirects. Target: forms working by Day 10.
- Measured by: `contact_submitted{source}` and the `src` or UTM rows.
- Evidence: E9, E10, E11, E12.

**W2-6. Pitch podcasts and guest essays, 2 a week from Day 8** `[niche-04, ai-04 narrowed, eam-06, ai-06]`
- Steps (owner and content):
  1. Pitch guest spots on integration and psychedelic podcasts that publish video on YouTube, and guest essays for The Microdose's Opinion section [S15]. Psychedelics Today also invites guest pitches but is "very selective" [S16].
  2. Tie each pitch to verified 2026 news: Compass expects to finish its COMP360 NDA in Q4 2026, with a launch expected in H1 2027 if the FDA approves it and the DEA reschedules [S19]; Oregon clients are down about 40% while the number of licensed facilitators grows [S9].
  3. Name `psilocybinintegrationguide.com` in every appearance and use a `/start?src=<outlet>` link.
  4. On video, stay inside YouTube's educational exception: no instructions on use, making or sourcing.
  5. First list anything already posted off-site in April 2026 (UNVERIFIED), so nothing is duplicated.
- Owner: owner account, plus content for the pitch copy. Effort: M.
- Metric and target: pitches sent (8 by Day 30) and accepted, and signups with `src=<outlet>`. There is no per-placement forecast; the reviewer struck the vendor figure. Stop rule (reviewer): 6 pitches with no acceptance means rework the angle.
- Measured by: `newsletter_subscribed{source=src:*}` and referrer hosts in the PR #57 acquisition panel.
- Evidence:
  - Ahrefs, 75k brands: YouTube mentions correlate at about 0.737 with AI visibility (a correlation, not proof of cause) [S3];
  - an arXiv preprint finds AI search has an "overwhelming bias" toward earned media [S30];
  - E9, E10: the "89,000 subscribers" figure for The Microdose was not reproduced; its page says "tens of thousands".

**W2-7. Point the ebook back matter at the journal** `[prior-finish-promo-in-book as amended, lead-01]`
- Steps (owner):
  1. Add a back-matter page, now to the directly sold PDF and at the next upload to the KDP and print files: "Free 7-day Integration Journal: mayaallan.com/start?src=book".
  2. Put the promo code second, and set `PROMO_CODES` in Vercel.
  3. The live KDP Content Guidelines have no rule against back-matter links; the no-URL rule recorded in PR #53 covers the product description only (E2).
- Owner: owner account. Effort: S.
- Metric and target: signups with `src=book`, and promo redemptions. Target: the tagged link is live in the direct PDF by Day 14.
- Measured by: `newsletter_subscribed{source=src:book}`.
- Evidence: E1, E2; Kindlepreneur [S6].

### Week 3 (Days 15-21, 2026-10-09 to 10-15): third-party proof, and gated builds

**W3-1. Get onto third-party book lists and into earned media, using a one-time prompt panel** `[ai-06 primary, ai-12 reduced]`
- Steps (owner):
  1. Read the existing AEO tracker data first. Build nothing new.
  2. Run the panel once: 10 prompts, 2 runs each, in ChatGPT, Perplexity and Google AI Mode, logged out. Record whether Maya is mentioned and which domains are cited.
  3. From the cited domains, list the authors of "books on psychedelic integration" lists, publisher blogs and newsletters.
  4. Send each list author a short note and a review copy.
  5. Never publish a page that ranks her own book #1. Self-promotional listicles lost 29-49% visibility in January 2026 [S31].
  6. Repeat the panel quarterly, not monthly.
- Owner: owner account. Effort: M.
- Metric and target: third-party URLs naming the book or author (each logged as an issue), and referrals from them. Target: 10 list authors contacted by Day 21.
- Measured by: referrer hosts (#57), `src` codes and the issue log.
- Evidence: arXiv 2509.08919, a preprint [S30]; Growth Memo, 91% of cited URLs appear in only one engine [S32]; Lily Ray [S31]; E7, E8.

**W3-2. Honest reviews from the first subscribers and partners** `[lead-07; ai-06 absorbs ai-07]`
- Steps (owner):
  1. Invite subscribers from weeks 1-2 and facilitator contacts to read a free ebook and leave an honest review on Goodreads or Amazon.
  2. Never tie the reward to the review's sentiment [S29]. Read Amazon's current review policy before asking; it is UNVERIFIED because the page returned 503.
  3. Add no `AggregateRating` or `Review` schema until real reviews exist.
  4. Add reader quotes to the book page only with the reader's permission.
- Owner: owner account. Effort: M.
- Metric and target: Goodreads and Amazon rating counts. Target: 5 or more by Day 30, which also unlocks W4-3.
- Measured by: a live check logged in the weekly issue.
- Evidence: Goodreads shows 0 ratings [S20]. Baymard: 19% of shoppers abandon over trust, but in e-commerce, so it is weak evidence here [S21]. FTC rule [S29].

**W3-3. Facilitator kit v1** `[niche-02]`
- Steps (content):
  1. Write 6-8 non-clinical worksheets keyed to the book's scenarios, with crisis resources and a cover partners can co-brand.
  2. Send it to everyone who replied to W1-4, and offer it on `/for-facilitators`. It is a professional version of the one magnet, not a second consumer magnet.
- Owner: content. Effort: M.
- Metric and target: kit requests, and bulk or author-copy orders. Target: kit sent to every replier by Day 21.
- Measured by: `contact_submitted{source=facilitator}` and `purchase_completed{ref}`.
- Evidence: as for W1-4.

**W3-4. Tool email capture (CONDITIONAL)** `[eam-01 corrected, lead-02, prior-finish-tools-free-email]`
- Gate: build it only if first-party tool events show real use. The owner sets the bar; a suggestion is 20 or more `session_completed` in 14 days. A legal review under Washington's My Health My Data Act must come first [S34].
- Steps (code PR):
  1. At the end of a tool session, offer Maya's static 7-day prompts by email. Never send the user's own reflection or transcript: that would give away the $9.99 product, and it would be health data.
  2. Add a separate, unchecked newsletter opt-in.
  3. Suppress the offer on crisis turns (PR #36), and route any extra LLM call through the PR #17 safety layer.
  4. Store only the email, tool slug, consent flags and a timestamp. Update `/privacy`.
- Owner: code PR, plus the owner's legal review. Effort: M.
- Metric and target: `capture_submit / session_completed` per tool, and $9.99 exports before vs after. No target until there is a baseline.
- Measured by: first-party tool events and `newsletter_subscribed{source=tool:*}`.
- Evidence: E5; E6 (vendor quiz rates do not carry over to multi-turn AI chat); E3, E4.

**W3-5. Checkout friction decision (Day 21)** `[lead-05]`
- Steps (owner decision):
  1. Compare `checkout_started` with `purchase_completed`.
  2. If drop-off shows at the `/checkout/privacy-gate` checkbox step, make the confirmation inline and non-blocking on the book page, keeping the PayPal SDK popup and the scrub.
  3. This reverses Maya's own privacy spec (d4c33b6), so decide on data, not before.
- Owner: owner decision, then a code PR. Effort: S.
- Metric and target: checkout completion rate. Decide on Day 21.
- Measured by: PR #12 checkout events.
- Evidence: Baymard, 17% of shoppers abandon because checkout is too long or complicated (an e-commerce survey) [S21]; E4.

**W3-6. Reddit, optional and light** `[ai-05]`
- Steps (owner):
  1. Only while the W1-4 cadence is holding, post 2-3 substantive answers a week in communities whose rules allow it. No link-dropping.
  2. Disclose authorship where it is relevant. Never give dosing or sourcing advice.
  3. Subreddit rules are UNVERIFIED (Reddit's API returned 403).
- Owner: owner account. Effort: S-M.
- Metric and target: `reddit.com` referrals and `src=reddit` signups. No target.
- Measured by: referrer hosts (#57).
- Evidence: Reddit Rules [S33]; E7, E8 (vendor data on Reddit's AI-citation weight conflicts); the niche reviewer puts facilitator outreach first.

### Week 4 (Days 22-30, 2026-10-16 to 10-24): review, then only data-gated moves

**W4-1. Day-28 review** (owner, S)
- Steps:
  1. Fill in the 4-week table: leads by source; outreach sent and replies; pitches sent and accepted; signups per 100 views per template; the checkout funnel.
  2. Apply each stop rule. Keep the channels that produced a lead and cut the ones that did not.
  3. Write the next 30 days as GitHub issues, not a document.

**W4-2. Scenario batch (CONDITIONAL)** `[prior-finish-scenarios]`
- Gate: only if W2-4 shows the PR #45 pages indexed and the capture component is live on the scenario template.
- Steps: publish 3-5 scenarios to the #45 sourced standard, each ending with the journal offer and a book link. Otherwise skip. Google's September 2026 spam update began 2026-09-24 [S35].
- Owner: content, then a code PR. Effort: L.
- Metric: indexed URLs, and signups from `/scenarios/*`.

**W4-3. Amazon Sponsored Products test (GATED; probably after Day 30)** `[niche-10]`
- Gate: only once 5 or more ratings and the A+ content are live.
- Steps: $5-10 a day for 14 days on exact-match terms. Stop if the ads are disapproved.
- Owner: owner account. Effort: S.
- Metric: orders and ACOS in the Amazon Ads console.

**W4-4. Amazon Attribution tags (DEFERRED)** `[meas-04]`
- Gate: only if `retailer_click` shows 5 or more Amazon clicks a week.
- Steps: create one free Attribution tag per placement (book page, newsletter, bio). The Bookshop affiliate step was removed as UNVERIFIED.
- Owner: owner account, then a code PR. Effort: M.

**W4-5. Events waitlist (CONDITIONAL)** `[lead-10 trimmed]`
- Gate: only if Maya will actually schedule an event.
- Steps: add a waitlist form tagged `events-waitlist` to `/events`, and an unchecked newsletter opt-in to `/contact`. `/events` shows "No events are currently scheduled" (live, 19:18:43Z).

## 4. Instrumentation first (ships in week 1)

The goal: every visitor is counted, every lead lands in one table with its source, and the owner hears about each lead the same day. No new vendor, no new cookie and no CSP change.

**A. Owner, Day 1 (about 30 minutes)** `[meas-01, meas-02, prior-finish-pr57-analytics]`
1. Open Vercel -> project `mayaallan` -> Analytics and check whether Web Analytics is on; enable it if not. The evidence conflicts: PR #57 and #58 say it is off, but `/_vercel/insights/script.js` returns 200 (19:18:55Z), and Vercel ties only a 404 to "not enabled" [S24]. It stays UNVERIFIED until the dashboard is opened.
2. Note the plan tier. Hobby has no custom events and no UTM reports [S23], and the Hobby plan doc says "non-commercial, personal use only" [S22], yet the site takes PayPal payments (Section 5).
3. Merge PR #57 and confirm the production deploy.
4. Verify: `curl -s https://www.mayaallan.com/ | grep -c CookielessAnalytics` returns 1 or more, and `GatedAnalytics` no longer gates Web Analytics. A private-window visit that ignores the banner shows up in Vercel within minutes.

**B. Owner, Day 1 (10 minutes): lead alerts**
1. Submit a test signup on the homepage and a test message on `/contact` yourself. The author of this plan submitted no forms.
2. Confirm that the operator alert emails from PRs #47 and #49 (`alertAdmin`) arrive. Delivery is UNVERIFIED.
3. Confirm the PayPal seller email arrives for a direct sale, and check whether a $9.99 session-export purchase sends any alert (UNVERIFIED).

**C. Code PR, Days 1-3: only the missing events** `[lead-08, eam-00, meas-03, meas-06, meas-07, meas-08]`

Reuse PR #12's server-side events (`newsletter_subscribed`, `contact_submitted`, `checkout_started`, `purchase_completed`), its `/api/marketing/event` ingest and `/admin/analytics`. Add only these:

| Add | Detail | Privacy rule |
|---|---|---|
| `source` on every subscribe | Hidden field: the pathname plus any `src` or `ref` query value | Stored on the lead row |
| `journal_generated{phase, emailed}` | Fired from `/api/tools/integration-journal` | No identifiers |
| `retailer_click{retailer, format, location}`, `cta_click`, `share_click` | `navigator.sendBeacon` to `/api/marketing/event`, with `fetch` keepalive as the fallback | No `ma_visitor_id` without consent |
| Tool events copied to the site's own table: `tool_viewed`, `tool_started`, `session_completed`, `export_cta_clicked` | Same names as the existing `window.va` calls | Aggregate only: no visitor or session ID, never chat text |
| AI-referrer channel | In the #57 helper `src/lib/analytics-acquisition.ts`: `chatgpt.com`, `chat.openai.com`, `utm_source=chatgpt.com` [S36], `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, `claude.ai` | Referrer host only |
| Optional "How did you find me?" (`found_via`) | On the newsletter and contact forms, stored in `marketing_events.properties` | The field is optional |
| `/r/<code>` short links | Server-side 302 to the target with `src=<code>`, logging `link_click{code}`. Used for every off-site link, because Hobby has no UTM reports and PR #12's cookies are consent-gated | The code only |
| Clean retailer URLs | Strip the B&N `jsessionid`, the third-party AbeBooks affiliate tag (`aff_ir_353196_77798` / `cm_mmc=aff`), the Bokus `srsltid` and the Bookshop `IndieBound` ref. Keep the Kindle ASIN `B0G765BZDL` | - |

Salvaged from the dropped weekly-digest tactic: one assertion in the existing scheduled Health check workflow that fails when `marketing_events` has had no new rows for 72h.

**D. Owner, Days 2-3 (30 minutes)** `[ai-02]`
1. Verify `www.mayaallan.com` in Bing Webmaster Tools by importing it from Search Console; there is no `msvalidate` tag on the live site.
2. Submit `/sitemap.xml` and open AI Performance, which shows citations and grounding queries across Copilot and Bing AI [S37].
3. Do not rebuild IndexNow; it already exists.

**E. Every Monday: the weekly lead issue** (owner, 15 minutes)
- Open `/admin/analytics` and the Vercel dashboard, then open a GitHub issue "Leads week N" that records:
  - visitors, top sources and top landing pages;
  - leads by type and `source`;
  - facilitator emails sent and replies received;
  - pitches sent and accepted;
  - placements live, with their `/r/` codes;
  - rating counts.
- The issue holds counts and public URLs only, never names or email addresses. At near-zero traffic it takes the place of a digest cron (meas-09 was dropped).

**Lead map**

| Lead | Event or source of truth | Status |
|---|---|---|
| Newsletter or journal signup | `newsletter_subscribed{source}` | Exists (#12); `source` is new |
| Contact, press or facilitator inquiry | `contact_submitted{source}` | Exists; the tagging is new |
| Direct ebook purchase | `checkout_started`, `purchase_completed{ref}` | Exists; `ref` is new |
| Retailer purchase intent | `retailer_click`, plus KDP reports for sales | New |
| Tool user leaves an email | `capture_submit{tool}` | Only if W3-4 passes its gate |
| Facilitator email reply | Manual count in the weekly issue | New |

## 5. Risks and constraints

- **Ad policies.**
  - Google Ads bans "instructional content about producing, purchasing, or using recreational drugs" [S38, re-read 19:22:53Z]. PR #53 records that the manuscript contains dosing material, so the ban applies to this book.
  - TikTok bans ads and landing pages that promote drugs [S39].
  - Meta has a news-and-awareness exception, but the rejection risk is high, so it is not worth trying now [S40].
  - The Reddit ads policy is UNVERIFIED.
  - Amazon lists "Drugs" among book topics with ad limits [S41], which is why W4-3 is gated.
- **YMYL and health claims.**
  - Every page, email, pitch, video and outreach message stays non-clinical: no dosing, sourcing, medical or therapeutic claims, and no copying a competitor's "sourcing guide".
  - Maya is presented as an author and educator, not a facilitator (PR #37).
  - The tools' crisis layer (PR #36) always runs first.
  - Resend's acceptable-use policy lists pharmaceutical products [S27], so the emails stay educational.
  - YouTube appearances stay inside the educational exception.
- **Health data and privacy.**
  - Washington's My Health My Data Act covers inferred health data, reaches businesses outside the state and allows private lawsuits [S34]. Any email linked to tool use needs a legal review first (W3-4). No transcript is stored or emailed, and tool events are aggregate only.
  - The privacy page says consent is asked only where the law requires it, but the code asks everyone. After #57, change the privacy-page wording to match, not the code. The ICO's statistics exemption does not cover tracking individual visitors [S42].
- **Email and outreach law.** Facilitator outreach follows CAN-SPAM [S43]. Contact lists stay out of GitHub. If the journal is gated, the "No email required" copy must change before the gate goes live.
- **Reviews.** The FTC's final rule (2024-08-14) bans rewards conditioned on a review expressing a particular sentiment [S29]. Amazon's review policy is UNVERIFIED, and the owner reads it before asking anyone. No review schema until real reviews exist.
- **KDP Select.** Do not enroll. Its exclusivity forbids selling the ebook on your own website [S17], and the direct PayPal ebook is the site's only on-site purchase.
- **Vercel plan.** The Hobby plan is "non-commercial, personal use only" [S22], while the site takes payments. The owner confirms the tier on Day 1. Hobby also lacks custom events and UTM reports [S23], which is why this plan counts leads in the site's own tables.
- **Google spam policy.** The September 2026 spam update began 2026-09-24 [S35]. Scaled or doorway pages are a risk, which is why W4-2 is gated.
- **Limits of the evidence.**
  - Every benchmark comes from other sites, often from vendors, and none covers solo authors or health-adjacent books.
  - Several research lenses ran out of web-search budget (200/200), so relevant 2025-2026 case studies may have been missed.
  - Only the owner can check the database counts of subscribers, orders and contacts, the Vercel project state and the Search Console status; all are UNVERIFIED.

## 6. Sources

All read times are UTC on 2026-09-24. "Lens" means the read by the research or verification pass. "Re-check" means this plan's own live reachability or content check.

**Evidence files** (git, branch `work/site-visibility` of mallan67/mayaallan, folder `docs/operations/growth/2026-09-24/`, listed live 19:18:31Z; all written 2026-09-24)
- E1 `01-prior-efforts.md` (commit fec56bb)
- E2 `prior.verify.md` (03e0b7e)
- E3 `02-lead-path.md` (382eac1)
- E4 `leadpath.verify.md` (12090bd)
- E5 `03-engineering-as-marketing.md` (170bf0f)
- E6 `eam.verify.md` (185d009)
- E7 `04-ai-search-practice.md` (c4155b1)
- E8 `aisearch.verify.md` (ea8ce1d)
- E9 `05-niche-and-channels.md` (8cc30da)
- E10 `niche.verify.md` (d9f569f)
- E11 `06-measurement-engineering.md` (de61b08)
- E12 `measure.verify.md` (6f59144)

**Live reads for this plan**
- L1 https://github.com/mallan67/mayaallan/pull/57: opened 2026-09-07; open, `mergeable_state=clean`; read 19:18:31Z.
- L2 https://github.com/mallan67/mayaallan/pull/58: draft, opened 2026-09-24; read 19:18:31Z.
- L3 https://api.github.com/repos/mallan67/mayaallan/deployments?environment=Production: last deploy 2026-09-06T15:24:25Z at `ed7461a`, which is `main` HEAD; read 19:18:31Z.
- L4 https://www.mayaallan.com/ plus `/integration-journal`, `/events`, `/books/psilocybin-integration-guide`, `/blog/psilocybin-integration-research`, `/faq`, `/belief-inquiry`, `/contact`, `/start` (404), `/press` (404), `/free` (404) and `/_vercel/insights/script.js` (200): GET 19:18:43Z-19:18:55Z.
- L5 https://psilocybinintegrationguide.com/ and https://psilowire.com/: 308 to `https://www.mayaallan.com/`; HEAD 19:18:55Z.
- The other PRs cited (#5, #12, #17, #18, #36, #37, #42, #45, #46, #47, #49, #53) were read by the lenses between 18:22Z and 19:00Z at https://github.com/mallan67/mayaallan/pull/NUMBER.

**External sources**

| # | Source | Published / updated | Read |
|---|---|---|---|
| S1 | https://ahrefs.com/blog/ai-search-traffic-conversions-ahrefs/ (first-party data) | 2025-06-16 | lens 02 ~18:3xZ; re-check 200 19:21Z |
| S2 | https://vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search | 2025-06-10 | lens 02/03 ~18:3xZ; re-check 200 19:21Z |
| S3 | https://ahrefs.com/blog/ai-brand-visibility-correlations/ (correlational) | 2025-12-12 | lens 04 ~18:2x-18:3xZ; re-check 200 19:21Z |
| S4 | https://www.growthunhinged.com/p/hubspot-ai-search-experiments | 2026-09-16 | lens 03 18:21-18:35Z; re-check 200 19:21Z |
| S5 | https://www.writtenwordmedia.com/reader-magnet/ | 2026-09-01 | lens 02; re-check 200 19:21Z |
| S6 | https://kindlepreneur.com/reader-magnets/ | updated 2025-10-01 | lens 02; re-check 200 19:21Z |
| S7 | https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks (vendor) | 2025-12-03 | lens 02; re-check 200 19:21Z |
| S8 | https://www.riddle.com/blog/use-cases/data-collection/lead-generation-quizzes-zero-party-data/ (vendor; no sample size) | 2026-06-22 | eam verify ~18:5xZ; re-check 200 19:21Z |
| S9 | https://psychedelicalpha.com/resources/the-oregon-psilocybin-services-tracker/ | June 2026 | lens 05 18:21-18:47Z; niche verify ~19:00Z; re-check 200 19:22Z |
| S10 | https://www.opb.org/article/2026/01/22/think-out-loud-oregon-licensed-psilocybin/ | 2026-01-22 | lens 05; re-check 200 19:22Z |
| S11 | https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2026.1777387/full | 2026-05-13 | lens 05; re-check 200 19:22Z |
| S12 | https://dpo.colorado.gov/NaturalMedicine | live page | niche verify 19:00:58Z; re-check 200 19:22Z |
| S13 | https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Pages/Psilocybin-Licensee-Directory.aspx | live page | lens 05; re-check 200 19:22Z |
| S14 | https://www.cpr.org/2026/02/04/tour-of-three-colorado-psychedelic-healing-centers/ | 2026-02-04 | lens 05; re-check 200 19:22Z |
| S15 | https://themicrodose.substack.com/about | live page | niche verify 19:05:00Z; re-check 200 19:22Z |
| S16 | https://psychedelicstoday.com/contact/ | live page | lens 05 18:33:23Z; re-check 200 19:22Z |
| S17 | https://kdp.amazon.com/en_US/select, plus KDP help https://kdp.amazon.com/en_US/help/topic/G200652170, .../G201298500 and .../G8EP5W6H9CY7T8GS | live pages | lens 05 ~18:34Z; niche verify ~19:01Z; re-check (select) 200 19:22Z |
| S18 | https://www.amazon.com/dp/B0G7JWDJYQ and https://www.amazon.com/dp/B0G765BZDL | live listings | niche verify 19:01:28Z (not re-checked; Amazon blocks automated fetches) |
| S19 | https://ir.compasspathways.com/News--Events-/news/news-details/2026/Compass-Pathways-Announces-Six-Month-Data-from-Second-Phase-3-Trial-Confirming-Rapid-and-Durable-Profile/default.aspx | 2026-07-07 | niche verify ~19:0xZ; re-check 19:25:58Z ("on track for final submission in Q4") |
| S20 | https://www.goodreads.com/book/show/245299940-psilocybin-integration-guide | live page | lens 04 18:32:04Z; re-check 200 19:22Z |
| S21 | https://baymard.com/lists/cart-abandonment-rate (e-commerce survey) | updated 2025-09-22 | lens 02; re-check 200 19:21Z |
| S22 | https://vercel.com/docs/plans/hobby ("non-commercial, personal use only") | 2026-09-14 per E12 | re-check, text matched 19:22:44Z-19:22:53Z |
| S23 | https://vercel.com/docs/analytics/limits-and-pricing | 2026-08-25 | lens 06; re-check 200 19:22Z |
| S24 | https://vercel.com/docs/analytics/troubleshooting | 2026-06-26 | lens 06; re-check 200 19:22Z |
| S25 | https://developers.google.com/search/docs/appearance/ai-features | 2025-12-10 | lens 04 ~18:24Z and 18:33Z; re-check 200 19:22Z |
| S26 | https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials | 2025-12-10 ("Last updated", re-check) | re-check 19:25:58Z-19:26:02Z |
| S27 | https://resend.com/legal/acceptable-use ("Pharmaceutical products") | live page | re-check, text matched 19:22:44Z-19:22:53Z |
| S28 | https://resend.com/changelog ("Automation API") | entry 2026-08-25 per E4 | re-check, text matched 19:22:44Z-19:22:53Z |
| S29 | https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials | 2024-08-14 (older; still the current rule) | re-check, text matched 19:22:44Z-19:22:53Z |
| S30 | https://arxiv.org/abs/2509.08919 (preprint, not peer reviewed) | 2025-09-10 | lens 04; re-check 200 19:22Z |
| S31 | https://lilyraynyc.substack.com/p/is-google-finally-cracking-down-on | 2026-02-03 | lens 04; re-check 200 19:22Z |
| S32 | https://www.growth-memo.com/p/the-consensus-gap | 2026-05-11 | lens 04; re-check 200 19:22Z |
| S33 | https://redditinc.com/policies/reddit-rules | live page | niche verify 19:07:02Z; re-check 200 19:22Z |
| S34 | https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy | live page | eam verify ~18:52Z; re-check 200 19:22Z |
| S35 | https://status.search.google.com/incidents.json and https://developers.google.com/search/docs/essentials/spam-policies | policies updated 2026-08-28; the September 2026 spam update started 2026-09-24 | lens 03 18:22:39Z; eam verify 18:50:24Z; re-check (policies) 200 19:22Z |
| S36 | https://help.openai.com/en/articles/12627856-publishers-and-developers-faq (`utm_source=chatgpt.com`) | updated ~2026-08-29 | aisearch verify 18:49:21Z, measure verify 18:52:57Z; re-check 403 19:22Z (bot block) |
| S37 | https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview | 2026-02-10 | lens 04; re-check 200 19:22Z |
| S38 | https://support.google.com/adspolicy/answer/6014299 | live policy | re-check, text matched 19:22:53Z |
| S39 | https://ads.tiktok.com/help/article/tiktok-ads-policy-dangerous-products-or-services | updated April 2025 | lens 05; re-check 200 19:22Z |
| S40 | https://transparency.meta.com/policies/ad-standards/restricted-goods-services/drugs-pharmaceuticals/ | changelog 2025-02-27 | lens 05; re-check 400 19:22Z (bot block), so UNVERIFIED now |
| S41 | https://advertising.amazon.com/en-gb/library/guides/book-ad-moderation-and-approval | live page | lens 05 (client-rendered; specifics UNVERIFIED) |
| S42 | https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/ | live guidance (the DUAA 2025 page it builds on was updated 2026-06-19 per E11) | measure verify ~18:5xZ; re-check 200 19:25:58Z |
| S43 | https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business | live guidance | re-check, text matched ("valid physical postal address", "opt out") 19:25:58Z |

## Not done / open

- Nothing in this plan has been built, merged, sent or deployed. PR #57 is still unmerged (19:18:31Z), and `main` has not been deployed since 2026-09-06.
- UNVERIFIED, and checkable only by the owner: Vercel Web Analytics state and plan tier; Search Console and Bing status; database counts of subscribers, orders and contacts; whether lead-alert emails arrive; Amazon's review policy; Resend plan limits; subreddit rules; the Reddit ads policy.
- There are deliberately no lead-count forecasts until the week-1 instrumentation produces a baseline.