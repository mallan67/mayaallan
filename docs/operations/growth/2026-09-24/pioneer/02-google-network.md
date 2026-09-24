# Google network map for an author: the pioneer lens (2026-09-24)

**Scope.** Every Google property or program that Maya Allan (author of *Psilocybin Integration Guide*, www.mayaallan.com) can use in 2026. For each one: live status taken from Google's own pages, how to get in, what links and tags it allows, and its value for leads.
**Method.** Live GET/WebFetch of Google documentation and public pages on 2026-09-24, 18:24Z-18:41Z UTC. Nothing here comes from memory. Anything that could not be read live is marked **UNVERIFIED**. No logins were used: Search Console, Play Books Partner Center, Ads and Merchant Center dashboards were **not** opened.
**Limits.** The WebSearch budget for this session was already used up, so every source was fetched directly by its URL. The Google Books API (429 quota) and the Trends explore endpoint (429) could not be read.

---

## 0. Live baseline: what Google can see today

| Fact | Live value | Source, read (UTC) |
|---|---|---|
| Ebook on Google Play | Listed: "Psilocybin Integration Guide: 40 Real Scenarios for Navigating What You See, Feel & Experience", EBook, **ISBN 9798994148891**, **$9.99 USD**, datePublished 2025-12-15. No rating data in the page markup | play.google.com/store/books/details?id=HvafEQAAQBAJ, 18:25:45Z / 18:38:40Z |
| Ebook on Google Books | About page id=HvafEQAAQBAJ. "Preview this book, Selected pages" (preview is ON). 289 pages. Publisher "Maya Allan, 2025". Self-Help > Personal Growth. Retailer links: Amazon / Books-A-Million / IndieBound (by ISBN). **0 references to mayaallan.com** | books.google.com/books?vid=ISBN9798994148891, 18:33:27Z / 18:38:40Z |
| Print edition on Google Books | id=E6rF0QEACAAJ, ISBN 9798994148839, author shown as **"MAYA. ALLAN"**, publisher "Amazon Digital Services LLC - Kdp", Dec 13 2025, no preview | books.google.com/books?vid=ISBN9798994148839, 18:33:27Z |
| Search Console | A `google-site-verification` TXT record exists on mayaallan.com. Whether the property is actually verified and who owns it is **UNVERIFIED** (no login) | dns.google/resolve?name=mayaallan.com&type=TXT, 18:34:18Z |
| Owned domains | psilowire.com, www.psilowire.com and psilocybinintegrationguide.com return **308** to www.mayaallan.com, keeping the path | curl, 18:34:30Z |
| Sitemap | 38 URLs. Only **1 of the 40 book scenarios** has its own page (/scenarios/ego-dissolution) | /sitemap.xml, /scenarios, 18:39:38Z |
| robots.txt | Allows Googlebot, Googlebot-Image, Googlebot-News, Google-Extended and GoogleOther. Sitemap is declared | /robots.txt, 18:25:08Z |
| Book JSON-LD | `Book` has only an ASIN identifier (B0G7JWDJYQ). It has **no `isbn`, no `offers`, no `workExample`**. Author `sameAs` is Instagram only | /books/psilocybin-integration-guide, 18:33:53Z |
| Person entity | Person has jobTitle "Author and Educator" and knowsAbout[...]. sameAs is only instagram.com/maya.allan66. **No `ProfilePage`** on /about. The blog `Article` author.url points to the homepage | /about, /blog/psilocybin-integration-research, 18:38:16Z |
| Instagram (the only sameAs) | **18 followers**, 1 following, 3 posts | instagram.com/maya.allan66 og:description, 18:34:07Z |
| YouTube | No channel at @mayaallan, @MayaAllanAuthor, @maya.allan66 or @mayaallan66 (all HTTP 404) | youtube.com/@..., 18:34:07Z |
| Google tag | No gtag, GTM or `G-` id in the homepage HTML | /, 18:25:08Z |
| Discover image signals | Blog pages set `max-image-preview:large`. Book og:image is 1200x630 | 18:31:49Z / 18:25:19Z |
| /faq | FAQPage with 20 Questions. Google no longer shows FAQ rich results (see goog-25) | /faq, 18:38:16Z |
| /events | "No events are currently scheduled". No Event JSON-LD | /events, 18:38:16Z |

