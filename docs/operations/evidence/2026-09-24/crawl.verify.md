# Crawl lens: adversarial verification (2026-09-24)

- **Lens:** live-crawl. This file verifies the findings in `docs/operations/evidence/2026-09-24/audit-crawl.md` (commit fc0b6d71903b266b7c75d3336733997da044ca0a).
- **Live read window (UTC):** 2026-09-24T18:50:41Z to 2026-09-24T18:59:01Z.
- **Sources used:** GET/HEAD requests from curl and Node `fetch` to https://www.mayaallan.com, the apex, and the alternate domains listed in the task, with at most 4 requests at a time and 30 s timeouts. The Vercel MCP call `list_deployment_events` (idOrUrl=dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4, teamId=team_kZQh5NYLyrOKqffK0r9EXf4E, build bld_1pjmk47jw) was read at 2026-09-24T18:58Z. The live GitHub ref `work/site-visibility` was read at 18:59:01Z (head 78f08b0d4844).
- **Not used:** repository source files, local files, scratch files, the Playwright browser, or any login. No form was submitted. No /api/cron, /api/admin or /api/indexnow URL was called.
- **Method:** Every finding was re-run live and I tried to disprove it by retrying 2 or more times, changing the user-agent, searching the whole HTML rather than only `<head>`, and checking whether the proposed fix would actually work. Page captures were kept in shell pipes only and none were stored.

## Verdict summary

| id | verdict | severity (audit → verified) | one-line reason |
|---|---|---|---|
| crawl-01 | confirmed | medium → **low** | Reproduced 15/15 MISS with `private, no-store`. The live build log shows every page route as ƒ Dynamic. TTFB is still good (0.27–0.79 s), so this does not explain the invisibility. |
| crawl-02 | confirmed | medium → **medium** | 29/38 pages have no og:image with both the facebookexternalhit and Chrome UAs. 10 of those, including all 5 blog posts, have no twitter:image either. |
| crawl-03 | confirmed (understated) | medium → **medium** | No English page links to the whole localized cluster of 10 URLs. /media/Mushroom-Healing appears only inside share-button URLs. |
| crawl-04 | confirmed (understated) | medium → **medium** | `<link rel=canonical>` is also streamed out of `<head>`. GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Googlebot are each affected on 9 to 18 of 38 pages per run. |
| crawl-05 | confirmed | low → **info** | The HTML is non-reciprocal, but sitemap.xml carries the full reciprocal set for all 12 URLs, so the practical impact is small. |
| crawl-06 | confirmed | low → **info** | hreflang pt-BR against html lang=pt. Google ignores html lang. |
| crawl-07 | confirmed | low → **low** | /integration and /reset 308, linked from 2 posts. |
| crawl-08 | confirmed (fact), not a defect | low → **info** | The 2-hop http→https(same host)→www chain is what HSTS preload requires. The proposed preload step would fail today (see note). |
| crawl-09 | confirmed | low → **low** | 7 case variants return 404. The proposed lowercasing middleware alone would break the existing page. |
| crawl-10 | confirmed | low → **low** | Main-content words: /books 44, /media 7, /events 15, /contact 20, /media/Mushroom-Healing 6. |
| crawl-11 | confirmed | low → **low** | 17 titles over 60 chars and 15 descriptions over 160 chars. /media/Mushroom-Healing has a 19-char description. |
| crawl-12 | confirmed | low → **info** | The only duplicate title among 38 pages, on 2 different-language pages. |
| crawl-13 | confirmed (understated) | low → **low** | The English 404 is the bare Next.js error shell `<html id="__next_error__">`, with 0 anchors and no h1 or lang in the server HTML. |
| crawl-14 | partly confirmed | low → **info** | RSS and manifest do 404. The apple-touch-icon part is **refuted**: every page declares an apple-touch-icon (200), and /apple-icon.png returns 200. |
| crawl-15 | confirmed | low → **info** | lastmod is on 8/38 URLs. Google uses lastmod only when it is consistently accurate. |
| crawl-16 | confirmed | low → **low** | /practices and 4 of the 5 blog posts have exactly 1 inbound link. |

