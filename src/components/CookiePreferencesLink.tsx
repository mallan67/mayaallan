"use client"

import { reopenConsent } from "@/components/ConsentBanner"

export default function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={reopenConsent}
      className="text-[0.95rem] text-white/70 hover:text-white py-1.5 transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
    >
      Cookie preferences
    </button>
  )
}
