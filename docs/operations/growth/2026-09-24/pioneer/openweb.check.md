# Adversarial check: open-web map 06 (2026-09-24)

- **Map checked:** `docs/operations/growth/2026-09-24/pioneer/06-open-web-entity-links.md` at commit `055b1cca50703972d533655a0804a0f39ac15dce`. It is blob `f2beedbc…`, the same blob that was on `work/site-visibility` head `7183c7bc` at 18:52:36Z.
- **Read window (UTC):** 2026-09-24T18:52:36Z to 19:08:20Z. Each read time below is the `date -u` stamp printed at the start of that fetch batch. A `~` marks a WebFetch that ran between two stamps.
- **Method:** GET-only reads (curl, WebFetch) of live pages and public APIs. No sign-ins, no posting, no accounts created.
- **WebSearch was not available.** This session's search budget was used up, so new venues were found only by fetching known URLs directly. Venue discovery is therefore narrower than a search-based pass would be.
- **Legend:**
  - **keep:** the item stays in the actionable map.
  - **status ok:** the map's live / dead / restricted label is correct.
  - **UNVERIFIED:** the page could not be read live. Nothing was filled in from memory.

---

## 1. Headline findings: what the map got wrong or missed

1. **Amazon is readable now, and it changes the ISBN picture.** `amazon.com/dp/…` returned HTTP 200 with no captcha (18:56:45Z to 18:57:14Z).

   | Format | ASIN | ISBN-13 | Price | Best Sellers Rank | Ratings |
   |---|---|---|---|---|---|
   | Hardcover | B0G7JWDJYQ | 9798994148853 | $33.99 | #3,949,951 in Books | 0 |
   | Paperback | B0G91GZMLT | 9798994148839 | $21.99 | #957,243 in Books | 0 |
   | Kindle | B0G765BZDL | none of its own (the page shows the paperback ISBN) | $9.99 | #3,144,369 in Kindle Store | 0 |

   What follows from this:
   - **Missing ISBN.** The map's §4 `workExample` has 2 ISBNs. There are 3: hardcover 9798994148853, paperback 9798994148839, and ebook 9798994148891 (the Google Play edition).
   - **The site points at the most expensive format.** The site's Book JSON-LD `identifier` (ASIN B0G7JWDJYQ) and its Amazon `sameAs` URL both point at the $33.99 hardcover, not the paperback or the Kindle edition.
   - **web-amazon is not UNVERIFIED.** The Author Central mechanics are documented in KDP help G200644310 (see §2).
2. **Goodreads has two separate book records:** 245299940 and 245349971, both with 0 ratings (author list page, 18:55:36Z). The map names only the first.
   - Claimed authors can "fix your book listings" (Author Program page, 18:55:36Z).
   - Merge the records so ratings collect in one place.
3. **Google Books is not link-free.** Its "Get this book in print" list shows the label `www.psilocybinintegrationguide.com`, but the link actually goes to the Amazon short link `https://a.co/d/igV5e0U` (18:56:33Z).
   - The same listing shows "Buy eBook - $9.99" through `play.google.com`, so the ebook is sold on Google Play and someone set a custom print buy link.
   - That points to Google Play Books Partner Center (its help center is live, 19:06:33Z) as the likely editing route. This is strongly suggested but not proven.
4. **The map missed four policy restrictions.**
   - **Pinterest** Community Guidelines (last updated May 2026, ~19:01Z). Under the heading "Prohibited and regulated goods, services and activities": "Pinterest isn't a place for offering, manufacturing, or promoting substances…". The list includes "Illicit or synthetic drugs" and "Promotion of excessive drug or alcohol use".
   - **YouTube** "Illegal or regulated goods or services" policy (support.google.com/youtube/answer/9229611, ~19:02Z):
     - It lists "Psilocybin & Psilocybe (magic mushrooms)" among hard drugs.
     - It bans non-educational content showing people "taking hallucinogens".
     - It allows content with Educational, Documentary, Scientific or Artistic (EDSA) context, but "This is not a pass to promote content intended to sell, create, or facilitate access…".
     - Links to places where hard drugs can be bought can lead to channel termination.
   - **Washington My Health My Data Act** (WA Attorney General page, ~19:05Z):
     - It protects data on "past, present, or future physical or mental health status", including substance-use data and inferences.
     - It applies to small businesses too.
     - This matters for the planned survey (web-assets) and any form that collects post-experience data.
   - **Substack** content guidelines (updated 2026-07-20, ~18:58Z): no drug-specific ban outside the Australia section. Only the general ban on content that "promotes harmful or illegal activities" applies. Integration content fits.
