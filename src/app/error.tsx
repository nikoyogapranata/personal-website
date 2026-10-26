"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { EMAIL } from "@/lib/site";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        padding:
          "var(--page-top) max(var(--page-x), calc((100% - var(--content-max)) / 2)) var(--section-y)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(3.25rem, calc(8.3333 * var(--u)), 192px)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "var(--color-text)",
          margin: "0 0 var(--space-l)",
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
          fontSize: "var(--text-body-lg)",
          lineHeight: 1.75,
          color: "var(--color-text-muted)",
          maxWidth: 560,
          margin: "0 0 clamp(32px, calc(2.5 * var(--u)), 58px)",
        }}
      >
        This part of the page failed to load. Try again, head back home, or email me at{" "}
        <a href={`mailto:${EMAIL}`} style={{ color: "var(--color-text)" }}>{EMAIL}</a>.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            background: "var(--color-bg-dark)",
            color: "var(--color-text-inverse)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--text-label)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "1.23em 2.46em",
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
            fontSize: "var(--text-body)",
            color: "var(--color-text)",
          }}
        >
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
