import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { NewsletterSection } from "@/components/NewsletterSection"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export const revalidate = 300 // 5 minutes

export const metadata: Metadata = {
  title: "Maya Allan | Author",
  description: "Official website of Maya Allan - Author, Speaker, and Wellness Advocate",
}

/**
 * HOMEPAGE LOGIC (strict):
 *
 * Featured book selection:
 *  - Only display a book when `isFeatured === true` AND `isPublished === true` AND `isVisible === true`.
 *  - The `isVisible` flag controls visibility on BOTH the books page and homepage.
 *
 * IMPORTANT:
 *  - If no book is featured, render nothing (blank hero) — per owner's requirement.
 *
 */
export default async function HomePage() {
  let featuredBook = null

  try {
    // Query: Get featured + published + visible book
    const { data, error } = await supabaseAdmin
      .from(Tables.books)
      .select("*")
      .eq("is_featured", true)
      .eq("is_published", true)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      featuredBook = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        subtitle1: data.subtitle1,
        subtitle2: data.subtitle2,
        blurb: data.blurb,
        tagsCsv: data.tags_csv,
        coverUrl: data.cover_url,
        isFeatured: data.is_featured,
        isComingSoon: data.is_coming_soon,
      }
    }
  } catch (error) {
    // During build or if DB unavailable, show default hero
    console.warn("Featured book fetch failed:", error)
  }

  // If no featured book, render default hero
  if (!featuredBook) {
    return (
      <div className="min-h-screen">
        {/* Default Hero Section */}
        <section className="max-w-4xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
              Maya Allan – Author & Guide
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Integration guides for transformative experiences. Workshops, talks, and books to support your journey with clarity and compassion.
            </p>
            <div className="pt-6 flex flex-wrap gap-4 justify-center">
              <Link
                href="/books"
                className="inline-block px-8 py-3.5 text-sm font-semibold text-white bg-black rounded-full hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
              >
                Explore Books
              </Link>
              <Link
                href="/events"
                className="inline-block px-8 py-3.5 text-sm font-semibold text-slate-700 border-2 border-slate-300 rounded-full hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />
      </div>
    )
  }

  // Extract blurb preview (first 2-3 sentences or first 200 chars)
  const getBlurbPreview = (blurb: string | null) => {
    if (!blurb) return null
    const sentences = blurb.split(/[.!?]\s+/)
    const preview = sentences.slice(0, 2).join(". ")
    if (preview.length > 250) {
      return preview.substring(0, 250) + "..."
    }
    return preview + (sentences.length > 2 ? "..." : ".")
  }

  const blurbPreview = getBlurbPreview(featuredBook.blurb)

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
                <div className="relative w-72 md:w-96 aspect-[2/3] shadow-2xl rounded-lg overflow-hidden hover:shadow-3xl hover:scale-105 transition-all duration-300">
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
              <div className="w-72 md:w-96 aspect-[2/3] bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-400">No cover</span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="order-2 md:order-1 text-center md:text-left space-y-4">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {featuredBook.isFeatured ? "Featured Book" : "Latest Book"}
              {featuredBook.isComingSoon && " • Coming Soon"}
            </p>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
              {featuredBook.title}
            </h1>

            {featuredBook.subtitle1 && (
              <p className="text-lg md:text-xl text-slate-700 font-medium">
                {featuredBook.subtitle1}
              </p>
            )}

            {featuredBook.subtitle2 && (
              <p className="text-base md:text-lg text-slate-600 italic">
                {featuredBook.subtitle2}
              </p>
            )}

            {blurbPreview && (
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                {blurbPreview}
              </p>
            )}

            {featuredBook.tagsCsv && (
              <p className="text-sm text-slate-500 italic">
                {featuredBook.tagsCsv.split(",").map((t: string) => t.trim()).join(" • ")}
              </p>
            )}

            <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href={`/books/${featuredBook.slug}`}
                className="inline-block px-8 py-3.5 text-sm font-semibold text-white bg-black rounded-full hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
              >
                {featuredBook.isComingSoon ? "Learn More" : "View Book"}
              </Link>
              <Link
                href="/books"
                className="inline-block px-8 py-3.5 text-sm font-semibold text-slate-700 border-2 border-slate-300 rounded-full hover:bg-slate-50 hover:border-slate-400 transition-all"
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
      {/* NEWSLETTER SECTION */}
      {/* ============================================ */}
      <NewsletterSection />
    </div>
  )
}
