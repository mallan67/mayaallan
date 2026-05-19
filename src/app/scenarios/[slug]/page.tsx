import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getScenario, listScenarios } from "@/lib/scenarios"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import {
  generateArticleSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateSpeakableWebPageSchema,
} from "@/lib/structured-data"
// NOTE: HowTo schema removed May 2026 — Google deprecated HowTo rich results
// in January 2026 and downstream measurement (Search/Atlas) shows a ~18-point
// AI-citation penalty when present. The visible numbered "How to navigate"
// list below is kept (it's useful UI); only the JSON-LD emission is dropped.

// =============================================================================
// /scenarios/[slug] — the AI-citation-optimized scenario page template.
// =============================================================================
// Page layout is deliberately tuned for how AI search engines parse pages:
//
//   1. H1 with the exact user query (the "headline" AI engines quote).
//   2. .speakable shortAnswer block — the 1-2 sentence direct answer.
//      AI engines copy this verbatim. Voice assistants read this aloud.
//   3. Long-form body content (the "why" + "what it feels like").
//   4. Numbered navigation steps (becomes HowTo schema for rich results).
//   5. FAQ accordion (becomes FAQPage schema — eligible for "People also ask").
//   6. Book CTA.
//
// Five JSON-LD schemas are emitted: Article, FAQPage, HowTo, BreadcrumbList,
// WebPage (with SpeakableSpecification). Each one targets a different AI
// engine consumption pattern.
// =============================================================================

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const scenarios = await listScenarios()
  return scenarios.map((s) => ({ slug: s.slug }))
}

/**
 * Append the current year to scenario titles. AEO research (Averi GEO
 * playbook, ConvertMate Benchmark 2026) found ~30% AI-citation lift when
 * pages include the year in their title. We auto-append based on
 * dateModified (or datePublished as fallback) so titles stay accurate as
 * content is refreshed — bumping dateModified yearly is how the lift
 * compounds.
 */
function titleWithYear(scenarioTitle: string, dateModified?: string, datePublished?: string): string {
  const refDate = dateModified ?? datePublished
  if (!refDate) return scenarioTitle
  const year = new Date(refDate).getFullYear()
  if (!Number.isFinite(year)) return scenarioTitle
  // Don't double-append if the title already includes the year.
  if (scenarioTitle.includes(String(year))) return scenarioTitle
  return `${scenarioTitle} (${year} guide)`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const scenario = await getScenario(slug)
  if (!scenario) return { title: "Scenario not found" }

  const url = `${SITE_URL}/scenarios/${slug}`
  const titleForSearch = titleWithYear(scenario.title, scenario.dateModified, scenario.datePublished)

  return {
    title: titleForSearch,
    description: scenario.description,
    keywords: scenario.keywords,
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: titleForSearch,
      description: scenario.description,
      url,
      siteName: AUTHOR_NAME,
      publishedTime: scenario.datePublished,
      modifiedTime: scenario.dateModified ?? scenario.datePublished,
      authors: [AUTHOR_NAME],
      tags: scenario.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: titleForSearch,
      description: scenario.description,
      site: "@mayaallan",
      creator: "@mayaallan",
    },
  }
}

