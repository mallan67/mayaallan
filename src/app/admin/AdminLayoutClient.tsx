"use client"

import type React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show header on login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const handleLogout = async () => {
    const res = await fetch("/api/admin/logout", { method: "POST" })
    if (res.ok) {
      router.push("/admin/login")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-semibold">
            Admin Panel
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/books" className="hover:opacity-70">
              Books
            </Link>
            <Link href="/admin/media" className="hover:opacity-70">
              Media
            </Link>
            <Link href="/admin/events" className="hover:opacity-70">
              Events
            </Link>
            <Link href="/admin/navigation" className="hover:opacity-70">
              Navigation
            </Link>
            <Link href="/admin/settings" className="hover:opacity-70">
              Settings
            </Link>
            <Link href="/" className="hover:opacity-70">
              View Site
            </Link>
            <button onClick={handleLogout} className="text-red-600 hover:opacity-70">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
