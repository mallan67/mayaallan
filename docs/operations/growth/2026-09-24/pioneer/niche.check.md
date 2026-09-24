# Niche venue map check (adversarial), 2026-09-24

- **What this checks:** `docs/operations/growth/2026-09-24/pioneer/05-psychedelic-niche-venues.md`, commit `e11cb89b0ea46909d97899cfc71de9b3af6cdc10` (committed 2026-09-24T19:12:04Z, confirmed live on GitHub at 2026-09-24T22:11:11Z).
- **Method:** every source was re-read live between 2026-09-24T22:11:26Z and 22:22:53Z using `curl` GET (status, final URL, raw HTML/CSV/PDF parsed in memory), WebFetch summaries, and the public Apple Podcasts search API. Each finding below gives its source URL and UTC read time.
- **Limits of this run:**
  - The WebSearch budget was used up, so no new keyword discovery was possible. The missing venues come only from pages actually fetched in this run.
  - Reddit `about.json` returned HTTP 403, so subreddit counts are UNVERIFIED.
  - `psychedelicscience.org` and `doubleblindmag.com` returned HTTP 202 (bot check), so they are UNVERIFIED.
  - The Oregon rules on where integration sessions can happen (OAR 333-333) could not be read: the rules page returned a 6.8 KB shell and the guidance PDF parse timed out. That point is UNVERIFIED.
  - One background parse wrote its output to a local temp file. It was stopped and **not read**.
- **Reachability:** all 33 cited URLs answered at 22:11:26Z–22:11:55Z. The results were HTTP 200, except `doubleblindmag.com` (202, bot check) and `helpab2bwriter.com`, which redirects (302 then 200) to `mentionmatch.com`.
- **Build note:** a single large shell command was cut off by the tool runner, so this file was committed in a few append steps. The last commit on this path holds the complete check.

## Verdict table

`keep` = worth doing for a solo author with near-zero audience in the next 90 days. `status ok` = whether the map's status field is right.

| id | keep | status ok | corrected lead value | one-line verdict |
|---|---|---|---|---|
| niche-b2b-or-centers | yes | yes | medium (high if one center adopts) | Numbers verified, but the "43% out-of-state" denominator is wrong (see below) |
| niche-b2b-co-centers | yes | yes | medium | 11 standard + 35 micro as of 9-18-26 verified; add the DORA facilitator roster |
| niche-dir-nm-mpp | yes (watch) | **no** | low until 2027 | Pre-launch: rules not written, advisory board materials not posted |
| niche-npo-fireside | yes | yes | low–medium | No "Ambassador program" and no resource-submission route; links are followed |
| niche-evt-maps-calendar | yes | yes | medium | Mechanics correct; event pages carry followed organizer links; approval is not guaranteed |
| niche-com-eventbrite | yes | yes | medium | Free events publish at no cost; crowded; about 500 results |
| niche-evt-horizons | yes | yes | medium | 19th edition and prices verified; Community Allies are organizations and program details are "available shortly" |
| niche-evt-phf | **no** | yes | low | Executive, provider and regulator day at $650, a poor fit for an ebook author |
| niche-evt-spmc | **no** | yes | low | Vancouver, 1 month out, vendor fee unknown, cross-border |
| niche-pub-chacruna | yes | yes | medium | Latest post 2026-09-23 verified; high editorial bar |
| niche-pub-tripsitter | **no** | yes | low | Guidelines dated 2022; editors "reserve the right to remove product/service links"; brand risk |
| niche-pub-lucidnews | yes (low) | yes | low | Last post 2026-08-21 (about 5 weeks ago); still no pitch route |
| niche-pub-psychedelicstoday | yes | yes | medium | Article form closed and podcast form open, both verified; 776 eps; last feed episode 2026-08-12 |
| niche-pub-microdose | yes | yes | low | "Over 89,000" subscribers verified; its 5 Questions has featured an author |
| niche-pod-integration-small | yes | yes | medium–high | 4 of 5 shows posted in the last 60 days; Sinclair Fleetwood has not posted for 101 days |
| niche-pod-thirdwave | **no** | yes | low | $1,500 buys about 3,100 downloads (about $0.48 per listen); the page targets retreats and clinics |
| niche-edu-ciis | yes (low) | yes | low | Facts verified; no public reading list or submission route |
| niche-edu-or-programs | yes | yes | medium | All 14 programs verified by name (PDF modified 2026-09-23) |
| niche-dir-psychedelic-support | **no** | yes (restricted) | none now | Both directories say "not accepting new applications at this time" |
| niche-dir-psychable | yes | yes | medium | Coaches and community groups can list free (one listing); authors-only listing not offered |
| niche-b2b-retreats | yes (low) | yes | low | "All include integration" is contradicted; most listings are outside the US |
| niche-com-r-psychedelictherapy | yes | yes (unverified) | low–medium | Reddit returned 403 live; the mirror was last updated 2026-09-18 |
| niche-pr-sos | yes | yes | low–medium | Verified word for word |
| niche-pr-qwoted | yes | yes | low–medium | Verified: Free 2 pitches/mo with a 2-hour delay; Pro $149/mo |
| niche-pr-featured | yes | yes | low–medium | Verified: Lite $29/mo billed annually, Pro $79/mo; terkel.io redirects here |
| niche-pr-hb2bw | **no** | yes (dead) | none | MentionMatch "We're launching soon" |
| niche-evt-wonderland | **no** | yes (dead) | none | Domain now hosts "Miami's Most Seductive Nightlife Experience" |
| niche-pub-doubleblind | yes (verify) | yes (unverified) | unknown | Still behind a bot check (HTTP 202); confirmed as a Horizons Community Ally |
| niche-evt-ps2027 | yes | **no** | unknown | MAPS homepage says "PS27 registrations are now live", so it should be live; dates and city still UNVERIFIED |

