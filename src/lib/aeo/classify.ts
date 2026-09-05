// =============================================================================
// AEO response classifier (issue #44).
// =============================================================================
// Separates three things the old detector collapsed into one "citation":
//
//   brand_mention    — the author's name or a book title appears in the text.
//                      A model can do this from training data with no source.
//   domain_reference — the site's domain appears as plain text, not as a link.
//   source_citation  — a URL under the site appears in the text, or in the
//                      engine's structured citations. This is the only one of
//                      the three that means the engine pointed at the site as
//                      a source.
//
// Search capability is a property of the engine, not the response; the
// runner records it alongside the classification.
//
// This module has no imports so it can be unit-tested directly under Node's
// test runner (type stripping) without path-alias resolution. `detect.ts`
// binds it to the site's identity constants.
// =============================================================================

export interface ClassifyConfig {
  authorName: string
  /** Full title first, then accepted shortened forms. */
  bookTitles: string[]
  /** Bare host without "www." (e.g. "mayaallan.com"). */
  siteHost: string
  /**
   * Origin every same-site citation is rewritten to (e.g.
   * "https://www.mayaallan.com"), so https/http, www/apex, trailing-slash and
   * fragment variants of one page count as one page. Defaults to
   * "https://www." + siteHost.
   */
  canonicalOrigin?: string
}

export interface ClassifyInput {
  content: string
  /** URLs the engine returned as citations separately from the text (Perplexity). */
  structuredCitations?: string[]
}

export interface Classification {
  brand_mention: boolean
  domain_reference: boolean
  source_citation: boolean
  /** Canonical same-site URLs (one origin, no trailing slash, no fragment), de-duplicated. */
  cited_urls: string[]
  /** Fine-grained flags: author_name, book_title, domain, page_url, structured_citation. */
  mention_types: string[]
  /** ~500-char window around the first thing found, or null when nothing was. */
  excerpt: string | null
}

const URL_RE = /https?:\/\/(?:www\.)?[a-z0-9.-]+(?:\/[^\s"'<>)\]]*)?/gi

export function classifyResponse(input: ClassifyInput, cfg: ClassifyConfig): Classification {
  const content = input.content ?? ""
  const lowered = content.toLowerCase()
  const siteHost = cfg.siteHost.toLowerCase().replace(/^www\./, "")
  const origin = (cfg.canonicalOrigin ?? `https://www.${siteHost}`).replace(/\/+$/, "")
  const types = new Set<string>()
  const urls: string[] = []
  const addUrl = (u: string) => {
    const canonical = canonicalizeSiteUrl(u, origin)
    if (canonical && !urls.includes(canonical)) urls.push(canonical)
  }

  // Source citations from the text.
  let firstUrlIdx = -1
  for (const m of content.matchAll(URL_RE)) {
    if (hostOf(m[0]) === siteHost) {
      types.add("page_url")
      addUrl(m[0])
      if (firstUrlIdx < 0) firstUrlIdx = m.index ?? -1
    }
  }
  // Source citations from structured citation metadata.
  for (const c of input.structuredCitations ?? []) {
    if (hostOf(c) === siteHost) {
      types.add("structured_citation")
      addUrl(c)
    }
  }

  // Domain reference: the bare host in the text once URLs are removed.
  const textWithoutUrls = lowered.replace(URL_RE, " ")
  if (textWithoutUrls.includes(siteHost)) types.add("domain")

  // Brand mention: author name (word-bounded, case-insensitive) or a book title.
  const authorRe = new RegExp(`\\b${escapeRegex(cfg.authorName)}\\b`, "i")
  const authorMatch = authorRe.exec(content)
  if (authorMatch) types.add("author_name")
  let firstTitleIdx = -1
  for (const t of cfg.bookTitles) {
    const i = lowered.indexOf(t.toLowerCase())
    if (i >= 0) {
      types.add("book_title")
      if (firstTitleIdx < 0 || i < firstTitleIdx) firstTitleIdx = i
    }
  }

  const brand_mention = types.has("author_name") || types.has("book_title")
  const domain_reference = types.has("domain")
  const source_citation = types.has("page_url") || types.has("structured_citation")

  // Excerpt around the earliest thing found in the text.
  const candidates = [
    authorMatch ? authorMatch.index : -1,
    firstTitleIdx,
    firstUrlIdx,
    types.has("domain") ? lowered.indexOf(siteHost) : -1,
  ].filter((i) => i >= 0)
  let excerpt: string | null = null
  if (candidates.length > 0) {
    const at = Math.min(...candidates)
    const start = Math.max(0, at - 150)
    const end = Math.min(content.length, at + 350)
    excerpt = (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "")
  } else if (source_citation && content) {
    // Only the structured citations pointed at the site; show what was said.
    excerpt = content.slice(0, 350) + (content.length > 350 ? "…" : "")
  }

  return {
    brand_mention,
    domain_reference,
    source_citation,
    cited_urls: urls,
    mention_types: Array.from(types),
    excerpt,
  }
}

/**
 * Rewrite a same-site URL to one canonical form: the configured origin, the
 * path without a trailing slash (root stays "/"), the query string kept,
 * the fragment dropped, trailing punctuation from prose stripped.
 */
export function canonicalizeSiteUrl(raw: string, origin: string): string | null {
  const cleaned = raw.replace(/[).,;\]]+$/, "")
  let u: URL
  try {
    u = new URL(cleaned)
  } catch {
    return null
  }
  const path = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, "") : "/"
  return `${origin}${path}${u.search}`
}

function hostOf(u: string): string | null {
  try {
    return new URL(u).host.toLowerCase().replace(/^www\./, "")
  } catch {
    return null
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
