# Adversarial check: book ecosystem map (pioneer 04)

- **What was checked:** `docs/operations/growth/2026-09-24/pioneer/04-book-ecosystem.md` (map commit `649a680e18218331b720ccff738b1d428003c3f4`), plus its `-part2.md`. Both were read live from GitHub branch `work/site-visibility` at 2026-09-24T22:11Z; the branch head was then `c119b582`.
- **How:** every item was re-read from its live source between **2026-09-24T22:11:12Z and 22:41:20Z UTC** with curl GET, WebFetch and public JSON APIs. There were no logins, sign-ups or posts. For mayaallan.com, only GET was used.
- **Limit:** WebSearch was unavailable in this session (the search budget was used up). Missing venues were found only by fetching known URLs directly, so the missing-venue list is **not exhaustive**.
- **Rule:** a claim marked UNVERIFIED means the live source could not be read today. Nothing here comes from memory.

## 1. Verdict table

| id | keep | status correct | verdict | lead value (map → check) |
|---|---|---|---|---|
| book-isbn-defect | yes | yes | Confirmed. **The map missed that the ebook already has its own ISBN, 979-8994148891 (Google Play).** | high → high (foundation, 0 leads itself) |
| book-bisac | yes | yes | OCC039000 exists. **KDP does not take BISAC codes**: it takes 3 Amazon categories. The "renamed heading" claim is not shown. | high → medium |
| book-kdp-categories-keywords | yes | yes | Confirmed. Counts moved slightly (254, 92). | high → high |
| book-isni | yes | yes | Confirmed ($5). It has no path to leads. | medium → low |
| book-kdp-ebook-backmatter | yes | yes | **The map missed a policy restriction**: Kindle links may not point to email forms or to non-Amazon ebook stores. | high → medium |
| book-kindle-deals | yes | yes | Confirmed. Selection is unlikely at 0 reviews, and the D1 fix restarts the 90-day age. | medium → low (now) |
| book-kdp-select | yes (do-not-do) | yes | Confirmed. Google Play is a second conflict. | low → low |
| book-a-plus | yes | yes | Rules confirmed. The map missed the **ban on links and QR codes and the health-claim rule**. | medium → low |
| book-amazon-ads | yes | yes (unverified) | Competitor ads confirmed; the policy page is still JS-only. | medium → low-medium |
| book-apple-books | yes | yes | Confirmed: the book is absent and Apple pays 70%. Use the ebook ISBN ...891. | medium → low-medium |
| book-google-play | yes | yes | Confirmed. **The promotions source is wrong** (3474239 is a linking page). The affiliate program is partners-only. | medium → low-medium |
| book-d2d | yes | yes | Confirmed. Deselect Amazon in D2D. Do not use a D2D free ISBN. | medium → medium |
| book-books2read | yes | yes | Confirmed. It routes readers to stores, not to the site. | medium → low |
| book-publishdrive | **no** | yes | Live, but its free plan duplicates D2D's Apple/B&N/Kobo with no libraries. Pick one aggregator. | medium → low |
| book-libraries | yes | yes | Confirmed via D2D. **Per-channel UTMs are not possible** with one D2D file. | medium → low-medium |
| book-indie-author-project | yes (**flip**) | yes | **Wrong conclusion.** Only the *contest* is limited by genre. The year-round IAP collection is free, non-exclusive and open now. | low → low-medium |
| book-voices-inaudio | yes | yes | Confirmed: the redirect and non-exclusive terms. Fees are still UNVERIFIED. | medium → medium |
| book-spotify-authors | yes | yes | Confirmed. Royalty is still UNVERIFIED. | medium → medium |
| book-acx | yes | yes | **The UNVERIFIED split is now verified**: exclusive 40%, non-exclusive 25%, royalty share 20%. | medium → medium |
| book-kdp-virtual-voice | **no** | yes | Invite-only, US-only AI narration. Human narration is already in production. | low → none |
| book-google-autonarration | **no** | yes | Confirmed, but it is AI narration that duplicates the human audiobook and adds parity burdens. | low → none |
| book-open-library | yes | yes | Confirmed. The example author link renders with **no rel (followed)**. The hardcover and ebook can be added now. | medium → low-medium |
| book-wikidata | yes | yes | Confirmed. **P856 links are rel="nofollow".** The self-creation caution was verified. | medium → low |
| book-google-books-actions | **no** | yes | Confirmed as unavailable ("wide selection of available books"). It is not actionable. | low → none |
| book-goodreads-author | yes | yes | Confirmed. Adding the paperback is **blocked by D1** (same ISBN). | high → medium |
| book-goodreads-listopia | yes (reframed) | yes | **The factual claim is wrong**: "psilocybin" returns about 6 lists. The partner-list idea risks Goodreads' vote-incentive rule. | medium → low |
| book-bookbub | yes | yes | Prices confirmed to the dollar. The requirements (50% discount, no guarantee) were read. | high → low now / medium later |
| book-arc-engine | yes | yes | Prices confirmed. The map missed the **FTC rule and Goodreads' "incentivized in any way" ban**. | high → medium |
| book-bookfunnel-storyorigin | yes | yes | Prices confirmed. Swaps need an existing list. StoryOrigin also has a free plan. | high → medium |
| book-paid-reviews | yes | yes | Confirmed. Readers' Favorite free reviews: about 65% are picked within 3 months; Express costs $59. | low → low |
| book-psychedelic-media | yes (downgrade) | yes | The Chacruna evidence is **2019-2022 (stale)** and there is no submissions page. MAPS is a benchmark only. | medium → low |
| book-companion-journal | yes (reframed) | yes | **Not a gap**: 7 of the top 16 results are already journals or workbooks. | medium → low-medium |
| book-outbound-links | yes | yes | Confirmed. Also, the site's **only Amazon link is the $33.99 hardcover**. | low → low |
| book-kobo-bn-librarything-worldcat | yes (placeholder) | yes (unverified) | Still blocked. Kobo showed 0 results for ...839 once; the ebook ISBN search returned 403. | unknown |

