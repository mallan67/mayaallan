import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Maya Allan - author, speaker, and wellness advocate.",
}

export const revalidate = 300 // 5 minutes

async function getAuthorInfo() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("authorName, authorBio, authorPhotoUrl")
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching author info:", error)
      return null
    }

    return settings
  } catch (error) {
    console.error("Failed to fetch author info:", error)
    return null
  }
}

export default async function AboutPage() {
  const author = await getAuthorInfo()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl mb-8">About</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {author?.authorPhotoUrl && (
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden">
              <Image
                src={author.authorPhotoUrl}
                alt={author.authorName || "Author"}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          {author?.authorName && (
            <h2 className="font-serif text-2xl mb-4">{author.authorName}</h2>
          )}

          {author?.authorBio ? (
            <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
              {author.authorBio}
            </div>
          ) : (
            <p className="text-lg leading-relaxed text-slate-700">
              Maya Allan is an author and researcher exploring consciousness,
              integration, and self-agency through lived experience and inquiry.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
