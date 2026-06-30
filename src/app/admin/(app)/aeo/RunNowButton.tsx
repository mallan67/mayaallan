"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// =============================================================================
// RunNowButton — admin-only "trigger an AEO probe" button.
// =============================================================================
// Calls POST /api/admin/aeo/run-now (session-authed), shows a busy spinner
// while the probe runs, surfaces the result summary inline, then refreshes
// the dashboard page so the new run appears in the data tables.
//
// No CRON_SECRET handling on the client — admin session cookie is enough.
// =============================================================================

interface RunSummary {
  runId: string
  startedAt: string
  finishedAt: string
  promptsCount: number
  enginesRun: string[]
  totalProbes: number
  citationHits: number
  errors: number
  blobPath?: string
  storageError?: string
}

export function RunNowButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RunSummary | null>(null)

  async function onClick() {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/admin/aeo/run-now", { method: "POST" })

      // Vercel function timeouts return plain text ("An error occurred...")
      // rather than JSON. Detect that explicitly so the user sees a useful
      // message instead of "Unexpected token 'A'..." from a failed JSON parse.
      const contentType = res.headers.get("content-type") ?? ""
      const isJson = contentType.includes("application/json")
      const raw = await res.text()

      if (!isJson) {
        if (res.status === 504 || /timeout|timed out|FUNCTION_INVOCATION_TIMEOUT/i.test(raw)) {
          throw new Error(
            "Probe timed out (Vercel 5-min function limit). Too many engines × prompts for one run. Try fewer engines or shorter prompts."
          )
        }
        throw new Error(`Server returned ${res.status} ${res.statusText}: ${raw.slice(0, 200)}`)
      }

      const body = JSON.parse(raw)
      if (!res.ok) {
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }
      setResult(body as RunSummary)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-900">Trigger a probe now</p>
          <p className="text-xs text-slate-500 mt-1">
            Runs all configured engines against all 25 prompts. Takes 30 sec – 3 min depending
            on engine count.
          </p>
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {busy ? "Running…" : "Run now"}
        </button>
      </div>

      {busy && (
        <p className="mt-3 text-xs text-slate-500 italic">
          Probing AI engines — keep this tab open. Long-running requests can take a few minutes.
        </p>
      )}

      {error && (
        <div className="mt-3 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
          <strong>Probe failed:</strong> {error}
        </div>
      )}

      {result && !error && (
        <div className="mt-3 p-3 rounded bg-green-50 border border-green-200 text-sm text-green-900">
          <strong>Done.</strong>{" "}
          {result.citationHits} citation{result.citationHits === 1 ? "" : "s"} across{" "}
          {result.totalProbes} probe{result.totalProbes === 1 ? "" : "s"}{" "}
          ({result.enginesRun.join(", ")}).
          {result.errors > 0 && (
            <span className="text-amber-700"> {result.errors} error{result.errors === 1 ? "" : "s"}.</span>
          )}
          {result.storageError && (
            <div className="mt-2 text-xs text-amber-800">
              <strong>Storage warning:</strong> {result.storageError}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
