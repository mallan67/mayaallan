# Google map: adversarial check (2026-09-24)

**Checks:** `02-google-network.md` and `02-google-network-part2.md` in this folder (map commit d019ec77a7295785e44ba8d496657186095c1c6d).

**Method:** Live reads on 2026-09-24, 18:53Z-19:17Z UTC, using curl GET and WebFetch. Times are the UTC read times.

**Limits:**
- The WebSearch budget for this session was exhausted (200 of 200). Every check is a direct fetch of a cited or official page.
- Google result pages were not queried. Indexation, Search Console verification and whether a Knowledge Panel exists remain **UNVERIFIED**.
- **Process notes:**
  - One curl call (about 18:55:58Z) wrote a body to `/tmp/nul` by mistake. It was deleted at 18:56:19Z and never used as a source.
  - A shell command-length limit forced this file to be saved in several append commits. Each one was fetched live from GitHub and appended in memory.

## 1. Verdict

| id | keep | map status correct? | key correction |
|---|---|---|---|
| goog-01 Search + Search Console | yes | yes | Only 1 of 40 scenarios is on the web; the redirect domains lack a verification TXT |
| goog-02 Gen-AI report | yes (lead low) | yes | impressions only; needs the site *included* in AI features |
| goog-03 URL Inspection | yes | yes | none |
| goog-04 Indexing API | no | yes | not applicable |
| goog-05 Business Profile | no | yes | not eligible now |
| goog-06 Knowledge Panel | yes (lead low) | yes | panel existence UNVERIFIED |
| goog-07 Search profiles | no (future) | yes | needs 10k followers; Instagram has 18 |
| goog-08 Preferred sources | yes (low) | yes | needs the AI-features inclusion setting |
| goog-09 Google Books | yes (lead medium) | yes | no link back, so not "high" |
| goog-10 Play ebook | yes | yes | affiliate mechanic misread; review-incentive rule |
| goog-11 Play audiobook upload | yes (conditional) | **no**: restricted | select publishers only; TOC claim unsupported |
| goog-12 Auto-narration | yes (Maya decides) | yes | no "Beta" label found; EPUB needed |
| goog-13 Merchant Center | no | yes | none |
| goog-14 Merchant-listing markup | no | **no**: restricted | the free-listings guidelines exclude ebooks |
| goog-15 YouTube long-form | yes | yes | clickable description links need Advanced features |
| goog-16 YouTube Shorts | yes | yes | Shorts description links are non-clickable; wrong source cited |
| goog-17 YouTube RSS podcasts | yes | yes | RSS upload needs Advanced features; audiobook-rights check |
| goog-18 YouTube health features | no | yes | none |
| goog-20 Discover | yes (lead low-medium) | yes | posts have no image at all; Search-features policies |
| goog-21 News / Top Stories | no | yes | psilowire.com only 308s to the homepage |
| goog-22 Web Stories | no | yes | effort far above return |
| goog-23 Events + Maps | yes (when in person) | yes | ticketing-partner route |
| goog-24 ProfilePage | yes (lead low) | yes | none |
| goog-25 Deprecated rich results | no (guardrail) | **no** | Book Actions is not dead; Book review snippets are live |
| goog-26 Images / Lens | yes (low) | yes | posts have zero images |
| goog-27 AI Overviews / AI Mode | yes (lead medium) | yes | 1 of 40 scenarios is online |
| goog-28 Perspectives | no | **no**: renamed "Forums" | see M3 |
| goog-29 Trends | yes (low) | yes | still 429 |
| goog-30 Keyword Planner | yes (low) | yes | none |
| goog-31 Alerts | yes | yes | none |
| goog-32 Google Ads | no | yes | none |
| goog-33 Ad Grants | no | yes | none |
| goog-34 GA4 / GTM / Looker | yes | yes | still no tag |
| goog-37 Forms / Sites / Blogger | no | yes | no lead value |
| goog-38 Scholar | no | yes | no lead value |
| goog-39 Google Podcasts | no | yes (dead) | shutdown dates sourced |
| goog-40 Discover Follow | no | yes (dead) | stale help text remains |

