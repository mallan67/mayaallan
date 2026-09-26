# All search engines & vertical search — pioneer map (2026-09-24)

Scope: every web engine, vertical/retail engine and AI answer engine where a reader of *The Psilocybin Integration Guide* could find Maya Allan / www.mayaallan.com — who owns each index, how to get in, whether a link comes back, how to tag it, cost, lead value, status.

Evidence rule: each load-bearing claim carries a source ID `[Sx]`; the **Sources** table at the end gives URL, the page's publication/update date where the page shows one, and the UTC time it was read live on 2026-09-24. WebFetch reads are bracketed by the `date -u` stamps taken before/after each batch. **UNVERIFIED** = the live source could not be read at research time; nothing was filled from memory. Secondary sources (Wikipedia) are labelled as such.

---

## 0. The pioneer's view in one screen

The long list of "search engines" collapses into **six pipes**. Wire each pipe once instead of chasing 40 logos:

| # | Pipe (index owner) | What it feeds (verified) | One action that reaches it |
|---|---|---|---|
| 1 | **Google index** | Google Search, Discover, AI Overviews, AI Mode [S25][S29]; Gemini "Grounding with Google Search" [S26]; Startpage (paid Google + Bing, secondary) [S38]; Ecosia (predominantly Google, secondary) [S36] | Search Console (already DNS-verified [S9]) + sitemap [S22] |
| 2 | **Bing index** | Bing; Yahoo ("using Microsoft Bing", secondary) [S39]; DuckDuckGo links "largely source from Bing" [S19]; Copilot + Bing AI summaries + "select partner integrations" citations [S20]; part of Qwant/Ecosia (secondary) [S36][S37] | Bing Webmaster Tools + **IndexNow** — one ping is "automatically shared with all other participating search engines" (Bing, Naver, Seznam.cz, Yandex, Yep) [S17][S18] |
| 3 | **Independent indexes with no submission door** | Brave (30B+ pages, own index, sold as API to AI firms) [S41]; Mojeek (9B pages, 2025) [S43]; Kagi's Teclis/TinyGem [S44]; EUSP "Staan" (Ecosia+Qwant) [S36][S37] | Only links from pages they already crawl, and real visits (Brave Web Discovery Project, secondary [S42]) |
| 4 | **Apple** | Applebot powers Spotlight, Siri and Safari search; ranking uses engagement, relevance, "number and quality of links", location, design [S48] | No console. Keep Applebot allowed (it is [S1]); earn links |
| 5 | **AI answer crawlers** | OAI-SearchBot → ChatGPT search [S64]; PerplexityBot → Perplexity [S65]; Claude-SearchBot → Claude search [S34]; Meta-WebIndexer → Meta AI citations [S66] | robots.txt allow (done [S1]) + be the page worth citing; Copilot citations are measurable in Bing WMT [S20][S21] |
| 6 | **Retail / vertical engines** (where book buyers search) | Amazon search + **Alexa for Shopping** (Rufus renamed 2026-05-13) [S50]; Google Play Books; Apple Books; Goodreads; Audible/Spotify audiobooks; YouTube; Pinterest; podcasts | Metadata + reviews + claimed profiles on each (sections 3–4) |

**The finding that matters most:** pipes 1–5 are already open (robots allows every major crawler, sitemap and llms.txt are live, Google is verified). The weakest pipe is #6 — the book's retail entity is nearly empty: Goodreads **0 ratings, 0 followers, author not claimed** [S7]; Amazon Best Sellers Rank **#3,949,951 in Books**, filed only under Inner Child / Emotional / Personal Transformation self-help — no psychedelic or integration category signal [S8]. Retail engines (and Alexa for Shopping, which answers from "customer reviews, community Q&As" [S50]) rank on exactly the signals that are missing.

---

## 1. Live baseline — what the engines see today

