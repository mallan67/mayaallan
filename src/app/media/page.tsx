import { getVisibleMedia } from "@/lib/mock-data"
import { ShareButtons } from "@/components/share-buttons"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Media",
  description: "Music, guided audios, videos, and PDF guides by Maya Allan for integration and personal development.",
  openGraph: {
    title: "Media - Maya Allan",
    description: "Music, guided audios, videos, and PDF guides for integration and personal development.",
    url: "https://mayaallan.com/media",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media - Maya Allan",
    description: "Music, guided audios, videos, and PDF guides.",
  },
}

export default async function MediaPage() {
  const mediaItems = await getVisibleMedia()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">Media – Music, Guides &amp; Videos</h1>
        <ShareButtons
          url="https://mayaallan.com/media"
          title="Media by Maya Allan"
          description="Music, guided audios, videos, and PDF guides by Maya Allan for integration and personal development."
        />
      </div>

      {mediaItems.length === 0 ? (
        <p className="text-sm text-slate-700">
          No media available yet. Check back soon for music, guided audios, videos, and PDF guides.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-slate-100 rounded">
                  {item.kind}
                </span>
              </div>
              <h2 className="font-serif text-lg font-semibold mb-2">{item.title}</h2>
              {item.description && <p className="text-sm text-slate-700 mb-4">{item.description}</p>}

              <div className="mb-3 pt-3 border-t border-slate-100">
                <ShareButtons
                  url={`https://mayaallan.com/media/${item.slug}`}
                  title={item.title}
                  description={item.description || `${item.kind} by Maya Allan`}
                  className="justify-center md:justify-start"
                />
              </div>

              {item.externalUrl && (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-black hover:underline"
                >
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
