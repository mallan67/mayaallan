import { notFound } from "next/navigation"
import Link from "next/link"
import { getBookBySlug } from "@/lib/mock-data"
import { generateBookSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"

type BookPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BookPageProps) {
  const { slug } = await params
  const book = await getBookBySlug(slug)

  if (!book) {
    return {
      title: "Book Not Found",
    }
  }

  return {
    title: book.seoTitle || book.title,
    description: book.seoDescription || book.shortBlurb || "",
    openGraph: {
      title: book.seoTitle || book.title,
      description: book.seoDescription || book.shortBlurb || "",
      images: book.ogImageUrl ? [book.ogImageUrl] : book.coverUrl ? [book.coverUrl] : [],
    },
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const book = await getBookBySlug(slug)

  if (!book) return notFound()

  const structuredData = generateBookSchema(book)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="mb-6">
        <Link href="/books" className="text-sm text-slate-600 hover:text-black transition">
          ← Back to Books
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <div className="w-full aspect-[2/3] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500">
              No Cover Image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold">{book.title}</h1>

          {book.subtitle1 && <p className="text-lg text-slate-700 mt-2">{book.subtitle1}</p>}
          {book.subtitle2 && <p className="text-lg text-slate-700 mt-1">{book.subtitle2}</p>}

          {book.shortBlurb && <p className="text-slate-700 mt-4 leading-relaxed">{book.shortBlurb}</p>}

          {book.isComingSoon && (
            <div className="mt-6 inline-flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
              Coming Soon
            </div>
          )}

          {(book.allowDirectSale || book.stripePaymentLink || book.paypalPaymentLink) && (
            <div className="mt-8 space-y-3">
              {book.stripePaymentLink && (
                <a
                  href={book.stripePaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-3 text-sm font-semibold text-center border-2 border-black bg-black text-white rounded-full hover:bg-black/80 transition"
                >
                  Buy with Stripe