| Item | Live value | Src |
|---|---|---|
| robots.txt | 200 lines; explicit `Allow: /` for 33 named agents incl. Googlebot, Google-Extended, GoogleOther, Bingbot, DuckDuckBot, YandexBot, Applebot, Applebot-Extended, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, meta-externalagent, FacebookBot, Amazonbot, CCBot, YouBot; only `/admin/`, `/api/`, `/download/` disallowed | S1 |
| Agents not named (allowed via `User-Agent: *`) | Claude-SearchBot, Claude-User [S34], Meta-WebIndexer, Meta-ExternalFetcher [S66], OAI-AdsBot [S64]. `Claude-Web` and `anthropic-ai` are named in robots but are not in Anthropic's current bot list [S34] — harmless | S1 |
| `Host:` directive | present (a Yandex-specific directive) | S1 |
| sitemap.xml | 38 `<loc>`; 1 book page, 5 blog posts, tools, glossary; hreflang alternates en, es, pt-BR, de, fr, he | S2 |
| llms.txt | 200 `text/markdown` — Google states no special AI files/markup are needed for AI Overviews/AI Mode [S25] | S5 |
| Home structured data | WebSite, Organization, Person; `Person.sameAs` = Instagram only | S3 |
| Book page structured data | `Book` with ASIN B0G7JWDJYQ; `sameAs` → Amazon, B&N, Bookshop, ThriftBooks, AbeBooks, Goodreads, Google Play; **no `isbn`, no `offers`** | S4 |
| /about, /faq, /glossary | /about: FAQPage + Person, **no ProfilePage**; /faq: FAQPage (20 Q); /glossary: DefinedTermSet (25 terms) | S11 |
| Robots meta | `index, follow` — **no `max-image-preview:large`** (Discover large-image setting) | S11, S29 |
| RSS/Atom feed | **none**: /feed.xml, /rss.xml, /feed, /rss, /atom.xml, /blog/rss.xml, /blog/feed.xml all 404; no `rel=alternate` feed link on /blog | S12 |
| Verification | DNS TXT `google-site-verification` present on mayaallan.com; no `MS=` Bing TXT; /BingSiteAuth.xml 404 → Bing WMT status **UNVERIFIED** (may be verified by GSC import — owner to check) | S9, S10 |
| Satellite domains | psilowire.com, psilocybinintegrationguide.com (+www) → **308 to https://www.mayaallan.com/** (home, not the book page) | S10 |
| Analytics | CSP allows `va.vercel-scripts.com` / `vitals.vercel-insights.com` → Vercel Web Analytics is the referrer/UTM reader | S1 |
| Goodreads | book 245299940: ratingsCount 0, averageRating 0; author 65134359 `isGrAuthor:false`, followers 0; ISBN-13 9798994148839; 281 pages | S7 |
| Amazon | B0G7JWDJYQ: BSR #3,949,951 Books; #575 Inner Child Self-Help; #5,287 Emotional Self Help; #23,919 Personal Transformation Self-Help; author page `/Maya-Allan/e/B0G76975ST` exists ("Follow the author"); page title carries ISBN 9798994148853 (a second ISBN → a second format; owner to confirm) | S8 |
| Retail listings reachable | Goodreads, Google Play Books, Amazon, Bookshop, B&N, Instagram profile all HTTP 200 | S6 |
| Market signal | Oregon Psilocybin Services, 2026-04-01→2026-06-30: **1,220 clients served**, 966 individual + 91 group administration sessions (official CSV) | S14 |
| Market signal (other) | Colorado Natural Medicine Division: 403 / DNS error → UNVERIFIED. Reddit subscriber counts: about.json blocked from this environment → UNVERIFIED. Google Trends not read → UNVERIFIED | S13, S63 |

---

## 2. (a) Web search engines

Lead value = expected leads for *this* site (English, psychedelic integration, ebook/audiobook), not engine size.

