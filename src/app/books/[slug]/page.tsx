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
  "amazon-kindle": "📱",
  lulu: "📕",
  "google-books": "📖",
  "barnes-noble": "📚",
  "barnes-&-noble": "📚",
  "b&n": "📚",
  kobo: "📱",
  apple: "🍎",
  "apple-books": "🍎",
  audible: "🎧",
}

function getRetailerIcon(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  
  // Check exact match first
  if (retailerIcons[slug]) return retailerIcons[slug]
  
  // Check if name contains known retailer
  const lowerName = name.toLowerCase()
  if (lowerName.includes("amazon") || lowerName.includes("kindle")) return "🛒"
  if (lowerName.includes("lulu")) return "📕"
  if (lowerName.includes("barnes") || lowerName.includes("noble") || lowerName.includes("b&n")) return "📚"
  if (lowerName.includes("kobo")) return "📱"
  if (lowerName.includes("apple")) return "🍎"
  if (lowerName.includes("google")) return "📖"
  if (lowerName.includes("audible")) return "🎧"
  
  return "🔗"
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
        where: { isActive: true },
        include: { retailer: true },
      },
    },
  })

  if (!book) {
    notFound()
  }

  const bookUrl = `https://mayaallan.com/books/${book.slug}`

  // Group retailer links by format - only include links with actual URLs and retailer names
  const retailersByFormat: Record<string, typeof book.retailers> = {}
  book.retailers
    .filter((link) => link.url && link.url.trim() !== "" && link.retailer?.name)
    .forEach((link) => {
      const format = link.formatType || "ebook"
      if (!retailersByFormat[format]) {
        retailersByFormat[format] = []
      }
      retailersByFormat[format].push(link)
    })

  const hasRetailerLinks = Object.keys(retailersByFormat).length > 0

  // Available formats with prices
  const formats = [
    { key: "ebook", label: "Ebook", available: book.hasEbook, price: book.ebookPrice },
    { key: "paperback", label: "Paperback", available: book.hasPaperback, price: book.paperbackPrice },
    { key: "hardcover", label: "Hardcover", available: book.hasHardcover, price: book.hardcoverPrice },
  ].filter((f) => f.available)

  // Check if direct sale is configured
  const hasDirectSale = book.allowDirectSale && (book.stripePaymentLink || book.paypalPaymentLink)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Link href="/books" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to Books
      </Link>

      <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-10 mt-6">
        {/* Cover */}
        <div>
          {book.coverUrl ? (
            <div className="relative w-full max-w-[260px] mx-auto md:max-w-none aspect-[2/3] border border-slate-200 shadow-lg rounded-md overflow-hidden md:sticky md:top-6">
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-contain bg-slate-50"
                priority
              />
            </div>
          ) : (
            <div className="w-full max-w-[260px] mx-auto md:max-w-none aspect-[2/3] border border-slate-200 shadow-lg rounded-md flex items-center justify-center bg-slate-50">
              <span className="text-slate-400">No cover image</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
            {book.title}
          </h1>
          <p className="mt-2 text-slate-600">by Maya Allan</p>

          {book.subtitle1 && (
            <p className="mt-3 text-base md:text-lg text-slate-700">{book.subtitle1}</p>
          )}
          {book.subtitle2 && (
            <p className="mt-2 text-sm md:text-base text-slate-600 italic">{book.subtitle2}</p>
          )}

          {/* Tags */}
          {book.tagsCsv && (
            <p className="mt-4 text-slate-600 text-sm italic">
              {book.tagsCsv.split(",").map((t) => t.trim()).join(" • ")}
            </p>
          )}

          {/* FORMATS & PRICING - Mobile Responsive */}
          {formats.length > 0 && !book.isComingSoon && (
            <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-600 mb-3">Available Formats</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {formats.map((f) => (
                  <div
                    key={f.key}
                    className="p-2 sm:p-3 border border-slate-200 rounded-lg bg-white text-center"
                  >
                    <div className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                      {f.label}
                    </div>
                    {f.price && Number(f.price) > 0 && (
                      <div className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">
                        ${Number(f.price).toFixed(2)}
                      </div>
                    )}
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

          {/* PURCHASE OPTIONS */}
          {!book.isComingSoon && (
            <div className="mt-6 space-y-4">
              
              {/* DIRECT SALE BUTTONS */}
              {hasDirectSale && (
                <div className="p-4 border border-green-200 rounded-xl bg-green-50">
                  <h3 className="text-sm font-semibold text-green-800 mb-3">💳 Buy Direct from Author</h3>
                  <div className="flex flex-wrap gap-3">
                    {book.stripePaymentLink && (
                      <a
                        href={book.stripePaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2.5 text-sm font-semibold text-center bg-black text-white rounded-full hover:bg-slate-800 transition"
                      >
                        Buy Now - Card
                      </a>
                    )}
                    {book.paypalPaymentLink && (
                      <a
                        href={book.paypalPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2.5 text-sm font-semibold text-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                      >
                        Buy Now - PayPal
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* RETAILER LINKS */}
              {book.allowRetailerSale && hasRetailerLinks && (
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-600 mb-4">🏪 Buy from Retailers</h3>
                  
                  {Object.entries(retailersByFormat).map(([formatType, links]) => (
                    <div key={formatType} className="mb-4 last:mb-0">
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 capitalize">
                        {formatType}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {links.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 hover:border-slate-300 transition text-sm font-medium"
                          >
                            <span className="text-lg">
                              {getRetailerIcon(link.retailer.name)}
                            </span>
                            <span className="truncate max-w-[150px]">{link.retailer.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FALLBACK: No purchase options */}
              {!hasDirectSale && !hasRetailerLinks && (
                <div className="p-4 border border-amber-200 rounded-xl bg-amber-50">
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
              <div className="text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                {book.blurb}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
