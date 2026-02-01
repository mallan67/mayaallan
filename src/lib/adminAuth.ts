import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Server-side authentication check for admin pages
 * Call this at the top of any admin Server Component
 *
 * Returns true if authenticated, redirects to login if not
 */
export async function requireAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("mayaallan_admin_session")

  // No session cookie = not logged in
  if (!sessionCookie?.value) {
    redirect("/admin/login")
  }

  // If SESSION_SECRET not configured, block access
  if (!process.env.SESSION_SECRET) {
    redirect("/admin/login")
  }

  return true
}

/**
 * Check if user is authenticated (doesn't redirect, just returns boolean)
 * Use this for conditional rendering or API routes
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("mayaallan_admin_session")

  if (!sessionCookie?.value || !process.env.SESSION_SECRET) {
    return false
  }

  return true
}
