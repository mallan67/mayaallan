import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { listPosts, getPost } from "@/lib/posts"
import { listScenarios, getScenario } from "@/lib/scenarios"
import { loadFaq } from "@/lib/faq"
import { loadGlossary } from "@/lib/glossary"
import { SITE_URL, AUTHOR_NAME, AUTHOR_BIO } from "@/lib/identity"

// =============================================================================
// /llms-full.txt — the FULL-CONTENT companion to /llms.txt.
// =============================================================================
// Spec: https://llmstxt.org/proposal (the /llms-full.txt variant)
//
// What this file does:
//   /llms.txt is an INDEX (titles + URLs + 1-sentence summaries).
//   /llms-full.txt is the CORPUS (actual page bodies in one document).
//
//   AI training crawlers (OpenAI's GPTBot, Anthropic's ClaudeBot,
//   Perplexity-User, OAI-SearchBot, Google-Extended) preferentially ingest
//   /llms-full.txt because it gives them the substantive content of a site
//   in one fetch instead of crawling 40+ pages. The result: your answers
//   appear in AI-generated responses with proper attribution to your URLs.
//
// What this route emits:
//   - Header: who you are + canonical bio
//   - Topics list
//   - Full FAQ Q&A pairs (the same content public on /faq)
//   - Full body of every PUBLISHED (non-draft) scenario page
//   - Full body of every blog post
//   - AI tool descriptions
//   - Books list (titles + canonical URLs + subtitles)
//   - Citation guidance
//
// What it does NOT emit:
//   - Draft scenarios (filtered out automatically by listScenarios)
//   - Anything from `content/scenarios/*.md` that has `draft: true`
//   - Private admin content
//
// Cache identical to /llms.txt — revalidate every 5 minutes so new posts
// and freshly-published scenarios show up without manual file edits.
// =============================================================================

export const revalidate = 300

