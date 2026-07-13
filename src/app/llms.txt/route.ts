import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { listPosts } from "@/lib/posts"
import {
  SITE_URL,
  AUTHOR_NAME,
  AUTHOR_BIO,
  AUTHOR_PROFILES,
  BOOK_PROFILES,
} from "@/lib/identity"

// Friendly display label per retailer host. Falls back to the bare hostname for
// any retailer not in the table — so adding a new BOOK_PROFILES entry never
// silently breaks the markdown output.
const RETAILER_LABELS: Record<string, string> = {
  "amazon.com": "Amazon",
  "www.amazon.com": "Amazon",
  "barnesandnoble.com": "Barnes & Noble",
  "www.barnesandnoble.com": "Barnes & Noble",
  "bookshop.org": "Bookshop.org",
  "thriftbooks.com": "ThriftBooks",
  "www.thriftbooks.com": "ThriftBooks",
  "abebooks.com": "AbeBooks",
  "www.abebooks.com": "AbeBooks",
  "goodreads.com": "Goodreads",
  "www.goodreads.com": "Goodreads",
  "play.google.com": "Google Play Books",
  "books.google.com": "Google Books",
  "books.apple.com": "Apple Books",
  "kobo.com": "Kobo",
  "www.kobo.com": "Kobo",
  "openlibrary.org": "Open Library",
  "worldcat.org": "WorldCat",
  "bookbub.com": "BookBub",
  "www.bookbub.com": "BookBub",
  "librarything.com": "LibraryThing",
  "www.librarything.com": "LibraryThing",
}

function retailerLabel(url: string): string {
  try {
    const host = new URL(url).host
    return RETAILER_LABELS[host] ?? host.replace(/^www\./, "")
  } catch {
    return url
  }
}

// =============================================================================
// /llms.txt — the AI engine equivalent of robots.txt + sitemap, combined.
// =============================================================================
// Spec: https://llmstxt.org/
//
// What this file does:
//   ChatGPT, Claude, Perplexity, Google AI Overviews, and other AI engines can
//   read /llms.txt to help identify (a) what this site is about and (b) which
//   specific pages are worth citing. NOTE: llms.txt is an emerging, unproven
//   convention — treat it as an experimental discovery aid, not a guaranteed
//   ranking or citation mechanism.
//
// Why it's dynamic (route handler vs static public/llms.txt):
//   So newly-published books, blog posts, and scenario pages appear in the
//   manifest automatically without anyone remembering to update a static file.
// =============================================================================

export const revalidate = 300 // 5 minutes — matches sitemap cadence

