import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

async function getFeaturedBook() {
  try {
    const book = await prisma.book.findFirst({
      where: {
        isFeatured: true,
        isPublished: true,
      },
      include: {
        retailers: {
          where: { isActive: true },
          include: { retailer: true },
        },
      },
    })
    return book
  } catch {
    return null
  }
}

export default async function HomePage() {
  const book = await getFeaturedBook()

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          {book ? (
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Book Cover */}
              <div className="flex justify-center md:justify-end">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    width={400}
                    height={600}
                    className="rounded-lg shadow-2xl"
                    priority
                  />
                ) : (
                  <div className="w-[400px] h-[600px] bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    No cover image
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="space-y-6">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  {book.title}
                </h1>
                
                {book.subtitle1 && (
                  <p className="text-xl md:text-2xl text-slate-600 font-light">
                    {book.subtitle1}
                  </p>
                )}
                
                {book.subtitle2 && (
                  <p className="text-lg text-slate-500">
                    {book.subtitle2}
                  </p>
                )}

                {book.blurb && (
                  <p className="text-slate-600 leading-relaxed text-lg max-w-lg">
                    {book.blurb.substring(0, 200)}...
                  </p>
                )}

                {/* Pricing */}
                <div className="flex flex-wrap gap-4 pt-2">
                  {book.hasEbook && book.ebookPrice && (
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-slate-900">
                        ${book.ebookPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-500">Ebook</span>
                    </div>
                  )}
                  {book.hasPaperback && book.paperbackPrice && (
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-slate-900">
                        ${book.paperbackPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-500">Paperback</span>
                    </div>
                  )}
                  {book.hasHardcover && book.hardcoverPrice && (
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-slate-900">
                        ${book.hardcoverPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-500">Hardcover</span>
                    </div>
                  )}
                </div>

                {/* Buy Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {book.allowRetailerSale && book.retailers && book.retailers.length > 0 && (
                    book.retailers.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                      >
                        Buy on {link.retailer.name}
                      </a>
                    ))
                  )}
                  
                  {book.allowDirectSale && book.stripePaymentLink && (
                    <a
                      href={book.stripePaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                      Buy Now
                    </a>
                  )}

                  <Link
                    href={`/books/${book.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* No Featured Book */
            <div className="text-center py-20">
              <h1 className="font-serif text-5xl font-bold text-slate-900 mb-6">
                Maya Allan
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Author & Writer
              </p>
              <Link
                href="/books"
                className="inline-block px-8 py-4 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                View Books
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
