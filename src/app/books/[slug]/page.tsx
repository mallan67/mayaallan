import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ShareButtons } from "@/components/share-buttons"
import type { Metadata } from "next"

interface BookPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

const retailerIcons: Record<string, string> = {
  amazon: "🛒",
  lulu: "📕",
  "google-books": "📖",
  "barnes-noble": "📚",
  kobo: "📱",
  apple: "🍎",
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  
  const book = await prisma.book.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: slug },
        { title: decodedSlug },
      ]
    }
  })

  if (!book) {
    return { title: "Book Not Found" }
  }

  return {
    title: book.seoTitle || book.title,
    description: book.seoDescription || book.blurb || book.subtitle1 || `${book.title} by Maya Allan`,
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const book = await prisma.book.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: slug },
        { title: decodedSlug },
      ],
      isPublished: true,
    },
    include: {
      retailers: {
        where: {
          isActive: true,
        },
        include: { retailer: true },
      },
    },
  })

  if (!book) {
    notFound()
  }

  const bookUrl = `https://mayaallan.com/books/${book.slug}`

  // Group retailer links by format (only those with URLs)
  const retailersByFormat: Record<string, typeof book.retailers> = {}
  book.retailers
    .filter((link) => link.url && link.url.trim() !== "")
    .forEach((link) => {
      if (!retailersByFormat[link.formatType]) {
        retailersByFormat[link.formatType] = []
      }
      retailersByFormat[link.formatType].push(link)
    })

  const hasRetailerLinks = Object.keys(retailersByFormat).length > 0

  // Available formats with prices
  const formats = [
    { key: "ebook", label: "Ebook", icon: "📱", available: book.hasEbook, price: book.ebookPrice },
    { key: "paperback", label: "Paperback", icon: "📖", available: book.hasPaperback, price: book.paperbackPrice },
    { key: "hardcover", label: "Hardcover", icon: "📕", available: book.hasHardcover, price: book.hardcoverPrice },
  ].filter((f) => f.available)

  // Check if direct sale is configured
  const hasDirectSale = book.allowDirectSale && (book.stripePaymentLink || book.paypalPaymentLink)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <Link href="/books" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to Books
      </Link>

      <div className="grid md:grid-cols-[350px_1fr] gap-10 mt-6">
        {/* Cover */}
        <div>
          {book.coverUrl ? (
            <div className="relative w-full aspect-[2/3] border border-slate-200 shadow-lg rounded-md overflow-hidden sticky top-6">
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-contain bg-slate-50"
                priority
              />
            </div>
          ) : (
            <div className="w-full aspect-[2/3] border border-slate-200 shadow-lg rounded-md flex items-center justify-center bg-slate-50">
              <span className="text-slate-400">No cover image</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">
            {book.title}
          </h1>
          <p className="mt-2 text-slate-600">by Maya Allan</p>

          {book.subtitle1 && (
            <p className="mt-3 text-lg text-slate-700">{book.subtitle1}</p>
          )}
          {book.subtitle2 && (
            <p className="mt-2 text-base text-slate-600 italic">{book.subtitle2}</p>
          )}

          {/* Tags */}
          {book.tagsCsv && (
            <div className="mt-4 flex flex-wrap gap-2">
              {book.tagsCsv.split(",").map((tag, i) => (
                <span key={i} className="text-slate-600 text-sm">
                  {tag.trim()}{i < book.tagsCsv!.split(",").length - 1 ? " •" : ""}
                </span>
              ))}
            </div>
          )}

          {/* FORMATS & PRICING - Always show if formats exist */}
          {formats.length > 0 && !book.isComingSoon && (
            <div className="mt-6 p-5 border border-slate-200 rounded-xl bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-600 mb-4">Available Formats</h3>
              <div className="grid grid-cols-3 gap-4">
                {formats.map((f) => (
                  <div
                    key={f.key}
                    className="p-4 border border-slate-200 rounded-lg bg-white text-center"
                  >
                    <div className="text-sm font-medium text-slate-700">{f.label}</div>
                    {f.price && Number(f.price) > 0 ? (
                      <div className="text-2xl font-bold text-slate-900 mt-1">
                        ${Number(f.price).toFixed(2)}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon Badge */}
          {book.isComingSoon && (
            <div className="mt-6">
              <span className="inline-block px-6 py-3 text-sm font-semibold bg-amber-500 text-white rounded-full">
                Coming Soon
              </span>
            </div>
          )}

          {/* PURCHASE OPTIONS - Only show if NOT coming soon */}
          {!book.isComingSoon && (
            <div className="mt-6 space-y-4">
              
              {/* DIRECT SALE BUTTONS */}
              {hasDirectSale && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="text-sm font-semibold text-green-800 mb-3">💳 Buy Direct from Author</h3>
                  <div className="flex flex-wrap gap-3">
                    {book.stripePaymentLink && (
                      <a
                        href={book.stripePaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 text-sm font-semibold text-center bg-black text-white rounded-full hover:bg-slate-800 transition"
                      >
                        Buy Now - Card
                      </a>
                    )}
                    {book.paypalPaymentLink && (
                      <a
                        href={book.paypalPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 text-sm font-semibold text-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                      >
                        Buy Now - PayPal
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* RETAILER LINKS */}
              {book.allowRetailerSale && hasRetailerLinks && (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-600 mb-4">🏪 Buy from Retailers</h3>
                  
                  {Object.entries(retailersByFormat).map(([formatType, links]) => (
                    <div key={formatType} className="mb-4 last:mb-0">
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 capitalize">
                        {formatType}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {links.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-300 transition"
                          >
                            <span className="text-xl">
                              {retailerIcons[link.retailer.slug] || "🔗"}
                            </span>
                            <span className="text-sm font-medium">{link.retailer.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FALLBACK: No purchase options configured */}
              {!hasDirectSale && !hasRetailerLinks && (
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                  <p className="text-sm text-amber-800">
                    Purchase options coming soon. Check back later!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-600 mb-3">Share this book</p>
            <ShareButtons
              url={bookUrl}
              title={book.title}
              description={book.blurb ?? book.subtitle1 ?? undefined}
              hashtags={book.tagsCsv?.split(",").map((t) => t.trim())}
            />
          </div>

          {/* About the Book */}
          {book.blurb && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h2 className="font-serif text-xl font-semibold mb-4">About This Book</h2>
              <div className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                {book.blurb}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