## 2. The eight corrections that change the plan

1. **An ebook ISBN already exists.** The Google Play listing's JSON-LD carries `"isbn":"9798994148891"` with `bookFormat` EBook, $9.99 and 289 pages (read 22:22:59Z). The check digit is valid; it sits in the same 979-8-9941488 block as ...883 (paperback) and ...885 (hardcover). The D1 fix should therefore republish the Kindle edition with **979-8994148891** or with no ISBN (KDP: *"eBooks and low-content books are the only formats where an ISBN is optional"*, G201834170, 22:14Z), and reuse ...891 at Apple and D2D. Bowker does not need to sell a new ISBN. The map's JSON-LD snippet should give the EBook `workExample` `"isbn":"9798994148891"`. Whether a Bowker record for ...891 exists and says "ebook" is UNVERIFIED (behind login).
2. **Kindle back-matter links are restricted.** KDP Hyperlink Guidelines (GQ6JQ7FM6C72HE4X, 22:30:40Z) prohibit *"Links to commercial eBook store sites other than Amazon"* and *"Links to web forms that request customer information (e.g., email address…)"*. External links should be present *"only if they directly enhance the reader experience"*, for example *"Links to additional ancillary material (e.g., checklists, assessment forms… printable materials)"*. The Content Quality guide (G200952510) states a *"zero-tolerance policy for any book content meant to advertise, promote, [or] mislead"*.
   - So the Kindle link must go to the journal tool, not to an opt-in page and not to the book page that sells the ebook via PayPal.
   - Live check at 22:30:53Z: `/integration-journal` has 1 form and **0 email fields**, so it qualifies today. Keep it that way.
