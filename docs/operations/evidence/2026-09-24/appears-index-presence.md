# Evidence — Lens "IS THE SITE IN THE INDEXES AT ALL" (ids `idx-`)

| Field | Value |
|---|---|
| Site | https://www.mayaallan.com (canonical host), Vercel project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y` |
| Lens | appears / index presence |
| UTC window | 2026-09-24T18:18:42Z → 2026-09-24T18:40:42Z |
| Written by | Claude (sub-agent, workflow run). Kept in memory and saved only to GitHub `mallan67/mayaallan` branch `work/site-visibility` via the git data API. Nothing was stored locally. |
| Sources used (all live, read in the window above) | Bing HTML via `curl https://www.bing.com/search?q=…`; Bing via WebFetch (a second network path); DuckDuckGo `html.duckduckgo.com/html`, `lite.duckduckgo.com/lite`, `links.duckduckgo.com/d.js` via curl + WebFetch; Google `www.google.com/search` via curl (2 user agents) + WebFetch; Brave, Mojeek, Yahoo, Yandex, Startpage, Ecosia via curl; the WebSearch tool; live GET/HEAD against every project host; live `robots.txt` and `sitemap.xml`; Wayback CDX API; Common Crawl index API; `gh api repos/mallan67/mayaallan` (repository metadata only) |
| Not used | No repository source files, no local files, no scratch files. Nothing was submitted to any form. No `/api/cron/*`, `/api/admin/*` or `/api/indexnow/*` calls. |

**Bottom line:** the site **is indexed**, but thinly. **Bing** shows **8 distinct mayaallan.com URLs** (it estimates "About 36 results"). The book page ranks **#1 on Bing for "psilocybin integration guide"**, and the site holds **#1–#2 on Bing for "Maya Allan"**. The engine behind the **WebSearch tool** only ever returned **2 URLs** (`/` and `/about`). **Google, DuckDuckGo, Brave, Mojeek, Yahoo, Yandex, Startpage and Ecosia could not be read**: each showed a bot challenge or needed JavaScript. **Google's view is therefore UNVERIFIED**, and so is Bing's full list of pages. Both need the owner's Search Console and Bing Webmaster Tools accounts. No wrong host (psilowire, psilocybinintegrationguide, vercel.app) was seen in any engine's results. All of those hosts redirect correctly (308) to www.

---

## 1. Engine reachability (can this engine be read at all?)

