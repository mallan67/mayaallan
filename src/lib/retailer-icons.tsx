"use client"

import {
  ShoppingCart,
  BookOpen,
  Smartphone,
  Apple,
  Chrome,
  Headphones,
  ExternalLink,
} from "lucide-react"

interface RetailerIconProps {
  name: string
  className?: string
}

export function RetailerIcon({ name, className = "w-5 h-5" }: RetailerIconProps) {
  const lowerName = name?.toLowerCase() || ""

  if (lowerName.includes("amazon") || lowerName.includes("kindle")) {
    return <ShoppingCart className={className} />
  }
  if (lowerName.includes("lulu")) {
    return <BookOpen className={className} />
  }
  if (lowerName.includes("barnes") || lowerName.includes("noble") || lowerName.includes("b&n")) {
    return <BookOpen className={className} />
  }
  if (lowerName.includes("kobo")) {
    return <Smartphone className={className} />
  }
  if (lowerName.includes("apple")) {
    return <Apple className={className} />
  }
  if (lowerName.includes("google")) {
    return <Chrome className={className} />
  }
  if (lowerName.includes("audible")) {
    return <Headphones className={className} />
  }

  return <ExternalLink className={className} />
}
