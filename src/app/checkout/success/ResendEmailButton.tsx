"use client"

import { useState } from "react"

type Status = "idle" | "sending" | "sent" | "rate-limited" | "error"

export default function ResendEmailButton({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<Status>("idle")

  const onClick = async () => {
    if (status === "sending" || status === "sent") return
    setStatus("sending")
    try {
      const res = await fetch("/api/checkout/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      if (res.status === 429) {
        setStatus("rate-limited")
        return
      }
      if (!res.ok) {
        setStatus("error")
        return
      }
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={status === "sending" || status === "sent"}
        className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2 disabled:opacity-50 disabled:no-underline"
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Sent — check your inbox"
            : "Didn't get the email? Resend"}
      </button>
      {status === "rate-limited" && (
        <p className="text-xs text-amber-700">
          Too many resend attempts. Please contact support if your email still hasn&apos;t arrived.
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-700">
          Something went wrong. Please contact support.
        </p>
      )}
    </div>
  )
}
