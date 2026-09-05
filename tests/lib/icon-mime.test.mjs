/**
 * Tests for src/lib/icon-mime.ts — deriving a trustworthy MIME type for the
 * admin-uploaded site icon from its URL, or declaring none at all. The site
 * icon is stored in Vercel Blob and may be JPEG, PNG, SVG, ICO or WebP; the
 * <link rel="icon"> must never claim a type the asset does not have.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { iconMimeTypeFromUrl } from "../../src/lib/icon-mime.ts"

test("recognises the common raster and vector icon extensions", () => {
  assert.equal(iconMimeTypeFromUrl("https://x.public.blob.vercel-storage.com/uploads/1769102188323-icon.jpg"), "image/jpeg")
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon.jpeg"), "image/jpeg")
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon.png"), "image/png")
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon.svg"), "image/svg+xml")
  assert.equal(iconMimeTypeFromUrl("https://x.example/favicon.ico"), "image/x-icon")
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon.webp"), "image/webp")
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon.gif"), "image/gif")
})

test("is case-insensitive and ignores query strings and fragments", () => {
  assert.equal(iconMimeTypeFromUrl("https://x.example/ICON.PNG?v=3"), "image/png")
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon.JPG#top"), "image/jpeg")
})

test("returns undefined when the type cannot be trusted (unknown / missing extension, not a URL)", () => {
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon"), undefined)
  assert.equal(iconMimeTypeFromUrl("https://x.example/icon.bmp"), undefined)
  assert.equal(iconMimeTypeFromUrl("https://x.example/dir.png/icon"), undefined)
  assert.equal(iconMimeTypeFromUrl(""), undefined)
  assert.equal(iconMimeTypeFromUrl("not a url .png"), undefined)
})
