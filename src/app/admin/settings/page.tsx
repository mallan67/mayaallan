"use client"

import React, { useEffect, useState } from "react"

type SiteSettings = {
  id: number
  siteTitle: string
  siteDescription: string
  authorName?: string | null
  authorBio?: string | null
  authorPhotoUrl?: string | null
  defaultOgImageUrl?: string | null
  fontBody: string
  fontHeading: string
  accentColor: string
  maxWidth: string
  buttonStyle: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" })
        if (!res.ok) throw new Error("load failed")
        const data = (await res.json()) as SiteSettings
        setSettings(data)
      } catch {
        setMessage("Failed to load settings")
      }
    })()
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setMessage("")

    try {
      const form = new FormData(e.currentTarget)

      const payload = {
        siteTitle: String(form.get("siteTitle") || ""),
        siteDescription: String(form.get("siteDescription") || ""),
        authorName: String(form.get("authorName") || ""),
        authorBio: String(form.get("authorBio") || ""),
        authorPhotoUrl: String(form.get("authorPhotoUrl") || ""),
        defaultOgImageUrl: String(form.get("defaultOgImageUrl") || ""),
        fontBody: String(form.get("fontBody") || "serif"),
        fontHeading: String(form.get("fontHeading") || "serif"),
        accentColor: String(form.get("accentColor") || "#0f172a"),
        maxWidth: String(form.get("maxWidth") || "max-w-6xl"),
        buttonStyle: String(form.get("buttonStyle") || "rounded"),
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("save failed")

      const updated = (await res.json()) as SiteSettings
      setSettings(updated)
      setMessage("Settings saved successfully!")
    } catch {
      setMessage("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p>Loading settings...</p>
        {message && <p className="mt-3 text-sm text-red-700">{message}</p>}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Site Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Site Information</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Site Title</label>
            <input
              name="siteTitle"
              defaultValue={settings.siteTitle}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Site Description</label>
            <textarea
              name="siteDescription"
              rows={3}
              defaultValue={settings.siteDescription}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Author Name</label>
            <input
              name="authorName"
              defaultValue={settings.authorName || ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Author Bio</label>
            <textarea
              name="authorBio"
              rows={8}
              defaultValue={settings.authorBio || ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Author Photo URL</label>
            <input
              name="authorPhotoUrl"
              defaultValue={settings.authorPhotoUrl || ""}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Default OG Image URL</label>
            <input
              name="defaultOgImageUrl"
              defaultValue={settings.defaultOgImageUrl || ""}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Style</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Body Font</label>
              <select name="fontBody" defaultValue={settings.fontBody} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heading Font</label>
              <select name="fontHeading" defaultValue={settings.fontHeading} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Accent Color</label>
            <input name="accentColor" defaultValue={settings.accentColor} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Width</label>
            <select name="maxWidth" defaultValue={settings.maxWidth} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="max-w-4xl">max-w-4xl</option>
              <option value="max-w-5xl">max-w-5xl</option>
              <option value="max-w-6xl">max-w-6xl</option>
              <option value="max-w-7xl">max-w-7xl</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Button Style</label>
            <select name="buttonStyle" defaultValue={settings.buttonStyle} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="rounded">rounded</option>
              <option value="rounded-lg">rounded-lg</option>
              <option value="rounded-full">rounded-full</option>
              <option value="rounded-none">rounded-none</option>
            </select>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  )
}
