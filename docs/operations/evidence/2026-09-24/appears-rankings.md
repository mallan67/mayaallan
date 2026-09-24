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