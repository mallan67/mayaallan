export const dynamic = "force-dynamic"

export default async function AboutPage() {
  // ✅ Prisma removed: no DB dependency here.
  // If you later want this editable from admin, we can fetch from Supabase instead.

  const authorName = "Maya Allan"
  const authorBio =
    "Maya Allan is an author focused on integration, self-agency, and inner transformation."

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-8">About</h1>

      <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
        <div className="flex justify-center md:justify-start">
          <div className="w-40 h-40 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
            Author Photo
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-semibold mb-4">{authorName}</h2>
          <div className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
            {authorBio}
          </div>
        </div>
      </div>
    </div>
  )
}
