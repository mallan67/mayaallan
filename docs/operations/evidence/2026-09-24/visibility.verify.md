# Adversarial verification: crawler-access-indexability (2026-09-24)

| field | value |
|---|---|
| Lens verified | crawler-access-indexability. Input: `docs/operations/evidence/2026-09-24/audit-crawler-access.md` at commit `01eab334bd4521859a5e7e556116a620f618f0bd` (read live via `gh api` at 18:48:47Z) |
| Live read window (UTC) | 2026-09-24T18:40:39Z to 18:49:11Z |
| Sources | HTTPS GET/HEAD to www.mayaallan.com and the 8 alternate hosts (curl and Node 24 fetch, at most 4 concurrent, 30 s timeout); Vercel MCP `get_runtime_logs`, `get_project` and `get_firewall_config` (project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y, team team_kZQh5NYLyrOKqffK0r9EXf4E); `gh api` on mallan67/mayaallan. **Extra, for vis-01 only:** public DNS TXT lookup of the owner's apex domain (`nslookup -type=TXT mayaallan.com` against 8.8.8.8 and 1.1.1.1). It is read-only and is flagged because it is not one of the listed HTTP sources. |
| Not used | Repository source, local or scratch files, the Playwright browser, logins, forms or POSTs, /api/cron, /api/admin, /api/indexnow |
| Method | Every finding re-run live, with 2-4 retries, more user agents, case-insensitive matching, a crawl of all 38 sitemap URLs (not just hubs), and a runtime-log baseline from before the audit began (2026-09-23T18:48Z to 2026-09-24T17:00Z) |

## 1. Verdict summary

| id | verdict | severity in -> verified | reason |
|---|---|---|---|
| vis-01 | **refuted** for Google; Bing uncertain | high -> low | DNS TXT on mayaallan.com has a `google-site-verification=` token (2 resolvers). The "BingSiteAuth.xml requested 8x" log evidence is an audit artefact: 0 such requests before 17:00Z. Bing verification (import from Google Search Console, or CNAME) cannot be seen from outside. |
| vis-02 | **confirmed** | medium -> low | Title, canonical, description, robots and og:title were after `</head>` in 34 of 128 non-Bingbot responses and 0 of 16 Bingbot responses. It does not block indexing (Googlebot renders JavaScript; Bing always gets the head). |
| vis-03 | **confirmed**, wider than reported | medium -> medium | `<main>` words: /media/Mushroom-Healing 7, /media 9, /events 15, /contact 23, /books 52, 10 localized pages 91-132, and 4 tool pages 111-131. 19 of 38 sitemap URLs have 135 words or fewer. |
| vis-04 | **confirmed** | medium -> low | Book has no isbn, datePublished, numberOfPages, bookFormat or offers. Article has no image or dateModified. No @id. sameAs is Instagram only. These are knowledge-graph and rich-result gaps, not indexing blockers. |
| vis-05 | **confirmed** | low -> low | /books has og:url set to the home page and og:title "Maya Allan". 6 pages have no og:image. The image page has og:type music.song. |
| vis-06 | **confirmed**; 6.4 s cold start not reproduced | low -> low | 15 of 15 MISS, `private, no-cache, no-store`, no ETag or Last-Modified, and If-Modified-Since returns 200. Warm TTFB 0.53-1.12 s (21 samples). |
| vis-07 | **confirmed**, orphan list corrected | low -> low | 0 inbound `<a>` from all 38 pages for /es, /pt, /de, /fr, /he and /media/Mushroom-Healing. /xx/about and /legal do have inbound links. English / and /about have no hreflang `<link>`, but the sitemap has 84 hreflang entries. |
| vis-08 | **confirmed** | low -> low | 8 of 38 URLs have lastmod. HIT, Age 1412102 s. All 5 posts share the lastmod 2026-04-19T00:00Z. That it updates only on deploy remains an inference. |
| vis-09 | **confirmed**, small count corrections | low -> low | The input counted entities raw. Decoded: /fr 98 (not 103), research post 97 (not 102), /nervous-system-reset 91 (not 95), /glossary description 340 (not 349). All others match. |
| vis-10 | facts **confirmed**; the conditional risk is refuted | low -> info | Host line and `Disallow: /api/` in all 33 groups. 0 `/api/` strings in the HTML of 38 pages. Client JS calls only /api/marketing/visitor, /api/marketing/event and /api/subscribe, so no indexable content depends on /api/. |
| vis-11 | **confirmed** | low -> low | The book page links paypal.com/signout, B&N `;jsessionid=`, bokus `srsltid=`, Bookshop `ref=https`, AbeBooks `clickid=`, and the a.co shortener. |
| vis-12 | **confirmed**; no demand shown | info -> info | 7 feed paths returned 404 in each of 2 rounds, and 0 pages advertise a feed. All log hits come from the audit: 0 feed requests before 17:00Z. |

