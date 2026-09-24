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

---

## 2. Venue map

Link-back evidence comes from a sampled external-link `rel` check on one current article or page per site (18:34:48Z and 18:43:38Z). "Followed" means no `nofollow`, `ugc` or `sponsored` on the sampled links. That is not a promise for every future link.

### A. Integration directories and provider listings

| id | Venue | Status | How to get in | Link back | Lead value | Source (read UTC) |
|---|---|---|---|---|---|---|
| niche-dir-psychedelic-support | Psychedelic Support (provider network + community directory; the MAPS "Psychedelic Integration List" points here) | **restricted** | Providers must hold a health license. Community groups must "host regular online or in-person events" and "can not offer illegal substances". The page says "We are not accepting new applications at this time" for both. Free. | Profile page; rel UNVERIFIED | medium (once reopened) | https://psychedelic.support/join/ (18:28:39Z); https://maps.org/take-action/resources/ (18:38:15Z) |
| niche-dir-psychable | Psychable (practitioners, clinics, retreats; 855+ practitioners; claimed profiles) | live | Listing types shown are Practitioners, Clinics and Retreats; whether an author can list is **UNVERIFIED**. Better used as a **B2B prospect list**. | UNVERIFIED | high as a prospect list | https://psychable.com/ (18:42:06Z) |
| niche-dir-or-ops | Oregon OPS Licensee Directory | live (licensees only) | Cannot list the book here. Use it to find service centers: filter by "license type". Count **UNVERIFIED** (list renders client-side). | n/a | **high** (B2B, play 1) | https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Pages/Psilocybin-Licensee-Directory.aspx (18:29:07Z) |
| niche-dir-co-nmd | Colorado Natural Medicine Division: healing-center map + Licensee Look-up; DORA facilitator lookup and roster | live (licensees only) | Prospect list: 46 healing centers as of 9-18-26. Facilitator count **UNVERIFIED** (roster needs a form). | n/a | **high** (B2B) | https://nmd.colorado.gov/ (18:30:16Z); https://dpo.colorado.gov/NaturalMedicine (18:43:50Z) |
| niche-dir-nm-mpp | New Mexico Medical Psilocybin Program | live (pre-launch) | Watch the Psilocybin Advisory Board materials (July 17, 2026 meeting posted). Build provider relationships before the Dec 31, 2026 launch. | n/a | high (first mover) | https://www.nmhealth.org/about/mcpp/ (18:30:38Z) |
| niche-dir-retreatguru | Retreat Guru (839 upcoming plant-medicine retreats) | live | Prospect list for retreat partnerships. Listing as an author: **UNVERIFIED**. | UNVERIFIED | high (B2B list) | https://retreat.guru/be/psychedelic-retreats (18:44:48Z) |

### B. Communities

Subreddit counts come from GummySearch public pages (third party), each marked "Last updated" Sept 18-22, 2026. **reddit.com returned HTTP 403 to `about.json` and blocked WebFetch** (18:24:59Z), so no first-party count was read. Per-subreddit rules and Reddit link `rel` are **UNVERIFIED**. Reddit sitewide rules (https://redditinc.com/policies/reddit-rules, 18:27:09Z): "Participate authentically ... do not spam"; "Keep it legal ... do not solicit or facilitate illegal or prohibited transactions".

| id | Venue | Members (updated) | How to get in | Lead value | Source (read UTC) |
|---|---|---|---|---|---|
| niche-com-r-psychedelictherapy | r/PsychedelicTherapy | 35k (Sep 18) | Best topical fit. Answer integration questions; link a free tool only when it directly answers. | **high** (fit) | https://gummysearch.com/r/PsychedelicTherapy/ (18:26:42Z) |
| niche-com-r-shrooms | r/shrooms | 799k (Sep 18) | Value-first answers; no promotion | medium | https://gummysearch.com/r/shrooms/ (18:26:42Z) |
| niche-com-r-psychonaut | r/Psychonaut | 522k (Sep 21) | same | medium | https://gummysearch.com/r/Psychonaut/ (18:26:42Z) |
| niche-com-r-microdosing | r/microdosing | 292k (Sep 19) | same | medium | https://gummysearch.com/r/microdosing/ (18:26:42Z) |
| niche-com-r-rationalpsychonaut | r/RationalPsychonaut | 99k (Sep 22) | Evidence-first audience: cite research, no hype | medium | https://gummysearch.com/r/RationalPsychonaut/ (18:26:42Z) |
| niche-com-r-therapeuticketamine | r/TherapeuticKetamine | 61k (Sep 19) | Integration is relevant to KAP patients too | medium | https://gummysearch.com/r/TherapeuticKetamine/ (18:26:04Z) |
| niche-com-r-psilocybinmushrooms | r/PsilocybinMushrooms | 145k (Sep 18) | Leans toward cultivation, so poor fit | low | https://gummysearch.com/r/PsilocybinMushrooms/ (18:26:04Z) |
| niche-com-r-psychedelicmedicine | r/PsychedelicMedicine | 8k (Sep 21) | Small and professional | low-medium | https://gummysearch.com/r/PsychedelicMedicine/ (18:26:04Z) |
| niche-com-r-adjacent | r/CPTSD 482k; r/Soulnexus 126k; r/Mindfulness 1.5M; r/Meditation 3.6M | Sep 18-22 | Nervous-system and journaling tools fit here **without** psychedelic framing | medium | gummysearch.com/r/NAME/ (18:26:04Z) |
| niche-com-tripsit | TripSit Discord (harm reduction) | 16,903 members, 2,277 online (first-party API) | A community space, not a promotional one; take part as a member | low (direct) | Discord invite API (18:40:45Z) |
| niche-com-eventbrite | Eventbrite online "psychedelic integration" events | Active circles, e.g. "Free Psychedelic Integration Circle" (Tue Oct 13) and "Bi-Weekly Psychedelic Integration Group" (Oct 6 + 5 more dates); total **UNVERIFIED** | Host your own free recurring circle (play 3). Organizer-profile link rel UNVERIFIED. | **high** (direct opt-ins) | https://www.eventbrite.com/d/online/psychedelic-integration/ (~18:44:30Z) |
| niche-com-forums | Bluelight (live), DMT-Nexus (HTTP 200); Shroomery **UNVERIFIED** | not captured | Harm-reduction culture; self-promotion is poorly received | low | https://www.bluelight.org/community/ ; https://www.dmt-nexus.me/forum/ (18:41:00Z) |
| niche-com-meetup | Meetup psychedelic topics | **UNVERIFIED** (the page rendered "0 members 0 groups" client-side) | n/a | unknown | https://www.meetup.com/topics/psychedelics/ (18:44:19Z) |