No finding was refuted outright. One sub-claim was refuted (crawl-14, apple-touch-icon). Four findings are worse than the audit stated (crawl-03, crawl-04, crawl-13, and the solution for crawl-08).

**Important context for the owner:** none of these crawl findings would on its own make the site invisible. robots.txt, the sitemap, status codes, canonicals and robots metas are all correct live (see Works). Whether Google or Bing have actually indexed the pages cannot be seen from a crawl. **That needs an outside-source check** (Google Search Console Coverage and URL Inspection, Bing Webmaster Tools), which is not allowed in this lens.

## Per-finding verification

### crawl-01: HTML is never cached at the CDN. Verdict: CONFIRMED, severity LOW
| check | live source | UTC | result |
|---|---|---|---|
| Headers ×3 on /, /blog/audit-is-the-wrong-word, /books, /faq, /about | `curl -sS -D -` | 18:50:41Z–18:50:49Z | 15/15 returned `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `X-Vercel-Cache: MISS`, Age 0 |
| Googlebot UA on / | curl -A Googlebot | 18:50:57Z | same (private, no-store, MISS) |
| Control: static files | curl robots.txt, sitemap.xml | 18:51:02Z | `public, max-age=0, must-revalidate`, X-Vercel-Cache HIT, so the CDN does work for static output |
| Home timing ×5 | curl -w | 18:50:59Z–18:51:02Z | TTFB 0.27/0.75/0.64/0.57/0.27 s; total 0.30–0.79 s |
| Build route table | Vercel MCP `list_deployment_events` dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 / bld_1pjmk47jw | read 18:58Z | Every page route (/, /about, /books*, /blog*, /faq, /glossary, /[locale], /[locale]/about, /media*, /events*, /_not-found …) is **ƒ (Dynamic)**. Only /robots.txt, /sitemap.xml, /llms.txt and /llms-full.txt are ○ Static. The build also reports "ƒ Proxy (Middleware)" and the warning "Using edge runtime on a page currently disables static generation for that page". |
| CSP nonce (a common forced-dynamic cause) | curl header | 18:57:44Z | No nonce in the CSP and 0/39 script tags with a nonce attribute, so the CSP is **not** what forces dynamic rendering |
| Set-Cookie on /books | curl header | 18:57:47Z | none |

Attempts to refute it failed: the result is not a blip and not specific to one user-agent. **Severity downgraded to low.** A TTFB under 0.8 s counts as "good", and nothing here stops pages from being indexed or found. The impact text says "Core Web Vitals suffer", but that cannot be shown without CrUX or PageSpeed data (**needs outside-source check**). The real costs are more function invocations, slower first bytes for visitors far from iad1 (the /es, /pt, /de, /fr and /he audiences), and `no-store` blocking the browser back/forward cache.

**Solution note:** The direction is right, because the goal is ○ or ISR routes. The live build table is a more precise check than curl alone: after the fix, `/`, `/about`, `/books`, `/blog/[slug]` and the other content routes should show ○ or ● with a Revalidate value, and `curl -sI` should show `x-vercel-cache` HIT, PRERENDER or STALE with a public s-maxage. Because *every* route is dynamic, including trivial ones like /terms, the cause is likely in the shared root layout or in the middleware/proxy, not in each page. The cause cannot be seen live, so the PR must name it. Also check which page uses the edge runtime (build warning). Any per-visitor logic, such as the counting planned in PR #57, must stay client-side or in middleware so it does not make pages dynamic again.

### crawl-02: 29/38 pages have no og:image. Verdict: CONFIRMED, severity MEDIUM
| check | live source | UTC | result |
|---|---|---|---|
| og:image and twitter:image anywhere in HTML, all 38 sitemap URLs, UA facebookexternalhit | Node fetch | 18:51:36Z–18:51:45Z | 29/38 have no og:image anywhere in the document. 19 of them have twitter:image. |
| Same with Chrome UA | Node fetch | 18:51:45Z–18:51:49Z | identical 29/38 |
| Full og/twitter tag list ×2 | Node fetch, facebookexternalhit UA | 18:58:09Z–18:58:12Z | /blog/audit-is-the-wrong-word: og:title, og:description, og:url, og:site_name, og:type, article:*, twitter:card, twitter:title, twitter:description, with **no image of any kind**. /glossary is the same. /es has twitter:image but no og:image. |

The list matches the audit exactly. og:image is present only on /, /about, /books, /events, /media, /contact, /methods, /books/psilocybin-integration-guide and /media/Mushroom-Healing. **10 pages have no image tag at all**: /belief-inquiry, /nervous-system-reset, /integration-reflection, /glossary, all 5 /blog posts and /scenarios/ego-dissolution. These are the pages people are most likely to share. I tried to disprove the finding by checking whether og:image was streamed into the body rather than the head: it was not there, because the whole document was searched with an allow-listed bot UA. Severity medium stands.

**Solution note:** The fix works if it covers **both** `openGraph.images` and `twitter.images`. For the 10 pages with neither, adding og:image alone would fix Facebook, LinkedIn, WhatsApp and iMessage, and X falls back to og:image. Spreading a shared base object or adding route-level `opengraph-image` files are both valid. Verify with `curl -A facebookexternalhit/1.1 URL` and count `property="og:image"` on all 38 sitemap URLs; expect 38/38.

### crawl-03: Orphan pages. Verdict: CONFIRMED (understated), severity MEDIUM
| check | live source | UTC | result |
|---|---|---|---|
| Link crawl from / (depth ≤3, `<a href>` only, bingbot UA) | Node fetch | 18:53:41Z–18:53:49Z | Reached 29 URLs (27×200, 2×308). **11 sitemap URLs never reached:** /es, /pt, /de, /fr, /he, /es/about, /pt/about, /de/about, /fr/about, /he/about, /media/Mushroom-Healing |
| Inbound `<a href>` counts over all fetched 200 pages | same run | 18:53:49Z | /es, /pt, /de, /fr, /he and /media/Mushroom-Healing each have **0**. Each /xx/about has 1, from its own /xx home, which is itself orphaned. |
| String references to the orphans in other pages' HTML or RSC payload | same run | 18:53:49Z | /es…/he are referenced only by the other localized pages, through hreflang `<link>` tags, never by an English page. /media/Mushroom-Healing is referenced only as an encoded `u=` parameter inside Facebook, X, LinkedIn and other share-button URLs on /media. There is no `<a href="/media/Mushroom-Healing">`. |

The problem is worse than the audit stated: the whole localized cluster of **10 pages (26% of the sitemap)** cannot be reached by links from the English site, not just the 5 homes. Severity medium stands. These pages depend entirely on the sitemap for discovery.

**Solution note:** It works only if the language switcher is **server-rendered `<a href>`** in the shared header or footer, not a JS dropdown or `router.push`. Verify by fetching https://www.mayaallan.com/ and finding `href="/es"`. The /media grid card must be an `<a href="/media/Mushroom-Healing">` in the server HTML. Re-run the link crawl afterwards and expect 0 unreached sitemap URLs.

### crawl-04: title, description and canonical streamed after `</head>` for non-allow-listed crawlers. Verdict: CONFIRMED (understated), severity MEDIUM
All 38 sitemap URLs were fetched for each UA, in 2 rounds, between 18:52:14Z and 18:52:57Z. "in head" means both `<title>` and the meta description come before `</head>`. canonical-in-head matched in-head in every run.

| UA | round 1 in head | round 2 in head |
|---|---|---|
| Googlebot | 29/38 | 26/38 |
| bingbot | 38/38 | 38/38 |
| GPTBot | 24/38 | 25/38 |
| OAI-SearchBot | 26/38 | 20/38 |
| ClaudeBot | 25/38 | 28/38 |
| PerplexityBot | 26/38 | 25/38 |
| LinkedInBot | 38/38 | 38/38 |
| facebookexternalhit (18:51:45Z) | 38/38 | n/a |
| curl | 23/38 | 20/38 |
| Chrome (18:51:49Z) | 23/38 | n/a |

- The affected pages change from request to request, which fits a race between metadata resolving and the head being flushed. The title is present *somewhere* in 100% of responses.
- /faq with the curl UA ×4 at 18:53:14Z: 2 of the 4 responses had `<title>` at byte 136,553 of a 140,067-byte document, after the RSC script, with only 3 metas left in `<head>` and no og:title in the head. Scrapers that read only the first 64–128 KB would miss the title, description and canonical entirely.
- **Correction to the audit:** GPTBot is affected. The earlier "4/4" result was chance. `rel=canonical` is also streamed out of `<head>`, and Google documents that a canonical outside `<head>` is ignored in raw HTML. Whether Google's rendered DOM hoists it back needs an outside-source check (URL Inspection).

**Solution note:** Setting `htmlLimitedBots` in next.config **replaces** Next.js's default list; it does not add to it. A custom regex that lists only AI bots would stop bingbot, facebookexternalhit and LinkedInBot (all 38/38 today) from getting blocking metadata. The simplest robust fix is the documented `htmlLimitedBots: /.*/`, which turns streaming metadata off for every UA. Otherwise, make sure the regex keeps the defaults. Verify with the UA matrix above and expect 38/38 for every UA in 2 rounds.

### crawl-05: Non-reciprocal hreflang in HTML. Verdict: CONFIRMED, severity INFO
Checked ×2 per page at 18:54:29Z–18:54:36Z, matching `hrefLang` case-insensitively. / and /about have **0** hreflang links. /books has 0. /es, /pt, /he, /pt/about, /es/about and /de/about each have 7, including en and x-default pointing to / or /about. sitemap.xml (read 18:51:18Z) declares the complete 7-way reciprocal set on all 12 URLs, including / and /about. Google accepts hreflang from the sitemap and HTML together, so the return links do exist. **Severity lowered to info.** The fix (add `alternates.languages` to / and /about) is correct and cheap. Afterwards, / should show 7 hreflang links in its HTML.

### crawl-06: pt-BR against lang=pt. Verdict: CONFIRMED, severity INFO
/pt and /pt/about have `<html lang="pt">` and hreflang `pt-BR` (18:54:29Z–18:54:36Z, ×2). Google ignores `html lang`, and `pt-BR` is a valid hreflang value. This is cosmetic. Setting `lang="pt-BR"` on /pt routes is the smaller change.

### crawl-07: Internal links to redirects. Verdict: CONFIRMED, severity LOW
Link crawl at 18:53:49Z: `/integration` gives 308 to /integration-reflection and is linked from /blog/affirmations-vs-integration. `/reset` gives 308 to /nervous-system-reset and is linked from /blog/curiosity-over-judgment-ifs. The chain was traced again at 18:56Z with the same result. The fix (link directly and keep the 308s) is correct.

### crawl-08: Two-hop http redirects. Verdict: CONFIRMED as fact, NOT a defect, severity INFO
Traced at 18:56:03Z–18:56:39Z:
- `http://mayaallan.com/` → 308 `https://mayaallan.com/` → 308 `https://www.mayaallan.com/` → 200
- `http://psilowire.com/`, `http://www.psilowire.com/` and `http://psilocybinintegrationguide.com/` follow the same 2-hop pattern
- `http://www.mayaallan.com/` is 1 hop
- The protected aliases go 302 to vercel.com/sso-api and then 307 to vercel.com/login

