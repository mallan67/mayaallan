# Evidence — lens "appears": CRAWL & ARCHIVE (ids `ds-`)

| Field | Value |
|---|---|
| Site | https://www.mayaallan.com (canonical) + psilowire.com, psilocybinintegrationguide.com (+ www), mayaallan.vercel.app, mayaallan-mallan.vercel.app, mayaallan-git-main-mallan.vercel.app |
| Lens | Crawl & archive footprint: Internet Archive Wayback Machine, Common Crawl, archive.today, Tranco; live robots/sitemap/crawler-UA behaviour as context |
| UTC window | 2026-09-24T18:18:43Z → 2026-09-24T18:30:59Z (every row carries its own read time) |
| Live sources used | `web.archive.org/cdx/search/cdx`, `web.archive.org/web/timemap/link/…`, `web.archive.org/web/<ts>id_/…` (archived bytes), `archive.org/wayback/available`, `index.commoncrawl.org/collinfo.json` + 14 `CC-MAIN-*-index` CDX APIs, `archive.ph/timemap/…`, `tranco-list.eu/api/ranks/domain/…`, HTTP GET/HEAD to the project hostnames, Vercel MCP (`get_firewall_config`, `get_runtime_logs`, `get_observability_schema`) scoped to prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y / team_kZQh5NYLyrOKqffK0r9EXf4E |
| Not used | No repository source files, no local files, no scratch files, no logins, no POST to any site. Every capture was held in shell variables / pipes only; this file was assembled from GitHub blobs and saved with the gitsave recipe. |
| Method notes | Absence claims below have 2 or more independent observations (different endpoint or query form) unless marked "single observation". Rate-limit (429) and gateway (504) responses were retried and are recorded, never counted as "no data". |

---

## 1. Bottom line (plain language)

1. **The Internet Archive has seen the site exactly once — a single burst on 30–31 January 2026 — and never again in the 236 days since.** 93 captures, all on `www.mayaallan.com`, between 2026-01-30T22:39:29Z and 2026-01-31T12:44:58Z. Nothing from February to today (24 Sep 2026), so nothing from the current production deployment (created 2026-09-08).
2. **Common Crawl has never captured any of the three domains** in any of its 14 most recent monthly crawls (Aug 2025 → 17 Sep 2026). Eight of those crawls ran after the site was demonstrably live (Wayback proves it was up on 2026-01-30).
3. **archive.today has no copy of any of the three domains**; **Tranco** (top-1M popularity list) returns no rank for them.
4. **This is not a blocking problem.** robots.txt allows every crawler (CCBot explicitly), the pages answer 200 to crawler user-agents, carry `index, follow`, and the project has no custom firewall config. The crawlers simply **never find the site**.
5. **What it implies:** Wayback's broad crawls and Common Crawl discover sites by following links from pages they already crawl. Being absent from both for 8 months is strong (indirect) evidence that **almost no crawlable page on the public web links to www.mayaallan.com, psilowire.com or psilocybinintegrationguide.com.** That matches "this site is not seen anywhere". Common Crawl is also a major source for AI training/retrieval corpora and SEO tool databases, so the site is invisible to those too. It does **not** by itself prove Google/Bing have not indexed the site (they also use sitemaps and Search Console) — see the search-engine lenses.
6. **33 of the 38 URLs in today's sitemap have never been archived by anyone** (all 5 blog posts, all language versions, /books, /events, /media, /faq, /glossary, the practice pages, /scenarios/ego-dissolution).

---

## 2. Findings