## Item-by-item evidence

### niche-b2b-or-centers: KEEP. Fix the "43%" claim.

**Verified:**
- The CSV row for 4/1/2026–6/30/2026 shows `ClientsServed=1220`, `OtherInsideUS=525`, `OutsideUS=20`, `NoAnswerForCounty=51`. Source: https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/OPS-Data-File-2026-Q2.csv (2026-09-24T22:11:59Z).

**Wrong: the denominator.**
- 525/1220 is 43.0%, but residence comes from the optional client data form. Oregon county rows plus other-state, outside-US and no-answer rows add to only about 820 (suppressed cells are shown as -99).
- 525 is about **64% of clients who reported residence**.
- Correct wording: "at least 525 of 1,220 clients (43%) came from other US states; about 64% of those who answered".

**UNVERIFIED: "so they leave with no licensed integration support".**
- This is an inference. OAR 333-333 could not be read in this run.
- Do not use this line in outreach copy until the rules on integration-session location or telehealth are checked.

**Mechanics:**
- The directory lives at `psilocybin.oregon.gov/license-directory` (HTTP 200 at 22:17:32Z) and can be filtered by clicking "license type".
- The page itself says: "The OPS Licensee Directory is **not a comprehensive list** of all OPS licensees". Listing is opt-in. Source: https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Pages/Psilocybin-Licensee-Directory.aspx (22:12:12Z).

**Missed policy:**
- Outreach email to centers is commercial email under CAN-SPAM: "The law makes no exception for business-to-business email".
- Every email needs a postal address and an opt-out, and opt-outs must be honored within 10 business days. The penalty is up to $53,088 per email.
- Source: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business (edited Jan 2024; read ~22:21:50Z).

**Tag:** fine (`utm_source=or-<center>&utm_medium=b2b-partner&utm_campaign=aftercare-kit-2026q4`).

### niche-b2b-co-centers: KEEP

**Verified:** "Approved Licenses as of 9-18-26 … Healing Center 11 standard 35 micro". The page also says "The map below highlights the locations of licensed healing centers". Source: https://nmd.colorado.gov/ (curl 22:12:36Z; WebFetch returned 403).

