"use client"

import { useState } from "react"
import Link from "next/link"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  // Honeypot. Real users can't see or focus the field; bots fill every
  // input and the API silently no-ops their request.
  const [company, setCompany] = useState("")
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
        body: JSON.stringify({ email, source: "homepage", company }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Successfully subscribed!" })
        setEmail("")
        setCompany("")
      } else {
        setMessage({ type: "error", text: data.details || data.error || "Subscription failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Network error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-24" aria-labelledby="newsletter-heading">
      <div className="max-w-[740px] mx-auto px-5 md:px-9 text-center">
        <p className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-[#806000] mb-3">
          Newsletter
        </p>
        <h2 id="newsletter-heading" className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-semibold mb-4">
          Stay Connected
        </h2>
        <p className="text-charcoal-mid text-base leading-[1.8] max-w-[520px] mx-auto mb-9">
          Honest reflections on awareness, self-agency, new releases, and the questions I am exploring. Expect 1–2 emails per month.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          {/* Honeypot — hidden from sighted users + screen readers + tab order. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden">
            <label htmlFor="newsletter-company">Company (leave blank)</label>
            <input
              id="newsletter-company"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            autoComplete="email"
            required
            disabled={isLoading}
            className="px-6 py-[15px] w-full sm:w-[300px] text-[0.92rem] border-2 border-[#CDCDD2] rounded-full bg-white outline-none font-sans text-charcoal transition-all focus:border-liquid-blue focus:shadow-[0_0_0_3px_rgba(13,110,191,0.07)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-[15px] text-[0.85rem] font-semibold tracking-[0.03em] text-white bg-charcoal rounded-full border-none cursor-pointer transition-all hover:bg-black hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] disabled:opacity-50"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        <p className="mt-4 text-[0.8rem] text-charcoal-mid">
          You can unsubscribe at any time using the link included in every newsletter. See our{" "}
          <Link href="/privacy" className="underline hover:text-charcoal">
            Privacy Policy
          </Link>
          .
        </p>
        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`mt-4 text-sm font-semibold ${
              message.type === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  )
}
