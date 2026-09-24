# Pioneer map 04: the book ecosystem (ebook, print and upcoming audiobook), part 1 of 2

- **Scope:** every venue where *Psilocybin Integration Guide* by Maya Allan can be listed, claimed, tagged or linked back to mayaallan.com. IDs use the prefix `book-`.
- **When read:** all sources were read live on **2026-09-24, 18:24Z to 18:49Z UTC**. Where a site blocked the read (403/429/JS-only), the item is marked **UNVERIFIED**. Nothing here comes from memory.
- **Sources:** S1-S52 are listed with URL and read time in **part 2** (`04-book-ecosystem-part2.md`, section 9).
- **How read:** read-only GET/WebFetch of public pages and public APIs. No logins, sign-ups or posting.
- **Split:** this part has the baseline, the defects, the market view and venue groups 2A-2D. Part 2 has 2E-2H, the drug-title restrictions, tagging, direct vs retail, the sequence, UNVERIFIED items and sources.

## 0. Live baseline: what exists today

| Format | Identifier (live) | Where it is live | Rank / reviews (live) | Src |
|---|---|---|---|---|
| Kindle ebook | ASIN **B0G765BZDL**; its detail page shows **ISBN-13 979-8994148839** | Amazon US, $9.99; not in Kindle Unlimited (no "read for free" flag on the page) | #3,144,369 Kindle Store; #2,306 Inner Child; #2,708 Alternative Holistic Medicine; **0 ratings** | S4 |
| Paperback | ASIN **B0G91GZMLT**, **ISBN-13 979-8994148839**, 290 pp, 6x9, pub. 2025-12-13 | Amazon $21.99; Bookshop.org; B&N (paperback only); Waterstones; bokus; AbeBooks | #957,243 Books; #575 Inner Child Self-Help; **0 ratings** | S4 S5 S6 |
| Hardcover | ASIN **B0G7JWDJYQ**, **ISBN-13 979-8994148853**, 289 pp | Amazon $33.99 | #3,949,951 Books | S4 |
| Google Play ebook | id `HvafEQAAQBAJ` | Google Play Books, $9.99 | n/a | S7 |
| Site direct ebook | PayPal checkout, $9.99 | mayaallan.com/books/psilocybin-integration-guide | n/a | S1 |
| Audiobook | in production | none live | n/a | S1 |
| Amazon author page | `B0G76975ST` (bio present) | amazon.com/stores/author/B0G76975ST | n/a | S4 |
| Goodreads | work 245299940 ("Kindle Edition", ISBN ...839) **and** 245349971 (Hardcover, ISBN ...853) show as **2 distinct works**; author 65134359 | goodreads.com | **0 ratings, 0 reviews, "shelved 1 time", 0 followers, no Goodreads Author badge** | S3 |
| Open Library | edition OL61601841M (ISBN ...839); work OL45177926W; author OL16288546A (no links on the record) | openlibrary.org | 0 ratings | S2 |
| Apple Books | **not found**: the iTunes Search API returns 0 results for the title and author | n/a | n/a | S8 |
| B&N NOOK | **not found**: the B&N page lists Paperback only | n/a | n/a | S6 |
| StoryGraph | **not found**: an ISBN search returns "There's nothing on The StoryGraph matching" | n/a | n/a | S39 |
| Kobo / WorldCat / LibraryThing | **UNVERIFIED** (Kobo 403; WorldCat 429 and a JS-only page; LibraryThing Cloudflare 403) | n/a | n/a | S9 S37 S38 |
| Wikidata | **none**: no item for "Maya Allan" or the title, and no item carries ISBN 979-8-9941488-3-9 | n/a | n/a | S46 |

### Defects found live. Each one blocks discovery, and each costs little to fix.

