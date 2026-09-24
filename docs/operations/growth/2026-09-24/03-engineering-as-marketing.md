# Engineering-as-marketing for mayaallan.com: what practitioners built and measured (2025-2026)

- **Lens:** what top engineers and growth teams build to get leads: free tools, gated vs ungated results, programmatic pages, answer pages, widgets, PDF generators, email courses, building in public. Tactic ids use the prefix `eam-`.
- **Written:** 2026-09-24 by a Claude research agent for Maya Allan. Branch `work/site-visibility`, repo `mallan67/mayaallan`.
- **Live sources and read times:** every source was fetched live on 2026-09-24 between 18:21Z and 18:35Z. The sources table (section 7) gives each URL, its publication date and a per-URL HTTP 200 re-check time. No local files, caches or earlier reports were used.
- **What counts as a lead** (owner definition): a newsletter signup, a contact or inquiry, a book purchase, an event registration, or a tool user who leaves an email.
- **Limit of this research:** the session's web-search budget ran out partway through. Everything after that point was fetched directly from known URLs, and some areas are thin (section 6). Vendor and agency numbers are labelled **[vendor]**.

---

## 0. Bottom line

1. **The site's free tools cannot produce leads, by design.** On the live site, all four tools say "Free. No signup" or "No email required". None of the three AI tools has an email field, and none of their server-rendered pages links to the book. The only email capture on the site is a generic newsletter box on the homepage, plus the contact form. So "zero leads in a month" is what the current setup would produce whatever the traffic. This is the first thing to fix (**eam-01, eam-02, eam-03, eam-07**).
2. **Nothing is being measured.** PR #57, open and unmerged, says in its live body: "The site currently measures **nothing**", and Vercel Web Analytics is disabled. Every tactic below needs **eam-00** first, or its result can't be judged.
3. **Practitioners in 2025-2026 put the email ask after the value, not in front of the tool.** HubSpot's own newest free tool (AI Search Grader) shows results with "no account required" and puts the offer after them. Quiz vendors report that 34-45% of people who start a quiz become leads when a personalised result comes with an email step **[vendor]**.
4. **Programmatic pages carry a live penalty risk and only work on first-party material.** Google has run four spam updates in 2026, and the latest started today (2026-09-24). HubSpot's 141 generated pages worked because each was built on HubSpot's own case-study library. For this site, the book's 40 scenarios are the first-party dataset. Publish them in small batches with an indexing check between batches, never all at once (**eam-04**).
5. **Answer pages now earn citations and mentions more than clicks.** When an AI summary appears, clicks fall to 8% (Pew) and position-1 CTR drops 58% (Ahrefs). But visitors who do arrive from AI search convert far better: 23x in Ahrefs' own data, and about 10% of new Vercel signups came from ChatGPT. Each answer should lead into a tool and a capture offer (**eam-05**). Off-site mentions correlate with AI visibility about three times as strongly as backlinks do (**eam-06**).

---

## 1. Live state of this site's lead-generating assets

| Asset (live URL) | What it does today | Lead capture today | Source, read (UTC) |
|---|---|---|---|
| `/belief-inquiry` | AI-guided self-inquiry; meta: "Free. No signup." | none (1 textarea, 0 forms, no `/books` link in SSR HTML) | GET www.mayaallan.com, 2026-09-24T18:24:41Z / 18:35:02Z |
| `/nervous-system-reset` | AI-guided somatic tool; "No signup required" | none; no `/books` link | same |
| `/integration-reflection` | AI-guided reflection tool | none; no `/books` link | same |
| `/integration-journal` | Server-side PDF generator, 4 phase variants, 7-day prompts | explicitly "Download free PDF · No email required"; links to the book | same |
| `/scenarios` | Index describes the book's "40 real scenarios"; **1** scenario page live (`/scenarios/ego-dissolution`) | none | 18:24:54Z |
| `/glossary` | ~24 terms on one page, `DefinedTermSet` JSON-LD | none | 18:24:55Z |
| `/` | Newsletter "Stay Connected… 1-2 emails per month" | **the only newsletter form** | 18:25:06Z |
| `/books/psilocybin-integration-guide` | Ebook direct via PayPal "$9.99" + retailers | purchase only; no email offer | 18:35:02Z |
| `sitemap.xml` | 38 URLs in total | n/a | 18:24:26Z |
| `robots.txt` | GPTBot, OAI-SearchBot, ClaudeBot and others allowed; `/download/` disallowed | n/a | 18:31:08Z |
| psilowire.com, psilocybinintegrationguide.com | both 308 to the homepage | n/a | 18:31:19Z |

