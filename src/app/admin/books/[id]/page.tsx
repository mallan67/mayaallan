"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Book, Retailer } from "@/lib/mock-data"
import ImageUpload from "@/components/ImageUpload"
import ImageUpload from "@/components/ImageUpload"

export default function AdminEditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [bookId, setBookId] = useState<string>("")
  
  const [coverUrl, setCoverUrl] = useState<string>("")
  const [backCoverUrl, setBackCoverUrl] = useState<string>("")
  const [ebookFileUrl, setEbookFileUrl] = useState<string>("")
  const [ogImageUrl, setOgImageUrl] = useState<string>("")

  useEffect(() => {
    params.then(({ id }) => {
      setBookId(id)
      Promise.all([
        fetch(`/api/admin/books/${id}`).then((r) => r.json()),
        fetch("/api/admin/retailers").then((r) => r.json()),
      ]).then(([bookData, retailersData]) => {
        setBook(bookData)
        setRetailers(retailersData)
        setCoverUrl(bookData.coverUrl || "")
        setBackCoverUrl(bookData.backCoverUrl || "")
        setEbookFileUrl(bookData.ebookFileUrl || "")
        setOgImageUrl(bookData.ogImageUrl || "")
        setLoading(false)
      })
    })
  }, [params])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!book || !bookId) return

    setSaving(true)
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const updates = {
        slug: formData.get("slug") as string,
        title: formData.get("title") as string,
        subtitle1: formData.get("subtitle1") as string,
        subtitle2: formData.get("subtitle2") as string,
        tagsCsv: formData.get("tagsCsv") as string,
        isbn: formData.get("isbn") as string,
        copyright: formData.get("copyright") as string,
        blurb: formData.get("blurb") as string,
        coverUrl: coverUrl,
        backCoverUrl: backCoverUrl,
        ebookFileUrl: ebookFileUrl,
        isPublished: formData.get("isPublished") === "on",
        isVisible: formData.get("isVisible") === "on",
        isComingSoon: formData.get("isComingSoon") === "on",
        allowDirectSale: formData.get("allowDirectSale") === "on",
        stripePaymentLink: formData.get("stripePaymentLink") as string,
        paypalPaymentLink: formData.get("paypalPaymentLink") as string,
        seoTitle: formData.get("seoTitle") as string,
        seoDescription: formData.get("seoDescription") as string,
        ogImageUrl: ogImageUrl,
      }

      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updated = await response.json()
        setBook(updated)
        setMessage("Book updated successfully!")
      } else {
        setMessage("Failed to update book")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!book) return <div className="p-6">Book not found</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Back to Books
      </button>
      <h1 className="text-2xl font-semibold mb-6">Edit Book</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" name="title" defaultValue={book.title} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 1</label>
              <input type="text" name="subtitle1" defaultValue={book.subtitle1 || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 2</label>
              <input type="text" name="subtitle2" defaultValue={book.subtitle2 || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input type="text" name="slug" defaultValue={book.slug} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Blurb</label>
              <textarea name="blurb" defaultValue={book.blurb || ""} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input type="text" name="tagsCsv" defaultValue={book.tagsCsv || ""} placeholder="Self-Help, Psychology" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ISBN</label>
              <input type="text" name="isbn" defaultValue={book.isbn || ""} placeholder="978-0-123456-78-9" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Copyright</label>
              <input type="text" name="copyright" defaultValue={book.copyright || ""} placeholder="© 2025 Maya Allan" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Images & Files</h2>
          <div className="space-y-6">
            <ImageUpload label="Cover Image *" currentUrl={coverUrl} onUpload={setCoverUrl} accept="image/*" />
            <ImageUpload label="Back Cover Image (optional)" currentUrl={backCoverUrl} onUpload={setBackCoverUrl} accept="image/*" />
            <ImageUpload label="Ebook File (PDF/EPUB)" currentUrl={ebookFileUrl} onUpload={setEbookFileUrl} accept=".pdf,.epub" />
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Publishing Status</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked={book.isPublished} className="rounded" />
              <span className="text-sm font-medium">Published</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isVisible" defaultChecked={book.isVisible} className="rounded" />
              <span className="text-sm font-medium">Visible on site</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isComingSoon" defaultChecked={book.isComingSoon} className="rounded" />
              <span className="text-sm font-medium">Coming Soon</span>
            </label>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Direct Sales & Payments</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="allowDirectSale" defaultChecked={book.allowDirectSale} className="rounded" />
              <span className="text-sm font-medium">Allow Direct Sale</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Stripe Payment Link</label>
              <input type="url" name="stripePaymentLink" defaultValue={book.stripePaymentLink || ""} placeholder="https://buy.stripe.com/..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PayPal Payment Link</label>
              <input type="url" name="paypalPaymentLink" defaultValue={book.paypalPaymentLink || ""} placeholder="https://paypal.me/..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">SEO & Metadata</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title</label>
              <input type="text" name="seoTitle" defaultValue={book.seoTitle || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Description</label>
              <textarea name="seoDescription" defaultValue={book.seoDescription || ""} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <ImageUpload label="OG Image (Social Sharing)" currentUrl={ogImageUrl} onUpload={setOgImageUrl} accept="image/*" />
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
          <button type="button" onClick={() => router.push(`/admin/books/${bookId}/retailers`)} className="px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-slate-50 transition">
            Manage Retailers
          </button>
        </div>
      </form>
    </div>
  )
}
