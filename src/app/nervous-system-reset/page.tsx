import type { Metadata } from "next"
import Link from "next/link"
import { ResetChat } from "@/components/ResetChat"
import { HeartPulse } from "lucide-react"

export const metadata: Metadata = {
  title: "Free Nervous System Reset — Calm Anxiety, Release Tension & Regulate Your Body | Maya Allan",
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
  return (
    <>
      <style>{`
        footer { display: none !important; }
      `}</style>

      <div className="bg-white">
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

        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6">
          <ResetChat />
        </div>
      </div>
    </>
  )
}
