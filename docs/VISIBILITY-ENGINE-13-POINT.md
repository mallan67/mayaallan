# Maya Allan Visibility Engine — 13-point operating system

**Implemented branch:** `feat/visibility-engine-13-point-2026-09-26`  
**Purpose:** one low-cost system for search visibility, AI citations, content authority, crawler discovery, engagement, and prioritized actions.

The system deliberately separates **what code can automate** from **what requires an external account decision**. It never reports a Google/AI feature as active merely because code for it exists.

## 1. Grounded AI-search tracker

**Code:** automatic once provider credentials are configured.

- Claude direct API: provider-native web search.
- OpenAI direct API: Responses API web search.
- Gemini direct API: Google Search grounding.
- Perplexity: Sonar search.
- Gateway-only fallbacks that do not invoke a search tool are labelled **model-memory**, never live search.
- Provider citations and search queries are stored with each probe.

Admin: `/admin/aeo`.

## 2. Google Search Console ingestion

**Code-ready; owner credentials required once.**

Read-only service-account OAuth pulls:
- query/page clicks, impressions, CTR, average position;
- page performance;
- daily performance;
- Image Search performance;
- `searchAppearance` values Google actually exposes;
- sitemap state;
- URL Inspection for critical pages.

Admin: `/admin/search-visibility`. Daily cron: `/api/cron/search-console-sync`.

Required env:
- `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL`
- `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:mayaallan.com`

## 3. Query Opportunity Engine

**Automatic after Search Console ingestion.**

Uses only Maya's own GSC data to identify:
- near wins (already earning impressions around positions 5–20);
- low-click pages worth title/snippet review;
- material position losses;
- material gains worth reinforcing.

These are triage labels, not ranking predictions.

## 4. Answer graph

**Automatic repo authority.**

`content/visibility/topic-graph.json` maps author → book → research → scenarios → tools → methods.

It provides one canonical topic/resource graph rather than independent SEO pages that do not know about each other.

## 5. Short-answer layer

**Implemented where evidence is ready.**

- Scenario model already supports `shortAnswer`.
- Blog model now supports `shortAnswer`.
- The evidence-heavy integration research article has a calibrated direct answer.
- Tool pages already contain crawlable direct explanatory sections.

Do not add short answers to flagged articles until their evidence language is reviewed.

## 6. Claim + Evidence Registry

**Automatic repo authority.**

`content/visibility/evidence-registry.json` records:
- claim;
- evidence class;
- status;
- source URL/citation;
- limitation;
- pages using the claim.

Admin coverage: `/admin/content-intelligence`.

## 7. AEO prompt matrix

**Automatic.**

`content/aeo-prompts.json` tracks stable prompt IDs plus:
- reader intent;
- topic cluster;
- expected Maya target path where applicable.

This prevents a single citation-rate average from hiding whether Maya is visible for tools, book discovery, safety, research, or author queries.

## 8. Citation-gap detector

**Automatic after grounded AEO runs.**

Provider-returned sources outside mayaallan.com are stored and aggregated by URL/domain. The dashboard shows what grounded engines chose instead of Maya.

This is evidence for editorial comparison, not a ranking of competitors.

## 9. Internal-link engine

**Automatic recommendations; editorial approval required.**

`src/lib/visibility/topic-graph.ts` finds shared-topic relationships not already explicit in the graph.

Admin: `/admin/content-intelligence`.

It recommends links; it does not spray automatic links into prose.

## 10. Multimodal / visual SEO

**Measurement automatic after GSC connection; asset production editorial.**

- Google Image Search performance is ingested.
- Search appearance values are ingested exactly as Google exposes them.
- `content/visibility/visual-opportunities.json` is the original-visual backlog.
- Visuals must teach or navigate something; no stock filler.

Google's September 2026 multimodal report currently remains a Search Console UI/export feature unless/until its API representation is documented.

## 11. External entity identity

**Code-ready; third-party claims require owner action.**

`content/visibility/entity-readiness.json` tracks Amazon Author Central, Goodreads, Search Profile, Open Library and other identity work.

Only live/claimed profiles belong in `AUTHOR_PROFILES` / `sameAs`.

Optional env:
- `GOOGLE_SEARCH_PROFILE_URL`

## 12. Google Preferred Sources

**Code-ready; enable only after eligibility is verified.**

When `ENABLE_GOOGLE_PREFERRED_SOURCE=true`, the footer exposes Google's Preferred Sources deeplink for mayaallan.com.

Before enabling:
1. confirm mayaallan.com appears in Google's source preferences tool;
2. confirm Search generative-AI inclusion in Search Console.

## 13. Real crawler telemetry

**Automatic after one secret is configured.**

Next.js 16 `proxy.ts` recognizes major crawler user agents and uses `event.waitUntil()` to send only crawler hits to the existing first-party `marketing_events` stream.

Tracked classes include:
- OAI-SearchBot;
- GPTBot;
- ChatGPT-User;
- ClaudeBot;
- Perplexity;
- Googlebot;
- Bingbot.

Admin: `/admin/crawlers`.

Required env:
- `CRAWLER_TELEMETRY_SECRET`

A user-agent observation is not cryptographic identity proof. For OpenAI specifically, eligibility also depends on allowing OAI-SearchBot and OpenAI's published IP ranges at the host/CDN layer.

## Editorial guardrail

`content/visibility/editorial-review.json` currently flags older articles whose causal/neuroscience language is stronger than the site's September 2026 evidence standard. Flagged pages should be revised before being promoted as answer-layer sources.

## Cost policy

No paid SEO SaaS is required by this system. It reuses:
- GitHub;
- Next.js/Vercel;
- existing Vercel Blob;
- existing Supabase;
- Google Search Console API;
- optional direct AI-provider credits for grounded probes.

Keep `AEO_ENGINES` restricted to the providers whose data is worth its cost. Grounded search quality matters more than running every model.
