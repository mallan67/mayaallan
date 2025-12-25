"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "@/lib/mock-data"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    getSiteSettings().then(setSettings)
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const updates = {
        siteTitle: formData.get("siteTitle") as string,
        siteDescription: formData.get("siteDescription") as string,
        authorPhotoUrl: formData.get("authorPhotoUrl") as string | null,
        defaultOgImageUrl: formData.get("defaultOgImageUrl") as string | null,
        fontBody: formData.get("fontBody") as string,
        fontHeading: formData.get("fontHeading") as string,
        accentColor: formData.get("accentColor") as string,
        maxWidth: formData.get("maxWidth") as string,
        buttonStyle: formData.get("buttonStyle") as string,
      }

      const updatedSettings = await updateSiteSettings(updates)
      setSettings(updatedSettings)
      setMessage("Settings saved successfully!")
    } catch (error) {
      setMessage("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Site Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Customize your site appearance and content</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site Info */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Site Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="siteTitle" className="block text-sm font-medium text-slate-700 mb-1">
                Site Title
              </label>
              <input
                type="text"
                id="siteTitle"
                name="siteTitle"
                defaultValue={settings.siteTitle}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-slate-700 mb-1">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                rows={3}
                defaultValue={settings.siteDescription}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label htmlFor="authorPhotoUrl" className="block text-sm font-medium text-slate-700 mb-1">
                Author Photo URL
              </label>
              <input
                type="url"
                id="authorPhotoUrl"
                name="authorPhotoUrl"
                defaultValue={settings.authorPhotoUrl || ""}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label htmlFor="defaultOgImageUrl" className="block text-sm font-medium text-slate-700 mb-1">
                Default OG Image URL
              </label>
              <input
                type="url"
                id="defaultOgImageUrl"
                name="defaultOgImageUrl"
                defaultValue={settings.defaultOgImageUrl || ""}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Style Controls */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Style Controls</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fontBody" className="block text-sm font-medium text-slate-700 mb-1">
                  Body Font
                </label>
                <select
                  id="fontBody"
                  name="fontBody"
                  defaultValue={settings.fontBody}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="sans">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>
              <div>
                <label htmlFor="fontHeading" className="block text-sm font-medium text-slate-700 mb-1">
                  Heading Font
                </label>
                <select
                  id="fontHeading"
                  name="fontHeading"
                  defaultValue={settings.fontHeading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="sans">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="accentColor" className="block text-sm font-medium text-slate-700 mb-1">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="accentColor"
                  name="accentColor"
                  defaultValue={settings.accentColor}
                  className="h-10 w-20 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div>
              <label htmlFor="maxWidth" className="block text-sm font-medium text-slate-700 mb-1">
                Max Width
              </label>
              <select
                id="maxWidth"
                name="maxWidth"
                defaultValue={settings.maxWidth}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="max-w-4xl">Narrow (4xl)</option>
                <option value="max-w-5xl">Medium (5xl)</option>
                <option value="max-w-6xl">Wide (6xl)</option>
                <option value="max-w-7xl">Extra Wide (7xl)</option>
              </select>
            </div>
            <div>
              <label htmlFor="buttonStyle" className="block text-sm font-medium text-slate-700 mb-1">
                Button Style
              </label>
              <select
                id="buttonStyle"
                name="buttonStyle"
                defaultValue={settings.buttonStyle}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="rounded">Rounded</option>
                <option value="rounded-lg">Rounded Large</option>
                <option value="rounded-full">Pill</option>
                <option value="rounded-none">Square</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  )
}
