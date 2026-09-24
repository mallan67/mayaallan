# AI-search lens: adversarial review (2026-09-24)

Reviewed file: `docs/operations/growth/2026-09-24/04-ai-search-practice.md`, commit `c4155b14` on `work/site-visibility`. That commit exists live and changed only that path (checked with `gh api` at 2026-09-24T18:51:23Z). There are 13 tactics, ai-01 to ai-13.

## How this review was done

- **Sources.** Each cited URL was opened live with WebFetch or curl between 18:49:06Z and 18:51:37Z UTC on 2026-09-24. Each source's date comes from the page itself.
- **Prior work.** Checked through live GitHub metadata of `mallan67/mayaallan`:
  - PR titles and bodies, read 18:46:52Z to 18:47:07Z
  - `main` commit messages and file lists, read 18:47:18Z to 18:47:42Z
  - issues, read 18:51:23Z
  - No source files were read.
- **Live site.** GET requests to `www.mayaallan.com` between 18:50:43Z and 18:51:04Z. No forms were submitted.
- **No local files.** This file was built in memory and saved through the GitHub API.
- **Limit.** The session's WebSearch budget ran out (200 of 200) at 18:50:26Z. No replacement sources could be searched for. Anything that needed a fresh search is marked UNVERIFIED.

## Verdict

**Keep 8:**
- ai-01
- ai-02 (owner step only)
- ai-03 (as a readout of the existing experiment)
- ai-04 (narrowed to guest spots)
- ai-05
- ai-06 (primary)
- ai-10
- ai-12 (manual, reduced)

**Drop 5:** ai-07 (folded into ai-06), ai-08, ai-09, ai-11, ai-13.

**Main finding: 5 of the 13 tactics repeat work that already shipped between 2026-04-20 and 2026-09-06, and that work has produced no leads.**

| Prior work | Commits |
|---|---|
| IndexNow | `b7a0f8a6`; the key file is live |
| sameAs, ISBN and identity layer | `b7a0f8a6`, `ea9c7231`, PR #50 |
| Answer-first FAQ, built on the same 44.2% statistic | `41974c97` |
| 39 draft scenario pages | `5be3503b` |
| Medium cross-posting | `91c8f5d1` |
| AEO tracker | `b7a0f8a6`, PR #46 |

The lens's own conclusion is that off-site mentions matter and on-site markup barely does. By that logic, its on-site items (ai-08, ai-09, ai-13) should go. The tactics that survive are:
- off-site: ai-04, ai-05, ai-06
- the one direct lead-capture build: ai-10
- measurement needed to see any result: ai-01, ai-02, ai-03, ai-12

## Review table: ai-01 to ai-06

| id | Tactic | (a) Recency | (b) Evidence | (c) Rehash of prior work? | (d) Fit (solo author, no audience, psychedelic restrictions) | Keep |
|---|---|---|---|---|---|---|
| ai-01 | Measurement and AI-referral classification | OK. OpenAI FAQ updated about 2026-08-28; SEJ 2026-05-14; Vercel docs 2026-09-16 | Real, first-party docs. The 35.7% and 70.6% no-referrer figures come from vendors (Clickport, Loamly) with self-selected samples | Partly. Vercel Web Analytics was added 2026-04-20 (`ff0028c4`) but never enabled. PR #12 (2026-05-13) already stores `utm_*` on orders. New work: enabling it and mapping AI hosts | Fits. S effort | **YES** (a prerequisite; produces no leads by itself) |
| ai-02 | Bing Webmaster Tools AI Performance, plus IndexNow | OK. Bing 2026-02-10 | Real first-party feature. It is a product launch, not a results study | **YES for IndexNow.** Built 2026-05-19 (`b7a0f8a6`: lib, key file, submit API); the key file returns 200 live. The AI Performance report is new | Fits. Owner, S effort | **YES, owner step only.** Drop the code PR |
| ai-03 | Check Google indexing | OK. Google 2025-12-10; Ahrefs 2026-03-02 | Real. Google docs; Ahrefs: 863k SERPs, 4M URLs (vendor data) | **YES.** This is the post-merge plan already written in PR #45 (2026-09-05) | Fits. Owner, S effort | **YES**, as the readout that decides whether any more on-site work happens |
| ai-04 | YouTube: own channel plus podcast guest spots | OK. 2025-12-12 to 2026-03-13 | Correlation only, and the lens left out two key caveats (see details) | No | Own channel: poor fit (L effort, zero subscribers). Guest spots: good fit. YouTube allows educational content that gives no use, making or sourcing instructions | **YES, narrowed to guest spots** |
| ai-05 | Reddit answers | Mixed. Profound's data runs Aug 2024 to Jun 2025, before ChatGPT's Reddit drop; Semrush 2025-11-10; Ahrefs 2026-03-13 | Real but conflicting. Vercel's "seed community mentions" is advice, not a measured result | No | Good fit: the audience is there. Subreddit rules are UNVERIFIED because Reddit returned 403 | **YES** |
| ai-06 | Earned media and third-party book lists | OK. 2025-09-10 to 2026-06-17 | Real but indirect. arXiv preprint, not peer reviewed. Lily Ray's data is B2B SaaS only | No | Good fit. Earned media is not subject to ad restrictions | **YES, primary tactic** |

