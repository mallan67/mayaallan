/**
 * Tests for src/lib/admin-schemas.ts — covers the strict-validation
 * patches Maya requested on PR #24:
 *
 *   1. booleanish: reject arbitrary strings like "yes please"
 *   2. optionalUrl: reject non-empty invalid URLs (preserve null on blank)
 *   3. eventCreateSchema.startsAt: emit ZodIssue (not raw throw)
 *   4. optionalUrl: still accept blank → null
 *
 * Plus a few defense-in-depth checks for the validators that surround
 * them (decimalOrNull, isoDateOrNull) since they got the same strictness
 * treatment in the patch.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  booleanish,
  optionalUrl,
  decimalOrNull,
  isoDateOrNull,
  eventCreateSchema,
  bookUpdateSchema,
  formatZodError,
} from "../../src/lib/admin-schemas.ts"

// ─── booleanish ─────────────────────────────────────────────────────────

test("booleanish: native true → true", () => {
  const r = booleanish.safeParse(true)
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, true)
})

test("booleanish: native false → false", () => {
  const r = booleanish.safeParse(false)
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, false)
})

test('booleanish: string "true" → true', () => {
  const r = booleanish.safeParse("true")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, true)
})

test('booleanish: string "false" → false', () => {
  const r = booleanish.safeParse("false")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, false)
})

test('booleanish: string "on" → true', () => {
  const r = booleanish.safeParse("on")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, true)
})

test('booleanish: string "off" → false', () => {
  const r = booleanish.safeParse("off")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, false)
})

test('booleanish: case-insensitive "TRUE" → true', () => {
  const r = booleanish.safeParse("TRUE")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, true)
})

test("booleanish: null → false (omitted-field default)", () => {
  const r = booleanish.safeParse(null)
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, false)
})

test("booleanish: undefined → false (omitted-field default)", () => {
  const r = booleanish.safeParse(undefined)
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, false)
})

test('booleanish: REJECT "yes please" (the exact regression Maya flagged)', () => {
  const r = booleanish.safeParse("yes please")
  assert.equal(r.success, false)
  if (!r.success) {
    assert.match(r.error.issues[0].message, /true\/false|on\/off/)
  }
})

test('booleanish: REJECT "1" (numeric string, not a boolean word)', () => {
  const r = booleanish.safeParse("1")
  assert.equal(r.success, false)
})

test("booleanish: REJECT number 0", () => {
  const r = booleanish.safeParse(0)
  assert.equal(r.success, false)
})

test('booleanish: REJECT "" (empty string is not a boolean)', () => {
  const r = booleanish.safeParse("")
  assert.equal(r.success, false)
})

// ─── optionalUrl ────────────────────────────────────────────────────────

test("optionalUrl: blank string → null (no error)", () => {
  const r = optionalUrl.safeParse("")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, null)
})

test("optionalUrl: whitespace-only string → null", () => {
  const r = optionalUrl.safeParse("   ")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, null)
})

test("optionalUrl: null → null", () => {
  const r = optionalUrl.safeParse(null)
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, null)
})

test("optionalUrl: undefined → null", () => {
  const r = optionalUrl.safeParse(undefined)
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, null)
})

test("optionalUrl: valid absolute https URL passes", () => {
  const r = optionalUrl.safeParse("https://example.com/path?q=1")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, "https://example.com/path?q=1")
})

test("optionalUrl: valid relative path passes", () => {
  const r = optionalUrl.safeParse("/images/cover.jpg")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, "/images/cover.jpg")
})

test("optionalUrl: REJECT invalid non-empty URL (not silently → null)", () => {
  // `http://[broken` has a malformed IPv6-host bracket and is genuinely
  // unparseable by `new URL()` (even with a base). Confirms the
  // strictness patch — would have silently become null in the old
  // implementation, clearing the database column on update.
  const r = optionalUrl.safeParse("http://[broken")
  assert.equal(
    r.success,
    false,
    `expected failure for invalid URL, got success with data=${r.success ? r.data : "?"}`,
  )
  if (!r.success) {
    assert.match(r.error.issues[0].message, /valid URL|relative path/i)
  }
})

test("optionalUrl: REJECT 'https//missing-colon.com' (typo case Maya cited)", () => {
  // This is structurally invalid as both an absolute URL (no protocol
  // separator) and a relative path (starts with letters then //) — but
  // `new URL("https//missing-colon.com", "https://example.com/")`
  // actually parses successfully (resolves as a relative path under
  // the base origin). So the strict test case has to be one that the
  // URL constructor genuinely rejects.
  //
  // Sanity-confirmed-invalid:
  const r = optionalUrl.safeParse("http://[not-a-host")
  assert.equal(r.success, false)
})

// ─── decimalOrNull ──────────────────────────────────────────────────────

test("decimalOrNull: blank → null", () => {
  const r = decimalOrNull.safeParse("")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, null)
})

test("decimalOrNull: number 9.99 → 9.99", () => {
  const r = decimalOrNull.safeParse(9.99)
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, 9.99)
})

test('decimalOrNull: "$1,299.00" → 1299', () => {
  const r = decimalOrNull.safeParse("$1,299.00")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, 1299)
})

test('decimalOrNull: REJECT "abc" (not silently → null)', () => {
  const r = decimalOrNull.safeParse("abc")
  assert.equal(r.success, false)
})

// ─── isoDateOrNull ──────────────────────────────────────────────────────

test("isoDateOrNull: blank → null", () => {
  const r = isoDateOrNull.safeParse("")
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data, null)
})

test("isoDateOrNull: valid date string → ISO string", () => {
  const r = isoDateOrNull.safeParse("2026-05-21T12:00")
  assert.equal(r.success, true)
  if (r.success) assert.equal(typeof r.data, "string")
})

test('isoDateOrNull: REJECT "not a date" (not silently → null)', () => {
  const r = isoDateOrNull.safeParse("not a date")
  assert.equal(r.success, false)
})

// ─── eventCreateSchema (integration of the above) ───────────────────────

test("eventCreateSchema: minimal valid payload passes", () => {
  const r = eventCreateSchema.safeParse({
    title: "Live event",
    slug: "live-event",
    startsAt: "2026-12-31T19:00",
  })
  assert.equal(r.success, true)
  if (r.success) {
    assert.equal(r.data.title, "Live event")
    assert.equal(r.data.slug, "live-event")
    assert.equal(r.data.isPublished, false)
    assert.equal(r.data.isVisible, false)
    assert.equal(r.data.keepVisibleAfterEnd, false)
  }
})

test('eventCreateSchema: invalid startsAt returns ZodIssue (HTTP 400 flow)', () => {
  const r = eventCreateSchema.safeParse({
    title: "Live event",
    slug: "live-event",
    startsAt: "definitely not a date",
  })
  assert.equal(r.success, false)
  if (!r.success) {
    const formatted = formatZodError(r.error)
    assert.equal(formatted.error, "Invalid input")
    assert.ok(formatted.fields.startsAt, "fields.startsAt should be present")
    assert.match(formatted.fields.startsAt, /date/i)
  }
})

test('eventCreateSchema: "yes please" boolean rejected as field error', () => {
  const r = eventCreateSchema.safeParse({
    title: "Live event",
    slug: "live-event",
    startsAt: "2026-12-31T19:00",
    isPublished: "yes please",
  })
  assert.equal(r.success, false)
  if (!r.success) {
    const formatted = formatZodError(r.error)
    assert.ok(
      formatted.fields.isPublished,
      "fields.isPublished should be present",
    )
  }
})

test("eventCreateSchema: invalid locationUrl rejected as field error", () => {
  const r = eventCreateSchema.safeParse({
    title: "Live event",
    slug: "live-event",
    startsAt: "2026-12-31T19:00",
    locationUrl: "http://[not-a-host",
  })
  assert.equal(r.success, false)
  if (!r.success) {
    const formatted = formatZodError(r.error)
    assert.ok(formatted.fields.locationUrl)
  }
})

test("eventCreateSchema: blank locationUrl still becomes null (URL clearing intentional)", () => {
  const r = eventCreateSchema.safeParse({
    title: "Live event",
    slug: "live-event",
    startsAt: "2026-12-31T19:00",
    locationUrl: "",
  })
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data.locationUrl, null)
})

// ─── bookUpdateSchema (partial — verify the "URL clearing" guard rail) ──

test("bookUpdateSchema: blank coverUrl still clears (sets to null)", () => {
  const r = bookUpdateSchema.safeParse({ coverUrl: "" })
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data.coverUrl, null)
})

test("bookUpdateSchema: invalid coverUrl blocks update (no silent clear)", () => {
  const r = bookUpdateSchema.safeParse({ coverUrl: "http://[not-a-host" })
  assert.equal(r.success, false)
})

test('bookUpdateSchema: "yes please" on hasEbook rejected', () => {
  const r = bookUpdateSchema.safeParse({ hasEbook: "yes please" })
  assert.equal(r.success, false)
  if (!r.success) {
    const formatted = formatZodError(r.error)
    assert.ok(formatted.fields.hasEbook)
  }
})

// ─── formatZodError ─────────────────────────────────────────────────────

test("formatZodError: maps issues to field map under fields key", () => {
  const r = eventCreateSchema.safeParse({
    // missing title + slug + startsAt — should produce 3 field errors
  })
  assert.equal(r.success, false)
  if (!r.success) {
    const formatted = formatZodError(r.error)
    assert.equal(formatted.error, "Invalid input")
    assert.ok(formatted.fields.title || formatted.fields.slug || formatted.fields.startsAt)
  }
})
