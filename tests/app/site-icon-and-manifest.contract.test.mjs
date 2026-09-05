/**
 * Contracts for the site icon metadata and the (former) PWA manifest.
 *
 *   - src/app/layout.tsx must not hard-code `type: "image/png"` for the
 *     admin-provided site_icon_url; it derives the type via iconMimeTypeFromUrl
 *     or omits it.
 *   - public/manifest.json was orphaned (nothing linked it) and referenced two
 *     icons that do not exist. There is no installable-PWA requirement in the
 *     app, so the manifest is removed rather than given invented icons. If a
 *     manifest ever returns, every icon it references must exist in public/.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url))
const layout = readFileSync(p("../../src/app/layout.tsx"), "utf8")

test("layout derives the site icon MIME type instead of hard-coding image/png", () => {
  assert.match(layout, /import\s*\{\s*iconMimeTypeFromUrl\s*\}\s*from\s*"@\/lib\/icon-mime"/)
  assert.match(layout, /iconMimeTypeFromUrl\(settings\.siteIconUrl\)/)
  // The static fallback icons keep their explicit types; only the dynamic
  // branch changes. Assert the dynamic branch no longer pairs siteIconUrl with
  // a literal image/png.
  assert.doesNotMatch(layout, /url:\s*settings\.siteIconUrl,\s*type:\s*"image\/png"/)
})

test("no manifest is linked from the app, and no orphan manifest ships in public/", () => {
  assert.doesNotMatch(layout, /manifest:/)
  assert.equal(existsSync(p("../../public/manifest.json")), false, "public/manifest.json removed")
  assert.equal(existsSync(p("../../src/app/manifest.ts")), false)
  assert.equal(existsSync(p("../../src/app/manifest.webmanifest")), false)
})

test("if a manifest exists, every icon it references exists in public/", () => {
  const candidates = ["../../public/manifest.json", "../../public/site.webmanifest", "../../public/manifest.webmanifest"]
  for (const rel of candidates) {
    if (!existsSync(p(rel))) continue
    const manifest = JSON.parse(readFileSync(p(rel), "utf8"))
    for (const icon of manifest.icons ?? []) {
      assert.ok(existsSync(p(`../../public${icon.src}`)), `manifest icon exists: ${icon.src}`)
    }
  }
})