5. **Colorado runs a second approved-programs list, and the map missed it.** The DORA Natural Medicine page lists **15 approved Natural Medicine training programs** (18:59:35Z).
   - Its application data (last updated 02/02/2026) shows **536** Facilitator Training License applications, **90** Facilitator, **47** Clinical Facilitator and **20** Training Program License applications.
   - The map's .edu/.org section covers only Oregon.
   - Several programs are on both states' lists: Acadia, Changa, InnerTrek, Numinus and Entheo.
6. **Psychedelics Today takes article pitches as well as podcast guests.** Its contact page says "Interested in publishing an article?" and "Interested in recording a podcast with us? … We are very selective on what we host" (18:58:39Z). The map's guest-post table does not include this venue.
7. **Reedsy Discovery is DEAD at its old URL.** `reedsydiscovery.com` now serves a Hostinger "Parked Domain name" page (19:03:25Z). Do not recommend it.
8. **New Google items the map lacks:**
   - Changelog 2026-09-24: `creator` property added to VideoObject structured data (19:08:20Z). Point any on-site video's `creator` at the Person `@id`.
   - The AI optimization guide (updated 2026-07-10) points to the Search Console **Generative AI performance report** (19:01:19Z).
   - The Search Central blog lists "Announcing web multimodal Search performance reporting in Search Console" under September 2026. Only the title was read (19:01:35Z).

---

## 2. Item-by-item verdicts (30 items)

### Site and identity basics

| id | keep | status ok | Verdict (live evidence) | Lead value (checked) |
|---|---|---|---|---|
| web-schema-graph | yes | yes | **Confirmed (18:53:38Z):** the WebSite, Organization, Person and Book nodes have no `@id`. Person and Organization both carry `sameAs` = Instagram only. Book has only an ASIN `identifier`, with no `isbn` and no `workExample`. **Fixes:** list 3 ISBNs (§1.1). `/about` already emits an `FAQPage` node, so merge or drop it when adding `ProfilePage`. **Doc check:** the ProfilePage doc (updated 2026-09-08, ~18:54Z) allows "An 'About Me' page on a blog site", as long as its primary focus is "a single person". | **low directly; it is an enabler** (the map said medium). Google's AI guide says structured data isn't required for generative AI search |
| web-presskit | yes | yes | `/press` returns **404**. `/media` has 1 image, 0 download links and 0 press-kit mentions (18:53:38Z, 19:04:47Z). Google Books still shows the "devoted explorer of the sacred landscapes…" bio (18:56:23Z). Amazon has its own "About the author" block (18:57:03Z), so add Amazon to the places that get the same bio | high as the enabler for pitches; zero on its own |
| web-goodreads | yes | yes | **Unclaimed:** no author badge and no Website field. The "Is this you? Let us know." link is there (18:55:23Z). **Claim steps:** on desktop, search "via ISBN, ASIN, or title"; approval email comes "within 2 business days" (18:55:36Z). **Link type:** the sample Website link has `rel="noopener noreferrer"` and no nofollow (18:55:23Z). **Missed:** 2 book records to merge (§1.2). Giveaways are a paid product; the price is not readable while signed out (UNVERIFIED) | **medium** (the map said high). With 0 ratings, a claimed page adds trust, not traffic |
| web-openlibrary | yes | yes | Still revision 1 with no bio or links (18:55:49Z). **Only 1 edition** exists (paperback 9798994148839); add the ebook and hardcover ISBNs. Author HTML pages still show a bot check, so `rel` stays UNVERIFIED (18:56:03Z). **Correction:** the help page's payoff for linking Wikidata is that "reading stats are more accurate" (18:56:13Z). That is a reader-stats feature, not a visibility gain | low |
| web-googlebooks | yes | partly | Live: ISBN 9798994148891, 289 pp, publisher "Maya Allan", old bio (18:56:23Z). **Wrong in the map:** "0 links". A print buy link labelled with her domain goes to Amazon (§1.3). Fix the label and the target together | medium |
| web-amazon | yes | **no**: live, not unverified | **Author Central steps** (KDP help G200644310, ~18:58Z): KDP Marketing, then "Manage author page", sign in with KDP credentials, search by ISBN, ASIN or name, then confirm. **Where it works:** full editing on .com, .co.uk, .de, .fr, .co.jp and .com.br. **Followers:** get new-release emails if they opted in, which is useful for the audiobook launch. **Current page:** "Follow the author" and "About the author" show; no author-store link was found (18:57:03Z). No website-link field is documented, so the link back is **none documented** | **medium** for sales; no direct leads to the site |

