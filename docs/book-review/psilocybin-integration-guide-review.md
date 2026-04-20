# Editorial Review — *Psilocybin Integration Guide*

**Reviewer:** Claude (AI pairing, not a published editor)
**Date:** 2026-04-19
**Source file:** `C:\Users\MayaAllan\Desktop\Psilocybin Integration Guide Maya Allan.txt`
**Status:** NOT FOR PUBLICATION — this is an editorial pass for Maya's private use.

---

## Overall assessment

Structurally the book is **solid and publishable.** The three-part architecture (Preparation & Basics → The Journey by path → Deepening & Integration) is strong. The 40-scenario framework across Guided/Solo/Group contexts is a genuine differentiator in a crowded genre. Research citations are accurate and well-placed (Carhart-Harris, Griffiths, Johnson, Grob, Davis, Carbonaro, Watts, Barrett, Ecker). Legal disclaimers are thorough. Appendices are practically useful.

The issues below are **editorial, not structural.** Most are quick fixes. Some require a single pass by you; a few need a proofreader.

---

## CRITICAL ISSUE #1 — Character encoding

**The single most important thing to fix before anything else.**

The `.txt` file has systemic encoding damage. Hundreds of `�` replacement characters appear where the original source had:

- **Em dashes (—)** — in nearly every chapter: `hold space-being present` should be `hold space — being present`
- **En dashes (–)** — in numeric ranges: `4�6 hours` should be `4–6 hours`, `1.8�3.2%` should be `1.8–3.2%`
- **Curly quotes (" " ' ')** — throughout dialogue and quoted material
- **Greek letters and subscripts** — in the chemical formula (line 150): `C??H??N?O?P` should be `C₁₂H₁₇N₂O₄P`
- **Bullet points (•)** — in headers: `Rewire Your Mind � Release Fears � Heal Traumas`
- **Mar�a Sabina, teonan�catl** — Spanish characters lost
- **Copyright symbol (©)** — line 32 shows plain "©" as "�"

**Root cause:** The file was saved as ANSI/Windows-1252 or opened with the wrong encoding, converting non-ASCII characters to `?` or `�`. Your original Word/Google Doc manuscript is almost certainly intact — this damage happened at export.

**Fix:**
1. Re-export the manuscript from your source (Word, Google Docs, Scrivener) as **UTF-8**, not ANSI
2. In Word: File → Save As → Encoded Text → Other encoding → Unicode (UTF-8)
3. In Google Docs: File → Download → Plain text (.txt) — Google always exports UTF-8
4. After re-export, every `�` should be gone

**Do not try to fix `�` manually in the corrupted file.** You'll spend hours and miss cases. Fix at the source.

---

## CRITICAL ISSUE #2 — ISBN mismatch

Your book's copyright page (line 38) lists:
> **ISBN: 979-8-9941488-5-3**

But the Open Library form you were filling in has:
> **979-8-9941488-3-9**

**These are different books.** The one you typed into Open Library (ending `-3-9`) is NOT the ISBN printed in this manuscript (ending `-5-3`).

**Action:** Before finalizing Open Library, Goodreads, BookBub, etc., verify which ISBN is correct. Check:
- Your Amazon book detail page
- The printed book itself (last page or back cover)
- Your ISBN purchase records (Bowker if US)

Whichever is authoritative — update the other. Having the wrong ISBN live across retailer pages causes sales tracking issues and reader confusion.

---

## STRUCTURAL INCONSISTENCIES

### Chapter 3 title is inconsistent

- Part I intro (line 137): **"Chapter 3: Dosage & Safety"**
- Actual chapter header (line 222): **"Chapter 3: Dosage and Administration"**
- Table of Contents (line 86): **"Chapter 3: Dosage and Administration"**

Pick one. I'd recommend `Dosage, Safety & Administration` if all three are covered, or keep `Dosage and Administration` and update the Part I intro.

### Part titles in TOC vs. actual

