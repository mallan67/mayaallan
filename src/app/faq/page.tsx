import Link from "next/link"
import { jsonLdScript } from "@/lib/json-ld"
import type { Metadata } from "next"
import { loadFaq, groupByCategory } from "@/lib/faq"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateSpeakableWebPageSchema,
} from "@/lib/structured-data"

// =============================================================================
// /faq — short, AI-citation-optimized answers to high-intent reader queries.
// =============================================================================
// Built specifically as a citation magnet for AI search engines (ChatGPT,
// Claude, Perplexity, Gemini, Google AI Overviews). Each Q&A is structured
// to maximize the chance an engine extracts the answer verbatim:
//
//   - Each H2 is the exact user query
//   - The first 40-75 words of each answer carry the direct response
//     (research: 44.2% of LLM citations come from the first 30% of text)
//   - FAQPage schema lists every (question, answer) pair
//   - .speakable class on every answer for voice assistant extraction
//   - Anchor links per question so AI engines can deep-link a specific answer
//
// Add/edit questions in content/faq.json — this page picks them up
// automatically on next build (or on revalidate, every 5 min).
// =============================================================================

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const faq = await loadFaq()
  return {
    title: faq.title,
    description: faq.description,
    alternates: { canonical: `${SITE_URL}/faq` },
    openGraph: {
      title: faq.title,
      description: faq.description,
      url: `${SITE_URL}/faq`,
      siteName: AUTHOR_NAME,
      type: "website",
    },
  }
}

export default async function FaqPage() {
  const faq = await loadFaq()
  const groups = groupByCategory(faq)

  // FAQPage schema — the most heavily-extracted schema type by AI engines.
  const faqSchema = generateFAQSchema(
    faq.questions.map((q) => ({ question: q.question, answer: q.answer })),
    `${SITE_URL}/faq`
  )

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "FAQ", url: `${SITE_URL}/faq` },
  ])

  const speakableSchema = generateSpeakableWebPageSchema(
    `${SITE_URL}/faq`,
    faq.title,
    faq.description,
    [".faq-answer", "h1", "h2"]
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(speakableSchema) }} />

      {/* Breadcrumb — uses the shortTitle so the trail reads cleanly */}
      <nav className="text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/books/psilocybin-integration-guide" className="hover:text-slate-700">
          Psilocybin Integration Guide
        </Link>
        <span className="mx-2">/</span>
        <span>{faq.shortTitle ?? "FAQ"}</span>
      </nav>

      <header className="mb-10">
        {/* "From the book" eyebrow tag — links back to the book detail page */}
        <p className="text-xs uppercase tracking-wider font-semibold text-blue-700 mb-3">
          <Link href="/books/psilocybin-integration-guide" className="hover:underline">
            From Psilocybin Integration Guide
          </Link>
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-slate-900">
          {faq.shortTitle ?? faq.title}
        </h1>
        {faq.tagline && (
          <p className="mt-3 text-lg italic text-slate-500">{faq.tagline}</p>
        )}
        <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl">
          {faq.description}
        </p>
      </header>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* Sticky table of contents — visible on desktop, hidden on mobile */}
        <aside className="hidden md:block sticky top-24 self-start text-sm">
          <p className="font-semibold text-slate-900 mb-3">Jump to</p>
          <ul className="space-y-2 text-slate-600">
            {groups.map(({ category }) => (
              <li key={category.id}>
                <a href={`#${category.id}`} className="hover:text-slate-900">
                  {category.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Q&A sections */}
        <div className="min-w-0 space-y-12">
          {groups.map(({ category, items }) => {
            if (items.length === 0) return null
            return (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <h2 className="font-serif text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-200">
                  {category.label}
                </h2>

                <div className="space-y-8">
                  {items.map((q) => (
                    <article
                      key={q.id}
                      id={q.id}
                      className="scroll-mt-24"
                      // itemScope + itemProp annotations let some parsers pick
                      // up Q&A pairs even without reading the JSON-LD block.
                      itemScope
                      itemType="https://schema.org/Question"
                    >
                      <h3
                        className="font-serif text-lg md:text-xl font-semibold text-slate-900 mb-3 group"
                        itemProp="name"
                      >
                        <a
                          href={`#${q.id}`}
                          className="hover:text-slate-700 transition-colors"
                          aria-label={`Permalink: ${q.question}`}
                        >
                          {q.question}
                          <span className="ml-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity text-sm">#</span>
                        </a>
                      </h3>
                      <div
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                      >
                        <p
                          className="faq-answer text-base text-slate-700 leading-relaxed"
                          itemProp="text"
                        >
                          {q.answer}
                        </p>
                      </div>
                      {q.relatedUrl && (
                        <p className="mt-2 text-sm">
                          <Link href={q.relatedUrl} className="text-blue-700 hover:underline">
                            Read more →
                          </Link>
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Book CTA */}
      <aside className="mt-16 p-6 sm:p-8 rounded-2xl bg-amber-50/60 border border-amber-200/50">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
          The full method — 40 scenarios in depth
        </h2>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-5">
          These short answers are a starting point. <em>Psilocybin Integration Guide</em> walks
          through 40 real journey scenarios with description, cause, navigation, lesson, and
          example for each.
        </p>
        <Link
          href="/books/psilocybin-integration-guide"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-700 transition-colors"
        >
          See the book →
        </Link>
      </aside>
    </div>
  )
}
