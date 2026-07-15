/**
 * /checkout/privacy-gate — intermediate step before PayPal opens.
 *
 * Purpose: address the shared-computer privacy concern. Before the buyer
 * is sent to PayPal (where session cookies on paypal.com can auto-log
 * them into a previous user's account), we require:
 *
 *   1. Explicit acknowledgment that they intend to use their OWN PayPal account.
 *   2. A clear "Sign out of PayPal first" link for shared-device cases.
 *   3. A client-side scrub of any checkout-prefixed browser state before
 *      the PayPal SDK loads.
 *   4. A primary path that opens PayPal in a POPUP (not a full-page
 *      redirect), so the merchant's page stays intact and clearing
 *      session afterward is easier.
 *   5. A fallback to the legacy full-page redirect when popup is blocked
 *      or the SDK fails to initialize.
 *
 * Server-side responsibilities:
 *   - Validate the bookId param (numeric, positive).
 *   - Hand the client side the PayPal client ID (which is public — it's
 *     designed to be exposed to the browser; the SECRET stays server-only).
 *   - Render the page with the no-store headers configured in
 *     next.config.mjs for /checkout/*.
 *
 * No DB lookup happens here — the actual order creation is deferred to
 * /api/checkout/paypal (called from the client component below) so that
 * if the buyer abandons at the gate, no PayPal order is created.
 */
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { PrivacyGateClient } from "./PrivacyGateClient"
import { sql } from "@/lib/db"
import { siteUrl } from "@/lib/site-url"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Confirm checkout",
  description: "Quick privacy check before you continue to PayPal.",
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{ bookId?: string }>

export default async function PrivacyGatePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  await headers() // mark fully dynamic

  const bookIdRaw = params.bookId
  const bookId = bookIdRaw ? Number.parseInt(bookIdRaw, 10) : NaN
  if (!Number.isInteger(bookId) || bookId <= 0) {
    redirect("/books")
  }

  let book: Record<string, any> | undefined
  try {
    const rows = await sql`
      select id, slug, title, ebook_price, allow_direct_sale, ebook_file_url
      from books
      where id = ${bookId}
      limit 1
    `
    book = rows[0]
  } catch (err) {
    // A transient DB error must not collapse to a 404 mid-checkout — throw to
    // the retryable error boundary. A missing row (checked below) is the 404.
    throw new Error(
      `Checkout book lookup failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
  if (!book) notFound()
  if (!book.allow_direct_sale || !book.ebook_price || !book.ebook_file_url) {
    // Book exists but isn't sellable via direct PayPal — back to book page.
    redirect(`/books/${book.slug}`)
  }

  const paypalClientId = process.env.PAYPAL_CLIENT_ID ?? ""
  const paypalEnv = (process.env.PAYPAL_ENV ?? "sandbox").trim().toLowerCase()
  const sdkOrigin =
    paypalEnv === "live" ? "https://www.paypal.com" : "https://www.sandbox.paypal.com"

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <header className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.84 21h16.32a2 2 0 0 0 1.73-2.96L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h1 className="font-serif text-xl font-semibold text-slate-900">
            Quick privacy check
          </h1>
          <p className="text-sm text-slate-600">
            <strong>{book.title}</strong>
            <span className="text-slate-400"> · </span>
            <span className="font-semibold">${Number(book.ebook_price).toFixed(2)}</span>
          </p>
        </header>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2 text-sm leading-relaxed text-amber-900">
          <p className="font-semibold">Before you continue to PayPal:</p>
          <p>
            PayPal&apos;s checkout will use any PayPal account you&apos;re currently signed into in this browser. If
            someone else used this computer recently, that may not be your account.
          </p>
          <p>
            If you&apos;re on a shared or public computer:
            {" "}
            <a
              href="https://www.paypal.com/signout"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-amber-950"
            >
              sign out of PayPal first
            </a>
            , then come back and click Continue.
          </p>
        </div>

        <PrivacyGateClient
          bookId={book.id}
          bookSlug={book.slug}
          bookTitle={book.title}
          priceLabel={`$${Number(book.ebook_price).toFixed(2)}`}
          paypalClientId={paypalClientId}
          sdkOrigin={sdkOrigin}
          siteUrl={siteUrl()}
        />

        <footer className="text-center">
          <Link
            href={`/books/${book.slug}`}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Cancel and go back
          </Link>
        </footer>
      </div>
    </main>
  )
}
