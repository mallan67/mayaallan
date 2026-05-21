"use client"

import { useState } from "react"

interface PaymentButtonsProps {
  bookId: number
  /** Whether to render the PayPal direct-checkout button. */
  hasPayPal?: boolean
  /** Format shown on the button so the customer knows what they're buying. */
  formatLabel?: string
  /** Display price shown on the button (e.g. "$9.99"). */
  priceLabel?: string
}

export function PaymentButtons({
  bookId,
  hasPayPal = true,
  formatLabel = "Ebook",
  priceLabel,
}: PaymentButtonsProps) {
  const [loadingPayPal, setLoadingPayPal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PayPal routes through the /checkout/privacy-gate page rather than
  // POSTing directly. The gate forces explicit "this is my PayPal account"
  // confirmation, clears any client-side checkout state, and then opens
  // PayPal in a popup via SDK v6 (with a redirect fallback).
  const goToPrivacyGate = () => {
    setLoadingPayPal(true)
    setError(null)
    window.location.href = `/checkout/privacy-gate?bookId=${encodeURIComponent(String(bookId))}`
  }

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
        {hasPayPal && (
          <button
            onClick={goToPrivacyGate}
            disabled={loadingPayPal}
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
                "Processing..."
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
