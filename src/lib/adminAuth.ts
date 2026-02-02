import { redirect } from "next/navigation"
import { isAuthenticated } from "./session"

/**
 * Server-side authentication check for admin pages
 * Call this at the top of any admin Server Component
 *
 * Returns true if authenticated, redirects to login if not
 */
export async function requireAdminAuth(): Promise<boolean> {
  // If SESSION_SECRET not configured, block access
  if (!process.env.SESSION_SECRET) {
    redirect("/admin/login")
  }

  // CRITICAL: Actually validate the session, not just check if cookie exists
  // This decrypts the session and verifies the user is logged in
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/admin/login")
  }

  return true
}

/**
 * Check if user is authenticated (doesn't redirect, just returns boolean)
 * Use this for conditional rendering or API routes
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  if (!process.env.SESSION_SECRET) {
    return false
  }

  // CRITICAL: Actually validate the session, not just check if cookie exists
  return await isAuthenticated()
}
