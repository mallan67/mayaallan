import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import Image from "next/image"
import type { Metadata } from "next"
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
    <div className="max-w-4xl mx-auto px-4 py-12">
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
      <h1 className="font-serif text-4xl mb-8">About</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {author?.authorPhotoUrl && (
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden">
              <Image
                src={author.authorPhotoUrl}
                alt={author.authorName || "Author"}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          {author?.authorName && (
            <h2 className="font-serif text-2xl mb-4">{author.authorName}</h2>
          )}

          {author?.authorBio ? (
            <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
              {author.authorBio}
            </div>
          ) : (
            <p className="text-lg leading-relaxed text-slate-700">
              Maya Allan is an author and researcher exploring consciousness,
              integration, and self-agency through lived experience and inquiry.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
