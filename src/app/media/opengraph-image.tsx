/**
 * Media Page OG Image
 * Generates a 1200x630 image for the media page
 */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Media - Maya Allan"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Left side - Icon/Visual */}
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
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>

        {/* Right side - Page Info */}
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
          {/* Page type tag */}
          <div
            style={{
              display: "flex",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1e293b",
                textTransform: "uppercase",
                letterSpacing: "2px",
                backgroundColor: "#e2e8f0",
                padding: "8px 16px",
                borderRadius: "20px",
              }}
            >
              Media
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#0f172a",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Music, Guides & Videos
          </div>

          {/* Author */}
          <p
            style={{
              fontSize: "28px",
              color: "#334155",
              marginBottom: "24px",
            }}
          >
            by Maya Allan
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: "20px",
              color: "#1e293b",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            Guided audios, music, videos, and PDF resources for integration and personal development.
          </p>

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
                color: "#475569",
                fontWeight: "500",
              }}
            >
              mayaallan.com/media
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