## 2. Per-finding re-checks (live source, UTC, result)

### vis-01: ownership verification
| check | source | UTC | result |
|---|---|---|---|
| Verification meta tags, 9 GETs (Chrome, Bingbot and Googlebot x 3) | GET https://www.mayaallan.com/ | 18:40:56-18:41:06 | 0 matches for google-site-verification, msvalidate.01, yandex-verification, p:domain_verify or facebook-domain-verification |
| Verification files, 3 rounds | GET /BingSiteAuth.xml, /bingsiteauth.xml, /google-site-verification.html, /.well-known/brave-search-verification | 18:41:07-18:41:14 | all 404 |
| **DNS TXT via 8.8.8.8** | `nslookup -type=TXT mayaallan.com 8.8.8.8` | 18:41:14 | **`google-site-verification=VQFv...` (truncated)** and `v=spf1 include:_spf.porkbun.com ~all`. No Bing (`msvalidate`) TXT. |
| **DNS TXT via 1.1.1.1** | `nslookup -type=TXT mayaallan.com 1.1.1.1` | 18:41:15 | the same 2 records (independent second observation) |
| Log baseline before the audit | get_runtime_logs, production, 404, group_by requestPath, 2026-09-23T18:48Z to 2026-09-24T17:00Z | ~18:48 | 12 rows, all vulnerability scanners (xmlrpc.php 4, sftp-config 2+2, wp-login 1, assetlinks 1, ads.txt 1, apple-app-site-association 1). **0 BingSiteAuth.xml** |
| Same, last 24 h | get_runtime_logs, 404, group_by requestPath, since 24h | ~18:47 | /BingSiteAuth.xml 14, /bingsiteauth.xml 3, /google-site-verification.html 4. All after 17:00Z, so all are audit probes. |

The claim is **refuted for Google**. A Google Search Console domain token is published, which means verification was at least started. The token does not prove that the property is still verified, that the sitemap was submitted, or what the indexing report says. The Bing part is **uncertain**.
**Solution note:** the owner opens Google Search Console and checks that the `mayaallan.com` Domain property is verified, that /sitemap.xml is submitted with status Success, and what the Page indexing report says. That report is the most useful single fact for "not seen anywhere". For Bing, use Bing Webmaster Tools "Import from Google Search Console"; no change to the site is needed. The proposed meta tag is unnecessary.

### vis-02: metadata after `</head>`
| check | source | UTC | result |
|---|---|---|---|
| 144 GETs: 9 user agents x 4 pages (/, the book page, /about, /blog/affirmations-vs-integration) x 4 repetitions. Position of `<title>`, canonical, description, robots and og:title relative to the first `</head>` | Node fetch | 18:42:06-18:42:17 | Responses with the tags in the body: Bingbot 0/16, GPTBot 3/16, ClaudeBot 5/16, ChatGPT-User 6/16, Googlebot-desktop 3/16, Googlebot-smartphone 4/16, Claude-SearchBot 3/16, PerplexityBot 5/16, Chrome 5/16. **34/128 (27%)** of non-Bingbot responses. The 5 tags always move together; all responses 200. |

**Confirmed** and non-deterministic: the same user agent and URL flips between head and body. Severity lowered to **low**. Googlebot renders JavaScript, and React is expected to hoist the tags into the head; this is not browser-checked because Playwright was not allowed. Bing always gets the head, and most parsers find `<title>` anywhere. It is not a reason the site is not seen.
**Solution note:** `htmlLimitedBots` covering these bots (or all user agents) fixes it. Static or ISR rendering (vis-06) should also put metadata in the head. Afterwards, re-run the same 144-GET check live.

### vis-03: thin server-rendered pages
| check | source | UTC | result |
|---|---|---|---|
| Words in `<main>` (scripts removed, entities decoded), Googlebot user agent, all 38 sitemap URLs | GET each sitemap `<loc>` | 18:42:58-18:43:01 | /media/Mushroom-Healing 7, /media 9, /events 15, /contact 23, /books 52; /he 91, /he/about 95, /de 100, /de/about 101, /pt 122, /pt/about 124, /fr 126, /es 129, /fr/about 132, /es/about 132; **also** /nervous-system-reset 111, /belief-inquiry 118, /scenarios 121, /integration-reflection 131 |
| Artefact check: streamed hidden `S:` content outside `<main>` | whole-body word count compared with `<main>` | same | The body has only 72-92 more words (navigation and footer), so the low counts are not an artefact. |

