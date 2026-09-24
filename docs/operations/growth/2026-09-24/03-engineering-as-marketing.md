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