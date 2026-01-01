import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Books | Maya Allan",
  description: "Browse books by Maya Allan",
}

export const dynamic = "force-dynamic"

/**
 * BOOKS LISTING LOGIC:
 *
 * The /books page filters by BOTH isVisible AND isPublished.
 *
 * - isVisible = true: Show in /books listing AND allow homepage featuring
 * - isPublished = true: Book is live and can be viewed
 *
 * Homepage uses: isFeatured + isPublished + isVisible (same isVisible flag)
 */
export default async function BooksPage() {
  const books = await prisma.book.findMany({
    where: {
      isPublished: true,  // Book must be published
      isVisible: true,    // Book must be marked visible for this listing
    },
    include: {
      retailers: {
        where: { isActive: true },
        include: { retailer: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (books.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold mb-4">Books</h1>
        <p className="text-slate-600">No books available yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-center mb-10">
        Books
      </h1>

      <div className="grid gap-10 md:gap-12">
        {books.map((book) => {
          // Get unique retailer names
          const retailerNames = book.retailers
            .filter((r) => r.url && r.url.trim() !== "" && r.retailer?.name)
            .map((r) => r.retailer.name)
            .filter((name, index, arr) => arr.indexOf(name) === index)

          // Get lowest price
          const prices = [
            book.hasEbook && book.ebookPrice ? Number(book.ebookPrice) : null,
            book.hasPaperback && book.paperbackPrice ? Number(book.paperbackPrice) : null,
            book.hasHardcover && book.hardcoverPrice ? Number(book.hardcoverPrice) : null,
          ].filter((p): p is number => p !== null && p > 0)

          const lowestPrice = prices.length > 0 ? Math.min(...prices) : null

          // Available formats
          const formats = [
            book.hasEbook && { label: "Ebook", price: book.ebookPrice },
            book.hasPaperback && { label: "Paperback", price: book.paperbackPrice },
            book.hasHardcover && { label: "Hardcover", price: book.hardcoverPrice },
          ].filter(Boolean) as { label: string; price: any }[]

          return (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              className="group grid md:grid-cols-[260px_1fr] gap-6 md:gap-8 p-4 md:p-0 hover:bg-slate-50 md:hover:bg-transparent rounded-xl transition"
            >
              {/* Cover */}
              <div className="relative w-full max-w-[220px] mx-auto md:max-w-none aspect-[2/3] border border-slate-200 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">No cover</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col justify-center text-center md:text-left">
                <h2 className="font-serif text-xl md:text-2xl font-semibold group-hover:text-blue-700 transition">
                  {book.title}
                </h2>

                {book.subtitle1 && (
                  <p className="mt-2 text-slate-600 text-sm md:text-base">
                    {book.subtitle1}
                  </p>
                )}

                {/* Formats */}
                {formats.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    {formats.map((f) => (
                      <span
                        key={f.label}
                        className="inline-block px-3 py-1 text-xs md:text-sm font-medium text-blue-700 bg-blue-50 rounded-full"
                      >
                        {f.label}
                        {f.price && Number(f.price) > 0 && (
                          <span className="ml-1 font-semibold">
                            ${Number(f.price).toFixed(2)}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                {lowestPrice && (
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    From ${lowestPrice.toFixed(2)}
                  </p>
                )}

                {/* Retailers */}
                {retailerNames.length > 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    Available at: {retailerNames.join(", ")}
                  </p>
                )}

                {/* Coming Soon */}
                {book.isComingSoon && (
                  <span className="mt-3 inline-block px-4 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-full w-fit mx-auto md:mx-0">
                    Coming Soon
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