---

## 1. How a pioneer reads the Google network

1. **Google is one entity graph, not 40 separate products.** Books/Play, YouTube, Search Console, the Knowledge Panel, Search profiles and the site's schema all resolve to one "Maya Allan" entity. Today that entity is split. Google Books has two spellings of the author ("Maya Allan" and "MAYA. ALLAN"). The only sameAs is an Instagram account with 18 followers. There is no YouTube channel. **First move ($0, a few days): make every Google surface agree** on name, book, ISBNs, cover and canonical URLs.
2. **Maya has an advantage that blog competitors lack: Google Books full-text search.** Google "scans the full text" of the book, so a search that matches words on any page can list it (Preview Program, goog-09). The **40 scenarios are 40 long-tail entry points that Google has already indexed.** The site mirrors only 1 of them. Build the matching scenario pages on the site and link the two surfaces both ways.
3. **YouTube is the only open Google surface with its own search engine, its own recommendation feed and its own podcast app (YouTube Music).** It does not require an existing audience. The constraint: YouTube lists "Psilocybin & Psilocybe (magic mushrooms)" among hard drugs, so every video needs educational/documentary (EDSA) framing. Integration content (after the experience, nervous system, belief work) fits that framing naturally. Dosing, sourcing and preparation do not.
4. **Paid Google is mostly closed. Don't spend month 2 fighting policy.** Google Ads bans ads for "substances that alter mental state" and for "instructional content about ... using recreational drugs". Ad Grants requires charity status. Merchant Center excludes ebooks.
5. **Google's new 2026 surfaces reward an audience you already own.** Preferred sources works for any domain, has a deep-link button and now reaches AI Mode and AI Overviews. Search profiles are US-only and need 10k followers. Search Console's Generative AI report reached all sites on 2026-08-31. **Add the Preferred-sources button now. Plan the Search-profile claim for later.**
6. **psilowire.com is a news-wire name sitting on a redirect.** A pioneer tests it as a real, edited psilocybin policy and research wire, covering state programs, trials and law changes. Top Stories, News and Discover consider publishers automatically, with no application, and Preferred sources works at domain level. This works **only if it is genuinely edited**: Google's site-reputation-abuse and scaled-content-abuse policies (page updated 2026-08-28) penalize thin site networks.
7. **What a savvy engineer does not do:**
   - uses the Indexing API for blog posts (it is only for JobPosting and BroadcastEvent)
   - adds llms.txt or "AI markup" for Google (Google says neither is needed)
   - chases FAQ, HowTo or Book Actions rich results (removed or restricted)
   - blasts directory or bookmark links, or cross-links satellite Blogger/Sites pages (Google names these as link spam)

---

## 2. Inventory: status from Google's own pages

