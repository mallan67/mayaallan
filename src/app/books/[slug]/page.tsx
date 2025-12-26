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
    openGraph: {
      title: book.seoTitle || book.title,
      description: book.seoDescription || book.blurb || book.subtitle1 || "",
      url: `https://mayaallan.com/books/${book.slug}`,
      images: book.ogImageUrl ? [{ url: book.ogImageUrl }] : book.coverUrl ? [{ url: book.coverUrl }] : [],
      type: "book",
    },
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  // Try to find book by slug OR by title (fallback for bad data)
  const book = await prisma.book.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: slug },
        { title: decodedSlug },
      ],
      isPublished: true,
      isVisible: true,
    },
    include: {
      retailers: {
        where: {
          isActive: true,
          url: { not: "" },
        },
        include: { retailer: true },
      },
    },
  })

  if (!book) {
    notFound()
  }

  const bookUrl = `https://mayaallan.com/books/${book.slug}`

  const formats = [
    { key: "ebook", label: "Ebook", available: book.hasEbook, price: book.ebookPrice },
    { key: "paperback", label: "Paperback", available: book.hasPaperback, price: book.paperbackPrice },
    { key: "hardcover", label: "Hardcover", available: book.hasHardcover, price: book.hardcoverPrice },
  ].filter((f) => f.available)

  const retailerLinks = book.retailers.filter((l) => (l.url ?? "").trim().length > 0)

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
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Formats & Pricing */}
          {formats.length > 0 && !book.isComingSoon && (
            <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <p className="text-sm font-medium mb-3">Available Formats</p>
              <div className="flex flex-wrap gap-3">
                {formats.map((f) => (
                  <div
                    key={f.key}
                    className="px-4 py-3 border border-slate-300 rounded-lg bg-white text-center min-w-[100px]"
                  >
                    <div className="text-sm font-medium text-slate-600">{f.label}</div>
                    {f.price && (
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        ${Number(f.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon */}
          {book.isComingSoon && (
            <div className="mt-6">
              <span className="inline-block px-6 py-3 text-sm font-semibold border border-amber-500 bg-amber-500 text-white rounded-full">
                Coming Soon
              </span>
            </div>
          )}

          {/* Direct Sale Buttons */}
          {!book.isComingSoon && book.allowDirectSale && (book.stripePaymentLink || book.paypalPaymentLink) && (
            <div className="mt-6 space-y-3">
              {book.stripePaymentLink && (
                <a
                  href={book.stripePaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-6 py-3 text-sm font-semibold text-center border border-black bg-black text-white rounded-full hover:bg-slate-800 transition"
                >
                  Buy Now - Direct Purchase
                </a>
              )}
              {book.paypalPaymentLink && (
                <a
                  href={book.paypalPaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-6 py-3 text-sm font-semibold text-center border border-blue-600 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                  Buy with PayPal
                </a>
              )}
            </div>
          )}

          {/* Retailer Links */}
          {!book.isComingSoon && book.allowRetailerSale && retailerLinks.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-600 mb-3">
                Also available at
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {retailerLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <span className="text-2xl">
                      {retailerIcons[link.retailer.slug] || "🔗"}
                    </span>
                    <div>
                      <span className="text-sm font-medium block">{link.retailer.name}</span>
                      <span className="text-xs text-slate-500 capitalize">{link.formatType}</span>
                    </div>
                  </a>
                ))}
              </div>
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

          {/* Book Details */}
          {(book.isbn || book.copyright) && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h2 className="font-serif text-xl font-semibold mb-4">Book Details</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {book.isbn && (
                  <>
                    <dt className="text-slate-500">ISBN</dt>
                    <dd className="text-slate-900">{book.isbn}</dd>
                  </>
                )}
                {book.copyright && (
                  <>
                    <dt className="text-slate-500">Copyright</dt>
                    <dd className="text-slate-900">{book.copyright}</dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Back Cover */}
      {book.backCoverUrl && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="font-serif text-xl font-semibold mb-4">Back Cover</h2>
          <div className="relative w-full max-w-md aspect-[2/3] border border-slate-200 shadow-lg rounded-md overflow-hidden">
            <Image
              src={book.backCoverUrl}
              alt={`${book.title} back cover`}
              fill
              className="object-contain bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  )
}
