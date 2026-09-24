# Google network map, part 2 (2026-09-24)

*Continues [02-google-network.md](02-google-network.md), which holds the live baseline, the pioneer read, the full inventory and goog-01 to goog-19. Same method: live reads on 2026-09-24, 18:24Z-18:41Z UTC.*

## 3. Mechanics per property (continued)

### goog-20 Google Discover: LIVE, automatic, medium
- "Content is automatically eligible to appear in Discover if it is indexed by Google and meets Discover's content policies. No special tags or structured data are required."
- **Images:** at least 1200 px wide, more than 300,000 pixels, 16x9, with `max-image-preview:large`. Set the preferred image through schema.org or og:image (guidance added 2026-03-02).
- **Dead:** the Follow feature was removed from the Discover docs on 2025-11-19.
- **Site:** max-image-preview:large is already set. The book og:image is 1200x630 (about 1.9:1). Add a 1200x675 (16:9) hero image to each post.
- **Source:** developers.google.com/search/docs/appearance/google-discover (updated 2026-03-09; about 18:26Z).

### goog-21 Google News / Top Stories / Publisher Center: LIVE, automatic
- "Publishers are automatically considered for 'Top stories' or the News tab of Search." The page describes no manual submission.
- Low value for mayaallan.com. See the psilowire.com idea in section 1.
- **Source:** support.google.com/news/publisher-center/answer/9607025 (about 18:31Z).

### goog-22 Web Stories: LIVE, low
- A story "can appear as a single result on Google Search" everywhere Search is available. Discover cards are "most likely to appear in the United States, India, and Brazil".
- Stories use the AMP format, which Next.js App Router doesn't produce natively, so they would need a separate static path. The effort is high for the likely return.
- **Source:** developers.google.com/search/docs/appearance/enable-web-stories (updated 2026-07-01).

### goog-23 Event rich results + Google Maps: LIVE, physical events only
- Since the 2025-06-05 change: "Events must take place in a physical location", and "Virtual experiences that have no real-world component aren't supported". Events must be bookable by the general public.
- Events appear in **Google Search and Google Maps**. Supported regions include the US (English).
- **Action:** when Maya books an in-person reading or workshop (a bookstore, a studio), add Event JSON-LD to /events. Zoom events get no Google event surface.
- **Source:** developers.google.com/search/docs/appearance/structured-data/event (updated 2026-09-08).

### goog-24 ProfilePage structured data: LIVE, medium (entity and E-E-A-T)
- Valid on "'About Me' pages on blogs". `mainEntity` is a Person. Recommended properties include `sameAs`, `image`, `description`, `identifier`, and more.
- **Action:** add ProfilePage to /about. Point `Article.author.url` to /about instead of the homepage. Expand `sameAs` as each profile goes live.
- **Why it matters:** Google gives "even more weight to content that aligns with strong E-E-A-T" on health topics (creating-helpful-content, updated 2025-12-10).
- **Source:** developers.google.com/search/docs/appearance/structured-data/profile-page (updated 2026-09-08).

### goog-25 Deprecated or restricted rich results: don't build for them
- **FAQ rich results:** deprecated. Changelog entry 2026-05-08, removal effective 2026-05-07: the feature "will no longer appear in Google Search results". The site's 20-question FAQPage is harmless but produces no rich result.
- **Book Actions:** banner added 2025-06-12 ("upcoming changes"). The doc is still live (updated 2025-12-10) but the feature is "limited to book providers with a wide selection of available books", so not for a single-title author.
- **Flagged 2025-06-12:** course info, estimated salary, ClaimReview, learning video, special announcement and vehicle listing. Special announcements were deprecated.
- **Practice problems:** deprecated 2025-11-05; docs removed 2026-01-06.
- **Breadcrumbs:** shown on desktop only since 2025-01-22.
- **Current supported list** (search gallery, updated 2026-06-15): Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, Image metadata, Job posting, Local business, Math solver, Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Speakable, Subscription/paywalled, Vacation rental and Video. **No FAQ, no HowTo, no Book.**
- **Sources:** developers.google.com/search/updates (read 18:27:19Z), /structured-data/faqpage, /structured-data/book, /structured-data/search-gallery.

