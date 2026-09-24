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