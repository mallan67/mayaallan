import assert from "node:assert/strict"
import { test } from "node:test"
import { access, readFile } from "node:fs/promises"
import { VISIBILITY_CAPABILITIES } from "../../src/lib/visibility/capabilities.ts"

test("all thirteen visibility capabilities are explicitly represented", () => {
  assert.equal(VISIBILITY_CAPABILITIES.length, 13)
  assert.deepEqual(
    VISIBILITY_CAPABILITIES.map((item) => item.id),
    Array.from({ length: 13 }, (_, index) => index + 1)
  )
})

test("every visibility capability points only to files that exist", async () => {
  for (const capability of VISIBILITY_CAPABILITIES) {
    assert.ok(capability.evidence.length > 0, capability.name + " has no evidence files")
    for (const file of capability.evidence) {
      await access(file)
    }
  }
})

test("AEO prompt rows persist reader intent for both success and error paths", async () => {
  const runner = await readFile("src/lib/aeo/runner.ts", "utf8")
  const matches = runner.match(/prompt_intent:\s*prompt\.intent/g) ?? []
  assert.equal(matches.length, 2)
})

test("Search Console activation remains explicit and read-only", async () => {
  const client = await readFile("src/lib/search-console/client.ts", "utf8")
  assert.match(client, /webmasters\.readonly/)
  assert.doesNotMatch(client, /webmasters(?!\.readonly)/)
})

test("crawler telemetry does not record IP addresses or query strings", async () => {
  const telemetry = await readFile("src/lib/crawler-telemetry.ts", "utf8")
  assert.doesNotMatch(telemetry, /x-forwarded-for|client-ip|request\.ip|headers\(\).*ip/i)
  assert.match(telemetry, /split\("\?"\)\[0\]/)
})
