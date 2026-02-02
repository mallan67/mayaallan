import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/download/"],
      },
    ],
    sitemap: "https://www.mayaallan.com/sitemap.xml",
  }
}
