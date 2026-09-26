import type { Metadata } from "next"
import Link from "next/link"
import { InquiryChat } from "@/components/InquiryChat"
import { ListChecks } from "lucide-react"
import { jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema } from "@/lib/structured-data"

export const metadata: Metadata = {
  // Don't append "| Maya Allan" — root layout title.template adds it once.
  title: "Belief Inquiry — A Curious Exploration of Limiting Beliefs",
  description:
    "An AI-guided self-inquiry tool that uses curiosity, not evaluation, to help you explore inherited beliefs. Based on Clean Language and Coherence Therapy research. Free. No signup.",
  alternates: {
    canonical: "https://www.mayaallan.com/belief-inquiry",
  },
  keywords: [
    "belief inquiry", "limiting beliefs", "curious inquiry",
    "clean language", "coherence therapy", "self-inquiry tool",
    "inherited beliefs", "belief exploration", "AI self-inquiry",
    "subconscious beliefs", "core beliefs", "personal growth tool",
  ],
  openGraph: {
    title: "Belief Inquiry — Explore Limiting Beliefs with Curiosity",
    description:
      "A free AI-guided self-inquiry tool to explore beliefs with curiosity, not judgment. Based on Clean Language and Coherence Therapy. No signup required.",
    url: "https://www.mayaallan.com/belief-inquiry",
    siteName: "Maya Allan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Belief Inquiry — Curious Exploration of Beliefs",
    description:
      "Explore beliefs with curiosity, not judgment. A free AI-guided self-inquiry tool.",
  },
}

export default function BeliefInquiryPage() {
  const url = `${SITE_URL}/belief-inquiry`
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Belief Inquiry", url },
  ])
  const softwareSchema = generateSoftwareApplicationSchema({
    name: "Belief Inquiry",
    url,
    description:
      "A free AI-guided self-inquiry tool that helps users explore a belief in their own words using curiosity rather than evaluation.",
    featureList: [
      "Guided belief exploration",
      "Clean Language-informed prompts",
      "User-led reflection",
      "No signup required to begin",
    ],
  })

  return (
    <>
      <style>{`
        footer { display: none !important; }
      `}</style>

      <div className="bg-white min-h-[calc(100dvh-71px)] flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(softwareSchema) }} />
        <div className="px-5 sm:px-8 pt-4 pb-3 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal tracking-[-0.02em] mb-1.5">
            Belief Inquiry
          </h1>
          <p className="text-charcoal-soft text-sm leading-relaxed mb-2.5 max-w-lg mx-auto">
            A guided self-inquiry tool that uses curiosity, not evaluation,
            to help you explore a belief in your own words — and notice what
            else might also be true.
          </p>
          {/* Compact meta row: disclaimer + method + legal. The global footer is
              hidden on this chat page, so privacy / terms / contact stay here. */}
          <nav aria-label="About this tool" className="text-[0.72rem] text-charcoal-mid/70 flex flex-wrap gap-x-2.5 gap-y-1 justify-center items-center">
            <span>Not therapy</span>
            <span aria-hidden="true">·</span>
            <Link href="/methods#belief-inquiry" className="font-medium text-liquid-blue hover:underline">Learn the method →</Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Contact</Link>
          </nav>
        </div>

        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 flex-1 flex flex-col">
          <InquiryChat />
        </div>

        <section className="w-full border-t border-[#E8ECF0] mt-8">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-10 text-charcoal-mid">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">What Belief Inquiry does</h2>
              <p className="leading-relaxed">
                Belief Inquiry is a free guided reflection tool for examining a belief without being told what
                to replace it with. It keeps the user&apos;s own language central and uses questions informed by
                Clean Language to explore what the belief means, where it shows up, and what else may also be true.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-charcoal mb-2">When it may be useful</h3>
                <p className="text-sm leading-relaxed">
                  Use it when you notice a recurring story about yourself, relationships, safety, worth, work, or
                  what you believe you are allowed to do. The goal is observation and self-inquiry, not diagnosis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal mb-2">How the conversation works</h3>
                <p className="text-sm leading-relaxed">
                  You name the belief in your own words. The tool reflects that language back, helps you notice the
                  context and protective logic around it, and makes room for contradictory lived experience without
                  forcing a new conclusion.
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed">
              The method draws on Clean Language and the conversational stance documented on the{" "}
              <Link href="/methods#belief-inquiry" className="text-liquid-blue hover:underline">
                Methods &amp; Attributions
              </Link>{" "}
              page. {AUTHOR_NAME} is an author and educator, not a therapist; this tool is an educational reflection aid.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
