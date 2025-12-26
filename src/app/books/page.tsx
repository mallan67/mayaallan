import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

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
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-8">Books</h1>

      {books.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No books have been published yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              className="block border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition"
            >
              <div className="relative w-full aspect-[2/3] bg-slate-50">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                    No Cover Image
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-lg font-semibold">{book.title}</h2>

                {book.subtitle1 && (
                  <p className="text-sm text-slate-600 mt-1">{book.subtitle1}</p>
                )}

                {book.blurb && (
                  <p className="text-sm text-slate-700 mt-3 line-clamp-3">
                    {book.blurb}
                  </p>
                )}

                {book.isComingSoon && (
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
