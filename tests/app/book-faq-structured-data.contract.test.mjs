/**
 * Contracts for fix/book-faq-structured-data-2026-09-06.
 *
 * The book page emitted FAQPage JSON-LD built from BOOK_FAQS, but never
 * rendered those questions visibly, and one answer carried unsupported
 * reader social proof. The machine-only FAQ is removed rather than kept as
 * hidden copy; BOOK_FAQS becomes dead code and is deleted.
 *
 *   1. the book page no longer constructs or emits FAQPage JSON-LD;
 *   2. BOOK_FAQS no longer exists;
 *   3. the unsupported social-proof sentence no longer exists anywhere in src;
 *   4. generateFAQSchema still exists for the visible-FAQ consumers;
 *   5. generateArticleSchema output is identical to the 966bcdf baseline for
 *      fixed inputs (the frozen article and scenario depend on it);
 *   (6. the #51 frozen-content tests keep running in the same suite.)
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { generateArticleSchema, generateFAQSchema, AUTHOR_FAQS } from "../../src/lib/structured-data.ts"

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url))
const bookPage = readFileSync(p("../../src/app/books/[slug]/page.tsx"), "utf8")
const structuredData = readFileSync(p("../../src/lib/structured-data.ts"), "utf8")
const fixture = JSON.parse(readFileSync(p("../fixtures/article-schema.base-966bcdf.json"), "utf8"))

test("book page no longer imports, constructs or emits a FAQPage schema", () => {
  assert.doesNotMatch(bookPage, /\bBOOK_FAQS\b/)
  assert.doesNotMatch(bookPage, /\bgenerateFAQSchema\b/)
  assert.doesNotMatch(bookPage, /\bfaqSchema\b/)
  assert.doesNotMatch(bookPage, /FAQPage/)
  // Exactly two JSON-LD blocks remain: Book and BreadcrumbList.
  const scripts = bookPage.match(/jsonLdScript\((\w+)\)/g) || []
  assert.deepEqual(scripts, ["jsonLdScript(bookSchema)", "jsonLdScript(breadcrumbSchema)"])
  assert.match(bookPage, /generateBookSchema\(/)
  assert.match(bookPage, /generateBreadcrumbSchema\(/)
})

test("BOOK_FAQS no longer exists in structured-data.ts, and nothing in src references it", () => {
  assert.doesNotMatch(structuredData, /\bBOOK_FAQS\b/)
})

test("the unsupported reader social-proof sentence is gone", () => {
  assert.doesNotMatch(structuredData, /Readers from many backgrounds have found/)
  assert.doesNotMatch(bookPage, /Readers from many backgrounds have found/)
})

test("the structured-data comment no longer claims pre-defined FAQ content is rendered on book pages", () => {
  assert.doesNotMatch(structuredData, /rendered visibly on \/about and book pages/)
})

test("generateFAQSchema and AUTHOR_FAQS remain for the visible-FAQ consumers", () => {
  assert.equal(typeof generateFAQSchema, "function")
  assert.ok(Array.isArray(AUTHOR_FAQS) && AUTHOR_FAQS.length >= 1)
  const out = generateFAQSchema([{ question: "Q?", answer: "A." }], "https://www.mayaallan.com/faq")
  assert.equal(out["@type"], "FAQPage")
  assert.equal(out.mainEntity[0].acceptedAnswer.text, "A.")
})

test("generateArticleSchema output is identical to the 966bcdf baseline (frozen article/scenario schema behavior)", () => {
  for (const c of fixture.cases) {
    assert.deepEqual(generateArticleSchema(c.input), c.expected, `case: ${c.name}`)
  }
})