**Look-up:** the Licensee Look-up Tool link goes to `https://codor.mylicense.com/NMD_Verification/`.

**Missed:**
- Healing centers are only the premises. **Facilitators** are licensed separately by DORA, and DORA publishes a roster generator. See missing venue M1.
- The NMD page also links a 7/6/26 "Industry Bulletin: Prohibition of Sales of Regulated Nat[ural Medicine]…". Read it before proposing anything sold on premises (UNVERIFIED content).

### niche-dir-nm-mpp: KEEP as watch only. Status is WRONG.

**Verified:**
- "The program is set to be implemented by December 31, 2026" — https://www.nmhealth.org/about/mcpp/ (22:12:12Z).
- The /mpp/ page says the DOH "is now embarking on the critical task of developing… rules". It lists no hearing dates yet, and advisory-board meeting materials are not posted. Source: https://www.nmhealth.org/about/mcpp/mpp/ (~22:12:40Z).

**Correction:**
- Status should be **pre-launch**, not live.
- "Follow the advisory board materials" is not possible yet. Instead, watch for public hearings. The page lists a public program inbox (medical.psilocybin@doh.nm.gov).
- The program is medical, with qualifying conditions (treatment-resistant depression, PTSD, SUD, end-of-life). Rules on clinicians and training are pending, so non-clinician "integration" roles are unknown.
- Lead value: low until 2027.

### niche-npo-fireside: KEEP, with corrected mechanics

**Verified:**
- "about 40,000 conversations" and "100+ volunteers" appear on the homepage, not on the spread-the-word page. Source: https://www.firesideproject.org/ (22:13:09Z).

**Wrong: "Join the Ambassador Kit program".**
- The page lists four open Google Drive folders: Volunteer Spark Kit, Clinic Partner Folder, Community Spark Kit, and Fireside Ambassador Kit ("All are welcome!").
- There is no application or program to join. Source: https://www.firesideproject.org/spread-the-word (~22:12:45Z).

**Wrong: "propose one free tool for /resources".**
- /resources has no submission route.
- Of its 40 external anchors, 0 are nofollow; they use `rel="noopener"` only, so links are **followed**. Source: https://www.firesideproject.org/resources (22:13:02Z).

**Missed:**
- Fireside also sells "Psychedelic Coaching — scheduled, long-term prep and integration by video". That makes it a partial competitor for integration buyers.
- Adding 62-FIRESIDE to the tool pages is still good harm-reduction practice, whatever the lead value.

### niche-evt-maps-calendar: KEEP. Link-back is better than claimed.

**Verified:**
- Form at https://maps.org/event-calendar-submission/ (~22:13:20Z). It says: "All events are considered in accordance with MAPS values, principles, ethics, and strategic priorities"; "generally will not contact you about your submission".
- It collects the Ticketing URL, anticipated attendance and audience. No fee is mentioned.

**Link-back:**
- Listings link to MAPS-hosted event pages, and those pages carry a button to the organizer.
- 2 of 2 sampled had no `rel` attribute, so they are **followed**:
  - https://maps.org/event/half-day-transpersonal-breathwork-workshop/
  - https://maps.org/event/the-microdosing-summit/
  - Read at 22:13:41Z.

**Lead value:**
- A small breathwork workshop was accepted, so small organizers do get listed.
- Still, the listing is curated and not guaranteed, so lead value is medium, not high.

### niche-com-eventbrite: KEEP

**Verified:**
- "Publish unlimited free events at no cost". Paid events cost 3.7% + $1.79 per ticket plus 2.9% processing. Source: https://www.eventbrite.com/organizer/pricing/ (~22:13:55Z).
- The search page shows about 500 results, including several free "Psychedelic Integration Circle" listings in Oct 2026. Source: https://www.eventbrite.com/d/online/psychedelic-integration/ (~22:13:50Z).

**UNVERIFIED:**
- Eventbrite prohibited-content rules; the guessed help URL returned 404. Read them before publishing. Frame the event as a peer or educational circle with no substances.
- Organizer-link `rel`.

