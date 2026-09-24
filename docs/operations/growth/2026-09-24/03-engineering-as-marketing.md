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