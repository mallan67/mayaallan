import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { RetailerIcon } from "@/lib/retailer-icons"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export const metadata: Metadata = {
  title: "Books | Maya Allan",
  description: "Browse books by Maya Allan",
}

export const revalidate = 300 // 5 minutes

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
  let books: any[] = []

  try {
    // Get books with retailer links
    const { data: booksData, error } = await supabaseAdmin
      .from(Tables.books)
      .select(`
        *,
        book_retailer_links!left (
          id,
          url,
          format_type,
          is_active,
          retailer:retailers (
            id,
            name,
            slug
          )
        )
      `)
      .eq("is_published", true)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Books page query error:", error.message, error.code, error.details)
    }
    console.log("Books page: Found", booksData?.length || 0, "books matching criteria")
    if (!error && booksData) {
      books = booksData.map((book) => ({
        id: book.id,
        slug: book.slug,
        title: book.title,
        subtitle1: book.subtitle1,
        subtitle2: book.subtitle2,
        subtitle3: book.subtitle3,
        coverUrl: book.cover_url,
        hasEbook: book.has_ebook,
        hasPaperback: book.has_paperback,
        hasHardcover: book.has_hardcover,
        ebookPrice: book.ebook_price,
        paperbackPrice: book.paperback_price,
        hardcoverPrice: book.hardcover_price,
        isComingSoon: book.is_coming_soon,
        retailers: (book.book_retailer_links || [])
          .filter((link: any) => link.is_active)
          .map((link: any) => ({
            id: link.id,
            url: link.url,
            formatType: link.format_type,
            isActive: link.is_active,
            retailer: link.retailer ? {
              id: link.retailer.id,
              name: link.retailer.name,
              slug: link.retailer.slug,
            } : null,
          })),
      }))
    }
  } catch (error) {
    // During build or if DB unavailable, show empty state
    console.warn("Books fetch failed:", error)
  }

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

      <div className="grid gap-12 md:gap-16">
        {books.map((book) => {
          // Get unique retailers with their info
          const uniqueRetailers = book.retailers
            .filter((r: any) => r.url && r.url.trim() !== "" && r.retailer?.name)
            .reduce((acc: any[], r: any) => {
              if (!acc.find((item: any) => item.name === r.retailer.name)) {
                acc.push({ name: r.retailer.name, id: r.retailer.id.toString() })
              }
              return acc
            }, [] as { name: string; id: string }[])

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
              className="group grid md:grid-cols-[300px_1fr] gap-8 md:gap-12 p-6 md:p-8 hover:bg-slate-50 rounded-2xl transition-all duration-300"
            >
              {/* Cover */}
              <div className="relative w-full max-w-[280px] mx-auto md:max-w-none aspect-[2/3] border border-slate-200 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
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
              <div className="flex flex-col justify-center text-center md:text-left space-y-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold group-hover:text-blue-700 transition-colors">
                    {book.title}
                  </h2>

                  {book.subtitle1 && (
                    <p className="mt-3 text-slate-700 text-base md:text-lg font-medium">
                      {book.subtitle1}
                    </p>
                  )}

                  {book.subtitle2 && (
                    <p className="mt-2 text-slate-600 text-sm md:text-base italic">
                      {book.subtitle2}
                    </p>
                  )}

                  {book.subtitle3 && (
                    <p className="mt-2 text-slate-500 text-sm md:text-base">
                      {book.subtitle3}
                    </p>
                  )}
                </div>

                {/* Formats & Price */}
                {formats.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {formats.map((f) => (
                        <span
                          key={f.label}
                          className="inline-block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          {f.label}
                        </span>
                      ))}
                    </div>
                    {lowestPrice && (
                      <p className="text-xl md:text-2xl font-bold text-slate-900">
                        From ${lowestPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {/* Retailers with Icons */}
                {uniqueRetailers.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Available at
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {uniqueRetailers.slice(0, 5).map((retailer: any) => (
                        <div
                          key={retailer.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"
                        >
                          <RetailerIcon name={retailer.name} className="w-4 h-4" />
                          <span>{retailer.name}</span>
                        </div>
                      ))}
                      {uniqueRetailers.length > 5 && (
                        <span className="inline-flex items-center px-3 py-1.5 text-sm text-slate-500">
                          +{uniqueRetailers.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Coming Soon */}
                {book.isComingSoon && (
                  <div>
                    <span className="inline-block px-5 py-2 text-sm font-semibold bg-amber-500 text-white rounded-full shadow-sm">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
