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
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", slug: "", iconUrl: "", isActive: true })
  const [message, setMessage] = useState({ type: "", text: "" })

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

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingId ? formData.slug : generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    try {
      const url = editingId ? `/api/admin/retailers/${editingId}` : "/api/admin/retailers"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setMessage({ type: "success", text: editingId ? "Retailer updated!" : "Retailer added!" })
        setShowForm(false)
        setEditingId(null)
        setFormData({ name: "", slug: "", iconUrl: "", isActive: true })
        fetchRetailers()
      } else {
        const error = await res.json()
        setMessage({ type: "error", text: error.error || "Failed to save" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save retailer" })
    }
  }

  const handleEdit = (retailer: Retailer) => {
    setFormData({
      name: retailer.name,
      slug: retailer.slug,
      iconUrl: retailer.iconUrl || "",
      isActive: retailer.isActive,
    })
    setEditingId(retailer.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this retailer? This will remove it from all books.")) return

    try {
      const res = await fetch(`/api/admin/retailers/${id}`, { method: "DELETE" })
      if (res.ok) {
        setRetailers(retailers.filter((r) => r.id !== id))
        setMessage({ type: "success", text: "Retailer deleted" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete" })
    }
  }

  const handleToggleActive = async (retailer: Retailer) => {
    try {
      const res = await fetch(`/api/admin/retailers/${retailer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !retailer.isActive }),
      })
      if (res.ok) {
        setRetailers(retailers.map((r) => (r.id === retailer.id ? { ...r, isActive: !r.isActive } : r)))
      }
    } catch (error) {
      console.error("Failed to toggle:", error)
    }
  }

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Retailers</h1>
          <p className="text-sm text-slate-600 mt-1">Add retailers where your books are sold (Amazon, Lulu, etc.)</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ name: "", slug: "", iconUrl: "", isActive: true })
          }}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition"
        >
          Add Retailer
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded mb-6 ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border border-slate-200 rounded-lg p-6 mb-6 bg-slate-50">
          <h2 className="font-semibold text-lg mb-4">{editingId ? "Edit Retailer" : "Add New Retailer"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Retailer Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Amazon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="amazon"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Used for icons (amazon, lulu, google-books, etc.)</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon URL (optional)</label>
              <input
                type="url"
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Active (show on website)</span>
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80"
              >
                {editingId ? "Update Retailer" : "Add Retailer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Common Retailers Quick Add */}
      {!showForm && retailers.length === 0 && (
        <div className="border border-slate-200 rounded-lg p-6 mb-6 bg-blue-50">
          <h3 className="font-semibold mb-3">Quick Add Common Retailers</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Amazon", slug: "amazon" },
              { name: "Lulu", slug: "lulu" },
              { name: "Google Books", slug: "google-books" },
              { name: "Barnes & Noble", slug: "barnes-noble" },
              { name: "Kobo", slug: "kobo" },
              { name: "Apple Books", slug: "apple" },
            ].map((r) => (
              <button
                key={r.slug}
                onClick={() => {
                  setFormData({ name: r.name, slug: r.slug, iconUrl: "", isActive: true })
                  setShowForm(true)
                }}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
              >
                + {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Retailers List */}
      {retailers.length === 0 && !showForm ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No retailers yet. Add retailers to link them to your books.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {retailers.map((retailer) => (
            <div
              key={retailer.id}
              className={`border rounded-lg p-4 ${retailer.isActive ? "border-slate-200" : "border-slate-200 bg-slate-50 opacity-60"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{retailer.name}</h2>
                <button
                  onClick={() => handleToggleActive(retailer)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    retailer.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {retailer.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-3">/{retailer.slug}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(retailer)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(retailer.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="font-semibold mb-2">How to use retailers:</h3>
        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
          <li>Add your retailers here (Amazon, Lulu, etc.)</li>
          <li>Go to edit a book</li>
          <li>In "Sales Channels", check "Retailer Links"</li>
          <li>Select which retailers sell that book and add the purchase URL</li>
        </ol>
      </div>
    </div>
  )
}
