/**
 * Contracts for fix/book-runtime-faq-consistency-2026-09-06.
 *
 * The book's machine-facing summary (Book JSON-LD `description`, llms feeds,
 * OG/Twitter image fallback) said the book "does not provide instructions for
 * obtaining, dosing, or using psilocybin". The printed book's Part I does
 * contain preparation and dosage material, so that sentence misdescribed the
 * book. The generic fallback also described any future book as a psilocybin
 * book. Two comments still referred to the book FAQ removed in #52, and the
 * site FAQ answer `book-scenarios` misdescribed the scenarios' Navigation
 * component as afterward reflection.
 *
 * identity.ts has no imports, so it loads under plain `node --test`.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { BOOK_MACHINE_SUMMARIES, bookMachineSummary } from "../../src/lib/identity.ts"

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url))
const identitySrc = readFileSync(p("../../src/lib/identity.ts"), "utf8")
const faq = JSON.parse(readFileSync(p("../../content/faq.json"), "utf8"))

const APPROVED_SUMMARY =
  "Psilocybin Integration Guide is an educational, non-clinical resource for post-experience reflection, integration, and self-inquiry. It offers practical frameworks for making sense of meaningful or difficult experiences and applying insights to everyday life. It is not a clinical or professional text and is not a substitute for medical, legal, or professional advice."

const ABSENCE_CLAIM = /does not provide instructions|no (dosing|dose|use) (instructions|guidance)|contains no/i
const SUBJECT_SPECIFIC = /psilocybin|psychedelic|mushroom|dosing|dose|dosage|obtaining|using|use of/i

test("curated summary for psilocybin-integration-guide is the approved machine-facing text", () => {
  assert.equal(BOOK_MACHINE_SUMMARIES["psilocybin-integration-guide"], APPROVED_SUMMARY)
  assert.equal(bookMachineSummary("psilocybin-integration-guide", "Psilocybin Integration Guide"), APPROVED_SUMMARY)
})

test("no machine summary claims the book contains no dosing / obtaining / use material", () => {
  for (const [slug, text] of Object.entries(BOOK_MACHINE_SUMMARIES)) {
    assert.doesNotMatch(text, ABSENCE_CLAIM, `curated summary ${slug}`)
  }
  assert.doesNotMatch(bookMachineSummary("some-future-book", "Some Future Book"), ABSENCE_CLAIM, "fallback")
})

test("generic fallback is subject-neutral: title interpolated, no psilocybin / dosing / obtaining / using language", () => {
  const withTitle = bookMachineSummary("some-future-book", "Some Future Book")
  assert.equal(
    withTitle,
    '"Some Future Book" by Maya Allan is an educational, non-clinical resource. It is not a clinical or professional text and is not a substitute for medical, legal, or professional advice.',
  )
  assert.doesNotMatch(withTitle, SUBJECT_SPECIFIC)
  const withoutTitle = bookMachineSummary("some-future-book")
  assert.match(withoutTitle, /^This book by Maya Allan is an educational, non-clinical resource\./)
  assert.doesNotMatch(withoutTitle, SUBJECT_SPECIFIC)
})

test("no comment in identity.ts still refers to the book FAQ removed in #52", () => {
  const comments = identitySrc.split(/\r?\n/).filter((l) => /^\s*(\/\/|\*|\/\*)/.test(l)).join("\n")
  assert.doesNotMatch(comments, /book FAQ/i)
  assert.doesNotMatch(comments, /What is this book about\?/)
})

test("FAQ book-scenarios describes the five-part scenario structure, not afterward reflection", () => {
  const a = faq.questions.find((q) => q.id === "book-scenarios").answer
  assert.doesNotMatch(a, /how to reflect on it afterward/)
  assert.match(a, /Each scenario follows Description, Cause, Navigation, Lesson, and Example: what is happening, why it arises, how to navigate it, the lesson it can carry, and an example\./)
  assert.match(a, /40 real journey scenarios/)
  assert.match(a, /non-clinical, educational book/)
})