GitHub, live (`gh api`, 18:23:51Z-18:24:00Z): the 58 PRs so far are mostly hardening, payments, safety, SEO/schema hygiene and AEO tracking. None of them added lead capture to the tools. PR #45 shows two pages were "Crawled, currently not indexed" before they were rewritten. PR #57 (analytics) is open and unmerged. **So far the site has had technical fixes but no lead-capture engineering, and the tactics below do not repeat that earlier work.**

---

## 2. What the 2025-2026 evidence says, topic by topic

### 2.1 Free interactive tools as lead and link magnets
- **HubSpot AI Search Grader** (live page, read 18:32Z): "Free One-Time AEO Brand Check, **No Account Required**". It takes company, location, industry and product, then shows the report, then offers "HubSpot AEO is what comes next" (demo or free trial). This is the current pattern from the company that made free graders famous: value first, offer second.
- **HubSpot Website Grader** still pulls "around 65,000 visits per month" 18 years after launch (Growth Method, 2026-02-13). Free tools keep compounding.
- **Tally** went from "$2M to $3M ARR in just four months" with AI search (ChatGPT and Perplexity) as its main acquisition channel, as reported by Vercel (2025-06-10). Tally is a product with a generous free tier, so this is product-led rather than a standalone tool.
- Claims with **no sourcing** that you will see repeated: "tool→signup 2-5% is typical" (BoilerplateHub, 2026-06-01, no source) and "interactive content gets 2x leads" (calculator-builder vendors). **Do not plan on these.**

