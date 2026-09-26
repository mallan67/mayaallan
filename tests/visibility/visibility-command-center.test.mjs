import assert from "node:assert/strict"
import { test } from "node:test"
import { buildSearchOpportunities } from "../../src/lib/search-console/opportunities.ts"
import { aggregateExternalSources } from "../../src/lib/aeo/source-gaps.ts"
import { detectCrawler } from "../../src/lib/crawler-telemetry.ts"
import { VISIBILITY_GRAPH, suggestRelatedNodes } from "../../src/lib/visibility/topic-graph.ts"
import { EVIDENCE_REGISTRY } from "../../src/lib/visibility/evidence-registry.ts"

test("Search Console opportunity engine finds striking-distance and low-CTR queries", () => {
  const current = [
    { keys: ["integration after psilocybin", "https://www.mayaallan.com/blog/psilocybin-integration-research"], clicks: 1, impressions: 100, ctr: 0.01, position: 8 },
    { keys: ["maya allan", "https://www.mayaallan.com/"], clicks: 40, impressions: 100, ctr: 0.4, position: 1.2 },
  ]
  const previous = [
    { keys: ["integration after psilocybin", "https://www.mayaallan.com/blog/psilocybin-integration-research"], clicks: 2, impressions: 90, ctr: 0.022, position: 9 },
  ]

  const rows = buildSearchOpportunities(current, previous)
  assert.ok(rows.some((row) => row.query === "integration after psilocybin" && row.kind === "striking_distance"))
  assert.ok(rows.some((row) => row.query === "integration after psilocybin" && row.kind === "low_ctr"))
  assert.ok(!rows.some((row) => row.query === "maya allan"))
})

test("citation-gap aggregation excludes Maya domains and counts outside source hosts", () => {
  const rows = [
    {
      engine: "chatgpt",
      prompt_id: "p1",
      prompt_text: "x",
      prompt_category: "test",
      was_cited: true,
      source_citation: true,
      classifier_version: 2,
      search_capable: true,
      source_urls: [
        "https://www.mayaallan.com/integration-reflection",
        "https://example.org/article-a",
        "https://example.org/article-b",
        "https://another.org/page",
      ],
    },
  ]

  const out = aggregateExternalSources(rows)
  assert.equal(out.find((row) => row.host === "example.org")?.urls, 2)
  assert.equal(out.find((row) => row.host === "another.org")?.urls, 1)
  assert.equal(out.some((row) => row.host.includes("mayaallan.com")), false)
})

test("crawler detection recognizes search and AI crawlers", () => {
  assert.equal(detectCrawler("Mozilla/5.0 compatible; Googlebot/2.1"), "googlebot")
  assert.equal(detectCrawler("OAI-SearchBot/1.0"), "oai-searchbot")
  assert.equal(detectCrawler("ClaudeBot/1.0"), "claudebot")
  assert.equal(detectCrawler("PerplexityBot/1.0"), "perplexitybot")
  assert.equal(detectCrawler("Mozilla/5.0 Safari/537.36"), null)
})

test("visibility graph has unique nodes and valid required-link targets", () => {
  const ids = VISIBILITY_GRAPH.map((node) => node.id)
  const paths = VISIBILITY_GRAPH.map((node) => node.path)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(new Set(paths).size, paths.length)

  const pathSet = new Set(paths)
  for (const node of VISIBILITY_GRAPH) {
    for (const link of node.requiredLinks) {
      assert.ok(pathSet.has(link), node.id + " links to unknown graph path " + link)
    }
  }
})

test("topic graph can suggest related pages without repeating required links", () => {
  const node = VISIBILITY_GRAPH.find((item) => item.id === "integration-reflection")
  assert.ok(node)
  const suggestions = suggestRelatedNodes("integration-reflection", 5)
  for (const suggestion of suggestions) {
    assert.ok(!node.requiredLinks.includes(suggestion.path))
  }
})

test("evidence registry records boundaries and canonical discussions", () => {
  assert.ok(EVIDENCE_REGISTRY.length >= 4)
  for (const record of EVIDENCE_REGISTRY) {
    assert.match(record.sourceUrl, /^https:\/\//)
    assert.ok(record.boundary.length >= 40)
    assert.match(record.canonicalDiscussion, /^\//)
    assert.ok(record.appliesTo.length > 0)
  }
})