## 2. Live site state (read 18:55Z-19:16Z)

- **Sitemap:** 38 `<loc>` entries (18:55:11Z).
  - `/scenarios` links **one** scenario, `/scenarios/ego-dissolution` (18:55:32Z). 39 of the book's 40 scenarios are not on the web.
  - `/blog` has 5 posts.
- **DNS:**
  - mayaallan.com has a `google-site-verification` TXT (18:55:11Z).
  - psilowire.com and psilocybinintegrationguide.com have only an SPF TXT (18:55:24Z).
  - All four hosts return 308 to `https://www.mayaallan.com/`.
- **Robots meta:** `max-image-preview:large` is present in the googlebot meta (18:55:58Z).
- **Blog posts (19:15:24Z-19:15:33Z):**
  - no `og:image`, no `twitter:image`, no `<img>`, and no `image` in the Article JSON-LD
  - `/blog/<slug>/opengraph-image` returns 404
  - `Article.author.url` is the homepage
- **/about:** Person, Organization, WebSite, FAQPage and BreadcrumbList. No ProfilePage. sameAs is only Instagram (18:55:46Z).
- **Book page:**
  - The Book JSON-LD has no `offers` or `isbn`; the only identifier is ASIN B0G7JWDJYQ (18:56:19Z).
  - sameAs lists Amazon, B&N, Bookshop, ThriftBooks, AbeBooks, Goodreads and Play.
  - og:image is 1200x630.
- **/events:** no Event JSON-LD.
- **Homepage:** no gtag, GTM or G- id (19:16:41Z).
- **RSS:** feed paths return 404.
- **Instagram @maya.allan66:** 18 followers, 3 posts (19:05:06Z).
- **YouTube:** `@mayaallan`, `@maya.allan66`, `@MayaAllanAuthor` and `@mayaallanauthor` all return 404 (19:01:38Z).

## 3. Item findings

**goog-01 KEEP.**
- The TXT token and the 38-URL sitemap are confirmed.
- Adding the redirect domains needs new TXT records, and they will show almost no data (308 to home). Low priority.
- The real organic gap is content: 1 of 40 scenario pages is live.
- Verification status is UNVERIFIED.

**goog-02 KEEP, lead low.**
- The page says: "As of August 31, 2026, we've rolled out these insights to all websites worldwide."
- Coverage is AI Overviews and AI Mode. The page describes impressions only; "click" never appears.
- If the report is missing, the page gives two causes: not enough impressions, or the site is **excluded from Search generative AI features**. Check that the site is included.
- **Source:** support.google.com/webmasters/answer/16984139 (18:56:27Z).

**goog-03 KEEP.**
- "Request indexing" and a per-property inspection limit are confirmed.
- **Source:** answer/9012289 (18:56:36Z).

**goog-04 DROP.**
- "only ... JobPosting or BroadcastEvent embedded in a VideoObject".
- **Source:** indexing-api quickstart (updated 2026-07-16; 18:56:50Z).

**goog-05 DROP.**
- Eligibility is "a physical location that customers can visit, or travels to customers"; virtual offices are ineligible.
- A practitioner is eligible if "contacted directly at the verified location during stated hours".
- The literal phrase "online-only" is not on the page; the rule is implied.
- **Source:** support.google.com/business/answer/3038177 (18:57:01Z-18:57:18Z).

**goog-06 KEEP, lead low.**
- Sign-in keys are confirmed: YouTube, Search Console, Twitter, Facebook.
- The page adds: "Not all knowledge panels are claimable as of now". Panels are automatic, and Google "doesn't manually create or delete Knowledge Panels".
- **Google Books print record confirmed:**
  - ISBN 9798994148839: author "MAYA. ALLAN", publisher "Amazon Digital Services LLC - Kdp", 290 pages.
  - Ebook ISBN 9798994148891: "Maya Allan", 289 pages, "Selected pages".
  - Both read 18:58:50Z-18:58:52Z.