### Google network

| id | keep | status ok | Verdict (live evidence) | Lead value (checked) |
|---|---|---|---|---|
| web-g-preferred | yes (low) | yes | Doc updated 2026-09-18. The changelog confirms the dates: all languages 2026-04-30, AI Mode / AI Overviews 2026-05-27, button 2026-08-20 (18:54:31Z). **Correction:** gen-AI inclusion in Search Console is needed only for the AI Mode / AI Overviews display, not for Top Stories. **Prefer the deeplink:** it needs no `news.google.com` script and no cookie-consent handling. It only helps with people who already choose her site | low |
| web-g-platform | yes (low) | yes | Blog 2026-07-29: tracks "Instagram, TikTok, X, and YouTube" posts on "Google Search, Discover, and Google News… globally available to everyone" (18:55:09Z). The doc (updated 2026-07-29) says "add and verify each of your accounts individually" (19:01:35Z). With 3 Instagram posts, there is almost nothing to measure | low (measurement only) |
| web-g-profile | yes (milestone) | yes | Needs 10,000 followers on YouTube, Instagram, X or TikTok, age 18+, US only. Claim at `profile.google.com/claim` (support 16904498, ~18:54Z). Badge doc updated 2026-09-16 | none now; high only after 10k followers |
| web-g-kp | yes (conditional) | yes | Steps confirmed. Verification accounts: YouTube, Search Console, Twitter, Facebook. The page warns "Not all knowledge panels are claimable" (~18:54Z). Whether a panel exists for "Maya Allan": UNVERIFIED | **low** (the map said medium). Trust only, and a panel is unlikely at this entity strength |
| web-g-gbp | **no** | yes | Eligible only if the business "has a physical location that customers can visit, or travels to customers" (~18:54Z). An online-only author does not qualify | none |
| web-g-faq | **no** | yes (DEAD) | Changelog: "no longer appear in Google Search starting May 7, 2026". The docs were removed 2026-06-15 (18:54:31Z). Keep `FAQPage` markup only for non-Google systems | none |
| web-g-podcasts | **no** | yes (DEAD) | "Google Podcasts Manager is no longer available"; the page points to YouTube RSS upload (~18:54Z) | none |
| web-g-bookactions | **no** | yes | The 2025-06-12 blog lists "Book Actions" among the phased-out types (18:55:09Z). Nov 2025 changelog: "Removed the deprecation banner from Book actions documentation, as there's still a feature using the markup" (18:54:31Z). It is a feed program, not for one author | none |
| web-g-ytrss | yes | yes | **RSS upload** (~18:55Z): only in "select countries/regions". YouTube makes static-image videos, auto-uploads new episodes, and episodes arrive as private. No ads allowed in the audio. **Channel links** (~19:02Z): "up to 14 links"; the first is "prominently displayed … near the subscribe button"; add them in Studio under Customization, then Profile. **Missed policy** (§1.4): keep videos educational (EDSA), show no use, link to no sellers. If the audiobook is distributed exclusively, check excerpt rights first (UNVERIFIED) | **medium** (the map said high). High effort, slow build |
| web-g-ads | **no** (keep only as a red line) | yes | "Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed." No education exception; the only exception is for CBD (~18:55Z) | none |

### Links, newsletter and outreach

