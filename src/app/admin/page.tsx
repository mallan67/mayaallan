import Link from "next/link"
import { getAllBooks, getAllMedia, getAllEvents } from "@/lib/mock-data"

export default async function AdminHome() {
  const books = await getAllBooks()
  const media = await getAllMedia()
  const events = await getAllEvents()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
      <p className="text-sm text-slate-600 mb-8">
        Default: draft/hidden. Nothing appears publicly unless you publish/enable it.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/books" className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition">
          <h2 className="text-lg font-semibold mb-2">Books</h2>
          <p className="text-3xl font-bold text-slate-700">{books.length}</p>
          <p className="text-sm text-slate-500 mt-1">{books.filter((b) => b.isPublished).length} published</p>
        </Link>

        <Link href="/admin/media" className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition">
          <h2 className="text-lg font-semibold mb-2">Media</h2>
          <p className="text-3xl font-bold text-slate-700">{media.length}</p>
          <p className="text-sm text-slate-500 mt-1">{media.filter((m) => m.isVisible).length} visible</p>
        </Link>

        <Link href="/admin/events" className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition">
          <h2 className="text-lg font-semibold mb-2">Events</h2>
          <p className="text-3xl font-bold text-slate-700">{events.length}</p>
          <p className="text-sm text-slate-500 mt-1">{events.filter((e) => e.isVisible).length} visible</p>
        </Link>
      </div>

      <div className="space-y-4">
        <Link
          href="/admin/contact"
          className="block border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
        >
          <span className="font-medium">Contact Submissions</span>
        </Link>
        <Link
          href="/admin/subscribers"
          className="block border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
        >
          <span className="font-medium">Email Subscribers</span>
        </Link>
        <Link
          href="/admin/settings"
          className="block border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
        >
          <span className="font-medium">Site Settings</span>
        </Link>
      </div>
    </div>
  )
}