The http→https hop on the same host is what the HSTS preload rules require, so this is correct behaviour.

**Solution note, which would fail as written:** at 18:56:56Z, `https://mayaallan.com/` (the apex redirect) sends `Strict-Transport-Security: max-age=63072000` **without** includeSubDomains and preload. Only www sends those directives. A preload submission for mayaallan.com would therefore be rejected until the apex's own HTTPS response carries both directives. Whether it is eligible needs an outside-source check (hstspreload.org is out of scope here). Preload is also hard to undo and has no effect on search visibility. **Recommendation: no action.**

### crawl-09: Case-sensitive URLs. Verdict: CONFIRMED, severity LOW
Each ×2 at 18:56Z. `/media/mushroom-healing`, `/media/MUSHROOM-HEALING`, `/About`, `/BOOKS`, `/Blog` and `/books/Psilocybin-Integration-Guide` all return 404. `/media/Mushroom-Healing` returns 200.

**Solution note:** Middleware that lowercases every path would, on its own, **send /media/Mushroom-Healing to a lowercase URL that 404s**. The slug has to be renamed to lowercase at the same time, with a 308 from the old mixed-case URL and an updated sitemap. Alternatively, use a case-insensitive lookup that 308s to the stored slug. Verify that both forms end at one 200 URL.

