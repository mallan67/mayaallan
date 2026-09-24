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