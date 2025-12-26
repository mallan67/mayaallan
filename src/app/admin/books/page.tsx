"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Book {
  id: number
  title: string
  subtitle1: string | null
  slug: string
  isPublished: boolean
  isVisible: boolean
  coverUrl: string | null
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return

    const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" })
    if (res.ok) {
      setBooks(books.filter((b) => b.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold">Manage Books</h1>
        <Link
          href="/admin/books/new"
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-black/80"
        >
          Add New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <p className="text-slate-600">No books yet. Add your first book!</p>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link href={`/admin/books/${book.id}`} className="hover:underline">
                    <h2 className="font-serif text-lg font-semibold">{book.title}</h2>
                  </Link>
                  {book.subtitle1 && (
                    <p className="text-sm text-slate-600 mt-1">{book.subtitle1}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        book.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {book.isPublished ? "Published" : "Draft"}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        book.isVisible
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {book.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">/{book.slug}</p>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/admin/books/${book.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
