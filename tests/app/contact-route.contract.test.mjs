/**
 * Source-level contract for src/app/api/contact/route.ts.
 *
 * The operator notification email must be registered with the platform
 * post-response mechanism (`after()` from next/server, via runAfterResponse)
 * — never a bare `transporter.sendMail(...)` whose promise is abandoned when
 * the HTTP response returns. Failure logging + admin alert must survive.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const src = readFileSync(
  fileURLToPath(new URL("../../src/app/api/contact/route.ts", import.meta.url)),
  "utf8",
)
// Whitespace-insensitive view for structural assertions.
const flat = src.replace(/\s+/g, " ")

test("imports after() from next/server and the runAfterResponse wrapper", () => {
  assert.match(src, /import\s*\{[^}]*\bafter\b[^}]*\}\s*from\s*"next\/server"/)
  assert.match(src, /import\s*\{\s*runAfterResponse\s*\}\s*from\s*"@\/lib\/after-response"/)
})

test("the notification send is the work handed to runAfterResponse(after, ...)", () => {
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

test("failure logging and the deduplicated admin alert are preserved", () => {
  assert.match(src, /safeLogError\("contact\.smtp-send-failed"/)
  assert.match(src, /dedupKey:\s*"smtp:contact-notification-failed"/)
  assert.match(src, /SMTP send failed: contact form notification/)
})

test("the database insert is still awaited before the response (DB remains source of truth)", () => {
  assert.match(src, /const\s*\{\s*error\s*\}\s*=\s*await\s+supabaseAdmin\s*\.from\(Tables\.contactSubmissions\)/)
})