## Review table: ai-07 to ai-13

| id | Tactic | (a) Recency | (b) Evidence | (c) Rehash of prior work? | (d) Fit | Keep |
|---|---|---|---|---|---|---|
| ai-07 | Goodreads and Amazon ratings | OK (live page) | **None for AI.** The lens itself says this is inference | **YES.** Author-profile setup steps were written 2026-04-20 (`1573f924`). Five months later: 0 ratings, and the Goodreads author profile shows no sign of being claimed | Fits, but the AI benefit is unproven | **NO** as a standalone tactic. Fold into ai-06: ask review-copy readers for an honest rating |
| ai-08 | More answer-first scenario and FAQ pages | OK | Partly unverifiable. The 815k-pair Growth Memo post is paywalled; only its headline was readable. The Consensus Gap overlap figures are only 1.1–2.3% | **YES.** Same format and same 44.2% reasoning as `/faq` (`41974c97`, 2026-05-19); same template as PR #45. The 39 drafts already exist (`5be3503b`) | Not materially different. More of the same bet while PR #45's two pages had not been indexed | **NO** (gated behind ai-03) |
| ai-09 | Server-render text on the tool pages | **FAILS.** The only source is 2024-12-17. No 2025–26 confirmation was fetched, so current status is UNVERIFIED | Real measurement, but old. The lens says the effect has not been measured | Same class as the on-site crawler work that has not moved results (PR F, #43, #52) | Speculative | **NO** |
| ai-10 | Email capture on deep pages | OK. 2025-10-24 to 2026-06-18 | The AI-conversion evidence is mixed. The measured gap is real: the live check found 0 email inputs on the deep pages | No. Only the homepage newsletter and the /contact form exist | Strong fit. Owned email is the one channel ad restrictions cannot block | **YES** (the only tactic that captures leads directly) |
| ai-11 | Republish on LinkedIn and Medium | OK. Semrush 2025-11-10 | Weak. Vendor data at domain level; prompt categories not disclosed; no data for this niche | **YES for Medium.** `91c8f5d1` (2026-04-20) built a Medium API script. Medium archived that API on 2023-03-02 and says it allows no new integrations | Poor fit. She has no LinkedIn network, and LinkedIn citations are likely driven by B2B queries | **NO** |
| ai-12 | Monthly prompt panel; move the tracker to search modes | OK. 2026-05-11 and 2026-03-13 | Real (3.7M citations; SparkToro) | **YES for the tracker.** Built 2026-05-19 (PR F) and fixed 2026-09-05 (PR #46, issue #44). The manual logged-out panel is materially different | 15 prompts × 3 runs × 6 engines = 270 runs a month is too heavy for a solo author | **YES, reduced and manual only.** Drop the tracker PR |
| ai-13 | Consistent identity: sameAs and ISBN | OK | **Weak.** The lens says so itself, and Google says no special schema is needed | **YES.** Identity layer, sameAs and ISBN/ASIN identifiers already shipped (`b7a0f8a6`, `ea9c7231`, PR #50) | Hygiene only | **NO.** The missing ISBN is a data bug for another PR, not a tactic |