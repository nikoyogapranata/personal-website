"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { EMAIL } from "@/lib/site";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main
      style={{
        background: "#f8f8f5",
        minHeight: "100vh",
        padding:
          "clamp(110px, 14vw, 180px) clamp(32px, 6vw, 80px) clamp(80px, 10vw, 140px)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(52px, 10vw, 160px)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "#0a0a0a",
          margin: "0 0 clamp(32px, 4vw, 56px)",
        }}
      >
        SOMETHING{" "}
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "var(--color-accent-secondary)",
          }}
        >
          broke.
        </span>
      </h1>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(16px, 1.5vw, 20px)",
          lineHeight: 1.75,
          color: "#555",
          maxWidth: 560,
          margin: "0 0 clamp(32px, 4vw, 48px)",
        }}
      >
        This part of the page failed to load. Try again, head back home, or email me at{" "}
        <a href={`mailto:${EMAIL}`} style={{ color: "#0a0a0a" }}>{EMAIL}</a>.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            background: "#0a0a0a",
            color: "#f8f8f5",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "16px 32px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 16,
            color: "#0a0a0a",
          }}
        >
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