**Confirmed**, and wider than reported (19 of 38 URLs). Severity stays **medium**. Short /contact and /books pages are normal for their type. The risk is /events (soft-404 candidate), /media and the media item, the 10 localized pages and 4 tool pages with little server-rendered text.
**Solution note:** noindex plus sitemap removal fixes /events and the media item. Noindex on localized pages would break the sitemap hreflang cluster, so expanding them, or removing both the pages and their hreflang entries, is safer. Tool pages need server-rendered explanatory copy.

### vis-04: structured data
| check | source | UTC | result |
|---|---|---|---|
| JSON-LD on /, /about, the book page, /blog/affirmations-vs-integration, /books and /blog (Bingbot user agent) | GET + JSON.parse | 18:43:43-18:43:45 | 0 parse errors. Book keys: name, alternativeHeadline, description, identifier (ASIN B0G7JWDJYQ), image, author, publisher, inLanguage, keywords, genre, audience, about, url, sameAs. **Missing:** isbn (9798994148839 is in the page), datePublished, numberOfPages, bookFormat, workExample, offers. keywords holds "readers exploring post-experience integration and self-inquiry". Article: no image and no dateModified (datePublished 2026-04-19). No `@id` on any entity. Person.sameAs is Instagram only. Person.description differs between / and /about. /books and /blog have no ItemList. |

**Confirmed.** Severity lowered to **low**: structured data does not decide indexing, Book rich results rely on partner feeds, and Article image is only recommended.
**Solution note:** correct. Only add sameAs for profiles that exist and are claimed (needs outside-source check).

### vis-05: Open Graph
| check | source | UTC | result |
|---|---|---|---|
| og and twitter tags on 10 pages (Bingbot user agent, so tags are in the head) | GET | 18:43:45-18:43:46 | /books: og:url https://www.mayaallan.com, og:title "Maya Allan". No og:image on /blog, 2 posts, /scenarios/ego-dissolution, /faq or /glossary. No twitter:image on 2 posts, the scenario or /glossary (present on /blog and /faq). /media/Mushroom-Healing: og:type music.song, but the page has 0 `<audio>` and 1 `<img>`, and its JSON-LD is ImageObject. |

**Confirmed**, severity **low**. The fix works as proposed; set the media item's og:type to website.

### vis-06: no CDN caching of HTML
| check | source | UTC | result |
|---|---|---|---|
| 5 pages x 3 rounds (/, the book page, a post, /faq, /books) | curl -D - | 18:44:06-18:44:31 | 15 of 15 `X-Vercel-Cache: MISS`, `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, 0 ETag, 0 Last-Modified. TTFB 0.526-1.123 s |
| Conditional GET / with If-Modified-Since | curl | 18:44:33 | 200 |
| Cold-start attempt on rarely visited pages (/he/about, the media item, /legal, /refunds, /scenarios, /methods) | curl | 18:49:06-18:49:11 | TTFB 0.71-0.85 s (warmed by audit traffic) |

**Confirmed.** The 6.42 s first-hit TTFB is a single earlier observation and was not reproduced (uncertain). Severity **low**.
**Solution note:** ISR or static rendering works only if the content pages stop using request-time APIs such as cookies or headers, which the `private, no-store` header suggests they do (inferred). It also fixes vis-02.

### vis-07: orphans and hreflang
| check | source | UTC | result |
|---|---|---|---|
| hreflang `<link>` tags, case-insensitive, Googlebot and Bingbot user agents | GET /, /about, /es, /es/about, /de | 18:45:07-18:45:22 | / 0, /about 0 (both user agents). /es, /es/about and /de have 7 each (`hrefLang`) |
| Sitemap hreflang | GET /sitemap.xml | 18:44:48 | 84 `xhtml:link` entries |
| Inbound `<a>` links from all 38 sitemap pages | GET each | 18:45:41-18:45:44 | **0 inbound:** /es, /pt, /de, /fr, /he and /media/Mushroom-Healing. /practices is linked only from /methods. /pt/about, /de/about, /fr/about, /he/about and /legal DO have inbound links, so the input over-listed them. /media reaches the item only through third-party share URLs. / has no link text for any other language. |

**Confirmed**, list corrected. Severity **low**. Google accepts hreflang declared in the sitemap, so no HTML hreflang on the English pages is acceptable while the sitemap has it.
**Solution note:** a language switcher with real `<a href>` links plus links from /media to its items fixes it.

### vis-08: sitemap freshness
| check | source | UTC | result |
|---|---|---|---|
| lastmod and cache | GET /sitemap.xml | 18:42:58 | 200, 10027 B, 38 URLs, 8 with lastmod (book 2026-01-22T11:34:05Z, media 2026-01-22T14:19:20Z, 5 posts all 2026-04-19T00:00:00Z, scenario 2026-09-05). X-Vercel-Cache HIT, Age 1412102 s |

**Confirmed**, severity **low**. Regeneration only on deploy is still an inference; it cannot be proven without publishing content. The identical post dates look like a template.

### vis-09: title and description lengths
| check | source | UTC | result |
|---|---|---|---|
| Decoded lengths for 38 URLs | same pass as vis-03 | 18:42:58-18:43:01 | Titles: /practices 106, /es 104, /fr 98 (input 103), research post 97 (input 102), IFS post 96, /pt 92, /nervous-system-reset 91 (input 95), affirmations post 90. Descriptions: book 369, /faq 364, /glossary 340 (input 349). /books and /about titles are 18 characters. |

**Confirmed.** The input counted `&#x27;` and `&amp;` in raw form. Severity **low**: Google rewrites long titles, but specific titles of 50-60 characters still help clicks.

