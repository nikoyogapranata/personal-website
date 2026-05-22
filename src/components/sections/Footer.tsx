"use client";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = ["Home", "About", "Work", "Contact"] as const;
const HREF: Record<string, string> = { Home: "/", About: "#about", Work: "#work", Contact: "#contact" };

const MARQUEE_TEXT = "NIKO PRANATA";
const SPEED = 60; // px per second

function MarqueeTrack() {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    const unitW = unitRef.current?.offsetWidth ?? 0;
    if (!unitW) return;
    const next = (x.get() - (delta / 1000) * SPEED) % unitW;
    x.set(next);
  });

  const unit = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "clamp(40px, 5vw, 80px)", paddingRight: "clamp(120px, 16vw, 240px)" }}>
      {MARQUEE_TEXT}
      <Image
        src="/spark.png"
        alt=""
        width={80}
        height={80}
        style={{
          height: "0.72em",
          width: "auto",
          objectFit: "contain",
          display: "block",
          flexShrink: 0,
        }}
      />
    </span>
  );

  return (
    <div ref={containerRef} style={{ overflow: "hidden", position: "relative" }}>
      <motion.div
        style={{
          x,
          display: "inline-flex",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(100px, 18vw, 280px)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "#f8f8f5",
        }}
      >
        {/* Six copies so there's always content filling the viewport */}
        <span ref={unitRef} style={{ display: "inline-flex" }}>{unit}</span>
        {unit}{unit}{unit}{unit}{unit}
      </motion.div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0a0a0a",
        borderTop: "0.5px solid #2a2a2a",
        paddingTop: "clamp(40px, 5vw, 72px)",
        overflow: "hidden",
      }}
    >
      {/* ── Top row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(32px, 6vw, 80px)",
          marginBottom: "clamp(48px, 7vw, 100px)",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(12px, 1.1vw, 14px)",
            color: "#555",
            letterSpacing: "0.02em",
          }}
        >
          © 2025 Niko Yoga Pranata
        </span>

        <nav style={{ display: "flex", gap: "clamp(20px, 3vw, 48px)" }}>
          {LINKS.map((label) => (
            <Link
              key={label}
              href={HREF[label]}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "clamp(12px, 1.1vw, 14px)",
                color: "#555",
                textDecoration: "none",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#f8f8f5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#555"; }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Marquee ── */}
      <MarqueeTrack />
    </footer>
  );
}
