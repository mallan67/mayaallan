import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminContactPage() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Contact Submissions</h1>
        <p className="text-sm text-slate-600 mt-1">Messages from your contact form</p>
      </div>

      {submissions.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No contact submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="border border-slate-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {submission.name && <p className="font-semibold">{submission.name}</p>}
                  {submission.email && (
                    <a href={`mailto:${submission.email}`} className="text-sm text-blue-600 hover:underline">
                      {submission.email}
                    </a>
                  )}
                </div>
                <span className="text-xs text-slate-500">{new Date(submission.createdAt).toLocaleString()}</span>
              </div>
              {submission.message && (
                <div className="bg-slate-50 rounded p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{submission.message}</p>
                </div>
              )}
              {submission.source && <p className="text-xs text-slate-500 mt-2">Source: {submission.source}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
