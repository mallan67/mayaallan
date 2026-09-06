/**
 * Evidence / safety contracts for content/faq.json and content/glossary.json
 * (fix/faq-glossary-evidence-safety-2026-09-06).
 *
 *   1. The five frozen entries (three FAQ, two glossary) are unchanged from
 *      base 7452de6 — they support the September 5 indexing experiment.
 *   2. The two frozen experiment content files and the two frozen page
 *      routes are byte-identical to base (sha256 snapshot).
 *   3. Non-frozen glossary definitions carry no actionable dosing patterns.
 *   4. The three known unsupported FAQ timing thresholds are gone.
 *   5. Both files parse; required fields, categories and cross-references
 *      are intact.
 *   6. No entry was deleted or duplicated.
 *
 * Deliberately NOT a blanket ban on numbers: years, study sizes and other
 * factual figures are legitimate. The patterns below target amounts to take,
 * schedules to follow and dose-spacing advice.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url))
const faq = JSON.parse(readFileSync(p("../../content/faq.json"), "utf8"))
const glossary = JSON.parse(readFileSync(p("../../content/glossary.json"), "utf8"))
const fixture = JSON.parse(readFileSync(p("../fixtures/frozen-content.base-7452de6.json"), "utf8"))

const FROZEN_FAQ = ["ego-dissolution-feel", "ego-dissolution-duration", "default-mode-network"]
const FROZEN_GLOSSARY = ["ego-dissolution", "re-entry"]

const faqById = new Map(faq.questions.map((q) => [q.id, q]))
const termById = new Map(glossary.terms.map((t) => [t.id, t]))
const nonFrozenFaq = faq.questions.filter((q) => !FROZEN_FAQ.includes(q.id))
const nonFrozenTerms = glossary.terms.filter((t) => !FROZEN_GLOSSARY.includes(t.id))

// ---------------------------------------------------------------------------
// 1 + 2. Frozen surfaces
// ---------------------------------------------------------------------------

test("the three frozen FAQ entries are unchanged from base (field-for-field)", () => {
  for (const id of FROZEN_FAQ) {
    assert.equal(JSON.stringify(faqById.get(id)), JSON.stringify(fixture.frozenFaq[id]), `frozen FAQ entry unchanged: ${id}`)
  }
})

test("the two frozen glossary entries are unchanged from base (field-for-field)", () => {
  for (const id of FROZEN_GLOSSARY) {
    assert.equal(JSON.stringify(termById.get(id)), JSON.stringify(fixture.frozenGlossary[id]), `frozen glossary entry unchanged: ${id}`)
  }
})

// Line endings are normalized before hashing: the repo stores LF, but a
// Windows checkout with core.autocrlf=true sees CRLF, and the digest must be
// identical on both (Codex P1 on #51). Content is otherwise byte-for-byte.
const sha256Normalized = (buf) => createHash("sha256").update(buf.toString("utf8").replace(/\r\n/g, "\n")).digest("hex")

test("frozen experiment content files and page routes are unchanged from base (sha256, LF-normalized)", () => {
  for (const [rel, expected] of Object.entries(fixture.frozenFiles)) {
    const actual = sha256Normalized(readFileSync(p("../../" + rel)))
    assert.equal(actual, expected, `unchanged: ${rel}`)
  }
})

// ---------------------------------------------------------------------------
// 3. No actionable dosing patterns in non-frozen glossary definitions
// ---------------------------------------------------------------------------

const DOSING_PATTERNS = [
  [/\b\d+(\.\d+)?\s?(g|grams?|mg)\b/i, "gram / milligram amount"],
  [/\b\d+(\.\d+)?\s?-\s?\d+(\.\d+)?\s?(g|grams?)\b/i, "gram dose band"],
  [/\b1\s?\/\s?(10|20)\b/, "fraction-of-dose guidance"],
  [/\b(Fadiman|Stamets)\b/, "named dosing protocol"],
  [/\bdays? on\b[^.]*\bdays? off\b/i, "on/off schedule"],
  [/\b\d+\s?(-|–|to)\s?\d+\s?(days|weeks)\s+between\b/i, "dose-spacing recommendation"],
  [/\bfirst-time users?\b/i, "first-time-user advice"],
  [/\b(dose verification|reagent testing|safe sourcing)\b/i, "sourcing / testing instruction"],
  [/\bbest practices\b/i, "procedural best practices"],
  [/\boptimi[sz]ing (the )?setting\b/i, "setting-optimization guidance"],
  [/\bsilent darkness\b/i, "heroic-dose protocol"],
]

test("non-frozen glossary definitions contain no actionable dosing, schedule, sourcing or protocol patterns", () => {
  const hits = []
  for (const t of nonFrozenTerms) {
    for (const [re, label] of DOSING_PATTERNS) {
      const m = t.definition.match(re)
      if (m) hits.push(`${t.id}: ${label} ("${m[0]}")`)
    }
  }
  assert.deepEqual(hits, [])
})

test("non-frozen FAQ answers contain no gram/milligram amounts or named dosing protocols", () => {
  const hits = []
  for (const q of nonFrozenFaq) {
    for (const [re, label] of DOSING_PATTERNS.slice(0, 5)) {
      const m = q.answer.match(re)
      if (m) hits.push(`${q.id}: ${label} ("${m[0]}")`)
    }
  }
  assert.deepEqual(hits, [])
})

// ---------------------------------------------------------------------------
// 4. Known unsupported FAQ thresholds are gone, not replaced by new ones
// ---------------------------------------------------------------------------

test("the three exact unsupported timing thresholds no longer appear anywhere in the FAQ", () => {
  const raw = readFileSync(p("../../content/faq.json"), "utf8")
  assert.doesNotMatch(raw, /beyond about six weeks/)
  assert.doesNotMatch(raw, /lingers beyond a week/)
  assert.doesNotMatch(raw, /persist beyond 1[–-]2 weeks/)
})

test("help-seeking answers key on severity, persistence and impairment rather than a fixed number of days/weeks", () => {
  for (const id of ["feel-disconnected-after", "bad-trip-destabilized", "warning-signs-help"]) {
    const a = faqById.get(id).answer
    assert.doesNotMatch(a, /\b(beyond|after|more than|over)\s+(about\s+)?(a|one|two|three|\d+)(\s?[–-]\s?\d+)?\s+(day|days|week|weeks|month|months)\b/i, `${id}: no invented universal duration`)
    assert.match(a, /worse|worsen|interfer|daily life|functioning|severity|persist/i, `${id}: mentions worsening / impairment / persistence`)
  }
  assert.match(faqById.get("bad-trip-destabilized").answer, /988|crisis line|emergency/i, "crisis guidance remains direct")
  assert.match(faqById.get("warning-signs-help").answer, /immediate|emergency|crisis/i)
})

// ---------------------------------------------------------------------------
// 5 + 6. Structure, cross-references, no deletions or duplicates
// ---------------------------------------------------------------------------

test("FAQ: every entry has id, category, question and answer; categories and relatedUrl are valid", () => {
  const cats = new Set(faq.categories.map((c) => c.id))
  assert.deepEqual([...cats], fixture.faqCategoryIds)
  for (const q of faq.questions) {
    for (const f of ["id", "category", "question", "answer"]) assert.ok(typeof q[f] === "string" && q[f].length > 0, `${q.id ?? "?"}.${f}`)
    assert.ok(cats.has(q.category), `${q.id}: category ${q.category} exists`)
    if (q.relatedUrl !== undefined) assert.match(q.relatedUrl, /^\/[a-z0-9/-]+$/)
  }
})

test("glossary: every term has id, term, category and definition; relatedTerms and categories resolve", () => {
  const cats = new Set(glossary.categories.map((c) => c.id))
  assert.deepEqual([...cats], fixture.glossaryCategoryIds)
  for (const t of glossary.terms) {
    for (const f of ["id", "term", "category", "definition"]) assert.ok(typeof t[f] === "string" && t[f].length > 0, `${t.id ?? "?"}.${f}`)
    assert.ok(cats.has(t.category), `${t.id}: category ${t.category} exists`)
    for (const r of t.relatedTerms ?? []) assert.ok(termById.has(r), `${t.id}: relatedTerm ${r} exists`)
  }
})

test("no entry accidentally deleted: every base ID is still present (additions and reordering are allowed)", () => {
  // Only the five frozen entries are pinned to the base snapshot (above).
  // Here the snapshot is used solely as a deletion guard, so routine FAQ /
  // glossary expansion does not require rewriting the fixture (Codex on #51).
  const faqIds = new Set(faq.questions.map((q) => q.id))
  const termIds = new Set(glossary.terms.map((t) => t.id))
  const missingFaq = fixture.faqIds.filter((id) => !faqIds.has(id))
  const missingTerms = fixture.glossaryIds.filter((id) => !termIds.has(id))
  assert.deepEqual(missingFaq, [], "FAQ entries deleted")
  assert.deepEqual(missingTerms, [], "glossary entries deleted")
})

test("no duplicated IDs in the current FAQ and glossary", () => {
  const dup = (ids) => ids.filter((id, i) => ids.indexOf(id) !== i)
  assert.deepEqual(dup(faq.questions.map((q) => q.id)), [])
  assert.deepEqual(dup(glossary.terms.map((t) => t.id)), [])
})

test("no population-prevalence inference for lasting harm from selected cohorts (Codex P2 on #51)", () => {
  // Carbonaro 2016 and Evans 2023 both recruited people who had already had a
  // difficult experience, so they cannot say how often lasting harm occurs.
  const texts = [
    ["glossary difficult-experience", termById.get("difficult-experience").definition],
    ["glossary ego-death", termById.get("ego-death").definition],
    ["faq bad-trip-destabilized", faqById.get("bad-trip-destabilized").answer],
    ["faq warning-signs-help", faqById.get("warning-signs-help").answer],
    ["faq feel-disconnected-after", faqById.get("feel-disconnected-after").answer],
  ]
  for (const [label, text] of texts) {
    assert.doesNotMatch(text, /\b(not rare|rarely|is rare|is common|a minority of people|most people)\b/i, `${label}: no prevalence claim`)
  }
  assert.match(termById.get("difficult-experience").definition, /neither shows how often|not well established/i)
})

// ---------------------------------------------------------------------------
// Independent evidence review on #51 (three content corrections)
// ---------------------------------------------------------------------------

test("psilocybin: Colorado licensing is not misdated to 2026", () => {
  const d = termById.get("psilocybin").definition
  assert.doesNotMatch(d, /first cent(er|re)s licensed in 2026/i)
  assert.doesNotMatch(d, /Colorado[^.]*\b2026\b/, "no 2026 date attached to the Colorado program")
})

test("psychedelic-assisted therapy: the 2026 MDMA resubmission is stated as reported, not as confirmed fact", () => {
  const d = termById.get("psychedelic-assisted-therapy").definition
  assert.match(d, /declined by the FDA in 2024/)
  assert.match(d, /resubmission was reported in August 2026/)
  // A categorical "resubmitted in 2026" is only acceptable once a primary
  // Resilient / FDA source confirms the filing — change this test with it.
  assert.doesNotMatch(d, /\b(and|was) resubmitted in 2026\b/)
})

test("prepare-first-experience: screening is explained by specific safety concerns, not a risk-ranking inference", () => {
  const a = faqById.get("prepare-first-experience").answer
  assert.doesNotMatch(a, /serious harm is most likely/i)
  assert.doesNotMatch(a, /groups in which .* most likely/i)
  assert.match(a, /psychiatric, cardiovascular, and drug-interaction safety concerns/)
  assert.match(a, /Johnson, Richards and Griffiths, 2008/)
})

test("every definition still answers 'what does this term mean' — not a disclaimer wall", () => {
  for (const t of nonFrozenTerms) {
    const words = t.definition.split(/\s+/).length
    assert.ok(words >= 30 && words <= 170, `${t.id}: ${words} words`)
    // Definition first: the opening sentence must not itself be a disclaimer.
    const first = t.definition.split(/(?<=\.)\s/)[0]
    assert.doesNotMatch(first, /not medical advice|does not provide|educational only/i, `${t.id}: opens with a definition`)
  }
})