| # | Defect (live evidence) | Why it matters | Fix |
|---|---|---|---|
| D1 | **One ISBN is used by two formats.** Both the Kindle ebook and the paperback show ISBN 979-8994148839. | KDP: *"The same ISBN cannot be reused across multiple book formats"* (S47). Bowker: *"Each format of your book requires its own ISBN"* (S34). Catalogs merge the two formats (Goodreads labels the ...839 record the "Kindle Edition"), so the paperback has no clean record anywhere. | KDP: published ISBNs *"cannot be changed… you'll have to unpublish the book and then publish a new edition"* (S47). The Kindle has **0 reviews**, so a new ebook edition costs nothing now. Ask KDP Support first whether they can clear the ebook ISBN field. Ebook ISBNs are optional on KDP (S47). |
| D2 | **The book is shelved in the wrong subjects.** Bookshop shelves it under *Self-Help / Codependency / Personal Growth - General / Emotions*. Amazon places it in Inner Child, Alternative Holistic Medicine, Emotional Self Help, Personal Transformation and Healthy Relationships. | The BISAC code built for this subject exists: **OCC039000 MIND, BODY, SPIRIT / Entheogens & Visionary Substances** (BISAC 2025; the heading is renamed from "BODY, MIND & SPIRIT") (S35). Readers who browse psychedelic shelves never see the book. | Change the subject codes wherever the print metadata is set (KDP and/or the Bowker record). Recommended set: **OCC039000** (primary), **SEL031000** Personal Growth / General, **PSY075000** Trauma Psychology or **HEA032000** Alternative Therapies. No "Inner Child" heading appears on BISG's public 2025 SELF-HELP page. |
| D3 | **The author is listed twice.** The Amazon paperback title shows "Allan, Maya, Allan, Maya". | Duplicate contributors split the author entity. | Remove the duplicate contributor role in KDP print setup. |
| D4 | **Goodreads is split and unclaimed.** There are 2 separate works, the paperback edition is missing, and there is no author badge. | Reviews and "Want to Read" signals split across two works. The profile carries no site link. | Join the Author Program (free), combine the editions, add the paperback, and connect the blog (2G, part 2). |
| D5 | **The ebook is missing from Apple Books, NOOK, Kobo (UNVERIFIED) and every library.** | Those are free shelves, and libraries are free discovery. | Go wide (2B, 2C, 2D). The ebook is not in KDP Select, so nothing blocks this. |
| D6 | **The site's Book JSON-LD** uses the hardcover ASIN as its only identifier. It has no `isbn`, no per-format `workExample`, a weak `keywords` value, and the Person `sameAs` lists Instagram only. | Entity reconciliation across Google, Open Library, Goodreads and Amazon depends on these IDs. | Snippet in part 2, section 4. |
| D7 | **Outbound retailer links carry third-party parameters**: B&N `jsessionid`, bokus `srsltid`, AbeBooks Impact affiliate parameters (`cm_mmc=aff-_-ir-_-353196`), Bookshop `source=IndieBound&ref=google`. | They leak attribution to other parties and earn Maya nothing. | Clean the URLs, then add Maya's own affiliate IDs: Google Play Books affiliate **7%** (S23); Apple Affiliate (S48); Bookshop % UNVERIFIED. |
| D8 | **There are zero reviews on every retailer and on Goodreads.** | Every promo site and every reader decision depends on social proof. | Run the review engine (2G) before any paid promotion. |

## 1. How a pioneer reads this market (live numbers)

1. **The niche is small, and Maya already ranks in it.** An Amazon Books search for *psilocybin integration* returns **85 results**, and Maya's book appears **organically at #5** on page 1 (logged-out US view, 18:43Z). *Psychedelic integration* returns **255 results**; Maya is not on page 1, and page 1 carries **5 sponsored slots**. *Ego death*, a core chapter topic, returns **89 results**; Maya is not on page 1, and page 1 carries **6 sponsored slots**. *Psilocybin book* returns **over 1,000 results**; Maya is not on page 1 (S44). The book should rank for the topics it covers: ego death, challenging experiences, entities, inner child.
2. **Competitors advertise now, so Amazon ads work in this niche.** Live sponsored results for *psychedelic integration* include *THE LAST ILLUSION: Psychedelic Integration…*, *Breaking Family Curses: Psychedelic Integration…* and *Psychedelics and the Soul…* (S44). This is observed practice. The written Amazon Ads book policy page renders only via JS (UNVERIFIED, S52).
3. **Workbooks and journals crowd the results.** 6 of the top 16 results for *psilocybin integration* are journals or workbooks (S44). Maya already has a free /integration-journal tool. The pioneer move is a companion print **"Integration Journal"** that links the Guide to the site. Publish it on KDP only: D2D refuses "low-content books" (S24).
4. **No Goodreads list exists for the category.** Goodreads list searches for *psilocybin*, *psychedelic integration* and *plant medicine* return **no lists**. Adjacent lists are small: *Best Psychedelic Knowledge* (92 books, **52 voters**), *Best books about psychedelic drugs* (29 books, **25 voters**), *Best Altered States and More* (71 books, 62 voters) (S45).
5. **A German-language wave is visible.** An Apple Books search for *psilocybin integration* (40 results) includes **8 German psychedelic titles dated 2026-08-21 to 2026-09-03** (S8). The site already serves /de, /es, /pt, /fr and /he. Translated editions are a first-mover opening.
6. **Libraries are an unused free channel.** D2D delivers to **OverDrive, cloudLibrary, BorrowBox, Hoopla, Vivlio** (S24). Nothing of Maya's is in any library today.
7. **Money pool:** KDP Select paid **$69.4M in August 2026** (S20). It does not apply here, because Select forbids selling the ebook on the website (part 2, section 5).

