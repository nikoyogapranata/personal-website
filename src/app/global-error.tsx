"use client"; // Error boundaries must be Client Components

// Replaces the root layout when it fails, so it can't rely on globals.css or next/font.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(32px, 6vw, 80px)",
          background: "#f8f8f5",
          color: "#0a0a0a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <title>Niko Pranata | Something went wrong</title>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 96px)", letterSpacing: "-0.03em", margin: "0 0 24px" }}>
          Something went wrong.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#555", margin: "0 0 32px", maxWidth: 520 }}>
          The site failed to load. Please try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            alignSelf: "flex-start",
            background: "#0a0a0a",
            color: "#f8f8f5",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "16px 32px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
