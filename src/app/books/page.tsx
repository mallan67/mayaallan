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
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-8">
        Books
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.slug}`}
            className="group border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
          >
            {book.coverUrl && (
              <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded">
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-contain bg-slate-50"
                />
              </div>
            )}

            <h2 className="font-serif text-lg font-semibold group-hover:underline">
              {book.title}
            </h2>

            {book.subtitle1 && (
              <p className="mt-1 text-sm text-slate-600">
                {book.subtitle1}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
