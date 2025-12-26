"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUpload from "@/components/ImageUpload"

interface Retailer {
  id: number
  name: string
  slug: string
  iconUrl: string | null
  isActive: boolean
}

interface BookRetailer {
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
  // Book formats (multi-select)
  hasEbook: boolean
  hasPaperback: boolean
  hasHardcover: boolean
  // Prices per format
  ebookPrice: number | null
  paperbackPrice: number | null
  hardcoverPrice: number | null
  // Publishing
  isFeatured: boolean
  isPublished: boolean
  isVisible: boolean
  isComingSoon: boolean
  // Sales options
  allowDirectSale: boolean
  allowRetailerSale: boolean
  stripePaymentLink: string | null
  paypalPaymentLink: string | null
  // SEO
  seoTitle: string | null
  seoDescription: string | null
  ogImageUrl: string | null
  retailers: BookRetailer[]
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

export default function BookFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [bookSlug, setBookSlug] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [book, setBook] = useState<Partial<Book>>(defaultBook)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [allRetailers, setAllRetailers] = useState<Retailer[]>([])

  useEffect(() => {
    params.then((p) => {
      setBookSlug(p.slug)
      setIsNew(p.slug === "new")
    })
  }, [params])

  useEffect(() => {
    if (bookSlug === null) return

    // Fetch retailers
    fetch("/api/admin/retailers")
      .then((res) => res.json())
      .then((data) => setAllRetailers(Array.isArray(data) ? data : []))
      .catch(() => {})

    if (bookSlug === "new") {
      setLoading(false)
      return
    }

    // Fetch existing book
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
      const url = isNew ? "/api/admin/books" : `/api/admin/books/by-slug/${bookSlug}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      })

      if (res.ok) {
        const savedBook = await res.json()
        setMessage({ type: "success", text: isNew ? "Book created successfully!" : "Book updated successfully!" })
        
        if (isNew) {
          // Redirect to edit page with new slug
          router.push(`/admin/books/${savedBook.slug}`)
        }
      } else {
        const error = await res.json()
        setMessage({ type: "error", text: error.error || "Failed to save book" })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save book" })
    }
    setSaving(false)
  }

  const handleRetailerToggle = async (retailerId: number, checked: boolean) => {
    if (isNew) {
      setMessage({ type: "error", text: "Please save the book first before adding retailers" })
      return
    }

    if (checked) {
      // Add retailer link
      const res = await fetch(`/api/admin/books/${book.id}/retailers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retailerId, url: "", formatType: "ebook" }),
      })
      if (res.ok) {
        const link = await res.json()
        setBook({ ...book, retailers: [...(book.retailers || []), link] })
      }
    } else {
      // Remove retailer link
      const link = book.retailers?.find((r) => r.retailerId === retailerId)
      if (link) {
        await fetch(`/api/admin/books/${book.id}/retailers/${link.id}`, { method: "DELETE" })
        setBook({ ...book, retailers: book.retailers?.filter((r) => r.id !== link.id) })
      }
    }
  }

  const handleRetailerUpdate = async (linkId: number, field: string, value: string) => {
    const res = await fetch(`/api/admin/books/${book.id}/retailers/${linkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      setBook({
        ...book,
        retailers: book.retailers?.map((r) => (r.id === linkId ? { ...r, [field]: value } : r)),
      })
    }
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
        <div className={`p-3 rounded mb-6 ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Basic Information */}
        <section className="border border-slate-200 rounded-lg p-6">
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
              <p className="text-xs text-slate-500 mt-1">Used in URL: /books/{book.slug || "your-slug"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 1</label>
              <input
                type="text"
                value={book.subtitle1 || ""}
                onChange={(e) => setBook({ ...book, subtitle1: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 2</label>
              <input
                type="text"
                value={book.subtitle2 || ""}
                onChange={(e) => setBook({ ...book, subtitle2: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Blurb</label>
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

        {/* 2. Metadata */}
        <section className="border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Metadata</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ISBN</label>
              <input
                type="text"
                value={book.isbn || ""}
                onChange={(e) => setBook({ ...book, isbn: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Copyright</label>
              <input
                type="text"
                value={book.copyright || ""}
                onChange={(e) => setBook({ ...book, copyright: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="2025 Maya Allan"
              />
            </div>
          </div>
        </section>

        {/* 3. Images & Files */}
        <section className="border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Images & Files</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <ImageUpload
                currentUrl={book.coverUrl}
                onUpload={(url) => setBook({ ...book, coverUrl: url })}
                onRemove={() => setBook({ ...book, coverUrl: null })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Back Cover Image (optional)</label>
              <ImageUpload
                currentUrl={book.backCoverUrl}
                onUpload={(url) => setBook({ ...book, backCoverUrl: url })}
                onRemove={() => setBook({ ...book, backCoverUrl: null })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ebook File (PDF/EPUB)</label>
              <ImageUpload
                currentUrl={book.ebookFileUrl}
                onUpload={(url) => setBook({ ...book, ebookFileUrl: url })}
                onRemove={() => setBook({ ...book, ebookFileUrl: null })}
                accept=".pdf,.epub"
              />
            </div>
          </div>
        </section>

        {/* 4. Publishing Status */}
        <section className="border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Publishing Status</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isFeatured || false}
                onChange={(e) => setBook({ ...book, isFeatured: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">Featured on Homepage</span>
                <p className="text-xs text-slate-500">Display this book prominently on the homepage</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isPublished || false}
                onChange={(e) => setBook({ ...book, isPublished: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">Published</span>
                <p className="text-xs text-slate-500">Book is published and available</p>
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
                <span className="font-medium">Visible on Site</span>
                <p className="text-xs text-slate-500">Show this book on the public website</p>
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
                <span className="font-medium">Coming Soon</span>
                <p className="text-xs text-slate-500">Display as coming soon (no purchase options)</p>
              </div>
            </label>
          </div>
        </section>

        {/* 5. Book Formats & Pricing */}
        <section className="border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Book Formats & Pricing</h2>
          <p className="text-sm text-slate-600 mb-4">Select which formats are available and set prices for each</p>
          
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
                <span className="font-medium">Ebook</span>
              </label>
              {book.hasEbook && (
                <div className="mt-3 ml-8">
                  <label className="block text-sm mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={book.ebookPrice || ""}
                    onChange={(e) => setBook({ ...book, ebookPrice: parseFloat(e.target.value) || null })}
                    className="w-32 border border-slate-300 rounded px-3 py-1"
                    placeholder="9.99"
                  />
                </div>
              )}
            </div>

            {/* Paperback */}
            <div className={`p-4 border rounded-lg ${book.hasPaperback ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasPaperback || false}
                  onChange={(e) => setBook({ ...book, hasPaperback: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">Paperback</span>
              </label>
              {book.hasPaperback && (
                <div className="mt-3 ml-8">
                  <label className="block text-sm mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={book.paperbackPrice || ""}
                    onChange={(e) => setBook({ ...book, paperbackPrice: parseFloat(e.target.value) || null })}
                    className="w-32 border border-slate-300 rounded px-3 py-1"
                    placeholder="21.99"
                  />
                </div>
              )}
            </div>

            {/* Hardcover */}
            <div className={`p-4 border rounded-lg ${book.hasHardcover ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasHardcover || false}
                  onChange={(e) => setBook({ ...book, hasHardcover: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">Hardcover</span>
              </label>
              {book.hasHardcover && (
                <div className="mt-3 ml-8">
                  <label className="block text-sm mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={book.hardcoverPrice || ""}
                    onChange={(e) => setBook({ ...book, hardcoverPrice: parseFloat(e.target.value) || null })}
                    className="w-32 border border-slate-300 rounded px-3 py-1"
                    placeholder="33.99"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6. Sales Channels */}
        <section className="border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Sales Channels</h2>
          <p className="text-sm text-slate-600 mb-4">Choose how customers can purchase this book</p>

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
                <span className="font-medium">Direct Sale</span>
                <p className="text-xs text-slate-500">Sell directly through your website (ebooks delivered after payment)</p>
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

          {/* Retailer Sale */}
          <div className={`p-4 border rounded-lg ${book.allowRetailerSale ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={book.allowRetailerSale || false}
                onChange={(e) => setBook({ ...book, allowRetailerSale: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">Retailer Links</span>
                <p className="text-xs text-slate-500">Link to external retailers (Amazon, Barnes & Noble, etc.)</p>
              </div>
            </label>
            {book.allowRetailerSale && (
              <div className="mt-4 ml-8">
                {allRetailers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No retailers configured. <Link href="/admin/retailers" className="text-blue-600 hover:underline">Add retailers first</Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {allRetailers.map((retailer) => {
                      const link = book.retailers?.find((r) => r.retailerId === retailer.id)
                      const isLinked = !!link
                      
                      return (
                        <div key={retailer.id} className={`p-3 border rounded-lg ${isLinked ? "border-blue-300 bg-white" : "border-slate-200"}`}>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isLinked}
                              onChange={(e) => handleRetailerToggle(retailer.id, e.target.checked)}
                              className="w-4 h-4"
                              disabled={isNew}
                            />
                            <span className="font-medium">{retailer.name}</span>
                          </label>
                          {isLinked && link && (
                            <div className="mt-2 ml-7 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs mb-1">Purchase URL</label>
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => handleRetailerUpdate(link.id, "url", e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                                  placeholder="https://amazon.com/..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs mb-1">Format</label>
                                <select
                                  value={link.formatType}
                                  onChange={(e) => handleRetailerUpdate(link.id, "formatType", e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                                >
                                  <option value="ebook">Ebook</option>
                                  <option value="paperback">Paperback</option>
                                  <option value="hardcover">Hardcover</option>
                                  <option value="audiobook">Audiobook</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {isNew && (
                  <p className="text-xs text-amber-600 mt-2">Save the book first to add retailer links</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 7. SEO & Metadata */}
        <section className="border border-slate-200 rounded-lg p-6">
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
            <div>
              <label className="block text-sm font-medium mb-2">OG Image (Social Sharing)</label>
              <ImageUpload
                currentUrl={book.ogImageUrl}
                onUpload={(url) => setBook({ ...book, ogImageUrl: url })}
                onRemove={() => setBook({ ...book, ogImageUrl: null })}
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-4 sticky bottom-4 bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-black/80 disabled:opacity-50"
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
