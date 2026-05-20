"use client";

import {
  useScroll,
  useTransform,
  motion,
  useMotionValue,
  useSpring,
  MotionValue,
} from "framer-motion";
import React from "react";

/* ── tokens ──────────────────────────────────────────────────── */
const B = "1.5px solid #0a0a0a";
const BG = "#f8f8f5";
const DARK = "#0a0a0a";
const BLUE = "#2563eb";
const SHADOW = "2px 2px 0px #0a0a0a";

const TEXT: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "clamp(38px, 5.2vw, 78px)",
  letterSpacing: "-0.03em",
  textTransform: "uppercase",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const CARD: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: 170,
  border: B,
  background: BG,
  display: "flex",
  alignItems: "center",
  gap: 20,
  padding: "0 28px",
  overflow: "hidden",
  boxShadow: SHADOW,
};

function serif(color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-serif)",
    fontWeight: 400,
    fontStyle: "italic",
    fontSize: "calc(clamp(38px, 5.2vw, 78px) * 1.1)",
    color,
    lineHeight: 1,
    whiteSpace: "nowrap",
    textTransform: "none",
    letterSpacing: "-0.01em",
  };
}

/* ── rectangle profile image ─────────────────────────────────── */
function ProfileImg() {
  return (
    <div
      style={{
        height: 130,
        width: 110,
        flexShrink: 0,
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/profile.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
          filter: "grayscale(100%)",
          display: "block",
        }}
      />
    </div>
  );
}

/* ── hover push wrapper component ────────────────────────────── */
interface HoverPushCardProps {
  children: React.ReactNode;
  style: React.CSSProperties;
  scrollX: MotionValue<string>;
  scrollY: MotionValue<string>;
  scrollRotate: MotionValue<number>;
}