| id | Engine | Whose index | How to get included / claimed | Link back | Tag | Cost / effort | Lead value | Status | Src |
|---|---|---|---|---|---|---|---|---|---|
| eng-google | Google Search (+ AI Overviews, AI Mode) | Own | GSC (verified [S9]); submit sitemap; URL Inspection "request indexing" has a quota and "requesting a recrawl multiple times… won't get it crawled any faster" (upd. 2025-12-10). AI Overviews/AI Mode: "no additional requirements… nor other special optimizations"; AI clicks appear in Performance → Web | Organic result = own URL | Never UTM organic/canonical URLs; measure in GSC | Free; wired | **High** | live | S22, S25 |
| eng-google-indexapi | Google Indexing API | — | "can only be used to crawl pages with either JobPosting or BroadcastEvent embedded in a VideoObject" (upd. 2026-07-16) — not for books/blog | — | — | — | none | **restricted** | S23 |
| eng-google-discover | Google Discover | Google | Automatic if indexed + policy-compliant; wants ≥1200 px images, >300k px, 16:9, `max-image-preview:large` (upd. 2026-03-09). Site lacks the meta setting [S11] | Own URL | — | 1 line of metadata + images | Medium | live | S29 |
| eng-google-profile | ProfilePage markup | Google | `mainEntity` Person + `sameAs`, image, description; valid for "Blog 'About Me' pages" (upd. 2026-09-08). /about lacks it [S11] | — | — | Small code change | Medium (entity) | live | S32 |
| eng-google-kp | Knowledge Panel claim | Google | Only if a panel already exists: "Claim this knowledge panel", then sign in to YouTube, Search Console, Twitter or Facebook; "Not all knowledge panels are claimable" | — | — | Free | Medium (trust) | live (no panel known) | S31, S33 |
| eng-google-gbp | Google Business Profile | Google | Requires a location customers visit or a service area; virtual offices ineligible → **online-only author not eligible** | — | — | — | none | **restricted** | S30 |
| eng-google-faq | FAQ rich results | Google | "The FAQ rich result feature is no longer shown in Google Search results" (doc removed 2026-06-15). Keep FAQPage only for other parsers/AI | — | — | — | none in Google | **DEAD** | S28 |
| eng-google-ping | Sitemaps ping endpoint | Google | Blog post "Sitemaps ping endpoint is going away" (June 2023); body not retrieved → shutdown date UNVERIFIED; do not use | — | — | — | none | **DEAD** (title verified) | S24 |
| eng-bing | Bing | Own | Bing Webmaster Tools; IndexNow (key file `{key}.txt` at root; GET `/indexnow?url=…&key=…` or POST ≤10,000 URLs). **AI Performance** report (2026-02-10): citations in Copilot, Bing AI summaries, partner integrations; Grounding Queries; page-level citations. Added 2026-06-16: Intents, Topics, Citation Share, Compare | Organic | Measure in Bing WMT | Free; ~1 h + IndexNow on deploy | **High per hour** (≈6 engines + Copilot) | live | S17, S18, S20, S21 |
| eng-bing-api | Bing Search APIs | — | "Bing Search APIs will be retired on August 11, 2025"; replacement is Grounding with Bing Search in Azure AI Agents | — | — | — | none | **DEAD** | S16 |
| eng-indexnow | IndexNow protocol | Shared | Participants: Microsoft Bing, Naver, Seznam.cz, Yandex, Yep; "Submitted URLs will be automatically shared with all other participating search engines." Google is not listed | — | — | Free; one route | High leverage | live | S17, S18 |
| eng-duckduckgo | DuckDuckGo | DuckDuckBot + "many indexes"; links "largely source from Bing" | No submission path documented → be in Bing | Organic | — | Free via Bing | Medium | live | S19 |
| eng-yahoo | Yahoo Search | Bing ("using Microsoft Bing to generate results") — secondary | Via Bing | Organic | — | Free via Bing | Low–med | live | S39 |
| eng-ecosia | Ecosia | "predominantly from Google" (2023) + Bing + own; Staan (EUSP with Qwant) partly serving since Aug 2025 (FR) — secondary | Via Google/Bing; no Staan submission path found → UNVERIFIED | Organic | — | — | Low | live | S36 |
| eng-qwant | Qwant | Staan (EUSP) + Bing — secondary | Via Bing | Organic | — | — | Low (FR) | live | S37 |
| eng-startpage | Startpage | Google + Bing ("for which it pays") — secondary; startpage.com not fetchable by WebFetch, 200 by GET | Via Google | Organic | — | — | Low | live | S38, S13 |
| eng-brave | Brave Search | Own: "over 30 billion pages… over 100 million page updates every day", "not a scraper"; API customers shown: Cohere, Mistral AI, Together.ai, AWS, Snowflake; 1.6B searches/month (Sept 2025, secondary) | No documented submission (help/indexing 404); discovery via links + opt-in Web Discovery Project (secondary) | Organic | — | Free; links | Medium (also feeds AI apps via API) | live | S40, S41, S42 |
| eng-mojeek | Mojeek | Own (MojeekBot), "9 billion pages" (2025) | No submission documented | Organic | — | — | Low | live | S43 |
| eng-kagi | Kagi | Own Teclis (web) + TinyGem (news) + "anonymized API calls to all major search result providers", Marginalia | Kagi **Small Web** curated list (open source on GitHub); site has no RSS [S12] → prerequisite gap; exact criteria UNVERIFIED | Organic | — | Free | Low volume, high intent | live | S44, S45 |
| eng-yandex | Yandex | Own | Yandex Webmaster: sitemap, "Reindex pages", "Check page status"; IndexNow participant | Organic | — | Free | Low (RU) | live | S46, S17 |
| eng-naver | Naver | Own | IndexNow participant; Search Advisor home 200 but docs not fetchable → mechanics UNVERIFIED | Organic | — | Free via IndexNow | Low (KR) | live | S17, S13 |
| eng-seznam | Seznam | Own | IndexNow participant | Organic | — | Free via IndexNow | Low (CZ) | live | S17, S13 |
| eng-yep | Yep | Own | IndexNow participant; yep.com returned 403 to our GET | — | — | Free via IndexNow | Low | UNVERIFIED | S17, S13 |
| eng-youcom | You.com | — | Pivoted from consumer search to AI tools (2023); "Shifts Away From Search Engine Plans" (Sept 2025) — secondary | — | — | — | Low | restricted | S47 |
| eng-apple | Apple (Spotlight, Siri, Safari) | Applebot | No console; Applebot allowed [S1]. Applebot-Extended "does not crawl webpages"; disallowing it only opts out of model training (page dated 2026-09-04) | Organic / suggestion | — | Free; links + engagement | Medium (iOS readers) | live | S48 |
| eng-baidu | Baidu | Own | ziyuan.baidu.com 200; mechanics not read → UNVERIFIED | — | — | — | ~none (English content) | UNVERIFIED | S13 |

**Engine math:** Google + one IndexNow-enabled Bing setup covers every engine above except Brave, Mojeek, Kagi's own index and Apple — and those four only discover a site through links from pages they already crawl. So after the two consoles, the next unit of work for *engines* is **links from crawled, relevant pages** (section 3 venues), not more submissions.

---

## 3. (b) Vertical search — where this reader actually searches

Books are bought inside retail search engines, and each one ranks on its own signals (metadata, reviews, claimed profiles). These are search engines in their own right.

