import type { Metadata } from "next"
import ContactClient from "./contactClient"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Maya Allan for speaking engagements, collaborations, or general inquiries.",
  openGraph: {
    title: "Contact Maya Allan",
    description: "Get in touch for speaking engagements, collaborations, or general inquiries.",
    url: "https://mayaallan.com/contact",
  },
  twitter: {
    card: "summary",
    title: "Contact Maya Allan",
    description: "Get in touch for speaking engagements, collaborations, or general inquiries.",
  },
}

export default function ContactPage() {
  return <ContactClient />
}
