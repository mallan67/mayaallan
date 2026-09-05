/**
 * Source-level contract for src/app/books/[slug]/page.tsx.
 *
 * generateMetadata() must treat a missing slug (PGRST116 / no row) as a
 * normal 404 — no console.error, so it never lands in Vercel's application
 * error groups — while still logging genuine database failures. Valid-book
 * metadata is untouched.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const src = readFileSync(
  fileURLToPath(new URL("../../src/app/books/[slug]/page.tsx", import.meta.url)),
  "utf8",
)

const metaStart = src.indexOf("export async function generateMetadata")
const metaEnd = src.indexOf("\nexport default", metaStart) > -1
  ? src.indexOf("\nexport default", metaStart)
  : src.indexOf("\nasync function", metaStart)
const meta = src.slice(metaStart, metaEnd)

test("generateMetadata imports and uses the shared no-rows classifier", () => {
  assert.match(src, /import\s*\{\s*isNoRowsError\s*\}\s*from\s*"@\/lib\/supabase-errors"/)
  assert.match(meta, /isNoRowsError\(error\)/)
})

test("no-row lookups do not emit console.error (the old unconditional log is gone)", () => {
  assert.doesNotMatch(meta, /if \(error \|\| !book\) \{\s*console\.error/)
  // The only console.error in generateMetadata must be guarded by the classifier.
  const logIdx = meta.indexOf("console.error(")
  assert.ok(logIdx > -1, "real DB failures are still logged")
  const guard = meta.lastIndexOf("!isNoRowsError(error)", logIdx)
  assert.ok(guard > -1 && logIdx - guard < 200, "console.error is inside the `!isNoRowsError(error)` branch")
})

test("a missing book still yields the Not Found metadata", () => {
  assert.match(meta, /title:\s*"Book Not Found"/)
})

test("the page body's PGRST116 handling is unchanged", () => {
  assert.match(src, /if \(error && error\.code !== "PGRST116"\) \{/)
  assert.match(src, /console\.error\("Book detail query error:"/)
})
