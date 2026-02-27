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
        setMessage({ type: "error", text: data.details || data.error || "Subscription failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Network error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-24">
      <div className="max-w-[740px] mx-auto px-5 md:px-9 text-center">
        <p className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-gold mb-3">
          Stay Connected
        </p>
        <h2 className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-semibold mb-4">
          Stay Connected
        </h2>
        <p className="text-charcoal-mid text-base leading-[1.8] max-w-[480px] mx-auto mb-9">
          Honest reflections on awareness, self-agency, and whatever I&apos;m questioning at the moment. 1–2 emails per month — no noise, no selling, just the work.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
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
        <p className="mt-4 text-[0.8rem] text-charcoal-mid">We respect your inbox</p>
        {message && (
          <p
            className={`mt-4 text-sm font-semibold ${
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