- **Sources:** knowledgepanel/answer/7534902 and /7534842 (about 18:57Z).

**goog-07 DROP for now.**
- Requirements: "currently only available in the United States"; 18 or older; 10,000 followers on YouTube, Instagram, X or TikTok. Facebook does not qualify.
- `profile.google.com/claim` redirects to sign-in (19:04:59Z).
- Use Search Console platform properties now (M1).
- **Sources:** websearch/answer/16904498 (19:04:57Z); search-profiles doc (updated 2026-09-16).

**goog-08 KEEP (low).**
- Confirmed: global for Top Stories, plus AI Mode and AI Overviews; domain or subdomain only; the deep link works; custom button added 2026-08-20.
- **Missed prerequisite:** "you must make sure your site is included in Search generative AI features in Search Console".
- **Source:** preferred-sources doc (updated 2026-09-18; 19:05:16Z).

**goog-09 KEEP, lead medium (not high).**
- Confirmed:
  - no link to mayaallan.com on the ebook record
  - full text scanned: "If a user searches a word that appears on a page of your book, your book can be listed"
  - "You can choose to make 20% to 100% of your book's content browseable"
- It offers discovery only, with no path back to the site or to email.
- **Sources:** books/partner/answer/10010291 and /3474239 (about 18:59Z).

**goog-10 KEEP, corrected.**
- **Price:** $9.99 (Play listing, about 18:59:20Z).
- **Revenue share:** 70% under the 2019 TOS, otherwise 52%; some Asian countries are excluded (answer 9331459).
- **Promo codes:** "up to 3 promo campaigns per month. Each campaign can create up to 5,000 codes". Percent-off is for ebooks only (answer 9827742).
- **Correction:** the affiliate program pays "7% commission" when referred books are "purchased within 24 hours of a referral". That is an attribution window, not the payout time. It runs through Partnerize, for "active Play Books partners" (answer 9358246).
- **Margin:** a Play sale earns 70% and gives Maya no buyer email, while the on-site PayPal sale keeps the buyer relationship.
- **Missed policy:** Google's review-snippet guideline (added 2026-07-24) rules out "Reviews written in exchange for a benefit (such as money, discounts, vouchers, or free products) that don't clearly and prominently disclose the incentivization". Offer codes only for honest, disclosed reviews, never conditioned on the rating.
- The FTC 16 CFR 465 text was unreachable (eCFR bot check; ftc.gov 404), so it is UNVERIFIED.
- **Source:** review-snippet doc (19:13:11Z).

**goog-11 KEEP (conditional). Status is restricted.**
- "This program is currently limited to select publishers" in 12 countries, including the US.
- Distributor delivery exists: the page describes a migration form for publishers who sell through distributors.
- The custom-TOC claim is not on this page (UNVERIFIED).
- Audiobook promo codes are confirmed in answer 9827742 (free or fixed price).
- **Source:** books/partner/answer/14164701 (19:00:15Z).

**goog-12 KEEP as Maya's decision, lead low.**
- Confirmed:
  - an EPUB in EN, ES, DE, FR, HI or pt-BR that is offered on Play
  - "If the auto-narrated audiobook is for sale elsewhere, it must also be for sale on Google Play Books"
  - free "for a limited time"
  - "52% revenue share"
- No "Beta" label was found.
- UNVERIFIED: whether the Play file is an EPUB, and whether this conflicts with the human-narrated edition's distribution terms.
- **Source:** play.google.com/books/publish/autonarrated/ (19:00:16Z).

**goog-13 DROP.**
- "eBooks and digital books (not including audiobooks)" and "Services" are unsupported.
- A directly sold audiobook is not excluded by that line; the drug-policy outcome is UNVERIFIED.
- **Source:** merchants/answer/6150006 (19:00:26Z).

**goog-14 DROP.**
- The merchant-listing doc (updated 2026-09-08) applies the free listings guidelines (merchants/answer/12073010), and those exclude ebooks. The ebook's answer is effectively "no".
- `offers` and `isbn` in the Book JSON-LD are harmless hygiene only.
- **Read:** 19:00:30Z-19:00:52Z.

