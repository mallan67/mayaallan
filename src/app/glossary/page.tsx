import Link from "next/link"
import { jsonLdScript } from "@/lib/json-ld"
import type { Metadata } from "next"
import { loadGlossary, groupTermsByCategory } from "@/lib/glossary"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import { generateDefinedTermSetSchema, generateBreadcrumbSchema } from "@/lib/structured-data"

// =============================================================================
// /glossary — the site's reference page for recurring terms.
// =============================================================================
// Why this page exists:
//   Terms like "ego dissolution" or "set and setting" come up across the
//   scenarios, blog, and book. One page with short, general definitions gives
//   those pages a stable place to link to and gives readers a plain-language
//   reference. DefinedTermSet JSON-LD describes the page as a set of defined
//   terms, each with its own anchor.
//
// Content discipline:
//   Definitions are general — drawn from established scientific and cultural
//   literature about psychedelics. Maya's specific working method for each
//   concept lives in Psilocybin Integration Guide, linked at the bottom.
// =============================================================================

export const revalidate = 600 // 10 min — glossary changes are rare

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadGlossary()
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `${SITE_URL}/glossary` },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${SITE_URL}/glossary`,
      siteName: AUTHOR_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
    },
  }
}

export default async function GlossaryPage() {
  const data = await loadGlossary()
  const groups = groupTermsByCategory(data)
  const url = `${SITE_URL}/glossary`

  const definedTermSetSchema = generateDefinedTermSetSchema(
    data.title,
    url,
    data.description,
    data.terms.map((t) => ({
      id: t.id,
      term: t.term,
      alternateNames: t.alternateNames,
      definition: t.definition,
    }))
  )

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Glossary", url },
  ])

  // Quick lookup: termId → display name (used by relatedTerms cross-links).
  const termIndex = new Map(data.terms.map((t) => [t.id, t.term]))

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(definedTermSetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }} />

      <nav className="text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-700">Home</Link>
        <span className="mx-2">/</span>
        <span>{data.shortTitle ?? data.title}</span>
      </nav>

      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-slate-900">
          {data.shortTitle ?? data.title}
        </h1>
        {data.tagline && (
          <p className="mt-3 text-lg italic text-slate-500">{data.tagline}</p>
        )}
        <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl">
          {data.description}
        </p>
      </header>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* Sticky table of contents */}
        <aside className="hidden md:block sticky top-24 self-start text-sm">
          <p className="font-semibold text-slate-900 mb-3">Categories</p>
          <ul className="space-y-2 text-slate-600">
            {groups.map(({ category }) => (
              <li key={category.id}>
                <a href={`#cat-${category.id}`} className="hover:text-slate-900">
                  {category.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="font-semibold text-slate-900 mt-8 mb-3">All terms</p>
          <ul className="space-y-1 text-slate-500 text-xs">
            {[...data.terms].sort((a, b) => a.term.localeCompare(b.term)).map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="hover:text-slate-900">{t.term}</a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Term definitions by category */}
        <div className="min-w-0 space-y-14">
          {groups.map(({ category, items }) => {
            if (items.length === 0) return null
            return (
              <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-24">
                <h2 className="font-serif text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-200">
                  {category.label}
                </h2>

                <dl className="space-y-10">
                  {items.map((t) => (
                    <div
                      key={t.id}
                      id={t.id}
                      className="scroll-mt-24"
                      itemScope
                      itemType="https://schema.org/DefinedTerm"
                    >
                      <dt className="group">
                        <h3
                          className="font-serif text-xl font-semibold text-slate-900 inline"
                          itemProp="name"
                        >
                          <a href={`#${t.id}`} className="hover:text-slate-700">
                            {t.term}
                          </a>
                        </h3>
                        {t.alternateNames && t.alternateNames.length > 0 && (
                          <span className="ml-2 text-sm text-slate-500" itemProp="alternateName">
                            ({t.alternateNames.join(", ")})
                          </span>
                        )}
                        <a
                          href={`#${t.id}`}
                          className="ml-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                          aria-label={`Permalink: ${t.term}`}
                        >
                          #
                        </a>
                      </dt>
                      <dd
                        className="glossary-definition mt-2 text-slate-700 leading-relaxed"
                        itemProp="description"
                      >
                        {t.definition}
                      </dd>

                      {/* Cross-links — related terms + related scenarios */}
                      {((t.relatedTerms && t.relatedTerms.length > 0) ||
                        (t.relatedScenarios && t.relatedScenarios.length > 0)) && (
                        <div className="mt-3 text-sm space-y-1">
                          {t.relatedTerms && t.relatedTerms.length > 0 && (
                            <p className="text-slate-500">
                              <span className="font-semibold">Related: </span>
                              {t.relatedTerms.map((rid, idx) => {
                                const name = termIndex.get(rid)
                                if (!name) return null
                                return (
                                  <span key={rid}>
                                    <a href={`#${rid}`} className="text-blue-700 hover:underline">
                                      {name}
                                    </a>
                                    {idx < (t.relatedTerms?.length ?? 0) - 1 && ", "}
                                  </span>
                                )
                              })}
                            </p>
                          )}
                          {t.relatedScenarios && t.relatedScenarios.length > 0 && (
                            <p className="text-slate-500">
                              <span className="font-semibold">In depth: </span>
                              {t.relatedScenarios.map((slug, idx) => (
                                <span key={slug}>
                                  <Link
                                    href={`/scenarios/${slug}`}
                                    className="text-blue-700 hover:underline"
                                  >
                                    /scenarios/{slug}
                                  </Link>
                                  {idx < (t.relatedScenarios?.length ?? 0) - 1 && ", "}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </dl>
              </section>
            )
          })}
        </div>
      </div>

      {/* Book CTA */}
      <aside className="mt-16 p-6 sm:p-8 rounded-2xl bg-amber-50/60 border border-amber-200/50">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
          How these show up in real journeys
        </h2>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-5">
          These definitions are the shared vocabulary. <em>Psilocybin Integration Guide</em> shows
          how each concept actually appears — across 40 real journey scenarios with description,
          cause, navigation, and integration practice for each.
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
