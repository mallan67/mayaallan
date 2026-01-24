import type { Metadata } from "next"
import ContactClient from "./contactClient"

const SITE_URL = "https://www.mayaallan.com"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Maya Allan for speaking engagements, collaborations, or general inquiries.",
  openGraph: {
    title: "Contact Maya Allan",
    description: "Get in touch for speaking engagements, collaborations, or general inquiries.",
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
    description: "Get in touch for speaking engagements, collaborations, or general inquiries.",
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function ContactPage() {
  return <ContactClient />
}