| id | severity | finding | evidence (live source + UTC read time) | impact | solution (owner) |
|---|---|---|---|---|---|
| ds-01 | high | Wayback Machine: one capture burst only (2026-01-30T22:39:29Z → 2026-01-31T12:44:58Z), 0 captures since — 236 days, including everything after the 2026-09-08 production deployment | CDX no-collapse `url=mayaallan.com&matchType=domain&limit=20000` @ 2026-09-24T18:19:24Z → rows=93, byMonth `{"202601":93}`, byDay `{"20260130":55,"20260131":38}`. Timemap `web.archive.org/web/timemap/link/mayaallan.com` @ 18:21:47Z → first memento Fri 30 Jan 2026 22:40:09 GMT, last memento Sat 31 Jan 2026 00:52:13 GMT (homepage). Availability API `archive.org/wayback/available?url=mayaallan.com` @ 18:28:29Z → closest = 20260131005213 (first attempt @ 18:21:04Z was HTTP 429, retried). | The Internet Archive's own crawls have not re-discovered the site in 8 months → no inbound links reach it from pages IA crawls. There is also no public historical record of the site's current content. | Off-site (owner-account/content): create crawlable inbound links — author website field on Amazon Author Central, Goodreads, BookBub, publisher/distributor pages, podcast show notes, guest posts, social profile "website" fields. Optional owner action: a manual Save Page Now of key URLs (gives an archive record only; it does not improve search ranking). |
| ds-02 | high | Common Crawl: 0 captures of mayaallan.com, psilowire.com, psilocybinintegrationguide.com in all 14 most recent indexes (CC-MAIN-2025-33 … CC-MAIN-2026-39; crawl dates 2025-08-02 → 2026-09-17) | `index.commoncrawl.org/collinfo.json` @ 18:22:18Z (128 indexes; newest CC-MAIN-2026-39 = 2026-09-04T13:16:03 → 2026-09-17T05:59:21). Per index & domain `?url=<d>&matchType=domain&output=json` 18:23:32Z–18:25:27Z → every answer `{"message": "No Captures found for: <d>"}`. Second form `?url=*.<d>` for the 3 newest indexes 18:22:26Z–18:23:06Z and 18:23:17Z–18:23:21Z → same. 504s (2026-39 `*.mayaallan.com` @ 18:22:26Z; 2026-34 psilowire, 2026-30 mayaallan, 2026-25 psilowire, 2026-04 mayaallan, 2025-43 mayaallan domain-form) all retried 18:25:39Z–18:25:53Z in both forms → "No Captures found". | Common Crawl is the free web corpus behind many LLM training sets, AI answer engines' fallbacks and SEO tools. Absent from it → AI systems relying on it do not know the site; the AEO goal (the weekly `/api/cron/aeo-track`) is undermined at the data-source level. Eight crawls ran after the site was provably live. | Same as ds-01: inbound links from already-crawled sites (CC seeds from prior crawls and its link graph). Nothing to change in robots.txt — CCBot is allowed (see works). |
| ds-03 | medium | psilowire.com and psilocybinintegrationguide.com have zero archive footprint anywhere and exist live only as 308 redirects to https://www.mayaallan.com/ | Wayback CDX domain query @ 18:19:27Z / 18:19:34Z → rows=0 each; timemap @ 18:21:07Z / 18:21:26Z → 1-byte empty body; CDX prefix `url=<d>/*` → empty; availability API @ 18:28:30Z / 18:28:31Z → `"archived_snapshots": {}`. Common Crawl: see ds-02. archive.today timemaps for apex + www @ 18:28:56Z–18:28:58Z → HTTP 404 "no Mementos". Live HEAD @ 18:29:09Z–18:29:10Z: root of all four hostnames → 308 → https://www.mayaallan.com/; `/robots.txt` on each → 308 → www (18:26:08Z–18:26:10Z). | The two keyword domains add no discoverability: no crawler has ever recorded them, meaning nobody links to them. A redirecting domain only helps if people/links use it. Not an error in itself. | Content/owner: don't count on these domains for traffic; use them only where they add value (print, audio, QR, memorable URL in podcasts), and link the canonical www.mayaallan.com everywhere online. |
| ds-04 | medium | 33 of 38 live sitemap URLs have never been archived; only /, /about, /contact, /legal, /books/psilocybin-integration-guide were ever captured (Jan 30–31) | Live `https://www.mayaallan.com/sitemap.xml` @ 18:26:37Z (38 `<url>` blocks) joined against Wayback CDX @ 18:26:39Z → archived=5, never=33 (table 4.4). Archived January sitemap `web.archive.org/web/20260130224104id_/https://www.mayaallan.com/sitemap.xml` @ 18:28:08Z listed only 10 URLs. | All content added since January (blog, language versions, practice pages, FAQ, glossary, scenario) has no third-party crawl record at all — consistent with ds-01/ds-02: no crawler has walked the site since January. | Resolved by the same off-site link work; on-site the sitemap is reachable and robots-allowed (works). |
| ds-05 | low | Sitemap: 30 of 38 `<url>` entries have no `<lastmod>`; none has `<changefreq>`/`<priority>`; `/`, `/about`, `/books`, `/blog`, all language pages lack lastmod | Live sitemap @ 18:30:58Z: `<lastmod>` count 8, `<url>` count 38, `<changefreq>` 0, `<priority>` 0. The 8 dated entries: /books/psilocybin-integration-guide 2026-01-22T11:34:05.429Z, /media/Mushroom-Healing 2026-01-22T14:19:20.844Z, 5 blog posts 2026-04-19, /scenarios/ego-dissolution 2026-09-05. | Crawlers that do reach the sitemap get no freshness signal for most pages (changefreq/priority are ignored by Google, lastmod is used). Minor; cross-lens with the sitemap/SEO lens, which owns the fix. | code-pr: emit accurate `lastmod` for every URL (real content-change dates, not build time). |
| ds-06 | low | The admin login page is in the public Wayback archive and still answers 200 without an `X-Robots-Tag` | CDX @ 18:20:07Z: `20260130234335 https://www.mayaallan.com/admin 307`; collapsed list @ 18:19:07Z: `20260130234335 https://www.mayaallan.com/admin/login 200`. Live HEAD `/admin/login` @ 18:28:27Z–18:28:28Z → 200, no X-Robots-Tag header. robots.txt `Disallow: /admin/` @ 18:26:11Z (does not stop archiving via the `/admin` → `/admin/login` redirect, nor indexing of a linked URL). | Hygiene only (advertises the admin entry point publicly); no visibility impact. Not probed further — no login attempted. | code-pr: send `X-Robots-Tag: noindex, nofollow` on `/admin/*`. owner-account: optionally ask the Internet Archive to exclude `/admin/login`. |
| ds-07 | info | The only archive burst has the signature of a single browser-driven capture (sub-resources + standard-path probes), not of recurring organic crawling; it straddled a deployment switch | CDX @ 18:29:30Z categorised the 93 rows: 6 HTML page captures (all 200), 47 `_next/static` JS/CSS (44×200, 3×404), 16 `_next/image` variants at 8 widths (all 200), 16 standard-path probes (`/.well-known/{ai-plugin.json,assetlinks.json,dnt-policy.txt,gpc.json,nodeinfo,openid-configuration,security.txt,trust.txt}`, `/ads.txt`, `/app-ads.txt`, `/atom.xml`, `/feed`, `/feed/`, `/feed.xml`, `/feeds/all.atom.xml`, `/index.xml` → 13 warc/revisit, 2×404, 1×308), 5 admin/api, 3 robots/sitemap/favicon. Asset URLs carry two different `?dpl=` deployment ids (dpl_DBeh47tbTSnvNP1NJM5VZWvRan2E, dpl_2JkpWDg7aKTJdPGAxufZ7ecchVN2); two chunk files 404 (`0b1f6b96b00e691d.js`, `turbopack-b5ad1e407157c193.js` without `?dpl`) = version skew during capture. | Who/what triggered the January capture cannot be known from public data (IA does not publish requesters). Historical only — no current impact. | None. |