| id | Venue | How to get listed / claimed (verified mechanics) | Link back to site | Tag | Cost / effort | Lead value | Status | Src |
|---|---|---|---|---|---|---|---|---|
| vert-amazon | Amazon search + **Alexa for Shopping** (Rufus renamed 2026-05-13; answers from "Amazon's extensive product catalog, customer reviews, community Q&As, and information from across the web") | KDP: "up to seven keywords or short phrases" (no title/author words, no "book", no competitor author names); **3 categories**, changes take up to 72 h. Author page already exists: amazon.com/Maya-Allan/e/B0G76975ST | None to site | Amazon ignores UTM; give each off-site placement its own link and count clicks in Vercel Analytics before the Amazon hop | Free; ~1 h | **High** (buyer intent) | live | S8, S50, S51, S52 |
| vert-play-books | Google Play Books / Google Books | Listing live (HTTP 200). **Auto-narrated audiobooks**: EPUB in English, Spanish, German, French, Hindi or Brazilian Portuguese; ebook must be on Google Play; "For a limited time, there's no charge"; 52% revenue share; if sold elsewhere "it must also be for sale on Google Play Books" | None | — | Free; ~2 h per language | High for audio launch | live | S6, S53 |
| vert-apple-books | Apple Books | "70% royalties on every ebook, regardless of price"; "digital narration" audiobooks; affiliate program. The book's Apple Books listing is **not** in Book.sameAs [S4] → presence UNVERIFIED | None | Apple affiliate link (terms UNVERIFIED) | Free | Medium | live | S54 |
| vert-audible | Audible via ACX | acx.com 200, but help pages 404/empty at read time → eligibility, royalties, exclusivity **UNVERIFIED** | None | — | — | High (audiobook in production) | UNVERIFIED | S13 |
| vert-spotify-audiobooks | Spotify for Authors | "Self-published authors can now publish their audiobooks directly to Spotify"; free creation "powered by ElevenLabs"; author profiles, redemption codes, "Page Match" | Profile (link rules UNVERIFIED) | `utm_source=spotify&utm_medium=audiobook` on any profile link | Free | Medium–high | live | S55 |
| vert-goodreads | Goodreads | Author Program is free for "any author… with a published book"; search book → click author → "Is this you? Let us know!"; ~2 business days; unlocks bio, blog, giveaways, ads, Ask the Author. Live: 0 ratings, author not claimed | Website field on author profile (rel UNVERIFIED) | `utm_source=goodreads&utm_medium=profile&utm_campaign=author-profile` | Free; 30 min | Medium–high (reader discovery + first ratings) | live | S7, S56 |
| vert-storygraph | The StoryGraph | app/homepage returned 403 to GET → mechanics UNVERIFIED | — | — | — | Medium | UNVERIFIED | S13 |
| vert-youtube | YouTube / YouTube Music (a Google surface) | Video channel; podcast **RSS ingestion** available in select countries — YouTube "will not… distribute your podcast to other platforms"; a YouTube account is one of the sign-ins that can verify a Google knowledge panel | Description / channel links (rel UNVERIFIED) | `utm_source=youtube&utm_medium=video&utm_campaign=<video-slug>` | Free; high effort | High (second Google surface) | live | S31, S58 |
| vert-google-podcasts | Google Podcasts | podcasts.google.com 301 → YouTube Music: "Google Podcasts is no longer available" | — | — | — | none | **DEAD** | S57 |
| vert-apple-podcasts | Apple Podcasts | Apple Podcasts Connect → "Add a show with an RSS feed"; feed validated; "your show will not be available… until an episode is added and published"; review before listing | Show-notes links | `utm_medium=podcast` | Free; medium | Medium | live | S59 |
| vert-spotify-podcasts | Spotify for Creators | Audio/video podcast tools, clips, comments, analytics; "Spotify Partner Program" monetization | Show-notes links | `utm_source=spotify&utm_medium=podcast` | Free | Medium | live | S60 |
| vert-pinterest | Pinterest (visual search) | Claim website via HTML tag, HTML file, DNS TXT (up to 72 h) or Merchant Center — pins then carry the profile + attribution; **Rich Pins** (Article/Product/Recipe) read Open Graph / schema.org | Pin → site (rel UNVERIFIED) | `utm_source=pinterest&utm_medium=social&utm_campaign=<board>` | Free; low–med | Medium (evergreen: journaling prompts, tools) | live | S61, S62 |
| vert-instagram | Instagram | Profile live (HTTP 200) and the only `sameAs` today; bio-link rules UNVERIFIED | Bio link | `utm_source=instagram&utm_medium=social&utm_campaign=bio` | Free | Medium | live | S3, S6 |
| vert-tiktok | TikTok search | Creator Academy page returned navigation only → bio-link requirements UNVERIFIED | Bio link (if eligible) | `utm_source=tiktok&utm_medium=social` | Free; high effort | Unknown | UNVERIFIED | S13 |
| vert-reddit | Reddit search (and Reddit threads shown in Google) | about.json and all Reddit hosts returned a network-security page to this environment → subscriber counts, link rules UNVERIFIED | Comment/post links (rel UNVERIFIED) | `utm_source=reddit&utm_medium=community&utm_campaign=<sub>` | Free; high effort, strict self-promo norms | Unknown | UNVERIFIED | S63 |
| vert-substack | Substack | Live check: outbound links inside a Substack post body carry **no `rel` attribute** (i.e. followed) on on.substack.com/p/shea-serrano-podcast; Recommendations help page 403 → mechanics UNVERIFIED | Followed body links (observed) | `utm_source=substack&utm_medium=newsletter&utm_campaign=<issue>` | Free; weekly writing | Medium–high (owned email list) | live | S15 |
| vert-medium | Medium | medium.com 403 to GET; outbound link attributes UNVERIFIED | — | `utm_source=medium&utm_medium=article` | Free | Unknown | UNVERIFIED | S13 |
| vert-linkedin | LinkedIn | linkedin.com 200; mechanics not read → UNVERIFIED | — | `utm_source=linkedin&utm_medium=social` | Free | Low–med (practitioner audience) | UNVERIFIED | S13 |

---

## 4. (c) AI answer engines — what each one reads (official statements)

