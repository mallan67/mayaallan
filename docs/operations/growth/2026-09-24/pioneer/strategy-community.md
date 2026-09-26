# Community and movement strategy for Maya Allan (pioneer track)

- Date: 2026-09-24. Role: community / movement builder (free circles and events, newsletter-led community, reader stories, word of mouth, event platforms).
- Repo and branch: mallan67/mayaallan, branch work/site-visibility, folder docs/operations/growth/2026-09-24/pioneer/.
- Inputs: the six checked maps in this folder (item ids cited in brackets, e.g. [mkt-01], [goog-17], [niche-evt-horizons]) plus the fresh live reads in section 1 (L1-L20). Every fresh claim carries its URL, the page date where one is shown, and the UTC read time.
- UNVERIFIED means the live source could not be read today. Nothing was filled from memory. Nothing was posted, submitted, signed up for or sent.
- A lead in this document means an email address given with consent (newsletter or event registration) or a named B2B conversation (a center, facilitator, training program or partner that replies).

## 0. The answer in one paragraph

The book already wins the small search niche (#5 on Amazon for "psilocybin integration", #1 on Bing for the exact title [books map, market map]). Search alone has produced no leads in a month. The unclaimed ground is the weeks after a psilocybin experience. Oregon's live Q2 2026 file (L6) shows 525 of 1,220 licensed clients came from other US states and 20 from abroad, and 493 of the 834 clients who gave an age (59.1%) were 45 or older. They go home to no local support. The research in the market map shows that people who struggle afterwards cope mostly by reading and journaling. Maya already has the curriculum: the book's 40 scenarios, a glossary, four free tools and a free 7-day journal PDF. The pioneer move is to turn that curriculum into gatherings:

1. A free, recurring, 40-minute online "Back Home Circle".
2. An open circle-in-a-box that any facilitator or psychedelic society can run. This copies the Death Cafe social-franchise model: one free guide plus one listings page has produced 24,649 gatherings in 100 countries (L17).
3. A newsletter that doubles as the circle calendar.
4. A stream of anonymous reader stories that fill the 39 missing scenario pages.

Every circle, kit and listing carries a tagged link home. The site already records `newsletter_subscribed` with a `source` field and first-touch and last-touch UTM cookies (L4), so every move below can be counted from day one.

## 1. Fresh live evidence (read 2026-09-24, times UTC)

| # | Fact | Source (page date) | Read |
|---|---|---|---|
| L1 | The homepage has the only newsletter form ("Stay Connected ... Expect 1-2 emails per month", posting to /api/subscribe). /events, /books, /scenarios, /glossary and all four tool pages have 0 email inputs. /events says "No events are currently scheduled." | https://www.mayaallan.com/ , /events, /books, /scenarios, /glossary, tool pages | 22:52:59Z-22:53:26Z |
| L2 | The Integration Journal is a free 7-day PDF in four versions (Preparation, Journey companion, Integration, Shadow work): "Free, no email required, no login." | https://www.mayaallan.com/integration-journal | 23:02:33Z |
| L3 | /circles, /stories, /press, /events.ics and /feed.xml all return 404. The sitemap has 38 URLs, including only 1 scenario page (/scenarios/ego-dissolution). | https://www.mayaallan.com/sitemap.xml | 23:01:00Z |
| L4 | Repo main ed7461a0 (pushed 2026-09-24T22:51:30Z) already has an events CMS (src/app/admin/events, src/app/events/[slug]). `generateEventSchema` in src/lib/structured-data.ts outputs a Place with a name only: no address, no eventAttendanceMode, no offers. `ALLOWED_EVENT_NAMES` in src/lib/marketing-events.ts includes newsletter_subscribed, tool_started, tool_completed and download_started. /api/subscribe stores `source` (up to 64 characters) and reads the UTM touch cookies. Resend broadcast newsletter code is present (src/lib/resend-newsletter.mjs). | https://github.com/mallan67/mayaallan (main) | 22:56:45Z-22:57:28Z |
| L5 | Google Event rich results require location.address. "Virtual experiences that have no real-world component aren't supported. Events must take place in a physical location." | https://developers.google.com/search/docs/appearance/structured-data/event (updated 2026-09-08) | ~22:58Z |
| L6 | Oregon OPS Q2 2026 (Apr 1-Jun 30): 1,220 clients; OtherInsideUS 525 (43.0%); OutsideUS 20; Multnomah County 101, the largest reported county. 834 clients gave an age: 493 (59.1%) were 45+ and 131 were 65-79 (80+ suppressed). Visit reasons: change of perspective 444, expanded consciousness 403, anxiety 383, depression 358, PTSD 204, spirituality 198, end of life 17. The market map's "71% out of state" divides by reported counties only; this strategy uses the all-clients figure, 43%. | https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/OPS-Data-File-2026-Q2.csv | 22:59:35Z-22:59:54Z |
| L7 | Colorado DORA open data, active licenses: Natural Medicine Facilitator (NMF) 86, Clinical Facilitator (NMCF) 94, In Training (NMIT) 691, Training Program (NMTP) 11. Of the 871 active NMF+NMCF+NMIT: Denver 120, Boulder 95, Colorado Springs 40, Fort Collins 30, Lakewood 30. Out-of-state addresses: CA 42, OR 23, TX 22, NY 16. | https://data.colorado.gov/resource/7s5z-vewr.json (rows updated 2026-09-24T10:35:05Z) | 22:59:05Z-22:59:19Z |
| L8 | Eventbrite's online "psychedelic integration" page 1 is full of recurring circles: a bi-weekly integration group, the PsyCare Integration Circle "+ 14 more dates", a "Free Psychedelic Integration Circle", somatic circles. It also lists "Psychedelics After 65" (Oct 6). Free events: "Publish unlimited free events at no cost". Paid tickets: 3.7% + $1.79 per ticket plus 2.9% processing. Eventbrite claims "89M monthly users". | https://www.eventbrite.com/d/online/psychedelic-integration/ ; https://www.eventbrite.com/organizer/pricing/ (no page date) | ~22:54Z; ~22:58Z |
| L9 | Meetup's online "psychedelic integration" search: 12 events, 1-85 attendees each (Psychedelic Breathwork 70; a weekly group integration circle 2; Baltimore Psychedelic Society women's circle 3). | https://www.meetup.com/find/?keywords=psychedelic%20integration&source=EVENTS&eventType=online | ~22:54Z |
| L10 | Luma: "Use Luma for free with unlimited events and guests". 5% fee on paid events (0% on Luma Plus). The free plan includes email/SMS/WhatsApp blasts, up to 500 weekly invites and Zoom integration with attendance tracking. The Books category has 719 events and 2K subscribers; Wellness has 949 events. | https://luma.com/pricing ; https://luma.com/books ; https://luma.com/discover (no page dates) | ~22:54Z-22:58Z |
| L11 | Zoom Basic (free): "40 minutes max per meeting, 100 participants max per meeting". | https://www.zoom.com/en/products/meetings/ | 23:00:36Z |
| L12 | MAPS event calendar submission is open to anyone. It requires a ticketing URL, horizontal and square images, expected attendance, and accessibility and equity notes. MAPS "generally will not contact you" (reduced staff). Approved events go to maps.org/take-action/events. | https://maps.org/event-calendar-submission/ | ~22:54Z |
| L13 | Horizons 2026: New York, Oct 15-17, New York Academy of Medicine. Community Allies "can also produce their own off-site events during conference week"; details of the ally program are "available shortly". The partners page has 64 external links, 0 nofollow. Allies include Brooklyn Psychedelic Society (BPS), CIIS, Chacruna, DoubleBlind, Global Psychedelic Society, Heroic Hearts, MAPS, Psychedelics Today, SSDP and Tricycle Day. | https://horizonsconference.org/ ; /partner-interest ; /partners | ~22:55Z; 22:57:50Z |
| L14 | BPS events: Queer Psychedelic Integration Circle (Sun Sep 27, Prospect Park); BPS Salon Series "Integrating Eco-Grief" with a guest facilitator (Oct 25). | https://www.bps.community/events | ~22:55Z |
| L15 | Fireside Project resources: "Integration Circles & Therapists" (13), "Preparation Tools" (1 tool), "Community Resources" (8); 21 external links, 0 nofollow. It still links integration.maps.org, which timed out after 15 s at 22:56:02Z (the MAPS Integration List is DEAD per the market map). Fireside home: 40,000 conversations, 1,100 calls a month, 700 volunteers trained, "Call or text 62-FIRESIDE" from 11:00 a.m. Pacific. "Spread the Word" offers print and digital kits for community partners and ambassadors as open Google Drive folders, with no application. | https://firesideproject.org/resources ; https://firesideproject.org/ ; https://firesideproject.org/spread-the-word | 22:55:24Z-~23:00Z |
| L16 | Colorado NMD Third-Party Educational Resources: "If you would like to recommend an organization to the Division, please fill out this form" (a Google Form). Listed now: public bodies, research centers, nonprofits and a Harm Reduction section (Zendo, Erowid, Fireside, Unlimited Sciences). | https://nmd.colorado.gov/third-party-educational-resources | 22:54:37Z-22:54:44Z |
| L17 | Death Cafe: "So far we've held 24649 Death Cafes", in "100 countries". Anyone who follows the free guide may host and "Post your Death Cafe" on the site. | https://deathcafe.com/ ; https://deathcafe.com/how/ | 22:58:30Z |
| L18 | Kit Creator Network: 74,000 creators; free and paid recommendations. beehiiv: free recommendations on all plans; paid recommendations (formerly Boosts) only on Scale/Max. | https://kit.com/features/creator-network ; https://www.beehiiv.com/features/boosts (no page dates) | ~22:58Z |
| L19 | Zenodo: every upload gets a DOI, "registered within seconds"; run by CERN and OpenAIRE; currently notes slowness from bot and AI-crawler traffic. | https://zenodo.org/ | ~23:00Z |
| L20 | Google Calendar can subscribe to a public iCal URL ("Other calendars" > "From URL"). | https://support.google.com/calendar/answer/37100 | ~23:00Z |
| X | UNVERIFIED today: Reddit (about.json returned 403 at 22:53:44Z, so subreddit sizes exist only as the GummySearch third-party mirror in the niche map); Global Psychedelic Society locator (captcha at 22:56:05Z); Meetup group lists for Portland and Denver (not rendered); Meetup organizer fees; Substack recommendation help (403); Google Meet free-call limits; the rel attribute of links on Luma, Eventbrite and MAPS event pages. | - | 22:53Z-23:01Z |

