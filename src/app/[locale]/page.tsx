import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LOCALES, LOCALE_LABELS, SITE_URL, AUTHOR_NAME, type Locale } from "@/lib/identity"
import { getDictionary } from "@/lib/i18n/dict"

// =============================================================================
// Translated home page — one served per non-English locale.
// =============================================================================

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  if (!(LOCALES as readonly string[]).includes(rawLocale) || rawLocale === "en") {
    return { title: "Not found" }
  }
  const locale = rawLocale as Locale
  const dict = await getDictionary(locale)
  const url = `${SITE_URL}/${locale}`

  // hreflang alternates point search engines at every translation of this page,
  // including the canonical English version at root. x-default points to the
  // English version per Google's recommendation for international SEO.
  const languages: Record<string, string> = { "x-default": SITE_URL }
  for (const l of LOCALES) {
    languages[LOCALE_LABELS[l].hreflang] = l === "en" ? SITE_URL : `${SITE_URL}/${l}`
  }

  return {
    title: `${AUTHOR_NAME} — ${dict.home.heroTitle}`,
    description: dict.home.heroSubtitle,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: dict.home.heroTitle,
      description: dict.home.heroSubtitle,
      url,
      siteName: AUTHOR_NAME,
      locale: LOCALE_LABELS[locale].ogLocale,
      type: "website",
    },
  }
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params
  if (!(LOCALES as readonly string[]).includes(rawLocale) || rawLocale === "en") {
    notFound()
  }
  const locale = rawLocale as Locale
  const dict = await getDictionary(locale)
  const dir = LOCALE_LABELS[locale].dir

  // For RTL locales we align text-start which Tailwind respects via the
  // [dir] attribute on <html>. No special class needed when using logical
  // properties; the layout handles it.
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20" dir={dir}>
      {/* Hero */}
      <section className="mb-20">
        <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.1] text-slate-900">
          {dict.home.heroTitle}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl">
          {dict.home.heroSubtitle}
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/books/psilocybin-integration-guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            {dict.home.heroCta}
          </Link>
          <Link
            href="/integration"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            {dict.cta.tryItFree}
          </Link>
        </div>
      </section>

      {/* About preview */}
      <section className="mb-20">
        <h2 className="font-serif text-3xl font-semibold text-slate-900 mb-4">
          {dict.home.aboutHeadline}
        </h2>
        <p className="text-lg text-slate-700 font-medium mb-3">{dict.home.aboutLead}</p>
        <p className="text-slate-600 leading-relaxed max-w-3xl">{dict.home.aboutBody}</p>
        <Link
          href={`/${locale}/about`}
          className="mt-4 inline-block text-blue-700 underline hover:text-blue-900"
        >
          {dict.cta.readMore} →
        </Link>
      </section>

      {/* Integration tool */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#F0F7FF]/40 border border-[#D6E8FA]/50">
        <h2 className="font-serif text-2xl font-semibold text-slate-900 mb-3">
          {dict.home.integrationHeadline}
        </h2>
        <p className="text-slate-700 leading-relaxed mb-5">{dict.home.integrationBody}</p>
        <Link
          href="/integration"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          {dict.cta.tryItFree}
        </Link>
      </section>
    </div>
  )
}
