import Link from "next/link"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

async function getEvents() {
  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.events)
      .select("*")
      .order("startsAt", { ascending: false })

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

export default async function AdminEventsPage() {
  const events = await getEvents()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Events</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition"
        >
          Add New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No events yet. Create your first event!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event: any) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="block border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-1">{event.title}</h2>
                  {event.description && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{event.description}</p>}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span>{new Date(event.startsAt).toLocaleDateString()}</span>
                    {event.locationText && <span>{event.locationText}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        event.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {event.isPublished ? "Published" : "Draft"}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        event.isVisible ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {event.isVisible ? "Visible" : "Hidden"}
                    </span>
                    {event.keepVisibleAfterEnd && (
                      <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                        Keep After End
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
