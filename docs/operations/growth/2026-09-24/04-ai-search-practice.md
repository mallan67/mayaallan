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