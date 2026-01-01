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
    <div className="p-4 border border-green-200 rounded-xl bg-green-50">
      <h3 className="text-sm font-semibold text-green-800 mb-3">💳 Buy Direct from Author</h3>
      <div className="flex flex-wrap gap-3">
        {hasStripe && (
          <button
            onClick={handleStripeCheckout}
            disabled={loadingStripe || loadingPayPal}
            className="inline-block px-5 py-2.5 text-sm font-semibold text-center bg-black text-white rounded-full hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStripe ? "Loading..." : "Buy Now - Card"}
          </button>
        )}
        {hasPayPal && (
          <button
            onClick={handlePayPalCheckout}
            disabled={loadingStripe || loadingPayPal}
            className="inline-block px-5 py-2.5 text-sm font-semibold text-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPayPal ? "Loading..." : "Buy Now - PayPal"}
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}
