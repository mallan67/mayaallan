import type { Metadata } from "next"
import { ResetChat } from "@/components/ResetChat"
import { HeartPulse } from "lucide-react"

export const metadata: Metadata = {
  title: "Free Nervous System Reset — Calm Anxiety, Release Tension & Regulate Your Body | Maya Allan",
  description:
    "A free AI-guided somatic regulation tool to help you calm anxiety, release tension, and return to a grounded state. No signup required. Your body already knows how to regulate — this tool helps you practice it consciously.",
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
    url: "https://www.mayaallan.com/reset",
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
      {/* Force the page to fill viewport and prevent outer scroll */}
      <style>{`
        body { overflow: hidden; height: 100vh; }
        main { display: flex; flex-direction: column; min-height: 0; }
        footer { display: none; }
      `}</style>

      <div className="bg-white flex flex-col flex-1 min-h-0">
        {/* ── Hero Header ────────────────────────────────────── */}
        <div className="shrink-0 px-5 sm:px-8 pt-8 pb-5 text-center relative overflow-hidden">
          {/* Soft ambient orb */}
          <div className="orb orb-blue w-[400px] h-[400px] top-[-100px] left-1/2 -translate-x-1/2 absolute opacity-[0.04]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <HeartPulse className="w-6 h-6 text-violet-400" />
            </div>
            <h1 className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold text-charcoal tracking-[-0.02em] mb-2">
              Nervous System Reset
            </h1>
            <p className="text-charcoal-soft text-sm leading-[1.7] max-w-lg mx-auto mb-4">
              A guided somatic regulation tool to help you check in with your body, identify your nervous system state,
              and practice simple techniques to return to a grounded, regulated place.
            </p>

            {/* Disclosure banner */}
            <div className="inline-block bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5">
              <p className="text-charcoal-soft text-xs leading-relaxed">
                This tool is for informational and self-reflection purposes only.
                It is not therapy, counseling, or a substitute for professional mental health care.
              </p>
            </div>
          </div>
        </div>

        {/* ── Chat Container — fills remaining height ────────── */}
        <div className="flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full px-4 sm:px-6 pb-4">
          <div className="flex-1 flex flex-col min-h-0 bg-white/80 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <ResetChat />
          </div>
        </div>
      </div>
    </>
  )
}
