# Pioneer map 05: psychedelic and integration niche venues (2026-09-24)

**Scope:** where the psilocybin-integration audience and its gatekeepers are now, and how *The Psychedelic Integration Guide* / www.mayaallan.com can get listed, linked and tagged in each place. IDs use the `niche-` prefix.
**Method:** everything below was read live on 2026-09-24 between 18:24Z and 18:48Z (UTC) with `curl` GET, public JSON/RSS/API endpoints (Apple Podcasts lookup, Discord invite API, eCFR, WordPress/Substack RSS, Oregon SharePoint REST) and WebFetch. Each row names its source URL and read time. Where a site blocked the request or rendered content client-side, the item is marked **UNVERIFIED** and nothing was filled in from memory. WebSearch was not used, because the session's search budget was already spent, so every venue was checked at a known URL.
**Not used:** local files, logins, sign-ups, posting. On mayaallan.com: GET only.

---

## 0. How a pioneer reads this market (live numbers)

| Signal | Number | Source (read UTC) |
|---|---|---|
| Oregon regulated psilocybin clients, Q2 2026 (Apr 1 to Jun 30) | **1,220 clients**; 966 individual + 91 group sessions | OHA OPS data file, https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/OPS-Data-File-2026-Q2.csv (18:29:28Z) |
| ...of whom came from **other US states** | **525 (43%)** + 20 from outside the US | same file, columns `OtherInsideUS`, `OutsideUS` |
| Stated visit reasons (multi-select), Q2 2026 | change of perspective 444, anxiety 383, depression 358, PTSD 204, spirituality 198 | same file |
| Colorado licensed healing centers | **46** (11 standard + 35 micro); 126 owner and 201 handler licenses, "as of 9-18-26" | https://nmd.colorado.gov/ (18:30:16Z) |
| New Mexico Medical Psilocybin Program | "set to be implemented by **December 31, 2026**" | https://www.nmhealth.org/about/mcpp/ (18:30:38Z) |
| Fireside Project support line | "about **40,000 conversations**", "100+ volunteers" | https://www.firesideproject.org/ (18:39:36Z) |
| Psychable practitioner directory | "**855+** practitioners"; "Every listed practitioner offers or partners with integration support" | https://psychable.com/ (18:42:06Z) |
| Retreat Guru plant-medicine retreats | **839 upcoming**; Spain 341, Peru 333, Netherlands 302, Mexico 290, Costa Rica 239 | https://retreat.guru/be/psychedelic-retreats (18:44:48Z) |
| The Microdose newsletter (UC Berkeley BCSP) | "Over **89,000** subscribers" | https://themicrodose.substack.com/about (18:46:40Z) |
| Third Wave newsletter | "45,000+ subscribers" (stated on its guest page) | https://thethirdwave.co/new-podcast-guest/ (~18:36Z) |
| TripSit Discord | **16,903** members, 2,277 online | Discord invite API `discord.com/api/v10/invites/tripsit?with_counts=true` (18:40:45Z) |
| mayaallan.com structured data | `sameAs` lists only `https://www.instagram.com/maya.allan66/` | GET https://www.mayaallan.com/ and /about (18:27:56Z) |

**Reading the numbers:**
1. **The integration gap is built into the regulated system.** Oregon and Colorado are session-based: a client does one supervised session and then goes home. In Q2 2026, 43% of Oregon clients went home to *another state*, where there is no licensed support. Every service center, healing center and retreat needs something to hand clients for the weeks after, and that is a **B2B aftercare** opening, not a consumer ad problem.
2. **Gatekeepers reward contribution.** Fireside, MAPS, Chacruna and Horizons all run *ally or submission* programs (below). None of them sells visibility to an author. You get in by giving something useful first.
3. **Paid search is closed for this topic.** Google Ads prohibits "products or services marketed as facilitating recreational drug use" (section 3). Growth has to come through partners, editorial coverage and communities.
4. **New Mexico is the one market where a first mover still has room.** Its program is not live until December 31, 2026, so no one owns integration there yet.

---

## 1. Pioneer plays, ranked (what to do first)

| # | Play | First concrete action | Tag | Success metric |
|---|---|---|---|---|
| 1 | **Aftercare kit for regulated programs** (OR service centers, CO healing centers, NM once it launches) | Build a free one-page "first 30 days after your session" worksheet linking the free tools (/integration-reflection, /integration-journal, /nervous-system-reset). Offer it to centers at no cost, with per-center links and optional bulk ebook codes. Start with Oregon (1,220 clients a quarter) and Colorado (46 centers). | `utm_source=or-<center>` or `co-<center>` `&utm_medium=b2b-partner&utm_campaign=aftercare-kit-2026q4` | Centers placing the kit; sessions and sales per center UTM |
| 2 | **Join the safety net** | Join the Fireside Ambassador Kit program. Put "Fireside Psychedelic Support Line: 62-FIRESIDE (free, confidential)" on every tool page. Then propose one *free* tool for the Fireside /resources page (it already links out, e.g. hppdonline.com, r/HPPD). | `utm_source=fireside&utm_medium=community` | Resource inclusion; referral sessions |
| 3 | **Run a recurring free online integration circle** (peer or educational, no substances, not therapy) | List it on Eventbrite. Submit it to the MAPS event form (https://maps.org/event-calendar-submission/). A regular event is also what the Psychedelic Support community directory requires once it reopens. | `utm_source=eventbrite` or `maps-events` `&utm_medium=event&utm_campaign=integration-circle-2026q4` | RSVPs, email opt-ins, attendee purchases |
| 4 | **Horizons, NYC, Oct 15-17, 2026** | Attend the Friday and Saturday community days ($300, late-September rate). Apply as a **Community Ally** (mission-aligned organizations that promote the conference get a partners-page listing). | `utm_source=horizons&utm_medium=event&utm_campaign=horizons-2026` | Conversations, partner-page link, B2B meetings |
| 5 | **Podcast ladder** | Pitch small integration shows that published in the last 60 days first (niche-pod-*). Then use the Psychedelics Today guest form. Leave paid spots (Third Wave, $1,500) until conversion is proven. | `utm_source=pod-<slug>&utm_medium=podcast` | Episodes booked; landing-path visits |
| 6 | **Write where editorial links are followed** | Send an inquiry to Chacruna Chronicles and a pitch with outline to Tripsitter; contact Lucid News. Each is detailed in table C. | `utm_medium=guest-article` | Accepted pieces; followed links; author pages to add to `sameAs` |
| 7 | **Expert quotes on news hooks** | Sign up for Source of Sources (free), Qwoted Free (2 pitches/mo) and Featured Free. Current hooks: FDA framework coverage, the federal "psychedelic executive order" (Chacruna, 2026-09-23), the Oregon Q2 data, the New Mexico launch. | `utm_medium=press-quote` | Quotes published |
| 8 | **Training programs (the next practitioners)** | Send desk copies and free student access to CIIS CPTR (2027-28 applications open Jan 15, 2027), Vital (October 2026 cohort), the Berkeley BCSP facilitation certificate and the Oregon-approved programs. Ask to be listed as a supplemental or aftercare resource. | `utm_source=<program>&utm_medium=b2b-partner` | Programs listing the book or tools |

**Not a rehash, and why:** each play is picked from mechanics that are live today: submission forms, ally programs, current data and current events. Paid ads and cold self-promotion are left out because the policies in section 3 close them off.