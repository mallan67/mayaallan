import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Maya Allan | Author",
    template: "%s | Maya Allan",
  },
  description: "Official website of Maya Allan - Author, Speaker, and Wellness Advocate",
  keywords: ["Maya Allan", "author", "books", "wellness", "psilocybin", "integration"],
  authors: [{ name: "Maya Allan" }],
  creator: "Maya Allan",
  metadataBase: new URL("https://mayaallan.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mayaallan.com",
    siteName: "Maya Allan",
    title: "Maya Allan | Author",
    description: "Official website of Maya Allan - Author, Speaker, and Wellness Advocate",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maya Allan | Author",
    description: "Official website of Maya Allan - Author, Speaker, and Wellness Advocate",
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
  // Icons for all platforms
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  // PWA manifest
  manifest: "/manifest.json",
  // Additional compatibility
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* IE/Edge compatibility */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Ensure proper rendering on older browsers */}
        <meta name="renderer" content="webkit" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased font-sans">
        {/* Skip to content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
        
        <Header />
        
        <main id="main-content" className="flex-1">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  )
}
