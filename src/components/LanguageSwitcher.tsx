"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE, type Locale } from "@/lib/identity"

// =============================================================================
// LanguageSwitcher — drop into the header or footer.
// =============================================================================
// Strategy: for each supported locale, build the URL where this same page
// exists in that language. For non-translated pages (e.g., individual book
// pages — currently only English), the switch points back to the locale root
// rather than 404'ing.
//
// USAGE:
//   import { LanguageSwitcher } from "@/components/LanguageSwitcher"
//   <LanguageSwitcher />
// =============================================================================

// Pages that have translated versions. Add new translated routes here as they
// ship — anything not in this list will route a language switch back to the
// locale's home page rather than a missing translated subpage.
const TRANSLATED_ROUTES = new Set(["/", "/about"])

function detectCurrentLocale(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0]
  if ((LOCALES as readonly string[]).includes(first || "")) {
    return first as Locale
  }
  return DEFAULT_LOCALE
}

function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  const first = segments[0]
  if ((LOCALES as readonly string[]).includes(first || "")) {
    segments.shift()
  }
  return "/" + segments.join("/")
}

function buildHrefForLocale(pathname: string, target: Locale): string {
  const basePath = stripLocalePrefix(pathname)
  const isTranslated = TRANSLATED_ROUTES.has(basePath)

  // English routes live at the root, no prefix.
  if (target === DEFAULT_LOCALE) {
    return isTranslated ? basePath : "/"
  }
  // Non-English: prefix the path with the locale, OR fall back to the locale
  // home page if the current route isn't translated.
  if (isTranslated) {
    return basePath === "/" ? `/${target}` : `/${target}${basePath}`
  }
  return `/${target}`
}

export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/"
  const current = detectCurrentLocale(pathname)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
      >
        <span aria-hidden>🌐</span>
        <span>{LOCALE_LABELS[current].native}</span>
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white shadow-lg py-1"
          // Always render the dropdown LTR for predictable alignment, even in
          // Hebrew. Language names are still in their native script.
          dir="ltr"
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                href={buildHrefForLocale(pathname, l)}
                onClick={() => setOpen(false)}
                className={`block px-3 py-1.5 hover:bg-slate-50 ${
                  l === current ? "font-semibold text-slate-900" : "text-slate-700"
                }`}
                hrefLang={LOCALE_LABELS[l].hreflang}
              >
                {LOCALE_LABELS[l].native}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
