# Pioneer map 04: the book ecosystem, part 2 of 2

Continues `04-book-ecosystem.md`, which has the baseline, defects D1-D8, the market view and venues 2A-2D. All reads were live on 2026-09-24, 18:24Z-18:49Z UTC. Sources S1-S52 are in section 9 below.

### 2E. Audiobook (in production: choose the rights path before release)

| id | Venue | Status | Mechanics (live) | Link-back | Lead value |
|---|---|---|---|---|---|
| book-acx | ACX (Audible, Amazon, Apple) | live; help pages 404/308 | KDP: "earn royalties of **up to 40%**" (S18). The exclusive vs non-exclusive split is **UNVERIFIED** (help.acx.com is JS-only). | none | medium (Audible reach) |
| book-kdp-virtual-voice | KDP audiobooks with virtual voice | **restricted** (invite-only beta, US) | Free. List price **$3.99-$14.99**. **40%** royalty. Needs an NCX/interactive TOC (S17). | none | low (the human narration already underway is better) |
| book-spotify-authors | Spotify for Authors | live | "Self-published authors can now distribute directly to Spotify" (blog post dated **2025-08-01**). Offers author profiles, listener age/gender insights and **redemption codes**. Optional wider distribution via Voices by INaudio. Royalty % UNVERIFIED (S22). | author profile (link field UNVERIFIED) | **medium-high**: redemption codes work as a lead magnet, and the demographics show who the audience is |
| book-voices-inaudio | Voices by INaudio (**formerly Findaway Voices by Spotify**) | live | findawayvoices.com now serves a "Redirecting…" page to **voicesbyinaudio.com**. "Non-exclusive", "set your own prices", "major retail… library and educational channels". Fees UNVERIFIED (S21). | none | medium-high (libraries plus wide retail) |
| book-findaway-brand | "Findaway Voices" brand | **DEAD as a brand** | Redirects to Voices by INaudio (S21). Do not cite it as a destination. | n/a | n/a |
| book-google-autonarration | Google Play auto-narrated audiobooks | live (beta) | "no program fee" during beta. The audiobook can be downloaded and sold elsewhere, **but must also be on sale on Google Play in every country where it is sold elsewhere**, and the Play price must not be higher (S23). | Google Books page | low-medium |
| book-apple-narration | Apple Books digital narration | live | Offered on Apple Books for Authors; eligibility not shown (S48). | none | low-medium |
| book-chirp / book-kobo-audio | Chirp deals; Kobo audio | **UNVERIFIED** (Chirp for-authors URL 404; Kobo 403) | n/a | n/a | n/a |

**Decision to make before the audiobook launches:** ACX exclusive locks the audio edition to Audible, Amazon and Apple. Wide distribution (Spotify for Authors + Voices by INaudio) reaches Spotify, libraries and other retailers. For *leads*, wide wins: Spotify redemption codes and library listeners both hear a spoken call to action, e.g. `mayaallan.com/listen`, which should redirect to `?utm_source=audiobook&utm_medium=spoken-cta&utm_campaign=pig-audio`.

### 2F. Catalogs and the knowledge graph (entity SEO / AI citation)

| id | Venue | Status | Mechanics (live) | Link-back | Lead value |
|---|---|---|---|---|---|
| book-open-library | Open Library | live (listed) | The author record OL16288546A has **no links** (S2). Author records support a `links` field (example: the Pollan record has `links: michaelpollan.com` plus `remote_ids` for wikidata/viaf/isni, S51). It is a wiki, and any logged-in user can edit. Once D1 is fixed, add the paperback, hardcover and ebook as separate editions. | Yes (links field; rel UNVERIFIED) | medium |
| book-wikidata | Wikidata | live; **no items** (S46) | Notability criterion: *"It refers to an instance of a clearly identifiable conceptual or material entity that can be described using serious and publicly available references"* (page rev. 2026-09-12). A book with an ISBN, an Open Library record and retailer listings is commonly itemized. Disclose the conflict of interest, or let a third party create the items. | `official website` (P856) statement | medium (feeds knowledge panels and LLM graphs) |
| book-google-books | Google Books | live (Play listing) | Book actions ("Buy" rich results) are **"limited to book providers that have filled out the interest form and have been onboarded"** (S43), so they are not available to an author site. The Google Books Preview Program shows "the links of major book retailers" (S23). | Google Books page | medium |
| book-storygraph | The StoryGraph | live; **book absent** (S39) | Add the book via a reader account. The author-claim page is Cloudflare-blocked (UNVERIFIED). | UNVERIFIED | low-medium |
| book-librarything | LibraryThing | **UNVERIFIED** (Cloudflare 403, S38) | n/a | n/a | n/a |