| id | Property | Status 2026-09-24 | Fit for Maya now | Lead value |
|---|---|---|---|---|
| goog-01 | Search + Search Console | LIVE | Core | high |
| goog-02 | Search Console Generative AI report | LIVE (all sites since 2026-08-31) | Measure AI citations | medium |
| goog-03 | URL Inspection / Request indexing | LIVE (daily limit) | New pages only | low |
| goog-04 | Indexing API | LIVE, restricted | **Not applicable** (JobPosting/BroadcastEvent only) | none |
| goog-05 | Google Business Profile | LIVE | **Not eligible** (online-only) | none now |
| goog-06 | Knowledge Panel claim | LIVE | Only if a panel exists (UNVERIFIED) | medium |
| goog-07 | Search profiles (profile.google.com) | LIVE, **new 2026**, US | Not eligible yet (10k followers) | high later |
| goog-08 | Preferred sources | LIVE | Yes, any domain | low-medium |
| goog-09 | Google Books Preview / full text | LIVE, **already listed** | Yes | high |
| goog-10 | Google Play Books ebook store | LIVE, **listed at $9.99** | Yes: promo codes, 7% affiliate | medium-high |
| goog-11 | Play Books audiobook upload | LIVE (select publishers; US included) | When the audiobook is done | medium |
| goog-12 | Play Books auto-narrated audiobook | LIVE (policies labeled Beta) | Optional interim | medium |
| goog-13 | Merchant Center free listings | LIVE | **Ebook ineligible**; audiobook UNVERIFIED | low |
| goog-14 | Product / merchant-listing markup | LIVE | Add Offer; ebook eligibility UNVERIFIED | low |
| goog-15 | YouTube long-form | LIVE | Yes, with EDSA framing | high |
| goog-16 | YouTube Shorts | LIVE | Reach; link rules UNVERIFIED | medium |
| goog-17 | YouTube podcasts via RSS + YouTube Music | LIVE (select countries) | Yes | medium-high |
| goog-18 | YouTube health source features | LIVE | **Licensed professionals only** | none now |
| goog-19 | YouTube Partner Program | LIVE | Later | low |
| goog-20 | Google Discover | LIVE, automatic; Follow removed | Yes | medium |
| goog-21 | Google News / Top Stories / Publisher Center | LIVE, automatic | Low for the book site; psilowire idea | low / medium |
| goog-22 | Web Stories | LIVE (doc 2026-07-01) | AMP effort | low |
| goog-23 | Event rich results + Maps | LIVE, **physical events only** | Only for in-person events | medium when used |
| goog-24 | ProfilePage structured data | LIVE (doc 2026-09-08) | Yes (/about) | medium |
| goog-25 | Deprecated rich results (FAQ, Book Actions, ...) | **DEAD / restricted** | Don't build for them | none |
| goog-26 | Google Images / Lens | LIVE | Cover and alt hygiene | low-medium |
| goog-27 | AI Overviews / AI Mode | LIVE | Yes, no special markup | high long-run |
| goog-28 | "Perspectives" filter | **UNVERIFIED** (2023 launch post only) | Don't plan on it | unknown |
| goog-29 | Google Trends UI + Trends API | UI LIVE; API alpha (apply) | Research | low-medium |
| goog-30 | Keyword Planner | LIVE (needs Ads account + billing info) | Research | medium |
| goog-31 | Google Alerts | LIVE | PR and mention monitoring | medium |
| goog-32 | Google Ads | LIVE, **restricted for drug content** | High disapproval risk | low |
| goog-33 | Ad Grants | LIVE | **Not applicable** (charity status) | none |
| goog-34 | Google Analytics 4 | LIVE | Not detected on site | high (measurement) |
| goog-35 | Tag Manager | LIVE | Optional | low |
| goog-36 | Looker Studio | LIVE (now datastudio.google.com/overview) | Dashboard | low |
| goog-37 | Forms / Sites / Blogger | LIVE | Low; link-spam risk | low |
| goog-38 | Google Scholar | LIVE | Only for a genuine referenced paper | low |
| goog-39 | Google Podcasts | **DEAD** | Use YouTube Music | none |
| goog-40 | Discover "Follow" (RSS) | **DEAD** (removed 2025-11-19) | Use Search profiles later | none |

---

## 3. Mechanics per property

### goog-01 Google Search + Search Console: LIVE, high
- **Get in:** use a Domain property. The TXT token is already in DNS; confirm in Search Console that the property is verified and the owner list is correct. Submit `/sitemap.xml`. You can also add the two redirect domains as properties to watch the 308s.
- **Link/tag:** organic clicks arrive as google / organic. Never add UTMs to your own canonical URLs.
- **Source:** search.google.com/search-console/about (HTTP 200, 18:32:15Z).

### goog-02 Search Console Generative AI performance report: LIVE, medium
- Shows **impressions in AI Overviews and AI Mode**, broken down by page, country, date and device. Discover AI has a separate report.
- Google "rolled out these insights to all websites worldwide" as of **Aug 31, 2026**. Sites with low volume may not see the report yet.
- Direct link: `https://search.google.com/search-console/performance/search-analytics/ai`
- **Source:** support.google.com/webmasters/answer/16984139 (no date on page; read about 18:33Z).

