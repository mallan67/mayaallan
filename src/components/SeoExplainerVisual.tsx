import Image from "next/image"

export function SeoExplainerVisual({
  slug,
  alt,
  caption,
}: {
  slug: "belief-inquiry" | "nervous-system-reset" | "integration-reflection"
  alt: string
  caption: string
}) {
  return (
    <figure className="my-8">
      <Image
        src={`/seo-visual/${slug}`}
        alt={alt}
        width={1200}
        height={675}
        sizes="(max-width: 768px) 100vw, 768px"
        className="w-full h-auto rounded-2xl border border-slate-200"
        unoptimized
      />
      <figcaption className="mt-2 text-xs text-slate-500 leading-relaxed">{caption}</figcaption>
    </figure>
  )
}