---

## 3. What works (verified live)

| item | evidence (live source + UTC) |
|---|---|
| robots.txt allows all crawlers, including CCBot, Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, Applebot; archive bots fall under `User-Agent: *` / `Allow: /`; only /admin/, /api/, /download/ disallowed; `Sitemap: https://www.mayaallan.com/sitemap.xml` | GET https://www.mayaallan.com/robots.txt @ 18:26:11Z (200 text/plain) |
| All alias hosts consolidate to the canonical host in one 308 hop (http apex takes 2: http → https apex → www) | HEAD @ 18:29:07Z–18:29:10Z: mayaallan.com, psilowire.com, www.psilowire.com, psilocybinintegrationguide.com, www.psilocybinintegrationguide.com, mayaallan.vercel.app → 308 https://www.mayaallan.com/ ; https://www.mayaallan.com/ → 200 |
| Preview hostnames are not publicly crawlable (no duplicate-content leak) | HEAD @ 18:29:11Z–18:29:12Z: mayaallan-mallan.vercel.app and mayaallan-git-main-mallan.vercel.app → 302 to vercel.com/sso-api (Vercel Authentication) |
| Pages are served to crawler user-agents: 200, no `X-Vercel-Mitigated`, no `X-Robots-Tag` | GET with UA `CCBot/2.0`, `archive.org_bot`, `ia_archiver`, and a desktop Chrome UA on `/` and `/blog/psilocybin-integration-research` @ 18:27:49Z–18:27:55Z → all 200 (~89–90 KB). Caveat: UA spoofed from a non-crawler IP; real crawler-IP treatment cannot be proven this way. Side note: every response was `X-Vercel-Cache: MISS` (pages rendered on each request) — performance lens, not this one. |
| Homepage declares `index, follow` and a canonical | GET / @ 18:28:12Z: `<meta name="robots" content="index, follow"/>`, googlebot `index, follow, max-image-preview:large…`, `<link rel="canonical" href="https://www.mayaallan.com"/>` |
| No custom Vercel firewall configuration exists that could block crawlers | Vercel MCP `get_firewall_config(projectId=prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y, configVersion=active, teamId=team_kZQh5NYLyrOKqffK0r9EXf4E)` @ ~18:26:50Z (bracketed by 18:26:39Z and 18:27:00Z) → 404 "Seawall Config not found." |
| Old January URL `/articles` now redirects cleanly | HEAD /articles @ 18:28:24Z → 308 → https://www.mayaallan.com/blog |
| Pages archived in January returned 200 then; the January sitemap/robots are readable in the archive | CDX @ 18:29:30Z (6/6 HTML 200); archived robots.txt `20260130224105id_` @ 18:28:10Z (then: `Disallow: /admin/`, `/api/`, sitemap line) |

