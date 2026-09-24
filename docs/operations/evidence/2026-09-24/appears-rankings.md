# Evidence - DO PEOPLE FIND IT WHEN THEY SEARCH (lens `rank-`), 2026-09-24

- Lens: appears / search rankings for https://www.mayaallan.com (Vercel project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y). Finding ids use the prefix `rank-`.
- UTC window of observations: 2026-09-24T18:18:44Z - 2026-09-24T18:28:25Z. Saved to GitHub from 18:34Z onwards.
- Sources used (all live, all read inside the window; each row below cites its own query and time):
  1. Bing via `curl GET https://www.bing.com/search?q=<q>&setlang=en-US&cc=US`, anonymous, page 1 only. Two observations per query: B1 Chrome UA 18:19:46Z-18:20:54Z, B2 Safari UA + `form=QBLH` 18:24:16Z-18:24:32Z.
  2. The Claude Code WebSearch tool ("WS"; engine not disclosed, US-only, returns about 9-10 results), 18:21:35Z-18:22:52Z, plus domain-restricted runs 18:24:32Z-18:25:25Z. The session's WebSearch budget ran out (200/200) at about 18:25:30Z.
  3. DuckDuckGo html / lite / d.js, Yahoo, Brave, Mojeek and Startpage were tried and all blocked automated access (section 5).
  4. Live GETs to the site: `/sitemap.xml`, `/robots.txt` (18:25:25Z), 8 topic pages (18:26:10Z-18:26:26Z), `/integration-journal` HTML (18:28:07Z).
  5. GitHub live operational data: `gh api repos/mallan67/mayaallan` (visibility) and `issues/{43..54}` metadata (18:25:25Z, 18:28:25Z).
- Not used (scope): Google Search (no allowed live access), Google Search Console / Bing Webmaster Tools (owner login), repository source files.
- Persistence: assembled in memory only. Section 1 was created with the gitsave recipe. Later sections were appended to the live file fetched at the branch head SHA at push time, on branch `work/site-visibility`. Nothing was read from or written to a local file.
- Part 2 (topic SERPs raw, title gaps, competition set): `docs/operations/evidence/2026-09-24/appears-rankings-part2.md` (last commit cf467e4d291847dafd0ee482a8b47baba6bb8b8c).

## 0. Plain-language answer

1. **Name and book-title searches work on Bing.** Typing "Maya Allan", "Maya Allan author", "Maya Allan psilocybin", "Maya Allan book", "Psilocybin Integration Guide" or "Psilocybin Integration Guide Maya Allan" into Bing puts mayaallan.com at **#1**, and at #1-#2 for the four name queries (two identical observations, 18:19:46Z and 18:24:16Z).
2. **On the second engine (WS) the site is weaker.** It is #4-#6 for her own name. It is **absent from the top 9 for the book title** "Psilocybin Integration Guide" and for "psilocybin integration guide book", where Amazon holds #1-#3.
3. **Nobody who searches the topic finds her.** Across 10 topic searches (psilocybin integration, journal, workbook, nervous system reset, ego dissolution, reflection questions, and others), the site appears **0 times** on Bing page 1 and **0 times** in the WS top 9. This holds even though the site has live, indexable pages built for 6 of those topics. A new author has almost no name searches, and topic searches never show her. That matches the "not seen anywhere / zero results" symptom.
4. **The WS index knows only 2 of the site's 38 sitemap URLs** (`/` and `/about`). Bing reports about 36 results for `site:mayaallan.com`.
5. **Her public GitHub repo leaks into search.** Eight PR/issue pages of `mallan67/mayaallan` (public repo) are indexed. PR #54 ranks **above the site** for "Psilocybin Integration Guide Maya Allan" on WS (#4 vs #5).
6. **Her name results are shared.** On Bing, positions 3-10 for "Maya Allan" are real-estate broker profiles (LinkedIn "Licensed Real Estate Broker | Founder, MAllan", Zillow, realtor.com, StreetEasy, ...). On WS, other people take the top slots: Maya Alden (romance author), Maya Allen (The Cut), Rosetta Allan and Wikipedia "Maya ..." pages.
7. **What was not measured:** Google, DuckDuckGo, and Bing beyond page 1. The number of people who actually see or click her in search cannot be observed from outside; it needs Search Console / Bing Webmaster Tools.

