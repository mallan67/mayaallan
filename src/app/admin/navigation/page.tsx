"use client"

import { useState, useEffect } from "react"
import type { NavigationItem } from "@/lib/mock-data"

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/navigation")
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Failed to fetch navigation items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/admin/navigation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      if (res.ok) {
        setMessage("Navigation saved successfully!")
      } else {
        setMessage("Failed to save navigation")
      }
    } catch (error) {
      setMessage("Error saving navigation")
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (id: number, updates: Partial<NavigationItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const moveItem = (id: number, direction: "up" | "down") => {
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return

    const newItems = [...items]
    const swapIndex = direction === "up" ? index - 1 : index + 1

    if (swapIndex < 0 || swapIndex >= newItems.length) return

    // Swap orders
    const tempOrder = newItems[index].order
    newItems[index].order = newItems[swapIndex].order
    newItems[swapIndex].order = tempOrder

    // Swap positions
    ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]

    setItems(newItems)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading navigation...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Navigation Management</h1>
        <p className="text-sm text-slate-600 mt-1">Control which tabs appear in your site header and their names</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-slate-200">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveItem(item.id, "up")}
                  disabled={index === 0}
                  className="text-xs text-slate-500 hover:text-black disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(item.id, "down")}
                  disabled={index === items.length - 1}
                  className="text-xs text-slate-500 hover:text-black disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateItem(item.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Path</label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => updateItem(item.id, { href: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isVisible}
                  onChange={(e) => updateItem(item.id, { isVisible: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-700">Visible</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 transition disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Navigation"}
      </button>
    </div>
  )
}
