"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"

export default function AdminNewMediaPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  
  const [coverUrl, setCoverUrl] = useState<string>("")
  const [fileUrl, setFileUrl] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        slug: formData.get("slug") as string,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        mediaType: formData.get("mediaType") as string,
        coverUrl: coverUrl || null,
        fileUrl: fileUrl || null,
        externalUrl: (formData.get("externalUrl") as string) || null,
        duration: (formData.get("duration") as string) || null,
        publishedAt: (formData.get("publishedAt") as string) || null,
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
          <h2 className="text-lg font-semibold mb-4">Media Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" name="title" required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input type="text" name="slug" required placeholder="my-podcast-episode" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <p className="text-xs text-slate-500 mt-1">Used in URL: /media/your-slug</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Media Type *</label>
              <select name="mediaType" required className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">Select type...</option>
                <option value="podcast">Podcast</option>
                <option value="video">Video</option>
                <option value="interview">Interview</option>
                <option value="article">Article</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input type="text" name="duration" placeholder="45:30" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Published Date</label>
              <input type="date" name="publishedAt" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Files & Links</h2>
          <div className="space-y-6">
            <ImageUpload label="Cover Image / Thumbnail" currentUrl={coverUrl} onUpload={setCoverUrl} accept="image/*" />
            <ImageUpload label="Media File (Audio/Video)" currentUrl={fileUrl} onUpload={setFileUrl} accept="audio/*,video/*,.mp3,.mp4,.wav,.webm" />
            <div>
              <label className="block text-sm font-medium mb-1">External URL (YouTube, Spotify, etc.)</label>
              <input type="url" name="externalUrl" placeholder="https://..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <p className="text-xs text-slate-500 mt-1">Use this for embedded content from external platforms</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700">{message}</div>
        )}

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 transition disabled:opacity-50">
            {saving ? "Creating..." : "Create Media"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>

        <p className="text-sm text-slate-500 text-center">
          Media will be created as hidden. You can make it visible after creation.
        </p>
      </form>
    </div>
  )
}
