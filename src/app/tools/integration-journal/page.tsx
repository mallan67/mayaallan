import type { Metadata } from "next"
import { jsonLdScript } from "@/lib/json-ld"
import { IntegrationJournalForm } from "./IntegrationJournalForm"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/structured-data"

// =============================================================================
// /tools/integration-journal — public free tool + linkable asset.
// =============================================================================
// Rich on-page content for SEO + a small form that POSTs to
// /api/tools/integration-journal and downloads a customized PDF.
//
// The page targets long-tail queries like:
//   "psilocybin integration journal template"
//   "free integration journal pdf"
//   "post-mushroom journey reflection prompts"
//
// Schema: Article + FAQPage + Breadcrumb + the tool is markup as a
// SoftwareApplication so it's eligible for the "free tool" rich result
// in some search engines.
// =============================================================================

const URL_PATH = `${SITE_URL}/tools/integration-journal`

export const metadata: Metadata = {
  title: "Free Integration Journal — 7-Day PDF Template",
  description:
    "Free downloadable 7-day integration journal for psilocybin journeys. Four versions (preparation, journey, integration, shadow work) with research-informed daily prompts adapted from Maya Allan's Psilocybin Integration Guide.",
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: "Free Integration Journal — 7-Day PDF Template",
    description:
      "Customizable 7-day integration journal with prompts for preparation, journey, integration, and shadow work. Free PDF download.",
    url: URL_PATH,
    type: "website",
    siteName: AUTHOR_NAME,
  },
}

const FAQS = [
  {
    question: "What is the integration journal?",
    answer:
      "A free 7-day journal you can download as a PDF, with research-informed daily prompts for one of four phases of a psilocybin experience: preparation, the journey itself, integration afterward, or shadow work. Each day has one focused prompt and printable space for handwritten reflection.",
  },
  {
    question: "How do I use it?",
    answer:
      "Pick the phase you're in, optionally write your intention or journey date for the cover page, and download. Print it or write digitally — handwriting is recommended; research suggests it engages reflective processing more deeply than typing.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. The journal is free to download and share. The full method behind it lives in Psilocybin Integration Guide by Maya Allan, which walks through 40 real journey scenarios in depth.",
  },
  {
    question: "Why is it only 7 days?",
    answer:
      "Integration is a months-long process, but the first 7 days are where most insight either lands or fades. The journal is designed for that window — you can re-download it (or the next phase) to continue.",
  },
  {
    question: "What is the difference between integration and shadow work versions?",
    answer:
      "The integration version focuses on translating insight into life. The shadow work version is for journeys that surfaced difficult material — older grief, protective patterns, internal parts that don't usually have a voice. The prompts hold the same material differently.",
  },
  {
    question: "Can practitioners or facilitators share this with clients?",
    answer:
      "Yes — please. This is exactly what the tool is for. Attribution is appreciated but not required.",
  },
]

export default function IntegrationJournalPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Tools", url: `${SITE_URL}/tools` },
    { name: "Integration Journal", url: URL_PATH },
  ])

  const faqSchema = generateFAQSchema(FAQS, URL_PATH)

  // SoftwareApplication schema — marks this as a free tool, eligible for the
  // free-tool rich result in Bing + some AI engines treat it as a citable
  // utility rather than just an article.
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Integration Journal — 7-Day PDF Generator",
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: URL_PATH,
    author: { "@type": "Person", name: AUTHOR_NAME, url: SITE_URL },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(softwareSchema) }} />

      <header className="mb-10">
        <p className="text-xs uppercase tracking-wider text-blue-700 font-semibold mb-3">Free tool</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-slate-900">
          Integration Journal — 7-Day PDF
        </h1>
        <p className="mt-5 text-lg text-slate-700 leading-relaxed">
          A customizable 7-day integration journal for psilocybin journeys. Four versions, one
          focused prompt per day, printable handwriting space. Free, no email required, no
          login.
        </p>
      </header>

      {/* The actual tool */}
      <section className="mb-12 p-6 sm:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/30 to-white">
        <IntegrationJournalForm />
      </section>

      {/* What's in each version */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-slate-900 mb-5">What&apos;s in each version</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <article className="p-5 border border-slate-200 rounded-xl">
            <h3 className="font-semibold text-slate-900">Preparation</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Seven days before the journey. Clarifying intention, naming what you&apos;re bringing,
              identifying support, listening for the parts of you that have something to say.
            </p>
          </article>
          <article className="p-5 border border-slate-200 rounded-xl">
            <h3 className="font-semibold text-slate-900">Journey companion</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              For the day of and the week surrounding the experience. Anchoring practices,
              immediate post-journey capture, and the week of settling.
            </p>
          </article>
          <article className="p-5 border border-slate-200 rounded-xl">
            <h3 className="font-semibold text-slate-900">Integration</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Seven days after a journey. Meaning-making, embodiment, translating insight into
              one small actionable step at a time.
            </p>
          </article>
          <article className="p-5 border border-slate-200 rounded-xl">
            <h3 className="font-semibold text-slate-900">Shadow work</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              For journeys that surfaced difficult material. Held gently, with parts-work-informed
              prompts that honor protection before asking for change.
            </p>
          </article>
        </div>
      </section>

      {/* Why journaling works (the SEO body) */}
      <section className="mb-12 text-slate-700 leading-relaxed space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-slate-900 mb-3">Why journaling matters after a psilocybin experience</h2>
        <p>
          The medicine opens a window. Integration is what you build in that window. Research from
          Johns Hopkins, Imperial College London, and the Usona Institute consistently shows that
          the long-term benefits of psilocybin experiences come not from the experience itself but
          from the practices that follow — and journaling is one of the most accessible.
        </p>
        <p>
          The first 24 hours after a journey are when non-verbal experience is most translatable
          into language. The week that follows is when patterns become legible. The month that
          follows is when insight either becomes action or fades into a beautiful memory.
        </p>
        <p>
          The prompts in these journals are drawn from <em>Psilocybin Integration Guide</em>, which
          walks through 40 real journey scenarios — ego dissolution, inner child material, cosmic
          consciousness, the spiritual fracture, the re-entry wobble — each with detailed
          navigation.
        </p>
      </section>

      {/* FAQs */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-slate-900 mb-5">Common questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details key={i} className="group border-b border-slate-100 pb-3">
              <summary className="cursor-pointer font-semibold text-slate-900 list-none flex justify-between items-start gap-4 py-1">
                <span>{faq.question}</span>
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-slate-700 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Light CTA */}
      <aside className="p-6 sm:p-8 rounded-2xl bg-amber-50/60 border border-amber-200/50">
        <p className="text-slate-700 leading-relaxed">
          The journal is a free companion. The full method — 40 scenarios, detailed navigation,
          frameworks for facilitators and solo journeyers — lives in <em>Psilocybin Integration
          Guide</em>.
        </p>
        <a
          href="/books/psilocybin-integration-guide"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-700 transition-colors"
        >
          See the book →
        </a>
      </aside>
    </div>
  )
}
