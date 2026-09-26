import type { Metadata } from "next"
import Link from "next/link"
import { IntegrationChat } from "@/components/IntegrationChat"
import { SeoExplainerVisual } from "@/components/SeoExplainerVisual"
import { jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Integration Tool — Help a New Insight or Experience Land",
  description:
    "An AI-guided reflection tool that helps you hold a new experience or insight alongside an old belief. Based on Coherence Therapy and memory reconsolidation research. Not therapy.",
  alternates: {
    canonical: "https://www.mayaallan.com/integration-reflection",
  },
  keywords: [
    "integration tool", "belief integration", "insight integration",
    "reflection tool", "coherence therapy", "memory reconsolidation",
    "personal growth tool", "AI reflection",
  ],
  openGraph: {
    title: "Integration — Help a New Insight Land",
    description:
      "Hold a new experience alongside an old pattern, and let the shift consolidate. A free AI-guided reflection tool.",
    url: "https://www.mayaallan.com/integration-reflection",
    siteName: "Maya Allan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Integration — Let a New Insight Land",
    description:
      "An AI-guided reflection tool for integrating a new experience with an old belief. No signup.",
  },
}

export default function IntegrationPage() {
  const url = `${SITE_URL}/integration-reflection`
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Integration Reflection", url },
  ])
  const softwareSchema = generateSoftwareApplicationSchema({
    name: "Integration Reflection",
    url,
    description:
      "A free AI-guided reflection tool for placing a new experience or insight alongside an older pattern and exploring what changes when both are held together.",
    featureList: [
      "Post-experience reflection",
      "Juxtaposition-informed prompts",
      "User-led meaning-making",
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
            Integration
          </h1>
          <p className="text-charcoal-soft text-sm leading-relaxed mb-2.5 max-w-lg mx-auto">
            When an experience opens something new, there&apos;s the work of letting it settle.
            This tool helps you hold a new experience alongside an old pattern,
            so the shift has a chance to land.
          </p>
          {/* Compact meta row: disclaimer + method + legal. The global footer is
              hidden on this chat page, so privacy / terms / contact stay here. */}
          <nav aria-label="About this tool" className="text-[0.72rem] text-charcoal-mid/70 flex flex-wrap gap-x-2.5 gap-y-1 justify-center items-center">
            <span>Not therapy</span>
            <span aria-hidden="true">·</span>
            <Link href="/methods#integration-reflection" className="font-medium text-liquid-blue hover:underline">Learn the method →</Link>
            <span aria-hidden="true">·</span>
            <Link href="/blog/psilocybin-integration-research" className="font-medium text-liquid-blue hover:underline">The research behind it →</Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Contact</Link>
          </nav>
        </div>

        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 flex-1 flex flex-col">
          <IntegrationChat />
        </div>

        <section className="w-full border-t border-[#E8ECF0] mt-8">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-10 text-charcoal-mid">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">What Integration Reflection does</h2>
              <p className="leading-relaxed">
                Integration Reflection is a guided meaning-making tool for after an experience, insight, or emotional
                shift. It helps you describe what felt new, notice an older pattern that does not fully fit the new
                experience, and hold both in view without being told what the experience is supposed to mean.
              </p>
            </div>

            <SeoExplainerVisual
              slug="integration-reflection"
              alt="Four-step Integration Reflection path: describe what happened, name the older pattern, hold both in view, and choose a small next step."
              caption="Integration Reflection places a new experience beside an older expectation without claiming to install a new belief or produce a clinical outcome."
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-charcoal mb-2">From insight to ordinary life</h3>
                <p className="text-sm leading-relaxed">
                  The conversation slows down the urge to turn a powerful moment into a sweeping conclusion. It asks
                  what actually happened, what changed in your perception, and what small implications are worth testing
                  in daily life.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal mb-2">Juxtaposition, not replacement</h3>
                <p className="text-sm leading-relaxed">
                  The tool is informed by Coherence Therapy&apos;s use of juxtaposition: an older expectation is held
                  alongside contradictory lived experience. It does not claim that a chat session causes memory
                  reconsolidation or installs a new belief.
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed">
              See{" "}
              <Link href="/methods#integration-reflection" className="text-liquid-blue hover:underline">
                Methods &amp; Attributions
              </Link>{" "}
              and the{" "}
              <Link href="/blog/psilocybin-integration-research" className="text-liquid-blue hover:underline">
                integration research article
              </Link>{" "}
              for the evidence and its limits. {AUTHOR_NAME} is an author and educator, not a clinician.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
