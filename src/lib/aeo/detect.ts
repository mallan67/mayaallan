import { AUTHOR_NAME, SITE_URL } from "@/lib/identity"
import { classifyResponse, type Classification, type ClassifyConfig, type ClassifyInput } from "@/lib/aeo/classify"

// =============================================================================
// AEO response classification, bound to this site's identity (issue #44).
// =============================================================================
// The classifier itself lives in classify.ts and is dependency-free so it can
// be unit-tested. This module supplies the author name, book titles and host.
//
// What comes back keeps three things apart that the previous detector merged
// into a single "citation":
//   brand_mention    — author or book named in the text (no source implied)
//   domain_reference — the domain as plain text (no link)
//   source_citation  — a URL under the site, in text or structured citations
// =============================================================================

const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, "")

export const CLASSIFY_CONFIG: ClassifyConfig = {
  authorName: AUTHOR_NAME,
  bookTitles: ["Psilocybin Integration Guide", "Psilocybin Integration"],
  siteHost: SITE_HOST,
}

export function classifyEngineResponse(input: ClassifyInput): Classification {
  return classifyResponse(input, CLASSIFY_CONFIG)
}

export type { Classification, ClassifyInput } from "@/lib/aeo/classify"
