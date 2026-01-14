"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"

export default function AdminNewBookPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  
  const [coverUrl, setCoverUrl] = useState<string>("")
  const [backCoverUrl, setBackCoverUrl] = useState<string>("")
  const [ebookFileUrl, setEbookFileUrl] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        slug: formData.get("slug") as string,
        title: formData.get("title") as string,
        subtitle1: (formData.get("subtitle1") as string) || null,
        subtitle2: (formData.get("subtitle2") as string) || null,
        tagsCsv: (formData.get("tagsCsv") as string) || null,
        isbn: (formData.get("isbn") as string) || null,
        copyright: (formData.get("copyright") as string) || null,
        blurb: (formData.get("blurb") as string) || null,
        coverUrl: coverUrl || null,
        backCoverUrl: backCoverUrl || null,
        ebookFileUrl: ebookFileUrl || null,
        isPublished: false,
        isVisible: false,
        isComingSoon: false,
        allowDirectSale: false,
      }

      const response = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const book = await response.json()
        router.push(`/admin/books/${book.id}`)
      } else {
        const err = await response.json()
        setMessage(err.error || "Failed to create book")
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
        ← Back to Books
      </button>

      <h1 className="text-2xl font-semibold mb-6">Add New Book</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" name="title" required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input type="text" name="slug" required placeholder="my-book-title" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <p className="text-xs text-slate-500 mt-1">Used in URL: /books/your-slug</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 1</label>
              <input type="text" name="subtitle1" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 2</label>
              <input type="text" name="subtitle2" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Blurb</label>
              <textarea name="blurb" rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input type="text" name="tagsCsv" placeholder="Self-Help, Psychology" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ISBN</label>
              <input type="text" name="isbn" placeholder="978-0-123456-78-9" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Copyright</label>
              <input type="text" name="copyright" placeholder="© 2025 Maya Allan" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Images & Files</h2>
          <div className="space-y-6">
            <ImageUpload label="Cover Image" currentUrl={coverUrl} onUpload={setCoverUrl} accept="image/*" />
            <ImageUpload label="Back Cover Image (optional)" currentUrl={backCoverUrl} onUpload={setBackCoverUrl} accept="image/*" />
            <ImageUpload label="Ebook File (PDF/EPUB)" currentUrl={ebookFileUrl} onUpload={setEbookFileUrl} accept=".pdf,.epub" />
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700">{message}</div>
        )}

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 transition disabled:opacity-50">
            {saving ? "Creating..." : "Create Book"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>

        <p className="text-sm text-slate-500 text-center">
          Book will be created as draft (unpublished). You can configure visibility after creation.
        </p>
      </form>
    </div>
  )
}