## 2. Venue map

Column key:
- **Link-back:** whether the venue shows a URL to mayaallan.com. The *rel* attribute (nofollow/dofollow) was not observable while logged out, so it is UNVERIFIED unless stated.
- **Lead value:** likelihood of creating email leads on mayaallan.com.

### 2A. Identifiers and metadata

| id | Venue | Status | Mechanics (live) | Link-back | Tagging | Cost | Effort | Lead value |
|---|---|---|---|---|---|---|---|---|
| book-bowker-isbn | Bowker ISBN (myidentifiers) | live | "Each format of your book requires its own ISBN". Prices: 1 for **$125**, 10 for **$295**, 100 for **$575**, 1,000 for **$1,500** (S34). Maya's ISBNs sit in a 979-8-9941488 block, so spare numbers may already exist. | none (data feed) | Same title, subtitle, contributor and BISAC data in every system | $0 if spares exist | 1 h | high (foundation) |
| book-books-in-print | Bowker Books in Print | UNVERIFIED | Bowker lists "Get Into Books In Print" with ISBN purchase. The edit screens sit behind login. | none | same metadata | incl. | 1 h | medium |
| book-isni | ISNI via Bowker | live | "Each successful ISNI registration has a one-time fee of **$5**". ISNI holds "16.5 million" identity records (S34). Open Library and Wikidata carry ISNI IDs (example: the Pollan record has `remote_ids` isni/wikidata/viaf, S51). | none | add to `sameAs`/`identifier` | **$5** | 20 min | medium (entity/AI graph) |
| book-bisac | BISAC 2025 (BISG) | live | See D2. **OCC039000**. Also available: SEL031000, SEL042000 Emotions, SEL045000 Journaling (for the companion journal), PSY075000, PSY073000 Psychotherapy / Spiritually Integrated, HEA032000 (S35). | none | same codes in every feed | $0 | 30 min | high |
| book-kdp-categories | KDP categories | live | "select **3** categories"; changes take "up to **72 hours**" (S12) | none | n/a | $0 | 30 min | high |
| book-kdp-keywords | KDP keywords | live | "up to **seven** keywords or short phrases". Prohibited: repeating the title or category, quality claims, program names such as "Kindle Unlimited" (S13). Test list (hypotheses; measure with the S44 method): *ego death, bad trip help, challenging psychedelic experience, mushroom journey integration, psychedelic integration, psilocybin retreat aftercare, entity encounters*. | none | n/a | $0 | 30 min | high |
| book-lccn | Library of Congress PCN/CIP | **UNVERIFIED** | loc.gov returned 403 (S36) | none | n/a | n/a | n/a | low |

### 2B. Retailers

| id | Venue | Status | Mechanics (live) | Link-back | Tagging | Cost | Effort | Lead value |
|---|---|---|---|---|---|---|---|---|
| book-kdp-ebook | Amazon KDP Kindle | live | $9.99. Not in Select. Fix D1. | No links on the product page. The ebook's own back matter can carry a URL (KDP rule on links inside the ebook not re-read today, **UNVERIFIED**). | `mayaallan.com/integration-journal?utm_source=kindle&utm_medium=ebook-backmatter&utm_campaign=pig-ed1` | royalty 30-70% | 2 h | **high** (every reader sees the call to action) |
| book-kdp-print | KDP paperback and hardcover | live | Fix D1 and D3. Print back matter: a short URL plus a QR code. | QR/URL in print | `utm_source=paperback&utm_medium=print-qr&utm_campaign=pig-ed1` | $0 | 1 h | high |
| book-amazon-author | Amazon author page ("Amazon Author", formerly Author Central) | live (B0G76975ST) | The bio is live. Editing needs a login (UNVERIFIED). The A+ guideline points editorial reviews to Author Central (S16). | none observed | add the page URL to site `sameAs` | $0 | 30 min | low-medium |
| book-a-plus | KDP A+ Content | live | No pricing, promotions, "buy now", customer reviews or time-sensitive words. "A maximum of four quotes". Images: jpg/png, RGB, <2 MB, alt-text required (S16). | none (URL rule only partly read) | n/a | $0 | 3 h | medium (conversion) |
| book-kindle-deals | KDP "Nominate Your eBook for a Promotion (Beta)" | live | Kindle Deals requires the **70% royalty option (US only)**; KDP Select is not needed (Select is required only for Prime Reading). Recommended: titles available **90+ days**, no deal in the last 90 days, priced **$2.99-$12.99** (S19). The book is eligible (live 2025-12-15, $9.99). | n/a | n/a | $0 (royalty on the discount price) | 15 min | medium-high (after reviews) |
| book-kdp-select | KDP Select / Kindle Unlimited | **restricted** | "you cannot distribute your book digitally anywhere else, **including on your website**" (S10). This conflicts with the PayPal ebook sale. | n/a | n/a | n/a | n/a | not recommended |
| book-amazon-ads | Amazon Sponsored Products | live; policy **UNVERIFIED** | Competing psychedelic-integration titles run sponsored slots live (S44). The policy page is JS-only (S52). | none | n/a | CPC | 2 h + budget | medium |
| book-apple-books | Apple Books for Authors | live; **book absent** | Web portal EPUB upload; **"70% royalties on every ebook, regardless of price"**; "No file delivery fees"; Apple Affiliate program; digital narration offered (S48) | none | Apple affiliate token | $0 | 2 h | medium |
| book-google-play | Google Play Books Partner Center | live (book listed) | **70%** revenue split for partners on the 2019+ ToS in "60+" countries (52% otherwise). Promotions: promo codes, series and bundle discounts. **Play Books Affiliates: 7%** commission (S23). | The Google Books page shows retailer links (Preview Program) | `books.google.com/books?vid=ISBN979...`; add to `sameAs` | $0 | 1 h | medium |
| book-bookshop | Bookshop.org | live (paperback) | Fix the shelves (D2). "Bookshop.org for Authors" and an affiliate program exist; the commission % is UNVERIFIED (S5). | affiliate shop (UNVERIFIED) | own affiliate ID | $0 | 30 min | low-medium |
| book-bn-nook | B&N Press (NOOK) | **UNVERIFIED** (press.barnesandnoble.com 403) | reachable via D2D (listed partner) | n/a | n/a | n/a | n/a | low-medium |
| book-kobo | Kobo Writing Life | **UNVERIFIED** (kobo.com 403; KWL 503) | reachable via D2D (listed partner) | n/a | n/a | n/a | n/a | low-medium |

