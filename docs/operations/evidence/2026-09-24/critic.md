# Completeness critic - mayaallan.com visibility audit (2026-09-24)

- **Lens:** completeness critic. It reads the 9 lens audits and 9 verifier files listed below and does not redo them.
- **UTC window:** the critic's own live reads ran 2026-09-24T19:18:59Z-19:19:58Z. The inputs cover 18:18Z-19:10Z. This file was saved to git after 19:20Z.
- **Sources used by the critic:** the GitHub API on mallan67/mayaallan (branch work/site-visibility, PR and issue metadata); Vercel MCP scoped to prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y / team_kZQh5NYLyrOKqffK0r9EXf4E; curl GET to www.mayaallan.com. The critic used no local files, no repository source, no DNS, sent no POST to the site and made no /api/cron, /api/admin or /api/indexnow call.
- **Rule:** PROVEN means the lens and its verifier both reproduced the fact live (two or more observations). Everything else is labelled.

## Inputs (branch work/site-visibility, docs/operations/evidence/2026-09-24/)

| Lens | Audit file @ commit | Verify file @ commit |
|---|---|---|
| crawl | audit-crawl.md (+part2, part3) @ fc0b6d71 | crawl.verify.md @ 7c117379 |
| browser | audit-browser-console.md @ 65c6e4ee | browser.verify.md @ 765cdbb6 |
| visibility | audit-crawler-access.md @ 01eab334 (PARTIAL, see G2) | visibility.verify.md @ 12ef79e8 |
| ops | audit-ops-errors.md @ 0fece95f | ops.verify.md @ ecbcc4ca |
| analytics | audit-visitors-clicks.md @ afbf3839 | analytics.verify.md @ 08c74ae0 |
| index | appears-index-presence.md @ 23f8fd6a | index.verify.md @ 1fbb08db |
| rank | appears-rankings.md (+part2) @ f7ddac47 | rank.verify.md @ 74d88c61 |
| footprint | appears-offsite-footprint.md @ 3bd6fd13 | footprint.verify.md @ 9fdb61f8 |
| datasets | appears-crawl-archive.md @ da1bd887 | datasets.verify.md @ 96439eb2 |

## Critic's own live reads