| id | keep | status ok | Verdict (live evidence) | Lead value (checked) |
|---|---|---|---|---|
| web-substack | yes | yes | On a sample post, all 6 in-post external links had no `rel` (followed), and the canonical points to the post itself (18:58:14Z). Guidelines: see §1.4. **Caveat:** if the site already collects emails, a Substack list splits the audience. Pick one owner for the list | medium-high |
| web-pod-showsnotes | yes | yes | **Psychedelics Today, 2026-08-12 episode:** 19 non-social links, all without `rel`. About 10 are site-wide promos (shop, training, apps); about 6 belong to the episode (18:58:27Z). **Third Wave, episode 374** (published 2026-09-23): 3 non-social links, no `rel`; the map said 9. **Selectivity:** Psychedelics Today says it is "very selective" (18:58:39Z). Start with smaller shows and treat these two as stretch pitches | high if booked; realistically **medium** near-term |
| web-edu-ops | yes | yes | The OHA page is live, and its PDF note says "updated on September 2, 2026" (18:58:49Z). WebFetch extraction of the PDF found **13 programs**; this is approximate, since the PDF was not parsed line by line. **Missed:** OHA publishes "How to Update Training Program Information, Affiliated Individuals and Curriculum". Approved curriculum changes are formal, so offer the journal as an optional student resource, not as curriculum. Add Colorado's 15 programs (§1.5); together there are about 25 unique programs | **low-medium** (the map said medium) |
| web-assets | yes | yes | The spam policy (updated 2026-08-28) lists "Keyword-rich, hidden, or low-quality links embedded in widgets that are distributed across various sites" (19:01:19Z). Zenodo returns HTTP 200. **Missed legal point:** WA My Health My Data Act (§1.4). The survey host must not log IP addresses or cookies against answers, and the survey needs an 18+ gate. Publish aggregates only | medium |

### Wikidata, Wikipedia and social identity

| id | keep | status ok | Verdict (live evidence) | Lead value (checked) |
|---|---|---|---|---|
| web-wikidata | yes (conditional) | yes | All 14 property IDs re-checked by the API (18:59:50Z). Also useful: P496 (ORCID iD) and P7400 (LibraryThing author ID). There are still 0 items. **Policy pages:** Notability was last edited 2026-09-12. Autobiography (2025-03-30): "you should not create an item about yourself unless you are sure that it fulfils the notability criteria" (19:00:02Z). Retailer and catalog ISBN records are weak references, so wait for one independent source | low |
| web-wikipedia | **no** | yes | Notability (people) and the Conflict of interest page were both last edited 2026-09-16. COI editors are "strongly discouraged from editing affected articles directly" and should use Articles for Creation (19:00:02Z) | none |
| web-bluesky | yes (low) | yes | DNS TXT `_atproto` with the value `did=did:plc:…` is confirmed (tutorial 2023-04-28, 19:00:16Z). The atproto spec says "HTTP redirects (eg, 301, 302) are allowed", so the `mayaallan.com` → `www` 308 redirect does not break the well-known method (19:00:28Z) | low |
| web-mastodon | yes (low) | yes | Docs last updated 2026-04-15 (19:00:37Z). `rel="me"` verification is confirmed. **Missed step:** the `fediverse:creator` code comes from Preferences, Public profile, Verification, Author attribution, and the site must be added as an allowed website there | low |
| web-pinterest | yes (caution) | yes | **Claim methods:** Google Merchant Center, HTML tag, HTML file or DNS TXT. "A website can only be claimed by one Pinterest account." A business account is recommended but not required. DNS changes take up to 72 hours (~19:01Z). **Missed:** the drug-content rule (§1.4). Use journaling or nervous-system visuals, not mushroom imagery | **low-medium** (the map said medium) |
| web-gravatar-linktree | **no** | yes | Re-observed: Gravatar links carry `rel="me nofollow noreferrer"`, and Linktree links carry `rel="noopener noreferrer"` (19:00:16Z). Identity only. The map itself prefers an on-site `/links` page | none for leads |
| web-socials-unverified | yes, but split into one row per platform | **no**: partly verifiable now | **Now reachable (HTTP 200):** LinkedIn public profile, where links in posts carry `rel="nofollow"`; X, where links are wrapped in `t.co`; Threads; TikTok; and Medium's import help, which says the import tool will "add a canonical link". **Still 403:** Medium profiles, Quora, BookBub, LibraryThing, Muck Rack, StoryGraph and Reddit JSON (19:02:11Z to 19:02:56Z) | varies |

### Indexing, monitoring and red lines

