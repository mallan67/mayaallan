# Evidence: where Maya Allan and the book appear off-site, and whether they link back

- **Lens:** appears-offsite-footprint (finding ids `foot-`)
- **Branch/path:** `work/site-visibility` : `docs/operations/evidence/2026-09-24/appears-offsite-footprint.md`
- **UTC window:** 2026-09-24T18:18:41Z to 2026-09-24T18:37:49Z (all reads live, in this window). Saving started at 2026-09-24T18:40:40Z (saved in 3 appended commits because of the Windows command-length limit; each commit adds only this path).
- **Sources used (all public, GET only, no logins):** live site www.mayaallan.com (curl); Amazon.com / .co.uk / .ca / .de / .com.au product and author pages (curl); Goodreads book, author and work pages (curl); Google Play Books and Google Books pages (curl); Barnes and Noble (curl + WebFetch); ThriftBooks, AbeBooks, Bokus (curl); Bookshop.org, Waterstones, Kobo, BookBub, LibraryThing, Books-A-Million, Walmart (attempted, bot-walled); Open Library JSON API; Apple iTunes Search/Lookup API (ebooks, audiobooks, podcasts, podcast episodes); Wikidata API; Library of Congress JSON; Wayback Machine CDX API; Bluesky public AppView API; Instagram, Pinterest, Threads, TikTok, YouTube, Facebook, X, Substack, Medium, Linktree public profile URLs (curl / WebFetch); YouTube public results page; StoryGraph public search; search engines: WebSearch tool (8 queries, then the session-wide 200-query budget was exhausted), Bing HTML (curl + WebFetch), DuckDuckGo HTML (bot challenge), Mojeek (captcha), Brave (JS only), Yahoo (empty body), Reddit JSON (403), Listen Notes (403); GitHub live metadata for mallan67/mayaallan via `gh api`.
- **Not used (forbidden or not needed):** repository source files, any local file or scratch dir, Gmail/Drive, logins, POST/submit (except the gitsave git API calls).
- **Reading rule:** every row gives the URL or query and the UTC read time. Where a WebSearch/WebFetch call has no own timestamp, the time is bracketed by the neighbouring timestamped shell reads. Absence claims list at least two independent observations or are marked single-observation / unverified.
- **Public repo notice:** mallan67/mayaallan is public (`gh api repos/mallan67/mayaallan` at 18:33:19Z: `visibility=public`), so this file is public. It contains no secrets, cookies, env values or visitor data.

## 1. Plain-language summary

1. **The book exists in the big catalogues, but nobody has rated it and none of those listings link to the website.** Amazon (Kindle, paperback, hardcover), Goodreads, Google Play/Books, Barnes and Noble, ThriftBooks, AbeBooks, Bokus and Open Library all have the book. All three Amazon formats and both Goodreads works show **0 ratings**. **None** of the listings or author profiles checked contains a link to or mention of `mayaallan.com`.
2. **No outside website links to or mentions mayaallan.com.** Searches for the domain return only the site itself or unrelated noise. The Wayback Machine has not archived the site since 2026-01-31. No podcast, interview, YouTube video, Reddit thread (blocked, so not verified) or directory mention was found.
3. **The author identity is weak off-site.** The Goodreads author page is unclaimed: placeholder photo, no bio, no website. The Amazon author page has a photo and bio, but uses a different job title ("Author · Speaker · Wellness Advocate") and different positioning from the site. On Bing, the name "Maya Allan" shows the author site at #1 and #2, then 8 real-estate profiles.
4. **Social media barely exists and is not linked.** Instagram @maya.allan66 exists, but the site links to it only in hidden JSON-LD, not in visible links. No YouTube, Bluesky or Linktree account exists. The Pinterest account "mayaallan2" has personal boards (clothes, hair, nails) and no website. The Substack and Medium accounts named mayaallan are empty, and we could not confirm they belong to her.
5. **Edition data is inconsistent.** The Kindle listing shows the paperback ISBN. Amazon print titles list the author twice ("Allan, Maya, Allan, Maya"). On Goodreads, the hardcover is a separate, uncombined work. The site Book schema gives only the hardcover ASIN and no ISBN.
6. **What works:** the site ranks **#1 on Bing** for "Maya Allan" (2 reads). All 6 extra domains 308-redirect to www.mayaallan.com and keep the path. The Amazon listings are live in 5 marketplaces. Google Play sells the ebook at $9.99.

## 2. Identifiers observed (live)

| Item | Value | Where read | UTC read |
|---|---|---|---|
| Book title | Psilocybin Integration Guide: 40 Real Scenarios for Navigating What You See, Feel & Experience | Amazon, Goodreads, Google Play, B&N page titles | 18:20:07Z-18:25:02Z |
| Kindle ASIN | B0G765BZDL (pub. Dec 15 2025, 281 pp, publisher "Maya Allan") | https://www.amazon.com/dp/B0G765BZDL | 18:22:42Z |
| Paperback | ASIN B0G91GZMLT, ISBN-13 979-8994148839 (Dec 13 2025, 289 pp) | https://www.amazon.com/dp/B0G91GZMLT | 18:22:44Z |
| Hardcover | ASIN B0G7JWDJYQ, ISBN-13 979-8994148853 (Dec 13 2025, 289 pp) | https://www.amazon.com/dp/B0G7JWDJYQ | 18:22:47Z |
| Ebook ISBN (Google) | 9798994148891 | https://play.google.com/store/books/details?id=HvafEQAAQBAJ | 18:24:40Z |
| Amazon author id | B0G76975ST (`/e/B0G76975ST` returns 404; `/stores/author/B0G76975ST` returns 200) | amazon.com | 18:23:41Z |
| Goodreads author | 65134359.Maya_Allan | goodreads.com | 18:24:10Z |
| Goodreads works | 274201719 (Kindle 245299940 + paperback 245505700); 274327770 (hardcover 245349971, separate) | goodreads.com | 18:33:56Z |
| Google Books id | HvafEQAAQBAJ | books.google.com | 18:24:41Z |
| B&N work id | 1148993659 (one variant: 9798994148839 paperback) | barnesandnoble.com JSON-LD | 18:25:56Z |
| Open Library | work OL45177926W, edition OL61601841M (paperback only), author OL16288546A | openlibrary.org JSON | 18:26:26Z-18:26:41Z |
| Instagram | @maya.allan66 (in site JSON-LD `sameAs`) | site HTML + instagram.com | 18:18:55Z, 18:30:44Z |