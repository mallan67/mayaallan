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

## 2. Mobile 390x844 — page matrix

Broken = visible images only (see ui-09 for the hidden hero). scrollW 375 = 390 minus scrollbar; 390 on full-height tool pages.

| URL | Console | scrollW/innerW | Broken/noAlt | Observations | Read UTC |
|---|---|---|---|---|---|
| / | 0 err / 1 warn (cover w=384 preloaded, not used) | 375/390 | 0/0 | banner 375x287 = 34% of viewport; buttons 343x41 / 343x40 | 18:30:17Z |
| mobile menu | 0 err / +1 warn (same) | - | - | aria-expanded=true, aria-controls=mobile-menu-panel; 9 links 268x52; tapping Books navigates and closes panel | 18:30:55Z-18:31:14Z |
| /books | 0 err / 1 warn (same) | 375/390 | 0/0 | Reject clicked here | 18:31:14Z |
| /books/psilocybin-integration-guide | 0 err / 1 warn (same) | 375/390 | 0/0 | Buy y=4778 of 7307 (265x40); retailers y=5118-5663 (292x47); small targets "Back to Books" 115x20, "Sign out of PayPal" 97x14 | 18:31:30Z |
| /blog | 0/0 | 375/390 | 0/0 | - | 18:31:53Z |
| /blog/psilocybin-integration-research | 0/0 | 375/390 | 0/0 | docH 16089 | 18:32:10Z |
| /events | 0/0 | 375/390 | 0/0 | - | 18:32:23Z |
| /about | 0/0 | 375/390 | 0/0 | - | 18:32:35Z |
| /contact | 0/0 | 375/390 | 0/0 | inputs font 14px; honeypot offscreen (-9999px, aria-hidden, tabindex -1) | 18:32:47Z |
| /faq | 0/0 | 375/390 | 0/0 | - | 18:33:09Z |
| /glossary | 0/0 | 375/390 | 0/0 | - | 18:33:21Z |
| /media | 0/0 | 375/390 | 0/0 | - | 18:33:35Z |
| /methods | 0/0 | 375/390 | 0/0 | - | 18:33:47Z |
| /scenarios | 0/0 | 375/390 | 0/0 | - | 18:33:59Z |
| /scenarios/ego-dissolution | 0/0 | 375/390 | 0/0 | - | 18:34:11Z |
| /belief-inquiry | 0/0 | 390/390 | 0/0 | textarea in view (font 15.2px); Send 44x44 disabled; chips 334x71 | 18:34:23Z |
| /nervous-system-reset | 0/0 | 390/390 | 0/0 | textarea in view | 18:34:36Z |
| /integration-reflection | 0/0 | 390/390 | 0/0 | textarea in view | 18:34:46Z |
| /integration-journal | 0/0 | 375/390 | 0/0 | radios 294x61; Download y=1095 (167x40) | 18:34:55Z |
| /privacy | 0/0 | 375/390 | 0/0 | - | 18:35:06Z |
| /terms | 0/0 | 375/390 | 0/0 | - | 18:35:15Z |
| /refunds | 0/0 | 375/390 | 0/0 | - | 18:35:26Z |
| /he | 0/0 | 375/390 | 0/0 | nothing off-screen (RTL) | 18:35:36Z |
| /practices | 0/0 | 375/390 | 0/0 | not in header/footer on mobile either | 18:35:47Z |

## 3. Header, footer and mobile-menu links

Header (10): `/ /books /belief-inquiry /nervous-system-reset /integration-reflection /media /events /about /contact`. Footer (17): `/books /events /media /about /belief-inquiry /nervous-system-reset /integration-reflection /integration-journal /methods /blog /scenarios /glossary /faq /contact /privacy /terms /refunds`. Mobile menu (9) = the header set. All returned **200** in the browser and via curl GET (18:28:57Z). The curl pass also covered all sitemap URLs, `/es /pt /de /fr /he /es/about /he/about /robots.txt /llms.txt` and the book OG image (200, 219 KB).

| Host (curl GET /, 18:29:14Z) | Result |
|---|---|
| mayaallan.com | 308 -> https://www.mayaallan.com/ |
| psilowire.com, www.psilowire.com | 308 -> www.mayaallan.com |
| psilocybinintegrationguide.com, www. | 308 -> www.mayaallan.com |
| mayaallan.vercel.app | 308 -> www.mayaallan.com |
| mayaallan-mallan.vercel.app, mayaallan-git-main-mallan.vercel.app | 302 -> vercel.com/sso-api (get_project: ssoProtection all_except_custom_domains) |

