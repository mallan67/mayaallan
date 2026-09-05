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

test("no unsafe `as any` cast on the sync result (uses a proper type guard)", () => {
  assert.doesNotMatch(src, /sync as any/)
})

// --- Post-response email completion (fix/site-runtime-correctness-2026-09-05) ---

test("imports after() from next/server and the runAfterResponse wrapper", () => {
  assert.match(src, /import\s*\{[^}]*\bafter\b[^}]*\}\s*from\s*"next\/server"/)
  assert.match(src, /import\s*\{\s*runAfterResponse\s*\}\s*from\s*"@\/lib\/after-response"/)
})

// Whitespace-insensitive view for structural assertions.
const flat = src.replace(/\s+/g, " ")

test("the operator notification send is the work handed to runAfterResponse(after, ...)", () => {
  assert.match(flat, /runAfterResponse\( ?after, ?\(\) => transporter\.sendMail\(/)
})

test("no fire-and-forget: every sendMail is an arrow body inside the wrapper, never a statement", () => {
  const sends = [...flat.matchAll(/transporter\.sendMail\(/g)]
  const wrappers = [...flat.matchAll(/runAfterResponse\( ?after,/g)]
  assert.ok(sends.length >= 1, "a send exists")
  assert.equal(sends.length, wrappers.length, "one wrapper per send")
  for (const m of sends) {
    const before = flat.slice(Math.max(0, m.index - 12), m.index)
    assert.match(before, /=> $/, `sendMail is an arrow-function body, not a statement: …${before}`)
  }
  assert.doesNotMatch(src, /don't await/i)
})

test("notification failure logging and the deduplicated admin alert are preserved", () => {
  assert.match(src, /safeLogError\("subscribe\.notify-smtp-failed"/)
  assert.match(src, /dedupKey:\s*"smtp:subscribe-notification-failed"/)
})

test("Resend sync remains awaited in-request (not moved into after())", () => {
  const syncIdx = src.indexOf("const sync = await syncSubscriberToResend(email)")
  const wrapperIdx = src.indexOf("runAfterResponse(")
  assert.ok(syncIdx > -1 && wrapperIdx > -1)
  assert.ok(wrapperIdx < syncIdx, "the notification wrapper is registered before the sync begins")
  const successIdx = src.indexOf("success: true", syncIdx)
  assert.equal(src.slice(syncIdx, successIdx).includes("runAfterResponse("), false, "the sync itself is not deferred")
})
