/**
 * Tests for src/lib/supabase-errors.ts — isNoRowsError distinguishes the
 * PostgREST "no rows" result of `.single()` (a normal 404) from real database
 * or infrastructure failures. Dependency-free.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { isNoRowsError } from "../../src/lib/supabase-errors.ts"

test("PGRST116 is the no-rows case", () => {
  assert.equal(isNoRowsError({ code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" }), true)
})

test("other PostgREST / Postgres codes are real failures", () => {
  assert.equal(isNoRowsError({ code: "PGRST301", message: "JWT expired" }), false)
  assert.equal(isNoRowsError({ code: "42P01", message: "relation does not exist" }), false)
})

test("null / undefined / codeless errors are not no-rows", () => {
  assert.equal(isNoRowsError(null), false)
  assert.equal(isNoRowsError(undefined), false)
  assert.equal(isNoRowsError({ message: "fetch failed" }), false)
})