function HoverPushCard({
  children,
  style,
  scrollX,
  scrollY,
  scrollRotate,
}: HoverPushCardProps) {
  // Local mouse coordinates relative to the card's center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement with a spring physics configuration
  const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
  const pushX = useSpring(mouseX, springConfig);
  const pushY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
        x: scrollX,
        y: scrollY,
        rotate: scrollRotate,
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
export default function Hero() {
  const { scrollYProgress } = useScroll();

  const box1Y = useTransform(scrollYProgress, [0, 0.8], ["0%", "-300%"]);
  const box1X = useTransform(scrollYProgress, [0, 0.8], ["0%", "80%"]);
  const box1Rotate = useTransform(scrollYProgress, [0, 0.8], [-1.8, -25]);

  const box2Y = useTransform(scrollYProgress, [0, 0.8], ["0%", "-300%"]);
  const box2X = useTransform(scrollYProgress, [0, 0.8], ["0%", "-80%"]);
  const box2Rotate = useTransform(scrollYProgress, [0, 0.8], [1, 20]);

  const box3Y = useTransform(scrollYProgress, [0, 0.8], ["0%", "300%"]);
  const box3X = useTransform(scrollYProgress, [0, 0.8], ["0%", "80%"]);
  const box3Rotate = useTransform(scrollYProgress, [0, 0.8], [-0.6, -20]);

  const box4Y = useTransform(scrollYProgress, [0, 0.8], ["0%", "300%"]);
  const box4X = useTransform(scrollYProgress, [0, 0.8], ["0%", "-80%"]);
  const box4Rotate = useTransform(scrollYProgress, [0, 0.8], [1.4, 25]);

  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 2.4]);
  const heroOpacity = useTransform(scrollYProgress, [0.5, 0.85], [1, 0]);
  const heroBlur = useTransform(scrollYProgress, [0.4, 0.85], [0, 12]);
  const heroFilter = useTransform(heroBlur, (b) => `blur(${b}px)`);

  return (
    <motion.section
      style={{
        scale: heroScale,
        opacity: heroOpacity,
        filter: heroFilter,
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // FIXED: Forces all varied width child blocks to snap perfectly to the center axis
          gap: 12,
          width: "100%",        // Changed from max-content to allow flex center matching mechanics
          maxWidth: "98vw",
        }}
      >
        {/* Box 1 — white background variant */}
        <HoverPushCard
          scrollX={box1X}
          scrollY={box1Y}
          scrollRotate={box1Rotate}
          style={{
            ...CARD,
            width: "fit-content",
            background: "#ffffff", 
            border: `1.5px solid ${DARK}`,
            zIndex: 4,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        >
          {/* Spark image asset */}
          <div
            style={{
              height: "0.85em",
              width: "0.85em",
              fontSize: "clamp(38px, 5.2vw, 78px)",
              flexShrink: 0,
              marginRight: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/spark.png"
              alt="Spark"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Text container */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span style={{ ...TEXT, color: DARK }}>I&apos;m</span>
            <span style={{ ...TEXT, color: DARK }}>NIKO</span>
            <span style={{ ...TEXT, color: DARK, marginRight: "12px" }}>
              YOGA
            </span>
            <span style={{ ...serif(DARK), transform: "translateY(-9px)" }}>
              Pranata
            </span>
          </div>

          {/* Landscape hero image */}
          <div
            style={{
              height: "0.9em",
              fontSize: "clamp(38px, 5.2vw, 78px)",
              width: "1.6em",
              flexShrink: 0,
              borderRadius: "12px",
              overflow: "hidden",
              marginLeft: "12px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero.jpeg"
              alt="Hero"
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
          style={{
            ...CARD,
            width: "fit-content",
            background: DARK,
            border: `1.5px solid ${DARK}`,
            zIndex: 3,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        >
          {/* Text layout */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ ...serif(BG), transform: "translateY(-9px)" }}>
              Front End
            </span>
            <span style={{ ...TEXT, color: BG, marginLeft: "4px" }}>WEB</span>
            <span style={{ ...TEXT, color: BG }}>DEVELOPER</span>
          </div>

          {/* Scaled up Dev Sign SVG */}
          <svg
            viewBox="0 0 26 24"
            fill="none"
            stroke={BLUE}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              height: "1.05em",
              width: "auto",
              fontSize: "clamp(38px, 5.2vw, 78px)",
              marginLeft: "18px",
              flexShrink: 0,
              display: "block",
            }}
          >
            <polyline points="7 6 2 12 7 18" />
            <line x1="15" y1="4" x2="11" y2="20" />
            <polyline points="19 18 24 12 19 6" />
          </svg>
        </HoverPushCard>

        {/* Box 3 — vibrant blue location variant */}
        <HoverPushCard
          scrollX={box3X}
          scrollY={box3Y}
          scrollRotate={box3Rotate}
          style={{
            ...CARD,
            width: "fit-content",
            background: BLUE,
            border: `1.5px solid ${DARK}`,
            zIndex: 2,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        >
          {/* Custom location.png image asset matching text height */}
          <div
            style={{
              height: "0.85em",
              width: "0.85em",
              fontSize: "clamp(38px, 5.2vw, 78px)",
              flexShrink: 0,
              marginRight: "12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/location.png"
              alt="Location"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Unified container using flex stretching to match height perfectly */}
          <div style={{ display: "flex", alignItems: "stretch", gap: "16px" }}>
            {/* Text block that sets the layout height */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ ...TEXT, color: "#ffffff" }}>BASED</span>
              <span style={{ ...TEXT, color: "#ffffff" }}>IN</span>
              <span
                style={{ ...serif("#ffffff"), transform: "translateY(-9px)" }}
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
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: DARK,
                background: "#ffffff",
                border: `1.5px solid ${DARK}`,
                borderRadius: "12px",
                padding: "0 20px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginLeft: "16px",
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
          style={{
            ...CARD,
            width: "fit-content",
            background: "#ffffff",
            border: `1.5px solid ${DARK}`,
            zIndex: 1,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        >
          {/* Layout alignment container */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Custom up-right-arrow.png image asset matching text height */}
            <div
              style={{
                height: "0.7em", 
                width: "0.7em",  
                fontSize: "clamp(38px, 5.2vw, 78px)", 
                flexShrink: 0,
                marginRight: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/up-right-arrow.png"
                alt="Arrow Top Right"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <span style={{ ...TEXT, color: DARK }}>CURRENTLY</span>
            <span style={{ ...serif(DARK), transform: "translateY(-9px)" }}>Open</span>
            <span style={{ ...TEXT, color: DARK }}>TO WORK</span>
          </div>
        </HoverPushCard>
      </div>
    </motion.section>
  );
}