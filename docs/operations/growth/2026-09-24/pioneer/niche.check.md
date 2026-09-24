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