| id | Engine | Index / crawler it uses (quoted) | How to get included | Site status | Tag / measure | Lead value | Status | Src |
|---|---|---|---|---|---|---|---|---|
| ai-chatgpt | ChatGPT search | "OAI-SearchBot is used to surface websites in search results in ChatGPT's search features"; GPTBot = training; ChatGPT-User = user actions; OAI-AdsBot validates "web pages submitted as ads on ChatGPT" | "allow OAI-SearchBot… and allowing requests from our published IP ranges"; robots changes take "~24 hours" | Allowed [S1] | Referrer `chatgpt.com` in Vercel Analytics; ChatGPT's own UTM parameter — official help page 403 → UNVERIFIED | High growth | live | S64 |
| ai-chatgpt-ads | Ads on ChatGPT | OAI-AdsBot exists to validate ad landing pages | Ad eligibility for psilocybin-related content UNVERIFIED | — | `utm_source=chatgpt&utm_medium=cpc` | Unknown | UNVERIFIED (policy) | S64 |
| ai-perplexity | Perplexity | PerplexityBot "surfaces and links websites in Perplexity search results"; Perplexity-User fetches on user request and "typically disregards robots.txt" | Allow PerplexityBot + published IP ranges | Allowed [S1] | Referrer `perplexity.ai`; publisher program page 403 → UNVERIFIED | Medium–high | live | S65 |
| ai-claude | Claude | ClaudeBot = training; Claude-User = user-requested fetches; Claude-SearchBot "navigates the web to improve search result quality"; blocking it "may reduce your site's visibility" (upd. 2026-04-07) | Allow Claude-SearchBot + Claude-User | Allowed via `*` [S1] | Referrer `claude.ai`; underlying search provider UNVERIFIED (trust page unreadable) | Medium | live | S34 |
| ai-copilot | Microsoft Copilot | Citations reported in Bing Webmaster Tools AI Performance (Copilot, Bing AI summaries, partners) → Bing index | Be in Bing (+ IndexNow) | Bing status UNVERIFIED [S9] | Bing WMT: citations, grounding queries, citation share | Medium–high, **measurable** | live | S20, S21 |
| ai-google | Google AI Overviews / AI Mode / Gemini | AI Overviews & AI Mode: "no additional requirements"; Gemini grounding "connects the Gemini model to real-time web content" with citations (upd. 2026-09-23); Google-Extended only limits training use | Be indexed in Google; snippet controls apply | Verified GSC [S9] | GSC Performance → Web (AI clicks not separated) | High | live | S25, S26 |
| ai-meta | Meta AI | Meta-WebIndexer "navigates the web to improve Meta AI search result quality" and lets Meta "cite and link to sources"; Meta-ExternalAgent = training/indexing; Meta-ExternalFetcher = user fetches | Allow Meta-WebIndexer | Allowed via `*` [S1] | Referrer `meta.ai` (meta.ai returned 403 to our GET) | Medium | live | S66 |
| ai-apple | Apple Intelligence / Siri | Applebot data powers Spotlight/Siri/Safari and "may also be used to help train Apple foundation models"; Applebot-Extended is the training opt-out only | Allow Applebot | Allowed [S1] | none | Medium | live | S48 |
| ai-alexa-shopping | Alexa for Shopping (ex-Rufus) | Catalog + reviews + community Q&A + web | Better listing metadata, reviews, Q&A on Amazon | Listing live, 0 Goodreads ratings [S7] | none | High (purchase intent) | live (renamed) | S50 |
| ai-brave-api | AI apps built on Brave Search API | Brave's own 30B-page index sold as API; logos: Cohere, Mistral AI, Together.ai, AWS, Snowflake | Get discovered by Brave (links) | n/a | none | Medium (indirect) | live | S41 |

**AI engine math:** every AI engine above reads one of four sources — Google's index, Bing's index, Brave's index, or its own crawler — plus retail catalogs. The site already allows all their crawlers [S1]; what decides citation is being the most specific, quotable page for a question. That is content work (covered by the parallel workflow), not submission work.

---

## 5. Tagging and linking conventions

**UTM rule:** `utm_source=<venue>&utm_medium=<type>&utm_campaign=<name>` — lowercase, hyphens, no spaces. Tag **only** links placed off-site by us (profiles, bios, show notes, newsletters, pins). Never tag internal links, canonical URLs, sitemap entries or links inside the book's retailer listings. Organic search and AI answers cannot be tagged by us: measure them in GSC [S22], Bing WMT AI Performance [S20] and Vercel Analytics referrers [S1].

| utm_source | utm_medium | example utm_campaign |
|---|---|---|
| goodreads | profile | author-profile |
| amazon-author | profile | author-bio (if Amazon allows a URL — UNVERIFIED) |
| youtube | video | `<video-slug>` |
| spotify / apple-podcasts | podcast | `<episode-slug>` |
| spotify | audiobook | launch-2026 |
| pinterest | social | `<board-slug>` |
| instagram / tiktok / linkedin | social | bio |
| reddit | community | `<subreddit>` |
| substack / medium | newsletter / article | `<issue-slug>` |
| chatgpt | cpc | only if ChatGPT ads become eligible (UNVERIFIED) |

**Entity links (`sameAs`) — what engines use to join the dots:**
- `Person.sameAs` today = Instagram only [S3]. Add every profile that *is* Maya Allan: Amazon author page `https://www.amazon.com/Maya-Allan/e/B0G76975ST` [S8]; Goodreads author `https://www.goodreads.com/author/show/65134359.Maya_Allan` (after claiming) [S7]; plus YouTube / Pinterest / Substack / Spotify author profiles when they exist.
- `Book`: add `isbn` and one `workExample` per format. Live data shows two ISBNs: 9798994148839 (Goodreads [S7]; AbeBooks URL in sameAs [S4]) and 9798994148853 (Amazon page title for B0G7JWDJYQ [S8]) — owner to confirm which format is which.
- /about: add `ProfilePage` with `mainEntity` Person (Google lists blog "About Me" pages as a valid use) [S32].
- Robots meta: add `max-image-preview:large` for Discover [S29].
- `psilocybinintegrationguide.com` currently 308s to the homepage [S10]; a person typing the book's name lands on the book page only if it redirects there.

