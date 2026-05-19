import { notFound } from "next/navigation"
import { LOCALES, type Locale } from "@/lib/identity"

// =============================================================================
// /[locale]/* — non-English locale routes.
// =============================================================================
// The dynamic [locale] segment matches /es, /pt, /de, /fr, /he. Anything else
// is 404'd here so we don't accidentally render pages with locale="about".
//
// Note: the root <html lang/dir> attributes are set by src/app/layout.tsx
// reading the x-locale header set by middleware. This nested layout doesn't
// need to touch <html>; it just guards the route.
// =============================================================================

export const dynamicParams = false

export function generateStaticParams() {
  // Pre-render every supported locale EXCEPT the default (English serves at
  // root paths, not at /en/*).
  return LOCALES.filter((l) => l !== "en").map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!(LOCALES as readonly string[]).includes(locale) || locale === "en") {
    notFound()
  }
  return children
}