### niche-evt-horizons: KEEP. Correct the ally mechanics.

**Verified:**
- "Join us on October 15 - 17, 2026 in New York City for our 19th conference". Source: https://horizonsconference.org/ (22:14:24Z).
- Community 2-Day (Fri+Sat) is $300 and Community 3-Day is $775. These are "late September rates", valid through 2026-09-30, and scholarships are available. Source: https://horizonsconference.org/register (~22:14:00Z).
- The partners page lists 20 Community Allies, not 21, and 60 external links with 0 nofollow. Source: https://horizonsconference.org/partners (22:14:24Z).

**Correction:**
- Community Allies are "mission-aligned organizations who contribute… by promoting it to their audience", which is not a slot for a solo author.
- The page also says "More information about the Community Allies program will be available shortly". Source: https://horizonsconference.org/partner-interest (~22:14:05Z).
- Horizons week also includes off-site events "created by community allies" (see M7).

**Lead value:** medium. It is a networking channel, not a direct lead source.

### niche-evt-phf: DROP

- Oct 15, 2026 at the NY Academy of Medicine, registered through Horizons. The audience is "executives, providers, and regulators". Source: https://psychedelicalpha.com/psychedelic-healthcare-forum-2026/ (~22:14:30Z).
- The Horizons register page shows "Community Thursday-only $650", which is consistent.
- It is not a reader or buyer audience for an ebook, and the cost is high.

### niche-evt-spmc: DROP for 2026

- Verified: "OCT 23-25, 2026 • VANCOUVER, BC"; vendor and sponsor application links exist. Source: https://spiritplantmedicine.com/ (~22:14:30Z).
- The vendor page rendered no fee text through curl (JS-rendered), so the fee is UNVERIFIED.
- One month out, with cross-border travel and an unknown fee: revisit for 2027.

### niche-pub-chacruna: KEEP

- The RSS feed confirms the latest posts: "Reflections on the Psychedelic Executive Order…" and "Building Tripsafe Communities…", both dated 2026-09-23. Source: https://chacruna.net/feed/ (22:14:48Z).
- Inquiry by email; Author Guidelines PDF and Contributor Licensing Agreement are linked. Source: https://chacruna.net/read-chronicles/ (~22:14:35Z).
- The audience is scholarly. Pitch integration research or practice, not the book.

### niche-pub-tripsitter: DROP

- The guidelines say "Last updated June 02, 2022". They also say "We do not accept requests for sponsored posts" and that editors reserve the right to remove product/service links. Source: https://tripsitter.com/write-for-us/ (~22:14:55Z).
- The feed shows a 2026-07-23 post alongside "Where to Buy Magic Mushroom Spores in France/Denmark" pages. Source: https://tripsitter.com/feed/ (22:14:48Z).
- That is brand and legal-adjacency risk for an integration author, and the link to the book may be stripped.

### niche-pub-lucidnews: KEEP at low

- The feed shows the latest item is "Psychedelic Policy Briefing 8.21.26", published 2026-08-21, with none since. Source: https://www.lucid.news/feed/ (22:14:48Z).
- The About page has no pitch, freelance or editorial route; it offers only /contact. Source: https://www.lucid.news/about/ (~22:14:55Z).

### niche-pub-psychedelicstoday: KEEP

- "Inquire about Articles" goes to a **closed** Google Form. The podcast pitch goes to a monday.com form, and the page says: "We are very selective on what we host". Source: https://psychedelicstoday.com/contact/ (~22:15:00Z).
- The Apple API shows 776 episodes, with the last release on 2026-08-12. The site feed shows a latest post of 2026-09-16. Sources: https://itunes.apple.com/search?media=podcast&term=Psychedelics+Today (22:15:16Z); https://psychedelicstoday.com/feed/ (22:14:48Z).

### niche-pub-microdose: KEEP at low