## 2. The moves (14)

Each move lists venues, steps, owner (code PR / owner account / content / outreach), effort, when the first lead could plausibly arrive, how it is measured, and the evidence it rests on. Day 1 = Fri 2026-09-25.

### M1. The flagship: a free 40-minute "Back Home Circle", online, twice a month

- **Venues:** Luma (event plus calendar), Eventbrite (online discovery), mayaallan.com/events, the MAPS community calendar, and optionally Meetup (organizer fee UNVERIFIED).
- **Steps:**
  1. **Format:** 40 minutes on Zoom Basic, which fits the free 40-minute cap and holds up to 100 people (L11). 5 minutes of grounding from the Nervous System Reset tool; 10 minutes of Maya reading one book scenario; 20 minutes of peer sharing on that scenario's prompts; 5 minutes to close with the 62-FIRESIDE and 988 lines. It is peer and educational: no dosing, no sourcing, not therapy.
  2. **Schedule:** 2nd Thursday at 5:00 pm PT / 8:00 pm ET and 4th Sunday at 10:00 am PT. The first two are Thu 2026-10-08 and Sun 2026-10-25.
  3. Publish each date on Luma, Eventbrite and /events. Every link back to the site carries a UTM tag.
  4. Add an unticked registration question, "Send me the Integration Letter". Import only the people who tick it into Resend, tagged `src:<platform>-circle-<yyyymmdd>`.
  5. Submit the series to the MAPS calendar with both image sizes (L12).
  6. After each circle, send a recap with the scenario, the matching free tool and the next date.