3. **The ACX royalty split is on a readable KDP page** (G201014330, 22:30:04Z): *"If you choose to distribute exclusively to these three channels, you will earn 40%… Royalty Share… 20%… non-exclusively, you will earn 25% and retain the right to distribute your recording."* For a wide audiobook, choose ACX non-exclusive at 25% and add Spotify for Authors and Voices by INaudio.
4. **KDP does not accept BISAC codes.** The KDP categories help (G200652170, 22:16:33Z) says *"you can select 3 categories"* from Amazon's category tree and warns *"We do not tolerate categorization that misleads readers."* It never mentions BISAC. OCC039000 can only go where BISAC is entered (the Bowker title record, or IngramSpark if used). How KDP's Expanded Distribution maps categories to BISAC is UNVERIFIED.
5. **The Indie Author Project is open now.** Its FAQ (22:29:21Z) says: *"Indie authors can submit qualifying ebooks to the Indie Author Project… shared with patrons of participating libraries across your region"* and *"completely free and non-exclusive… year-round discovery collections and annual contests."* The genre list (fiction + Memoir) and the April 1 - May 31 window apply only to the contest.
6. **Goodreads lists do exist.** A Listopia search for *psilocybin* (22:24:01Z) returns "about 6 results":
   - Best Psychedelic Knowledge (92 books, 52 voters)
   - Pro-cannabis & psychedelia books!! (35, 31)
   - Best books about psychedelic drugs! (29, 25)
   - **Best Magic Mushroom Books (9 books, 6 voters)**
   - Psychedelic Foundations (36, 5)
   - Healing with Psychedelics and Holotropic Breathwork (10, 1)

   Only *psychedelic integration* returns "No results". *Plant medicine* returns 14 lists, all herbal. The Goodreads Community Guidelines (22:24:46Z) ban *"incentivizing votes, likes, or other actions"* and *"Abusing Goodreads features to promote yourself"*. A partner creating a list at the author's request is therefore risky. Any member may add a book to an existing list, but the Listopia rules page returned 403, so that is UNVERIFIED.
7. **Review services carry legal and platform constraints the map omitted.**
   - FTC Consumer Reviews and Testimonials Rule, *"went into effect on October 21, 2024"*. Incentives are allowed only *"as long as there isn't an express or implied requirement that the reviews have to express a particular sentiment"*, and *"failing to disclose incentives could be a violation of the FTC Act"* (ftc.gov Q&A, 22:28:10Z).
   - Goodreads Author Guidelines (22:41:12Z): *"we also prohibit paid reviews and reviews that have been incentivized in any way"*. Free copies are OK *"but you may not require a review in exchange."*
   - Amazon removes *"A review by someone perceived to have a close personal relationship with the product's owner, author"* and *"A review in exchange for monetary reward"* (G3UA5WC5S5UUKB5G, 22:27:52Z).
   - Use only services where the reader is not paid and a review is optional (BookSirens states *"You are NOT paying readers for reviews"*). Never ask for 5-star reviews.
8. **The companion journal enters a crowded format; it is not a gap.** At 22:35:37Z, the top 16 for *psilocybin integration* include 7 journals or workbooks:
   - *Psychedelic Prep, Trip, & Integration Workbook*
   - *The Psilocybin Healing Journey Workbook*
   - *Psilocybin Integration Journal*
   - *THRIVE Model… Workbook*
   - *My Psilocybin Journey* (guided journal)
   - *Psychedelic Integration Workbook Vol. 2*
   - *Microdosing Psilocybin: An Integration Journal*

   The only differentiator is the tie-in to the Guide and to the free web tool.

## 3. Item-by-item evidence

