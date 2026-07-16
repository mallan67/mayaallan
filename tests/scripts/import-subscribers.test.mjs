import { test } from "node:test"
import assert from "node:assert/strict"
import { runImport, importHadErrors, readActiveSubscribers } from "../../scripts/import-subscribers-to-resend.mjs"

const SEG = "seg_123"
const ok = (data, headers = null) => ({ data, error: null, headers })
const err = (statusCode, headers = null) => ({ data: null, error: { statusCode, message: "x", name: "application_error" }, headers })

function fakeResend({ get, create, list, add }) {
  const calls = { get: [], create: [], list: [], add: [] }
  const wrap = (name, h) => async (a) => { calls[name].push(a); return h ? h(a, calls[name].length - 1) : ok({}) }
  return {
    calls,
    contacts: { get: wrap("get", get), create: wrap("create", create),
      segments: { list: wrap("list", list), add: wrap("add", add) } },
  }
}

test("dry-run is completely write-free and reports would-* counts", async () => {
  const r = fakeResend({
    get: (a) => (a.email === "new@x.com" ? err(404) : ok({ unsubscribed: false })),
    list: () => ok({ object: "list", data: [], has_more: false }),
  })
  const counts = await runImport({
    rows: [{ email: "new@x.com" }, { email: "active@x.com" }],
    resend: r, segmentId: SEG, apply: false, log: { info() {}, warn() {} },
  })
  assert.equal(r.calls.create.length, 0)
  assert.equal(r.calls.add.length, 0)
  assert.equal(counts["would-create"], 1)
  assert.equal(counts["would-add"], 1)
})

test("apply mode creates + adds", async () => {
  const r = fakeResend({ get: () => err(404), create: () => ok({ id: "c1" }), add: () => ok({ id: SEG }) })
  const counts = await runImport({
    rows: [{ email: "new@x.com" }], resend: r, segmentId: SEG, apply: true, log: { info() {}, warn() {} },
  })
  assert.equal(counts["created"], 1)
  assert.equal(r.calls.create.length, 1)
})

test("apply mode skips unsubscribed without writing", async () => {
  const r = fakeResend({ get: () => ok({ unsubscribed: true }) })
  const counts = await runImport({
    rows: [{ email: "u@x.com" }], resend: r, segmentId: SEG, apply: true, log: { info() {}, warn() {} },
  })
  assert.equal(counts["skipped-unsubscribed"], 1)
  assert.equal(r.calls.add.length, 0)
})

test("row errors are counted and importHadErrors reports failure", async () => {
  const r = fakeResend({ get: () => err(500) }) // non-404 -> error
  const counts = await runImport({
    rows: [{ email: "boom@x.com" }], resend: r, segmentId: SEG, apply: true, log: { info() {}, warn() {} },
  })
  assert.equal(counts["error"], 1)
  assert.equal(importHadErrors(counts), true)
  assert.equal(importHadErrors({ created: 3 }), false)
})

// A chainable fake of the Supabase query builder. `range()` resolves the next
// queued page; `from()`/`select()`/`is()`/`order()` return the builder.
function fakeSupabase(pages) {
  const calls = []       // range args, one per page request
  const orderCalls = []  // order args, one per page request
  const builder = {
    from() { return builder },
    select() { return builder },
    is() { return builder },
    order(col, o) { orderCalls.push({ col, o }); return builder },
    range(from, to) {
      const idx = calls.length
      calls.push({ from, to })
      return Promise.resolve(pages[idx] ?? { data: [], error: null })
    },
  }
  return { client: { from: () => builder }, calls, orderCalls }
}

test("readActiveSubscribers paginates 0-999, 1000-1999, ordered by id, dedup + in order", async () => {
  const page0 = Array.from({ length: 1000 }, (_, i) => ({ email: `a${i}@x.com` }))
  const page1 = [{ email: "z0@x.com" }, { email: "z1@x.com" }]
  const fake = fakeSupabase([{ data: page0, error: null }, { data: page1, error: null }])
  const rows = await readActiveSubscribers(fake.client)
  assert.deepEqual(fake.calls, [{ from: 0, to: 999 }, { from: 1000, to: 1999 }])
  assert.equal(fake.orderCalls.length, 2)
  fake.orderCalls.forEach((o) => { assert.equal(o.col, "id"); assert.deepEqual(o.o, { ascending: true }) })
  assert.equal(rows.length, 1002)
  assert.equal(rows[0].email, "a0@x.com")
  assert.equal(rows[1000].email, "z0@x.com")
  assert.equal(new Set(rows.map((r) => r.email)).size, 1002) // each row exactly once
})

test("readActiveSubscribers: a full page triggers another request; an empty page stops", async () => {
  const page0 = Array.from({ length: 1000 }, (_, i) => ({ email: `b${i}@x.com` }))
  const fake = fakeSupabase([{ data: page0, error: null }, { data: [], error: null }])
  const rows = await readActiveSubscribers(fake.client)
  assert.equal(fake.calls.length, 2) // the full first page forced a 2nd request
  assert.equal(rows.length, 1000)    // the empty 2nd page stopped pagination
})

test("readActiveSubscribers: single short first page stops after one request", async () => {
  const fake = fakeSupabase([{ data: [{ email: "only@x.com" }], error: null }])
  const rows = await readActiveSubscribers(fake.client)
  assert.equal(fake.calls.length, 1)
  assert.deepEqual(fake.calls[0], { from: 0, to: 999 })
  assert.equal(rows.length, 1)
})

test("readActiveSubscribers rejects on a Supabase read error", async () => {
  const fake = fakeSupabase([{ data: null, error: { message: "boom" } }])
  await assert.rejects(() => readActiveSubscribers(fake.client), /supabase read failed: boom/)
})