- **Owner:** owner account (Luma, Eventbrite, Zoom); content (session script, two images); code PR (M2, for the site listing).
- **Effort:** 5 hours setup, then 2 hours per session.
- **First lead:** day 3-5, when registrations start after the listings go live.
- **Measure:** registrations per platform. Links use `utm_source=luma|eventbrite|maps-calendar|meetup&utm_medium=event-listing&utm_campaign=back-home-circle-2026-10`. Site events: `event_registered` (new, M2) and `newsletter_subscribed` with source `circle-<yyyymmdd>`. Test target: at least 25 registrations across the two October sessions. Basis: comparable online events draw 1-85 attendees (L9).
- **Evidence:** L6, L8-L12; [mkt-01], [mkt-05], [mkt-14], [niche-com-eventbrite], [niche-evt-maps-calendar]; the openweb map's Eventbrite and Luma entry (its /events page was empty then too).

### M2. Code PR: make the site the hub that every listing points to

- **Venues:** mayaallan.com; Google Search event results; Google Calendar.
- **Steps (one PR through work/active, then Actions, then Maya merges):**
  - (a) Add an optional email field, with a `source` value, to /events, /events/[slug], the four tool pages, /scenarios and /glossary. Sources: `tool-journal`, `tool-reflection`, `tool-belief`, `tool-reset`, `event-<slug>`, `scenarios`, `glossary`. The journal keeps its promise ("no email required", L2): the opt-in sits below the download button and is never required.
  - (b) Extend the events table and `generateEventSchema` with `eventAttendanceMode`, `eventStatus`, `offers` (price 0 plus the URL), a `registration_url` column, `VirtualLocation` for online events and `PostalAddress` for in-person events. Organizer should point at the Person @id [web-schema-graph]. Online-only events will never get Google event rich results (L5), so the address fields matter for M12.
  - (c) Add a public iCal feed at /events.ics and an "Add to Google Calendar" link on each event (L20).
  - (d) Add `event_registered`, `share_clicked`, `story_submitted` and `census_completed` to `ALLOWED_EVENT_NAMES`.
  - (e) Add a support box (62-FIRESIDE, 988, 911) to the tool, event and scenario pages (M7).