**book-isbn-defect**
- **Kindle** B0G765BZDL (22:12:44Z): "ISBN-13 : 979-8994148839", "Print length : 281 pages", "Publication date : December 15, 2025", rank #3,146,610 Kindle Store. The review histogram shows 0% in every star band.
- **Paperback** B0G91GZMLT (22:13:14Z): "ISBN-13 : 979-8994148839", **289 pages** (the map said 290), #971,568 Books. The title still shows the duplicate "Allan, Maya, Allan, Maya" (D3 confirmed).
- **Hardcover** B0G7JWDJYQ (22:13:38Z): "ISBN-13 : 979-8994148853", #3,964,590.
- **KDP rules:** *"The same ISBN cannot be reused across multiple book formats"* (G201834170). *"ISBNs cannot be changed if your book is published… unpublish the book and then publish a new edition"* (G8BYTM8CVK74676V, 22:14:50Z).
- **Bowker** (22:15:09Z): *"Each format of your book requires its own ISBN"*; 1 ISBN for $125, 10 for $295, 100 for $575, 1,000 for $1,500.
- **Side effects the map missed:**
  - A new Kindle edition gets a new ASIN, so the Kindle Deals "90 days" recommendation restarts.
  - Goodreads 245299940 ("Kindle Edition", ISBN ...839) and Open Library OL61601841M (...839) must be corrected to the paperback.

**book-bisac**
- BISG (22:15:20Z) lists "OCC039000 MIND, BODY, SPIRIT / Entheogens & Visionary Substances". The complete list page says "2025 Edition" (22:16:00Z).
- Also listed: SEL031000 Personal Growth / General, SEL045000 Journaling, SEL042000, PSY075000 Trauma Psychology, PSY073000 Psychotherapy / Spiritually Integrated, HEA032000 Alternative Therapies.
- **Not shown:** any statement that the heading was renamed from "BODY, MIND & SPIRIT" (UNVERIFIED).
- **Now blocked:** the Bookshop page returns 403 to curl and to WebFetch (22:31:33Z), so the Bookshop shelving evidence is UNVERIFIED today.
- **Verified instead:** Amazon places the book in Inner Child, Alternative Holistic Medicine, Emotional Self Help, Healthy Relationships and Personal Transformation (22:12-22:13Z).

**book-kdp-categories-keywords**
- G200652170: "select 3 categories"; "up to 72 hours".
- G201298500 (22:41:20Z): "Use up to seven keywords or short phrases". Avoid "Information covered elsewhere in your book's metadata (title, contributors, etc.)", "Words already mentioned in your book categories" and "Subjective claims about quality". KDP has *"zero tolerance policy for metadata that is meant to advertise, promote, or mislead"*.
- The "program names (Kindle Unlimited)" ban was **not visible** in this read.
- Amazon search re-read:
  - *psychedelic integration*: "1-16 of 254 results", no Maya edition on page 1 (22:17:02Z).
  - *ego death*: "1-24 of 92 results", no Maya edition on page 1 (22:17:39Z).
  - *psilocybin integration*: 85 results, paperback on page 1 (22:18:10Z).
- The Amazon category name for "entheogens" is still UNVERIFIED.

**book-isni**
- myidentifiers (22:15:02Z): "Complete and submit the ISNI Assignment Form… one-time fee of $5"; "over 16.5 million identities".
- Pollan's Open Library record has `remote_ids.isni` 000000011449365X (22:32:14Z).
- It gives no route to email leads, so lead value is low.

**book-kdp-ebook-backmatter** — see correction 2.
- The print QR/URL is not governed by the Kindle hyperlink page. Print-specific KDP rules were not read (UNVERIFIED).
- Apple, D2D and library ebook link rules were not read (UNVERIFIED).

**book-kindle-deals**
- GHNKT7V426GVDM3G (22:19:36Z): *"For Kindle Deals: Your title must be enrolled in the 70% royalty option (US marketplace only)"*; *"For Prime Reading: Your title must be enrolled in KDP Select"*; recommended *"at least 90 days… not been on deal in the last 90 days… priced between $2.99 and $12.99"*.
- Also: *"Nominations do not guarantee enrollment"*; *"Signals of reader interest include reviews, sales…"*; two Kindle Deals nominations at a time; nominations expire after 90 days.
- With 0 ratings and rank #3,146,610, selection is improbable now.

**book-kdp-select**
- kdp.amazon.com/en_US/select (22:19:46Z): *"you cannot distribute your book digitally anywhere else, including on your website, blogs, etc."* KDP help footer: "Total KDP Select Author Earnings August 2026 • $69.4 Million".
- The live Google Play ebook is a second conflict.