### goog-03 URL Inspection, Request indexing: LIVE, low
- There is "a daily limit to how many index requests you can submit". "Submitting a request does not guarantee that the page will appear in the Google Index."
- Use it only for new scenario pages and the book page.
- **Source:** support.google.com/webmasters/answer/9012289 (about 18:31Z).

### goog-04 Indexing API: not applicable
- Only for pages with "JobPosting or BroadcastEvent embedded in a VideoObject". Using it for blog or book pages is misuse.
- **Source:** developers.google.com/search/apis/indexing-api/v3/quickstart (updated 2026-07-16; about 18:26Z).

### goog-05 Google Business Profile: not eligible (online-only)
- "If your business either has a physical location that customers can visit, or travels to customers where they are, you can create a Business Profile." Virtual offices are ineligible. A co-working office qualifies only with signage and staff on site during business hours.
- It becomes relevant **only if** Maya delivers in-person services at a staffed location or travels to clients (one service-area profile). The website link would then be tagged `?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
- **Source:** support.google.com/business/answer/3038177 (about 18:26Z).

### goog-06 Knowledge Panel: LIVE, claimable only if a panel exists
- **Steps:** search for yourself, click "Claim this knowledge panel", then sign in to one of the official profiles listed. The accepted profiles are **YouTube, Search Console, Twitter/X and Facebook**. Instagram is not listed.
- Google "doesn't manually create or delete Knowledge Panels", and "Not all knowledge panels are claimable".
- Once verified you can suggest changes to the featured image, title, subtitle and social profile links.
- Whether a panel exists for "Maya Allan" is **UNVERIFIED**: this workflow had no access to Google result pages.
- **Pioneer move:** a YouTube channel and Search Console are two of the four verification keys, so set both up before a panel appears. Correct "MAYA. ALLAN" on the KDP print record so Google Books stops splitting the author entity.
- **Sources:** support.google.com/knowledgepanel/answer/7534902 and /7534842 (about 18:26Z).

### goog-07 Google Search profiles: LIVE, new in 2026, US only, not eligible yet
- A profile "brings together your content from across the web and social platforms into a single destination on Google": Instagram, TikTok, YouTube, X, Facebook and your website. When people follow the profile, your content becomes "more likely to appear for your audience on Google Discover".
- **Eligibility:** at least **10,000** subscribers or followers on YouTube, Instagram, X or TikTok; age 18+; "currently only available in the United States". Claim at profile.google.com/claim.
- **Badge:** links to `https://profile.google.com/@handle`, or use the text link "Find us on Google Search". The badge guide was published 2026-09-16.
- **Gap today:** Instagram has 18 followers, 9,982 short of the threshold. This is the reason to commit to **one** platform. YouTube is the better pick because it also serves as a Knowledge Panel verification key.
- **Sources:** developers.google.com/search/docs/appearance/search-profiles (updated 2026-09-16); support.google.com/websearch/answer/16904498 (about 18:28Z).

### goog-08 Preferred sources: LIVE, low-medium, $0
- When users choose your site as a preferred source, it becomes more likely to appear in Top Stories with a "preferred" badge, and also in **AI Mode and AI Overviews**. For AI Mode and Overviews, the site must be included in Search generative AI features in Search Console.
- Works for any domain or subdomain, but **not** for a subdirectory such as /blog.
- **Deep link:** `https://www.google.com/preferences/source?q=mayaallan.com`, or use Google's two-line JS button.
- **Timeline (changelog):** launched 2026-01-30; expanded to all languages 2026-04-30; rolled out to AI Overviews and AI Mode 2026-05-27; custom button added 2026-08-20.
- **Placement:** blog post footers, the newsletter footer, and the ebook thank-you/download page.
- Whether mayaallan.com is currently offered in the tool is **UNVERIFIED**: the page rendered empty for the fetcher.
- **Source:** developers.google.com/search/docs/appearance/preferred-sources (updated 2026-09-18; about 18:28Z).

