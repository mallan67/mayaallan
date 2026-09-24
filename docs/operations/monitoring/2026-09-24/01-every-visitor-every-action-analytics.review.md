# every-action — adversarial senior review (2026-09-24)

Reviewed document: `docs/operations/monitoring/2026-09-24/01-every-visitor-every-action-analytics.md` on branch `work/site-visibility`, commit `96fa88ec7a355e5591932ccd09daf947861308ca` (blob `1e93c098a452efa2cd47f5d1fc5e76f8b8d0edb4`), read live from GitHub at 2026-09-24T18:58:32Z.
Reviewer: Claude (senior software engineer role), for Maya Allan.
Scope: website measurement only. **The audiobook is out of scope** (Maya, 2026-09-24: "the audio book is not finished, so please focus on the other stuff first"). No audio work is proposed. One live book-page copy problem that mentions the audiobook is flagged because it affects visitors today (M10).
Method: every claim below was re-read **live on 2026-09-24 between 18:58Z and 19:20Z** from the GitHub API (`mallan67/mayaallan`), HTTP GET to www.mayaallan.com, the Vercel API scoped to project `prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`, and vendor or regulator pages (dated below). No local files, no forms, no purchases, no admin/cron/IndexNow calls, no workflow dispatch. Not readable live = **UNVERIFIED**; deduced = **INFERRED**. Engineering review, not legal advice.

---

## 1. Verdict

1. **The diagnosis is right.** Web Analytics is still disabled (re-read ~19:00Z), undecided visitors are invisible, there is no sale alert, and retailer clicks and journal downloads are unmeasured.
2. **The first step is wrong as written: do not merge PR #57 as-is.** At head `fa5d59b` the banner button still says **"Reject analytics"** while Web Analytics keeps running after Reject; the new privacy text claims cookieless JS measurement "is not the kind of storage access that requires consent", which EDPB Guidelines 2/2023 ¶33 contradicts; and nothing redacts `/download/<token>` paths (bearer links to paid files) before Vercel WA records them. Three small amendments in the same PR fix all three (ana-1).
3. **The build plan (ana-2, ana-4) is overbuilt for one owner with near-zero traffic:** two new crons, a snapshot table, an in-app Vercel token the lens calls "read-only" (no such token type exists), a 24-hour "zero page views" alarm that will fire on quiet days, and clicks nobody will read (nav, menu, DOI links). Slim versions below keep Maya’s goal — one living system that reports results and flags failures — with about half the code.
4. **The lens missed business problems on the live book page:** 3 of 7 retailer URLs carry junk tracking parameters and the AbeBooks one carries **a third-party affiliate click-id**; the page shows an **"Audiobook $15.99" price card with no way to buy**; and **$9.99 PDF-export sales are stored nowhere durable** (invisible to the site’s own revenue view).
5. **Plan tier (INFERRED): almost certainly Pro, not Hobby.** Not exposed to project-scoped calls, but Vercel accepted **182 preview deployments in 52 minutes** today, above Hobby’s 100/hour and 100/day. If it were Hobby, the PayPal checkout would breach Vercel’s Hobby non-commercial rule (M1).

---

## 2. Fact re-checks (the 22 input facts)

| # | Lens fact (short) | Holds? | Live re-read (UTC, 2026-09-24) | Note |
|---|---|---|---|---|
| 1 | WA not enabled: `count_pageviews` / `count_events` → 400 `web_analytics_not_enabled` | **Yes** | Vercel API, range 2026-08-24→2026-09-24, ~19:00Z | Both still `web_analytics_not_enabled` (the endpoint also requires `until`). |
| 2 | Prod `dpl_5ug8W5ASgWuKHpxSYScqtAH1q9Q4` READY 2026-09-08T07:57Z from main ed7461a; `/api/health` ed7461a, 7 checks ok | **Yes** | `list_deployments`/`get_deployment` ~18:59Z; GET /api/health 19:03:11Z | Health `mode: cheap`; database, resend, blob, paypal, session, admin, upstash ok. `main` still ed7461a (2026-09-06T15:23Z) at 19:00:56Z. |
| 3 | Homepage: 13 first-party chunks, 0 third-party trackers | **Yes** | GET / 19:03:05Z | 13 chunks; 0 tracker matches. Also 0 `google-site-verification` meta (M8). |
| 4 | Chunk `312c5210c9c35dc5.js`: `@vercel/analytics` sdkv 2.0.1; both gates need `"accepted"`; 2-year visitor + 30-min session cookie; POST `/api/marketing/visitor` | **Yes** | GET chunk 19:03:18Z | `"accepted"!==useConsent()?null:`; `63072e3` ×3; `1800`; `/api/marketing/visitor`; `globalPrivacyControl` 0 matches. |
| 5 | Banner for every undecided visitor, no geo check; text/buttons as quoted | **Yes** | same chunk; main `ConsentBanner.tsx` ~19:01Z | "Reject analytics", "Accept all", "No advertising trackers" present; no geo/country reference in the component. |
| 6 | CSP as quoted | **Yes (exact)** | response headers GET / 19:03:05Z | Also `Cache-Control: private, no-store`, `X-Vercel-Cache: MISS` on the homepage (M14). |
| 7 | /privacy "May 20, 2026"; identifiers consent-gated; no WA name; no GPC | **Yes** | GET /privacy 19:03:26Z–19:04Z | Also "Analytics events are retained for current product analysis" — **no retention period** (M7). |
| 8 | PR #57 open, head fa5d59b, 14 files +781/−91, clean, ahead 5 / behind 0, gates + Vercel green, Codex "Didn’t find any major issues" | **Yes** | `gh api` pulls/57, compare, check-runs, reviews 19:00:56Z / 19:10:38Z | Unchanged after 17 days. The automated review did not catch the consent and token issues (ana-1). |
| 9 | 11 allowlisted names; only BookViewTracker posts from the browser; 4 server events; `download_started` never fired | **Yes** | main@ed7461a `marketing-events.ts`; code search 19:12:38Z | Search `"/api/marketing/event"` → route + BookViewTracker only; `download_started` → `marketing-events.ts` only. The zod enum is **derived from** `ALLOWED_EVENT_NAMES`, so "extend the zod enum" is not a separate step. |