| Engine / endpoint | Request | UTC read | Result | Usable? |
|---|---|---|---|---|
| Bing HTML (curl, Chrome UA) | `https://www.bing.com/search?q=site%3Amayaallan.com&count=50&setlang=en-US&cc=US` | 18:18:53Z, 18:19:05Z, 18:19:19Z, 18:26:18Z | HTTP 200. "About 36 results". The **same 7 own-site results** came back every time. | **Yes**, for bare `site:mayaallan.com` only |
| Bing pagination (curl) | same query with `&first=11/21/31/41`, with session cookies (`&first=8…36&FORM=PERE`), and with `&format=rss&first=…` | 18:19:05Z–18:19:30Z | Every page returned the same first 7 results, so pagination is ignored for automated clients | No (only the first 7 can be seen) |
| Bing compound or other queries (curl) | `site:www.mayaallan.com`, `site:mayaallan.com/blog`, `site:mayaallan.com/books`, `site:mayaallan.com psilocybin`, `…integration guide`, `…belief inquiry`, `…nervous system reset`, `…scenarios`, `site:psilowire.com`, `site:psilocybinintegrationguide.com`, `site:mayaallan.vercel.app`, `site:vercel.app mayaallan`, `"mayaallan.com" -site:mayaallan.com`, exact-title queries, `Maya Allan blog/…`, other markets (`mkt=en-GB/de-DE/es-ES/fr-FR/pt-BR`) | 18:19:56Z–18:26:21Z | Results **unrelated** to the query (answers.com, Charles Mingus, Norfolk schools, Bellagio, Wikipedia "Psilocybin", "The"/"How"/"Why" dictionary pages, Autodesk Maya). Bing throws away the operator or all but the first word when it serves automated clients | **No.** Not used as evidence of absence |
| Bing via WebFetch | `https://www.bing.com/search?q=site%3Amayaallan.com%2Fblog&count=50`, `…site%3Apsilowire.com…` | ≈18:24:30Z | Unrelated results as well (Spanish grammar; Gmail help) | No |
| Bing via WebFetch | `https://www.bing.com/search?q=site%3Amayaallan.com`, `?q=psilocybin+integration+guide`, `?q=%22Maya+Allan%22` | ≈18:28:15Z–18:29:30Z | Real results, **identical** to the curl observations (2nd independent observation) | **Yes** |
| DuckDuckGo html (curl) | `https://html.duckduckgo.com/html/?q=site%3Amayaallan.com&kl=us-en` (+ `site:www.mayaallan.com`, + `curl/8.0` UA) | 18:20:56Z, 18:20:57Z, 18:21:09Z | Bot challenge ("Unfortunately, bots use DuckDuckGo too"), 0 results | **Blocked** |
| DuckDuckGo lite (curl) | `https://lite.duckduckgo.com/lite/?q=site%3Amayaallan.com` | 18:21:08Z | HTTP 202, challenge page | **Blocked** |
| DuckDuckGo d.js (curl) | `https://links.duckduckgo.com/d.js?q=site%3Amayaallan.com&vqd=…` | 18:21:22Z | HTTP 202, JavaScript challenge instead of results | **Blocked** |
| DuckDuckGo via WebFetch | `https://html.duckduckgo.com/html/?q=site%3Amayaallan.com` | ≈18:22Z (between 18:21:51Z and 18:22:43Z) | CAPTCHA ("Select all squares containing a duck", error code 90d2) | **Blocked** |
| Google (curl, Chrome UA) | `https://www.google.com/search?q=site%3Amayaallan.com&num=50&hl=en&gl=us` | 18:21:36Z, 18:21:45Z | HTTP 200 but a JavaScript redirect page ("Please click here if you are not redirected…"), 0 results | **Blocked** |
| Google (curl, Lynx UA) | same | 18:21:37Z, 18:21:51Z | "Update your browser. Your browser isn't supported anymore." | **Blocked** |
| Google via WebFetch | `https://www.google.com/search?q=site%3Amayaallan.com&num=50` | ≈18:22Z | "If you're having trouble accessing Google Search, please click here" (no results) | **Blocked** |
| Brave Search (curl) | `https://search.brave.com/search?q=site%3Amayaallan.com&source=web` | 18:25:10Z | HTTP 429, CAPTCHA scheduled | **Blocked** |
| Mojeek (curl) | `https://www.mojeek.com/search?q=site%3Amayaallan.com` | 18:25:10Z | CAPTCHA ("JavaScript is required to complete this challenge") | **Blocked** |
| Yahoo (curl) | `https://search.yahoo.com/search?p=site%3Amayaallan.com&n=50` | 18:24:57Z, 18:25:11Z | 307, then 500 when the redirect was followed | **Blocked** |
| Yandex (curl) | `https://yandex.com/search/?text=site%3Amayaallan.com` | 18:25:25Z | 302 redirect, no results body | **Blocked** |
| Startpage (curl) | `https://www.startpage.com/sp/search?query=site%3Amayaallan.com` | 18:25:26Z | "Anubis" JavaScript verification wall | **Blocked** |
| Ecosia (curl) | `https://www.ecosia.org/search?q=site%3Amayaallan.com` | 18:25:26Z | HTTP 403 "Ecosia Firewall — Confirm you're not a robot" | **Blocked** |
| WebSearch tool | 24 queries (listed in §4) | ≈18:22Z and ≈18:25:30Z–18:26:15Z | Returns results but **does not strictly honour `site:`** (it mixes in off-site results). The provider is not disclosed | **Yes**, with that caveat |

---

## 2. Bing — every mayaallan.com URL that can be seen

### 2a. `site:mayaallan.com` (Bing, en-US): count "About 36 results", 7 visible (the maximum an automated client gets)

Seen by curl at 18:18:53Z, 18:19:05Z, 18:19:19Z and 18:26:18Z, and by WebFetch at ≈18:28:15Z. All five observations were identical. Live `<title>`/description read by GET at 18:23:12Z–18:23:19Z.

