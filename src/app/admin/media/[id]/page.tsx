"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"
import MediaUpload from "@/components/MediaUpload"

interface MediaItem {
  id: number
  kind: "audio" | "video" | "image"
  slug: string
  title: string
  description?: string | null
  coverUrl?: string | null
  fileUrl?: string | null
  externalUrl?: string | null
  duration?: string | null
  publishedAt?: string | null
  isPublished: boolean
  isVisible: boolean
}

export default function AdminEditMediaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState("")

  const [media, setMedia] = useState<MediaItem | null>(null)
  const [kind, setKind] = useState<"audio" | "video" | "image">("audio")
  const [coverUrl, setCoverUrl] = useState<string>("")
  const [fileUrl, setFileUrl] = useState<string>("")
  const [externalUrl, setExternalUrl] = useState<string>("")

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`/api/admin/media/${id}`)
        if (res.ok) {
          const data = await res.json()
          setMedia(data)
          setKind(data.kind || "audio")
          setCoverUrl(data.coverUrl || "")
          setFileUrl(data.fileUrl || "")
          setExternalUrl(data.externalUrl || "")
        } else {
          setMessage("Media not found")
        }
      } catch (error) {
        setMessage("Failed to load media")
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [id])

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
        kind: kind,
        coverUrl: coverUrl || null,
        fileUrl: fileUrl || null,
        externalUrl: externalUrl || null,
        duration: (formData.get("duration") as string) || null,
        publishedAt: (formData.get("publishedAt") as string) || null,
        isVisible: formData.get("isVisible") === "true",
        isPublished: formData.get("isPublished") === "true",
      }

      const response = await fetch(`/api/admin/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updated = await response.json()
        setMedia(updated)
        setMessage("Media updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const err = await response.json()
        setMessage(err.error || "Failed to update media")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this media? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/media")
      } else {
        const err = await response.json()
        setMessage(err.error || "Failed to delete media")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!media) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-red-600">{message || "Media not found"}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-slate-500 hover:text-slate-700">
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Back to Media
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Edit Media</h1>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Media"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Media Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                defaultValue={media.title}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input
                type="text"
                name="slug"
                defaultValue={media.slug}
                required
                placeholder="my-podcast-episode"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
              <p className="text-xs text-slate-500 mt-1">Used in URL: /media/your-slug</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Media Type *</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as "audio" | "video" | "image")}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                defaultValue={media.description || ""}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="text"
                name="duration"
                defaultValue={media.duration || ""}
                placeholder="45:30"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Published Date</label>
              <input
                type="date"
                name="publishedAt"
                defaultValue={media.publishedAt ? media.publishedAt.split("T")[0] : ""}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Visibility</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                value="true"
                defaultChecked={media.isPublished}
                className="rounded"
              />
              <span className="text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isVisible"
                value="true"
                defaultChecked={media.isVisible}
                className="rounded"
              />
              <span className="text-sm">Visible on public site</span>
            </label>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Cover Image</h2>
          <ImageUpload label="Cover Image / Thumbnail" currentUrl={coverUrl} onUpload={setCoverUrl} accept="image/*" />
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Media File or Link</h2>
          <MediaUpload
            kind={kind}
            currentFileUrl={fileUrl}
            currentExternalUrl={externalUrl}
            onFileUpload={setFileUrl}
            onExternalUrlChange={setExternalUrl}
            onRemove={() => {
              setFileUrl("")
              setExternalUrl("")
            }}
          />
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
