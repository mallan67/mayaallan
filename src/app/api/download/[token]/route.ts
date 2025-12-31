import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSignedUrl } from "@/lib/s3"

/**
 * DOWNLOAD ROUTE — atomic conditional increment via updateMany
 *
 * This implementation:
 * 1. Loads the token + book + order to validate
 * 2. Executes a single conditional UPDATE (updateMany) that increments
 *    downloadCount only when downloadCount < maxDownloads (atomic)
 * 3. If the update affected 0 rows, the limit was reached
 * 4. Redirects to the ebook URL (or presigned URL in production)
 */

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const tokenParam = params?.token
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
    //    update only when downloadCount < maxDownloads and still not expired (defensive)
    const updated = await prisma.downloadToken.updateMany({
      where: {
        id: dt.id,
        downloadCount: { lt: dt.maxDownloads },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
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

    // 3) Success → redirect to ebook URL (replace with presign in prod)
    return NextResponse.redirect(dt.book.ebookFileUrl)
  } catch (err: any) {
    console.error("Download error:", err)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
