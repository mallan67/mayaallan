/**
 * Tests for src/lib/after-response.ts — the wrapper that hands post-response
 * work (operator notification emails) to the platform completion mechanism
 * (`after()` from next/server) instead of firing a promise and forgetting it.
 *
 * The `after` function is injected so this test needs neither Next nor path
 * aliases. Runs under Node >= 22.18 / 24 (type stripping).
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { runAfterResponse } from "../../src/lib/after-response.ts"

function fakeAfter() {
  const registered = []
  const after = (task) => { registered.push(task) }
  return { after, registered }
}

test("registers exactly one task with the completion mechanism, synchronously", () => {
  const { after, registered } = fakeAfter()
  let ran = false
  runAfterResponse(after, async () => { ran = true }, () => {})
  assert.equal(registered.length, 1, "one task handed to after()")
  assert.equal(typeof registered[0], "function")
  assert.equal(ran, false, "work does not start before the platform runs the task")
})

test("the registered task performs the work when the platform runs it", async () => {
  const { after, registered } = fakeAfter()
  let ran = false
  runAfterResponse(after, async () => { ran = true }, () => {})
  await registered[0]()
  assert.equal(ran, true)
})

test("a rejected send is routed to onError and the task itself resolves (no unhandled rejection)", async () => {
  const { after, registered } = fakeAfter()
  const seen = []
  const boom = new Error("SMTP down")
  runAfterResponse(after, async () => { throw boom }, async (err) => { seen.push(err) })
  await assert.doesNotReject(() => registered[0]())
  assert.deepEqual(seen, [boom])
})

test("a throwing onError handler is contained too — the task still resolves", async () => {
  const { after, registered } = fakeAfter()
  const logged = []
  const origError = console.error
  console.error = (...args) => { logged.push(args) }
  try {
    runAfterResponse(after, async () => { throw new Error("send failed") }, async () => { throw new Error("alert failed") })
    await assert.doesNotReject(() => registered[0]())
  } finally {
    console.error = origError
  }
  assert.ok(logged.length >= 1, "secondary failure is logged, not swallowed silently")
})

// --- Independence of separately registered tasks (Codex P2 on #47) ---------
// Next runs after() callbacks through an unbounded-concurrency queue once the
// response closes, so two registrations start together. These tests model
// that platform behavior with a fake `after` that starts every task at once.

function concurrentAfter() {
  const registered = []
  const after = (task) => { registered.push(task) }
  // Start all tasks concurrently (as Next's queue does) and settle them all.
  const runAll = () => Promise.allSettled(registered.map((t) => t()))
  return { after, registered, runAll }
}

test("two registrations are two independent tasks", () => {
  const { after, registered } = concurrentAfter()
  runAfterResponse(after, async () => {}, () => {})
  runAfterResponse(after, async () => {}, () => {})
  assert.equal(registered.length, 2)
  assert.notEqual(registered[0], registered[1])
})

test("a stalled first task (e.g. Resend hanging) does not prevent the second (SMTP) from starting and finishing", async () => {
  const { after, runAll } = concurrentAfter()
  let smtpRan = false
  const never = new Promise(() => {}) // stalls forever, like a hung upstream request
  runAfterResponse(after, () => never, () => {})
  runAfterResponse(after, async () => { smtpRan = true }, () => {})
  await Promise.race([runAll(), new Promise((r) => setTimeout(r, 50))])
  assert.equal(smtpRan, true, "second task ran while the first is still pending")
})

test("a rejecting Resend task does not prevent the SMTP task, and both failures are routed to their own onError", async () => {
  const { after, runAll } = concurrentAfter()
  const seen = []
  let smtpRan = false
  runAfterResponse(after, async () => { throw new Error("resend down") }, async (e) => { seen.push("sync:" + e.message) })
  runAfterResponse(after, async () => { smtpRan = true }, async (e) => { seen.push("smtp:" + e.message) })
  const settled = await runAll()
  assert.ok(settled.every((s) => s.status === "fulfilled"), "no task rejects (no unhandled rejection)")
  assert.equal(smtpRan, true)
  assert.deepEqual(seen, ["sync:resend down"])
})

test("a rejecting SMTP task does not prevent the Resend task", async () => {
  const { after, runAll } = concurrentAfter()
  const seen = []
  let syncRan = false
  runAfterResponse(after, async () => { throw new Error("smtp down") }, async (e) => { seen.push("smtp:" + e.message) })
  runAfterResponse(after, async () => { syncRan = true }, async (e) => { seen.push("sync:" + e.message) })
  const settled = await runAll()
  assert.ok(settled.every((s) => s.status === "fulfilled"))
  assert.equal(syncRan, true)
  assert.deepEqual(seen, ["smtp:smtp down"])
})

test("three registrations: one stalled and one rejecting still leave the third to run, each failure routed to its own onError", async () => {
  const { after, registered, runAll } = concurrentAfter()
  const seen = []
  let thirdRan = false
  runAfterResponse(after, () => new Promise(() => {}), () => { seen.push("tracking:onError") }) // stalls (e.g. tracking insert hangs)
  runAfterResponse(after, async () => { throw new Error("smtp down") }, async (e) => { seen.push("smtp:" + e.message) })
  runAfterResponse(after, async () => { thirdRan = true }, () => { seen.push("sync:onError") })
  assert.equal(registered.length, 3, "three independent tasks registered")
  await Promise.race([runAll(), new Promise((r) => setTimeout(r, 50))])
  assert.equal(thirdRan, true, "third task ran while the first is still pending and the second failed")
  assert.deepEqual(seen, ["smtp:smtp down"], "only the rejecting task's onError fired; the stalled one is still pending")
})

test("does not fall back to fire-and-forget if after() itself throws (outside a request scope)", () => {
  // If the platform refuses the registration, the caller must find out —
  // silently running the work detached would recreate the original defect.
  const after = () => { throw new Error("after() called outside a request scope") }
  assert.throws(() => runAfterResponse(after, async () => {}, () => {}), /outside a request scope/)
})
