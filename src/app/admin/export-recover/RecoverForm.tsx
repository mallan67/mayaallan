"use client"

import { useState } from "react"

type RecoverResponse = {
  status?: string
  message?: string
  error?: string
  orderId?: string
  sessionId?: string
  tool?: string
  recipientDomain?: string | null
  capturedAmount?: { value?: string; currency_code?: string }
  payerEmail?: string | null
  details?: string
  orderStatus?: string
  captureStatuses?: string[]
  customId?: string
}

export function RecoverForm() {
  const [orderId, setOrderId] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<RecoverResponse | null>(null)
  const [httpStatus, setHttpStatus] = useState<number | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setResult(null)
    setHttpStatus(null)

    try {
      const body: Record<string, string> = { orderId: orderId.trim() }
      if (recipientEmail.trim()) body.recipientEmail = recipientEmail.trim()

      const res = await fetch("/api/admin/export/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({ error: "Non-JSON response" }))
      setHttpStatus(res.status)
      setResult(json)
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : String(err) })
      setHttpStatus(0)
    } finally {
      setBusy(false)
    }
  }

  const isSuccess = httpStatus === 200 && result?.status === "delivered"
  const isAlreadyFulfilled = httpStatus === 200 && result?.status === "already-fulfilled"
  const isNotFound = result?.status === "session-not-found"
  const isError = httpStatus !== null && httpStatus !== 200

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="orderId" className="block text-sm font-medium text-slate-900 mb-1.5">
          PayPal Order ID <span className="text-red-600">*</span>
        </label>
        <input
          id="orderId"
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. 19669393M95070412"
          required
          autoComplete="off"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <p className="mt-1 text-xs text-slate-500">
          From PayPal Activity → click the transaction → the long alphanumeric ID
        </p>
      </div>

      <div>
        <label htmlFor="recipientEmail" className="block text-sm font-medium text-slate-900 mb-1.5">
          Override recipient email (optional)
        </label>
        <input
          id="recipientEmail"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="leave blank to use buyer's email from session"
          autoComplete="off"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <p className="mt-1 text-xs text-slate-500">
          Send to a different address (e.g. yourself for testing). Default is the buyer&apos;s email.
        </p>
      </div>

      <button
        type="submit"
        disabled={busy || !orderId.trim()}
        className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {busy ? "Recovering…" : "Recover and deliver PDF"}
      </button>

      {result && (
        <div
          className={
            "mt-6 p-5 rounded-lg border " +
            (isSuccess
              ? "bg-green-50 border-green-200"
              : isAlreadyFulfilled
                ? "bg-blue-50 border-blue-200"
                : isNotFound
                  ? "bg-amber-50 border-amber-200"
                  : isError
                    ? "bg-red-50 border-red-200"
                    : "bg-slate-50 border-slate-200")
          }
          role="status"
          aria-live="polite"
        >
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h2 className="font-semibold text-slate-900">
              {isSuccess && "✓ Delivered"}
              {isAlreadyFulfilled && "Already fulfilled"}
              {isNotFound && "Session not found"}
              {isError && `Error (HTTP ${httpStatus})`}
              {!isSuccess && !isAlreadyFulfilled && !isNotFound && !isError && "Result"}
            </h2>
            {httpStatus !== null && (
              <span className="text-xs text-slate-500">HTTP {httpStatus}</span>
            )}
          </div>
          {result.message && (
            <p className="text-sm text-slate-700 leading-relaxed mb-3">{result.message}</p>
          )}
          {result.error && (
            <p className="text-sm text-red-800 leading-relaxed mb-3">{result.error}</p>
          )}
          <pre className="text-xs bg-white border border-slate-200 rounded p-3 overflow-x-auto text-slate-700">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </form>
  )
}
