import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ShareButtons } from "@/components/share-buttons"
import { PaymentButtons } from "@/components/PaymentButtons"
import { RetailerIcon } from "@/lib/retailer-icons"
import type { Metadata } from "next"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

interface BookPageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 300 // 5 minutes

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  try {
    const { data: book, error } = await supabaseAdmin
      .from(Tables.books)
      .select("title, seo_title, seo_description, blurb, subtitle1")
      .or(`slug.eq.${decodedSlug},slug.eq.${slug}`)
      .limit(1)
      .single()

    if (error || !book) {
      return { title: "Book Not Found" }
    }

    return {
      title: book.seo_title || book.title,
      description: book.seo_description || book.blurb || book.subtitle1 || `${book.title} by Maya Allan`,
    }
  } catch (error) {
    console.warn("Book metadata fetch failed:", error)
    return { title: "Book Not Found" }
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  let book = null

  try {
    // Find the book - must be published to view
    const { data, error } = await supabaseAdmin
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
      .or(`slug.eq.${decodedSlug},slug.eq.${slug}`)
      .eq("is_published", true)
      .limit(1)
      .single()

    if (!error && data) {
      book = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        subtitle1: data.subtitle1,
        subtitle2: data.subtitle2,
        blurb: data.blurb,
        tagsCsv: data.tags_csv,
        coverUrl: data.cover_url,
        hasEbook: data.has_ebook,
        hasPaperback: data.has_paperback,
        hasHardcover: data.has_hardcover,
        ebookPrice: data.ebook_price,
        paperbackPrice: data.paperback_price,
        hardcoverPrice: data.hardcover_price,
        isComingSoon: data.is_coming_soon,
        allowDirectSale: data.allow_direct_sale,
        allowRetailerSale: data.allow_retailer_sale,
        stripePaymentLink: data.stripe_payment_link,
        paypalPaymentLink: data.paypal_payment_link,
        retailers: (data.book_retailer_links || [])
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
      }
    }
  } catch (error) {
    console.warn("Book fetch failed:", error)
  }

  if (!book) {
    notFound()
  }

  const bookUrl = `https://mayaallan.com/books/${book.slug}`

  // ============================================
  // DIRECT SALE LOGIC
  // ============================================
  // Show direct sale section if:
  // 1. allowDirectSale is TRUE
  // 2. AND book has an ebook price
  // The checkout API will create Stripe/PayPal sessions dynamically
  // External payment links are legacy - we now use proper checkout with webhooks
  const showDirectSale = book.allowDirectSale === true && book.hasEbook && book.ebookPrice && Number(book.ebookPrice) > 0

  // ============================================
  // RETAILER LINKS LOGIC
  // ============================================
  // Group retailer links by format type
  // Only include links that have:
  // 1. A non-empty URL
  // 2. A retailer with a non-empty name
  const retailersByFormat: Record<string, typeof book.retailers> = {}

  book.retailers
    .filter((link: any) => {
      const hasUrl = link.url && link.url.trim() !== ""
      const hasRetailerName = link.retailer && link.retailer.name && link.retailer.name.trim() !== ""
      return hasUrl && hasRetailerName
    })
    .forEach((link: any) => {
      const format = link.formatType || "ebook"
      if (!retailersByFormat[format]) {
        retailersByFormat[format] = []
      }
      retailersByFormat[format].push(link)
    })

  const hasRetailerLinks = Object.keys(retailersByFormat).length > 0
  const showRetailerSale = book.allowRetailerSale === true && hasRetailerLinks

  // ============================================
  // FORMATS & PRICING
  // ============================================
  const formats = [
    { key: "ebook", label: "Ebook", available: book.hasEbook, price: book.ebookPrice },
    { key: "paperback", label: "Paperback", available: book.hasPaperback, price: book.paperbackPrice },
    { key: "hardcover", label: "Hardcover", available: book.hasHardcover, price: book.hardcoverPrice },
  ].filter((f) => f.available)

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <Link href="/books" className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1">
        ← Back to Books
      </Link>

      {/* Hero Section */}
      <div className="mt-8 grid md:grid-cols-[340px_1fr] lg:grid-cols-[400px_1fr] gap-8 md:gap-16">
        {/* Cover Image */}
        <div>
          {book.coverUrl ? (
            <div className="relative w-full max-w-[320px] mx-auto md:max-w-none aspect-[2/3] border border-slate-200 shadow-2xl rounded-xl overflow-hidden md:sticky md:top-6">
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="w-full max-w-[320px] mx-auto md:max-w-none aspect-[2/3] border border-slate-200 shadow-2xl rounded-xl flex items-center justify-center bg-slate-50">
              <span className="text-slate-400">No cover image</span>
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="min-w-0 space-y-6">
          {/* Title Section */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900">
              {book.title}
            </h1>
            <p className="mt-3 text-lg text-slate-600">by Maya Allan</p>

            {book.subtitle1 && (
              <p className="mt-4 text-xl md:text-2xl text-slate-700 font-medium leading-snug">
                {book.subtitle1}
              </p>
            )}
            {book.subtitle2 && (
              <p className="mt-3 text-base md:text-lg text-slate-600 italic">
                {book.subtitle2}
              </p>
            )}

            {book.tagsCsv && (
              <div className="mt-4 flex flex-wrap gap-2">
                {book.tagsCsv.split(",").map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* About the Book (moved up) */}
          {book.blurb && (
            <div className="py-6 border-y border-slate-200">
              <h2 className="font-serif text-xl font-semibold mb-3 text-slate-900">About This Book</h2>
              <div className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                {book.blurb}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* FORMATS & PRICING SECTION */}
          {/* ============================================ */}
          {formats.length > 0 && !book.isComingSoon && (
            <div className="p-6 border-2 border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
              <h3 className="text-base font-bold text-slate-900 mb-4">Available Formats</h3>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {formats.map((f) => (
                  <div
                    key={f.key}
                    className="p-4 border-2 border-slate-200 rounded-xl bg-white text-center hover:border-blue-300 transition-colors"
                  >
                    <div className="text-sm font-semibold text-slate-700">
                      {f.label}
                    </div>
                    {f.price && Number(f.price) > 0 && (
                      <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
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
            <div className="flex justify-center md:justify-start">
              <span className="inline-block px-8 py-4 text-base font-bold bg-amber-500 text-white rounded-full shadow-lg">
                Coming Soon
              </span>
            </div>
          )}

          {/* ============================================ */}
          {/* PURCHASE OPTIONS - Only if NOT coming soon */}
          {/* ============================================ */}
          {!book.isComingSoon && (
            <div className="space-y-6">

              {/* ---------------------------------------- */}
              {/* DIRECT SALE SECTION */}
              {/* ---------------------------------------- */}
              {showDirectSale && (
                <div className="p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 to-white">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Buy Direct</h3>
                  <PaymentButtons bookId={book.id} hasStripe={true} hasPayPal={true} />
                </div>
              )}

              {/* ---------------------------------------- */}
              {/* RETAILER LINKS SECTION */}
              {/* ---------------------------------------- */}
              {showRetailerSale && (
                <div className="p-6 border-2 border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
                  <h3 className="text-base font-bold text-slate-900 mb-4">
                    Buy from Retailers
                  </h3>

                  {Object.entries(retailersByFormat).map(([formatType, links]) => (
                    <div key={formatType} className="mb-5 last:mb-0">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 capitalize">
                        {formatType}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(links as any[]).map((link: any) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-5 py-3 border-2 border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all text-sm font-semibold group"
                          >
                            <RetailerIcon name={link.retailer.name} className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                            <span className="truncate">
                              {link.retailer.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------- */}
              {/* NO PURCHASE OPTIONS FALLBACK */}
              {/* ---------------------------------------- */}
              {!showDirectSale && !showRetailerSale && (
                <div className="p-6 border-2 border-amber-200 rounded-2xl bg-amber-50">
                  <p className="text-sm font-medium text-amber-900">
                    Purchase options coming soon. Check back later!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Share Buttons */}
          <div className="pt-6 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-600 mb-3">Share this book</p>
            <ShareButtons
              url={bookUrl}
              title={book.title}
              description={book.blurb ?? book.subtitle1 ?? undefined}
              hashtags={book.tagsCsv?.split(",").map((t: string) => t.trim())}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
