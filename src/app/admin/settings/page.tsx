"use client"

import React, { useEffect, useState } from "react"

type SiteSettings = {
  id: number
  siteName: string
  tagline?: string | null
  footerText?: string | null
  contactEmail?: string | null
  socialTwitter?: string | null
  socialInstagram?: string | null
  socialFacebook?: string | null
  socialYoutube?: string | null
  socialTiktok?: string | null
  authorName?: string | null
  authorBio?: string | null
  authorPhotoUrl?: string | null
  defaultOgImageUrl?: string | null
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
        siteName: String(form.get("siteName") || ""),
        tagline: String(form.get("tagline") || ""),
        footerText: String(form.get("footerText") || ""),
        contactEmail: String(form.get("contactEmail") || ""),
        socialTwitter: String(form.get("socialTwitter") || ""),
        socialInstagram: String(form.get("socialInstagram") || ""),
        socialFacebook: String(form.get("socialFacebook") || ""),
        socialYoutube: String(form.get("socialYoutube") || ""),
        socialTiktok: String(form.get("socialTiktok") || ""),
        authorName: String(form.get("authorName") || ""),
        authorBio: String(form.get("authorBio") || ""),
        authorPhotoUrl: String(form.get("authorPhotoUrl") || ""),
        defaultOgImageUrl: String(form.get("defaultOgImageUrl") || ""),
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
          <h2 className="text-lg font-semibold">Site</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
            <input
              name="siteName"
              defaultValue={settings.siteName || ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
            <textarea
              name="tagline"
              rows={3}
              defaultValue={settings.tagline || ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Footer Text</label>
            <textarea
              name="footerText"
              rows={2}
              defaultValue={settings.footerText || ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
            <input
              name="contactEmail"
              defaultValue={settings.contactEmail || ""}
              placeholder="you@email.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Author</h2>

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
          <h2 className="text-lg font-semibold">Social</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Twitter/X</label>
              <input name="socialTwitter" defaultValue={settings.socialTwitter || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
              <input name="socialInstagram" defaultValue={settings.socialInstagram || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
              <input name="socialFacebook" defaultValue={settings.socialFacebook || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">YouTube</label>
              <input name="socialYoutube" defaultValue={settings.socialYoutube || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TikTok</label>
              <input name="socialTiktok" defaultValue={settings.socialTiktok || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
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
