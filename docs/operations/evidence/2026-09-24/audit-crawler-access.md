# Audit evidence: crawler access and indexability (lens "vis-")

- Question: WHY IS THE SITE NOT SEEN? Can crawlers reach and index https://www.mayaallan.com?
- UTC window: 2026-09-24T18:18:42Z (first live read) until the last commit of this file. Every row carries its own read time.
- Save method: this file was built in several sequential commits on branch work/site-visibility, because one Bash call cannot hold the whole file. Each append was built from the live GitHub copy of the file at the live branch head.
- Site: https://www.mayaallan.com (canonical host). Vercel project prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y ("mayaallan"), team team_kZQh5NYLyrOKqffK0r9EXf4E.
- Production deployment actually serving: dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4. Seen in the `dpl=` asset query string of GET https://www.mayaallan.com/books (18:22:47Z) and in the `Link` header of GET https://www.mayaallan.com/ (18:26:19Z).
- Sources (live only): curl 8.16.0 GET/HEAD requests from one non-crawler client IP to the 9 project hosts. Vercel MCP calls scoped to the project: list_project_domains, get_firewall_config, get_active_attack_status, get_project, get_runtime_logs. GitHub API only for this file's commits. NOT used: repository source files, local files, search engines (index presence belongs to another lens), Playwright, and anything behind a login.
- Method caveat: the crawler user agents (UAs) were **spoofed** from a non-crawler IP address. A 200 response shows the site does not block or challenge requests based on the UA string. It does NOT show what a real Googlebot/Bingbot IP receives. See "Unverified".
- Safety: only GET and HEAD requests. No forms, no /api/cron, /api/admin or /api/indexnow calls, no logins.

## Verdict for this lens

**Crawler access is not what keeps the site unseen.** Across 240 requests (15 UAs x 8 URLs, in two passes using different methods), every request returned 200. No request was challenged or mitigated, and none carried an X-Robots-Tag. robots.txt allows every bot and points to the sitemap. The sitemap is valid: 38 URLs, all 200, all `index, follow`, all self-canonical, all on the www host. All duplicate hosts 308-redirect to the www host. The protected preview hosts are behind SSO and send `noindex`.

The problems this lens did find are about quality and signals, not blocking:
1. (vis-01, high, UNVERIFIED) No search-engine ownership verification shows on the live site. There is no `google-site-verification` or `msvalidate.01` meta tag, and /BingSiteAuth.xml returns 404. That points to Google Search Console and Bing Webmaster Tools possibly never being set up, so the sitemap was never submitted. DNS-TXT verification cannot be seen from here.
2. (vis-02, medium) Sometimes `<title>`, meta robots, description and `rel=canonical` are sent **after `</head>`**, in the body. This happens in about 1 in 5 to 1 in 3 responses for the Googlebot, GPTBot and Chrome UAs, and never for Bingbot.
3. (vis-03, medium) Several sitemap pages are thin or empty in the server-rendered HTML: /books (50 words in main), /events (15), /media (8), /contact (23), /media/Mushroom-Healing (7).
4. (vis-04, medium) Structured-data gaps: the Book has no isbn, the Articles have no image or dateModified, Person and Organization entities are ambiguous, and sameAs lists Instagram only.

## 1. Crawler UA matrix (GET, no redirects followed, `--compressed`)

Pass A: GET, read 2026-09-24T18:19:59Z to 18:20:19Z, 4 requests at a time. The URLs are https://www.mayaallan.com + path. Each cell shows `status / body bytes`. For every one of the 120 responses: no challenge text ("Vercel Security Checkpoint", "Just a moment", captcha, "Access denied"), no `x-vercel-mitigated`, no `x-vercel-challenge-token`, no `X-Robots-Tag`. HTML pages returned `X-Vercel-Cache: MISS`; /sitemap.xml and /robots.txt returned `HIT`.

