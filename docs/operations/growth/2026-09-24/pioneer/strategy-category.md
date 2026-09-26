# Category Creator strategy: own "scenario-based integration"

Repo mallan67/mayaallan, branch work/site-visibility. Written 2026-09-24, live reads 22:52:48Z-22:57:11Z UTC.
Persona: CATEGORY CREATOR -- define one new term, publish the canonical reference for it, and become the source that search engines, AI answers, directories and training courses point to.

Inputs: only (a) the six checked maps in this folder -- item ids cited like [mkt-01], [goog-15], [web-goodreads]; each map's "missing" entries cited as [market+], [google+], [engines+], [books+], [niche+], [openweb+]; map headline/number lines cited as [<map> numbers] -- and (b) fresh live reads F1-F15 in section 8, each with URL and UTC read time. Nothing comes from a local file, memory or an earlier answer. Anything not re-read live is marked UNVERIFIED.

## 0. The point of view (what a category creator says out loud)

Most people who take psilocybin never see an integration professional. In Q2 2026, 71% of Oregon's legal-session clients came from out of state, and the law only requires that an integration session be offered, not taken [mkt-01, market numbers]. 7.89M US people used psilocybin in the past year [market numbers]. Today "psychedelic integration" means a service you buy: Google completes the phrase with therapy, coach, therapist, coaching certification, coach training, coach salary (F1).

The idea nobody owns: integration is also a skill a person can learn by recognising which pattern they are in. Maya's book already holds that idea. It has 40 named journey scenarios, and each one is worked through the same five parts: Description, Cause, Navigation, Lesson, Example (F4). The site never names it: the book page says "practical frameworks" (F6), and all 25 glossary terms are other people's terms (F2).

- Category term (generic, anyone can say it): **scenario-based integration** -- "working with a psychedelic experience by finding the recognised journey scenario it resembles and walking it through five parts: description, cause, navigation, lesson, example."
- Owned reference: **the Journey Scenario Index (JSI)** -- 40 scenarios with permanent IDs JS-01 to JS-40, one public page each, an open dataset with a DOI, and a facilitator casebook.
- Engineering model: MITRE ATT&CK, OWASP Top 10, CVE, RFCs. Each item gets a stable ID and a permanent URL, the list ships as open data people can cite, and others are invited to build on it. Once people write "JS-12" in a handout, a show note, a forum answer or an AI answer, that ID resolves to one URL on mayaallan.com.

