import assert from "node:assert/strict"
import { test } from "node:test"
import { readFile } from "node:fs/promises"
import { buildSearchOpportunities, rowsToQueryPageMetrics } from "../../src/lib/search-console/opportunities.ts"
import { aggregateExternalDomains, aggregateExternalSources } from "../../src/lib/aeo/aggregate.ts"

test("Search Console rows become query/page metrics without inventing data", () => {
  const rows = rowsToQueryPageMetrics([
    { keys: ["ego dissolution", "https://www.mayaallan.com/scenarios/ego-dissolution"], clicks: 4, impressions: 120, ctr: 4 / 120, position: 11.2 },
    { keys: ["missing-page-only"], clicks: 1, impressions: 10, ctr: 0.1, position: 4 },
  ])
  assert.equal(rows.length, 1)
  assert.equal(rows[0].query, "ego dissolution")
  assert.equal(rows[0].impressions, 120)
})

test("opportunity engine flags near wins and material losses but skips tiny rows", () => {
  const current = [
    { query: "ego dissolution", page: "https://www.mayaallan.com/scenarios/ego-dissolution", clicks: 4, impressions: 120, ctr: 0.033, position: 11.2 },
    { query: "maya allan", page: "https://www.mayaallan.com/about", clicks: 2, impressions: 40, ctr: 0.05, position: 6 },
    { query: "tiny", page: "https://www.mayaallan.com/x", clicks: 0, impressions: 3, ctr: 0, position: 12 },
  ]
  const previous = [
    { query: "ego dissolution", page: "https://www.mayaallan.com/scenarios/ego-dissolution", clicks: 7, impressions: 110, ctr: 0.064, position: 7.5 },
    { query: "maya allan", page: "https://www.mayaallan.com/about", clicks: 1, impressions: 30, ctr: 0.033, position: 8 },
  ]

  const out = buildSearchOpportunities(current, previous)
  assert.ok(out.some((item) => item.query === "ego dissolution" && item.kind === "near-win"))
  assert.ok(out.some((item) => item.query === "ego dissolution" && item.kind === "losing-ground"))
  assert.ok(!out.some((item) => item.query === "tiny"))
})

test("citation-gap aggregation keeps grounded sources separate from memory", () => {
  const rows = [
    {
      engine: "chatgpt",
      prompt: "q",
      prompt_id: "q",
      prompt_category: "x",
      error: null,
      classifier_version: 2,
      search_capable: true,
      search_mode: "grounded-search",
      external_sources: ["https://example.org/a"],
      external_source_domains: ["example.org"],
    },
    {
      engine: "claude",
      prompt: "q",
      prompt_id: "q",
      prompt_category: "x",
      error: null,
      classifier_version: 2,
      search_capable: false,
      search_mode: "model-memory",
      external_sources: ["https://example.org/a"],
      external_source_domains: ["example.org"],
    },
  ]
  assert.deepEqual(aggregateExternalDomains(rows), [{ value: "example.org", grounded: 1, memory: 1 }])
  assert.deepEqual(aggregateExternalSources(rows), [{ value: "https://example.org/a", grounded: 1, memory: 1 }])
})

test("visibility engine wiring preserves grounded-vs-memory truth", async () => {
  const engines = await readFile("src/lib/aeo/engines.ts", "utf8")
  const runner = await readFile("src/lib/aeo/runner.ts", "utf8")
  const env = await readFile(".env.example", "utf8")
  const vercel = await readFile("vercel.json", "utf8")

  assert.match(engines, /type SearchMode = "grounded-search" \| "model-memory"/)
  assert.match(engines, /web_search_20250305/)
  assert.match(engines, /type: "web_search"/)
  assert.match(engines, /google_search/)
  assert.match(runner, /external_source_domains/)
  assert.match(env, /GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL=/)
  assert.match(vercel, /\/api\/cron\/search-console-sync/)
})


test("grounded label requires provider search evidence, not merely a search-capable API", async () => {
  const engines = await readFile("src/lib/aeo/engines.ts", "utf8")
  assert.match(engines, /function groundedPrompt\(/)
  assert.match(engines, /function hasSearchEvidence\(/)
  assert.match(engines, /searchMode: searched \? "grounded-search" : "model-memory"/)
  assert.match(engines, /Search the live web before answering this question/)
})
