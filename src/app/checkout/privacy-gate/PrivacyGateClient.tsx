"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Client component for the privacy gate.
 *
 * Flow:
 *   1. Render the confirmation checkbox + Continue button (disabled).
 *   2. When buyer ticks the box, enable the Continue button.
 *   3. On click, scrub client-side state (localStorage / sessionStorage /
 *      checkout cookies), then load the PayPal SDK v6 script if not loaded,
 *      then call sdkInstance.createPayPalOneTimePaymentSession({onApprove,
 *      onCancel, onError}) and session.start({presentationMode:"popup"}, ...).
 *   4. createOrder() callback POSTs to our existing /api/checkout/paypal,
 *      which returns {url, orderId}. The SDK uses orderId for the popup.
 *   5. onApprove POSTs to /api/checkout/paypal/capture-order, which captures
 *      the payment and returns success.
 *   6. On success, redirect to /checkout/success.
 *   7. If popup is blocked OR SDK fails to load, fall back to legacy
 *      full-page redirect using the same {url} we already have.
 *
 * Browser autofill defense (#12 in the spec): we set autocomplete="off"
 * on every interactive element, including a honeypot field. Browsers
 * mostly ignore autocomplete="off" on email/password fields, but for
 * non-credential fields and form elements outside <form>, they generally
 * honor it. We have no email field here — buyer email is collected by
 * PayPal in the popup — so there's no autofill surface that could leak.
 */

// PayPal SDK script URL — depends on env (live vs sandbox). Resolved
// server-side in the parent and passed in as sdkOrigin.
const SDK_PATH = "/web-sdk/v6/core"

type PrivacyGateClientProps = {
  bookId: number
  bookSlug: string
  bookTitle: string
  priceLabel: string
  paypalClientId: string
  sdkOrigin: string // "https://www.paypal.com" or sandbox equivalent
  siteUrl: string
}

const CHECKOUT_STORAGE_PREFIXES = ["paypal_", "checkout_", "buyer_", "order_", "payer_", "cart_"]

function clearCheckoutClientState(): void {
  if (typeof window === "undefined") return
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (!key) continue
        if (CHECKOUT_STORAGE_PREFIXES.some((p) => key.toLowerCase().startsWith(p))) {
          keysToRemove.push(key)
        }
      }
      for (const key of keysToRemove) storage.removeItem(key)
    } catch { /* private mode / quota errors are non-fatal */ }
  }
  try {
    for (const cookie of document.cookie.split(";")) {
      const name = (cookie.split("=")[0] ?? "").trim()
      if (!name) continue
      if (CHECKOUT_STORAGE_PREFIXES.some((p) => name.toLowerCase().startsWith(p))) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
      }
    }
  } catch { /* document.cookie can throw in some embedded contexts */ }
}

/**
 * Load the PayPal SDK v6 script once per page. Resolves to window.paypal.
 * Rejects if the script fails to load (network blocked / CSP rejected /
 * PayPal outage).
 */
function loadPayPalSdk(sdkOrigin: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("PayPal SDK can only load in the browser"))
      return
    }
    if ((window as any).paypal) {
      resolve((window as any).paypal)
      return
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-paypal-sdk-v6]")
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).paypal))
      existing.addEventListener("error", () => reject(new Error("PayPal SDK script failed to load")))
      return
    }
    const script = document.createElement("script")
    script.src = `${sdkOrigin}${SDK_PATH}`
    script.async = true
    script.dataset.paypalSdkV6 = "true"
    script.addEventListener("load", () => resolve((window as any).paypal))
    script.addEventListener("error", () => reject(new Error("PayPal SDK script failed to load")))
    document.head.appendChild(script)
  })
}