### Why this is winnable now (numbers)
- The literature is tiny. OpenAlex finds only 28 works ever with "psychedelic integration" in the title and 2 with "psilocybin integration"; 76 mention it in the title or abstract, 26 in 2025 and 19 so far in 2026 (F9). The most-cited is Bathje et al. 2022, "Psychedelic integration: An analysis of the concept and its practice" (168 citations, F9). None of the 6 most-cited titles is a scenario taxonomy (F9; absence beyond those 6 is UNVERIFIED).
- English Wikipedia has no article and no redirect for "Psychedelic integration" (F8). "Psilocybin therapy" gets 2,169-2,777 human views a month; "Psilocybin" gets 40,080-43,273 (Jun-Aug 2026, F8).
- The asset exists but is not published: 1 of 40 scenarios has a page, and the sitemap has 38 URLs (F5; [goog numbers]).
- The scenario framing already wins: one scenario video has 152,568 views, while the best integration videos top out at 34K [market numbers, mkt-ws-02].
- Search already trusts the book page: it is #1 on DuckDuckGo for psilocybin integration guide (F7) and on Bing [market headline].
- The retail shelf is small: Amazon returns 85 books for "psilocybin integration" (Maya's is #5 organically), and Goodreads has no list for the category [books numbers].

### Naming rules (evidence-based)
1. Never use bare "integration scenarios". Google completes it with SAP GRC, Salesforce, SAP and ServiceNow (F1). Always write "journey scenario", "psilocybin journey scenario" or "JS-nn". The site's /scenarios title already says "Psilocybin Journey Scenarios" (F3).
2. Keep the category phrase generic ("scenario-based integration") so others can use it freely. The Index name and IDs carry the attribution to Maya.
3. Stay non-clinical, in the book's own words: educational, post-experience reflection, not a substitute for professional advice (F6). Every JS page carries "When to seek qualified help" (the existing template has it, F5).
4. Whether "Journey Scenario Index" is free to trademark is UNVERIFIED (USPTO not checked). Check before anything is printed.

## 1. The moves (14)

UTM convention for every link that leaves an owned property: utm_source=<venue>&utm_medium=<type>&utm_campaign=<name>. The scenario ID travels as an event parameter (js_id), never in the UTM. The GA4 events named below are specified in section 4; the parallel measurement workflow wires them [goog-34]. "First lead" is the earliest day a lead could plausibly arrive after the move ships -- a planning estimate, not a forecast.

### M1. Name the category on the site: definition page and coined terms
- Venues: mayaallan.com /glossary, new /scenario-based-integration, /methods, /books/psilocybin-integration-guide. Downstream: Google and Bing answers, AI Overviews and AI Mode, ChatGPT search, Perplexity, Copilot [goog-27, ai-google-gemini, ai-chatgpt, ai-perplexity, ai-copilot].
- Steps: (1) PR: add two coined DefinedTerms to the glossary's existing DefinedTermSet ("Scenario-based integration" and "Journey Scenario Index"), and a second DefinedTermSet "Journey Scenario Index" holding JS-01 to JS-40, each with termCode (schema.org DefinedTerm supports termCode and inDefinedTermSet, F10). (2) New page /scenario-based-integration: a 300-word definition, the five parts, the 40-row index table, "how this differs from integration coaching and therapy", a citation block (DOI from M3) and a "copy citation" button. (3) Book page: replace "practical frameworks" with the named method. Add isbn and workExample [web-schema-graph] only after the ISBN defect D1 is fixed [book-isbn-defect]. (4) /methods lists IFS, Clean Language, Coherence Therapy, Integration Journal and MI/OARS (F3). Add "Scenario-based integration (Maya Allan)" with its sources credited.
- Owner: code PR + content. Effort: 1-2 days.
- First lead: not a lead source on its own; everything from M2 to M14 links to it. AI-answer pickup after about day 20 (UNVERIFIED).
- Measure: Search Console queries containing "scenario" or "JS-" [goog-01]; citations of /scenario-based-integration in the Search Console Generative AI report [goog-02] and the Bing AI Performance report [eng-bing]; event term_copy_citation.
- Evidence: F1, F2, F3, F6, F8, F9, F10.

### M2. Ship the Index: the 39 missing scenario pages, with permanent IDs
- Venues: mayaallan.com/scenarios/<slug>; Google; Bing plus IndexNow, which reaches 6 engines and Copilot [eng-bing, eng-indexnow]; Discover [goog-20]; Google Books full-text search, where all 40 scenarios are already indexed [goog-09].
- Steps: (1) Reuse the live ego-dissolution template. It already has a question-shaped title, Article, CreativeWorkSeries and WebPage schema, and sections "When to seek qualified help", "Integration afterward" and "References" (F5). (2) Show a visible "JS-07" badge on each page, and make /scenarios/js-07 a permanent 308 redirect to the slug. (3) Each page gets the five parts in short form (not the book text); one link to the matching free tool (/belief-inquiry, /nervous-system-reset, /integration-reflection, /integration-journal); a 62-FIRESIDE box [niche-npo-fireside, mkt-ws-09]; and a "full scenario in the book" block. (4) Publish first the 10 scenarios closest to difficult experience and re-entry [mkt-07], then 10 a week. (5) After each deploy, send an IndexNow ping and request indexing of the hub in URL Inspection [goog-03]. (6) The /scenarios hub lists all 40, grouped before / during / after (today it lists 1, F5).
- Owner: content (Maya writes or approves each summary) + code PR. Effort: 40-60 hours in total.
- First lead: day 10-21 (first pages indexed; a visitor moves from a scenario page to a tool, then to a sign-up).
- Measure: scenario_view {js_id}, tool_start {from_js}, lead_submit {source, js_id}; Search Console impressions per URL; Bing AI citations per URL.
- Evidence: F5, F7, [goog numbers], [mkt-ws-03], [market numbers: scenario video 152,568 views].

### M3. Open the Index as citable data: GitHub, Zenodo DOI and a framework report
- Venues: a new public GitHub repo (for example journey-scenario-index), Zenodo, DataCite metadata harvested over OAI-PMH, OpenAlex, ORCID. Later, Wikidata [book-wikidata, web-wikidata].
- Steps: (1) The repo holds scenarios.json (id, title, phase, one-paragraph summary, five-part headings, canonical URL); a CC BY-NC 4.0 licence covering the summaries only (the book text stays all rights reserved); and CITATION.cff, which makes GitHub show "Cite this repository" (F12). (2) Turn on Zenodo's GitHub integration, then tag release v1.0; Zenodo archives the release and gives it a DOI (F11, F12). (3) Deposit a separate 6-10 page technical report, "Scenario-based integration: a 40-item taxonomy of psilocybin journey scenarios for non-clinical education", with references (Bathje 2022 and others, F9). Zenodo accepts "All types of research artifacts" but removes out-of-scope content and revokes its DOI (F11), so the report must be genuinely descriptive, not an advert. (4) Register an ORCID. Put the DOI on /scenario-based-integration and /about, and add ORCID to Person sameAs. (5) Serve the same data at mayaallan.com/scenarios.json; robots.txt already allows all AI crawlers [engines numbers].
- Owner: owner account (GitHub, Zenodo, ORCID) + code PR + content. Effort: 1-2 days.
- First lead: day 30-60 (a trainer or academic who finds the DOI asks for the casebook).
- Measure: Zenodo views and downloads; GitHub stars, forks and clones; OpenAlex cited_by_count for the DOI, checked monthly; links from the Zenodo record tagged utm_source=zenodo&utm_medium=repository&utm_campaign=jsi-v1, and from GitHub tagged utm_source=github&utm_medium=repository&utm_campaign=jsi-v1.
- Evidence: F9, F11, F12; [web-assets] (the map's DOI idea).

### M4. The Scenario Finder: the category's front door (a free tool)
- Venues: mayaallan.com/scenario-finder; Show HN, which takes "something you've made that other people can play with" [openweb+]; Psychedelics.com Contribute, which asks for "Tool Builders" [niche+]; the Fireside and Zendo resource pages [niche-npo-fireside, niche+].
- Steps: (1) PR: a six-question sorter with no login (phase, body sensations, main emotion, thought pattern, how long ago, current support). It returns the 1-3 closest JS-IDs with links, and shows 62-FIRESIDE first for anyone in crisis. (2) The result screen offers the 7-day Integration Journal with the matched scenario's prompts filled in. The journal page is live, with FAQPage, SoftwareApplication and Offer schema (F3), and it is the lead capture point; how emails are captured belongs to the conversion workflow. (3) Keep only anonymous counts per js_id; never store free text. (4) Post it as a Show HN and submit it to Psychedelics.com.
- Owner: code PR. Effort: 3-5 days.
- First lead: day 7-14 after launch (first journal sign-ups from the Finder).
- Measure: finder_start, finder_complete {js_id}, lead_submit {source: finder, js_id}; utm_source=hn&utm_medium=community&utm_campaign=scenario-finder; utm_source=psychedelics-com&utm_medium=directory&utm_campaign=scenario-finder.
- Evidence: [market headline] (people who struggle cope mainly by reading and journaling), [openweb+ Show HN], [niche+ Psychedelics.com], F3, F4.

### M5. The Casebook: make the Index vocabulary that training programs teach
- Venues: Oregon training programs (15 active of 32 authorized [market numbers]; the approved-programs PDF [niche+]); Colorado programs (11 in DORA's open licence data [market+]); the CIIS certificate [niche-edu-ciis]; the Third Wave and Fireside coaching certifications [market+]; Heroic Hearts, which is on Oregon's approved list [niche+].
- Steps: (1) Build the "Journey Scenario Casebook, facilitator edition" as a PDF: for each JS scenario, 3 discussion prompts, 1 role-play, "what not to say" and referral red flags. (2) Give program directors a free desk copy. Sell cohort licences, for example 20 seats at $60-$120, benchmarked on MAPS's $60 practitioner 20-pack [market+]; demand at that price is UNVERIFIED. (3) Build the director list from DORA open data (data.colorado.gov/resource/7s5z-vewr.json [market+]) and Oregon's PDF. (4) In week 2, email the 26 directors (15 Oregon + 11 Colorado): the Index link, the casebook and a free 60-minute "scenario lab" guest session per cohort.
- Owner: outreach + content. Effort: 3 days to build, then 1 hour a day of outreach.
- First lead: day 10-20 (a desk-copy request is a lead).
- Measure: utm_source=trainer-<program>&utm_medium=b2b&utm_campaign=casebook; casebook_request {program}; programs using the casebook (target 3 by day 90).
- Evidence: [mkt-09], [mkt-10], [mkt-ws-04], [niche-edu-or-programs], [market+ DORA: 86 facilitators and 94 clinical facilitators active, 691 in training].

### M6. A Take-Home Integration Kit that sets the standard for "going home"
- Venues: Oregon's 22 operating service centers and 383 facilitators [mkt-01, market numbers]; Colorado's 46 licensed healing centers [niche numbers]; New Mexico's program, due to start by 31 Dec 2026 [mkt-03, mkt-ws-06].
- Steps: (1) The kit is one printable card plus one page, mayaallan.com/kit: "your first 30 days back home", with the 10 most common JS scenarios, the Finder, the journal, the Fireside line and a way to find an integration circle (M11). (2) The card prints a short URL, psilocybinintegrationguide.com/kit/<center>. That domain already 308-redirects to the site [goog numbers]; a PR adds path redirects so it lands on mayaallan.com/kit?utm_source=or-svc-<slug>&utm_medium=print-qr&utm_campaign=take-home-kit (co-hc-<slug> for Colorado). (3) Offer centers free printed cards and a co-branded page; bulk ebook codes are optional. (4) Write for the actual client: 59% are aged 45+ and 71% are from out of state [market numbers].
- Owner: outreach + code PR (/kit page, redirect map). Effort: 2 days plus outreach.
- First lead: day 14-30 (first QR scans once cards reach a center).
- Measure: kit_view {center}, kit_download {center}, finder_start from /kit; UTM per center.
- Evidence: [mkt-01], [mkt-02], [mkt-ws-01], [niche-b2b-or-centers], [niche-b2b-co-centers].

### M7. Get the Index into curated and official directories, and onto the public record
- Venues: Colorado NMD Third-Party Educational Resources, a state directory with a public recommendation form and plain followed links [market+]; the Fireside resources page [niche-npo-fireside]; Zendo resources [niche+]; Psychedelics.com's Essential Books list, Contribute page and Psybrary AI corpus [niche+]; the Colorado DPO stakeholder meeting (2026-10-02) and rulemaking hearing with written comments (2026-10-08) [niche+].
- Steps: (1) Submit the Index, not the book, through Colorado NMD's form as a free non-clinical educational resource. (2) Ask Fireside and Zendo to list the Finder, which has their line built in. (3) Psychedelics.com: submit the Finder as a tool, ask for the book on Essential Books, and offer the open JSI dataset for the Psybrary corpus. (4) Colorado comment, only if the hearing notice covers client aftercare (UNVERIFIED): propose that centers give every client a take-home integration resource sheet, citing the open Index as one example among several.
- Owner: outreach. Effort: 1 day.
- First lead: listings take 2-6 weeks; first referred lead day 30-45.
- Measure: utm_source=co-nmd&utm_medium=directory&utm_campaign=jsi; utm_source=fireside|zendo|psychedelics-com&utm_medium=referral&utm_campaign=jsi.
- Evidence: [market+ Colorado NMD], [niche+], [mkt-ws-09].

### M8. "One scenario, one minute": the Index on YouTube, with watch pages on the site
- Venues: a YouTube long-form channel and Shorts [goog-15, goog-16]; on-site watch pages with VideoObject markup [google+]; Search Console platform properties for YouTube [google+].
- Steps: (1) Create the channel and fill its 14 profile links, including /scenario-based-integration and /scenario-finder [goog-15]. (2) Title every video "JS-07: <the question>" so the ID repeats. Keep it educational and never mention dosing or sourcing, because YouTube lists psilocybin as a hard drug [google headline]. (3) Embed each video on its JS page, because the watch page must be indexed [google+], and add the VideoObject creator property (Google changelog 2026-09-24 [openweb+]). (4) Publish 2 a week for 20 weeks.
- Owner: content + owner account. Effort: 2-3 hours a video.
- First lead: day 14-30.
- Measure: utm_source=youtube&utm_medium=video&utm_campaign=js-<nn>; scenario_view with a YouTube referrer; YouTube Studio impressions; the Search Console YouTube property.
- Evidence: [mkt-ws-02], [market numbers: YouTube], [goog-15], [goog-16].

### M9. The audiobook becomes a scenario podcast feed
- Venues: an RSS podcast, "Journey Scenarios", on YouTube Music [goog-17], Apple Podcasts [vert-apple-podcasts] and Spotify for Creators [vert-spotify-podcasts]; later, audiobook retail [goog-11, book-voices-inaudio, book-spotify-authors].
- Steps: (1) Once the audiobook masters are approved, cut 40 episodes of 4-7 minutes, each one scenario's Description and Navigation. Each ends: "full scenario at mayaallan.com/scenarios/js-nn". (2) Every episode title starts with "JS-nn". (3) Show notes carry links to the page and the Finder; show-note links were followed in 2 of 2 samples [web-pod-showsnotes].
- Owner: content + owner account. Effort: 1 day to set up, then 30 minutes an episode.
- First lead: day 30-45 after the audio is approved (the audiobook date is UNVERIFIED).
- Measure: utm_source=podcast-jsi&utm_medium=audio&utm_campaign=js-<nn>; audiobook_click.
- Evidence: [market numbers: 9 integration podcasts on iTunes, 7 active], [goog-17].

### M10. A guest tour that plants the vocabulary
- Venues: small integration podcasts [niche-pod-integration-small]; midlife and older-adult shows [mkt-14, mkt-ws-07]; guest articles for Psychedelics Today, Chacruna and Lucid News [niche-pub-psychedelicstoday, niche-pub-chacruna, niche-pub-lucidnews]; the PR query services Source of Sources, Qwoted and Featured [niche-pr-sos, niche-pr-qwoted, niche-pr-featured].
- Steps: (1) One pitch angle: "40 scenarios nobody warns you about -- and what 71% of Oregon's clients face when they go home." (2) Every appearance names 3 JS-IDs and gives one vanity URL, psilocybinintegrationguide.com/<show>, which redirects with tags. (3) Guest article: "A field guide to difficult journey scenarios", each scenario linked to its JS page. (4) Pay for no placement: the Third Wave podcast charges a $1,500 guest fee [niche numbers], so skip it.
- Owner: outreach. Effort: 1 hour a day.
- First lead: day 21-40 (episodes release weeks after recording).
- Measure: utm_source=podcast-<show>&utm_medium=audio&utm_campaign=jsi-tour; utm_source=<outlet>&utm_medium=guest-article&utm_campaign=jsi-tour.
- Evidence: [web-pod-showsnotes], [openweb+ PR services], [niche-pub-*].

### M11. Live Scenario Circles: the fastest route to a lead
- Venues: Eventbrite (free events cost nothing to publish [openweb+]; 30 online psychedelic-integration listings on page 1 [engines+]); the MAPS event calendar submission form [niche-evt-maps-calendar]; Horizons NYC, Oct 15-17 2026, whose community allies run meetups [niche-evt-horizons, niche+]; Meetup and the Brooklyn Psychedelic Society [niche+]; the site's /events page, empty today [openweb+].
- Steps: (1) A free 60-minute online "Scenario Circle" each month on one JS scenario: educational, no substances, not therapy, sharing optional. (2) Publish it on Eventbrite and /events, and submit it to the MAPS calendar. (3) During Horizons week, partner with a community ally on a free in-person scenario meetup in NYC. Use Event JSON-LD only for in-person events, because Google's event results exclude online-only ones [goog-23, engines+]. (4) Registrants who consent receive the casebook one-pager and the journal.
- Owner: owner account + content. Effort: 3 hours a month, plus 1 day for Horizons.
- First lead: day 7-14 (a registration is a lead).
- Measure: utm_source=eventbrite|maps-cal|horizons&utm_medium=event&utm_campaign=circle-js<nn>; event_register {circle}.
- Evidence: [niche-com-eventbrite], [niche-evt-maps-calendar], [niche-evt-horizons].

### M12. Own the category's book shelf
- Venues: KDP and Amazon search [vert-amazon, book-kdp-categories-keywords, book-bisac]; Goodreads [vert-goodreads, book-goodreads-listopia]; Google Books full-text search [goog-09]; Book DNA (formerly Shepherd) [books+]; Draft2Digital wide distribution and libraries [book-d2d, book-libraries].
- Steps: (1) Fix the ISBN defect D1 first [book-isbn-defect]. (2) Make BISAC OCC039000 the primary code [book-bisac]. Use Google-suggested phrases as KDP keywords: psilocybin integration workbook, psilocybin integration questions, psilocybin integration journal (F1). (3) The new edition's description names "scenario-based integration" and "Journey Scenario Index". (4) Back matter: "Find your scenario: psilocybinintegrationguide.com/finder", redirecting with tags [book-kdp-ebook-backmatter]; KDP's link rules are UNVERIFIED. (5) Claim Goodreads. A reader or partner, not Maya, starts an honest "Psilocybin integration books" Listopia list; none exists [books numbers]. (6) Pair the book with its category neighbours on Book DNA.
- Owner: owner account. Effort: 1-2 days, plus D1 lead time.
- First lead: day 14-30 (new readers reach the Finder from the back matter).
- Measure: utm_source=book&utm_medium=ebook|print|audio&utm_campaign=backmatter; Amazon rank in OCC039000; Goodreads shelves and ratings.
- Evidence: [books numbers], [book-*], F1, F7.

### M13. psilowire.com becomes the Integration Research Wire: keeper of the literature
- Venues: psilowire.com (today a 308 redirect to the site [goog numbers]); mayaallan.com/research; a monthly email (Substack [web-substack], or Google's Reader Revenue Manager sign-up form [google+]); journalists through the PR services [niche-pr-*].
- Steps: (1) PR: a page listing every paper that mentions "psychedelic integration" -- 76 so far (F9) -- each with a 3-line plain-language summary and the JS-IDs it informs. A weekly job queries the public OpenAlex API (no key needed) for new papers, roughly 2 a month in 2026 (F9). (2) Redirect psilowire.com with a 308 to /research?utm_source=psilowire&utm_medium=domain&utm_campaign=wire. (3) A monthly "Integration Research Wire" email is the lead capture. (4) Pitch it to journalists as the only complete tracker; that claim is UNVERIFIED until checked against MAPS Integration Station [market+].
- Owner: code PR + content. Effort: 2 days, then 2 hours a month.
- First lead: day 20-30 (digest sign-ups).
- Measure: digest_signup; utm_source=psilowire&utm_medium=domain&utm_campaign=wire; utm_source=newsletter&utm_medium=email&utm_campaign=wire-<yyyymm>.
- Evidence: F9, [goog headline] (the psilowire.com option), [niche-pr-*].

### M14. Lock the attribution: one entity and one sentence, everywhere
- Venues: the site's JSON-LD [web-schema-graph, goog-24]; Goodreads [web-goodreads]; the Google Books bio [web-googlebooks]; Amazon Author Central [web-amazon]; Open Library [web-openlibrary]; a Bluesky handle on the domain [web-bluesky]; YouTube; the Knowledge Panel [goog-06, eng-google-kp]; later, Wikidata [web-wikidata].
- Steps: (1) One sentence: "Maya Allan is the author of Psilocybin Integration Guide and creator of the Journey Scenario Index, an open 40-scenario reference for scenario-based integration." (2) Paste it into every profile; 3 different bios are live today [openweb headline]. (3) Link the site's Person, Organization and WebSite records into one @id graph, with sameAs to every claimed profile, the ORCID and the DOI (M3). (4) Create Wikidata items only once an independent reference exists, such as an M10 article [web-wikidata]. (5) No Wikipedia edits by Maya (conflict of interest). English Wikipedia has no "Psychedelic integration" article (F8); do not create one to promote the book.
- Owner: code PR + owner account. Effort: 1 day.
- First lead: indirect. This is what makes AI answers and knowledge panels credit the term to Maya.
- Measure: Google Alerts on "Journey Scenario Index", "scenario-based integration" and "Maya Allan" [goog-31, web-mentions]; count of external pages using the term, monthly; Knowledge Panel status.
- Evidence: [openweb headline], [web-schema-graph], [web-goodreads], F8.

## 2. The first 30 days

| Days | Code PR | Owner account | Content | Outreach |
|---|---|---|---|---|
| 1-3 | M1 definition page and DefinedTerms; M14 @id graph | claim Goodreads; ORCID; Zenodo; start the D1 ISBN fix | M14 one-sentence bio | -- |
| 3-7 | M2 JS badge and redirects; first 10 pages | M3 repo and v1.0 DOI | 10 scenario summaries | M11: first circle on Eventbrite and the MAPS calendar (held about day 14) |
| 7-14 | M4 Scenario Finder | Show HN post | 10 more summaries; M5 casebook PDF | M5: emails to 26 directors; M7 directory submissions |
| 14-21 | M6 /kit and domain redirects | M8 channel live | first 4 videos | M6: 10 Oregon and 10 Colorado centers; M10: 10 podcast pitches; Horizons ally request |
| 21-30 | M13 research wire v1 | M12 KDP metadata (after D1) | 10 more pages; first circle held | Horizons NYC meetup, Oct 15-17 (days 21-23); follow-ups |

Planning targets for day 30, from a zero baseline (targets, not forecasts): 40-120 leads, mostly circle registrations and Finder-to-journal sign-ups, plus 3-8 B2B conversations (training programs and centers). Search and AI moves (M1, M2, M3, M14) are expected to deliver after day 30; the day-30 leads come from M4, M5, M6 and M11.

## 3. Six-month compounding

- Month 2: all 40 JS pages live; 8 videos a month; 2 programs using the casebook; JSI v1.1 released (Zenodo versions the DOI).
- Month 3: the podcast feed built from the audiobook (M9); the research wire monthly (M13); the first guest article (M10); the Colorado NMD listing (M7).
- Month 4: cohort licensing for the casebook; a kit variant for New Mexico before its launch at the end of 2026 [mkt-03]; a midlife landing page [mkt-14, mkt-ws-07].
- Months 5-6: a draft pre-FDA "between sessions" companion (COMP360 launch expected H1 2027 if approved [mkt-04, mkt-ws-05]); a Psychedelic Science 2027 proposal when its call opens [niche-evt-ps2027, UNVERIFIED]; Wikidata items once independent references exist; the Knowledge Panel claim [goog-06].
- Category KPIs at month 6. These are the bar, and whether they can be reached is UNVERIFIED: the term used on 20 or more external pages (Alerts); 5 or more programs teaching JS vocabulary; 500 or more DOI downloads; the site cited in AI answers for 10 or more scenario queries (the Search Console AI report and Bing's AI report); 300 or more leads a month carrying a js_id.

## 4. Measurement spec

UTM (utm_source / utm_medium / utm_campaign):

| Move | source | medium | campaign |
|---|---|---|---|
| M3 | zenodo, github | repository | jsi-v1 |
| M4 | hn, psychedelics-com | community, directory | scenario-finder |
| M5 | trainer-<program> | b2b | casebook |
| M6 | or-svc-<slug>, co-hc-<slug>, nm-clinic-<slug> | print-qr | take-home-kit |
| M7 | co-nmd, fireside, zendo, psychedelics-com | directory, referral | jsi |
| M8 | youtube | video | js-<nn> |
| M9 | podcast-jsi | audio | js-<nn> |
| M10 | podcast-<show>, <outlet> | audio, guest-article | jsi-tour |
| M11 | eventbrite, maps-cal, horizons | event | circle-js<nn> |
| M12 | book | ebook, print, audio | backmatter |
| M13 | psilowire, newsletter | domain, email | wire, wire-<yyyymm> |

GA4 events and parameters: scenario_view {js_id}; tool_start {tool, from_js}; finder_start; finder_complete {js_id}; lead_submit {source, js_id}; kit_view {center}; kit_download {center}; casebook_request {program}; event_register {circle}; digest_signup; term_copy_citation; audiobook_click; book_click {retailer}. js_id is registered as an event-scoped custom dimension. The parallel measurement workflow owns implementation [goog-34].

Category-adoption metrics, reviewed monthly: Alerts hits on the terms; Search Console queries containing "JS-" or "scenario"; Search Console Generative AI and Bing AI Performance citations [goog-02, eng-bing]; Zenodo downloads and OpenAlex citations of the DOI (F9 method); programs using the casebook; directory listings won.

## 5. Deliberately not doing (dead, restricted or already failed)
- Google Ads or any paid search: Google bans ads for services that facilitate recreational drug use [mkt-x-01, niche headline].
- FAQ rich results as a lever: removed as of 2026-05-07 [google headline]. Google Podcasts: DEAD [google headline].
- subredditstats.com: DEAD [mkt-x-03]. The MAPS Integration List: DEAD [market+]. The Shepherd name: DEAD, now Book DNA [books+]. Findaway Voices: now Voices by INaudio [books headline].
- KDP Select, while the site sells the ebook [book-kdp-select].
- Paid podcast slots and paid links; any paid link must be rel=sponsored [web-spam-redlines].
- Bulk posting on Reddit. Live subscriber counts were blocked (F13) and stay UNVERIFIED; participation is value-first only [niche-com-r-psychedelictherapy].
- Maya editing Wikipedia, or a Wikipedia article made to promote the book (F8).
- Psychedelic Passage-style sourcing content: a brand and legal risk [niche+].

## 6. Risks and red lines
1. Health and legal: everything stays educational and non-clinical, with no dosing or sourcing. Every JS page, the Finder and the kit carry "when to seek qualified help" and 62-FIRESIDE. YouTube treats psilocybin as a hard drug [google headline]; a strike would cost M8 and M9.
2. Term collision: "integration scenarios" belongs to enterprise software in Google autocomplete (F1). Only "journey scenario" and "JS-nn" are used.
3. Zenodo scope: out-of-scope content is removed and its DOI revoked (F11). The report must be descriptive and referenced.
4. Licensing: CC BY-NC covers the summaries only. The book text stays all rights reserved; a lawyer should read the licence text before v1.0.
5. Time to value: the category moves (M1-M3, M14) pay after day 30. The 30-day leads depend on M4, M5, M6 and M11 being executed, not just planned.
6. The D1 ISBN defect blocks M12 and the Book JSON-LD isbn [book-isbn-defect].
7. B2B consent: centers and programs decide placement. No outreach claims endorsement.
8. Attribution drift: if others adopt "scenario-based integration" without the Index, Maya loses credit. M3's DOI and M14's single sentence exist to prevent that.

## 7. Not done / UNVERIFIED (read live, could not confirm)
- Trademark availability of "Journey Scenario Index" (USPTO not checked).
- Oregon training-curriculum rule text on integration (F14: not retrieved).
- Phrase-level Bing rankings from a script: Bing ignored the quotes and returned generic pages, and DuckDuckGo's bot check blocked the quoted queries (F7). The absence of competing uses of the candidate terms is UNVERIFIED.
- Reddit community sizes (F13).
- Whether the site has an email capture today (belongs to the conversion workflow).
- The audiobook release date; KDP's rules on links inside ebooks; the topic of the Colorado 2026-10-08 hearing; whether Google Scholar indexes Zenodo DOIs; the rel attribute of links on YouTube, Goodreads and Fireside.
- The day-30 and month-6 numbers are targets, not measurements.
- Nothing here has been built, posted, submitted or signed up for. This is a plan only.

## 8. Fresh live evidence log (all GET, UTC 2026-09-24)
- F1 Google autocomplete, suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us, read 22:53:44Z. "psilocybin integration" -> guide, therapy, coach, workbook, therapist, questions, journal, reddit, post psilocybin integration. "psychedelic integration" -> therapy, coach, therapist, coach jobs, coaching certification, coach training, training, coach salary, book. "integration scenarios" -> in sap grc, in salesforce, in sap, in servicenow, testing scenarios. "psilocybin aftercare" and "psilocybin integration questions" -> the phrase only. "psychedelic integration framework", "psychedelic aftercare" -> no suggestions.
- F2 https://www.mayaallan.com/glossary, read 22:53:08Z: one DefinedTermSet with 25 DefinedTerms (ego dissolution, integration, set, setting, DMN, REBUS model ...). None is coined by the site.
- F3 https://www.mayaallan.com/methods, /scenarios and /integration-journal, read 22:52:54Z. /methods covers IFS, Clean Language, Coherence Therapy, Integration Journal and MI (OARS). /scenarios is titled "Psilocybin Journey Scenarios". /integration-journal has FAQPage (6 questions), SoftwareApplication and Offer.
- F4 https://www.mayaallan.com/faq, read 22:53:15Z: "each scenario follows Description, Cause, Navigation, Lesson, and Example"; "The full method -- 40 scenarios in depth".
- F5 https://www.mayaallan.com/sitemap.xml (38 URLs, one scenario page) read 22:53:15Z; https://www.mayaallan.com/scenarios/ego-dissolution read 22:56:35Z: Article, CreativeWorkSeries and WebPage schema, with sections "When to seek qualified help", "Integration afterward" and "References". The /scenarios hub links only that page.
- F6 https://www.mayaallan.com/books/psilocybin-integration-guide, read 22:57:11Z: "educational, non-clinical resource ... offers practical frameworks". No isbn, offers or workExample keys found.
- F7 https://html.duckduckgo.com/html/?q=psilocybin+integration+guide, read 22:54:31Z: #1 the mayaallan.com book page, #2 Google Books, #3 Amazon paperback, #4 mindfulmyco.org, #5 a psychedelicstoday.com practitioners guide, #6 Amazon Kindle, #7 barnesandnoble.com, #8 a MAPS Integration Workbook PDF. Quoted queries returned DDG's "anomaly" bot check. Bing via script (22:54:06Z-22:54:21Z) ignored the phrases, so it is not used as evidence.
- F8 https://en.wikipedia.org/w/api.php (titles query), read 22:54:53Z: "Psychedelic integration", "Psychedelic integration therapy" and "Integration (psychedelics)" are MISSING, with no redirect. Wikimedia pageviews API (user agents, monthly Jun/Jul/Aug 2026): Psilocybin_therapy 2,169/2,359/2,777; Set_and_setting 2,517/2,385/2,429; Psilocybin_mushroom 52,462/45,465/44,105; Psilocybin 43,273/40,080/41,372.
- F9 https://api.openalex.org/works, read 22:55:05Z and 22:55:44Z. Titles with "psychedelic integration": 28 (2021:1, 2022:3, 2023:7, 2024:5, 2025:7, 2026:5); "psilocybin integration": 2. Title or abstract: 76 (2021:4, 2022:6, 2023:11, 2024:10, 2025:26, 2026:19). Most cited: 10.3389/fpsyg.2022.824077 (168); 10.1556/2054.2022.00232, psilocybin truffle retreat integration challenges (59); 10.1556/2054.2023.00306 (48); 10.1037/pha0000684 (29); 10.3389/fpsyg.2022.863247, Psychedelic Integration Scales (29).
- F10 https://schema.org/DefinedTerm, read 22:55:44Z: the page includes termCode and inDefinedTermSet.
- F11 https://about.zenodo.org/policies/ (Last-Modified 2026-09-17), read 22:56:17Z: "All fields of research. All types of research artifacts."; 50GB per record; metadata CC0, exported via OAI-PMH; out-of-scope content removed and its DOIs revoked.
- F12 GitHub Docs "About CITATION files" (docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files) and https://help.zenodo.org/docs/github/, read 22:57:00Z: CITATION.cff adds "Cite this repository" to the repository sidebar and can cite things other than software; Zenodo can "Archive a release from GitHub".
- F13 https://www.reddit.com/r/<name>/about.json for PsychedelicTherapy, microdosing, Psychonaut, RationalPsychonaut and PsychedelicStudies, read 22:55:44Z: an HTML block page came back instead of JSON, so the counts are UNVERIFIED.
- F14 Oregon OAR 333-333 training-curriculum text: secure.sos.state.or.us and oregon.public.law, 22:55:55Z-22:56:11Z, not retrieved; UNVERIFIED.
- F15 Branch work/site-visibility head before saving: b992ef03676cd0dcb2fdce9c86f24955fb8d6328 (22:52:48Z).