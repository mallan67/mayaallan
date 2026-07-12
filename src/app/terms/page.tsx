import type { Metadata } from "next"
import Link from "next/link"

// Baseline operating terms. These still require counsel review before they are
// treated as final dispute-defense language, especially for international sales,
// consumer rights, and the AI reflection tools.
const LAST_UPDATED = "July 10, 2026"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for mayaallan.com. Covers use of the site, AI tools, purchases of books and session PDFs, and applicable disclaimers.",
  alternates: { canonical: "https://www.mayaallan.com/terms" },
  openGraph: {
    title: "Terms of Service — Maya Allan",
    description: "Terms of service for mayaallan.com.",
    url: "https://www.mayaallan.com/terms",
  },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 space-y-8 text-sm text-slate-700">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>
      </header>

      <section className="space-y-3">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of mayaallan.com (the &quot;Site&quot;) and any
          products or services offered through it. By using the Site, you agree to these Terms. If you do not agree,
          please do not use the Site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">1. Eligibility</h2>
        <p>
          You must be at least 18 years old to use the Site or to purchase any product. By using the Site, you confirm
          that you meet this requirement.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">2. License to use the Site</h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to access the Site and use its
          content for your personal, non-commercial purposes. You may not copy, redistribute, scrape, or republish
          content from the Site without written permission.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">3. AI tools — important disclaimer</h2>
        <p>
          The Belief Inquiry, Integration, and Reset tools generate conversational responses using a third-party large
          language model. They are reflection aids only. They are <strong>not</strong> therapy, counseling, medical
          advice, psychological assessment, crisis intervention, or any other form of professional service.
        </p>
        <p>
          If you are in crisis or in need of professional support, please contact a qualified mental-health professional
          or, in the United States, dial or text 988. We do not monitor conversations in real time and cannot respond
          to emergencies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">4. Your content</h2>
        <p>
          When you type into the AI tools or submit a contact form, you provide content to the Site. You retain
          ownership of your content. You grant us a limited license to use, process, and (in the case of the
          session-export feature) render that content into a deliverable PDF — solely to provide the service you asked
          for.
        </p>
        <p>You agree that your content is yours to share, does not contain personal information about third parties without their permission, and does not violate any law.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">5. Prohibited uses</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Using the Site or AI tools to harass, threaten, or harm anyone.</li>
          <li>Attempting to access admin areas or other accounts you are not authorized to use.</li>
          <li>Probing, scanning, or testing the security of the Site without explicit written permission.</li>
          <li>Scraping or downloading content in bulk for re-publication.</li>
          <li>Using the Site to facilitate any illegal activity.</li>
          <li>Reverse-engineering or attempting to bypass technical access controls (rate limits, download caps, etc.).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">6. Purchases and digital goods</h2>
        <p>
          We sell digital products (e.g. ebooks, session-export PDFs) through PayPal. When you complete a purchase you
          receive an email with a download link that is valid for a limited number of downloads and a limited time
          (typically 30 days and 5 downloads). Please save your download promptly.
        </p>
        <p>
          Prices and product descriptions on the Site are subject to change. We make reasonable efforts to keep them
          accurate. If a product is listed at an obviously incorrect price, we may cancel the order and refund the
          payment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">7. Refunds</h2>
        <p>
          Our refund policy is described separately on the{" "}
          <Link href="/refunds" className="underline">
            Refunds page
          </Link>
          . The refund policy is part of these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">8. Intellectual property</h2>
        <p>
          All Site content — including but not limited to text, graphics, books, audiobook recordings, AI tool design,
          prompts, and the look and feel of the Site — is owned by Maya Allan or her licensors and is protected by
          copyright and other intellectual property laws. Use of the Site does not transfer any of those rights to you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">9. Educational disclaimer</h2>
        <p>
          The Site discusses topics that may involve regulated substances. Please read the{" "}
          <Link href="/legal" className="underline">
            educational and legal disclaimer
          </Link>{" "}
          carefully. Nothing on the Site encourages illegal activity. You are responsible for knowing and following the
          laws of your jurisdiction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">10. No warranties</h2>
        <p>
          The Site and its content are provided &quot;as is&quot; and &quot;as available,&quot; without warranties of
          any kind, express or implied. We do not warrant that the Site will be uninterrupted, error-free, secure, or
          free of viruses or other harmful components. We make no warranty regarding the accuracy or completeness of
          any content or any output of the AI tools.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">11. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, neither Maya Allan nor any service provider involved in operating the
          Site will be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits, revenue, data, or goodwill, arising out of or in connection with your use of the Site or any
          product purchased through it.
        </p>
        <p>
          Our total cumulative liability to you for any claim relating to the Site or a product is limited to the
          amount you paid us for that product in the 12 months preceding the claim, or US&nbsp;$100, whichever is
          greater.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">12. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Maya Allan from and against any claims, damages,
          liabilities, costs, and expenses arising from your use of the Site, your content, or your violation of these
          Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">13. Termination</h2>
        <p>
          We may suspend or terminate your access to the Site at any time, with or without notice, if we believe you
          have violated these Terms. The sections that by their nature should survive termination — including
          intellectual property, disclaimers, limitation of liability, and indemnification — will continue to apply.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">14. Governing law and disputes</h2>
        <p>
          These Terms are governed by applicable law, including any mandatory consumer-protection law that cannot be
          waived by contract. Any dispute arising out of or relating to these Terms or the Site that is not resolved
          through informal good-faith discussion will be brought in a court that has lawful jurisdiction over the
          parties and the subject matter. Nothing in this section limits rights that applicable consumer law gives you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">15. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. The &quot;Last updated&quot; date at the top tells you when they
          last changed. Continued use of the Site after a change means you accept the updated Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">16. Contact</h2>
        <p>
          Questions about these Terms should be sent through our{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          .
        </p>
      </section>

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500 space-y-1">
        <p>
          See also our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/refunds" className="underline">
            Refund Policy
          </Link>
          , and{" "}
          <Link href="/legal" className="underline">
            Educational Disclaimer
          </Link>
          .
        </p>
      </footer>
    </div>
  )
}