| UA | / | /books | /books/psilocybin-integration-guide | /blog | /blog/affirmations-vs-integration | /about | /sitemap.xml | /robots.txt | read (UTC) |
|---|---|---|---|---|---|---|---|---|---|
| Chrome 128 (baseline) | 200/91506 | 200/44939 | 200/95452 | 200/38272 | 200/62206 | 200/48263 | 200/10027 | 200/2990 | 18:19:59-18:20:18 |
| Googlebot desktop | 200/90273 | 200/44939 | 200/97014 | 200/38272 | 200/62249 | 200/49496 | 200/10027 | 200/2990 | 18:19:59-18:20:18 |
| Googlebot smartphone | 200/91506 | 200/44939 | 200/95366 | 200/38229 | 200/62206 | 200/49496 | 200/10027 | 200/2990 | 18:19:59-18:20:18 |
| Bingbot | 200/89941 | 200/44658 | 200/95168 | 200/37944 | 200/61966 | 200/47981 | 200/10027 | 200/2990 | 18:19:59-18:20:19 |
| GPTBot | 200/91506 | 200/46172 | 200/96685 | 200/38272 | 200/62206 | 200/49496 | 200/10027 | 200/2990 | 18:20:00-18:20:19 |
| OAI-SearchBot | 200/91506 | 200/46172 | 200/96685 | 200/38272 | 200/62249 | 200/48263 | 200/10027 | 200/2990 | 18:20:00-18:20:19 |
| ChatGPT-User | 200/90273 | 200/44896 | 200/95366 | 200/39505 | 200/63482 | 200/49496 | 200/10027 | 200/2990 | 18:20:00-18:20:19 |
| ClaudeBot | 200/90273 | 200/44939 | 200/96685 | 200/39505 | 200/63482 | 200/48263 | 200/10027 | 200/2990 | 18:20:00-18:20:19 |
| Claude-SearchBot | 200/90273 | 200/44939 | 200/95452 | 200/39505 | 200/63482 | 200/49496 | 200/10027 | 200/2990 | 18:20:01-18:20:19 |
| Claude-User | 200/90273 | 200/46172 | 200/95409 | 200/39505 | 200/62206 | 200/49453 | 200/10027 | 200/2990 | 18:20:01-18:20:19 |
| PerplexityBot | 200/90273 | 200/46172 | 200/95452 | 200/38229 | 200/63482 | 200/49496 | 200/10027 | 200/2990 | 18:20:01-18:20:19 |
| Perplexity-User | 200/90273 | 200/46172 | 200/95452 | 200/38229 | 200/62249 | 200/48263 | 200/10027 | 200/2990 | 18:20:01-18:20:19 |
| Applebot | 200/89984 | 200/44658 | 200/95168 | 200/37944 | 200/61966 | 200/47981 | 200/10027 | 200/2990 | 18:20:01-18:20:19 |
| DuckDuckBot | 200/89984 | 200/44658 | 200/95168 | 200/37901 | 200/61966 | 200/47981 | 200/10027 | 200/2990 | 18:20:01-18:20:19 |
| CCBot | 200/90273 | 200/46172 | 200/95409 | 200/38272 | 200/62249 | 200/48263 | 200/10027 | 200/2990 | 18:20:01-18:20:19 |

Every UA got the same page title for a given path: "/" = "Maya Allan — Author of the Psilocybin Integration Guide", /books = "Books \| Maya Allan", book = "Psilocybin Integration Guide - 40 Real Psychedelic Experiences \| Maya Allan", /blog = "Writing — Belief work, nervous-system regulation, integration \| Maya Allan", post = "The difference between an affirmation and an integration — and why it matters \| Maya Allan", /about = "About \| Maya Allan".

Pass B (second, independent observation): HEAD, read 2026-09-24T18:26:42Z to 18:26:57Z, same 15 UAs x 8 URLs, 120 requests. Status counts {"200":120}. `x-vercel-mitigated` 0, `x-vercel-challenge*` 0, `X-Robots-Tag` 0.

Body sizes vary by 1.2 to 1.8 KB between UAs. Two back-to-back Chrome GETs of /books were byte-identical (44915 = 44915, 18:22:31Z). Diffing Chrome, GPTBot and Bingbot responses for /books (18:22:47Z) showed the differences are only in the order of the React Server Components flight payload and in where the metadata sits (see section 4b). They are not differences in page content. No cloaking was seen.