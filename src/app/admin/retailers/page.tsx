"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Retailer {
  id: number
  name: string
  slug: string
  iconUrl: string | null
  isActive: boolean
}

export default function AdminRetailersPage() {
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", slug: "" })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRetailers()
  }, [])

  const fetchRetailers = async () => {
    try {
      const res = await fetch("/api/admin/retailers")
      if (res.ok) {
        const data = await res.json()
        setRetailers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch retailers:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Name is required" })
      return
    }

    setSaving(true)
    setMessage({ type: "", text: "" })

    try {
      const url = editingId 
        ? `/api/admin/retailers/${editingId}` 
        : "/api/admin/retailers"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug || generateSlug(formData.name),
          isActive: true,
        }),
      })

      if (res.ok) {
        setMessage({ type: "success", text: editingId ? "Retailer updated!" : "Retailer added!" })
        setFormData({ name: "", slug: "" })
        setEditingId(null)
        fetchRetailers()
      } else {
        const error = await res.json()
        setMessage({ type: "error", text: error.error || "Failed to save" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save retailer" })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (retailer: Retailer) => {
    setFormData({ name: retailer.name, slug: retailer.slug })
    setEditingId(retailer.id)
    setMessage({ type: "", text: "" })
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove it from all books.`)) return

    try {
      const res = await fetch(`/api/admin/retailers/${id}`, { method: "DELETE" })
      if (res.ok) {
        setRetailers(retailers.filter((r) => r.id !== id))
        setMessage({ type: "success", text: "Retailer deleted" })
      } else {
        setMessage({ type: "error", text: "Failed to delete" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete" })
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", slug: "" })
    setEditingId(null)
    setMessage({ type: "", text: "" })
  }

  const quickAdd = async (name: string) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/retailers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: generateSlug(name), isActive: true }),
      })
      if (res.ok) {
        fetchRetailers()
        setMessage({ type: "success", text: `${name} added!` })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p>Loading retailers...</p>
      </div>
    )
  }

  const existingSlugs = retailers.map((r) => r.slug)
  const suggestedRetailers = [
    { name: "Amazon", slug: "amazon" },
    { name: "Lulu", slug: "lulu" },
    { name: "Barnes & Noble", slug: "barnes-noble" },
    { name: "Kobo", slug: "kobo" },
    { name: "Apple Books", slug: "apple" },
    { name: "Google Books", slug: "google-books" },
  ].filter((r) => !existingSlugs.includes(r.slug))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block">
          ← Back to Admin
        </Link>
        <h1 className="text-2xl font-bold">Manage Retailers</h1>
        <p className="text-slate-600 mt-1">
          Add the stores where your books are sold (Amazon, Lulu, etc.)
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="border border-slate-200 rounded-xl p-6 mb-8 bg-white">
        <h2 className="font-semibold text-lg mb-4">
          {editingId ? "Edit Retailer" : "Add New Retailer"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Retailer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ 
                  name: e.target.value, 
                  slug: editingId ? formData.slug : generateSlug(e.target.value) 
                })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Amazon"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="amazon"
              />
              <p className="text-xs text-slate-500 mt-1">Auto-generated from name</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Retailer" : "Add Retailer"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Quick Add */}
      {suggestedRetailers.length > 0 && (
        <div className="border border-blue-200 rounded-xl p-5 mb-8 bg-blue-50">
          <h3 className="font-semibold mb-3">Quick Add Popular Retailers</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedRetailers.map((r) => (
              <button
                key={r.slug}
                onClick={() => quickAdd(r.name)}
                disabled={saving}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                + {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Retailers List */}
      <div className="border border-slate-200 rounded-xl bg-white">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold">Your Retailers ({retailers.length})</h2>
        </div>
        
        {retailers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No retailers added yet.</p>
            <p className="text-sm mt-1">Use the form above or quick add buttons to add retailers.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {retailers.map((retailer) => (
              <div key={retailer.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {retailer.name || <span className="text-red-500 italic">Empty name - click Edit to fix</span>}
                  </h3>
                  <p className="text-sm text-slate-500">slug: {retailer.slug || "empty"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      retailer.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {retailer.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleEdit(retailer)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(retailer.id, retailer.name)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <h3 className="font-semibold mb-3">How to use retailers:</h3>
        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li>Add your retailers here (Amazon, Lulu, etc.)</li>
          <li>Go to <Link href="/admin/books" className="text-blue-600 hover:underline">Admin → Books</Link> and edit a book</li>
          <li>In "Sales Channels", check "Retailer Links"</li>
          <li>Add links for each format (Ebook, Paperback, Hardcover)</li>
          <li>Save - the buy buttons will appear on your book page!</li>
        </ol>
      </div>
    </div>
  )
}
