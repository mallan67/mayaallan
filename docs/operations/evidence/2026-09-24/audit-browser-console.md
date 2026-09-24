# Audit evidence — REAL BROWSER + CONSOLE (lens ids `ui-`)

| Field | Value |
|---|---|
| Site | https://www.mayaallan.com (canonical host) |
| Lens | Real browser + console, desktop 1366x900 and mobile 390x844 |
| UTC window | 2026-09-24T18:18:42Z to 2026-09-24T18:38:14Z (browser closed 18:38Z); file written ~18:45Z in chunks (Bash tool rejected one large command) |
| Browser | Playwright MCP, Chromium, request UA `Chrome/153.0.0.0` Windows (request headers of POST /api/marketing/event, 18:20:59Z) |
| Deployment served | Every audited page loaded chunks with `?dpl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` = the production deployment named in the task |
| Sources (all live) | Playwright MCP (navigate, evaluate, console_messages, network_requests, network_request, click, resize, wait_for, close); `curl` GET to the site domains (piped only); `gh api` (PR #57 metadata, branch ref); Vercel MCP `get_project` (prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y, team_kZQh5NYLyrOKqffK0r9EXf4E) |
| Not used | Repository source files, local files, scratchpad, Gmail/Drive, logins, form submits, /api/cron, /api/admin, /api/indexnow |
| Clicks made | Cookie banner Accept/Reject, footer "Cookie preferences", mobile "Open menu", one menu link, one page link, one journal radio (client-side). No Buy/PayPal/Subscribe/Send/Download/AI clicks. |

## 0. Verdict

The site itself runs cleanly in a real browser. Across 26 desktop and 24 mobile page loads there were **0 JavaScript errors, 0 hydration errors, 0 CSP violations, 0 failed network requests, 0 broken visible images, 0 images missing alt, and 0 horizontal overflow**. The only console output is a mobile "preload not used" warning for the book cover, plus the expected 404 on the 404 test page. What fails is measurement and conversion, not code. **Visitors are counted only after they click "Accept all".** Anyone who rejects or ignores the banner produces no pageview and no visitor record. The only exception is one anonymous `book_viewed` event on the book page. Vercel Web Analytics is also reported as not enabled (orchestrator fact, 17:48Z), and PR #57 is still open and unmerged (checked live 18:38:14Z). So "who looks / who clicks" is almost invisible. On the book page, the Buy button sits 3.3 screens down on desktop and 5.7 screens down on mobile. Several indexed pages in the main navigation are empty or thin (Events, Media, Scenarios).

## 1. Desktop 1366x900 — page matrix

Console = errors/warnings (level debug) since navigation. Failed = requests with status >=400 or failed (Playwright network list + `responseStatus`). Imgs = total (broken/missing-alt/empty-alt). Overflow: scrollWidth 1351 vs innerWidth 1366 = scrollbar only. TTFB/load from Navigation Timing.

| # | URL | HTTP | Console | Failed | Imgs | Overflow | TTFB/load ms | Observations | Read UTC |
|---|---|---|---|---|---|---|---|---|---|
| 1 | / | 200 | 0/0 | 0 | 3 (0/0/1 decorative) | none | 205/740 | JSON-LD WebSite+Organization+Person; newsletter at y~4452 of 5105; no language links | 18:18:49Z, 18:29:53Z |
| 2 | /books | 200 | 0/0 | 0 | 1 (0/0/0) | none | 70/204 | 1 book listed | 18:21:40Z |
| 3 | /books/psilocybin-integration-guide | 200 | 0/0 | 0 | 1 (0/0/0) | none | 43/379 | Buy y=2962 of 4270; 9 retailer links; share links; POST /api/marketing/event 200 (book_viewed) | 18:20:57Z |
| 4 | /blog | 200 | 0/0 | 0 | 0 | none | 78/191 | 5 posts, no images | 18:21:59Z |
| 5 | /blog/psilocybin-integration-research | 200 | 0/0 | 0 | 0 | none | 108/346 | 13 citations; no share links; title 102 chars | 18:22:18Z |
| 6 | /events | 200 | 0/0 | 0 | 0 | none | 159/469 | "No events are currently scheduled." (indexed, in header nav) | 18:22:35Z |
| 7 | /about | 200 | 0/0 | 0 | 1 (0/0/0) | none | 179/411 | 0 outbound links | 18:22:54Z |
| 8 | /contact | 200 | 0/0 | 0 | 0 | none | 94/190 | Form: company (honeypot), name, email, message; no action attr (JS); no email shown | 18:23:13Z |
| 9 | /faq | 200 | 0/0 | 0 | 0 | none | 43/307 | 28 in-page anchors, all targets exist | 18:23:34Z |
| 10 | /glossary | 200 | 0/0 | 0 | 0 | none | 44/692 | anchors ok | 18:23:59Z |
| 11 | /media | 200 | 0/0 | 0 | 1 (0/0/0) | none | 48/343 | H1 "Media – Music, Guides & Videos" but 1 item, **not linked** to /media/Mushroom-Healing | 18:24:20Z |
| 12 | /media/Mushroom-Healing | 200 | 0/0 | 0 | 1 (0/0/0) | none | 86/- | back link + image + title only (sitemap-only) | 18:24:49Z |
| 13 | /methods | 200 | 0/0 | 0 | 0 | none | 113/200 | tool anchors exist (curl 18:29:14Z) | 18:25:03Z |
| 14 | /scenarios | 200 | 0/0 | 0 | 0 | none | 49/204 | hub lists **1** scenario (book advertises 40) | 18:25:23Z |
| 15 | /scenarios/ego-dissolution | 200 | 0/0 | 0 | 0 | none | 46/257 | 14 citations; links to book + blog | 18:25:42Z |
| 16 | /belief-inquiry | 200 | 0/0 | 0 | 0 | none | 261/1038 | textarea + 3 prompt chips + Send [disabled]; 0 API calls on load | 18:26:02Z |
| 17 | /nervous-system-reset | 200 | 0/0 | 0 | 0 | none | 52/291 | same; Send disabled | 18:26:33Z |
| 18 | /integration-reflection | 200 | 0/0 | 0 | 0 | none | 81/317 | same; Send disabled | 18:26:51Z |
| 19 | /integration-journal | 200 | 0/0 | 0 | 0 | none | 64/322 | 4 phase radios, intention 0/280, date, "Download free PDF" | 18:27:10Z |
| 20 | /privacy | 200 | 0/0 | 0 | 0 | none | 59/- | "Last updated: May 20, 2026"; no mention of Vercel/Web Analytics | 18:27:44Z |
| 21 | /terms | 200 | 0/0 | 0 | 0 | none | 151/- | "Last updated: July 10, 2026" | 18:28:00Z |
| 22 | /refunds | 200 | 0/0 | 0 | 0 | none | 57/- | "Last updated: May 19, 2026" | 18:28:14Z |
| 23 | /practices | 200 | 0/0 | 0 | 0 | none | 66/- | in sitemap, **not in header or footer** | 18:28:27Z |
| 24 | /legal | 200 | 0/0 | 0 | 0 | none | 52/- | educational disclaimer | 18:28:42Z |
| 25 | /he | 200 | 0/0 | 0 | 0 | none | - | lang=he dir=rtl; header nav stays English | 18:29:38Z |
| 26 | /this-page-does-not-exist-xyz | 404 | 1/0 (the 404 document) | - | 0 | none | - | friendly 404; robots metas conflict (index,follow + googlebot index + noindex) | 18:29:21Z |

Cart/checkout/shop: none. `/cart /checkout /shop /store /buy` -> 404 (curl 18:28:57Z). Purchase happens only on the book page.