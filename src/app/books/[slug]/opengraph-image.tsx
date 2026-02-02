import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Book by Maya Allan"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

interface Props {
  params: Promise<{ slug: string }>
}

// Load Inter font for crisp text rendering
async function loadFont() {
  const response = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2")
  )
  return await response.arrayBuffer()
}

async function loadFontBold() {
  const response = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2")
  )
  return await response.arrayBuffer()
}

// Simple fetch function for edge runtime (no heavy dependencies)
async function getBookData(slug: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/books?or=(slug.eq.${encodeURIComponent(slug)})&select=title,subtitle1,blurb,cover_url,tags_csv&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data?.[0] || null
  } catch {
    return null
  }
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  // Load fonts in parallel with data
  const [book, interRegular, interBold] = await Promise.all([
    getBookData(decodedSlug),
    loadFont(),
    loadFontBold(),
  ])

  const fonts = [
    {
      name: "Inter",
      data: interRegular,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Inter",
      data: interBold,
      style: "normal" as const,
      weight: 700 as const,
    },
  ]

  // If no book found, return a generic author image
  if (!book) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            fontFamily: "Inter",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#000000",
            }}
          >
            Maya Allan
          </h1>
          <p style={{ fontSize: "32px", color: "#000000", fontWeight: 400 }}>Author</p>
        </div>
      ),
      { ...size, fonts }
    )
  }

  // Truncate description for display
  const description = book.blurb || book.subtitle1 || ""
  const truncatedDesc = description.length > 150 ? description.substring(0, 147) + "..." : description

  // Get genre/tags for display
  const genre = book.tags_csv?.split(",")[0]?.trim() || ""

  // Ensure cover URL is absolute
  const coverUrl = book.cover_url
    ? book.cover_url.startsWith("http")
      ? book.cover_url
      : `https://www.mayaallan.com${book.cover_url}`
    : null

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        {/* Left side - Book Cover */}
        <div
          style={{
            width: "400px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#f8fafc",
          }}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={book.title}
              width={300}
              height={450}
              style={{
                width: "300px",
                height: "450px",
                objectFit: "cover",
                borderRadius: "8px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            />
          ) : (
            <div
              style={{
                width: "300px",
                height: "450px",
                backgroundColor: "#e2e8f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#000000", fontSize: "24px", fontWeight: 700 }}>No Cover</span>
            </div>
          )}
        </div>

        {/* Right side - Book Info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "50px 60px 50px 40px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Genre tag */}
          {genre && (
            <div
              style={{
                display: "flex",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#000000",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  backgroundColor: "#e2e8f0",
                  padding: "8px 16px",
                  borderRadius: "20px",
                }}
              >
                {genre}
              </span>
            </div>
          )}

          {/* Book Title */}
          <div
            style={{
              fontSize: book.title.length > 35 ? "38px" : "48px",
              fontWeight: 700,
              color: "#000000",
              lineHeight: 1.15,
              marginBottom: "16px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {book.title}
          </div>

          {/* Author */}
          <p
            style={{
              fontSize: "28px",
              color: "#000000",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            by Maya Allan
          </p>

          {/* Description */}
          {truncatedDesc && (
            <p
              style={{
                fontSize: "22px",
                color: "#1a1a1a",
                fontWeight: 400,
                lineHeight: 1.4,
                marginBottom: "24px",
              }}
            >
              {truncatedDesc}
            </p>
          )}

          {/* Website */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: "#000000",
                fontWeight: 700,
              }}
            >
              mayaallan.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  )
}
