"use client"

import { useState, useRef } from "react"
import Image from "next/image"

interface Props {
  label?: string
  currentUrl?: string | null
  onUpload: (url: string) => void
  onRemove?: () => void
  accept?: string
}

export default function ImageUpload({ label, currentUrl, onUpload, onRemove, accept = "image/*" }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()
      onUpload(data.url)
    } catch (err) {
      setError("Upload failed. Please try again.")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const isImage = accept === "image/*" || accept?.includes("image")

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      
      {currentUrl ? (
        <div className="relative">
          {isImage ? (
            <div className="relative w-40 h-40 border border-slate-200 rounded-lg overflow-hidden">
              <Image src={currentUrl} alt="Uploaded" fill className="object-contain bg-slate-50" />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-2xl">📄</span>
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-xs">
                {currentUrl.split("/").pop()}
              </a>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-blue-600 hover:underline"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition"
        >
          <div className="text-3xl mb-2">📁</div>
          <p className="text-sm text-slate-600">Click to upload</p>
          <p className="text-xs text-slate-400 mt-1">
            {accept === "image/*" ? "PNG, JPG, GIF, WebP up to 50MB" : accept.replace(/\./g, "").toUpperCase()}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
