# Pioneer map 04: the book ecosystem, part 2 of 2

Continues `04-book-ecosystem.md`, which has the baseline, defects D1-D8, the market view and venues 2A-2D. All reads were live on 2026-09-24, 18:24Z-18:49Z UTC. Sources S1-S52 are in section 9 below.

### 2E. Audiobook (in production: choose the rights path before release)

| id | Venue | Status | Mechanics (live) | Link-back | Lead value |
|---|---|---|---|---|---|
| book-acx | ACX (Audible, Amazon, Apple) | live; help pages 404/308 | KDP: "earn royalties of **up to 40%**" (S18). The exclusive vs non-exclusive split is **UNVERIFIED** (help.acx.com is JS-only). | none | medium (Audible reach) |
| book-kdp-virtual-voice | KDP audiobooks with virtual voice | **restricted** (invite-only beta, US) | Free. List price **$3.99-$14.99**. **40%** royalty. Needs an NCX/interactive TOC (S17). | none | low (the human narration already underway is better) |
| book-spotify-authors | Spotify for Authors | live | "Self-published authors can now distribute directly to Spotify" (blog post dated **2025-08-01**). Offers author profiles, listener age/gender insights and **redemption codes**. Optional wider distribution via Voices by INaudio. Royalty % UNVERIFIED (S22). | author profile (link field UNVERIFIED) | **medium-high**: redemption codes work as a lead magnet, and the demographics show who the audience is |
| book-voices-inaudio | Voices by INaudio (**formerly Findaway Voices by Spotify**) | live | findawayvoices.com now serves a "Redirecting…" page to **voicesbyinaudio.com**. "Non-exclusive", "set your own prices", "major retail… library and educational channels". Fees UNVERIFIED (S21). | none | medium-high (libraries plus wide retail) |
| book-findaway-brand | "Findaway Voices" brand | **DEAD as a brand** | Redirects to Voices by INaudio (S21). Do not cite it as a destination. | n/a | n/a |
| book-google-autonarration | Google Play auto-narrated audiobooks | live (beta) | "no program fee" during beta. The audiobook can be downloaded and sold elsewhere, **but must also be on sale on Google Play in every country where it is sold elsewhere**, and the Play price must not be higher (S23). | Google Books page | low-medium |
| book-apple-narration | Apple Books digital narration | live | Offered on Apple Books for Authors; eligibility not shown (S48). | none | low-medium |
| book-chirp / book-kobo-audio | Chirp deals; Kobo audio | **UNVERIFIED** (Chirp for-authors URL 404; Kobo 403) | n/a | n/a | n/a |

**Decision to make before the audiobook launches:** ACX exclusive locks the audio edition to Audible, Amazon and Apple. Wide distribution (Spotify for Authors + Voices by INaudio) reaches Spotify, libraries and other retailers. For *leads*, wide wins: Spotify redemption codes and library listeners both hear a spoken call to action, e.g. `mayaallan.com/listen`, which should redirect to `?utm_source=audiobook&utm_medium=spoken-cta&utm_campaign=pig-audio`.

### 2F. Catalogs and the knowledge graph (entity SEO / AI citation)

| id | Venue | Status | Mechanics (live) | Link-back | Lead value |
|---|---|---|---|---|---|
| book-open-library | Open Library | live (listed) | The author record OL16288546A has **no links** (S2). Author records support a `links` field (example: the Pollan record has `links: michaelpollan.com` plus `remote_ids` for wikidata/viaf/isni, S51). It is a wiki, and any logged-in user can edit. Once D1 is fixed, add the paperback, hardcover and ebook as separate editions. | Yes (links field; rel UNVERIFIED) | medium |
| book-wikidata | Wikidata | live; **no items** (S46) | Notability criterion: *"It refers to an instance of a clearly identifiable conceptual or material entity that can be described using serious and publicly available references"* (page rev. 2026-09-12). A book with an ISBN, an Open Library record and retailer listings is commonly itemized. Disclose the conflict of interest, or let a third party create the items. | `official website` (P856) statement | medium (feeds knowledge panels and LLM graphs) |
| book-google-books | Google Books | live (Play listing) | Book actions ("Buy" rich results) are **"limited to book providers that have filled out the interest form and have been onboarded"** (S43), so they are not available to an author site. The Google Books Preview Program shows "the links of major book retailers" (S23). | Google Books page | medium |
| book-storygraph | The StoryGraph | live; **book absent** (S39) | Add the book via a reader account. The author-claim page is Cloudflare-blocked (UNVERIFIED). | UNVERIFIED | low-medium |
| book-librarything | LibraryThing | **UNVERIFIED** (Cloudflare 403, S38) | n/a | n/a | n/a |

