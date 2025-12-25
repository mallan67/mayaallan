import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Maya Allan",
  description: "Learn about Maya Allan, author focused on integration, self-agency, and inner transformation.",
  openGraph: {
    title: "About Maya Allan",
    description: "Author focused on integration, self-agency, and inner transformation.",
    url: "https://mayaallan.com/about",
  },
  twitter: {
    card: "summary",
    title: "About Maya Allan",
    description: "Author focused on integration, self-agency, and inner transformation.",
  },
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-4">About Maya Allan</h1>
      <p className="text-sm md:text-base leading-relaxed text-slate-700 space-y-3">
        <span>
          Maya Allan writes about integration, self-agency, and inner transformation. Her work is educational and
          reflective, offering structured ways to think about profound experiences without making clinical, medical, or
          therapeutic claims.
        </span>
      </p>
    </div>
  )
}
