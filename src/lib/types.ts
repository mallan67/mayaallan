// Shared domain type definitions used across the app.

export interface Retailer {
  id: number
  name: string
  slug: string
  iconUrl?: string | null
  isActive: boolean
}

export interface BookRetailerLink {
  bookId: number
  retailerId: number
  url: string
  formatType: "ebook" | "print" | "hardcover"
  isActive: boolean
}

export interface Book {
  id: number
  slug: string
  title: string
  subtitle1?: string | null
  subtitle2?: string | null
  tagsCsv?: string | null
  isbn?: string | null
  copyright?: string | null
  blurb?: string | null
  coverUrl?: string | null
  backCoverUrl?: string | null
  ebookFileUrl?: string | null
  isPublished: boolean
  isVisible: boolean
  isComingSoon: boolean
  allowDirectSale: boolean
  paypalPaymentLink?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  ogImageUrl?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface MediaItem {
  id: number
  kind: "audio" | "video" | "image"
  slug: string
  title: string
  description?: string | null
  coverUrl?: string | null
  fileUrl?: string | null
  externalUrl?: string | null
  duration?: string | null
  isbn?: string | null
  isPublished: boolean
  isVisible: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: number
  slug: string
  title: string
  description?: string | null
  startsAt: string
  endsAt?: string | null
  locationText?: string | null
  locationUrl?: string | null
  photoUrls?: string[]
  isPublished: boolean
  isVisible: boolean
  keepVisibleAfterEnd: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  createdAt: string
  updatedAt: string
}

export interface NavigationItem {
  id: number
  label: string
  href: string
  order: number
  isVisible: boolean
}
