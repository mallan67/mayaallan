import { put, del } from "@vercel/blob"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = [
      // images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",

      // audio
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",

      // video
      "video/mp4",
      "video/webm",

      // ebooks
      "application/pdf",
      "application/epub+zip",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type || "unknown"}` },
        { status: 400 }
      )
    }

    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 50MB" },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `uploads/${timestamp}-${safeName}`

    // ✅ Ebooks are private, everything else stays public
    const isEbook =
      file.type === "application/pdf" ||
      file.type === "application/epub+zip"

    const access = isEbook ? "private" : "public"

    // ⚠️ Type cast required because @vercel/blob types lag runtime support
    const blob = await put(
      filename,
      file,
      {
        access,
        addRandomSuffix: false,
      } as any
    )

    return NextResponse.json({
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
      access,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    await del(url)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