## 4. Cookie consent and tracking — before vs after

The Playwright profile arrived with `localStorage.mayaallan_consent_v1="rejected"` from an earlier run, so no banner showed at 18:18:49Z. I removed it (later also the cookies and sessionStorage) to simulate a first-time visitor.

| UTC | Action | Requests (non-static, excl. RSC prefetch) | Storage / cookies |
|---|---|---|---|
| 18:19:29Z | Fresh visitor, home | document, 2 fonts, CSS, 2 /_next/image, 12 JS, 18 ?_rsc prefetches. **No analytics, no third party.** | Banner role=dialog "Privacy choices ... anonymous visitor IDs and UTM-based campaign attribution" with **Reject analytics** / **Accept all** + privacy link |
| 18:19:44Z | **Accept all** | GET /9de18cd67c0a6252/script.js 200 (Vercel Analytics on an obfuscated first-party path, cache HIT). POST /api/marketing/visitor 200 {"ok":true}. POST /9de18cd67c0a6252/view 200 (text/plain, len 2, MISS, 18:19:46Z) | consent=accepted; cookies ma_visitor_id, ma_session_id, ma_first_touch, ma_last_touch (names only) |
| 18:20:24Z | Fresh, /books, **Reject analytics** | none | consent=rejected, 0 cookies, no analytics script |
| 18:20:59Z | Book page while rejected | POST /api/marketing/event 200, body {eventName:"book_viewed", path, properties:{book_id, slug, title, direct_sale_enabled:true, ebook_price:9.99}}, no cookie | sessionStorage ma_book_viewed:1 (once per session) |
| 18:36:06Z | Footer **Cookie preferences** | - | banner reappears; stored consent cleared |
| 18:36:16-26Z | Accept, then client-side link to /integration-journal | script.js 200; /view 200 for /practices **and again** for the route change | consent=accepted, but **no ma_* cookies and no /api/marketing/visitor** (ui-13) |
| 18:37:02-21Z | Fully fresh: home (undecided) -> book page (undecided, book_viewed sent) -> Accept on page 2 | script.js, POST /api/marketing/visitor 200, /view 200 | 4 ma_* cookies, ma_bootstrapped set |

- No requests at any time to va.vercel-scripts.com, /_vercel/insights or vitals.vercel-insights.com. Analytics runs from first-party `/9de18cd67c0a6252/`. No Google, Meta or other trackers.
- The CSP (response header on /api/marketing/event) allows script-src self, PayPal and va.vercel-scripts.com, and connect-src self, *.supabase.co, PayPal and vitals.vercel-insights.com. It sets frame-ancestors 'none'. **No CSP violation in any console.**
- Web Analytics: the orchestrator reports `web_analytics_not_enabled` (17:48Z; not re-read, and `get_project` does not expose the flag). PR #57 "feat(analytics): count every visitor, and show where they came from": **open, merged=false**, created 2026-09-07T02:58:16Z, updated 2026-09-07T03:49:42Z (gh api 18:38:14Z).
- My test footprint, to exclude from stats: 2 visitor registrations (18:19:44Z, 18:37:21Z), 4 /view beacons (18:19:46Z, ~18:36:16Z, ~18:36:26Z, ~18:37:21Z), 2 book_viewed events (18:20:59Z, 18:37:11Z), UA Chrome/153 Windows.

## 5. Tools and buy buttons (client-side only)

| Item | Observed live | Stopped before |
|---|---|---|
| Belief Inquiry / Nervous System Reset / Integration Reflection | Textarea + 3 prompt chips + icon "Send message" button that stays **disabled** while empty. 0 API requests on load. Footer hidden, header visible. | Typing/sending, and clicking the prompt chips (they may send immediately) — AI submission |
| Integration Journal | Phase radio "integration" selected client-side (18:27:32Z) with no console output and no request | "Download free PDF" (form submit, server-side PDF) |
| Contact | Form renders; honeypot hidden correctly | "Send" |
| Home newsletter | Email + honeypot + "Subscribe" (y~4452) | "Subscribe" |
| Buy Ebook with PayPal · $9.99 | Rendered, visible, enabled, type=submit. Desktop 265x40 at y=2962; mobile y=4778. No paypal.com request before click (SDK not preloaded). | Click (payment) |
| Retailer links | 9 visible (Amazon x3, Google Play, Barnes & Noble, Bookshop, Waterstones, bokus, AbeBooks), target=_blank rel="noopener noreferrer nofollow sponsored" | Opening them |