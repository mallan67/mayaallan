import type { Metadata } from "next"
import Link from "next/link"
import { IntegrationChat } from "@/components/IntegrationChat"
import { Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Integration Tool — Help a New Insight or Experience Land | Maya Allan",
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
  return (
    <>
      <style>{`
        footer { display: none !important; }
      `}</style>

      <div className="bg-white">
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
            <Link href="/privacy" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact" className="hover:text-charcoal-mid underline-offset-2 hover:underline">Contact</Link>
          </nav>
        </div>

        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6">
          <IntegrationChat />
        </div>
      </div>
    </>
  )
}
