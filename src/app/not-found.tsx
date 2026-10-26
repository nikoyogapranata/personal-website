import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINK: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: "calc(var(--text-body-lg) * 1.1)",
  color: "var(--color-text)",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 12,
};

export default function NotFound() {
  return (
    <>
      <main
        style={{
          background: "var(--color-bg)",
          minHeight: "100vh",
          padding:
            "var(--page-top) max(var(--page-x), calc((100% - var(--content-max)) / 2)) var(--section-y)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: "var(--space-xl)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "var(--text-title)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            404
          </h1>
          <Image
            src="/spark.png"
            alt=""
            width={260}
            height={260}
            style={{
              height: "clamp(64px, calc(9.375 * var(--u)), 216px)",
              width: "auto",
              flexShrink: 1,
              minWidth: 0,
              objectFit: "contain",
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "var(--text-h4)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            color: "var(--color-text)",
            maxWidth: 720,
            margin: "0 0 var(--space-l)",
          }}
        >
          This page{" "}
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--color-accent-secondary)",
            }}
          >
            doesn&apos;t exist
          </span>{" "}
          — it may have moved, or the link is mistyped.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Link href="/" style={LINK}>
            <span aria-hidden="true" style={{ fontSize: "0.85em", opacity: 0.5 }}>↗</span>
            Back to the home page
          </Link>
          <Link href="/work" style={LINK}>
            <span aria-hidden="true" style={{ fontSize: "0.85em", opacity: 0.5 }}>↗</span>
            See my work
          </Link>
        </div>
      </main>
      <Footer theme="light" />
    </>
  );
}