**book-a-plus**
- G4WB7VPPEAREHAAD (22:19:56Z) confirms the map's rules, including "A maximum of four quotes".
- **Rules the map missed:**
  - *"Web links or language attempting to redirect to other sites inside or outside of Amazon… are prohibited"*
  - no "QR barcodes"
  - *"No quotes or attributions may be made… to individuals, customers, or other private figures"*
  - *"Remove any claims to cure, mitigate, treat, or prevent diseases…"*; other health claims *"require a note in the text to substantiate them"*
- The health-claim rules are directly relevant to trauma and healing copy.

**book-amazon-ads**
- Sponsored titles live on *psychedelic integration* (22:18:42Z): *Breaking Family Curses: Psychedelic Integration…*, *THE LAST ILLUSION: Psychedelic Integration…*, *Healing the Modern Soul: Psychedelics…*, *Doorways to Transformation*, *The Hollow Bone of Healing*. *Psychedelics and the Soul* was not seen in this read.
- advertising.amazon.com/help/G5RLASA28TP9TFXZ returns HTTP 200 but WebFetch finds no rendered policy text (22:19Z), so the policy is UNVERIFIED.
- Ads drive Amazon sales, not site leads, and convert poorly at 0 reviews.

**book-apple-books**
- The iTunes Search API (22:20:08-22:20:11Z) returns 21 results for "psilocybin integration guide" and 40 for "psilocybin integration"; none are by Maya Allan. Three German psychedelic titles are dated 2026-08-21, 2026-08-29 and 2026-09-03.
- authors.apple.com (WebFetch ~22:20Z): *"70% royalties on every ebook, regardless of price"*, "No file delivery fees", web EPUB upload with an iTunes Connect account, Apple Affiliate program, "digital narration".

**book-google-play**
- 9331459: *"70% revenue split on ebook sales in most Google Play Books supported countries"* for partners who accepted the updated 2019 Terms of Service, otherwise "52%".
- 9358246: *"earn 7% commission"*, **"currently available for active Play Books partners"**, signup through Partnerize.
- **The promotions source is wrong:** 3474239 is "How to link to individual titles on Google Books". The promotions evidence is topic/11098072, which lists "Use promo codes to offer free or discounted ebooks & audiobooks", "Create bundle discounts…" and "Offer a discount to users who subscribe to your series".
- Whether Maya holds the Partner Center account is UNVERIFIED; "accept the updated terms" assumes she does.

**book-d2d**
- The partners page (22:28:18Z) lists Amazon, Apple Books, B&N, Kobo, Everand, Smashwords, Tolino, OverDrive, cloudLibrary, BorrowBox, Hoopla, Vivlio, Gardners, Fable and Bookshop.org.
- FAQ (22:28:28Z): "$20 (USD)" activation; "$12 (USD)" a year under $100 in sales; "approximately 10%". A D2D free ISBN *"can not"* be used at KDP or anywhere outside D2D.
- Content guidelines: "Oversaturated Subject Content" includes Mindfulness, Meditation, CBT, Narcissism and Gaslighting; D2D *"may require further documentation of subject matter expertise"*; it refuses "low-content books".

**book-books2read**
- books2read.com (22:28:36Z): "the service is free". The menu shows AFFILIATE CODES, AUTHOR PAGE, CUSTOM URLS, READING LISTS and "Add additional Stores".
- Whether an own-site link can be added is UNVERIFIED.

**book-publishdrive**
- WebFetch ~22:28Z: "1 ebook absolutely free" to Apple Books, B&N and Kobo, "No subscription. No commission"; paid tiers have no public prices; "Over 50 retailers & 240K libraries".

**book-libraries**
- Covered by the D2D partner list. D2D sends one EPUB to all channels, so the map's `utm_source=overdrive` would need a separate file per channel. Use one tag instead: `utm_source=ebook-wide&utm_medium=ebook-backmatter`.

