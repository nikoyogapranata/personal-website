"use client";

import {
  useTransform,
  motion,
  useMotionValue,
  useSpring,
  MotionValue,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import React from "react";
import Image from "next/image";

/* ── tokens ──────────────────────────────────────────────────── */
const B = "1.5px solid #0a0a0a";
const BG = "#f8f8f5";
const DARK = "#0a0a0a";
const CRIMSON = "var(--color-accent-secondary)";
const SHADOW = "2px 2px 0px #0a0a0a";

const TEXT: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "var(--text-hero)",
  letterSpacing: "-0.03em",
  textTransform: "uppercase",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const CARD: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "var(--hero-card-h)",
  border: B,
  background: BG,
  display: "flex",
  alignItems: "center",
  gap: "clamp(12px, calc(1.0417 * var(--u)), 24px)",
  padding: "0 clamp(16px, calc(1.4583 * var(--u)), 34px)",
  overflow: "hidden",
  boxShadow: SHADOW,
};

function serif(color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-serif)",
    fontWeight: 400,
    fontStyle: "italic",
    fontSize: "calc(var(--text-hero) * 1.1)",
    color,
    lineHeight: 1,
    whiteSpace: "nowrap",
    textTransform: "none",
    letterSpacing: "-0.01em",
  };
}


/* ── hover push wrapper component ────────────────────────────── */
interface HoverPushCardProps {
  children: React.ReactNode;
  style: React.CSSProperties;
  scrollX: MotionValue<string>;
  scrollY: MotionValue<string>;
  scrollRotate: MotionValue<number>;
  /** Resting tilt, used instead of the scroll animation under reduced motion */
  restRotate: number;
}

