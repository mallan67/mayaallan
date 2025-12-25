"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminNewMediaPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        kind: formData.get("kind") as "audio" | "video",
        slug: formData.get("slug") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        coverUrl: formData.get("coverUrl") as string || null,
        fileUrl: formData.get("fileUrl") as string || null,
        externalUrl: formData.get("externalUrl") as string || null,
        isbn: formData.get("isbn") as string || null,
        isPublished: false,
        isVisible: false,
      }

      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const media = await response.json()
        router.push(`/admin/media/${media.id}`)
      } else {
        const err = await response.json()
        setMessage(err.error || "Failed to create media")
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
        ← Back to Media
      </button>

      <h1 className="text-2xl font-semibold mb-6">Add New Media</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                name="kind"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>
            </div>
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
                placeholder="my-audio-guide"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-slate-500 mt-1">Used in URL: /media/your-slug</p>
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
          <h2 className="text-lg font-semibold mb-4">Media Source</h2>
          <p className="text-sm text-slate-600 mb-4">Provide either a file URL or external URL (YouTube, Vimeo, etc.)</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">File URL</label>
              <input
                type="url"
                name="fileUrl"
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-slate-500 mt-1">Direct link to audio/video file</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">External URL</label>
              <input
                type="url"
                name="externalUrl"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-slate-500 mt-1">YouTube, Vimeo, or other embed URL</p>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image URL</label>
              <input
                type="url"
                name="coverUrl"
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ISBN (optional)</label>
              <input
                type="text"
                name="isbn"
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
            {saving ? "Creating..." : "Create Media"}
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
          Media will be created as draft (unpublished). You can configure visibility after creation.
        </p>
      </form>
    </div>
  )
}
