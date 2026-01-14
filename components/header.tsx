import { prisma } from "@/lib/prisma"
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
    const dbNavItems = await prisma.navigationItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        label: true,
        href: true,
      },
    })

    // Only use DB items if we got results
    if (dbNavItems.length > 0) {
      navItems = dbNavItems
    }
  } catch (error) {
    // During build or if DB unavailable, use fallback
    console.warn("Navigation items fetch failed, using fallback:", error)
  }

  return <HeaderClient navItems={navItems} />
}
