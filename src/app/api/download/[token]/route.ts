import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * DOWNLOAD ROUTE — atomic conditional increment
 *
 * This implementation:
 * 1. Loads the token + book + order to validate
 * 2. Executes a single conditional UPDATE (updateMany) that increments
 *    downloadCount only when downloadCount < maxDownloads (atomic)
 * 3. If the update affected 0 rows, the limit was reached
 * 4. Redirects the client to the ebook file URL
 *
 * File: src/app/api/download/[token]/route.ts
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const resolvedParams = await params
  const tokenParam = resolvedParams?.token
  if (!tokenParam) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  try {
    const now = new Date()

    // 1) Read token + relations for validation
    const dt = await prisma.downloadToken.findUnique({
      where: { token: tokenParam },
      include: { book: true, order: true },
    })

    if (!dt) {
      return NextResponse.json({ error: "Invalid download link" }, { status: 404 })
    }

    if (dt.expiresAt && dt.expiresAt < now) {
      return NextResponse.json({ error: "Download link has expired" }, { status: 410 })
    }

    if (!dt.order || dt.order.status !== "completed") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 })
    }

    if (!dt.book || !dt.book.ebookFileUrl) {
      return NextResponse.json({ error: "Ebook file not available" }, { status: 404 })
    }

    // 2) Atomic conditional increment:
    //    update only when downloadCount < maxDownloads
    //    (expiration already validated above, this prevents race on download limit)
    const updated = await prisma.downloadToken.updateMany({
      where: {
        id: dt.id,
        downloadCount: { lt: dt.maxDownloads },
      },
      data: {
        downloadCount: { increment: 1 },
        lastUsedAt: now,
      },
    })

    if (updated.count === 0) {
      // No rows updated -> limit reached (or expired concurrently)
      return NextResponse.json({ error: "Download limit reached" }, { status: 403 })
    }

    // 3) Redirect to the ebook file URL
    return NextResponse.redirect(dt.book.ebookFileUrl)
  } catch (err: any) {
    console.error("Download error:", err)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
