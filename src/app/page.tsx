import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { ShareButtons } from "@/components/share-buttons"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // Get featured book (isFeatured + isPublished)
  // Falls back to most recent published book if no featured
  const mainBook =
    (await prisma.book.findFirst({
      where: { isPublished: true, isFeatured: true },
      include: {
        retailers: {
          where: { isActive: true, url: { not: "" } },
          include: { retailer: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })) ??
    (await prisma.book.findFirst({
      where: { isPublished: true },
      include: {
        retailers: {
          where: { isActive: true, url: { not: "" } },
          include: { retailer: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }))

  const publishedEvents = await prisma.event.findMany({
    where: { isPublished: true, isVisible: true },
    orderBy: { startsAt: "asc" },
    take: 4,
  })

  const publishedMedia = await prisma.mediaItem.findMany({
    where: { isPublished: true, isVisible: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  })

  const hasEvents = publishedEvents.length > 0
  const hasMedia = publishedMedia.length > 0

  return (
    <main className="flex-1">
      {/* Hero / Featured Book */}
      {mainBook ? (
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-8 items-center">
          <div className="flex justify-center md:justify-end">
            {mainBook.coverUrl ? (
              <Image
                src={mainBook.coverUrl}
                alt={mainBook.title}
                width={256}
                height={384}
                className="w-48 md:w-64 border border-slate-200 shadow-md rounded-md"
                priority
              />
            ) : (
              <div className="w-48 md:w-64 aspect-[2/3] border border-slate-200 shadow-md rounded-md flex items-center justify-center bg-slate-50">
                <div className="text-center px-4">
                  <div className="font-serif font-semibold text-sm tracking-wide uppercase">
                    {mainBook.title}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">
              {mainBook.isFeatured ? "Featured" : "New Release"}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
              {mainBook.title}
            </h1>
            {mainBook.subtitle1 && (
              <p className="mt-3 font-serif text-base md:text-lg text-slate-700">
                {mainBook.subtitle1}
              </p>
            )}
            {mainBook.subtitle2 && (
              <p className="mt-2 font-serif text-base text-slate-600">
                {mainBook.subtitle2}
              </p>
            )}
            {mainBook.tagsCsv && (
              <div className="mt-4 text-sm text-slate-600">
                <p>{mainBook.tagsCsv}</p>
              </div>
            )}

            {/* Pricing */}
            {!mainBook.isComingSoon && (
              <div className="mt-4 flex flex-wrap gap-4">
                {mainBook.hasEbook && mainBook.ebookPrice && (
                  <div className="text-center">
                    <span className="block text-xl font-bold">${Number(mainBook.ebookPrice).toFixed(2)}</span>
                    <span className="text-xs text-slate-500">Ebook</span>
                  </div>
                )}
                {mainBook.hasPaperback && mainBook.paperbackPrice && (
                  <div className="text-center">
                    <span className="block text-xl font-bold">${Number(mainBook.paperbackPrice).toFixed(2)}</span>
                    <span className="text-xs text-slate-500">Paperback</span>
                  </div>
                )}
                {mainBook.hasHardcover && mainBook.hardcoverPrice && (
                  <div className="text-center">
                    <span className="block text-xl font-bold">${Number(mainBook.hardcoverPrice).toFixed(2)}</span>
                    <span className="text-xs text-slate-500">Hardcover</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {mainBook.isComingSoon ? (
                <span className="px-5 py-2.5 text-sm font-semibold border border-amber-500 bg-amber-500 text-white rounded-full">
                  Coming Soon
                </span>
              ) : (
                <>
                  {/* Direct Sale */}
                  {mainBook.allowDirectSale && mainBook.stripePaymentLink && (
                    <a
                      href={mainBook.stripePaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-sm font-semibold border border-black bg-black text-white rounded-full hover:bg-slate-800 transition"
                    >
                      Buy Now
                    </a>
                  )}

                  {/* Retailer Links */}
                  {mainBook.allowRetailerSale && mainBook.retailers && mainBook.retailers.length > 0 && (
                    mainBook.retailers.slice(0, 2).map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 rounded-full hover:bg-slate-50 transition"
                      >
                        Buy on {link.retailer.name}
                      </a>
                    ))
                  )}

                  <Link
                    href={`/books/${mainBook.slug}`}
                    className="px-5 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 rounded-full hover:bg-slate-50 transition"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </div>

            {/* Share Buttons */}
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
      ) : (
        /* No Book - Show Author Info */
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-5xl font-bold text-slate-900 mb-6">
            Maya Allan
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Author & Writer
          </p>
          <Link
            href="/books"
            className="inline-block px-8 py-4 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition"
          >
            View Books
          </Link>
        </section>
      )}

      {/* About the Book */}
      {mainBook?.blurb && (
        <section className="border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-4">
              About the Book
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-700">
              {mainBook.blurb}
            </p>
          </div>
        </section>
      )}

      {/* Events */}
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
                  <p className="mt-2 text-sm text-slate-600">
                    {new Date(evt.startsAt).toLocaleDateString()}
                  </p>
                  {evt.description && (
                    <p className="mt-2 text-sm text-slate-700 line-clamp-2">{evt.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Media */}
      {hasMedia && (
        <section className="border-t border-slate-200" id="media">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl md:text-2xl font-semibold">Media</h2>
              <Link href="/media" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70">
                View all
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {publishedMedia.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                  <span className="text-xs font-semibold uppercase text-slate-500">{item.kind}</span>
                  <h3 className="font-semibold mt-1">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="border-t border-slate-200" id="about">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-8 items-start">
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
              Author Photo
            </div>
          </div>
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-3">
              About Maya Allan
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-700 mb-3">
              Maya Allan is an author focused on integration, self-agency, and
              inner transformation. Her work is strictly educational and
              reflective, helping readers think through their experiences
              without promising cures or outcomes.
            </p>
            <Link
              href="/about"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70"
            >
              Read full bio
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
