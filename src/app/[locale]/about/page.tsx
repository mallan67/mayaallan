import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { LOCALES, LOCALE_LABELS, SITE_URL, AUTHOR_NAME, type Locale } from "@/lib/identity"
import { getDictionary } from "@/lib/i18n/dict"
import { generateAuthorSchema } from "@/lib/structured-data"

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
  const url = `${SITE_URL}/${locale}/about`

  const languages: Record<string, string> = { "x-default": `${SITE_URL}/about` }
  for (const l of LOCALES) {
    languages[LOCALE_LABELS[l].hreflang] = l === "en" ? `${SITE_URL}/about` : `${SITE_URL}/${l}/about`
  }

  return {
    title: dict.about.title,
    description: dict.about.lead,
    alternates: { canonical: url, languages },
    openGraph: {
      title: dict.about.title,
      description: dict.about.lead,
      url,
      type: "profile",
      locale: LOCALE_LABELS[locale].ogLocale,
    },
  }
}

export default async function LocalizedAboutPage({ params }: PageProps) {
  const { locale: rawLocale } = await params
  if (!(LOCALES as readonly string[]).includes(rawLocale) || rawLocale === "en") {
    notFound()
  }
  const locale = rawLocale as Locale
  const dict = await getDictionary(locale)
  const dir = LOCALE_LABELS[locale].dir

  const authorSchema = generateAuthorSchema(SITE_URL, dict.about.lead)

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-16" dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-slate-900">
        {dict.about.title}
      </h1>
      <p className="mt-6 text-lg md:text-xl text-slate-700 font-medium leading-relaxed">
        {dict.about.lead}
      </p>

      <div className="mt-10 space-y-6 text-slate-700 leading-relaxed
          [&_em]:italic [&_strong]:font-semibold [&_strong]:text-slate-900">
        {dict.about.body.map((para, i) => (
          <ReactMarkdown key={i}>{para}</ReactMarkdown>
        ))}
      </div>

      <p className="mt-12 text-xs text-slate-500">
        {AUTHOR_NAME} · {LOCALE_LABELS[locale].native}
      </p>
    </article>
  )
}
