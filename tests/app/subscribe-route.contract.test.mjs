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
// The post-response registrations, in source order: marketing tracking,
// SMTP notification, Resend sync. Each block runs from its wrapper start to
// the next wrapper start (or to the success response for the last one).
const wrapperStarts = [...flat.matchAll(/runAfterResponse\( ?after,/g)].map((m) => m.index)
const lastWrapperStart = wrapperStarts[wrapperStarts.length - 1] ?? 0
const successIdx = flat.indexOf("success: true", lastWrapperStart)
const blockAt = (i) => flat.slice(wrapperStarts[i] ?? flat.length, wrapperStarts[i + 1] ?? successIdx)
const trackBlock = blockAt(0)
const smtpBlock = blockAt(1)
const syncBlock = blockAt(2)

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
  assert.ok(syncCalls[0] > wrapperStarts[2], "the awaited sync call is inside the third (sync) registration, not before it")
})

test("no top-level await trackMarketingEvent after persistence: tracking is its OWN post-response task", () => {
  assert.doesNotMatch(src, /await\s+trackMarketingEvent\(/, "tracking is never awaited in the request path")
  assert.match(flat, /runAfterResponse\( ?after, ?\(\) => trackMarketingEvent\(\{ request, eventName: "newsletter_subscribed", path: "\/api\/subscribe"/)
  // Event name, path and properties unchanged.
  assert.match(trackBlock, /eventName: "newsletter_subscribed"/)
  assert.match(trackBlock, /path: "\/api\/subscribe"/)
  assert.match(trackBlock, /email_domain: emailDomainOnly\(email\)/)
  assert.match(trackBlock, /source: typeof \(body as any\)\?\.source === "string" \? String\(\(body as any\)\.source\)\.slice\(0, 64\) : null/)
  assert.match(trackBlock, /honeypot: false/)
  // Failure stays nonfatal and logged the same way.
  assert.match(trackBlock, /\[subscribe\] tracking failed:/)
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

test("Supabase upsert is awaited BEFORE all post-response registrations; nothing noncritical is awaited after it; success follows the last registration", () => {
  const upsert = flat.indexOf("await supabaseAdmin .from(Tables.emailSubscribers) .upsert(")
  assert.ok(upsert > -1, "awaited upsert present")
  assert.equal(wrapperStarts.length, 3, "exactly three post-response registrations (tracking, SMTP notification, Resend sync)")
  assert.ok(upsert < wrapperStarts[0], "upsert precedes the first registration")
  // Between the upsert's error check and the first registration there is no
  // other await (no noncritical work can stall the response).
  const afterUpsert = flat.slice(flat.indexOf("throw error }", upsert), wrapperStarts[0])
  assert.doesNotMatch(afterUpsert, /\bawait\b/, "no awaited work between persistence and the first registration")
  assert.ok(successIdx > lastWrapperStart, "success response follows the last registration")
  // Nothing is awaited between the last registration's end and the response either.
  const lastBlock = blockAt(wrapperStarts.length - 1)
  const closeOfLast = lastBlock.lastIndexOf(")")
  assert.doesNotMatch(lastBlock.slice(closeOfLast), /\bawait\b/)
})

test("marketing tracking, SMTP notification and Resend sync are THREE separate tasks (none nested in another)", () => {
  assert.match(trackBlock, /trackMarketingEvent\(/)
  assert.doesNotMatch(trackBlock, /transporter\.sendMail\(|syncSubscriberToResend\(/)
  assert.match(smtpBlock, /transporter\.sendMail\(/)
  assert.doesNotMatch(smtpBlock, /trackMarketingEvent\(|syncSubscriberToResend\(/)
  assert.match(syncBlock, /syncSubscriberToResend\(/)
  assert.doesNotMatch(syncBlock, /trackMarketingEvent\(|transporter\.sendMail\(/)
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
  const calls = [...flat.matchAll(/(transporter\.sendMail|syncSubscriberToResend|trackMarketingEvent|alertAdmin)\(/g)]
    .filter((m) => !/import /.test(flat.slice(Math.max(0, m.index - 40), m.index)))
  assert.ok(calls.length >= 6, "the send, the sync, the tracking and the alert calls are all present")
  for (const m of calls) {
    const before = flat.slice(Math.max(0, m.index - 8), m.index)
    assert.match(before, /(await |=> )$/, `not fire-and-forget: …${before}${m[0]}`)
  }
  assert.doesNotMatch(src, /\)\s*\.catch\(/, "failure routing goes through runAfterResponse onError, not a detached .catch()")
  assert.doesNotMatch(src, /void\s+(transporter|syncSubscriberToResend|alertAdmin)/)
})
