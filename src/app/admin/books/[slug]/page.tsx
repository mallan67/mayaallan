"use client"

import ImageUpload from "@/components/ImageUpload"
import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

/**
 * ADMIN BOOK EDITOR (FULL)
 *
 * Restores:
 * - Cover + back cover + ebook uploads
 * - Pricing, formats, publishing status
 * - Direct sale links (Stripe/PayPal)
 * - Retailer links section
 * - SEO metadata
 *
 * Notes:
 * - This UI expects the API route /api/admin/books/by-slug/[slug] to work.
 * - This UI posts to /api/admin/books (POST) and /api/admin/books/[id] (PUT)
 * - Retailer links save to /api/admin/books/[id]/retailer-links (PUT)
 */

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
  subtitle3: string | null
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
  subtitle3: null,
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

export default function AdminBookForm({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const router = useRouter()

  // Handle both Promise params (Next.js 15+) and plain object params (from new/page.tsx)
  const resolvedParams = params instanceof Promise ? use(params) : params

  const [slug, setSlug] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)

  const [book, setBook] = useState<Book>(defaultBook)
  const [retailerLinks, setRetailerLinks] = useState<RetailerLink[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const s = resolvedParams?.slug
    setSlug(s)
    setIsNew(s === "new")
  }, [resolvedParams?.slug])

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
        } else {
          setRetailerLinks([])
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to load book" })
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [slug])

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  const handleTitleChange = (title: string) => {
    setBook({
      ...book,
      title,
      slug: isNew ? generateSlug(title) : book.slug,
    })
  }

  const addRetailerLink = () => {
    setRetailerLinks([...retailerLinks, { formatType: "ebook", retailerName: "", url: "" }])
  }

  const updateRetailerLink = (index: number, field: keyof RetailerLink, value: string) => {
    const updated = [...retailerLinks]
    updated[index] = { ...updated[index], [field]: value }
    setRetailerLinks(updated)
  }

  const removeRetailerLink = (index: number) => {
    const updated = [...retailerLinks]
    if (updated[index].id) {
      updated[index].toDelete = true
    } else {
      updated.splice(index, 1)
    }
    setRetailerLinks(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const payload = {
        ...book,
        ebookPrice: book.ebookPrice !== null ? Number(book.ebookPrice) : null,
        paperbackPrice: book.paperbackPrice !== null ? Number(book.paperbackPrice) : null,
        hardcoverPrice: book.hardcoverPrice !== null ? Number(book.hardcoverPrice) : null,
      }

      const bookUrl = isNew ? "/api/admin/books" : `/api/admin/books/${book.id}`
      const bookMethod = isNew ? "POST" : "PUT"

      const bookRes = await fetch(bookUrl, {
        method: bookMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!bookRes.ok) {
        const error = await bookRes.json().catch(() => ({}))
        throw new Error(error.error || `Failed to save book (${bookRes.status})`)
      }

      const savedBook = await bookRes.json()
      const bookId = savedBook.id

      // Save retailer links if enabled
      if (payload.allowRetailerSale && bookId) {
        const validLinks = retailerLinks.filter(
          (link) => !link.toDelete && link.retailerName && link.retailerName.trim() !== ""
        )

        const linksRes = await fetch(`/api/admin/books/${bookId}/retailer-links`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ links: validLinks }),
        })

        if (!linksRes.ok) {
          const error = await linksRes.json().catch(() => ({}))
          setMessage({
            type: "error",
            text: `Book saved, but retailer links failed: ${error.error || "Unknown error"}`,
          })
          setSaving(false)
          return
        }
      }

      setBook({
        ...defaultBook,
        ...savedBook,
        backCoverUrl: savedBook.backCoverUrl ?? null,
      })

      setMessage({ type: "success", text: isNew ? "Book created!" : "Book saved successfully!" })

      if (isNew) {
        router.push(`/admin/books/${savedBook.slug}`)
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p>Loading...</p>
      </div>
    )
  }

  const activeLinks = retailerLinks.filter((l) => !l.toDelete)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/admin/books" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
        ← Back to Books
      </Link>

      <h1 className="font-serif text-2xl font-semibold mb-6">
        {isNew ? "Add New Book" : `Edit: ${book.title}`}
      </h1>

      {message && (
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
        {/* BASIC INFO */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={book.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <input
                type="text"
                value={book.slug}
                onChange={(e) => setBook({ ...book, slug: generateSlug(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              />
              <p className="text-xs text-slate-500 mt-1">URL: /books/{book.slug || "your-book-slug"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 1</label>
              <input
                type="text"
                value={book.subtitle1 || ""}
                onChange={(e) => setBook({ ...book, subtitle1: e.target.value || null })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 2</label>
              <input
                type="text"
                value={book.subtitle2 || ""}
                onChange={(e) => setBook({ ...book, subtitle2: e.target.value || null })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subtitle 3</label>
              <input
                type="text"
                value={book.subtitle3 || ""}
                onChange={(e) => setBook({ ...book, subtitle3: e.target.value || null })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Blurb / Description</label>
              <textarea
                value={book.blurb || ""}
                onChange={(e) => setBook({ ...book, blurb: e.target.value || null })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={book.tagsCsv || ""}
                onChange={(e) => setBook({ ...book, tagsCsv: e.target.value || null })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Self-Help, Psychology, Wellness"
              />
            </div>
          </div>
        </section>

        {/* IMAGES */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Images</h2>

          <div className="space-y-6">
            <div>
              <ImageUpload
                label="Front Cover"
                currentUrl={book.coverUrl}
                accept="image/*"
                onUpload={(url) => setBook({ ...book, coverUrl: url })}
                onRemove={() => setBook({ ...book, coverUrl: null })}
              />
              {book.coverUrl && (
                <div className="mt-3">
                  <Image src={book.coverUrl} alt="Front cover" width={140} height={210} className="border rounded" />
                </div>
              )}
            </div>

            <div>
              <ImageUpload
                label="Back Cover (optional)"
                currentUrl={book.backCoverUrl}
                accept="image/*"
                onUpload={(url) => setBook({ ...book, backCoverUrl: url })}
                onRemove={() => setBook({ ...book, backCoverUrl: null })}
              />
              {book.backCoverUrl && (
                <div className="mt-3">
                  <Image src={book.backCoverUrl} alt="Back cover" width={140} height={210} className="border rounded" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* EBOOK FILE */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Ebook File</h2>

          <ImageUpload
            label="PDF / EPUB"
            currentUrl={book.ebookFileUrl}
            accept=".pdf,.epub"
            onUpload={(url) => setBook({ ...book, ebookFileUrl: url })}
            onRemove={() => setBook({ ...book, ebookFileUrl: null })}
          />

          <p className="text-xs text-slate-500 mt-2">
            Used for direct sale fulfillment. Customers receive a secure download link after payment.
          </p>
        </section>

        {/* PUBLISHING STATUS */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Publishing Status</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isPublished}
                onChange={(e) => setBook({ ...book, isPublished: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">✅ Published</span>
                <p className="text-xs text-slate-500">Book can be viewed at /books/[slug]</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isVisible}
                onChange={(e) => setBook({ ...book, isVisible: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">👁️ Visible in Listings</span>
                <p className="text-xs text-slate-500">
                  Show in /books page and homepage sections (typically requires Published + Featured)
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isFeatured}
                onChange={(e) => setBook({ ...book, isFeatured: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">⭐ Featured</span>
                <p className="text-xs text-slate-500">Show on homepage hero / featured section</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={book.isComingSoon}
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

        {/* FORMATS & PRICING */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Formats & Pricing</h2>

          <div className="space-y-4">
            <div className={`p-4 border rounded-lg ${book.hasEbook ? "border-blue-300 bg-blue-50" : ""}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasEbook}
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
                    min="0"
                    value={book.ebookPrice ?? ""}
                    onChange={(e) =>
                      setBook({ ...book, ebookPrice: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    className="w-32 border rounded px-3 py-2"
                    placeholder="9.99"
                  />
                </div>
              )}
            </div>

            <div className={`p-4 border rounded-lg ${book.hasPaperback ? "border-green-300 bg-green-50" : ""}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasPaperback}
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
                    min="0"
                    value={book.paperbackPrice ?? ""}
                    onChange={(e) =>
                      setBook({ ...book, paperbackPrice: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    className="w-32 border rounded px-3 py-2"
                    placeholder="19.99"
                  />
                </div>
              )}
            </div>

            <div className={`p-4 border rounded-lg ${book.hasHardcover ? "border-purple-300 bg-purple-50" : ""}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={book.hasHardcover}
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
                    min="0"
                    value={book.hardcoverPrice ?? ""}
                    onChange={(e) =>
                      setBook({ ...book, hardcoverPrice: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    className="w-32 border rounded px-3 py-2"
                    placeholder="29.99"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SALES CHANNELS */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold text-lg mb-4">Sales Channels</h2>

          <div className={`p-4 border rounded-lg mb-4 ${book.allowDirectSale ? "border-green-300 bg-green-50" : ""}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={book.allowDirectSale}
                onChange={(e) => setBook({ ...book, allowDirectSale: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">💳 Direct Sale</span>
                <p className="text-xs text-slate-500">Sell via Stripe/PayPal links</p>
              </div>
            </label>

            {book.allowDirectSale && (
              <div className="mt-4 ml-8 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Stripe Payment Link</label>
                  <input
                    type="url"
                    value={book.stripePaymentLink || ""}
                    onChange={(e) => setBook({ ...book, stripePaymentLink: e.target.value || null })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://buy.stripe.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">PayPal Payment Link</label>
                  <input
                    type="url"
                    value={book.paypalPaymentLink || ""}
                    onChange={(e) => setBook({ ...book, paypalPaymentLink: e.target.value || null })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://paypal.me/..."
                  />
                </div>

                {!book.stripePaymentLink && !book.paypalPaymentLink && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      ⚠️ Add at least one payment link for “Buy Now” buttons to appear.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`p-4 border rounded-lg ${book.allowRetailerSale ? "border-green-300 bg-green-50" : ""}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={book.allowRetailerSale}
                onChange={(e) => setBook({ ...book, allowRetailerSale: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">🏪 Retailer Links</span>
                <p className="text-xs text-slate-500">Amazon, Lulu, Barnes & Noble, etc.</p>
              </div>
            </label>

            {book.allowRetailerSale && (
              <div className="mt-4">
                <div className="space-y-3">
                  {activeLinks.map((link) => {
                    const actualIndex = retailerLinks.findIndex((l) => l === link)
                    return (
                      <div key={actualIndex} className="p-4 border border-slate-200 rounded-lg bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Format</label>
                            <select
                              value={link.formatType}
                              onChange={(e) => updateRetailerLink(actualIndex, "formatType", e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                              {FORMAT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Retailer Name</label>
                            <input
                              type="text"
                              value={link.retailerName}
                              onChange={(e) => updateRetailerLink(actualIndex, "retailerName", e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                              placeholder="Amazon, Lulu..."
                            />
                          </div>

                          <div className="md:col-span-5">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Purchase URL</label>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateRetailerLink(actualIndex, "url", e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                              placeholder="https://..."
                            />
                          </div>

                          <div className="md:col-span-1 flex items-end">
                            <button
                              type="button"
                              onClick={() => removeRetailerLink(actualIndex)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {activeLinks.length === 0 && (
                    <p className="text-sm text-slate-500 italic p-4 bg-white border border-dashed rounded-lg text-center">
                      No retailer links yet. Click below to add one.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={addRetailerLink}
                    className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
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
                onChange={(e) => setBook({ ...book, seoTitle: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={book.title || "Book title for search engines"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SEO Description</label>
              <textarea
                value={book.seoDescription || ""}
                onChange={(e) => setBook({ ...book, seoDescription: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 h-24"
                placeholder="Brief description for search results..."
              />
            </div>
          </div>
        </section>

        {/* SAVE */}
        <div className="flex gap-4 sticky bottom-4 bg-white p-4 border rounded-xl shadow-lg">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 text-sm font-semibold text-white bg-black rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : isNew ? "Create Book" : "Save Changes"}
          </button>

          <Link href="/admin/books" className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
