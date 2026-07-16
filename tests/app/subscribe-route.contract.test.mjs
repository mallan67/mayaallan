import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const src = readFileSync(
  fileURLToPath(new URL("../../src/app/api/subscribe/route.ts", import.meta.url)),
  "utf8",
)

test("route awaits the Resend newsletter sync", () => {
  assert.match(src, /const\s+sync\s*=\s*await\s+syncSubscriberToResend\(\s*email\s*\)/)
})

test("sync sits in its OWN try/catch and the success response follows that catch (nonfatal)", () => {
  const call = src.indexOf("const sync = await syncSubscriberToResend(email)")
  assert.ok(call > -1, "sync call present")
  const tryIdx = src.lastIndexOf("try {", call)
  const catchIdx = src.indexOf("catch (syncErr)", call)
  const successIdx = src.indexOf("success: true", catchIdx)
  assert.ok(tryIdx > -1 && tryIdx < call, "dedicated try begins before the sync call")
  assert.ok(catchIdx > call, "dedicated catch (syncErr) follows the sync call")
  assert.ok(successIdx > catchIdx, "success response follows the sync catch")
})

test("the sync-throw catch routes to the deduplicated sync-failure alert (not only console.error)", () => {
  const catchIdx = src.indexOf("catch (syncErr)")
  const successIdx = src.indexOf("success: true", catchIdx)
  const region = src.slice(catchIdx, successIdx)
  assert.match(region, /alertAdmin\(/)
  assert.match(region, /resend:newsletter-sync-failed/)
})

test("Supabase upsert keeps onConflict email + ignoreDuplicates (preserves unsubscribed_at)", () => {
  assert.match(src, /onConflict:\s*"email"/)
  assert.match(src, /ignoreDuplicates:\s*true/)
})

test("subscriber-facing welcome email is removed", () => {
  assert.doesNotMatch(src, /Welcome to the Newsletter!/)
})

test("operator new-subscriber notification remains", () => {
  assert.match(src, /New Newsletter Subscriber/)
})
