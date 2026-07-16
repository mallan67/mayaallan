import { test } from "node:test"
import assert from "node:assert/strict"
import {
  syncContact,
  classifyContact,
  resolveConfig,
  syncSubscriberToResend,
  withRateLimit,
  retryAfterMs,
  isNotFound,
} from "../../src/lib/resend-newsletter.mjs"

const SEG = "seg_123"
const ok = (data, headers = null) => ({ data, error: null, headers })
const err = (statusCode, headers = null) => ({ data: null, error: { statusCode, message: "x", name: "application_error" }, headers })

// Build a fake resend client from per-method queues/handlers.
function fakeResend({ get, create, list, add }) {
  const calls = { get: [], create: [], list: [], add: [] }
  const wrap = (name, handler) => async (arg) => {
    calls[name].push(arg)
    return handler ? handler(arg, calls[name].length - 1) : ok({})
  }
  return {
    calls,
    contacts: {
      get: wrap("get", get),
      create: wrap("create", create),
      segments: { list: wrap("list", list), add: wrap("add", add) },
    },
  }
}

test("isNotFound", () => {
  assert.equal(isNotFound({ statusCode: 404 }), true)
  assert.equal(isNotFound({ statusCode: 500 }), false)
  assert.equal(isNotFound(null), false)
})

test("404 -> create + add -> created", async () => {
  const r = fakeResend({
    get: () => err(404),
    create: () => ok({ id: "c1" }),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "a@x.com" })
  assert.equal(res.status, "created")
  assert.deepEqual(r.calls.create[0], { email: "a@x.com", unsubscribed: false })
  assert.deepEqual(r.calls.add[0], { email: "a@x.com", segmentId: SEG })
})

test("existing unsubscribed -> skipped, no writes", async () => {
  const r = fakeResend({ get: () => ok({ unsubscribed: true }) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "u@x.com" })
  assert.equal(res.status, "skipped-unsubscribed")
  assert.equal(r.calls.create.length, 0)
  assert.equal(r.calls.add.length, 0)
})

test("existing active not-member -> added-to-segment", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: () => ok({ object: "list", data: [], has_more: false }),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "b@x.com" })
  assert.equal(res.status, "added-to-segment")
  assert.equal(r.calls.add.length, 1)
})

test("existing active already-member -> already-member, no add", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: () => ok({ object: "list", data: [{ id: SEG }], has_more: false }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "c@x.com" })
  assert.equal(res.status, "already-member")
  assert.equal(r.calls.add.length, 0)
})

test("malformed segment-list (data null) -> error, no add (fail closed)", async () => {
  const r = fakeResend({ get: () => ok({ unsubscribed: false }), list: () => ok(null) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "ml@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /segments-list:no-data/)
  assert.equal(r.calls.add.length, 0)
})

test("malformed segment-list (data.data not array) -> error, no add", async () => {
  const r = fakeResend({ get: () => ok({ unsubscribed: false }), list: () => ok({ object: "list", data: "nope" }) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "ml2@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /segments-list:no-data/)
  assert.equal(r.calls.add.length, 0)
})

// Sequential paginated segments.list fake: returns each response in order.
// contactInSegment computes `after` from the last item's id; the fake ignores it
// (calls are recorded in r.calls.list, so tests can assert the cursor was passed).
function pagedList(responses) {
  let i = 0
  return () => responses[i++] ?? ok({ object: "list", data: [], has_more: false })
}

test("segment membership: target found on the SECOND page -> already-member, no add", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: pagedList([
      ok({ object: "list", data: [{ id: "seg_a" }, { id: "seg_b" }], has_more: true }),
      ok({ object: "list", data: [{ id: SEG }], has_more: false }),
    ]),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "p2@x.com" })
  assert.equal(res.status, "already-member")
  assert.equal(r.calls.list.length, 2)
  assert.equal(r.calls.list[1].after, "seg_b") // advanced via last id of page 1
  assert.equal(r.calls.add.length, 0)
})

test("segment membership: target absent across pages -> ONE add (sync mode)", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: pagedList([
      ok({ object: "list", data: [{ id: "seg_a" }], has_more: true }),
      ok({ object: "list", data: [{ id: "seg_b" }], has_more: false }),
    ]),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "ab@x.com" })
  assert.equal(res.status, "added-to-segment")
  assert.equal(r.calls.list.length, 2)
  assert.equal(r.calls.add.length, 1)
})

test("segment membership: target absent across pages -> would-add (dry-run, no writes)", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: pagedList([
      ok({ object: "list", data: [{ id: "seg_a" }], has_more: true }),
      ok({ object: "list", data: [{ id: "seg_b" }], has_more: false }),
    ]),
  })
  const res = await classifyContact({ resend: r, segmentId: SEG, email: "ab2@x.com" })
  assert.equal(res.status, "would-add")
  assert.equal(r.calls.list.length, 2)
  assert.equal(r.calls.add.length, 0)
  assert.equal(r.calls.create.length, 0)
})

test("segment membership: an errored later page -> error, no add", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: pagedList([
      ok({ object: "list", data: [{ id: "seg_a" }], has_more: true }),
      err(500),
    ]),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "er@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /segments-list:500/)
  assert.equal(r.calls.add.length, 0)
})

