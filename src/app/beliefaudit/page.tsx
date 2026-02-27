import type { Metadata } from "next"
import { AuditChat } from "@/components/AuditChat"
import { ListChecks } from "lucide-react"

export const metadata: Metadata = {
  title: "Free Belief Systems Audit — Identify Limiting Beliefs & Inherited Patterns | Maya Allan",
  description:
    "Discover the hidden beliefs running your life. This free AI-guided self-inquiry tool helps you identify limiting beliefs, uncover inherited patterns from childhood and family, and find what's actually true for you now.",
  keywords: [
    "limiting beliefs", "identify limiting beliefs", "inherited beliefs",
    "belief systems", "self-inquiry tool", "shadow work tool",
    "subconscious beliefs", "core beliefs", "childhood conditioning",
    "generational patterns", "inner work", "self-discovery tool",
    "belief audit", "mindset tool", "personal growth tool",
    "free self-help tool", "AI self-inquiry",
  ],
  openGraph: {
    title: "Free Belief Systems Audit — Uncover the Hidden Beliefs Running Your Life",
    description:
      "A free AI-guided self-inquiry tool to identify limiting beliefs, trace inherited patterns, and find what's actually true for you now. No signup required.",
    url: "https://www.mayaallan.com/beliefaudit",
    siteName: "Maya Allan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Belief Systems Audit — Uncover Limiting Beliefs",
    description:
      "Discover the hidden beliefs running your life with this free AI-guided self-inquiry tool. No signup. No cost. Just honest questions.",
  },
}

export default function AuditPage() {
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
        {/* ── Hero Header ────────────────────────────────────── */}
        <div className="shrink-0 px-5 sm:px-8 pt-2 sm:pt-8 pb-2 sm:pb-5 text-center relative overflow-hidden">
          {/* Soft ambient orb */}
          <div className="orb orb-blue w-[400px] h-[400px] top-[-100px] left-1/2 -translate-x-1/2 absolute opacity-[0.04]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-liquid-blue-wash items-center justify-center mx-auto mb-4">
              <ListChecks className="w-6 h-6 text-liquid-blue" />
            </div>
            <h1 className="font-serif text-[clamp(1.3rem,3.5vw,2.25rem)] font-semibold text-charcoal tracking-[-0.02em] mb-1 sm:mb-2">
              Belief Systems Audit
            </h1>
            <p className="hidden sm:block text-charcoal-soft text-sm leading-[1.7] max-w-lg mx-auto mb-4">
              A guided self-inquiry tool to help you surface inherited beliefs, trace where they came from,
              examine whether they still serve you, and find what&apos;s actually true for you now.
            </p>

            {/* Disclosure banner */}
            <div className="inline-block bg-[#F0F7FF] border border-[#D6E8FA] rounded-xl px-3 sm:px-4 py-1.5 sm:py-2.5">
              <p className="text-charcoal-mid text-[0.7rem] sm:text-xs leading-relaxed">
                Not therapy or a substitute for professional mental health care.
              </p>
            </div>
          </div>
        </div>

        {/* ── Chat Container ────────────────────────────────── */}
        <div className="h-[calc(100dvh-170px)] sm:h-auto sm:flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full px-3 sm:px-6 pb-0 sm:pb-4">
          <div className="flex-1 flex flex-col min-h-0 bg-white/80 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <AuditChat />
          </div>
        </div>
      </div>
    </>
  )
}
