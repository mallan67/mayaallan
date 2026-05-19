"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

// =============================================================================
// ClearAllButton — wipes every AEO run blob.
// =============================================================================
// Two-step confirm to prevent accidental clicks. Auto-prune already keeps a
// rolling window of recent runs; this is for a full reset when you want to
// start the dashboard fresh.
// =============================================================================

export function ClearAllButton({ runCount }: { runCount: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleted, setDeleted] = useState<number | null>(null)

  async function onConfirm() {
    setBusy(true)
    setError(null)
    setDeleted(null)
    try {
      const res = await fetch("/api/admin/aeo/clear", { method: "POST" })
      const raw = await res.text()
      let body: { deleted?: number; error?: string } = {}
      try {
        body = JSON.parse(raw)
      } catch {
        // Non-JSON response (likely a Vercel error page) — surface the raw text.
        throw new Error(`Server returned ${res.status}: ${raw.slice(0, 200)}`)
      }
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
      setDeleted(body.deleted ?? 0)
      setConfirming(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  if (runCount === 0 && deleted === null) {
    return null // Nothing to clear — hide the button entirely.
  }

  return (
    <div className="mt-3">
      {!confirming && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear all run history ({runCount})
        </button>
      )}

      {confirming && (
        <div className="p-3 rounded-lg border border-red-300 bg-red-50/60">
          <p className="text-sm text-red-900 font-medium mb-2">
            Delete all {runCount} stored run{runCount === 1 ? "" : "s"}?
          </p>
          <p className="text-xs text-red-800/80 mb-3">
            This permanently removes the AEO history blobs from Vercel Blob storage. Future runs
            will start fresh. This does not affect any other data or your Supabase database.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-medium hover:bg-red-800 transition-colors disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Yes, delete all"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {deleted !== null && (
        <p className="mt-2 text-xs text-green-700">
          Deleted {deleted} blob{deleted === 1 ? "" : "s"}. Dashboard refreshed.
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-700">
          <strong>Failed:</strong> {error}
        </p>
      )}
    </div>
  )
}
