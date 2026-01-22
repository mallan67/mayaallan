import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { ShareButtons } from "@/components/share-buttons"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming talks, readings, and workshops with Maya Allan.",
  openGraph: {
    title: "Events - Maya Allan",
    description: "Upcoming talks, readings, and workshops with Maya Allan.",
    url: "https://mayaallan.com/events",
  },
  twitter: {
    card: "summary",
    title: "Events - Maya Allan",
    description: "Upcoming talks, readings, and workshops.",
  },
}

export const revalidate = 300 // 5 minutes

async function getVisibleEvents() {
  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.events)
      .select("*")
      .eq("isVisible", true)
      .order("startsAt", { ascending: true })

    if (error) {
      console.error("Error fetching events:", error)
      return []
    }

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
          url="https://mayaallan.com/events"
          title="Events with Maya Allan"
          description="Upcoming talks, readings, and workshops with Maya Allan."
        />
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-slate-700">
          No events are currently scheduled. Check back soon for upcoming talks, readings, and workshops.
        </p>
      ) : (
        <div className="space-y-6">
          {events.map((event: any) => (
            <div key={event.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition">
              {event.eventImageUrl && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-slate-100">
                  <img src={event.eventImageUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="font-serif text-xl font-semibold mb-2">{event.title}</h2>
              <div className="text-sm text-slate-600 mb-3">
                {new Date(event.startsAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {event.locationText && <div className="text-sm text-slate-700 mb-3">{event.locationText}</div>}
              {event.description && <p className="text-sm text-slate-700 mb-4">{event.description}</p>}

              {event.locationUrl && (
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-black/80 transition mb-4"
                >
                  View Location / Register
                </a>
              )}

              <div className="pt-3 border-t border-slate-100">
                <ShareButtons
                  url={`https://mayaallan.com/events/${event.slug}`}
                  title={event.title}
                  description={event.description || `Join Maya Allan for ${event.title}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
