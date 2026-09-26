import assert from "node:assert/strict"
import { test } from "node:test"
import { readFile } from "node:fs/promises"

async function source(path) {
  return readFile(path, "utf8")
}

const TOOL_PAGES = [
  ["src/app/belief-inquiry/page.tsx", "Belief Inquiry"],
  ["src/app/nervous-system-reset/page.tsx", "Nervous System Reset"],
  ["src/app/integration-reflection/page.tsx", "Integration Reflection"],
]

test("interactive tools expose crawlable explanatory content and application schema", async () => {
  for (const [path, label] of TOOL_PAGES) {
    const page = await source(path)
    assert.match(page, /generateSoftwareApplicationSchema\(/, `${label}: missing SoftwareApplication schema`)
    assert.match(page, /generateBreadcrumbSchema\(/, `${label}: missing breadcrumb schema`)
    assert.match(page, /jsonLdScript\(softwareSchema\)/, `${label}: application schema is not emitted`)
    assert.match(page, /jsonLdScript\(breadcrumbSchema\)/, `${label}: breadcrumb schema is not emitted`)
    assert.match(page, /<h2[^>]*>What /, `${label}: missing crawlable explanatory H2`)
    assert.match(page, /Methods &amp; Attributions|Methods &/, `${label}: missing method attribution link/copy`)
  }
})

test("about page is a ProfilePage with Maya Allan as its main Person entity", async () => {
  const page = await source("src/app/about/page.tsx")
  const structured = await source("src/lib/structured-data.ts")
  assert.match(page, /generateProfilePageSchema\(/)
  assert.match(page, /jsonLdScript\(profileSchema\)/)
  assert.match(structured, /"@type": "ProfilePage"/)
  assert.match(structured, /mainEntity/)
})

test("homepage author schema uses the canonical author bio", async () => {
  const page = await source("src/app/page.tsx")
  assert.match(page, /generateAuthorSchema\(SITE_URL, AUTHOR_BIO\)/)
  assert.doesNotMatch(page, /writer dedicated to helping readers navigate life's most profound experiences/)
})

test("crawler guidance does not claim Google-Extended or llms.txt improve Search ranking", async () => {
  const robots = await source("src/app/robots.ts")
  const llms = await source("src/app/llms.txt/route.ts")
  const llmsFull = await source("src/app/llms-full.txt/route.ts")

  assert.match(robots, /does NOT affect inclusion or ranking in Search/)
  assert.doesNotMatch(robots, /Google can index but can't\s*\/\/\s*cite you/)
  assert.match(llms, /has no positive or negative ranking effect/)
  assert.match(llmsFull, /does not improve or reduce Google visibility or rankings/)
  assert.doesNotMatch(llmsFull, /preferentially ingest/)
})

test("sitemap keeps the three interactive tools on canonical descriptive slugs", async () => {
  const sitemap = await source("src/app/sitemap.ts")
  assert.match(sitemap, /\/belief-inquiry/)
  assert.match(sitemap, /\/nervous-system-reset/)
  assert.match(sitemap, /\/integration-reflection/)
  assert.doesNotMatch(sitemap, /\`\$\{baseUrl\}\/reset\`/)
  assert.doesNotMatch(sitemap, /\`\$\{baseUrl\}\/integration\`/)
})
