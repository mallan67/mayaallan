/**
 * Tests for the Permissions-Policy header emitted by next.config.mjs.
 *
 * The header uses Structured Field syntax: each allowlist entry is `self`,
 * `*`, or a double-quoted origin ("https://example.com", wildcard subdomains
 * allowed where supported). A bare, unquoted origin such as
 * `https://*.paypal.com` is a parse error — browsers warn on every page and
 * the delegation silently does not apply.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import nextConfig from "../../next.config.mjs"

async function permissionsPolicy() {
  const groups = await nextConfig.headers()
  const values = []
  for (const g of groups) {
    for (const h of g.headers ?? []) {
      if (h.key.toLowerCase() === "permissions-policy") values.push(h.value)
    }
  }
  assert.ok(values.length >= 1, "a Permissions-Policy header is configured")
  return values
}

const ENTRY = /^(self|\*|"https?:\/\/[^"\s]+")$/

test("every Permissions-Policy allowlist entry is `self`, `*`, or a double-quoted origin", async () => {
  for (const value of await permissionsPolicy()) {
    for (const directive of value.split(",").map((s) => s.trim()).filter(Boolean)) {
      const m = directive.match(/^([a-z-]+)=\((.*)\)$/)
      assert.ok(m, `directive parses as name=(allowlist): ${directive}`)
      const entries = m[2].trim() === "" ? [] : m[2].trim().split(/\s+/)
      for (const e of entries) {
        assert.match(e, ENTRY, `allowlist entry is not valid Structured Field syntax: ${e} (in ${directive})`)
      }
    }
  }
})

test("payment delegates to self and the quoted PayPal origin (wildcard kept, now quoted)", async () => {
  const [value] = await permissionsPolicy()
  assert.match(value, /payment=\(self "https:\/\/\*\.paypal\.com"\)/)
})

test("unrelated permissions stay denied", async () => {
  const [value] = await permissionsPolicy()
  for (const denied of ["camera", "microphone", "geolocation", "usb", "midi", "magnetometer", "gyroscope", "accelerometer"]) {
    assert.match(value, new RegExp(`(^|, )${denied}=\\(\\)(,|$)`), `${denied} remains ()`)
  }
})
