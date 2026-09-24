# Evidence - appears-rankings, part 2: topic SERPs and the competition set (lens rank-)

- Lens: DO PEOPLE FIND IT WHEN THEY SEARCH (ids `rank-`), part 2. Main file: `docs/operations/evidence/2026-09-24/appears-rankings.md` (summary, findings, works, unverified, brand + book SERPs, method notes).
- Site: https://www.mayaallan.com
- UTC window of observations in this part: 2026-09-24T18:20:49Z - 2026-09-24T18:28:07Z
- Sources (all live, anonymous, US English):
  - **B1** = Bing, `curl GET https://www.bing.com/search?q=<query>&setlang=en-US&cc=US`, Chrome UA, 18:20:49Z-18:20:54Z. Page 1 only (Bing ignored `first=11`; see main file, method notes).
  - **B2** = Bing second observation, same URL + `&form=QBLH`, Safari UA, 18:24:22Z-18:24:30Z.
  - **WS** = Claude Code WebSearch tool (engine not disclosed, US-only), top 9 per query. Batches: T1-T3 18:22:03Z-18:22:16Z, T4-T6 18:22:16Z-18:22:26Z, T7-T9 18:22:26Z-18:22:36Z, T10 18:22:36Z-18:22:52Z.
  - **WS-site** = WebSearch restricted with `allowed_domains=["mayaallan.com"]`, 18:24:32Z-18:25:25Z.
  - **Live page** = `curl GET https://www.mayaallan.com/<path>` (HTTP status, title, meta robots, canonical), 18:26:10Z-18:26:26Z.
- "MA" = position of any mayaallan.com / psilowire.com / psilocybinintegrationguide.com URL. "decoy" = Bing answered with an off-topic set built from one word of the query (bot-degraded response). A decoy row proves nothing.
- This file was never written locally. Each section was built in memory and saved through the GitHub git-data API. Later sections were appended to the live file fetched from the branch at push time.

## Summary - topic queries

| # | Query | MA Bing B1 | MA Bing B2 | MA WS top 9 | Absence evidence | Her closest live page (GET 18:26Z; all HTTP 200, index,follow, self-canonical) |
|---|---|---|---|---|---|---|
| T1 | psilocybin integration | none (7 results) | none (7) | none | 3 observations, confirmed | /blog/psilocybin-integration-research |
| T2 | how to integrate a psilocybin experience | none (7) | none (7) | none | 3 obs, confirmed | no page titled "how to integrate" |
| T3 | psilocybin integration journal | none (7) | none (7) | none | 3 obs, confirmed | /integration-journal |
| T4 | nervous system reset after psychedelic | none (7) | none (7) | none | 3 obs, confirmed | /nervous-system-reset |
| T5 | belief inquiry | none (7) | none (7) | none | 3 obs, confirmed | /belief-inquiry |
| T6 | ego dissolution integration | none (7) | none (7) | none | 3 obs, confirmed | /scenarios/ego-dissolution |
| T7 | psilocybin integration workbook | none (7) | none (7) | none | 3 obs, confirmed | /books/psilocybin-integration-guide, /integration-journal |
| T8 | integration reflection questions psychedelic | none (7) | none (7) | none | 3 obs, confirmed | /integration-reflection |
| T9 | psychedelic integration book | decoy | decoy (variant "...books") | none | WS only: single observation, absence UNVERIFIED | /books/psilocybin-integration-guide |
| T10 | what to do after a mushroom trip | decoy | decoy (variant "after a mushroom trip integration") | none | WS only: single observation, absence UNVERIFIED | none |

WS-site (restricted to mayaallan.com) returned only `/` and `/about` for every query tried: "psilocybin integration" -> /about, /; "integration reflection questions psychedelic journal" -> /, /about; "nervous system reset after psychedelic" -> / only (filter leaked other domains); "belief inquiry" -> no mayaallan.com URL; "Maya Allan blog practices books psilocybin integration guide" -> /, /about. The topic pages are not returned by this index for any query.

## Raw SERPs per topic

### T1 psilocybin integration
- B1 18:20:49Z (7): 1 beckleyretreats.com/blog/psilocybin-and-integration-why-what-happens-after-matters-more | 2 entheotraining.com/blog/f/how-to-guide-integration-after-a-psilocybin-session | 3 odysseypbc.com/blog-posts/psychedelic-integration-after-psilocybin-journeys | 4 sciencedirect.com/science/article/pii/S258953702500450X | 5 maps.org/integration-station/ | 6 adaa.org/learn-from-us/from-the-experts/blog-posts/consumer-professional/your-psychedelic-therapy-journey | 7 oneretreatsjamaica.com/blog/your-90-day-psilocybin-integration-roadmap/ . Bing modules: People also ask.
- B2 18:24:22Z (7): top 3 identical (beckleyretreats, entheotraining, odysseypbc); MA none.
- WS (9): 1 pmc.ncbi.nlm.nih.gov/articles/PMC12495261/ | 2 adaa.org (Integration 101) | 3 nature.com/articles/s41591-022-01744-z | 4 sciencedirect.com/science/article/pii/S2950484826000238 | 5 oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/OPAB Training SC Panel_Integration Therapist Answers.pdf | 6 frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.824077/full | 7 behrpsychology.com/psychedelic-integration/ | 8 innershift.institute/psilocybin-integration/ | 9 shroombros.co/psilocybin-integration-guide-first-72-hours/