- **Owner:** code PR.
- **Effort:** 1.5-2 developer days.
- **First lead:** the day it deploys. The tool pages already get visits (`tool_started` and `tool_completed` exist) but offer no way to subscribe.
- **Measure:** `newsletter_subscribed` grouped by `properties.source`; `event_registered`; the Search Console Events report once an in-person event exists.
- **Evidence:** L1-L5, L20; [goog-23], [goog-24], [web-schema-graph].

### M3. The Integration Circle Kit: an open social franchise (the Death Cafe model)

- **Venues:** a new /circles hub; psychedelic societies (the Global Psychedelic Society is a Horizons ally, L13, but its locator is UNVERIFIED); BPS; the Fireside resources page (L15); training programs; retreats [niche-b2b-retreats].
- **Steps:**
  1. Write a 12-page host guide covering the M1 format, the safety and referral script, and what hosts must not do (dosing, sourcing, diagnosis). Add 40 scenario prompt cards, one per book scenario, each with a QR code to its scenario page once that page exists. Add a sign-in sheet with an opt-in line.
  2. License: free to use with the attribution line "Prompts from The Psilocybin Integration Guide by Maya Allan - mayaallan.com/circles". No resale.
  3. Downloading needs no email; offer an optional "host updates" email opt-in (`download_started` with kit=circle-kit; `newsletter_subscribed` with source=circle-kit).
  4. Add a "Post your circle" form that feeds a moderated listing on /circles and /events. In-person listings output Event JSON-LD with an address.
  5. Ask every host to link to /circles from their own event page.
- **Owner:** content (guide, cards); code PR (/circles, form, moderation); outreach.
- **Effort:** 3-4 days of content, 1.5 days of code.
- **First lead:** day 10-14, from kit downloads with opt-in.
- **Measure:** `utm_source=circle-<city-or-host>&utm_medium=community&utm_campaign=circle-kit`; the number of posted circles; kit downloads; referring domains linking to /circles.
- **Evidence:** L17 (24,649 gatherings in 100 countries from one free guide and one listings page); L15; [mkt-15], [mkt-11], [web-assets].

### M4. Returners: facilitators hand clients an invitation, not a sales pitch

- **Venues:** Oregon's 22 operating service centers and 383 licensed facilitators [mkt-01]; Colorado's 86 active facilitators and 94 active clinical facilitators (L7) and 46 healing centers [niche-b2b-co-centers].
- **Steps:**
  1. Print a business-size card, also as a PDF: "Going home after your session? A free Back Home Circle twice a month plus a free 7-day integration journal." Each center gets its own QR code.
  2. Email center owners through the official directories [niche-b2b-or-centers]. Attach the card PDF and offer 50 free printed cards. The ask is to put it in the aftercare packet, which centers already have to offer (ORS 475A.360 per the market map).
  3. Offer each facilitator a free seat in M5.
  4. Add a "Back home in <state>" section to /circles.
