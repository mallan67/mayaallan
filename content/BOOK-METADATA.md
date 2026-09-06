# Book Metadata — *Psilocybin Integration Guide*

**What this file is.** A manually maintained reference and copy-paste sheet for external book platforms (Amazon KDP, Goodreads, Bookshop, Open Library, LibraryThing and similar).

**What this file is not.** It is not a runtime source for mayaallan.com — nothing on the site reads it. For **author positioning** it is subordinate to the canonical identity constants in code (`src/lib/identity.ts`: `AUTHOR_NAME`, `AUTHOR_JOB_TITLE`, `AUTHOR_BIO`); if this file and those constants ever disagree, the constants are right and this file is stale. That code-wins rule covers the `AUTHOR_*` constants only. It does **not** extend to `BOOK_MACHINE_SUMMARIES`, which is known-stale runtime copy about the book (see the accuracy rule in "Approved external positioning") and must be corrected in code, not treated as authoritative. Book listing data on the site comes from the `books` database row, not from here.

**Before reusing anything below**, recheck externally maintained facts (ISBNs, dates, page count, categories, platform rules) against the relevant publishing account or platform documentation. Each section states where its content comes from.

Last reviewed: 2026-09-06

---

## Core identifiers

| Field | Value | Source |
|---|---|---|
| **Title** | Psilocybin Integration Guide | Matches the site (`books` row, Book JSON-LD) |
| **Subtitle** | 40 Real Scenarios for Navigating What You See, Feel & Experience | Matches the site (`alternativeHeadline`) |
| **Cover tagline 1 (printed)** | Rewire Your Mind • Release Fears • Heal Traumas | Printed cover — factual record only; not the canonical author positioning (see "Approved external positioning") |
| **Cover tagline 2 (printed)** | Inner Freedom • Self-Agency • Awakening • Transformation | Printed cover — factual record only |
| **Author** | Maya Allan | `AUTHOR_NAME` |
| **Author role** | Author and Educator | `AUTHOR_JOB_TITLE` |
| **Publisher** | Maya Allan (self-published) | Matches the site's Book JSON-LD publisher |
| **First edition** | December 2025 | Externally maintained (KDP account) — not verified from the repository; last checked 2026-09-06 against this file only |
| **Language** | English | Matches the site (`inLanguage: en`) |
| **Amazon ASIN** | B0G7JWDJYQ — `amazon.com/dp/B0G7JWDJYQ` | `BOOK_ASINS` in `identity.ts`; listing verified 2026-05-19 |
| **Page count** | 289 (hardcover) | Externally maintained (KDP) — not verified from the repository |
| **Primary category** | Self-Help / Personal Growth / Spiritual | Externally maintained — recheck in the KDP account |
| **Secondary category** | Body, Mind & Spirit / Entheogens & Visionary Substances | Externally maintained — recheck in the KDP account |

---

## ISBNs — one per edition

Externally maintained (KDP / Google Play accounts). The repository does not verify these; the site's Book JSON-LD currently carries the ASIN only. The paperback ISBN matches the EAN `9798994148839` embedded in the site's Bookshop, Barnes & Noble and Waterstones links.

| ISBN | Edition | Channel |
|---|---|---|
| **979-8-9941488-3-9** | Paperback | Amazon (KDP Print) |
| **979-8-9941488-5-3** | Hardcover | Amazon (KDP Hardcover) |
| **979-8-9941488-9-1** | Ebook | Google Play Books |

ISBN rule (per current KDP guidance; recheck in the KDP account): KDP requires an ISBN for paperback and hardcover titles that require one; an ISBN is not required to publish a KDP eBook. If Maya supplies her own ISBN and prints it in a print manuscript, that printed ISBN must match the ISBN entered for that edition during title setup. Each edition uses its own ISBN; there is no requirement that every edition print an ISBN on its copyright page.

---

## Approved external positioning

Copy in this section aligns with the site's current non-clinical positioning: post-experience reflection, integration, self-inquiry, personal agency, and educational rather than professional or clinical guidance. Use it for author profiles and retailer descriptions. It is derived from `AUTHOR_BIO` and the site's own book copy.

**Accuracy rule for retailer pages.** This copy must describe the purchased book truthfully. The printed book's Part I contains preparation material (set and setting, dosage, fasting, the role of a guide or sitter — see the manuscript-derived section and `docs/book-review/psilocybin-integration-guide-review.md`). Approved copy therefore must **not** claim the book contains no dosing or use material, and must **not** use that material as a selling point either: it stays silent on it and states the non-clinical position. The same discipline applies to outcomes: the printed cover and manuscript use healing language ("Heal Traumas", "healing trauma through catharsis"), so approved copy must not deny that the book does; it simply makes no therapeutic promises of its own. (Known stale runtime description, recorded here for a separate runtime PR: `BOOK_MACHINE_SUMMARIES["psilocybin-integration-guide"]` in `src/lib/identity.ts` describes the *book* with the same "does not provide instructions for obtaining, dosing, or using psilocybin" sentence, and `generateBookSchema` emits it as the Book JSON-LD `description`, which also feeds the llms feeds. Against the manuscript facts above that sentence is inaccurate for the book and should be corrected in code, not preserved. It is not reused here.)