export function PrivacyGateClient({
  bookId,
  bookSlug,
  bookTitle,
  priceLabel,
  paypalClientId,
  sdkOrigin,
  siteUrl,
}: PrivacyGateClientProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false) // prevent double-clicks

  // Defensive scrub on mount — even before the buyer clicks Continue,
  // simply landing on this gate wipes any prior checkout-prefixed state.
  useEffect(() => {
    clearCheckoutClientState()
  }, [])

  const fallbackToRedirect = async (orderCreateUrl: string) => {
    // Legacy full-page redirect — we have the approve URL from the
    // create-order call. window.location.replace() so back-button doesn't
    // return to this gate (which would offer to start a new checkout).
    window.location.replace(orderCreateUrl)
  }

  const handleContinue = async () => {
    if (!confirmed || startedRef.current) return
    startedRef.current = true
    setLoading(true)
    setError(null)

    // ALWAYS clear state again right before the popup opens — even if the
    // useEffect already ran, defense in depth.
    clearCheckoutClientState()

    // Create the PayPal order server-side. Returns BOTH approve URL
    // (for the legacy redirect fallback) and orderId (for SDK popup).
    let orderId: string
    let approveUrl: string
    try {
      const res = await fetch("/api/checkout/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      })
      const data = await res.json()
      if (!res.ok || !data.orderId || !data.url) {
        throw new Error(data.error || "Could not start checkout")
      }
      orderId = data.orderId
      approveUrl = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout")
      setLoading(false)
      startedRef.current = false
      return
    }

    // Try to load + initialize the PayPal SDK v6. On any failure (script
    // blocked, CSP issue, SDK init error), fall back to the legacy
    // redirect with the approve URL we already have.
    let sdkInstance: any = null
    try {
      if (!paypalClientId) throw new Error("PayPal client id not configured")
      const paypal: any = await loadPayPalSdk(sdkOrigin)
      sdkInstance = await paypal.createInstance({
        clientId: paypalClientId,
        components: ["paypal-payments"],
        pageType: "checkout",
      })
    } catch (err) {
      console.warn("PayPal SDK init failed; falling back to redirect:", err)
      await fallbackToRedirect(approveUrl)
      return
    }

    // SDK loaded. Open the popup. createOrder() callback returns the
    // orderId we already created server-side.
    try {
      const session = sdkInstance.createPayPalOneTimePaymentSession({
        async onApprove(data: { orderId: string }) {
          // Buyer authorized in the popup. Capture server-side.
          try {
            const capRes = await fetch("/api/checkout/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId }),
            })
            const capData = await capRes.json()
            if (!capRes.ok || !capData.success) {
              setError(capData.error || "Capture failed. Please contact support.")
              setLoading(false)
              startedRef.current = false
              return
            }
            // Success — redirect to the dedicated success page.
            // window.location.replace so back-button doesn't return here.
            const successUrl = `${siteUrl}/checkout/success?via=paypal&orderId=${encodeURIComponent(data.orderId)}&bookSlug=${encodeURIComponent(bookSlug)}`
            window.location.replace(successUrl)
          } catch (err) {
            setError(err instanceof Error ? err.message : "Capture failed")
            setLoading(false)
            startedRef.current = false
          }
        },
        onCancel() {
          // Buyer dismissed the popup. Re-enable the button so they can retry.
          setLoading(false)
          startedRef.current = false
        },
        onError(err: unknown) {
          console.error("PayPal SDK session error:", err)
          setError("Payment was interrupted. Please try again.")
          setLoading(false)
          startedRef.current = false
        },
      })

      // start() returns when the popup is dismissed (success/cancel/error
      // is signaled via the callbacks above, not the promise resolution).
      // presentationMode "auto" tells the SDK to pick popup unless blocked,
      // then fall back to redirect within paypal.com's flow.
      await session.start({ presentationMode: "auto" }, Promise.resolve({ orderId }))
    } catch (err) {
      console.warn("PayPal SDK session.start failed; falling back to redirect:", err)
      await fallbackToRedirect(approveUrl)
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          autoComplete="off"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
        />
        <span className="text-sm text-slate-700 leading-snug">
          <strong className="text-slate-900">This is my PayPal account.</strong> I&apos;m on a personal
          device (or I&apos;ve signed out of any other PayPal account in this browser).
        </span>
      </label>

      {/*
        Honeypot field — invisible to humans, attractive to bots that auto-
        fill any input they find. autocomplete="new-password" tells password
        managers / browsers NOT to fill this with stored credentials.
        Real submissions check this is empty server-side; bots fill it,
        humans don't see it.
      */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="new-password"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
        defaultValue=""
        name="confirm_email_double"
      />

      <button
        type="button"
        onClick={handleContinue}
        disabled={!confirmed || loading}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-charcoal text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
      >
        {loading ? "Opening PayPal…" : `Continue to PayPal · ${priceLabel}`}
      </button>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50" role="alert">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <p className="text-xs text-slate-500 leading-snug">
        PayPal will open in a small popup window. {bookTitle} download link is emailed immediately after payment completes.
        If the popup is blocked by your browser, you&apos;ll be redirected to PayPal&apos;s site as a fallback.
      </p>
    </div>
  )
}
