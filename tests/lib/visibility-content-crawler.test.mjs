import assert from "node:assert/strict"
import { test } from "node:test"
import { readFile } from "node:fs/promises"
import { identifyCrawler } from "../../src/lib/crawler-identify.ts"
import { loadTopicGraph, internalLinkRecommendations } from "../../src/lib/visibility/topic-graph.ts"
import { loadEvidenceRegistry, evidenceCoverageByPage } from "../../src/lib/visibility/evidence.ts"
import { loadPrompts } from "../../src/lib/aeo/prompts.ts"

test("crawler classifier distinguishes search, training, user-action and major search bots", () => {
  assert.deepEqual(identifyCrawler("compatible; OAI-SearchBot/1.4"), { name: "OAI-SearchBot", kind: "openai-search" })
  assert.deepEqual(identifyCrawler("compatible; GPTBot/1.4"), { name: "GPTBot", kind: "openai-training" })
  assert.deepEqual(identifyCrawler("compatible; ChatGPT-User/1.0"), { name: "ChatGPT-User", kind: "openai-user" })
  assert.deepEqual(identifyCrawler("Mozilla/5.0 Googlebot/2.1"), { name: "Googlebot", kind: "google" })
  assert.equal(identifyCrawler("Mozilla/5.0 normal browser"), null)
})

test("topic graph has unique nodes, valid edges, and produces non-duplicate link recommendations", async () => {
  const graph = await loadTopicGraph()
  const ids = graph.nodes.map((node) => node.id)
  assert.equal(new Set(ids).size, ids.length, "topic node ids unique")
  const idSet = new Set(ids)
  for (const edge of graph.edges) {
    assert.ok(idSet.has(edge.from), `missing graph source ${edge.from}`)
    assert.ok(idSet.has(edge.to), `missing graph target ${edge.to}`)
  }

  const recommendations = await internalLinkRecommendations()
  const keys = recommendations.map((item) => `${item.from.id}->${item.to.id}`)
  assert.equal(new Set(keys).size, keys.length, "internal-link recommendations unique")
  assert.ok(recommendations.every((item) => item.sharedTopics.length > 0))
})

test("evidence registry requires sources, limitations and page ownership for every claim", async () => {
  const claims = await loadEvidenceRegistry()
  assert.ok(claims.length >= 5)
  for (const claim of claims) {
    assert.ok(claim.id)
    assert.ok(claim.claim)
    assert.ok(claim.evidenceClass)
    assert.ok(claim.limitations.length > 20)
    assert.ok(claim.sources.length > 0)
    assert.ok(claim.usedBy.length > 0)
    for (const source of claim.sources) assert.match(source.url, /^https:\/\//)
  }
  const coverage = await evidenceCoverageByPage()
  assert.ok(coverage.some((item) => item.page === "/blog/psilocybin-integration-research"))
})

test("AEO prompt matrix uses stable intent/topic metadata and targeted prompts where applicable", async () => {
  const prompts = await loadPrompts()
  assert.ok(prompts.length >= 35)
  const ids = prompts.map((prompt) => prompt.id)
  assert.equal(new Set(ids).size, ids.length, "prompt ids unique")
  assert.ok(prompts.every((prompt) => typeof prompt.intent === "string" && prompt.intent.length > 0))
  assert.ok(prompts.every((prompt) => typeof prompt.topic === "string" && prompt.topic.length > 0))
  assert.ok(prompts.some((prompt) => prompt.target_path === "/belief-inquiry"))
  assert.ok(prompts.some((prompt) => prompt.target_path === "/scenarios/ego-dissolution"))
})

test("Next 16 proxy replaces deprecated middleware and crawler telemetry remains fire-and-forget", async () => {
  const proxy = await readFile("proxy.ts", "utf8")
  const env = await readFile(".env.example", "utf8")
  assert.match(proxy, /export function proxy\(/)
  assert.match(proxy, /event\.waitUntil\(/)
  assert.match(proxy, /identifyCrawler\(/)
  assert.match(proxy, /pathname\.startsWith\("\/admin"\)/)
  assert.match(env, /CRAWLER_TELEMETRY_SECRET=/)
})
