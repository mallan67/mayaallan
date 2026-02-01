import type React from "react"
import AdminAuthGuard from "./AdminAuthGuard"
import AdminLayoutClient from "./AdminLayoutClient"

/**
 * Admin Layout with Server-Side Authentication
 *
 * This layout wraps all admin pages with:
 * 1. Server-side authentication check (blocks unauthorized access BEFORE page loads)
 * 2. Client-side navigation and logout functionality
 *
 * Security layers:
 * - middleware.ts (Edge runtime) - First line of defense
 * - AdminAuthGuard (Server Component) - Second line of defense
 * - API route authentication - Third line of defense
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthGuard>
  )
}
