# Pioneer map 06: open-web entity, profiles and link venues

- **Scope:** how a pioneer makes "Maya Allan" a recognised entity that search engines and AI assistants connect to https://www.mayaallan.com, and which open-web venues pass links, identity signals or leads.
- **Date:** 2026-09-24. Read window: 2026-09-24T18:24Z to 18:42Z (UTC).
- **Method:** only live reads. GET requests went to www.mayaallan.com, public pages and public APIs (Open Library, Wikidata, schema.org), official help and docs pages, and a check of the `rel` attribute on sample pages to see how links really come out. Nothing was posted, no accounts were created and no one signed in anywhere.
- **Read times:** each read time is the `date -u` stamp printed just before that fetch batch.
- **Sources:** every source is listed in §15 (companion file `06-open-web-entity-links-part2.md`).
- **UNVERIFIED:** means the page could not be reached live. Nothing was filled in from memory.

---

## 0. Where the entity stands today (live numbers)

| # | Signal | Live value | Source / read (UTC) |
|---|---|---|---|
| 1 | `sameAs` on the Person in the site JSON-LD | **1** (Instagram only) | mayaallan.com home + /about JSON-LD, 18:24:32Z / 18:24:42Z |
| 2 | Entity nodes on the site | Three separate nodes: `WebSite` (publisher = Person "Maya Allan"), `Organization` "Maya Allan" (founder = Person "Maya Allan") and `Person` (worksFor = that Organization). None has an `@id`, so there are 3 unlinked "Maya Allan" nodes | same |
| 3 | Book JSON-LD `/books/psilocybin-integration-guide` | `identifier` = ASIN B0G7JWDJYQ only. **No `isbn`, no `workExample` editions.** `sameAs` = 7 retailer or catalog URLs. `author` has no `@id` | 18:24:58Z / 18:25:08Z |
| 4 | Person description consistency | 3 different bios are live. (a) Person JSON-LD: "a writer dedicated to helping readers navigate life's most profound experiences…". (b) /about: "an author and educator focused on psilocybin integration…". (c) Google Books "About the author": "a devoted explorer of the sacred landscapes of the inner world…" | 18:24:32Z; 18:36:09Z; 18:37:25Z |
| 5 | Instagram @maya.allan66 | **18 followers, 1 following, 3 posts** | public profile meta, 18:33:53Z |
| 6 | Goodreads author 65134359 | **Unclaimed**: no "Goodreads Author" badge, no website, no bio. Book 245299940 has **0 ratings** | 18:26:39Z / 18:26:49Z |
| 7 | Open Library | Author OL16288546A exists but is bare (revision 1, created 2026-04-20; no bio, photo, links or Wikidata ID). Work OL45177926W, edition OL61601841M (ISBN-13 9798994148839), **0 ratings** | openlibrary.org JSON, 18:26:15Z / 18:26:29Z |
| 8 | Wikidata | **0 items** for "Maya Allan" and **0** for "Psilocybin Integration Guide" | wbsearchentities API, 18:26:15Z |
| 9 | Google Books HvafEQAAQBAJ | Live. ISBN **9798994148891**, 289 pp, publisher "Maya Allan", 2025. **0 links to mayaallan.com** | books.google.com about page, 18:37:25Z |
| 10 | Google Books API | UNVERIFIED (HTTP 429, anonymous daily quota exhausted) | 18:26:29Z |
| 11 | Bing: `"Maya Allan" psilocybin` | About 30,900 results (estimate). Top results: mayaallan.com, the book page, Google Books, amazon.com, amazon.ca (ASIN B0G765BZDL), ThriftBooks | bing.com SERP via WebFetch, ~18:37Z |
| 12 | Owned domains | psilowire.com and psilocybinintegrationguide.com (both with and without www) return **308 → https://www.mayaallan.com/** | 18:26:49Z |
| 13 | Site inventory | sitemap.xml has **38 URLs** (5 blog posts, 1 scenario page). `/media` is a gallery with 1 image and **no press kit or downloads** | 18:24:42Z, 18:39:11Z, 18:36:09Z |
| 14 | Google **Search profile** eligibility | Needs **10,000 followers** on YouTube, Instagram, X or TikTok, age 18+, US only. **Maya is at 18 → not eligible yet** | support.google.com/websearch/answer/16904498, ~18:33:30Z |

**What a pioneer sees:** the knowledge-graph skeleton already exists. Open Library, Goodreads, Google Books, Amazon, Bing and 7 retailers all hold a record of the book. Nobody has claimed or connected those records, and the site does not tie them together (Person `sameAs` = 1).

