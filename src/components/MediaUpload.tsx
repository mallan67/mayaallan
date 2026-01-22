"use client"

import { useState, useRef } from "react"

interface Props {
  kind: "audio" | "video" | "image"
  currentFileUrl?: string | null
  currentExternalUrl?: string | null
  onFileUpload: (url: string) => void
  onExternalUrlChange: (url: string) => void
  onRemove?: () => void
}

export default function MediaUpload({
  kind,
  currentFileUrl,
  currentExternalUrl,
  onFileUpload,
  onExternalUrlChange,
  onRemove,
}: Props) {
  const [mode, setMode] = useState<"upload" | "link">(
    currentFileUrl ? "upload" : currentExternalUrl ? "link" : "upload"
  )
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [externalUrlInput, setExternalUrlInput] = useState(currentExternalUrl || "")
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptTypes = {
    audio: "audio/*,.mp3,.wav,.m4a,.aac,.ogg",
    video: "video/*,.mp4,.webm,.mov,.avi",
    image: "image/*,.jpg,.jpeg,.png,.gif,.webp",
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress (since fetch doesn't support upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()
      onFileUpload(data.url)
      setExternalUrlInput("") // Clear external URL when uploading file
    } catch (err) {
      setError("Upload failed. Please try again.")
      console.error(err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleExternalUrlSubmit = () => {
    if (externalUrlInput.trim()) {
      onExternalUrlChange(externalUrlInput.trim())
      onFileUpload("") // Clear file URL when using external link
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    setExternalUrlInput("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const currentUrl = currentFileUrl || currentExternalUrl

  return (
    <div className="space-y-4">
      {/* Toggle Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-4 py-2 text-sm font-medium transition ${
            mode === "upload"
              ? "text-black border-b-2 border-black"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`px-4 py-2 text-sm font-medium transition ${
            mode === "link"
              ? "text-black border-b-2 border-black"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          External Link
        </button>
      </div>

      {/* Upload File Mode */}
      {mode === "upload" && (
        <div className="space-y-3">
          {currentFileUrl ? (
            <div className="space-y-3">
              {/* Preview */}
              {kind === "audio" && (
                <audio controls className="w-full">
                  <source src={currentFileUrl} />
                  Your browser does not support the audio element.
                </audio>
              )}
              {kind === "video" && (
                <video controls className="w-full max-h-96 bg-black rounded-lg">
                  <source src={currentFileUrl} />
                  Your browser does not support the video element.
                </video>
              )}
              {kind === "image" && (
                <div className="relative w-full h-48 border border-slate-200 rounded-lg overflow-hidden">
                  <img src={currentFileUrl} alt="Uploaded" className="w-full h-full object-contain bg-slate-50" />
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <a
                  href={currentFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {currentFileUrl.split("/").pop()}
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded transition"
                >
                  Replace
                </button>
                {onRemove && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition"
            >
              <div className="text-4xl mb-3">
                {kind === "audio" ? "🎵" : kind === "video" ? "🎬" : "🖼️"}
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">Click to upload {kind} file</p>
              <p className="text-xs text-slate-500">
                {kind === "audio" && "MP3, WAV, M4A, AAC, OGG up to 50MB"}
                {kind === "video" && "MP4, WebM, MOV up to 50MB"}
                {kind === "image" && "PNG, JPG, GIF, WebP up to 50MB"}
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes[kind]}
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Uploading... {progress}%</p>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* External Link Mode */}
      {mode === "link" && (
        <div className="space-y-3">
          <div>
            <input
              type="url"
              value={externalUrlInput}
              onChange={(e) => setExternalUrlInput(e.target.value)}
              onBlur={handleExternalUrlSubmit}
              placeholder="https://youtube.com/watch?v=... or https://soundcloud.com/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
            <p className="text-xs text-slate-500 mt-1">
              Paste URL from YouTube, Vimeo, SoundCloud, Spotify, or direct media links
            </p>
          </div>

          {currentExternalUrl && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-sm font-medium mb-2">Preview:</p>

              {/* YouTube embed */}
              {currentExternalUrl.includes("youtube.com") || currentExternalUrl.includes("youtu.be") && (
                <div className="aspect-video">
                  <iframe
                    src={currentExternalUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                    className="w-full h-full rounded"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Vimeo embed */}
              {currentExternalUrl.includes("vimeo.com") && (
                <div className="aspect-video">
                  <iframe
                    src={currentExternalUrl.replace("vimeo.com/", "player.vimeo.com/video/")}
                    className="w-full h-full rounded"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* SoundCloud - just show link */}
              {currentExternalUrl.includes("soundcloud.com") && (
                <a
                  href={currentExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm block truncate"
                >
                  {currentExternalUrl}
                </a>
              )}

              {/* Generic fallback */}
              {!currentExternalUrl.includes("youtube") &&
                !currentExternalUrl.includes("youtu.be") &&
                !currentExternalUrl.includes("vimeo") &&
                !currentExternalUrl.includes("soundcloud") && (
                  <a
                    href={currentExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm block truncate"
                  >
                    {currentExternalUrl}
                  </a>
                )}
            </div>
          )}

          {onRemove && currentExternalUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition"
            >
              Remove Link
            </button>
          )}
        </div>
      )}
    </div>
  )
}
