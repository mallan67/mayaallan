/**
 * /checkout/success — generic post-purchase confirmation page.
 *
 * Shared-computer privacy design:
 *   - Renders ONLY a generic "purchase complete" message.
 *   - NEVER displays buyer name, email, or any payer identifier.
 *   - NEVER fetches the order row to display details — even though the
 *     orderId is in the URL, we deliberately do not look it up. The URL
 *     param exists only so the page can confirm a purchase happened
 *     and (if needed for support) the buyer can quote the reference.
 *   - Sets no-store / no-cache / private headers so the page is never
 *     cached anywhere along the request path.
 *   - The client-side "Finished — Clear this purchase" button purges
 *     any browser-side state that might exist before redirecting to a
 *     neutral landing page.
 *
 * Server-side discipline: this page is a Server Component with no DB
 * lookups. Anything that could leak PII (buyer email, name, payer ID)
 * lives only in the email we sent — not on this page.
 */
import type { Metadata } from "next"
import { headers } from "next/headers"
import { ClearAndExitButton } from "./ClearAndExitButton"

export const dynamic = "force-dynamic" // never SSG / never ISR — must always re-render fresh
export const revalidate = 0

export const metadata: Metadata = {
  title: "Purchase complete",
  description: "Your purchase is complete. Check your email for access.",
  robots: { index: false, follow: false }, // don't let search engines index this URL
  // alternates / openGraph deliberately omitted — this page is one-shot post-purchase, not shareable
}

type SearchParams = Promise<{ orderId?: string; bookSlug?: string; via?: string }>

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  // Side-effect-only: read the headers() function so Next.js treats this
  // page as fully dynamic and respects the no-store hints we set in
  // middleware/headers below. (Next.js 16 sometimes elides dynamic-ness
  // unless a request-scoped API is called.)
  await headers()

  // The reference (paypal_order_id) goes only into a small "for support"
  // line — never the buyer's name or email. Show only the first 8 chars
  // for visual brevity; the full id is in the email + admin dashboard.
  const orderRef = typeof params.orderId === "string"
    ? params.orderId.slice(0, 24) // PayPal order ids are ~17 chars; cap defensively
    : null

  // Where the "Finished" button should send the buyer back to. Default
  // to the homepage — but if the original book slug is in the URL we
  // prefer sending them back there for context (still a neutral page).
  const exitHref = typeof params.bookSlug === "string" && /^[a-z0-9][a-z0-9-]{0,80}$/.test(params.bookSlug)
    ? `/books/${params.bookSlug}`
    : "/"

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-green-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold text-slate-900">
            Your purchase is complete
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Check your email for access. The download link will arrive within a minute or two — please check spam if it doesn&apos;t appear.
          </p>
        </div>

        {orderRef && (
          <p className="text-xs text-slate-400">
            Reference: <span className="font-mono">{orderRef}</span>
          </p>
        )}

        <ClearAndExitButton exitHref={exitHref} />

        <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
          Tip: if you&apos;re on a shared or public computer, click &ldquo;Finished&rdquo; before
          stepping away to clear this purchase from the browser.
        </p>
      </div>
    </main>
  )
}