---

## 6. Dead, renamed or restricted — do not plan around these

| Item | Live status | Src |
|---|---|---|
| Google sitemaps ping endpoint | "going away" (Google blog, June 2023) — DEAD; exact date UNVERIFIED | S24 |
| Google Indexing API for normal pages | Only JobPosting / BroadcastEvent — restricted | S23 |
| FAQ rich results in Google | "no longer shown in Google Search results" (doc removed 2026-06-15) — DEAD | S28 |
| Google Podcasts | "no longer available" → YouTube Music — DEAD | S57 |
| Google Business Profile for an online-only author | Not eligible | S30 |
| Bing Search APIs | Retired 2025-08-11 — DEAD | S16 |
| Amazon "Rufus" | Renamed **Alexa for Shopping** on 2026-05-13 | S50 |
| You.com consumer search | Pivoted to enterprise AI (secondary) | S47 |
| Knowledge panel "claim" | Only if a panel already exists; "Not all knowledge panels are claimable" | S33 |

---

## 7. What a pioneer does with this map (ranked by leads per hour)

1. **Fix the retail engines first.** They are the only engines where the searcher already has a card out. Re-pick the 3 KDP categories and 7 keyword phrases so the book appears where "psilocybin integration" readers browse (today: Inner Child / Emotional / Personal Transformation only) [S8][S51][S52]. Claim the Goodreads author profile (free, ~2 business days) and use its giveaway tool to reach first readers [S56][S7]. Alexa for Shopping answers from reviews and community Q&A, so the first honest reviews now feed an AI shopper too [S50].
2. **Wire the Bing half of the web in one sitting.** Bing Webmaster Tools + an IndexNow key file + a ping on each deploy. One ping reaches Bing, Naver, Seznam, Yandex and Yep [S17][S18]; Bing feeds Yahoo, most DuckDuckGo links and Copilot [S19][S20][S39]; and Bing WMT is the only first-party dashboard that shows **AI citations** (grounding queries, citation share) [S20][S21].
3. **Ship an RSS feed.** No feed exists today [S12]. A feed is the entry ticket for Kagi Small Web [S45], newsletter imports, feed readers and podcast-style syndication.
4. **Treat the audiobook as a search launch, not a file.** Google Play auto-narration is free "for a limited time" in 6 languages, 4 of which the site already has pages for (es, de, fr, pt) [S53][S2]; Spotify for Authors lets self-published authors publish directly [S55]; Apple Books offers digital narration [S54]; ACX terms UNVERIFIED. Each listing is another retail search surface with its own ranking.
5. **Open the audio/video vertical.** A short companion podcast feed → Apple Podcasts and Spotify [S59][S60] and YouTube via RSS [S58]. YouTube is also a sign-in path for a future knowledge-panel claim [S31].
6. **Complete the entity graph.** Add sameAs links (Amazon author page, Goodreads), ProfilePage on /about, `isbn` on Book [S3][S4][S32]. That is what lets Google, Bing and the AI engines treat "Maya Allan" as one known author. A knowledge panel can only be claimed once one exists [S33]; a Wikidata item needs "serious and publicly available references" [S67] — earn press or reviews first.
7. **Earn links on pages the independent indexes already crawl** (Brave 30B pages, Mojeek 9B, Apple uses "number and quality of links") [S41][S43][S48] — guest essays, podcast guest spots, integration-circle resource pages. Tag every such link (section 5).
8. **Point the exact-match domain at the book.** `psilocybinintegrationguide.com` → `/books/psilocybin-integration-guide` instead of the homepage [S10].
9. **Measure per engine weekly:** GSC (Google + AI Overviews/AI Mode lumped into Web) [S25], Bing WMT AI Performance [S20], Vercel Analytics referrers (chatgpt.com, perplexity.ai, claude.ai, copilot, gemini, meta.ai) [S1].

**Market sizing anchor:** Oregon's regulated program alone served **1,220 clients in Q2 2026** (Apr 1 – Jun 30) [S14] — people who have just had a supervised session, i.e. the exact reader of an integration guide. Colorado counts and Reddit community sizes could not be read live (UNVERIFIED).

---

## 8. Not done / UNVERIFIED (live source unreachable at read time)

- Reddit subscriber counts for r/microdosing, r/psilocybin, r/Psychonaut, r/RationalPsychonaut, r/psychedelics, r/PsychedelicTherapy, r/shrooms (all Reddit hosts returned a network-security page) [S63].
- Google Trends demand curves (not fetched); Google Books API record (HTTP 429 quota) [S68].
- Colorado Natural Medicine Division counts (403 / DNS error) [S13].
- ChatGPT search's underlying search partners and its UTM parameter (help.openai.com and openai.com returned 403).
- Claude web search's underlying provider (Anthropic trust page not readable).
- Perplexity Publishers Program terms (403).
- ACX/Audible eligibility and royalties (help pages 404/empty).
- TikTok and Instagram bio-link rules; StoryGraph, Medium, LinkedIn mechanics; Substack Recommendations mechanics.
- `rel` (follow/nofollow) on YouTube, Pinterest, Goodreads, Reddit, Medium links — only Substack post-body links were checked live [S15].
- Bing Webmaster Tools verification status for mayaallan.com (no public signal) [S9][S10].
- Naver Search Advisor, Seznam and Baidu console mechanics beyond IndexNow participation.
- Google sitemaps-ping exact shutdown date (blog body not retrieved) [S24].

