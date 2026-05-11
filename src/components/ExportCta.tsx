"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import {
  trackExportCtaViewed,
  trackExportCtaClicked,
  type AnalyticsTool,
} from "@/lib/analytics"

type Props = {
  tool: AnalyticsTool
  messages: Array<{ role: "user" | "assistant"; text: string }>
}

export function ExportCta({ tool, messages }: Props) {
  const [email, setEmail] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [showPromo, setShowPromo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [delivered, setDelivered] = useState(false)

  useEffect(() => {
    trackExportCtaViewed(tool)
  }, [tool])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return
    setError(null)
    setLoading(true)
    trackExportCtaClicked(tool)

    const trimmedCode = promoCode.trim()
    const payload: Record<string, unknown> = {
      tool,
      messages,
      email: email.trim(),
    }
    if (trimmedCode) payload.promoCode = trimmedCode

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `Request failed (${res.status})`)
      }
      const data = (await res.json()) as {
        checkoutUrl?: string
        promoApplied?: boolean
      }
      if (data.promoApplied) {
        setDelivered(true)
        setLoading(false)
        return
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      throw new Error("Unexpected response")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  if (delivered) {
    return (
      <div className="mx-4 sm:mx-6 my-4 p-5 rounded-2xl border border-green-200 bg-green-50/60">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Download className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-charcoal">
              On its way.
            </h3>
            <p className="text-charcoal-soft text-sm mt-0.5">
              We&apos;ve emailed your PDF to <strong>{email}</strong>. Give it a
              minute or two to land. Check your spam folder if you don&apos;t see it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const hasPromo = promoCode.trim().length > 0

  return (
    <div className="mx-4 sm:mx-6 my-4 p-5 rounded-2xl border border-liquid-blue/20 bg-[#F0F7FF]/40">
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-liquid-blue/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-liquid-blue" />
        </div>
        <div>
          <h3 className="font-serif text-base font-semibold text-charcoal">
            Want a copy you can print?
          </h3>
          <p className="text-charcoal-soft text-sm mt-0.5">
            We&apos;ll email you a beautifully-formatted PDF you can print or keep — <strong>$9.99</strong>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            className="flex-1 bg-white border border-[#B8BCC0] rounded-xl px-3 py-2 h-10 text-sm text-charcoal placeholder:text-charcoal-soft focus:outline-none focus:border-liquid-blue/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="px-5 h-10 rounded-xl bg-liquid-blue text-white text-sm font-medium hover:bg-liquid-blue-bright transition-colors disabled:opacity-50"
          >
            {loading
              ? "Preparing..."
              : hasPromo
              ? "Email me the PDF"
              : "Email me the PDF — $9.99"}
          </button>
        </div>

        {showPromo ? (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code"
              disabled={loading}
              className="flex-1 bg-white border border-[#B8BCC0] rounded-xl px-3 py-2 h-9 text-sm text-charcoal placeholder:text-charcoal-soft focus:outline-none focus:border-liquid-blue/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                setShowPromo(false)
                setPromoCode("")
                setError(null)
              }}
              className="text-charcoal-soft/70 hover:text-charcoal-mid text-xs underline transition-colors"
            >
              Hide
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPromo(true)}
            className="text-charcoal-soft/70 hover:text-liquid-blue text-xs underline transition-colors"
          >
            Have a promo code?
          </button>
        )}
      </form>

      {error && (
        <p className="text-red-600 text-xs mt-2">{error}</p>
      )}

      <p className="text-charcoal-soft/60 text-[11px] mt-3">
        {hasPromo
          ? "Promo codes deliver your PDF directly — no payment needed."
          : "Payment processed via PayPal. Your PDF will be emailed to you after checkout."}{" "}
        This is a reflection aid, not therapy.
      </p>
    </div>
  )
}
