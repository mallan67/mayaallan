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