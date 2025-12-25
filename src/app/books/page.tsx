import Link from "next/link"
import Image from "next/image"
import { getPublishedBooks } from "@/lib/mock-data"
import { ShareButtons } from "@/components/share-buttons"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Books",
  description: "Explore books by Maya Allan on psychedelic integration, consciousness, and personal transformation.",
  openGraph: {
    title: "Books by Maya Allan",
    description: "Explore books on psychedelic integration, consciousness, and personal transformation.",
    url: "https://mayaallan.com/books",
  },
  twitter: {
    card: "summary_large_image",
    title: "Books by Maya Allan",
    description: "Explore books on psychedelic integration, consciousness, and personal transformation.",
  },
}

export default async function BooksPage() {
  const books = await getPublishedBooks()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">Books</h1>
        <ShareButtons
          url="https://mayaallan.com/books"
          title="Books by Maya Allan"
          description="Explore books on psychedelic integration, consciousness, and personal transformation."
        />
      </div>

      {books.length === 0 ? (
        <p className="text-sm text-slate-700">No books published yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              {book.coverUrl && (
                <div className="relative w-full h-64 mb-4">
                  <Image
                    src={book.coverUrl || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <h2 className="font-serif text-lg font-semibold mb-2">{book.title}</h2>
              {book.subtitle1 && <p className="text-sm text-slate-600 mb-2">{book.subtitle1}</p>}
              {book.blurb && <p className="text-sm text-slate-700 mb-4 line-clamp-3">{book.blurb}</p>}

              <div className="mb-3 pt-3 border-t border-slate-100">
                <ShareButtons
                  url={`https://mayaallan.com/books/${book.slug}`}
                  title={book.title}
                  description={book.blurb ?? book.subtitle1 ?? undefined}
                  className="justify-center md:justify-start"
                />
              </div>

              <Link href={`/books/${book.slug}`} className="text-sm font-semibold text-black hover:underline">
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