### 2G. Reader discovery, reviews and newsletter swaps

| id | Venue | Status | Mechanics (live) | Cost (live) | Link-back | Lead value |
|---|---|---|---|---|---|---|
| book-goodreads-author | Goodreads Author Program | live | "Any author… can join… for free". "claim their profile page". "Run a giveaway, connect your blog, advertise your books". Also Ask the Author (S29). | $0 | Site/blog link on the profile (rel UNVERIFIED): `?utm_source=goodreads&utm_medium=profile&utm_campaign=author-profile` | **high** |
| book-goodreads-giveaways | Goodreads Giveaways | live; price **UNVERIFIED** (behind login) | "People who mark your book as Want to Read are automatically notified of future Giveaways" (S29) | UNVERIFIED | via the book page | medium |
| book-goodreads-listopia | Goodreads Listopia | live | No list exists for psilocybin or psychedelic integration (S45). A reader or partner should create a list of genuine integration books, including other authors. Author self-voting rules UNVERIFIED. | $0 | n/a | medium |
| book-bookbub-profile | BookBub author profile | live | The Partners site offers "Claim an Author Profile" and "Create a Free Author Website" (S30). | $0 | UNVERIFIED | medium |
| book-bookbub-deal | BookBub Featured Deal | live | **Advice and How-To:** $629 free / **$784 at $0.99** / $1,454 $1-2 / $2,115 $2-3 / $2,958 $3+. **650,000+** subscribers. **2,000-3,500** clicks at $0.99-$3+. **Religion and Spirituality:** $353 / $439 / $820 / $1,190 / $1,664; 470,000+; 1,375-2,200 clicks. **General Nonfiction:** $457 / $621 / $1,135 / $1,639 / $2,293; 1,070,000+; 2,000-3,500 (S30). Acceptance criteria not read (UNVERIFIED). | as listed | none | high **after** reviews exist |
| book-netgalley | NetGalley | live | "A per-title listing fee, available for self-published authors". Backlist is allowed ("already been published"). Also offered through the IBPA member program. Price: "Reach out" (UNVERIFIED). Reaches reviewers, librarians, booksellers, educators and media (S33). | contact | none | medium-high (librarians + media) |
| book-booksirens | BookSirens | live | "$10 per ARC + $2 per Reader", promoted for 3 months; or the "Author" plan at **$100/yr**; "You are NOT paying readers for reviews" (S31). | $10 + $2/reader | none | high (reviews) |
| book-hidden-gems | Hidden Gems Books ARC | live | Accepts **Self-Help, General Non-Fiction, Faith/Spirituality**. $20 deposit covers 1-10 readers, then $3/reader up to 140; MAX $400; 50-reader minimum. So **50 readers is about $140**. Claims ">80%" review rate. Price table dated "updated as of Sept 20, 2018" (still shown live) (S32). | ~$140-$400 | none | high (reviews) |
| book-booksprout | Booksprout | live (JS app); plans **UNVERIFIED** | n/a | UNVERIFIED | none | medium |
| book-bookfunnel | BookFunnel | live | First-Time Author **$30/yr** (1 pen name, 500 downloads/mo, group promos, author swaps). Mid-List **$200/yr** (5,000 downloads, secure ARC delivery). Bestseller **$300/yr** (S31). | $30-$300/yr | Landing pages link to the site | **high**: reader-magnet ebooks deliver to email capture |
| book-storyorigin | StoryOrigin | live | Standard **$10/mo or $100/yr**: group promos, newsletter swaps, collect reader emails, affiliate tags (S31). | $100/yr | landing pages | high (list growth) |
| book-readers-favorite | Readers' Favorite | live | "Get a Free Review of Your Book". 5-star reviews get a seal (S41). | $0 option | review page | low-medium |
| book-kirkus-indie | Kirkus Indie | live | Traditional review from **$450** (7-9 weeks), expedited $599. The author can choose not to publish a negative review (S41). | $450+ | Kirkus page | low-medium |

### 2H. Psychedelic and wellness media (book-specific formats)

