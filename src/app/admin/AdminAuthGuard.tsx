import { requireAdminAuth } from "@/lib/adminAuth"
import type React from "react"

/**
 * Server Component that checks authentication before rendering children
 * This creates a server-side authentication barrier
 */
export default async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  // CRITICAL: Check if admin authentication is configured
  const hasSessionSecret = !!process.env.SESSION_SECRET
  const hasAdminEmail = !!process.env.ADMIN_EMAIL
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD

  // EMERGENCY BLOCK: If environment variables are missing, show error instead of allowing access
  if (!hasSessionSecret || !hasAdminEmail || !hasAdminPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="max-w-2xl w-full bg-white border-2 border-red-500 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 CRITICAL SECURITY ERROR</h1>
          <p className="text-red-800 mb-4">
            Admin authentication is not configured. The admin panel is DISABLED for security.
          </p>
          <div className="bg-red-100 border border-red-300 rounded p-4 mb-4">
            <p className="font-semibold mb-2">Missing Environment Variables:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {!hasSessionSecret && <li>SESSION_SECRET</li>}
              {!hasAdminEmail && <li>ADMIN_EMAIL</li>}
              {!hasAdminPassword && <li>ADMIN_PASSWORD</li>}
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
