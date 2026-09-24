# Adversarial verification - appears-rankings (lens `rank-`), 2026-09-24

- Verifies: `docs/operations/evidence/2026-09-24/appears-rankings.md` (commit f7ddac478775b040d4a1f2876d3364bd360c579a) and `appears-rankings-part2.md` on branch `work/site-visibility` (both read live from GitHub, 18:42:47Z and 18:42:57Z).
- Site: https://www.mayaallan.com (Vercel project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y).
- Verifier UTC window for live re-checks: 2026-09-24T18:42:36Z - 2026-09-24T18:49:37Z.
- Method: each finding was re-run live and tested against the usual failure causes: a transient blip (retried), a wrong URL, a measurement artefact, scanner noise, a bot wall mistaken for absence, and a wrongly set severity. **confirmed** = reproduced live in this window. **refuted** = live counter-evidence. **uncertain** = could not be reproduced or refuted live.
- Sources (all live, anonymous, US English):
  1. **Bing V1**: `curl GET https://www.bing.com/search?q=<q>&setlang=en-US&cc=US`, Chrome 128 UA, 18:43:18Z-18:44:19Z. **Bing V2**: the same URL plus `&form=QBLH`, Safari 17.6 UA, 18:44:30Z-18:44:33Z and 18:46:00Z-18:47:20Z. Parser: `li.b_algo h2 a`, with `bing.com/ck/a ... u=a1<base64>` decoded. "MA" means a mayaallan.com, psilowire.com or psilocybinintegrationguide.com URL.
  2. Live site: `curl GET https://www.mayaallan.com/<path>` (status, X-Robots-Tag, meta robots, canonical, title, H1, time) 18:46:12Z-18:46:27Z; robots.txt and sitemap.xml 18:46:35Z; internal links, PDF strings and JSON-LD `@type` on `/`, the book page, `/integration-journal` and `/practices` 18:46:47Z-18:46:48Z; home `sameAs` 18:49:34Z; alias-domain redirects 18:47:27Z-18:47:28Z.
  3. GitHub live: `gh api repos/mallan67/mayaallan` and `issues/{43,44,45,47,51,52,53,54}` 18:45:42Z-18:45:46Z. Anonymous `curl` of `github.com/mallan67/mayaallan/{pull/54,pull/45,issues/44}` 18:45:47Z-18:45:50Z. Anonymous `curl` of this branch's evidence file (github.com blob + raw.githubusercontent.com) 18:49:36Z-18:49:37Z.
  4. Engine probes 18:45:11Z-18:45:25Z: DuckDuckGo html and lite, Mojeek, Brave, Yahoo, Ecosia, the Qwant API and Google. A WebFetch of DuckDuckGo html followed between 18:45:25Z and 18:45:42Z.
  5. **WebSearch tool: not available in this pass.** All four calls, made between 18:44:33Z and 18:45:11Z, returned "Web search was not performed: this session has used its web search budget (200 of 200 WebSearch calls)". **Every claim that rests only on the WebSearch engine ("WS") is UNVERIFIED here. It is not refuted.**
- Not used: the Playwright browser, local files, the scratchpad, repository source files, and Google Search Console / Bing Webmaster Tools (these need the owner's login).
- Persistence: built in memory and saved only with the gitsave recipe to `work/site-visibility`. Sections were appended to the live file fetched from the branch head at push time, because very long commands are cut off on this host.

## 1. Verdicts

| id | verdict | severity (orig -> verified) | live re-check (query / URL, UTC) | reasoning | solution check |
|---|---|---|---|---|---|