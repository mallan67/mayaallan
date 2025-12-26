import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

interface BookRetailer {
  id: number
  url: string
  formatType: string
  retailer: {
    id: number
    name: string
    slug: string
    iconUrl: string | null
  }
}

interface Book {
  id: number
  slug: string
  title: string
  subtitle1: string | null
  subtitle2: string | null
  blurb: string | null
  coverUrl: string | null
  hasEbook: boolean
  hasPaperback: boolean
  hasHardcover: boolean
  ebookPrice: number | null
  paperbackPrice: number | null
  hardcoverPrice: number | null
  allowDirectSale: boolean
  allowRetailerSale: boolean
  stripePaymentLink: string | null
  paypalPaymentLink: string | null
  retailers: BookRetailer[]
}

async function getFeaturedBook(): Promise<Book | null> {
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
    return book as Book | null
  } catch (error) {
    console.error("Error fetching featured book:", error)
    return null
  }
}

function formatPrice(price: number | null): string {
  if (!price) return ""
  return `$${price.toFixed(2)}`
}

export default async function HomePage() {
  const book = await getFeaturedBook()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          {book ? (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Book Cover */}
              <div className="flex justify-center">
                {book.coverUrl ? (
                  <div className="relative">
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      width={350}
                      height={525}
                      className="rounded-lg shadow-2xl"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-[350px] h-[525px] bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400">No cover</span>
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="space-y-6">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  {book.title}
                </h1>
                
                {book.subtitle1 && (
                  <p className="text-xl text-slate-600">{book.subtitle1}</p>
                )}
                
                {book.subtitle2 && (
                  <p className="text-lg text-slate-500">{book.subtitle2}</p>
                )}

                {book.blurb && (
                  <p className="text-slate-600 leading-relaxed line-clamp-4">
                    {book.blurb}
                  </p>
                )}

                {/* Formats & Prices */}
                <div className="flex flex-wrap gap-3">
                  {book.hasEbook && book.ebookPrice && (
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      Ebook {formatPrice(book.ebookPrice)}
                    </span>
                  )}
                  {book.hasPaperback && book.paperbackPrice && (
                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      Paperback {formatPrice(book.paperbackPrice)}
                    </span>
                  )}
                  {book.hasHardcover && book.hardcoverPrice && (
                    <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                      Hardcover {formatPrice(book.hardcoverPrice)}
                    </span>
                  )}
                </div>

                {/* Buy Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {/* Direct Sale */}
                  {book.allowDirectSale && book.stripePaymentLink && (
                    <a
                      href={book.stripePaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-black/80 transition-colors"
                    >
                      Buy Now
                    </a>
                  )}

                  {/* Retailer Links */}
                  {book.allowRetailerSale && book.retailers.length > 0 && (
                    <>
                      {book.retailers.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          {link.retailer.iconUrl && (
                            <Image
                              src={link.retailer.iconUrl}
                              alt={link.retailer.name}
                              width={20}
                              height={20}
                            />
                          )}
                          {link.retailer.name}
                        </a>
                      ))}
                    </>
                  )}

                  {/* Learn More */}
                  <Link
                    href={`/books/${book.slug}`}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h1 className="font-serif text-4xl font-bold text-slate-900 mb-4">
                Welcome
              </h1>
              <p className="text-slate-600">
                No featured book yet. Add one in the admin panel.
              </p>
              <Link
                href="/admin/books"
                className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80"
              >
                Go to Admin
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-slate-900 mb-6">
            About the Author
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Welcome to my author website. Explore my books and connect with me on social media.
          </p>
        </div>
      </section>
    </main>
  )
}