- Substack metadata says "Over 89[,000]". The latest issue is from 2026-09-21: "Did psychedelics help build ancient civilizations?: 5 Questions for journalist Andrew Lawler". That shows authors do get the 5 Questions slot.
- Tips go to the newsletter tips inbox, published on the page.
- Sources: https://themicrodose.substack.com/about and `/api/v1/archive` (22:15:54Z).

### niche-pod-integration-small: KEEP. These are the best-fit shows for a new author.

Source: Apple Podcasts search API, https://itunes.apple.com/search?media=podcast&term=… (22:15:16Z).

| show | episodes | last episode | owner email in RSS |
|---|---|---|---|
| The Integration Session (Centre for Psychedelics Health and Research) | 36 | 2026-09-17 | yes |
| The Psychedelic Integration Compass (Clara Parati) | 8 | 2026-09-21 | not found in the first 60 KB |
| Hope for Humanity (Julian Bermudez) | 43 | 2026-09-08 | yes |
| Unjourneying (Mira Funk, LCSW) | 9 | 2026-08-03 | yes |
| The Psychedelic Integration Podcast (Sinclair Fleetwood) | 136 | 2026-06-15 | yes |

- The Sinclair Fleetwood show has had no episode for **101 days**, so it is lower priority.
- The owner-email check was run on each feed at 22:15:28Z. Emails are not reproduced here.
- Link rel in show notes: UNVERIFIED.

### niche-pod-thirdwave: DROP

- 376 episodes, last 2026-09-23 (Apple API, 22:15:16Z).
- The guest page says "$1,500" and "3,100+" downloads per episode. It is "especially well-suited for Retreat Centers…, Clinic Founders…, Coaches". Source: https://thethirdwave.co/new-podcast-guest/ (~22:15:30Z).
- That works out to about $0.48 per download, for an ebook sale. It is paid placement, so any mention must be disclosed as an ad.

### niche-edu-ciis: KEEP at low

- Verified: "12-month… 140-150 hours… 8 class weekends"; "Applications for the 2026-2027 cohort are now closed"; "2027-2028 application cycle will open on January 15, 2027". Source: https://www.ciis.edu/continuing-education/center-for-psychedelic-therapies-and-research (~22:15:40Z).
- No public reading list or submission route was found.
- CIIS is also an Oregon-approved training program (PDF below) and a Horizons Community Ally.

### niche-edu-or-programs: KEEP. Names are now verified.

- The PDF was modified 2026-09-23 (Last-Modified: Wed, 23 Sep 2026 17:32:04 GMT). Source: https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/Active-Psilocybin-Training-Programs.pdf (22:16:05Z).
- It lists these 14 programs:
  1. A Emerald Valley Institute (Eugene)
  2. AAA Learning Institute (Eugene)
  3. Acadia Professional Learning (Portland)
  4. Alfred M. Hubbard Institute (San Francisco)
  5. Berkeley Center for the Science of Psychedelics (Berkeley)
  6. CIIS (San Francisco)
  7. Changa Institute (Portland)
  8. Entheogen Institute (Ashland)
  9. Heroic Hearts Process Psychedelic Coach & Facilitator Training (online)
  10. InnerTrek (Damascus)
  11. Numinus Certification Pathway (Murray, UT)
  12. Oregon Psychedelic Institute (Joseph)
  13. The Leela School of Awakening (Ashland)
  14. Weaving Bridges Natural Fellowship (Portland)

### niche-dir-psychedelic-support: DROP for now

- Provider network: "require providers to be licensed in a health profession". Community directory: groups must "host regular online or in-person events… can not offer illegal substances".
- **Both** say "We are not accepting new applications at this time". Members get an "Invitation to publish articles in our blog", but that is closed too.
- Source: https://psychedelic.support/join/ (22:21:45Z).

### niche-dir-psychable: KEEP. Listing eligibility is now verified.

- "855+" practitioners; "Every listed practitioner offers or partners with integration support". Source: https://psychable.com/ (~22:16:40Z).
- Listing types include Coaches and Community Groups. Pricing:
  - Free: "One listing per directory to start"
  - $55 per month
  - $600 per year
