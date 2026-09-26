# Lead path — live conversion audit (2026-09-24)

Lens: **THE LIVE LEAD PATH** (ids `lead-`). Author: Claude (workflow sub-agent), for Maya Allan.
Scope: www.mayaallan.com, read with GET/HEAD only. No form was submitted, no buy/subscribe/send button was clicked, nothing was sent to an AI tool.
All site facts below were read live on **2026-09-24 between 18:21:36Z and 18:36:39Z (UTC)**, the exact time is given next to each group. External sources are listed with publication date and read time at the end.

A **lead** here means: newsletter signup, contact/inquiry, book purchase, event registration, or a tool user who leaves an email.

---

## 1. Short answer

The site has **one free place to leave an email**: the "Stay Connected" newsletter form at the **bottom of the homepage** (about 88% of the way down the HTML). It offers nothing in return ("Honest reflections… 1–2 emails per month"). Every other page type has **no email capture** (checked live at 18:35:40Z and 18:36:39Z): blog index, blog posts, the scenario page, FAQ, book page, /books, /about, /events and the three AI tools.

Where people are most engaged, the site sends them away without asking for an email:

| Where the visitor is | What happens now (live) | What gets lost |
|---|---|---|
| Downloading the 7-day Integration Journal (the best lead magnet the site has) | Copy says **"Free, no email required, no login."** The PDF streams from `/api/tools/integration-journal`. | Every download: no contact is captured |
| Finishing an AI tool session (Belief Inquiry, Nervous System Reset, Integration Reflection) | The **only** email field in the tool code is a **paid $9.99** "email me the PDF" export (`POST /api/export` → PayPal) | Every free user |
| Reading a blog post, scenario or FAQ (the pages AI search and Google send people to) | They end with "Try the … tool" or "See the book →". There is no form on the page. | Every reader who isn't ready to buy |
| Wanting to buy the ebook | Book page → "Buy Ebook with PayPal" → **a separate "Quick privacy check" page with a checkbox you have to tick** → PayPal | Some buyers, at a step that adds friction and doubt |
| Looking for events | "No events are currently scheduled. Check back soon." There is no way to ask to be told. | Every interested visitor |
| Checking whether the book is any good | No reviews, testimonials, press or credentials anywhere. Goodreads shows **0 ratings** (read live about 18:34:40Z). | Trust |

**Measurement:** in the live JS, Vercel Web Analytics and the first-party visitor beacon only mount after a visitor clicks **Accept** (`mayaallan_consent_v1 === "accepted"`, chunk `312c5210c9c35dc5.js`, read 18:26:08Z). The only funnel event is `book_viewed`. PR **#57** ("count every visitor…") is **open and unmerged**, created 2026-09-07 (read 18:29:13Z). So "zero leads" can't yet be told apart from "zero traffic": nobody can currently see how many people reached a form.

**What past work covered** (live PR metadata, read 18:29:02Z): PRs #43–#56 (Sept 5–6) dealt with SEO titles, schema, identity and author positioning, the FAQ evidence audit, lint and CI. #42 (Jul 16) connected the newsletter to Resend Broadcasts. **None of them added a lead magnet, an offer or a capture point.** Nothing below repeats that work.

---

## 2. Page-by-page (live HTML, CTAs in HTML order)

"Pos" is how far down the page the element is: its character offset as a share of the HTML body after `<script>`/`<style>` are removed. It stands in for "above or below the fold". Things near 20–35% are in the first screen after the header.

