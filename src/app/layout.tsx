import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { getVisibleNavigationItems, getSiteSettings } from "@/lib/mock-data"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export const metadata: Metadata = {
  metadataBase: new URL("https://mayaallan.com"),
  title: {
    default: "Maya Allan – Guide to Psilocybin Integration",
    template: "%s | Maya Allan",
  },
  description:
    "Guide to Psilocybin Integration – 40 Real Scenarios for Navigating What You See, Feel & Experience. Educational resources for psychedelic integration and inner transformation.",
  keywords: [
    "psilocybin integration",
    "psychedelic integration",
    "Maya Allan",
    "integration guide",
    "mental health",
    "consciousness",
    "self-development",
  ],
  authors: [{ name: "Maya Allan" }],
  creator: "Maya Allan",
  publisher: "Maya Allan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mayaallan.com",
    siteName: "Maya Allan",
    title: "Maya Allan – Guide to Psilocybin Integration",
    description: "Guide to Psilocybin Integration – 40 Real Scenarios for Navigating What You See, Feel & Experience.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maya Allan - Author",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maya Allan – Guide to Psilocybin Integration",
    description: "Guide to Psilocybin Integration – 40 Real Scenarios for Navigating What You See, Feel & Experience.",
    creator: "@mayaallan",
    images: ["/og-image.jpg"],
  },
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
  verification: {
    google: "your-google-site-verification-code",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://mayaallan.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-white text-slate-900 antialiased font-serif">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Maya Allan",
              url: "https://mayaallan.com",
              jobTitle: "Author",
              description: "Author focused on integration, self-agency, and inner transformation.",
              knowsAbout: ["Psychedelic Integration", "Mental Health", "Personal Development"],
              sameAs: [
                "https://linkedin.com/in/mayaallan",
                "https://instagram.com/mayaallan",
                "https://youtube.com/@mayaallan",
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}

async function Header() {
  const navItems = await getVisibleNavigationItems()

  return (
    <header className="border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-wide font-semibold">
          MAYA ALLAN
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} className="hover:opacity-70">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

async function Footer() {
  const settings = await getSiteSettings()
  const socialLinks = settings.socialLinks || {}

  return (
    <footer className="border-t border-slate-200 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>© {new Date().getFullYear()} Maya Allan. Informational only. No medical, legal or therapeutic advice.</div>
        <div className="flex items-center gap-3">
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {socialLinks.youtube && (
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          )}
          {socialLinks.facebook && (
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