function HoverPushCard({
  children,
  style,
  scrollX,
  scrollY,
  scrollRotate,
  restRotate,
}: HoverPushCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  // Local mouse coordinates relative to the card's center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement with a spring physics configuration
  const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
  const pushX = useSpring(mouseX, springConfig);
  const pushY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Find the cursor position relative to the middle of the card (ranges from -0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    // Push direction calculation: Move in the OPPOSITE direction of the cursor.
    mouseX.set(relativeX * -35);
    mouseY.set(relativeY * -25);
  };

  const handleMouseLeave = () => {
    // Snap back to absolute zero center point when mouse leaves
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        x: reduceMotion ? 0 : scrollX,
        y: reduceMotion ? 0 : scrollY,
        rotate: reduceMotion ? restRotate : scrollRotate,
        translateX: pushX, // layer local offset alongside global positioning transforms
        translateY: pushY,
      }}
      whileHover={{ zIndex: 10 }}
      transition={{ type: "spring", stiffness: 60, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

/* ── hero ────────────────────────────────────────────────────── */
/** progress: 0 → 1 over the hero's scroll driver in page.tsx */
export default function Hero({ progress }: { progress: MotionValue<number> }) {
  const reduceMotion = usePrefersReducedMotion();

  const box1Y = useTransform(progress, [0, 1], ["0%", "-300%"]);
  const box1X = useTransform(progress, [0, 1], ["0%", "80%"]);
  const box1Rotate = useTransform(progress, [0, 1], [-1.8, -25]);

  const box2Y = useTransform(progress, [0, 1], ["0%", "-300%"]);
  const box2X = useTransform(progress, [0, 1], ["0%", "-80%"]);
  const box2Rotate = useTransform(progress, [0, 1], [1, 20]);

  const box3Y = useTransform(progress, [0, 1], ["0%", "300%"]);
  const box3X = useTransform(progress, [0, 1], ["0%", "80%"]);
  const box3Rotate = useTransform(progress, [0, 1], [-0.6, -20]);

  const box4Y = useTransform(progress, [0, 1], ["0%", "300%"]);
  const box4X = useTransform(progress, [0, 1], ["0%", "-80%"]);
  const box4Rotate = useTransform(progress, [0, 1], [1.4, 25]);

  const heroScale = useTransform(progress, [0, 1], [1, 4.5]);
  const heroOpacity = useTransform(progress, [0.4, 0.6], [1, 0]);
  const heroBlur = useTransform(progress, [0.3, 0.6], [0, 14]);
  const heroFilter = useTransform(heroBlur, (b) => `blur(${b}px)`);

  return (
    <motion.section
      style={{
        // Reduced motion: no zoom or blur, just the fade
        scale: reduceMotion ? 1 : heroScale,
        opacity: heroOpacity,
        filter: reduceMotion ? "none" : heroFilter,
        transformOrigin: "center center",
        background: "transparent",
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <style>{`
        .hero-boxes {
          transform-origin: center center;
          /* Card spacing scales with the hero text, written as (px at 1920×1080) / 19.2 */
          --hu: min(var(--u), 23.04px);               /* same 1.2× cap as --text-hero */
          --hero-card-h: max(calc(var(--text-hero) * 170 / 78), min(100px, 13svh));
          --hero-gap-xs: calc(var(--hu) * 4 / 19.2);
          --hero-gap-s: calc(var(--hu) * 12 / 19.2);
          --hero-gap-m: calc(var(--hu) * 14 / 19.2);
          --hero-gap: calc(var(--hu) * 16 / 19.2);
          --hero-gap-l: calc(var(--hu) * 18 / 19.2);
          --hero-lift: calc(var(--hu) * -9 / 19.2); /* optical baseline for the serif words */
          --hero-badge: max(0.8125rem, calc(var(--hu) * 16 / 19.2));
        }
        /* Phones keep their fixed spacing; the whole stack is scaled down instead */
        @media (max-width: 640px) {
          .hero-boxes {
            --hero-card-h: 100px; --hero-gap-xs: 4px; --hero-gap-s: 12px; --hero-gap-m: 14px;
            --hero-gap: 16px; --hero-gap-l: 18px; --hero-lift: -9px; --hero-badge: 16px;
          }
        }
        @media (max-width: 640px) { .hero-boxes { transform: scale(0.86); } }
        @media (max-width: 520px) { .hero-boxes { transform: scale(0.74); } }
        @media (max-width: 430px) { .hero-boxes { transform: scale(0.64); } }
        @media (max-width: 380px) { .hero-boxes { transform: scale(0.56); } }
      `}</style>
      <div
        className="hero-boxes"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(6px, calc(0.625 * var(--u)), 14px)",
          width: "100%",
          maxWidth: 'min(1100px, 94vw)',
        }}
      >
        {/* Box 1 — white background variant */}
        <HoverPushCard
          scrollX={box1X}
          scrollY={box1Y}
          scrollRotate={box1Rotate}
          restRotate={-1.8}
          style={{
            ...CARD,
            width: "fit-content",
            background: "#ffffff", 
            border: `1.5px solid ${DARK}`,
            zIndex: 4,
            pointerEvents: "auto",
          }}
        >
          {/* Spark image asset */}
          <div
            style={{
              height: "0.85em",
              width: "0.85em",
              fontSize: "var(--text-hero)",
              flexShrink: 0,
              marginRight: "var(--hero-gap)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/spark.png"
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Text container — the page's h1 */}
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--hero-gap)",
              margin: 0,
              font: "inherit",
            }}
          >
            <span style={{ ...TEXT, color: DARK }}>I&apos;m</span>
            <span style={{ ...TEXT, color: DARK }}>NIKO</span>
            <span style={{ ...TEXT, color: DARK, marginRight: "var(--hero-gap-s)" }}>
              YOGA
            </span>
            <span style={{ ...serif(DARK), transform: "translateY(var(--hero-lift))" }}>
              Pranata
            </span>
          </h1>

          {/* Landscape hero image */}
          <div
            style={{
              height: "0.9em",
              fontSize: "var(--text-hero)",
              width: "1.6em",
              flexShrink: 0,
              borderRadius: "var(--hero-gap-s)",
              overflow: "hidden",
              marginLeft: "var(--hero-gap-s)",
            }}
          >
            <Image
              src="/hero.jpeg"
              alt="Portrait of Niko Pranata"
              width={1280}
              height={1600}
              sizes="160px"
              priority
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                transform: "scale(1.2)",
                display: "block",
              }}
            />
          </div>
        </HoverPushCard>

        {/* Box 2 — dark inverted variant */}
        <HoverPushCard
          scrollX={box2X}
          scrollY={box2Y}
          scrollRotate={box2Rotate}
          restRotate={1}
          style={{
            ...CARD,
            width: "fit-content",
            background: "var(--color-accent-primary)",
            border: `1.5px solid ${DARK}`,
            zIndex: 3,
            pointerEvents: "auto",
          }}
        >
          {/* Text layout */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hero-gap)" }}>
            <span style={{ ...serif(BG), transform: "translateY(var(--hero-lift))" }}>
              Frontend
            </span>
            <span style={{ ...TEXT, color: BG, marginLeft: "var(--hero-gap-xs)" }}>WEB</span>
            <span style={{ ...TEXT, color: BG }}>DEVELOPER</span>
          </div>

          {/* Scaled up Dev Sign SVG */}
          <svg
            viewBox="0 0 26 24"
            fill="none"
            stroke={BG}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              height: "1.05em",
              width: "auto",
              fontSize: "var(--text-hero)",
              marginLeft: "var(--hero-gap-l)",
              flexShrink: 0,
              display: "block",
            }}
          >
            <polyline points="7 6 2 12 7 18" />
            <line x1="15" y1="4" x2="11" y2="20" />
            <polyline points="19 18 24 12 19 6" />
          </svg>
        </HoverPushCard>

        {/* Box 3 — crimson location variant */}
        <HoverPushCard
          scrollX={box3X}
          scrollY={box3Y}
          scrollRotate={box3Rotate}
          restRotate={-0.6}
          style={{
            ...CARD,
            width: "fit-content",
            background: CRIMSON,
            border: `1.5px solid ${DARK}`,
            zIndex: 2,
            pointerEvents: "auto",
          }}
        >
          {/* Custom location.png image asset matching text height */}
          <div
            style={{
              height: "0.85em",
              width: "0.85em",
              fontSize: "var(--text-hero)",
              flexShrink: 0,
              marginRight: "var(--hero-gap-s)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/location.png"
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Unified container using flex stretching to match height perfectly */}
          <div style={{ display: "flex", alignItems: "stretch", gap: "var(--hero-gap)" }}>
            {/* Text block that sets the layout height */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--hero-gap)" }}>
              <span style={{ ...TEXT, color: "#ffffff" }}>BASED</span>
              <span style={{ ...TEXT, color: "#ffffff" }}>IN</span>
              <span
                style={{ ...serif("#ffffff"), transform: "translateY(var(--hero-lift))" }}
              >
                Yogyakarta
              </span>
            </div>

            {/* Indonesia container box */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "var(--hero-badge)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: DARK,
                background: "#ffffff",
                border: `1.5px solid ${DARK}`,
                borderRadius: "var(--hero-gap-s)",
                padding: "0 1.25em",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginLeft: "var(--hero-gap)",
              }}
            >
              INDONESIA
            </span>
          </div>
        </HoverPushCard>

        {/* Box 4 — cream editorial availability variant */}
        <HoverPushCard
          scrollX={box4X}
          scrollY={box4Y}
          scrollRotate={box4Rotate}
          restRotate={1.4}
          style={{
            ...CARD,
            width: "fit-content",
            background: "#ffffff",
            border: `1.5px solid ${DARK}`,
            zIndex: 1,
            pointerEvents: "auto",
          }}
        >
          {/* Layout alignment container */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--hero-gap-m)" }}>
            {/* Custom up-right-arrow.png image asset matching text height */}
            <div
              style={{
                height: "0.7em", 
                width: "0.7em",  
                fontSize: "var(--text-hero)",
                flexShrink: 0,
                marginRight: "var(--hero-gap)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/up-right-arrow.png"
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <span style={{ ...TEXT, color: DARK }}>CURRENTLY</span>
            <span style={{ ...serif(DARK), transform: "translateY(var(--hero-lift))" }}>Open</span>
            <span style={{ ...TEXT, color: DARK }}>TO WORK</span>
          </div>
        </HoverPushCard>
      </div>
    </motion.section>
  );
}