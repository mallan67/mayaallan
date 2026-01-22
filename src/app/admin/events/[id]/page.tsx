"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"

interface Event {
  id: number
  slug: string
  title: string
  description?: string | null
  startsAt: string
  endsAt?: string | null
  locationText?: string | null
  locationUrl?: string | null
  eventImageUrl?: string | null
  isPublished: boolean
  isVisible: boolean
  keepVisibleAfterEnd: boolean
  seoTitle?: string | null
  seoDescription?: string | null
}

export default function AdminEditEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState("")

  const [event, setEvent] = useState<Event | null>(null)
  const [eventImageUrl, setEventImageUrl] = useState<string>("")

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/admin/events/${id}`)
        if (res.ok) {
          const data = await res.json()
          setEvent(data)
          setEventImageUrl(data.eventImageUrl || "")
        } else {
          setMessage("Event not found")
        }
      } catch (error) {
        setMessage("Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const startsAt = formData.get("startsAt") as string
      const endsAt = formData.get("endsAt") as string

      const isVisibleChecked = formData.get("isVisible") === "true"
      const isPublishedChecked = formData.get("isPublished") === "true"
      const keepVisibleChecked = formData.get("keepVisibleAfterEnd") === "true"

      const data = {
        slug: formData.get("slug") as string,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        locationText: (formData.get("locationText") as string) || null,
        locationUrl: (formData.get("locationUrl") as string) || null,
        eventImageUrl: eventImageUrl || null,
        isVisible: isVisibleChecked,
        isPublished: isPublishedChecked,
        keepVisibleAfterEnd: keepVisibleChecked,
        seoTitle: (formData.get("seoTitle") as string) || null,
        seoDescription: (formData.get("seoDescription") as string) || null,
      }

      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updated = await response.json()
        setEvent(updated)
        setMessage("Event updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const err = await response.json()
        setMessage(err.error || "Failed to update event")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/events")
      } else {
        const err = await response.json()
        setMessage(err.error || "Failed to delete event")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setDeleting(false)
    }
  }

  // Helper to format datetime for input
  const formatDateTimeLocal = (isoString: string | null | undefined) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    return date.toISOString().slice(0, 16)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-red-600">{message || "Event not found"}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-slate-500 hover:text-slate-700">
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Back to Events
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Edit Event</h1>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Event"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Event Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                defaultValue={event.title}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input
                type="text"
                name="slug"
                defaultValue={event.slug}
                required
                placeholder="book-reading-march-2025"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
              <p className="text-xs text-slate-500 mt-1">Used in URL: /events/your-slug</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                defaultValue={event.description || ""}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
                defaultValue={formatDateTimeLocal(event.startsAt)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ends At (optional)</label>
              <input
                type="datetime-local"
                name="endsAt"
                defaultValue={formatDateTimeLocal(event.endsAt)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
                defaultValue={event.locationText || ""}
                placeholder="Online Event or Physical Address"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location URL (optional)</label>
              <input
                type="url"
                name="locationUrl"
                defaultValue={event.locationUrl || ""}
                placeholder="https://zoom.us/... or Google Maps link"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Event Image</h2>
          <ImageUpload
            label="Event Banner / Photo"
            currentUrl={eventImageUrl}
            onUpload={setEventImageUrl}
            accept="image/*"
          />
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Visibility</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                value="true"
                defaultChecked={event.isPublished}
                className="rounded"
              />
              <span className="text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isVisible"
                value="true"
                defaultChecked={event.isVisible}
                className="rounded"
              />
              <span className="text-sm">Visible on public site</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="keepVisibleAfterEnd"
                value="true"
                defaultChecked={event.keepVisibleAfterEnd}
                className="rounded"
              />
              <span className="text-sm">Keep visible after event ends</span>
            </label>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">SEO (Optional)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title</label>
              <input
                type="text"
                name="seoTitle"
                defaultValue={event.seoTitle || ""}
                placeholder="Custom title for search engines"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Description</label>
              <textarea
                name="seoDescription"
                defaultValue={event.seoDescription || ""}
                rows={2}
                placeholder="Custom description for search engines"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
