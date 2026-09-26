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

---

*Continued in [02-google-network-part2.md](02-google-network-part2.md): goog-20 to goog-40, the tagging convention, the pioneer sequence, the UNVERIFIED list and all sources with read times.*