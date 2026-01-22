"use client"

import { useEffect, useState } from "react"

export function DynamicFavicon() {
  const [iconUrl, setIconUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIcon() {
      try {
        const res = await fetch("/api/site-icon")
        if (res.ok) {
          const data = await res.json()
          if (data.iconUrl) {
            setIconUrl(data.iconUrl)
          }
        }
      } catch (error) {
        console.error("Failed to fetch site icon:", error)
      }
    }
    fetchIcon()
  }, [])

  useEffect(() => {
    if (!iconUrl) return

    // Remove existing favicons
    const existingLinks = document.querySelectorAll("link[rel*='icon']")
    existingLinks.forEach(link => link.remove())

    // Add new favicon
    const link = document.createElement("link")
    link.rel = "icon"
    link.href = iconUrl
    document.head.appendChild(link)

    // Add apple touch icon
    const appleLink = document.createElement("link")
    appleLink.rel = "apple-touch-icon"
    appleLink.href = iconUrl
    document.head.appendChild(appleLink)

    return () => {
      link.remove()
      appleLink.remove()
    }
  }, [iconUrl])

  return null
}
