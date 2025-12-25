"use client"

import { Facebook, Linkedin, Mail, Twitter, Link2, MessageCircle } from "lucide-react"
import { useState } from "react"

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
  className?: string
}

export function ShareButtons({ url, title, description, hashtags, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}${hashtags ? `&hashtags=${hashtags.join(",")}` : ""}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Share:</span>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-slate-100 transition"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4 text-slate-600" />
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-slate-100 transition"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="w-4 h-4 text-slate-600" />
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-slate-100 transition"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4 text-slate-600" />
      </a>

      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-slate-100 transition"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 text-slate-600" />
      </a>

      <a
        href={shareLinks.email}
        className="p-2 rounded-full hover:bg-slate-100 transition"
        aria-label="Share via Email"
      >
        <Mail className="w-4 h-4 text-slate-600" />
      </a>

      <button
        onClick={copyToClipboard}
        className="p-2 rounded-full hover:bg-slate-100 transition relative"
        aria-label="Copy link"
      >
        <Link2 className="w-4 h-4 text-slate-600" />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
    </div>
  )
}
