"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface RetailerLink {
  id?: number
  formatType: string
  retailerName: string
  url: string
  isNew?: boolean
}

interface Book {
  id: number
  slug: string
  title: string
  subtitle1: string | null
  subtitle2: string | null
  tagsCsv: string | null
  blurb: string | null
  coverUrl: string | null
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

const defaultBook: Partial<Book> = {
  title: "",
  slug: "",
  subtitle1: "",
  subtitle2: "",
  tagsCsv: "",
  blurb: "",
  coverUrl: null,
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
}

const FORMAT_OPTIONS = [
  { value: "ebook", label: "Ebook" },
  { value: "paperback", label: "Paperback" },
  { value: "hardcover", label: "Hardcover" },
  { value: "audiobook", label: "Audiobook" },
]

export default function BookFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [bookSlug, setBookSlug] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [book, setBook] = useState<Partial<Book>>(defaultBook)
  const [retailerLinks, setRetailerLinks] = useState<RetailerLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    params.then((p) => {
      setBookSlug(p.slug)
      setIsNew(p.slug === "new")
    })
  }, [params])

  useEffect(() => {
    if (bookSlug === null) return

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
        // Convert retailers data to our format
        if (data.retailers && Array.isArray(data.retailers)) {
          const links = data.retailers.map((r: any) => ({
            id: r.id,
            formatType: r.formatType || "ebook",
            retailerName: r.retailer?.name || "",
            url: r.url || "",
          }))
          setRetailerLinks(links)
        }
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

  // Retailer Links Management
  const addRetailerLink = () => {
    setRetailerLinks([
      ...retailerLinks,
      { formatType: "ebook", retailerName: "", url: "", isNew: true },
    ])
  }

  const updateRetailerLink = (index: number, field: keyof RetailerLink, value: string) => {
    const updated = [...retailerLinks]
    updated[index] = { ...updated[index], [field]: value }
    setRetailerLinks(updated)
  }

  const removeRetailerLink = (index: number) => {
    setRetailerLinks(retailerLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: "", text: "" })

    try {
      // Save book first
      const bookUrl = isNew ? "/api/admin/books" : `/api/admin/books/${book.id}`
      const bookMethod = isNew ? "POST" : "PUT"

      const bookRes = await fetch(bookUrl, {
        method: bookMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      })

      if (!bookRes.ok) {
        const error = await bookRes.json()
        throw new Error(error.error || "Failed to save book")
      }

      const savedBook = await bookRes.json()

      // Now save retailer links if allowRetailerSale is enabled
      if (book.allowRetailerSale && retailerLinks.length > 0) {
        const linksRes = await fetch(`/api/admin/books/${savedBook.id}/retailer-links`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ links: retailerLinks }),
        })

        if (!linksRes.ok) {
          console.error("Failed to save retailer links")
        }
      }

      setBook(savedBook)
      setMessage({ type: "success", text: isNew ? "Book created!" : "Book saved!" })

      if (isNew) {
        router.push(`/admin/books/${savedBook.slug}`)
      }
    } catch (err: any) {
      console.error("Save error:", err)
      setMessage({ type: "error", text: err.message || "Failed to save book" })
    }
    setSaving(false)
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

        {/* Cover Image */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Cover Image</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image URL</label>
            <input
              type="url"
              value={book.coverUrl || ""}
              onChange={(e) => setBook({ ...book, coverUrl: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="https://..."
            />
            {book.coverUrl && (
              <div className="mt-3">
                <Image
                  src={book.coverUrl}
                  alt="Cover preview"
                  width={120}
                  height={180}
                  className="border border-slate-200 rounded"
                />
              </div>
            )}
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
                <p className="text-xs text-slate-500">Link to Amazon, Lulu, Barnes & Noble, etc.</p>
              </div>
            </label>

            {book.allowRetailerSale && (
              <div className="mt-4 ml-0 md:ml-8">
                {/* Retailer Links List */}
                <div className="space-y-4">
                  {retailerLinks.map((link, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200 rounded-lg bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Format Dropdown */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Format
                          </label>
                          <select
                            value={link.formatType}
                            onChange={(e) => updateRetailerLink(index, "formatType", e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                          >
                            {FORMAT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Retailer Name */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Retailer Name
                          </label>
                          <input
                            type="text"
                            value={link.retailerName}
                            onChange={(e) => updateRetailerLink(index, "retailerName", e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Amazon, Lulu, B&N..."
                          />
                        </div>

                        {/* URL */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Purchase URL
                          </label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateRetailerLink(index, "url", e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="https://amazon.com/dp/..."
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeRetailerLink(index)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {retailerLinks.length === 0 && (
                    <p className="text-sm text-slate-500 italic p-4 bg-white border border-dashed border-slate-300 rounded-lg text-center">
                      No retailer links added yet. Click the button below to add one.
                    </p>
                  )}

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={addRetailerLink}
                    className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-800 hover:bg-slate-50 transition"
                  >
                    + Add Retailer Link
                  </button>
                </div>
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