### 2C. Aggregators

| id | Venue | Status | Mechanics (live) | Link-back | Cost | Lead value |
|---|---|---|---|---|---|---|
| book-d2d | Draft2Digital | live | Stores listed: **Amazon, Apple Books, B&N, Kobo, Everand, Smashwords, Tolino, OverDrive, cloudLibrary, BorrowBox, Hoopla, Vivlio & Vivlio Libraries, Gardners, Fable, Bookshop.org**. Commission "approximately **10%** of the retail price". **$20** one-time activation, plus **$12/yr** if sales are under $100/yr. It refuses "Oversaturated Subject Content" incl. **Affirmation, Chakra, CBT, Guided Meditation, Hypnosis, Manifestation, Meditation, Mindfulness**. Nonfiction: "We may require further documentation of subject matter expertise". No 100%-AI books (S24). | UBL page | $20 + ~10% | medium-high (libraries) |
| book-books2read | Books2Read Universal Book Link | live | "the service is free". Features: author pages with custom URLs and Reading Lists. One link routes each reader to their preferred store (S25). | The UBL lists stores; whether a site link can be added is UNVERIFIED | $0 | medium (one clean link for every venue) |
| book-publishdrive | PublishDrive | live | Free plan: 1 ebook to Apple, B&N, Kobo, "No subscription. No commission". Paid plans are subscriptions (prices not shown) and claim "50 retailers and 240,000 libraries" (S26). | n/a | $0-sub | medium (alternative to D2D) |
| book-streetlib | StreetLib | live site (JS app); mechanics **UNVERIFIED** | React shell with an "Anniversary" landing (S27) | n/a | n/a | low |

### 2D. Libraries

| id | Venue | Status | How to get in | Cost | Lead value |
|---|---|---|---|---|---|
| book-overdrive | OverDrive / Libby | live via D2D | D2D channel (S24). OverDrive's publisher page is a directory with no author-intake text. | D2D fees | medium-high: patrons meet the back-matter call to action |
| book-hoopla | Hoopla | live via D2D (and Voices by INaudio for audio) | D2D channel | D2D fees | medium |
| book-cloudlibrary-borrowbox | cloudLibrary, BorrowBox, Vivlio Libraries | live via D2D | D2D channel | D2D fees | low-medium |
| book-indie-author-project | Indie Author Project (BiblioBoard) | live | Submissions "April 1st – May 31st". Categories are fiction plus **Memoir** only (S28). | n/a | **low** (self-help not eligible) |
| book-worldcat | WorldCat | **UNVERIFIED** (S37) | Records normally follow library acquisitions (OverDrive/print). | $0 | medium (entity graph) |
| book-library-talks | Library events (idea) | idea | Once D2D places the ebook in libraries, pair it with free "integration literacy" talks listed on /events. | $0 | medium |

Continued in `04-book-ecosystem-part2.md` (sections 2E-9 and the full source list).