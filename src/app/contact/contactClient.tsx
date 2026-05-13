"use client"

import { useState } from "react"
import type React from "react"

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    // Honeypot. Bots that fill every input populate this; real users
    // can't see or focus the field. The API treats a non-empty `company`
    // as a silent-success (no DB write, no email).
    company: "",
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
        setFormData({ name: "", email: "", message: "", company: "" })
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
        <div role="status" aria-live="polite" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
          Thank you! Your message has been sent successfully.
        </div>
      )}

      {status === "error" && (
        <div role="alert" id="contact-error" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
          Error: {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Honeypot — hidden from sighted users + screen readers + tab order.
            Real submissions leave this empty; bots that fill every input
            populate it and the API silently no-ops their request. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden">
          <label htmlFor="contact-company">Company (leave blank)</label>
          <input
            id="contact-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">
            Name<span aria-hidden="true"> *</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            aria-required="true"
            aria-invalid={status === "error" ? true : undefined}
            aria-describedby={status === "error" ? "contact-error" : undefined}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">
            Email<span aria-hidden="true"> *</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            aria-required="true"
            aria-invalid={status === "error" ? true : undefined}
            aria-describedby={status === "error" ? "contact-error" : undefined}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">
            Message<span aria-hidden="true"> *</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            aria-required="true"
            aria-invalid={status === "error" ? true : undefined}
            aria-describedby={status === "error" ? "contact-error" : undefined}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black text-white rounded-full hover:bg-black/80 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}
