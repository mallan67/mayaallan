# Maya Allan SEO / Search Visibility Operations

**Last code audit:** 2026-09-26  
**Canonical site:** https://www.mayaallan.com

This file is the repo-level operating record for search visibility. It deliberately avoids a synthetic "SEO score": indexing and ranking are decisions made by search engines, and a checklist cannot prove them.

## Implemented in the site

- Canonical `www.mayaallan.com` URLs and permanent non-www / Vercel-alias redirects.
- Dynamic `/sitemap.xml` containing public static pages plus published books, events, media, blog posts, and scenarios.
- `/robots.txt` that keeps public content crawlable while blocking admin, API, and buyer-download surfaces.
- Google/Bing/Yandex verification meta-tag hooks driven by environment variables.
- IndexNow support for Bing and other participating engines.
- Canonical metadata, Open Graph, Twitter cards, and language/hreflang support where translated pages actually exist.
- Structured data for the site, author, books, articles/scenarios, events, media, glossary, breadcrumbs, and applicable web tools.
- `/about` described as a `ProfilePage` whose main entity is Maya Allan.
- The primary interactive tools expose crawlable explanatory HTML plus `SoftwareApplication` and `BreadcrumbList` JSON-LD:
  - `/belief-inquiry`
  - `/nervous-system-reset`
  - `/integration-reflection`
- Internal links connect the book, scenarios, articles, methods, glossary/FAQ, and tools.
- `/llms.txt` and `/llms-full.txt` are retained only as optional experimental manifests for systems that choose to use the proposal. Google Search says llms.txt is not required and does not improve or reduce Search visibility or rankings.
- A daily GitHub Action (`.github/workflows/seo-health.yml`) checks the live robots file, sitemap membership, canonical tool URLs, tool application schema, author ProfilePage schema, and non-www redirect. It opens/updates a GitHub issue on failure and closes the issue after recovery.
- CI contract tests prevent the key tool/entity/crawler SEO changes from silently regressing.

## External one-time account actions

These cannot be truthfully completed by application code because the verification values and webmaster accounts belong to the site owner.

### Google Search Console

1. Verify the canonical property/domain.
2. If using the HTML meta-tag method, store only the verification token in Vercel as `GOOGLE_SITE_VERIFICATION`.
3. Submit `https://www.mayaallan.com/sitemap.xml`.
4. Inspect the highest-value URLs after material releases:
   - homepage
   - `/about`
   - `/books/psilocybin-integration-guide`
   - the three interactive tool pages
   - new scenario/article pages
5. Use Search Console Performance data as the ranking/visibility source of truth. AI features in Google Search are reported through Search Console; do not infer Google AI visibility from `Google-Extended` or llms.txt.

### Bing Webmaster Tools / IndexNow

1. Verify the site in Bing Webmaster Tools. If using the meta-tag method, set `BING_SITE_VERIFICATION` in Vercel.
2. Submit the sitemap.
3. If IndexNow is enabled, set:
   - `INDEXNOW_KEY`
   - `INDEXNOW_SUBMIT_SECRET`
4. A successful IndexNow response means the URL notification was received. It does **not** guarantee crawling or indexing.

## Measurement priorities

The site should be judged by outcomes, not the presence of tags:

1. Search impressions and clicks by query/page.
2. Non-brand queries that reach the book, scenarios, articles, and tools.
3. Tool impressions -> opens -> starts -> meaningful depth -> completion.
4. Email/contact/book-click conversions after tool or editorial visits.
5. Returning visitors and source/referrer trends.
6. Indexing/crawl errors and pages losing impressions over time.

The repo already contains a first-party Supabase marketing event stream and an admin analytics surface. Prefer extending that system before adding another paid analytics vendor.

## Public-search baseline observed 2026-09-26

Public web search was able to surface the homepage, the *Psilocybin Integration Guide* book page, and the ego-dissolution scenario. The cached `/about` result observed during this audit was materially older than the current repo copy and still contained outdated positioning; the ProfilePage/entity cleanup in the 2026-09-26 SEO work is intended to give crawlers a clearer current author identity on the next recrawl.

The three interactive tool pages had metadata and sitemap links before this pass, but their server-rendered pages were mostly interaction shells. The 2026-09-26 SEO work adds substantive crawlable descriptions and application schema without putting an email/signup wall in front of the tools.

## Rules for future SEO changes

- Do not promise rankings, indexing, rich results, Knowledge Panels, or AI citations.
- Do not generate hundreds of thin AI pages. Prefer fewer pages that answer real reader questions with original, attributable material.
- Do not add structured data for content users cannot actually see.
- Do not fabricate reviews, ratings, credentials, clinical authority, or research conclusions.
- Keep author/book identity facts centralized in `src/lib/identity.ts`.
- Keep tool research/attribution claims aligned with `/methods` and the cited evidence.
- Do not treat `keywords` meta tags, llms.txt, or crawler allowlists as substitutes for useful content, links, and search demand.
- When a new public route is intentionally indexable, add it to internal navigation where appropriate, sitemap coverage, and the SEO health/contract checks when it is a critical page.
