"use client"

import { useEffect } from "react"
import Link from "next/link"

// App-level error boundary. Pages that throw on a server/DB failure (e.g.
// books/[slug]) land here instead of Next's bare "Application error" screen.
// Renders inside the root layout, so header/footer are preserved.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaced in the browser console + Vercel logs for diagnosis.
    console.error("App error boundary:", error)
  }, [error])

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] uppercase text-gold mb-4">
          Something went wrong
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-navy mb-4">
          This page hit a snag
        </h1>
        <p className="text-navy/70 mb-8">
          It&apos;s likely temporary. Try again in a moment — if it keeps
          happening, please let us know.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-8 py-[14px] text-[0.85rem] font-semibold tracking-[0.03em] text-white bg-navy rounded-full transition-all hover:bg-gold hover:text-navy hover:-translate-y-px"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-[14px] text-[0.85rem] font-semibold tracking-[0.03em] text-navy border border-navy/20 rounded-full transition-all hover:border-navy"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