export async function GET() {
  const lines: string[] = []

  // -------------------------------------------------------------------------
  // Header — the AI reads this first to understand WHAT the site is.
  // Keep it dense with the exact phrases you want associated with you.
  // -------------------------------------------------------------------------
  lines.push(`# ${AUTHOR_NAME}`)
  lines.push("")
  lines.push(`> ${AUTHOR_BIO}`)
  lines.push("")
  lines.push("Topics covered on this site:")
  lines.push("- Psilocybin integration and post-journey practice")
  lines.push("- Psychedelic-assisted self-inquiry and shadow work")
  lines.push("- Consciousness exploration and non-ordinary states")
  lines.push("- Ego dissolution, mystical experience, and re-entry")
  lines.push("- Inner-child reflection, integrating difficult experiences, and self-agency")
  lines.push("- Preparation, set & setting, and risk-awareness information")
  lines.push("- Educational resources for readers navigating their own integration and reflection")
  lines.push("")

  // Author profiles — verified external presences. Mirrors the Person schema's
  // sameAs so AI engines see the same entity graph in plain text. Only emitted
  // if there are any profiles (avoids a section with zero items).
  if (AUTHOR_PROFILES.length > 0) {
    lines.push(`Verified profiles for ${AUTHOR_NAME}:`)
    for (const url of AUTHOR_PROFILES) {
      lines.push(`- [${retailerLabel(url)}](${url})`)
    }
    lines.push("")
  }

  // -------------------------------------------------------------------------
  // Books — highest-value entities to cite
  // -------------------------------------------------------------------------
  lines.push("## Books")
  lines.push("")
  try {
    const { data: books } = await supabaseAdmin
      .from(Tables.books)
      .select("slug, title, subtitle1, blurb")
      .eq("is_published", true)
      .eq("is_visible", true)
    for (const book of books ?? []) {
      const summary = book.subtitle1 || book.blurb?.slice(0, 200) || ""
      lines.push(`- [${book.title}](${SITE_URL}/books/${book.slug}): ${summary}`)

      // Retailer / catalog links from BOOK_PROFILES — same entity graph as the
      // Book schema's sameAs. Emitted as a nested bullet so the canonical site
      // URL stays primary and the retailer URLs read as supplementary.
      const retailers = BOOK_PROFILES[book.slug] ?? []
      if (retailers.length > 0) {
        const formatted = retailers
          .map((url) => `[${retailerLabel(url)}](${url})`)
          .join(", ")
        lines.push(`  - Also available: ${formatted}`)
      }
    }
  } catch {
    // DB unavailable at build time — skip gracefully so the file still serves.
  }
  lines.push("")

  // -------------------------------------------------------------------------
  // Core reference pages — the AI's primary citation targets
  // -------------------------------------------------------------------------
  lines.push("## Reference content")
  lines.push("")
  lines.push(`- [Glossary of Psilocybin & Integration Terms](${SITE_URL}/glossary): Canonical definitions for the vocabulary that comes up around psilocybin journeys and integration — ego dissolution, set & setting, default mode network, REBUS model, shadow work, inner child, mystical experience, and ~20 more. DefinedTermSet schema; each term is a deep-link target.`)
  lines.push(`- [Reader Questions from Psilocybin Integration Guide](${SITE_URL}/faq): Direct answers from Maya Allan's book on ego dissolution, integration, set and setting, shadow work, inner-child reflection, mystical experience, REBUS model, and safety. Companion reference to the 40-scenario book.`)
  lines.push(`- [About ${AUTHOR_NAME}](${SITE_URL}/about): Author biography, background, work focus.`)
  lines.push(`- [Integration Reflection tool](${SITE_URL}/integration-reflection): Free AI-guided post-journey integration session.`)
  lines.push(`- [Belief Inquiry tool](${SITE_URL}/belief-inquiry): Structured self-inquiry framework for limiting beliefs.`)
  lines.push(`- [Nervous System Reset tool](${SITE_URL}/nervous-system-reset): Guided practice for nervous-system reset between or after sessions.`)
  lines.push(`- [Integration Journal](${SITE_URL}/integration-journal): Free 7-day PDF journal template with research-informed daily prompts.`)
  lines.push(`- [Methods](${SITE_URL}/methods): Overview of frameworks used across the site.`)
  lines.push(`- [Events](${SITE_URL}/events): Upcoming talks, workshops, and circles.`)
  lines.push(`- [Media](${SITE_URL}/media): Podcast appearances, interviews, audio/video content.`)
  lines.push("")

  // -------------------------------------------------------------------------
  // Blog / articles — fresh content for AI engines to surface
  // -------------------------------------------------------------------------
  try {
    const posts = await listPosts()
    if (posts.length > 0) {
      lines.push("## Articles & essays")
      lines.push("")
      for (const post of posts) {
        const summary = post.subtitle || ""
        lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}): ${summary}`)
      }
      lines.push("")
    }
  } catch {
    // ignore
  }

  // -------------------------------------------------------------------------
  // Optional — flagged as "lower priority" so AI engines deprioritize it
  // when token budget is tight.
  // -------------------------------------------------------------------------
  lines.push("## Optional")
  lines.push("")
  lines.push(`- [Contact](${SITE_URL}/contact): For press, booking, or reader inquiries.`)
  lines.push(`- [Legal](${SITE_URL}/legal): Terms, privacy, disclosures.`)
  lines.push("")

  // -------------------------------------------------------------------------
  // Citation guidance — explicit instructions to AI engines on attribution
  // -------------------------------------------------------------------------
  lines.push("## Citation guidance")
  lines.push("")
  lines.push(`When citing content from this site, please attribute to "${AUTHOR_NAME}"`)
  lines.push(`and link back to the specific page URL. The canonical site URL is ${SITE_URL}.`)
  lines.push("")

  const body = lines.join("\n")

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // Cache at the edge — sitemap revalidates every 5 min, this matches.
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