### Home `/` (read 18:21:56Z–18:22:46Z)
| Pos | Element | Target |
|---|---|---|
| 19–24% | Header nav: Home, Books, Belief Inquiry, Nervous System Reset, Integration Reflection, Media, Events, About, Contact | no Blog, no Journal, no signup CTA |
| 31% | H1 "Maya Allan, author of the Psilocybin Integration Guide" | — |
| 33% / 34% | **Explore My Books** / **About Me** (the only CTAs above the fold) | /books, /about |
| 47% / 62% | Books: "View All", "View Book" (From $9.99) | /books, /books/psilocybin-integration-guide |
| 71% | "Read the Full Story" | /about |
| 74–86% | "Resources" labelled **"In Development"**: Start Your Inquiry / Start Your Reset / Start Reflecting (Integration Journal is **not** listed) | tool pages |
| **88%** | **Newsletter "Stay Connected"**: email + honeypot `company`, "Subscribe" | `POST /api/subscribe` `{email, source:"homepage", company}` (HEAD → 405, so the route exists) |
| 93–99% | Footer links (Journal, Blog, Scenarios, FAQ… are only here) | — |

After a successful signup the page only shows an inline "Successfully subscribed!" message. There's no thank-you page and no next step.

### `/books` (18:22:57Z)
There is one book card. The "Available at" retailer names (Amazon, B&N, Google, Book Shop, Waterstones, bokus, Abe Books) are **plain text, not links**. No capture.

### Book page `/books/psilocybin-integration-guide` (18:23:07Z–18:24:37Z)
| Pos | Element |
|---|---|
| 22% | H1, subtitle, taglines |
| 23–31% | About This Book: long sales copy (about 500 words) |
| 31% | "Open the Integration tool" (/integration-reflection), "Related reading" (the Scenario 12 adaptation and the research post). This is effectively a free sample, but it isn't labelled as one. |
| 34% | Available formats: Ebook $9.99 · Paperback $21.99 · Hardcover $33.99 · **Audiobook $15.99 (no buy link anywhere)** |
| **38%** | **Buy Direct: "Buy Ebook with PayPal · $9.99"**. The button goes to `/checkout/privacy-gate?bookId=1` |
| 41% | Retailers. Ebook: Amazon (`a.co/d/hRppkCZ`, which resolved to `amazon.com/dp/B0G765BZDL`, not the ebook ASIN `B0G7JWDJYQ` in the page schema), Google. Paperback: Amazon, B&N (URL carries a stale `;jsessionid=`), Bookshop, Waterstones, bokus, AbeBooks (URL carries a third-party affiliate `clickid`/`aff_ir_…` string). Hardcover: Amazon only. |
| end | 9 share buttons |

There is **no email capture**, **no "read a sample" offer**, and **no reviews, testimonials, praise or credentials** (term counts were 0 at 18:34:40Z). The Book JSON-LD has no `offers` or `aggregateRating`.

**Checkout interstitial** `/checkout/privacy-gate?bookId=1` (18:24:18Z): H1 "Quick privacy check". It warns that PayPal "may not be your account" and requires a checkbox ("This is my PayPal account. I'm on a personal device…") before "Continue to PayPal · $9.99" opens a popup. Endpoints are `/api/checkout/paypal` and `/api/checkout/paypal/capture-order`, both HEAD → 405, so the routes exist.

### `/blog` and posts (18:24:37Z–18:24:50Z; form counts 18:36:39Z)
- The index has 5 posts, **all dated April 19, 2026**. No capture.
- `/blog/psilocybin-integration-research` (2,926 words, updated 2026-09-05) ends with "Try the Integration Reflection tool" and links to the book and scenario. Forms: 0.
- `/blog/inherited-beliefs-grandmother-marriage` (1,640 words) ends with "Try the Belief Inquiry tool". Forms: 0.
- `/blog/affirmations-vs-integration`: forms 0.

### `/scenarios/ego-dissolution` (18:28:39Z)
This is the only one of the 40 scenarios that is published (the sitemap has 38 URLs in total and 2 under /scenarios, read 18:28:49Z). It ends with "This is one of 40 scenarios → See the book". Forms: 0.

### `/faq` (18:28:39Z)
7 sections with about 21 questions. The CTAs are "Read more →" (scenario) and "See the book →". No capture.