### crawl-10: Thin pages. Verdict: CONFIRMED, severity LOW
At 18:54:17Z–18:54:19Z, word counts of body text with scripts removed, whole body / inside `<main>`:

| page | whole body | `<main>` |
|---|---|---|
| /books | 115 | 44 |
| /media | 78 | 7 |
| /events | 86 | 15 |
| /contact | 91 | 20 |
| /media/Mushroom-Healing | 77 | 6 |
| localized homes | 159–197 | 88–126 |

My counting method differs from the audit's, but the conclusion is the same. The book detail page /books/psilocybin-integration-guide has 662 words in `<main>`, so the sales content does exist one click deeper. /events has 15 words in `<main>`, which suggests an empty listing (not visible here). The fix is valid content work.

### crawl-11: Title and description lengths. Verdict: CONFIRMED, severity LOW
Read 18:54:17Z–18:54:19Z.
- **Titles over 60 chars (17):** /practices 106, /es 104, /fr 98, /blog/psilocybin-integration-research 97, /blog/curiosity-over-judgment-ifs 96, /pt 92, /nervous-system-reset 91, /blog/affirmations-vs-integration 90, /de 79, /scenarios/ego-dissolution 77, /books/psilocybin-integration-guide 75, /blog 74, /he 72, /belief-inquiry 71, /scenarios 70, /integration-reflection 69, /blog/inherited-beliefs-grandmother-marriage 66.
- **Descriptions over 160 chars (15):** the longest are /books/psilocybin-integration-guide 369, /faq 364, /glossary 340, /scenarios/ego-dissolution 242 and /scenarios 238.
- **Short descriptions:** /media/Mushroom-Healing 19 ("Mushroom Healing | Maya Allan"), /events 56.

