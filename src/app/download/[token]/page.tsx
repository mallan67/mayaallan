import { notFound } from "next/navigation"
import Link from "next/link"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import type { Metadata } from "next"

/**
 * DOWNLOAD PAGE (Issue #3B Fix):
 *
 * User-friendly download page that:
 * 1. Shows book info and download status
 * 2. Displays remaining downloads
 * 3. Shows expiration date
 * 4. Provides download button
 */

// Prevent search engines from indexing download pages.
export const metadata: Metadata = {
  title: "Download Your Ebook",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

// Never SSG / never ISR. Token-keyed pages must render fresh on every
// request so a cached HTML snapshot can't be served to a different buyer
// who happens to land on a URL that previously rendered. Combined with
// the no-store headers in next.config.mjs, this means every visit hits
// fresh DB state.
export const dynamic = "force-dynamic"
export const revalidate = 0

interface DownloadPageProps {
  params: Promise<{ token: string }>
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { token } = await params

  // EXPLICIT field selection — only columns this page renders. Joining the
  // full order row would pull buyer email + name + payer info into the
  // server-rendered response object. Even though we don't display those
  // fields, having them in the response object risks leakage via future
  // serialization (e.g. console.log of the full object, hydration payload
  // in dev tools, third-party error reporter that captures props).
  //
  // The download API route (/api/download/[token]) is the only place that
  // legitimately needs to know the buyer — for delivery accounting — and
  // it scopes its lookup tightly via the increment_download_count RPC.
  // Supabase's TS inference treats joined relations as arrays by default
  // even when the FK is 1:1; the cast below restores single-row shape
  // (matches the actual runtime behavior — both joins return one row).
  type DownloadTokenRow = {
    token: string
    expires_at: string
    max_downloads: number
    download_count: number
    book: { title: string | null } | null
    order: { status: string | null } | null
  }

  const { data: rawDownloadToken, error } = await supabaseAdmin
    .from(Tables.downloadTokens)
    .select(`
      token,
      expires_at,
      max_downloads,
      download_count,
      book:books ( title ),
      order:orders ( status )
    `)
    .eq("token", token)
    .single()

  const downloadToken = rawDownloadToken as unknown as DownloadTokenRow | null

  if (error || !downloadToken) {
    notFound()
  }

  // Required relations — if these are missing, the token is in an
  // inconsistent state (db corruption / partial deletion). Treat as
  // not-found rather than crashing the page render.
  if (!downloadToken.book || !downloadToken.order) {
    notFound()
  }

  const isExpired = new Date() > new Date(downloadToken.expires_at)
  const downloadsRemaining = downloadToken.max_downloads - downloadToken.download_count
  const orderStatus: string | null = downloadToken.order.status
  const bookTitle: string = downloadToken.book.title ?? "Ebook"
  const canDownload = !isExpired && downloadsRemaining > 0 && orderStatus === "completed"

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
              {bookTitle}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-4 mb-8">
            {/* Order Status */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Order Status</span>
              <span className={`text-sm font-medium ${
                orderStatus === "completed"
                  ? "text-green-600"
                  : "text-amber-600"
              }`}>
                {orderStatus === "completed" ? "✓ Paid" : "Pending"}
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
              {orderStatus !== "completed" && (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl mb-4">
                  Payment is still processing. Please check back shortly.
                </div>
              )}
              <p className="text-sm text-slate-500">
                Need help?{" "}
                <Link href="/contact" className="underline hover:text-slate-700">
                  Contact support
                </Link>
                .
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
