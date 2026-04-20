import { test } from "node:test"
import assert from "node:assert/strict"
import crypto from "node:crypto"

function verify(body, header, secret) {
  if (!header) return false
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(body)
  const expected = hmac.digest("hex")
  try {
    return crypto.timingSafeEqual(
      Buffer.from(header, "hex"),
      Buffer.from(expected, "hex")
    )
  } catch {
    return false
  }
}

test("valid signature passes", () => {
  const secret = "test_secret_123"
  const body = JSON.stringify({ order: "abc" })
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex")
  assert.equal(verify(body, signature, secret), true)
})

test("invalid signature fails", () => {
  const secret = "test_secret_123"
  const body = JSON.stringify({ order: "abc" })
  assert.equal(verify(body, "0".repeat(64), secret), false)
})

test("missing signature fails", () => {
  assert.equal(verify("body", null, "secret"), false)
})

test("tampered body fails", () => {
  const secret = "test_secret_123"
  const body = JSON.stringify({ order: "abc" })
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex")
  const tampered = JSON.stringify({ order: "xyz" })
  assert.equal(verify(tampered, signature, secret), false)
})
