import { requireAdminAuth } from "@/lib/adminAuth"
import { headers } from "next/headers"
import type React from "react"

/**
 * Server Component that checks authentication before rendering children
 * This creates a server-side authentication barrier
 */
export default async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  // Get current path to skip auth for login page
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || ""

  // Skip auth for the public auth pages: login + the password-recovery flow.
  // These MUST render without a session (the whole point of "forgot password"
  // is that you can't log in). Keep this list in sync with the PUBLIC_ADMIN_PATHS
  // allowlist in middleware.ts.
  const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"]
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}?`))) {
    return <>{children}</>
  }

  // CRITICAL: Check if admin authentication is configured.
  // Only SESSION_SECRET (cookie encryption) + ADMIN_EMAIL are hard requirements.
  // The password credential is NOT required here: it can live in the DB
  // (admin_auth, set via the reset flow) rather than ADMIN_PASSWORD_HASH, so a
  // missing env hash is no longer a misconfiguration. Login resolves DB-then-env.
  const hasSessionSecret = !!process.env.SESSION_SECRET
  const hasAdminEmail = !!process.env.ADMIN_EMAIL

  // EMERGENCY BLOCK: If environment variables are missing, show error instead of allowing access
  if (!hasSessionSecret || !hasAdminEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="max-w-2xl w-full bg-white border-2 border-red-500 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">CRITICAL SECURITY ERROR</h1>
          <p className="text-red-800 mb-4">
            Admin authentication is not configured. The admin panel is DISABLED for security.
          </p>
          <div className="bg-red-100 border border-red-300 rounded p-4 mb-4">
            <p className="font-semibold mb-2">Missing Environment Variables:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {!hasSessionSecret && <li>SESSION_SECRET</li>}
              {!hasAdminEmail && <li>ADMIN_EMAIL</li>}
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
            <p className="font-semibold mb-2">To Fix:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to your Vercel dashboard</li>
              <li>Navigate to Settings → Environment Variables</li>
              <li>Add the missing variables</li>
              <li>Redeploy your application</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  // SERVER-SIDE AUTH CHECK - This runs on the server before ANY client code loads
  // If not authenticated, this will redirect to /admin/login
  await requireAdminAuth()

  // Only render children if authenticated
  return <>{children}</>
}
