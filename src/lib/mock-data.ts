// Mock data for the site until database is configured

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
  stripePaymentLink?: string | null
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

export interface ContactSubmission {
  id: number
  name?: string | null
  email?: string | null
  message?: string | null
  source?: string | null
  createdAt: string
}

export interface EmailSubscriber {
  id: number
  email: string
  source?: string | null
  createdAt: string
}

export interface NavigationItem {
  id: number
  label: string
  href: string
  order: number
  isVisible: boolean
}

export interface SiteSettings {
  id: number
  siteTitle: string
  siteDescription: string
  authorPhotoUrl?: string | null
  defaultOgImageUrl?: string | null
  fontBody: string
  fontHeading: string
  accentColor: string
  maxWidth: string
  buttonStyle: string
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    tiktok?: string
    linkedin?: string
    youtube?: string
  }
  updatedAt: string
}

// Mock data storage
export const mockRetailers: Retailer[] = [
  { id: 1, name: "Amazon", slug: "amazon", iconUrl: null, isActive: true },
  { id: 2, name: "Lulu", slug: "lulu", iconUrl: null, isActive: true },
  { id: 3, name: "Google Books", slug: "google-books", iconUrl: null, isActive: true },
]

export const mockBookRetailerLinks: BookRetailerLink[] = [
  { bookId: 1, retailerId: 1, url: "https://amazon.com/book", formatType: "ebook", isActive: true },
]

