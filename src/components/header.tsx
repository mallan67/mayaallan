import { sql } from "@/lib/db"
import { HeaderClient } from "./header-client"

// Fallback navigation items for build time or when DB is unavailable.
// Live nav comes from the navigation_items table; admin can edit via /admin/navigation.
const fallbackNavItems = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/belief-inquiry", label: "Belief Inquiry" },
  { href: "/nervous-system-reset", label: "Nervous System Reset" },
  { href: "/integration-reflection", label: "Integration Reflection" },
  { href: "/media", label: "Media" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export async function Header() {
  let navItems = fallbackNavItems

  try {
    // Fetch active navigation items from database
    const dbNavItems = await sql`
      select label, href
      from navigation_items
      where is_visible = true
      order by sort_order asc
    `

    // Only use DB items if we got results
    if (dbNavItems.length > 0) {
      navItems = dbNavItems.map((r) => ({ href: r.href as string, label: r.label as string }))
    }
  } catch (error) {
    // During build or if DB unavailable, use fallback
    console.warn("Navigation items fetch failed, using fallback:", error)
  }

  return <HeaderClient navItems={navItems} />
}
