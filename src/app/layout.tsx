import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/structured-data"

const SITE_URL = "https://www.mayaallan.com"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
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
    keywords: ["Maya Allan", "author", "books", "wellness", "integration", "self-agency", "transformation"],
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteSchema = generateWebSiteSchema()
  const organizationSchema = generateOrganizationSchema()

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
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
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