---

## 4. Observation tables

### 4.1 Wayback Machine CDX — per domain (read 2026-09-24)

| query | UTC | result |
|---|---|---|
| `cdx?url=mayaallan.com&matchType=domain&output=json&fl=timestamp,original,statuscode&collapse=urlkey&limit=500` | 18:18:43Z / 18:19:07Z | 89 distinct urlkeys (count re-read 18:29:32Z), all host `www.mayaallan.com` |
| same, no collapse, limit 20000 | 18:19:24Z | 93 captures; first 20260130223929 (/books/psilocybin-integration-guide), last 20260131124458; status 200×70, 307×1, 308×3, 404×6, "-" (warc/revisit)×13 |
| host breakdown (fl=original) | 18:20:44Z | `https://www.mayaallan.com` ×93; apex/http never captured as a separate host |
| homepage exact `www.mayaallan.com/` and `mayaallan.com/` | 18:20:27Z | 2 captures: 20260130224009 (200, 5705 B) and 20260131005213 (200, 5693 B) |
| `psilowire.com` matchType=domain (collapsed / full) | 18:18:57Z / 18:19:27Z | `[]` / rows=0 |
| `psilocybinintegrationguide.com` matchType=domain (collapsed / full) | 18:18:58Z / 18:19:34Z | `[]` / rows=0 |
| `mayaallan.vercel.app`, `mayaallan-mallan.vercel.app`, `mayaallan-git-main-mallan.vercel.app` domain | 18:19:40Z–18:19:55Z | rows=0 each (single observation each) |
| prefix `psilowire.com/*`, `psilocybinintegrationguide.com/*` | 18:21:07Z–18:21:47Z | empty |
| timemap psilowire.com / psilocybinintegrationguide.com | 18:21:07Z / 18:21:26Z | HTTP 200, 1-byte empty body |
| availability API mayaallan.com / psilowire.com / psilocybinintegrationguide.com | 18:21:04Z (429 ×7) → retry 18:28:29Z–18:28:31Z | closest 20260131005213 / `{}` / `{}` |

HTML pages ever captured (all 200): `/` (×2), `/about` 20260130224104, `/contact` 20260130224102, `/legal` 20260130224056, `/books/psilocybin-integration-guide` 20260130223929.

