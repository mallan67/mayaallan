import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

interface Book {
  id: number
  slug: string
  title: string
  subtitle1: string | null
  coverUrl: string | null
  blurb: string | null
  hasEbook: boolean
  hasPaperback: boolean
  hasHardcover: boolean
  ebookPrice: number | null
  paperbackPrice: number | null
  hardcoverPrice: number | null
  isComingSoon: boolean
}

async function getBooks(): Promise<Book[]> {
  try {
    const books = await prisma.book.findMany({
      where: {
        isVisible: true,
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return books as Book[]
  } catch (error) {
    console.error("Error fetching books:", error)
    return []
  }
}

function formatPrice(price: number | null): string {
  if (!price) return ""
  return `$${price.toFixed(2)}`
}

function getLowestPrice(book: Book): string {
  const prices = [
    book.hasEbook ? book.ebookPrice : null,
    book.hasPaperback ? book.paperbackPrice : null,
    book.hasHardcover ? book.hardcoverPrice : null,
  ].filter((p): p is number => p !== null)

  if (prices.length === 0) return ""
  const lowest = Math.min(...prices)
  return `From ${formatPrice(lowest)}`
}

export default async function BooksPage() {
  const books = await getBooks()

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-serif text-4xl font-bold text-slate-900 text-center">
            Books
          </h1>
          <p className="text-slate-600 text-center mt-4">
            Explore my published works
          </p>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {books.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 mb-4">No books available yet.</p>
              <Link
                href="/admin/books"
                className="text-blue-600 hover:text-blue-800"
              >
                Add your first book →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Cover */}
                  <div className="aspect-[2/3] relative bg-slate-100">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        No cover
                      </div>
                    )}
                    
                    {/* Coming Soon Badge */}
                    {book.isComingSoon && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                        Coming Soon
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h2 className="font-serif text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h2>
                    
                    {book.subtitle1 && (
                      <p className="text-slate-600 text-sm mt-1 line-clamp-1">
                        {book.subtitle1}
                      </p>
                    )}

                    {/* Formats */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {book.hasEbook && (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                          Ebook
                        </span>
                      )}
                      {book.hasPaperback && (
                        <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded">
                          Paperback
                        </span>
                      )}
                      {book.hasHardcover && (
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded">
                          Hardcover
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    {!book.isComingSoon && (
                      <p className="text-slate-900 font-medium mt-3">
                        {getLowestPrice(book)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
