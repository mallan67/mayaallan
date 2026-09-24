# AI search practice: how sites get cited and recommended by AI assistants (2025–2026)

**Lens:** How practitioners get cited or recommended by ChatGPT, Perplexity, Google AI Overviews / AI Mode, Gemini, Copilot and Claude, based on measured 2025–2026 studies and experiments, applied to mayaallan.com.
**Prepared:** 2026-09-24, research agent (Claude). **Live read window:** 2026-09-24T18:21Z to 18:35Z UTC. Every source below has its publication date and the UTC time it was read. Items I could not reach are marked **UNVERIFIED**.
**Tactic ids:** `ai-01` … `ai-13`. **Owner codes:** `code-pr` = a pull request on mallan67/mayaallan, `owner-account` = Maya in her own accounts, `content` = writing or recording, `mixed` = more than one.

---

## 0. Bottom line (read this first)

1. **The strongest measured signals for AI visibility are off-site, and this site has almost none.** Across 75k brands, the factors that correlate most with AI visibility are YouTube mentions (~0.737) and branded web mentions (0.66–0.71). Domain Rating (0.27–0.33) and content volume (~0.19) correlate much less (Ahrefs, 2025-12-12). Earlier AIO-only data showed the same pattern: backlinks correlated at 0.218 and web mentions at 0.664. An academic study reports a "systematic and overwhelming bias towards Earned media" in AI search engines (Chen et al., arXiv, 2025-09-10). Live off-site state at 2026-09-24T18:32Z: the book has **0 ratings and 0 reviews on Goodreads**; the homepage links to no YouTube, podcast or social profile; the author `sameAs` lists Instagram only.
2. **Measurement is off.** PR #57 is still open (read live 18:34:23Z: `state=open`, `mergeable=clean`, last updated 2026-09-07). Its body says "The site currently measures **nothing**" and that Vercel Web Analytics is disabled. No analytics script was found in the served HTML (18:25:23Z). Nobody can currently tell whether any AI assistant sends a visitor. This has to be fixed first (`ai-01`).
3. **The usual on-site "GEO" work has little measured effect.** 97% of llms.txt files got zero requests (Ahrefs, 2026-06-15). Google says there are "no additional requirements … nor other special optimizations" for AI Overviews and AI Mode, and no special schema or AI files are needed (Google doc, updated 2025-12-10). The site already has llms.txt, FAQPage, Book and Person schema, so doing more of this repeats work that did not produce results.
4. **Page format still matters once a page is indexed and found.** Measured patterns:
   - 44.2% of ChatGPT citations come from the first 30% of a page.
   - Focused, shorter pages beat "ultimate guides" in ChatGPT citations (815k query-page pairs).
   - Guides and tutorials have the highest cross-engine citation overlap. Homepages have the lowest.
   - ChatGPT cites content that is 393–458 days newer than Google's organic results.

   The site has 1 of the book's 40 scenarios live as a page, and only the homepage has an email field.
5. **Expect small numbers and plan capture for them.** AI platforms send 0.32% of all website traffic worldwide and 0.29% in the US (SE Ranking, 2026-06-18, 101,574 sites). Whether that traffic converts better is disputed:
   - A peer-reviewed study of 973 e-commerce sites found ChatGPT referrals convert *worse* than Google organic.
   - Ahrefs reports its own AI visitors convert 23× better (vendor, own site).

   AI visitors do stay longer (9m19s vs 5m33s average). The realistic lead path is: third-party mention → reader searches her name or goes straight to the site → email capture on the page they land on.

---

## 1. What is measured (evidence digest)

