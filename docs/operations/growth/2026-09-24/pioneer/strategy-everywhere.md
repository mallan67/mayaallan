# Search-Everywhere Strategy for Maya Allan (2026-09-24)

Written by the search-everywhere operator workflow (Claude) on branch work/site-visibility of mallan67/mayaallan. Status: PLAN ONLY. Nothing was posted, listed, signed up for, bought or changed on any venue or account, and no site code was changed.

Sources: (a) the six checked pioneer maps in this folder, cited by item id (mkt-*, goog-*, eng-*/vert-*/ai-*, book-*, niche-*, web-*) or as "map NN numbers/missing"; (b) fresh live reads made for this file between 2026-09-24T22:53:43Z and 22:57:08Z (section 1). Anything not readable live is marked UNVERIFIED. First-lead days and 30-day goals are estimates, not measurements.

## 0. Thesis

A pioneer does not fight for the "psilocybin" head terms. She becomes the default answer, and the default take-home, for the weeks after someone's experience, on every surface where that person searches, listens or is handed a card.

Three live facts make this winnable now:
1. The niche is small and already half-won. The book page is #1 on Bing for "psilocybin integration guide" (re-read 22:54:55Z) and #5 of 85 on Amazon for "psilocybin integration" (map 04). Google autocomplete shows a live query family around it: guide, therapy, coach, workbook, therapist, questions, journal, reddit, "post psilocybin integration", "psilocybin after care", "after psilocybin trip" (22:55:25Z). Amazon Books suggests "psychedelic integration workbook" (22:55:36Z).
2. The site has almost no surface to win with: 38 sitemap URLs, 1 of 40 scenarios published, no RSS feed, an empty /events page and one sameAs profile (maps 02, 03, 06; re-read 22:53:50Z-22:54:14Z).
3. State programs hand over an audience nobody serves: 525 of Oregon's 1,220 Q2-2026 clients (43%) came from other US states, and 59% of age responders were 45+ (maps 01, 05). They go home with no take-home support.

So the plan has three layers:
- Doors (days 1-30): venues with a built-in audience and a sign-up mechanic, where a lead can arrive within days: free online circles on event search, ARC reader services, Google Play promo codes, take-home cards in licensed centers.
- Surface (days 10-180): 40 scenario answer pages, the same 40 scenarios as audio and video, and a quarterly data report that journalists and AI answers can cite.
- Plumbing (day 1, once): one entity graph, IndexNow for 5 engines, and a vanity-link router on the two spare domains so every spoken, printed and partner link is counted.

The engineer's rule throughout: every venue gets its own tracked door, every new page is pinged to the engines on deploy, and every free tool is also a capture point.

## 1. Fresh live evidence (this run)

