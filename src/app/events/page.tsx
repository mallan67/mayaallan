import { getVisibleEvents } from "@/lib/mock-data"
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
          {events.map((event) => (
            <div key={event.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition">
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
              {event.locationText && <div className="text-sm text-slate-700 mb-3">📍 {event.locationText}</div>}
              {event.description && <p className="text-sm text-slate-700 mb-4">{event.description}</p>}

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
