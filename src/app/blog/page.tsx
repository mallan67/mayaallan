import type { Metadata } from "next"
import Link from "next/link"
import { listPosts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Blog — Research-backed writing on belief work, nervous system regulation, and integration | Maya Allan",
  description:
    "Essays by Maya Allan on belief systems, inherited patterns, somatic regulation, and psilocybin integration — drawing on IFS, Clean Language, Coherence Therapy, and memory reconsolidation research.",
  openGraph: {
    title: "Blog — Maya Allan",
    description: "Research-backed writing on belief work and integration.",
    url: "https://www.mayaallan.com/blog",
    siteName: "Maya Allan",
    type: "website",
  },
}

export const revalidate = 3600

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

export default async function BlogIndexPage() {
  const posts = await listPosts()

  return (
    <div className="bg-white min-h-[calc(100dvh-80px)] px-4 sm:px-8 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.75rem)] font-semibold text-charcoal tracking-[-0.02em] mb-4">
            Writing
          </h1>
          <p className="text-charcoal-soft text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Research-backed essays on belief systems, nervous system regulation,
            and integration. Drawing on Internal Family Systems, Clean Language,
            Coherence Therapy, and memory reconsolidation research.
          </p>
        </header>

        {posts.length === 0 && (
          <p className="text-charcoal-soft text-center py-16">
            No posts yet. Check back soon.
          </p>
        )}

        <ul className="space-y-6 sm:space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block group p-5 sm:p-6 rounded-2xl bg-white border border-[#E8ECF0] hover:border-liquid-blue/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-all"
              >
                <time className="text-charcoal-soft/70 text-xs uppercase tracking-wider">
                  {formatDate(post.date)}
                </time>
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-charcoal group-hover:text-liquid-blue transition-colors mt-1 mb-2">
                  {post.title}
                </h2>
                <p className="text-charcoal-soft text-sm sm:text-base leading-relaxed">
                  {post.subtitle}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
