import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.emailSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Email Subscribers</h1>
          <p className="text-sm text-slate-600 mt-1">{subscribers.length} total subscribers</p>
        </div>
        {subscribers.length > 0 && (
          <a
            href="/api/admin/crm/subscribers"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition text-sm inline-block"
          >
            Export CSV
          </a>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No email subscribers yet.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{subscriber.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{subscriber.source || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