| id | Venue | Status | What is there (live) | Next step | Lead value |
|---|---|---|---|---|---|
| book-chacruna | Chacruna | live | A search for "book review" returns *Book Launch* posts and "20 Best Books About Peyote and Mescaline" lists (S42). | Pitch an integration-books roundup, or a book-launch post. Submission rules UNVERIFIED. | medium |
| book-maps | MAPS | live | Runs a store "Bookshop" and gives away a free **MAPS Integration Workbook** ("Get Your Free Guide"). The workbook is an email-capture model in Maya's exact topic (S42). | Study it as a benchmark. Whether indie titles can be listed is UNVERIFIED. | medium (benchmark) |
| book-psychedelics-today | Psychedelics Today | live | A search for "book" returns 2 book-review mentions (S42). | UNVERIFIED | low-medium |
| book-lucid-news / book-doubleblind | Lucid News; DoubleBlind | **UNVERIFIED** | Lucid News unreachable (HTTP 000); DoubleBlind returned a 202 JS challenge. | n/a | n/a |
| book-reddit | Reddit book/psychedelic subs | **UNVERIFIED** | reddit.com returned 403 to about.json and old.reddit, so no subscriber counts (S40). | n/a | n/a |

## 3. Restrictions for a drug-related title (cited)

| Venue | What the live rule says | Consequence for this book |
|---|---|---|
| Google Ads | *"Ads for substances that alter mental state for the purpose of recreation… are not allowed"*; *"Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed."* (S15) | Ads framed as how to use or trip are disallowed. Integration and aftercare framing is the only possible angle, and approval is uncertain. |
| Amazon KDP content | No drug-specific clause; bans illegal content, hate speech etc., and content "we deem inappropriate or offensive" (S14) | Listing is fine, and the book is already live. |
| Amazon Ads | Policy page JS-only (**UNVERIFIED**, S52). Competing psychedelic-integration books run sponsored ads live (S44). | Test small. Expect case-by-case moderation. |
| Google Play Books | The content policy has an "Illegal Activities" section; no drug-specific clause found in the live text (S23). | The book is already live. |
| Draft2Digital | "Oversaturated" subjects list (Mindfulness, Meditation, Affirmation…) plus proof of nonfiction expertise (S24) | Lead the metadata with psychedelic integration, not mindfulness. Have credentials or bio evidence ready. |
| Kindle Deals | The title must be an eBook, not erotic, and enrolled in the 70% option (S19) | Eligible. |

## 4. Tagging and linking convention

**UTM rule** (every link placed on a venue that allows one): `utm_source=<venue>&utm_medium=<type>&utm_campaign=<name>`.

| Placement | URL |
|---|---|
| Goodreads profile | `https://www.mayaallan.com/?utm_source=goodreads&utm_medium=profile&utm_campaign=author-profile` |
| Kindle back matter | `https://www.mayaallan.com/integration-journal?utm_source=kindle&utm_medium=ebook-backmatter&utm_campaign=pig-ed1` |
| Print QR | `?utm_source=paperback&utm_medium=print-qr&utm_campaign=pig-ed1` (the QR target should be a short, stable path) |
| Library ebook | `?utm_source=overdrive&utm_medium=ebook-backmatter&utm_campaign=pig-library` (needs a separate EPUB build per channel) |
| Audiobook | spoken short path `mayaallan.com/listen`, which redirects server-side to `?utm_source=audiobook&utm_medium=spoken-cta&utm_campaign=pig-audio` |
| BookFunnel / StoryOrigin | `utm_source=bookfunnel&utm_medium=reader-magnet&utm_campaign=<promo-name>` |

The book page has `<link rel="canonical">` (verified live, S1), so UTM variants will not create duplicate URLs.

**Structured data** (site JSON-LD, to add once D1 is fixed; ISBNs shown are the live ones):

