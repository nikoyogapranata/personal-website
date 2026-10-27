"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = ["Home", "About", "Work", "Contact"] as const;
const HREF: Record<string, string> = { Home: "/", About: "/about", Work: "/work", Contact: "/contact" };

const MARQUEE_TEXT = "NIKO PRANATA";
const SPEED = 60; // px per second

// CSS keyframe loop (footer-marquee in globals.css): the track holds 6 identical units and
// shifts by one unit per cycle. Layout is only read on resize, and it pauses off-screen.
function MarqueeTrack({ textColor }: { textColor: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const unit = unitRef.current;
    if (!track || !unit) return;
    // Keep a constant speed in px/s whatever the unit width at this viewport
    const ro = new ResizeObserver(() => {
      track.style.setProperty("--marquee-duration", `${unit.offsetWidth / SPEED}s`);
    });
    ro.observe(unit);
    const io = new IntersectionObserver(([entry]) => {
      track.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    });
    io.observe(track);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const unit = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "clamp(40px, calc(4.1667 * var(--u)), 96px)", paddingRight: "clamp(120px, calc(12.5 * var(--u)), 288px)" }}>
      {MARQUEE_TEXT}
      <Image
        src="/spark.png"
        alt=""
        width={370}
        height={373}
        // 0.72em of --text-marquee: 72px on phones, 242px at its cap
        sizes="(max-width: 640px) 72px, 242px"
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
    <div aria-hidden="true" style={{ overflow: "hidden", position: "relative" }}>
      <div
        ref={trackRef}
        className="footer-marquee-track"
        style={{
          animation: "footer-marquee var(--marquee-duration, 20s) linear infinite",
          display: "inline-flex",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-marquee)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: textColor,
        }}
      >
        <span ref={unitRef} style={{ display: "inline-flex" }}>{unit}</span>
        {unit}{unit}{unit}{unit}{unit}
      </div>
    </div>
  );
}

export default function Footer({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const c = theme === "dark"
    ? {
        bg:         "#0a0a0a",
        borderTop:  "#2a2a2a",
        muted:      "var(--color-text-faint-inverse)",
        linkHover:  "#f8f8f5",
        marquee:    "#f8f8f5",
      }
    : {
        bg:         "#f8f8f5",
        borderTop:  "#e0e0da",
        muted:      "var(--color-text-faint)",
        linkHover:  "#0a0a0a",
        marquee:    "#0a0a0a",
      };

  return (
    <footer
      style={{
        background: c.bg,
        borderTop: `0.5px solid ${c.borderTop}`,
        paddingTop: "var(--space-xl)",
        overflow: "hidden",
      }}
    >
      {/* ── Top row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 max(var(--page-x), calc((100% - var(--content-max)) / 2))",
          marginBottom: "clamp(48px, calc(5.2083 * var(--u)), 120px)",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          // Server-rendered at build time; tolerate the year ticking over before a rebuild
          suppressHydrationWarning
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-caption)",
            color: c.muted,
            letterSpacing: "0.02em",
          }}
        >
          © {new Date().getFullYear()} Niko Yoga Pranata
        </span>

        <nav style={{ display: "flex", gap: "clamp(20px, calc(2.5 * var(--u)), 58px)" }}>
          {LINKS.map((label) => (
            <Link
              key={label}
              href={HREF[label]}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "var(--text-caption)",
                color: c.muted,
                textDecoration: "none",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "color 0.2s ease",
                "--hover-color": c.linkHover,
              } as React.CSSProperties}
              className="hover-to"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Marquee ── */}
      <MarqueeTrack textColor={c.marquee} />
    </footer>
  );
}