test("segment membership: a malformed later page (missing has_more) -> error, no add", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: pagedList([
      ok({ object: "list", data: [{ id: "seg_a" }], has_more: true }),
      ok({ object: "list", data: [{ id: "seg_b" }] }), // missing has_more -> malformed
    ]),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "mp@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /segments-list:no-data/)
  assert.equal(r.calls.add.length, 0)
})

test("segment membership: stops paginating when has_more is false (single page)", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: pagedList([ok({ object: "list", data: [{ id: "seg_a" }], has_more: false })]),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "sp@x.com" })
  assert.equal(res.status, "added-to-segment")
  assert.equal(r.calls.list.length, 1) // did not request a 2nd page
  assert.equal(r.calls.add.length, 1)
})

test("non-404 get error -> error, no create", async () => {
  const r = fakeResend({ get: () => err(500) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "e@x.com" })
  assert.equal(res.status, "error")
  assert.equal(r.calls.create.length, 0)
})

test("get returns no data and no error -> error (fail closed)", async () => {
  const r = fakeResend({ get: () => ({ data: null, error: null, headers: null }) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "nd@x.com" })
  assert.equal(res.status, "error")
  assert.equal(r.calls.create.length, 0)
  assert.equal(r.calls.add.length, 0)
})

test("existing contact missing unsubscribed boolean -> error (fail closed), not added", async () => {
  const r = fakeResend({ get: () => ok({ id: "c1" }) }) // no `unsubscribed` field
  const res = await syncContact({ resend: r, segmentId: SEG, email: "m@x.com" })
  assert.equal(res.status, "error")
  assert.equal(r.calls.add.length, 0)
})

test("create error + refetch finds contact -> one refetch -> apply rules", async () => {
  let gets = 0
  const r = fakeResend({
    get: () => (gets++ === 0 ? err(404) : ok({ unsubscribed: false })),
    create: () => err(500), // ANY create error triggers the single read-after-write refetch
    list: () => ok({ object: "list", data: [], has_more: false }),
    add: () => ok({ id: SEG }),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "race@x.com" })
  assert.equal(res.status, "added-to-segment")
  assert.equal(r.calls.get.length, 2)
  assert.equal(r.calls.create.length, 1) // never retries creation
})

test("create error + refetch still missing -> original create error, no retry", async () => {
  const r = fakeResend({ get: () => err(404), create: () => err(503) })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "fail@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /create:503/)
  assert.equal(r.calls.create.length, 1)
})

