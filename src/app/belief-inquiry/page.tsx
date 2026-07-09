import type { Metadata } from "next"
import Link from "next/link"
import { InquiryChat } from "@/components/InquiryChat"
import { ListChecks } from "lucide-react"

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
  return (
    <>
      <style>{`
        footer { display: none !important; }
      `}</style>

      <div className="bg-white">
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

        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6">
          <InquiryChat />
        </div>
      </div>
    </>
  )
}