### Tagline (short fields)

> Forty real journey scenarios, and a non-clinical, educational guide to making sense of them afterward.

### Short description (~60 words)

> Psilocybin Integration Guide is an educational resource for post-experience reflection, integration, and self-inquiry. It offers practical frameworks for making sense of meaningful or difficult experiences and applying insights to everyday life. It is an educational book, not a clinical or professional text, and it is not a substitute for medical, legal, or professional advice. This description makes no therapeutic promises.

### Medium description (~120 words)

> Psilocybin Integration Guide by Maya Allan walks through 40 real journey scenarios — ego dissolution, shadow figures, entity contact, cosmic consciousness, inner child material, difficult emotional release, and the re-entry phase. Each scenario is structured as Description, Cause, Navigation, Lesson, and Example: what is happening, why it arises, how to navigate it, the lesson it can carry, and an example.
>
> It is a non-clinical, educational book written for readers exploring post-experience reflection and integration. Its focus is the meaning-making after an experience, which the book treats as the reader's own to do. It is not a clinical or professional text and is not a substitute for medical, legal, or professional advice; this description makes no therapeutic promises, and readers are responsible for understanding and complying with local laws.

### Audience line

> Readers exploring post-experience reflection, integration, and self-inquiry.

---

## Manuscript-derived descriptions — verify before reuse

The descriptions below were written from the printed book's structure and predate the site's current positioning. They record what the manuscript contains (Part I preparation material including dosage, fasting, and the role of a guide or sitter; Part II journey scenarios; Part III integration; appendices; the research and lineage influences the manuscript cites). They are kept here as a factual record of the printed book, **not** as Maya's credentials or expertise, and **not** as approved external marketing claims.

Before any sentence below is reused on an external platform: (1) check it against the actual manuscript; (2) replace audience and authority wording ("practitioners, healers, facilitators", "medicine long shrouded in mystery", "direct integration practice") with the approved positioning above; (3) do not present preparation or dosing content as a selling point in copy that carries the author's name alongside the site.

### Legacy tagline

> A grounded, research-informed companion for every phase of the psilocybin journey — 40 real scenarios with practical navigation.

### Legacy short description

> A grounded, research-informed companion for anyone working with psilocybin. Through 40 real scenarios — from ego dissolution and shadow work to inner child healing and integration — author Maya Allan walks readers through what can arise during a journey, why, and how to navigate it with care. For guided, solo, and group journeys alike.

### Legacy medium description

> A grounded, research-informed companion for anyone working with psilocybin. Through 40 real scenarios — from ego dissolution and shadow work to inner child healing and cosmic consciousness — this guide walks you through what can arise during a psilocybin journey, why it's happening, and how to navigate it with care.
>
> Structured for guided, solo, and group journeys, it covers preparation, dosage, safety, and the post-journey work of integration — the phase where most insight lives or dies. Drawing on peer-reviewed research (Carhart-Harris, Griffiths, Davis, Ecker) and traditional wisdom, Maya Allan brings clarity and compassion to a medicine long shrouded in mystery and stigma.
>
> For practitioners, healers, facilitators, and anyone seeking psilocybin with intention rather than escape.

### Legacy long description

> The psilocybin journey is an inner pilgrimage — a return to truth. But the moments that matter most often happen at the edges: when ego begins to dissolve, when old grief surfaces unbidden, when an entity appears with a message, or when the journey ends and you're left asking *"what do I do with what I saw?"*
>
> This book is a grounded, research-informed companion for every phase of that journey. Through 40 real scenarios — each structured with Description, Cause, Navigation, Lesson, and Example — Maya Allan walks you through what may arise during a psilocybin experience, what it means, and how to move through it with care.
>
> **Part I — Preparation & Basics.** Understanding what psilocybin does in your brain and body, set and setting, dosage, fasting, and the role of a guide or sitter.
>
> **Part II — The Journey (Choose Your Path).** The heart of the book. 40 scenarios organized across three paths: journeys with a guide or friend, solo journeys, and group journeys. From cosmic consciousness to past-life regression to healing trauma through catharsis, each scenario is mapped with practical tools and deeper meaning.
>
> **Part III — Deepening & Integration.** Where most books in this space are weakest and this one is strongest. A dedicated Inner Child chapter with trauma-informed care, a full chapter on integration practices, ethical considerations, and post-journey reflection.
>
> Appendices include a glossary, the current legal landscape (as of December 2025), curated resources, and practical integration worksheets you can use immediately.
>
> Drawing on peer-reviewed research (Johns Hopkins, Imperial College London, Nader, Ecker), lineage wisdom (Mazatec, Aztec), and direct integration practice, this guide meets you where you are. Whether you are preparing for your first journey, supporting someone else's, or still making sense of one that happened years ago, everything you need is here — clearly, gently, and step by step.
>
> **This is not a recreational guide. This is the book for people who approach psilocybin with intention.**