**book-indie-author-project** — see correction 5. The contest genres (22:28:55Z) are Mystery/Thrillers, Romance, SF, Fantasy, Historical Fiction, General/Contemporary Fiction, Memoir, YA and Children's Picture Books.

**book-voices-inaudio**
- findawayvoices.com returns "Redirecting…" with a JS redirect to voicesbyinaudio.com (22:29:32Z). voicesbyinaudio.com returns 301 to www.
- The www page says *"Non-exclusive distribution gets your titles published on major retail platforms as well as library and educational channels"*. Its footer still reads "©2023 Findaway Voices by Spotify".
- /faq and /pricing return 404, so fees are UNVERIFIED.

**book-spotify-authors**
- Blog post (22:29:52Z) dated "August 1, 2025": *"you can publish your audiobooks directly to Spotify through Spotify for Authors"*; the page also covers the "partnering with INaudio" wide option.
- Home page: "author profiles", "redemption codes", "aggregated demographic data like age and gender". There is also a free "natural-sounding audiobook" creation tool.
- Royalty is still UNVERIFIED.

**book-acx** — see correction 3.

**book-kdp-virtual-voice**
- GFAQU3LUEHCRB8KD and GHJW2N8GLTQLK9TY (22:30:04-22:30:14Z): "invite-only beta"; "free at this time"; list price "$3.99 and $14.99"; *"For beta, you will be paid a 40% royalty"*; "only available for books to be distributed in the US marketplace"; an NCX table of contents is required.

**book-google-autonarration**
- 10013009 (WebFetch ~22:22Z): "[Beta]", *"no program fee"*; the audiobook may be sold elsewhere if it is available on Google Play in every country where it is sold elsewhere, at a Play price no higher than elsewhere.

**book-open-library**
- JSON (22:32:02-22:32:20Z): edition OL61601841M (ISBN ...839, work OL45177926W, created 2026-04-20). Author OL16288546A has no `links`.
- Pollan's record has a `links` entry for michaelpollan.com plus viaf, wikidata and isni IDs. His HTML page renders `<a href="https://michaelpollan.com/">` with **no rel** (22:33:15Z).
- ISBNs ...891 and ...853 return 404, so the ebook and hardcover editions can be added now.

**book-wikidata**
- wbsearchentities returns no results for "Maya Allan" or the title (22:32:53Z). SPARQL finds no P212 match for ...839, ...891 or ...853.
- Notability was last revised 2026-09-12T01:29:24Z and contains the quoted criterion.
- Wikidata:Autobiography (revised 2025-03-30): *"you should not create an item about yourself unless you are sure that it fulfils the notability criteria."*
- On Q1138996, the official-website link renders `rel="nofollow"` (22:33:14Z).

**book-google-books-actions**
- developers.google.com book page (22:33:25Z, "Last updated 2025-12-10 UTC"): *"limited to book providers with a wide selection of available books"* and *"limited to book providers that have filled out the interest form and have been onboarded."*

**book-goodreads-author**
- Book JSON (22:23:37-22:23:38Z): 245299940 is "Kindle Edition", isbn13 9798994148839, 281 pp, ratingsCount 0. 245349971 is "Hardcover", 9798994148853, 289 pp, 0 ratings. isGrAuthor is false.
- Author page (22:23:47Z): "0 ratings · 0 reviews · 2 distinct works"; "Maya Allan's Followers None yet".
- Program page (WebFetch ~22:23Z): free; "Is this you? Let us know!"; approval "within 2 business days"; blog, giveaways, Ask the Author.
- Adding the paperback needs its own ISBN record, so it waits on D1.

**book-goodreads-listopia** — see correction 6.

**book-bookbub**
- Pricing (WebFetch ~22:33Z) matches the map exactly:
  - Advice and How-To: 650,000+ subscribers, $784 at $0.99, 2,000-3,500 clicks.
  - Religion and Spirituality: 470,000+, $439.
  - General Nonfiction: 1,070,000+, $621.