### vis-10: robots.txt Host line and /api/
| check | source | UTC | result |
|---|---|---|---|
| robots.txt | GET /robots.txt | 18:46:04 | 200, 2990 B, HIT. 1 `Host:` line, 1 Sitemap line, 33 User-Agent groups (including `*`), each with Allow `/` and Disallow `/admin/`, `/api/` and `/download/` |
| Does content depend on /api/? | HTML of 38 pages; 15 client JS bundles from /, the book page, a post and /media | 18:45:41-18:46:10 | 0 `/api/` strings in HTML. The JS references only /api/marketing/visitor, /api/marketing/event and /api/subscribe |

The facts are **confirmed**, but the conditional impact is refuted: no indexable content comes from /api/. Severity lowered to **info**. Keep `Disallow: /api/`; removing the Host line is cosmetic.

### vis-11: book page links
| check | source | UTC | result |
|---|---|---|---|
| Anchors on the book page, plus the 38-page crawl | GET /books/psilocybin-integration-guide | 18:45:41-18:46:35 | `https://www.paypal.com/signout`; B&N `;jsessionid=<redacted>?ean=9798994148839`; bokus `?srsltid=<redacted>`; Bookshop `ref=https...`; AbeBooks `clickid=<redacted>`; Amazon via the `a.co/d/...` shortener. Present on this page only. |

**Confirmed**, severity **low**. A click on the signout anchor signs a visitor out of PayPal, which is a UX defect. The fix works as proposed; also prefer amazon.com/dp/ URLs over a.co.

### vis-12: no feed
| check | source | UTC | result |
|---|---|---|---|
| 7 paths, 2 rounds | GET /feed.xml, /rss.xml, /blog/rss.xml, /feed, /atom.xml, /blog/feed.xml, /index.xml | 18:46:28-18:46:35 | all 404 |
| Feed `<link>` in HTML | 38-page crawl | 18:45:41-18:45:44 | 0 pages |
| Demand | get_runtime_logs 404 by path, before the audit and over 24 h | ~18:47-18:48 | 0 feed requests before 17:00Z. The 24 h counts (/rss.xml 17, /feed.xml 17, and so on) are all audit probes. |

**Confirmed**, severity **info**. The log-based evidence reflects the audit, not real demand.