---

## Amazon KDP categories

Amazon KDP currently permits up to **3 category selections** per title. They are chosen in Amazon's current category / subcategory / placement picker, not by entering BISAC codes; the available selections differ by marketplace and sometimes by format, and they must be rechecked in the live KDP account before or during any update. The actual selections made in the KDP account are not recorded in this file. Do not treat the BISAC codes below as the values to enter in the KDP category picker.

## BISAC codes / external publishing metadata

Externally maintained records for IngramSpark and other systems that use BISAC subject codes — recheck in the relevant publishing account before reuse. They are not the current Amazon KDP category selections.

Primary:
- **OCC037000** — BODY, MIND & SPIRIT / Entheogens & Visionary Substances

Secondary candidates:
- **SEL021000** — SELF-HELP / Motivational & Inspirational
- **SEL036000** — SELF-HELP / Personal Growth / Self-Esteem
- **SEL032000** — SELF-HELP / Spiritual
- **PSY022040** — PSYCHOLOGY / Psychotherapy / Counseling — note: a psychotherapy category sits awkwardly with the book's non-clinical positioning; prefer the Self-Help options unless the manuscript supports it.

---

## Keywords / search tags

Amazon KDP accepts up to **7 keywords or short phrases** and requires that they accurately describe the book. Reviewed 2026-09-06 against the manuscript description above and the current non-clinical positioning.

Recommended for Amazon KDP (4 candidates; use additional slots only for accurate, manuscript-supported phrases not already represented in the title, contributors, categories, or other metadata):
1. `psychedelic integration` — the book's subject
2. `psilocybin trip scenarios` — Part II (40 scenarios)
3. `mushroom journey handbook` — Part II structure
4. `inner child work` — Part III (dedicated Inner Child chapter)

Not recommended as a keyword: `psilocybin integration guide` — it duplicates the title, and current KDP guidance says to avoid keywords that repeat information already present elsewhere in the book's metadata.

Removed from the former "Core 7" on review:
- `psychedelic integration therapy` — "therapy" frames the book as clinical treatment, which it is not, and the approved copy makes no therapeutic promises.
- `trauma integration psychedelics` — a therapeutic-outcome claim; the manuscript's trauma-informed Inner Child chapter does not make the book a trauma-treatment guide.
- `psilocybin microdosing safety` — not the book's subject, and the site provides no dosing or use guidance.

