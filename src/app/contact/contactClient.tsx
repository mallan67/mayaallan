"use client"

import { useState } from "react"
import type React from "react"

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setErrorMessage("")
        setFormData({ name: "", email: "", message: "" })
      } else {
        setStatus("error")
        setErrorMessage(data.details || data.error || "Unknown error")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Network error")
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-4">Contact</h1>
      <p className="text-sm text-slate-700 mb-4">
        Use this form to reach out regarding speaking, collaborations, or general inquiries.
      </p>

      {status === "success" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
          Thank you! Your message has been sent successfully.
        </div>
      )}

      {status === "error" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
          Error: {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm min-h-[120px]"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full hover:bg-black/60 transition disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}