| # | Indexed URL | Bing title | Bing snippet (start) | Live title / description | Stale? |
|---|---|---|---|---|---|
| 1 | https://www.mayaallan.com/ | Maya Allan — Author of the Psilocybin Integration Guide | "Maya Allan is an author and educator offering non-clinical, educational resources for psilocybin integration, post-journey reflection, …" | same title | No |
| 2 | https://www.mayaallan.com/about | About **-** Maya Allan | "Learn more about Maya Allan — author and educator writing non-clinical…" | About **\|** Maya Allan | **Title stale** (old separator) |
| 3 | https://www.mayaallan.com/contact | Contact \| Maya Allan | "Get in touch for press, collaborations, or reader inquiries." | Live description: "Get in touch **with Maya Allan** for press…" | **Snippet stale** |
| 4 | https://www.mayaallan.com/books | Books **-** Maya Allan | **Homepage description** ("Maya Allan is an author and educator offering non-clinical…") | Books \| Maya Allan. Live description: "Books by Maya Allan, author and educator. The Psilocybin Integration Guide offers non-clin…" | **Title and snippet stale** |
| 5 | https://www.mayaallan.com/blog/inherited-beliefs-grandmother-marriage | How your grandmother's fear shows up in your marriage | "Apr 19, 2026 · How your grandmother's fear shows up in your marriage There is a moment in most arguments…" | same title + " \| Maya Allan" | No |
| 6 | https://www.mayaallan.com/blog | Writing — Belief work, nervous-system regulation, integration ... | "**Research-backed essays** on belief systems, nervous system regulation, and integration. Drawing on Internal Family Systems, Clean …" | Live description: "**Essays by Maya Allan** on belief systems, inherited patterns, somatic regulation, and psiloc…" | **Snippet stale** |
| 7 | https://www.mayaallan.com/practices | Practices — Belief Inquiry, Nervous System Reset, Integration ... | "Four free practices: Nervous System Reset for regulation, Belief Inquiry for examining inherited beliefs, Integration Reflection for …" | "Practices — Belief Inquiry, Nervous System Reset, Integration Reflection, Integration Journal \| Maya Allan" | No (truncated only) |

### 2b. Other mayaallan.com URLs that surfaced on Bing through topic queries

| Query (Bing) | UTC read | Position / URL / title shown |
|---|---|---|
| `psilocybin integration guide` (curl) | 18:23:59Z | **#1 https://www.mayaallan.com/books/psilocybin-integration-guide** "Psilocybin Integration Guide - 40 Real Psychedelic ...". Then #2 amazon.com (B0G7JWDJYQ), #3 books.google.com, #4 amazon.com (B0G765BZDL), #5 psychedelicstoday.com, #6 barnesandnoble.com, #7 learnshrooms.com |
| `psilocybin integration guide` (WebFetch, 2nd observation) | ≈18:28:45Z | Same order: **#1 mayaallan.com/books/psilocybin-integration-guide** |
| `Maya Allan psilocybin` (curl) | 18:23:58Z | **#1 https://www.mayaallan.com/**, **#2 https://www.mayaallan.com/books/psilocybin-integration-guide**, #3 books.google.com, #4 amazon.com, #5 barwebooks.com, #6 amazon.ca, #7 thriftbooks.com |
| `"Maya Allan"` (curl) | 18:20:33Z | **#1 https://www.mayaallan.com/**, **#2 https://www.mayaallan.com/books**. #3–#10 are real-estate broker profiles under the same name (linkedin.com, zillow.com, realtor.com, loopnet.com, mallannyhomes.com, homes.com, streeteasy.com, citysnap.com) |
| `"Maya Allan"` (WebFetch, 2nd observation) | ≈18:29:10Z | Same: mayaallan.com at #1 and #2, real-estate profiles at #3–#10 |

**Bing distinct URLs confirmed: 8.** These are `/`, `/about`, `/contact`, `/books`, `/books/psilocybin-integration-guide`, `/blog`, `/blog/inherited-beliefs-grandmother-marriage` and `/practices`. The live sitemap has 38 URLs. Bing's own estimate is ~36, so more pages may be indexed without surfacing. See §10.

---

## 3. Live reference: what the site asks engines to index

