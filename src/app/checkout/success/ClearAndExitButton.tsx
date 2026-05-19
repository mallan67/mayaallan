"use client"

import { useEffect } from "react"

/**
 * "Finished — Clear this purchase" button.
 *
 * Two behaviors:
 *
 * 1. On mount: defensively purge any client-side state that COULD contain
 *    checkout / buyer information. The codebase has been audited — nothing
 *    currently writes buyer PII to storage — but we clear defensively in
 *    case a future change does, or in case a third-party script does.
 *
 * 2. On click: re-run the purge AND redirect to a neutral landing page
 *    (the original book page or homepage).
 *
 * Privacy reasoning: on a shared computer, the next person to use this
 * browser should see no trace of who just bought.
 */
const CHECKOUT_STORAGE_PREFIXES = [
  // Defensive list — these prefixes COULD plausibly be used by checkout-
  // related code. Currently the codebase uses none of these for PII; if
  // any future code does, the clear here remains correct.
  "paypal_",
  "stripe_",
  "checkout_",
  "buyer_",
  "order_",
  "payer_",
  "cart_",
]

function clearCheckoutStorage(): void {
  if (typeof window === "undefined") return

  // sessionStorage + localStorage: remove any key whose name begins with
  // a checkout-related prefix.
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
    } catch {
      // Storage can throw in private mode / quota exceeded — silent OK.
    }
  }

  // Cookies set by our app for checkout (mirror the prefix list above).
  // We can only clear cookies set on our own domain — PayPal's cookies
  // on paypal.com are unreachable from here, by design of the web.
  try {
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const eqIdx = cookie.indexOf("=")
      const name = (eqIdx > -1 ? cookie.slice(0, eqIdx) : cookie).trim()
      if (!name) continue
      if (CHECKOUT_STORAGE_PREFIXES.some((p) => name.toLowerCase().startsWith(p))) {
        // Expire the cookie. Match path=/; default domain. If a cookie was
        // set with a specific subdomain we can't always clear it cleanly,
        // but for first-party app cookies this covers the common case.
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
      }
    }
  } catch {
    // Document/cookie access can fail in some embedded contexts — silent OK.
  }
}

export function ClearAndExitButton({ exitHref }: { exitHref: string }) {
  // Defensive clear on mount — even if the buyer doesn't click "Finished",
  // simply LANDING on the success page wipes any checkout-shaped state.
  useEffect(() => {
    clearCheckoutStorage()
  }, [])

  const handleFinished = () => {
    clearCheckoutStorage()
    // Use replace() rather than assign() so the success URL doesn't sit in
    // the back-button history — pressing Back on the destination page must
    // NOT bring the buyer (or the next person at the computer) back to a
    // page that confirms a purchase just happened.
    window.location.replace(exitHref)
  }

  return (
    <button
      type="button"
      onClick={handleFinished}
      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm hover:shadow"
    >
      Finished — Clear this purchase
    </button>
  )
}