- TOC line 83: **"PART I — PREPARATION & BASICS"**
- Part I header line 132: **"PART I — PREPARATION & BASICS"** ✓

Match. Fine.

- TOC line 92: **"PART III — DEEPENING & INTEGRATION"**
- Check whether the PART III header (somewhere after Chapter 7 ends) uses identical wording.

### Appendix names inconsistent between TOC and actual

- TOC line 98: **"Appendix A: Glossary of Terms"**
- Body line 2261: **"Appendix A: Glossary of Terms"** ✓

- TOC line 99: **"Appendix B: Legal Considerations"**
- Mid-book header line 2247: **"Appendix B: Legal Landscape"** ← different name
- Actual chapter line 2273: **"Appendix B: Legal Considerations"** ✓

The internal mid-book index (around line 2247) uses "Legal Landscape" but TOC and chapter use "Legal Considerations." Fix the mid-book index.

---

## SPECIFIC GRAMMAR / COPY ISSUES

These are the ones I caught on a sampling pass. A professional proofreader will find more.

### Line 68 (Author Bio):

> "Her mission is both simple and profound to remind every seeker..."

Missing colon. Read:

> "Her mission is both simple and profound: to remind every seeker..."

### Line 150 (Chapter 1):

> "Psilocybin (C??H??N?O?P) is a naturally occurring psychedelic compound..."

Chemical formula is mangled. Should be: **C₁₂H₁₇N₂O₄P**

### Line 265, 270, 275, 280 (Chapter 4):

> "As psilocybin takes effect, changes begin subtly"
> "The effects deepen as brain chemistry shifts"
> "This is often the most intense and insightful part of the journey"
> "Gradually, the intensity diminishes as psilocin is metabolized"

Each of these is followed by a bullet list. Each is missing terminal punctuation — add a **colon** before the list, not a period. This pattern repeats throughout the book wherever a sentence introduces bullets.

### Line 325 (Chapter 5):

> "Can they offer gentle touch (hand- holding on request)?"

Stray space: `hand- holding` → `hand-holding`

### Line 322 (Chapter 5):

> "The guide's role is to hold space-being present without directing."

Hyphen where em dash belongs:

> "The guide's role is to hold space — being present without directing."

### Line 414 (shadow scenario):

> "It reveals issues You may have ignored."

`You` incorrectly capitalized mid-sentence.

### Line 2209 (Benefits/Risks, Challenging Trips):

> "these moments can be extremely difficult as they unfold can be extremely difficult in the moment"

**Doubled phrase — accidental duplication.** Read cleaner as:

> "these moments can be extremely difficult as they unfold, though they are often ultimately transformative (Carbonaro et al., 2016)."

### Line 2305 (Appendix D, Pre-Journey Checklist):

> "Setting clear intentions help guide your experience..."

Subject-verb agreement. `Setting` (singular gerund) → `helps`:

> "Setting clear intentions helps guide your experience..."

### Legal disclaimer (line 20, 21):

> "Their possession, use, distribution, or cultivation may be illegal and may involve significant physical, psychological, and legal risks."

Fine as-is. But immediately after:

> "This guide does not offer medical, psychological, therapeutic, or legal advice. The author does not provide diagnosis, treatment, or professional services of any kind.  Always consult..."

**Double space** between "kind." and "Always." Find-and-replace double spaces → single across the book. There are probably many.

### Line 32 (Copyright):

> "Copyright � 2025 Maya Allan."

Should be `©` — same encoding issue.

### Line 34 (Copyright page):

> "Visit www.mayaallan.com for more resources, updates, and integration tools."

Consider adding: `, including the free Integration companion tool at www.mayaallan.com/integration.` Good cross-reference for the reader + marketing hook.

---

## CONTENT NOTES (optional, your call)

These are substantive, not grammatical. Take or leave:

### Appendix B (Legal Landscape, lines 2274-2278)

This reads as of December 2025. Good accuracy for snapshot date. But:

- **Consider adding a "last updated" footnote** so future readers know the state of play as of your writing and expect laws to change.
- Line 2275 mentions "Colorado has launched regulated healing centers and issued pardons for simple possession offenses as of June 2025" — verify the specific wording. Colorado's Natural Medicine Health Act program opened in 2024, and state-level pardons are governor-specific. Make sure this is accurate as written.
- Line 2277 says "Brazil decriminalized small personal amounts in 2025" — I'd double-check this specific legal claim before it's in print. Brazil has complex drug laws; decriminalization of psilocybin specifically should be verified against a primary source.

Legal facts in print age fast and can attract criticism. A one-line footnote saying "For current legal status, please verify with a licensed attorney in your jurisdiction. See mayaallan.com for updates." protects you and helps readers.

### Chapter 1 (Science of Psilocybin, line 156)

Citations are good: Carhart-Harris et al. (2012), Griffiths et al. (2006), Davis et al. (2021), Grob et al. (2011), Johnson et al. (2014).

Minor suggestion: for the 2021 Davis depression study (line 165), the citation in context reads "approximately 70%". The study's actual primary endpoint number is often reported as "71% response" at week 4 and "54% remission" — make sure the number matches the claim you're making. "70%" is a good round number for a reader, but if a clinician reviews the book, they may want the specific figure.

### "Maya" as example name (Appendix D, line 2347)

> "Before her first journey, Maya used this checklist to prepare."

Using **your own name** for a fictional example is distracting to the reader — *is this the author's actual experience? Is this hypothetical? Which?* Consider a different name (Elena, Rachel, Sarah — any other name) to avoid confusion.

---

## TYPOGRAPHY / DESIGN (for print edition)

Not an editorial issue — but worth noting for your book designer if you haven't done layout yet:

- Drop-cap first letters of each chapter look elegant in this kind of book
- Part title pages benefit from a small symbol/glyph (a mushroom? a moon? consistent across parts)
- Scenario headings throughout Chapters 5–7 are structurally repetitive (Description / Cause / Navigation / Lesson / Example) — a sidebar or box design treatment helps readers skim and reference. Talk to your designer about this.

---

## WHAT A PROFESSIONAL PROOFREADER WILL CATCH THAT I COULDN'T

- Print-level typographic conventions (widow/orphan lines, spacing around em dashes per your house style)
- Consistent capitalization of concepts that get repeated (is it *Default Mode Network* or *default mode network*?)
- Citation formatting consistency (APA? Chicago? Your call — but pick one and stick to it)
- Hundreds of micro-issues (double spaces, stray commas, capitalization of headings)

**Recommendation:** After you fix the encoding issue, hire a **proofreader** (not a developmental editor — the book's already developed). Proofreaders charge $300-$800 for a book this length. Google "book proofreading" or post on Reedsy. Cheaper than a copyeditor, exactly what this book needs now.

---

## PRIORITY ACTION LIST

1. **Re-export the manuscript as UTF-8** from Word/Google Docs to fix all `�` characters at once. *(15 minutes. This is the one thing that unlocks everything else.)*
2. **Verify and reconcile the ISBN** (manuscript says `-5-3`, Open Library form says `-3-9`). *(10 minutes.)*
3. **Fix the Chapter 3 title inconsistency** ("Dosage & Safety" vs "Dosage and Administration"). *(2 minutes.)*
4. **Fix specific line-level grammar issues** from the list above (~10 items). *(20 minutes.)*
5. **Hire a proofreader** for the final pass. Budget $300-$800, 1-2 week turnaround. *(Outside your direct time.)*
6. **Optional:** rename the "Maya" example character in Appendix D to avoid reader confusion. *(1 minute.)*

**Total your-time investment: ~50 minutes to prepare a clean manuscript for a proofreader.**

---

## The bigger picture

You have a book people will find useful. The structure works, the research is there, the voice is clear. The issues above are polish, not foundations.

Do the encoding fix first. Then the other small items. Then send to a proofreader. Then re-upload everywhere (Amazon KDP allows revised manuscripts).

This is not nothing — but it's a weekend, not a month.
