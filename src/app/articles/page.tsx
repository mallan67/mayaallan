import type { Metadata } from "next"

const SITE_URL = "https://www.mayaallan.com"

export const metadata: Metadata = {
  title: "Articles",
  description: "Read articles and insights from Maya Allan on integration, consciousness, and personal transformation.",
  alternates: {
    canonical: `${SITE_URL}/articles`,
  },
  openGraph: {
    title: "Articles - Maya Allan",
    description: "Articles and insights on integration, consciousness, and personal transformation.",
    url: `${SITE_URL}/articles`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Articles - Maya Allan",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles - Maya Allan",
    description: "Articles and insights on integration and transformation.",
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function ArticlesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-4">Articles</h1>
      <p className="text-sm text-slate-700">
        No articles published yet. Once Prisma and the admin are wired, this page will list your published articles and
        the Home page will show them conditionally.
      </p>
    </div>
  )
}
