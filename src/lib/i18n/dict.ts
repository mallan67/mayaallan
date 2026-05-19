import "server-only"
import type { Locale } from "@/lib/identity"
import { DEFAULT_LOCALE, LOCALES } from "@/lib/identity"

// =============================================================================
// Translation dictionary loader (server-only).
// =============================================================================
// Dictionaries live as JSON files under src/lib/i18n/dictionaries/{locale}.json.
// They are loaded on-demand server-side so the bundle only ships the strings
// the current page actually needs.
//
// Adding a new translated string:
//   1. Add the key + English copy to dictionaries/en.json
//   2. Add the translated copy to es.json, pt.json, de.json, fr.json, he.json
//   3. Use it in a server component via:
//        const dict = await getDictionary("es")
//        dict.nav.home
//
// Missing keys fall back to the English value at runtime (logged once) so a
// half-translated dictionary still ships a usable page instead of "undefined".
// =============================================================================

export type DictionaryShape = {
  nav: {
    home: string
    about: string
    books: string
    scenarios: string
    integration: string
    blog: string
    events: string
    contact: string
  }
  cta: {
    seeTheBook: string
    readMore: string
    learnMore: string
    tryItFree: string
    buyNow: string
    contactMe: string
    subscribe: string
  }
  footer: {
    rights: string
    builtBy: string
    privacyPolicy: string
    terms: string
    languageSwitcher: string
  }
  home: {
    heroTitle: string
    heroSubtitle: string
    heroCta: string
    aboutHeadline: string
    aboutLead: string
    aboutBody: string
    booksHeadline: string
    integrationHeadline: string
    integrationBody: string
  }
  about: {
    title: string
    lead: string
    body: string[]
  }
}

// Lazy-loaded cache: dictionaries are JSON, so we cache the parsed object per
// locale to avoid re-reading + re-parsing on every request.
const cache = new Map<Locale, DictionaryShape>()

let warnedMissingKeys = new Set<string>()

async function loadJson(locale: Locale): Promise<DictionaryShape> {
  // Dynamic import — Next.js bundles each locale separately and only loads
  // the one requested. The `with` syntax is the spec-compliant JSON import.
  const mod = await import(`./dictionaries/${locale}.json`)
  return mod.default as DictionaryShape
}

/**
 * Get the full dictionary for a locale. Falls back to English if the locale
 * isn't recognized or its dictionary file fails to load.
 */
export async function getDictionary(locale: Locale): Promise<DictionaryShape> {
  if (!LOCALES.includes(locale)) {
    locale = DEFAULT_LOCALE
  }
  const cached = cache.get(locale)
  if (cached) return cached

  try {
    const dict = await loadJson(locale)
    cache.set(locale, dict)
    return dict
  } catch (err) {
    if (locale !== DEFAULT_LOCALE) {
      console.warn(`[i18n] Failed to load ${locale} dictionary, falling back to ${DEFAULT_LOCALE}:`, err)
      return getDictionary(DEFAULT_LOCALE)
    }
    throw err
  }
}

/**
 * Type-safe key lookup with English fallback.
 * Use when you want to handle missing translations gracefully at the call
 * site (e.g., for newly-added strings before all locales are updated).
 */
export function pick<T>(
  dict: DictionaryShape,
  path: string,
  fallback: T,
  locale: Locale = DEFAULT_LOCALE
): T {
  const value = path.split(".").reduce<any>((acc, key) => acc?.[key], dict)
  if (value === undefined || value === null) {
    const warningKey = `${locale}:${path}`
    if (!warnedMissingKeys.has(warningKey)) {
      warnedMissingKeys.add(warningKey)
      console.warn(`[i18n] Missing translation: ${warningKey} — using fallback`)
    }
    return fallback
  }
  return value as T
}