- Requirements (WebFetch ~22:33Z): "Free or discounted by at least 50%"; no better price "in the last 30 days"; nonfiction "100 pages"; available on Amazon, Kobo, B&N, Google Play or Apple Books; the same book no more than once every 6 months; *"does not guarantee that it will be chosen"*.
- curl to other BookBub partner pages returns 403, so author-profile link mechanics are UNVERIFIED.

**book-arc-engine**
- BookSirens (22:34:05Z): "$10 per ARC + $2 per Reader", "$100 / year", *"You are NOT paying readers for reviews"*.
- Hidden Gems (22:34:06Z):
  - "$20… deposit" covers 1-10 readers, then "$3 each up to 140", "MAX option is a flat $400", "50 reader minimum".
  - Prices "updated as of Sept 20, 2018".
  - Genres include Self-Help, General Non-Fiction and Faith/Spirituality.
  - *"our schedule fills up months in advance"*
- NetGalley (Zendesk API, 22:34:19Z): article updated 2026-09-22: *"A per-title listing fee, available for self-published authors"*, "or through the IBPA member program".
- The "individual authors" article (updated 2026-07-07) says *"Reach out to us to learn more about terms and pricing"*, so the price is UNVERIFIED. The IBPA page returns 403.
- Legal and platform rules: see correction 7.

**book-bookfunnel-storyorigin**
- BookFunnel (22:34:46Z):
  - "$30/year": 1 pen name, 500 downloads/month, group promos, author swaps
  - "$200/year": 5,000 downloads
  - "$300/year": unlimited
  - Secure ARC delivery is listed with the higher plans.
- StoryOrigin (22:34:47Z): Basic "Free for all accounts"; Standard "$10 / month or $100 / year" with group promos, newsletter swaps and "Collect reader email addresses".

**book-paid-reviews**
- Kirkus (22:34:58Z): Traditional "STARTING AT $450", "7-9 WEEKS", "Expedited option $599". *"If it is a negative review, you can request that it never see the light of day."*
- Readers' Favorite (22:34:59Z): "Get a Free Review"; *"Only about 65 percent of free review requests are selected for review within 3 months"*; "Express Reviews start at just $59".

**book-psychedelic-media**
- Chacruna search (22:35:14Z) shows Book Launch posts dated June 7, 2022 and May 20, 2022, plus "20 Best Books About Peyote and Mescaline" (April 6, 2021) and "The 40 Best Books About Shamanism and Plant Medicines" (Aug 14, 2019).
- /submissions/, /submission-guidelines/ and /write-for-us/ all return 404 (22:35:25-22:35:27Z).
- MAPS (22:35:14Z): "The MAPS Integration Workbook… Get Your Free Guide"; *"Just enter your email in order to download our Integration Guide"*; Store has a "Bookshop" section.

**book-companion-journal** — see correction 8. Journal rules come from the KDP Low-Content Books page (GGE5T76TWKA85DJM), which was not read (UNVERIFIED).

**book-outbound-links**
- The mayaallan.com book page (22:30:54Z) links to:
  - B&N `;jsessionid=E0C61A…`
  - Bookshop `source=IndieBound&ref=https%3A%2F%2Fwww.google.com%2F`
  - bokus `srsltid=…`
  - AbeBooks `cm_mmc=aff-_-ir-_-353196-_-77798…afn_sr=impact`
- The only Amazon URL is `/dp/B0G7JWDJYQ`, the **hardcover** (22:31:07Z). Canonical tag present.
- Bookshop affiliate URLs tried (/pages/affiliates, /affiliates, /info/affiliate-program) return 404, so the commission % is UNVERIFIED.

**book-kobo-bn-librarything-worldcat**
- 22:35:50-22:36:14Z:
  - Kobo Writing Life: 403.
  - Kobo search for ...839: 200, "0 results" (expected for a print ISBN).
  - Kobo search for ...891: 403.
  - press.barnesandnoble.com: 200, but a 2 KB JS shell.
  - LibraryThing: 403.
  - search.worldcat.org: 200, but no record content (JS).
  - loc.gov PCN: 403.

