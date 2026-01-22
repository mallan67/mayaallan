"use client"

import ImageUpload from "@/components/ImageUpload"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface RetailerLink {
  id?: number
  formatType: string
  retailerName: string
  url: string
  toDelete?: boolean
}

interface Book {
  id?: number
  slug: string
  title: string
  subtitle1: string | null
  subtitle2: string | null
  tagsCsv: string | null
  blurb: string | null
  coverUrl: string | null
  backCoverUrl: string | null
  ebookFileUrl: string | null

  hasEbook: boolean
  hasPaperback: boolean
  hasHardcover: boolean
  ebookPrice: number | null
  paperbackPrice: number | null
  hardcoverPrice: number | null

  isFeatured: boolean
  isPublished: boolean
  isVisible: boolean
  isComingSoon: boolean

  allowDirectSale: boolean
  allowRetailerSale: boolean
  stripePaymentLink: string | null
  paypalPaymentLink: string | null

  seoTitle: string | null
  seoDescription: string | null
}

const defaultBook: Book = {
  title: "",
  slug: "",
  subtitle1: null,
  subtitle2: null,
  tagsCsv: null,
  blurb: null,
  coverUrl: null,
  backCoverUrl: null,
  ebookFileUrl: null,

  hasEbook: true,
  hasPaperback: false,
  hasHardcover: false,
  ebookPrice: null,
  paperbackPrice: null,
  hardcoverPrice: null,

  isFeatured: false,
  isPublished: false,
  isVisible: false,
  isComingSoon: false,

  allowDirectSale: false,
  allowRetailerSale: false,
  stripePaymentLink: null,
  paypalPaymentLink: null,

  seoTitle: null,
  seoDescription: null,
}

const FORMAT_OPTIONS = [
  { value: "ebook", label: "Ebook" },
  { value: "paperback", label: "Paperback" },
  { value: "hardcover", label: "Hardcover" },
  { value: "audiobook", label: "Audiobook" },
]

