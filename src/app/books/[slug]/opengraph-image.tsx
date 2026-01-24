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

  const book = await getBookData(decodedSlug)

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
            backgroundColor: "#0f172a",
            backgroundImage: "linear-gradient(to bottom right, #0f172a, #1e293b)",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            Maya Allan
          </h1>
          <p style={{ fontSize: "32px", color: "#94a3b8" }}>Author</p>
        </div>
      ),
      { ...size }
    )
  }

  // Truncate description for display
  const description = book.blurb || book.subtitle1 || ""
  const truncatedDesc = description.length > 120 ? description.substring(0, 117) + "..." : description

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
          backgroundColor: "#0f172a",
          backgroundImage: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        }}
      >
        {/* Left side - Book Cover */}
        <div
          style={{
            width: "380px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={book.title}
              width={280}
              height={420}
              style={{
                width: "280px",
                height: "420px",
                objectFit: "cover",
                borderRadius: "8px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            />
          ) : (
            <div
              style={{
                width: "280px",
                height: "420px",
                backgroundColor: "#334155",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "24px" }}>No Cover</span>
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
            padding: "40px 50px 40px 20px",
          }}
        >
          {/* Genre tag */}
          {genre && (
            <div
              style={{
                display: "flex",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#cbd5e1",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  backgroundColor: "rgba(100, 116, 139, 0.3)",
                  padding: "6px 16px",
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
              fontSize: book.title.length > 40 ? "42px" : "52px",
              fontWeight: "bold",
              color: "#ffffff",
              lineHeight: 1.1,
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
              fontSize: "24px",
              color: "#94a3b8",
              marginBottom: "20px",
            }}
          >
            by Maya Allan
          </p>

          {/* Description */}
          {truncatedDesc && (
            <p
              style={{
                fontSize: "18px",
                color: "#64748b",
                lineHeight: 1.5,
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
                fontSize: "16px",
                color: "#475569",
                fontWeight: "500",
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
    }
  )
}
