import assert from "node:assert/strict"
import { test } from "node:test"
import {
  compareDiagnosticRuns,
  diagnoseCitationRow,
  summarizeDiagnostics,
} from "../../src/lib/aeo/citation-diagnostics.ts"

const bookSpec = {
  id: "book",
  family: "scenario-book-discovery",
  goal: "book-discovery",
  expected_paths: ["/books/psilocybin-integration-guide"],
}

test("diagnostic identifies grounded retrieval failure from exposed source telemetry", () => {
  const d = diagnoseCitationRow({
    engine: "gemini",
    prompt_id: "book",
    error: null,
    search_capable: true,
    search_queries: ["books for psychedelic integration"],
    source_urls: ["https://example.org/guide"],
    cited_urls: [],
    mention_types: [],
  }, bookSpec)
  assert.equal(d.stage, "not-retrieved")
  assert.equal(d.score, 1)
  assert.equal(d.externalSourceUrls.length, 1)
})

test("diagnostic separates retrieval from citation", () => {
  const d = diagnoseCitationRow({
    engine: "chatgpt",
    prompt_id: "book",
    error: null,
    search_capable: true,
    source_urls: ["https://www.mayaallan.com/books/psilocybin-integration-guide"],
    cited_urls: [],
    mention_types: [],
  }, bookSpec)
  assert.equal(d.stage, "retrieved-not-cited")
  assert.equal(d.score, 2)
})

test("diagnostic detects a Maya citation that fails book linkage", () => {
  const url = "https://www.mayaallan.com/books/psilocybin-integration-guide"
  const d = diagnoseCitationRow({
    engine: "perplexity",
    prompt_id: "book",
    error: null,
    search_capable: true,
    source_urls: [url],
    cited_urls: [url],
    source_citation: true,
    mention_types: ["structured_citation"],
  }, bookSpec)
  assert.equal(d.stage, "cited-no-book")
  assert.equal(d.score, 4)
  assert.equal(d.expectedPageHit, true)
})

test("diagnostic records full citation success only when the observable goal is met", () => {
  const url = "https://www.mayaallan.com/books/psilocybin-integration-guide"
  const d = diagnoseCitationRow({
    engine: "perplexity",
    prompt_id: "book",
    error: null,
    search_capable: true,
    source_urls: [url],
    cited_urls: [url],
    source_citation: true,
    mention_types: ["structured_citation", "book_title", "author_name"],
  }, bookSpec)
  assert.equal(d.stage, "citation-success")
  assert.equal(d.score, 5)
})

test("diagnostic refuses to call hidden retrieval a failure without provider telemetry", () => {
  const d = diagnoseCitationRow({
    engine: "claude",
    prompt_id: "book",
    error: null,
    search_capable: true,
    source_urls: [],
    cited_urls: [],
    search_queries: [],
    mention_types: [],
  }, bookSpec)
  assert.equal(d.stage, "search-unobserved")
  assert.match(d.limitation ?? "", /exposed no usable source\/query evidence/i)
})

test("run comparison learns whether a prompt-engine pair improved", () => {
  const previous = [{
    engine: "gemini",
    prompt_id: "book",
    error: null,
    search_capable: true,
    search_queries: ["integration books"],
    source_urls: ["https://example.org"],
    cited_urls: [],
    mention_types: [],
  }]
  const current = [{
    engine: "gemini",
    prompt_id: "book",
    error: null,
    search_capable: true,
    source_urls: ["https://www.mayaallan.com/books/psilocybin-integration-guide"],
    cited_urls: ["https://www.mayaallan.com/books/psilocybin-integration-guide"],
    source_citation: true,
    mention_types: ["book_title"],
  }]
  const specs = new Map([["book", bookSpec]])
  const [delta] = compareDiagnosticRuns(current, previous, specs)
  assert.equal(delta.movement, "improved")
  assert.equal(delta.delta, 4)

  const summary = summarizeDiagnostics([delta.current])
  assert.equal(summary.success, 1)
  assert.equal(summary.retrieved, 1)
  assert.equal(summary.cited, 1)
})
