import { NextResponse } from "next/server"

// =============================================================================
// /.well-known/security.txt — RFC 9116 security disclosure standard.
// =============================================================================
// Tells security researchers + automated scanners how to responsibly disclose
// vulnerabilities. Mostly a trust signal: scanners that check for security.txt
// rate sites that have one slightly higher, and some search engines weight
// "well-known" presence as a small positive quality signal.
//
// Spec: https://www.rfc-editor.org/rfc/rfc9116
//
// The Expires field is required by RFC 9116. We set it to ~1 year out; bump
// the constant below when you refresh the file (or wire to a build-time
// computed value).
// =============================================================================

// Update this whenever you refresh the file (max 1 year per spec).
const EXPIRES_ISO = "2027-05-18T00:00:00.000Z"

export async function GET() {
  const body = [
    "# Security disclosure for mayaallan.com",
    "# https://www.rfc-editor.org/rfc/rfc9116",
    "",
    "Contact: mailto:security@mayaallan.com",
    "Contact: https://www.mayaallan.com/contact",
    `Expires: ${EXPIRES_ISO}`,
    "Preferred-Languages: en",
    "Canonical: https://www.mayaallan.com/.well-known/security.txt",
    "",
    "# We appreciate responsible disclosure. Please give us reasonable time to",
    "# address any reported issues before public disclosure.",
    "",
  ].join("\n")

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
