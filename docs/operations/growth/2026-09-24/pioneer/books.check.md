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