| id | keep | status ok | Verdict (live evidence) | Lead value (checked) |
|---|---|---|---|---|
| web-indexnow | yes (low) | yes | The FAQ lists endpoints for Amazon, Bing, Naver, Seznam.cz, Yandex and Yep. `searchengines.json` also lists **Internet Archive**, which the map missed. "Submitting a URL does not guarantee immediate indexing" (19:01:09Z). "Google does not participate" is an inference (Google is not listed), not a quote | low |
| web-mentions | yes (low) | yes | Google Alerts and Talkwalker Alerts both return HTTP 200 (19:01:19Z). The AI guide (2026-07-10) says seeking inauthentic "mentions" "isn't as helpful as it might seem". There are almost no mentions yet, so the alerts will be quiet at first | low |
| web-spam-redlines | yes | yes | Spam policies updated 2026-08-28. The site-reputation update blog is listed under August 2026 (19:01:35Z). **Correction:** the policy targets "Low-quality directory or bookmark site links", not every directory. Curated professional lists, such as state program lists or Goodreads, are fine. The changelog also shows the 2026-04-13 "back button hijacking" policy | n/a (guardrail) |

**Tally**
- 22 items kept; 8 dropped: gbp, faq, podcasts, bookactions, ads, wikipedia, gravatar-linktree, and the web-socials-unverified bucket as written.
- 2 status labels wrong: web-amazon and web-socials-unverified.
- 1 partly wrong: web-googlebooks ("0 links").
- 7 lead values inflated: schema-graph, goodreads, g-kp, g-ytrss, edu-ops, pinterest, amazon.

---

## 3. Important venues the map missed

