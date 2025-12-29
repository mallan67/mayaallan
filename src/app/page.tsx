import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // HOMEPAGE LOGIC:
  // 1. First try to find a book marked as "Featured" (isFeatured = true) AND published
  // 2. If none, fall back to the most recently published book
  // NOTE: We do NOT filter by isVisible here - that's only for the /books listing page
  
  let featuredBook = await prisma.book.findFirst({
    where: {
      isFeatured: true,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Fallback: if no featured book, get the latest published book
  if (!featuredBook) {
    featuredBook = await prisma.book.findFirst({
      where: {
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {featuredBook ? (
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Book Cover */}
            <div className="flex justify-center md:justify-end order-1 md:order-2">
              {featuredBook.coverUrl ? (
                <Link href={`/books/${featuredBook.slug}`}>
                  <div className="relative w-64 md:w-80 aspect-[2/3] shadow-2xl rounded-lg overflow-hidden hover:shadow-3xl transition-shadow">
                    <Image
                      src={featuredBook.coverUrl}
                      alt={featuredBook.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </Link>
              ) : (
                <div className="w-64 md:w-80 aspect-[2/3] bg-slate-200 rounded-lg flex items-center justify-center">
                  <span className="text-slate-400">No cover</span>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="order-2 md:order-1 text-center md:text-left">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                {featuredBook.isComingSoon ? "Coming Soon" : "Featured Book"}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                {featuredBook.title}
              </h1>
              {featuredBook.subtitle1 && (
                <p className="mt-4 text-lg md:text-xl text-slate-600">
                  {featuredBook.subtitle1}
                </p>
              )}
              {featuredBook.tagsCsv && (
                <p className="mt-4 text-sm text-slate-500 italic">
                  {featuredBook.tagsCsv.split(",").map((t) => t.trim()).join(" • ")}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  href={`/books/${featuredBook.slug}`}
                  className="inline-block px-8 py-3 text-sm font-semibold text-white bg-black rounded-full hover:bg-slate-800 transition"
                >
                  {featuredBook.isComingSoon ? "Learn More" : "View Book"}
                </Link>
                <Link
                  href="/books"
                  className="inline-block px-8 py-3 text-sm font-semibold text-slate-700 border border-slate-300 rounded-full hover:bg-slate-50 transition"
                >
                  All Books
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // No books at all
          <div className="text-center py-20">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold">
              Welcome to Maya Allan
            </h1>
            <p className="mt-4 text-slate-600">Books coming soon.</p>
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-6">
            About the Author
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Maya Allan is a writer dedicated to helping readers navigate life's most profound experiences 
            with clarity, compassion, and practical wisdom.
          </p>
          <Link
            href="/about"
            className="inline-block mt-6 text-sm font-medium text-slate-700 hover:text-black transition"
          >
            Learn more →
          </Link>
        </div>
      </section>
    </div>
  )
}
