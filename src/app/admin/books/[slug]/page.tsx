import { NextResponse } from "next/server"
import { getBookBySlug, getBookRetailerLinks, getAllRetailers } from "@/lib/mock-data"
import { requireAdmin } from "@/lib/session" // if you have this helper; if not, see note below

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  // ✅ protect admin APIs (match your other admin routes)
  // If your project uses a different auth helper, copy the pattern from /api/admin/books
  await requireAdmin(req)

  const slug = params.slug

  const book = await getBookBySlug(slug)
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  // Attach retailer link objects in the shape the admin form expects
  const [links, retailers] = await Promise.all([
    getBookRetailerLinks(book.id),
    getAllRetailers(),
  ])

  const retailersExpanded = links.map((l) => ({
    id: undefined, // mock links don’t have ids; safe
    formatType: l.formatType,
    url: l.url,
    retailer: retailers.find((r) => r.id === l.retailerId) || null,
  }))

  return NextResponse.json({
    ...book,
    retailers: retailersExpanded,
  })
}
