/**
 * Tests for tests/setup/alias-hooks.mjs — the Node module-resolution hook
 * that maps the project's `@/` path alias (tsconfig `paths: { "@/*": ["./src/*"] }`)
 * onto src/ for the plain `node --test` runner. Without it any test that
 * imports a module which itself imports `@/lib/...` fails with
 * ERR_MODULE_NOT_FOUND (this was the standing tests/lib/rate-limit failure).
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { mapAliasSpecifier, MIN_NODE } from "./alias-hooks.mjs"

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "alias-"))
  const src = path.join(root, "src")
  mkdirSync(path.join(src, "lib"), { recursive: true })
  writeFileSync(path.join(src, "lib", "upstash.ts"), "export const x = 1\n")
  writeFileSync(path.join(src, "lib", "util.mjs"), "export const y = 2\n")
  mkdirSync(path.join(src, "lib", "aeo"), { recursive: true })
  writeFileSync(path.join(src, "lib", "aeo", "index.ts"), "export const z = 3\n")
  return { root, src, cleanup: () => rmSync(root, { recursive: true, force: true }) }
}

test("maps @/lib/upstash to the .ts file under src/", () => {
  const f = fixture()
  try {
    const url = mapAliasSpecifier("@/lib/upstash", f.src)
    assert.equal(url, pathToFileURL(path.join(f.src, "lib", "upstash.ts")).href)
  } finally { f.cleanup() }
})

test("keeps an explicit extension when the file exists", () => {
  const f = fixture()
  try {
    assert.equal(mapAliasSpecifier("@/lib/util.mjs", f.src), pathToFileURL(path.join(f.src, "lib", "util.mjs")).href)
  } finally { f.cleanup() }
})

test("resolves a directory alias to its index.ts", () => {
  const f = fixture()
  try {
    assert.equal(mapAliasSpecifier("@/lib/aeo", f.src), pathToFileURL(path.join(f.src, "lib", "aeo", "index.ts")).href)
  } finally { f.cleanup() }
})

test("returns null for non-alias specifiers and for alias targets that do not exist", () => {
  const f = fixture()
  try {
    assert.equal(mapAliasSpecifier("node:fs", f.src), null)
    assert.equal(mapAliasSpecifier("./relative.mjs", f.src), null)
    assert.equal(mapAliasSpecifier("@upstash/redis", f.src), null, "a scoped npm package is not the @/ alias")
    assert.equal(mapAliasSpecifier("@/lib/does-not-exist", f.src), null)
  } finally { f.cleanup() }
})

test("declares the minimum Node version that can strip TypeScript types", () => {
  // Node 22.18 made type stripping default-on; 24 LTS is the Vercel runtime.
  assert.deepEqual(MIN_NODE, { major: 22, minor: 18 })
})