- If Maya runs a free circle, she can list as a Community Group at no cost.
- It also works as a B2B prospect list.

### niche-b2b-retreats: KEEP at low

- Verified: "839 upcoming retreats". Source: https://retreat.guru/be/psychedelic-retreats (~22:16:40Z).
- The first 8 listings were Soltara (CR), Psychonauta (PE), Taita Inti (SE), Arkana (PE), MexiSoul (MX), Ananda Lodge (CR), From Gaia for You (ES) and Acsauhaya (NL). Only the Acsauhaya listing text mentions integration, so "the ones checked all include integration" is **not supported**.
- Beckley Retreats and MycoMeditations were not re-verified in this run.
- Almost all listings are outside the US, and many are ayahuasca retreats. That means jurisdiction and brand-fit questions.

### niche-com-r-psychedelictherapy: KEEP. Still UNVERIFIED.

- Live Reddit `about.json` returned **HTTP 403** for all 8 subreddits tried (22:16:31Z).
- The mirror shows "35k members", +4k per year (11.4%), last updated 2026-09-18. Source: https://gummysearch.com/r/PsychedelicTherapy/ (22:16:31Z).
- The mirror also lists r/PsilocybinTherapy (15k), r/PsychedelicStudies (46k) and r/PsychedelicMedicine (8k) as adjacent subreddits. These are unverified.
- Rules: each subreddit has its own self-promotion rules, plus the Reddit sitewide spam rules. Answer questions only, with no link in the first posts.

### PR tools (niche-pr-sos, niche-pr-qwoted, niche-pr-featured): KEEP

- **SOS:** "This list does not cost a dime" (paraphrased); "Up to three times a day"; pitching a reporter off topic "even once" gets you removed, "No exceptions, no appeals." Source: https://www.sourceofsources.com/ (~22:16:45Z).
- **Qwoted:** Free "2/mo", "2 Hour Delay"; Pro "$149/mo", 35 pitches. Source: https://www.qwoted.com/pricing/ (~22:16:50Z).
- **Featured:**
  - Free tier: "2–3 media opportunities per week".
  - Lite: $29/mo (billed annually, $348). Pro: $79/mo ($948).
  - Source: https://featured.com/pricing (~22:16:50Z).
  - `terkel.io` redirects to `featured.com` (22:16:49Z).
- **Lead value:** low–medium. Psychedelic journalist queries are rare, so set keyword alerts.

### niche-pr-hb2bw and niche-evt-wonderland: DEAD, confirmed

- `helpab2bwriter.com` redirects to `mentionmatch.com`, which says it is "launching soon" (22:16:49Z).
- `wonderlandmiami.com` now shows a WordPress.com nightlife site titled "Wonderland Miami" (22:16:49Z).

### niche-pub-doubleblind: KEEP, verify in a browser

- Still HTTP 202 with a 168-byte bot-check body (22:11:55Z); WebFetch saw an empty page.
- Confirmed as a Horizons Community Ally ("print magazine and media company"). Source: https://horizonsconference.org/partners (22:14:24Z).

### niche-evt-ps2027: KEEP. Status should be LIVE.

- The MAPS homepage says "PS27 registrations are now live" and links to psychedelicscience.org. Source: https://maps.org/ (~22:13:25Z).
- psychedelicscience.org itself returned 202 (bot check, 22:13:41Z), so dates, city, and the call for proposals (CFP) or exhibitor pages are UNVERIFIED.
- **Competitor note:** the same homepage offers a MAPS "Integration Guide" in exchange for an email signup. A free integration lead magnet from the biggest brand in the field sets the bar for the one Maya offers.

## Missing venues (not in the map)

