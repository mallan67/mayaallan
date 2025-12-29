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

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingId ? formData.slug : generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
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
    } finally {
      setSaving(false)
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
    setMessage({ type: "", text: "" })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this retailer? This will remove it from all books.")) return

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

  const quickAddRetailer = async (name: string, slug: string) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/retailers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, isActive: true }),
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
      <div className="p-6 max-w-4xl mx-auto">
        <p>Loading retailers...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold">Manage Retailers</h1>
          <p className="text-sm text-slate-600 mt-1">
            Add retailers where your books are sold (Amazon, Lulu, Barnes & Noble, etc.)
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ name: "", slug: "", iconUrl: "", isActive: true })
            setMessage({ type: "", text: "" })
          }}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition"
        >
          + Add Retailer
        </button>
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
      {showForm && (
        <div className="border border-slate-200 rounded-xl p-6 mb-6 bg-slate-50">
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
                <p className="text-xs text-slate-500 mt-1">Used for icons: amazon, lulu, barnes-noble, kobo, apple</p>
              </div>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Active (show on website)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-black text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update Retailer" : "Add Retailer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="px-5 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add Common Retailers */}
      {!showForm && retailers.length < 5 && (
        <div className="border border-blue-200 rounded-xl p-5 mb-6 bg-blue-50">
          <h3 className="font-semibold mb-3">Quick Add Common Retailers</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Amazon", slug: "amazon" },
              { name: "Lulu", slug: "lulu" },
              { name: "Barnes & Noble", slug: "barnes-noble" },
              { name: "Kobo", slug: "kobo" },
              { name: "Apple Books", slug: "apple" },
              { name: "Google Books", slug: "google-books" },
            ]
              .filter((r) => !retailers.some((existing) => existing.slug === r.slug))
              .map((r) => (
                <button
                  key={r.slug}
                  onClick={() => quickAddRetailer(r.name, r.slug)}
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
      {retailers.length === 0 ? (
        <div className="border border-slate-200 rounded-xl p-10 text-center bg-white">
          <p className="text-slate-500 mb-2">No retailers added yet.</p>
          <p className="text-sm text-slate-400">Use the quick add buttons above or click "Add Retailer"</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {retailers.map((retailer) => (
            <div
              key={retailer.id}
              className={`border rounded-xl p-5 bg-white ${
                retailer.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-semibold">{retailer.name}</h2>
                  <p className="text-sm text-slate-500">/{retailer.slug}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    retailer.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {retailer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-3 mt-4 pt-3 border-t border-slate-100">
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
      <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <h3 className="font-semibold mb-3">How to link books to retailers:</h3>
        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li>Add your retailers here (Amazon, Lulu, etc.)</li>
          <li>Go to <Link href="/admin/books" className="text-blue-600 hover:underline">Admin → Books</Link></li>
          <li>Edit a book</li>
          <li>In the "Sales Channels" section, check "Retailer Links"</li>
          <li>Add links for each format (Ebook, Paperback, Hardcover)</li>
          <li>Save the book</li>
        </ol>
      </div>
    </div>
  )
}
