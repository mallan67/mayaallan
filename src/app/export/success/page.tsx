import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Payment Received — Your PDF Is On Its Way | Maya Allan",
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{ tool?: string }>

const TOOL_DISPLAY: Record<string, string> = {
  reset: "Nervous System Reset",
  belief_inquiry: "Belief Inquiry",
  integration: "Integration",
}

export default async function ExportSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const toolDisplay = params.tool ? TOOL_DISPLAY[params.tool] ?? "session" : "session"

  return (
    <div className="bg-white min-h-[calc(100dvh-80px)] flex items-center justify-center px-5 py-16">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0F7FF] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9 text-liquid-blue" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal mb-3">
          Thank you — your PDF is on its way
        </h1>
        <p className="text-charcoal-soft text-base leading-relaxed mb-6">
          Your {toolDisplay} keepsake will arrive in your inbox within a few minutes.
          If you don&apos;t see it, check your spam folder.
        </p>
        <Link
          href="/tools"
          className="inline-block px-6 py-3 rounded-xl bg-liquid-blue text-white font-medium text-sm hover:bg-liquid-blue-bright transition-colors"
        >
          Back to Tools
        </Link>
      </div>
    </div>
  )
}
