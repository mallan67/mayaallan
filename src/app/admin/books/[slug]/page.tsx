"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUpload from "@/components/ImageUpload"

interface Retailer {
  id: number
  name: string
  slug: string
  isActive: boolean
}

interface BookRetailerLink {
  id: number
  retailerId: number
  url: string
  formatType: string
  isActive: boolean
  retailer: Retailer
}

interface Book {
  id: number
  slug: string
  title: string
  subtitle1: string | null
  subtitle2: string | null
  tagsCsv: string | null
  isbn: string | null
  copyright: string | null
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
  ogImageUrl: string | null
  retailers: BookRetailerLink[]
}

const defaultBook: Partial<Book> = {
  title: "",
  slug: "",
  subtitle1: "",
  subtitle2: "",
  tagsCsv: "",
  isbn: "",
  copyright: "",
  blurb: "",
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
  stripePaymentLink: "",
  paypalPaymentLink: "",
  seoTitle: "",
  seoDescription: "",
  ogImageUrl: null,
  retailers: [],
}

const FORMAT_OPTIONS = [
  { key: "ebook", label: "Ebook" },
  { key: "paperback", label: "Paperback" },
  { key: "hardcover", label: "Hardcover" },
  { key: "audiobook", label: "Audiobook" },
]

export default function BookFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [bookSlug, setBookSlug] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [book, setBook] = useState<Partial<Book>>(defaultBook)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [allRetailers, setAllRetailers] = useState<Retailer[]>([])

  // For adding new retailer links
  const [showAddLink, setShowAddLink] = useState<number | null>(null)
  const [newLinkFormat, setNewLinkFormat] = useState("ebook")

  useEffect(() => {
    params.then((p) => {
      setBookSlug(p.slug)
      setIsNew(p.slug === "new")
    })
  }, [params])

  useEffect(() => {
    if (bookSlug === null) return

    // Fetch all retailers
    fetch("/api/admin/retailers")
      .then((res) => res.json())
      .then((data) => setAllRetailers(Array.isArray(data) ? data.filter((r: Retailer) => r.isActive) : []))
      .catch(() => {})

    if (bookSlug === "new") {
      setLoading(false)
      return
    }

    // Fetch book data
    fetch(`/api/admin/books/by-slug/${bookSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setBook(data)
        setLoading(false)
      })
      .catch(() => {
        setMessage({ type: "error", text: "Book not found" })
        setLoading(false)
      })
  }, [bookSlug])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleTitleChange = (title: string) => {
    setBook({
      ...book,
      title,
      slug: isNew ? generateSlug(title) : book.slug,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: "", text: "" })

    try {
      const url = isNew ? "/api/admin/books" : `/api/admin/books/${book.id}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      })

      if (res.ok) {
        const savedBook = await res.json()
        setBook(savedBook)
        setMessage({ type: "success", text: isNew ? "Book created!" : "Book saved!" })

        if (isNew) {
          router.push(`/admin/books/${savedBook.slug}`)
        }
      } else {
        const error = await res.json()
        setMessage({ type: "error", text: error.error || "Failed to save" })
      }
    } catch (err) {
      console.error("Save error:", err)
      setMessage({ type: "error", text: "Failed to save book" })
    }
    setSaving(false)
  }

  // Retailer link management
  const handleAddRetailerLink = async (retailerId: number, formatType: string) => {
    if (!book.id) {
      setMessage({ type: "error", text: "Save the book first before adding retailer links" })
      return
    }

    // Check if this combination already exists
    const exists = book.retailers?.some(
      (r) => r.retailerId === retailerId && r.formatType === formatType
    )
    if (exists) {
      setMessage({ type: "error", text: "This format already exists for this retailer" })
      return
    }

    try {
      const res = await fetch(`/api/admin/books/${book.id}/retailers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retailerId, formatType, url: "", isActive: true }),
      })

      if (res.ok) {
        const newLink = await res.json()
        setBook({ ...book, retailers: [...(book.retailers || []), newLink] })
        setShowAddLink(null)
        setNewLinkFormat("ebook")
      } else {
        const error = await res.json()
        setMessage({ type: "error", text: error.error || "Failed to add link" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add retailer link" })
    }
  }

  const handleUpdateRetailerLink = async (linkId: number, url: string) => {
    if (!book.id) return

    try {
      await fetch(`/api/admin/books/${book.id}/retailers/${linkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      setBook({
        ...book,
        retailers: book.retailers?.map((r) => (r.id === linkId ? { ...r, url } : r)),
      })
    } catch (error) {
      console.error("Failed to update link:", error)
    }
  }

  const handleDeleteRetailerLink = async (linkId: number) => {
    if (!book.id) return

    try {
      await fetch(`/api/admin/books/${book.id}/retailers/${linkId}`, { method: "DELETE" })
      setBook({
        ...book,
        retailers: book.retailers?.filter((r) => r.id !== linkId),
      })
    } catch (error) {
      console.error("Failed to delete link:", error)
    }
  }

  // Get existing formats for a retailer
  const getRetailerLinks = (retailerId: number) => {
    return book.retailers?.filter((r) => r.retailerId === retailerId) || []
  }

  // Get available formats for adding (ones not yet added)
  const getAvailableFormats = (retailerId: number) => {
    const existingFormats = getRetailerLinks(retailerId).map((l) => l.formatType)
    return FORMAT_OPTIONS.filter((f) => !existingFormats.includes(f.key))
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-10">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/admin/books" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
        ← Back to Books
      </Link>

      <h1 className="font-serif text-2xl font-semibold mb-6">
        {isNew ? "Add New Book" : `Edit: ${book.title}`}
      </h1>

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={book.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input
                type="text"
                value={book.slug || ""}
                onChange={(e) => setBook({ ...book, slug: generateSlug(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                URL: /books/{book.slug || "your-book-slug"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={book.subtitle1 || ""}
                onChange={(e) => setBook({ ...book, subtitle1: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Blurb / Description</label>
              <textarea
                value={book.blurb || ""}
                onChange={(e) => setBook({ ...book, blurb: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={book.tagsCsv || ""}
                onChange={(e) => setBook({ ...book, tagsCsv: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Self-Help, Psychology, Wellness"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Images</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <ImageUpload
                currentUrl={book.coverUrl}
                onUpload={(url) => setBook({ ...book, coverUrl: url })}
                onRemove={() => setBook({ ...book, coverUrl: null })}
              />
            </div>
          </div>
        </section>

        {/* Publishing Status */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Publishing Status</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isPublished || false}
                onChange={(e) => setBook({ ...book, isPublished: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">✅ Published</span>
                <p className="text-xs text-slate-500">Book is live and can be viewed</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isVisible || false}
                onChange={(e) => setBook({ ...book, isVisible: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">📚 Show on Books Page</span>
                <p className="text-xs text-slate-500">Display on /books listing</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isFeatured || false}
                onChange={(e) => setBook({ ...book, isFeatured: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">⭐ Featured on Homepage</span>
                <p className="text-xs text-slate-500">Show in hero section</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isComingSoon || false}
                onChange={(e) => setBook({ ...book, isComingSoon: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">🔜 Coming Soon</span>
                <p className="text-xs text-slate-500">Hide purchase buttons</p>
              </div>
            </label>
          </div>
        </section>

        {/* Formats & Pricing */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Formats & Pricing</h2>
          <p className="text-sm text-slate-600 mb-4">Select available formats and set your prices.</p>

          <div className="space-y-4">
            {/* Ebook */}
            <div className={`p-4 border rounded-lg ${book.hasEbook ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasEbook || false}
                  onChange={(e) => setBook({ ...book, hasEbook: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">📱 Ebook</span>
              </label>
              {book.hasEbook && (
                <div className="mt-3 ml-8">
                  <label className="block text-sm mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={book.ebookPrice || ""}
                    onChange={(e) => setBook({ ...book, ebookPrice: parseFloat(e.target.value) || null })}
                    className="w-32 border border-slate-300 rounded px-3 py-2"
                    placeholder="9.99"
                  />
                </div>
              )}
            </div>

            {/* Paperback */}
            <div className={`p-4 border rounded-lg ${book.hasPaperback ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasPaperback || false}
                  onChange={(e) => setBook({ ...book, hasPaperback: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">📖 Paperback</span>
              </label>
              {book.hasPaperback && (
                <div className="mt-3 ml-8">
                  <label className="block text-sm mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={book.paperbackPrice || ""}
                    onChange={(e) => setBook({ ...book, paperbackPrice: parseFloat(e.target.value) || null })}
                    className="w-32 border border-slate-300 rounded px-3 py-2"
                    placeholder="19.99"
                  />
                </div>
              )}
            </div>

            {/* Hardcover */}
            <div className={`p-4 border rounded-lg ${book.hasHardcover ? "border-purple-300 bg-purple-50" : "border-slate-200"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasHardcover || false}
                  onChange={(e) => setBook({ ...book, hasHardcover: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">📕 Hardcover</span>
              </label>
              {book.hasHardcover && (
                <div className="mt-3 ml-8">
                  <label className="block text-sm mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={book.hardcoverPrice || ""}
                    onChange={(e) => setBook({ ...book, hardcoverPrice: parseFloat(e.target.value) || null })}
                    className="w-32 border border-slate-300 rounded px-3 py-2"
                    placeholder="29.99"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sales Channels */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Sales Channels</h2>

          {/* Direct Sale */}
          <div className={`p-4 border rounded-lg mb-4 ${book.allowDirectSale ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={book.allowDirectSale || false}
                onChange={(e) => setBook({ ...book, allowDirectSale: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">💳 Direct Sale</span>
                <p className="text-xs text-slate-500">Sell through Stripe/PayPal</p>
              </div>
            </label>
            {book.allowDirectSale && (
              <div className="mt-4 ml-8 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Stripe Payment Link</label>
                  <input
                    type="url"
                    value={book.stripePaymentLink || ""}
                    onChange={(e) => setBook({ ...book, stripePaymentLink: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    placeholder="https://buy.stripe.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PayPal Payment Link</label>
                  <input
                    type="url"
                    value={book.paypalPaymentLink || ""}
                    onChange={(e) => setBook({ ...book, paypalPaymentLink: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    placeholder="https://paypal.me/..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Retailer Links */}
          <div className={`p-4 border rounded-lg ${book.allowRetailerSale ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={book.allowRetailerSale || false}
                onChange={(e) => setBook({ ...book, allowRetailerSale: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">🏪 Retailer Links</span>
                <p className="text-xs text-slate-500">Link to Amazon, Lulu, etc.</p>
              </div>
            </label>

            {book.allowRetailerSale && (
              <div className="mt-4 ml-8">
                {allRetailers.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      No retailers configured.{" "}
                      <Link href="/admin/retailers" className="text-blue-600 hover:underline">
                        Add retailers first →
                      </Link>
                    </p>
                  </div>
                ) : isNew ? (
                  <p className="text-sm text-amber-600 p-3 bg-amber-50 rounded-lg">
                    Save the book first, then add retailer links.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {allRetailers.map((retailer) => {
                      const links = getRetailerLinks(retailer.id)
                      const availableFormats = getAvailableFormats(retailer.id)

                      return (
                        <div key={retailer.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{retailer.name}</h4>
                            {availableFormats.length > 0 && (
                              <div className="relative">
                                {showAddLink === retailer.id ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={newLinkFormat}
                                      onChange={(e) => setNewLinkFormat(e.target.value)}
                                      className="text-sm border border-slate-300 rounded px-2 py-1"
                                    >
                                      {availableFormats.map((f) => (
                                        <option key={f.key} value={f.key}>
                                          {f.label}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => handleAddRetailerLink(retailer.id, newLinkFormat)}
                                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                      Add
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowAddLink(null)}
                                      className="text-slate-500 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowAddLink(retailer.id)
                                      setNewLinkFormat(availableFormats[0]?.key || "ebook")
                                    }}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    + Add Format
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {links.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">
                              No links yet. Click "+ Add Format" to add one.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {links.map((link) => (
                                <div key={link.id} className="flex items-center gap-2">
                                  <span className="text-sm font-medium w-24 capitalize text-slate-600">
                                    {link.formatType}:
                                  </span>
                                  <input
                                    type="url"
                                    value={link.url || ""}
                                    onChange={(e) => handleUpdateRetailerLink(link.id, e.target.value)}
                                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                                    placeholder={`https://amazon.com/dp/... (${link.formatType})`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRetailerLink(link.id)}
                                    className="text-red-500 hover:text-red-700 px-2"
                                    title="Remove"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SEO */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">SEO & Metadata</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title</label>
              <input
                type="text"
                value={book.seoTitle || ""}
                onChange={(e) => setBook({ ...book, seoTitle: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder={book.title || "Book title for search engines"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Description</label>
              <textarea
                value={book.seoDescription || ""}
                onChange={(e) => setBook({ ...book, seoDescription: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24"
                placeholder="Brief description for search results..."
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex gap-4 sticky bottom-4 bg-white p-4 border border-slate-200 rounded-xl shadow-lg">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 text-sm font-semibold text-white bg-black rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : isNew ? "Create Book" : "Save Changes"}
          </button>
          <Link
            href="/admin/books"
            className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