## 1. Position matrix (mayaallan-domain positions only)

Bing shows 7-10 organic results on page 1. WS returns 9-10. "none" = no mayaallan.com / psilowire.com / psilocybinintegrationguide.com URL in the list. "decoy" = Bing returned an off-topic set (see section 5), so the row proves nothing.

| Group | Query | Bing B1 (UTC) | Bing B2 (UTC) | WS (UTC batch) | Who holds #1 |
|---|---|---|---|---|---|
| brand | Maya Allan | #1 `/`, #2 `/books` of 10 (18:19:46Z) | #1, #2 (18:24:16Z) | #5 `/`, #6 `/about` of 10 (18:21:35Z-51Z) | Bing: mayaallan.com. WS: facebook.com/maya.allan.100483 |
| brand | Maya Allan author | #1 `/`, #2 `/books` of 7 (18:19:47Z) | #1, #2 (18:24:17Z) | #6 `/`, #7 `/about` of 9 | Bing: site. WS: en.wikipedia.org/wiki/Maya_S |
| brand | Maya Allan psilocybin | #1 `/`, #2 `/books/psilocybin-integration-guide` of 7 (18:19:49Z) | #1, #2 (18:24:18Z) | #4 `/`, #5 `/about` of 9 | Bing: site. WS: Amazon paperback B0G91GZMLT |
| brand | Maya Allan book | #1 `/books`, #2 `/` of 7 (18:19:50Z) | #1, #2 (18:24:19Z) | #6 `/` of 9 | Bing: site. WS: bibliovault.org (Allan Burns, "Maya in Exile") |
| nav | mayaallan (one word) | decoy (google.com set, 18:20:33Z) | decoy (tankless water heaters, 18:23:42Z) | not run | UNVERIFIED |
| nav | mayaallan.com | not run | decoy (microsoft.com set, 18:24:31Z) | #5 `/` of 9 (18:22:36Z-52Z) | WS: in.pinterest.com/mayaallan2 |
| nav | psilowire | none of 7 (18:20:34Z) | none (`psilowire.com`, 18:24:32Z) | none of 9 | psilowave.com (record label) |
| book | Psilocybin Integration Guide | **#1** `/books/psilocybin-integration-guide` of 7 (18:20:34Z) | #1 (18:24:20Z) | **none** of 9 (18:21:51Z-22:03Z) | Bing: site. WS: Amazon Kindle B0G765BZDL |
| book | Psilocybin Integration Guide Maya Allan | #1 book page, #2 `/` of 7 (18:20:35Z) | #1, #2 (18:24:21Z) | #5 `/`, #6 `/about` of 9; **github.com/mallan67/mayaallan/pull/54 at #4** | Bing: site. WS: Amazon Kindle |
| book | psilocybin integration guide book | #7 `/` of 7 (18:20:35Z) | #7 (18:24:21Z) | **none** of 9 | Amazon B0G7JWDJYQ (Bing), Amazon B0G91GZMLT (WS) |
| book | full title "Psilocybin Integration Guide: 40 Real Scenarios for Navigating What You See, Feel & Experience" | decoy (short form "...40 real scenarios", 18:20:36Z and 18:23:44Z) | - | **none** of 9 (18:22:36Z-52Z) | WS: Amazon Kindle |
| topic x10 | see part 2 | none on 8 valid queries (2 decoys) | none on 8 valid | none on all 10 | retreat blogs, journals, Amazon, MAPS PDF (part 2) |

## 2. Findings

