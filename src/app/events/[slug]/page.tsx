import Image from "next/image"
import { notFound } from "next/navigation"
import Link from "next/link"
import { isOptimizableImageHost } from "@/lib/image-host"
import type { Metadata } from "next"
import { SITE_URL } from "@/lib/identity"
import { jsonLdScript } from "@/lib/json-ld"
import { generateEventSchema } from "@/lib/structured-data"
import type { Event } from "@/lib/types"

interface EventPageProps {
  params: Promise<{ slug: string }>
}

// Simple fetch function for edge compatibility
async function getEvent(slug: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  // Server-only key chain: public-key fallbacks removed; default
  // visual renders when no server key is set.
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  // Canonical snake_case table + column names (post-migration). The
  // PascalCase /rest/v1/Event orphan path was retired here.
  //
  // Distinguish a genuine 404 (fetch succeeded, no matching row) from a
  // TRANSIENT failure (network error / 5xx). On a transient failure we THROW
  // so Next renders the retryable error boundary — returning null here would
  // notFound() and 404 a real event on a momentary DB blip, which Google
  // could then drop from the index.
  const response = await fetch(
    `${supabaseUrl}/rest/v1/events?slug=eq.${encodeURIComponent(slug)}&is_visible=eq.true&select=*&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 60 },
    }
  )

  if (!response.ok) {
    throw new Error(`events fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data?.[0] || null
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  let event
  try {
    event = await getEvent(slug)
  } catch {
    // Transient fetch failure — emit neutral metadata rather than
    // "Not Found"; the page component surfaces the error boundary.
    return { title: "Event" }
  }

  if (!event) {
    return { title: "Event Not Found" }
  }

  const title = event.title
  const description = event.description || `Join Maya Allan for ${event.title}`
  const ogImageUrl = `${SITE_URL}/events/${slug}/opengraph-image`

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/events/${slug}`,
    },
    openGraph: {
      title: `${title} - Maya Allan`,
      description,
      url: `${SITE_URL}/events/${slug}`,
      type: "website",
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
      images: [`${SITE_URL}/events/${slug}/twitter-image`],
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  // Snake_case columns from the canonical events table (post-migration).
  const eventDate = new Date(event.starts_at)

  // Map the raw snake_case row to the camelCase Event shape the schema
  // builder expects, then emit Event JSON-LD.
  const eventSchema = generateEventSchema({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    locationText: event.location_text,
    locationUrl: event.location_url,
    photoUrls: event.event_image_url ? [event.event_image_url] : undefined,
    isPublished: event.is_published,
    isVisible: event.is_visible,
    keepVisibleAfterEnd: event.keep_visible_after_end,
    seoTitle: event.seo_title,
    seoDescription: event.seo_description,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  } satisfies Event)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(eventSchema) }} />
      <Link href="/events" className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1 mb-6">
        ← Back to Events
      </Link>

      <div className="border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {event.event_image_url && (
            <div className="flex-shrink-0">
              <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-slate-100">
                {isOptimizableImageHost(event.event_image_url) ? (
                  <Image
                    src={event.event_image_url}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    className="object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.event_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex-1">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-3">{event.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>
                  {eventDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {event.location_text && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{event.location_text}</span>
              </div>
            )}

            {event.description && (
              <p className="text-slate-700 mb-6 whitespace-pre-wrap">{event.description}</p>
            )}

            {event.location_url && (
              <a
                href={event.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 text-sm font-semibold text-white bg-black rounded-lg hover:bg-black/80 transition"
              >
                Register for Event →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
