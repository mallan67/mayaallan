import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { MessageCircle, Dna, Brain, ListChecks, HeartPulse, PenLine, Star, Calendar, MapPin, ArrowRight } from "lucide-react"
import { NewsletterSection } from "@/components/NewsletterSection"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { generateAuthorSchema } from "@/lib/structured-data"

const SITE_URL = "https://www.mayaallan.com"

export const revalidate = 300 // 5 minutes

async function getFeaturedBookForMetadata() {
  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.books)
      .select("title, blurb, cover_url, og_image_url")
      .eq("is_featured", true)
      .eq("is_published", true)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const featuredBook = await getFeaturedBookForMetadata()

  const title = "Maya Allan | Author"
  const description = featuredBook?.blurb
    ? `${featuredBook.blurb.substring(0, 150)}...`
    : "Official website of Maya Allan - Author, Speaker, and Wellness Advocate. Discover books, events, and resources for integration and transformation."

  // ALWAYS use dynamic OG image for consistent 1200x630 sizing across all platforms
  // The dynamic image generator creates properly sized images that work on Facebook, LinkedIn, etc.
  const imageUrl = `${SITE_URL}/opengraph-image`
  const imageAlt = featuredBook ? `${featuredBook.title} by Maya Allan` : "Maya Allan - Author"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: SITE_URL,
    },
  }
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
  // ── Data fetching ──
  let featuredBook: {
    id: number
    slug: string
    title: string
    subtitle1: string | null
    subtitle2: string | null
    subtitle3: string | null
    blurb: string | null
    tagsCsv: string | null
    coverUrl: string | null
    isFeatured: boolean
    isComingSoon: boolean
    hasEbook: boolean
    hasPaperback: boolean
    hasHardcover: boolean
    ebookPrice: number | null
    paperbackPrice: number | null
    hardcoverPrice: number | null
  } | null = null

  let authorInfo: {
    authorName: string | null
    authorBio: string | null
    authorPhotoUrl: string | null
  } | null = null

  let upcomingEvents: {
    id: number
    slug: string
    title: string
    description: string | null
    startsAt: string
    locationText: string | null
  }[] = []

  // Fetch featured book
  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.books)
      .select("*")
      .eq("is_featured", true)
      .eq("is_published", true)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Homepage featured book query error:", error.message, error.code, error.details)
    }
    if (!error && data) {
      console.log("Homepage found featured book:", data.title, data.slug)
      featuredBook = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        subtitle1: data.subtitle1,
        subtitle2: data.subtitle2,
        subtitle3: data.subtitle3,
        blurb: data.blurb,
        tagsCsv: data.tags_csv,
        coverUrl: data.cover_url,
        isFeatured: data.is_featured,
        isComingSoon: data.is_coming_soon,
        hasEbook: data.has_ebook,
        hasPaperback: data.has_paperback,
        hasHardcover: data.has_hardcover,
        ebookPrice: data.ebook_price,
        paperbackPrice: data.paperback_price,
        hardcoverPrice: data.hardcover_price,
      }
    } else if (!data) {
      console.log("Homepage: No featured book found matching criteria (is_featured=true, is_published=true, is_visible=true)")
    }
  } catch (error: any) {
    console.error("Homepage featured book fetch failed:", error?.message || error)
  }

  // Fetch author info from SiteSettings
  try {
    const { data } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("authorName, authorBio, authorPhotoUrl")
      .limit(1)
      .single()

    if (data) {
      authorInfo = {
        authorName: data.authorName,
        authorBio: data.authorBio,
        authorPhotoUrl: data.authorPhotoUrl,
      }
    }
  } catch {
    // Fallback handled in rendering
  }

  // Fetch upcoming events
  try {
    const { data } = await supabaseAdmin
      .from(Tables.events)
      .select("id, slug, title, description, startsAt, locationText")
      .eq("isVisible", true)
      .order("startsAt", { ascending: true })
      .limit(3)

    if (data && data.length > 0) {
      upcomingEvents = data
    }
  } catch {
    // Events section won't render if empty
  }

  // Author schema for SEO
  const authorSchema = generateAuthorSchema(
    SITE_URL,
    "Maya Allan is a writer dedicated to helping readers navigate life's most profound experiences with clarity, compassion, and practical wisdom."
  )

  // Extract blurb preview (first 2-3 sentences)
  const getBlurbPreview = (blurb: string | null) => {
    if (!blurb) return null
    const sentences = blurb.split(/[.!?]\s+/)
    const preview = sentences.slice(0, 2).join(". ")
    if (preview.length > 250) {
      return preview.substring(0, 250) + "..."
    }
    return preview + (sentences.length > 2 ? "..." : ".")
  }

  // Get lowest price from available formats
  const getLowestPrice = () => {
    if (!featuredBook) return null
    const prices = [
      featuredBook.hasEbook ? featuredBook.ebookPrice : null,
      featuredBook.hasPaperback ? featuredBook.paperbackPrice : null,
      featuredBook.hasHardcover ? featuredBook.hardcoverPrice : null,
    ].filter((p): p is number => p !== null && p > 0)
    return prices.length > 0 ? Math.min(...prices) : null
  }

  // Format event date
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate().toString(),
      full: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    }
  }

  const blurbPreview = featuredBook ? getBlurbPreview(featuredBook.blurb) : null
  const lowestPrice = getLowestPrice()

  return (
    <div className="min-h-screen">
      {/* Author Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(authorSchema),
        }}
      />

      {/* ════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                 */}
      {/* ════════════════════════════════════════════════ */}
      <section className="py-24 md:py-[96px] relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="orb orb-gold w-[500px] h-[500px] -top-40 -left-40 absolute opacity-60" />
        <div className="orb orb-blue w-[400px] h-[400px] top-20 -right-32 absolute opacity-50" />
        <div className="orb orb-gold w-[300px] h-[300px] bottom-0 left-1/3 absolute opacity-40" />

        <div className="max-w-[1160px] mx-auto px-5 md:px-9 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[72px] items-center">
            {/* Content */}
            <div className="max-w-[540px] text-center md:text-left order-2 md:order-1 mx-auto md:mx-0">
              <p className="inline-flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.14em] uppercase text-gold mb-7">
                <span className="w-7 h-0.5 bg-gold" />
                Author &middot; Speaker &middot; Wellness Advocate
              </p>

              <h1 className="font-serif text-[clamp(2.6rem,5.5vw,3.8rem)] font-semibold leading-[1.15] tracking-[-0.03em] mb-6">
                Practical Tools for{" "}
                <em className="font-normal italic text-liquid-blue-bright">Coming Home</em>{" "}
                to Yourself.
              </h1>

              <p className="text-[1.08rem] text-charcoal-mid leading-[1.8] mb-10">
                I write about what most people are afraid to question — inherited beliefs, old patterns, the stories that quietly run our lives. My work is for anyone ready to stop outsourcing their healing and start authoring their own transformation.
              </p>

              <div className="flex flex-wrap gap-3.5 mb-12 justify-center md:justify-start">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 px-9 py-[15px] text-[0.85rem] font-semibold tracking-[0.03em] text-white bg-charcoal rounded-full transition-all hover:bg-black hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                >
                  Explore My Books
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-9 py-[15px] text-[0.85rem] font-semibold tracking-[0.03em] text-charcoal bg-transparent border-2 border-[#CDCDD2] rounded-full transition-all hover:border-charcoal"
                >
                  About Me
                </Link>
              </div>

              <p className="font-serif italic font-normal text-base text-charcoal-body leading-[1.7] pl-5 border-l-[3px] border-gold text-left">
                &ldquo;No one can heal us but ourselves. The return to yourself is a path only you can take.&rdquo;
              </p>
            </div>

            {/* Author Photo */}
            <div className="flex justify-center items-center order-1 md:order-2">
              {authorInfo?.authorPhotoUrl ? (
                <div className="w-[260px] h-[320px] md:w-[400px] md:h-[480px] rounded-[20px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)]">
                  <Image
                    src={authorInfo.authorPhotoUrl}
                    alt="Maya Allan"
                    width={400}
                    height={480}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-[260px] h-[320px] md:w-[400px] md:h-[480px] rounded-[20px] bg-surface flex items-center justify-center">
                  <span className="text-charcoal-soft">Photo</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider max-w-[1160px] mx-auto">
        <div className="diamond" />
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* 2. AREAS OF EXPLORATION                         */}
      {/* ════════════════════════════════════════════════ */}
      <section className="bg-surface py-24">
        <div className="max-w-[1160px] mx-auto px-5 md:px-9">
          <div className="text-center mb-14">
            <p className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-gold mb-3">
              What I Explore
            </p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.02em] mb-3">
              Areas of Exploration
            </h2>
            <p className="text-charcoal-mid text-base leading-[1.8] max-w-[560px] mx-auto">
              I&apos;m not an authority — I&apos;m an explorer. My work focuses on the things that quietly shape how we live: the narratives we never chose, the patterns we carry forward, and the mind&apos;s capacity to reshape itself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Belief Systems */}
            <article className="bg-white border border-[#CDCDD2] rounded-2xl p-8 md:p-11 transition-all hover:border-liquid-blue hover:shadow-[0_12px_40px_rgba(21,101,160,0.12)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-[14px] bg-liquid-blue-wash flex items-center justify-center mb-6 text-liquid-blue">
                <MessageCircle className="w-[26px] h-[26px]" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3.5">Belief Systems</h3>
              <p className="text-[0.9rem] text-charcoal-mid leading-[1.8]">
                The stories we believe dictate the lives we lead. I write about questioning the inherited guilt, the &ldquo;supposed to,&rdquo; the noise — so you can finally hear your own voice.
              </p>
            </article>

            {/* Ancestry & Memory */}
            <article className="bg-white border border-[#CDCDD2] rounded-2xl p-8 md:p-11 transition-all hover:border-liquid-blue hover:shadow-[0_12px_40px_rgba(21,101,160,0.12)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-[14px] bg-liquid-blue-wash flex items-center justify-center mb-6 text-liquid-blue">
                <Dna className="w-[26px] h-[26px]" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3.5">Ancestry &amp; Memory</h3>
              <p className="text-[0.9rem] text-charcoal-mid leading-[1.8]">
                The past lives in our biology, our choices, our reactions. I explore how inherited patterns shape us — and how we can consciously choose which ones to carry forward.
              </p>
            </article>

            {/* Mental Reshaping */}
            <article className="bg-white border border-[#CDCDD2] rounded-2xl p-8 md:p-11 transition-all hover:border-liquid-blue hover:shadow-[0_12px_40px_rgba(21,101,160,0.12)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-[14px] bg-liquid-blue-wash flex items-center justify-center mb-6 text-liquid-blue">
                <Brain className="w-[26px] h-[26px]" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3.5">Mental Reshaping</h3>
              <p className="text-[0.9rem] text-charcoal-mid leading-[1.8]">
                The mind forms in ways we rarely examine. I focus on practical, evidence-based tools for reshaping it — not abstract theories, but things you can actually use.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider max-w-[1160px] mx-auto">
        <div className="diamond" />
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* 3. BOOKS SECTION (DATA-DRIVEN)                  */}
      {/* ════════════════════════════════════════════════ */}
      {featuredBook && (
        <section className="py-24 relative overflow-hidden">
          {/* Ambient orb */}
          <div className="orb orb-blue w-[350px] h-[350px] -top-20 -right-24 absolute opacity-40" />
          <div className="max-w-[1160px] mx-auto px-5 md:px-9 relative z-10">
            {/* Section Header */}
            <div className="flex flex-wrap justify-between items-end gap-5 mb-12">
              <div>
                <p className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-gold mb-3">
                  Latest Release
                </p>
                <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.02em]">
                  Books
                </h2>
              </div>
              <Link href="/books" className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-charcoal tracking-[0.01em] transition-all hover:gap-2.5 mb-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Featured Book Layout */}
            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 md:gap-[72px] items-center">
              {/* Cover */}
              <div className="w-[260px] md:w-full mx-auto md:mx-0">
                {featuredBook.coverUrl ? (
                  <Link href={`/books/${featuredBook.slug}`}>
                    <div className="relative aspect-[2/3] rounded-[14px] overflow-hidden shadow-[0_32px_72px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.06)] transition-transform duration-400 hover:scale-[1.01]">
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
                  <div className="aspect-[2/3] rounded-[14px] bg-surface flex items-center justify-center">
                    <span className="text-charcoal-soft">No cover</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col gap-4 text-center md:text-left items-center md:items-start">
                <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.1em] uppercase text-gold-deep bg-gold-wash px-4 py-1.5 border border-[rgba(200,155,60,0.2)] rounded-full w-fit">
                  <Star className="w-3 h-3" /> Featured
                </span>

                <h3 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] tracking-[-0.02em] font-semibold">
                  {featuredBook.title}
                </h3>

                {featuredBook.subtitle1 && (
                  <p className="text-[1.05rem] text-charcoal-mid italic leading-relaxed">
                    {featuredBook.subtitle1}
                  </p>
                )}

                {featuredBook.subtitle2 && (
                  <p className="text-[0.9rem] text-charcoal-body font-medium">
                    {featuredBook.subtitle2}
                  </p>
                )}

                {blurbPreview && (
                  <p className="text-[0.95rem] text-charcoal-mid leading-[1.8]">
                    {blurbPreview}
                  </p>
                )}

                {/* Format Tags */}
                <div className="flex gap-2.5 flex-wrap">
                  {featuredBook.hasEbook && (
                    <span className="px-4 py-1.5 text-[0.78rem] font-semibold tracking-[0.02em] text-charcoal-body bg-surface border border-[#CDCDD2] rounded-full">
                      Ebook
                    </span>
                  )}
                  {featuredBook.hasPaperback && (
                    <span className="px-4 py-1.5 text-[0.78rem] font-semibold tracking-[0.02em] text-charcoal-body bg-surface border border-[#CDCDD2] rounded-full">
                      Paperback
                    </span>
                  )}
                  {featuredBook.hasHardcover && (
                    <span className="px-4 py-1.5 text-[0.78rem] font-semibold tracking-[0.02em] text-charcoal-body bg-surface border border-[#CDCDD2] rounded-full">
                      Hardcover
                    </span>
                  )}
                </div>

                {lowestPrice && (
                  <p className="text-base text-charcoal-body">
                    From <strong className="text-charcoal text-lg font-bold">${lowestPrice.toFixed(2)}</strong>
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-3">
                  <Link
                    href={`/books/${featuredBook.slug}`}
                    className="inline-flex items-center gap-2 px-7 py-[13px] text-[0.85rem] font-semibold tracking-[0.03em] text-white bg-charcoal rounded-full transition-all hover:bg-black hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                  >
                    {featuredBook.isComingSoon ? "Learn More" : "View Book"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* 4. ABOUT SECTION (dark navy bg)                 */}
      {/* ════════════════════════════════════════════════ */}
      <section className="py-24 bg-navy text-white relative overflow-hidden">
        {/* Ambient orbs on dark bg */}
        <div className="orb orb-white w-[500px] h-[500px] -top-32 -right-40 absolute opacity-70" />
        <div className="orb orb-blue w-[400px] h-[400px] bottom-0 -left-32 absolute opacity-30" />
        <div className="orb orb-gold w-[300px] h-[300px] top-1/2 right-1/4 absolute opacity-20" />

        <div className="max-w-[1160px] mx-auto px-5 md:px-9 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-[72px] items-start">
            {/* Photo Column */}
            <div className="md:sticky md:top-[100px] text-center">
              {authorInfo?.authorPhotoUrl ? (
                <div className="w-[220px] h-[220px] rounded-full overflow-hidden border-[3px] border-white/15 mx-auto shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
                  <Image
                    src={authorInfo.authorPhotoUrl}
                    alt="Maya Allan"
                    width={220}
                    height={220}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-[220px] h-[220px] rounded-full bg-navy-light mx-auto flex items-center justify-center text-white/40">
                  Photo
                </div>
              )}
              <p className="font-serif text-[1.05rem] font-medium text-white mt-4">
                Maya Allan
              </p>
              <p className="text-[0.78rem] text-gold font-semibold mt-1 tracking-[0.06em] uppercase">
                Author &middot; Speaker
              </p>
            </div>

            {/* Text Column */}
            <div className="text-center md:text-left">
              <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold tracking-[-0.02em] mb-6 text-white">
                About Me
              </h2>
              <p className="text-[1.1rem] text-white font-medium leading-[1.75] mb-4">
                I believe deep inner clarity is a fundamental human birthright.
              </p>
              <p className="text-[0.95rem] text-white/85 leading-[1.85] mb-4">
                It&apos;s a capacity we all have — but it gets buried under inherited narratives, the pressure of who we&apos;re &ldquo;supposed&rdquo; to be, and a world that profits from our confusion. My work starts with a simple conviction: no one can heal us but ourselves.
              </p>
              <p className="text-[0.95rem] text-white/85 leading-[1.85] mb-7">
                I&apos;m not a guru, and I&apos;m not interested in being one. I&apos;m a writer who cares about practical tools over abstract theories. True healing is grounded work — self-knowledge, radical acceptance, and finally feeling at home in your own skin.
              </p>

              {/* Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-7">
                <div className="p-5 bg-white/5 rounded-xl border border-white/[0.08]">
                  <h4 className="font-sans text-[0.85rem] font-semibold text-gold tracking-[0.02em] mb-1.5">
                    Belief Systems
                  </h4>
                  <p className="text-[0.82rem] text-white/75 leading-relaxed">
                    The stories we believe dictate the lives we lead.
                  </p>
                </div>
                <div className="p-5 bg-white/5 rounded-xl border border-white/[0.08]">
                  <h4 className="font-sans text-[0.85rem] font-semibold text-gold tracking-[0.02em] mb-1.5">
                    Ancestry &amp; Memory
                  </h4>
                  <p className="text-[0.82rem] text-white/75 leading-relaxed">
                    How the past shapes our present choices and biology.
                  </p>
                </div>
                <div className="p-5 bg-white/5 rounded-xl border border-white/[0.08]">
                  <h4 className="font-sans text-[0.85rem] font-semibold text-gold tracking-[0.02em] mb-1.5">
                    Mental Reshaping
                  </h4>
                  <p className="text-[0.82rem] text-white/75 leading-relaxed">
                    How the mind forms, and how it can be reshaped.
                  </p>
                </div>
              </div>

              {/* Blockquote */}
              <blockquote className="font-serif italic font-light text-[1.15rem] text-white leading-[1.7] p-6 bg-white/5 border-l-[3px] border-gold rounded-r-xl mb-7">
                To know and accept yourself is to be &ldquo;home.&rdquo; Others are here to share the journey — but the return to yourself is a path only you can take.
              </blockquote>

              <p className="text-[0.95rem] text-white/85 leading-[1.85] mb-4">
                My writing is for anyone who&apos;s tired of being told what to think. I offer structure and perspective to help you trust your own perception — and step fully into the authorship of your own life.
              </p>
              <div className="mt-3.5">
                <Link href="/about" className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-gold transition-all hover:text-gold-deep hover:gap-2.5">
                  Read the Full Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider max-w-[1160px] mx-auto">
        <div className="diamond" />
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* 5. RESOURCES                                    */}
      {/* ════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        {/* Ambient orb */}
        <div className="orb orb-gold w-[350px] h-[350px] top-10 -left-20 absolute opacity-35" />
        <div className="max-w-[1160px] mx-auto px-5 md:px-9 relative z-10">
          <div className="text-center mb-14">
            <p className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-gold mb-3">
              In Development
            </p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.02em] mb-3">
              Resources
            </h2>
            <p className="text-charcoal-mid text-base leading-[1.8] max-w-[560px] mx-auto">
              Things I wish existed when I started this path. Frameworks for doing the inner work on your own terms — without needing permission or a guru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Belief Systems Audit */}
            <article className="bg-white border border-[#CDCDD2] rounded-2xl p-8 md:p-11 transition-all hover:border-liquid-blue hover:shadow-[0_12px_40px_rgba(21,101,160,0.12)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-[14px] bg-gold-wash flex items-center justify-center mb-6 text-gold-deep">
                <ListChecks className="w-[26px] h-[26px]" />
              </div>
              <h3 className="font-serif text-[1.15rem] font-medium mb-3.5">Belief Systems Audit</h3>
              <p className="text-[0.9rem] text-charcoal-mid leading-[1.8] mb-5">
                A self-guided framework for examining the narratives running your life. Most of what we believe was installed before we had a say. Clarity starts with seeing it.
              </p>
              <span className="inline-block px-4 py-1.5 text-[0.68rem] font-bold tracking-[0.1em] uppercase text-gold-deep bg-gold-wash border border-[rgba(200,155,60,0.2)] rounded-full">
                Coming Soon
              </span>
            </article>

            {/* Nervous System Reset */}
            <article className="bg-white border border-[#CDCDD2] rounded-2xl p-8 md:p-11 transition-all hover:border-liquid-blue hover:shadow-[0_12px_40px_rgba(21,101,160,0.12)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-[14px] bg-gold-wash flex items-center justify-center mb-6 text-gold-deep">
                <HeartPulse className="w-[26px] h-[26px]" />
              </div>
              <h3 className="font-serif text-[1.15rem] font-medium mb-3.5">Nervous System Reset</h3>
              <p className="text-[0.9rem] text-charcoal-mid leading-[1.8] mb-5">
                Somatic regulation techniques you can use anywhere. A regulated nervous system is the foundation everything else builds on — no certification required.
              </p>
              <span className="inline-block px-4 py-1.5 text-[0.68rem] font-bold tracking-[0.1em] uppercase text-gold-deep bg-gold-wash border border-[rgba(200,155,60,0.2)] rounded-full">
                Coming Soon
              </span>
            </article>

            {/* Integration Reflections */}
            <article className="bg-white border border-[#CDCDD2] rounded-2xl p-8 md:p-11 transition-all hover:border-liquid-blue hover:shadow-[0_12px_40px_rgba(21,101,160,0.12)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-[14px] bg-gold-wash flex items-center justify-center mb-6 text-gold-deep">
                <PenLine className="w-[26px] h-[26px]" />
              </div>
              <h3 className="font-serif text-[1.15rem] font-medium mb-3.5">Integration Reflections</h3>
              <p className="text-[0.9rem] text-charcoal-mid leading-[1.8] mb-5">
                Guided journaling for making meaning after transformative experiences — of any kind. Writing as a way to process, understand, and move forward.
              </p>
              <span className="inline-block px-4 py-1.5 text-[0.68rem] font-bold tracking-[0.1em] uppercase text-gold-deep bg-gold-wash border border-[rgba(200,155,60,0.2)] rounded-full">
                Coming Soon
              </span>
            </article>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* 6. EVENTS (conditional — only if events exist)  */}
      {/* ════════════════════════════════════════════════ */}
      {upcomingEvents.length > 0 && (
        <section className="py-24 bg-surface border-t border-[#CDCDD2]">
          <div className="max-w-[880px] mx-auto px-5 md:px-9">
            {/* Section Header */}
            <div className="flex flex-wrap justify-between items-end gap-5 mb-12">
              <div>
                <p className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-gold mb-3">
                  Join In
                </p>
                <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.02em]">
                  Upcoming Events
                </h2>
              </div>
              <Link href="/events" className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-charcoal tracking-[0.01em] transition-all hover:gap-2.5 mb-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Event List */}
            <div className="flex flex-col gap-4">
              {upcomingEvents.map((event) => {
                const dateInfo = formatEventDate(event.startsAt)
                return (
                  <Link key={event.id} href={`/events/${event.slug}`}>
                    <article className="flex gap-7 items-start bg-white border border-[#CDCDD2] rounded-2xl p-8 transition-all hover:border-liquid-blue hover:shadow-[0_6px_24px_rgba(21,101,160,0.1)]">
                      {/* Date Badge */}
                      <div className="hidden sm:flex flex-shrink-0 w-[68px] h-[68px] bg-navy rounded-[14px] flex-col items-center justify-center text-white">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gold">
                          {dateInfo.month}
                        </span>
                        <span className="text-2xl font-bold leading-none">
                          {dateInfo.day}
                        </span>
                      </div>

                      {/* Event Body */}
                      <div>
                        <h3 className="font-sans text-[1.1rem] font-semibold mb-1.5">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-[0.85rem] text-charcoal-mid mb-2">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {dateInfo.full}
                          </span>
                          {event.locationText && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> {event.locationText}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-[0.9rem] text-charcoal-mid leading-[1.7]">
                            {event.description.length > 150
                              ? event.description.substring(0, 150) + "..."
                              : event.description}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Divider ── */}
      <div className="section-divider max-w-[1160px] mx-auto">
        <div className="diamond" />
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* 7. NEWSLETTER                                   */}
      {/* ════════════════════════════════════════════════ */}
      <NewsletterSection />
    </div>
  )
}
