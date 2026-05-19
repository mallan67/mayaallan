import { AUTHOR_NAME, SITE_URL } from "@/lib/identity"

// =============================================================================
// AEO citation detector.
// =============================================================================
// Inspects an AI engine response for mentions of:
//   - The site domain (mayaallan.com)
//   - The author name (Maya Allan)
//   - The book title (Psilocybin Integration Guide)
//   - Any specific page URL under the site
//
// Returns a structured result usable for trend charting + dashboard display.
// =============================================================================

const BOOK_TITLE = "Psilocybin Integration Guide"
const BOOK_TITLE_ALT = "Psilocybin Integration"

const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, "")

export interface DetectionResult {
  wasCited: boolean
  mentionTypes: string[]
  citedUrls: string[]
  excerpt: string | null
}

export function detectCitation(response: string): DetectionResult {
  if (!response) {
    return { wasCited: false, mentionTypes: [], citedUrls: [], excerpt: null }
  }

  const lowered = response.toLowerCase()
  const mentionTypes: Set<string> = new Set()
  const citedUrls: Set<string> = new Set()

  // Domain mention (covers both http(s) URLs and bare-domain mentions)
  if (lowered.includes(SITE_HOST)) {
    mentionTypes.add("domain")
  }

  // Author name mention (case-insensitive). Use word boundaries to avoid
  // false positives ("mayan", "allan-something"). Hyphens count as boundaries.
  const authorRegex = new RegExp(`\\b${escapeRegex(AUTHOR_NAME)}\\b`, "i")
  if (authorRegex.test(response)) {
    mentionTypes.add("author_name")
  }

  // Book title — exact and shortened variants
  if (response.includes(BOOK_TITLE) || lowered.includes(BOOK_TITLE.toLowerCase())) {
    mentionTypes.add("book_title")
  } else if (lowered.includes(BOOK_TITLE_ALT.toLowerCase())) {
    // Looser match — book name in lowercase form
    mentionTypes.add("book_title")
  }

  // Specific URLs — pull every URL that points to our domain.
  // This is the highest-signal citation type: AI engines listed our page as
  // a source for the answer.
  const urlRegex = /https?:\/\/(?:www\.)?[a-z0-9.-]+(?:\/[^\s"'<>)]*)?/gi
  const urls = response.match(urlRegex) ?? []
  for (const u of urls) {
    try {
      const host = new URL(u).host.replace(/^www\./, "")
      if (host === SITE_HOST) {
        mentionTypes.add("page_url")
        // Normalize trailing punctuation and store
        citedUrls.add(u.replace(/[).,;]+$/, ""))
      }
    } catch {
      // ignore malformed URLs
    }
  }

  const wasCited = mentionTypes.size > 0

  // Excerpt: a ~500-char window around the first mention so the dashboard can
  // show what the engine actually said.
  let excerpt: string | null = null
  if (wasCited) {
    const firstMatchIdx = findFirstMentionIndex(response, lowered)
    if (firstMatchIdx >= 0) {
      const start = Math.max(0, firstMatchIdx - 150)
      const end = Math.min(response.length, firstMatchIdx + 350)
      excerpt = (start > 0 ? "…" : "") + response.slice(start, end) + (end < response.length ? "…" : "")
    }
  }

  return {
    wasCited,
    mentionTypes: Array.from(mentionTypes),
    citedUrls: Array.from(citedUrls),
    excerpt,
  }
}

function findFirstMentionIndex(response: string, lowered: string): number {
  const candidates = [
    lowered.indexOf(SITE_HOST),
    lowered.indexOf(AUTHOR_NAME.toLowerCase()),
    lowered.indexOf(BOOK_TITLE.toLowerCase()),
    lowered.indexOf(BOOK_TITLE_ALT.toLowerCase()),
  ].filter((i) => i >= 0)
  if (candidates.length === 0) return -1
  return Math.min(...candidates)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
