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