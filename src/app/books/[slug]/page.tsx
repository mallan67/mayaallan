import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAllBooks, getBookRetailerLinks, getAllRetailers } from "@/lib/mock-data"
import { ShareButtons } from "@/components/share-buttons"
import { generateBookSchema } from "@/lib/structured-data"
import type { Metadata } from "next"

interface BookPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params
  const books = await getAllBooks()
  const book = books.find((b) => b.slug === slug)

  if (!book) {
    return {
      title: "Book Not Found",
    }
  }

  return {
    title: book.title,
    description: book.blurb || book.subtitle1 || `${book.title} by Maya Allan`,
    openGraph: {
      title: book.title,
      description: book.blurb || book.subtitle1 || "",
      url: `https://mayaallan.com/books/${book.slug}`,
      images: book.coverUrl ? [{ url: book.coverUrl }] : [],
      type: "book",
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description: book.blurb || book.subtitle1 || "",
      images: book.coverUrl ? [book.coverUrl] : [],
    },
  }
}

export async function generateStaticParams() {
  const books = await getAllBooks()
  return books.map((book) => ({
    slug: book.slug,
  }))
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const books = await getAllBooks()
  const book = books.find((b) => b.slug === slug)

  if (!book || !book.isPublished) {
    notFound()
  }

  const retailerLinks = await getBookRetailerLinks(book.id)
  const allRetailers = await getAllRetailers()
  const activeRetailers = retailerLinks
    .filter((link) => link.isActive)
    .map((link) => {
      const retailer = allRetailers.find((r) => r.id === link.retailerId)
      return retailer ? { ...retailer, url: link.url, formatType: link.formatType } : null
    })
    .filter((r) => r !== null)

  const bookUrl = `https://mayaallan.com/books/${book.slug}`

  const structuredData = generateBookSchema(book)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        <Link href="/books" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
          ← Back to Books
        </Link>

        <div className="grid md:grid-cols-[300px_1fr] gap-10 mt-6">
          {/* Book Cover */}
          <div>
            {book.coverUrl ? (
              <div className="relative w-full aspect-[2/3] border border-slate-200 shadow-lg rounded-md overflow-hidden sticky top-6">
                <Image src={book.coverUrl || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
              </div>
            ) : null}

            {book.backCoverUrl && (
              <div className="relative w-full aspect-[2/3] border border-slate-200 shadow-lg rounded-md overflow-hidden mt-4">
                <Image
                  src={book.backCoverUrl || "/placeholder.svg"}
                  alt={`${book.title} - Back Cover`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Book Details */}
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">{book.title}</h1>
            {book.subtitle1 && <p className="mt-3 text-lg text-slate-700">{book.subtitle1}</p>}
            {book.subtitle2 && <p className="mt-2 text-base text-slate-600">{book.subtitle2}</p>}

            {(book.isbn || book.copyright) && (
              <div className="mt-4 text-sm text-slate-600 space-y-1">
                {book.isbn && <p>ISBN: {book.isbn}</p>}
                {book.copyright && <p>{book.copyright}</p>}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <ShareButtons
                url={bookUrl}
                title={book.title}
                description={book.blurb ?? book.subtitle1 ?? undefined}
                hashtags={book.tagsCsv?.split(",").map((t) => t.trim())}
              />
            </div>

            {book.tagsCsv && (
              <div className="mt-4 flex flex-wrap gap-2">
                {book.tagsCsv.split(",").map((tag, i) => (
                  <span key={i} className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {book.blurb && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h2 className="font-serif text-xl font-semibold mb-3">About This Book</h2>
                <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">{book.blurb}</p>
              </div>
            )}

            {book.isComingSoon ? (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <span className="inline-block px-6 py-3 text-sm font-semibold border-2 border-black bg-black text-white rounded-full">
                  Coming Soon
                </span>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h2 className="font-serif text-xl font-semibold mb-4">Get This Book</h2>

                {book.allowDirectSale && (book.stripePaymentLink || book.paypalPaymentLink) && (
                  <div className="mb-6 space-y-3">
                    {book.stripePaymentLink && (
                      <a
                        href={book.stripePaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-6 py-3 text-sm font-semibold text-center border-2 border-black bg-black text-white rounded-full hover:bg-black/80 transition"
                      >
                        Buy with Stripe
                      </a>
                    )}
                    {book.paypalPaymentLink && (
                      <a
                        href={book.paypalPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-6 py-3 text-sm font-semibold text-center border-2 border-blue-600 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                      >
                        Buy with PayPal
                      </a>
                    )}
                    <p className="text-xs text-slate-500 text-center">
                      Ebook will be delivered via email after purchase
                    </p>
                  </div>
                )}

                {activeRetailers.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Also available at:</p>
                    <div className="space-y-2">
                      {activeRetailers.map((retailer) => (
                        <a
                          key={`${retailer.id}-${retailer.formatType}`}
                          href={retailer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-3 text-sm border border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition"
                        >
                          <span className="font-medium">{retailer.name}</span>
                          <span className="text-xs text-slate-500 capitalize">{retailer.formatType}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!book.allowDirectSale && activeRetailers.length === 0 && !book.isComingSoon && (
                  <p className="text-sm text-slate-600">Purchase options will be available soon.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