---

## 9. Sources

All reads on 2026-09-24 (UTC). "Read" = exact `date -u` stamp for curl reads, or the bracketing window for WebFetch batches. "Page date" = publication/update date shown by the page itself ("n/s" = not shown).

**Live site and live listings (curl GET)**

| ID | Source | Page date | Read (UTC) |
|---|---|---|---|
| S1 | https://www.mayaallan.com/robots.txt and response headers of https://www.mayaallan.com/ (CSP) | n/s | 18:24:51Z–18:25:10Z |
| S2 | https://www.mayaallan.com/sitemap.xml | n/s | 18:24:51Z, 18:25:00Z |
| S3 | https://www.mayaallan.com/ (JSON-LD) | n/s | 18:25:00Z |
| S4 | https://www.mayaallan.com/books/psilocybin-integration-guide (JSON-LD, title, canonical) | n/s | 18:25:10Z |
| S5 | https://www.mayaallan.com/llms.txt | n/s | 18:25:10Z, 18:32:35Z |
| S6 | HTTP status of Goodreads, Google Play Books, Amazon, Bookshop, B&N listings and instagram.com/maya.allan66 | n/s | 18:26:53Z |
| S7 | https://www.goodreads.com/book/show/245299940-psilocybin-integration-guide (embedded JSON) | pub. field 2025-12-15 | 18:27:09Z |
| S8 | https://www.amazon.com/dp/B0G7JWDJYQ (title, Best Sellers Rank, author links) | n/s | 18:27:09Z–18:35:22Z |
| S9 | https://dns.google/resolve?name=mayaallan.com&type=TXT (and www, psilowire.com, psilocybinintegrationguide.com) | n/s | 18:32:20Z |
| S10 | HEAD psilowire.com, psilocybinintegrationguide.com (+www), mayaallan.com; GET /BingSiteAuth.xml | n/s | 18:32:35Z |
| S11 | Robots meta, og:image, JSON-LD types on /, /about, /faq, /blog/psilocybin-integration-research, /glossary | n/s | 18:33:20Z |
| S12 | GET /feed.xml, /rss.xml, /feed, /blog/rss.xml, /blog/feed.xml, /atom.xml, /rss; `<link>` scan of /blog | n/s | 18:34:42Z |
| S13 | GET reachability of 29 engine/venue homepages (search.google.com … acx.com) | n/s | 18:33:57Z |
| S14 | https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/OPS-Data-File-2026-Q2.csv (linked from the OPS Data Dashboard page) | period 2026-04-01→2026-06-30 | 18:31:59Z–18:32:06Z |
| S15 | https://on.substack.com/p/shea-serrano-podcast (outbound `<a>` attributes) | n/s | 18:30:05Z |
| S63 | https://www.reddit.com/r/<name>/about.json, old.reddit.com, api.reddit.com — blocked | — | 18:29:39Z, 18:29:51Z |
| S68 | https://www.googleapis.com/books/v1/volumes/HvafEQAAQBAJ — HTTP 429 | — | 18:35:02Z |

**Official documentation (WebFetch)**

