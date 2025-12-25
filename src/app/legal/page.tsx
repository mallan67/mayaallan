import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Legal & Disclaimer",
  description: "Legal disclaimer and terms of use for mayaallan.com. Informational and educational purposes only.",
  openGraph: {
    title: "Legal & Disclaimer - Maya Allan",
    description: "Legal disclaimer and terms of use. Informational and educational purposes only.",
    url: "https://mayaallan.com/legal",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 space-y-6 text-sm text-slate-700">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-2">Legal &amp; Disclaimer</h1>
      <section>
        <h2 className="font-serif font-semibold mb-2">Informational &amp; Educational Only</h2>
        <p>
          All content on this site and in associated publications is for informational and educational purposes only. It
          is not medical, psychological, therapeutic, or legal advice, and should not be used to diagnose, treat, cure,
          or prevent any condition.
        </p>
      </section>
      <section>
        <h2 className="font-serif font-semibold mb-2">Legal Compliance &amp; Local Laws</h2>
        <p>
          Psilocybin and related substances may be controlled or illegal in many jurisdictions, including but not
          limited to the United States, the European Union, the United Kingdom, Canada, Australia, Latin America, Asia,
          Africa, and the Middle East. It is your responsibility to know and comply with the laws of your jurisdiction.
          This site does not encourage or facilitate illegal activity in any form.
        </p>
      </section>
      <section>
        <h2 className="font-serif font-semibold mb-2">Privacy</h2>
        <p>
          A future privacy policy will explain how basic analytics and contact information are handled. Any email
          communication will always include an option to unsubscribe.
        </p>
      </section>
    </div>
  )
}