### goog-26 Google Images / Lens: LIVE, low-medium
- **Google's guidance:** use `<img>` rather than CSS backgrounds. Use descriptive filenames and alt text. Submit image sitemaps. Set primaryImageOfPage or og:image. Supported formats include WebP, AVIF and SVG.
- **Action:** use the identical cover on Play, Books and the site, so a Lens scan of the physical book resolves to one entity. How Lens resolves it is **UNVERIFIED**.
- **Source:** developers.google.com/search/docs/appearance/google-images.

### goog-27 AI Overviews / AI Mode: LIVE, high long-run
- A page "must be indexed and eligible to be shown in Google Search with a snippet". "There are no additional requirements ... nor other special optimizations necessary." "You don't need to create new machine readable files, AI text files, or markup."
- **Controls:** nosnippet, data-nosnippet, max-snippet, noindex. Google-Extended governs AI training, and robots.txt currently allows it.
- **Google's generative-AI optimization guide** (updated 2026-07-10) says to make "non-commodity content" and warns that seeking "inauthentic 'mentions'" does not work. Forty first-hand integration scenarios are exactly non-commodity content.
- Measure results with goog-02.
- **Sources:** developers.google.com/search/docs/appearance/ai-features (updated 2025-12-10); /fundamentals/ai-optimization-guide.

### goog-28 Perspectives filter: UNVERIFIED
- Launched 2023-05-10 (blog.google). No current Google page confirming the filter still exists could be reached. Don't plan around it.

### goog-29 Google Trends + Trends API: UI LIVE, API alpha
- trends.google.com returns 200. The explore endpoint returned **429**, so this session has **no Trends numbers (UNVERIFIED)**.
- The Trends API is in alpha, by application. It offers 5 years of data, daily/weekly/monthly/yearly intervals, "consistently scaled" values, and region and sub-region data.
- **Use:** compare "psilocybin integration", "psychedelic integration", "integration coach" and similar terms by US state and season.
- **Source:** developers.google.com/search/apis/trends (about 18:31Z).

### goog-30 Keyword Planner: LIVE
- "You must complete your account setup by entering your billing information to access basic features like 'Get ideas for new keywords'."
- The entry URL now redirects to business.google.com/us/ad-tools/keyword-planner/. Whether volumes show only as ranges without ad spend is **UNVERIFIED**.
- **Source:** support.google.com/google-ads/answer/7337243.

### goog-31 Google Alerts: LIVE, $0, medium
- **Alerts to set:**
  - "Maya Allan"
  - "Psilocybin Integration Guide"
  - "psilocybin integration"
  - "psilocybin service center" plus state names
  - titles of competing books
- **What it surfaces:** journalists, podcasts and unlinked mentions, each an opening to ask for a link or an interview.

### goog-32 Google Ads: restricted, high risk
- "Ads for substances that alter mental state for the purpose of recreation or otherwise induce 'highs' are not allowed." "Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed." The only exception listed is topical hemp CBD (California, Colorado, Puerto Rico).
- The Healthcare policy prohibits "speculative and/or experimental medical treatments". Psilocybin does **not** appear on the unapproved-pharmaceuticals list (answer 2423645).
- **If tested at all:** use a tiny budget and a landing page that complies on its own terms. Never disguise the destination. How an integration book would fare in review is **UNVERIFIED**.
- **Sources:** support.google.com/adspolicy/answer/6014299, /176031, /2423645 (about 18:30-18:37Z).

### goog-33 Ad Grants: not applicable
- "Your organization must hold valid charity status in your country."
- **Source:** google.com/grants/eligibility.

### goog-34/35/36 GA4, Tag Manager, Looker Studio: LIVE
- No Google tag found on the homepage. The parallel measurement workflow owns this.
- **GA4 UTM rules:**
  - "always use `utm_source`, `utm_medium`, and `utm_campaign`"
  - values are case-sensitive, so use lowercase
  - `utm_creative_format` and `utm_marketing_tactic` are not reported
- Looker Studio now resolves to datastudio.google.com/overview.
- **Source:** support.google.com/analytics/answer/10917952.

### goog-37 Forms / Sites / Blogger: LIVE, low
- **Forms:** only for a quick reader survey or a facilitator interest list.
- **Sites and Blogger:** no value as link sources. Google's spam policies (updated 2026-08-28) name "Low-quality directory or bookmark site links", partner pages that exist "exclusively for the sake of cross-linking", site reputation abuse and scaled content abuse.

