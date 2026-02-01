import { requireAdminAuth } from "@/lib/adminAuth"
import type React from "react"

/**
 * Server Component that checks authentication before rendering children
 * This creates a server-side authentication barrier
 */
export default async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  // SERVER-SIDE AUTH CHECK - This runs on the server before ANY client code loads
  // If not authenticated, this will redirect to /admin/login
  await requireAdminAuth()

  // Only render children if authenticated
  return <>{children}</>
}