- **Owner:** outreach, content.
- **Effort:** 1 day, then 2 hours a week of outreach.
- **First lead:** day 14-21 (a reply from a center, or the first QR scan that turns into a registration).
- **Measure:** `utm_source=or-svc-<slug>|co-hc-<slug>|fac-<slug>&utm_medium=print-qr&utm_campaign=back-home-circle`, landing on /circles/back-home.
- **Evidence:** L6 (525 of 1,220 Q2 clients from other US states, 20 from abroad), L7; [mkt-01], [mkt-02], [mkt-ws-01], [niche-b2b-or-centers].

### M5. "Scenario Case Circle" for facilitators and trainees (a B2B community)

- **Venues:** Colorado's 11 active training programs and 691 active trainees (L7); Oregon's 15 active training programs [market map]; the Third Wave and Fireside coaching certifications [market map, missing items]; CIIS [niche-edu-ciis].
- **Steps:** a monthly 40-minute online case study on one scenario: what a client might report, what helps, and when to refer. Invite through training-program directors, never by cold-contacting individual licensees. After 3 sessions, offer the facilitator casebook and bulk pricing [mkt-ws-04].
- **Owner:** outreach, content.
- **Effort:** 2 hours a session plus 3 hours a week of outreach.
- **First lead:** day 10-20 (a program director's reply counts as a B2B lead).
- **Measure:** `utm_source=trainer-<program>&utm_medium=b2b&utm_campaign=case-circle`; `event_registered` with source=case-circle; the number of director conversations; bulk enquiries through `contact_submitted`.
- **Evidence:** L7 (Denver 120 and Boulder 95 of 871 active licensees and trainees); [mkt-09], [mkt-10], [niche-edu-or-programs].

### M6. Horizons week in NYC (Oct 15-17): co-host rather than exhibit

- **Venues:** Horizons (L13); BPS, an ally that runs integration circles and a salon series with guest facilitators (L14); allies Psychedelics Today and Chacruna.
- **Steps:**
  1. This week, email BPS. Propose a free off-site salon during Horizons week, "After the journey: integration scenarios", or a Salon Series date in November, with Maya as guest facilitator in BPS's format.
  2. Bring the M3 cards with QR codes.
  3. Buy the Friday+Saturday community pass ($300 [niche-evt-horizons]) only if the salon is confirmed.
  4. Send every ally contact the kit within 48 hours.
- **Owner:** outreach (Maya).
- **Effort:** 1 day plus the event.
- **First lead:** day 21-23.
- **Measure:** `utm_source=bps|horizons&utm_medium=partner-event|print-qr&utm_campaign=horizons-2026`.
- **Evidence:** L13, L14; [niche-evt-horizons]; the niche map's missing item on Horizons-week off-site events.

### M7. Safety line and referral listings (Fireside, Colorado NMD)

- **Venues:** Fireside Project; the Colorado Natural Medicine Division resources page.
- **Steps:**
  1. In code, add a 62-FIRESIDE / 988 / 911 box to every tool, circle and scenario page.
  2. Download Fireside's "Spread the Word" community-partner kit (open Drive folder, no application) and use it at circles.
  3. Email Fireside. Propose the free Integration Journal for "Preparation Tools" (which lists 1 tool today) and the Back Home Circle for "Integration Circles & Therapists". Mention that their integration.maps.org link timed out (L15), as a helpful note rather than a pitch.
  4. Submit the free tools through the Colorado NMD recommendation form (L16). Acceptance is unlikely because the list favors public bodies and nonprofits.
- **Owner:** code PR, outreach.
- **Effort:** half a day.
- **First lead:** day 30-60 (after a listing appears).
- **Measure:** `utm_source=fireside|co-nmd&utm_medium=referral&utm_campaign=resource-listing`; referral sessions. The Fireside page uses followed links (0 nofollow, L15).
- **Evidence:** L15, L16; [niche-npo-fireside], [mkt-07], [mkt-ws-09].

### M8. The 7-Day Integration Cohort: turn the free PDF into a shared ritual

- **Venues:** /integration-journal; Resend; the M1 circles.
- **Steps:** A cohort starts on the 1st of each month. People download the existing free journal (it stays "no email required"). They can opt in to 7 daily emails, each with one prompt and one scenario, and they meet on day 7 in the Back Home Circle. The Resend broadcast code is already in the repo (L4). Add a psilocybin-microdosing variant later [mkt-ws-08].
- **Owner:** content (7 emails); code PR (opt-in on the journal page, source=cohort-7day).
- **Effort:** 1.5 days.
- **First lead:** day 7-10.
- **Measure:** `newsletter_subscribed` with source=cohort-7day; Resend opens and clicks; the share of cohort members who register for a circle.
- **Evidence:** L2, L4; the market map's coping finding (reading and journaling, Robinson et al. 2024); [book-companion-journal], [book-bookfunnel-storyorigin].

### M9. "The Integration Letter": the newsletter as the backbone of the community

- **Venues:** the existing homepage form (L1) plus the M2 capture points; Resend; newsletter swaps.
- **Steps:**
  1. Rename "Stay Connected" (1-2 emails a month) to a twice-monthly letter. Each issue carries the next circle dates, one scenario, one anonymous reader story (M10) and one community listing (M3). Tag every link.
  2. Add the Google Preferred Sources link to the footer [goog-08].
  3. Grow through manual swaps with small integration newsletters and podcasts [niche-pod-integration-small], and through BookFunnel or StoryOrigin swaps [book-bookfunnel-storyorigin].
  4. Do not switch providers now. Kit (74,000 creators) and beehiiv (free recommendations on every plan) are the fallback only if the swaps prove there is demand (L18).
- **Owner:** content, owner account.
- **Effort:** 3 hours an issue.
- **First lead:** ongoing, from M2 onward.
- **Measure:** `utm_source=newsletter&utm_medium=email&utm_campaign=letter-<nn>`; list growth by source; replies.
- **Evidence:** L1, L4, L18; [web-substack] (followed links, a possible mirror later).

### M10. Anonymous integration stories and an Integration Census (reader content that earns links)

- **Venues:** /stories (new); Zenodo; Chacruna, Lucid News, Psychedelics Today and The Microdose.
- **Steps:**
  1. Build /stories/submit: an anonymous story form with explicit consent, tagged to a scenario number, going into a moderation queue. Strip names, places, dates, dosing and sourcing. Publish selected stories on the matching scenario page; 39 of the 40 pages do not exist yet (L3).
  2. Run the Integration Census each quarter: 10 anonymous questions such as "what helped in the first 30 days?". Publish the totals on the site with a free Zenodo DOI (L19).
  3. Pitch the census results to Chacruna, Lucid News and Psychedelics Today (followed links in the niche map's samples), and send The Microdose a news tip.
- **Owner:** code PR, content, outreach.
- **Effort:** 3 days to build, then 2 hours a week of moderation.
- **First lead:** day 14-30.
- **Measure:** `story_submitted` and `census_completed`; newsletter opt-ins with source=stories or source=census; earned links; `utm_source=census&utm_medium=pr`.
- **Evidence:** L3, L19; [web-assets], [niche-pub-chacruna], [niche-pub-lucidnews], [niche-pub-psychedelicstoday], [niche-pub-microdose]; the Google map's missing item that review snippets must be genuine and on the page.

### M11. A midlife and 65+ circle track

- **Venues:** M1 infrastructure; older-adult podcasts; the organizer of "Psychedelics After 65" (L8); end-of-life doulas (NEDA) [market map, missing items].
- **Steps:** a quarterly "Midlife Integration Circle" plus a 65+ edition, each with its own landing section. Propose a co-hosted session to the "Psychedelics After 65" organizer. Pitch 2 older-adult podcasts a month.
- **Owner:** content, outreach.
- **Effort:** 1 day plus each session.
- **First lead:** day 20-30.
- **Measure:** `utm_campaign=midlife-circle`; registrations; `newsletter_subscribed` with source=midlife.
- **Evidence:** L6 (493 of 834 clients aged 45+; 131 aged 65-79; 17 end-of-life visits), L8; [mkt-14], [mkt-ws-07].

### M12. In-person pilots in the legal states, run by local hosts (Portland; Denver/Boulder)

- **Venues:** local public or community rooms; /events with a full address; local Eventbrite and Meetup listings; Google Search event results and Maps.
- **Steps:** From M3 and M5, recruit one host per city to run a monthly in-person circle. Maya joins by video for the scenario reading. List each circle with its street address so it qualifies for event rich results (L5).
- **Owner:** outreach, owner account, content.
- **Effort:** 1 day per city plus host support.
- **First lead:** day 30-45.
- **Measure:** `utm_source=circle-portland|circle-denver&utm_medium=community`; Search Console event rich-result impressions; registrations.
- **Evidence:** L6 (Multnomah 101, the largest reported county), L7 (Denver 120, Boulder 95), L5; [goog-23], [mkt-01], [mkt-02].

### M13. Word of mouth built into the tools

- **Venues:** /integration-reflection, /integration-journal, /belief-inquiry, /nervous-system-reset.
- **Steps:** After `tool_completed`, offer three links: "Invite a companion" (prefilled text with a link to the free tool and the next circle), "Bring a friend to the circle" and "Gift the guide". Nothing from the user's own entries is ever shared.
- **Owner:** code PR.
- **Effort:** half a day to 1 day.
- **First lead:** day 7 or later after deploy.
- **Measure:** `share_clicked`; `utm_source=tool-<name>&utm_medium=share&utm_campaign=invite`; `newsletter_subscribed` with source=share.
- **Evidence:** L4 (`tool_completed` already exists).

### M14. Audiobook: a waitlist now, listen-along circles and a podcast feed later

- **Venues:** /books; YouTube (RSS podcasts), Apple Podcasts, Spotify; live listen-along circles.
- **Steps:**
  1. Now: add an "Audiobook early listener list" opt-in to /books (source=audiobook-waitlist).
  2. When the master is ready: launch an RSS show, "Integration Scenarios", with one scenario per episode, and host a monthly live listen-along. Cut shorts from it [mkt-ws-02].
  3. YouTube live features need the Intermediate feature tier, which requires phone verification [google map, missing items].
- **Owner:** content, owner account, code PR.
- **Effort:** 1 hour for the waitlist; 1-2 days for the feed once the master exists.
- **First lead:** waitlist sign-ups from day 3-7; feed leads after the audiobook is released (release date UNVERIFIED).
- **Measure:** `utm_source=youtube|apple-podcasts|spotify&utm_medium=audio&utm_campaign=scenario-<n>`; `newsletter_subscribed` with source=audiobook-waitlist.
- **Evidence:** [goog-15], [goog-17], [vert-apple-podcasts], [vert-spotify-podcasts], [book-voices-inaudio], [mkt-ws-02].

**Guarded, not a move:** Reddit and Discord. Participate only after reading each community's self-promotion rules live, and link only to free circles and tools (`utm_source=reddit-<sub>|discord-<server>&utm_medium=community`). Sizes are UNVERIFIED (Reddit returned 403 today). The niche map's figures come from a third-party mirror, e.g. r/PsychedelicTherapy 35k and the TripSit Discord 16,903 [niche-com-r-psychedelictherapy].

## 3. The first 30 days (Day 1 = Fri 2026-09-25)

| Days | Actions |
|---|---|
| 1-3 | Open the M2 PR (email capture, event schema, /events.ics, new event names). Set up the Luma calendar, the Eventbrite organizer profile and Zoom Basic. List circle #1 (Thu Oct 8) and #2 (Sun Oct 25). Email BPS (M6). Download Fireside's kit. Add the audiobook waitlist (M14). |
| 4-7 | Submit to the MAPS calendar. Write the seven cohort emails (M8). Design the returners card (M4). Send the first 10 training-program emails (M5). |
| 8-14 | Run circle #1 (Oct 8). Publish circle kit v1 at /circles (M3). Make the Fireside and Colorado NMD requests (M7). |
| 15-23 | Horizons week (Oct 15-17): the salon if confirmed (M6). Case circle #1 (Wed Oct 21). Open the story form (M10). |
| 24-30 | Run circle #2 (Oct 25). Send Integration Letter #1 (recap, story, next dates). Open cohort #1 for Nov 1. Review the numbers by source. |

**30-day targets.** These are assumptions to test, not forecasts: at least 25 circle registrations, at least 60 new subscribers with a recorded source, at least 10 facilitator or training-program conversations, 1 partner-hosted event and 3 circle-kit hosts. If circle registrations stay under 10 after two sessions, move the time slot and lean harder on M4 and M5 (partner distribution) instead of adding more listings.

## 4. How it compounds over six months

- **Month 2:** first outside hosts; cohorts #1 and #2; the census opens.
- **Month 3:** census report #1 with a DOI, pitched to the media; the first in-person host in Portland or Denver.
- **Month 4:** the audiobook feed and listen-along, if the master is ready.
- **Month 5 (end of 2026):** the New Mexico program launch window [mkt-ws-06], [niche-dir-nm-mpp]. Add a New Mexico returners section. Offer the facilitator casebook to programs whose staff attended at least 3 case circles.
- **Month 6:** proposals for Psychedelic Science 2027 [niche-evt-ps2027]; draft a companion for the FDA era, since COMP360 could launch in H1 2027 if approved [mkt-04], [mkt-ws-05].

**Why it compounds:**

- Each host listing adds a followed link and a new city page.
- Each story becomes content for a scenario page.
- Each census adds a citable dataset.
- Each circle gives people a reason to open the next letter.
- Each facilitator who uses the kit hands it to clients for years.

## 5. Tagging conventions (one scheme across every venue)

- **utm_source** is the venue: luma, eventbrite, meetup, maps-calendar, bps, horizons, fireside, co-nmd, or-svc-<slug>, co-hc-<slug>, fac-<slug>, trainer-<program>, circle-<city-or-host>, newsletter, census, tool-<name>, youtube, apple-podcasts, spotify, reddit-<sub>, discord-<server>.
- **utm_medium** is the type: event-listing, community, print-qr, partner-event, referral, b2b, email, share, audio, pr.
- **utm_campaign** is the name: back-home-circle-<yyyy-mm>, circle-kit, case-circle, horizons-2026, resource-listing, cohort-7day, letter-<nn>, midlife-circle, invite, scenario-<n>.
- **Site events:** the existing `newsletter_subscribed` (with properties.source), `tool_started`, `tool_completed`, `download_started` and `contact_submitted`, plus four new ones in M2: `event_registered`, `share_clicked`, `story_submitted` and `census_completed`.
- **Newsletter `source` values** (up to 64 characters): tool-journal, tool-reflection, tool-belief, tool-reset, event-<slug>, circle-<yyyymmdd>, circle-kit, case-circle, cohort-7day, stories, census, midlife, share, audiobook-waitlist, scenarios, glossary.
- **sameAs:** add the Luma calendar URL and the Eventbrite organizer profile to Person.sameAs only after both show the same bio as the site [web-presskit], [web-schema-graph].

## 6. Guardrails

- **Scope of circles:** peer and educational only. No substances, dosing, sourcing or diagnosis; circles say "not therapy", as the tools already do. Every session has a crisis path: Fireside answers from 11:00 a.m. Pacific (L15); otherwise 988 or 911.
- **Legal review:** whether Oregon or Colorado rules limit unlicensed people from running gatherings called "integration" is UNVERIFIED. Have counsel review the host guide before M3 and M12.
- **Privacy:** stories and census answers are health-related. Collect no names. Keep the existing hashed IP/UA approach, a consent checkbox, and deletion on request. No personal data goes in the repo or in these docs. Use public directories for outreach and never republish individual licensee details.
- **Partner choice:** do not partner with brands that offer sourcing, such as the Psychedelic Passage caution in the niche map. Google Ads is not a channel for this topic [mkt-x-01].

## 7. Risks

- Circle turnout may be low: Meetup's comparable online events drew 1-85 people (L9), and Eventbrite already lists many recurring integration circles (L8). Mitigations are the partner distribution in M4, M5 and M6 and the book's specific scenario content.
- MAPS "generally will not contact you" (L12). The Horizons ally program is not open yet (L13). BPS, Fireside and Colorado NMD may decline.
- Zoom Basic stops at 40 minutes (L11). The format is built to fit; if longer sessions are wanted, the cost of a paid Zoom plan is UNVERIFIED.
- Online-only events never get Google event rich results (L5). Search visibility for events depends on M12's in-person hosts.
- Maya's time is the bottleneck: about 8-10 hours a week once everything is running. M3 and M12 move the facilitation work to hosts.
- Stories carry moderation and safety risk; the M10 rules and counsel review apply.

## 8. Not done, and still UNVERIFIED

- Nothing was created, posted, submitted or emailed. All the steps above are for Maya or a PR to carry out.
- UNVERIFIED: Reddit subreddit sizes and rules; the Global Psychedelic Society locator; Meetup groups in Portland and Denver and Meetup organizer fees; Google Meet free limits; Substack recommendation mechanics; the rel attribute of Luma, Eventbrite and MAPS event links; the Horizons ally terms; whether Fireside accepts tool suggestions; the audiobook release date; state rules on peer integration gatherings.
- The difference between the market map's 71% and today's 43% out-of-state figure is explained in L6 and needs no further check.