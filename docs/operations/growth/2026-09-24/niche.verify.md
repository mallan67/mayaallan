# Adversarial review: niche-landscape-channels (2026-09-24)

- **Reviewed:** `docs/operations/growth/2026-09-24/05-niche-and-channels.md` on `work/site-visibility`, lens commit `8cc30dac0d56f0206a0596e3735a121a89d52820`. At 2026-09-24T19:08:14Z that commit was an ancestor of the branch head `14ba89c8` (76 ahead, 0 behind).
- **Source reads:** 2026-09-24T18:56:33Z to 19:09:02Z (UTC). Every fact below was re-read live in this window. Nothing comes from local files, memory or earlier answers.
- **Method:** For each tactic I opened its sources again and checked four things. (a) Recency: is it from 2025-2026, or still demonstrably current? (b) Evidence: is it real (numbers, a case, a study), or opinion and vendor claims? (c) Rehash: does it repeat work the site already did without results? This was checked against live GitHub metadata of `mallan67/mayaallan` only: PR titles and bodies, `main` commit titles, and issues. (d) Fit: does it suit a solo author with almost no audience, under psychedelic-content ad restrictions?
- **Tools:** `gh api` (metadata only), curl GET/HEAD, WebFetch. The web-search quota for this session was already used up (200/200), so no new searches were run. Only the lens's own URLs and pages linked from them were read.

## Verdict in one paragraph

5 of 10 tactics are kept: **niche-01, niche-02, niche-03, niche-04 and niche-10**. Each needs corrections, listed below. 5 are dropped: **niche-05, 06, 07, 08 and 09**. **Cross-cutting gap:** none of the 10 tactics cites a measured result from a practitioner (signups, leads or sales that someone actually got from the tactic). The evidence is niche-landscape facts (state program data, outlet reach) and platform rules (KDP, ad policies). Every "expected impact" figure is the lens author's own estimate, and one of them (niche-04) rests on a vendor claim that does not apply here. Downstream synthesis must present these as hypotheses to measure, not as proven lead sources. The owner asked what top practitioners *actually* did, and this lens does not supply that evidence.

## Review table

