import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Fraunces } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ConsentBanner from "@/components/ConsentBanner"
import { GatedAnalytics, GatedMarketing } from "@/components/AnalyticsGated"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/structured-data"
import { DEFAULT_LOCALE, LOCALE_LABELS, LOCALES, type Locale, SITE_URL } from "@/lib/identity"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const revalidate = 300 // Revalidate every 5 minutes

async function getSiteSettings() {
  try {
    const { data: settings } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("siteName, tagline, siteIconUrl")
      .limit(1)
      .single()
    return settings
  } catch (error) {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  const siteName = settings?.siteName || "Maya Allan"
  const description = settings?.tagline || "Official website of Maya Allan - Author, Speaker, and Wellness Advocate"

  // Build icons array - use custom icon if available, otherwise use defaults
  const icons: Metadata["icons"] = {
    icon: settings?.siteIconUrl
      ? [{ url: settings.siteIconUrl, type: "image/png" }]
      : [
          { url: "/icon.svg", type: "image/svg+xml" },
          { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
        ],
    apple: settings?.siteIconUrl
      ? [{ url: settings.siteIconUrl }]
      : [{ url: "/apple-icon.png" }],
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteName} | Author`,
      template: `%s | ${siteName}`,
    },
    description,
    icons,
    authors: [{ name: "Maya Allan", url: SITE_URL }],
    creator: "Maya Allan",
    publisher: "Maya Allan",
    keywords: [
      "Maya Allan",
      "author",
      "books",
      "psilocybin integration",
      "mushroom guide",
      "psychedelic integration",
      "integration guide",
      "practitioners",
      "healers",
      "facilitators",
      "psychedelic guides",
      "solo journey",
      "mushroom experiences",
      "psilocybin therapy",
      "psychedelic healing",
      "inner transformation",
      "self-agency",
      "wellness",
      "consciousness",
      "plant medicine",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName,
      title: siteName,
      description,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: siteName,
          type: "image/png",
        },
      ],
    },
    // X (formerly Twitter) card metadata - object name must be "twitter" per meta tag spec
    twitter: {
      card: "summary_large_image",
      site: "@mayaallan", // X handle
      creator: "@mayaallan", // X handle
      title: siteName,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
    alternates: {
      canonical: SITE_URL,
    },
    // ---------------------------------------------------------------------
    // Search engine ownership verification.
    // ---------------------------------------------------------------------
    // Each search engine wants a meta tag with a short code to verify you
    // own the domain. After verifying, you get access to indexing stats,
    // submission, crawl errors, etc. Paste the codes into env vars and
    // they appear in <head> automatically. Empty vars are silently omitted.
    //
    // Where to get each code:
    //   GOOGLE_SITE_VERIFICATION  — search.google.com/search-console → Add property → HTML tag method
    //   BING_SITE_VERIFICATION     — bing.com/webmasters → Add site → HTML Meta tag
    //   YANDEX_VERIFICATION        — webmaster.yandex.com → Add site → Meta tag
    //   PINTEREST_VERIFICATION     — pinterest.com/business → Claim website → HTML tag
    //   FACEBOOK_DOMAIN_VERIFICATION — business.facebook.com → Brand Safety → Domains
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION && { google: process.env.GOOGLE_SITE_VERIFICATION }),
      ...(process.env.YANDEX_VERIFICATION && { yandex: process.env.YANDEX_VERIFICATION }),
      // `other` accepts arbitrary <meta name="..." content="..."> tags. We
      // use it for Bing, Pinterest, and Facebook which don't have first-class
      // Next.js Metadata API support yet.
      other: {
        ...(process.env.BING_SITE_VERIFICATION && { "msvalidate.01": process.env.BING_SITE_VERIFICATION }),
        ...(process.env.PINTEREST_VERIFICATION && { "p:domain_verify": process.env.PINTEREST_VERIFICATION }),
        ...(process.env.FACEBOOK_DOMAIN_VERIFICATION && {
          "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION,
        }),
      },
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteSchema = generateWebSiteSchema()
  const organizationSchema = generateOrganizationSchema()

  // Locale + direction are detected in middleware.ts and passed in via the
  // x-locale header. Layouts can't see params from nested [locale] routes, so
  // the header is the cleanest way to set <html lang> + <html dir> correctly
  // for Hebrew (rtl) and the LTR locales. Defaults to English if anything's
  // off (e.g., middleware skipped a static asset).
  const headersList = await headers()
  const rawLocale = headersList.get("x-locale") ?? DEFAULT_LOCALE
  const locale = (LOCALES as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : DEFAULT_LOCALE
  const dir = LOCALE_LABELS[locale].dir

  return (
    <html lang={locale} dir={dir} className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
      <head>
        {/* Preconnect to image origins so cache-miss image requests don't pay the TLS handshake cost. */}
        <link rel="preconnect" href="https://yaqhbuvjnaq0ur0v.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://yaqhbuvjnaq0ur0v.public.blob.vercel-storage.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-charcoal antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-charcoal focus:text-white focus:rounded-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-gold"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Analytics + attribution gated by user consent (GDPR/ePrivacy).
            Banner shows on first visit; choice persists in localStorage.
            Users can revisit via the "Cookie preferences" link in the footer. */}
        <ConsentBanner />
        <GatedAnalytics />
        <GatedMarketing />
      </body>
    </html>
  )
}
