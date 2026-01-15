"use client"

import ImageUpload from "@/components/ImageUpload"
import { useEffect, useState } from "react"
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

export default function AdminBookForm({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [book, setBook] = useState<Book>(defaultBook)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const s = params?.slug
    setSlug(s)
    setIsNew(s === "new")
  }, [params?.slug])

  useEffect(() => {
    if (!slug) return

    if (slug === "new") {
      setBook(defaultBook)
      setLoading(false)
      return
    }

    fetch(`/api/admin/books/by-slug/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load book")
        return res.json()
      })
      .then((data) => {
        setBook({
          ...defaultBook,
          ...data,
          backCoverUrl: data.backCoverUrl ?? null,
        })
      })
      .catch((err) => setMessage(err?.message || "Failed to load book"))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p>Loading…</p>
      </div>
    )
  }

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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to save book")
      }

      const saved = await res.json()
      setBook({ ...defaultBook, ...saved, backCoverUrl: saved.backCoverUrl ?? null })

      if (isNew) {
        router.push(`/admin/books/${saved.slug}`)
        return
      }

      setMessage("Saved successfully ✅")
    } catch (err: any) {
      setMessage(err?.message || "Failed to save book")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/admin/books" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back
      </Link>

      <h1 className="text-2xl font-serif my-6">{isNew ? "New Book" : `Edit: ${book.title}`}</h1>

      {message && (
        <div className="p-3 mb-6 rounded border bg-slate-50 text-slate-700 text-sm">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* IMAGES */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-4">Images</h2>

          <div className="space-y-6">
            <ImageUpload
              label="Front Cover"
              currentUrl={book.coverUrl}
              accept="image/*"
              onUpload={(url) => setBook({ ...book, coverUrl: url })}
              onRemove={() => setBook({ ...book, coverUrl: null })}
            />

            <ImageUpload
              label="Back Cover (optional)"
              currentUrl={book.backCoverUrl}
              accept="image/*"
              onUpload={(url) => setBook({ ...book, backCoverUrl: url })}
              onRemove={() => setBook({ ...book, backCoverUrl: null })}
            />
          </div>
        </section>

        {/* EBOOK FILE */}
        <section className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-4">Ebook File</h2>

          <ImageUpload
            label="PDF / EPUB"
            currentUrl={book.ebookFileUrl}
            accept=".pdf,.epub,application/pdf,application/epub+zip"
            onUpload={(url) => setBook({ ...book, ebookFileUrl: url })}
            onRemove={() => setBook({ ...book, ebookFileUrl: null })}
          />

          <p className="text-xs text-slate-500 mt-2">
            Upload the PDF/EPUB used for direct-sale fulfillment.
          </p>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving…" : isNew ? "Create Book" : "Save Changes"}
          </button>

          <Link
            href="/admin/books"
            className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
