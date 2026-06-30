/**
 * Admin UI for /api/admin/export/recover.
 *
 * Manually trigger session-export PDF delivery for a stuck PayPal order
 * (one that captured but whose webhook delivery silently failed). See the
 * route handler at src/app/api/admin/export/recover/route.ts for the
 * fulfillment logic.
 *
 * Auth: admin session required (server-side check + redirect to /admin/login).
 */
import { isAuthenticated } from "@/lib/session"
import { redirect } from "next/navigation"
import { RecoverForm } from "./RecoverForm"

export const dynamic = "force-dynamic"

export default async function ExportRecoverPage() {
  if (!(await isAuthenticated())) redirect("/admin/login")

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-semibold text-slate-900 mb-3">
        Recover stuck session-export
      </h1>
      <p className="text-slate-600 leading-relaxed mb-8">
        Manually trigger PDF delivery for a session-export order whose webhook
        was missed or silently dropped. Enter the PayPal Order ID from your
        PayPal Activity (looks like <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">19669393M95070412</code>)
        and optionally an alternate recipient email for testing.
      </p>

      <RecoverForm />

      <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500 space-y-3">
        <p><strong className="text-slate-700">What this does:</strong></p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Fetches the order from PayPal to confirm capture status</li>
          <li>Extracts the staged session ID from the order&apos;s <code>custom_id</code></li>
          <li>Looks up the session payload (Upstash + legacy blob fallback)</li>
          <li>If found, renders the PDF and emails it to the buyer (or your override)</li>
          <li>Returns a structured status report</li>
        </ol>
        <p className="pt-2"><strong className="text-slate-700">If the response says &quot;session-not-found&quot;:</strong></p>
        <p>The PayPal capture is real but the original session data is gone from storage. Refund the order in PayPal Business or contact the customer for their chat history.</p>
      </div>
    </div>
  )
}
