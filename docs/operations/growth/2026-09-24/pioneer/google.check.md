# Google map: adversarial check (2026-09-24)

**Checks:** `02-google-network.md` and `02-google-network-part2.md` in this folder (map commit d019ec77a7295785e44ba8d496657186095c1c6d).

**Method:** Live reads on 2026-09-24, 18:53Z-19:17Z UTC, using curl GET and WebFetch. Times are the UTC read times.

**Limits:**
- The WebSearch budget for this session was exhausted (200 of 200). Every check is a direct fetch of a cited or official page.
- Google result pages were not queried. Indexation, Search Console verification and whether a Knowledge Panel exists remain **UNVERIFIED**.
- **Process notes:**
  - One curl call (about 18:55:58Z) wrote a body to `/tmp/nul` by mistake. It was deleted at 18:56:19Z and never used as a source.
  - A shell command-length limit forced this file to be saved in several append commits. Each one was fetched live from GitHub and appended in memory.

## 1. Verdict

| id | keep | map status correct? | key correction |
|---|---|---|---|
| goog-01 Search + Search Console | yes | yes | Only 1 of 40 scenarios is on the web; the redirect domains lack a verification TXT |
| goog-02 Gen-AI report | yes (lead low) | yes | impressions only; needs the site *included* in AI features |
| goog-03 URL Inspection | yes | yes | none |
| goog-04 Indexing API | no | yes | not applicable |
| goog-05 Business Profile | no | yes | not eligible now |
| goog-06 Knowledge Panel | yes (lead low) | yes | panel existence UNVERIFIED |
| goog-07 Search profiles | no (future) | yes | needs 10k followers; Instagram has 18 |
| goog-08 Preferred sources | yes (low) | yes | needs the AI-features inclusion setting |
| goog-09 Google Books | yes (lead medium) | yes | no link back, so not "high" |
| goog-10 Play ebook | yes | yes | affiliate mechanic misread; review-incentive rule |
| goog-11 Play audiobook upload | yes (conditional) | **no**: restricted | select publishers only; TOC claim unsupported |
| goog-12 Auto-narration | yes (Maya decides) | yes | no "Beta" label found; EPUB needed |
| goog-13 Merchant Center | no | yes | none |
| goog-14 Merchant-listing markup | no | **no**: restricted | the free-listings guidelines exclude ebooks |
| goog-15 YouTube long-form | yes | yes | clickable description links need Advanced features |
| goog-16 YouTube Shorts | yes | yes | Shorts description links are non-clickable; wrong source cited |
| goog-17 YouTube RSS podcasts | yes | yes | RSS upload needs Advanced features; audiobook-rights check |
| goog-18 YouTube health features | no | yes | none |
| goog-20 Discover | yes (lead low-medium) | yes | posts have no image at all; Search-features policies |
| goog-21 News / Top Stories | no | yes | psilowire.com only 308s to the homepage |
| goog-22 Web Stories | no | yes | effort far above return |
| goog-23 Events + Maps | yes (when in person) | yes | ticketing-partner route |
| goog-24 ProfilePage | yes (lead low) | yes | none |
| goog-25 Deprecated rich results | no (guardrail) | **no** | Book Actions is not dead; Book review snippets are live |
| goog-26 Images / Lens | yes (low) | yes | posts have zero images |
| goog-27 AI Overviews / AI Mode | yes (lead medium) | yes | 1 of 40 scenarios is online |
| goog-28 Perspectives | no | **no**: renamed "Forums" | see M3 |
| goog-29 Trends | yes (low) | yes | still 429 |
| goog-30 Keyword Planner | yes (low) | yes | none |
| goog-31 Alerts | yes | yes | none |
| goog-32 Google Ads | no | yes | none |
| goog-33 Ad Grants | no | yes | none |
| goog-34 GA4 / GTM / Looker | yes | yes | still no tag |
| goog-37 Forms / Sites / Blogger | no | yes | no lead value |
| goog-38 Scholar | no | yes | no lead value |
| goog-39 Google Podcasts | no | yes (dead) | shutdown dates sourced |
| goog-40 Discover Follow | no | yes (dead) | stale help text remains |