The /es title is a full sentence ending in "." followed by "| Maya Allan". Search engines usually rewrite these rather than penalise them. The fix is valid.

### crawl-12: Duplicate title. Verdict: CONFIRMED, severity INFO
"Sobre Maya Allan | Maya Allan" appears on /es/about and /pt/about (18:54:19Z). It is the only duplicate among the 38 titles. The two pages are in different languages and are hreflang alternates of each other, so there is little ranking confusion. The fix is a copy change.

### crawl-13: 404 page. Verdict: CONFIRMED (understated), severity LOW
Each ×2, 18:55:04Z–18:55:52Z.
- `/zz-verify-missing-*` returns 404. It has robots `noindex`, **plus** `index, follow` and googlebot `index, follow, …`, a canonical to https://www.mayaallan.com and the home-page title.
- The server HTML is `<html id="__next_error__">`, the Next.js error shell. It has **no lang, no h1, 0 `<a>` links and no visible text** (21.9 KB, with the not-found text only in the RSC payload).
- /books/zz… and /blog/zz… give the same shell.
- `/es/zz…` returns 404 with lang=es and the English h1 "We couldn&#x27;t find that page".

The 404 status is correct, so indexing is not harmed. Visitors with JavaScript may still see client-rendered text; this was not checked, because the browser is not allowed in this lens. Severity low stands.