## 3. "Works" spot-checks
| item | holds | live re-check (UTC) |
|---|---|---|
| Evidence commits changed only the one file | yes | 1778a314 added and 01eab334 modified `audit-crawler-access.md`, nothing else; these are the only 2 commits on that path; now 7102 B (gh api, 18:48:47-18:48:58) |
| No user-agent blocking or challenge | yes | 60 GETs (15 user agents x /, the book page, a post, the sitemap): 60/60 200, 0 challenge text, 0 x-vercel-mitigated, challenge-token or X-Robots-Tag headers (18:47:05-18:47:10) |
| robots.txt allows all bots except 3 paths and declares the sitemap | yes (minor correction) | 2990 B; 33 groups **including** `*` (32 named, not "* plus 33"); all Allow `/`; Sitemap present; Claude-SearchBot and Claude-User fall back to `*` (18:46:04) |
| Sitemap valid; 38 URLs return 200, index,follow and are self-canonical | yes | 38/38 200, robots "index, follow", canonical equal to loc, no X-Robots-Tag (18:42:58-18:43:01) |
| No noindex | yes | same pass, plus 0 X-Robots-Tag in the 60-GET pass |
| Alternate hosts 308 to www keeping path and query; preview hosts on SSO with noindex | yes | 6 hosts return 308 to https://www.mayaallan.com/books?x=1; the 2 preview hosts return 302 to vercel.com/sso-api with X-Robots-Tag (18:46:36-18:46:38) |
| Slash, query and 404 handling | yes | /books/, /about/ and the post with a slash return 308 to the no-slash URL; /Books, /index.html, /en, /es/books and a nonexistent path return 404; canonical of /books?utm_source=test is /books (18:46:39-18:46:41) |
| Substantial text on the core pages | yes | / 636, book page 706, posts 1256-2891, /faq 2420, /glossary 2594, scenario 3207, /privacy 1188 (18:42:58-18:43:01) |
| JSON-LD parseable | yes | 6 pages, 0 errors (18:43:43-18:43:45) |
| llms.txt, llms-full.txt, security.txt, og images | yes | 200 5651 B; 200 109820 B; 200, Expires 2027-05-18; 3 opengraph-image URLs return 200 image/png (18:46:43-18:46:45) |
| No 5xx in 24 h | yes | 5xx grouped by path: 0 rows; by status: 0 rows. All codes: 200 8399, 404 305, 405 10, 304 3, 307 3 (~18:47) |
| Custom domains public; no firewall config | yes | get_project: password off, SSO all_except_custom_domains, trustedIps off. get_firewall_config(active): 404 "Seawall Config not found." (~18:47) |

## 4. New observations from this verification
| observation | source | UTC |
|---|---|---|
| **Traffic baseline before the audit** (2026-09-23T18:48Z to 2026-09-24T17:00Z): function responses 200 = 391, 404 = 12, 304 = 1. The only 404s are vulnerability scanners (xmlrpc.php, sftp-config.json, wp-login.php). No crawler requested verification files or feeds. Runtime logs count function invocations only; CDN-cached hits such as the sitemap and robots.txt are not included. | get_runtime_logs group_by statusCode and requestPath | ~18:48 |
| 4 interactive tool pages are thin in raw HTML: /nervous-system-reset 111, /belief-inquiry 118, /scenarios 121, /integration-reflection 131 words (added to vis-03) | 38-URL pass | 18:42:58-18:43:01 |
| Preview deployment `dpl_nrDX7fT8omrNVLm8qtoXUunVcum7` (target null, BUILDING) was created 2026-09-24T18:47:18Z. It was probably triggered by evidence commits to `work/site-visibility` (inference). Preview hosts are SSO-protected, so there is no indexing risk, but each evidence commit may start a build. | get_project latestDeployment | ~18:47 |
| The 24 h 404s also include /media/mushroom-healing (lowercase) 6, /manifest.webmanifest 9 and /apple-touch-icon.png 6. None appear before 17:00Z, so they are most likely audit or browser probes (not established). | get_runtime_logs | ~18:47 |

## 5. Unverified: needs an outside-source or owner-account check
- Google Search Console: is the Domain property verified (the DNS token exists), was the sitemap submitted, and what do the Page indexing, Sitemaps and Crawl stats reports say? This is the most important open item for "not seen anywhere".
- Bing Webmaster Tools: whether the site is verified or imported.
- vis-02 rendered DOM: whether streamed tags are hoisted into `<head>` (Search Console URL Inspection, "View crawled page"). The browser was not used here.
- vis-04: whether Amazon author, Goodreads and Google Books author pages exist before they are added to sameAs.
- vis-06: real cold-start TTFB under normal low traffic (needs Speed Insights or observability).

## 6. Save trail
This file was saved through the gitsave recipe in 5 commits, each changing only this path: fd99df82 (part 1), f1e6d59a (part 2), 890134ff (part 3), 007598e6 (part 4), and this commit (part 5). The file was split into several commits because one shell command could not carry the full text. Each append re-read the file live from the branch head before writing.