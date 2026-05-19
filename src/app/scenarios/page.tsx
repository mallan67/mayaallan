import Link from "next/link"
import type { Metadata } from "next"
import { listScenarios } from "@/lib/scenarios"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import { generateBreadcrumbSchema } from "@/lib/structured-data"

// =============================================================================
// /scenarios — the hub for the 40 AI-citation-optimized scenario pages.
// =============================================================================
// Each page targets one specific user query (e.g., "what does ego dissolution
// feel like") and is structured for maximum citability by AI search engines.
// This index page is the cluster landing page and is itself a hub-style page
// Google + AI engines treat as the authoritative entry point for the cluster.
// =============================================================================

export const revalidate = 300

export const metadata: Metadata = {
  title: "Psilocybin Journey Scenarios — Practical Navigation Guide",
  description:
    "Specific, research-informed answers to the questions people actually search for during and after a psilocybin journey — ego dissolution, integration, difficult experiences, and more. Adapted from Maya Allan's Psilocybin Integration Guide.",
  alternates: {
    canonical: `${SITE_URL}/scenarios`,
  },
  openGraph: {
    title: "Psilocybin Journey Scenarios — Practical Navigation Guide",
    description:
      "Specific, research-informed answers to questions people search during and after a psilocybin journey.",
    url: `${SITE_URL}/scenarios`,
    type: "website",
  },
}

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  preparation: {
    label: "Preparation",
    description: "Set, setting, intention, dosage — before the journey begins.",
  },
  journey: {
    label: "During the Journey",
    description: "Ego dissolution, peak experience, difficult passages, navigation in real-time.",
  },
  integration: {
    label: "Integration",
    description: "The weeks and months after — translating insight into change.",
  },
  safety: {
    label: "Safety & Concerns",
    description: "Warning signs, contraindications, when to seek help.",
  },
  practitioners: {
    label: "For Practitioners",
    description: "Guidance for facilitators, therapists, and integration coaches.",
  },
}

export default async function ScenariosIndexPage() {
  const scenarios = await listScenarios()

  // Group by category for the hub layout.
  const byCategory: Record<string, typeof scenarios> = {}
  for (const s of scenarios) {
    if (!byCategory[s.category]) byCategory[s.category] = []
    byCategory[s.category].push(s)
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Scenarios", url: `${SITE_URL}/scenarios` },
  ])

  // CollectionPage schema tells Google this page is the entry point for a
  // curated set of related pages. Helps the whole cluster get understood as
  // a single body of work rather than 40 disconnected pages.
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Psilocybin Journey Scenarios",
    description:
      "Specific, research-informed answers to the questions people actually search for during and after a psilocybin journey.",
    url: `${SITE_URL}/scenarios`,
    author: { "@type": "Person", name: AUTHOR_NAME, url: SITE_URL },
    isPartOf: { "@type": "WebSite", name: AUTHOR_NAME, url: SITE_URL },
    hasPart: scenarios.map((s) => ({
      "@type": "Article",
      headline: s.title,
      url: `${SITE_URL}/scenarios/${s.slug}`,
      description: s.shortAnswer,
    })),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <header className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-slate-900">
          Psilocybin Journey Scenarios
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Specific, research-informed answers to the questions people actually search for during and
          after a psilocybin journey. Each page covers one scenario in depth — what is happening,
          why, how to navigate it, and what to do afterward.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Adapted from <Link href="/books/psilocybin-integration-guide" className="underline hover:text-slate-700">Maya Allan&apos;s <em>Psilocybin Integration Guide</em></Link> — 40 real scenarios with detailed navigation for each phase of the journey.
        </p>
      </header>

      {scenarios.length === 0 ? (
        <p className="text-slate-500 italic">No scenarios published yet. Add markdown files in <code className="bg-slate-100 px-1 rounded">content/scenarios/</code>.</p>
      ) : (
        <div className="space-y-12">
          {Object.entries(CATEGORY_LABELS).map(([key, { label, description }]) => {
            const items = byCategory[key]
            if (!items || items.length === 0) return null
            return (
              <section key={key}>
                <h2 className="font-serif text-2xl font-semibold text-slate-900">{label}</h2>
                <p className="mt-1 text-sm text-slate-500 mb-5">{description}</p>
                <ul className="space-y-4">
                  {items.map((s) => (
                    <li key={s.slug} className="border-l-2 border-slate-200 pl-5 hover:border-slate-400 transition-colors">
                      <Link href={`/scenarios/${s.slug}`} className="group block">
                        <h3 className="font-serif text-lg font-semibold text-slate-900 group-hover:text-slate-700">
                          {s.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{s.shortAnswer.slice(0, 220)}{s.shortAnswer.length > 220 ? "…" : ""}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
