"use client"

import { useState } from "react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Successfully subscribed!" })
        setEmail("")
      } else {
        setMessage({ type: "error", text: data.error || "Subscription failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h2 className="font-serif text-2xl font-semibold mb-4">Stay Connected</h2>
        <p className="text-slate-600 mb-6">
          Join the newsletter for updates on new releases, events, and insights.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            disabled={isLoading}
            className="px-4 py-3 border border-slate-300 rounded-full text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 text-sm font-semibold text-white bg-black rounded-full hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  )
}
