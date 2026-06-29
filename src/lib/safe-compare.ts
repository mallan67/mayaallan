import { createHash, timingSafeEqual } from "crypto"

/**
 * Constant-time string equality for secret comparison (shared-secret bearer
 * tokens, webhook secrets, etc.).
 *
 * Why not `a === b`:
 *   JS string `===` short-circuits on the first differing byte, so the
 *   comparison time leaks how many leading characters matched. Against an
 *   endpoint an attacker can call repeatedly, that timing signal can be used
 *   to recover a secret byte-by-byte.
 *
 * Why hash-then-compare:
 *   `crypto.timingSafeEqual` throws if the two buffers differ in length, and
 *   that length check itself leaks the secret's length. Hashing both inputs
 *   to a fixed-width SHA-256 digest first sidesteps both problems: the
 *   buffers are always 32 bytes, and the digest comparison is constant-time.
 *   A mismatch in length now simply yields different digests.
 */
export function safeCompare(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest()
  const bh = createHash("sha256").update(b).digest()
  return timingSafeEqual(ah, bh)
}
