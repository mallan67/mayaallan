import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const src = readFileSync(
  fileURLToPath(new URL("../../src/app/api/subscribe/route.ts", import.meta.url)),
  "utf8",
)

// Whitespace-insensitive view for structural assertions.
const flat = src.replace(/\s+/g, " ")
// The two post-response registrations, in source order.
const wrapperStarts = [...flat.matchAll(/runAfterResponse\( ?after,/g)].map((m) => m.index)
const smtpBlock = flat.slice(wrapperStarts[0] ?? 0, wrapperStarts[1] ?? flat.length)
const syncBlock = flat.slice(wrapperStarts[1] ?? flat.length, flat.indexOf("success: true", wrapperStarts[1] ?? 0))

test("the Resend sync is awaited ONLY inside post-response work, never in the request path", () => {
  // Every call site is `await`ed (no dangling promise) …
  const calls = [...src.matchAll(/syncSubscriberToResend\(/g)].filter((m) => !/import/.test(src.slice(Math.max(0, m.index - 60), m.index)))
  assert.ok(calls.length >= 1, "a sync call exists")
  for (const m of calls) assert.match(src.slice(m.index - 6, m.index), /await $/, "sync call is awaited")
  // … and the awaiting arrow is the work handed to runAfterResponse(after, …).
  assert.match(flat, /runAfterResponse\( ?after, ?async \(\) => \{ const sync = await syncSubscriberToResend\(email\)/)
  // Nothing between the last registration and the success response awaits it.
  const lastWrapper = wrapperStarts[wrapperStarts.length - 1]
  const tail = flat.slice(lastWrapper, flat.indexOf("success: true", lastWrapper))
  assert.equal((tail.match(/runAfterResponse\(/g) || []).length, 1, "sync wrapper is the last registration")
  // The single awaited call lives inside the second registration's block —
  // i.e. after the wrapper starts, never in the handler body before it.
  const syncCalls = [...flat.matchAll(/const sync = await syncSubscriberToResend\(email\)/g)].map((m) => m.index)
  assert.equal(syncCalls.length, 1, "exactly one awaited sync call")
  assert.ok(syncCalls[0] > wrapperStarts[1], "the awaited sync call is inside the post-response registration, not before it")
})

test("sync outcomes are preserved inside the work function; the throw path is the wrapper's onError", () => {
  assert.match(syncBlock, /sync\.status === "error"/)
  assert.match(syncBlock, /sync\.status === "noop-no-segment-id"/)
  assert.match(syncBlock, /noop-no-api-key/)
  assert.match(syncBlock, /resend:newsletter-no-segment-id/)
  assert.equal((syncBlock.match(/resend:newsletter-sync-failed/g) || []).length, 2, "returned-error alert AND thrown-exception alert keep the same dedup key")
  assert.match(syncBlock, /status: "threw"/)
  assert.match(syncBlock, /resend newsletter sync threw/)
})

test("Supabase upsert is awaited BEFORE any post-response work is registered, and success follows both", () => {
  const upsert = flat.indexOf("await supabaseAdmin .from(Tables.emailSubscribers) .upsert(")
  assert.ok(upsert > -1, "awaited upsert present")
  assert.equal(wrapperStarts.length, 2, "exactly two post-response registrations (SMTP notification, Resend sync)")
  assert.ok(upsert < wrapperStarts[0], "upsert precedes the first registration")
  const success = flat.indexOf("success: true", wrapperStarts[1])
  assert.ok(success > wrapperStarts[1], "success response follows the last registration")
})

test("SMTP notification and Resend sync are registered as SEPARATE tasks (neither nested in the other)", () => {
  assert.match(smtpBlock, /transporter\.sendMail\(/)
  assert.doesNotMatch(smtpBlock, /syncSubscriberToResend\(/)
  assert.match(syncBlock, /syncSubscriberToResend\(/)
  assert.doesNotMatch(syncBlock, /transporter\.sendMail\(/)
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

test("the operator notification send is the work handed to runAfterResponse(after, ...)", () => {
  assert.match(flat, /runAfterResponse\( ?after, ?\(\) => transporter\.sendMail\(/)
})

test("no fire-and-forget: every sendMail is an arrow body inside the wrapper, never a statement", () => {
  const sends = [...flat.matchAll(/transporter\.sendMail\(/g)]
  assert.equal(sends.length, 1, "exactly one send")
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

test("no bare fire-and-forget anywhere: every promise-returning call is awaited or is an arrow body handed to the wrapper", () => {
  const calls = [...flat.matchAll(/(transporter\.sendMail|syncSubscriberToResend|alertAdmin)\(/g)]
    .filter((m) => !/import /.test(flat.slice(Math.max(0, m.index - 40), m.index)))
  assert.ok(calls.length >= 5, "the send, the sync and the alert calls are all present")
  for (const m of calls) {
    const before = flat.slice(Math.max(0, m.index - 8), m.index)
    assert.match(before, /(await |=> )$/, `not fire-and-forget: …${before}${m[0]}`)
  }
  assert.doesNotMatch(src, /\)\s*\.catch\(/, "failure routing goes through runAfterResponse onError, not a detached .catch()")
  assert.doesNotMatch(src, /void\s+(transporter|syncSubscriberToResend|alertAdmin)/)
})
