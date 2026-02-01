import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { ShareButtons } from "@/components/share-buttons"
import type { Metadata } from "next"

const SITE_URL = "https://www.mayaallan.com"

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming talks, readings, and workshops with Maya Allan.",
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
  openGraph: {
    title: "Events - Maya Allan",
    description: "Upcoming talks, readings, and workshops with Maya Allan.",
    url: `${SITE_URL}/events`,
    images: [
      {
        url: `${SITE_URL}/events/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Events - Maya Allan",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events - Maya Allan",
    description: "Upcoming talks, readings, and workshops.",
    images: [`${SITE_URL}/events/twitter-image`],
  },
}

export const revalidate = 60 // 1 minute

async function getVisibleEvents() {
  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.events)
      .select("*")
      .eq("isVisible", true)
      .order("startsAt", { ascending: true })

    if (error) {
      console.error("Error fetching visible events:", error)
      return []
    }

    console.log("Visible events found:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return []
  }
}

export default async function EventsPage() {
  const events = await getVisibleEvents()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">Events</h1>
        <ShareButtons
          url="https://www.mayaallan.com/events"
          title="Events with Maya Allan"
          description="Upcoming talks, readings, and workshops with Maya Allan."
          imageUrl="https://www.mayaallan.com/opengraph-image"
        />
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-slate-700">
          No events are currently scheduled. Check back soon for upcoming talks, readings, and workshops.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event: any) => (
            <div key={event.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex gap-4">
                {event.eventImageUrl && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={event.eventImageUrl} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-base font-semibold mb-1 line-clamp-2">{event.title}</h2>
                  <div className="text-xs text-slate-600">
                    {new Date(event.startsAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              {event.locationText && <div className="text-xs text-slate-600 mt-2">{event.locationText}</div>}
              {event.description && <p className="text-xs text-slate-700 mt-2 line-clamp-2">{event.description}</p>}

              {event.locationUrl && (
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-3 py-1.5 text-xs font-semibold text-white bg-black rounded-lg hover:bg-black/80 transition mt-3"
                >
                  Register
                </a>
              )}

              <div className="pt-2 mt-2 border-t border-slate-100">
                <ShareButtons
                  url={`https://www.mayaallan.com/events/${event.slug}`}
                  title={event.title}
                  description={event.description || `Join Maya Allan for ${event.title}`}
                  imageUrl={`https://www.mayaallan.com/events/${event.slug}/opengraph-image`}
                  className="justify-start"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
