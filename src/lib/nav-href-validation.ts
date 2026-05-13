/**
 * Validation for admin-supplied navigation hrefs.
 *
 * Navigation items are rendered into public <Link href={...}> elements
 * site-wide. Without validation, an attacker (or even an admin who
 * pastes a marketing tracking URL by accident) could put external or
 * unsafe values in the table and have every page link to them.
 *
 * Allowed:
 *   /
 *   /books
 *   /books/psilocybin-integration-guide
 *   /legal#privacy
 *   /belief-inquiry?source=nav
 *
 * Rejected:
 *   https://evil.com           (external URL)
 *   http://evil.com            (external URL, plain http)
 *   //evil.com                 (protocol-relative — browser fills in scheme)
 *   javascript:alert(1)        (script execution on click)
 *   data:text/html,...         (inline document)
 *   <anything with ASCII control chars>
 *
 * Returns either { ok: true; href } where href is the normalized value,
 * or { ok: false; error } with a generic 400-safe message.
 */
export function validateNavHref(input: unknown): { ok: true; href: string } | { ok: false; error: string } {
  if (typeof input !== "string") {
    return { ok: false, error: "href must be a string" }
  }

  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: "href is required" }
  }

  if (trimmed.length > 512) {
    return { ok: false, error: "href is too long" }
  }

  // Reject ASCII control characters (0x00-0x1F + 0x7F). Includes
  // newlines, tabs, NULs — anything you wouldn't expect in a URL path.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return { ok: false, error: "href contains invalid characters" }
  }

  // Reject protocol-relative URLs FIRST — they look like a path that
  // starts with `/` but the browser substitutes the page's scheme and
  // sends the user off-site.
  if (trimmed.startsWith("//")) {
    return { ok: false, error: "href must be an internal path" }
  }

  // Reject anything that contains a scheme. We match `<scheme>:` where
  // scheme is ASCII letters/digits/+/-/. per RFC 3986.
  if (/^[a-z][a-z0-9+\-.]*:/i.test(trimmed)) {
    return { ok: false, error: "href must be an internal path" }
  }

  // After the above filters, the value MUST start with `/` to be a
  // valid in-app path.
  if (!trimmed.startsWith("/")) {
    return { ok: false, error: "href must be an internal path" }
  }

  return { ok: true, href: trimmed }
}

/**
 * Validate the rest of the navigation item payload alongside href.
 *
 *   label   1-64 chars after trim
 *   order   finite safe integer (Number.isInteger), -10_000 .. 10_000
 *   visible boolean (defaults to true)
 */
export function validateNavItemPayload(input: {
  label?: unknown
  href?: unknown
  order?: unknown
  isVisible?: unknown
}): { ok: true; value: { label: string; href: string; order: number; isVisible: boolean } } | { ok: false; error: string } {
  const hrefResult = validateNavHref(input.href)
  if (!hrefResult.ok) return hrefResult

  if (typeof input.label !== "string") {
    return { ok: false, error: "label must be a string" }
  }
  const label = input.label.trim()
  if (label.length === 0) {
    return { ok: false, error: "label is required" }
  }
  if (label.length > 64) {
    return { ok: false, error: "label is too long" }
  }

  // order may be missing (defaults to 999) or a finite integer
  let order = 999
  if (input.order !== undefined && input.order !== null) {
    if (typeof input.order !== "number" || !Number.isInteger(input.order)) {
      return { ok: false, error: "order must be an integer" }
    }
    if (input.order < -10_000 || input.order > 10_000) {
      return { ok: false, error: "order is out of range" }
    }
    order = input.order
  }

  const isVisible = input.isVisible === undefined ? true : Boolean(input.isVisible)

  return { ok: true, value: { label, href: hrefResult.href, order, isVisible } }
}