### `/about` (18:25:03Z)
Bio and "What I Explore". The CTAs are "Explore My Books" and "Get in Touch". There are no credentials, press, testimonials, photo-of-work or newsletter.

### `/contact` (18:25:03Z, code 18:26:00Z)
Name, email and message fields plus a honeypot, posting to `POST /api/contact` (HEAD → 405, exists). On success it shows "Thank you! Your message has been sent successfully." There is **no newsletter opt-in**.

### `/events` (18:25:03Z)
"No events are currently scheduled. Check back soon…" and 10 share buttons. There is **no notify-me capture**.

### AI tools `/belief-inquiry`, `/nervous-system-reset`, `/integration-reflection` (18:27:27Z–18:28:06Z)
Each has a chat UI (`/api/chat`) with 3 starter prompts. The only email field in the tool bundle (`9a7cf34cbe809fe3.js`) reads: "Want a copy you can print? We'll email you a beautifully-formatted PDF… **$9.99**", button "Email me the PDF — $9.99", which calls `POST /api/export {tool, messages, email, promoCode?}` and then goes to PayPal. There is no free email step and no newsletter opt-in. When this card appears during a session is **UNVERIFIED**: it couldn't be traced in the minified code.

### `/integration-journal` (18:28:06Z)
Four phase radio buttons (Preparation, Journey companion, Integration, Shadow work), an optional intention and date, then **"Download free PDF"**, which calls `/api/tools/integration-journal` (HEAD → 405). The page copy says: "Free, **no email required**, no login" and "No email required. The PDF is generated server-side…". The page title targets "Free Integration Journal — 7-Day PDF Template". It isn't in the header nav or the homepage Resources block.

### Sister domains (18:29:02Z)
`psilocybinintegrationguide.com` and `psilowire.com` both **308 to the homepage**. They don't go to the book page or any matching page.

---

## 3. Clicks-to-lead from the homepage

| Lead type | Live path | On-site actions |
|---|---|---|
| Newsletter | Scroll to 88% → email → Subscribe | 1 submit, but there's no offer and it's the last block on one page |
| Ebook purchase | View Book → Buy Ebook with PayPal → **tick checkbox** → Continue to PayPal → PayPal login and approval | 4 + PayPal |
| Contact inquiry | Contact → 3 fields → Send | 2 |
| Tool user leaves email | Start Your Inquiry → chat → **pay $9.99** for export | 3+ **and a payment** |
| Journal user leaves email | **Not possible** (no email field) | — |
| Event registration | **Not possible** (no events, no waitlist) | — |

---

## 4. What 2025–2026 practitioners and studies show

