"use client"

/**
 * Fires a single `book_viewed` event per book per browser session.
 *
 * The book detail page is SSG'd, so we can't track from the server.
 * This component mounts client-side and posts once to /api/marketing/event,
 * guarded by sessionStorage so re-renders / client-side navigation
 * back-and-forth don't double-count.
 */
import { useEffect } from "react"

interface Props {
  bookId: number
  slug: string
  title: string
  hasDirectSale: boolean
  ebookPrice: number | null
}

export default function BookViewTracker({ bookId, slug, title, hasDirectSale, ebookPrice }: Props) {
  useEffect(() => {
    const key = `ma_book_viewed:${bookId}`
    try {
      if (sessionStorage.getItem(key) === "1") return
      sessionStorage.setItem(key, "1")
    } catch {
      // sessionStorage may be unavailable in some browsers / private modes.
      // Fall through — we'll fire once per page load instead.
    }

    fetch("/api/marketing/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName: "book_viewed",
        path: `/books/${slug}`,
        properties: {
          book_id: bookId,
          slug,
          title: title.slice(0, 128),
          direct_sale_enabled: hasDirectSale,
          ebook_price: typeof ebookPrice === "number" ? ebookPrice : null,
        },
      }),
    }).catch(() => {
      // Silent — analytics failure must not affect the page.
    })
  }, [bookId, slug, title, hasDirectSale, ebookPrice])

  return null
}
