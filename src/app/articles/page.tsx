import type { Metadata } from "next"
import Link from "next/link"
import { SITE_URL } from "@/lib/identity"

export const metadata: Metadata = {
  title: "Articles",
  description: "Long-form writing from Maya Allan — currently published on the blog.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  // Stub page: don't index. Articles live on /blog; this route exists for
  // anyone who guesses /articles directly. When dedicated articles content
  // ships, remove robots:noindex and update the copy.
  robots: { index: false, follow: true },
}

export default function ArticlesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 text-center">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-4">Articles</h1>
      <p className="text-sm text-slate-700 leading-relaxed">
        Long-form writing currently lives on the blog.{" "}
        <Link href="/blog" className="underline hover:text-slate-900">
          Read recent posts →
        </Link>
      </p>
    </div>
  )
}
