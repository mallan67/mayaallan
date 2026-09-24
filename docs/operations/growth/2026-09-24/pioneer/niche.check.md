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