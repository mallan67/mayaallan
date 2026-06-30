import type React from "react"
import type { Metadata } from "next"

// Keep the public admin auth pages out of search engines.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

/**
 * Public Auth Layout
 *
 * These are the PUBLIC admin auth pages (login / forgot-password /
 * reset-password). They MUST render without a session and must NOT show the
 * authenticated admin shell (admin nav + Logout) — so this layout deliberately
 * does NOT use AdminAuthGuard or AdminLayoutClient.
 *
 * The public site header comes from the root layout; here we just pass children
 * through.
 */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