export default function AdminBookForm({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)

  const [book, setBook] = useState<Book>(defaultBook)
  const [retailerLinks, setRetailerLinks] = useState<RetailerLink[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const s = params?.slug
    setSlug(s)
    setIsNew(s === "new")
  }, [params?.slug])

  useEffect(() => {
    if (slug === null) return

    if (slug === "new") {
      setBook(defaultBook)
      setRetailerLinks([])
      setLoading(false)
      return
    }

    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/admin/books/by-slug/${slug}`)
        if (!res.ok) throw new Error("Book not found")
        const data = await res.json()

        setBook({
          ...defaultBook,
          ...data,
          backCoverUrl: data.backCoverUrl ?? null,
        })

        if (Array.isArray(data.retailers)) {
          setRetailerLinks(
            data.retailers.map((r: any) => ({
              id: r.id,
              formatType: r.formatType || "ebook",
              retailerName: r.retailer?.name || "",
              url: r.url || "",
            }))
          )
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load book" })
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [slug])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const method = isNew ? "POST" : "PUT"
      const url = isNew ? "/api/admin/books" : `/api/admin/books/${book.id}`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...book, retailerLinks }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }

      const savedBook = await res.json()
      setMessage({ type: "success", text: isNew ? "Book created!" : "Book saved!" })

      if (isNew) {
        router.push(`/admin/books/${savedBook.slug}`)
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!book.id || !confirm("Are you sure you want to delete this book?")) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      router.push("/admin/books")
    } catch (err: any) {
      setMessage({ type: "error", text: err.message })
      setSaving(false)
    }
  }

  const updateBook = (field: keyof Book, value: any) => {
    setBook((prev) => ({ ...prev, [field]: value }))
  }

  const addRetailerLink = () => {
    setRetailerLinks((prev) => [...prev, { formatType: "ebook", retailerName: "", url: "" }])
  }

  const updateRetailerLink = (index: number, field: keyof RetailerLink, value: any) => {
    setRetailerLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
  }

  const removeRetailerLink = (index: number) => {
    setRetailerLinks((prev) => {
      const link = prev[index]
      if (link.id) {
        return prev.map((l, i) => (i === index ? { ...l, toDelete: true } : l))
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const activeRetailerLinks = useMemo(() => retailerLinks.filter((l) => !l.toDelete), [retailerLinks])

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/books" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to Books
          </Link>
          <h1 className="text-2xl font-semibold mt-2">{isNew ? "Add New Book" : `Edit: ${book.title}`}</h1>
        </div>
        {!isNew && (
          <button onClick={handleDelete} disabled={saving} className="text-sm text-red-600 hover:text-red-800">
            Delete Book
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={book.title}
                onChange={(e) => updateBook("title", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input
                type="text"
                value={book.slug}
                onChange={(e) => updateBook("slug", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 1</label>
              <input
                type="text"
                value={book.subtitle1 || ""}
                onChange={(e) => updateBook("subtitle1", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 2</label>
              <input
                type="text"
                value={book.subtitle2 || ""}
                onChange={(e) => updateBook("subtitle2", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Blurb</label>
              <textarea
                value={book.blurb || ""}
                onChange={(e) => updateBook("blurb", e.target.value || null)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={book.tagsCsv || ""}
                onChange={(e) => updateBook("tagsCsv", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Images & Files */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Images & Files</h2>
          <div className="space-y-6">
            <ImageUpload
              label="Cover Image"
              currentUrl={book.coverUrl || ""}
              onUpload={(url) => updateBook("coverUrl", url || null)}
              accept="image/*"
            />
            <ImageUpload
              label="Back Cover Image (optional)"
              currentUrl={book.backCoverUrl || ""}
              onUpload={(url) => updateBook("backCoverUrl", url || null)}
              accept="image/*"
            />
            <ImageUpload
              label="Ebook File (PDF/EPUB)"
              currentUrl={book.ebookFileUrl || ""}
              onUpload={(url) => updateBook("ebookFileUrl", url || null)}
              accept=".pdf,.epub"
            />
          </div>
        </div>

        {/* Formats & Pricing */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Formats & Pricing</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.hasEbook} onChange={(e) => updateBook("hasEbook", e.target.checked)} />
                <span className="text-sm">Has Ebook</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.hasPaperback} onChange={(e) => updateBook("hasPaperback", e.target.checked)} />
                <span className="text-sm">Has Paperback</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.hasHardcover} onChange={(e) => updateBook("hasHardcover", e.target.checked)} />
                <span className="text-sm">Has Hardcover</span>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ebook Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={book.ebookPrice ?? ""}
                  onChange={(e) => updateBook("ebookPrice", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Paperback Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={book.paperbackPrice ?? ""}
                  onChange={(e) => updateBook("paperbackPrice", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hardcover Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={book.hardcoverPrice ?? ""}
                  onChange={(e) => updateBook("hardcoverPrice", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visibility & Status */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Visibility & Status</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.isFeatured} onChange={(e) => updateBook("isFeatured", e.target.checked)} />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.isPublished} onChange={(e) => updateBook("isPublished", e.target.checked)} />
                <span className="text-sm">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.isVisible} onChange={(e) => updateBook("isVisible", e.target.checked)} />
                <span className="text-sm">Visible</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.isComingSoon} onChange={(e) => updateBook("isComingSoon", e.target.checked)} />
                <span className="text-sm">Coming Soon</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sales Options */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Options</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.allowDirectSale} onChange={(e) => updateBook("allowDirectSale", e.target.checked)} />
                <span className="text-sm">Allow Direct Sale</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={book.allowRetailerSale} onChange={(e) => updateBook("allowRetailerSale", e.target.checked)} />
                <span className="text-sm">Allow Retailer Sale</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stripe Payment Link</label>
              <input
                type="text"
                value={book.stripePaymentLink || ""}
                onChange={(e) => updateBook("stripePaymentLink", e.target.value || null)}
                placeholder="https://buy.stripe.com/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PayPal Payment Link</label>
              <input
                type="text"
                value={book.paypalPaymentLink || ""}
                onChange={(e) => updateBook("paypalPaymentLink", e.target.value || null)}
                placeholder="https://www.paypal.com/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Retailer Links */}
        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Retailer Links</h2>
            <button type="button" onClick={addRetailerLink} className="text-sm text-blue-600 hover:text-blue-800">
              + Add Link
            </button>
          </div>
          {activeRetailerLinks.length === 0 ? (
            <p className="text-sm text-slate-500">No retailer links yet.</p>
          ) : (
            <div className="space-y-4">
              {retailerLinks.map(
                (link, index) =>
                  !link.toDelete && (
                    <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <select
                        value={link.formatType}
                        onChange={(e) => updateRetailerLink(index, "formatType", e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        {FORMAT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={link.retailerName}
                        onChange={(e) => updateRetailerLink(index, "retailerName", e.target.value)}
                        placeholder="Retailer name"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateRetailerLink(index, "url", e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                      <button type="button" onClick={() => removeRetailerLink(index)} className="text-red-600 hover:text-red-800">
                        ✕
                      </button>
                    </div>
                  )
              )}
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title</label>
              <input
                type="text"
                value={book.seoTitle || ""}
                onChange={(e) => updateBook("seoTitle", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Description</label>
              <textarea
                value={book.seoDescription || ""}
                onChange={(e) => updateBook("seoDescription", e.target.value || null)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : isNew ? "Create Book" : "Save Changes"}
          </button>
          <Link href="/admin/books" className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-center">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}