test("created but segment-add fails -> error with explicit partial detail", async () => {
  const r = fakeResend({
    get: () => err(404),
    create: () => ok({ id: "c1" }),
    add: () => err(500),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "p@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /partial-contact-created:segment-add:500/)
})

test("partial create self-heals: next sync finds active contact and adds membership", async () => {
  let created = false
  let addCalls = 0
  const r = fakeResend({
    get: () => (created ? ok({ unsubscribed: false }) : err(404)),
    create: () => { created = true; return ok({ id: "c1" }) },
    list: () => ok({ object: "list", data: [], has_more: false }),
    add: () => (++addCalls === 1 ? err(500) : ok({ id: SEG })),
  })
  const first = await syncContact({ resend: r, segmentId: SEG, email: "h@x.com" })
  assert.equal(first.status, "error")
  assert.match(first.detail, /partial-contact-created/)
  const second = await syncContact({ resend: r, segmentId: SEG, email: "h@x.com" })
  assert.equal(second.status, "added-to-segment")
})

test("recovery re-fetch THROWS -> original create error preserved, single create attempt", async () => {
  let gets = 0
  const r = fakeResend({
    get: () => { if (gets++ === 0) return err(404); throw new Error("network") },
    create: () => err(503),
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "t@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /create:503/) // NOT threw:
  assert.equal(r.calls.create.length, 1)
})

test("segment-add THROWS after create -> partial-contact-created:segment-add-threw", async () => {
  const r = fakeResend({
    get: () => err(404),
    create: () => ok({ id: "c1" }),
    add: () => { throw new Error("boom") },
  })
  const res = await syncContact({ resend: r, segmentId: SEG, email: "pa@x.com" })
  assert.equal(res.status, "error")
  assert.match(res.detail, /partial-contact-created:segment-add-threw:boom/)
})

test("classifyContact is write-free", async () => {
  const r = fakeResend({
    get: () => ok({ unsubscribed: false }),
    list: () => ok({ object: "list", data: [], has_more: false }),
  })
  const res = await classifyContact({ resend: r, segmentId: SEG, email: "d@x.com" })
  assert.equal(res.status, "would-add")
  assert.equal(r.calls.create.length, 0)
  assert.equal(r.calls.add.length, 0)
})

test("classifyContact: 404 -> would-create; unsubscribed -> would-skip-unsubscribed", async () => {
  const r1 = fakeResend({ get: () => err(404) })
  assert.equal((await classifyContact({ resend: r1, segmentId: SEG, email: "n@x.com" })).status, "would-create")
  const r2 = fakeResend({ get: () => ok({ unsubscribed: true }) })
  assert.equal((await classifyContact({ resend: r2, segmentId: SEG, email: "s@x.com" })).status, "would-skip-unsubscribed")
})

test("classifyContact fail-closed: no data -> error; missing unsubscribed -> error", async () => {
  const r1 = fakeResend({ get: () => ({ data: null, error: null, headers: null }) })
  assert.equal((await classifyContact({ resend: r1, segmentId: SEG, email: "a" })).status, "error")
  const r2 = fakeResend({ get: () => ok({ id: "c1" }) })
  assert.equal((await classifyContact({ resend: r2, segmentId: SEG, email: "b" })).status, "error")
})

test("classifyContact malformed segment-list -> error", async () => {
  const r = fakeResend({ get: () => ok({ unsubscribed: false }), list: () => ok({ data: "x" }) })
  assert.equal((await classifyContact({ resend: r, segmentId: SEG, email: "c" })).status, "error")
})

test("resolveConfig reads env", () => {
  const c = resolveConfig({ RESEND_API_KEY: "k", RESEND_NEWSLETTER_SEGMENT_ID: "s" })
  assert.deepEqual(c, { apiKey: "k", segmentId: "s" })
  assert.deepEqual(resolveConfig({}), { apiKey: null, segmentId: null })
})

test("syncSubscriberToResend: no api key -> noop-no-api-key", async () => {
  const res = await syncSubscriberToResend("z@x.com", { env: {} })
  assert.equal(res.status, "noop-no-api-key")
})

test("syncSubscriberToResend: no segment id -> noop-no-segment-id", async () => {
  const res = await syncSubscriberToResend("z@x.com", { env: { RESEND_API_KEY: "k" } })
  assert.equal(res.status, "noop-no-segment-id")
})

test("syncSubscriberToResend: uses injected client via makeClient", async () => {
  const r = fakeResend({ get: () => err(404), create: () => ok({ id: "c1" }), add: () => ok({ id: SEG }) })
  const res = await syncSubscriberToResend("z@x.com", {
    env: { RESEND_API_KEY: "k", RESEND_NEWSLETTER_SEGMENT_ID: SEG },
    makeClient: () => r,
  })
  assert.equal(res.status, "created")
})

test("retryAfterMs: numeric seconds header", () => {
  assert.equal(retryAfterMs({ "retry-after": "2" }), 2000)
})

test("retryAfterMs: HTTP-date header", () => {
  const ms = retryAfterMs({ "retry-after": new Date(5000).toUTCString() }, () => 0)
  assert.ok(ms >= 4000 && ms <= 5000)
})

test("retryAfterMs: missing header -> null", () => {
  assert.equal(retryAfterMs(null), null)
  assert.equal(retryAfterMs({}), null)
})

test("withRateLimit: numeric Retry-After from top-level res.headers drives the wait", async () => {
  let n = 0
  const slept = []
  const base = fakeResend({ get: () => (n++ === 0 ? err(429, { "retry-after": "2" }) : ok({ unsubscribed: false })) })
  const wrapped = withRateLimit(base, { minIntervalMs: 0, sleep: async (ms) => slept.push(ms), log: { warn() {} } })
  const res = await wrapped.contacts.get({ email: "r@x.com" })
  assert.equal(res.error, null)
  assert.ok(slept.includes(2000))
})

test("withRateLimit: HTTP-date Retry-After header drives the wait", async () => {
  let n = 0
  const slept = []
  const base = fakeResend({
    get: () => (n++ === 0 ? err(429, { "retry-after": new Date(Date.now() + 3000).toUTCString() }) : ok({ unsubscribed: false })),
  })
  const wrapped = withRateLimit(base, { minIntervalMs: 0, sleep: async (ms) => slept.push(ms), log: { warn() {} } })
  const res = await wrapped.contacts.get({ email: "r@x.com" })
  assert.equal(res.error, null)
  assert.ok(slept.some((ms) => ms >= 1000 && ms <= 3500))
})

test("withRateLimit: missing headers -> exponential backoff", async () => {
  let n = 0
  const slept = []
  const base = fakeResend({ get: () => (n++ === 0 ? err(429) : ok({ unsubscribed: false })) })
  const wrapped = withRateLimit(base, { minIntervalMs: 0, sleep: async (ms) => slept.push(ms), log: { warn() {} } })
  const res = await wrapped.contacts.get({ email: "r@x.com" })
  assert.equal(res.error, null)
  assert.ok(slept.some((ms) => ms >= 500))
})

test("withRateLimit paces calls by minIntervalMs, shared across methods (per-request, not per-row)", async () => {
  const slept = []
  let t = 0
  const base = fakeResend({ get: () => ok({ unsubscribed: false }), list: () => ok({ object: "list", data: [], has_more: false }) })
  const wrapped = withRateLimit(base, {
    minIntervalMs: 100, now: () => t, sleep: async (ms) => { slept.push(ms); t += ms }, log: { warn() {} },
  })
  await wrapped.contacts.get({ email: "a" })
  await wrapped.contacts.segments.list({ email: "a" })
  assert.ok(slept.some((ms) => ms >= 100))
})
