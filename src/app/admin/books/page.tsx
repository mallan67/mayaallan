import Link from "next/link"
import { getAllBooks } from "@/lib/mock-data"

export default async function AdminBooksPage() {
  const books = await getAllBooks()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Books</h1>
        <Link href="/admin/books/new" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition">
          Add New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No books yet. Create your first book!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/admin/books/${book.id}`}
              className="block border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{book.title}</h2>
                  {book.subtitle1 && <p className="text-sm text-slate-600 mt-1">{book.subtitle1}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        book.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {book.isPublished ? "Published" : "Draft"}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        book.isVisible ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {book.isVisible ? "Visible" : "Hidden"}
                    </span>
                    {book.isComingSoon && (
                      <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Coming Soon</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>/{book.slug}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