### goog-38 Google Scholar: LIVE, low
- **Included:** scholarly articles, preprints, theses and similar.
- **Excluded:** "news or magazine articles, book reviews, and editorials". Books belong in Google Books.
- **Author PDFs:** a PDF on the author's own site (title, then authors, then references) can be indexed "within several weeks". Worth doing only if Maya writes a genuine referenced review; that would add credibility, not leads.
- **Source:** scholar.google.com/intl/en/scholar/inclusion.html.

### goog-39 Google Podcasts: DEAD
- podcasts.google.com redirects **301** to music.youtube.com/googlepodcasts, which says: "Google Podcasts is no longer available ... Listen to podcasts and build your library in the YouTube Music app."
- The shutdown date is not shown on that page (**UNVERIFIED** date).

### goog-40 Discover "Follow" (RSS): DEAD
- Changelog 2025-11-19: "Follow feature removed from Discover documentation". Search-profile follows (goog-07) are the new route into Discover.

---

## 4. Tagging and linking convention (Google surfaces)

The convention is `utm_source=<venue>&utm_medium=<type>&utm_campaign=<name>`, all lowercase. **Never put UTMs in `sameAs`, canonical links or Knowledge-Panel social links.**

| Surface | Link target | Tag |
|---|---|---|
| YouTube video description | the matching /scenarios/<slug> or tool page | `utm_source=youtube&utm_medium=video&utm_campaign=<video-slug>` |
| YouTube channel links (up to 14) | /, /books/psilocybin-integration-guide, free tools | `utm_source=youtube&utm_medium=profile&utm_campaign=channel` |
| YouTube / YouTube Music podcast notes | /scenarios/<slug> | `utm_source=youtube&utm_medium=podcast&utm_campaign=<scenario>` |
| Play promo-code landing page (own site) | /books/...?code flow | `utm_source=google-play&utm_medium=promo-code&utm_campaign=<campaign>` |
| Business Profile (if it ever becomes eligible) | / | `utm_source=google&utm_medium=organic&utm_campaign=gbp` |
| Google Ads (if ever) | landing page | auto-tagging (gclid) |
| Google Books / Play listing | not editable to the site | none; link **to** them from the site instead |

**`sameAs` plan.** Use canonical URLs only, and add each one only after it is live.
- **Person:** instagram.com/maya.allan66, plus the YouTube channel once created. Amazon and Goodreads author pages are **UNVERIFIED**, so check they exist before adding them.
- **Book:**
  - `https://books.google.com/books/about/Psilocybin_Integration_Guide.html?id=HvafEQAAQBAJ`
  - `https://play.google.com/store/books/details?id=HvafEQAAQBAJ`
  - the Bookshop URL
  - `isbn` 9798994148891
  - `workExample`: EBook with isbn 9798994148891, and the print edition with isbn 9798994148839 (print format **UNVERIFIED**)
  - `offers`: the site price, sold through PayPal on-site

---

## 5. Pioneer sequence (Google network only)

| When | Move | Lead mechanism |
|---|---|---|
| Days 1-7 | Fix the entity. Add Book JSON-LD (`isbn`, `workExample`, `offers`, `sameAs` to Books/Play), ProfilePage on /about, and point `Article.author.url` to /about. Correct "MAYA. ALLAN" on the KDP print record | Google surfaces converge on one author and one book (trust on a YMYL topic) |
| Days 1-7 | Confirm the Search Console property. Submit the sitemap. Bookmark the Generative AI report | Measurement baseline |
| Days 1-7 | Add the Preferred-sources button to blog footers, the newsletter and the ebook thank-you page | Returning readers see Maya's site first in Top Stories, AI Mode and AI Overviews |
| Days 1-7 | Point psilocybinintegrationguide.com at /books/psilocybin-integration-guide instead of the homepage | Direct visitors from the exact-match domain land on the book page |
| Days 1-14 | Partner Center: test a larger Google Books preview percentage, check affiliate eligibility, and create the first free promo-code campaign (at most 3 a month, 5,000 codes each) | Readers who find the book through full-text search can buy it. Free codes exchanged for email sign-ups and reviews |
| Days 8-30 | YouTube channel (handle, 14 links, EDSA framing): one long-form video per scenario with chapters, plus Shorts cut-downs | Search and recommendations; a Knowledge Panel verification key |
| Days 8-30 | Publish scenario pages on the site (1 of 40 exists today), linked to the videos and to the Google Books preview | Long-tail queries in Search, Books and AI Mode |
| Days 31-90 | Podcast feed into YouTube and YouTube Music, reusing the audiobook audio | Listening app with UTM-tagged show notes |
| Days 31-90 | Put the audiobook on Play Books (US is in the program). Decide on auto-narration only if the produced audiobook slips | Audiobook buyers; audiobook promo codes |
| Days 31-90 | psilowire.com as a real, edited news wire (optional, and only if it is genuinely edited) | Top Stories, Discover and Preferred sources |
| When in person | Event JSON-LD for physical events | Google Search and Maps event listings |
| 6-12 months | 10k followers on one platform, then claim a Search profile and add the badge | A Google-hosted profile that audiences can follow into Discover |

