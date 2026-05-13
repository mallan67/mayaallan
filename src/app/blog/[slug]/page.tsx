import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { getPost, listPosts } from "@/lib/posts"

const SITE_URL = "https://www.mayaallan.com"

export const revalidate = 3600

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const posts = await listPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Post not found" }

  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    // Don't append "| Maya Allan" here — the root layout's title.template already does it.
    // Including it here produced "... | Maya Allan | Maya Allan" in the rendered <title>.
    title: post.title,
    description: post.subtitle,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.subtitle,
      url,
      siteName: "Maya Allan",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.subtitle,
    },
    alternates: {
      canonical: url,
    },
  }
}

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

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.subtitle,
    author: { "@type": "Person", name: post.author, url: SITE_URL },
    datePublished: post.date,
    publisher: {
      "@type": "Person",
      name: "Maya Allan",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <article className="bg-white min-h-[calc(100dvh-80px)] px-4 sm:px-8 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-2xl mx-auto">
        <nav className="mb-8 text-charcoal-soft/70 text-xs">
          <Link href="/blog" className="hover:text-liquid-blue transition-colors">
            ← All writing
          </Link>
        </nav>

        <header className="mb-8 sm:mb-10">
          <time className="text-charcoal-soft/70 text-xs uppercase tracking-wider">
            {formatDate(post.date)}
          </time>
          <h1 className="font-serif text-[clamp(1.6rem,4vw,2.5rem)] font-semibold text-charcoal tracking-[-0.02em] mt-2 mb-3 leading-tight">
            {post.title}
          </h1>
          <p className="text-charcoal-soft text-base sm:text-lg leading-relaxed">
            {post.subtitle}
          </p>
          <p className="text-charcoal-soft/60 text-xs mt-4">By {post.author}</p>
        </header>

        <div className="prose prose-charcoal max-w-none text-charcoal leading-[1.8] [&_h2]:font-serif [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-semibold [&_h2]:text-charcoal [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-charcoal [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-4 [&_p]:text-charcoal [&_p]:text-[0.95rem] [&_p]:sm:text-base [&_a]:text-liquid-blue [&_a]:underline hover:[&_a]:text-liquid-blue-bright [&_blockquote]:border-l-2 [&_blockquote]:border-liquid-blue/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-charcoal-soft [&_blockquote]:my-4 [&_strong]:text-charcoal [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1 [&_code]:bg-[#F5F7FA] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.9em] [&_hr]:my-8 [&_hr]:border-[#E8ECF0]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={{
              // Demote any markdown <h1> to <h2> — the page header already has the title <h1>.
              // Two <h1>s on a page is an SEO/AEO violation and breaks heading hierarchy for SR users.
              h1: (props) => <h2 {...props} />,
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        {post.tool_link && post.tool_name && (
          <aside className="mt-12 p-5 sm:p-6 rounded-2xl bg-[#F0F7FF]/40 border border-[#D6E8FA]/50">
            <p className="text-charcoal-soft text-sm mb-3">
              If this resonates, there&apos;s a free AI-guided companion for this
              kind of work on the site.
            </p>
            <Link
              href={post.tool_link.replace(SITE_URL, "") || "/tools"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-liquid-blue text-white font-medium text-sm hover:bg-liquid-blue-bright transition-colors"
            >
              Try the {post.tool_name} tool
            </Link>
          </aside>
        )}

        <footer className="mt-10 pt-6 border-t border-[#E8ECF0] text-charcoal-soft/70 text-xs">
          <p>
            This is a reflection aid, not therapy. If you&apos;re in crisis, please
            reach out to the <strong>988</strong> Suicide &amp; Crisis Lifeline.
          </p>
          <p className="mt-2">
            <Link href="/methods" className="hover:text-liquid-blue transition-colors">
              Methods &amp; Attributions
            </Link>
          </p>
        </footer>
      </div>
    </article>
  )
}
