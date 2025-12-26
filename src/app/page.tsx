import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { ShareButtons } from "@/components/share-buttons"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const publishedBooks = await prisma.book.findMany({
    where: { isPublished: true, isVisible: true },
    orderBy: { createdAt: "desc" },
  })

  const publishedEvents = await prisma.event.findMany({
    where: { isPublished: true, isVisible: true },
    orderBy: { startsAt: "asc" },
    take: 2,
  })

  const publishedMedia = await prisma.mediaItem.findMany({
    where: { isPublished: true, isVisible: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  })

  const mainBook = publishedBooks[0]
  const hasEvents = publishedEvents.length > 0
  const hasMedia = publishedMedia.length > 0

  return (
    <div className="pb-10">
      {mainBook && (
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center md:justify-start">
            {mainBook.coverUrl ? (
              <div className="relative w-48 md:w-64 aspect-[2/3] border border-slate-200 shadow-md rounded-md overflow-hidden">
                <Image
                  src={mainBook.coverUrl}
                  alt={mainBook.title}
                  fill
                  className="object-contain bg-slate-50"
                />
              </div>
            ) : (
              <div className="w-48 md:w-64 aspect-[2/3] border border-slate-200 shadow-md rounded-md flex items-center justify-center bg-slate-50">
                <div className="text-center px-4">
                  <div className="font-serif font-semibold text-sm tracking-wide uppercase">{mainBook.title}</div>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">New Release</p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
              {mainBook.title}
            </h1>
            {mainBook.subtitle1 && (
              <p className="mt-3 font-serif text-base md:text-lg text-slate-700">{mainBook.subtitle1}</p>
            )}
            {mainBook.subtitle2 && <p className="mt-2 font-serif text-base text-slate-600">{mainBook.subtitle2}</p>}

            {mainBook.tagsCsv && (
              <div className="mt-4 text-sm text-slate-600">
                <p>{mainBook.tagsCsv}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {mainBook.isComingSoon ? (
                <span className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full">
                  Coming Soon
                </span>
              ) : (
                <Link
                  href={`/books/${mainBook.slug}`}
                  className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full hover:bg-black/60 transition"
                >
                  View Book
                </Link>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <ShareButtons
                url={`https://mayaallan.com/books/${mainBook.slug}`}
                title={mainBook.title}
                description={mainBook.blurb ?? mainBook.subtitle1 ?? undefined}
                hashtags={mainBook.tagsCsv?.split(",").map((t) => t.trim())}
              />
            </div>
          </div>
        </section>
      )}

      {mainBook?.blurb && (
        <section className="border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-4">About the Book</h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-700">{mainBook.blurb}</p>
          </div>
        </section>
      )}

      {hasEvents && (
        <section className="border-t border-slate-200" id="events">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl md:text-2xl font-semibold">Events</h2>
              <Link href="/events" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70">
                View all
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {publishedEvents.map((evt) => (
                <Link
                  key={evt.id}
                  href={`/events/${evt.slug}`}
                  className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition"
                >
                  <h3 className="font-serif text-lg font-semibold">{evt.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{new Date(evt.startsAt).toLocaleDateString()}</p>
                  {evt.description && <p className="mt-2 text-sm text-slate-700 line-clamp-2">{evt.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasMedia && (
        <section className="border-t border-slate-200" id="media">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl md:text-2xl font-semibold">Media – Music, Guides &amp; Videos</h2>
              <Link href="/media" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70">
                View all
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-slate-200" id="about">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-8 items-start">
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
              Author Photo
            </div>
          </div>
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-3">About Maya Allan</h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-700 mb-3">
              Maya Allan is an author focused on integration, self-agency, and inner transformation. Her work is
              strictly educational and reflective, helping readers think through their experiences without promising
              cures or outcomes.
            </p>
            <Link href="/about" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70">
              Read full bio
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