**Do not repeat:** Indexing API, FAQ/HowTo/Book Actions, Google Podcasts, Discover Follow/RSS, a Business Profile while online-only, Merchant Center for the ebook, Ad Grants, satellite Blogger/Sites link pages, llms.txt "for Google".

---

## 6. UNVERIFIED (could not be read live this session)
- Whether a Knowledge Panel exists for "Maya Allan", and whether it is claimable.
- Google SERP presence and index coverage for mayaallan.com. That needs Search Console access, which was not used.
- Google Trends numbers (429). Google Books API data (429 quota).
- Whether links in YouTube Shorts are clickable in 2026. The rel attribute and redirect behavior of YouTube description links.
- Whether mayaallan.com is offered in the Preferred-sources tool (the page rendered empty).
- Whether the "Perspectives" filter still exists.
- Merchant Center eligibility for a directly sold audiobook. Merchant-listing eligibility for ebooks.
- Whether Keyword Planner shows volume ranges only, without ad spend.
- The Google Podcasts shutdown date (not shown on Google's redirect page).
- Whether @mayaallan is free to claim (the 404 only shows no channel uses it).
- The print edition's format (paperback or hardcover). Whether Amazon and Goodreads author pages exist.
- Whether the YouTube RSS-podcast country list includes the US (the list sits in a linked article that was not read).

---

## 7. Sources (URL, page date as shown, read time UTC 2026-09-24)

| Source | Page date | Read |
|---|---|---|
| https://www.mayaallan.com/ , /robots.txt, /sitemap.xml | live | 18:24:57Z-18:25:08Z |
| https://www.mayaallan.com/books/psilocybin-integration-guide | live | 18:25:19Z, 18:33:53Z |
| https://play.google.com/store/books/details?id=HvafEQAAQBAJ | live | 18:25:45Z, 18:38:40Z |
| https://books.google.com/books?vid=ISBN9798994148891 and ?vid=ISBN9798994148839 | live | 18:33:27Z, 18:38:40Z |
| https://www.mayaallan.com/blog/psilocybin-integration-research, /media/Mushroom-Healing, /scenarios | live | 18:31:49Z, 18:39:38Z |
| https://www.mayaallan.com/about, /events, /faq | live | 18:38:16Z |
| https://www.instagram.com/maya.allan66/ ; https://www.youtube.com/@mayaallan (and 3 other handles) | live | 18:34:07Z |
| https://dns.google/resolve?name=mayaallan.com&type=TXT (plus psilowire.com, psilocybinintegrationguide.com) | live | 18:34:18Z |
| Redirect checks for psilowire.com and psilocybinintegrationguide.com | live | 18:34:30Z |
| https://developers.google.com/search/apis/indexing-api/v3/quickstart | 2026-07-16 | ~18:26Z |
| https://support.google.com/business/answer/3038177 | n/d | ~18:26Z |
| https://support.google.com/knowledgepanel/answer/7534842 ; /7534902 | n/d | ~18:26Z |
| https://developers.google.com/search/docs/appearance/structured-data/book | 2025-12-10 | ~18:26Z |
| https://developers.google.com/search/docs/appearance/structured-data/search-gallery | 2026-06-15 | ~18:26Z |
| https://developers.google.com/search/docs/appearance/ai-features | 2025-12-10 | ~18:26Z |
| https://developers.google.com/search/docs/appearance/google-discover | 2026-03-09 | ~18:26Z |
| https://support.google.com/merchants/answer/6149970 ; /6150006 | n/d | ~18:26Z |
| https://developers.google.com/search/docs/appearance/structured-data/faqpage | FAQ removed per changelog 2026-05-08 | ~18:27Z |
| https://developers.google.com/search/docs/appearance/structured-data/profile-page | 2026-09-08 | ~18:27Z |
| https://developers.google.com/search/docs/appearance/structured-data/event | 2026-09-08 | ~18:27Z |
| https://developers.google.com/search/docs/appearance/enable-web-stories | 2026-07-01 | ~18:27Z |
| https://developers.google.com/search/updates (changelog 2025-01 to 2026-09-24) | 2026-09-24 entry | 18:27:19Z |
| https://developers.google.com/search/docs/appearance/search-profiles | 2026-09-16 | ~18:28Z |
| https://support.google.com/websearch/answer/16904498 | n/d | ~18:28Z |
| https://developers.google.com/search/docs/appearance/preferred-sources | 2026-09-18 | ~18:28Z |
| https://developers.google.com/search/docs/fundamentals/ai-optimization-guide | 2026-07-10 | ~18:28Z, ~18:33Z |
| https://play.google.com/books/publish/autonarrated/ | n/d | ~18:28Z |
| https://support.google.com/books/partner/ (index), /answer/14164701, /9358246, /9331459, /10010291, topic/11098072 | n/d | ~18:28-18:29Z |
| https://podcasts.google.com/ (301) and https://music.youtube.com/googlepodcasts | live | ~18:28Z |
| https://support.google.com/youtube/answer/13525207 (RSS podcasts) | n/d | ~18:28Z |
| https://support.google.com/youtube/answer/2801964 ; /9229611 ; /72851 | n/d | ~18:29Z |
| https://support.google.com/youtube/answer/9884579 (chapters) | n/d | 18:29:46Z |
| https://support.google.com/youtube/answer/2657964 ; /12796915 | n/d | ~18:30Z |
| https://support.google.com/adspolicy/answer/6014299 ; /176031 | n/d | ~18:30Z |
| https://www.google.com/grants/eligibility/ ; https://support.google.com/grants/answer/117827 | n/d | ~18:31Z |
| https://support.google.com/webmasters/answer/9012289 | n/d | ~18:31Z |
| https://developers.google.com/search/docs/appearance/google-images | n/d | ~18:31Z |
| https://support.google.com/news/publisher-center/answer/9607025 | n/d | ~18:31Z |
| https://developers.google.com/search/apis/trends ; trends.google.com explore (HTTP 429) | n/d | 18:31:17Z |
| https://support.google.com/google-ads/answer/7337243 | n/d | ~18:31Z |
| Liveness checks for Alerts, Looker Studio, Tag Manager, Analytics, Blogger, Sites, Forms, Search Console, Trends, profile.google.com, Keyword Planner, Play Partner, Business, Publisher Center, Merchant, Scholar, Lens, YouTube podcasts, News, Books (all HTTP 200) | live | 18:32:15Z |
| https://developers.google.com/search/docs/appearance/structured-data/merchant-listing | n/d | ~18:33Z |
| https://support.google.com/webmasters/answer/7576553 ; /16984139 | n/d | ~18:33Z |
| https://blog.google/products/search/google-search-perspectives/ | 2023-05-10 | ~18:33Z |
| https://support.google.com/books/partner/answer/3474239 ; /9827742 | n/d | ~18:33Z |
| https://developers.google.com/search/docs/essentials/spam-policies | 2026-08-28 | ~18:36Z |
| https://support.google.com/analytics/answer/10917952 | n/d | ~18:36Z |
| https://developers.google.com/search/docs/fundamentals/creating-helpful-content | 2025-12-10 | ~18:36Z |
| https://support.google.com/adspolicy/answer/2423645 ; https://scholar.google.com/intl/en/scholar/inclusion.html | n/d | ~18:37Z |

*Captures were held in shell variables only. Nothing was read from or written to local files. Saved through the GitHub API to `work/site-visibility`.*