import Link from "next/link"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

async function getMediaItems() {
  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.mediaItems)
      .select("*")
      .order("createdAt", { ascending: false })

    if (error) {
      console.error("Error fetching media:", error)
      return []
    }

    // Table uses camelCase columns, return as-is
    return data || []
  } catch (error) {
    console.error("Failed to fetch media:", error)
    return []
  }
}

export default async function AdminMediaPage() {
  const media = await getMediaItems()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Media</h1>
        <Link href="/admin/media/new" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition">
          Add New Media
        </Link>
      </div>

      {media.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No media yet. Upload your first audio or video!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {media.map((item: any) => (
            <Link
              key={item.id}
              href={`/admin/media/${item.id}`}
              className="block border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-700 uppercase">{item.kind}</span>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                  </div>
                  {item.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        item.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        item.isVisible ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>/{item.slug}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
