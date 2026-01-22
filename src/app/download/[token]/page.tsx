import { notFound } from "next/navigation"
import Link from "next/link"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * DOWNLOAD PAGE (Issue #3B Fix):
 *
 * User-friendly download page that:
 * 1. Shows book info and download status
 * 2. Displays remaining downloads
 * 3. Shows expiration date
 * 4. Provides download button
 */

interface DownloadPageProps {
  params: Promise<{ token: string }>
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { token } = await params

  const { data: downloadToken, error } = await supabaseAdmin
    .from(Tables.downloadTokens)
    .select(`
      *,
      book:books (*),
      order:orders (*)
    `)
    .eq("token", token)
    .single()

  if (error || !downloadToken) {
    notFound()
  }

  const isExpired = new Date() > new Date(downloadToken.expires_at)
  const downloadsRemaining = downloadToken.max_downloads - downloadToken.download_count
  const canDownload = !isExpired && downloadsRemaining > 0 && downloadToken.order.status === "completed"

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">📚</div>
            <h1 className="font-serif text-2xl font-semibold">
              Download Your Ebook
            </h1>
            <p className="text-slate-600 mt-2">
              {downloadToken.book.title}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-4 mb-8">
            {/* Order Status */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Order Status</span>
              <span className={`text-sm font-medium ${
                downloadToken.order.status === "completed"
                  ? "text-green-600"
                  : "text-amber-600"
              }`}>
                {downloadToken.order.status === "completed" ? "✓ Paid" : "Pending"}
              </span>
            </div>

            {/* Downloads Remaining */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Downloads Remaining</span>
              <span className={`text-sm font-medium ${
                downloadsRemaining > 0 ? "text-slate-900" : "text-red-600"
              }`}>
                {downloadsRemaining} of {downloadToken.max_downloads}
              </span>
            </div>

            {/* Expiration */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Link Expires</span>
              <span className={`text-sm font-medium ${
                isExpired ? "text-red-600" : "text-slate-900"
              }`}>
                {isExpired
                  ? "Expired"
                  : new Date(downloadToken.expires_at).toLocaleDateString()
                }
              </span>
            </div>
          </div>

          {/* Download Button */}
          {canDownload ? (
            <a
              href={`/api/download/${token}`}
              className="block w-full py-4 px-6 text-center text-white bg-black rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              Download Ebook
            </a>
          ) : (
            <div className="text-center">
              {isExpired && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-4">
                  This download link has expired.
                </div>
              )}
              {downloadsRemaining <= 0 && !isExpired && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-4">
                  You've reached the download limit.
                </div>
              )}
              {downloadToken.order.status !== "completed" && (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl mb-4">
                  Payment is still processing. Please check back shortly.
                </div>
              )}
              <p className="text-sm text-slate-500">
                Need help? Contact support.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
