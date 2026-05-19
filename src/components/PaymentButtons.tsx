"use client"

import { useState } from "react"

interface PaymentButtonsProps {
  bookId: number
  /** Whether to render the Stripe checkout button. Default true. */
  hasStripe?: boolean
  /**
   * Whether to render the PayPal direct-checkout button.
   *
   * Recommended: false now that Stripe is live. Stripe Checkout already
   * offers PayPal as a payment method (when enabled in the Stripe Dashboard),
   * which means buyers who want to use PayPal still can — without the
   * shared-device session-cookie exposure the standalone PayPal flow has.
   *
   * Pass true only if you specifically want both buttons visible side-by-side
   * during a transition window.
   */
  hasPayPal?: boolean
  /** Format shown on the button so the customer knows what they're buying. */
  formatLabel?: string
  /** Display price shown on the button (e.g. "$9.99"). */
  priceLabel?: string
}

export function PaymentButtons({
  bookId,
  // Stripe button is hidden by default while the Stripe Link cross-merchant
  // session behavior (and Stripe's 5-10-business-day card refund timing)
  // are evaluated. The Stripe integration code is fully shipped and live —
  // pass `hasStripe={true}` from the call site to re-enable.
  hasStripe = false,
  hasPayPal = true,
  formatLabel = "Ebook",
  priceLabel,
}: PaymentButtonsProps) {
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [loadingPayPal, setLoadingPayPal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async (
    endpoint: "/api/checkout/stripe" | "/api/checkout/paypal",
    setLoading: (v: boolean) => void,
  ) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      })
      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Failed to create checkout session")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const handleStripeCheckout = () => startCheckout("/api/checkout/stripe", setLoadingStripe)
  const handlePayPalCheckout = () => startCheckout("/api/checkout/paypal", setLoadingPayPal)

  // Shared lock-icon SVG. Single inline source avoids a network request and
  // platform emoji-rendering inconsistencies.
  const LockIcon = () => (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="9" width="13" height="8" rx="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {hasStripe && (
          <button
            onClick={handleStripeCheckout}
            disabled={loadingStripe || loadingPayPal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-center bg-charcoal text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            aria-label={
              loadingStripe
                ? "Processing payment"
                : `Buy ${formatLabel}${priceLabel ? ` ${priceLabel}` : ""}`
            }
          >
            <LockIcon />
            <span>
              {loadingStripe ? (
                "Processing…"
              ) : (
                <>
                  Buy {formatLabel}
                  {priceLabel && (
                    <span className="font-normal opacity-90"> · {priceLabel}</span>
                  )}
                </>
              )}
            </span>
          </button>
        )}
        {hasPayPal && (
          <button
            onClick={handlePayPalCheckout}
            disabled={loadingPayPal || loadingStripe}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            aria-label={
              loadingPayPal
                ? "Processing payment"
                : `Buy ${formatLabel} with PayPal${priceLabel ? ` ${priceLabel}` : ""}`
            }
          >
            <LockIcon />
            <span>
              {loadingPayPal ? (
                "Processing…"
              ) : (
                <>
                  Buy {formatLabel} with PayPal
                  {priceLabel && (
                    <span className="font-normal opacity-90"> · {priceLabel}</span>
                  )}
                </>
              )}
            </span>
          </button>
        )}
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/*
        Shared-computer disclosure. PayPal's hosted checkout reads its own
        session cookies on paypal.com — if a previous user stayed logged in,
        the current visitor lands on that account by default and there is
        no sign-out button on PayPal's checkout page. We cannot fix this on
        our side (paypal.com is a different origin from mayaallan.com), but
        we can warn buyers and give them the signout URL up front so they
        can fix it themselves before continuing.
      */}
      {hasPayPal && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 space-y-1.5">
          <p className="text-xs text-amber-900 font-medium leading-snug">
            Using a shared computer? Make sure you&apos;re signed into your own PayPal account before purchasing.
          </p>
          <p className="text-[11px] text-amber-800 leading-snug">
            Need to switch accounts?{" "}
            <a
              href="https://www.paypal.com/signout"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-amber-950"
            >
              Sign out of PayPal
            </a>
            {" "}then return here and click Buy again.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Secure payment via PayPal. {formatLabel} download link emailed immediately after purchase.
      </p>
    </div>
  )
}
