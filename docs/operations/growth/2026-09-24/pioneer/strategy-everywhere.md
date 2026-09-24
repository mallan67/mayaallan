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