| ID | Keep | (a) Recency | (b) Evidence real? | (c) Rehash of prior site work? | (d) Fit (solo, ~0 audience, ad-restricted) | Required changes |
|---|---|---|---|---|---|---|
| niche-01 Named free asset + capture on every page + vanity-domain attribution | **YES** | OK. Live site and GitHub reads today | YES for the gaps. Verified live: 1 email input on `/` and 0 on `/books`, `/books/psilocybin-integration-guide`, `/blog`, `/events`, `/belief-inquiry` and `/integration-journal`; the vanity domains 308 to `/`. NO conversion benchmark for named asset vs generic form | PARTIAL. UTM attribution already exists (PR #12, merged 2026-05-13, consent-gated). Delivery "via existing Resend flow": PR #42 **disabled the subscriber welcome email**. Named asset, capture on every page and vanity landing are new | Good. Code-only, no ad dependency | Reuse PR #12 attribution; do not rebuild it. Record `source` from a hidden form field at submit time, so signups from visitors who did not consent to cookies still carry a source. Build a new asset-delivery email: none exists since PR #42. The asset must be integration worksheets, never sourcing or dosing material (the Psychedelic Passage magnet is a "psilocybin sourcing guide", do not copy it) |
| niche-02 Client integration kit for OR/CO facilitators and centers | **YES** | OK. 2026-01-22, 2026-02-04, 2026-05-13, Q1-2026 tracker, live licensee pages | YES. State data, news and a peer-reviewed study, all verified | NO. No outreach, partner or B2B work appears in any PR or commit title | Fair. 10 emails a day is solo-feasible. Watch the positioning conflict with PR #37 (see notes) | Correct "270 clients per center" to about 173 at the Q1-2026 run rate. Drop the New Mexico DOH pitch. Treat Colorado CE hosting as speculative. Page copy must not imply Maya is a facilitator |
| niche-03 Amazon listing repair; no KDP Select | **YES** | OK. Live listing read today; KDP help pages current (undated) | YES for the facts: BSR #3,949,951 paperback and #3,144,369 Kindle; no rating-count or `aplus-module` markup found. NO data on how much category, keyword or A+ changes improve sales | PARTIAL. PR #53 (merged 2026-09-06) already wrote "KDP guidance" into `content/BOOK-METADATA.md`, and the live listing still shows Inner Child categories, so the guidance was never applied | Good. Owner account, S effort | The new part is *execution in KDP* with named category nodes and keywords, not another document. Fix the category facts. Check Amazon's review rules before asking partners who received a free kit for reviews |
| niche-04 Guest essays and podcasts in niche media + /press | **YES** (estimate struck) | OK. Outlet pages live; beehiiv post 2026-09-22 | YES for reach and openness: The Microdose has "tens of thousands of subscribers" and an Opinion section of "Guest perspectives, essays, thoughts."; Psychedelics Today invites guest and article inquiries. **NO for impact:** the beehiiv line is vendor, generic, and written for 10k+ newsletters doing co-created issues | NO | Good. This is the only way to borrow an audience while paid ads are closed | Strike the "20-150 signups per placement" figure and the beehiiv citation. The lens's "Over 89,000" was not reproduced; the page says "tens of thousands". Set a stop rule |
| niche-05 Dated hub on integration after FDA-reviewed psilocybin | **NO** | OK. Dates 2026-04-24, 05-01, 07-07, 03-30 verified. "CO ibogaine pilot, June 2026" is not supported by the MAPS source | Premise real (vouchers, Compass timing). Impact speculative: approval, DEA rescheduling and launch are H1-2027 at the earliest | **YES.** Same pattern as the SEO/AEO content work that produced zero leads: #43, #45 indexing test, #46 AEO tracker, /faq, /glossary, llms-full (May–Sept 2026) | Weak now. Near-zero traffic until news breaks; clinical/FDA framing sits close to the non-clinical positioning (PR #37) | Do not build now. Keep only the news peg: when the NDA filing or approval news breaks, niche-04 pitches go out that day. Reconsider the hub then |
| niche-06 Monthly free online reading circle via /events | **NO** | Sources 2026-02-04 and live | NO. Fireside's 1,100 calls a month to a free peer support line does not show demand for an author-hosted circle. "15-60 registrations" is unsupported | Partial. Events surfaces were built and adjusted (#22, #35, Event JSON-LD commit 01e8d860); /events is empty | **Poor.** No audience to fill a room; hosting live group talk about psychedelic experiences carries liability for a non-clinical author; it depends on a partner that does not exist yet | Re-propose only if a niche-02 partner asks to co-host and promote |
| niche-07 Reddit authentic participation | **NO** | **Stale.** Profound data covers Aug 2024–Jun 2025 (published 2025-06-05, updated Aug 2025) and was not re-verified for 2026 | Vendor citation-share data, not lead data. Reddit Rule 2 verified. The lens itself estimates under 10 leads in 90 days | NO | Weak. Owner time is the scarcest input; psychedelic subreddits restrict self-promotion | Put owner time into niche-02 instead |
| niche-08 Third Wave directory listing | **NO** | Page live, undated | Testimonials are vendor-published and come from retreat businesses | NO | **Fails.** Listing is limited to retreat centers, clinics, licensed therapists, certified coaches and clinicians, so an author/educator is not an eligible type. Listing as a provider would also contradict the non-clinical identity (PR #37) | None |
| niche-09 YouTube Shorts and long-form | **NO** | Stale-ish. Profound 2025 (vendor); the YouTube ad-suitability page is undated | Monetization rules have nothing to do with getting leads. No signup evidence. The lens itself expects low 90-day impact | NO | **Poor.** L effort, weekly video production for a solo author with no channel | Revisit after niche-01/02 produce a signal |
| niche-10 Skip Google, Meta, TikTok and Reddit ads; small Amazon Sponsored Products test only | **YES** (guardrail + gated test) | OK. TikTok updated Apr 2025; Meta changelog lists 2025-02-27; Google and Amazon pages undated but live | YES. Google: "Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed." PR #53 records that the manuscript contains dosing material, so this applies directly. TikTok bans ad content and landing pages that promote drugs. Amazon lists "Drugs" and "Self-Help" among book topics with ad limitations | NO | Good. Bounded spend of $70-140 | Meta has a "news and awareness" exception, so "closed" is overstated: say "high rejection risk, not worth it now". "Reddit ads closed" has no source (UNVERIFIED). Only start the Amazon test once at least 5 ratings and A+ content are live; with 0 ratings, ad clicks have nothing to convert on |

## Per-tactic notes (sources re-read live)

### niche-01: KEEP, with corrections
- **Verified live, 2026-09-24T18:57:20Z–18:57:38Z:**
  - `psilocybinintegrationguide.com`, its `www.` host, `psilowire.com` and its `www.` host all return `308 → https://www.mayaallan.com/`.
  - `/start`, `/press` and `/for-facilitators` return 404.
  - The only email field is the homepage "Stay Connected" newsletter: "Honest reflections on awareness, self-agency, new releases… 1–2 emails per month". There is no named asset.
  - `/events` says "No events are currently scheduled."
- **Competitor examples, 18:57:4x–18:57:57Z:**
  - Psychedelic Passage offers a "Free Psilocybin Sourcing Guide" for its newsletter. Sourcing content is exactly what this site must not offer.
  - Third Wave: the homepage shows the weekly "Frequency" newsletter. The "Microdosing Essentials Guide" appears only in the page's opt-in tracking script (`form.optin-microdosing … 'Essentials Guide'`), so it is only partly visible.
  - These are observations of practice, not results.
- **Prior work (GitHub, 18:56:43Z):**
  - PR #12 (merged 2026-05-13) already added `marketing_visitors` and `marketing_events` with `utm_*`, tracks `newsletter_subscribed`, and has an `/admin/analytics` campaign dashboard. It is gated on consent.
  - PR #57 (open since 2026-09-07) states that the admin panels "count consented visitors only" and that Vercel Web Analytics is disabled. This is the PR body's claim; I did not check the Vercel project, because Vercel reads are outside this task's tool list.
  - PR #42 (merged 2026-07-16): "Subscriber welcome email disabled".
  - So the step "delivered through the existing Resend flow and tagging each contact with source and utm_*" is **half already built and half missing**. Attribution exists but undercounts. **Nothing currently emails the subscriber**, so asset delivery needs a new send path.
- **Materially new compared with prior work:** a named, specific asset; capture on the book, blog, tool and events pages; vanity domains landing on `/start` with a source tag. None of these appears in any PR or commit title.
- **Measure:** per-page signups (form field `source` plus `utm_source`), and landing→signup rate on `/start`. Treat PR #57's panels as a floor, since they count consented visitors only.

### niche-02: KEEP, with corrections
- **Verified:**
  - Psychedelic Alpha OPS tracker (Q1-2026 data, page undated): 383 facilitators, "only 22 of the 35 licensed psilocybin service centers remain operational". Q1-2026 had 952 clients against 1,565 in Q1-2025, about −39%.
  - OPB (2026-01-22): "hundreds of people who've gone through the licensing process as facilitators and can't find work". The article does **not** discuss integration.
  - Frontiers (2026-05-13, Yu, Tafur, Moreno, Dahmer): "optional integration session"; "In 2025, 5,935 clients participated in 5,375 sessions".
  - CPR (2026-02-04): 34 Colorado healing centers; SANCTUM will "offer free integration indefinitely through community programming".
  - Colorado DPO (curl 19:00:58Z): "Download a Licensee/ Discipline List"; "All Facilitators and Clinical Facilitators with an Active Colorado license must regularly complete Continuing Education"; revisions to Rule 5.4 are proposed.
  - Oregon directory: lists only licensees "who have consented to have their information published".
- **Corrections:**
  1. The "about 270 clients per operating Oregon center per year" figure divides 2025 clients by Q1-2026 operating centers. At the Q1-2026 run rate it is about 952×4/22 ≈ **173**, and falling.
  2. The market is contracting: clients are down about 40% and centers are closing. The pitch should be "a free resource that helps you stand out and serve clients", not bulk book sales. Bulk orders are the upside, not the base case.
  3. **Drop the New Mexico DOH email.** Source NM (2026-08-27) describes a *medical* program ("State officials previously committed to opening the program to patients by the end of 2026"). A non-credentialed author offering clinician training does not fit.
  4. Colorado CE hosting is speculative. CE must relate "to the delivery of natural medicine services", and the approved-provider rules were not verified.
  5. **Positioning conflict:** commit `840afd2a` (2026-07-13, part of PR #37) removed "operational-use / dosing / facilitator signals" from the FAQ schema to keep one non-clinical author/educator identity. A B2B page for facilitators is compatible only if it says plainly that Maya is an author, not a facilitator, and the kit stays non-clinical. Consider `noindex` on that page so it does not undo the #37 search positioning.
- **Evidence gap:** there is no benchmark for reply or download rates from cold outreach to licensees, so the "10-30 leads" figure is an estimate. Stop rule: if 100 personal emails produce fewer than 5 replies, stop and rethink the offer.

### niche-03: KEEP, with corrections
- **Live Amazon, 19:01:28Z:**
  - Paperback B0G7JWDJYQ: BSR #3,949,951 in Books. Categories #575 Inner Child Self-Help, #5,287 Emotional Self Help, #23,919 Personal Transformation Self-Help. 289 pages.
  - Kindle B0G765BZDL: BSR #3,144,369 in Kindle Store. Categories Inner Child, Alternative Holistic Medicine, Emotional Self Help. Published December 15, 2025.
  - The lens listed "Healthy Relationships" and suggested adding "Personal Transformation". In today's read the paperback **already has** Personal Transformation, and Healthy Relationships did not appear on either format; hardcover was not read.
  - No rating count and no `aplus-module` markup was found (19:04:16Z). That is consistent with "0 reviews, no A+", but it is not a rendered-page confirmation.
- **Amazon search, 19:01:56Z:** the book is on page 1 for "psilocybin integration" and was the 9th listed title in my GET, which includes sponsored slots. The lens said 6th; the exact position varies by request.
- **KDP rules (read 19:04–19:05Z):**
  - 3 categories.
  - "up to seven keywords"; do not repeat title or contributor metadata.
  - A+ content appears "within eight business days". The KDP page claims **no** sales impact.
  - KDP Select: "you cannot distribute your book digitally anywhere else, including on your website". The warning against Select is correct.
- **Rehash test:** PR #53 (2026-09-06) was a documentation-only "KDP guidance" change and the listing never changed. It is **materially different only if the owner executes in KDP this week**, using these specific nodes and keywords. A new document would repeat PR #53.
- **Reviews:** asking partners who received a free kit to review may count as incentivised under Amazon's rules. The lens marked review rules UNVERIFIED and I could not verify them either. Check the Community Guidelines before asking anyone.

### niche-04: KEEP, with the impact estimate struck
- **Verified at 19:05:00Z:** The Microdose is "a Substack publication with tens of thousands of subscribers", described as "a journalism project brought to you by the UC Berkeley Center for the Science of Psychedelics". It has an Opinion section: "Guest perspectives, essays, thoughts." The contact is themicrodose@berkeley.edu.
- The lens's "Over 89,000 subscribers" was **not reproduced**.
- Psychedelics Today invites guests and article submissions but is "very selective". The podcast is active (episodes PT657–PT660 are on the page).
- **beehiiv (2026-09-22, vendor):** "A single co-created issue with the right partner can add a few hundred subscribers in a day." This is a general claim with no case. It is written for newsletters **already past 10k** swapping issues with partners, which is not an author with no list writing a guest essay. **Strike it and the 20-150 per placement estimate.**
- **Fit:** since paid ads are blocked, this is the only realistic way for a solo author to reach an existing niche audience. A Berkeley journalism outlet will not run promotional copy. The essay has to be journalism-grade, and the call to action is the author bio line naming the vanity domain.
- **Stop rule:** 6 pitches with no acceptance means the angle needs rework before more pitches go out.

### niche-05: DROP (for now)
- **Verified:**
  - Executive order signed April 18, 2026, and vouchers reviewed in "as little as a month or two" (The Microdose, 2026-05-01).
  - Compass and Usona received CNPVs with "shorter 1- to 2-month reviews" (Fierce Biotech, 2026-04-24).
  - Compass: "final submission expected to be completed in Q4", with "launch expected in first half of 2027", contingent on approval and DEA rescheduling (Compass IR, 2026-07-07).
  - NJ bill signed January 20, 2026 (MAPS, 2026-03-30).
  - The Colorado ibogaine bill HB 26-1325 was introduced March 6, 2026 and referred to Appropriations on March 24. "June 2026 pilot" is **not** in this source.
- **Why drop:** building an SEO hub, submitting it to Search Console and watching the AEO tracker is the playbook this site has already run for four months: #43, #45, #46, /faq, /glossary and llms-full, with zero leads per the owner. Traffic will be close to zero until approval news, which is at least one to two quarters away.
- **What survives:** the news peg, used inside niche-04 pitches when the NDA or approval news breaks.

### niche-06: DROP
- Fireside Project (19:05:52Z): "1,100 calls/month", "40,000 calls", and coaching "used in over 1,200 sessions" (cumulative). This shows demand for a free support line, not demand for registrations to an author's circle.
- /events is empty.
- With no audience and no partner, the room will be empty. Live group discussion of psychedelic experiences also carries liability for a non-clinical author.

### niche-07: DROP
- Reddit Rule 2 (curl 19:07:02Z): "Participate authentically in communities where you have a personal interest, and do not spam…".
- Profound (vendor; published 2025-06-05, updated August 2025; data Aug 2024–Jun 2025; "680 million citations"): Reddit 2.2% of AI Overview citations and 6.6% of Perplexity.
- These are citation shares, not leads, and more than 15 months old with no 2026 check. The lens's own estimate is under 10 leads in 90 days. The owner's hours go further in niche-02.

### niche-08: DROP
- The Third Wave get-listed page lists eligible providers as retreat centers, clinics, therapists ("licensed MFT, social worker, counselor, or clinical professional"), coaches ("must complete Third Wave or comparable certification") and clinicians. An author/educator does not fit any of these types.
- The Vetted individual tier is $49/month or $399/year.
- The testimonials ("15-20 clicks per month", "6 leads"; "At least 15 very qualified leads", 3 registrations) come from retreat businesses and are published by the vendor.

### niche-09: DROP
- The YouTube advertiser-friendly page allows ads on "Educational content about drugs…" and denies them for "Tips or recommendations on recreational drug usage". That governs ad revenue, not whether videos produce leads.
- The Profound YouTube shares (AI Overviews 1.9%, Perplexity 2.0%) are 2025 vendor data.
- L effort for a solo author, with no signup evidence.

### niche-10: KEEP as a guardrail plus a gated test
- **Google Ads:** "Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed." There is no book or education exception. PR #53's body records that the manuscript's "Part I / Chapter 3" contains dosing material, so this applies to the book itself.
- **TikTok (updated April 2025):** "We do not allow ad content and landing pages to display, promote… recreational drugs… or their use."
- **Meta:** "Encourage the consumption of illicit, recreational… drugs" is prohibited. There is an exception for "news, and awareness campaigns as long as they don't promote the sale or consumption", so Meta is **not strictly closed**. It is still not worth the spend at this stage.
- **Amazon Ads:** the book-topics list includes "Drugs" and "Self-Help". The page does not say whether such ads are restricted or rejected.
- **Reddit ads:** the lens gives no source. UNVERIFIED.
- **Amazon test gate:** at least 5 ratings plus A+ content live (niche-03), then $5-10 a day for 14 days. Stop on disapproval or if ACOS is above 100% after 14 days.

## Prior-effort map (live GitHub metadata, read 18:56:33Z–18:57:04Z)
- Merged work so far is platform, payments, security, SEO and AEO:
  - PR #1–#56 (Jan–Sep 2026).
  - Attribution PR #12.
  - Newsletter sync PR #42 and #49.
  - Positioning PR #37.
  - SEO and AEO: #40, #43, #45, #46, #52, #54, plus the May 19 commits for /faq, /glossary, llms-full.txt and the AEO runner.
  - Book-metadata and KDP guidance: #53.
- Open: #57 (analytics, unmerged since 2026-09-07) and #58 (handoff).
- **No** PR, commit or issue title mentions outreach, partners, facilitators, a lead magnet, press, Amazon listing changes, Reddit, YouTube or events programming. The kept tactics niche-02, niche-03 (execution) and niche-04 are therefore new work. niche-05 is the only kept-shaped idea that repeats the old pattern, and it is dropped.

## Not verified / not done
- The Vercel Web Analytics disabled state was taken from the PR #57 and #58 bodies, not read from Vercel.
- Amazon: A+ absence and the 0-review count are inferred from missing markup; the page was not rendered.
- Hardcover categories were not read.
- Amazon review-solicitation rules were not verified.
- Colorado approved-CE-provider rules and Oregon rules on facilitators using third-party client materials were not verified.
- Psychedelic Alpha tracker: page date not shown (it contains Q1-2026 data).
- The Microdose "89,000" figure was not reproduced.
- No 2026 AI-citation study was read; web search was exhausted.
- No conversion benchmarks for a named asset versus a generic form, for cold outreach to licensees, or for guest placements. All impact figures in the kept tactics remain estimates to be measured.