### 1.1 Where the engines take their sources from
| Finding | Numbers | Source (pub date) |
|---|---|---|
| The engines draw on **largely separate** pools of sources | 91.07% of cited URLs appear in only one of ChatGPT, Perplexity or AIO. 2.37% appear in all three. Guides/tutorials overlap most (2.3%), homepages least (1.1%). 3.7M citations, Jan 2025–Q1 2026 | Kevin Indig, Growth Memo "The Consensus Gap" (2026-05-11) |
| Citation mixes differ by engine and change quickly | ChatGPT: Reddit ~60%→~10% and Wikipedia ~55%→<20% of weekly top-25 share after mid-Sept 2025. AI Mode top: LinkedIn (~15%), YouTube, Reddit. Perplexity top: Reddit, LinkedIn, NIH. 230k prompts, 100M+ citations, Jul 14–Oct 12 2025 | Semrush (vendor data), 2025-11-10 |
| Top domains per engine (share of all citations) | ChatGPT: Wikipedia 7.8%, Reddit 1.8%. AIO: Reddit 2.2%, YouTube 1.9%, Quora 1.5%, LinkedIn 1.3%. Perplexity: Reddit 6.6%, YouTube 2.0%. 680M citations, Aug 2024–Jun 2025 | Profound (vendor data), 2025-06-05, updated Aug 2025 |
| AI Overviews now pull most sources from **outside** the top 10 | 37.9% of AIO citations are from the top 10, 31.2% from positions 11–100, 31.0% from beyond the top 100 (it was ~76% from the top 10 in July 2025). YouTube = 18.2% of unranked citations. 863k SERPs, after Gemini 3 | Ahrefs, 2026-03-02 |
| For **health** queries, YouTube is the most-cited AIO source | YouTube 4.43% of 465,823 citations. Reliable medical sources 34.45%. Only 36% of cited URLs are in the Google top 10. 82% of health queries trigger AIO. 50,807 queries, Germany, Dec 2025 | SE Ranking (vendor data), 2026-01-14 |
| AI summaries reduce clicks | With an AI summary 8% of users click a result, without one 15%. 1% click a link inside the summary. 26% end the session vs 16%. 68,879 searches, 900 US adults, Mar 2025 | Pew Research Center (independent), 2025-07-22 |

**What this means for Maya:** no single "AI SEO" move works on every engine. Each engine has its own sources, so she needs to be present on the platforms each one reads: YouTube and Reddit for AIO, AI Mode and Perplexity; earned editorial and encyclopedic-type sources for ChatGPT. Psilocybin integration is a health-adjacent topic, and in that category YouTube is the most-cited source in Google's AI answers.