Non-200 captures (CDX `filter=!statuscode:200` @ 18:20:07Z): `/admin/` 308, `/admin` 307, `/api/` 308, `/api` 404, `/ads.txt` 404, `/feed/` 308, `/feed` 404, 3 JS chunk captures 404, 13 warc/revisits of `/.well-known/*`, feeds and `app-ads.txt`.

### 4.2 Common Crawl (index.commoncrawl.org)

| index | crawl window (collinfo @ 18:22:18Z / 18:23:32Z) | mayaallan.com | psilowire.com | psilocybinintegrationguide.com |
|---|---|---|---|---|
| CC-MAIN-2026-39 | 2026-09-04 → 2026-09-17 | 0 (domain 18:23:32Z, 18:25:52Z; `*.` 18:23:17Z, 18:23:20Z, 18:25:53Z; first `*.` try 504 @ 18:22:26Z) | 0 (`*.` 18:22:36Z; domain 18:23:35Z) | 0 (`*.` 18:22:43Z; domain 18:23:36Z) |
| CC-MAIN-2026-34 | 2026-08-07 → 2026-08-20 | 0 (`*.` 18:22:44Z; domain 18:23:37Z) | 0 (`*.` 18:22:45Z; domain 504 @ 18:23:39Z → retry 18:25:39Z, `*.` 18:25:44Z) | 0 (`*.` 18:22:47Z; domain 18:23:49Z) |
| CC-MAIN-2026-30 | 2026-07-10 → 2026-07-23 | 0 (`*.` 18:22:48Z; domain 504 @ 18:23:50Z → retry 18:25:44Z; `*.` 18:25:46Z) | 0 (`*.` 18:22:57Z; domain 18:23:55Z) | 0 (`*.` 18:23:06Z; domain 18:23:57Z) |
| CC-MAIN-2026-25 | 2026-06-05 → 2026-06-18 | 0 (18:23:58Z) | 0 (504 @ 18:24:00Z → retry domain 18:25:47Z, `*.` 18:25:48Z) | 0 (18:24:10Z) |
| CC-MAIN-2026-21 | 2026-05-08 → 2026-05-21 | 0 (18:24:16Z) | 0 (18:24:18Z) | 0 (18:24:19Z) |
| CC-MAIN-2026-17 | 2026-04-10 → 2026-04-23 | 0 (18:24:20Z) | 0 (18:24:21Z) | 0 (18:24:25Z) |
| CC-MAIN-2026-12 | 2026-03-05 → 2026-03-17 | 0 (18:24:26Z) | 0 (18:24:32Z) | 0 (18:24:33Z) |
| CC-MAIN-2026-08 | 2026-02-06 → 2026-02-19 | 0 (18:24:34Z) | 0 (18:24:36Z) | 0 (18:24:42Z) |
| CC-MAIN-2026-04 | from 2026-01-12 | 0 (504 @ 18:24:43Z → retry domain 18:25:49Z, `*.` 18:25:50Z) | 0 (18:24:54Z) | 0 (18:24:55Z) |
| CC-MAIN-2025-51 | from 2025-12-04 | 0 (18:24:55Z) | 0 (18:24:56Z) | 0 (18:24:57Z) |
| CC-MAIN-2025-47 | from 2025-11-06 | 0 (18:24:57Z) | 0 (18:25:00Z) | 0 (18:25:06Z) |
| CC-MAIN-2025-43 | from 2025-10-05 | 0 (504 @ 18:25:07Z → retry domain 18:25:50Z, `*.` 18:25:51Z) | 0 (18:25:17Z) | 0 (18:25:18Z) |
| CC-MAIN-2025-38 | from 2025-09-05 | 0 (18:25:23Z) | 0 (18:25:24Z) | 0 (18:25:24Z) |
| CC-MAIN-2025-33 | from 2025-08-02 | 0 (18:25:25Z) | 0 (18:25:26Z) | 0 (18:25:27Z) |

"0" = the API returned `{"message": "No Captures found for: <domain>"}` (a well-formed answer, not an error). Pages captured: none; statuses: none; dates: none. The three newest indexes each have 2 or more query forms per domain; for the older indexes the observations are one domain-match query each plus the consistent zero in every adjacent index (the retried rows have two forms). No positive-control domain was queried because the lens scope allows queries only about Maya Allan's domains.