| # | Check | Result | Source, UTC |
|---|---|---|---|
| C1 | Evidence files on the branch | 20 files plus tools/. audit-crawler-access.md is still 7,102 B: the header and section 1 only | gh api contents?ref=work/site-visibility, head f02a2b56, 19:18:59Z |
| C2 | Production deployment | dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 READY at commit ed7461a (#56). The 3 newest production deployments are all ed7461a | Vercel list_deployments target=production, ~19:19Z |
| C3 | Web Analytics | 400 web_analytics_not_enabled for 2026-08-24 to 2026-09-24T19:20Z | Vercel count_pageviews, ~19:19Z |
| C4 | PR #57 | open, not merged, not draft, mergeable_state clean, last updated 2026-09-07T03:49:42Z, head fa5d59b3 | gh api pulls/57, 19:19:19Z |
| C5 | Cron traces in logs | Project-wide query "/api/cron" over 24h timed out and returned no data. Query "cron" on dpl_5ug8 over 24h, grouped by path: 0 rows | get_runtime_logs, ~19:19:16Z and ~19:19:40Z |
| C6 | AEO tracker PR metadata | #44 (an issue) and #46 (merged 2026-09-05T13:12:32Z) describe /api/cron/aeo-track. #46 lists "cron schedule" under "Not changed". Neither body mentions CRON_SECRET or how the cron authenticates | gh api issues/44 and /46, 19:19:40Z-19:19:53Z |
| C7 | Manifest context | The PR #47 body (merged 2026-09-05T21:10:46Z) says "public/manifest.json removed. Nothing linked it and both referenced icons were 404." The manifest 404 in crawl-14 and ops-08 is therefore deliberate | gh api issues/47, 19:19:40Z |
| C8 | Slow-page outliers | 12 GETs (/, /integration-journal, /blog/psilocybin-integration-research and the book page, 3 rounds): all 200, TTFB 0.27-0.69 s, total 0.31-0.72 s, all x-vercel-cache MISS | curl, 19:19:53Z-19:19:58Z |

## 1. Why the site is not seen, ranked

**Bottom line.** Nothing technical blocks the site. Five lenses and their verifiers each ruled out, with two or more observations: robots.txt blocking, noindex (meta or header), 4xx/5xx errors, bad canonicals, duplicate-host leakage, user-agent blocking, a Vercel firewall, password or SSO on the custom domains, and an invalid sitemap (crawl, visibility, index, datasets and ops lenses, 18:18Z-19:10Z). What is proven is a discovery and authority problem. No other site links to this one. No public crawler has returned since January. The book has no reviews. The site ranks only for people who already type its name or the book title. Whether Google has indexed it at all is unknown (N1).

### 1a. PROVEN live

| Rank | Reason | Key evidence | Verifier |
|---|---|---|---|
| 1 | No off-site page links to or mentions mayaallan.com, and public crawlers have not returned since 2026-01-31 | foot-02: 0 mentions on Amazon (3 formats plus the author page), Goodreads, Google Play and Books, B&N, ThriftBooks, AbeBooks, Bokus and Pinterest; a Bing "-site:" query read twice (18:27Z, 18:58Z). ds-02: Common Crawl has 0 captures in all 14 indexes from 2025-33 to 2026-39, with a working positive control (18:41Z-18:49Z). ds-01: Wayback's last capture is 20260131124458, with nothing from 202602 on (18:40:47Z). idx-08 | foot-02 high, ds-02 high, ds-01 medium, idx-08 medium; all confirmed |
| 2 | Visible only to people who already know the name or title, and absent from every topic search | rank-01: no mayaallan URL in Bing's top 7 for 8 topic queries, read 3-4 times each (18:20Z-18:44Z). rank-W1/W2: #1-#2 for 4 name queries and #1 for the book title (Bing, 18:43Z) | confirmed high |
| 3 | No social proof anywhere | foot-01: 0 ratings or reviews on the 3 Amazon formats, Goodreads and ThriftBooks. Amazon best-seller rank runs from #957,243 (paperback) to #3,949,951 (hardcover) (18:50Z-18:55Z) | confirmed high |
| 4 | Topic pages do not use searchers' words or offer the formats that win | rank-06: for example, the H1 of /integration-reflection is "Integration". rank-07: PDFs, numbered lists and marketplace listings win these searches; the HTML has no PDF URL and /download/ is disallowed | confirmed medium |
| 5 | Thin or empty indexable pages and an unlinked language cluster | vis-03: 19 of 38 URLs have 135 words or fewer in main. ui-05: /events is empty, /media has 1 item, /scenarios shows 1 of 40. crawl-03: 11 sitemap URLs cannot be reached by links from / | confirmed medium |
| 6 | Weak author identity | Person sameAs lists Instagram only (18:46Z, 18:49Z). Positions #3-#10 on the name search are real-estate profiles. The Goodreads author page is unclaimed (foot-03, foot-06, rank-05, idx-07) | confirmed low to medium |
| 7 | Gaps in retail distribution | foot-05: no Apple Books ebook (iTunes lookup returned 0 for all 3 ISBNs), no NOOK edition, no audiobook | confirmed medium |
| 8 | Nothing has shipped for 16+ days | ops-05 and C2: production and main are both ed7461a (2026-09-06), and PR #57 is still waiting (C4) | confirmed medium |
| 9 | Title, description and canonical are sometimes streamed after </head> for bots not on the Next.js list | crawl-04, vis-02: 34 of 128 non-Bing responses (18:42Z). bingbot, facebookexternalhit and LinkedInBot always got them in the head | confirmed. The effect on indexing is NOT proven (X9) |

### Measurement blind spot: why "who looks and who clicks" has no answer

| # | Fact | Evidence | Verifier |
|---|---|---|---|
| M1 | Vercel Web Analytics is off, so no visitor data has ever been stored | ana-01, ui-02, ops-03 and C3: more than 10 reads by 4 lenses, 17:48Z-19:19Z | confirmed critical/high |
| M2 | Analytics and the visitor beacon load only after "Accept all" | ana-02, ui-01: live chunk 312c5210c9c35dc5.js (18:27Z, 18:46Z, 18:53Z) | confirmed high |
| M3 | Retailer and outbound link clicks are not tracked | ana-03 (23 chunks scanned) | confirmed medium |
| M4 | Runtime logs keep about 24 hours, with no user agent or referrer | ana-04: ExceedsBillingLimitError for anything before about 2026-09-23T18:54Z | confirmed medium |
| M5 | No sign of a human visitor in the one day that can be observed | ana-05: 8 book-page requests but 0 book_viewed events (that event fires without consent), and 0 contact, subscribe, checkout or chat calls (2026-09-23T18:00Z to 09-24T17:30Z) | confirmed "no sign". "Zero humans" is NOT proven |

No in-scope source can recover the past month of visitors. Counting starts only when M1 is switched on, and visitors who do not accept cookies are counted only after PR #57 (M2) is merged and deployed.

### 1b. Needs Search Console or another outside source

| # | Open question | Why it cannot be proven here | What closes it |
|---|---|---|---|
| N1 | Is the site in Google's index, and for which queries does it appear? | Google blocked 4 curl reads, WebFetch and Startpage (idx-02, rank-10) | GSC Pages report, URL Inspection and Performance |
| N2 | Is the GSC property verified, and was the sitemap submitted? | A google-site-verification DNS TXT record exists (visibility verifier, via 8.8.8.8 and 1.1.1.1, 18:41:14Z-18:41:15Z; DNS is outside the listed sources), so verification was at least started | GSC Settings > Ownership, and Sitemaps |
| N3 | Bing verification, sitemap submission and true Bing coverage | /BingSiteAuth.xml returns 404 and there is no msvalidate tag. Bing shows 8 URLs but estimates "About 36 results" | Bing Webmaster Tools (can import from GSC) |
| N4 | The exact number of backlinks | Only mention searches were possible (reason 1 above) | GSC Links, Bing WMT Backlinks |
| N5 | Does the WebSearch tool's engine index only / and /about? | Only one engine, and it could not be re-run (budget 200/200 at about 18:25Z and 18:45Z) | Re-run the same queries (G5) |
| N6 | What real Googlebot and Bingbot IP addresses receive | Every crawler test spoofed the user agent | GSC and Bing URL Inspection (live test) |
| N7 | Core Web Vitals for real visitors | Speed Insights is not installed (ana-06) | CrUX or PageSpeed Insights |
| N8 | Do AI answer engines (ChatGPT, Perplexity, Claude, Gemini) cite the site? | No lens may submit text to AI tools, and the AEO tracker is unproven (section 2) | Owner reads the /admin/aeo results |
| N9 | Which profiles are the owner's (LinkedIn /in/mayaallan, Facebook id 61572138340473, Pinterest, TikTok); KDP Select status; the Goodreads claim | Only the owner knows | Owner |

## 2. Weekly SEO/AEO cron /api/cron/aeo-track: UNPROVEN

**Verdict:** the cron is registered, but it has never been shown to run and never been shown to fail. No in-scope source keeps a Monday run.

| Step | Fact | Source, UTC | Status |
|---|---|---|---|
| 1 | Registered on production: /api/cron/aeo-track, schedule "0 9 * * 1" | REST GET /v13/deployments/dpl_5ug8 (18:24:23Z, re-read 19:00:19Z) | PROVEN |
| 2 | The function exists in the build | The build route table lists /api/cron/aeo-track as a dynamic function; 41/41 checks passed (18:30:20Z, 19:07:20Z) | PROVEN |
| 3 | This deployment has served since 2026-09-08T07:57Z, so the Monday 09-14 and 09-21 runs at 09:00Z were due on it | C2 (~19:19Z); get_deployment (18:21:30Z) | PROVEN |
| 4 | Run history | The log query for the 09-21 window returned ExceedsBillingLimitError (19:01Z). "aeo-track" over 24h: 0 rows (19:01:44Z). "cron" over 24h: 0 rows (C5). Observability Plus is off (404, 19:02:04Z). There is no cron-history API, and no GitHub workflow or issue records runs | NO DATA |
| 5 | CRON_SECRET is not set | Env names via v10 (18:24:05Z, 19:00:15Z) and v9 (19:00:42Z); team shared env is empty (19:00:38Z) | PROVEN absent |
| 6 | Does the route require CRON_SECRET? | Reading source is out of scope, and the PR #44/#46 metadata says nothing about it (C6) | UNKNOWN |
| 7 | Did any run throw an error? | get_runtime_errors over 7 days: "No runtime errors" (18:18:55Z, about 18:59Z). This is weak evidence: it counts only unhandled exceptions, would not show a 401, and its 7-day coverage is itself unverified | WEAK negative |
| 8 | Were results stored? | Visible only on /admin/aeo, and login is forbidden | UNKNOWN |

If the route checks CRON_SECRET, every run has been refused with a silent 401. If it does not check it, the job runs, and anyone can trigger it and spend AI-provider money. Live data cannot tell these two cases apart. Either way, the tracker only measures AI citations. It neither causes the site to be unseen nor fixes it (ops verifier).

**Checks that close it:**
- In scope and live: between 2026-09-28T09:00Z and 2026-09-29T09:00Z, run get_runtime_logs with the production deploymentId and query "aeo-track", then record the status. 200 means running, 401 or 403 means refused, 5xx means failing, and no row means it was not invoked. A project-wide query timed out at 19:19Z, so scope it to the deployment.
- Owner: the date of the newest result on /admin/aeo.
- Durable fix: a heartbeat (last run time and status) that can be read without logging in, as ops-01 proposes. ops-01's first step, "Cron Jobs > View logs", does not work, because it opens the same 1-day logs (ops verifier).

## 3. Contradictions between lenses, and between audits and verifiers

| # | Topic | One side | Other side | Resolution |
|---|---|---|---|---|
| X1 | Search-engine verification | vis-01 (high): no verification anywhere. The index verifier: "DNS TXT is the only method that could exist", not checked | The visibility verifier found a google-site-verification TXT record through 2 resolvers, which refutes vis-01 for Google | Google verification was at least started, so the "add a DNS TXT Domain property" steps in idx-02, idx-10 and rank-10 are probably done already. Whether it is still verified is N2. Bing is unknown |
| X2 | "Demand" for /BingSiteAuth.xml and feeds | vis-01 and vis-12 cite about 8 log hits each | Visibility verifier: 0 such requests from 09-23T18:48Z to 09-24T17:00Z; every hit was an audit probe | Audit artefact, not evidence of demand |
| X3 | hreflang | idx-06: the localized pages have 0 hreflang | crawl-05, vis-07 and the index verifier: 7 hrefLang tags on each localized page and 84 in the sitemap; only / and /about lack them in the HTML | idx-06 is refuted (a case-sensitive search). Drop the hreflang step from idx-01's fix |
| X4 | "Stale" Bing snippets | idx-04: Bing has not recrawled | Index verifier: Bing quotes the live og/twitter text. /books inherits og:title "Maya Allan" and og:url / (vis-05) | Refuted. The fix is per-page Open Graph metadata, not IndexNow |
| X5 | Bing coverage | idx-01: 8 of 38 URLs | Rank verifier: "Bing indexes about 36 of 38" | Both overreach. "About 36 results" is Bing's estimate and 8 is a lower bound. The true number is N3 |
| X6 | Human traffic | ops-04: "almost no human activity", based on 0 beacon calls. The ops verifier: uncertain, because the beacon needs consent | ana-05 and its verifier: "no sign" confirmed, using book_viewed, which needs no consent | ana-05's reasoning holds and ops-04's does not. The claim is limited to "no sign of humans on the book page, and no conversions" |
| X7 | Beacon | ops works item: it fires "when a real browser loads a page" | Ops verifier: holds=false. Browser and analytics lenses: it fires only after Accept | It is consent-gated (M2) |
| X8 | Response time | crawl: max 0.76 s, nothing over 2.5 s. browser: TTFB 43-261 ms | vis-06: 6.42 s (18:20:48Z). Rank verifier: 5.31 s on /integration-journal and 4.48 s on the research post (18:46Z). Crawl exploratory run: 2.88 s | Slow outliers happened at least 3 times, while warm reads are fast (C8: 0.31-0.72 s). The cause, cold renders of an uncached and fully dynamic site, is inferred. What real visitors experience is N7 |
| X9 | Metadata streamed out of the head | Crawl verifier: medium (on /faq the canonical sits at byte 136,553 of 140,067) | Visibility verifier: low | Same facts, different impact judgement. Neither is proven until GSC URL Inspection shows the rendered head. On the fix, a custom htmlLimitedBots replaces the Next.js default list, so the audits' bot lists would drop bingbot, facebookexternalhit and LinkedInBot. Use /.*/ or keep the defaults (crawl verifier) |

| X10 | Sitemap size | Browser audit: 30 URLs | Every other lens: 38 | 38 (browser verifier) |
| X11 | Word counts on /books | crawl-10: 128 | vis-03: 50; the verifiers: 115/44 and 52 | Whole body vs main only. All agree the page is thin |
| X12 | Title lengths | ui-16: 102; vis-09: /fr 103 | The verifiers: 97 and 98 | Raw vs decoded HTML entities; use the decoded count. 17 of 38 titles are over 60 characters |
| X13 | "Sign out of PayPal" link | ui-04, vis-11: a defect | Footprint verifier: a deliberate helper for switching accounts | The owner's UX decision; it does not affect visibility |
| X14 | Instagram | foot-02 fix: add the site to the Instagram bio. ui-08: no outside links | Footprint verifier: the bio already links mayaallan.com | Drop that step |
| X15 | Icons and manifest | crawl-14: apple-touch-icon returns 404 and there is no manifest | Crawl verifier: the icon is declared and returns 200. C7: PR #47 removed the manifest on purpose | Not defects |
| X16 | Build noise | ops-11: 6 preview builds | Ops verifier: 182 preview deployments and 353 Actions runs today | The audit itself produces them, and this critic commit adds one more |
| X17 | Log baseline pollution | ana-10: until about 2026-09-25T18:40Z | Analytics verifier: until at least 2026-09-25T19:00Z; the critic read logs until 19:20Z | Do not use runtime logs as a traffic baseline before 2026-09-25T19:20Z |
| X18 | Language-page fix | vis-03: noindex the localized pages | Visibility verifier: noindex breaks the hreflang cluster in the sitemap | Expand the pages, or remove the pages and their hreflang entries together |
| X19 | Severity of "Web Analytics off" | ui-02: medium | ana-01: critical; the ui-02 and ops-03 verifiers: high | High to critical |

## 4. Gaps, and the check that closes each

| # | Gap | Why it is still open | Check that closes it (in scope unless marked "outside") |
|---|---|---|---|
| G1 | Whether the cron runs | Logs are kept for only 1 day | The live log query on 2026-09-28 (section 2) |
| G2 | audit-crawler-access.md holds only section 1 (C1) | Its third save was blocked by auto mode | Append sections 2-8 from the lens's structured output with gitsave, built from the live file; or record that visibility.verify.md is the authoritative copy |
| G3 | "No JS errors, no failed requests, no sideways scroll" rests on one browser pass (18:18Z-18:36Z); the verifier ran no browser | The Playwright MCP writes files into the Desktop checkout (ui-17) | The owner first moves the Playwright output folder outside every copy of the repository; then a second browser pass at desktop and mobile widths |
| G4 | About 13 of the 38 sitemap pages, including 4 blog posts and /es, /pt, /de and /fr, were never loaded in a real browser | Not covered by any lens | The same browser pass |
| G5 | Claims resting only on WebSearch: rank-02, the non-Bing half of rank-03 and idx-03, rank-04 (PR #54 at #4), rank-W3, foot-09 and the absence half of idx-01 | The WebSearch budget ran out | Re-run the identical queries in a fresh session, 2 observations each |
| G6 | DuckDuckGo, Brave, Yahoo, Mojeek, Startpage, Ecosia, Kobo, Bookshop and Waterstones | Bot walls | Outside: the owner checks in a normal browser |
| G7 | Google index and queries | Automated reads are blocked | Outside: GSC (N1, N2) |
| G8 | Whether /api/cron/aeo-track checks CRON_SECRET | Reading source is not allowed in this workflow | Outside this workflow: a code lens on live GitHub main |
| G9 | Whether "Reject" clears existing ma_* cookies (ui-13) | Checked only in the live JS | The G3 browser pass |
| G10 | What real crawler IP addresses receive | Only spoofed user agents were tested | Outside: GSC and Bing URL Inspection |
| G11 | Bing verification (CNAME) and a second read of the Google TXT record | DNS is not on the allowed source list | The owner allows a DNS-over-HTTPS GET, or the answer comes from GSC and Bing WMT |
| G12 | IndexNow key and pings | /api/indexnow is forbidden and the key is not public | Outside: the Bing WMT IndexNow report |
| G13 | Are /api/marketing/* rows stored, and what does /admin/analytics show? | Login is forbidden | Outside: owner |
| G14 | How often the slow outliers happen (X8) | 3 single readings, all during audit traffic | Two curl passes over all 38 URLs after at least 1 hour with no audit traffic |
| G15 | Does the sitemap update only on deploy (vis-08)? | Inferred, not observed | After the next content change, GET /sitemap.xml and compare Age and lastmod |
| G16 | How PR #57 behaves | Its preview is behind SSO | After merge and deploy: count_pageviews returns a number, and the new chunk loads Analytics without consent |
| G17 | Do the PayPal Buy flow and the newsletter sign-up actually work? | Clicking them is forbidden | Outside: an owner test purchase and a test sign-up. The observed day had 0 checkout and 0 subscribe calls (ops-04) |
| G18 | Where the book appears in AI answers | No lens may query AI tools | N8 |

## Not done by this critic

- It fixed nothing. No site content, Vercel setting, env var or PR was changed.
- It re-ran no lens audit. The verdicts above come from the 9 verify files plus the critic's 8 live reads (C1-C8).
- Open owner actions implied by the evidence include enabling Web Analytics (M1), merging PR #57 (M2, C4), checking GSC and Bing WMT (N1-N4), and adding CRON_SECRET or a heartbeat (section 2). None of them has been done.
- G1-G18 remain open.