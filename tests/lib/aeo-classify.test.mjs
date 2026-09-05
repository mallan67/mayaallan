/**
 * Tests for src/lib/aeo/classify.ts — the response classifier behind the
 * AEO tracker (issue #44).
 *
 * The classifier must keep four things apart:
 *   brand_mention     — author name or book title appears in the text
 *   domain_reference  — the site's domain appears as plain text (not a URL)
 *   source_citation   — a URL under the site appears in the text or in the
 *                       engine's structured citations
 * (search-capability is a property of the engine, tested in aeo-aggregate.)
 *
 * Runs under Node >= 22.18 / 24 (type stripping). The module takes its
 * identity config as a parameter so this test needs no path aliases.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { classifyResponse } from "../../src/lib/aeo/classify.ts"

const cfg = {
  authorName: "Maya Allan",
  bookTitles: ["Psilocybin Integration Guide"],
  siteHost: "mayaallan.com",
  canonicalOrigin: "https://www.mayaallan.com",
}

test("author name alone is a brand mention, not a domain reference or citation", () => {
  const r = classifyResponse({ content: "Maya Allan wrote a book about integration.", structuredCitations: [] }, cfg)
  assert.equal(r.brand_mention, true)
  assert.equal(r.domain_reference, false)
  assert.equal(r.source_citation, false)
  assert.deepEqual(r.cited_urls, [])
  assert.ok(r.mention_types.includes("author_name"))
})

test("book title alone is a brand mention", () => {
  const r = classifyResponse({ content: "Try the Psilocybin Integration Guide.", structuredCitations: [] }, cfg)
  assert.equal(r.brand_mention, true)
  assert.equal(r.source_citation, false)
  assert.ok(r.mention_types.includes("book_title"))
})

test("bare domain text is a domain reference, not a source citation", () => {
  const r = classifyResponse({ content: "See mayaallan.com for more.", structuredCitations: [] }, cfg)
  assert.equal(r.domain_reference, true)
  assert.equal(r.source_citation, false)
  assert.equal(r.brand_mention, false)
  assert.ok(r.mention_types.includes("domain"))
})

test("a URL under the site in the text is a source citation and not double-counted as a domain reference", () => {
  const r = classifyResponse({ content: "Source: https://www.mayaallan.com/scenarios/ego-dissolution.", structuredCitations: [] }, cfg)
  assert.equal(r.source_citation, true)
  assert.equal(r.domain_reference, false)
  assert.deepEqual(r.cited_urls, ["https://www.mayaallan.com/scenarios/ego-dissolution"])
  assert.ok(r.mention_types.includes("page_url"))
})

test("a structured citation under the site counts even when the text never mentions the site", () => {
  const r = classifyResponse(
    { content: "Ego dissolution is a temporary loss of the sense of self.", structuredCitations: ["https://mayaallan.com/glossary"] },
    cfg
  )
  assert.equal(r.source_citation, true)
  assert.equal(r.brand_mention, false)
  assert.deepEqual(r.cited_urls, ["https://www.mayaallan.com/glossary"])
  assert.ok(r.mention_types.includes("structured_citation"))
})

test("URLs on other domains are ignored", () => {
  const r = classifyResponse(
    { content: "See https://maps.org/integration-station/ and https://example.com/mayaallan.com/x", structuredCitations: ["https://en.wikipedia.org/wiki/Ego_death"] },
    cfg
  )
  assert.equal(r.source_citation, false)
  assert.deepEqual(r.cited_urls, [])
})

test("author match is case-insensitive and respects word boundaries", () => {
  assert.equal(classifyResponse({ content: "by MAYA ALLAN.", structuredCitations: [] }, cfg).brand_mention, true)
  assert.equal(classifyResponse({ content: "the Mayan calendar; Allan Watts", structuredCitations: [] }, cfg).brand_mention, false)
})

test("empty content and no citations classify as nothing", () => {
  const r = classifyResponse({ content: "", structuredCitations: [] }, cfg)
  assert.deepEqual(
    { b: r.brand_mention, d: r.domain_reference, s: r.source_citation, urls: r.cited_urls, types: r.mention_types, excerpt: r.excerpt },
    { b: false, d: false, s: false, urls: [], types: [], excerpt: null }
  )
})

test("trailing punctuation is stripped from cited URLs and duplicates collapse", () => {
  const r = classifyResponse(
    { content: "(https://www.mayaallan.com/faq). Also https://www.mayaallan.com/faq", structuredCitations: ["https://www.mayaallan.com/faq"] },
    cfg
  )
  assert.deepEqual(r.cited_urls, ["https://www.mayaallan.com/faq"])
})

test("excerpt surrounds the first thing found, whichever kind it is", () => {
  const r = classifyResponse({ content: "x".repeat(300) + " Maya Allan " + "y".repeat(400), structuredCitations: [] }, cfg)
  assert.ok(r.excerpt && r.excerpt.includes("Maya Allan"))
  assert.ok(r.excerpt.length < 600)
})

test("the generic phrase 'psilocybin integration' is not a brand mention", () => {
  assert.equal(classifyResponse({ content: "Psilocybin integration is a growing field.", structuredCitations: [] }, cfg).brand_mention, false)
  assert.equal(classifyResponse({ content: "Good psychedelic integration takes time.", structuredCitations: [] }, cfg).brand_mention, false)
})

test("the distinctive book title is a brand mention", () => {
  assert.equal(classifyResponse({ content: "Maya Allan wrote Psilocybin Integration Guide.", structuredCitations: [] }, cfg).brand_mention, true)
  assert.equal(classifyResponse({ content: "Psilocybin Integration Guide by Maya Allan", structuredCitations: [] }, cfg).brand_mention, true)
  const titleOnly = classifyResponse({ content: "Read the Psilocybin Integration Guide.", structuredCitations: [] }, cfg)
  assert.equal(titleOnly.brand_mention, true)
  assert.ok(titleOnly.mention_types.includes("book_title"))
})

test("equivalent forms of a same-site URL collapse to one canonical cited URL", () => {
  const r = classifyResponse(
    {
      content: "See https://www.mayaallan.com/faq and https://mayaallan.com/faq/ and http://mayaallan.com/faq#duration",
      structuredCitations: ["https://MAYAALLAN.com/faq/"],
    },
    cfg
  )
  assert.deepEqual(r.cited_urls, ["https://www.mayaallan.com/faq"])
})

test("canonicalization keeps meaningful paths and the root distinct", () => {
  const r = classifyResponse(
    { content: "https://mayaallan.com/ and https://mayaallan.com/scenarios/ego-dissolution/ and https://mayaallan.com/blog/psilocybin-integration-research", structuredCitations: [] },
    cfg
  )
  assert.deepEqual(r.cited_urls, [
    "https://www.mayaallan.com/",
    "https://www.mayaallan.com/scenarios/ego-dissolution",
    "https://www.mayaallan.com/blog/psilocybin-integration-research",
  ])
})
