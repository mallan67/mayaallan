import type { Metadata } from "next"
import ContactClient from "./contactClient"
import { SITE_URL } from "@/lib/identity"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Maya Allan for press, collaborations, or reader inquiries.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Maya Allan",
    description: "Get in touch for press, collaborations, or reader inquiries.",
    url: `${SITE_URL}/contact`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Contact Maya Allan",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Maya Allan",
    description: "Get in touch for press, collaborations, or reader inquiries.",
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function ContactPage() {
  return <ContactClient />
}