| # | venue | why it matters | mechanics / tag | source (read UTC) |
|---|---|---|---|---|
| M1 | **Colorado DORA licensed facilitators roster** plus rulemaking | Facilitators, not centers, deliver sessions and integration. DORA publishes a roster generator. Open public process: stakeholder meeting **Oct 2, 2026** (facilitator training rules); permanent rulemaking hearing **Thu Oct 8, 2026, 9:00 MDT** (CE rules), with written comments accepted. | Roster at apps2.colorado.gov/dora/licensing/lookup/generateroster.aspx (HTTP 200); written comment is public record. Tag: `utm_source=co-fac-<name>&utm_medium=b2b-partner&utm_campaign=aftercare-kit-2026q4` | https://dpo.colorado.gov/NaturalMedicine (22:18:15Z) |
| M2 | **Colorado-approved facilitator training programs** (e.g. UC Denver CLAS psychedelic science & facilitation; Numinus CO) | The Colorado counterpart to the Oregon training-program item; student cohorts need integration reading | Same aftercare or student offer as the Oregon programs | https://dpo.colorado.gov/NaturalMedicine (22:18:15Z) |
| M3 | **Psychedelics.com**: "Essential Psychedelic Books" list, Contribute page (seeks "Tool Builders" and content creators), and **Psybrary** | A book list and a tool-builder call match the book and the free tools. The Psybrary answers questions "grounded in curated psychedelic literature, with links to the original sources", a direct AI-citation corpus. | Pitch via /contribute; ask how the Psybrary corpus is curated. Tag: `utm_source=psychedelics-com&utm_medium=referral` | https://www.psychedelics.com/contribute/ (22:18:15Z); https://ask.psychedelics.com/ (~22:17:45Z) |
| M4 | **Brooklyn Psychedelic Society** (NYC) | Runs integration circles (e.g. "Queer Psychedelic Integration Circle", Sep 27, 2026, Prospect Park), a membership, a newsletter and a blog & podcast; also a Horizons Community Ally | Offer a free workshop or guest post; contact is on the site. Tag: `utm_source=bps&utm_medium=community` | https://www.bps.community/ (22:18:29Z) |
| M5 | **Zendo Project** (MAPS harm reduction) | "Join 10,000+ trained peers and professionals"; its Resources page is "a collection of hotlines, manuals, organizations, and websites" | Ask to be considered for the Resources page; volunteer training is a credibility route. Tag: `utm_source=zendo&utm_medium=referral` | https://zendoproject.org/ (22:18:29Z) |
| M6 | **Meetup** psychedelic-integration groups | Live groups near NYC and online (e.g. weekly online "Psychedelic Integration - From Insight to Transformation"); a second event venue next to Eventbrite | Organizer fee UNVERIFIED (the pricing page gave no text). Tag: `utm_source=meetup&utm_medium=event` | https://www.meetup.com/find/?keywords=psychedelic%20integration (22:18:29Z) |
| M7 | **Horizons week off-site events** | Horizons says its community allies create "community meet-ups, charity benefits…" around Oct 15-17; a free NYC integration meetup that week reaches the densest audience of the year | Partner with an ally (e.g. BPS) rather than applying as an ally | https://horizonsconference.org/ (22:14:24Z) |
| M8 | **Speaker slots at MAPS-listed events**: Collaborence 2026 (Oct 3-4), The Microdosing Summit, 1st KAP International Association Summit, ALPS 2026 | Stages run by other organizers; the MAPS event pages link to them with followed links | Pitch each organizer; speaker process UNVERIFIED | https://maps.org/take-action/events/ (22:13:33Z) |
| M9 | **Veteran channels**: Heroic Hearts Project | Oregon-approved training program and a large veteran audience; integration is central to veteran programs | Offer the free tools and the aftercare kit | Oregon training PDF (22:16:05Z); https://heroicheartsproject.org/ (HTTP 200, 22:17:32Z) |
| M10 | **Psychedelic Passage podcast** (83 episodes, last 2026-09-09): **caution** | An active integration-adjacent show, but the site offers a "Psilocybin Sourcing Guide" and a nationwide facilitator network outside state programs | Brand and legal risk: consider only if Maya accepts that association | Apple API (22:15:16Z); https://www.psychedelicpassage.com/ (22:21:45Z) |

Also checked and **not usable yet:** `integrationcircles.org` shows only "Launching Soon" (~22:17:40Z).