### goog-09 Google Books Preview / full-text search: LIVE, already listed, high
- Publishers "choose to make 20% to 100% of your book's content browseable". The program scans the full text, so "if a user searches a word that appears on a page of your book, your book can be listed". Google shows "links of major book retailers" plus Google Play.
- **Now:** the ebook preview is ON ("Selected pages"). The print record has no preview and shows the misspelled author.
- **Mechanics:**
  - Play Books Partner Center, Book Info tab: the publication date controls preview availability in the new Google Books UI.
  - Preview traffic reports are at support answer 3323499.
  - **Test a larger browseable percentage** and watch the preview traffic reports. The 40 scenarios are the hook.
- **Links:** you cannot add a link to your own site. The Google Books page lists retailers by ISBN only.
- **Link format for your site** (from support answer 3474239): `https://books.google.com/books?vid=ISBN9798994148891`, optionally with `&printsec=frontcover`. Use this, or the about-page URL, in `Book.sameAs`.
- **Sources:** support.google.com/books/partner/answer/10010291 and /3474239 (about 18:29Z and 18:33Z).

### goog-10 Google Play Books ebook store: LIVE, listed, medium-high
- **Revenue split:** 70% in 60+ countries for partners who accepted the updated TOS (introduced in 2019). 52% for partners who have not, and in some countries. Source: answer 9331459.
- **Promo codes:** up to **3 campaigns a month, 5,000 codes each**. Codes can be free, a percentage off (ebooks only) or a fixed price. The end date can be up to 3 years out. Campaigns can be paused but not edited. Source: answer 9827742.
- **Affiliates:** "earn **7%** commission" on qualifying ebooks and audiobooks bought within 24 hours of a referral. Open to active Play Books partners through a sign-up link on the Partner Center homepage. Source: answer 9358246.
- **Other promotions:** promotional pricing campaigns, series subscription discounts and bundle discounts. Source: topic 11098072.
- **Lead mechanics:**
  - Give free promo codes in return for joining the email list.
  - Give codes to integration circles and facilitators so they leave reviews. Reviews build up on the Google Play listing, which is a trust signal on a Google surface.
- **Tag:** from Maya's own pages, link to Play through the affiliate link once enrolled. Whether Play reports UTM parameters back to the publisher is **UNVERIFIED**.
- **Sources:** support.google.com/books/partner/... (about 18:28-18:33Z).

### goog-11 Play Books audiobook upload: LIVE, medium (when the audiobook ships)
- "This program is currently limited to select publishers in: Australia, Brazil, Canada, France, Germany, Ireland, Mexico, New Zealand, Spain, Switzerland, United Kingdom, **United States**".
- Titles already sold through a distributor can be moved over with a form. Custom audiobook tables of contents are supported (answer 17017903). Promo codes work for audiobooks (free or fixed price).
- **Source:** support.google.com/books/partner/answer/14164701 (about 18:28Z).

### goog-12 Play Books auto-narrated audiobook: LIVE, optional
- **Requirements:** an EPUB ebook that is on sale on Google Play. Languages include English. Non-fiction and self-help work best.
- **Cost:** "For a limited time, there's no charge to create, publish, and download."
- **Distribution:** files can be downloaded and sold elsewhere, but "if the auto-narrated audiobook is for sale elsewhere, it must also be for sale on Google Play Books". The page states a 52% revenue share.
- **Decision for Maya:** use it as an interim Play-only audio edition while the produced audiobook is finished, or skip it so there aren't two competing audio editions.
- **Source:** play.google.com/books/publish/autonarrated/ (about 18:28Z).

### goog-13 Merchant Center free listings / Shopping: ebook ineligible
- The unsupported-content list includes "eBooks and digital books (**not including audiobooks**)" (PDF, ePub, MOBI) and "Services".
- **Audiobooks are carved out** of that exclusion, so an audiobook sold directly on mayaallan.com *might* be listable. **UNVERIFIED**: not tested, and it needs a merchant account.
- **Print:** sold through KDP and Bookshop, not on-site. The merchant must be the seller, so print is not eligible.
- **Source:** support.google.com/merchants/answer/6150006 (about 18:26Z).