```json
{"@type":"Book","name":"Psilocybin Integration Guide","author":{"@id":"https://www.mayaallan.com/#maya"},
 "workExample":[
  {"@type":"Book","bookFormat":"https://schema.org/Paperback","isbn":"9798994148839","sameAs":"https://www.amazon.com/dp/B0G91GZMLT"},
  {"@type":"Book","bookFormat":"https://schema.org/Hardcover","isbn":"9798994148853","sameAs":"https://www.amazon.com/dp/B0G7JWDJYQ"},
  {"@type":"Book","bookFormat":"https://schema.org/EBook","sameAs":["https://www.amazon.com/dp/B0G765BZDL","https://play.google.com/store/books/details?id=HvafEQAAQBAJ"]}],
 "sameAs":["https://openlibrary.org/works/OL45177926W","https://www.goodreads.com/book/show/245299940","https://www.goodreads.com/book/show/245349971"]}
{"@type":"Person","@id":"https://www.mayaallan.com/#maya","name":"Maya Allan",
 "sameAs":["https://www.instagram.com/maya.allan66/","https://www.amazon.com/stores/author/B0G76975ST",
  "https://www.goodreads.com/author/show/65134359.Maya_Allan","https://openlibrary.org/authors/OL16288546A"]}
```

When they exist, add ISNI, Wikidata, BookBub and the Spotify author profile. The ebook gets its own `isbn` only if a new ebook ISBN is assigned.

## 5. Direct sales vs retailers

| | Site (PayPal, $9.99) | Retailers |
|---|---|---|
| Lead capture | **Yes**: the buyer's email is the lead | No; the retailer owns the customer |
| Rank and review signal | none | Yes: sales rank, "also bought", reviews |
| Constraint | Blocks KDP Select: *"you cannot distribute your book digitally anywhere else, including on your website"* (S10) | n/a |
| Pioneer play | Sell **what retailers cannot**: a bundle of ebook, fillable journal PDF and audio preview, delivered via BookFunnel. Keep list-price parity. | Use retailers for discovery. Every edition's back matter routes readers to the site. |

## 6. Pioneer sequence, ordered by lead value per unit of effort

**Days 0-7 ($5 to $20):**
1. Fix the metadata:
   - D1: new ebook edition, or ask KDP Support to clear the ebook ISBN.
   - D2: primary subject OCC039000.
   - D3: remove the duplicate contributor.
   - Goodreads: claim the profile, combine the works, add the paperback.
   - Open Library: add the author link.
2. Register an ISNI ($5).
3. Build a Books2Read UBL.
4. Clean the retailer URLs and add own affiliate IDs.
5. Add back-matter calls to action with UTMs to every edition.

**Days 7-30 ($150 to $400):** run the review engine.
- BookSirens: $10 plus $2 per reader.
- Hidden Gems: about $140 for 50 readers.
- Readers' Favorite: free review.
- NetGalley: request per-title pricing.
- BookFunnel ($30/yr) and StoryOrigin ($100/yr): reader magnet built from the Integration Journal.

**Days 14-45 ($20 plus about 10%):** go wide.
- Apple Books direct (70%).
- D2D for Kobo, NOOK, Everand, Tolino and **libraries** (OverDrive, Hoopla, cloudLibrary, BorrowBox, Vivlio).
- Nominate the Kindle ebook for Kindle Deals.

**Audiobook launch:**
- Spotify for Authors plus Voices by INaudio (wide), with redemption codes as a lead magnet.
- Or ACX, if the choice is Audible-only.

**Days 45-90:**
- Once 10+ reviews exist, apply for a BookBub Featured Deal: Advice & How-To at $0.99 costs **$784** for about **2,000-3,500 clicks**.
- A partner creates the "Psychedelic Integration Books" Goodreads list.
- Pitch Chacruna-style roundups.
- Publish the companion print *Integration Journal* on KDP (SEL045000).
- Scope a German edition.

## 7. UNVERIFIED (live source unreachable or not shown)

- Amazon Ads book policy text (JS-only).
- ACX exclusive/non-exclusive royalty split (help.acx.com JS-only; old URLs 404/308).
- Kobo Writing Life and B&N Press mechanics (403/503).
- Goodreads Giveaway prices (behind login).
- Booksprout plans (JS app).
- NetGalley per-title price ("reach out").
- Bookshop.org affiliate %.
- Spotify for Authors royalty %.
- Voices by INaudio fees.
- LoC PCN/CIP eligibility (403).
- WorldCat holdings (429/JS).
- LibraryThing (403).
- Reddit subscriber counts (403).
- Google Trends (429).
- Google Books API (429 daily quota).
- Lucid News and DoubleBlind review submission.
- `rel` (dofollow/nofollow) of the website links on Goodreads, Open Library, BookBub and Spotify profiles (not observable while logged out).
- KDP policy on external links inside ebook back matter.
- Amazon category tree name for "entheogens" (not fetched).
- Whether A+ content allows URLs (only part of the guideline was read).

