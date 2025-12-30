import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * DOWNLOAD ROUTE (Improved)
 *
 * Replaces the previous implementation with a robust, atomic flow:
 *  - Validates token exists
 *  - Checks token hasn't expired
 *  - Checks download count limit
 *  - Checks associated order is completed
 *  - Atomically increments downloadCount (inside a transaction)
 *  - Redirects to the ebook URL (or a signed URL if you integrate S3/GCS)
 *
 * URL: /api/download/[token]
 *
 * Notes:
 *  - For production you should generate presigned URLs for private storage (S3/GCS)
 *    instead of redirecting to a public URL. See the commented placeholder below.
 *  - The transaction prevents race conditions on downloadCount.
 */

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const token = params?.token
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  try {
    const now = new Date()

    // All validation + increment happens in a single transaction to avoid races.
    const result = await prisma.$transaction(async (tx) => {
      const dt = await tx.downloadToken.findUnique({
        where: { token },
        include: {
          book: true,
          order: true,
        },
      })

      if (!dt) {
        throw { code: "NOT_FOUND" as const }
      }

      // expiresAt may be null => treat as no expiry
      if (dt.expiresAt && dt.expiresAt < now) {
        throw { code: "EXPIRED" as const }
      }

      if (typeof dt.maxDownloads === "number" && dt.downloadCount >= dt.maxDownloads) {
        throw { code: "LIMIT" as const }
      }

      // Ensure order exists and was completed
      if (!dt.order || dt.order.status !== "completed") {
        throw { code: "PAYMENT" as const }
      }

      if (!dt.book || !dt.book.ebookFileUrl) {
        throw { code: "NO_FILE" as const }
      }

      // Atomically increment downloadCount and update lastUsedAt
      const updated = await tx.downloadToken.update({
        where: { id: dt.id },
        data: {
          downloadCount: { increment: 1 },
          lastUsedAt: now,
        },
      })

      // Return the updated token and the book record
      return { token: updated, book: dt.book }
    })

    const { token: updatedToken, book } = result

    // === Option A: Redirect directly to the stored ebook URL (public URL) ===
    // WARNING: This exposes the URL. Use Option B (presign) in production if files are private.
    return NextResponse.redirect(book.ebookFileUrl)

    // === Option B: Generate a signed URL (recommended for private files) ===
    // Example placeholder (uncomment and implement generateSignedUrl)
    // const signedUrl = await generateSignedUrl(book.ebookFileUrl)
    // return NextResponse.redirect(signedUrl)

    // === Option C: Stream the file through the server (bandwidth cost) ===
    // const resp = await fetch(book.ebookFileUrl)
    // const buffer = await resp.arrayBuffer()
    // return new NextResponse(Buffer.from(buffer), {
    //   headers: {
    //     "Content-Type": resp.headers.get("content-type") || "application/octet-stream",
    //     "Content-Disposition": `attachment; filename="${book.title.replace(/"/g, "")}.pdf"`,
    //   }
    // })
  } catch (error: any) {
    console.error("Download error:", error)

    // Our thrown errors use { code: "..." }. Detect and return appropriate status.
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
        // Any unexpected error -> 500
        return NextResponse.json({ error: "Download failed" }, { status: 500 })
    }
  }
}