| id | severity | finding | evidence (query / URL, UTC) | impact | solution (owner) |
|---|---|---|---|---|---|
| rank-01 | high | **Zero topic visibility.** 0 of 10 topic queries show any mayaallan-domain URL, on Bing page 1 or in the WS top 9. Six of those topics have a dedicated live page (`/belief-inquiry`, `/nervous-system-reset`, `/integration-reflection`, `/integration-journal`, `/scenarios/ego-dissolution`, `/blog/psilocybin-integration-research`), each HTTP 200, `index, follow`, self-canonical. | Bing B1 18:20:49Z-54Z and B2 18:24:22Z-30Z (8 valid queries, 7 results each); WS 18:22:03Z-52Z (10 queries); live GETs 18:26:10Z-26Z. Details in part 2. | People who don't already know her name never see the site. This is the "not seen anywhere" symptom. | Retitle and rewrite the topic pages around the phrasing searchers use (part 2 title-gap table); link to them from the home page and book page. Then track them in Search Console / Bing Webmaster Tools (content + code-pr) |
| rank-02 | high | **The WS index holds only `/` and `/about`** of 38 sitemap URLs. Domain-restricted searches never return `/books/psilocybin-integration-guide`, `/practices`, `/blog/*`, `/scenarios/*` or the tool pages. Bing is better: "About 36 results" for `site:mayaallan.com`; page 1 shows `/`, `/about`, `/contact`, `/books`, `/blog/inherited-beliefs-grandmother-marriage`, `/blog`, `/practices`. | WS `allowed_domains=["mayaallan.com"]`, 5 queries, 18:24:32Z-18:25:25Z; Bing `site:mayaallan.com` 18:24:46Z; `GET /sitemap.xml` = 38 `<loc>` 18:25:25Z | For that engine the book page and every topic page do not exist, so they cannot rank for anything. | Verify the domain in Google Search Console and Bing Webmaster Tools, submit `/sitemap.xml`, and request indexing of the book and topic pages. Recheck coverage weekly (owner-account) |
| rank-03 | medium | **Retailers own the book title outside Bing.** On WS, "Psilocybin Integration Guide", "psilocybin integration guide book" and the full title show Amazon at #1-#3 (3 listings: B0G765BZDL Kindle, B0G7JWDJYQ, B0G91GZMLT), and mayaallan.com is not in the top 9. On Bing, "psilocybin integration guide book" puts the site at only #7, behind Amazon x2, Google Books, Barnes & Noble, ThriftBooks and Google Play. | WS 18:21:51Z-18:22:52Z; Bing 18:20:35Z and 18:24:21Z | Title searchers go to Amazon. That is fine for sales, but the site gains no reader, email or follow-up. | Make the book page the canonical "official" page: author/publisher links from Amazon Author Central, Goodreads and Google Books to `/books/psilocybin-integration-guide`, plus Book structured data (owner-account + content) |
| rank-04 | medium | **The public GitHub repo competes with the site.** `mallan67/mayaallan` is public. WS indexes 8 of its PR/issue pages (#43, #44, #45, #47, #51, #52, #53, #54). PR #54 is #4 for "Psilocybin Integration Guide Maya Allan", one place above mayaallan.com (#5). The indexed titles expose internal SEO work ("controlled two-page indexing test", "AEO Tracker...", "machine-only book FAQPage JSON-LD"). | WS 18:21:51Z-22:03Z and WS `allowed_domains=["github.com"]` ~18:25Z; `gh api repos/mallan67/mayaallan` -> `"visibility":"public"` 18:25:25Z; `gh api .../issues/{n}` 18:28:25Z (all exist, closed) | Takes a first-page slot for her own name + book, and shows internal strategy notes to anyone searching her. | Owner decision: make the repo private (first check that the Vercel Git integration keeps access), or accept the exposure (owner-account) |
| rank-05 | medium | **Her name results are shared with others.** Bing "Maya Allan" #3-#10: linkedin.com/in/mayaallan ("Licensed Real Estate Broker, Founder, MAllan"), zillow, realtor.com, loopnet (Mallan Real Estate Inc.), mallannyhomes.com, homes.com, streeteasy, citysnap. WS "Maya Allan": Facebook personal profiles, instagram "Maya Allen", Pinterest "mayaallan2" and Wikipedia "Maya Penn/Laner/Henry" take #1-#4 and #7-#10. WS "Maya Allan author"/"book": Maya Alden (romance), Maya S, Rosetta Allan and Maya Tatsukawa take #1-#5. | Bing 18:19:46Z, 18:24:16Z; WS 18:21:35Z-51Z | The author identity and the real-estate identity share one name result page. On WS, name searchers must scroll past others. | Owner to confirm which profiles are hers. Link the author profiles (Facebook "Maya Allan Author", Pinterest, Amazon/Goodreads author pages) back to mayaallan.com, and use "Maya Allan, author" consistently (owner-account + content) |
| rank-06 | medium | **Topic page titles don't use the words people search.** `/nervous-system-reset` has no "psychedelic/after". `/integration-journal` has no "psilocybin/psychedelic". `/integration-reflection` ("Integration Tool - Help a New Insight or Experience Land") has no "questions/prompts". The winning results repeat the query ("Nervous System Regulation: After Psychedelic Session Guide", "15 Best Questions for Psychedelic Integration", Amazon "Psilocybin Integration Journal"). | Live `<title>` GETs 18:26:10Z-26Z; winning titles from Bing B1/B2 and WS (part 2) | Search engines and searchers can't match these pages to those searches. | Rewrite title/H1/description of the 3 pages with the query words while keeping the non-clinical framing (content + code-pr) |
| rank-07 | medium | **The results reward formats the site doesn't expose.** (a) Indexed PDFs rank directly: the MAPS Integration Workbook PDF appears on 3 topic queries, and clinic PDFs on others. Her journal page's HTML contains no PDF URL, and robots.txt has `Disallow: /download/`. (b) Numbered question/prompt lists win the "questions" searches. (c) Marketplace listings (Amazon, Etsy, Goodreads) win "journal", "workbook" and "book" searches. Her book appears only for title searches, and is not in the Goodreads "psychedelic-integration" shelf result. | `GET /robots.txt` 18:25:25Z; `GET /integration-journal` grep for pdf/download links 18:28:07Z (none); SERPs T2, T3, T7, T8, T9 (part 2) | The free journal and the book are invisible exactly where people shop for them. | Decide whether the journal PDF should be crawlable; publish a "questions/prompts" page; add Amazon category keywords and Goodreads shelving for the book (content + owner-account) |
| rank-08 | low | **"belief inquiry" is not winnable as a bare term.** Both engines return only academic philosophy (Friedman "Inquiry and Belief", JSTOR, Wiley Nous, PhilPapers, Clifford, Peirce). | Bing 18:20:51Z, 18:24:26Z; WS 18:22:16Z-26Z | The page name will never attract searchers for this term. | Target long-tail phrasing ("inherited beliefs", "limiting belief self-inquiry") (content) |
| rank-09 | info | **"psilowire" has no search presence.** Results are psilowave.com, psilovibe.org, psychwire.com and Instagram "psilo.delic"; nothing from psilowire.com. | Bing 18:20:34Z, 18:24:32Z (`psilowire.com`); WS 18:22:36Z-52Z | Only matters if psilowire is meant to be a public brand. | Owner: decide whether psilowire.com is a brand or only a redirect alias (owner-account) |
| rank-10 | medium | **Search demand and clicks can't be observed from outside.** No allowed tool reaches Google results. Bing curl shows page 1 only. The count of people who searched, saw a result or clicked is only in Search Console / Bing Webmaster Tools, and this lens cannot read either. | Section 5 (blocked engines, pagination); scope list | "Who looks and who clicks where" in search stays unanswered until the owner connects those consoles. | Verify mayaallan.com in Google Search Console and Bing Webmaster Tools; export Performance (queries, impressions, clicks, positions) weekly (owner-account) |

## 3. What works

| id | what works | evidence (UTC) |
|---|---|---|
| rank-W1 | Bing ranks the site #1 and #2 for all 4 name queries ("Maya Allan", "... author", "... psilocybin", "... book"), the same on both observations | Bing B1 18:19:46Z-50Z, B2 18:24:16Z-19Z |
| rank-W2 | Bing ranks `/books/psilocybin-integration-guide` #1 for "Psilocybin Integration Guide", ahead of Amazon, Google Books and Barnes & Noble; #1 + #2 for "Psilocybin Integration Guide Maya Allan" | Bing 18:20:34Z-35Z, 18:24:20Z-21Z |
| rank-W3 | WS shows the site in the top 10 for all 4 name queries (#4-#6) and for "mayaallan.com" (#5). The WS summary text quotes the site's own positioning ("author and educator offering non-clinical, educational resources for psilocybin integration...") | WS 18:21:35Z-51Z, 18:22:36Z-52Z |
| rank-W4 | Bing has about 36 site pages indexed ("About 36 results"), including `/books`, `/blog`, `/practices` and a blog post | Bing `site:mayaallan.com` 18:24:46Z |
| rank-W5 | Topic pages are technically indexable: 8 pages return HTTP 200, `index, follow`, no X-Robots-Tag, self-canonical, response 0.32-0.71 s. Not ranking is a relevance/authority problem, not a blocking problem | GET 18:26:10Z-26Z |
| rank-W6 | robots.txt allows all crawlers, named AI crawlers included (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai); only `/admin/`, `/api/`, `/download/` are disallowed. The sitemap lists 38 URLs, including 5 language home/about variants | GET 18:25:25Z |
| rank-W7 | The book is distributed widely enough to fill the title results: Amazon (3 listings), Amazon.ca, Google Books, Google Play Books, Barnes & Noble, ThriftBooks, barwebooks.com, Walmart category page | Bing 18:19:49Z-18:20:35Z; WS 18:21:51Z-18:22:52Z |
| rank-W8 | An author Facebook presence ranks: "Maya Allan Author - Facebook" (facebook.com/profile.php?id=61572138340473) at Bing #3 for "Maya Allan author". Owner to confirm it is hers | Bing 18:19:47Z |

## 4. Unverified / not exercised

| item | why | what would verify it |
|---|---|---|
| Google positions for every query | no allowed live access to Google results | needs outside-source check: Google Search Console Performance, or a manual signed-out Google search by the owner |
| DuckDuckGo positions | html endpoint: one HTTP 200 at 18:19:10Z (9 result links, not parsed before the block), then "bots use DuckDuckGo too" captcha at 18:19:23Z and 18:22:52Z; lite endpoint captcha 18:21:35Z; d.js JS challenge (HTTP 202) 18:23:10Z; WebFetch also got the captcha (~18:23Z) | needs outside-source check (manual search in a browser) |
| Bing positions 8-20 | Bing ignored `first=11`, `FORM=PERE`, session cookies and `format=rss` pagination; every request returned page 1 (18:19:50Z-18:20:14Z) | Bing Webmaster Tools, or a manual browser session |
| Bing rows marked "decoy" | "mayaallan", "mayaallan.com", "... 40 real scenarios", "psychedelic integration book(s)", "what to do after a mushroom trip" and variant, all `site:mayaallan.com <word>` queries (18:25:40Z-44Z), "Maya Allan <topic>" queries (18:26:00Z-04Z) | manual browser check. Control: `site:mayaallan.com grandmother` returned dictionary pages (18:25:58Z) although `/blog/inherited-beliefs-grandmother-marriage` is in Bing's `site:` list, so keyword-restricted site checks are unreliable |
| Topic absence for T9 and T10 | only 1 valid observation (WS); Bing returned decoys | a second engine or a manual Bing check |
| Whether psilowire.com, psilocybinintegrationguide.com and mayaallan.vercel.app have pages indexed | Bing `site:` returned unrelated decoy sets (18:24:46Z-48Z); the planned WS domain check was not run because the WebSearch budget (200/200) was used up at ~18:25:30Z | Search Console / Bing Webmaster Tools, or a manual `site:` check |
| Yahoo, Brave, Mojeek, Startpage | Yahoo: 307 to `/_bv/` bot verification then HTTP 500 (18:21:03Z); Brave: HTTP 429 + captcha (18:21:20Z); Mojeek: JS captcha (18:21:20Z); Startpage: proof-of-work challenge (18:23:21Z) | manual browser checks |
| Whether the free integration-journal PDF is crawlable | no PDF/download URL in the live HTML (18:28:07Z); the download flow was not exercised (safety rule: no download/submit clicks) | owner or a Playwright lens |
| Search impressions / clicks / who searches | not observable from outside | Search Console + Bing Webmaster Tools (owner-account) |
| Which engine the WebSearch tool uses; personalisation | undisclosed; all checks anonymous, US English | - |

## 5. Method notes (how the engines behaved)

- **Bing page 1 only.** `first=11`, `first=11&FORM=PERE`, a session cookie jar taken from the first response, and `format=rss&first=11/21` all returned the same 7 results (tested on "psilocybin integration", 18:19:50Z-18:20:14Z). "Top 20" cannot be observed on Bing by curl. Recorded depth: 7-10.
- **Bing decoys.** Some queries (and all queries after ~18:25:40Z) came back as 10 off-topic results built from one word of the query: "mayaallan" -> Google homepages, then tankless water heaters; "what to do after a mushroom trip" -> dictionary pages for "do"; "site:mayaallan.com grandmother" -> dictionary pages for "grandmother". Genuine responses had 7 results plus a People-also-ask block. Every row flagged "decoy" is excluded from conclusions.
- **Stability.** For every non-decoy query, the second Bing observation (different UA, 3-4 minutes later) gave the same mayaallan positions and the same top 3.
- **WS.** Returns 9-10 results per query with a model-written summary. Only the result URLs and their order were used as evidence, not the summary text (except in rank-W3, which is labelled as summary text).
- **Parser.** Bing `li.b_algo > h2 > a` hrefs, with `bing.com/ck/a?...u=a1<base64>` decoded to the target URL and `msockid` stripped. Note: the "mayaallan" flag in the raw run also matched `linkedin.com/in/mayaallan`; only mayaallan.com hosts are counted as site positions here.

## 6. Brand SERPs (raw)

**"Maya Allan"**
- Bing B1 18:19:46Z (10): 1 mayaallan.com/ "Maya Allan - Author of the Psilocybin Integration Guide" | 2 mayaallan.com/books | 3 linkedin.com/in/mayaallan "Licensed Real Estate Broker, Founder, MAllan" | 4 zillow.com/profile/Maya%20Allan | 5 realtor.com/realestateagents/56d52bb5de071e0100624ed3 | 6 loopnet.com/.../maya-allan/l5e5eegb "Mallan Real Estate Inc." | 7 mallannyhomes.com/agents/2/ | 8 homes.com/real-estate-agents/maya-allan/scwqzj4/ | 9 streeteasy.com/profile/818487-maya-allan | 10 citysnap.com/Maya-Allan. B2 18:24:16Z: #1-#3 identical.
- WS 18:21:35Z-51Z (10): 1 facebook.com/maya.allan.100483/ | 2 facebook.com/public/Maya-Allan/ | 3 instagram.com/mayaalenaa/ ("Maya Allen") | 4 in.pinterest.com/mayaallan2/ | 5 mayaallan.com/ | 6 mayaallan.com/about | 7 en.wikipedia.org/wiki/Maya_Penn | 8 wiki/Maya_Laner | 9 wiki/Maya_Henry | 10 instagram.com/popular/mya-allan/

**"Maya Allan author"**
- Bing B1 18:19:47Z (7): 1 mayaallan.com/ | 2 mayaallan.com/books | 3 facebook.com/profile.php?id=61572138340473 "Maya Allan Author - Facebook" | 4 facebook.com/authormayaalden/ | 5 books.google.com/books/about/Psilocybin_Integration_Guide.html?id=HvafEQAAQBAJ | 6 thecut.com/author/maya-allen/ | 7 researchgate.net/profile/Maya-Allan (McGill). B2 18:24:17Z: #1-#2 identical.
- WS (9): 1 wiki/Maya_S | 2 wiki/Maya_(Campbell_novel) | 3 facebook.com/authormayaalden/ | 4 wiki/Maya_Tatsukawa | 5 wiki/Rosetta_Allan | 6 mayaallan.com/ | 7 mayaallan.com/about | 8 bookseriesinorder.com/maya-alden/ | 9 romance.io/authors/.../maya-alden/latest

**"Maya Allan psilocybin"**
- Bing B1 18:19:49Z (7): 1 mayaallan.com/ | 2 mayaallan.com/books/psilocybin-integration-guide | 3 books.google.com (HvafEQAAQBAJ) | 4 amazon.com/.../dp/B0G7JWDJYQ | 5 barwebooks.com/product/psilocybin-integration-guide-40-real-scenarios-... | 6 amazon.ca/...-ebook/dp/B0G765BZDL | 7 thriftbooks.com/w/psilocybin-integration-guide-40-real-scenarios-... . B2 18:24:18Z: #1-#2 identical.
- WS (9): 1 amazon.com/.../dp/B0G91GZMLT (ISBN 9798994148839) | 2 amazon.com/.../dp/B0G7JWDJYQ (ISBN 9798994148853) | 3 amazon.com/...-ebook/dp/B0G765BZDL (Kindle) | 4 mayaallan.com/ | 5 mayaallan.com/about | 6 researchgate.net figure (ancient Maya mushrooms) | 7 sciencedirect.com S2173580814001527 | 8 academia.edu/7482218 | 9 wiki/Seeking_the_Magic_Mushroom

**"Maya Allan book"**
- Bing B1 18:19:50Z (7): 1 mayaallan.com/books | 2 mayaallan.com/ | 3 amazon B0G7JWDJYQ | 4 books.google.com | 5 amazon Kindle B0G765BZDL | 6 barwebooks.com | 7 thriftbooks.com. B2 18:24:19Z: #1-#2 identical.
- WS (9): 1 bibliovault.org (ISBN 9781566390361, Allan Burns) | 2 wiki/Maya_(Campbell_novel) | 3 wiki/Maya_S | 4 wiki/The_Gathering_(Armstrong_novel) | 5 romance.io (Maya Alden) | 6 mayaallan.com/ | 7 wiki/Maya_Tatsukawa | 8 wiki/Maya_Zankoul | 9 wiki/Rosetta_Allan

**"mayaallan.com"** WS 18:22:36Z-52Z (9): 1 in.pinterest.com/mayaallan2/ | 2 wiki/Mayajaal | 3 wiki/Maya_S | 4 wiki/Maya | 5 mayaallan.com/ | 6 wiki/Mayan | 7 wiki/Maya_Jayapal | 8 wiki/Maya_S._Krishnan | 9 wiki/Maya_Penn. Bing: decoy.

**"psilowire"** Bing 18:20:34Z (7): psilowave.com/, psilovibe.org/, psilowave.com/about, psychwire.com/, app.psychwire.com/notifications, instagram.com/psilo.delic/, instagram.com/psychwire__/ . WS (9): facebook.com/Psilowave, psilowave.com, psilosiren.com, dungeonsdragons.fandom.com (Psilofyr), wiki/Psi_wheel, wiki/Psi, mimir.net, dandwiki.com, wiki/Psilate.

## 7. Book-title SERPs (raw)

**"Psilocybin Integration Guide"**
- Bing B1 18:20:34Z (7): 1 mayaallan.com/books/psilocybin-integration-guide "Psilocybin Integration Guide - 40 Real Psychedelic ..." | 2 amazon.com/Psilocybin-Integration-Guide-Navigating-Experience/dp/B0G7JWDJYQ | 3 books.google.com (HvafEQAAQBAJ) | 4 amazon.com/...-ebook/dp/B0G765BZDL | 5 psychedelicstoday.com/2024/03/27/the-practitioners-guide-to-psychedelic-integration-t... | 6 barnesandnoble.com/w/psilocybin-integration-guide-maya-allan/1148993659 | 7 learnshrooms.com/news/integration-guide-after-psilocybin-2026/ . B2 18:24:20Z: #1 identical.
- WS 18:21:51Z-22:03Z (9): 1 amazon Kindle B0G765BZDL | 2 amazon B0G7JWDJYQ | 3 frontiersin.org (fpsyg.2022.824077) | 4 psychedelicstoday.com (practitioner's guide) | 5 adaa.org | 6 mindbloom.com/blog/psychedelic-integration-complete-guide | 7 shroombros.co/psilocybin-integration-guide-first-72-hours/ | 8 spectrumpsychwa.com MAPS-Integration-Workbook.pdf | 9 alicemicrodoses.substack.com. **mayaallan: none.**

**"Psilocybin Integration Guide Maya Allan"**
- Bing B1 18:20:35Z (7): 1 mayaallan.com/books/psilocybin-integration-guide | 2 mayaallan.com/ | 3 amazon B0G7JWDJYQ | 4 books.google.com | 5 amazon Kindle B0G765BZDL | 6 barnesandnoble.com | 7 amazon.ca Kindle. B2 18:24:21Z: #1-#2 identical.
- WS (9): 1 amazon Kindle B0G765BZDL | 2 amazon B0G91GZMLT | 3 amazon B0G7JWDJYQ | 4 **github.com/mallan67/mayaallan/pull/54** | 5 mayaallan.com/ | 6 mayaallan.com/about | 7 shroombros.co | 8 mindbloom.com | 9 josephdana.substack.com
- WS restricted to github.com (~18:25Z): pull/54, pull/45, pull/52, pull/43, issues/44, pull/53, pull/51, pull/47 (all mallan67/mayaallan), then 2 unrelated repos. `gh api repos/mallan67/mayaallan/issues/{n}` 18:28:25Z: all 8 exist and are closed, created 2026-09-05..06.

**"psilocybin integration guide book"**
- Bing B1 18:20:35Z (7): 1 amazon B0G7JWDJYQ | 2 books.google.com | 3 amazon Kindle B0G765BZDL | 4 barnesandnoble.com | 5 thriftbooks.com | 6 play.google.com/store/books/details/Psilocybin_Integration_Guide_40_Real_Scenarios_fo... | 7 mayaallan.com/ . B2 18:24:21Z: site again #7.
- WS (9): 1 amazon B0G91GZMLT | 2 amazon Kindle | 3 amazon B0G7JWDJYQ | 4 amazon.com/Your-Psilocybin-Mushroom-Companion-Easy/dp/1612439470 (Janikian) | 5 medicinalmindfulness.org/wp-content/uploads/2020/11/Psychedelic_Integration_Guidebook_FinalKMv4_1_.pdf | 6 getsetset.com/products/ultimate-psilocybin-guide | 7 goodreads.com/shelf/show/psychedelic-integration | 8 cdn.prod.website-files.com/.../Psilocybin 101 ... .pdf | 9 psychedelicpassage.com/product/our-psychedelic-integration-guide/ . **mayaallan: none.**

**Full title "Psilocybin Integration Guide 40 Real Scenarios for Navigating What You See, Feel & Experience"**
- Bing (short form "Psilocybin Integration Guide 40 real scenarios") 18:20:36Z and 18:23:44Z: decoy (generic psilocybin pages: wikipedia, webmd, nida ...). UNVERIFIED.
- WS 18:22:36Z-52Z (9): 1 amazon Kindle B0G765BZDL | 2 amazon B0G91GZMLT | 3 amazon B0G7JWDJYQ | 4 getsetset.com | 5 psychedelicstoday.com | 6 frontiersin.org | 7 mindbloom.com | 8 walmart.com/c/kp/psilocybin | 9 alicemicrodoses.substack.com. **mayaallan: none.**

## 8. Handoff

- Status: this lens is complete for Bing page 1 and WS. Google, DuckDuckGo, Bing positions 8-20 and alias-domain indexing are **not done** (section 4).
- Next actions, in order: (1) owner verifies mayaallan.com in Google Search Console and Bing Webmaster Tools and submits the sitemap (rank-02, rank-10); (2) owner decides on repo visibility (rank-04); (3) content PR to retitle the 3 topic pages (rank-06); (4) re-run this lens after reindexing: same 21 queries, two observations each.
- Evidence files: this file + `appears-rankings-part2.md`, both on branch `work/site-visibility`. Each commit's compare lists only its own file.