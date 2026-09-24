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