**Solution note:** Removing the canonical and the extra robots metas is right, but not enough on its own. The English not-found must render inside the root layout, which the `__next_error__` shell shows it does not. Something on the unknown-path render errors or bails out before the layout renders; the cause is not visible live. Verify by fetching https://www.mayaallan.com/zz-x. Expect `<html lang="en">`, a single `noindex` robots meta, no canonical, an `<h1>`, and links to /books and /blog.

### crawl-14: No RSS, manifest or apple-touch-icon. Verdict: PARTLY CONFIRMED (apple-touch-icon part REFUTED), severity INFO
Each ×2, 18:55:04Z–18:55:17Z.
- **404:** /rss.xml, /feed.xml, /feed, /blog/rss.xml, /atom.xml, /manifest.webmanifest, /manifest.json, /site.webmanifest, /apple-touch-icon.png, /apple-touch-icon-precomposed.png and /icon.png.
- **Refuting evidence for the apple-touch-icon part:**
  - `<head>` of / declares `<link rel="apple-touch-icon" href="https://yaqhbuvjnaq0ur0v.public.blob.vercel-storage.com/uploads/1769102188323-icon.jpg">`, and the same link appears in the /faq payload.
  - That URL returns 200 image/jpeg, 13,564 B, `max-age=2592000` (18:55:36Z).
  - `/apple-icon.png` returns **200 image/png**.
- iOS uses the declared link, so iOS home-screen icons do **not** 404. Only blind probes of /apple-touch-icon.png get a 404, which does no harm.

No RSS alternate link was found in `<head>`. An RSS feed is a small plus for aggregators; a manifest has no effect on search. The proposed "add app/apple-icon.png" is unnecessary, because /apple-icon.png already serves.

### crawl-15: lastmod on 8/38 URLs. Verdict: CONFIRMED, severity INFO
Sitemap read at 18:51:18Z: 38 `<url>` entries, 8 with lastmod (the book, the media item, the 5 blog posts and 1 scenario), 84 alternates, 10,027 B. Google uses lastmod only when it is consistently accurate, and a missing lastmod does no harm. **Solution caveat:** stamping every URL with the build time would be *worse* than leaving it out. Add lastmod only where a real content-updated date exists.

### crawl-16: Deep content with a single inbound link. Verdict: CONFIRMED, severity LOW
Link graph at 18:53:49Z:
- /practices has 1 inbound link, from /methods.
- /blog/affirmations-vs-integration, /blog/inherited-beliefs-grandmother-marriage, /blog/curiosity-over-judgment-ifs and /blog/audit-is-the-wrong-word have 1 each, from /blog.
- /blog/psilocybin-integration-research has 4 and /scenarios/ego-dissolution has 5.
- Each /xx/about has 1 (see crawl-03).
- Pages in the navigation have 37 inbound links each in my graph; the audit counted 39 over a larger page set.
- **Extra:** /legal has only 3 inbound links.

For a site this size, a depth of 2 through /blog is normal, so severity low stands. The fix (latest posts on home, related posts on each post, /practices in the nav) is valid.

## Spot-checks of the audit's "works" items

