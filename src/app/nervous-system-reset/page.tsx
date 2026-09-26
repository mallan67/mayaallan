import type { Metadata } from "next"
import Link from "next/link"
import { ResetChat } from "@/components/ResetChat"
import { HeartPulse } from "lucide-react"
import { jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, AUTHOR_NAME } from "@/lib/identity"
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Free Nervous System Reset — Calm Anxiety, Release Tension & Regulate Your Body",
  description:
    "A free AI-guided somatic regulation tool to help you calm anxiety, release tension, and return to a grounded state. No signup required. Your body already knows how to regulate — this tool helps you practice it consciously.",
  alternates: {
    canonical: "https://www.mayaallan.com/nervous-system-reset",
  },
  keywords: [
    "nervous system regulation", "calm anxiety", "somatic grounding",
    "vagus nerve", "breathwork", "body scan", "stress relief tool",
    "nervous system reset", "somatic regulation", "grounding techniques",
    "fight or flight", "freeze response", "polyvagal",
    "free wellness tool", "AI somatic tool",
  ],
  openGraph: {
    title: "Free Nervous System Reset — Calm Anxiety & Regulate Your Body",
    description:
      "A free AI-guided somatic regulation tool to help you calm anxiety, release tension, and return to a grounded state. No signup required.",
    url: "https://www.mayaallan.com/nervous-system-reset",
    siteName: "Maya Allan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Nervous System Reset — Calm Anxiety & Regulate Your Body",
    description:
      "A free AI-guided somatic regulation tool. Calm anxiety, release tension, and return to your body. No signup. No cost.",
  },
}

export default function ResetPage() {
  const url = `${SITE_URL}/nervous-system-reset`
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Nervous System Reset", url },
  ])
  const softwareSchema = generateSoftwareApplicationSchema({
    name: "Nervous System Reset",
    url,
    description:
      "A free AI-guided grounding and somatic reflection tool for noticing activation, checking in with the body, and choosing a gentle settling practice.",
    featureList: [
      "Guided body check-in",
      "Grounding and settling prompts",
      "Parts-informed reflection",
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
        {/* ── Hero Header ────────────────────────────────────── */}
        <div className="px-5 sm:px-8 pt-4 pb-3 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal tracking-[-0.02em] mb-1.5">
            Nervous System Reset
          </h1>
          <p className="text-charcoal-soft text-sm leading-relaxed mb-2.5 max-w-lg mx-auto">
            A guided somatic regulation tool to help you check in with your body, identify your nervous system state,
            and practice simple techniques to return to a grounded, regulated place.
          </p>
          {/* Compact meta row: disclaimer + method + legal. The global footer is
              hidden on this chat page, so privacy / terms / contact stay here. */}
          <nav aria-label="About this tool" className="text-[0.72rem] text-charcoal-mid/70 flex flex-wrap gap-x-2.5 gap-y-1 justify-center items-center">
            <span>Not therapy</span>
            <span aria-hidden="true">·</span>
            <Link href="/methods#nervous-system-reset" className="font-medium text-liquid-blue hover:underline">Learn the method →</Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Contact</Link>
          </nav>
        </div>

        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 flex-1 flex flex-col">
          <ResetChat />
        </div>

        <section className="w-full border-t border-[#E8ECF0] mt-8">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-10 text-charcoal-mid">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">What Nervous System Reset does</h2>
              <p className="leading-relaxed">
                Nervous System Reset is a guided grounding tool for moments when you feel activated, shut down,
                overwhelmed, or disconnected from your body. It helps you slow the conversation down, notice what
                is happening physically, and choose a simple practice without pretending to diagnose your nervous system.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-charcoal mb-2">A body-first check-in</h3>
                <p className="text-sm leading-relaxed">
                  The tool asks about sensation, pace, tension, breath, orientation, and what feels manageable right
                  now. The emphasis is on small changes in attention rather than pushing for a particular emotional state.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal mb-2">A parts-informed stance</h3>
                <p className="text-sm leading-relaxed">
                  When an activated reaction feels protective, the conversation can treat it as something to understand
                  rather than something to defeat. That language is informed by Internal Family Systems concepts without
                  claiming to deliver IFS therapy.
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed">
              Read the underlying attributions on{" "}
              <Link href="/methods#nervous-system-reset" className="text-liquid-blue hover:underline">
                Methods &amp; Attributions
              </Link>
              . {AUTHOR_NAME} is an author and educator, not a clinician. This tool does not diagnose, prescribe, or treat.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
