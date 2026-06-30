import type React from "react"
import type { Metadata } from "next"
import AdminAuthGuard from "./AdminAuthGuard"
import AdminLayoutClient from "./AdminLayoutClient"

// Keep all authenticated admin pages out of search engines.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

/**
 * Authenticated Admin Layout with Server-Side Authentication
 *
 * This layout wraps the authenticated admin pages (the dashboard + protected
 * routes) with:
 * 1. Server-side authentication check (blocks unauthorized access BEFORE page loads)
 * 2. Client-side navigation and logout functionality (the admin shell)
 *
 * Public auth pages (login / forgot-password / reset-password) live in the
 * sibling (auth) route group and intentionally do NOT render this shell.
 *
 * Security layers:
 * - middleware.ts (Edge runtime) - First line of defense
 * - AdminAuthGuard (Server Component) - Second line of defense
 * - API route authentication - Third line of defense
 */
export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthGuard>
  )
}
