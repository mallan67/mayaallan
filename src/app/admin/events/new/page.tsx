"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminNewEventPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const startsAt = formData.get("startsAt") as string
      const endsAt = formData.get("endsAt") as string
      
      const data = {
        slug: formData.get("slug") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        locationText: formData.get("locationText") as string || null,
        locationUrl: formData.get("locationUrl") as string || null,
        isPublished: false,
        isVisible: false,
        keepVisibleAfterEnd: false,
      }

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const event = await response.json()
        router.push(`/admin/events/${event.id}`)
      } else {
        const err = await response.json()
        setMessage(err.error || "Failed to create event")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Back to Events
      </button>

      <h1 className="text-2xl font-semibold mb-6">Add New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Event Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input
                type="text"
                name="slug"
                required
                placeholder="book-reading-march-2025"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-slate-500 mt-1">Used in URL: /events/your-slug</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Date & Time</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Starts At *</label>
              <input
                type="datetime-local"
                name="startsAt"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ends At (optional)</label>
              <input
                type="datetime-local"
                name="endsAt"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location Name / Address</label>
              <input
                type="text"
                name="locationText"
                placeholder="Online Event or Physical Address"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location URL (optional)</label>
              <input
                type="url"
                name="locationUrl"
                placeholder="https://zoom.us/... or Google Maps link"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700">
            {message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>

        <p className="text-sm text-slate-500 text-center">
          Event will be created as draft (unpublished). You can configure visibility after creation.
        </p>
      </form>
    </div>
  )
}