| Finding | Source (date) | Type |
|---|---|---|
| AI search was 0.5% of Ahrefs traffic but **12.1% of signups**: AI visitors converted **23x** better than organic. The author expects this to shrink at scale. | Ahrefs, Patrick Stox (2025-06-16) | Practitioner, first-party data |
| ChatGPT refers **~10% of new Vercel signups** (up from 4.8% a month earlier and 1% six months earlier). Tally went from $2M to $3M ARR in 4 months with AI search as its largest channel. Vercel tracks referrer traffic and citations. | Vercel engineering blog, Corbett & Ubl (2025-06-10) | Practitioner, first-party data |
| The average AI-search visitor is **4.4x** as valuable as a traditional organic visitor, measured by conversion rate. | Semrush, Rachel Handley (2025-07-21) | Vendor study |
| Email pop-ups: plain newsletter **5.10%** vs **7.49%** with an ebook incentive. Conversational/multi-step pop-ups 15.2%; top 10% of pop-ups 42.35%. | OptiMonk (2025-06-20) | **Vendor marketing** data |
| Interactive quizzes: **40.1% start-to-lead** (people who start and submit contact details), 65% start-to-finish, based on 100M+ leads since 2014. "Individual results vary wildly." | Interact (updated 2026-09-08) | **Vendor marketing** data |
| Checkout abandonment reasons: **17%** too long or complicated, **18%** forced account creation, **19%** didn't trust the site with card details. Average abandonment 70.22%. | Baymard Institute (updated 2025-09-22) | Independent UX research |
| Form fields affect usability far more than the number of steps. The benchmark average is 11.3 fields against an ideal of 8. | Baymard (2024-06-26, still their current article) | Independent UX research |
| Landing pages written at grade 5–7 convert at **11.1%**, 56% higher than grade 8–9. Word count correlates with conversion at −18.6%. Median across 41k pages: 6.6%. | Unbounce Conversion Benchmark (2024 edition, **older**) | **Vendor** |
| Welcome emails: **83.63% open / 16.6% CTR**, against newsletters at 40.08% / 3.84%. | GetResponse benchmarks (2024 report on 2023 data, **older**) | **Vendor** |
| The "Author" industry averages **43.14% open, 2.75% click** (Dec 2024–Nov 2025, 3.6M campaigns). | MailerLite (2025-12-03) | **Vendor** |
| For nonfiction reader magnets: "A workbook, worksheet, template, resource list, or exercises". Welcome email should "deliver or reinforce access to the promised content." | Written Word Media (updated 2026-09-01) | Author-industry practitioner (no numbers) |
| 27% of surveyed authors already sell direct and 39% of the rest planned to. Mailing-list size is positively related to direct-sales income (ALLi data cited). | Written Word Media (2026-08-28) | Author-industry survey summary |
| The authors most optimistic about their business put more into their own newsletter (the "owned channel"). n ≈ 600. | Written Word Media mid-year survey (2026-06-23) | Author survey |
| Back matter is "perhaps the most important place" to promote a reader magnet, followed by website content, pop-ups and slide-ins, and landing pages. | Kindlepreneur, Jason Hamilton (updated 2025-10-01) | Practitioner (no numbers) |

**What this means for the site:** the pages AI and search engines send people to (scenario, research post, FAQ) are exactly the pages with **no capture**. The practitioner data says those visitors convert unusually well, but only where there is something to convert on. A specific, useful incentive beats a generic "subscribe" (the OptiMonk vendor data shows about +47% relative). Interactive flows that deliver a result convert far better than static forms (Interact vendor data, 40.1% start-to-lead). The site already has both assets (the journal and the AI tools) and asks for an email on neither of them for free.

---

## 5. Tactics, ranked by expected leads

The traffic volume is unknown because analytics are consent-gated and PR #57 is unmerged. The impact numbers are therefore **benchmark rates applied to the visitors who reach that step**, not forecasts. **Do lead-08 (measurement) on day 1 alongside everything else.** It is small and it's the only way to prove any of this worked.

### lead-01 — Make the Integration Journal the main lead magnet, delivered by email with a 7-day email companion
- **Why:** it is the most specific, useful free asset on the site: a workbook, which is the nonfiction magnet format Written Word Media recommends (2026-09-01). Right now it's handed over with "no email required". An incentive beats a plain signup (OptiMonk 7.49% vs 5.10%, vendor, 2025-06-20). A multi-step interactive form that ends in a result converts 40.1% start-to-lead (Interact, vendor, 2026-09-08).
- **Steps (code PR):**
  1. On `/integration-journal`, add an email field and one plain-language consent line: "We'll email your PDF and one prompt a day for 7 days (phase-matched). Unsubscribe anytime."
  2. Extend `POST /api/tools/integration-journal`. It generates the PDF, **still downloads it instantly on screen after the email is entered**, and sends the link through Resend, adding the contact with `source=journal:<phase>`.
  3. Replace "Free, no email required, no login" with "Free. Delivered to your inbox with a 7-day companion."
  4. Add the journal to the header nav (label: "Free 7-day journal") and to the homepage Resources block, and remove "In Development".
