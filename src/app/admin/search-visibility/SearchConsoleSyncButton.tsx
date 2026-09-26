"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function SearchConsoleSyncButton({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sync() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/search-console/sync", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        disabled={!configured || busy}
        onClick={sync}
        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Syncing…" : "Sync Search Console now"}
      </button>
      {!configured && <span className="text-xs text-amber-700">API credentials not configured yet.</span>}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  )
}
