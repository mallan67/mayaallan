import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Maya Allan | Author",
  description: "Official website of Maya Allan - Author, Speaker, and Wellness Advocate",
}

/**
 * HOMEPAGE LOGIC (strict):
 *
 * Featured book selection:
 *  - Only display a book when `isFeatured === true` AND `isPublished === true`.
 *  - Do NOT check `isVisible`. This ensures "Show on Books Page" (isVisible)
 *    ONLY affects the /books listing and not the homepage.
 *
 * IMPORTANT:
 *  - If no book is featured, render nothing (blank hero) — per owner's requirement.
 *
 */
export default async function HomePage() {
  // Query: Get featured + published book (do NOT require isVisible)
  const featuredBook = await prisma.book.findFirst({
    where: {
      isFeatured: true,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // If no featured book, render a minimal / blank body (owner requested blank)
  if (!featuredBook) {
    return (
      <div className="min-h-screen">
        {/* Intentionally blank hero: no featured book selected */}
        <section className="max-w-6xl mx-auto px-4 py-24">
          {/* Render nothing, but keep the page shell (header/footer handle nav) */}
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
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
              {featuredBook.isFeatured ? "Featured Book" : "Latest Book"}
              {featuredBook.isComingSoon && " • Coming Soon"}
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
      </section>

      {/* ============================================ */}
      {/* ABOUT SECTION (left as-is) */}
      {/* ============================================ */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-6">
            About the Author
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Maya Allan is a writer dedicated to helping readers navigate life's most profound experiences
            with clarity, compassion, and practical wisdom. Her work focuses on integration,
            self-agency, and the journey of inner transformation.
          </p>
          <Link
            href="/about"
            className="inline-block mt-6 text-sm font-medium text-slate-700 hover:text-black transition"
          >
            Learn more →
          </Link>
        </div>
      </section>

      {/* ============================================ */}
      {/* NEWSLETTER SECTION (left as-is) */}
      {/* ============================================ */}
      <section className="py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-semibold mb-4">
            Stay Connected
          </h2>
          <p className="text-slate-600 mb-6">
            Join the newsletter for updates on new releases, events, and insights.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-3 border border-slate-300 rounded-full text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white bg-black rounded-full hover:bg-slate-800 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
