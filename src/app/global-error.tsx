"use client"

import { useEffect } from "react"

// Last-resort boundary for errors thrown in the ROOT layout itself (where the
// normal error.tsx can't render because the layout failed). Must supply its
// own <html>/<body>. Kept minimal and dependency-free.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error boundary:", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          background: "#0f1a2e",
          color: "#fff",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.75, marginBottom: "1.75rem" }}>
            The site hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 28px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#0f1a2e",
              background: "#fff",
              border: "none",
              borderRadius: 9999,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
