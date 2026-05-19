import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Educational Disclaimer",
  description:
    "Educational disclaimer for mayaallan.com. Content is informational and educational only — not medical, psychological, therapeutic, or legal advice.",
  alternates: {
    canonical: "https://www.mayaallan.com/legal",
  },
  openGraph: {
    title: "Educational Disclaimer — Maya Allan",
    description: "Content is informational and educational only — not medical or therapeutic advice.",
    url: "https://www.mayaallan.com/legal",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 space-y-6 text-sm text-slate-700">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-2 text-slate-900">Educational Disclaimer</h1>

      {/* Anchors #terms and #privacy are preserved for any legacy inbound links
          (older footer links, external citations) — content was split into
          dedicated /terms, /privacy, /refunds pages but anchors still resolve. */}
      <section id="terms">
        <h2 className="font-serif font-semibold mb-2 text-slate-900">Informational &amp; Educational Only</h2>
        <p>
          All content on this site and in associated publications is for informational and educational purposes only.
          It is not medical, psychological, therapeutic, or legal advice, and should not be used to diagnose, treat,
          cure, or prevent any condition.
        </p>
      </section>

      <section>
        <h2 className="font-serif font-semibold mb-2 text-slate-900">Legal Compliance &amp; Local Laws</h2>
        <p>
          Psilocybin and related substances may be controlled or illegal in many jurisdictions, including but not
          limited to the United States, the European Union, the United Kingdom, Canada, Australia, Latin America, Asia,
          Africa, and the Middle East. It is your responsibility to know and comply with the laws of your jurisdiction.
          This site does not encourage or facilitate illegal activity in any form.
        </p>
      </section>

      <section id="privacy">
        <h2 className="font-serif font-semibold mb-2 text-slate-900">Privacy, Terms &amp; Refunds</h2>
        <p>
          How we handle personal information, the terms that govern your use of the site, and our refund policy for
          digital purchases live on their own pages:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            — what we collect, how we use it, who we share it with, and your rights.
          </li>
          <li>
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            — the agreement that applies when you use the site or its AI tools.
          </li>
          <li>
            <Link href="/refunds" className="underline">
              Refund Policy
            </Link>{" "}
            — how refunds work for ebooks and session-export PDFs.
          </li>
        </ul>
      </section>
    </div>
  )
}
