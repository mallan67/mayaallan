import type { Metadata } from "next"
import { IntegrationChat } from "@/components/IntegrationChat"
import { Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Integration Tool — Help a New Insight or Experience Land | Maya Allan",
  description:
    "An AI-guided reflection tool that helps you hold a new experience or insight alongside an old belief. Based on Coherence Therapy and memory reconsolidation research. Not therapy.",
  keywords: [
    "integration tool", "belief integration", "insight integration",
    "reflection tool", "coherence therapy", "memory reconsolidation",
    "personal growth tool", "AI reflection",
  ],
  openGraph: {
    title: "Integration — Help a New Insight Land",
    description:
      "Hold a new experience alongside an old pattern, and let the shift consolidate. A free AI-guided reflection tool.",
    url: "https://www.mayaallan.com/integration",
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
        @media (min-width: 640px) {
          body { overflow: hidden; height: 100dvh; height: 100vh; }
          @supports (height: 100dvh) { body { height: 100dvh; } }
          main { display: flex; flex-direction: column; min-height: 0; flex: 1; }
        }
      `}</style>

      <div className="bg-white flex flex-col sm:flex-1 sm:min-h-0">
        <div className="shrink-0 px-5 sm:px-8 pt-2 sm:pt-8 pb-2 sm:pb-5 text-center relative overflow-hidden">
          <div className="orb orb-blue w-[400px] h-[400px] top-[-100px] left-1/2 -translate-x-1/2 absolute opacity-[0.04]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-liquid-blue-wash items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-liquid-blue" />
            </div>
            <h1 className="font-serif text-[clamp(1.3rem,3.5vw,2.25rem)] font-semibold text-charcoal tracking-[-0.02em] mb-1 sm:mb-2">
              Integration
            </h1>
            <p className="hidden sm:block text-charcoal-soft text-sm leading-[1.7] max-w-lg mx-auto mb-4">
              When an experience opens something new, there&apos;s the work of letting it settle.
              This tool helps you hold a new experience alongside an old pattern,
              so the shift has a chance to land.
            </p>

            <div className="inline-block bg-[#F0F7FF] border border-[#D6E8FA] rounded-xl px-3 sm:px-4 py-1.5 sm:py-2.5">
              <p className="text-charcoal-mid text-[0.7rem] sm:text-xs leading-relaxed">
                Not therapy or a substitute for professional mental health care.
              </p>
            </div>
          </div>
        </div>

        <div className="h-[calc(100dvh-170px)] sm:h-auto sm:flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full px-3 sm:px-6 pb-0 sm:pb-4">
          <div className="flex-1 flex flex-col min-h-0 bg-white/80 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <IntegrationChat />
          </div>
        </div>
      </div>
    </>
  )
}