| item | holds? | live source and UTC | note |
|---|---|---|---|
| robots.txt allows every crawler | yes | curl /robots.txt, 18:56:56Z | 200 text/plain. 33 UA groups, all `Allow: /`. Disallow is only /admin/, /api/ and /download/. It declares `Sitemap:` and has a non-standard `Host:` line. |
| sitemap.xml is clean | yes | curl and Node, 18:51:18Z and 18:57:22Z | 38 URLs, 84 alternates, 10,027 B. All 200 without redirect, self-canonical, no noindex. |
| No 4xx/5xx pages | yes | link crawl, 18:53:41Z; sitemap fetches, 18:51Z–18:57Z | 27×200 plus 2 linked 308s. All 38 sitemap URLs return 200 across about 700 fetches with 10 UAs. |
| No broken assets | partly re-checked | 18:57:00Z, 18:55:36Z | The 5 OG image routes return 200 image/png and the declared icon returns 200. A full asset sweep was not re-run. |
| Core metadata complete | yes, with a caveat | Node with bingbot UA, 18:57:22Z | 38/38 have one title, one description, a self-canonical, one index robots meta, no X-Robots-Tag, JSON-LD that parses, and exactly one h1 (18:54Z). **Caveat:** for non-allow-listed UAs these tags sit in `<body>` about a third of the time (crawl-04). |
| Structured data is present | yes | 18:57:22Z | Types: WebSite 38, Organization 38, Person 7, BreadcrumbList 8, Article 6 (the audit said 7, a counting difference), FAQPage 3, Book 1, DefinedTermSet 1, SoftwareApplication 1, CollectionPage 1, ImageObject 1. 0 parse errors. |
| Redirects are clean | yes | 18:56:03Z–18:56:39Z | /about/, /books/ and //about all 308 to the clean URL. The apex keeps the path and query. |
| Alternate domains do not duplicate | yes | 18:56Z | psilowire.com and psilocybinintegrationguide.com (with and without www), and mayaallan.vercel.app/about, all 308 to www with the path kept. The -mallan and -git-main aliases go through Vercel SSO. |
| Unknown URLs are real 404s | yes | 18:55Z, 3 prefixes ×2 | Status is 404 with noindex, but the page itself is an empty error shell (crawl-13). |
| Tracking parameters canonicalize | yes | 18:58:59Z ×2 | `/?utm_source=verify&utm_medium=x` returns 200 with canonical https://www.mayaallan.com |
| No UA blocking or cloaking | yes | 18:52:14Z–18:52:57Z | 8 UAs × 38 pages × 2 rounds all return 200 with a title. Only the *placement* of the metadata differs (streaming), which is not cloaking. |
| Machine-readable files are present | yes | 18:57:00Z | /llms.txt 200 (5,651 B), /llms-full.txt 200 (109,820 B), /.well-known/security.txt 200, /favicon.ico 200 |
| Social images load | yes | 18:57:00Z | /opengraph-image, /media, /events, /books/psilocybin-integration-guide and /media/Mushroom-Healing OG images all return 200 image/png (40–326 KB) |
| Security headers | yes on www | 18:50:57Z, 18:57:22Z | www sends HSTS 2y with includeSubDomains and preload, nosniff, DENY, strict-origin-when-cross-origin and a CSP (no nonce). The apex redirect sends HSTS without includeSubDomains or preload (crawl-08). |
| Response time is good | yes | 18:50:59Z–18:51:02Z | Home ×5: total 0.30–0.79 s |

## New observations made during verification
| # | observation | live source and UTC |
|---|---|---|
| N1 | The live build table of the production deployment marks **every** page route ƒ Dynamic, including /_not-found. The build has a middleware/proxy and warns that a page uses the edge runtime. | Vercel MCP list_deployment_events, dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4, read 18:58Z |
| N2 | The canonical link, not only the title and description, is streamed outside `<head>` for non-allow-listed UAs, and it lands near the end of a document of about 140 KB. | Node UA matrix, 18:52Z; /faq ×4, 18:53:14Z |
| N3 | The English 404 is a bare `__next_error__` shell with no links. | curl, 18:55:37Z–18:55:52Z |
| N4 | The apex HTTPS redirect's HSTS header lacks includeSubDomains and preload. | curl -D, 18:56:56Z |
| N5 | The favicon and apple-touch-icon are a JPEG on Vercel Blob (`uploads/1769102188323-icon.jpg`) rather than an app-level icon. It works (200). | curl, 18:55:36Z |

## Unverified or needs an outside-source check
- Whether Google or Bing have indexed any page, and why not. Needs Google Search Console and Bing Webmaster Tools (coverage, URL Inspection, sitemap status).
- Whether Googlebot's rendered DOM restores the streamed canonical and title to `<head>`. Needs GSC URL Inspection.
- Core Web Vitals field data. Needs CrUX or PageSpeed Insights.
- HSTS preload eligibility and status. Needs hstspreload.org.
- What JavaScript visitors actually see on the 404 page. Needs a browser, which is not allowed in this lens.
- The root cause of the all-dynamic rendering. It is visible only in source, which this lens may not read, so the fix PR must state it.