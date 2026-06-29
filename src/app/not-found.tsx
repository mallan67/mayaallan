import Link from "next/link"

// Branded 404. Renders inside the root layout, so it inherits the site
// header + footer automatically — no more bare, unstyled Next default 404.
export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] uppercase text-gold mb-4">
          404 — Page not found
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-navy mb-4">
          We couldn&apos;t find that page
        </h1>
        <p className="text-navy/70 mb-8">
          The page you&apos;re looking for may have moved or no longer exists.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-[14px] text-[0.85rem] font-semibold tracking-[0.03em] text-white bg-navy rounded-full transition-all hover:bg-gold hover:text-navy hover:-translate-y-px"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
