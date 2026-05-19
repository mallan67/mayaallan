import type { Metadata } from "next"
import Link from "next/link"

// Starting template drafted 2026-05-19. The 14-day window and "unused download
// token" trigger are reasonable defaults for digital goods, but Maya should
// confirm she's comfortable honoring them before this goes live. Sole bright
// line: once a customer has downloaded the file or the session PDF was emailed,
// refunds become case-by-case. PayPal disputes can override anything we say —
// this page is mostly to (a) set buyer expectations and (b) give us a written
// policy to cite when defending a chargeback.
const LAST_UPDATED = "May 19, 2026"

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund policy for digital products sold through mayaallan.com — ebooks and session-export PDFs.",
  alternates: { canonical: "https://www.mayaallan.com/refunds" },
  openGraph: {
    title: "Refund Policy — Maya Allan",
    description: "How refunds work for digital products from mayaallan.com.",
    url: "https://www.mayaallan.com/refunds",
  },
  robots: { index: true, follow: true },
}

export default function RefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 space-y-8 text-sm text-slate-700">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900">Refund Policy</h1>
        <p className="text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>
      </header>

      <section className="space-y-3">
        <p>
          This page describes how refunds work for products purchased through mayaallan.com. By making a purchase you
          agree to this policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">In short</h2>
        <p>
          We sell digital products (ebooks and session-export PDFs). Because these are delivered immediately and cannot
          be returned, refunds are limited. If something has genuinely gone wrong with your purchase, write to us — we
          want every reader to have a good experience and will work with you in good faith.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">When we will issue a refund</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Duplicate or accidental charge.</strong> If you were charged twice for the same item, or completed
            a purchase by mistake and the file has not been downloaded, we will refund you in full.
          </li>
          <li>
            <strong>Download or delivery failure that we cannot resolve.</strong> If your download link does not work,
            your email never arrived, or the file is corrupted and we cannot deliver a working copy within a reasonable
            time, we will refund you in full.
          </li>
          <li>
            <strong>Within 14 days, file unused.</strong> If you request a refund within 14 days of purchase and the
            download token has not been used (we can verify this on our side), we will refund you in full.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">When refunds are case-by-case</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Once a product has been downloaded or a session PDF has been emailed and received, we generally consider
            the sale final.
          </li>
          <li>
            If you believe the product was misrepresented or genuinely defective after download, write to us and we
            will review the situation.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">How to request a refund</h2>
        <p>
          Write to us through the{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          . Please include:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The email address used to make the purchase.</li>
          <li>The PayPal order or transaction ID from your receipt, if you have it.</li>
          <li>A short note describing what happened.</li>
        </ul>
        <p>We will respond within 5 business days.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Processing time</h2>
        <p>
          Approved refunds are issued through PayPal to the original payment method. PayPal typically returns funds
          within 3–5 business days, sometimes longer depending on your bank.
        </p>
        <p>
          PayPal does not refund the original transaction fee on a refunded purchase. We absorb that fee on our side;
          you receive the full purchase price back.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">A note on chargebacks</h2>
        <p>
          If you believe a charge is wrong, please contact us before filing a chargeback or dispute with PayPal or your
          bank. We can almost always resolve it faster directly. A chargeback you file before contacting us locks the
          dispute into a slow formal process and limits what we can do to help.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The &quot;Last updated&quot; date at the top tells you when it
          last changed. A purchase is governed by the policy in effect on the date of purchase.
        </p>
      </section>

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500 space-y-1">
        <p>
          See also our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/terms" className="underline">
            Terms of Service
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
