# What was already done — effort diagnosis for mayaallan.com (2026-09-24)

**Lens:** prior efforts (tactic ids `prior-*`). **Question:** where did the work go, and why has it produced zero leads?
**Sources:** LIVE GitHub metadata of `mallan67/mayaallan` (commits, PRs, issues, branches, deployments, workflow runs: titles, bodies, dates, sizes; **no source files read**) and LIVE `GET` requests to `https://www.mayaallan.com`. Everything was read on 2026-09-24 between 18:21Z and 18:34Z. Each source has its own read time in the table at the end. Nothing here comes from a local checkout, a handoff file, a cache or memory.
**Definition of a lead (owner, 2026-09-24):** someone who gives contact details or buys, such as a newsletter signup, contact/inquiry, book purchase, event registration, or a tool user who leaves an email.

---

## Verdict

Zero leads is the result you would expect from where the effort went. Seven findings, each from the live record:

1. **No one was ever sent to the site.** No PR and no commit carried out distribution: no outreach, partnerships, guest posts, community posting, podcast pitching, email campaigns or ads. The distribution work that exists falls into two groups. The first is 19 commits of share buttons and OG images (Jan–Feb, May), which only work once visitors already exist. The second is 4 planning documents from 2026-04-20 (Substack drafts, a Medium cross-post script, Goodreads/BookBub setup steps, and a 60-second reel script). Neither GitHub nor the live site shows that any of those plans were carried out.
2. **The build took the effort.** Across 47 merged PRs, 52,353 lines changed. Of those, **63.4% were engineering hygiene, refactors and CI**, and **19.1% were security, payments and AI safety**, for a total of **82.5%**. Lead capture was 6.2%. **Distribution was 0%.**
3. **Last 30 days (2026-08-25 → 2026-09-24):** 13 PRs were merged, **all on 2026-09-05/06**, totalling 10,202 changed lines:
   - **63.9%** quality gates, lint ratchet, runtime fixes and docs cleanup (#47, #48, #55, #56)
   - **12.3%** refinement of the AEO tracker, which is a measurement tool (#46)
   - **10.0%** a further rewrite of author identity and claims copy (#50, #51, #53, #54). This copy had already been rewritten in #37, #40 and #43.
   - **3.3%** lead work (#49). It made the existing subscribe endpoint more reliable. It did not bring more signups.

   Then **nothing shipped for 18 days.** The last production deployment was 2026-09-06T15:24Z at `ed7461a`, which is still `main` HEAD.
4. **The site cannot count its own visitors.** PR #57 ("count every visitor, and show where they came from") has passed its checks and been mergeable since 2026-09-07, and it is **still open after 17 days**. Its description says two things: Vercel Web Analytics is **disabled at the project level**, and the analytics component loaded only after a visitor accepted cookies. Part of "zero results" is therefore zero measurement: today nobody can say how many people visited, or where they came from.
5. **The site rarely asks for contact details.** There is **one** email form, on the homepage only, and it offers nothing in return ("Honest reflections … Expect 1–2 emails per month").
   - The HTML of every blog post, the scenario page, the FAQ, the book page and all four tool pages contains **zero email inputs**.
   - The subscriber **welcome email was deliberately disabled** in PR #42 (2026-07-16), and #49 kept it disabled.
   - A free-tool user can leave an email only by **paying $9.99** for a PDF after 7 chat turns, or with a promo code that no page shows.
6. **There is little to find.**
   - 38 URLs in the sitemap, 10 of them translations and 4 legal pages.
   - **5 blog posts, all dated 2026-04-19.** Nothing new in 5 months; the later work only rewrote existing copy.
   - **1 of the book's 40 scenarios** is published.
   - **0 events** ("No events are currently scheduled").
   - **1 media item.**
   - The homepage labels the four live tools **"In Development"**.
7. **There is no off-site presence to borrow traffic from.** The live Person `sameAs` and `llms.txt` list exactly one profile, Instagram.

The owner describes this as "one month in", but the repository was created on **2025-12-25**. In 9 months, the only work that could bring people in without a separate distribution step is the content and the SEO/AEO work: 5 posts, 1 scenario, the FAQ, the glossary, `llms.txt`, and translations. That work is small, and PR #45 says Search Console reported two of those pages as *"Crawled – currently not indexed"* (2026-09-05).

---

## 1. Inventory

### 1a. Commits on `main` since 2026-01-01: 344

**Method:** each commit subject was classified with keyword rules, then about 60 commits were reassigned by hand after reading them. Counts are accurate to about ±5 per bucket. **303 of the 344 commits went straight to `main` without a PR.** The PR workflow started on 2026-05-13.

| Bucket | Commits | What it was |
|---|---:|---|
| Engineering hygiene / refactors / DB / admin / CI / handoff docs | 101 | Prisma→Supabase migration, "Update page.tsx" edits made in the browser, table-casing fixes, debug logging, admin nav editor, monitoring, lint |
| Security / payments / legal / AI safety | 67 | PayPal (capture, webhooks, idempotency, amount checks), Stripe added then removed, Lemon Squeezy added then removed, admin auth, CSRF, rate limits, privacy/consent, crisis layer |
| AI tools (prompts, chat UX) | 46 | Belief Audit→Belief Inquiry, Nervous System Reset, Integration Reflection, prompt rewrites (May 11–12), journal workspace |
| UI / design polish | 26 | Feb 27 redesign (19 commits in one day: hero photo shapes, gradients, mobile offsets) |
| SEO / AEO plumbing | 20 | canonicals, sitemap, JSON-LD, `llms.txt`, glossary DefinedTermSet, FAQ "AI-citation optimized", slug migration, IndexNow |
| Share buttons / OG images (passive) | 19 | 10 share networks, 8 rounds of "make OG text bolder" |
| Analytics / measurement | 15 | Vercel Analytics (Apr 20), marketing attribution (PR E), AEO tracker (10 commits on May 19 + #46) |
| New content | 15 | 5 blog posts + blog template (Apr 20), /methods, 1 scenario (via #45), book-review notes |
| Lead capture | 14 | newsletter/contact fixes (Jan), paid $9.99 session-PDF export flow (Apr–May), promo codes (May 11), Resend contacts (#42), subscribe reliability (#49) |
| Claims / positioning rewrites | 11 | "one non-clinical author/educator identity" (Jul 13–15, Sep 5–6), FAQ sanitising, BOOK-METADATA |
| Merge commits | 6 | — |
| Distribution plans (docs only) | 4 | 2026-04-20: Substack drafts + distribution guide, Medium script, Goodreads/BookBub steps, reel script |

### 1b. By month (commits on `main`)

| Month | Total | Where it went |
|---|---:|---|
| 2026-01 | 99 | eng 74, share/OG 11, UI 5, security 4, lead 2 (newsletter/contact fix) |
| 2026-02 | 48 | UI 19, AI tools 14, share/OG 7, security 5, SEO 2 |
| 2026-03 | 0 | — |
| 2026-04 | 57 | AI tools 21, content 10, security/payments 8, lead 5 (paid PDF export), analytics 4, distribution *plans* 4 |
| 2026-05 | 82 | security/payments 39, eng 12, analytics 10 (AEO tracker), AI tools 7, lead 5, SEO 5 |
| 2026-06 | 6 | security 5, eng 1 |
| 2026-07 | 39 | SEO 10, claims 6, security 6, eng 6, AI tools 4 |
| 2026-08 | 0 | — |
| 2026-09 | 13 | eng 4, claims 4, SEO 2, lead 1, analytics 1, content 1 (all on Sep 5–6) |

### 1c. Merged PRs by bucket (additions + deletions)

| Bucket | All 47 merged PRs | Share | Last 30 days (13 PRs) | Share |
|---|---|---:|---|---:|
| Engineering hygiene / CI / refactor | 18 PRs, 33,188 lines | 63.4% | 4 PRs, 6,517 | 63.9% |
| Security / payments / AI safety | 13 PRs, 10,020 | 19.1% | 0 | 0% |
| Lead capture | 4 PRs (#5, #18, #42, #49), 3,243 | 6.2% | 1 PR (#49), 332 | 3.3% |
| Analytics / measurement | 2 PRs (#12, #46), 3,048 | 5.8% | 1 PR (#46), 1,259 | 12.3% |
| Claims / positioning | 6 PRs, 1,424 | 2.7% | 4 PRs, 1,016 | 10.0% |
| SEO plumbing | 3 PRs (#35, #43, #52), 1,065 | 2.0% | 2 PRs, 713 | 7.0% |
| New content | 1 PR (#45), 365 | 0.7% | 1 PR, 365 | 3.6% |
| **Distribution** | **0** | **0%** | **0** | **0%** |

Line counts are inflated by deletions such as #1 (−10,029, Prisma removal) and #31 (−6,979, dead code), and by the generated lint baseline in #48/#56. The ranking does not change without them.

---

## 2. What shipped vs what never merged

**Production** = `main` HEAD `ed7461a`, deployed 2026-09-06T15:24:25Z. No production deployment since then.

| Item | State | Age on 2026-09-24 | Serves leads? |
|---|---|---|---|
| **PR #57** feat(analytics): count every visitor, show where they came from (+781/−91, 14 files) | **OPEN**, mergeable, checks green | **17 days** (opened 2026-09-07) | **Indirectly, as a prerequisite.** Without it no lead or traffic change can be measured |
| PR #58 docs(ops): continuous handoff (draft) | OPEN, draft | 0 days | No |
| PR #39 move tables off exposed public schema (+3,262/−1,408) | closed unmerged 2026-07-15 ("WIP — do not merge") | abandoned | No |
| PR #4 unify direct + retailer buying by format | closed unmerged 2026-05-13 (#5 shipped a smaller version) | — | Yes (purchase clarity), partly shipped via #5 |
| PR #19 admin password fallback hotfix, PR #33 admin layout split | closed unmerged (superseded by #34 and later work) | — | No |
| Branch `audiobook-approved-manifest` (15 ahead / 15 behind `main`, no PR) | diverged, last commit 2026-07-21 | 65 days | No |
| Branch `ops-2026-05-20-cleanup` (1 ahead / 70 behind) | stale | 4 months | No |
| 28 other branches whose PRs merged or were superseded | stale, not deleted | — | No |

**Issues:** 5 in total, all closed. Two deploy-failure alerts (#13, #38) stayed open for 110 and 53 days before being closed as "historical" on 2026-09-06. Health check #14 (503) was fixed the same day (2026-05-21). No issue was ever opened for traffic, leads, content or distribution.

---

## 3. Measurement-only vs things that could bring people

| Measurement-only (brings nobody) | Shipped | Live status |
|---|---|---|
| Vercel Web Analytics | 2026-04-20 (`ff0028c`) | Gated behind cookie consent (2026-05-21) and reported disabled at project level (PR #57 body, 2026-09-07; PR #58 body, 2026-09-24). Fix in #57, unmerged |
| Marketing attribution + admin conversion dashboard (PR E, #12, 1,789 lines) | 2026-05-13 | Records only visitors who consent (#57 body); nothing read the landing/referrer data back until #57 |
| AEO tracker: cron that asks Perplexity/Claude/OpenAI/Gemini about the author (10 commits on 2026-05-19, PR #46 1,259 lines on 2026-09-05) | yes | Measures whether LLM answers mention or cite the site. It creates no visits. #46 itself had to fix it because it had counted brand mentions as "citations" |
| SessionFeedback emoji, prompt eval script, health check (94 runs in the latest API page), deploy-notify, alertAdmin | Apr–May | Operational monitoring of a site whose visitors are not counted |

| Could bring people (but has no distribution loop) | Shipped | Live status (GET 2026-09-24) |
|---|---|---|
| Blog (5 posts) | 2026-04-20 | All 5 dated 2026-04-19; none newer |
| Scenarios (template for the book's 40 scenarios) | 2026-05-19 template; 1 page (#45, 2026-09-05) | 1 of 40 published |
| FAQ (20 Q&As) + Glossary (25 terms) + `llms.txt` / `llms-full.txt` | 2026-05-19, then rewritten 2026-07-13 and 2026-09-06 | Live (200), no email capture |
| 4 free AI tools (Belief Inquiry, Nervous System Reset, Integration Reflection, Integration Journal) | Feb–Jul | Live; homepage section still labelled "In Development" |
| Translations (es, pt, de, fr, he) | 2026-05-19 | 10 sitemap URLs. #43 says the strings are machine-authored and not checked by a native speaker; #35 says they route users into English-only flows |
| Events, Media | Jan | /events: "No events are currently scheduled"; /media: 1 image |

---

## 4. Distribution work: the complete list

| Date | Item | Executed? |
|---|---|---|
| 2026-01-22 → 02-02 | Share buttons for 10 networks; 11 OG-image commits | Passive; needs existing visitors |
| 2026-04-20 `47365fe` | "3 research-backed Substack drafts + distribution guide" | **No evidence.** The same topics appear only as on-site posts dated 04-19. The site declares no Substack profile |
| 2026-04-20 `91c8f5d` | Medium cross-posting API helper + CLI script | **No evidence** it was ever run; the site declares no Medium profile |
| 2026-04-20 `1573f92` | Goodreads / BookBub / Open Library / LibraryThing author-profile setup steps | Only the Goodreads *book* listing appears in `llms.txt`; no author profiles are declared in `sameAs` |
| 2026-04-20 `0386fd0` | 7 pull quotes, back-cover copy, 60-second reel script | **No evidence** of a published reel; Instagram is the only declared profile |
| 2026-05-11 `339b7a3` | Promo codes for a free session PDF, "for book-back-cover / cross-promo … Amazon book descriptions" | **No evidence** that any code was distributed. #53 (2026-09-06) records KDP guidance that descriptions carry no URLs or promotions, which conflicts with the Amazon-description plan |

Outreach, partnerships, podcast pitching, community posting, newsletter sends (no broadcast is visible), paid ads, and review/ARC campaigns: **none anywhere in the repository record.**

---

## 5. Lead capture: the complete list

| Mechanism | Shipped | Live (GET 2026-09-24) | Gap |
|---|---|---|---|
| Newsletter form | 2026-01 (fixed 01-23), Resend contacts 07-16 (#42), reliability 09-05 (#49) | **Homepage only**: "Stay Connected … 1–2 emails per month" | No offer or lead magnet. **Welcome email disabled (#42), and #49 kept it that way.** No form on any content, book or tool page (0 email inputs) |
| Contact form | 2026-01-23 | /contact has 1 email input | Positioned for "press, collaborations, or reader inquiries" (#50); nothing points readers to it |
| Ebook purchase (PayPal, $9.99) | 2026-01, hardened May–Jul | Book page: "Buy Ebook with PayPal · $9.99" + retailer links | Heavily engineered (PRs #5–#9, #30, #41). The problem is traffic, not checkout |
| Paid session-PDF export ($9.99) | 2026-04-20; CTA moved back to 7 turns on 2026-05-11 | Chat tools (client-side) | The **only** way a tool user leaves an email, and it costs $9.99 |
| Promo-code free PDF (email collected) | 2026-05-11 | Hidden; no page shows a code | Built with no way for people to find a code |
| Event registration | — | No events | Never built or used |
| Lead magnet (free chapter, scenario pack, checklist) | **never built** | `/free`, `/sample`, `/newsletter`, `/lead-magnet` → 404; no email input on the book page | — |

---

## 6. Live-site cross-check (are shipped features visible?)

| Check (GET, 2026-09-24) | Result |
|---|---|
| Routes `/`, `/books`, `/blog`, `/scenarios`, `/events`, `/media`, `/about`, `/contact`, `/faq`, `/glossary`, `/methods`, 4 tool pages, `/practices`, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml`, `/es` | all **200** (18:28:05Z) |
| Homepage H1 / title | "Maya Allan, author of the Psilocybin Integration Guide" (from #43) ✔ |
| Homepage newsletter | present; no incentive; tools section eyebrow "In Development" |
| Book page | ebook PayPal button, 4 formats with prices, Integration tool cross-link ("Free to use. Save a session as a PDF for $9.99"), "Related reading" to the 2 test pages (#45) ✔; **no sample and no email capture** |
| Email inputs per page | `/contact` 1; homepage 1; `/blog/psilocybin-integration-research`, `/scenarios/ego-dissolution`, `/faq`, tools ×4, `/es` → **0** |
| Sitemap | 38 URLs: blog 6 (index + 5), scenarios 2 (index + 1), 10 locale URLs, legal 4 |
| Blog listing | 5 posts, all "April 19, 2026" |
| Events / Media | "No events are currently scheduled" / 1 item ("Mushroom Healing") |
| Person `sameAs` (/about) and `llms.txt` profiles | only `instagram.com/maya.allan66` |
| Analytics in server HTML | no analytics script tag in homepage HTML; loads client-side only after consent (matches #57's description). The project-level Vercel setting was **not** read in this lens |

---

## 7. Why "one month, zero leads" happened, in terms of where the effort went

1. **Supply without demand.** Most of the work produced a hardened, audited, lint-ratcheted site. None of it created a reason or a route for a stranger to arrive. With 0% of PR effort on distribution, the site has depended entirely on organic discovery for a small site of about 25 indexable English pages, whose own indexing test says Google is not indexing its pages.
2. **Rework loops instead of new surface.** The same identity and claims copy went through 7 passes (#37, #40, #43, #50, #51, #53, #54). Payments had processors added and removed three times (Stripe → Lemon Squeezy → PayPal, Stripe back, Stripe removed). The AEO tracker was rebuilt to fix its own metric. Each loop felt like progress, and none of them added a page, a visitor or a signup.
3. **Measurement was built, but pointed the wrong way.** A marketing-attribution system, an AEO tracker and a health monitor all exist, but the basic page-view count is off. The one PR that fixes it (#57) has waited 17 days for a merge click and a dashboard toggle.
4. **The funnel has no mouth.** Even a visitor who arrives meets one homepage-only form with no offer and no welcome email. Search-landing pages (blog, scenario, FAQ, glossary) and the tools, the site's most distinctive asset, ask for no email unless the visitor pays.
5. **Work stopped in the window the owner is judging.** All merges in the last 30 days happened in a 30-hour burst on Sep 5–6, and nothing reached production afterwards.

---

## 8. Stop doing / never repeat

| id | Stop | Evidence |
|---|---|---|
| prior-stop-hygiene-first | Engineering hygiene, audits, lint ratchets, refactors and "remediation batches" ahead of any lead work | 63.9% of the last 30 days' PR lines; 63.4% all-time; 18 of 47 merged PRs |
| prior-stop-copy-rewrites | Another pass on author identity, claims or FAQ wording | 7 PRs rewrote the same positioning (#37, #40, #43, #50, #51, #53, #54) |
| prior-stop-aeo-tooling | New features or refinements for the AEO tracker and dashboards | 10 commits on 2026-05-19 plus #46 (1,259 lines); it measures LLM mentions and brings no visitors |
| prior-stop-plans-without-execution | Writing distribution guides, drafts and setup-step documents that no one executes | 4 documents on 2026-04-20; no visible execution 5 months later |
| prior-stop-processor-churn | Switching or adding payment processors or checkout architectures | Stripe → Lemon Squeezy → PayPal → Stripe → no Stripe (Jan–May), about 40 commits and PRs #6/#7/#9/#16/#30/#41 |
| prior-stop-side-projects | Resuming the audiobook review branch, the #39 schema migration or more machine translations before leads exist | Diverged branch (65 days), abandoned 3,262-line WIP, 5 unvalidated locales |
| prior-stop-direct-to-main | Browser "Update page.tsx"-style commits pushed straight to `main` | 303 of 344 commits bypassed PRs, so there is no record of intent or measurement |

## 9. Unfinished work worth finishing, only because it directly serves leads

| id | Finish | Why (evidence) | Size |
|---|---|---|---|
| prior-finish-pr57-analytics | Merge #57 and enable Web Analytics in Vercel | Without it no lead or traffic change can be measured. #57 is green and mergeable | S, owner |
| prior-finish-welcome-magnet | Turn the disabled welcome email back on and use it to deliver a lead magnet (for example 3 book scenarios as a PDF); name that offer on the form | #42 disabled the welcome email; the homepage form offers nothing | M, code + content |
| prior-finish-capture-everywhere | Put the existing `NewsletterSection` with that offer on the blog, scenario, FAQ, glossary, book and tool pages | 0 email inputs on every page a searcher lands on | S–M, code |
| prior-finish-tools-free-email | Let tool users email themselves a free short summary, with a newsletter opt-in; keep the $9.99 PDF as the upgrade | The only tool email capture today is behind $9.99 after 7 turns | M, code (owner decides pricing) |
| prior-finish-promo-in-book | Put the already-built promo code (and URL) in the ebook/print back matter, not the Amazon description | Code redemption has existed since 2026-05-11 and nobody is shown a code; #53's KDP guidance rules out descriptions | S, owner |
| prior-finish-scenarios | Publish more of the 40 scenarios, **after** capture is on the template, in batches with an indexing check | 1 of 40 live; template exists; the #45 test result is unknown | L, content |
| prior-finish-hide-empty | Remove the "In Development" label from live tools; hide the empty Events and one-item Media pages from the main nav until they have content | Visible on the live homepage and nav | S, code |

---

## 10. Not verified here (do not treat as fact)

- **Vercel project Analytics setting.** Taken from the bodies of PR #57 (2026-09-07) and PR #58 (2026-09-24). This lens did not read Vercel directly.
- **Search Console state.** PR #45 (2026-09-05) says two pages were "Crawled – currently not indexed". The current state and the test's outcome are unknown.
- **Off-site execution of the April plans** (Substack, Medium, Goodreads author profile, BookBub, reel). This session's WebSearch budget was used up, so no search was possible. The only negative evidence is the live site declaring Instagram alone.
- **Promo-code distribution**, and whether the book's back matter already carries a URL or code.
- **Actual subscriber, order or contact counts** (database not accessible in this lens). "Zero leads" is the owner's statement.
- **Bucket counts** come from commit subjects plus manual overrides, accurate to about ±5 per bucket. PR line shares come from GitHub's additions/deletions.

---

## Sources

All GitHub sources are live API reads of `mallan67/mayaallan`. "Published" is the item's own date on GitHub; live pages have no publication date unless shown.

| Source | Published / updated | Read (UTC) |
|---|---|---|
| https://api.github.com/repos/mallan67/mayaallan (created 2025-12-25, pushed 2026-09-24T18:16:16Z) | live | 2026-09-24T18:21:33Z |
| https://api.github.com/repos/mallan67/mayaallan/commits?sha=main&since=2026-01-01 (344 commits, paginated) | 2026-01-01 → 2026-09-06 | 2026-09-24T18:21:41Z–18:25:16Z, 18:30:19Z |
| https://api.github.com/repos/mallan67/mayaallan/pulls?state=all (53 PRs) + each PR's size | 2026-01-22 → 2026-09-24 | 2026-09-24T18:22:16Z, 18:25:26Z, 18:29:25Z |
| https://github.com/mallan67/mayaallan/pull/57 (body: analytics disabled; consent-gated) | opened 2026-09-07, updated 2026-09-07T03:49Z | 2026-09-24T18:22:30Z |
| https://github.com/mallan67/mayaallan/pull/58 | 2026-09-24 | 2026-09-24T18:22:30Z |
| https://github.com/mallan67/mayaallan/pull/12 (PR E attribution) | merged 2026-05-13 | 2026-09-24T18:22:38Z |
| https://github.com/mallan67/mayaallan/pull/42 (Resend; welcome email disabled) | merged 2026-07-16 | 2026-09-24T18:22:38Z, 18:32:10Z |
| https://github.com/mallan67/mayaallan/pull/45 (indexing test; "Crawled – currently not indexed") | merged 2026-09-05 | 2026-09-24T18:22:38Z |
| https://github.com/mallan67/mayaallan/pull/43, /pull/46, /pull/35 | merged 2026-09-05, 2026-09-05, 2026-07-12 | 2026-09-24T18:22:46Z |
| https://github.com/mallan67/mayaallan/pull/37, /pull/49, /pull/50; unmerged /pull/4, /19, /33, /39 | 2026-05-13 → 2026-09-06 | 2026-09-24T18:22:57Z |
| https://github.com/mallan67/mayaallan/pull/53, /pull/27, /pull/18 (promo/KDP context) | 2026-05-21 → 2026-09-06 | 2026-09-24T18:33:13Z |
| https://api.github.com/repos/mallan67/mayaallan/issues?state=all (#13, #14, #32, #38, #44) + comments | 2026-05-19 → 2026-09-06 | 2026-09-24T18:22:23Z, 18:30:19Z |
| https://api.github.com/repos/mallan67/mayaallan/branches + compare main...branch | live | 2026-09-24T18:23:10Z, 18:23:45Z |
| https://api.github.com/repos/mallan67/mayaallan/actions/workflows + runs | live | 2026-09-24T18:26:43Z |
| https://api.github.com/repos/mallan67/mayaallan/deployments?environment=Production (latest 2026-09-06T15:24:25Z, `ed7461a`) | live | 2026-09-24T18:26:54Z |
| https://www.mayaallan.com/ (text, forms, CTAs) | live | 2026-09-24T18:27:09Z–18:27:31Z |
| https://www.mayaallan.com/books/psilocybin-integration-guide | live | 2026-09-24T18:27:41Z–18:27:56Z |
| 25 route status checks on https://www.mayaallan.com | live | 2026-09-24T18:28:05Z |
| https://www.mayaallan.com/sitemap.xml (38 URLs) | live | 2026-09-24T18:28:26Z |
| https://www.mayaallan.com/blog, /events, /media, /scenarios | posts dated 2026-04-19 | 2026-09-24T18:28:36Z |
| Email-input scan of 8 pages on https://www.mayaallan.com | live | 2026-09-24T18:28:45Z |
| https://www.mayaallan.com/about (Person `sameAs`) and /llms.txt | live | 2026-09-24T18:30:37Z |
| https://www.mayaallan.com/media (item list) | live | 2026-09-24T18:30:53Z |