"use client"

/**
 * Ebook (PDF / EPUB) uploader using Vercel Blob CLIENT-SIDE upload.
 *
 * Why this exists separately from ImageUpload:
 *   The /api/upload route handles small files via FormData, which is capped at
 *   ~4.5 MB by Vercel's function body limit. Real ebook PDFs are 5-30 MB, so
 *   they fail at the platform layer before our function runs.
 *
 *   This component uses @vercel/blob/client's upload() which streams the file
 *   directly from the browser to Vercel Blob storage — no function involved
 *   in the file transfer, no body limit.
 *
 *   The /api/upload/blob-token endpoint issues a short-lived signed token
 *   after authenticating the admin session.
 */
import { useRef, useState } from "react"
import { upload } from "@vercel/blob/client"

interface Props {
  label?: string
  currentUrl?: string | null
  onUpload: (url: string) => void
  onRemove?: () => void
  /** Comma-separated extensions or MIME types for the <input accept=...> attribute */
  accept?: string
}

export default function EbookUpload({
  label,
  currentUrl,
  onUpload,
  onRemove,
  accept = ".pdf,.epub",
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Mirror the server's allowlist client-side to fail fast
    const okType =
      file.type === "application/pdf" ||
      file.type === "application/epub+zip" ||
      /\.(pdf|epub)$/i.test(file.name)
    if (!okType) {
      setError("Please choose a PDF or EPUB file.")
      e.target.value = ""
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/blob-token",
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.round(percentage))
        },
      })
      onUpload(blob.url)
    } catch (err: any) {
      console.error("[EbookUpload] failed:", err)
      // upload() surfaces the server's error message in err.message — fine for
      // admin context (no real secrets in upstream Vercel Blob errors).
      const msg = err?.message ?? "Upload failed"
      setError(msg.length > 200 ? "Upload failed. Please try again." : msg)
    } finally {
      setUploading(false)
      setProgress(0)
      // Reset the input so picking the same file again re-triggers onChange
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleRemove = () => {
    if (onRemove) onRemove()
    if (inputRef.current) inputRef.current.value = ""
  }

  const filename = currentUrl
    ? decodeURIComponent(currentUrl.split("/").pop() ?? "")
    : null

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}

      {currentUrl ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
            <span className="text-2xl" aria-hidden="true">📄</span>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate"
            >
              {filename}
            </a>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-blue-600 hover:underline"
              disabled={uploading}
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-red-600 hover:underline"
                disabled={uploading}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          className={`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center transition ${
            uploading ? "cursor-wait" : "cursor-pointer hover:border-slate-400"
          }`}
        >
          <div className="text-3xl mb-2" aria-hidden="true">📁</div>
          <p className="text-sm text-slate-600">Click to upload</p>
          <p className="text-xs text-slate-400 mt-1">
            PDF, EPUB &middot; up to 100 MB &middot; streamed directly to storage
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {uploading && (
        <div className="space-y-1.5">
          <p className="text-sm text-slate-600">Uploading {progress}%…</p>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-black h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
