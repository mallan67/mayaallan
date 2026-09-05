import Link from "next/link"
import { jsonLdScript } from "@/lib/json-ld"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getScenario, listScenarios } from "@/lib/scenarios"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/structured-data"

// =============================================================================
// /scenarios/[slug] — one page per journey scenario.
// =============================================================================
// Page structure:
//   1. H1 — the scenario's question, phrased the way a reader would ask it.
//   2. Short answer — a 1-2 sentence direct answer, visually set apart.
//   3. Long-form body (markdown): why it happens, what it can feel like.
//   4. Numbered "How to navigate" steps — visible list only. No HowTo JSON-LD:
//      Google retired HowTo rich results in September 2023.
//   5. "Related questions" accordion — visible content only. No FAQPage
//      JSON-LD: Google discontinued FAQ rich results from May 7, 2026.
//   6. Book CTA.
//
// JSON-LD emitted: Article (authorship, dates, series membership for the
// editorial content) and BreadcrumbList (position in the site). The markup
// describes the page; it is not expected to change rankings on its own.
// =============================================================================

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const scenarios = await listScenarios()
  return scenarios.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const scenario = await getScenario(slug)
  if (!scenario) return { title: "Scenario not found" }

  const url = `${SITE_URL}/scenarios/${slug}`
  // Title is the scenario's own question, unmodified (no date suffixing).
  const titleForSearch = scenario.title

  return {
    title: titleForSearch,
    description: scenario.description,
    keywords: scenario.keywords,
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    alternates: { canonical: url },
    // Drafts: keep the URL reachable for preview but tell crawlers to stay out.
    // The page also visually marks itself as a draft below.
    ...(scenario.draft && {
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    }),
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

  // JSON-LD: Article describes the editorial content (headline, author,
  // dates, series membership); BreadcrumbList describes where the page sits
  // in the site. Nothing else is emitted — see the header comment.
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

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Scenarios", url: `${SITE_URL}/scenarios` },
    { name: scenario.title, url },
  ])

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      {/* JSON-LD — one <script> per node */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/scenarios" className="hover:text-slate-700">Scenarios</Link>
      </nav>

      {/* Draft banner — visible to anyone with the URL, search-engine-noindexed
          via the metadata above. Remove `draft: true` from the .md frontmatter
          to publish. */}
      {scenario.draft && (
        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          <strong>DRAFT — not published.</strong> This page is hidden from the public
          scenarios index and search engines. Remove <code className="bg-amber-100 px-1 rounded">draft: true</code>
          {" "}from the markdown frontmatter to publish.
        </div>
      )}

      {/* H1 — the scenario's question */}
      <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-slate-900">
        {scenario.title}
      </h1>

      {/* Short answer — the direct 1-2 sentence response, set apart from the body. */}
      <div className="mt-6 p-5 border-l-4 border-blue-400 bg-blue-50/40 rounded-r-lg">
        <p className="text-base md:text-lg leading-relaxed text-slate-800 font-medium">
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

      {/* Navigation steps — visible numbered list (no HowTo schema). */}
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

      {/* Related questions — visible accordion only; no FAQPage JSON-LD (see header). */}
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
          <em>Psilocybin Integration Guide</em> walks through 40 real journey scenarios in depth — each with description, cause, navigation, lesson, and example. Written for anyone making sense of their own experience.
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