Additional tags for Goodreads / BookBub / LibraryThing (descriptive of the book's topics; "trauma healing" removed for the reason above):
- psilocybin
- psychedelic
- integration
- mushrooms
- consciousness
- plant medicine
- inner work
- shadow work
- ego death
- spiritual awakening
- mystical experience
- self-inquiry
- spirituality
- mindfulness

---

## Author bio variants

Derived directly from the canonical `AUTHOR_BIO` and `AUTHOR_JOB_TITLE` in `src/lib/identity.ts`. Do not add credentials, lived psychedelic experience, therapeutic qualifications, practitioner status, or clinical authority. If `identity.ts` changes, regenerate these.

### Short (~50 words)

> Maya Allan is an author and educator focused on psilocybin integration, post-journey reflection, and self-inquiry. She writes non-clinical, educational resources — including the Psilocybin Integration Guide — that help readers make sense of their own experiences. Free reflection tools and more writing are at mayaallan.com.

### Medium (~80 words)

> Maya Allan is an author and educator focused on psilocybin integration, post-journey reflection, and self-inquiry. She writes non-clinical, educational resources — including the Psilocybin Integration Guide — that help readers make sense of their own experiences and build a personal reflective practice. Her work centers on personal agency: the meaning-making after an experience is the reader's own to do. Free reflection tools and integration resources are available at mayaallan.com.

---

## Links & URLs

| Where | URL |
|---|---|
| Author website | https://www.mayaallan.com |
| Practices (reflection tools landing) | https://www.mayaallan.com/practices |
| Integration Reflection | https://www.mayaallan.com/integration-reflection |
| Blog | https://www.mayaallan.com/blog |
| Book page | https://www.mayaallan.com/books/psilocybin-integration-guide |

---

## Amazon KDP book description HTML (ready to paste)

Amazon KDP allows a limited set of HTML tags in book descriptions: `<b>`, `<em>`, `<i>`, `<u>`, `<p>`, `<br>`, `<h4>` through `<h6>`, `<ol>`, `<ul>`, `<li>`. Do not include URLs, testimonials, review requests, pricing, or promotional dates — Amazon prohibits them inside the description. Recheck current KDP help before pasting.

### Approved positioning version

```html
<p><b>Psilocybin Integration Guide</b> is an educational resource for post-experience reflection, integration, and self-inquiry.</p>

<p>It walks through <b>40 real journey scenarios</b> &mdash; ego dissolution, shadow figures, entity contact, cosmic consciousness, inner child material, difficult emotional release, and the re-entry phase. Each scenario is structured as Description, Cause, Navigation, Lesson, and Example: what is happening, why it arises, how to navigate it, the lesson it can carry, and an example.</p>

<p>It is a non-clinical, educational book written for readers exploring post-experience reflection and integration. Its focus is the meaning-making after an experience, which the book treats as the reader's own to do.</p>

<p><em>It is not a clinical or professional text and is not a substitute for medical, legal, or professional advice. This description makes no therapeutic promises. Readers are responsible for understanding and complying with local laws.</em></p>
```

### Manuscript-derived version — verify before reuse

Formatted from the legacy long description; subject to the same checks as that section (manuscript accuracy; replace audience and authority wording with the approved positioning).

```html
<p><em>The psilocybin journey is an inner pilgrimage &mdash; a return to truth.</em> But the moments that matter most often happen at the edges: when ego begins to dissolve, when old grief surfaces unbidden, when an entity appears with a message, or when the journey ends and you're left asking <em>"what do I do with what I saw?"</em></p>

<p>This book is a grounded, research-informed companion for every phase of that journey. Through <b>40 real scenarios</b> &mdash; each structured with Description, Cause, Navigation, Lesson, and Example &mdash; Maya Allan walks you through what may arise during a psilocybin experience, what it means, and how to move through it with care.</p>

<h4>What's inside</h4>

<p><b>Part I &mdash; Preparation &amp; Basics.</b> Understanding what psilocybin does in your brain and body, set and setting, dosage, fasting, and the role of a guide or sitter.</p>

<p><b>Part II &mdash; The Journey (Choose Your Path).</b> 40 scenarios organized across three paths: journeys with a guide or friend, solo journeys, and group journeys. From cosmic consciousness to past-life regression to healing trauma through catharsis.</p>

<p><b>Part III &mdash; Deepening &amp; Integration.</b> A dedicated Inner Child chapter with trauma-informed care, a full chapter on integration practices, ethical considerations, and post-journey reflection.</p>

<p>Appendices include a glossary, the current legal landscape (as of December 2025), curated resources, and practical integration worksheets.</p>

<p>Drawing on peer-reviewed research (Johns Hopkins, Imperial College London, Coherence Therapy), lineage wisdom, and direct integration practice, this guide meets you where you are.</p>

<p><b>This is not a recreational guide. This is the book for people who approach psilocybin with intention.</b></p>
```

---

## Safety disclaimer for retailer pages (always include on product pages where possible)

> *This book is for informational and educational purposes only. Psilocybin is a controlled substance in many jurisdictions. This guide does not promote illegal activity, diagnose, prescribe, or offer medical or legal advice. Readers are responsible for understanding and complying with local laws.*

---

## Platform-specific reminders

Platform rules change; recheck each platform's current help pages before acting on these.

- **Amazon KDP:** up to 3 categories at title setup and up to 7 keywords or short phrases; keywords must accurately describe the book. Use the recommended list above.
- **Goodreads:** reader-driven platform. Tag generously. Invite readers to review. Once you claim your author page, post the first chapter excerpt in your bio. (The author-page claim is still pending per `identity.ts`; the book listing itself is verified.)
- **BookBub:** uses category + tags. They curate Featured Deals based on genre fit. Body/Mind/Spirit is your primary.
- **Open Library:** minimal metadata required — title, author, publisher, date, ISBN. After creating the record, you can add cover image, description, and subjects.
- **LibraryThing:** small but passionate user base. Good for niche discoverability.
- **Your own site:** the book page on mayaallan.com renders the `books` database row (title, subtitles, blurb, cover, prices, retailer links). For this book it also renders, in code, an "After your journey — Integration" section with a direct link to the Integration Reflection tool (`/integration-reflection`) and a "Related reading" section linking the site's research article and the ego-dissolution scenario. It does not read this file, and it no longer emits a book FAQ.
