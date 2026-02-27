import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import {
  generateAuthorSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  AUTHOR_FAQS,
} from "@/lib/structured-data"
import { unstable_noStore as noStore } from "next/cache"

const SITE_URL = "https://www.mayaallan.com"

async function getAuthorInfo() {
  // Disable caching to ensure fresh data on every request
  noStore()

  try {
    // Order by id to ensure we get the same row as admin settings
    const { data: settings, error } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("id, authorName, authorBio, authorPhotoUrl")
      .order("id", { ascending: true })
      .limit(1)
      .single()

    if (error) {
      console.error("About page - Error fetching author info:", error.message, error.code)
      return null
    }

    console.log("About page - Loaded settings id:", settings?.id, "authorName:", settings?.authorName)
    return settings
  } catch (error) {
    console.error("About page - Failed to fetch author info:", error)
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const author = await getAuthorInfo()

  const title = "About"
  const description = author?.authorBio
    ? `${author.authorBio.substring(0, 155)}...`
    : "Learn more about Maya Allan - author, speaker, and wellness advocate dedicated to helping readers navigate transformation."
  // ALWAYS use dynamic OG image for consistent 1200x630 sizing across all platforms
  // Author photos may not be the correct aspect ratio for social sharing
  const imageUrl = `${SITE_URL}/opengraph-image`
  const authorName = author?.authorName || "Maya Allan"

  return {
    title,
    description,
    openGraph: {
      title: `About ${authorName}`,
      description,
      url: `${SITE_URL}/about`,
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: authorName,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `About ${authorName}`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
  }
}

export default async function AboutPage() {
  const author = await getAuthorInfo()

  // Generate Author schema for SEO
  const authorSchema = generateAuthorSchema(
    SITE_URL,
    author?.authorBio || "Maya Allan is an author and researcher exploring consciousness, integration, and self-agency through lived experience and inquiry.",
    author?.authorPhotoUrl
  )

  // AEO: FAQ Schema for AI answer engines
  const faqSchema = generateFAQSchema(AUTHOR_FAQS, `${SITE_URL}/about`)

  // AEO: Breadcrumb Schema for navigation context
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "About", url: `${SITE_URL}/about` },
  ])

  return (
    <div className="min-h-screen">
      {/* Author Schema JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(authorSchema),
        }}
      />
      {/* AEO: FAQ Schema for AI answer engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      {/* AEO: Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* ── Hero / Photo + Intro Section ── */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="orb orb-gold w-[400px] h-[400px] -top-32 -right-32 absolute opacity-50" />
        <div className="orb orb-blue w-[300px] h-[300px] bottom-0 -left-20 absolute opacity-30" />

        <div className="max-w-[960px] mx-auto px-5 md:px-9 relative z-10">
          {/* Breadcrumb label */}
          <p className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-gold mb-8 text-center md:text-left">
            About the Author
          </p>

          {/* Side-by-side: photo + intro text */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-start">
            {/* Photo — smaller, circular */}
            {author?.authorPhotoUrl && (
              <div className="flex justify-center md:justify-start">
                <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)]">
                  <Image
                    src={author.authorPhotoUrl}
                    alt={author.authorName || "Maya Allan"}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Name + intro */}
            <div className="text-center md:text-left">
              <h1 className="font-serif text-[clamp(2rem,4.5vw,2.8rem)] font-semibold tracking-[-0.02em] mb-2">
                {author?.authorName || "Maya Allan"}
              </h1>
              <p className="text-[0.85rem] text-gold font-semibold tracking-[0.06em] uppercase mb-5">
                Author &middot; Speaker &middot; Wellness Advocate
              </p>
              <p className="text-[1.05rem] text-charcoal-mid leading-[1.8] max-w-[540px]">
                I believe deep inner clarity is a fundamental human birthright. My work starts with a simple conviction: no one can heal us but ourselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider max-w-[880px] mx-auto">
        <div className="diamond" />
      </div>

      {/* ── Bio Section ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[680px] mx-auto px-5 md:px-9">
          {author?.authorBio ? (
            <div className="text-[1.05rem] leading-[1.85] text-charcoal-mid whitespace-pre-wrap">
              {author.authorBio}
            </div>
          ) : (
            <>
              <p className="text-[1.1rem] text-charcoal font-medium leading-[1.75] mb-6">
                I believe deep inner clarity is a fundamental human birthright.
              </p>
              <p className="text-[1.05rem] text-charcoal-mid leading-[1.85] mb-5">
                It&apos;s a capacity we all have — but it gets buried under inherited narratives, the pressure of who we&apos;re &ldquo;supposed&rdquo; to be, and a world that profits from our confusion. My work starts with a simple conviction: no one can heal us but ourselves.
              </p>
              <p className="text-[1.05rem] text-charcoal-mid leading-[1.85] mb-5">
                I&apos;m not a guru, and I&apos;m not interested in being one. I&apos;m a writer who cares about practical tools over abstract theories. True healing is grounded work — self-knowledge, radical acceptance, and finally feeling at home in your own skin.
              </p>
              <p className="text-[1.05rem] text-charcoal-mid leading-[1.85]">
                My writing is for anyone who&apos;s tired of being told what to think. I offer structure and perspective to help you trust your own perception — and step fully into the authorship of your own life.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider max-w-[880px] mx-auto">
        <div className="diamond" />
      </div>

      {/* ── Pillars Section ── */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-[880px] mx-auto px-5 md:px-9">
          <h2 className="font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold tracking-[-0.02em] text-center mb-10">
            What I Explore
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-[#CDCDD2] rounded-2xl p-7 text-center">
              <h3 className="font-sans text-[0.9rem] font-semibold text-gold tracking-[0.02em] mb-2">
                Belief Systems
              </h3>
              <p className="text-[0.88rem] text-charcoal-mid leading-relaxed">
                The stories we believe dictate the lives we lead. I write about questioning inherited narratives so you can finally hear your own voice.
              </p>
            </div>
            <div className="bg-white border border-[#CDCDD2] rounded-2xl p-7 text-center">
              <h3 className="font-sans text-[0.9rem] font-semibold text-gold tracking-[0.02em] mb-2">
                Ancestry &amp; Memory
              </h3>
              <p className="text-[0.88rem] text-charcoal-mid leading-relaxed">
                The past lives in our biology, our choices, our reactions. I explore how inherited patterns shape us — and how we can choose which to carry forward.
              </p>
            </div>
            <div className="bg-white border border-[#CDCDD2] rounded-2xl p-7 text-center">
              <h3 className="font-sans text-[0.9rem] font-semibold text-gold tracking-[0.02em] mb-2">
                Mental Reshaping
              </h3>
              <p className="text-[0.88rem] text-charcoal-mid leading-relaxed">
                The mind forms in ways we rarely examine. I focus on practical, evidence-based tools for reshaping it — things you can actually use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blockquote ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[680px] mx-auto px-5 md:px-9 text-center">
          <blockquote className="font-serif italic font-light text-[clamp(1.2rem,3vw,1.5rem)] text-charcoal leading-[1.7] mb-6">
            &ldquo;To know and accept yourself is to be &lsquo;home.&rsquo; Others are here to share the journey — but the return to yourself is a path only you can take.&rdquo;
          </blockquote>
          <div className="w-12 h-0.5 bg-gold mx-auto mb-8" />
          <div className="flex flex-wrap gap-3.5 justify-center">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-8 py-[13px] text-[0.85rem] font-semibold tracking-[0.03em] text-white bg-charcoal rounded-full transition-all hover:bg-black hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
            >
              Explore My Books
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-charcoal tracking-[0.01em] transition-all hover:gap-2.5 py-[13px] px-4"
            >
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
