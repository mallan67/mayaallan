"use client"

import { useState } from "react"

interface PaymentButtonsProps {
  bookId: number
  hasStripe: boolean
  hasPayPal: boolean
}

export function PaymentButtons({ bookId, hasStripe, hasPayPal }: PaymentButtonsProps) {
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [loadingPayPal, setLoadingPayPal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStripeCheckout = async () => {
    setLoadingStripe(true)
    setError(null)

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Failed to create checkout session")
        setLoadingStripe(false)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoadingStripe(false)
    }
  }

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
        {hasStripe && (
          <button
            onClick={handleStripeCheckout}
            disabled={loadingStripe || loadingPayPal}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-center bg-black text-white rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <span>💳</span>
            {loadingStripe ? "Processing..." : "Pay with Card"}
          </button>
        )}
        {hasPayPal && (
          <button
            onClick={handlePayPalCheckout}
            disabled={loadingStripe || loadingPayPal}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <span>🅿️</span>
            {loadingPayPal ? "Processing..." : "Pay with PayPal"}
          </button>
        )}
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Secure payment. Download link sent to your email after purchase.
      </p>
    </div>
  )
}
