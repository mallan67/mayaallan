"use client"

import { useState, type FormEvent } from "react"

// =============================================================================
// IntegrationJournalForm — client form that POSTs to the journal API and
// triggers the PDF download in the browser.
// =============================================================================

type Phase = "preparation" | "journey" | "integration" | "shadow-work"

const PHASES: Array<{ value: Phase; label: string; description: string }> = [
  { value: "preparation", label: "Preparation", description: "7 days before a journey" },
  { value: "journey", label: "Journey companion", description: "Day-of and the week around it" },
  { value: "integration", label: "Integration", description: "7 days after the journey" },
  { value: "shadow-work", label: "Shadow work", description: "For journeys with difficult material" },
]

export function IntegrationJournalForm() {
  const [phase, setPhase] = useState<Phase>("integration")
  const [intention, setIntention] = useState("")
  const [journeyDate, setJourneyDate] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch("/api/tools/integration-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, intention: intention.trim(), journeyDate: journeyDate.trim() }),
      })
      if (!res.ok) {
        // Try to parse a JSON error, otherwise show generic
        let msg = "Could not generate journal — please try again."
        try {
          const j = await res.json()
          if (j?.error) msg = j.error
        } catch {
          /* not JSON */
        }
        throw new Error(msg)
      }
      // Stream the response → blob → trigger a download
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `integration-journal-${phase}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Revoke after a short delay so the browser has time to start the download
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          Which phase are you in?
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          {PHASES.map((p) => (
            <label
              key={p.value}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                phase === p.value
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="phase"
                value={p.value}
                checked={phase === p.value}
                onChange={() => setPhase(p.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-slate-900 text-sm">{p.label}</div>
                <div className="text-xs text-slate-500">{p.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="intention" className="block text-sm font-semibold text-slate-900 mb-2">
          Intention <span className="font-normal text-slate-500">(optional, shown on cover)</span>
        </label>
        <textarea
          id="intention"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          maxLength={280}
          rows={2}
          placeholder="e.g., To listen for what's already true."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-slate-500 text-right">{intention.length}/280</p>
      </div>

      <div>
        <label htmlFor="journeyDate" className="block text-sm font-semibold text-slate-900 mb-2">
          Journey date <span className="font-normal text-slate-500">(optional, shown on cover)</span>
        </label>
        <input
          id="journeyDate"
          type="text"
          value={journeyDate}
          onChange={(e) => setJourneyDate(e.target.value)}
          maxLength={40}
          placeholder="e.g., May 20, 2026"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? "Generating PDF…" : "Download free PDF"}
      </button>
      <p className="text-xs text-slate-500">
        No email required. The PDF is generated server-side and sent directly to your browser.
      </p>
    </form>
  )
}
