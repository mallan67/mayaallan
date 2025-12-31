import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * DOWNLOAD ROUTE — robust, row-locking implementation.
 *
 * Uses SELECT ... FOR UPDATE (raw SQL via Prisma) to lock the DownloadToken row,
 * preventing concurrent requests from both passing the check and incrementing.
 *
 * Behavior:
 *  - Validates token exists
 *  - Validates not expired
 *  - Validates order is completed
 *  - Locks the row, checks downloadCount < maxDownloads and increments atomically
 *  - Redirects to ebook URL (or use presigned URL)
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

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1) Load token + related book/order for quick validation before locking
      const dt = await tx.downloadToken.findUnique({
        where: { token: tokenParam },
        include: { book: true, order: true },
      })

      if (!dt) {
        throw { code: "NOT_FOUND" as const }
      }

      if (dt.expiresAt && dt.expiresAt < now) {
        throw { code: "EXPIRED" as const }
      }

      if (!dt.order || dt.order.status !== "completed") {
        throw { code: "PAYMENT" as const }
      }

      if (!dt.book || !dt.book.ebookFileUrl) {
        throw { code: "NO_FILE" as const }
      }

      // 2) Lock the row with SELECT ... FOR UPDATE (Postgres). This prevents other txs
      //    from reading/modifying the row until we finish.
      //
      //    Note: Prisma returns column names as provided; for safety we handle
      //    both camelCase and lowercase keys in the returned row object.
      const lockRows: any[] = await tx.$queryRawUnsafe(
        `SELECT "downloadCount", "maxDownloads" FROM "DownloadToken" WHERE id = $1 FOR UPDATE`,
        dt.id
      )

      if (!lockRows || lockRows.length === 0) {
        // Unexpected — the row existed earlier, but disappears; treat as not found
        throw { code: "NOT_FOUND" as const }
      }

      const lockRow = lockRows[0]
      // handle possible key shapes
      const currentCount = Number(lockRow.downloadCount ?? lockRow.downloadcount ?? 0)
      const maxDownloads = Number(lockRow.maxDownloads ?? lockRow.maxdownloads ?? dt.maxDownloads ?? 0)

      if (Number.isFinite(maxDownloads) && currentCount >= maxDownloads) {
        throw { code: "LIMIT" as const }
      }

      // 3) Safe to increment — still inside the transaction while row is locked
      const updated = await tx.downloadToken.update({
        where: { id: dt.id },
        data: {
          downloadCount: { increment: 1 },
          lastUsedAt: now,
        },
      })

      // return updated token and book
      return { token: updated, book: dt.book }
    }) // end transaction

    const { token: updatedToken, book } = result

    // Redirect to the ebook URL (public) or generate a signed URL here for private files.
    return NextResponse.redirect(book.ebookFileUrl)
  } catch (error: any) {
    console.error("Download error:", error)

    const code = error && error.code
    switch (code) {
      case "NOT_FOUND":
        return NextResponse.json({ error: "Invalid download link" }, { status: 404 })
      case "EXPIRED":
        return NextResponse.json({ error: "Download link has expired" }, { status: 410 })
      case "LIMIT":
        return NextResponse.json({ error: "Download limit reached" }, { status: 403 })
      case "PAYMENT":
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 })
      case "NO_FILE":
        return NextResponse.json({ error: "Ebook file not available" }, { status: 404 })
      default:
        return NextResponse.json({ error: "Download failed" }, { status: 500 })
    }
  }
}