| # | Venue | Mechanics (live) | Link / tag | Cost | Lead value | Source (read UTC) |
|---|---|---|---|---|---|---|
| M1 | **Colorado DORA approved Natural Medicine training programs** (15) | Same outreach as web-edu-ops: offer the journal as an optional student resource. The page lists each program's site and contact. Also covered in the market map (01), but missing from 06 | UNVERIFIED per program; `utm_source=edu-<slug>&utm_campaign=journal-oer` | free | low-medium | dpo.colorado.gov/NaturalMedicine (18:59:35Z) |
| M2 | **Psychedelics Today guest articles** (plus the podcast inquiry form) | Contact page: "Interested in publishing an article?" and "We are very selective on what we host" | show notes and articles observed with no `rel` (followed) | free | medium-high if accepted | psychedelicstoday.com/contact/ (18:58:39Z) |
| M3 | **Press-query services:** Source of Sources, Qwoted, Featured | **Source of Sources:** free, run by HARO's founder Peter Shankman; "Up to three times a day" query emails; claims over 20,000 journalists; off-topic pitches get you removed. **Qwoted:** "Join for FREE" tier; pricing page not read. **Featured:** live ("search, save, and respond to journalist requests, podcast invites, speaking gigs"); plans UNVERIFIED. **HARO:** `helpareporter.com` showed a Vercel security checkpoint (HTTP 429), so its status is UNVERIFIED | editorial links, type varies by outlet; `utm_medium=press` | free / freemium | **high**: earned coverage is what the Wikidata and knowledge-panel steps are waiting for | sourceofsources.com, qwoted.com, featured.com (19:03:25Z; ~19:06Z) |
| M4 | **Podcast guest marketplaces:** PodMatch, MatchMaker.fm | PodMatch has AI matching and a media one-sheet; its homepage says there is **no free plan**. MatchMaker.fm is live (HTTP 200); its mechanics were not read. Podchaser returned 403 (UNVERIFIED) | show-notes links (see web-pod-showsnotes); `utm_source=pod-<slug>` | paid (PodMatch) | medium: feeds web-pod-showsnotes with smaller shows | podmatch.com (~19:03Z); matchmaker.fm (19:03:25Z) |
| M5 | **Review and ARC venues** to fix 0 ratings everywhere | **BookSirens:** "$10 per ARC + $2 per Reader", with a cap on spend and "You are NOT paying readers for reviews"; claims 51,000+ reviewers. **NetGalley:** pricing only on request through a form. **BookLife (Publishers Weekly):** free author profile and book listing; paid reviews. **Caution:** Google's 2026-07-24 changelog adds a guideline on "fake and undisclosed incentivized reviews" for review snippets. Amazon's review rules for ARCs: UNVERIFIED | none (the value is social proof) | $10 + $2 per reader; others vary | **high** for conversion: 0 ratings on Amazon, Goodreads and Open Library | booksirens.com/pricing (19:04:32Z); netgalley.com/request_terms (19:04:32Z); booklife.com (~19:04Z); changelog (~18:54Z) |
| M6 | **Event listings** for online readings and workshops: Eventbrite, Luma | The site's `/events` says "No events are currently scheduled" (19:04:47Z). **Eventbrite:** "Publish unlimited free events at no cost"; paid tickets cost 3.7% + $1.79 per ticket plus 2.9% processing; it has a "discovery marketplace". **Luma:** live (HTTP 200); mechanics not read. A registration is an email lead | organizer profile link, `rel` UNVERIFIED; `utm_source=eventbrite&utm_medium=event` | free for free events | **medium-high**: a direct lead mechanism | eventbrite.com/organizer/pricing (~19:05Z); luma.com (19:03:25Z) |
| M7 | **Show HN** for the free interactive tools (`/belief-inquiry`, `/nervous-system-reset`, `/integration-reflection`) | "Show HN is for something you've made that other people can play with". Blog posts, sign-up pages and newsletters are excluded. "Please don't ask friends to upvote or comment." Product Hunt returned 403 (UNVERIFIED) | `rel` UNVERIFIED; `utm_source=hn&utm_medium=social` | free | low-medium: one-shot traffic spike; audience fit is uncertain | news.ycombinator.com/showhn.html (~19:03Z) |
| M8 | **Library ebook channel** (OverDrive/Libby through a distributor such as Draft2Digital) | Both homepages are live (HTTP 200). Whether the book can be added, and the terms: UNVERIFIED | catalog records, no link | UNVERIFIED | low-medium (library discovery and catalog records) | overdrive.com, draft2digital.com (19:03:25Z) |
| M9 | **Search Console Generative AI performance report**, plus web multimodal reporting | Measure appearances in generative AI features on Google Search. The multimodal reporting blog post was listed under September 2026; only its title was read | measurement | free | enabler | AI optimization guide (19:01:19Z); blog archive (19:01:35Z) |
| M10 | **VideoObject `creator`** (new 2026-09-24) | On any on-site video, set `creator` / `author` to the Person `@id` | on-site | free | low (entity) | Search updates changelog (19:08:20Z) |
| M11 | **Covered in other pioneer maps but missing from 06:** Reddit communities, Fireside Project, Psychedelic Support, Spotify / Apple Podcasts, StoryGraph, New Mexico program | Cross-reference only. Reddit `about.json` returned 403 at 19:02:56Z, so subscriber counts are UNVERIFIED | – | – | see 01 / 03 | GitHub `01-market-map.md`, `03-all-search-engines.md` (19:03:09Z) |

**Dead or do-not-use items found during this check**
- Reedsy Discovery at `reedsydiscovery.com`: the domain is parked (19:03:25Z).
- Google FAQ rich result: DEAD since 2026-05-07.
- Google Podcasts Manager: DEAD.

---

## 4. Not done / UNVERIFIED (from this check)

- **Knowledge panel:** whether one exists for "Maya Allan" (the Google results page cannot be read here).
- **Goodreads:** giveaway pricing; how to merge the two book records (whether authors can merge them directly or need a librarian).
- **Link types (`rel`) not read:** Open Library author links, YouTube channel links, Pinterest pins, Eventbrite, HN, Instagram, Threads, TikTok.
- **Blocked or JS-only pages:** Instagram, TikTok and Meta drug policies were not read. Medium profiles, Quora, BookBub, LibraryThing, Muck Rack, StoryGraph, Podchaser and Product Hunt returned 403. Reddit subscriber counts returned 403.
- **Oregon list:** the exact program count needs a line-by-line PDF parse. The figure of 13 came from WebFetch extraction.
- **Service status and terms:** HARO's current status; Luma, MatchMaker.fm and ORCID mechanics (the ORCID page is JS-only); library-distribution terms.
- **Amazon:** whether Author Central is already claimed (only the absence of an author-store link was observed); Amazon's rules on ARC reviews.
- **Not tested:** no fixes in this document were applied. Everything here is a finding, not a change.