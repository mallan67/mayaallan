/**
 * Tests for src/lib/aeo/aggregate.ts — pure aggregation over stored probe
 * rows for the AEO dashboard (issue #44).
 *
 * Rules under test:
 *   - the three dimensions are counted separately, never summed into one "hit"
 *   - rows are grouped by whether the engine could search the web
 *   - rows written before the classifier split (no classifier_version) are
 *     reported as legacy and excluded from every rate
 *   - errored probes are excluded from totals
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { aggregateByEngine, aggregateBySearchCapability, aggregateByPrompt, aggregateByUrl } from "../../src/lib/aeo/aggregate.ts"

const v2 = (over) => ({
  engine: "chatgpt", prompt: "p", prompt_id: "p1", prompt_category: "c", error: null,
  classifier_version: 2, search_capable: false,
  brand_mention: false, domain_reference: false, source_citation: false,
  was_cited: false, mention_types: [], cited_urls: [], excerpt: null, response_chars: 10,
  ...over,
})
const legacy = (over) => ({
  engine: "claude", prompt: "p", prompt_id: "p1", prompt_category: "c", error: null,
  was_cited: true, mention_types: ["author_name"], cited_urls: [], excerpt: "…", response_chars: 10,
  ...over,
})

test("aggregateByEngine counts the three dimensions separately", () => {
  const rows = [
    v2({ engine: "perplexity", search_capable: true, brand_mention: true, source_citation: true, was_cited: true }),
    v2({ engine: "perplexity", search_capable: true, brand_mention: true }),
    v2({ engine: "perplexity", search_capable: true, domain_reference: true }),
    v2({ engine: "perplexity", search_capable: true }),
  ]
  const [p] = aggregateByEngine(rows)
  assert.equal(p.engine, "perplexity")
  assert.equal(p.search_capable, true)
  assert.equal(p.total, 4)
  assert.equal(p.brand_mentions, 2)
  assert.equal(p.domain_references, 1)
  assert.equal(p.source_citations, 1)
  assert.equal(p.legacy_probes, 0)
})

test("legacy rows are counted as legacy and excluded from totals and rates", () => {
  const rows = [legacy({}), legacy({}), v2({ engine: "claude", brand_mention: true })]
  const [c] = aggregateByEngine(rows)
  assert.equal(c.engine, "claude")
  assert.equal(c.total, 1)
  assert.equal(c.legacy_probes, 2)
  assert.equal(c.brand_mentions, 1)
  assert.equal(c.source_citations, 0)
})

test("errored probes are excluded from totals", () => {
  const rows = [v2({ error: "HTTP 500" }), v2({ source_citation: true, was_cited: true })]
  const [c] = aggregateByEngine(rows)
  assert.equal(c.total, 1)
  assert.equal(c.source_citations, 1)
})

test("aggregateBySearchCapability keeps search-capable and non-search engines apart", () => {
  const rows = [
    v2({ engine: "perplexity", search_capable: true, source_citation: true, was_cited: true }),
    v2({ engine: "perplexity", search_capable: true }),
    v2({ engine: "chatgpt", search_capable: false, brand_mention: true }),
    v2({ engine: "claude", search_capable: false }),
    legacy({}),
  ]
  const s = aggregateBySearchCapability(rows)
  assert.deepEqual(s.search_capable, { total: 2, brand_mentions: 0, domain_references: 0, source_citations: 1 })
  assert.deepEqual(s.non_search, { total: 2, brand_mentions: 1, domain_references: 0, source_citations: 0 })
  assert.equal(s.legacy_probes, 1)
})

test("aggregateByPrompt never combines search-capable and non-search rates", () => {
  const rows = [
    v2({ prompt_id: "a", prompt: "A", engine: "perplexity", search_capable: true, source_citation: true, was_cited: true }),
    v2({ prompt_id: "a", prompt: "A", engine: "claude", search_capable: false }),
    v2({ prompt_id: "a", prompt: "A", engine: "chatgpt", search_capable: false }),
    v2({ prompt_id: "a", prompt: "A", engine: "gemini", search_capable: false }),
  ]
  const [a] = aggregateByPrompt(rows)
  assert.equal(a.prompt_id, "a")
  assert.deepEqual(a.search, { total: 1, brand_mentions: 0, domain_references: 0, source_citations: 1, rate: 100 })
  assert.deepEqual(a.non_search, { total: 3, brand_mentions: 0, domain_references: 0, source_citations: 0, rate: 0 })
  assert.equal("rate" in a, false, "no combined rate field may exist")
  assert.equal("total" in a, false, "no combined total field may exist")
})

test("aggregateByPrompt ranks by the search-capable citation rate, then non-search, and keeps brand mentions separate", () => {
  const rows = [
    v2({ prompt_id: "a", prompt: "A", engine: "claude", search_capable: false, brand_mention: true }),
    v2({ prompt_id: "a", prompt: "A", engine: "chatgpt", search_capable: false, brand_mention: true }),
    v2({ prompt_id: "b", prompt: "B", engine: "perplexity", search_capable: true, source_citation: true, was_cited: true }),
    v2({ prompt_id: "b", prompt: "B", engine: "claude", search_capable: false }),
    legacy({ prompt_id: "b", prompt: "B" }),
  ]
  const ranked = aggregateByPrompt(rows)
  assert.equal(ranked[0].prompt_id, "b")
  assert.equal(ranked[0].search.rate, 100)
  assert.equal(ranked[0].non_search.source_citations, 0)
  assert.equal(ranked[0].legacy_probes, 1)
  assert.equal(ranked[1].prompt_id, "a")
  assert.equal(ranked[1].search.total, 0)
  assert.equal(ranked[1].non_search.brand_mentions, 2)
  assert.equal(ranked[1].non_search.source_citations, 0)
})

test("aggregateByUrl labels counts by capability and keeps legacy separate", () => {
  const u = "https://www.mayaallan.com/faq"
  const rows = [
    v2({ engine: "perplexity", search_capable: true, source_citation: true, was_cited: true, cited_urls: [u] }),
    v2({ engine: "perplexity", search_capable: true, source_citation: true, was_cited: true, cited_urls: [u] }),
    v2({ engine: "claude", search_capable: false, source_citation: true, was_cited: true, cited_urls: [u] }),
    legacy({ cited_urls: [u] }),
    v2({ engine: "perplexity", search_capable: true, source_citation: true, was_cited: true, cited_urls: ["https://www.mayaallan.com/glossary"] }),
  ]
  const byUrl = aggregateByUrl(rows)
  assert.deepEqual(byUrl[0], { url: u, search: 2, non_search: 1, legacy: 1 })
  assert.deepEqual(byUrl[1], { url: "https://www.mayaallan.com/glossary", search: 1, non_search: 0, legacy: 0 })
})