## 8. What this map does not cover

Conversion on the site, AI-citation studies and measurement dashboards belong to the parallel workflow. Nothing here was posted, signed up for or purchased.

## 9. Sources (all read 2026-09-24, UTC; "~" = WebFetch call without its own timestamp, bracketed by neighbouring shell reads)

| # | URL | Page date (if shown) | Read (UTC) |
|---|---|---|---|
| S1 | https://www.mayaallan.com/books/psilocybin-integration-guide | n/a | 18:24:51Z; 18:46:39Z |
| S2 | https://openlibrary.org/isbn/9798994148839.json ; /authors/OL16288546A.json ; /works/OL45177926W.json | created 2026-04-20 | 18:25:10Z-18:25:22Z |
| S3 | https://www.goodreads.com/book/show/245299940 ; /book/show/245349971 ; /author/show/65134359.Maya_Allan ; /author/list/65134359 | n/a | 18:25:22Z-18:25:52Z |
| S4 | https://www.amazon.com/dp/B0G765BZDL ; /dp/B0G91GZMLT ; /dp/B0G7JWDJYQ ; /stores/author/B0G76975ST | n/a | 18:26:05Z-18:26:41Z |
| S5 | https://bookshop.org/p/books/psilocybin-integration-guide-40-real-scenarios-for-navigating-what-you-see-feel-experience-maya-allan/3c9390316323761a?ean=9798994148839 | n/a | 18:26:05Z; 18:45:06Z |
| S6 | https://www.barnesandnoble.com/w/psilocybin-integration-guide-maya-allan/1148993659 | n/a | 18:26:05Z; 18:46:04Z |
| S7 | https://play.google.com/store/books/details?id=HvafEQAAQBAJ | n/a | 18:26:05Z |
| S8 | https://itunes.apple.com/search?term=psilocybin+integration&entity=ebook&country=us (and author/title queries) | n/a | 18:27:33Z-18:27:41Z |
| S9 | https://www.kobo.com/us/en/search?query=9798994148839 (403) | n/a | 18:27:33Z |
| S10 | https://kdp.amazon.com/en_US/select | n/a | 18:28:14Z |
| S11 | https://kdp.amazon.com/en_US/terms-and-conditions | Last Updated Sept 27, 2024 | 18:28:14Z |
| S12 | https://kdp.amazon.com/en_US/help/topic/G200652170 (categories) | n/a | ~18:28Z |
| S13 | https://kdp.amazon.com/en_US/help/topic/G201298500 (keywords) | n/a | ~18:28Z |
| S14 | https://kdp.amazon.com/en_US/help/topic/G200672390 (content guidelines) | n/a | ~18:28Z |
| S15 | https://support.google.com/adspolicy/answer/6014299 | n/a | ~18:29Z |
| S16 | https://kdp.amazon.com/en_US/help/topic/G4WB7VPPEAREHAAD (A+ guidelines) | n/a | 18:29:29Z |
| S17 | https://kdp.amazon.com/en_US/help/topic/GFAQU3LUEHCRB8KD ; /GHJW2N8GLTQLK9TY (virtual voice) | n/a | 18:29:29Z-18:29:44Z |
| S18 | https://kdp.amazon.com/en_US/help/topic/G201014330 (ACX) | n/a | 18:29:44Z |
| S19 | https://kdp.amazon.com/en_US/help/topic/GHNKT7V426GVDM3G (Kindle Deals nomination) | n/a | 18:29:44Z |
| S20 | KDP help footer "Total KDP Select Author Earnings August 2026 • $69.4 Million" | Aug 2026 | 18:29:44Z |
| S21 | https://findawayvoices.com/ (redirect page to voicesbyinaudio.com) ; https://voicesbyinaudio.com | n/a | 18:30:30Z |
| S22 | https://authors.spotify.com/ ; https://authors.spotify.com/blog/direct-audiobook-publishing | post 2025-08-01 | ~18:30Z |
| S23 | https://support.google.com/books/partner/answer/10013009 ; /9331459 ; /9358246 ; /3474239 ; /1067634 ; /10010291 ; /topic/11098072 | n/a | 18:31:28Z-18:32:05Z |
| S24 | https://draft2digital.com/partners/ ; /content-guidelines/ ; /faq/ | n/a | 18:32:44Z-18:33:03Z |
| S25 | https://books2read.com/ | n/a | ~18:32Z |
| S26 | https://publishdrive.com/pricing | n/a | ~18:33Z |
| S27 | https://www.streetlib.com/ | n/a | 18:33:49Z |
| S28 | https://indieauthorproject.com/ | n/a | ~18:34Z |
| S29 | https://www.goodreads.com/author/program ; https://www.goodreads.com/giveaway/about | n/a | 18:34:49Z-18:35:09Z |
| S30 | https://www.bookbub.com/partners/pricing | n/a | 18:36:09Z |
| S31 | https://bookfunnel.com/pricing/ ; https://storyoriginapp.com/pricing ; https://booksirens.com/pricing | n/a | 18:36:19Z |
| S32 | https://www.hiddengemsbooks.com/arc-program/ ; https://www.hiddengemsbooks.com/arc-faq/ | prices "updated as of Sept 20, 2018" | 18:36:47Z |
| S33 | https://netgalley.zendesk.com/hc/en-us/articles/115003981574 ; /115003952873 ; /115003991254 | updated 2026-09-22; 2026-07-07; 2026-01-23 | 18:37:08Z |
| S34 | https://www.myidentifiers.com/get-your-isbn-now ; https://www.myidentifiers.com/identify-protect-your-name/get-your-isni-today | n/a | 18:37:20Z; 18:48:41Z |
| S35 | https://www.bisg.org/complete-bisac-subject-headings-list ; /mind-body-spirit ; /self-help ; /psychology ; /health-and-fitness | 2025 Edition | 18:37:35Z-18:38:46Z |
| S36 | https://www.loc.gov/programs/preassigned-control-number/about-this-program/ (403) | n/a | 18:39:01Z |
| S37 | https://www.worldcat.org/isbn/9798994148839 (JS page; search 429) | n/a | 18:39:09Z |
| S38 | https://www.librarything.com/isbn/9798994148839 (403) | n/a | 18:39:21Z |
| S39 | https://app.thestorygraph.com/browse?search_term=9798994148839 (and title search) | n/a | 18:39:41Z-18:39:48Z |
| S40 | https://www.reddit.com/r/PsychedelicTherapy/about.json and 9 other subs (403) | n/a | 18:39:58Z-18:40:07Z |
| S41 | https://www.kirkusreviews.com/indie-reviews/ ; https://readersfavorite.com/book-reviews.htm | n/a | 18:40:20Z |
| S42 | https://chacruna.net/?s=book+review ; https://maps.org/integration-station/ ; https://psychedelicstoday.com/?s=book | n/a | 18:40:34Z-18:41:52Z |
| S43 | https://developers.google.com/search/docs/appearance/structured-data/book | n/a | 18:42:19Z |
| S44 | https://www.amazon.com/s?k=psilocybin+integration&i=stripbooks ; k=psychedelic+integration ; k=psilocybin+book ; k=mushroom+trip+guide ; k=ego+death | n/a | 18:43:27Z-18:44:08Z |
| S45 | https://www.goodreads.com/search?q=psychedelic&search_type=lists ; q=psilocybin ; q=psychedelic+integration ; q=plant+medicine | n/a | 18:44:24Z-18:44:34Z |
| S46 | https://www.wikidata.org/w/api.php (wbsearchentities) ; https://query.wikidata.org/sparql (P212) ; Wikidata:Notability | Notability rev. 2026-09-12 | 18:44:43Z-18:44:50Z |
| S47 | https://kdp.amazon.com/en_US/help/topic/G8BYTM8CVK74676V ; /G201834170 (ISBN rules) | n/a | 18:45:47Z |
| S48 | https://authors.apple.com/ | n/a | ~18:42Z |
| S49 | https://trends.google.com/trends/api/explore (429) | n/a | 18:43:11Z |
| S50 | https://www.googleapis.com/books/v1/volumes?q=isbn:9798994148839 (429, daily quota 0) | n/a | 18:25:03Z |
| S51 | https://openlibrary.org/authors/OL539266A.json (example of the `links` and `remote_ids` fields) | n/a | 18:47:20Z |
| S52 | https://advertising.amazon.com/help/G5RLASA28TP9TFXZ (book ads policy; JS-only) | n/a | 18:28:42Z |