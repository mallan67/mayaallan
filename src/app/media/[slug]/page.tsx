import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

const SITE_URL = "https://www.mayaallan.com"

interface MediaPageProps {
  params: Promise<{ slug: string }>
}

// Simple fetch function for edge compatibility
async function getMediaItem(slug: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/media_items?slug=eq.${encodeURIComponent(slug)}&is_visible=eq.true&select=*&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data?.[0] || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: MediaPageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await getMediaItem(slug)

  if (!item) {
    return { title: "Media Not Found" }
  }

  const title = item.title
  const description = item.description || `${item.kind} by Maya Allan`
  const ogImageUrl = `${SITE_URL}/media/${slug}/opengraph-image`

  return {
    title,
    description,
    openGraph: {
      title: `${title} - Maya Allan`,
      description,
      url: `${SITE_URL}/media/${slug}`,
      type: item.kind === "video" ? "video.other" : "music.song",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Maya Allan`,
      description,
      images: [`${SITE_URL}/media/${slug}/twitter-image`],
    },
  }
}

export default async function MediaItemPage({ params }: MediaPageProps) {
  const { slug } = await params
  const item = await getMediaItem(slug)

  if (!item) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <Link href="/media" className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1 mb-6">
        ← Back to Media
      </Link>

      <div className="border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-slate-100 rounded">
            {item.kind}
          </span>
        </div>

        {item.cover_url && (
          <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-slate-100">
            <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-3">{item.title}</h1>
        {item.description && <p className="text-slate-700 mb-6">{item.description}</p>}

        {/* Audio Player */}
        {item.kind === "audio" && item.file_url && (
          <div className="mb-6">
            <audio controls className="w-full">
              <source src={item.file_url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Video Player */}
        {item.kind === "video" && item.file_url && (
          <div className="mb-6">
            <video controls className="w-full rounded-lg bg-black">
              <source src={item.file_url} />
              Your browser does not support the video element.
            </video>
          </div>
        )}

        {/* Image Display */}
        {item.kind === "image" && item.file_url && !item.cover_url && (
          <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden bg-slate-100">
            <img src={item.file_url} alt={item.title} className="w-full h-full object-contain" />
          </div>
        )}

        {/* External URL Embeds */}
        {!item.file_url && item.external_url && (
          <div className="mb-6">
            {/* YouTube embed */}
            {(item.external_url.includes("youtube.com") || item.external_url.includes("youtu.be")) && (
              <div className="aspect-video">
                <iframe
                  src={item.external_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Vimeo embed */}
            {item.external_url.includes("vimeo.com") && (
              <div className="aspect-video">
                <iframe
                  src={item.external_url.replace("vimeo.com/", "player.vimeo.com/video/")}
                  className="w-full h-full rounded-lg"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Other external links */}
            {!item.external_url.includes("youtube") &&
              !item.external_url.includes("youtu.be") &&
              !item.external_url.includes("vimeo") && (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-black rounded-lg hover:bg-black/80 transition"
                >
                  Listen/View on External Platform →
                </a>
              )}
          </div>
        )}
      </div>
    </div>
  )
}
