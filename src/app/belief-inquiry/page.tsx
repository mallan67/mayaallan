import type { Metadata } from "next"
import { InquiryChat } from "@/components/InquiryChat"
import { ListChecks } from "lucide-react"

export const metadata: Metadata = {
  // Don't append "| Maya Allan" — root layout title.template adds it once.
  title: "Belief Inquiry — A Curious Exploration of Limiting Beliefs",
  description:
    "An AI-guided self-inquiry tool that uses curiosity, not evaluation, to help you explore inherited beliefs. Based on Clean Language and Coherence Therapy research. Free. No signup.",
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
  return (
    <>
      <style>{`
        footer { display: none !important; }
        @media (min-width: 640px) {
          /* Cap viewport height for chat layout but DO NOT trap scroll on body —
             the chat container manages its own internal overflow. */
          html, body { height: 100dvh; max-height: 100dvh; }
          @supports (height: 100dvh) { html, body { height: 100dvh; max-height: 100dvh; } }
          main { display: flex; flex-direction: column; min-height: 0; flex: 1; }
        }
      `}</style>

      <div className="bg-white flex flex-col sm:flex-1 sm:min-h-0">
        <div className="shrink-0 px-5 sm:px-8 pt-2 sm:pt-8 pb-2 sm:pb-5 text-center relative overflow-hidden">
          <div className="orb orb-blue w-[400px] h-[400px] top-[-100px] left-1/2 -translate-x-1/2 absolute opacity-[0.04]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-liquid-blue-wash items-center justify-center mx-auto mb-4">
              <ListChecks className="w-6 h-6 text-liquid-blue" />
            </div>
            <h1 className="font-serif text-[clamp(1.3rem,3.5vw,2.25rem)] font-semibold text-charcoal tracking-[-0.02em] mb-1 sm:mb-2">
              Belief Inquiry
            </h1>
            <p className="hidden sm:block text-charcoal-soft text-sm leading-[1.7] max-w-lg mx-auto mb-4">
              A guided self-inquiry tool that uses curiosity, not evaluation,
              to help you explore a belief in your own words — and notice what
              else might also be true.
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
            <InquiryChat />
          </div>
        </div>
      </div>
    </>
  )
}
