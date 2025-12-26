import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getBooks() {
  try {
    const books = await prisma.book.findMany({
      where: {
        isVisible: true,
        isPublished: true,
      },
      include: {
        retailers: {
          where: { isActive: true },
          include: { retailer: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return books
  } catch (error) {
    console.error("Error fetching books:", error)
    return []
  }
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
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => {
                // Get lowest price for display
                const prices = [
                  book.hasEbook && book.ebookPrice ? Number(book.ebookPrice) : null,
                  book.hasPaperback && book.paperbackPrice ? Number(book.paperbackPrice) : null,
                  book.hasHardcover && book.hardcoverPrice ? Number(book.hardcoverPrice) : null,
                ].filter((p): p is number => p !== null)
                
                const lowestPrice = prices.length > 0 ? Math.min(...prices) : null

                return (
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
                        <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                          {book.subtitle1}
                        </p>
                      )}

                      {/* Formats */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {book.hasEbook && (
                          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                            Ebook {book.ebookPrice && `$${Number(book.ebookPrice).toFixed(2)}`}
                          </span>
                        )}
                        {book.hasPaperback && (
                          <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded">
                            Paperback {book.paperbackPrice && `$${Number(book.paperbackPrice).toFixed(2)}`}
                          </span>
                        )}
                        {book.hasHardcover && (
                          <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded">
                            Hardcover {book.hardcoverPrice && `$${Number(book.hardcoverPrice).toFixed(2)}`}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      {!book.isComingSoon && lowestPrice && (
                        <p className="text-slate-900 font-medium mt-3">
                          From ${lowestPrice.toFixed(2)}
                        </p>
                      )}

                      {/* Retailers */}
                      {book.retailers && book.retailers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-500">
                            Available at: {book.retailers.map(r => r.retailer.name).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