The cheapest win is to **claim, connect and reconcile identifiers** with one bio and one photo. After that, the effort goes into **earned links**, not more profiles:
- Profiles mostly pass nofollow or redirected links.
- Podcast show notes were observed to pass plain followed links.
- Link-earning assets bring links in from other sites.
- Google's newest publisher and creator surfaces (preferred sources, Search Console platform properties, Search profile at 10k followers) belong in the plan.

---


## 1. Google network: what is live, restricted or dead

| id | Google property | Status | Exact mechanics | Link / tag | Lead value | Source (updated · read) |
|---|---|---|---|---|---|---|
| web-g-sc | **Search Console + gen-AI inclusion** | live | Verify the mayaallan.com Domain property. Preferred sources needs the site "included in Search generative AI features in Search Console". The Search Console Insights "social channels" experiment started 2025-12-08. | n/a | enabler | preferred-sources doc (2026-09-18 · 18:34:02Z); blog 2025-12-08 (· 18:34:20Z) |
| web-g-platform | **Search Console platform properties** | live (global since 2026-07-29) | "Add and verify each of your accounts individually". Tracks Instagram, TikTok, X and YouTube posts across Google Search, Discover and News. | n/a | measurement | blog 2026-07-29; doc analyze-social-video-content (2026-07-29 · 18:39:11Z) |
| web-g-preferred | **Preferred sources** | live. Rolled out to all languages 2026-04-30, AI Mode / AI Overviews 2026-05-27, custom button 2026-08-20 | Readers pick the site as a preferred source, so it is "more likely to appear in Top Stories" and gets a "preferred" badge in AI Mode / AI Overviews. Only domain-level sites are eligible (www.mayaallan.com is). Button: `<script async src="https://news.google.com/swg/js/v1/publisher.js"></script>` + `<div google-add-preferred-source-btn></div>`. Deeplink: `https://www.google.com/preferences/source?q=mayaallan.com` | own site, newsletter, bios | low now. Grows with timely or news-style posts. **Whether mayaallan.com shows in the tool: UNVERIFIED** (the tool needs a signed-in Google session) | preferred-sources doc (2026-09-18 · 18:34:11Z); updates changelog (· 18:32:58Z) |
| web-g-profile | **Google Search profile** (profile.google.com/@handle) | restricted | Claim at profile.google.com/claim by linking at least one YouTube, Instagram, X or TikTok account. Needs 10k followers, age 18+, US only. It brings all platforms together, and followers make the linked content "more likely to appear … on Google Discover". A website badge is available (docs added 2026-09-16) | badge → profile | high later. **Not eligible now** (18 IG followers) | support 16904498 (· ~18:33:30Z); search-profiles doc (2026-09-16 · 18:33:16Z) |
| web-g-kp | **Knowledge panel claim** | live, conditional | Only works if a panel exists: "Claim this knowledge panel", then sign in to an official site or profile (YouTube, Search Console, Twitter, Facebook). "Not all knowledge panels are claimable." **Whether a panel exists for "Maya Allan": UNVERIFIED** (Google SERP not readable here) | n/a | medium (trust) | support 7534902 (· 18:28:37Z) |
| web-g-gbp | **Business Profile** | restricted | Eligible only if you have "a physical location that customers can visit, or travel to customers". Online-only book sales do not qualify. The profile also allows "No links of any type" in posts | none | n/a unless in-person events or services | support 3038177 (· 18:28:37Z) |
| web-g-books | **Google Books / Play Books** | live | The listing exists (ISBN 9798994148891). Fix the "About the author" bio to the canonical bio and add a website line. The self-serve route (Play Books Partner Center or the distributor) is UNVERIFIED: the play.google.com/books/publish page rendered no content | none observed | medium (entity + sales) | books.google.com (· 18:37:25Z); Partner Center page (· ~18:37:10Z) |
| web-g-bookactions | **Book Actions structured data** | restricted | Announced for phase-out 2025-06-12. In Nov 2025 Google "removed the deprecation banner … as there's still a feature using the markup". It is a daily **data feed** program meant for catalogs, not for one author's site | n/a | none | blog 2025-06-12 (· 18:32:45Z); changelog Nov 2025 (· 18:32:58Z); book doc (2025-12-10 · 18:28:15Z) |
| web-g-faq | **FAQ rich result** | **DEAD** in Google Search since 2026-05-07 | Keep the FAQPage JSON-LD (other engines and AI can read it), but **expect no Google FAQ rich result** | n/a | none | changelog "Deprecating the FAQ rich result feature… starting May 7, 2026" (· 18:32:58Z) |
| web-g-podcasts | **Google Podcasts / Podcasts Manager** | **DEAD** | The page says "Google Podcasts Manager is no longer available" and points to YouTube RSS upload instead. Shutdown date: not read live | n/a | none | music.youtube.com/googlepodcastsmanager (· 18:29:45Z) |
| web-g-ytrss | **YouTube podcast via RSS** | live (select regions) | YouTube Studio → submit the RSS feed. YouTube makes a static-image video per episode and auto-uploads new ones. Fits audiobook excerpts and readings | channel links (see web-youtube) | medium | support.google.com/youtube/answer/13525207 (· ~18:30Z) |
| web-g-alerts | **Google Alerts** | live | Alert on `"Maya Allan"`, `"Psilocybin Integration Guide"` and `mayaallan.com -site:mayaallan.com` to find unlinked mentions | n/a | enabler | google.com/alerts HTTP 200 (· 18:37:36Z) |
| web-g-ads | **Google Ads** | restricted | Policy: "Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed." Integration or education framing is not addressed explicitly, so treat it as high-risk | n/a | risky | support 6014299 (· 18:38:28Z) |
| web-g-aiguide | **Google AI optimization guide** | live (2026-07-10) | LLMS.txt: "Google Search ignores them" (the site's llms.txt is fine for other systems). Structured data "isn't required for generative AI search". "Seeking inauthentic 'mentions' … isn't as helpful as it might seem" | n/a | guidance | ai-optimization-guide (2026-07-10 · 18:37:59Z) |
| web-g-blogger | Blogger / Google Sites | live, not recommended | Blogger and Google Sites are live. A mirror site there adds doorway and duplicate-content risk (§13) and no new entity signal | nofollow status not checked | none | HTTP 200 (· 18:37:36Z) |

---


## 2. Identity and profile venues: exact mechanics

**"Observed rel"** means the `rel` value actually read from a live sample page of that platform at the given time. Where no sample could be fetched, the value is UNVERIFIED.

| id | Venue | How to get in or claim | Link back (observed rel) | sameAs? | Cost · effort | Lead value | Status · source (· read) |
|---|---|---|---|---|---|---|---|
| web-goodreads | **Goodreads Author Program** | Desktop: sign in, search the book by ISBN or ASIN, click the author name, then "Is this you? Let us know!" at the bottom of the author page. Approval comes by email. You get the badge, bio, photo, blog, Ask the Author and giveaways | Sample author page: official website link `rel="noopener noreferrer"` (**no nofollow**) | yes | free · 30 min | **medium-high** (the readers are here) | live · goodreads.com/author/program (· 18:32:00Z); sample rel (· 18:31:00Z) |
| web-openlibrary | **Open Library author OL16288546A** | Wiki-style editing with a free account: add bio, photo, website and the Wikidata ID. Help page: link "the Wikidata author ID to the Open Library author page" and back | Sample author page served a bot check. rel UNVERIFIED | yes | free · 20 min | low-medium (feeds catalogs and AI) | live · openlibrary.org/help/faq/editing (· 18:38:51Z) |
| web-googlebooks | **Google Books listing** | Change the bio at the source (Partner Center or distributor: UNVERIFIED which one) | none (0 links to the site) | yes (Book) | free · 15 min | medium | live · (· 18:37:25Z) |
| web-amazon | **Amazon Author Central** | UNVERIFIED: author.amazon.com is JS-only and the product page returned HTTP 500 to fetches | UNVERIFIED | yes once claimed | free · 30 min | **high** (sales) | unverified (· 18:32:00Z) |
| web-instagram | **Instagram @maya.allan66** (exists) | Professional account. Add it as a Search Console platform property. It is one of the 4 platforms that can qualify for a Google Search profile | UNVERIFIED (bio links go through Instagram's redirect; rel not readable) | yes (already) | free · ongoing | medium (18 followers today) | live · (· 18:33:53Z) |
| web-youtube | **YouTube channel** | "Up to 14 links" on the channel; the "first link will be prominently displayed" next to Subscribe. Also a podcast RSS path (web-g-ytrss). Counts toward Search profile eligibility | description and link rel UNVERIFIED | yes | free · high (video) | **high** (Google-owned; path to the Search profile) | live · support 2657964 (· ~18:36:30Z) |
| web-pinterest | **Pinterest + claimed website** | Business account recommended. Claim by HTML tag, HTML file or DNS TXT ("up to 72 hours"). Pins from the site then show her avatar and a Follow button, plus analytics | Pin link rel UNVERIFIED | yes | free · 30 min | medium (journal and workbook visuals) | live · help.pinterest.com claim-your-website (· ~18:36:30Z) |
| web-bluesky | **Bluesky with the domain as handle** | Set the handle to `mayaallan.com` via DNS TXT `_atproto` = `did=did:plc:…`, or `https://mayaallan.com/.well-known/atproto-did`. The domain itself becomes the identity. Wikidata property **P12361** "Bluesky handle" | profile page SSR has no links (JS app); rel UNVERIFIED | yes | free · 20 min | low-medium | live · bsky.social tutorial 2023-04-28 (· ~18:36:30Z) |
| web-mastodon | **Mastodon / fediverse** | Profile link verification: the site page must link back to the profile with `rel="me"`. For article attribution add `<meta name="fediverse:creator" content="@user@server">` | Mastodon "puts rel=me" on profile links. Nofollow status not documented | yes | free · 20 min | low | live · docs.joinmastodon.org/user/profile (· ~18:36:30Z) |
| web-gravatar | **Gravatar profile** | Free profile with verified accounts and links | `rel="me nofollow noreferrer"` (observed) | yes | free · 10 min | low (identity only) | live · gravatar.com/matt sample (· 18:31:00Z) |
| web-linktree | **Linktree-type bio page** | Free page used as the bio link | `rel="noopener noreferrer"` (observed, no nofollow) | no (it is a hub, not an identity) | free · 10 min | low. Better to point bio links at a /links page on mayaallan.com so clicks stay first-party | live · linktr.ee sample (· 18:36:44Z) |
| web-substack | **Substack** | Free newsletter plus archive | Links inside posts: **no rel (followed)**. Post canonical points to itself on Substack (see §6) | yes | free · weekly | **high** (email = leads) | live · on.substack.com posts (· 18:31:35Z) |
| web-linkedin | **LinkedIn profile + articles** | Articles: any member, desktop only. You can set an SEO title and description for each article | profile and article rel UNVERIFIED (not fetchable) | yes | free · 1 h | medium (press, podcasters, clinicians) | live · linkedin help a522427 ("updated 1 month ago" · ~18:31:50Z) |
| web-x / web-threads / web-tiktok / web-facebook | X, Threads, TikTok, Facebook Page | Profile and bio link. X, TikTok and Instagram are Search-profile platforms. TikTok and Meta **drug-content rules: UNVERIFIED** (policy pages returned no readable text) | UNVERIFIED (X help returned 403) | yes | free · high | varies | unverified (· 18:36:44Z / 18:38:37Z) |
| web-medium | Medium | UNVERIFIED: help and post pages returned 403 (`noindex,nofollow` bot wall) | UNVERIFIED | yes | free | low | unverified (· 18:31:35Z) |
| web-quora | Quora | UNVERIFIED (profile returned 403) | UNVERIFIED | yes | free | low-medium | unverified (· 18:31:00Z) |
| web-muckrack | Muck Rack | UNVERIFIED (403 or 404) | UNVERIFIED | – | – | low | unverified (· 18:31:00Z / 18:36:44Z) |
| web-bookbub / web-librarything | BookBub author page / LibraryThing author | UNVERIFIED (403) | UNVERIFIED | yes | free | medium (BookBub readers) | unverified (· 18:31:00Z) |
| web-aboutme | About.me | Homepage is live (200). Profile mechanics UNVERIFIED | UNVERIFIED | optional | free | low | live homepage (· 18:36:44Z) |
| web-isni | **ISNI** (author identifier) | Only through a Registration Agency, which charges "fees to cover operating costs". Wikidata **P213** | n/a | yes (ID) | paid · low | low (authority-file strength) | live · isni.org FAQ (· ~18:36:30Z) |

---


## 3. Wikidata and Wikipedia: eligibility (cited)

**Wikidata (web-wikidata): conditional**
- **Notability** (page last edited 2026-09-12). An item is notable if it meets any one of these:
  1. It has a sitelink to a Wikimedia page.
  2. It refers to "a clearly identifiable conceptual or material entity that can be described using serious and publicly available references".
  3. It fulfils a structural need.
- **Self-editing:** Wikidata:Autobiography (edited 2025-03-30) says "In general on Wikidata it is allowed to edit the data item about yourself", but the item must meet notability. Statements "must be sourced to a reliable, verifiable source". Paid editing must be declared.
- **What exists now:** ISBN-13 records on Open Library, Goodreads and Google Books make the **book** a clearly identifiable entity. That arguably meets criterion 2, but the community can still file a deletion request.
- **Recommendation:**
  1. First earn one independent reference, such as a podcast episode page or a review.
  2. Then create a **work item** (instance of *written work*, per WikiProject Books, edited 2026-09-22) and an **author item**. Use only external IDs and sourced facts.
- **Properties, verified live via the API (· 18:36:07Z):**

| Property | ID |
|---|---|
| official website | P856 |
| Goodreads author ID | P2963 |
| Open Library ID | P648 |
| Amazon author ID | P4862 |
| Google Books ID | P675 |
| ISBN-13 | P212 |
| author | P50 |
| Instagram username | P2003 |
| YouTube channel ID | P2397 |
| Bluesky handle | P12361 |
| ISNI | P213 |
| VIAF | P214 |
| LC Authorities | P244 |
| LinkedIn personal profile ID | P6634 |

- **Payoff:** Open Library says reading stats improve when "the Wikidata and Open Library author pages know about each other".

**Wikipedia (web-wikipedia): not realistic now**
- **Notability rule:** people are notable after "significant coverage in multiple published secondary sources that are reliable, intellectually independent of each other, and independent of the subject" (edited 2026-09-16).
- **Author criteria:** "widely cited by peers", "originating a significant new concept", "significant critical attention", among others.
- **Evidence:** no independent significant coverage turned up in this session.
- **Conflict of interest:** "generally refrain from creating articles about yourself … unless through the Articles for Creation process". People with a COI are "strongly discouraged from editing affected articles directly".
- **Verdict:** do not attempt. Revisit only after several independent reviews or press articles exist.

---

## 4. On-site entity graph: current → target

**Current state (live, 18:24–18:25Z)**
- There are 3 unlinked "Maya Allan" nodes (Person, Organization, WebSite publisher).
- Person `sameAs` has 1 entry.
- The Book has no ISBN.
- The Article author has no `@id`.
- The /about page is not marked up as a `ProfilePage`.

**Schema.org definitions (live vocabulary, · 18:41:26Z)**
- `sameAs` = "URL of a reference Web page that unambiguously indicates the item's identity. E.g. … Wikipedia page, Wikidata entry, or official website."
- `workExample` = "E.g. the paperback edition, first edition, or e-book".
- `BookFormatType` = AudiobookFormat, EBook, GraphicNovel, Hardcover, Pamphlet, Paperback.

**Google ProfilePage (doc 2026-09-08)**
- Valid on "'About Me' pages on blogs".
- Needs `mainEntity` (Person) with `name`.
- Recommended: `sameAs`, `image`, `description`, `alternateName`, `identifier`.

**Target graph** (one Person `@id` reused everywhere; retailer URLs move from `sameAs` to edition `url`/`offers`; identity pages stay in `sameAs`):

```json
{"@context":"https://schema.org","@graph":[
 {"@type":"ProfilePage","@id":"https://www.mayaallan.com/about#page","url":"https://www.mayaallan.com/about",
  "mainEntity":{"@id":"https://www.mayaallan.com/#person"}},
 {"@type":"Person","@id":"https://www.mayaallan.com/#person","name":"Maya Allan","url":"https://www.mayaallan.com/",
  "image":"<one canonical headshot URL>","description":"<canonical 50-word bio>","jobTitle":"Author and Educator",
  "sameAs":["https://www.instagram.com/maya.allan66/","https://www.goodreads.com/author/show/65134359.Maya_Allan",
   "https://openlibrary.org/authors/OL16288546A","<YouTube>","<Bluesky/LinkedIn/Pinterest as created>","<Wikidata Q-id when it exists>"]},
 {"@type":"Book","@id":"https://www.mayaallan.com/books/psilocybin-integration-guide#work",
  "name":"Psilocybin Integration Guide","author":{"@id":"https://www.mayaallan.com/#person"},
  "sameAs":["https://www.goodreads.com/book/show/245299940-psilocybin-integration-guide","https://openlibrary.org/works/OL45177926W"],
  "workExample":[
   {"@type":"Book","bookFormat":"https://schema.org/Paperback","isbn":"9798994148839"},
   {"@type":"Book","bookFormat":"https://schema.org/EBook","isbn":"9798994148891"},
   {"@type":"Book","bookFormat":"https://schema.org/AudiobookFormat","isbn":"<when issued>"}]}
]}
```

**Notes**
- **Edition check:** the ISBN-to-format mapping above is inferred and must be confirmed before shipping. The paperback ISBN appears on retailer URLs and the Open Library edition. 9798994148891 appears on Google Books, which is ebook-first.
- **Organization node:** make the `Organization` either a distinct imprint name with its own `@id`, or delete it. A Person and an Organization with the same name and no `@id`s make disambiguation harder.
- **Scope:** these are site code changes and belong in a PR. This map changes nothing.

---


## 5. Consistent identity kit and press page (web-presskit)

**Identity kit**
- One name string: "Maya Allan".
- One headshot file, reused as JSON-LD `image`, Goodreads, Open Library, Gravatar and every social avatar.
- One canonical bio in three lengths (25, 50 and 150 words), pasted verbatim everywhere. Today there are 3 different bios (§0 row 4).

**`/press` page** (today `/media` has no press kit)
- Bios in the three lengths.
- Headshot and cover as downloadable JPGs.
- ISBNs and formats, publication date, page count.
- 5 interview topics and 10 sample questions.
- A one-line non-clinical disclaimer.
- Contact.
- "As heard on" links, which grow with podcasts.
- Mark it up as `WebPage` with `about` → `#person`.

**Why it drives leads:** podcast bookers and journalists need this page to say yes quickly. It is the cheapest lead multiplier on this list.

---

## 6. Syndication: current rules

**Google's rule** (canonicalization troubleshooting, updated 2026-08-21, · 18:28:03Z): "The canonical link element is not recommended for those who want to avoid duplication by syndication partners, because the pages are often very different. The most effective solution is for partners to block indexing of your content." So cross-domain `rel=canonical` is **not** a reliable syndication tool for Google.

**Substack** (web-substack)
- Live posts carry a self-referencing canonical, and their links carry no `rel` (· 18:31:35Z).
- A full copy on Substack therefore competes with the site article.
- Pattern to use: post on the site first, then send a Substack issue that is an original note (why the piece matters, 2 to 3 paragraphs) with a followed link to the full article.

**Medium** (web-medium): the import tool and canonical behaviour are **UNVERIFIED** (403). Do not rely on Medium canonicals until verified.

**LinkedIn articles** (web-linkedin): per-article SEO title and description exist. Canonical support is **UNVERIFIED**. Use the same excerpt-plus-link pattern.

**Fediverse:** add `fediverse:creator` meta to articles so link previews credit the author (Mastodon docs, · ~18:36:30Z).

---

## 7. Guest posts and podcast show notes (the real link and lead engine)

| id | Venue | Mechanics (live) | Link type observed | Lead value | Source (· read) |
|---|---|---|---|---|---|
| web-pod-pt | **Psychedelics Today** podcast | Episode pages carry detailed show notes. Example: 2026-08-12 episode "Psychedelic harms & post-psychedelic challenges" | **19 non-social outbound links, all without rel (followed)**, e.g. psychedelicchallenges.org | **high** (topic-adjacent audience; integration is their subject) | psychedelicstoday.com (· 18:36:58Z) |
| web-pod-3w | **Third Wave** podcast | Episode 374 show notes link out to guest resources | **9 links, no rel (followed)** | high | thethirdwave.co (· 18:36:58Z) |
| web-dir-3w | Third Wave directory | "Register for free" at /directory/get-listed/. Categories: retreats, clinics, therapists, coaches, plus a "Vetted provider" tier. **Fit is doubtful** for a non-clinical author/educator | UNVERIFIED | low-medium | (· ~18:35:20Z) |
| web-guest-tripsitter | Tripsitter "Write for us" | Topics include philosophical think pieces and microdosing. "We do not accept requests for sponsored posts". They may strip product links. Page last updated 2022-06-02 (stale) | UNVERIFIED | low | tripsitter.com/write-for-us (· ~18:35:20Z) |
| web-guest-chacruna | Chacruna | Menu has "Contribute". The guidelines URL tried returned 404, so **UNVERIFIED** | UNVERIFIED | medium (credibility) | chacruna.net (· 18:35:44Z) |
| web-pod-other | Other shows | Pitch using the press page. Ask for the site link plus one tool link (journal or glossary) in show notes, with UTMs | usually followed (2/2 samples) | high | – |

**Pitch angle a pioneer uses:** "40 real scenarios" plus a research-honest explainer. The live article `/blog/psilocybin-integration-research` cites **13 DOI/PubMed/PMC sources** (· 18:24:58Z). The pitch is a practical post-journey framework that is explicitly non-clinical. That fits the "post-psychedelic challenges" theme these shows already cover.

---

## 8. .edu / .org / .gov citations (realistic paths)

| id | Path | Mechanics | Realism | Source (· read) |
|---|---|---|---|---|
| web-edu-ops | **Oregon-approved facilitator training programs** | OHA publishes a "List of Training Programs with Approved Curriculum" (PDF updated 2026-09-02). Offer the free Integration Journal and the glossary to program directors as a student supplement (they cite and link resources) | medium. The program count was not parsed (PDF only) | oregon.gov OHA training-program-approval (· 18:39:54Z) |
| web-edu-lib | **Library catalogs** | The Open Library record exists. WorldCat and LC records are UNVERIFIED. Library guides (LibGuides) on psychedelics were **not found** this session (search engines were unreliable) | low-medium | (· 18:37:36Z) |
| web-edu-research | Research centres (hopkinspsychedelic.org, psychedelics.berkeley.edu; both live, HTTP 200) | They link to research, not self-help. Only realistic through original data (§9) | low | (· 18:34:57Z) |

---


## 9. Link-earning assets (build once, earn repeatedly)

| id | Asset | Current state (live) | Pioneer move | Spam-policy guardrail |
|---|---|---|---|---|
| web-asset-glossary | Glossary (`DefinedTermSet`, ~25 terms) | live (/glossary, · 18:24:42Z) | Stable per-term anchors, plus an **embeddable term card** (copy-paste HTML) that credits "Glossary by Maya Allan" | Google lists "Keyword-rich, hidden, or low-quality links embedded in widgets" as link spam. Use a **branded, visible** credit link only |
| web-asset-journal | 7-day Integration Journal PDF | live (/integration-journal) | Offer it as a free OER to training programs (web-edu-ops) and podcast listeners | none |
| web-asset-research | Memory-reconsolidation research explainer (13 citations) | live | Send it as a reference to journalists and podcast hosts. Refresh it yearly (dateModified 2026-09-05) | none |
| web-asset-survey | **Original data:** anonymous "life after a psilocybin experience" reader survey | not started | Publish only aggregated results. Collect no personal data or identifiers (drug use is sensitive). Release the dataset with a DOI on Zenodo (zenodo.org live, HTTP 200, · 18:41:08Z). Original numbers are what journalists and .edu pages actually cite | disclose method; no incentivised links |
| web-asset-scenarios | 40 scenarios as individual pages | 1 live (/scenarios/ego-dissolution) | Add pages only if each is substantive | "Scaled content abuse": many pages "for the primary purpose of manipulating search rankings" |

---

## 10. Unlinked-mention reclamation (web-mentions)

1. **Own-controlled mentions first.** These records exist today with no link to the site:
   - Goodreads author page: unclaimed, no website.
   - Open Library author: bare record.
   - Google Books: 0 site links and a mismatched bio.
   - Amazon Author Central: UNVERIFIED.
2. **Monitoring:** Google Alerts and Talkwalker Alerts (both live, · 18:37:36Z), plus a monthly Bing check of `"Maya Allan" psilocybin` (about 30.9k results estimated today). One Bing result pointed to a third-party book page (barwebooks.com). The guessed URL returned 404, so it is not verified.
3. **Outreach:** only ask for a link where the mention is about her or the book. Google warns that seeking inauthentic mentions "isn't as helpful as it might seem" (AI optimization guide, 2026-07-10).

---

## 11. Other search engines (entity and indexing)

| id | Engine or tool | Mechanics | Source (· read) |
|---|---|---|---|
| web-bing-wmt | Bing Webmaster Tools | Verify the site, submit sitemap.xml (38 URLs) | bing.com/webmasters/about, HTTP 200 (· 18:37:36Z) |
| web-indexnow | **IndexNow** | Host a key file at `https://www.mayaallan.com/<key>.txt`, then ping on publish. Supported by Bing, Amazon, Naver, Seznam.cz, Yandex and Yep. **Google does not participate.** "Submitting a URL does not guarantee immediate indexing" | indexnow.org/faq (· ~18:36:30Z) |

---

## 12. UTM naming convention (for every venue above)

`?utm_source=<venue>&utm_medium=<type>&utm_campaign=<name>[&utm_content=<placement>]`

**Rules**
- Lowercase and hyphens only; no spaces.
- **Never put UTMs in `sameAs`, Wikidata, schema or canonical URLs.**
- Never put UTMs on internal links.
- The site already emits self-referencing canonicals, e.g. `/books/psilocybin-integration-guide` and the blog post (· 18:24:58Z), so UTM variants consolidate.

**Allowed values**

| Parameter | Allowed values |
|---|---|
| utm_source | `goodreads`, `openlibrary`, `googlebooks`, `amazon-author`, `instagram`, `youtube`, `tiktok`, `x`, `threads`, `facebook`, `linkedin`, `pinterest`, `bluesky`, `mastodon`, `substack`, `medium`, `quora`, `gravatar`, `linktree`, `pod-<show-slug>`, `guest-<site-slug>`, `dir-<name>`, `edu-<org-slug>`, `press-kit` |
| utm_medium | `profile`, `social`, `podcast`, `guest-post`, `directory`, `syndication`, `embed`, `email`, `press`, `qr` |
| utm_campaign | `entity-2026q4`, `book-evergreen`, `audiobook-launch`, `journal-oer`, `glossary-embed`, `survey-2026` |
| utm_content | `bio-link`, `first-link`, `show-notes`, `author-bio`, `pinned-post`, `term-card` |

**Example:** `https://www.mayaallan.com/integration-journal?utm_source=pod-psychedelics-today&utm_medium=podcast&utm_campaign=journal-oer&utm_content=show-notes`

---

## 13. Tag / link matrix

| Venue | Where the link lives | Link type (observed) | UTM | In site `sameAs`? |
|---|---|---|---|---|
| Goodreads author | Website field | followed (no nofollow) on a sample page | `goodreads/profile/entity-2026q4` | **yes** (after claim) |
| Open Library author | Links and Wikidata field | UNVERIFIED | none (identity page) | **yes** |
| Google Books | Bio text | no link | – | Book `sameAs`: optional |
| Amazon author | Author page | UNVERIFIED | – | yes (after claim) |
| Instagram | Bio links | UNVERIFIED (redirected) | `instagram/profile/…/bio-link` | **yes** (already) |
| YouTube | Channel links (≤14) and descriptions | UNVERIFIED | `youtube/profile` or `youtube/social` | yes |
| Pinterest | Pins from the claimed site | UNVERIFIED | `pinterest/social` | yes |
| Bluesky | Handle = domain | identity via DNS | – | yes |
| Mastodon | Profile metadata | `rel=me` | `mastodon/profile` | yes |
| Gravatar | Profile links | `me nofollow noreferrer` | `gravatar/profile` | optional |
| Linktree-type | Link list | `noopener noreferrer` | `linktree/profile` | **no** |
| Substack | Post body | followed (no rel) | `substack/email` | yes |
| LinkedIn | Profile and articles | UNVERIFIED | `linkedin/profile` or `linkedin/syndication` | yes |
| Podcast show notes | Episode page | followed (2/2 samples) | `pod-<slug>/podcast/…/show-notes` | no |
| Guest post | Author bio | UNVERIFIED per site | `guest-<slug>/guest-post` | no |
| Training-program OER | Resource list | UNVERIFIED | `edu-<slug>/directory/journal-oer` | no |
| Glossary embed | Third-party pages | branded credit link | `…/embed/glossary-embed/term-card` | no |
| Wikidata | P856 official website | – (identity) | **none** | **yes** (when the item exists) |

---


## 14. Spam-policy red lines (Google spam policies, last updated 2026-08-28, · 18:27:20Z)

**Link spam: do not**
- Buy or sell links "for ranking purposes".
- Run "excessive link exchanges".
- Use "automated programs".
- Publish "advertorials … where payment is received for articles that include links". If any placement is paid, mark it `rel="sponsored"` (qualify-outbound-links doc, 2025-12-10).
- Chase "low-quality directory or bookmark site links".
- Put keyword-rich links in widgets.
- Place "widely distributed links in the footers or templates".
- Leave "forum comments with optimized links".

**Other policies**
- **Site reputation abuse:** do not publish third-party-style content on a big host mainly to borrow its ranking. Google updated enforcement (EEA split) on 2026-08-28 (blog, · 18:34:20Z).
- **Expired domain abuse:** do not buy expired psychedelic domains to redirect or repurpose.
- **Doorway abuse:** psilowire.com and psilocybinintegrationguide.com correctly 308 to the home page today. Keep them as redirects, or give them genuinely distinct content, but **never thin keyword doorways**.
- **Scaled content abuse:** applies to the 40-scenario expansion (§9).
- **Newest policy:** Google added a spam policy for "back button hijacking" in 2026-04. Only the blog title was read.

---

## 14a. 30-day pioneer sequence (ordered by leverage)

| Week | Actions (ids) | Expected effect on leads |
|---|---|---|
| 1 | web-presskit (one bio, one photo, `/press`); site schema graph as a PR (§4); web-goodreads claim; web-openlibrary edit; web-googlebooks bio fix; web-g-sc verify + gen-AI inclusion check | indirect (trust, entity). Unblocks podcast pitching |
| 2 | web-g-platform (Instagram); web-g-preferred deeplink on site and newsletter; web-bing-wmt + web-indexnow; web-g-alerts; web-pinterest claim; web-bluesky domain handle | measurement plus small discovery lift |
| 3 | 10 podcast pitches (web-pod-*) with UTM'd show-notes links to the journal and the book; web-substack cadence starts | **direct leads** (email sign-ups, book clicks) |
| 4 | web-asset-glossary embed card; web-edu-ops outreach with the journal as OER; design web-asset-survey; web-wikidata only once one independent reference exists | links compound; .org/.edu citations possible |
| later | web-g-profile once any platform reaches 10k followers; web-youtube as the main growth channel toward that threshold | Discover distribution |

---

**Continued:** §15 Sources and §16 Not done / UNVERIFIED are in [`06-open-web-entity-links-part2.md`](06-open-web-entity-links-part2.md).