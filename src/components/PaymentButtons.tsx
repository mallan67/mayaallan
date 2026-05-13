"use client"

import { useState } from "react"

interface PaymentButtonsProps {
  bookId: number
  hasPayPal: boolean
  /** Format label shown on the button so the customer knows what they're buying. */
  formatLabel?: string
  /** Display price shown on the button (e.g. "$9.99"). */
  priceLabel?: string
}

export function PaymentButtons({
  bookId,
  hasPayPal,
  formatLabel = "Ebook",
  priceLabel,
}: PaymentButtonsProps) {
  const [loadingPayPal, setLoadingPayPal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayPalCheckout = async () => {
    setLoadingPayPal(true)
    setError(null)

    try {
      const response = await fetch("/api/checkout/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Failed to create checkout session")
        setLoadingPayPal(false)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoadingPayPal(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {hasPayPal && (
          <button
            onClick={handlePayPalCheckout}
            disabled={loadingPayPal}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            aria-label={
              loadingPayPal
                ? "Processing payment"
                : `Pay with PayPal — ${formatLabel}${priceLabel ? ` ${priceLabel}` : ""}`
            }
          >
            <span aria-hidden="true">🅿️</span>
            <span>
              {loadingPayPal ? (
                "Processing…"
              ) : (
                <>
                  Pay with PayPal — {formatLabel}
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
      <p className="text-xs text-slate-500">
        Secure payment via PayPal. {formatLabel} download link sent to your email immediately after purchase.
      </p>
    </div>
  )
}
