"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Book, Retailer, BookRetailerLink } from "@/lib/mock-data"

export default function AdminBookRetailersPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [bookRetailerLinks, setBookRetailerLinks] = useState<BookRetailerLink[]>([])
  const [loading, setLoading] = useState(true)
  const [bookId, setBookId] = useState<number | null>(null)

  useEffect(() => {
    params.then(({ slug }) => {
      // First fetch the book by slug to get its numeric ID
      fetch(`/api/admin/books/by-slug/${slug}`)
        .then((r) => {
          if (!r.ok) throw new Error("Book not found")
          return r.json()
        })
        .then((bookData) => {
          setBook(bookData)
          setBookId(bookData.id)

          // Now fetch retailers and links using the numeric ID
          return Promise.all([
            fetch("/api/admin/retailers").then((r) => r.json()),
            fetch(`/api/admin/books/${bookData.id}/retailers`).then((r) => r.json()),
          ])
        })
        .then(([retailersData, linksData]) => {
          setRetailers(retailersData)
          setBookRetailerLinks(linksData)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error loading book retailers:", err)
          setLoading(false)
        })
    })
  }, [params])

  const handleToggleRetailer = async (retailerId: number) => {
    if (!bookId) return
    const existing = bookRetailerLinks.find((l) => l.retailerId === retailerId)

    if (existing) {
      await fetch(`/api/admin/books/${bookId}/retailers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerId,
          isActive: !existing.isActive,
        }),
      })
    } else {
      await fetch(`/api/admin/books/${bookId}/retailers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerId,
          url: "",
          formatType: "ebook",
          isActive: true,
        }),
      })
    }

    const updated = await fetch(`/api/admin/books/${bookId}/retailers`).then((r) => r.json())
    setBookRetailerLinks(updated)
  }

  const handleUpdateLink = async (retailerId: number, url: string, formatType: string) => {
    if (!bookId) return
    await fetch(`/api/admin/books/${bookId}/retailers`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retailerId, url, formatType }),
    })

    const updated = await fetch(`/api/admin/books/${bookId}/retailers`).then((r) => r.json())
    setBookRetailerLinks(updated)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!book) return <div className="p-6">Book not found</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Back to Book
      </button>

      <h1 className="text-2xl font-semibold mb-2">Manage Retailers for "{book.title}"</h1>
      <p className="text-sm text-slate-600 mb-6">Select which retailers should display purchase links for this book</p>

      <div className="space-y-4">
        {retailers.map((retailer) => {
          const link = bookRetailerLinks.find((l) => l.retailerId === retailer.id)
          const isActive = link?.isActive || false

          return (
            <div key={retailer.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => handleToggleRetailer(retailer.id)}
                  className="mt-1 rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{retailer.name}</h3>
                  {isActive && link && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Purchase URL</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(retailer.id, e.target.value, link.formatType)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Format Type</label>
                        <select
                          value={link.formatType}
                          onChange={(e) => handleUpdateLink(retailer.id, link.url, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        >
                          <option value="ebook">eBook</option>
                          <option value="print">Print</option>
                          <option value="hardcover">Hardcover</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
