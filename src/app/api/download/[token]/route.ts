import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * DOWNLOAD ROUTE (Issue #3B Fix):
 * 
 * Secure ebook download with token validation:
 * 1. Validates token exists
 * 2. Checks token hasn't expired
 * 3. Checks download count limit
 * 4. Increments download count
 * 5. Redirects to signed URL or serves file
 * 
 * URL: /api/download/[token]
 * Or: /download/[token] (with page that calls this API)
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    // Find token with related data
    const downloadToken = await prisma.downloadToken.findUnique({
      where: { token },
      include: {
        book: true,
        order: true,
      },
    })

    // Token not found
    if (!downloadToken) {
      return NextResponse.json(
        { error: "Invalid download link" },
        { status: 404 }
      )
    }

    // Token expired
    if (new Date() > downloadToken.expiresAt) {
      return NextResponse.json(
        { error: "Download link has expired" },
        { status: 410 }
      )
    }

    // Download limit reached
    if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
      return NextResponse.json(
        { error: "Download limit reached" },
        { status: 403 }
      )
    }

    // Order not completed
    if (downloadToken.order.status !== "completed") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      )
    }

    // No ebook file URL
    if (!downloadToken.book.ebookFileUrl) {
      return NextResponse.json(
        { error: "Ebook file not available" },
        { status: 404 }
      )
    }

    // Increment download count
    await prisma.downloadToken.update({
      where: { id: downloadToken.id },
      data: {
        downloadCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    })

    // Option 1: Redirect to the file URL (if using signed URLs from S3/Cloudflare)
    // For S3, you'd generate a signed URL here:
    // const signedUrl = await generateSignedUrl(downloadToken.book.ebookFileUrl)
    // return NextResponse.redirect(signedUrl)

    // Option 2: For simple setups, redirect directly
    // WARNING: This exposes the direct URL. Use signed URLs in production.
    return NextResponse.redirect(downloadToken.book.ebookFileUrl)

    // Option 3: Stream the file through your server (more secure but uses bandwidth)
    // const response = await fetch(downloadToken.book.ebookFileUrl)
    // const blob = await response.blob()
    // return new NextResponse(blob, {
    //   headers: {
    //     "Content-Type": "application/pdf",
    //     "Content-Disposition": `attachment; filename="${downloadToken.book.title}.pdf"`,
    //   },
    // })

  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    )
  }
}
