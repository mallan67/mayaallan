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
      } catch (err: any) {
        setMessage({ type: "error", text: err.message })
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [slug])

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(isNew ? "/api/admin/books" : `/api/admin/books/${book.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      })

      if (!res.ok) throw new Error("Save failed")

      const saved = await res.json()

      if (isNew) {
        router.push(`/admin/books/${saved.slug}`)
      } else {
        setMessage({ type: "success", text: "Saved successfully" })
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10">Loading…</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/admin/books" className="text-sm text-slate-500">
        ← Back to Books
      </Link>

      <h1 className="font-serif text-2xl my-6">
        {isNew ? "Add New Book" : `Edit: ${book.title}`}
      </h1>

      {message && (
        <div className={`mb-6 p-4 rounded ${message.type === "error" ? "bg-red-50" : "bg-green-50"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* IMAGES */}
        <section className="border rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-4">Images</h2>

          <ImageUpload
            label="Front Cover"
            currentUrl={book.coverUrl}
            accept="image/*"
            onUpload={(url) => setBook({ ...book, coverUrl: url })}
            onRemove={() => setBook({ ...book, coverUrl: null })}
          />

          <ImageUpload
            label="Back Cover"
            currentUrl={book.backCoverUrl}
            accept="image/*"
            onUpload={(url) => setBook({ ...book, backCoverUrl: url })}
            onRemove={() => setBook({ ...book, backCoverUrl: null })}
          />
        </section>

        {/* EBOOK */}
        <section className="border rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-4">Ebook File</h2>

          <ImageUpload
            label="PDF / EPUB"
            currentUrl={book.ebookFileUrl}
            accept=".pdf,.epub"
            onUpload={(url) => setBook({ ...book, ebookFileUrl: url })}
            onRemove={() => setBook({ ...book, ebookFileUrl: null })}
          />
        </section>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-black text-white rounded"
        >
          {saving ? "Saving…" : isNew ? "Create Book" : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