**goog-15 KEEP, lead medium-high only with a steady cadence.**
- Confirmed:
  - The hard-drug list includes "Psilocybin & Psilocybe (magic mushrooms)".
  - "Hard drug use or creation", selling, and links to where hard drugs can be bought are banned; such links can get a channel terminated.
  - EDSA exceptions exist.
  - Up to 14 channel links.
  - Chapters: 00:00 first, at least 3 ascending, each at least 10 s.
- **Missed gate:** "Add clickable links to your long-form video description and posts" is an **Advanced** feature, unlocked by "sufficient channel history" or ID or video verification. Intermediate features need phone verification.
- **Sources:** youtube/answer/9229611 (19:01:16Z-19:01:34Z), /2657964, /9884579, /9890437 (19:04:04Z-19:04:19Z).

**goog-16 KEEP, corrected.**
- "URLs placed in YouTube Shorts comments and Shorts descriptions are non-clickable" (youtube/answer/13748639, 19:03:50Z).
- Routes out of a Short: the **Related Video** link (an Advanced feature) and the channel links.
- The cited source, answer/72851, is the YouTube Partner Program page, not Shorts (19:01:23Z).

**goog-17 KEEP with a gate.**
- Confirmed:
  - "RSS ingestion is available in select countries/regions"
  - episodes publish only to YouTube and YouTube Music
  - "podcast content you upload to YouTube cannot contain advertisements"
  - branded content must be declared
- **Missed gate:** "RSS Upload" is an **Advanced** feature (9890437).
- **Missed conflict:** free audiobook chapters may breach the audiobook's retail or exclusivity terms (distributor UNVERIFIED).
- **Source:** youtube/answer/13525207 (19:04:28Z).

**goog-18 DROP.**
- Requirements: a licensed doctor, nurse, psychologist, MFT or LCSW; LegitScript verification; more than 1,500 watch hours in 12 months or 1.5M Shorts views in 90 days.
- /about says "author and educator writing non-clinical, educational resources".
- **Source:** youtube/answer/12796915 (19:04:38Z).

**goog-20 KEEP, lead low-medium.**
- Confirmed: automatic eligibility; at least 1200 px wide, more than 300k pixels, 16x9, with max-image-preview:large. Doc updated 2026-03-09.
- **Gap:** the live posts have no image at all. Add `<img>`, `og:image` and `Article.image` first.
- **Missed policy:** Discover must follow the policies for Search features:
  - "Dangerous content ... drug abuse"
  - "Medical content: ... contradicts or runs contrary to scientific or medical consensus"
- The Google Books blurb uses "Heal Trauma". Keep health claims out of titles and snippets.
- **Sources:** google-discover doc (19:08:29Z); websearch/answer/9982767 and /10622781 (19:08:31Z-19:08:45Z).

**goog-21 DROP.**
- "Publishers are automatically considered" is confirmed.
- psilowire.com only 308s to mayaallan.com, so no news site exists.
- The useful Publisher Center piece is Reader Revenue Manager (M2).
- **Source:** news/publisher-center/answer/9607025 (19:09:18Z).

**goog-22 DROP.**
- Live: a single result in Search; Discover cards most likely in the US, India and Brazil (doc updated 2026-07-01).
- A separate AMP build is not justified.

**goog-23 KEEP when an in-person event exists.**
- Confirmed: "Events must take place in a physical location"; "Virtual experiences that have no real-world component aren't supported"; public booking; Search and Maps. Doc updated 2026-09-08 (19:09:31Z).
- **Missed route:** a ticketing site already integrated with Google (the doc cites Eventbrite) needs no markup.

**goog-24 KEEP, lead low.**
- "An 'About Me' page on a blog site" is a valid use (doc updated 2026-09-08).
- The doc now ties ProfilePage to the Discussions and Forums feature.
- /about has no ProfilePage.