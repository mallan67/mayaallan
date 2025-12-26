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

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params
  const book = await prisma.book.findUnique({
    where: { slug },
  })

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

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      retailers: {
        where: { isActive: true },
        include: { retailer: true },
      },
    },
  })

  if (!book || !book.isPublished || !book.isVisible) {
    notFound()
  }

  const bookUrl = `https://mayaallan.com/books/${book.slug}`

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <Link href="/books" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
        ← Back to Books
      </Link>

      <div className="grid md:grid-cols-[300px_1fr] gap-10 mt-6">
        <div>
          {book.coverUrl && (
            <div className="relative w-full aspect-[2/3] border border-slate-200 shadow-lg rounded-md overflow-hidden sticky top-6">
              <Image src={book.coverUrl} alt={book.title} fill className="object-contain bg-slate-50" />
            </div>
          )}

          {book.backCoverUrl && (
            <div className="relative w-full aspect-[2/3] border border-slate-200 shadow-lg rounded-md overflow-hidden mt-4">
              <Image src={book.backCoverUrl} alt={`${book.title} - Back Cover`} fill className="object-contain bg-slate-50" />
            </div>
          )}
        </div>

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
                    
                      href={book.stripePaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-6 py-3 text-sm font-semibold text-center border-2 border-black bg-black text-white rounded-full hover:bg-black/80 transition"
                    >
                      Buy with Stripe
                    </a>
                  )}
                  {book.paypalPaymentLink && (
                    
                      href={book.paypalPaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-6 py-3 text-sm font-semibold text-center border-2 border-blue-600 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    >
                      Buy with PayPal
                    </a>
                  )}
                  <p className="text-xs text-slate-500 text-center">Ebook will be delivered via email after purchase</p>
                </div>
              )}

              {book.retailers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-600 mb-3">Also available at:</p>
                  <div className="space-y-2">
                    {book.retailers.map((link) => (
                      
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 text-sm border border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition"
                      >
                        <span className="font-medium">{link.retailer.name}</span>
                        <span className="text-xs text-slate-500 capitalize">{link.formatType}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!book.allowDirectSale && book.retailers.length === 0 && !book.isComingSoon && (
                <p className="text-sm text-slate-600">Purchase options will be available soon.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
