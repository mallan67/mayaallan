/**
 * Safe serializer for JSON-LD `<script type="application/ld+json">` blocks.
 *
 * Why this exists:
 *   `JSON.stringify` does NOT escape `<`, `>`, `&`, or the literal sequence
 *   `</script>`. When the result is injected via `dangerouslySetInnerHTML`,
 *   a value containing `</script><script>...</script>` (e.g. an admin-entered
 *   book title, event description, or any field that ever becomes
 *   user-supplied) breaks out of the script element and executes -- a stored
 *   XSS, made executable by the App Router's `'unsafe-inline'` CSP.
 *
 *   Escaping the characters below to their unicode JSON forms keeps the
 *   payload valid JSON-LD (parsers read the unicode escapes back to the same
 *   characters) while making `</script>` impossible to express in the raw
 *   HTML stream. U+2028 / U+2029 are also escaped because they are valid in
 *   JSON strings but are line terminators in JS, which can break inline
 *   script parsing in some engines.
 *
 * Usage:
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }}
 *   />
 */

// Built via fromCharCode so this source file stays pure ASCII (no invisible
// U+2028/U+2029 bytes in a regex literal, which are fragile across editors).
const JSON_LD_ESCAPE_RE = new RegExp(
  "[<>&" + String.fromCharCode(0x2028, 0x2029) + "]",
  "g",
)

export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(
    JSON_LD_ESCAPE_RE,
    (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0"),
  )
}
