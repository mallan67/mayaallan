"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Book {
  id: number
  title: string
  subtitle1: string | null
  slug: string
  hasEbook: boolean
  hasPaperback: boolean
  hasHardcover: boolean
  ebookPrice: number | null
  paperbackPrice: number | null
  hardcoverPrice: number | null
  isFeatured: boolean
  isPublished: boolean
  isVisible: boolean
  coverUrl: string | null
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    fetch("/api/admin/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSelectAll = () => {
    if (selectedIds.length === books.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(books.map((b) => b.id))
    }
  }

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (action === "delete" && !confirm(`Delete ${selectedIds.length} books?`)) return

    for (const id of selectedIds) {
      if (action === "delete") {
        await fetch(`/api/admin/books/${id}`, { method: "DELETE" })
      } else {
        await fetch(`/api/admin/books/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isPublished: action === "publish",
            isVisible: action === "publish",
          }),
        })
      }
    }

    if (action === "delete") {
      setBooks(books.filter((b) => !selectedIds.includes(b.id)))
    } else {
      setBooks(
        books.map((b) =>
          selectedIds.includes(b.id)
            ? { ...b, isPublished: action === "publish", isVisible: action === "publish" }
            : b,
        ),
      )
    }
    setSelectedIds([])
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this book?")) return
    const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" })
    if (res.ok) setBooks(books.filter((b) => b.id !== id))
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold">Manage Books</h1>
        <Link
          href="/admin/books/new"
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-black/80"
        >
          Add New Book
        </Link>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-slate-100 p-3 rounded-lg mb-4 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <button onClick={() => handleBulkAction("publish")} className="text-sm text-green-600 hover:underline">
            Publish All
          </button>
          <button onClick={() => handleBulkAction("unpublish")} className="text-sm text-yellow-600 hover:underline">
            Unpublish All
          </button>
          <button onClick={() => handleBulkAction("delete")} className="text-sm text-red-600 hover:underline">
            Delete All
          </button>
          <button onClick={() => setSelectedIds([])} className="text-sm text-slate-600 hover:underline ml-auto">
            Clear
          </button>
        </div>
      )}

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">No books yet.</p>
          <Link href="/admin/books/new" className="text-blue-600 hover:underline">
            Add your first book
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedIds.length === books.length && books.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-600">Select All</span>
          </div>

          {books.map((book) => (
            <div
              key={book.id}
              className={`border rounded-lg p-4 ${
                selectedIds.includes(book.id) ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(book.id)}
                  onChange={() => handleSelect(book.id)}
                  className="w-4 h-4 mt-1"
                />

                {/* Thumbnail (use <img> so it ALWAYS renders regardless of Next image domain config) */}
                {book.coverUrl && (
                  <div className="relative w-16 h-24 flex-shrink-0 border border-slate-200 rounded overflow-hidden bg-slate-50">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <Link href={`/admin/books/${book.slug}`} className="hover:underline">
                    <h2 className="font-serif text-lg font-semibold truncate">{book.title}</h2>
                  </Link>
                  {book.subtitle1 && <p className="text-sm text-slate-600 truncate">{book.subtitle1}</p>}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {book.isFeatured && (
                      <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">Featured</span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        book.isPublished ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {book.isPublished ? "Published" : "Draft"}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        book.isVisible ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {book.isVisible ? "Visible" : "Hidden"}
                    </span>
                    {book.hasEbook && <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600">Ebook</span>}
                    {book.hasPaperback && (
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600">Paperback</span>
                    )}
                    {book.hasHardcover && (
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600">Hardcover</span>
                    )}
                  </div>

                  <div className="flex gap-3 mt-3">
                    <Link href={`/admin/books/${book.slug}`} className="text-sm text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <Link href={`/books/${book.slug}`} target="_blank" className="text-sm text-slate-500 hover:underline">
                      View
                    </Link>
                    <button onClick={() => handleDelete(book.id)} className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="text-right text-sm text-slate-500">
                  <p>/{book.slug}</p>
                  {(book.ebookPrice || book.paperbackPrice || book.hardcoverPrice) && (
                    <p className="mt-1">
                      {book.ebookPrice && <span>${Number(book.ebookPrice).toFixed(2)}</span>}
                      {book.paperbackPrice && <span className="ml-2">${Number(book.paperbackPrice).toFixed(2)}</span>}
                      {book.hardcoverPrice && <span className="ml-2">${Number(book.hardcoverPrice).toFixed(2)}</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