export default async function ScenarioPage({ params }: PageProps) {
  const { slug } = await params
  const scenario = await getScenario(slug)
  if (!scenario) notFound()

  const url = `${SITE_URL}/scenarios/${slug}`
  const wordCount = scenario.body.split(/\s+/).filter(Boolean).length

  // -------------------------------------------------------------------------
  // Schema bundle — four JSON-LD blocks. Each one is consumed differently:
  //   Article          → Google Discover, AI citation attribution
  //   FAQPage          → "People also ask" + AI answer engines
  //   BreadcrumbList   → SERP breadcrumb display
  //   WebPage+Speakable → voice assistants (Alexa, Google Assistant)
  //
  // HowTo schema is intentionally NOT emitted (deprecated Jan 2026 — see
  // import comment above).
  // -------------------------------------------------------------------------
  const articleSchema = generateArticleSchema({
    headline: scenario.title,
    description: scenario.description,
    url,
    datePublished: scenario.datePublished,
    dateModified: scenario.dateModified ?? scenario.datePublished,
    keywords: scenario.keywords,
    wordCount,
    isPartOf: {
      name: "Psilocybin Journey Scenarios",
      url: `${SITE_URL}/scenarios`,
    },
  })

  const faqSchema = scenario.faqs && scenario.faqs.length > 0
    ? generateFAQSchema(scenario.faqs, url)
    : null

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Scenarios", url: `${SITE_URL}/scenarios` },
    { name: scenario.title, url },
  ])

  // Speakable points at .speakable + headers so voice assistants read the
  // short answer + key headings aloud, not the whole page.
  const speakableSchema = generateSpeakableWebPageSchema(
    url,
    scenario.title,
    scenario.description,
    [".speakable", "h1", "h2"]
  )

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      {/* All schema in one block — each as its own <script> per spec */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/scenarios" className="hover:text-slate-700">Scenarios</Link>
      </nav>

      {/* H1 — the exact user query */}
      <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-slate-900">
        {scenario.title}
      </h1>

      {/*
        SHORT ANSWER — the single most important block on the page.
        AI engines copy this verbatim. .speakable class is hooked by the
        SpeakableSpecification schema for voice assistants.
      */}
      <div className="mt-6 p-5 border-l-4 border-blue-400 bg-blue-50/40 rounded-r-lg">
        <p className="speakable text-base md:text-lg leading-relaxed text-slate-800 font-medium">
          {scenario.shortAnswer}
        </p>
      </div>

      {/* Meta line */}
      <p className="mt-4 text-xs text-slate-500">
        By <Link href="/about" className="underline hover:text-slate-700">{AUTHOR_NAME}</Link>
        {" · "}
        Published <time dateTime={scenario.datePublished}>{scenario.datePublished}</time>
        {scenario.bookExcerpt && (
          <>
            {" · "}
            <span className="italic">{scenario.bookExcerpt}</span>
          </>
        )}
      </p>

      {/* Long-form body content (markdown). Styling matches the blog page —
          relies on arbitrary-value selectors so it works without
          @tailwindcss/typography being installed. */}
      {scenario.body.trim() && (
        <div className="mt-10 text-charcoal leading-[1.8]
            [&_h2]:font-serif [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-3
            [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-2
            [&_p]:my-4 [&_p]:text-slate-700 [&_p]:text-[0.95rem] [&_p]:sm:text-base
            [&_a]:text-blue-700 [&_a]:underline hover:[&_a]:text-blue-900
            [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-4
            [&_strong]:text-slate-900 [&_strong]:font-semibold
            [&_em]:italic
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
            [&_li]:my-1
            [&_hr]:my-8 [&_hr]:border-slate-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Demote any markdown <h1> to <h2> — the page header already has the title <h1>.
              h1: (props) => <h2 {...props} />,
            }}
          >
            {scenario.body}
          </ReactMarkdown>
        </div>
      )}

      {/* Navigation steps — becomes HowTo schema. Renders as numbered list. */}
      {scenario.navigation && scenario.navigation.length > 0 && (
        <section className="mt-12 pt-10 border-t border-slate-200">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            How to navigate this
          </h2>
          <ol className="mt-6 space-y-6">
            {scenario.navigation.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{step.name}</h3>
                  <p className="mt-1 text-slate-700 leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* FAQ — becomes FAQPage schema. Eligible for "People also ask". */}
      {scenario.faqs && scenario.faqs.length > 0 && (
        <section className="mt-12 pt-10 border-t border-slate-200">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Related questions
          </h2>
          <div className="mt-6 space-y-6">
            {scenario.faqs.map((faq, i) => (
              <details key={i} className="group border-b border-slate-100 pb-4">
                <summary className="cursor-pointer font-semibold text-slate-900 list-none flex justify-between items-start gap-4">
                  <span>{faq.question}</span>
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-slate-700 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Book CTA */}
      <aside className="mt-16 p-6 sm:p-8 rounded-2xl bg-amber-50/60 border border-amber-200/50">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
          This is one of 40 scenarios
        </h2>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-5">
          <em>Psilocybin Integration Guide</em> walks through 40 real journey scenarios in depth — each with description, cause, navigation, lesson, and example. For practitioners, healers, facilitators, and solo journeyers.
        </p>
        <Link
          href="/books/psilocybin-integration-guide"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-700 transition-colors"
        >
          See the book →
        </Link>
      </aside>

      {/* Back to scenarios */}
      <div className="mt-12 pt-6 border-t border-slate-100">
        <Link href="/scenarios" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          ← All scenarios
        </Link>
      </div>
    </article>
  )
}