### 4.3 Other public archives / lists

| source | query | UTC | result |
|---|---|---|---|
| archive.today | `archive.ph/timemap/https://www.mayaallan.com/` | 18:28:46Z | 404 "no Mementos" |
| archive.today | timemaps for `https://mayaallan.com/`, `http://www.mayaallan.com/`, `https://(www.)psilowire.com/`, `https://(www.)psilocybinintegrationguide.com/` | 18:28:54Z–18:28:58Z | 404 "no Mementos" for all 6 |
| Memento TimeTravel aggregator | `timetravel.mementoweb.org/api/json/20260924/<url>` | 18:28:45Z, 18:28:59Z | DNS "Could not resolve host" twice → **unverified** (other national/institutional archives not checked) |
| Tranco top-1M | `tranco-list.eu/api/ranks/domain/mayaallan.com` | 18:29:54Z, 18:30:59Z (18:30:03Z was 429) | `"ranks": []` twice |
| Tranco | psilowire.com | 18:29:55Z 429 → 18:30:02Z | `"ranks": []` (single observation) |
| Tranco | psilocybinintegrationguide.com | 18:29:56Z | `"ranks": []` (single observation) |

### 4.4 Live sitemap vs. archive coverage (sitemap @ 18:26:37Z, CDX @ 18:26:39Z)

| URL | lastmod | ever archived? |
|---|---|---|
| / | – | yes: 20260130224009, 20260131005213 |
| /about | – | yes: 20260130224104 |
| /books | – | never |
| /events | – | never |
| /media | – | never |
| /contact | – | yes: 20260130224102 |
| /legal | – | yes: 20260130224056 |
| /privacy, /terms, /refunds | – | never |
| /practices, /methods, /belief-inquiry, /nervous-system-reset, /integration-reflection, /integration-journal | – | never |
| /blog, /scenarios, /faq, /glossary | – | never |
| /es, /pt, /de, /fr, /he | – | never |
| /es/about, /pt/about, /de/about, /fr/about, /he/about | – | never |
| /books/psilocybin-integration-guide | 2026-01-22T11:34:05.429Z | yes: 20260130223929 |
| /media/Mushroom-Healing | 2026-01-22T14:19:20.844Z | never |
| /blog/affirmations-vs-integration | 2026-04-19 | never |
| /blog/inherited-beliefs-grandmother-marriage | 2026-04-19 | never |
| /blog/curiosity-over-judgment-ifs | 2026-04-19 | never |
| /blog/psilocybin-integration-research | 2026-04-19 | never |
| /blog/audit-is-the-wrong-word | 2026-04-19 | never |
| /scenarios/ego-dissolution | 2026-09-05 | never |

Totals: 38 URLs, 5 archived, 33 never archived. January archived sitemap (read 18:28:08Z) had 10 URLs: /, /about, /books, /articles, /events, /media, /contact, /legal, /books/psilocybin-integration-guide, /media/Mushroom-Healing. Live status of the January-only URL `/articles` @ 18:28:24Z → 308 → /blog. Live HEAD /books, /events, /media, /media/Mushroom-Healing @ 18:28:25Z–18:28:27Z → 200.

---

## 5. Crawl footprint over time

| date (UTC) | event | source |
|---|---|---|
| 2025-08-02 → 2026-01 | Common Crawl crawls 2025-33 … 2026-04: no capture (site may not have existed yet) | CC index API, 18:24:43Z–18:25:50Z |
| 2026-01-22 | Earliest content date the site itself declares (sitemap lastmod on the book page) | live sitemap 18:26:37Z |
| 2026-01-30 22:39:29 → 2026-01-31 12:44:58 | **Only archive event ever**: 93 Wayback captures, 5 distinct HTML pages; the sitemap then listed 10 URLs; two deployments live during the capture | Wayback CDX 18:19:24Z, 18:29:30Z |
| 2026-02-06 → 2026-09-17 | 8 Common Crawl crawls after the site was provably live: **0 captures** | CC index API 18:22:26Z–18:25:53Z |
| 2026-02-01 → 2026-09-24 | **0 Wayback captures** (236 days); meanwhile the site grew from 10 to 38 sitemap URLs | Wayback CDX / timemap / availability API |
| 2026-09-08 | Current production deployment dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 — never archived | Wayback (no 2026-09 rows) |
| 2026-09-24 | archive.today: none; Tranco: unranked | 18:28:46Z–18:30:59Z |