## 4. Missing venues

| venue | why it matters | live mechanics (source, read time) | link-back / tag | lead value |
|---|---|---|---|---|
| **IngramSpark** (print and ebook wide) | This is the channel where BISAC codes can be set, which KDP does not allow (correction 4), and it reaches bookstores and libraries for events and consignment | "It costs you nothing to sign up… and to upload your print or ebook"; ebook "85% of the net revenue"; "Global book distribution" (ingramspark.com/pricing, 22:37:10Z). Whether the same ISBN can be used while KDP Expanded Distribution is on is UNVERIFIED; check before moving. | none; set BISAC OCC039000 here | low-medium |
| **Kindle Translate** (beta) | German and other translations. The map saw a German-title wave on Apple but not this tool. | *"invite-only beta for eligible KDP eBooks… AI-powered translation"*; English → French, German, Italian, Portuguese (Brazil), Spanish (Spain) (KDP G3BC6VBB6GMZKSBJ and G9LWBTHMUDT8EQPK, 22:37:03Z). Cost not shown. | none; translated back matter should point to /de, /es and the other language pages | low-medium (invite only) |
| **Book DNA** (formerly Shepherd) | The author pairs the book with 5 books they love, which places it in reader discovery | "Pair your book with 5 books you love… for free"; membership "Starting at $50 a year" (building.bookdna.com, 22:38:08Z); "I created Book DNA (formerly Shepherd)" (bookdna.com/about/our-story, 22:37:49Z). **shepherd.com is now a domain-for-sale page (brannans.com, 22:37:32Z), so treat "Shepherd" as DEAD as a destination.** | UNVERIFIED | low-medium |
| **The Fussy Librarian** (bargain promo) | A low-cost promo that does **not require reviews**, unlike BookBub | "Bargain promotions are for ebooks priced from $0.99 to $5.99"; "120,000 subscribers"; "Reviews are recommended but not required"; extra exposure for wide titles (thefussylibrarian.com/advertising, 22:38:37Z). Price per genre not captured (UNVERIFIED). | retailer links only | low |
| **ElevenReader Publishing** (ElevenLabs) | An audiobook outlet that pays per hour streamed and is non-exclusive | *"earn 60% on direct sales, and $0.20 per hour streamed… with no exclusivity required"*; distributes to "Spotify, InAudio" (elevenreader.io/publishing redirects to elevenlabs.io/audiobooks, 22:38:47Z). Whether it accepts a human-narrated master is UNVERIFIED. | UNVERIFIED | low |
| **BookLife** (Publishers Weekly) | Indie review, prize and profile venue linked to PW; IAP lists "BookLife Elite" as a partner | booklife.com/reviews is live with "Publishers Weekly Reviewed Projects", Reviews, Prize and Self-Pub 101 (22:38:28Z). Prices and free-submission terms were not in the HTML (UNVERIFIED). | UNVERIFIED | low |

Not added (no live source today): Reedsy Discovery (JS-only, /discovery/authors 404), Erowid book reviews (401), BookBub Ads (403), Libro.fm, Edelweiss (JS shell), LibraryThing Early Reviewers (403).

## 5. What stays UNVERIFIED after this check

- Amazon Ads book policy.
- Voices by INaudio fees.
- Spotify for Authors royalty %.
- NetGalley per-title price.
- Bookshop affiliate % and today's Bookshop shelving (403).
- Kobo and NOOK presence of the ebook.
- WorldCat, LibraryThing, LoC PCN.
- Goodreads, BookBub and Spotify profile link `rel`. The Open Library example is followed; Wikidata is nofollow.
- Whether Maya holds the Google Play Partner Center account.
- Bowker record contents for ...891.
- KDP rules for low-content journals.
- The BISAC heading rename note.
- IngramSpark ISBN coexistence with KDP Expanded Distribution.
- Kindle Translate cost.

This file was built in 8 commits on `work/site-visibility`. Each append was made to the live GitHub file fetched at push time, and each compare listed only this path.