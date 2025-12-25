"use client"
import { useState, useRef } from "react"

interface ImageUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
  label?: string
  accept?: string
}

export default function ImageUpload({ currentUrl, onUpload, label = "Upload Image", accept = "image/*" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", { method: "POST", body: formData })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()
      setPreview(data.url)
      onUpload(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      
      {preview ? (
        <div className="relative inline-block">
          {accept.includes("audio") ? (
            <audio src={preview} controls className="max-w-full" />
          ) : (
            <img src={preview} alt="Preview" className="max-w-xs max-h-48 rounded-lg border border-slate-200 object-cover" />
          )}
          <button type="button" onClick={handleRemove} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">×</button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition">
          {uploading ? (
            <div className="text-slate-500">Uploading...</div>
          ) : (
            <div className="text-slate-500">
              <div className="text-3xl mb-2">📁</div>
              <div>Click to upload</div>
              <div className="text-xs mt-1">PNG, JPG, GIF, WebP up to 50MB</div>
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" disabled={uploading} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
