"use client"

import ImageUpload from "@/components/ImageUpload"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface RetailerLink {
  id?: number
  formatType: string
  retailerName: string
  url: string
  toDelete?: boolean
}

interface Book {
  id?: number
  slug: string
  title: string
  subtitle1: string | null
  subtitle2: string | null
  tagsCsv: string | null
  blurb: string | null
  coverUrl: string | null
  backCoverUrl: string | null
  ebookFileUrl: string | null

  hasEbook: boolean
  hasPaperback: boolean
  hasHardcover: boolean
  ebookPrice: number | null
  paperbackPrice: number | null
  hardcoverPrice: number | null

  isFeatured: boolean
  isPublished: boolean
  isVisible: boolean
  isComingSoon: boolean

  allowDirectSale: boolean
  allowRetailerSale: boolean
  stripePaymentLink: string | null
  paypalPaymentLink: string | null

  seoTitle: string | null
  seoDescription: string | null
}

const defaultBook: Book = {
  title: "",
  slug: "",
  subtitle1: null,
  subtitle2: null,
  tagsCsv: null,
  blurb: null,
  coverUrl: null,
  backCoverUrl: null,
  ebookFileUrl: null,

  hasEbook: true,
  hasPaperback: false,
  hasHardcover: false,
  ebookPrice: null,
  paperbackPrice: null,
  hardcoverPrice: null,

  isFeatured: false,
  isPublished: false,
  isVisible: false,
  isComingSoon: false,

  allowDirectSale: false,
  allowRetailerSale: false,
  stripePaymentLink: null,
  paypalPaymentLink: null,

  seoTitle: null,
  seoDescription: null,
}

const FORMAT_OPTIONS = [
  { value: "ebook", label: "Ebook" },
  { value: "paperback", label: "Paperback" },
  { value: "hardcover", label: "Hardcover" },
  { value: "audiobook", label: "Audiobook" },
]

export default function AdminBookForm({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)

  const [book, setBook] = useState<Book>(defaultBook)
  const [retailerLinks, setRetailerLinks] = useState<RetailerLink[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const s = params?.slug
    setSlug(s)
    setIsNew(s === "new")
  }, [params?.slug])

  useEffect(() => {
    if (slug === null) return

    if (slug === "new") {
      setBook(defaultBook)
      setRetailerLinks([])
      setLoading(false)
      return
    }

    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/admin/books/by-slug/${slug}`)
        if (!res.ok) throw new Error("Book not found")
        const data = await res.json()

        setBook({
          ...defaultBook,
          ...data,
          backCoverUrl: data.backCoverUrl ?? null,
        })

        if (Array.isArray(data.retailers)) {
          setRetailerLinks(
            data.retailers.map((r: any) => ({
              id: r.id,
              formatType: r.formatType || "ebook",
              retailerName: r.retailer?.name || "",