| Check | Request | UTC read | Observation |
|---|---|---|---|
| robots.txt | GET https://www.mayaallan.com/robots.txt | 18:19:39Z | HTTP 200. `User-Agent: *` `Allow: /` with Disallow for `/admin/`, `/api/` and `/download/`. The same block is repeated for 33 named bots (Googlebot, Bingbot, DuckDuckBot, GPTBot, ClaudeBot, PerplexityBot, CCBot, Applebot, …). Also `Host: https://www.mayaallan.com` and `Sitemap: https://www.mayaallan.com/sitemap.xml`. **Nothing blocks indexing.** |
| sitemap.xml | GET https://www.mayaallan.com/sitemap.xml | 18:19:39Z, 18:23:12Z | HTTP 200, **38 `<loc>`** entries. Only 8 carry `<lastmod>`: the book (2026-01-22T11:34:05Z), media/Mushroom-Healing (2026-01-22T14:19:20Z), 5 blog posts (all exactly `2026-04-19T00:00:00.000Z`) and scenarios/ego-dissolution (2026-09-05). The 30 other pages have no lastmod. |
| All 38 sitemap URLs | GET each (4 at a time) | 18:23:12Z–18:23:19Z | **All 38 → HTTP 200**, `<meta name="robots" content="index, follow">`, no `X-Robots-Tag` header, and **each has a self-referencing canonical** on `https://www.mayaallan.com/...`. |
| Verification tags | GET https://www.mayaallan.com/ | 18:27:54Z | **0** `google-site-verification` / `msvalidate.01` / `yandex-verification` meta tags. (Ownership may be verified by DNS or by file instead; not checked, see §10.) 6 JSON-LD blocks present. |
| hreflang | GET `/`, `/es`, `/about`, `/he/about`, `/books/psilocybin-integration-guide` | 18:27:54Z–18:28:08Z | **0** `hreflang` / `rel="alternate"` links on any of them. `<html lang>` is set per locale (`es`, `en`, `he`). |
| Legacy paths | GET `/tools`, `/integration`, `/books/`, `/index.html` | 18:23:00Z–18:23:01Z | `/tools` → 308 `/practices`; `/integration` → 308 `/integration-reflection`; `/books/` → 308 `/books`; `/index.html` → 404 |

---

## 4. WebSearch tool — every mayaallan.com URL it returned