### 1.2 Off-site presence vs the site itself
| Finding | Numbers | Source |
|---|---|---|
| Brand visibility in ChatGPT, AI Mode and AIO (75k brands) | YouTube mentions ~0.737 (strongest), branded web mentions 0.66–0.71, branded anchors 0.51–0.63, branded search 0.35–0.47, DR 0.27–0.33, content volume ~0.19. ChatGPT is the engine least tied to classic authority metrics, which Ahrefs reads as "potentially more accessible for emerging brands" | Ahrefs (vendor data), 2025-12-12 |
| Earlier AIO-only version | Web mentions 0.664 vs backlinks 0.218. Brands in the top quartile for mentions get ~10× more AIO mentions | Ahrefs, 2025 (still cited in the 2026 follow-up) |
| Earned media bias | "systematic and overwhelming bias towards Earned media (third-party, authoritative sources) over Brand-owned and Social content." Also documents a "big brand bias" | Chen, Wang, Chen, Koudas, arXiv 2509.08919 (2025-09-10), academic preprint |
| "Best of" lists shape product/service answers | "Best of" posts make up 43.83% on average of the pages ChatGPT uses for product/service queries | Glen Allsopp research, reported by Ahrefs 2026-03-13 (original not read: **UNVERIFIED** at source) |
| ChatGPT recommendation lists are unstable | "<1 in 100 chance" that ChatGPT gives the same list of brands in two responses | SparkToro, reported by Ahrefs 2026-03-13 (original not read: **UNVERIFIED** at source) |
| Being mentioned by AI leads to later visits (large brands only) | Brands AI recommended were 7.2% (Amex) and 14.2% (Capital One) more likely to be visited directly within 7 days. Search volume ~15% lower, direct navigation higher. Finance, travel and beauty only | Similarweb data via SparkToro / Rand Fishkin, 2026-06-29 |
| Practitioner results (dev-tool SaaS) | Vercel: ChatGPT went from 1% to 4.8% to ~10% of new signups month over month. Tally: AI search became its main acquisition channel, $2M→$3M ARR in 4 months. Vercel says it seeds "authentic community mentions" on Reddit, GitHub and HN, and serves static HTML | Vercel engineering blog (Corbett, Ubl), 2025-06-10 (older than 2026 but a practitioner report with numbers; audience very different from Maya's) |

### 1.3 Page format (only matters once a page is indexed and retrieved)
| Finding | Numbers | Source |
|---|---|---|
| Answer-first ("ski ramp") | 44.2% of ChatGPT citations come from the first 30% of the content. Within a paragraph, 53% come from the middle sentence. Cited text has 20.6% entity density vs 5–8% in normal English. 1.2M answers, 18,012 verified citations | Kevin Indig (Feb 2026), numbers as reported by Ahrefs 2026-03-13 (the Growth Memo original is paywalled) |
| Focused beats "ultimate guide" | "The 'ultimate guide' strategy produces worse citation results than a focused shorter page". 815,000 query-page pairs | Growth Memo, 2026-04-13 (paywalled; headline finding only) |
| Freshness | AI-cited URLs are 25.7% fresher than organic results (1,064 vs 1,432 days). ChatGPT has the strongest preference (458 days newer). AIO is about neutral (16 days older). Ahrefs warns against changing dates without real updates. 16.975M citations | Ahrefs, 2025-07-28 |
| Google's official position | A page "must be indexed and eligible to be shown in Google Search with a snippet". There are "no additional requirements … nor other special optimizations necessary". AI-feature traffic is counted inside Search Console's "Web" search type | Google Search Central, updated 2025-12-10 |
| AI crawlers do not run JavaScript | "None of the major AI crawlers currently render JavaScript" (OpenAI, Anthropic, Perplexity and others). Gemini and AppleBot do render it. ~35% of ChatGPT and Claude fetches hit 404s | Vercel + MERJ, 2024-12-17 (older, but still the reference measurement) |
| Bing's guidance for Copilot citations | Use IndexNow, clear headings and FAQs, and evidence-backed claims | Bing Webmaster blog, 2026-02-10 (official) |

### 1.4 Hype vs measured: what does *not* work
| Claim | Evidence | Verdict |
|---|---|---|
| "Add llms.txt" | 137,210 domains. 28% publish one and **97% got zero requests** in May 2026. Of the requests that did arrive, AI retrieval bots made 1.1%. "Zero requests came from AI bots for llms.txt files that don't exist" (Ahrefs, 2026-06-15). Google: not needed (doc, 2025-12-10) | **Dead end** for AI visibility. Keep the existing file (it costs nothing) and do no more work on it |
| "Schema makes AI cite you" | Google: no special schema is needed; structured data must match the visible text. No 2025–2026 measured study showing schema raises AI citations was found this session (search budget ran out: **UNVERIFIED either way**) | Treat as hygiene only |
| "Publish 'best X' lists ranking yourself #1" | Self-promotional listicles lost visibility in Jan 2026: five SaaS sites dropped −29% to −49% (Lily Ray, 2026-02-03). In AIO these lists are cited ~69% of the time while the recommendation goes to a competitor, and smaller brands end up giving "free marketing for competitors" (Lily Ray, 2026-06-17) | **Do not do** |
| "Our GEO platform shows AI traffic converts 5–9× / 4.4×" | Vendor-published figures. The peer-reviewed counter-evidence (Kaiser & Schulze, reported 2025-10-24): 973 e-commerce sites, $20B revenue, Aug 2024–Jul 2025. ChatGPT referrals converted below organic search (by ~13%) and below affiliate (by 86%), and were ~0.2% of sessions | Plan for low volume. Do not budget on conversion multipliers |
| "Track one AI visibility score" | 91% of citations are specific to one engine (Consensus Gap), and lists repeat <1 time in 100 (SparkToro via Ahrefs) | Measure per engine and repeat samples (`ai-12`) |

### 1.5 How AI referrals show up in analytics now
| Engine | What arrives at the site | Source |
|---|---|---|
| ChatGPT | Referrer `chatgpt.com` (older traffic: `chat.openai.com`). Links carry **`utm_source=chatgpt.com`**. OpenAI: "ChatGPT automatically includes the UTM parameter utm_source=chatgpt.com in referral URLs". Requires that `OAI-SearchBot` is not blocked | OpenAI Help Center "Publishers and Developers – FAQ" (page shows "Updated: 27 days ago", i.e. about 2026-08-28), read 18:24:59Z |
| Perplexity, Copilot, Gemini, Claude | Referrers `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`, `claude.ai` were observed in 100 brands' GA4 data. No UTM tagging is documented for these engines | Lawrence Hitches / StudioHawk data (consultant), 2026-09-20 |
| Google AI Overviews / AI Mode | **Cannot be separated** from organic. They are counted inside Search Console's "Web" search type (Google). A May 2025 AI Mode `noreferrer` bug was confirmed by Google and fixed on 2025-05-28 (SERoundtable, 2025-05-23, updated). One practitioner (2026-08-15) says clicks now arrive as `google / organic`; the same article also describes a separate "AI Mode" filter in Search Console, which contradicts Google's doc, so that part is **not relied on** | Google doc 2025-12-10; SERoundtable; Hitches 2026-08-15 |
| GA4 (if ever used) | Since May 2026 there is a built-in **"AI Assistant"** default channel with medium `ai-assistant`. Google names ChatGPT, Gemini and Claude but has not published the full list. Sessions without a referrer still fall into Direct | Search Engine Journal (Matt Southern), 2026-05-14 |
| Missing referrer | 35.7% of AI-tagged sessions had no referrer (Clickport, own sample, vendor). Loamly measured 70.6% (Feb 2026, via Clickport, **not read at source**). Treat any AI count as a floor | Clickport (vendor), updated 2026-09-18 |
| Vercel Web Analytics (this site's stack) | The Referrers panel is available. The **UTM filter needs Web Analytics Plus or Enterprise** | Vercel docs "Filtering Analytics", last_updated 2026-09-16 |
| Bing / Copilot citations (no clicks) | Bing Webmaster Tools **AI Performance** shows total citations, average cited pages, **grounding queries** and per-URL citations across Copilot, Bing AI summaries and partners. It does not show clicks | Bing Webmaster blog, 2026-02-10 |

---

## 2. Live state of mayaallan.com that matters here (read 2026-09-24T18:25Z–18:34Z)
| Check (method) | Result | Read at |
|---|---|---|
| `robots.txt` (GET) | All engines allowed: `*`, GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, Perplexity-User, Google-Extended. Only /admin, /api and /download are disallowed. **No crawler blocking problem** | 18:25:08Z |
| `llms.txt` (GET) | 200, 5,651 bytes, already exists | 18:25:08Z |
| Sitemap (GET) | 38 URLs: 5 blog posts, **1 scenario page** (`/scenarios/ego-dissolution`), 5 language homepages and /about pages | 18:25:08Z |
| Server HTML as `OAI-SearchBot` UA (GET) | Home, book, /about, /faq and the research post are server-rendered (FAQ 16.6k chars, research post 19.0k). The tool pages `/integration-reflection` and `/belief-inquiry` serve ~1.2k chars of text | 18:25:23Z, 18:30:07Z |
| Structured data | Person, WebSite, Organization, Book, FAQPage, Article and BreadcrumbList are present. Author `sameAs` = Instagram only. Book `identifier` = ASIN only. ISBN 9798994148839 appears only inside a retailer URL | 18:25:23Z, 18:31:42Z |
| Analytics in HTML | No GA, Vercel Analytics or other analytics script detected | 18:25:23Z |
| Email capture in server HTML | Homepage has 1 email input. Book page, /faq, /glossary, /blog, the research post, /scenarios and the tool pages have **0** (anything rendered client-side after interaction was not checked) | 18:25:23Z, 18:30:07Z |
| Goodreads book page (GET) | "0.00 · 0 ratings · 0 reviews". Published Dec 15, 2025. Author page exists: `goodreads.com/author/show/65134359.Maya_Allan` | 18:32:04Z |
| Off-site profile links on homepage | None to YouTube, podcasts, LinkedIn, Medium, Substack, Goodreads author or Amazon author | 18:32:16Z |
| psilowire.com, psilocybinintegrationguide.com | 308 redirect to `https://www.mayaallan.com/` | 18:32:39Z |
| PR #57 "count every visitor" (gh api) | open, mergeable=clean, not merged. Body: "The site currently measures **nothing**"; Vercel Web Analytics disabled; `marketing_visitors` (consent-gated) records first landing page and referrer; landing-page grouping strips query strings | 18:25:46Z, 18:34:23Z |
| PR #46 AEO tracker (gh api) | merged 2026-09-05. Only Perplexity Sonar searches the web; Claude, OpenAI and Gemini calls are "plain completions answering from training data" | 18:25:46Z |
| PR #45 (gh api) | Body dated 2026-09-05 reports two pages as "Crawled, currently not indexed" in Search Console. **Current Search Console status: UNVERIFIED** (no access this session) | 18:25:46Z |

---

## 3. Tactics for this site

### ai-01: Turn measurement on and tag AI referrals (do this first)
- **Steps:**
  1. Maya enables Web Analytics (Vercel → mayaallan → Analytics → Enable) and merges PR #57.
  2. A follow-up `code-pr` adds a tested `classifyAiReferral()` to `src/lib/analytics-acquisition.ts`:
     - Read `utm_source` **before** the query is stripped.
     - `utm_source=chatgpt.com` → ChatGPT.
     - Referrer hosts `chatgpt.com` / `chat.openai.com` → ChatGPT; `perplexity.ai` / `www.perplexity.ai` → Perplexity; `gemini.google.com` → Gemini; `copilot.microsoft.com` → Copilot; `claude.ai` → Claude.
     - Show an **"AI assistants"** row in the admin "Where visitors come from" panel.
     - Store the AI engine as a first-touch attribute on subscribers and orders, so a *lead* can be tied to an engine.
  3. `marketing_visitors` only records visitors who give cookie consent. For everyone else use the Vercel Referrers panel. The UTM filter needs Web Analytics Plus; a cookieless custom event is the alternative, and whether the current plan allows it is **UNVERIFIED**.
- **Owner:** mixed (owner-account + code-pr). **Effort:** S.
- **Expected impact:** No leads by itself, but it is the only way to see any AI lead. OpenAI documents the UTM. GA4 built the same classification in May 2026. 35.7%–70.6% of AI sessions arrive with no referrer, so the UTM is the safety net.
- **Measure:** Weekly AI-assistant sessions by engine and landing page, and leads with AI first touch. Treat all counts as a floor.

### ai-02: Bing Webmaster Tools + AI Performance + IndexNow
- **Steps:**
  1. Maya verifies www.mayaallan.com in Bing Webmaster Tools (the Search Console import is fine), submits `/sitemap.xml` and opens **AI Performance**.
  2. A `code-pr` adds an IndexNow key file and pings IndexNow on publish or update for blog, scenario and FAQ changes. Bing recommends this.
- **Owner:** mixed. **Effort:** S.
- **Expected impact:** This is the only free first-party source of **AI citation counts and grounding queries**, here for Copilot and Bing AI (Bing, 2026-02-10). It tells her which questions AI is already matching her pages to.
- **Measure:** Total citations, cited pages and grounding queries, weekly.

### ai-03: Get the pages that matter indexed (Google)
- **Steps:**
  1. Maya runs Search Console URL Inspection on the book page, /faq, /glossary, the research post and the scenario page.
  2. She records their status in the handoff doc.
  3. Any page still "Crawled, currently not indexed" goes to the content fixes in `ai-08`, not to repeated resubmission.
- **Owner:** owner-account. **Effort:** S.
- **Expected impact:** Google requires a page to be "indexed and eligible … with a snippet". Since 2026 AIO takes 62% of its citations from outside the top 10 (Ahrefs, 2026-03-02), so indexed pages that answer narrow sub-questions can be cited without ranking top 10.
- **Measure:** Indexed count, and Search Console "Web" impressions per page (AI features are counted there).

### ai-04: YouTube presence (strongest single measured correlation)
- **Steps:**
  1. Create a YouTube channel under "Maya Allan".
  2. Publish 2–5 minute answer-first videos, one question each. Take the questions from /faq and the 40 scenarios, for example "What does integration mean after a difficult psilocybin experience?". Say her name and the book title in the first 20 seconds, keep them in title and description, and add accurate captions.
  3. Link each video to the matching site page.
  4. Stay inside the site's existing non-clinical rules: no dosing, sourcing or medical claims.
  5. Separately, pitch **guest appearances on psychedelic-integration podcasts that publish on YouTube**, so her name appears in other channels' titles and descriptions.
- **Owner:** content + owner-account. **Effort:** L (ongoing, about 1 video/week).
- **Expected impact:** YouTube mentions ~0.737 correlation with AI visibility (Ahrefs, 2025-12-12). YouTube is the most-cited AIO source for health queries (SE Ranking, 2026-01-14) and 18.2% of AIO's unranked citations (Ahrefs, 2026-03-02). These are correlations, not proof of cause. Nothing measured is specific to solo authors.
- **Measure:**
  - Videos and other channels' videos mentioning "Maya Allan" or "Psilocybin Integration Guide".
  - `youtube.com` referrals.
  - Brand mentions in the `ai-12` prompt panel for AIO, AI Mode and Perplexity.

### ai-05: Reddit, with disclosed and useful participation
- **Steps:**
  1. Maya reads each subreddit's self-promotion rules before posting. Candidate subreddits are psychedelic-integration and psilocybin communities; the Reddit API returned 403, so names and rules are **UNVERIFIED**.
  2. Answer integration questions in full inside the comment, with no link-dropping. Disclose "I wrote a book on this" only where it is relevant and the rules allow it.
  3. Never give dosing or sourcing advice (same boundary as the site).
  4. Aim for 3–5 substantive answers a week.
- **Owner:** owner-account + content. **Effort:** M (ongoing).
- **Expected impact:** Reddit is a top source for Perplexity (6.6%) and AIO (2.2%) (Profound, 2025-06-05), and Ahrefs (2026-03-13) calls it ChatGPT's #1 cited domain. ChatGPT's use of Reddit is **volatile** (~60%→~10% share in Sept 2025, Semrush 2025-11-10), so do not rely on it alone. Vercel reports the same "authentic community mentions" practice (2025-06-10).
- **Measure:** Threads where her answer is cited or upvoted, `reddit.com` referrals, and Perplexity / AI Mode mentions in `ai-12`.

### ai-06: Earned media and third-party book lists (not self-made lists)
- **Steps:**
  1. Maya builds a list of existing third-party pages that answer "books on psilocybin / psychedelic integration": publisher blogs, psychedelic media, Goodreads lists, newsletters. The fastest way is the domains cited in the `ai-12` prompt panel.
  2. Pitch the list authors with a short note and a review copy.
  3. Pitch guest essays or interviews to psychedelic-culture publications.
  4. **Do not** publish a "best integration books" list on her own site that ranks her own book #1.
- **Owner:** owner-account + content. **Effort:** M–L.
- **Expected impact:** Earned-media bias (Chen et al., 2025-09-10). "Best of" pages make up 43.83% of the pages ChatGPT uses for product/service queries (Allsopp via Ahrefs, 2026-03-13). Self-promotional lists lost 29–49% visibility and push recommendations to competitors (Lily Ray, 2026-02-03 and 2026-06-17).
- **Measure:** Count of third-party pages naming the book (log the URLs), referrals from them, and `ai-12` mentions.