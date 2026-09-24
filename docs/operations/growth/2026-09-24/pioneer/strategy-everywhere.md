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