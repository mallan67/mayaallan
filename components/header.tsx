import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { HeaderClient } from "./header-client"

// Fallback navigation items for build time or when DB is unavailable
const fallbackNavItems = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/events", label: "Events" },
  { href: "/media", label: "Media" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export async function Header() {
  let navItems = fallbackNavItems

  try {
    // Fetch active navigation items from database
    const { data: dbNavItems, error } = await supabaseAdmin
      .from(Tables.navigationItems)
      .select("label, href")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    // Only use DB items if we got results
    if (!error && dbNavItems && dbNavItems.length > 0) {
      navItems = dbNavItems
    }
  } catch (error) {
    // During build or if DB unavailable, use fallback
    console.warn("Navigation items fetch failed, using fallback:", error)
  }

  return <HeaderClient navItems={navItems} />
}
