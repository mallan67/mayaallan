import type { Metadata } from "next"
import Link from "next/link"

// Starting template drafted 2026-05-19 grounded in the actual data flow
// visible in this codebase. Review with counsel — and replace specific
// jurisdiction references (US/state, EU/GDPR, CA/CCPA) — before relying
// on this for dispute defense. Update `lastUpdated` and the prose any
// time the data practices change (new third party added, new collection
// surface, retention period changed, etc).
const LAST_UPDATED = "May 20, 2026"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How mayaallan.com collects, uses, and shares personal information. Covers email, payments, AI chat tools, analytics, and your rights.",
  alternates: { canonical: "https://www.mayaallan.com/privacy" },
  openGraph: {
    title: "Privacy Policy — Maya Allan",
    description: "How mayaallan.com handles your personal information.",
    url: "https://www.mayaallan.com/privacy",
  },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 space-y-8 text-sm text-slate-700">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>
      </header>

      <section className="space-y-3">
        <p>
          This policy describes how Maya Allan (&quot;we,&quot; &quot;us,&quot; or the &quot;site&quot;) collects,
          uses, and shares personal information when you visit{" "}
          <Link href="/" className="underline">
            mayaallan.com
          </Link>{" "}
          or use the products and services offered through it.
        </p>
        <p>
          If you have questions, write to us via the{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">1. Information we collect</h2>
        <p>We collect only what we need to deliver the site and the products you purchase.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Email address.</strong> When you purchase a book or session PDF, sign up for a newsletter, send a
            contact form, or use the AI tools&apos; export feature, you provide your email so we can deliver what you
            asked for.
          </li>
          <li>
            <strong>Payment information.</strong> Payments are processed by PayPal. We never see or store your full card
            number; we only receive the transaction ID, amount, currency, and the payer information PayPal returns
            (typically name and email).
          </li>
          <li>
            <strong>Order records.</strong> We keep records of purchases — book or product purchased, price, date,
            buyer email — to deliver the product, send a download link, and meet our tax and accounting obligations.
          </li>
          <li>
            <strong>Usage data.</strong> We log basic request information: a one-way hash of your IP address and
            user-agent (used for rate-limiting and to detect abuse), the referrer URL, the landing page, and any UTM
            parameters in the URL. We do not store your raw IP for analytics purposes.
          </li>
          <li>
            <strong>Visitor and session identifiers.</strong> We set a long-lived first-party visitor ID and a per-visit
            session ID in cookies so we can measure things like &quot;did the same person come back later and buy.&quot;
            These IDs are random; they do not contain personal information.
          </li>
          <li>
            <strong>AI chat conversations.</strong> When you use Belief Inquiry, Integration, or Reset, your messages
            are sent to a third-party large-language-model provider in real time to generate the response. We do not
            persistently store the full transcript on our side unless you click &quot;Save Session as PDF for $9.99&quot;
            — in which case the transcript is held in encrypted Redis (Upstash) for up to 24 hours so we can render
            and email the PDF, and deleted as soon as delivery succeeds. If the 24-hour window passes without
            successful delivery, the transcript is automatically removed.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">2. How we use information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To process orders and deliver digital goods (book downloads, session PDFs).</li>
          <li>To send purchase confirmations and product update notices to buyers.</li>
          <li>To operate the AI chat tools and the session-export feature.</li>
          <li>
            To improve the site through aggregated analytics: which pages people land on, which links convert to
            purchase, what content people share.
          </li>
          <li>To prevent abuse, fraud, and unauthorized access to admin areas.</li>
          <li>To respond to inquiries you send through the contact form.</li>
          <li>To meet legal obligations (tax records, dispute response, lawful requests).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">3. Who we share information with</h2>
        <p>
          We do not sell personal information. We share it only with service providers we rely on to run the site, and
          only to the extent each provider needs to do its job.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>PayPal</strong> — processes all payments. Card data goes directly to PayPal and is governed by{" "}
            <a href="https://www.paypal.com/us/legalhub/privacy-full" className="underline" rel="noopener noreferrer">
              PayPal&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Resend</strong> — delivers transactional email (purchase receipts, download links, contact-form
            replies, admin alerts). Email addresses pass through Resend to deliver mail.
          </li>
          <li>
            <strong>Vercel</strong> — hosts the website and stores public assets in Vercel Blob (book PDFs, cover
            images, audiobook files).
          </li>
          <li>
            <strong>Supabase</strong> — provides the database where orders, contact-form submissions, and aggregated
            analytics events are stored.
          </li>
          <li>
            <strong>Upstash</strong> — provides the encrypted, short-lived Redis store used to hold AI chat session
            transcripts during the 24-hour window between &quot;Save Session as PDF&quot; checkout and email
            delivery.
          </li>
          <li>
            <strong>AI providers (e.g. Anthropic, OpenAI, Google)</strong> — when you use the AI chat tools, your
            messages are sent to one of these providers to generate responses. Each provider applies its own privacy
            terms to that interaction.
          </li>
          <li>
            <strong>ElevenLabs</strong> — voice-generation provider used to produce audiobook content. No customer data
            is sent to ElevenLabs in the normal course of operating the site.
          </li>
        </ul>
        <p>
          We may also disclose information if required by law (e.g. a valid subpoena or court order) or to protect
          someone&apos;s rights or safety.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">4. International transfers</h2>
        <p>
          The site is operated from the United States. If you are visiting from outside the United States, the
          information we collect will be transferred to and processed in the United States, which may have data
          protection rules different from those in your country.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">5. Retention</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Order records</strong> are kept as required by applicable tax and accounting law (typically six to
            seven years in the United States). After that period, records are deleted or anonymized.
          </li>
          <li>
            <strong>Download tokens</strong> emailed after a purchase expire automatically (typically after 30 days and
            5 download attempts).
          </li>
          <li>
            <strong>Session-export transcripts</strong> live in Upstash Redis with a 24-hour time-to-live and are
            deleted as soon as the PDF has been delivered (whichever comes first).
          </li>
          <li>
            <strong>Analytics events</strong> are retained for current product analysis. We honor deletion requests
            against your visitor and session identifiers — write to us via the contact page and reference the date
            range you want removed.
          </li>
          <li>
            <strong>Contact form messages and newsletter subscriptions</strong> are kept until you ask us to delete
            them or until you unsubscribe.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">6. Your rights</h2>
        <p>
          You can ask us to access, correct, or delete the personal information we hold about you. You can also
          unsubscribe from any marketing email at any time using the link in the email or by writing to us. We will
          respond to requests within a reasonable time and in line with applicable law.
        </p>
        <p>
          If you are in the European Union, the United Kingdom, or California, you may have additional rights under the
          GDPR, UK GDPR, or CCPA — including the right to portability and the right to object to certain processing.
          Write to us via the contact page to exercise any of these rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">7. Cookies and similar technologies</h2>
        <p>We use cookies and similar local-storage techniques for two purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Strictly necessary</strong> — to keep you logged in to the admin area (if you are an
            administrator), to remember your in-progress purchase before redirecting you to PayPal, and to apply rate
            limits. These are always on.
          </li>
          <li>
            <strong>Analytics (optional, consent-gated)</strong> — the visitor and session identifiers described
            above, used to measure how the site is performing in aggregate. We do not run third-party advertising
            trackers. If you are in the EU, the UK, or any other jurisdiction where consent is required for non-
            essential cookies, these are set only after you accept on the consent banner. You can revisit your
            choice at any time using the &quot;Cookie preferences&quot; link in the site footer.
          </li>
        </ul>
        <p>You can block cookies in your browser settings; some site features may stop working if you do.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">8. Children</h2>
        <p>
          The site is intended for adults. We do not knowingly collect personal information from anyone under 18. If you
          believe a minor has provided personal information to us, please contact us and we will delete it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">9. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The &quot;Last updated&quot; date at the top tells you when it
          last changed. Material changes will be communicated through a notice on the site or by email when
          appropriate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">10. Contact</h2>
        <p>
          Questions about this policy or about your information should be sent through our{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          .
        </p>
      </section>

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500 space-y-1">
        <p>
          See also our{" "}
          <Link href="/terms" className="underline">
            Terms of Service
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
