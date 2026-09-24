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