| ID | Source | Page date | Read window (UTC) |
|---|---|---|---|
| S16 | https://learn.microsoft.com/en-us/lifecycle/announcements/bing-search-api-retirement | 2025-05-15 (upd. 2025-05-16) | 18:25:10Z–18:26:03Z |
| S17 | https://www.indexnow.org/ | n/s | 18:25:10Z–18:26:03Z |
| S18 | https://www.indexnow.org/documentation | n/s | 18:25:10Z–18:26:03Z |
| S19 | https://duckduckgo.com/duckduckgo-help-pages/results/sources | n/s | 18:25:10Z–18:26:03Z |
| S20 | https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview | 2026-02-10 | 18:25:10Z–18:26:03Z |
| S21 | https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare | 2026-06-16 | 18:25:10Z–18:26:03Z |
| S22 | https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl | upd. 2025-12-10 | 18:26:03Z–18:26:53Z |
| S23 | https://developers.google.com/search/apis/indexing-api/v3/quickstart | upd. 2026-07-16 | 18:26:03Z–18:26:53Z |
| S24 | https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping (title only retrieved) | June 2023 | 18:26:03Z–18:26:53Z |
| S25 | https://developers.google.com/search/docs/appearance/ai-features | upd. 2025-12-10 | 18:26:03Z–18:26:53Z |
| S26 | https://ai.google.dev/gemini-api/docs/google-search | upd. 2026-09-23 | 18:27:24Z–18:29:39Z |
| S28 | https://developers.google.com/search/docs/appearance/structured-data/faqpage | doc removed 2026-06-15 | 18:32:35Z–18:33:20Z |
| S29 | https://developers.google.com/search/docs/appearance/google-discover | upd. 2026-03-09 | 18:32:35Z–18:33:20Z |
| S30 | https://support.google.com/business/answer/3038177 | n/s | 18:30:23Z–18:31:59Z |
| S31 | https://support.google.com/knowledgepanel/answer/7534902 (claim flow) | n/s | 18:30:23Z–18:31:59Z |
| S32 | https://developers.google.com/search/docs/appearance/structured-data/profile-page | upd. 2026-09-08 | 18:32:35Z–18:33:20Z |
| S33 | Same claim-flow page as S31 (prerequisite "find your knowledge panel"; "Not all knowledge panels are claimable"); related: https://support.google.com/knowledgepanel/answer/7534842 | n/s | 18:30:23Z–18:31:59Z |
| S34 | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler | upd. 2026-04-07 | 18:27:24Z–18:29:39Z |
| S36 | https://en.wikipedia.org/wiki/Ecosia (secondary) | last edited 2026-09-22 | 18:27:24Z–18:29:39Z |
| S37 | https://en.wikipedia.org/wiki/Qwant (secondary) | content through June 2026 | 18:27:24Z–18:29:39Z |
| S38 | https://en.wikipedia.org/wiki/Startpage (secondary) | last edited 2026-09-22 06:30 | 18:27:24Z–18:29:39Z |
| S39 | https://en.wikipedia.org/wiki/Yahoo_Search (secondary) | last edited 2026-09-22 06:47 | 18:27:24Z–18:29:39Z |
| S40 | https://search.brave.com/help/indexing — HTTP 404 | — | 18:26:03Z–18:26:53Z |
| S41 | https://brave.com/search/api/ | n/s | 18:27:24Z–18:29:39Z |
| S42 | https://en.wikipedia.org/wiki/Brave_Search (secondary) | last edited 2026-09-22 | 18:30:23Z–18:31:59Z |
| S43 | https://www.mojeek.com/about/ | timeline entry 2025 | 18:27:24Z–18:29:39Z |
| S44 | https://help.kagi.com/kagi/search-details/search-sources.html | n/s | 18:26:03Z–18:26:53Z |
| S45 | https://kagi.com/smallweb | n/s | 18:33:57Z–18:34:42Z |
| S46 | https://yandex.com/support/webmaster/en/ | n/s | 18:27:24Z–18:29:39Z |
| S47 | https://en.wikipedia.org/wiki/You.com (secondary) | last edited 2026-09-23 | 18:30:23Z–18:31:59Z |
| S48 | https://support.apple.com/en-us/119829 (About Applebot) | 2026-09-04 | 18:27:24Z–18:29:39Z |
| S50 | https://www.aboutamazon.com/news/retail/amazon-rufus (editor's note: renamed Alexa for Shopping) | note dated 2026-05-13 | 18:27:24Z–18:29:39Z |
| S51 | https://kdp.amazon.com/en_US/help/topic/G201298500 (keywords) | n/s | 18:27:24Z–18:29:39Z |
| S52 | https://kdp.amazon.com/en_US/help/topic/G200652170 (categories) | n/s | 18:27:24Z–18:29:39Z |
| S53 | https://play.google.com/books/publish/autonarrated/ | n/s | 18:33:20Z–18:33:57Z |
| S54 | https://authors.apple.com/ | n/s | 18:33:20Z–18:33:57Z |
| S55 | https://authors.spotify.com/ | n/s | 18:27:24Z–18:29:39Z |
| S56 | https://www.goodreads.com/author/program | n/s | 18:27:24Z–18:29:39Z |
| S57 | https://podcasts.google.com/ → 301 https://music.youtube.com/googlepodcasts | n/s | 18:30:23Z–18:31:59Z |
| S58 | https://support.google.com/youtube/answer/13525207 | n/s | 18:30:23Z–18:31:59Z |
| S59 | https://podcasters.apple.com/support/897-submit-a-show | n/s | 18:30:23Z–18:31:59Z |
| S60 | https://creators.spotify.com/ | n/s | 18:33:20Z–18:33:57Z |
| S61 | https://help.pinterest.com/en/business/article/claim-your-website | n/s | 18:27:24Z–18:29:39Z |
| S62 | https://developers.pinterest.com/docs/web-features/rich-pins-overview/ | n/s | 18:30:23Z–18:31:59Z |
| S64 | https://developers.openai.com/api/docs/bots (301 from platform.openai.com/docs/bots) | n/s | 18:27:24Z–18:29:39Z |
| S65 | https://docs.perplexity.ai/guides/bots | n/s | 18:27:24Z–18:29:39Z |
| S66 | https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/ | n/s | 18:27:24Z–18:29:39Z |
| S67 | https://www.wikidata.org/wiki/Wikidata:Notability | n/s | 18:35:22Z–18:38:00Z |

Unreachable at read time (logged, not used as evidence): help.openai.com/en/articles/9237897 (403), openai.com/index/introducing-chatgpt-search (403), perplexity.ai/hub/blog/introducing-the-perplexity-publishers-program (403), trust.anthropic.com/subprocessors (no body), support.substack.com recommendations article (403), help.acx.com (404/empty), author.amazon.com (no body), searchadvisor.naver.com and startpage.com (not fetchable by WebFetch), ecosia.org/search-engine (403), nmd.colorado.gov (403), bing.com/webmasters help pages (title only), tiktok.com creator-academy article (navigation only). IDs S27, S35, S49 are intentionally unused.

*Research agent, pioneer workflow, 2026-09-24. Nothing in this file was read from a local file, cache or earlier answer.*