**What it implies.** The site is technically open to crawlers (robots allow, 200s, index/follow, no firewall rule), yet three independent free crawl systems show nothing after one January burst. Those systems discover new hosts mainly through links found on pages they already crawl (and, for Common Crawl, through host-level link-graph ranking). A flat-zero footprint for 8 months therefore points to a **discovery/linking gap, not a technical block**: the web does not link to the site in any way these crawlers see. Search engines can still find the site through Search Console / Bing Webmaster sitemap submission and IndexNow, which is why the search-engine lenses must be read alongside this one; but for AI engines and datasets built on Common Crawl, the site currently does not exist.

---

## 6. What cannot be known without a paid or logged-in link index (needs outside-source check)

| question | why not answerable here | where it lives |
|---|---|---|
| How many sites/pages link to www.mayaallan.com, psilowire.com, psilocybinintegrationguide.com; anchor texts; lost/new links | No free public backlink index; Wayback/CC only show the target's own pages | Ahrefs, Semrush, Majestic, Moz (paid); Google Search Console → Links; Bing Webmaster Tools → Backlinks (owner login) |
| How often Googlebot/Bingbot crawl, which pages, crawl errors | Vercel runtime logs keep about 1 day and the MCP log search could not break down by user-agent (see section 7) | GSC → Settings → Crawl stats; Bing Webmaster → Crawl information (owner login) |
| Which URLs are indexed / excluded and why | Not observable from archives | GSC Page indexing; Bing Webmaster Index Explorer / URL inspection |
| Whether any AI engine has ingested the site | No public ingestion log; CC absence (ds-02) is only a proxy | Needs outside-source check (engine-specific) |
| Common Crawl host-level link-graph rank (harmonic centrality / PageRank) of the domains | Published only as multi-GB bulk webgraph files, no query API | Common Crawl webgraph downloads — needs outside-source check |
| Who triggered the January 2026 Wayback capture | IA does not publish Save Page Now requesters | Not knowable |
| Referral traffic / clicks from any of the above | Vercel Web Analytics answers "web_analytics_not_enabled"; PR #57 (cookieless counting) unmerged — both per task context read by the orchestrator at 2026-09-24T17:48Z / 18:14Z, not re-read by this lens | Analytics lens |

---

## 7. Unverified / not exercised in this lens

| item | detail |
|---|---|
| Crawler visits in Vercel logs | `get_runtime_logs(group_by=requestPath, since=24h, environment=production)` @ ~18:27:05Z worked (e.g. `/robots.txt` 128, `/sitemap.xml` 117, `/` 693 in 24h) but these counts include the concurrent audit agents' own requests; full-text query `robots` timed out (windows ending 18:27:12Z and 18:27:36Z) and `CCBot` on dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4 (window ending 18:27:24Z) returned "No logs found" — the search does not appear to cover user-agents, so **whether CCBot / archive.org_bot visited is UNVERIFIED**. `get_observability_schema` @ ~18:26:50Z → 404 "Observability Data not found". |
| Memento aggregator (other archives: Library of Congress, Archive-It, national web archives) | DNS failure twice (18:28:45Z, 18:28:59Z) — UNVERIFIED |
| Real crawler-IP treatment by Vercel | UA tests were from a non-crawler IP; Vercel may treat verified bot IPs differently — not provable without the crawler itself |
| Tranco for psilowire.com / psilocybinintegrationguide.com | single observation each |
| Wayback for the three vercel.app hosts | single CDX observation each (rows=0); low relevance because mayaallan.vercel.app redirects and the other two require Vercel login |
| Not performed by design | No Save Page Now (it is a write/trigger action), no POST to the site or archives, no calls to /api/cron/*, /api/admin/*, /api/indexnow/*, no admin login, no repository source files read |