- **Owner decision:** this reverses a promise the page makes publicly. The softer alternative keeps the instant download and adds an optional "Email me the 7-day companion" field. It captures fewer leads.
- **Effort:** M. **Measure:** journal form starts, email submits, downloads, Resend contacts with `source=journal:*`, and submits ÷ page views (needs lead-08).

### lead-02 — Give AI-tool users a free "email me my session summary" step
- **Why:** the tools are the most engaged surface on the site, and the only email step in them costs $9.99. A free result by email is the pattern behind the 40.1% start-to-lead in interactive flows (Interact, vendor).
- **Steps (code PR):**
  1. In the tool UI (the component that posts to `/api/export`), add a **free** option above the paid one: "Email me a short summary of this reflection (free)", plus an **unchecked** checkbox: "Also send me Maya's 1–2 emails a month."
  2. Add a new route, e.g. `POST /api/export/summary`, that emails a short plain-text summary. **Don't store the transcript in the marketing list.** Tag `source=tool:<name>`.
  3. Keep the $9.99 formatted PDF as the upsell underneath.
  4. Never show the capture inside crisis-detection flows (see PR #36's safety layer), and update the privacy page.
- **Effort:** M. **Measure:** tool sessions started, summary requests, newsletter opt-ins from tools, and $9.99 exports before vs after.

### lead-03 — Put an offer-led capture block on every content template, and rewrite the homepage signup
- **Why:** AI and search visitors land on content pages and convert well above average (Ahrefs 23x, 2025-06-16; Semrush 4.4x, 2025-07-21; Vercel ~10% of signups, 2025-06-10), but those pages have **0 forms** today. A specific incentive beats "Stay Connected" (OptiMonk, vendor). Plain, short copy converts better (Unbounce 2024, vendor, older).
- **Steps (code PR):**
  1. Build one `<LeadCapture offer="journal|sample" />` component that posts to the existing `/api/subscribe` with `source=<pathname>`. The API already accepts `source`.
  2. Place it (a) under the homepage H1, next to "Explore My Books", (b) at the end of every blog post and scenario **before** the References list, (c) after the FAQ "Integration" and "Safety" sections, and (d) at the top of `/blog`.
  3. Rewrite the homepage "Stay Connected" block as "Get the free 7-day Integration Journal", or the sample from lead-04.
  4. Optionally add one scroll-60% or exit-intent slide-in on blog and scenario pages only. Never put it on tool or crisis pages.
  5. Replace the inline "Successfully subscribed!" with a `/thanks?src=` page: download link, one tool, and the $9.99 ebook.
- **Effort:** S–M. **Measure:** signups by `source` path, and signups ÷ views per template.

### lead-04 — Email-gated free sample: "Read 3 scenarios free"
- **Why:** there's no sample offer anywhere, and only 1 of the 40 scenarios is public. Back matter and landing pages are the key reader-magnet placements (Kindlepreneur 2025-10-01; Written Word Media 2026-09-01). Author email is a high-engagement channel (MailerLite, vendor: Author category 43.14% open, 2.75% click).
- **Steps (content + code PR):**
  1. Content: build a sample PDF of 3 scenarios (e.g. ego dissolution, fear loops, inner child) with the table of contents and a buy link.
  2. Code: add a "Not sure yet? Read 3 scenarios free" form on the book page directly under the buy box and at the end of `/scenarios/*` (`source=book-sample`).
  3. Owner: add the same offer, with a link to `mayaallan.com`, to the ebook's back matter on the next upload.
- **Effort:** M. **Measure:** sample signups, then sample subscriber → ebook purchase within 30 days.

### lead-05 — Remove the checkout interstitial and pay from the book page
- **Why:** 17% of shoppers abandon over a too long or complicated checkout, 18% over forced accounts, and 19% over trust (Baymard, updated 2025-09-22). The current extra page adds a step and a mandatory checkbox, and its copy ("that may not be your account") raises the very doubt it's trying to settle.
- **Steps (code PR):**
  1. Render the PayPal buttons (already used on the gate page, which calls `/api/checkout/paypal` and `/capture-order`) **directly in the book-page buy box**.
  2. Move the shared-computer advice into a one-line collapsible "Using a shared computer?" note, and delete the required checkbox.
  3. If the PayPal account allows it, enable the card (guest) funding option so buyers don't need a PayPal login. Whether it's enabled now is **UNVERIFIED**.
  4. Keep the server-side amount check (#41).
- **Effort:** S. **Measure:** `checkout_started` → `paypal_approved` → `purchase_captured` rates, before vs after.

### lead-06 — Book page: buy box above the fold, clean links, no dead format
- **Why:** today the buy button sits after about 500 words of copy (pos 38%), and longer copy correlates with lower conversion (Unbounce 2024, vendor, older). Dead or odd links waste the highest-intent clicks.
- **Steps (code PR):**
  1. Put a compact buy box beside the cover: formats and prices, "Buy ebook $9.99", and "Read 3 scenarios free" (lead-04). Leave the long copy below it.
  2. Either link the **audiobook** ($15.99 listed, no link) or remove its price.
  3. Point the ebook Amazon link to the ebook ASIN `B0G7JWDJYQ`. The `a.co` link resolved to `B0G765BZDL`.
  4. Strip B&N's `;jsessionid=` and AbeBooks' third-party `clickid`/`aff_ir_*` parameters.
  5. Make the `/books` "Available at" names real links.
- **Effort:** S. **Measure:** `book_viewed` → `checkout_started` rate, and outbound retailer clicks (new event).

### lead-07 — Build social proof from zero
- **Why:** Goodreads shows 0 ratings and the site shows no reviews, testimonials or press. Trust drives 19% of abandonment at checkout (Baymard). This evidence is weaker than the rest because the Baymard figure is for e-commerce checkout, not book pages.
- **Steps (owner + content, then a small PR):**
  1. Invite the first subscribers from lead-01 and lead-04 to an early-reader group: a free ebook for an **honest** review on Goodreads or Amazon. Follow each platform's current review policy, which is **UNVERIFIED** here.
  2. With permission, add a "What readers say" block (3 short quotes) to the book page and homepage.
  3. Add any podcast or press appearances to `/media` and `/about`.
- **Effort:** M. **Measure:** the Goodreads rating count (live), and book-page conversion before vs after quotes appear.

### lead-08 — Measure the funnel (prerequisite; do on day 1)
- **Why:** the live code counts nothing unless a visitor accepts cookies, and the only funnel event is `book_viewed`. Ahrefs and Vercel could report AI-search signup shares only because they attribute signups to sources (2025-06-16; 2025-06-10).
- **Steps:**
  1. Owner: review and merge **PR #57** (open, read 18:29:13Z).
  2. Owner: turn on Vercel Web Analytics for the project. PR #57 says it's disabled; this is **UNVERIFIED live**, since Vercel wasn't queried in this lens.
  3. Code: send new events through the existing `/api/marketing/event`: `newsletter_submitted{source}`, `journal_generated{phase,email}`, `tool_started{tool}`, `tool_summary_requested`, `export_clicked`, `checkout_started`, `purchase_captured`, `retailer_click{retailer,format}`.
  4. Code: add a per-source funnel to `/admin/analytics`.
- **Effort:** S. **Measure:** the events appear in admin within 24h of deploy, and there's a weekly leads-by-source table.

### lead-09 — A welcome sequence that sells the $9.99 ebook
- **Why:** welcome emails get about 2x the opens and more than 4x the clicks of regular newsletters (GetResponse, vendor, 2024 report, older). Right now a signup gets one inline message and nothing else.
- **Steps (owner account + code):**
  1. Send 5 emails over 10 days:
     - E0, immediately: deliver the asset.
     - E1, day 1: how to use it, plus Maya's story.
     - E2, day 3: one full scenario.
     - E3, day 5: a Belief Inquiry invitation.
     - E4, day 7: the ebook at $9.99, linking to the book page with `utm_source=email&utm_campaign=welcome`.
     - E5, day 10: "Reply and tell me what came up". Replies count as leads and are review candidates for lead-07.
  2. Resend Broadcasts is connected (PR #42). Whether Resend can run automated sequences on this plan is **UNVERIFIED**. The fallback is Vercel Cron plus the Resend send API.
- **Effort:** M. **Measure:** welcome open and click rates vs the MailerLite "Author" benchmark (43.14% / 2.75%), and ebook purchases with `utm_campaign=welcome`.

### lead-10 — Close the dead ends: events waitlist, nav, contact opt-in
- **Why:** each dead end is a visitor with intent and nowhere to go. This is simple UX hygiene; no single study is cited.
- **Steps (code PR):**
  1. `/events`: replace "Check back soon" with "Get notified of the first online integration circle / reading" (email plus one interest choice, `source=events-waitlist`).
  2. Header: add "Writing" (/blog) and a "Free journal" button.
  3. `/contact`: add an **unchecked** newsletter opt-in checkbox.
  4. Homepage: remove the "In Development" label.
- **Effort:** S. **Measure:** waitlist signups, and contact-form opt-ins.

### lead-11 — Send the sister domains to intent-matched pages
- **Why:** someone typing `psilocybinintegrationguide.com` wants the book, but today it 308s to the homepage.
- **Steps (owner, Vercel domains):**
  1. `psilocybinintegrationguide.com` → `/books/psilocybin-integration-guide?utm_source=pig-domain`.
  2. `psilowire.com` → `/integration-journal?utm_source=psilowire` (or `/blog`).
- **Effort:** S. **Measure:** sessions with those `utm_source` values (after lead-08).

---

## 6. Guardrails for all tactics
- Consent: newsletter opt-ins stay explicit and unchecked by default, and every email has an unsubscribe link (the current form already states this). Update `/privacy` when the journal, tools or waitlist start collecting email.
- Sensitive content: tool conversations can include trauma and drug-use details. Don't send transcript content into the marketing list or analytics, and never show capture in crisis-detection flows.
- Keep the site's non-clinical positioning (PR #37/#50) in all magnet and email copy.

---

## 7. UNVERIFIED (live source not reachable or not in this lens)
- Whether `/api/subscribe`, `/api/contact`, `/api/tools/integration-journal` and `/api/export` actually deliver on POST. Only route existence was checked (HEAD → 405); submitting was forbidden.
- When the paid export card appears during a tool session (not traceable in minified code).
- Whether Vercel Web Analytics is disabled at the project level (from the PR #57 body, not read from Vercel).
- Site traffic volume and sources (analytics not accessible in this lens).
- Amazon rating and review count (amazon.com returned HTTP 500 to fetch about 18:35Z).
- Bookshop.org and Waterstones links (403 to automated GET at 18:35:22Z; bot protection likely, not necessarily broken).
- Whether PayPal guest card checkout is enabled on the account; Resend automation capability; Amazon and Goodreads free-copy review policy text.
- Scale of any lift: all rates in section 4 come from other sites (several vendor datasets) and are not forecasts for this site.

---

## 8. Sources

| # | URL | Published / updated | Read (UTC) |
|---|---|---|---|
| S1 | https://www.mayaallan.com/ (+ `/_next/static/chunks/bc55967f7a3249cb.js`, `312c5210c9c35dc5.js`) | live | 2026-09-24T18:21:56Z–18:26:16Z |
| S2 | https://www.mayaallan.com/books | live | 18:22:57Z |
| S3 | https://www.mayaallan.com/books/psilocybin-integration-guide (+ `fc986f8dd4b371e4.js`) | live | 18:23:07Z–18:23:50Z |
| S4 | https://www.mayaallan.com/checkout/privacy-gate?bookId=1 (+ `e6c2aa785f59830a.js`) | live | 18:24:18Z |
| S5 | https://www.mayaallan.com/blog, /blog/psilocybin-integration-research, /blog/inherited-beliefs-grandmother-marriage | live | 18:24:37Z–18:24:50Z |
| S6 | https://www.mayaallan.com/about, /contact (+ `001ea6f2792f6797.js`), /events | live | 18:25:03Z–18:26:00Z |
| S7 | https://www.mayaallan.com/belief-inquiry, /integration-reflection, /nervous-system-reset (+ `9a7cf34cbe809fe3.js`) | live | 18:27:27Z–18:28:06Z |
| S8 | https://www.mayaallan.com/integration-journal (+ `5bcaff4db7d4d1ce.js`) | live | 18:28:06Z |
| S9 | https://www.mayaallan.com/faq, /media, /scenarios/ego-dissolution | live | 18:28:39Z |
| S10 | https://www.mayaallan.com/sitemap.xml; psilocybinintegrationguide.com, psilowire.com (HEAD) | live | 18:28:49Z–18:29:02Z |
| S11 | GitHub `mallan67/mayaallan` pulls (metadata) incl. PR #57 | live | 18:29:02Z–18:29:13Z |
| S12 | https://www.goodreads.com/book/show/245299940-psilocybin-integration-guide | live (book pub. 2025-12-15) | ~18:34:40Z |
| S13 | Retailer links from the book page (a.co, B&N, Bookshop, Waterstones, Google Play) | live | 18:35:22Z |
| S14 | https://ahrefs.com/blog/ai-search-traffic-conversions-ahrefs/ | 2025-06-16 | 18:29:59Z–18:30:48Z |
| S15 | https://baymard.com/lists/cart-abandonment-rate | updated 2025-09-22 | 18:29:59Z–18:30:48Z |
| S16 | https://www.tryinteract.com/blog/quiz-conversion-rate-report/ (vendor) | updated 2026-09-08 | 18:29:59Z–18:30:48Z |
| S17 | https://kindlepreneur.com/reader-magnets/ | updated 2025-10-01 | 18:30:48Z–18:31:37Z |
| S18 | https://www.getresponse.com/resources/reports/email-marketing-benchmarks (vendor) | 2024 report, 2023 data (older) | 18:30:48Z–18:31:37Z |
| S19 | https://unbounce.com/conversion-benchmark-report/ (vendor) | 2024 edition (older) | 18:30:48Z–18:31:37Z |
| S20 | https://vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search | 2025-06-10 | 18:32:39Z–18:33:27Z |
| S21 | https://www.semrush.com/blog/ai-search-seo-traffic-study/ (vendor) | 2025-07-21 | 18:32:39Z–18:33:27Z |
| S22 | https://baymard.com/research-articles/checkout-flow-average-form-fields | 2024-06-26 | 18:32:39Z–18:33:27Z |
| S23 | https://www.optimonk.com/popup-statistics (vendor) | 2025-06-20 | 18:32:39Z–18:33:27Z |
| S24 | https://www.writtenwordmedia.com/how-authors-are-growing-in-2026-mid-year-survey-results/ | 2026-06-23 | 18:33:44Z–18:34:40Z |
| S25 | https://www.writtenwordmedia.com/direct-sales-authors/ | 2026-08-28 | 18:33:44Z–18:34:40Z |
| S26 | https://www.writtenwordmedia.com/reader-magnet/ | updated 2026-09-01 | 18:33:44Z–18:34:40Z |
| S27 | https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks (vendor) | 2025-12-03 | 18:33:44Z–18:34:40Z |

Also checked but not used: the Beehiiv Dan Koe case study (2025-04-25, vendor, no signup mechanics given); the Beehiiv lead-magnet webinar page (description only); Written Word Media's welcome-email guide (2024-01-30, no numbers). Amazon `dp/B0G7JWDJYQ` returned HTTP 500.