### goog-14 Product / merchant-listing structured data: limited
- "Only pages where a shopper can purchase a product are eligible for merchant listing experiences, not pages with links to other sites." Merchant listings need an `Offer` with price > 0. Product snippets accept `Offer` or `AggregateOffer`. Digital goods are not mentioned, so ebook eligibility is **UNVERIFIED**.
- **Action ($0):** add `offers` (price, priceCurrency, availability, url) inside the Book JSON-LD.
- **Source:** developers.google.com/search/docs/appearance/structured-data/merchant-listing (about 18:33Z).

### goog-15 YouTube long-form channel: LIVE, high
- **Policy:**
  - YouTube's "Illegal or regulated goods or services" policy lists **"Psilocybin & Psilocybe (magic mushrooms)"** among hard drugs.
  - Prohibited: content that aims to "directly sell, link to, or facilitate access to" drugs, and "Non-educational content that explains how to make drugs".
  - Allowed: content with **EDSA** (Educational, Documentary, Scientific, or Artistic) context, but this is "not a pass to promote content intended to sell, create, or facilitate access".
  - Sources: support.google.com/youtube/answer/9229611 and /2801964 (about 18:29Z).
- **Content that fits:** integration after the experience, nervous-system reset, belief inquiry, and scenario walkthroughs. **Never** dosing, sourcing or preparation, and never a link to any seller or retreat that sells.
- **Get in:**
  - Create a channel and claim a handle. @mayaallan returned 404 at 18:34Z, so it looks unused; whether it is available is **UNVERIFIED**.
  - Add up to **14 profile links** under YouTube Studio > Customization > Profile. The first link shows next to Subscribe. Source: answer 2657964.
- **Chapters:** the first timestamp is 00:00, with at least three timestamps in ascending order; automatic chapters are optional. Source: answer 9884579 (18:29:46Z).
- **Links and tags:** tag every description link `?utm_source=youtube&utm_medium=video&utm_campaign=<video-slug>` and channel links `?utm_source=youtube&utm_medium=profile&utm_campaign=channel`. Treat these links as referral traffic, not SEO link equity; their rel attribute is **UNVERIFIED**.

### goog-16 YouTube Shorts: LIVE, medium
- Good for scenario cut-downs. Whether links in Shorts descriptions are clickable in 2026 is **UNVERIFIED**: the help pages could not be read this session. Point viewers to the channel links and the related long-form video instead.

### goog-17 YouTube podcasts (RSS) + YouTube Music: LIVE, medium-high
- **How it works:**
  - Submit an RSS feed. YouTube creates a video for each episode using the show art, and new episodes upload automatically.
  - Episodes are "available on YouTube and YouTube Music".
  - RSS ingestion is only "available in select countries/regions".
- **Rules:**
  - No ads inside the audio.
  - Branded content and sponsorships must be declared.
  - Audio can't be replaced after publishing.
  - Episodes first upload as private.
- This is Google's **only** podcast surface: Google Podcasts is dead (goog-39).
- **Pioneer use:** an "Integration Scenarios" podcast, one 5-12 minute episode per scenario, reusing the audiobook production. Put an EDSA framing line in every episode. Show notes link to the matching scenario page with `utm_source=youtube&utm_medium=podcast&utm_campaign=<scenario>`.
- **Note:** the site has no RSS feed (/rss.xml, /feed.xml and /blog/rss.xml all 404 at 18:31:49Z), so the feed must be hosted somewhere.
- **Source:** support.google.com/youtube/answer/13525207 (about 18:28Z).

### goog-18 YouTube health source features: not applicable unless licensed
- Open only to licensed doctors, nurses, psychologists, marriage and family therapists, clinical social workers and similar. The channel needs more than 1,500 watch hours in 12 months, or 1.5M Shorts views in 90 days. LegitScript verifies licenses. Available in 10 countries, including the US.
- The site calls Maya an "Author and Educator" and the book "non-clinical", so this does not apply.
- **Source:** support.google.com/youtube/answer/12796915 (about 18:30Z).

### goog-19 YouTube Partner Program: later
- Requires 1,000 subscribers plus either 4,000 watch hours in 12 months or 10M Shorts views in 90 days. The goal is leads, not ad revenue.
- **Source:** support.google.com/youtube/answer/72851.

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