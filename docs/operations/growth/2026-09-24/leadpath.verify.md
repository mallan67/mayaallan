# Lead path: adversarial review (2026-09-24)

**What was reviewed.** The `lead-path-live` lens, saved at `docs/operations/growth/2026-09-24/02-lead-path.md` in commit `382eac1191c7fbac6f9a2a6f0e3c7c41286d5cd5`. GitHub shows that commit was made on `work/site-visibility` at 2026-09-24T18:46:36Z and added only that file (+295 lines). I read it at 18:48:21Z. This review checks the 11 tactics handed to the reviewer (the lens's tactic list) against the lens's cited sources, the live site and the live history of `mallan67/mayaallan`.

**Live window.** 2026-09-24T18:48:02Z to 19:00:01Z (UTC). The site was read with GET/HEAD only. No form was submitted, nothing was clicked and nothing was sent to the AI tools. The repo was read through PR and commit metadata only (titles, bodies, dates, changed paths), not source files.

**Four checks per tactic.** (a) Is the evidence from 2025-2026, or still current? (b) Is it real evidence (numbers, a case, a study) or opinion/vendor marketing? (c) Does it repeat earlier repo work that produced no results? (d) Does it fit a solo author with near-zero audience and psychedelic-content restrictions?

## Verdict

**Keep 9, drop 2 (lead-04, lead-11).**

- **Three tactics contain factual errors that must be fixed before anyone builds them:**
  - lead-06 step 3 would break the working Amazon ebook link.
  - lead-08 would rebuild events that already exist.
  - lead-01 and lead-03 use popup benchmarks to forecast inline forms.
- **Three reverse earlier owner decisions and need Maya's explicit sign-off:**
  - lead-01 reverses the journal's public "no email required" promise.
  - lead-05 reverses Maya's own 12-point privacy spec.
  - lead-09 reverses PR #42's "subscriber welcome email disabled".
- **The biggest problem is outside the lens.** All 11 tactics raise the conversion of traffic that nobody has measured. Interact's own benchmark report (2026-09-08) says "Factor one: You need consistent, reliable traffic". These fixes are necessary: today the site has one generic capture point and gives its best asset away with no capture. But on their own they will produce close to zero leads unless they are paired with a traffic/distribution plan.

## Review table

| id | keep | (a) recency | (b) evidence | (c) rehash? | (d) fit | Required change |
|---|---|---|---|---|---|---|
| lead-01 Journal as emailed lead magnet | **YES** (owner decision) | OK: 2025-06 to 2026-09 | The load-bearing evidence is live: the asset has 0 capture. The benchmarks are vendor data for other formats. | No. It was built 2026-05-19 as a "linkable asset" with no capture. | Good. Emails must stay non-clinical (Resend policy). | Owner picks required vs optional email. Add the journal offer to the ebook back matter (moved here from lead-04). Delete the 7.5% to 40% forecast. |
| lead-02 Free "email me my summary" in the AI tools | **YES**, lower priority | OK: 2026-09-08 | Live fact is real: the only email field is the paid $9.99 export. The Interact quiz rate does not transfer to AI chat. | No | Sensitive data. Needs crisis suppression, an extra LLM call and a safety review. | Leave the transcript out by default. Keep the marketing opt-in unchecked. Suppress in Tier 1 and Tier 2 crisis flows. Measure $9.99 cannibalization. |
| lead-03 Offer-led signup block on every template | **YES** (S) | OK: Ahrefs, Vercel and Semrush from 2025. Unbounce is 2024. | Live 0-form finding is real. Ahrefs and Vercel are real first-party data. Semrush 4.4x is an unsourced vendor claim. OptiMonk figures are popup rates. | Partly. The single homepage form was polished 3 times (#11, #35, #42); placement and offer never changed. The new version is materially different. | Good | Delete the "5-7.5% of viewers" expectation. Slide-in: small banner only, no full-screen or mobile overlay (Google, updated 2025-12-10). |
| lead-04 Email-gated "Read 3 scenarios free" + back matter | **NO** | OK | None. The lens itself says there are no numbers. Written Word Media lists samples as a *fiction* magnet and says "Make it exclusive". | No | Poor. Offering a book sample in the back matter, to readers who already own the book, is self-defeating. A second magnet (M effort) splits near-zero traffic. | Drop. Salvage only the back-matter placement, pointing to the journal (moved into lead-01). |
| lead-05 Remove the /checkout/privacy-gate step | **YES**, owner decision, after data | OK: Baymard list updated 2025-09-22. The form-fields article is 2024-06-26 (older). | Baymard is a real survey but covers e-commerce. Its 18% "create an account" reason does not apply to this gate. | Not a growth rehash, but it **reverses Maya's own spec** (commit d4c33b6, 2026-05-19). | Good | Keep the SDK popup, the client-state scrub and the existing shared-computer note. Make the confirmation inline and non-blocking. Decide once lead-08 shows checkout_started counts. |
| lead-06 Book-page buy box and retailer links | **YES** once corrected | OK. The load-bearing evidence is today's live defects. Unbounce 2024 is not needed. | The live defects are real. **The ASIN claim is wrong** (reversed). | Partly: PR #5 (merged 2026-05-13) already restyled the Buy Direct card, and PR #4 was closed unmerged. | Good | **Delete step 3.** Do not restyle the card again. Only move it above the fold, add the audiobook link (or remove its price), strip jsessionid and the affiliate clickid, and make the /books names real links. |
| lead-07 Early-reader review program, then quotes | **YES** (owner-run, after lead-01) | OK | Goodreads 0 ratings is real. The Baymard trust figure is e-commerce and weak. The size of the effect is unknown. | No. Keep the book schema free of AggregateRating until real reviews exist (0 today). | Needs subscribers first. | Follow the FTC 2024 rule: a free copy must never be conditioned on a positive review. Amazon policy is UNVERIFIED (503). |
| lead-08 Measurement: #57, Web Analytics, events | **YES**, do first | OK | Real, but the claim "only book_viewed exists" is **wrong** | **Partly.** PR #12 (merged 2026-05-13) built the server-side events and the admin funnel. PR #57 (open) adds page views. | Good | Rewrite step 2 below: route the tool events first-party and add only the missing events. Owner reads current lead counts in admin now. |
| lead-09 Welcome sequence | **YES**, start with 3 emails | Mixed: MailerLite 2025 data. GetResponse is **2023 data**. | Vendor aggregates. Opens are inflated by Apple Mail Privacy Protection (MPP). | Reverses PR #42 ("Subscriber welcome email disabled") | Good if non-clinical | Resend Automations exists (resolves the lens's UNVERIFIED). Plan limits are still UNVERIFIED. Build E0 to E2 first. |
| lead-10 Close the dead ends | **YES** (S), trimmed | OK: live 2026-09-24 | Live defects are real. No outcome evidence (hygiene). | No. The July work added footer columns, not header links. | Good | Add the events waitlist only if Maya will actually schedule an event. Contact opt-in unchecked. |
| lead-11 Sister domains to intent pages | **NO** (defer) | OK: live | None. No evidence anyone visits these domains. | No | psilowire.com pointing to the journal is an intent mismatch. | Revisit only if lead-08 data or Vercel request logs show hits on those hosts. |

## Per-tactic findings (with live sources)

### lead-01: keep (owner decision)
- **Live fact.** `/integration-journal` has 1 form and 0 email inputs. It says "Free, no email required, no login" and "No email required. The PDF is generated server-side and sent directly to your browser." (read 18:51:06Z). Today this asset produces 0 leads by construction, so any capture is an increase. That, not the benchmarks, is the reason to do it.
- **The benchmarks don't transfer.**
  - OptiMonk (pub 2025-06-20, mod 2026-05-07; vendor). "Offering an ebook in exchange for subscription increases conversion rate to 7.49%" vs "Simple newsletter promotion popups have a 5.10% conversion rate". The base is "countless popups created by OptiMonk users" and no sample size is given. These are popup (overlay) rates, not rates for an inline form. Read 18:49:35Z.
  - Interact (pub/mod 2026-09-08; vendor). "Start-to-lead conversion rate: 40.1%" across Interact quizzes, which is not a share of all visitors. The report also says "individual results vary wildly … quizzes produce no leads at all". Read 18:49:45Z. The journal's "pick your phase, get a personalised PDF" flow is the closest thing on the site to a quiz, so it is the right asset, but 40% is not a forecast.
  - Written Word Media (pub 2026-09-01, mod 2026-09-23; a book-promotion business). For nonfiction it lists "A workbook, A checklist, A companion guide, Bonus exercises, A resource list". This is advice with no numbers. Read 18:49:55Z.
- **Repo history.** Commit `b7a0f8a` (2026-05-19, "PR F") created the journal under the heading "Linkable assets". Commit `abf9026` (2026-07-08) moved it to `/integration-journal`. Neither added capture, so this is materially new. Trade-off: gating removes the reason the journal was built (to earn links). GitHub history shows no evidence it earned any links.
- **Fit.** The Resend acceptable-use policy (read 18:55:19Z) prohibits "Pharmaceutical products" and illegal goods or services. The 7-day prompts must stay reflective and non-clinical (no sourcing, no dosing), in line with PR #37.
- **Add from lead-04.** Put the journal offer and site link in the ebook back matter. Kindlepreneur (pub 2023-03-07, mod 2025-10-01; practitioner opinion, affiliate site) says: "The back matter of your book is perhaps the most important place where you should promote your reader magnet." Read 18:49:55Z.

### lead-02: keep, lower priority
- **Live fact.** In `/belief-inquiry` the JS chunk `9a7cf34cbe809fe3.js` has one email input (`type:"email", required`). It is the paid export form: it posts `{tool, messages, email}` to `/api/export` next to "$9.99". Read 18:55:54Z. A free user cannot leave an email.
- **Evidence.** The Interact 40.1% figure is for quizzes and doesn't transfer to multi-turn AI chat. Treat the tactic as unforecast.
- **Fit and risk.**
  - Users write about psychedelic experiences and their mental state. Keep the transcript out of the summary email by default and state this on `/privacy`.
  - Suppress the offer on Tier 1 (sticky) and Tier 2 crisis turns (PR #36, merged 2026-07-13).
  - A summary needs an extra LLM call, which adds cost and must go through the PR #17 safety review.
  - It may cannibalize the $9.99 export: measure exports before and after.

### lead-03: keep (S), with the expectation corrected
- **Live facts.** 0 forms on `/blog`, `/faq`, `/books`, `/books/psilocybin-integration-guide`, `/events` and `/belief-inquiry` (read 18:51:07Z to 18:51:14Z). The homepage has 1 form, and "Stay Connected" sits at 84% of the visible text (read 18:54:29Z; the lens said about 88%).
- **Evidence quality.**
  - Ahrefs (pub 2025-06-16, mod 2026-08-12). First-party data: "0.5% of Visitors Drove 12.1% of Signups", "AI search visitors convert at a 23x higher rate", over the last 30 days, mostly ChatGPT. Real, but for a large SaaS brand. Read 18:50:29Z.
  - Vercel (2025-06-10). "ChatGPT now refers around 10% of new Vercel signups. That's up from 4.8% the previous month". Real first-party data. Read via WebFetch between 18:50:29Z and 18:50:52Z.
  - Semrush (pub 2025-06-09, mod 2025-07-21). "We have seen that the average AI search visitor … is 4.4 times as valuable …, based on conversion rate." No dataset is given, and the article promotes Semrush's enterprise product. **This is a vendor claim, not a study.** Read 18:50:52Z.
  - OptiMonk figures are popup rates, not rates for inline blocks at the end of a post. **Delete "about 5-7.5% of viewers".**
  - Unbounce is 2024 (pub 2024-08-29; "57 million conversions across over 41 thousand" landing pages). The -18.6% word-count figure was not visible in the static page, so it is UNVERIFIED (read 18:57:58Z).
- **The AI-visitor premise is unproven here.** Nobody can tell whether AI engines send this site any visitors until lead-08 is done.
- **Repo history.** The one homepage form was changed by PR #11 (honeypot, 2026-05-13), PR #35 (accessibility and consent, 2026-07-12) and PR #42 (Resend, 2026-07-16). None changed where the form appears or what it offers. Putting an offer on every template is materially different.
- **Slide-in.** Google's "Avoid intrusive interstitials" (last updated 2025-12-10, read 18:57:17Z) warns that intrusive dialogs "may lead to poor search performance" and recommends banners that "take up only a small fraction of the screen". Use a small banner, with no full-screen and no mobile exit-intent overlay.

### lead-04: drop
- There is no quantitative evidence, and the lens says so itself.
- Written Word Media (2026-09-01) lists "A sample or several chapters" under **fiction**. Its nonfiction list is the workbook and similar items, and it adds "Make it exclusive when possible". A book sample is not exclusive.
- Step 3 offers a book sample in the back matter, to readers who already own the book. That makes no sense.
- A second magnet is M effort and splits near-zero traffic between two offers.
- **Salvage.** The back-matter placement is moved into lead-01, pointing to the journal. Whether to publish more of the 40 scenarios as open pages (the sitemap lists 1 scenario URL, read 18:54:29Z) is a question for the content/visibility lens, not for this one.

### lead-05: keep, but only as an owner decision, and after data
- **Live facts.** The gate page has 1 checkbox ("This is my PayPal account. I'm on a personal device…") and 1 disabled button until it is ticked (read 18:55:34Z). The book page already shows "Using a shared computer? Make sure you're signed into your own PayPal account before purchasing." (read 18:55:34Z).
- **Repo history.** Commit `d4c33b6` (2026-05-19), "PayPal SDK v6 popup flow + privacy gate — addresses shared-device exposure … Implements the 12-point spec from Maya", created the gate and the required checkbox. Commit `15d7465` (the same day) added the shared-computer note. Removing the gate reverses Maya's own privacy requirement, so this is not a growth rehash; it's the owner's call.
- **Evidence.** Baymard ("Last updated: September 22, 2025", read 18:50:08Z) lists "19% I didn't trust the site with my credit card information", "18% The site wanted me to create an account" and "17% Too long / complicated checkout process". That survey covers e-commerce with shipping. The gate forces no account creation (PayPal's login does), so the 18% does not apply, and 17% applies only partly. The form-fields article is dated 2024-06-26 and is older than the lens implies.
- **Recommended form.** Keep the SDK popup flow, the double client-state scrub and the note. Move the confirmation onto the book page as an inline, non-blocking line. Decide once lead-08 shows `checkout_started` counts, so the drop-off at the gate is visible. Today nobody can say whether anyone reaches the gate.

### lead-06: keep once corrected; delete step 3
- **The ASIN claim is reversed.** On the live book page, the "ebook" retailer button links to `https://a.co/d/hRppkCZ`, which redirects (301) to `amazon.com/dp/B0G765BZDL` (read 18:54:03Z). Amazon's live page titles (read 18:54:03Z):
  - `B0G765BZDL`: "Psilocybin Integration Guide … - **Kindle edition** by Allan, Maya … Kindle eBooks".
  - `B0G7JWDJYQ`: "… 9798994148853: Allan, Maya … **Books**", which is a print edition.

  **So the current ebook link is correct. Step 3 ("point the ebook Amazon link to dp/B0G7JWDJYQ") would send ebook buyers to the print book. Do not do it.**
- **Other live defects, confirmed (read 18:53:37Z to 18:54:18Z):**
  - The B&N link carries `;jsessionid=E0C61A17…`.
  - The AbeBooks link carries `clickid=…&cm_mmc=aff-_-ir-_-353196…`, a third-party affiliate tag.
  - The formats row shows "Audiobook $15.99" with no audiobook retailer link. The page says "audiobook via retailers below", but none is listed.
  - On `/books`, "Available at" names are `<div><span>Amazon</span></div>`, not links (4 external links on the page).
  - "Buy Ebook" comes after about 657 visible words, including the nav.
- **Repo history.** PR #5 ("Make ebook PayPal purchase crystal clear", merged 2026-05-13) already compacted and relabelled the Buy Direct card. PR #4 (format-grouped buy section) was closed unmerged. Don't restyle the card again. The materially new parts are moving it above the fold and fixing the links. The Unbounce 2024 correlation isn't needed, because the link fixes stand on live defects.

### lead-07: keep (owner-run, after lead-01)
- **Live facts.** Goodreads shows "0 ratings 0 reviews" and a publication date of December 15, 2025 (WebFetch at about 18:54:35Z). The live book page has 0 `AggregateRating` or `Review` JSON-LD items (read 18:57:17Z). Commit `b7a0f8a` (2026-05-19) had planned "AggregateRating + Review" schema. Keep it absent until real reviews exist.
- **Rules.** The FTC final rule on fake reviews (press release 2024-08-14, still current) bans compensation conditioned on a review expressing a particular sentiment. Giving a free copy is fine; asking for a positive review is not. Amazon's community guidelines page returned HTTP 503, so Amazon's own policy is **UNVERIFIED**.
- **Fit.** This needs readers first, so it depends on lead-01 and lead-03 producing subscribers. The size of the effect is unknown.

### lead-08: keep, do first; rewrite step 2
- **The lens's claim "the only funnel event is book_viewed" is wrong:**
  - PR #12 ("marketing attribution + conversion analytics + admin dashboard", merged 2026-05-13) added server-side events in the API routes: `newsletter_subscribed`, `contact_submitted`, `checkout_started` and `purchase_completed`, plus `book_viewed`. It also added the `/api/marketing/event` ingest and the `/admin/analytics` funnel with a top-campaigns table. PR #49 (2026-09-05) made the subscribe tracking run after the response is sent.
  - The live tool JS (`9a7cf34cbe809fe3.js`, read 18:55:54Z) emits `tool_viewed`, `tool_started`, `turn_reached_<n>` and `session_completed` through `window.va("event")`, which is Vercel Web Analytics custom events. Vercel's docs (read 18:56:08Z) say "Custom Events are available on Enterprise and Pro plans". The project's plan is **UNVERIFIED**. These events also fire only when `<Analytics/>` is mounted, which today is only after the visitor accepts cookies.
- **Rehash.** Partly: PR #12 and PR #57 (open since 2026-09-07; its body says Web Analytics is "disabled at the project level"). The parts that are materially new:
  1. Owner: merge #57 and enable Web Analytics.
  2. Code: send the tool events to the first-party `/api/marketing/event` instead of relying on Vercel custom events.
  3. Code: add only the missing events: `journal_generated`, `retailer_click`, `tool_summary_requested`, and a `source` on each subscribe. Do not recreate `checkout_started` or `purchase_completed`.
- **Owner action today, no code needed.** Leads are already recorded server-side (`email_subscribers`, and `marketing_events` in `/admin/analytics`). Reading them turns "zero leads" into a number. UNVERIFIED here, because it needs the admin login.

### lead-09: keep, start with 3 emails
- **Resend can run the sequence.** Resend docs (read 18:55:19Z): "Automations allow you to build lifecycle messages and drip campaigns with triggers…". The changelog (read 18:54:49Z) lists "Duplicate Automation API" on Aug 25, 2026. That resolves the lens's UNVERIFIED about automation support. Plan limits are still UNVERIFIED.
- **Reversal.** PR #42 (merged 2026-07-16) says "Subscriber welcome email disabled" (commit `eaaee4f`). The PR metadata gives no reason, so Maya needs to confirm.
- **Evidence.**
  - GetResponse gives welcome emails "83.63%" opens and "16.60%" clicks, from "more than 4.4 billion messages sent by GetResponse customers in 2023". That is **2023 data** from a vendor. Read 18:50:08Z to 18:50:19Z.
  - MailerLite (pub 2025-12-03, mod 2026-04-07): "The benchmark open rate for authors is 43.14% and the click rate is 2.75%", from 3.6M campaigns across 181,000+ accounts. It also notes that Apple Mail Privacy Protection affects open rates. Compare clicks, not opens.
- **Fit.** Content must be non-clinical (Resend policy). With about 0 subscribers, build three emails first: E0 delivers the asset, E1 (day 2) covers how to use it plus Maya's story, and E2 (day 5) offers the $9.99 ebook with `utm_campaign=welcome`. Extend the sequence once subscribers exist.

### lead-10: keep (S), trimmed
- **Live facts.**
  - Header links: `/`, `/books`, `/belief-inquiry`, `/nervous-system-reset`, `/integration-reflection`, `/media`, `/events`, `/about`, `/contact`. There is no blog or journal link (read 18:54:18Z).
  - The homepage shows "In Development" (read 18:51:05Z).
  - `/events` says "No events are currently scheduled." (read 18:51:11Z).
  - `/contact` has 0 checkboxes and 0 mentions of "newsletter" (read 19:00:01Z).
- **Not a rehash.** Commits `e037fe2` and `cd6be13` (2026-07-08) added footer columns, not header links. PRs #22 and #35 only hid past events.
- **Evidence.** None on outcomes; this is hygiene. Add an events waitlist only if Maya will actually schedule an event. Otherwise it collects a promise she can't keep. The contact-form opt-in must be unchecked by default.

### lead-11: drop (defer)
- **Live facts.** `psilocybinintegrationguide.com`, `www.psilocybinintegrationguide.com`, `psilowire.com` and `www.psilowire.com` all return 308 to `https://www.mayaallan.com/` (read 18:54:29Z).
- There is no evidence anyone visits these hosts, and the lens gives no traffic source. Sending psilowire.com to the journal is an intent mismatch (the name reads as news). Revisit only if lead-08 data or Vercel request logs show visits.

## Errors in the lens (fix before building)
1. **The Amazon ASIN is reversed (lead-06).** B0G765BZDL is the Kindle edition and B0G7JWDJYQ is print. Following step 3 would break the ebook link.
2. **"The only funnel event is book_viewed" is wrong** (lead-08 and the summary). Server-side lead and checkout events have existed since PR #12, and tool events exist as Vercel custom events.
3. **OptiMonk popup rates are used as forecasts for inline blocks and the journal form** (lead-01, lead-03).
4. **The Interact quiz start-to-lead rate is applied to AI chat tools** (lead-02).
5. **Semrush's 4.4x is presented as a study.** It is an unsourced vendor claim ("We have seen…").
6. **Baymard's 18% "create an account" reason is applied to the privacy gate,** which forces no account creation.
7. **Dates.** The GetResponse figures are 2023 data. The Baymard form-fields article is dated 2024-06-26.
8. **Minor.** The homepage form sits at 84% of the visible text, not about 88%.

## Owner decisions needed
- **lead-01:** require an email for the journal, or make it optional? This reverses the public "no email required" promise.
- **lead-05:** keep or soften the privacy gate? It is Maya's own 12-point spec from 2026-05-19.
- **lead-09:** turn the welcome email back on? PR #42 disabled it.
- **lead-08:** merge PR #57 and enable Web Analytics. Confirm the Vercel plan: custom events need Pro.

## Recommended order
1. lead-08: owner merges #57, enables Web Analytics and reads current lead counts. Code: first-party tool events and the missing events. (S)
2. lead-01, including the journal offer in the ebook back matter. (M)
3. lead-03, with a small banner only. (S)
4. lead-09, three emails first. (S to M)
5. lead-10, trimmed. (S)
6. lead-06, corrected (without step 3). (S)
7. lead-02. (M)
8. lead-07, once there are subscribers. (owner, M)
9. lead-05: owner decision, once checkout data exists. (S)

Dropped: lead-04 (its back-matter idea is folded into lead-01) and lead-11.

**Not addressed by this lens, and the binding constraint:** traffic. Pair this lens with the distribution and AI-search lenses. Without visitors, none of the rates above produce leads.

## Sources read live (UTC, 2026-09-24)
| Source | Published / updated | Read | Type |
|---|---|---|---|
| https://www.optimonk.com/popup-statistics | 2025-06-20 / 2026-05-07 | 18:49:21Z, 18:49:35Z | vendor |
| https://www.tryinteract.com/blog/quiz-conversion-rate-report/ | 2026-09-08 | 18:49:21Z, 18:49:45Z | vendor |
| https://www.writtenwordmedia.com/reader-magnet/ | 2026-09-01 / 2026-09-23 | 18:49:55Z | book-promo business, opinion |
| https://kindlepreneur.com/reader-magnets/ | 2023-03-07 / 2025-10-01 | 18:49:55Z | practitioner opinion, affiliate |
| https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks | 2025-12-03 / 2026-04-07 | 18:50:08Z, 18:50:19Z | vendor aggregate (3.6M campaigns) |
| https://www.getresponse.com/resources/reports/email-marketing-benchmarks | 2023 data | 18:50:08Z, 18:50:19Z | vendor aggregate |
| https://baymard.com/lists/cart-abandonment-rate | updated 2025-09-22 | 18:50:08Z | research survey (e-commerce) |
| https://baymard.com/research-articles/checkout-flow-average-form-fields | 2024-06-26 | 18:49:21Z | research (older) |
| https://ahrefs.com/blog/ai-search-traffic-conversions-ahrefs/ | 2025-06-16 / 2026-08-12 | 18:50:29Z | first-party data |
| https://www.semrush.com/blog/ai-search-seo-traffic-study/ | 2025-06-09 / 2025-07-21 | 18:50:52Z | vendor claim, no dataset |
| https://vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search | 2025-06-10 | about 18:50:40Z (WebFetch) | first-party data |
| https://unbounce.com/conversion-benchmark-report/ | 2024-08-29 / 2024-09-04 | 18:57:58Z | vendor (older) |
| https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials | updated 2025-12-10 | 18:57:17Z | platform guidance |
| https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials | 2024-08-14 | about 18:57:30Z (WebFetch) | regulator |
| https://resend.com/docs/dashboard/automations/introduction, https://resend.com/changelog, https://resend.com/legal/acceptable-use | changelog entry 2026-08-25 | 18:54:49Z, 18:55:19Z | platform docs |
| https://vercel.com/docs/analytics/custom-events | live docs | 18:56:08Z | platform docs |
| https://www.goodreads.com/book/show/245299940-psilocybin-integration-guide | live | about 18:54:35Z (WebFetch) | live listing |
| https://www.amazon.com/dp/B0G765BZDL, https://www.amazon.com/dp/B0G7JWDJYQ, https://a.co/d/hRppkCZ | live | 18:53:49Z, 18:54:03Z | live listings |
| www.mayaallan.com: /, /integration-journal, /belief-inquiry, /checkout/privacy-gate?bookId=1, /books/psilocybin-integration-guide, /books, /events, /contact, /blog, /faq, /sitemap.xml, tool JS chunk | live | 18:51:05Z to 19:00:01Z | live site (GET only) |
| GitHub mallan67/mayaallan: PR list and bodies (#4, #5, #12, #35, #36, #42, #57, #58), commits d4c33b6, 15d7465, b7a0f8a, abf9026, eaaee4f, 382eac1, and commit lists by path | live | 18:48:02Z to 18:57:46Z | live repo metadata |

## Not verified
- **Vercel.** The project's plan (custom events need Pro), and whether Web Analytics is still disabled. The disabled state comes from PR #57 and PR #58 bodies and was not re-read from Vercel.
- **Current lead counts** in `/admin/analytics` or `email_subscribers` (needs the admin login).
- **Amazon review policy** for free reader copies (HTTP 503).
- **Unbounce's -18.6% word-count figure** (not visible in the static page).
- **Resend plan limits** for Automations.
- **PayPal guest card payment** for this account (the lens also marks it UNVERIFIED).
- **The lens file itself.** Its text was not opened: this review used the tactic list handed to the reviewer, and the commit metadata of 382eac1.