import Link from "next/link"
import { getAllRetailers } from "@/lib/mock-data"

export default async function AdminRetailersPage() {
  const retailers = await getAllRetailers()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Retailers</h1>
          <p className="text-sm text-slate-600 mt-1">Add retailers where your books are sold</p>
        </div>
        <Link
          href="/admin/retailers/new"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition"
        >
          Add Retailer
        </Link>
      </div>

      {retailers.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No retailers yet. Add retailers like Amazon, Lulu, or Google Books.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {retailers.map((retailer) => (
            <Link
              key={retailer.id}
              href={`/admin/retailers/${retailer.id}`}
              className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{retailer.name}</h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    retailer.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {retailer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-slate-500">/{retailer.slug}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
