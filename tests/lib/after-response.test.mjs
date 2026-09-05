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

test("does not fall back to fire-and-forget if after() itself throws (outside a request scope)", () => {
  // If the platform refuses the registration, the caller must find out —
  // silently running the work detached would recreate the original defect.
  const after = () => { throw new Error("after() called outside a request scope") }
  assert.throws(() => runAfterResponse(after, async () => {}, () => {}), /outside a request scope/)
})