### 2.2 Gate the result behind an email, or not?
- **Interact** [vendor], updated 2026-09-08, 100M+ leads: start-to-lead **40.1%**, start-to-finish 65%, **coaching/courses 44.9%**. The report notes that individual quizzes range from 0% to over 80%.
- **Riddle** [vendor], 2025 report on 3.13B answers: quiz opt-in **41.4% vs ~1.9%** for a standard pop-up. In a Riddle Lab A/B test, a **mandatory** form reached "34.25% completion versus 24.07% for the skippable version". "Lead quality was identical", but "hesitant users dropped out".
- **What this means for this site:** a gate raises capture but loses the hesitant. These are AI tools on a sensitive mental-health-adjacent topic, and a crisis-safety layer ships with them (PR #36). So **do not gate access to the tool.** Offer to email something the user wants to keep, such as their summary or a 7-day follow-up, **after** the tool has helped them. The PDF journal is the one place where a gated variant is worth an A/B test, and that test is Maya's decision (eam-02).

### 2.3 Programmatic pages from a structured dataset, and when they backfire
- **Policy (primary):** Google's spam policies were last updated 2026-08-28. They define **scaled content abuse** as "many pages … generated for the primary purpose of manipulating search rankings and not helping users", including "using generative AI tools … to generate many pages without adding value". **Doorway abuse** includes "pages targeted at specific regions or cities that funnel users to one page". The policies were introduced on 2024-03-05 ("What web creators should know about our March 2024 core update and new spam policies"). Google's gen-AI guidance (updated 2025-12-10) repeats that generating many pages with AI "without adding value for users may violate" the policy.
- **Enforcement timeline (Google Search Status Dashboard, live `incidents.json`, 18:22:39Z):** December 2025 core update (Dec 11-29), **March 2026 spam** (Mar 24-25), **March 2026 core** (Mar 27-Apr 8), **May 2026 core** (May 21-Jun 2), **June 2026 spam** (Jun 24-26), **August 2026 spam** (Aug 18-21), **September 2026 spam, started 2026-09-24** ("may take up to two weeks").
- **A success, with a caveat:** HubSpot published "141 pages, each targeting a specific industry × use-case combination and **built on HubSpot's library of case studies**". AI bots crawled them heavily ("ChatGPT's bot alone racked up 15K crawls in a few weeks"), but citations "hovered around 16%" at first. Then "Ultimately, 92% were cited, increasing visibility by 49%". The lesson they drew: "Crawls happen first, then citations, then visibility" (Aja Frost via Growth Unhinged, 2026-09-16). The caveat is that HubSpot has enormous domain authority and a real proprietary dataset.
- **Vendor or agency case studies (low weight):**
  - theStacc [vendor, May 2026, updated 2026-07-10]: 512 pages for an anonymous client, 87% indexed within 90 days (73% for "integration combo" pages), and the "bottom 30% of pages produce 5% of clicks". It also claims survival of a "November 2025 helpful content refresh", **which does not appear on Google's dashboard**. Treat it as unverified.
  - Omnius [agency, 2026-08-19]: 15k+ WordPress pages for an AI-image SaaS, 67 → 2,100+ monthly signups over Mar 2024-Jan 2025. That is a different category and a pre-2026 window.
- **Bad information to ignore:** Digital Applied [agency] published "Programmatic SEO After March 2026" on **2026-03-18**, nine days **before** Google's March 2026 core update began (2026-03-27). It quotes unsourced stats such as "87% average traffic loss". An "Originality.ai study of 2,600 programmatic sites" circulates in search snippets, but no primary source was found. It is **UNVERIFIED**.
- **For this site:** only 2 scenario pages and a handful of blog posts exist, and two pages were "Crawled, currently not indexed" (PR #45). A site that can't yet get 2 pages indexed should not add 100 thin pages. Google's documentation says crawled-not-indexed pages "may or may not be indexed in the future; no need to resubmit".

### 2.4 Answer pages for long-tail questions
- **Pew** (2025-07-22; 900 adults, 68,879 searches): with an AI summary, users clicked a result in **8%** of visits versus **15%** without one, and clicked a link inside the summary in **1%**. **60%** of searches starting with who/what/when/why produced a summary, as did **53%** of searches of 10+ words.
- **Ahrefs** (2026-02-04; 300k keywords, Dec 2023 vs Dec 2025): an AI Overview correlates with a **58% lower CTR** for position 1.
- **But AI referrals convert:** at Ahrefs (2025-06-16), "0.5% of Ahrefs traffic is from AI search" yet "12.1% of signups", which is **23x**. The author warns that this may not last. At Vercel (2025-06-10), "ChatGPT now refers around 10% of new Vercel signups". Semrush [vendor] (2025-07-21) puts an AI visitor at "4.4 times as valuable" as an organic one, based on its own model.
- **Google** (John Mueller, 2025-05-21): "Focus on making unique, non-commodity content". It also says AI Overview clicks "are higher quality, where users are more likely to spend more time on the site." Google's AI-features documentation (updated 2025-12-10) adds: "no additional requirements … You don't need to create new machine readable files, AI text files, or markup".
- **Indig** (Growth Memo, 2026-07-27): AI Mode queries run "3x longer". His advice is to lead with unique or proprietary information in direct, plain writing.

### 2.5 Mentions and distribution (what makes tools and answers get cited)
- **Ahrefs** (2025-05-26; 75k brands; DR>40 sample): Spearman correlation with AI Overview visibility is **0.664 for branded web mentions** against **0.218 for backlinks** and 0.326 for DR. The authors stress that "correlation ≠ causation".
- **Profound** [vendor] (2025-06-05, updated Aug 2025; 680M citations): the top cited domains are Wikipedia at 7.8% for ChatGPT, Reddit at 6.6% for Perplexity, and Reddit 2.2% / YouTube 1.9% / Quora 1.5% for AI Overviews.
- **Vercel's tactics:** find new questions on Reddit, X, GitHub and forums, publish the definitive evidence-based answer, then share it in those same places.

### 2.6 Embeddable widgets
- **Policy:** "Keyword-rich, hidden, or low-quality links embedded in widgets that are distributed across various sites" count as link spam (Google spam policies, 2026-08-28).
- **Results evidence from 2025-2026: none found in this session. UNVERIFIED.** Low priority (eam-09).

### 2.7 Downloadable workbooks, PDF generators and email courses
- The site already has a server-side PDF generator (the Integration Journal) with no email step.
- HubSpot's blog [vendor] (2025-01-03) describes free mini-tools **replacing** e-books and PDFs as the lead magnet of choice.
- **No 2025-2026 practitioner numbers for email courses were found. UNVERIFIED.** The case for turning the journal into a 7-day email version rests on 2.2 (people exchange an email for a personalised, useful follow-up) and on the journal's 7-day structure. It is an inference, so it has to be measured.

### 2.8 Building in public
- **No 2025-2026 practitioner numbers were found within this session's budget. UNVERIFIED.** The closest verified lesson is HubSpot's "**Run your own tests** … validate a play with your own data before scaling it" (2026-09-16). This lens does not recommend it as a lead channel for now.

---

## 3. What practitioners say does NOT work anymore (with evidence)

| Stop or avoid | Evidence |
|---|---|
| **llms.txt as a growth lever** | HubSpot's first AEO experiment was a failure: no bot visits, and it was paused. A cited Ahrefs analysis found "97% of llms.txt files get zero requests" (Growth Unhinged, 2026-09-16). Google: "You don't need to create new … AI text files" (AI features doc, 2025-12-10). |
| **Mass AI-written or near-duplicate pages** (city × topic, term × modifier) | Scaled-content and doorway policies (2026-08-28); four spam updates in 2026, the latest started 2026-09-24. |
| **Counting on Google clicks from "what is…" informational queries** | Pew: 8% vs 15% click rate, 1% on cited links (2025-07-22); Ahrefs: -58% CTR (2026-02-04). |
| **Keyword-rich widget or badge links** | Google link-spam policy (2026-08-28). |
| **Book Actions structured data** | Google phased out Book Actions (announced 2025-06-12; Sept 8, 2025 update lists the removed types). |
| **Re-requesting indexing for crawled-not-indexed pages** | Google Search Console Help: "no need to resubmit this URL". |
| **Generic "join my newsletter" as the only capture** | Interact's diagnostic: "High finish rate but low lead rate" means the opt-in offer "may not feel valuable enough" [vendor]. Live site: the homepage box is the only newsletter form. (Inference: no 2025-26 A/B numbers for generic vs specific offers were found.) |
| **Trusting agency "update impact" statistics** | Digital Applied's March-2026 article was published before the update began (see 2.3). |

---

## 4. Tactics for this site

The table orders tactics by build priority, not by id. Owner: **code-pr** = a GitHub PR through `work/*`, CI, then Maya merges. **owner-account** = Maya in Vercel, GSC, social accounts. **content** = writing. **mixed** = more than one of these.

| id | Tactic | Owner | Effort | Depends on |
|---|---|---|---|---|
| eam-00 | Measure the tool → lead → purchase funnel | mixed | S | none (this is the first step) |
| eam-01 | "Keep this" email capture at the end of each AI tool | code-pr | M | eam-00 |
| eam-07 | Tool → book bridge with purchase attribution | code-pr | S | eam-00 |
| eam-03 | Contextual offers on content pages instead of generic newsletter | mixed | S | eam-00 |
| eam-02 | Integration Journal as a 7-day email version (email course) | mixed | M | eam-00 |
| eam-05 | Answer blocks written for AI citation, each leading into a tool | content | M | eam-03 |
| eam-06 | Put the tools where AI engines get their citations (mentions) | owner-account | M | eam-01 |
| eam-04 | Scenario library as quality-gated programmatic pages | mixed | L | eam-03, GSC access |
| eam-10 | Glossary: enrich and link; do not split into thin pages | code-pr | S | none |
| eam-08 | Privacy-safe share cards (not indexed result pages) | code-pr | S | eam-00 |
| eam-09 | Embeddable widget (deferred) | code-pr | M | proven demand |

### eam-00: Measure before building
- **Why:** the live body of PR #57 says the site "measures **nothing**" and that Vercel Web Analytics is disabled. Indig (2026-07-15) recommends freezing 20-50 prompts for at least 4 weeks. HubSpot's lesson is "Run your own tests" (2026-09-16).
- **Steps:**
  1. Maya reviews and merges PR #57, then enables Web Analytics (Vercel → mayaallan → Analytics → Enable).
  2. A code PR adds first-party events through the existing conversion-analytics tables from PR #12: `tool_start`, `tool_complete`, `capture_view`, `capture_submit`, `journal_pdf_download`, `book_view`, `checkout_start`, `purchase`, each with `tool`/`page` and `ref`.
  3. Add an optional "Where did you hear about me?" select to the subscribe and contact forms.
  4. Keep the AEO tracker's prompt set frozen for 4 weeks.
- **Measure:** an `/admin/analytics` funnel per tool per week. **Expected impact:** none on its own, but without it no other tactic can be judged.

### eam-01: "Keep this" capture at the end of each AI tool
- **Why:** quiz vendors report 40.1% start-to-lead overall, 44.9% for coaching/courses, and 41.4% vs 1.9% for pop-ups **[vendor]**. In Riddle's A/B test, a mandatory form beat a skippable one (34.25% vs 24.07%) at the same lead quality **[vendor]**. HubSpot's 2025-26 tool shows its result with no account and then makes an offer (live page).
- **Steps:**
  1. At each tool's closing step (belief inquiry, nervous-system reset, integration reflection), show a card: *"Keep this: email me a copy of this reflection and three short follow-up prompts over the next week."* It has one email field and a **separate, unchecked** newsletter consent.
  2. A server action sends one email through Resend (integrated in PR #42) with the user's summary and schedules three follow-ups. **Store only** the email, tool slug, consent flags and timestamp. **Do not persist the conversation text.**
  3. The tool stays usable with no email, and the crisis layer (PR #36) runs first.
  4. Update the privacy page. Get a legal check on "consumer health data" rules before launch: Washington's My Health My Data Act covers mental-health data and data inferred from non-health data, and gives a private right of action (WA AG). This is flagged for review, not a legal conclusion.
- **Expected impact:** leads = tool completions × capture rate. Vendor benchmarks (34-45%) are for **gated** quizzes. For an **optional** offer after a sensitive AI conversation, plan on **10-20% of completions**. That figure is an inference and **UNVERIFIED** until 4 weeks of data exist. Baseline completions are unknown because analytics are off.
- **Measure:** `capture_submit / tool_complete` per tool, unsubscribe rate, and the Day-3 email click rate.

### eam-07: Tool → book bridge
- **Why:** HubSpot's tool ends with "Your grade is a starting point. HubSpot AEO is what comes next" (live). On the live site, the three AI tool pages have no `/books` link in their server-rendered HTML (18:35:02Z), and the ebook is $9.99 direct.
- **Steps:**
  1. At tool completion, show the **one** most relevant book scenario or chapter title, with the line "Read how the book handles this, instant PDF, $9.99".
  2. Link to `/books/psilocybin-integration-guide?ref=tool-<slug>` and carry `ref` into the checkout attribution.
  3. The follow-up emails from eam-01 include the same link on Day 3.
- **Measure:** `tool_complete → book_view → checkout_start → purchase`, filtered by `ref`.

### eam-03: Contextual offers instead of a generic newsletter
- **Why:** on the live site, no email field exists on `/scenarios/ego-dissolution`, `/blog/psilocybin-integration-research` or the book page. The homepage box promises only "1-2 emails per month". Interact's diagnostic above applies **[vendor]**.
- **Steps:** build one `<ContextualOffer>` component with a per-template offer:
  - scenario page: "the one-page *If this happens* card for this scenario (PDF)"
  - research article: "the reading list plus a note when new trials publish"
  - glossary and FAQ: "the 7-day journal by email" (eam-02)
  - book page: a free sample scenario. Maya decides what to give away.

  Each offer uses the same Resend path as eam-01.
- **Measure:** `capture_submit / page_view` per template, and which offer wins.

### eam-02: Integration Journal as a 7-day email version
- **Why:** the generator already exists and is 7 days long (live). Free tools have replaced PDFs as the default magnet (HubSpot blog, 2025-01-03) **[vendor]**. Riddle's gated-vs-skippable result applies **[vendor]**. Evidence specific to email courses is **UNVERIFIED**.
- **Steps:**
  1. Keep "Download free PDF · No email required" exactly as it is.
  2. Add a second button: "Or get it as 7 mornings of prompts by email".
  3. The sequence: Day 0 is a signed PDF link (the existing `/download` route), Days 1-7 each bring one prompt adapted from the book, and Day 8 brings the book and events.
  4. Optional, and only if Maya approves: an A/B test through Vercel Flags of an email-required PDF. The page copy must change honestly if that variant runs.
- **Measure:** email-version signups divided by PDF downloads; Day-7 completion; purchases with `ref=journal-email`.

### eam-05: Answer blocks written for AI citation, each leading into a tool
- **Why:** question and long queries trigger AI summaries 53-60% of the time, and clicks fall to 8% (Pew). AI-referred visitors convert 23x at Ahrefs, and ChatGPT brings about 10% of new Vercel signups. Google asks for "unique, non-commodity content" (2025-05-21).
- **Steps:**
  1. Collect real questions from community threads and from the AEO tracker prompts.
  2. For each question: a 2-3 sentence direct answer, then **Maya's own framework from the book** (the proprietary part), then sources to the PR #45 standard, then a **tool entry point** ("try the 5-minute reset now"). The tool is the part an AI answer cannot give on your behalf.
  3. Put these blocks on existing pages (FAQ, scenarios) rather than new thin URLs.
  4. Add one frozen prompt per question to the AEO tracker (PR #46) and hold it for 4 weeks.
- **Measure:** `source_citation` rate on search-capable engines per prompt; referral sessions from chatgpt.com and perplexity.ai; leads from those sessions.

### eam-06: Put the tools where AI engines get their citations
- **Why:** branded mentions correlate 0.664 with AI visibility against 0.218 for backlinks (Ahrefs, 2025-05-26). Reddit, YouTube and Quora lead AI citation shares (Profound **[vendor]**). Vercel's method is to answer where the questions are asked.
- **Steps (Maya's accounts):**
  1. Record one 60-90 second screen video per tool on YouTube. The title is the question the tool answers, and the description links the tool with UTM tags.
  2. Answer 2-3 real questions a week in integration communities where the rules allow. Disclose authorship and link a tool only when it actually answers the question.
  3. On podcasts and in newsletters, offer the journal with a UTM link. Consider pointing `psilocybinintegrationguide.com` at the book page instead of the homepage (today it is a 308 to `/`), so the domain can be said aloud on podcasts.
- **Measure:** referral sessions per source and UTM, `brand_mention` in the AEO tracker, and captures per UTM.

### eam-04: Scenario library as quality-gated programmatic pages
- **Why:** the scaled-content and doorway policies (2026-08-28) and the 2026 spam updates make volume dangerous. HubSpot's 141 pages worked because each carried first-party case-study material, and citations went from about 16% to 92%. The book's 40 scenarios are that kind of first-party dataset. Only 1 is live.
- **Steps:**
  1. Create a structured file (MDX or JSON) per scenario with these fields: searched question, phase, what is happening, navigation steps, afterwards, related glossary terms, related tool, `sources[]`, reviewed date.
  2. Reuse the `/scenarios/[slug]` template.
  3. Publish in **batches of 3-5**, each to the PR #45 standard.
  4. Apply a **gate:** start the next batch only when at least 2 of the previous batch are indexed in GSC 28 days after publishing. Otherwise improve those pages rather than add more.
  5. AI may draft outlines only. Maya reviews every body.
  6. Every page ends with its tool, the eam-03 offer and a book link.
- **Measure:** indexed pages per batch (GSC), impressions, AEO citations for scenario prompts, and captures per scenario.

### eam-10: Glossary: enrich, don't split
- **Why:** the glossary has about 24 short definitions on one page (live). Splitting it into 24 thin URLs is exactly the "many pages" pattern described in the policy. HubSpot built "a glossary for bots", but the details are paywalled (**UNVERIFIED**).
- **Steps:** add stable `#term` anchors, and give each term links to its "related scenario" and "try this tool". A term gets its own URL only once it has a full scenario page.
- **Measure:** internal clicks from the glossary to tools and scenarios.

### eam-08: Privacy-safe share cards
- **Why:** Google's gen-AI guidance (2025-12-10) means per-user AI result pages must never be indexable at scale. Next.js `opengraph-image` / `ImageResponse` (docs updated 2026-07-09) makes static cards per tool cheap to build. **No 2025-26 lift data was found (UNVERIFIED).**
- **Steps:** build a static OG image per tool and a "Share this tool" button with prefilled text. If a user-authored share page is ever built, it gets `noindex` and contains only text the user wrote.
- **Measure:** `utm_source=share` sessions and the captures that follow.

### eam-09: Embeddable widget (deferred)
- **Why deferred:** there is a policy risk for widget links (2026-08-28) and no results evidence was found (**UNVERIFIED**).
- **Steps if demand appears:** an iframe "integration prompt of the day" with one visible, branded `rel="nofollow"` attribution link.

---