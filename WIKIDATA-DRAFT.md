# Wikidata Entry Draft — Maya Allan

> **Purpose:** Paste-ready content for creating a Wikidata entity for Maya Allan
> + the book *Psilocybin Integration Guide*. Wikidata is what gives you a Google
> Knowledge Panel and gets you cited by ChatGPT/Claude/Perplexity by name.
>
> **Important — Wikidata ≠ Wikipedia.** Your Wikipedia block does not
> automatically cover Wikidata; check by logging in at https://wikidata.org.
> If you ARE blocked across all Wikimedia projects, a **trusted person who
> personally knows you (friend, family, fan)** can create this on their own
> account with honest disclosure if asked. It must not be paid editing.
>
> Two entities to create: **(1)** the author, **(2)** the book. Link them with
> the "author" property on the book and "notable work" on the author.

---

## Entity 1 — Maya Allan (the author)

**Label (English):** `Maya Allan`
**Description (English):** `American author and researcher specializing in psilocybin integration and consciousness studies`

### Aliases (also known as)
- *(add any pen names or alternate spellings here)*

### Statements (claims to add — fill in TODO values)

| Property | Value | Notes |
|---|---|---|
| `instance of` (P31) | `human` (Q5) | Required |
| `sex or gender` (P21) | `female` (Q6581072) | If you want it public |
| `country of citizenship` (P27) | *(TODO: e.g., United States Q30)* | |
| `occupation` (P106) | `writer` (Q36180), `author` (Q482980), `researcher` (Q1650915) | Add all that apply |
| `date of birth` (P569) | *(optional — TODO YYYY-MM-DD)* | Skip if you don't want it public |
| `place of birth` (P19) | *(optional — TODO)* | |
| `field of work` (P101) | `psychedelic therapy` (Q97056327), `consciousness` (Q41719), `integration` *(no Q yet — leave as label)* | |
| `notable work` (P800) | *(link to the Book entity once created — see Entity 2 below)* | |
| `official website` (P856) | `https://www.mayaallan.com` | **Required for entity verification** |
| `languages spoken, written or signed` (P1412) | `English` (Q1860) | |
| `genre` (P136) | `self-help book` (Q189458), `spirituality` (Q12554923) | |

### External identifiers (the high-leverage part — fills in your "sameAs" web)

Add each of these as a separate statement using the matching property. These
are exactly what Google's Knowledge Graph and AI search engines crawl to
confirm "yes, all of these refer to the same person":

| Identifier | Wikidata property | Value to add (fill in once you have one) |
|---|---|---|
| ORCID iD | `P496` | *(register free at https://orcid.org/register)* |
| ISNI | `P213` | *(request via https://isni.org)* |
| VIAF ID | `P214` | *(auto-generated once you're in library catalogs)* |
| Library of Congress authority ID | `P244` | *(after LoC catalog submission)* |
| Goodreads author ID | `P2963` | *(from your Goodreads Author profile URL)* |
| Amazon author ID | `P4862` | *(from your Amazon Author Central URL)* |
| Open Library author ID | `P648` | *(after openlibrary.org submission)* |
| LibraryThing author ID | `P7400` | *(after librarything.com claim)* |
| Instagram username | `P2003` | `mayaallan` |
| X (Twitter) username | `P2002` | *(if claimed)* |
| Facebook ID | `P2013` | *(if claimed)* |
| YouTube channel ID | `P2397` | *(if claimed)* |
| LinkedIn personal profile ID | `P6634` | *(if claimed)* |
| TikTok username | `P7085` | *(if claimed)* |
| Substack username | *(no dedicated property yet — add as `described at URL` (P973))* | |

---

## Entity 2 — *Psilocybin Integration Guide* (the book)

**Label (English):** `Psilocybin Integration Guide`
**Description (English):** `2025 self-help book by Maya Allan on psilocybin integration through 40 real scenarios`

### Aliases
- `Psilocybin Integration Guide: 40 Real Scenarios for Navigating What You See, Feel & Experience`

### Statements

| Property | Value | Notes |
|---|---|---|
| `instance of` (P31) | `book` (Q571), `written work` (Q47461344) | |
| `author` (P50) | *(link to Maya Allan entity from Entity 1 above)* | **The critical link.** |
| `language of work or name` (P407) | `English` (Q1860) | |
| `publication date` (P577) | `2025-12` *(adjust to actual)* | |
| `genre` (P136) | `self-help book` (Q189458), `spirituality` (Q12554923) | |
| `main subject` (P921) | `psilocybin` (Q11758), `psychedelic experience` (Q1056901), `integration` *(label)* | |
| `number of pages` (P1104) | `289` *(hardcover)* | |
| `country of origin` (P495) | `United States of America` (Q30) | |
| `publisher` (P123) | *(self-published — list as Maya Allan or create a publisher entity if you have one)* | |
| `official website` (P856) | `https://www.mayaallan.com/books/psilocybin-integration-guide` | |

### Identifier statements (ISBNs — one per edition)

Add each on a separate `ISBN-13` (P212) statement with the edition as a
qualifier (`edition or translation` P747 → string of edition name):

- `979-8-9941488-3-9` — Paperback (Amazon KDP Print)
- `979-8-9941488-5-3` — Hardcover (Amazon KDP Hardcover)
- `979-8-9941488-9-1` — Ebook (Google Play Books)

### Other identifiers to add as available

| Identifier | Property | Notes |
|---|---|---|
| Amazon ASIN | `P5749` | Check your Amazon product page |
| Goodreads work ID | `P8383` | |
| Open Library work ID | `P648` | |
| Google Books ID | `P675` | |
| Library of Congress Control Number | `P1144` | |
| OCLC control number | `P243` | |

---

## How to actually submit this

1. Go to https://www.wikidata.org and log in (verify you can — different
   account/block status from Wikipedia).
2. Click "Create a new item" in the left sidebar.
3. Enter the label and description from Entity 1 above.
4. On the new item page, click "Add statement" for each row in the Statements
   table above. Search the property by its English name; Wikidata
   autocompletes the P-number. For value, link to existing Wikidata items
   (Q-numbers) where shown — don't type free text when a Q exists.
5. Save. Repeat for Entity 2 (the book).
6. On the book entity, set `author` (P50) → link to the Maya Allan entity.
7. On the Maya Allan entity, set `notable work` (P800) → link to the book.
8. **Within 24–72 hours**, Google's Knowledge Graph picks it up and the
   information starts appearing in search Knowledge Panels for your name.

## If you can't submit it yourself

- **Wait out the block** (1 year per your note, but Wikidata may not be affected).
- **Have a trusted friend or family member submit it** under their own account,
  with honest disclosure on the entity's talk page that they know you. Wikidata
  is lenient about this *as long as it's disclosed and the facts are verifiable
  via your website + ISBNs*. Do **not** pay anyone — paid editing is grounds
  for deletion.
- **Appeal the block** at https://en.wikipedia.org/wiki/Wikipedia:Appealing_a_block
  if you believe it was unjustified.

## After it's live

1. Copy the Q-numbers Wikidata gave you (e.g., `Q123456789`).
2. Open `src/lib/identity.ts` in the repo.
3. Uncomment the Wikidata entry in `AUTHOR_PROFILES` and replace `QXXXXXXX`
   with your real Q-number.
4. Add an entry to `AUTHOR_IDENTIFIERS` for type `"Wikidata"`.
5. Redeploy — the schema across your whole site now references Wikidata,
   which closes the loop.