export const mockBooks: Book[] = [
  {
    id: 1,
    slug: "sample-book",
    title: "Sample Book Title",
    subtitle1: "An exploration of healing and growth",
    subtitle2: "A guide for integration",
    tagsCsv: "Self-Help, Psychology, Integration",
    isbn: "978-0-123456-78-9",
    copyright: "© 2025 Maya Allan",
    blurb: "This is a sample book description. Replace this with actual book content once your database is configured.",
    coverUrl: null,
    backCoverUrl: null,
    ebookFileUrl: null,
    isPublished: false, // Draft by default
    isVisible: false, // Hidden by default
    isComingSoon: false,
    allowDirectSale: false,
    stripePaymentLink: null,
    paypalPaymentLink: null,
    seoTitle: null,
    seoDescription: null,
    ogImageUrl: null,
    publishedAt: null, // No publish date until explicitly published
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockMedia: MediaItem[] = [
  {
    id: 1,
    kind: "audio",
    slug: "sample-audio",
    title: "Sample Audio Guide",
    description: "A sample audio guide for meditation and reflection",
    coverUrl: null,
    fileUrl: null,
    externalUrl: null,
    isbn: null,
    isPublished: false, // Draft by default
    isVisible: false, // Hidden by default
    seoTitle: null,
    seoDescription: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockEvents: Event[] = [
  {
    id: 1,
    slug: "sample-event",
    title: "Sample Book Reading",
    description: "Join us for a discussion about integration and transformation",
    startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: null,
    locationText: "Online Event",
    locationUrl: null,
    photoUrls: [],
    isPublished: false, // Draft by default
    isVisible: false, // Hidden by default
    keepVisibleAfterEnd: false,
    seoTitle: null,
    seoDescription: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockContactSubmissions: ContactSubmission[] = []

export const mockEmailSubscribers: EmailSubscriber[] = []

export const mockNavigationItems: NavigationItem[] = [
  { id: 1, label: "Books", href: "/books", order: 1, isVisible: true },
  { id: 2, label: "Articles", href: "/articles", order: 2, isVisible: true },
  { id: 3, label: "Events", href: "/events", order: 3, isVisible: true },
  { id: 4, label: "Media", href: "/media", order: 4, isVisible: true },
  { id: 5, label: "About", href: "/about", order: 5, isVisible: true },
  { id: 6, label: "Contact", href: "/contact", order: 6, isVisible: true },
  { id: 7, label: "Legal", href: "/legal", order: 7, isVisible: true },
]

export const mockSiteSettings: SiteSettings = {
  id: 1,
  siteTitle: "Maya Allan",
  siteDescription: "Author of books on integration, self-agency, and personal transformation",
  authorPhotoUrl: null,
  defaultOgImageUrl: null,
  fontBody: "serif",
  fontHeading: "serif",
  accentColor: "#0f172a",
  maxWidth: "max-w-6xl",
  buttonStyle: "rounded",
  socialLinks: {
    facebook: "https://facebook.com/mayaallan",
    twitter: "https://twitter.com/mayaallan",
    instagram: "https://instagram.com/mayaallan",
    tiktok: "https://tiktok.com/@mayaallan",
    linkedin: "https://linkedin.com/in/mayaallan",
    youtube: "https://youtube.com/@mayaallan",
  },
  updatedAt: new Date().toISOString(),
}

// Query functions
export async function getAllRetailers(): Promise<Retailer[]> {
  return mockRetailers
}

export async function getActiveRetailers(): Promise<Retailer[]> {
  return mockRetailers.filter((r) => r.isActive)
}

export async function getAllBooks(): Promise<Book[]> {
  return mockBooks
}

export async function getPublishedBooks(): Promise<Book[]> {
  return mockBooks.filter((book) => book.isPublished && book.isVisible)
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  return mockBooks.find((book) => book.slug === slug) || null
}

export async function getBookRetailerLinks(bookId: number): Promise<BookRetailerLink[]> {
  return mockBookRetailerLinks.filter((link) => link.bookId === bookId && link.isActive)
}

export async function getAllMedia(): Promise<MediaItem[]> {
  return mockMedia
}

export async function getVisibleMedia(): Promise<MediaItem[]> {
  return mockMedia.filter((item) => item.isPublished && item.isVisible)
}

export async function getMediaById(id: number): Promise<MediaItem | null> {
  return mockMedia.find((item) => item.id === id) || null
}

export async function getAllEvents(): Promise<Event[]> {
  return mockEvents
}

export async function getVisibleEvents(): Promise<Event[]> {
  const now = new Date()
  return mockEvents.filter((event) => {
    if (!event.isPublished || !event.isVisible) return false
    const eventEnd = event.endsAt ? new Date(event.endsAt) : new Date(event.startsAt)
    if (eventEnd < now && !event.keepVisibleAfterEnd) return false
    return true
  })
}

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  return mockContactSubmissions
}

export async function getAllEmailSubscribers(): Promise<EmailSubscriber[]> {
  return mockEmailSubscribers
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return mockSiteSettings
}

export async function getAllNavigationItems(): Promise<NavigationItem[]> {
  return mockNavigationItems.sort((a, b) => a.order - b.order)
}

export async function getVisibleNavigationItems(): Promise<NavigationItem[]> {
  return mockNavigationItems.filter((item) => item.isVisible).sort((a, b) => a.order - b.order)
}

export async function getComingSoonBooks(): Promise<Book[]> {
  return mockBooks.filter((book) => book.isVisible && book.isComingSoon && !book.isPublished)
}

// Mutation functions (simulate database operations)
export async function createBook(data: Omit<Book, "id" | "createdAt" | "updatedAt">): Promise<Book> {
  const newBook: Book = {
    ...data,
    id: mockBooks.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockBooks.push(newBook)
  return newBook
}

export async function updateBook(id: number, data: Partial<Book>): Promise<Book | null> {
  const index = mockBooks.findIndex((b) => b.id === id)
  if (index === -1) return null
  mockBooks[index] = { ...mockBooks[index], ...data, updatedAt: new Date().toISOString() }
  return mockBooks[index]
}

export async function deleteBook(id: number): Promise<boolean> {
  const index = mockBooks.findIndex((b) => b.id === id)
  if (index === -1) return false
  mockBooks.splice(index, 1)
  return true
}

export async function createMedia(data: Omit<MediaItem, "id" | "createdAt" | "updatedAt">): Promise<MediaItem> {
  const newMedia: MediaItem = {
    ...data,
    id: mockMedia.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockMedia.push(newMedia)
  return newMedia
}

export async function updateMedia(id: number, data: Partial<MediaItem>): Promise<MediaItem | null> {
  const index = mockMedia.findIndex((m) => m.id === id)
  if (index === -1) return null
  mockMedia[index] = { ...mockMedia[index], ...data, updatedAt: new Date().toISOString() }
  return mockMedia[index]
}

export async function deleteMedia(id: number): Promise<boolean> {
  const index = mockMedia.findIndex((m) => m.id === id)
  if (index === -1) return false
  mockMedia.splice(index, 1)
  return true
}

export async function createEvent(data: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> {
  const newEvent: Event = {
    ...data,
    id: mockEvents.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockEvents.push(newEvent)
  return newEvent
}

export async function updateEvent(id: number, data: Partial<Event>): Promise<Event | null> {
  const index = mockEvents.findIndex((e) => e.id === id)
  if (index === -1) return null
  mockEvents[index] = { ...mockEvents[index], ...data, updatedAt: new Date().toISOString() }
  return mockEvents[index]
}

export async function deleteEvent(id: number): Promise<boolean> {
  const index = mockEvents.findIndex((e) => e.id === id)
  if (index === -1) return false
  mockEvents.splice(index, 1)
  return true
}

export async function createContactSubmission(
  data: Omit<ContactSubmission, "id" | "createdAt">,
): Promise<ContactSubmission> {
  const newSubmission: ContactSubmission = {
    ...data,
    id: mockContactSubmissions.length + 1,
    createdAt: new Date().toISOString(),
  }
  mockContactSubmissions.push(newSubmission)
  return newSubmission
}

export async function createEmailSubscriber(email: string, source?: string): Promise<EmailSubscriber> {
  const existing = mockEmailSubscribers.find((s) => s.email === email)
  if (existing) return existing

  const newSubscriber: EmailSubscriber = {
    id: mockEmailSubscribers.length + 1,
    email,
    source: source || null,
    createdAt: new Date().toISOString(),
  }
  mockEmailSubscribers.push(newSubscriber)
  return newSubscriber
}

export async function createRetailer(data: Omit<Retailer, "id">): Promise<Retailer> {
  const newRetailer: Retailer = {
    ...data,
    id: mockRetailers.length + 1,
  }
  mockRetailers.push(newRetailer)
  return newRetailer
}

export async function updateRetailer(id: number, data: Partial<Retailer>): Promise<Retailer | null> {
  const index = mockRetailers.findIndex((r) => r.id === id)
  if (index === -1) return null
  mockRetailers[index] = { ...mockRetailers[index], ...data }
  return mockRetailers[index]
}

export async function createBookRetailerLink(data: BookRetailerLink): Promise<BookRetailerLink> {
  mockBookRetailerLinks.push(data)
  return data
}

export async function updateBookRetailerLink(
  bookId: number,
  retailerId: number,
  data: Partial<BookRetailerLink>,
): Promise<BookRetailerLink | null> {
  const index = mockBookRetailerLinks.findIndex((l) => l.bookId === bookId && l.retailerId === retailerId)
  if (index === -1) return null
  mockBookRetailerLinks[index] = { ...mockBookRetailerLinks[index], ...data }
  return mockBookRetailerLinks[index]
}

export async function deleteBookRetailerLink(bookId: number, retailerId: number): Promise<boolean> {
  const index = mockBookRetailerLinks.findIndex((l) => l.bookId === bookId && l.retailerId === retailerId)
  if (index === -1) return false
  mockBookRetailerLinks.splice(index, 1)
  return true
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  Object.assign(mockSiteSettings, { ...data, updatedAt: new Date().toISOString() })
  return mockSiteSettings
}

export async function updateNavigationItem(id: number, data: Partial<NavigationItem>): Promise<NavigationItem | null> {
  const index = mockNavigationItems.findIndex((n) => n.id === id)
  if (index === -1) return null
  mockNavigationItems[index] = { ...mockNavigationItems[index], ...data }
  return mockNavigationItems[index]
}

export async function createNavigationItem(data: Omit<NavigationItem, "id">): Promise<NavigationItem> {
  const newItem: NavigationItem = {
    ...data,
    id: mockNavigationItems.length + 1,
  }
  mockNavigationItems.push(newItem)
  return newItem
}

export async function deleteNavigationItem(id: number): Promise<boolean> {
  const index = mockNavigationItems.findIndex((n) => n.id === id)
  if (index === -1) return false
  mockNavigationItems.splice(index, 1)
  return true
}