| Evidence | Value | Source | Read (UTC) |
|---|---|---|---|
| Branch head | b992ef03 | gh api git/ref/heads/work/site-visibility | 22:53:43Z |
| Sitemap | 38 URLs; one scenario URL (/scenarios/ego-dissolution) | https://www.mayaallan.com/sitemap.xml | 22:53:50Z |
| /scenarios | links to 1 scenario page | https://www.mayaallan.com/scenarios | 22:53:57Z |
| Home page | newsletter email form present | https://www.mayaallan.com/ | 22:53:57Z |
| /integration-journal | free 7-day PDF in 4 versions; no email field on the page | https://www.mayaallan.com/integration-journal | 22:54:05Z |
| /events | "No events are currently scheduled" | https://www.mayaallan.com/events | 22:54:05Z |
| Spare domains | psilocybinintegrationguide.com/podcast?x=1 and psilowire.com/scenarios answer 308 to the SAME path and query on www.mayaallan.com | curl, redirect_url | 22:54:14Z |
| /glossary | about 185 KB with per-term anchors (#ego-dissolution, #ego-death) | https://www.mayaallan.com/glossary | 22:54:14Z |
| Bing "psilocybin integration guide" | #1 mayaallan.com book page, #2 Google Books, #3 Amazon, #7 Barnes & Noble | https://www.bing.com/search?q=psilocybin+integration+guide | 22:54:55Z |
| Bing "psilocybin integration journal" | mayaallan.com not in top 10 (ScienceDirect and Nature lead) | bing.com | 22:55:07Z |
| Bing, 3 longer scenario queries | degraded results for a script client | bing.com | UNVERIFIED |
| Google autocomplete | query family listed in section 0 | https://suggestqueries.google.com/complete/search?client=firefox&q=psilocybin%20integration | 22:55:25Z |
| YouTube autocomplete | "psilocybin integration": no long tail; "mushroom trip integration" exists | suggestqueries, ds=yt | 22:55:36Z |
| Amazon Books autocomplete | "psychedelic integration workbook", "integration journal" | completion.amazon.com (alias=stripbooks) | 22:55:36Z |
| Google Trends | HTTP 429 | trends.google.com/trends/api/explore | UNVERIFIED |
| Reddit about.json, 7 subreddits | HTTP 403 (www and api hosts) | https://www.reddit.com/r/<sub>/about.json | 22:54:26Z, UNVERIFIED |
| Apple Podcasts search API | "psychedelic integration": 9 shows, 7 active in 90 days; "microdosing": 41 shows, 12 active | https://itunes.apple.com/search?media=podcast&term=... | 22:54:42Z |
| Colorado DORA open data | active licenses: 86 facilitators (NMF), 94 clinical facilitators (NMCF), 691 in training (NMIT), 11 training programs (NMTP) | https://data.colorado.gov/resource/7s5z-vewr.json | 22:57:08Z |

## 2. Rules every move follows

- UTM grammar: lowercase with hyphens. utm_source=<venue-slug>. utm_medium from a closed list: print-qr, b2b, audio, video, event, community, referral, arc, promo-code, backmatter, newsletter, embed, press, profile. utm_campaign=<initiative> (take-home-kit, casebook, scenario-circle, guest-2026q4, scenario-<n>, arc-2026q4). utm_content for variants.
- Where a UTM cannot travel (said on a podcast, printed on a card or in the book), use a vanity path on a spare domain (move 1); the server adds the UTM.
- Editorial and .gov links (state directories, articles, show notes): submit the clean canonical URL and attribute by referrer. UTMs go only on links Maya controls (profiles, descriptions, QR codes, emails).
- sameAs lists only profiles Maya has claimed and controls. Any paid placement link is rel="sponsored" (web-spam-redlines).
- A lead is one of: newsletter opt-in, journal or prompt opt-in, event registration, ARC sign-up, B2B kit or casebook request, purchase. Proposed event names, to be aligned with the parallel measurement workflow (goog-34): generate_lead {lead_type, venue}, event_register, kit_request, casebook_request, vanity_hit {slug}, purchase.
- Content line: educational and non-clinical. No dosing, no sourcing, no therapy claims. Every tool and scenario page carries a "when to seek help" box (mkt-ws-09).

## 3. Priority (leads per hour of Maya's time, 30-day view)

| Rank | Move | Owner | First lead (estimate) | Why |
|---|---|---|---|---|
| 1 | 10 Scenario Circles on event search | Maya + owner account | day 5-10 | a registration is an email; Eventbrite and MAPS bring discovery |
| 2 | 5 ARC review engine | owner account + small PR | day 3-7 | reader services deliver sign-ups and fix 0 reviews |
| 3 | 6 Google Play promo-code funnel | owner account + PR | day 5-10 | 5,000 codes per campaign, each behind an email |
| 4 | 7 Take-home kit for OR/CO centers | outreach + PR | day 7-14 (B2B) | one center is a steady client flow |
| 5 | 1 Vanity link router | code PR | enabler | makes spoken, printed and partner doors measurable |
| 6 | 3 Scenario Atlas | content + PR | day 10-21 | matches the live autocomplete family |
| 7 | 15 Disclosed forum answers | Maya | day 3-14 (small) | fast, low volume |
| 8 | 8 Training-program casebook | outreach + content | day 10-30 | one adoption reaches every cohort |
| 9 | 9 Official listings + Colorado comment | outreach | day 14-45 | .gov and NGO referrals compound |
| 10 | 2 One entity, six engines | PR + owner account | enabler | faster indexing for moves 3, 11, 13 |
| 11 | 4 Retail search repair + back matter | owner account | day 14-30 | every copy sold becomes a door |
| 12 | 12 Podcast guest sprint | outreach | day 30-60 | air dates lag |
| 13 | 13 Oregon Returners data report | content + PR | day 14-30 | citable by press and AI answers |
| 14 | 11 Scenarios as YouTube + podcast | content | day 14-30 | compounds for months |
| 15 | 14 Wide, libraries, German | owner account | day 30-60 | reach, slower |

## 4. The 15 moves

### Move 1 - Vanity link router on the two spare domains (one tracked door per venue)
- Venues: psilocybinintegrationguide.com for anything spoken or printed (podcasts, book back matter, talks); psilowire.com for short QR codes; every offline and partner channel.
- Steps: (1) Code PR: a small registry in the repo (slug -> destination path + utm_source/utm_medium/utm_campaign) and one route family on www.mayaallan.com, e.g. /pod/<show>, /kit/<center>, /yt/<n>, /book, /listen, /free-copy/<campaign>, that answers 307 to the destination with the UTMs appended; unknown slugs go to the home page with utm_source=vanity-unknown. (2) No domain change is needed: both spare domains already 308 to the same path and query on www.mayaallan.com (22:54:14Z), so psilocybinintegrationguide.com/pod/integration-session works as soon as the route ships. (3) Count each hop server-side (vanity_hit {slug}) so it is measured even when the browser blocks analytics. (4) Send X-Robots-Tag: noindex on the route; never reuse a slug.
- Owner: code PR. Effort: half a day. First lead: enabler (day 0).
- Measure: vanity_hit by slug, then generate_lead carrying the utm_source.
- Evidence: live 308 test (22:54:14Z); per-venue UTM designs in mkt-01, mkt-ws-01, mkt-ws-02; show-notes links in web-pod-showsnotes.

### Move 2 - One entity, six engines (one-time plumbing PR)
- Venues: Google Search, AI Overviews, AI Mode and Discover (eng-google, goog-27); Bing and Copilot, and DuckDuckGo and Yahoo which run on Bing (eng-bing, ai-copilot, eng-duckduckgo, eng-yahoo); the IndexNow engines Bing, Naver, Seznam.cz, Yandex and Yep (eng-indexnow); Brave and Apple by links only (eng-brave, eng-apple). ChatGPT, Perplexity, Claude and Meta AI crawlers are already allowed by robots.txt (ai-*).
- Steps: (1) IndexNow key file at the site root, and a POST of changed URLs on every production deploy (up to 10,000 URLs per POST, shared by all participants). (2) Owner account: verify Bing Webmaster Tools, submit the sitemap, open the AI Performance report. (3) Search Console Domain property (TXT token exists): submit the sitemap and switch on inclusion in Search generative AI features, which the Generative AI report and preferred-source badges require (map 02 missing). (4) JSON-LD: merge the 3 unlinked "Maya Allan" records into one Person @id; make /about a ProfilePage and point Article author.url to it (goog-24, web-schema-graph); give Book an isbn per format only after the ISBN defect is fixed (book-isbn-defect), plus workExample for ebook, paperback and the coming audiobook; grow sameAs as each profile is claimed (Goodreads, Open Library OL16288546A, Amazon author page, YouTube). (5) RSS feeds for /blog and /scenarios (0 feeds found, map 03). (6) max-image-preview:large and a 1200x675 hero per post for Discover (eng-google, goog-20). (7) Add both spare domains to Search Console to watch the redirects (goog-01).
- Owner: code PR + owner account. Effort: 1 to 1.5 days. First lead: indirect; shortens publish-to-index time for moves 3, 11 and 13.
- Measure: IndexNow 200/202 in deploy logs; Bing AI Performance citations; Search Console Generative AI report (goog-02).
- Evidence: maps 03 and 06 numbers (sameAs 1, Book schema without isbn, RSS 0, 3 unlinked records); eng-bing; eng-indexnow; goog-24; goog-02.

### Move 3 - Scenario Atlas: the 39 missing answer pages, each a capture point
- Venues: Google organic and AI Overviews, Bing and Copilot, ChatGPT search, Perplexity; YouTube embeds from move 11.
- Steps: (1) Publish the 39 missing scenarios, 10 a week, on the existing /scenarios/ego-dissolution template. Title each in the reader's words from live autocomplete ("after psilocybin trip", "psilocybin after care", "post psilocybin integration", "psilocybin integration questions"); then a 100-150 word direct answer, 3 reflection prompts, a "when to seek help" box with Fireside's 62-FIRESIDE line (niche-npo-fireside), and links to the matching journal version and glossary anchor. (2) Capture: "Email me these 3 prompts and the 7-day journal, one day at a time", placed beside the direct PDF download (keep the download ungated). (3) Group the hub by phase: during, first 72 hours, weeks later, relationships and work. (4) Ping IndexNow and request indexing on publish (goog-03). (5) No FAQ markup expectations: FAQ rich results were removed 2026-05-07 (map 02). (6) Add what the book cannot: Google Books full-text search already indexes all 40 scenarios (map 02), so each page wins on prompts, tools and referral, not by copying the chapter.
- Owner: content (Maya writes or approves) + code PR (hub and capture component). Effort: about 1 hour per page, 40 hours over 4 weeks. First lead: day 10-21 (estimate; Bing already ranks the site #1 for the book phrase).
- Measure: scenario_view {n}; generate_lead {lead_type: prompts, scenario: n}; Bing AI Performance and Search Console Generative AI report per URL.
- Evidence: 1 of 40 scenarios live (22:53:50Z; map 02); mkt-ws-03, mkt-05, mkt-07; a scenario-style video has 152,568 views in 10 months while integration videos top out at 34K (map 01); autocomplete 22:55:25Z.

### Move 4 - Repair the retail search engines, then make every copy a door
- Venues: Amazon search and Alexa for Shopping (vert-amazon), Goodreads (vert-goodreads), Google Books and Play (goog-09, goog-10), Barnes & Noble (#7 on Bing, 22:54:55Z).
- Steps: (1) The Kindle ebook and paperback share ISBN 979-8994148839, which KDP forbids: ask KDP Support first, else publish a new ebook edition now, while it has 0 reviews (book-isbn-defect). (2) BISAC OCC039000 (Entheogens & Visionary Substances) as primary, plus SEL031000 and PSY075000 or HEA032000, instead of Codependency and Inner Child (book-bisac). (3) Seven KDP keywords from live Amazon suggestions and map 04: psychedelic integration workbook; integration journal; psilocybin integration; ego death; bad trip help; challenging psychedelic experience; psilocybin after care (book-kdp-categories-keywords). (4) Goodreads: claim author 65134359, merge duplicate 245349971 into 245299940, fill the website field (web-goodreads). (5) Google Books: fix "MAYA. ALLAN" on the print record and replace the second bio with the one canonical bio (goog-06, web-googlebooks, web-presskit). (6) Back matter in every edition: "Free 7-day integration journal: psilocybinintegrationguide.com/book", routed with utm_source=kindle|paperback|play-books&utm_medium=backmatter; KDP's rule on links inside ebooks is UNVERIFIED, so print a plain URL (book-kdp-ebook-backmatter). (7) A+ Content with scenario-card images (book-a-plus).
- Owner: owner account (KDP, Goodreads, Play Partner Center). Effort: 1-2 days plus up to 72 hours for KDP changes. First lead: day 14-30 (estimate).
- Measure: vanity_hit {book}; generate_lead with utm_medium=backmatter; Amazon position for "psilocybin integration" (baseline #5 of 85); Goodreads ratings (baseline 0).
- Evidence: map 04 numbers and the items above; Amazon Books autocomplete 22:55:36Z.

### Move 5 - Review and ARC engine: from 0 reviews to 25, every reviewer a lead
- Venues: BookSirens and Hidden Gems (book-arc-engine), an own /arc page, Goodreads Giveaways after the claim, BookFunnel or StoryOrigin for delivery (book-bookfunnel-storyorigin); BookBub and The Fussy Librarian in months 2-3 (book-bookbub; map 04 missing).
- Steps: (1) PR: /arc page, "Read it free, review it honestly", email opt-in required, delivery by Play promo code or BookFunnel. (2) BookSirens: $10 plus $2 per reader, 51,000+ reviewers; its terms say "You are NOT paying readers for reviews". (3) Hidden Gems: about $140 for 50 readers. (4) Goodreads giveaway once the author profile is claimed. (5) Goal: 25 honest reviews on Amazon and Goodreads by day 30; never ask for a rating level; no review swaps. (6) Claim the BookBub author profile now; submit a Featured Deal once reviews exist (Advice & How-To at $0.99: $784, 650,000+ subscribers, 2,000-3,500 clicks; criteria UNVERIFIED). The Fussy Librarian (120,000 subscribers) is the cheaper test.
- Owner: owner account + small code PR. Effort: 1 day plus $150-$250. First lead: day 3-7 (estimate).
- Measure: utm_source=booksirens|hidden-gems|goodreads-giveaway&utm_medium=arc&utm_campaign=arc-2026q4; generate_lead {lead_type: arc}; weekly review count per retailer.
- Evidence: map 04 numbers (0 reviews everywhere; prices above); map 06 missing (BookSirens 51,000+). Amazon's own ARC rules were not re-read this run (UNVERIFIED); follow each service's terms.

### Move 6 - Google network lead stack
- Venues: Google Play Books (goog-10), Google Books preview and full-text search (goog-09), preferred sources (goog-08), Reader Revenue Manager newsletter sign-up and Search Console platform properties (map 02 missing).
- Steps: (1) Play promo codes: up to 3 campaigns a month, 5,000 codes each. One campaign per audience (ARC readers, center pilots, podcast listeners); codes are given only on email-capture pages (/free-copy/<campaign>), so each code is a lead. (2) Join the Play affiliate program (7%) and use those links on the site's Google Play buttons. (3) Google Books: test a larger preview and print the vanity URL in the front matter, so readers who find a scenario through full-text search reach the site; link the site to https://books.google.com/books?vid=ISBN9798994148891. (4) Preferred-sources link (https://www.google.com/preferences/source?q=mayaallan.com) in blog and newsletter footers, after the Search Console setting in move 2. (5) Test Reader Revenue Manager's 1-click newsletter sign-up on /blog and /scenarios; it needs a Publisher Center publication, and eligibility for a one-author site is UNVERIFIED. (6) Add the YouTube channel as a Search Console platform property once move 11 ships.
- Owner: owner account + code PR. Effort: 1 day. First lead: day 5-10 (estimate).
- Measure: utm_source=google-play&utm_medium=promo-code&utm_campaign=<audience>; generate_lead {lead_type: free-copy}; redemptions and preview traffic in Partner Center.
- Evidence: map 02 numbers (codes, 7% affiliate, 20-100% preview, ebook $9.99, ISBN 9798994148891); goog-08, goog-09, goog-10.

### Move 7 - Take-home integration kit for Oregon and Colorado centers (B2B)
- Venues: Oregon's 22 operating service centers and 383 facilitators (map 01); Colorado's 46 licensed healing centers (map 05) and, live at 22:57:08Z, 86 active facilitators, 94 clinical facilitators and 691 in training (DORA open data).
- Steps: (1) PR: printable /kit page, "Back home after your session: the first 30 days": scenario index, journal link, Fireside line, when to seek help. (2) One QR per center: psilowire.com/kit/<center> -> /kit?utm_source=or-svc-<slug> or co-hc-<slug>&utm_medium=print-qr&utm_campaign=take-home-kit. (3) Free offer: 50 printed cards or the PDF, plus 25 Play promo codes for a client pilot; the center decides placement. (4) Outreach 10 centers a week, Oregon first: 525 of 1,220 Q2-2026 clients came from other states, 71% of county responders were out of state, 59% of age responders were 45+ (maps 01, 05). (5) Send each center a quarterly scan count (aggregate only). (6) Use state rosters for business outreach only; never copy names or addresses into this repository.
- Owner: outreach (Maya) + code PR. Effort: 2 days to build, 2-3 hours a week. First lead: B2B reply day 7-14; first client scan day 21-45 (estimates).
- Measure: kit_request; vanity_hit {kit/<slug>}; generate_lead by utm_source=or-svc-* and co-hc-*.
- Evidence: mkt-01, mkt-02, mkt-ws-01, niche-b2b-or-centers, niche-b2b-co-centers; DORA live read. What centers may hand to clients under Oregon and Colorado rules was not read (UNVERIFIED): ask each center.

### Move 8 - Casebook adoption by training programs (one yes reaches every cohort)
- Venues: 15 active Oregon training programs (map 01); 11 active Colorado programs (DORA NMTP, 22:57:08Z); CIIS (niche-edu-ciis); Third Wave and Fireside coach certifications (map 01 missing); Heroic Hearts Project, on Oregon's approved list (map 05 missing).
- Steps: (1) Package the 40 scenarios as a Teaching Casebook with discussion prompts (mkt-ws-04, mkt-10). (2) Price anchor: MAPS sells a practitioner 20-pack at $60 (map 01 missing); desk copy free, cohort license as per-student ebook codes. (3) Email each program director a one-page PDF and ask to be listed as recommended reading. (4) Offer a free 45-minute guest session, "integration after the licensed session".
- Owner: outreach + content. Effort: 3 days, then 2 hours a week. First lead: day 10-30 (estimate).
- Measure: utm_source=trainer-<program>&utm_medium=b2b&utm_campaign=casebook; casebook_request.
- Evidence: mkt-10, mkt-ws-04, niche-edu-or-programs, web-edu-ops; DORA live read.