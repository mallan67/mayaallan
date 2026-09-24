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

### C. Publications (status = latest RSS item, feeds read 18:32:18Z)

| id | Venue | Status (latest) | How to get in | Link back (sampled) | Lead value | Source (read UTC) |
|---|---|---|---|---|---|---|
| niche-pub-chacruna | Chacruna Chronicles | live (2026-09-23) | "If you are interested in contributing ... sending an inquiry via [email]". Publishes "researchers, scholars, ethnographers, and practitioners". Author Guidelines and a Contributor Licensing Agreement are linked on the page. | Followed (4 external, 0 nofollow); author pages at /author/SLUG | medium-high (credibility) | https://chacruna.net/read-chronicles/ (18:34:17Z) |
| niche-pub-lucidnews | Lucid News | live (2026-08-21, weekly "Psychedelic Policy Briefing") | Many outside bylines on /authors/. Pitch path **UNVERIFIED**: the About page shows only Contact and Sponsorship. | Followed (13 external, 0 nofollow) | medium | https://www.lucid.news/about/ (18:34:17Z) |
| niche-pub-tripsitter | Tripsitter | live (2026-07-23) | Write For Us: email an intro plus an "Article outline with suggested headers"; check first that the topic is not already covered | Followed (13 external, 0 nofollow) | medium | https://tripsitter.com/write-for-us/ (18:42:06Z) |
| niche-pub-psychedelicstoday | Psychedelics Today | live (2026-09-16) | Article-submission form is **closed** (Google Form `closedform`). Podcast guest form and affiliate form are open (monday.com). | Followed (13 external, 0 nofollow) | medium | https://psychedelicstoday.com/contact/ (~18:36:30Z) |
| niche-pub-microdose | The Microdose (UC Berkeley BCSP), 89,000+ subscribers | live (2026-09-21) | News tips only (tip email on /about). The "5 Questions" interview format is a route in if you have a newsworthy angle, not promotion. | UNVERIFIED | low-medium | https://themicrodose.substack.com/about (18:33:32Z) |
| niche-pub-psychedelicalpha | Psychedelic Alpha (industry) | live (2026-09-21; new "Psychedelic News Feed" podcast) | Low fit for a consumer book; useful for B2B networking at its Healthcare Forum (section E) | 1 of 5 nofollow | low | https://psychedelicalpha.com/feed (18:32:18Z) |
| niche-pub-maps | MAPS news, Bulletin, Integration Station | live (2026-08-25) | Not a contributor venue. MAPS gives away its own free **Integration Workbook** (email-gated), which competes directly, so position the book as complementary. | 1 of 6 nofollow | low (direct) | https://maps.org/integration-station/ (18:38:15Z) |
| niche-pub-doubleblind | DoubleBlind | **UNVERIFIED** (SiteGround captcha, HTTP 202) | Listed as a Horizons partner (/partners#doubleblind) | UNVERIFIED | unknown | https://doubleblindmag.com/ (18:33:18Z) |
| niche-pub-thirdwave | Third Wave blog | live but slow (latest 2026-06-18; the one before 2024-03-09) | The podcast is the active channel (section D) | UNVERIFIED | low | https://thethirdwave.co/feed/ (18:32:18Z) |
| niche-pub-microdose-buzz | Microdose (microdose.buzz) industry news | live (items dated Aug 2026; runs ads) | Advertising or industry news; not a consumer venue | UNVERIFIED | low | https://microdose.buzz/ (18:42:25Z) |
| niche-pub-psymposia | Psymposia | live (2026-03-23); critical watchdog | Not a promotional venue | n/a | none | https://www.psymposia.com/feed/ (18:32:18Z) |

### D. Podcasts that interview authors

Episode counts and last-episode dates come from the Apple Podcasts lookup API (https://itunes.apple.com/search and /lookup, 18:35:04Z). Website links come from each RSS channel link (18:35:31Z). Most feeds publish an `itunes:email` owner contact, which is a legitimate pitch channel. Show-notes link `rel` is **UNVERIFIED** for every show, so ask for a dedicated landing path that carries the UTM.

| id | Show (host) | Eps / last ep | Guest path | Lead value |
|---|---|---|---|---|
| niche-pod-integration-session | The Integration Session (Centre for Psychedelics Health and Research) | 36 / 2026-09-17 | Feed owner email | **high** (fit, reachable) |
| niche-pod-integration-compass | The Psychedelic Integration Compass (Clara Parati) | 8 / 2026-09-21 | Buzzsprout site; no owner email in feed; path **UNVERIFIED** | high |
| niche-pod-hope-for-humanity | Hope for Humanity: Healing, Trauma and Psychedelic Integration (Julian Bermudez) | 43 / 2026-09-08 | psychedelic-integration.net; feed email | high |
| niche-pod-unjourneying | Unjourneying (Mira Funk, LCSW) | 9 / 2026-08-03 | unjourneying.com; feed email | high |
| niche-pod-sinclair | The Psychedelic Integration Podcast (Sinclair Fleetwood) | 136 / 2026-06-15 | sinclairfleetwood.com; feed email | medium |
| niche-pod-beyond-the-trip | Beyond the Trip (Dr Esme Dark) | 25 / 2026-06-21 | Zencastr page; feed email | medium |
| niche-pod-psychedelic-conversations | Psychedelic Conversations (Susan Guner) | 224 / 2026-09-06 | Feed email | medium |
| niche-pod-psychedelic-report | The Psychedelic Report (Dr Dave Rabin) | 58 / 2026-09-10 | thepsychedelic.report; path **UNVERIFIED** | medium |
| niche-pod-pma | Psychedelic Medicine Podcast (Dr Lynn Marie Morski) | 207 / 2026-09-09 | psychedelicmedicineassociation.org/podcasts; path **UNVERIFIED** | medium |
| niche-pod-atm | Adventures Through The Mind (James W. Jesso) | 248 / 2026-09-18 | jameswjesso.com shows no guest link; feed email | medium |
| niche-pod-mycopreneur | Mycopreneur (Dennis Walker) | 267 / 2026-09-18 | mycopreneur.com. Walker also has author pages at Lucid News and Chacruna, so he connects several venues. | medium |
| niche-pod-christian | The Psychedelic Christian Podcast | 42 / 2026-09-21 | Feed email; faith audience | low-medium |
| niche-pod-scene | The Psychedelic Scene Podcast (Jason LeValley) | 24 / 2026-09-16 | psychedelicscene.com | low-medium |
| niche-pod-psychedelicstoday | Psychedelics Today | 776 / 2026-08-12 | **Guest pitch form** on /contact ("guests that bring a new or unique perspective") | medium (competitive) |
| niche-pod-thirdwave | The Psychedelic Podcast (Third Wave, Paul F. Austin) | 376 / 2026-09-23 | Free application (https://thethirdwave.co/new-podcast-guest/). If accepted, a **$1,500** "investment" covers the episode, 3 social clips and a newsletter mention to 45,000+. Treat it as sponsored and disclose it. | unknown (paid) |
| niche-pod-stale | Psychedelic Therapy Frontiers (Numinus) 220 / **2025-10-14**; Psychedelic Salon 790 / 2026-08-17 (archival talks); Mind and Matter 311 / 2026-08-28 (neuroscience) | as listed | Low fit or dormant | low |

### E. Conferences and events, 2026-2027

| id | Event | Dates / place | Ways in | Cost | Lead value | Source (read UTC) |
|---|---|---|---|---|---|---|
| niche-evt-horizons | Horizons (19th conference) | **Oct 15-17, 2026**, New York Academy of Medicine, NYC | Register. **Community Allies** program for mission-aligned organizations that promote the conference (21 listed). The partners page has 60 external links, **0 nofollow**. | Fri+Sat community $300; 3-day community $775 (late-September rates) | **high** | https://horizonsconference.org/register ; /partner-interest ; /partners (18:43:02Z to 18:43:38Z) |
| niche-evt-phf | Psychedelic Healthcare Forum (Psychedelic Alpha) | **Oct 15, 2026**, NYC (register via Horizons) | Industry networking with executives, providers and regulators | Community $650 | medium (B2B) | https://psychedelicalpha.com/psychedelic-healthcare-forum-2026/ (18:42:47Z) |
| niche-evt-spmc | Spirit Plant Medicine Conference | **Oct 23-25, 2026**, Vancouver BC | Vendor application at /vendor-application-2026; sponsor page; media kit. Vendor fee **UNVERIFIED** (page renders in JS). | Tickets 1-day $200+, weekend $575, VIP $750 (from a WebFetch summary) | medium | https://spiritplantmedicine.com/ (18:37:20Z, ~18:46:25Z) |
| niche-evt-maps-calendar | MAPS "Upcoming Psychedelic Community Events" | Rolling list. Seen: Collaborence Oct 3-4; ALPS Oct 9-10 (Aarau CH); 1st KAP International Association Summit Oct 16-18 (Barcelona); The Microdosing Summit **Oct 20-22, 2026, Austin TX**; Psychedelics Design Nov 6-7 (GB); NYSHRA conference Nov 9-10 (Utica NY) | **Submit your own event** at https://maps.org/event-calendar-submission/ ; request a MAPS speaker at maps.org/speakerrequest | Free | **high** (with play 3) | https://maps.org/take-action/events/ (18:38:15Z, 18:39:03Z) |
| niche-evt-ps2027 | Psychedelic Science 2027 (MAPS) | Named in the MAPS navigation; dates and city **UNVERIFIED** (psychedelicscience.org is behind a captcha) | Watch for CFP and exhibitor pages | UNVERIFIED | high if confirmed | https://maps.org/ (18:37:54Z) |
| niche-evt-icpr | ICPR (OPEN Foundation) | 2026 edition already held (June 4-6, 2026, NL); "ICPR returns in 2028" | Outside the window | n/a | low | https://www.icpr-conference.com/ (18:37:20Z) |
| niche-evt-breaking-convention | Breaking Convention (UK, biennial) | Next date **UNVERIFIED**; contact by email | n/a | UNVERIFIED | low-medium | https://breakingconvention.co.uk/ (~18:37:40Z) |

### F. Training programs and universities (reading lists)

| id | Program | Status | Way in | Lead value | Source (read UTC) |
|---|---|---|---|---|---|
| niche-edu-ciis | CIIS Center for Psychedelic Therapies and Research certificate (12 months, 140-150 hrs, 8 weekends) | live. "Applications for the 2026-2027 cohort are now closed. Our 2027-2028 application cycle will open on January 15, 2027." | Desk copy to faculty; propose as a supplemental integration resource | medium (long-term) | https://www.ciis.edu/continuing-education/center-for-psychedelic-therapies-and-research (18:39:36Z) |
| niche-edu-or-programs | Oregon active psilocybin facilitator training programs (PDF) | live. A WebFetch extraction counted 14 programs, including CIIS, InnerTrek, Heroic Hearts Project, Numinus Network Training and Changa Institute. **Check the names by hand**; one extracted name looked implausible. | Offer student access and the aftercare kit to each program | medium-high | https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/Active-Psilocybin-Training-Programs.pdf (~18:31Z) |
| niche-edu-berkeley | UC Berkeley BCSP: Psychedelic Facilitation Certificate Program; Ferriss-UC Berkeley journalism fellowships; Altered States podcast | live | Program contact. The journalism fellows are the next reporters on this beat. | medium | https://psychedelics.berkeley.edu/ (18:46:54Z) |
| niche-edu-vital | Vital (Psychedelics Today) | live. "Applications now open for our October 2026 cohort" | Affiliate form (Psychedelics Today contact page) | medium | https://www.vitalpsychedelictraining.com/ (18:46:54Z) |
| niche-edu-fluence | Fluence | live. "Pre-enrollment is now open" for a COMP360 psilocybin certificate, described as a "post-approval training program" | Clinician audience; resource partnership | medium | https://www.fluencetraining.com/ (18:46:54Z) |
| niche-edu-naropa | Naropa | **UNVERIFIED** (no psychedelic program link found on the homepage) | n/a | unknown | https://www.naropa.edu/ (18:46:54Z) |

### G. Nonprofits and peer support

| id | Org | Status | Way in (give first) | Link back | Lead value | Source (read UTC) |
|---|---|---|---|---|---|---|
| niche-npo-fireside | Fireside Project: free support line 62-FIRESIDE (opens 11 a.m. Pacific), TripCheck, Fireside-Certified Coaching | live | "Spread the Word" kits: Clinic Partner Folder (ketamine clinics), Community Spark Kit, Fireside Ambassador Kit ("All are welcome!"). The /resources page links out to external communities. | rel UNVERIFIED | medium-high (trust) | https://www.firesideproject.org/ ; /spread-the-word ; /resources (18:39:36Z to 18:39:46Z) |
| niche-npo-maps | MAPS | live | Event submission form, speaker request, community events calendar | 1 of 6 nofollow (article sample) | medium | https://maps.org/take-action/events/ (18:39:03Z) |
| niche-npo-others | Zendo Project, DanceSafe, Heroic Hearts Project, Reason for Hope, Heffter, Psychedelic Medicine Coalition | homepages live (HTTP 200) | Contact-level partnerships only; programs **UNVERIFIED** | UNVERIFIED | low-medium | status checks (18:28:04Z, 18:39:12Z) |

### H. Retreats and service centers (B2B)

| id | Target | Evidence (read UTC) | Offer | Lead value |
|---|---|---|---|---|
| niche-b2b-or-centers | Oregon licensed service centers | 1,220 clients in Q2 2026, 43% from other states (section 0) | Aftercare kit, bulk codes, per-center UTM | **high** |
| niche-b2b-co-centers | Colorado healing centers | 46 licensed as of 9-18-26 (section 0) | same | **high** |
| niche-b2b-retreats | Retreats on Retreat Guru (839 upcoming), e.g. Beckley Retreats ("prep and integration curriculum"; private programs for 1 to 18 people) and MycoMeditations (about 20 hrs of group prep and integration; "The Bridge" for practitioners) | https://www.beckleyretreats.com/ ; https://mycomeditations.com/ (18:44:48Z) | Take-home journal or aftercare licensing for guests | medium-high |
| niche-b2b-networks | Psychedelic Passage (guide network with free matchmaking) | https://www.psychedelicpassage.com/ (18:42:06Z) | Partner **with caution**: the site offers a "Free Psilocybin Sourcing Guide", which carries legal risk by association | low-medium |

### I. Journalist-request platforms

| id | Platform | Status | Mechanics / cost | Lead value | Source (read UTC) |
|---|---|---|---|---|---|
| niche-pr-sos | Source of Sources (Peter Shankman) | live | Free; queries "Up to three times a day". "If you pitch a reporter off topic even once ... you are gone." | medium | https://www.sourceofsources.com/ (18:40:17Z) |
| niche-pr-qwoted | Qwoted | live | Basic **Free**: 2 pitches/mo with a 2-hour delay. Pro $149/mo: 35 pitches/mo. | medium | https://www.qwoted.com/pricing/ (18:40:17Z) |
| niche-pr-featured | Featured (terkel.io now redirects here) | live | Free $0 tier; Lite $29/mo billed annually ($348); "Monitor HARO and similar feeds" | medium | https://featured.com/pricing (18:40:17Z) |
| niche-pr-hb2bw | Help a B2B Writer | **dead / in transition**: helpab2bwriter.com redirects to mentionmatch.com, which says "We are launching soon" | n/a | low | https://helpab2bwriter.com/ redirects to https://mentionmatch.com/ (18:39:57Z, ~18:40:30Z) |
| niche-pr-haro | HARO / Connectively | **UNVERIFIED** (HTTP 429 on both) | n/a | unknown | https://www.helpareporter.com/ ; https://connectively.us/ (18:39:57Z) |

---

## 3. Rules and ethics (read live)

- **Federal law:** Psilocybin (7437) and Psilocyn (7438) are listed in 21 CFR 1308.11 (Schedule I). eCFR version dated 2026-09-21, read 18:47:37Z at https://www.ecfr.gov/api/versioner/v1/full/2026-09-21/title-21.xml?part=1308&section=1308.11. Never source, sell or facilitate, and never link to sourcing guides.
- **State programs** are the lawful routes to access: Oregon (ORS 475A), Colorado (NMD/DORA) and New Mexico (pre-launch). Partner centers hold licenses and carry their own compliance duties, so let them decide placement and never imply state endorsement.
- **Health claims (FTC):** claims about health benefits need "competent and reliable scientific evidence". Present the book and tools as education and integration support, not as treatment for depression or PTSD. https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance (18:45:07Z)
- **Endorsements:** disclose paid podcast spots (Third Wave, $1,500) and any referral fees paid to centers. https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking (live 18:45:27Z)
- **Google Ads (recreational drugs policy):** "Ads for products or services marketed as facilitating recreational drug use are not allowed. Ads for instructional content about producing, purchasing, or using recreational drugs are not allowed." https://support.google.com/adspolicy/answer/6014299 (18:45:07Z)
- **Communities:** follow the Reddit sitewide rules quoted in 2B. The Source of Sources ban applies to any off-topic pitch. The Psychedelic Support community directory does not accept groups that "offer illegal substances".
- **Safety:** Fireside says "If you are having an emergency, call 911." Put that note and the 62-FIRESIDE line on the tool pages.

## 4. Dead or stale: skip these

| Item | Evidence (read UTC) |
|---|---|
| Wonderland (the Miami psychedelics conference) | wonderlandmiami.com now presents "Miami's Most Seductive Nightlife Experience", not a conference (~18:37:40Z). Status of the brand elsewhere: UNVERIFIED. |
| catalystsummit.org | Now "A National Summit on the Future of Learning", not a psychedelic event (~18:37:40Z) |
| Psilocybin Summit (online) | Only the 2021 edition is referenced (~18:46:00Z) |
| Psychedelic Science Review | Latest RSS item 2024-07-18 (18:32:18Z) |
| Psychedelic Spotlight | "New Era Loading ... redesign ... Coming Soon"; RSS has 0 items (~18:32:40Z) |
| Psychedelics Today article submissions | Form is `closedform` (~18:36:30Z) |
| Psychable Podcast (5 eps, last 2025-05-16); Psychedelic Therapy Frontiers (last 2025-10-14) | Apple lookup (18:35:04Z) |
| Help a B2B Writer | Redirects to the pre-launch MentionMatch site (18:39:57Z) |

## 5. Tagging conventions

**UTM:** `utm_source=VENUE-SLUG&utm_medium=TYPE&utm_campaign=NAME`
- medium: `directory`, `community`, `guest-article`, `podcast`, `event`, `b2b-partner`, `press-quote`, `newsletter`
- campaign: `pioneer-niche-2026q4` (default), `aftercare-kit-2026q4`, `integration-circle-2026q4`, `horizons-2026`
- Example: `https://www.mayaallan.com/integration-reflection?utm_source=fireside&utm_medium=community&utm_campaign=pioneer-niche-2026q4`
- Editorial hosts often strip query strings. For podcasts and print, ask for a short dedicated landing path (proposed, **not live today**) and have the page record the source.

**Structured data:** the live `sameAs` holds only Instagram (read 18:27:56Z). Add each *profile* URL once it exists: author pages at chacruna.net/author/SLUG, lucid.news/author/SLUG and Tripsitter; Qwoted and Featured expert profiles; the Eventbrite organizer page. Podcast guest episodes and conference partner listings are pages *about* her rather than profiles, so they go under `subjectOf`, not `sameAs`.

## 6. UNVERIFIED (not filled from memory)

- Reddit first-party subscriber counts, per-subreddit rules and link `rel` (HTTP 403)
- DoubleBlind (captcha)
- Psychedelic Science 2027 dates and city (captcha)
- HARO and Connectively (HTTP 429)
- Oregon licensed service-center count (list renders client-side)
- Colorado facilitator count
- Whether Psychable lists authors
- Spirit Plant Medicine vendor fee
- Next Breaking Convention date
- Meetup counts
- Naropa program
- Podcast guest paths marked UNVERIFIED
- Oregon training-program names (extracted by a summarizer)

## 7. Not done in this pass

No outreach, sign-ups or posts were made (forbidden). psilowire.com and psilocybinintegrationguide.com were not fetched (out of scope: GET is limited to www.mayaallan.com). Organization eligibility for Horizons Community Allies and the Fireside ambassador terms still have to be confirmed by Maya on those sites.