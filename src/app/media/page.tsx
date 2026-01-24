import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { ShareButtons } from "@/components/share-buttons"
import type { Metadata } from "next"

const SITE_URL = "https://www.mayaallan.com"

export const metadata: Metadata = {
  title: "Media",
  description: "Music, guided audios, videos, and PDF guides by Maya Allan for integration and personal development.",
  openGraph: {
    title: "Media - Maya Allan",
    description: "Music, guided audios, videos, and PDF guides for integration and personal development.",
    url: `${SITE_URL}/media`,
    images: [
      {
        url: `${SITE_URL}/media/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Media - Maya Allan",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Media - Maya Allan",
    description: "Music, guided audios, videos, and PDF guides.",
    images: [`${SITE_URL}/media/twitter-image`],
  },
}

export const revalidate = 300 // 5 minutes

async function getVisibleMedia() {
  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.mediaItems)
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching media:", error)
      return []
    }

    // Map snake_case to camelCase
    return (data || []).map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      kind: item.kind || "audio",
      description: item.description,
      coverUrl: item.cover_url,
      fileUrl: item.file_url,
      externalUrl: item.external_url,
      duration: item.duration,
      isPublished: item.is_published ?? item.is_visible ?? false,
      isVisible: item.is_visible ?? false,
    }))
  } catch (error) {
    console.error("Failed to fetch media:", error)
    return []
  }
}

export default async function MediaPage() {
  const mediaItems = await getVisibleMedia()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">Media – Music, Guides &amp; Videos</h1>
        <ShareButtons
          url="https://www.mayaallan.com/media"
          title="Media by Maya Allan"
          description="Music, guided audios, videos, and PDF guides by Maya Allan for integration and personal development."
          imageUrl="https://www.mayaallan.com/opengraph-image"
        />
      </div>

      {mediaItems.length === 0 ? (
        <p className="text-sm text-slate-700">
          No media available yet. Check back soon for music, guided audios, videos, and PDF guides.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item: any) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-slate-100 rounded">
                  {item.kind}
                </span>
              </div>

              {item.coverUrl && (
                <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-slate-100">
                  <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}

              <h2 className="font-serif text-lg font-semibold mb-2">{item.title}</h2>
              {item.description && <p className="text-sm text-slate-700 mb-4">{item.description}</p>}

              {/* Audio Player */}
              {item.kind === "audio" && item.fileUrl && (
                <div className="mb-4">
                  <audio controls className="w-full">
                    <source src={item.fileUrl} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Video Player */}
              {item.kind === "video" && item.fileUrl && (
                <div className="mb-4">
                  <video controls className="w-full rounded-lg bg-black">
                    <source src={item.fileUrl} />
                    Your browser does not support the video element.
                  </video>
                </div>
              )}

              {/* Image Display */}
              {item.kind === "image" && item.fileUrl && !item.coverUrl && (
                <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-slate-100">
                  <img src={item.fileUrl} alt={item.title} className="w-full h-full object-contain" />
                </div>
              )}

              {/* External URL Embeds */}
              {!item.fileUrl && item.externalUrl && (
                <div className="mb-4">
                  {/* YouTube embed */}
                  {(item.externalUrl.includes("youtube.com") || item.externalUrl.includes("youtu.be")) && (
                    <div className="aspect-video">
                      <iframe
                        src={item.externalUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Vimeo embed */}
                  {item.externalUrl.includes("vimeo.com") && (
                    <div className="aspect-video">
                      <iframe
                        src={item.externalUrl.replace("vimeo.com/", "player.vimeo.com/video/")}
                        className="w-full h-full rounded-lg"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* SoundCloud or other external links */}
                  {!item.externalUrl.includes("youtube") &&
                    !item.externalUrl.includes("youtu.be") &&
                    !item.externalUrl.includes("vimeo") && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-black/80 transition"
                      >
                        Listen/View on External Platform →
                      </a>
                    )}
                </div>
              )}

              <div className="mb-3 pt-3 border-t border-slate-100">
                <ShareButtons
                  url={`https://www.mayaallan.com/media/${item.slug}`}
                  title={item.title}
                  description={item.description || `${item.kind} by Maya Allan`}
                  imageUrl={`https://www.mayaallan.com/media/${item.slug}/opengraph-image`}
                  className="justify-center md:justify-start"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
