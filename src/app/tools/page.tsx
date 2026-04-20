import type { Metadata } from "next"
import Link from "next/link"
import { ListChecks, Wind, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Tools — Belief Inquiry, Nervous System Reset, Integration | Maya Allan",
  description:
    "Three free AI-guided reflection tools: Nervous System Reset for regulation, Belief Inquiry for examining inherited beliefs, and Integration for letting new insight land.",
  openGraph: {
    title: "Tools — Free AI-Guided Reflection Tools",
    description: "Nervous System Reset, Belief Inquiry, Integration. Free, no signup.",
    url: "https://www.mayaallan.com/tools",
    siteName: "Maya Allan",
    type: "website",
  },
}

const TOOLS = [
  {
    href: "/reset",
    icon: Wind,
    title: "Nervous System Reset",
    blurb: "Return to a regulated state. Body-first. For when you feel activated, shutdown, or overwhelmed.",
    time: "~10 min",
  },
  {
    href: "/belief-inquiry",
    icon: ListChecks,
    title: "Belief Inquiry",
    blurb: "Explore an inherited belief with curiosity. Uses Clean Language to help you see what's been running in the background.",
    time: "~15 min",
  },
  {
    href: "/integration",
    icon: Sparkles,
    title: "Integration",
    blurb: "Help a new insight or experience land. Hold the new alongside the old and let the shift consolidate.",
    time: "~10 min",
  },
]

export default function ToolsPage() {
  return (
    <div className="bg-white min-h-[calc(100dvh-80px)] px-4 sm:px-8 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10 sm:mb-16">
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.75rem)] font-semibold text-charcoal tracking-[-0.02em] mb-4">
            Tools
          </h1>
          <p className="text-charcoal-soft text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Three free AI-guided reflection tools. No signup. Save a session as
            a PDF for $9.99 if you want to keep it.
          </p>
        </header>

        <section className="mb-8 sm:mb-12 p-5 sm:p-6 rounded-2xl bg-[#F0F7FF]/40 border border-[#D6E8FA]/50">
          <p className="text-charcoal-mid text-sm sm:text-base leading-relaxed">
            <strong className="font-semibold text-charcoal">New here?</strong>{" "}
            Start with <strong>Reset</strong> if your body feels activated or foggy.
            Start with <strong>Belief Inquiry</strong> if you want to examine a belief.
            Come back to <strong>Integration</strong> after insight — it&apos;s where the new experience lands.
          </p>
        </section>

        <div className="grid gap-5 sm:gap-6 sm:grid-cols-1">
          {TOOLS.map(({ href, icon: Icon, title, blurb, time }) => (
            <Link
              key={href}
              href={href}
              className="block group p-6 sm:p-7 rounded-2xl bg-white border border-[#E8ECF0] hover:border-liquid-blue/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-liquid-blue-wash flex items-center justify-center">
                  <Icon className="w-6 h-6 text-liquid-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-charcoal group-hover:text-liquid-blue transition-colors">
                      {title}
                    </h2>
                    <span className="text-charcoal-soft/70 text-xs sm:text-sm whitespace-nowrap">{time}</span>
                  </div>
                  <p className="text-charcoal-soft text-sm sm:text-base leading-relaxed">{blurb}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-10 sm:mt-14 text-center">
          <p className="text-charcoal-soft/70 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            These tools are educational reflection aids, not therapy. If you&apos;re in crisis,
            please reach out to the 988 Suicide &amp; Crisis Lifeline — call or text 988.
          </p>
        </footer>
      </div>
    </div>
  )
}