| Query | UTC read (approx.) | mayaallan.com URLs returned (title) | Other notable rows |
|---|---|---|---|
| `site:mayaallan.com` | ≈18:22Z | https://www.mayaallan.com/ ("Maya Allan — Author of the Psilocybin Integration Guide") | Wikipedia "Maya …" pages, trip.com, substack.com (operator not honoured) |
| `site:www.mayaallan.com` | ≈18:22Z | https://www.mayaallan.com/about ("**About \| Maya Allan**", the current title) | Wikipedia pages, bumc.bu.edu, substack.com |
| `site:psilowire.com` | ≈18:22Z | none (no psilowire.com URL) | psiwire.com, protectowire.com, Wikipedia |
| `site:psilocybinintegrationguide.com` | ≈18:22Z | none (no psilocybinintegrationguide.com URL) | Wikipedia, paloaltou.edu, psychedelics.com, intuitivelifewellness.com |
| `"mayaallan.com" -site:mayaallan.com` | ≈18:22Z | none | github.com/mallan67/mayaallan PR #46, #53, #47, issue #44; Wikipedia; substack.com |
| `"Maya Allan" psilocybin integration guide` | ≈18:22Z | `/` and `/about` | 3× amazon.com book listings, github.com/mallan67/mayaallan/pull/54 |
| `mayaallan.com blog` | ≈18:22Z | `/about` only (**no /blog**) | mayaangelou.com/blog etc. |
| `psilowire` | ≈18:22Z | none | psilowave.com, psilosiren.com, fandom |
| `"Maya Allan" author` | ≈18:22Z | `/` (#7), `/about` (#8) | #6 a facebook.com profile named Maya Allan; Wikipedia pages at #1–#5 |
| `"Psilocybin Integration Guide" 40 real scenarios` | ≈18:22Z | **none** | amazon.com ×3 at #1–#3 (the site's book page absent) |
| `psilocybinintegrationguide.com` | ≈18:22Z | none | third-party integration guides only |
| `mayaallan.vercel.app` | ≈18:22Z | none | github.com/mallan67/mayaallan/issues/13 and /issues/38 ("Deploy failure — …"), other *.vercel.app sites |
| `"Psilocybin Integration Guide - 40 Real Psychedelic Experiences" Maya Allan` (exact live book-page title) | ≈18:25:30Z | `/` and `/about` only (**book page absent**) | amazon.com ×3 |
| `"How your grandmother's fear shows up in your marriage"` (exact post title) | ≈18:25:30Z | **none** | time.com, slate.com, psychologytoday.com … |
| `"The difference between an affirmation and an integration" Maya Allan` | ≈18:25:30Z | `/` only (**post absent**) | |
| `"Curiosity over judgment" IFS panic attack Maya Allan` | ≈18:25:30Z | **none** | |
| `"Integration after psilocybin" memory research supports Maya Allan` | ≈18:25:50Z | `/` and `/about` (**post absent**) | |
| `"audit" "wrong word for belief work"` | ≈18:25:50Z | **none** | |
| `Maya Allan free nervous system reset tool` | ≈18:25:50Z | **none** (the tool page is absent) | |
| `Maya Allan belief inquiry limiting beliefs tool` | ≈18:25:50Z | `/` only (**/belief-inquiry absent**) | |
| `Maya Allan free integration journal 7-day PDF template psilocybin` | ≈18:26:10Z | `/` and `/about` (**/integration-journal absent**) | |
| `"What does ego dissolution feel like during a psilocybin journey"` (exact live title) | ≈18:26:10Z | **none** (**/scenarios/ego-dissolution absent**) | PMC, medium.com, psychedelic.support |
| `site:mayaallan.com/blog` | ≈18:26:10Z | `/about` and `/` only (**no /blog URLs**) | |
| `site:mayaallan.com books psilocybin-integration-guide` | ≈18:26:10Z | `/` and `/about` only (**book page absent**) | |

**WebSearch distinct mayaallan.com URLs: 2** (`/` and `/about`), across 24 queries.

---

## 5. Key-page presence matrix

Live = GET 18:23:12Z–18:23:19Z (all 200, index/follow, self-canonical). "Bing" = seen in §2 (curl and WebFetch). "WebSearch" = seen in §4.

| Page | Live | Bing | WebSearch | Verdict |
|---|---|---|---|---|
| `/` | 200 | **Yes** (#1 site:, #1 "Maya Allan") | **Yes** | Indexed on both |
| `/about` | 200 | **Yes** (stale title) | **Yes** | Indexed on both |
| `/books` | 200 | **Yes** (stale title and snippet) | No (`mayaallan.com blog`, `site:…books…`) | Bing only |
| `/books/psilocybin-integration-guide` (the book page) | 200 | **Yes** (#1 for "psilocybin integration guide") | **No** (3 phrasings: exact title, site:+path, "40 real scenarios") | Bing only. Missing from WebSearch's index |
| `/blog` | 200 | **Yes** (stale snippet) | No (`site:mayaallan.com/blog`, `mayaallan.com blog`) | Bing only |
| `/blog/inherited-beliefs-grandmother-marriage` | 200 | **Yes** | No (exact title) | Bing only |
| `/blog/affirmations-vs-integration` | 200 | not seen | No (exact title + name) | **Not found on any reachable engine** (Bing's list beyond the top 7 cannot be read → UNVERIFIED for Bing) |
| `/blog/curiosity-over-judgment-ifs` | 200 | not seen | No (title phrase + name) | same |
| `/blog/psilocybin-integration-research` | 200 | not seen | No (title phrase + name) | same |
| `/blog/audit-is-the-wrong-word` | 200 | not seen | No (title phrase) | same |
| `/practices` (tools hub) | 200 | **Yes** | No | Bing only |
| `/belief-inquiry` (tool) | 200 | not seen | No | Not found on any reachable engine |
| `/nervous-system-reset` (tool) | 200 | not seen | No | Not found on any reachable engine |
| `/integration-reflection` (tool) | 200 | not seen | not queried by title | Not found |
| `/integration-journal` (free PDF) | 200 | not seen | No | Not found on any reachable engine |
| `/scenarios`, `/scenarios/ego-dissolution` | 200 | not seen | No (exact title) | Not found on any reachable engine |
| `/faq`, `/glossary`, `/methods`, `/media`, `/media/Mushroom-Healing`, `/events` | 200 | not seen | not seen | Not found |
| `/contact` | 200 | **Yes** (stale snippet) | not seen | Bing only |
| `/legal`, `/privacy`, `/terms`, `/refunds` | 200 | not seen | not seen | Not found (low value) |
| `/es`, `/pt`, `/de`, `/fr`, `/he` and their `/about` pages (10 URLs) | 200 | not seen | not seen | Not found. No hreflang (§3) |

---

## 6. Wrong / alternate hosts

| Host | Live behaviour (GET, no redirect-follow) | UTC read | Seen in any engine? |
|---|---|---|---|
| https://mayaallan.com/ | 308 → https://www.mayaallan.com/ (path kept: `/books` → `www…/books`, 18:22:58Z) | 18:22:43Z | No |
| http://mayaallan.com/ , http://www.mayaallan.com/ | 308 → https:// same host | 18:22:43Z–18:22:44Z | No |
| https://psilowire.com/ , https://www.psilowire.com/ | 308 → https://www.mayaallan.com/ (path kept: `/books/psilocybin-integration-guide` → same path on www, 18:22:59Z) | 18:22:45Z–18:22:46Z | **No.** WebSearch `site:psilowire.com` and `psilowire` returned only psiwire.com, protectowire.com and psilowave.com. Bing curl `site:psilowire.com` returned unrelated rayleemc.com, and Bing WebFetch returned Gmail help (operator ignored) |
| https://psilocybinintegrationguide.com/ , https://www.psilocybinintegrationguide.com/ | 308 → https://www.mayaallan.com/ (path kept: `/blog` → `www…/blog`, 18:22:59Z) | 18:22:47Z–18:22:48Z | **No.** WebSearch `site:psilocybinintegrationguide.com` and `psilocybinintegrationguide.com` returned only third-party integration guides. Bing curl was degraded (headphone ANC pages) |
| https://mayaallan.vercel.app/ | 308 → https://www.mayaallan.com/ (path kept: `/about`, 18:23:00Z) | 18:22:49Z | **No** site pages. WebSearch `mayaallan.vercel.app` returned only github.com/mallan67/mayaallan/issues/13 and /issues/38 ("Deploy failure — …") |
| https://mayaallan-mallan.vercel.app/ | 302 → vercel.com/sso-api (Deployment Protection), `X-Robots-Tag: noindex` | 18:22:50Z | No |
| https://mayaallan-git-main-mallan.vercel.app/ | 302 → vercel.com/sso-api, `X-Robots-Tag: noindex` | 18:22:51Z | No |

---

## 7. Off-site references and crawl footprint

| Query / source | Engine / API | UTC read | Result |
|---|---|---|---|
| `"mayaallan.com" -site:mayaallan.com` | WebSearch | ≈18:22Z | The only real references are **github.com/mallan67/mayaallan** pull requests #46, #53, #47 and issue #44 (the site's own repository). No third-party site, directory, press, retailer or social page references the domain. |
| `"mayaallan.com" -site:mayaallan.com` | Bing curl | 18:20:32Z | Degraded (returned google.com home pages). Unusable |
| Repository visibility | `gh api repos/mallan67/mayaallan` | 18:27:55Z | `"visibility":"public"`, `has_issues:true`, 2 open issues. This is why the ops PRs and issues are indexed |
| Wayback Machine | `https://web.archive.org/cdx/search/cdx?url=mayaallan.com&matchType=domain&collapse=urlkey&limit=200` | 18:26:34Z | 89 unique URLs, **all captured 2026-01-30/31** (one crawl). Includes `/`, `/about`, `/contact`, `/legal`, `/books/psilocybin-integration-guide`, `/admin/login` (200). **No captures after 2026-01-31.** `https://archive.org/wayback/available?url=www.mayaallan.com` returned `"archived_snapshots": {}` (18:26:36Z) |
| Common Crawl | `https://index.commoncrawl.org/<id>-index?url=mayaallan.com&matchType=domain` for CC-MAIN-2026-39/34/30/25/21/17/12/08 | 18:27:07Z–18:27:40Z | "No Captures found for: mayaallan.com" in **5 of 8** indexes (2026-39, -34, -25, -12, -08). 3 indexes returned an HTML error page (-30, -21, -17) and are inconclusive. `url=www.mayaallan.com/*` in -39/-34/-30 also found no captures (18:26:53Z–18:26:55Z) |

---

## 8. Findings

| id | Severity | Finding | Evidence (source + UTC) | Impact | Fix (owner) |
|---|---|---|---|---|---|
| idx-01 | high | **The site's index footprint is tiny.** Only 8 of 38 sitemap URLs are visible on Bing and 2 of 38 on the WebSearch engine. None of the 4 other blog posts, the 4 tool pages, `/scenarios`, the ego-dissolution scenario, `/faq` or `/glossary` surfaced for their own exact titles. | §2, §4, §5. Bing 18:18:53Z–≈18:29:30Z; WebSearch ≈18:22Z–18:26:10Z | The content written to attract search visitors (posts, tools, scenarios) cannot be found, so there is no organic traffic to them. That matches "not seen anywhere". | owner-account: verify the site in Google Search Console and Bing Webmaster Tools, submit `sitemap.xml`, and use URL Inspection → Request indexing for the book, posts, tools and scenarios. code-pr: see idx-05 and idx-06 |
| idx-02 | high | **Google presence is UNVERIFIED.** Google Search cannot be read by automated clients. | curl Chrome UA: JavaScript redirect page (18:21:36Z, 18:21:45Z). curl Lynx UA: "Update your browser" (18:21:37Z, 18:21:51Z). WebFetch: "having trouble accessing Google Search" (≈18:22Z) | Nobody knows whether Google (the main traffic source) has indexed any page | owner-account: Google Search Console → Pages report + URL Inspection + Performance (needs outside-source check) |
| idx-03 | medium | **The book page is missing from the WebSearch engine** even though Bing ranks it #1 for "psilocybin integration guide". Amazon (×3) outranks the author site for the exact book title there. | WebSearch exact title, `site:…books…` and "40 real scenarios" (≈18:22Z, ≈18:25:30Z, ≈18:26:10Z) vs Bing curl 18:23:59Z and WebFetch ≈18:28:45Z | On engines that use this index (and AI answers built on it), readers are sent to retailers, not to the site | owner-account: request indexing (GSC; Bing WMT / IndexNow). content: link the book page from the retailer and author profiles |
| idx-04 | medium | **Stale titles and snippets on Bing** for `/about`, `/books`, `/contact` and `/blog`. `/books` shows the homepage description. | §2a: "About - Maya Allan" vs live "About \| Maya Allan"; "Books - Maya Allan" plus homepage snippet vs live "Books \| Maya Allan" plus its own description; contact and blog snippets differ from the live meta descriptions (Bing 18:18:53Z–≈18:28:15Z; live 18:23:12Z–18:23:19Z) | Bing has not recrawled these pages since their metadata changed. Search listings look generic or duplicated | owner-account: Bing WMT URL Inspection → Request indexing (or an IndexNow ping) for these URLs |
| idx-05 | low | **The sitemap gives weak recrawl signals.** 30 of 38 URLs have no `<lastmod>`, and all 5 posts share an identical midnight lastmod (2026-04-19T00:00:00Z). | live sitemap 18:19:39Z | Engines have little reason to recrawl, so stale snippets (idx-04) persist and new pages are discovered slowly | code-pr: emit real `lastmod` for static pages and posts |
| idx-06 | low | **Localized pages (10 URLs: es/pt/de/fr/he) have no hreflang alternates**, and none was seen in any engine. | §3 (18:27:54Z–18:28:08Z); §5 | Engines may treat them as thin or duplicate pages, or never pair them with the English originals | code-pr: add hreflang alternates (including `x-default`) to every localized page and its English original |
| idx-07 | medium | **The brand name is shared.** On Bing "Maya Allan", positions #3–#10 are real-estate broker profiles under the same name. On WebSearch "Maya Allan" author, the site only appears at #7–#8 behind Wikipedia "Maya …" pages. | Bing curl 18:20:33Z, WebFetch ≈18:29:10Z; WebSearch ≈18:22Z | A reader searching for the author sees mostly real-estate results | content: consistent author identity (Person schema `sameAs`, Amazon Author Central, Goodreads and Google Books author profiles) all linking to www.mayaallan.com |
| idx-08 | low | **No third-party site links to or mentions mayaallan.com.** The only off-site references found are the site's own public GitHub repo PRs and issues, including "Deploy failure" issues that surface for "mayaallan.vercel.app". | WebSearch ≈18:22Z; `gh api` visibility=public 18:27:55Z | Zero referring domains means low authority, which keeps rankings and crawl frequency low. Operational noise is publicly searchable | content/owner: build real citations (retailer pages, author bios, interviews). Optionally make the ops repo private or keep issue titles neutral |
| idx-09 | low | **Almost no crawl or archive footprint.** Common Crawl has no captures in 5 of the last 8 indexes, and the Wayback Machine has none after 2026-01-31. | §7 (18:26:34Z–18:27:40Z) | Common Crawl feeds many AI/LLM and search datasets, so the site is largely invisible to them | mixed: earning links (idx-08) is what drives crawls. Optionally the owner can save key pages to the Wayback Machine manually |
| idx-10 | info | No `google-site-verification` or `msvalidate.01` meta tags on the homepage. | 18:27:54Z | Not a defect if ownership was verified by DNS or by file, but that could not be checked here | owner-account: confirm verification in GSC and Bing WMT |

## 9. What works

| Item | Evidence |
|---|---|
| The site **is** in Bing's index; the homepage ranks #1 for "Maya Allan" | Bing curl 18:18:53Z / 18:20:33Z + WebFetch ≈18:28:15Z / ≈18:29:10Z |
| The book page ranks **#1 on Bing for "psilocybin integration guide"**, ahead of Amazon | Bing curl 18:23:59Z + WebFetch ≈18:28:45Z |
| robots.txt allows every crawler, including all major search and AI bots; the sitemap is declared | GET robots.txt 18:19:39Z |
| All 38 sitemap URLs return 200 with `index, follow` and a correct self-canonical on www | GET 18:23:12Z–18:23:19Z |
| Every alternate host (apex, http, psilowire ×2, psilocybinintegrationguide ×2, mayaallan.vercel.app) 308-redirects, keeping the path, to https://www.mayaallan.com. No wrong host is seen in any engine | GET 18:22:43Z–18:23:00Z; §6 |
| Preview/branch hosts are behind Vercel SSO with `X-Robots-Tag: noindex` | GET 18:22:50Z–18:22:51Z |
| Retired URLs (`/tools`, `/integration`) 308 to their replacements | GET 18:23:00Z |

## 10. Unverified / needs outside-source check

- **Google index coverage and rankings.** Google Search blocks automated reads. Needs the owner's **Google Search Console** (Pages report, URL Inspection, Performance → queries and clicks).
- **Bing's full list of indexed URLs (~36 estimated).** Automated clients see only the first 7 results, pagination is ignored and compound `site:` queries return unrelated results. Needs **Bing Webmaster Tools** (Site Explorer, URL Inspection, Search Performance).
- **DuckDuckGo, Brave, Mojeek, Yahoo, Yandex, Startpage, Ecosia.** All blocked by challenge or error (§1). Needs a manual browser check by the owner.
- Whether sitemaps were ever submitted to GSC or Bing WMT, and whether IndexNow pings succeeded. Calling `/api/indexnow/*` is forbidden in this run. Needs the owner accounts.
- Site ownership verification by DNS TXT or file (outside the allowed sources for this lens).
- Which search provider backs the WebSearch tool (not disclosed), so its "2 URLs" view cannot be attributed to a named engine.
- Whether blog posts, tools and scenarios are missing from Bing's results beyond the visible top 7. Their absence from WebSearch is confirmed by at least 1–3 phrasings each (§4/§5); their absence from Bing is **not** confirmed.
- Common Crawl indexes CC-MAIN-2026-30, -21 and -17 returned HTML errors (inconclusive).

## 11. Not exercised

- Playwright / real browser (not authorized for this lens), so Google and DuckDuckGo were not read through a browser.
- Vercel MCP tools (not needed for this lens).
- Image search, news search, Google Books.