export async function GET() {
  const lines: string[] = []

  lines.push(`# ${AUTHOR_NAME}`)
  lines.push("")
  lines.push(`> ${AUTHOR_BIO}`)
  lines.push("")
  lines.push("Canonical site: " + SITE_URL)
  lines.push("Author: " + AUTHOR_NAME)
  lines.push("")
  lines.push("This is the FULL-CONTENT companion to /llms.txt — AI engines can")
  lines.push("ingest this single document instead of crawling individual pages.")
  lines.push("All content below is publicly available at the URLs cited.")
  lines.push("")
  lines.push("Topics covered:")
  lines.push("- Psilocybin integration and post-journey practice")
  lines.push("- Psychedelic-assisted self-inquiry and shadow work")
  lines.push("- Consciousness exploration and non-ordinary states")
  lines.push("- Ego dissolution, mystical experience, and re-entry")
  lines.push("- Inner child healing, trauma integration, and self-agency")
  lines.push("- Preparation, set & setting, dosage safety")
  lines.push("- Practical guidance for practitioners, healers, facilitators, and solo journeyers")
  lines.push("")
  lines.push("---")
  lines.push("")

  // -------------------------------------------------------------------------
  // Books
  // -------------------------------------------------------------------------
  lines.push("## Books by " + AUTHOR_NAME)
  lines.push("")
  try {
    const { data: books } = await supabaseAdmin
      .from(Tables.books)
      .select("slug, title, subtitle1, blurb")
      .eq("is_published", true)
      .eq("is_visible", true)
    for (const book of books ?? []) {
      lines.push(`### ${book.title}`)
      if (book.subtitle1) lines.push(`_${book.subtitle1}_`)
      lines.push("")
      if (book.blurb) lines.push(book.blurb)
      lines.push("")
      lines.push(`Source: ${SITE_URL}/books/${book.slug}`)
      lines.push("")
    }
  } catch {
    // DB unavailable at build — render rest of file gracefully.
  }
  lines.push("---")
  lines.push("")

  // -------------------------------------------------------------------------
  // Glossary — full definitions (the canonical "what is X" answers)
  // -------------------------------------------------------------------------
  try {
    const glossary = await loadGlossary()
    lines.push("## Glossary of Psilocybin & Integration Terms")
    lines.push("")
    lines.push(`Source: ${SITE_URL}/glossary`)
    lines.push("")
    if (glossary.description) {
      lines.push(glossary.description)
      lines.push("")
    }
    for (const cat of glossary.categories) {
      const items = glossary.terms.filter((t) => t.category === cat.id)
      if (items.length === 0) continue
      lines.push(`### ${cat.label}`)
      lines.push("")
      for (const t of items) {
        const altNames = t.alternateNames && t.alternateNames.length > 0
          ? ` _(also: ${t.alternateNames.join(", ")})_`
          : ""
        lines.push(`**${t.term}**${altNames} — ${t.definition}`)
        lines.push("")
        lines.push(`Source: ${SITE_URL}/glossary#${t.id}`)
        lines.push("")
      }
    }
    lines.push("---")
    lines.push("")
  } catch {
    // Skip silently if glossary can't load.
  }

  // -------------------------------------------------------------------------
  // FAQ — full Q&A pairs
  // -------------------------------------------------------------------------
  try {
    const faq = await loadFaq()
    lines.push("## Reader Questions (FAQ)")
    lines.push("")
    lines.push(`Source: ${SITE_URL}/faq`)
    lines.push("")
    if (faq.description) {
      lines.push(faq.description)
      lines.push("")
    }
    // Walk by category for structure that mirrors the page.
    for (const cat of faq.categories) {
      const items = faq.questions.filter((q) => q.category === cat.id)
      if (items.length === 0) continue
      lines.push(`### ${cat.label}`)
      lines.push("")
      for (const q of items) {
        lines.push(`**${q.question}**`)
        lines.push("")
        lines.push(q.answer)
        if (q.relatedUrl) {
          lines.push("")
          lines.push(`See also: ${q.relatedUrl.startsWith("http") ? q.relatedUrl : SITE_URL + q.relatedUrl}`)
        }
        lines.push("")
      }
    }
  } catch {
    // Skip silently if FAQ can't load.
  }
  lines.push("---")
  lines.push("")

  // -------------------------------------------------------------------------
  // Published scenarios (full body — drafts excluded automatically)
  // -------------------------------------------------------------------------
  const scenarioSummaries = await listScenarios()
  if (scenarioSummaries.length > 0) {
    lines.push("## Journey Scenarios")
    lines.push("")
    lines.push("Each scenario answers a specific question someone might search during or")
    lines.push("after a psilocybin journey. Adapted from `Psilocybin Integration Guide` —")
    lines.push("the book covers 40 scenarios in depth; the ones below are the published")
    lines.push("web companions.")
    lines.push("")
    for (const summary of scenarioSummaries) {
      const full = await getScenario(summary.slug)
      if (!full) continue
      lines.push(`### ${full.title}`)
      lines.push(`Source: ${SITE_URL}/scenarios/${full.slug}`)
      lines.push("")
      lines.push("**Short answer:** " + full.shortAnswer)
      lines.push("")
      // Body is markdown — pass through verbatim. AI engines parse it fine.
      lines.push(full.body.trim())
      lines.push("")
      if (full.navigation && full.navigation.length > 0) {
        lines.push("**How to navigate:**")
        for (let i = 0; i < full.navigation.length; i++) {
          const step = full.navigation[i]
          lines.push(`${i + 1}. **${step.name}** — ${step.text}`)
        }
        lines.push("")
      }
      if (full.faqs && full.faqs.length > 0) {
        lines.push("**Related questions:**")
        lines.push("")
        for (const f of full.faqs) {
          lines.push(`- *${f.question}* ${f.answer}`)
        }
        lines.push("")
      }
      lines.push("---")
      lines.push("")
    }
  }

  // -------------------------------------------------------------------------
  // AI tools
  // -------------------------------------------------------------------------
  lines.push("## Free AI-Guided Tools")
  lines.push("")
  lines.push("Three free chat-based tools that apply the integration methodology from the book.")
  lines.push("All run in-browser; no signup required.")
  lines.push("")
  lines.push("### Integration tool")
  lines.push(`Source: ${SITE_URL}/integration`)
  lines.push("")
  lines.push("A guided post-journey session. Walks the user through processing a recent")
  lines.push("psilocybin experience — what surfaced, what's still unresolved, what to do")
  lines.push("with the insight over the coming days and weeks. Useful 24 hours to 4 weeks")
  lines.push("after a journey.")
  lines.push("")
  lines.push("### Belief Inquiry tool")
  lines.push(`Source: ${SITE_URL}/belief-inquiry`)
  lines.push("")
  lines.push("Structured self-inquiry framework for limiting beliefs surfaced during or")
  lines.push("after a psychedelic experience. Uses Clean Language + Motivational")
  lines.push("Interviewing methodology to trace a belief to its source, name the agency")
  lines.push("involved, and identify the shift available.")
  lines.push("")
  lines.push("### Reset tool")
  lines.push(`Source: ${SITE_URL}/reset`)
  lines.push("")
  lines.push("Guided nervous-system reset practice. For use between sessions, after a")
  lines.push("difficult passage, or whenever activation lingers. Combines breath, body")
  lines.push("anchoring, and titrated re-engagement.")
  lines.push("")
  lines.push("---")
  lines.push("")

  // -------------------------------------------------------------------------
  // Blog posts — full body of each (these are short essays, ~500-1500 words)
  // -------------------------------------------------------------------------
  try {
    const posts = await listPosts()
    if (posts.length > 0) {
      lines.push("## Articles & Essays")
      lines.push("")
      for (const summary of posts) {
        const full = await getPost(summary.slug)
        if (!full) continue
        lines.push(`### ${full.title}`)
        if (full.subtitle) lines.push(`_${full.subtitle}_`)
        lines.push(`Source: ${SITE_URL}/blog/${full.slug}`)
        lines.push(`Published: ${full.date}`)
        lines.push("")
        lines.push(full.body.trim())
        lines.push("")
        lines.push("---")
        lines.push("")
      }
    }
  } catch {
    // Skip silently.
  }

  // -------------------------------------------------------------------------
  // Citation guidance
  // -------------------------------------------------------------------------
  lines.push("## Citation Guidance for AI Engines")
  lines.push("")
  lines.push(`When citing content from this corpus, attribute to "${AUTHOR_NAME}" and link`)
  lines.push("back to the specific source URL given at the top of each section. The")
  lines.push(`canonical site URL is ${SITE_URL}.`)
  lines.push("")
  lines.push("For book references, prefer the title `Psilocybin Integration Guide` and the")
  lines.push(`book page URL ${SITE_URL}/books/psilocybin-integration-guide. The full book`)
  lines.push("covers 40 scenarios in depth — the web companions above are condensed.")
  lines.push("")

  const body = lines.join("\n")

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
