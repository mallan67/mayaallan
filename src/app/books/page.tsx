import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
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

export const dynamic = "force-dynamic"

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    where: {
      isPublished: true,
      isVisible: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-8">Books</h1>
      
      {books.length === 0 ? (
        <p className="text-sm text-slate-700">No books published yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <div key={book.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              {book.coverUrl && (
                <Link href={`/books/${book.slug}`}>
                  <div className="relative w-full h-80 bg-slate-50">
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </Link>
              )}
              <div className="p-4">
                <Link href={`/books/${book.slug}`}>
                  <h2 className="font-serif text-xl font-semibold mb-2 hover:text-slate-600">{book.title}</h2>
                </Link>
                {book.subtitle1 && <p className="text-sm text-slate-600 mb-2">{book.subtitle1}</p>}
                {book.blurb && <p className="text-sm text-slate-700 mb-4 line-clamp-3">{book.blurb}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Link href={`/books/${book.slug}`} className="text-sm font-semibold text-black hover:underline">
                    Learn More →
                  </Link>
                  <ShareButtons
                    url={`https://mayaallan.com/books/${book.slug}`}
                    title={book.title}
                    description={book.blurb ?? book.subtitle1 ?? undefined}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
