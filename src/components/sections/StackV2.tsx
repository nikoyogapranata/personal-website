"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import StickerPeel from "@/components/ui/StickerPeel";
import { TECH_STICKERS, type StickerData } from "@/lib/stickerUtils";

// 1. Simplified StickerRow (Removed whileInView since parent controls entrance now)
function StickerRow({
  label,
  stickers,
}: {
  label: string;
  stickers: StickerData[];
}) {
  return (
    <div
      style={{
        position: "relative",
        borderTop: "0.5px solid #222",
        padding: "60px 0 60px 140px",
        minHeight: "220px",
        overflow: "visible",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 40,
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          transformOrigin: "center",
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "#444",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      <div style={{ position: "relative", height: 200, overflow: "visible" }}>
        {stickers.map((s) => (
          <StickerPeel
            key={s.name}
            imageSrc={s.img}
            width={80}
            rotate={s.rotate}
            peelBackHoverPct={35}
            peelBackActivePct={45}
            shadowIntensity={0.8}
            lightingIntensity={0.15}
            initialPosition={{ x: s.x, y: s.y }}
            peelDirection={s.peelDirection}
          />
        ))}
      </div>
    </div>
  );
}

export default function StackV2() {
  const sectionRef = useRef<HTMLElement>(null);

  // 2. Track the entire 300vh runway
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"], // Start pinning at top, end pinning at bottom
  });

  // 3. SEQUENCE 1: The Title Animation (happens from 0% to 40% of the scroll)
  const titleSize = useTransform(scrollYProgress, [0, 0.4], ["15vw", "5vw"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 1, 1]);
  // Start the title in the middle of the screen (40vh) and move it to the top (10vh)
  const titleY = useTransform(scrollYProgress, [0, 0.4], ["40vh", "10vh"]);

  // 4. SEQUENCE 2: The Content Animation (happens from 40% to 100% of the scroll)
  // Starts pushed down below the viewport (100vh), slides up smoothly
  const contentY = useTransform(scrollYProgress, [0.35, 1], ["100vh", "0vh"]);
  const contentOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

  const frontend = TECH_STICKERS.filter((s) => s.cat === "frontend");
  const backend = TECH_STICKERS.filter((s) => s.cat === "backend");
  const tools = TECH_STICKERS.filter((s) => s.cat === "tools");

  return (
    <section
      ref={sectionRef}
      id="tech-stack"
      style={{
        position: "relative",
        background: "#0a0a0a",
        // The scroll runway: increase this if you want the user to scroll for even longer
        height: "300vh", 
      }}
    >
      {/* 5. The Sticky Camera Frame */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh", // Exactly one screen height
          overflow: "hidden",
        }}
      >
        {/* grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: [
              "linear-gradient(#1a1a1a 1px, transparent 1px)",
              "linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "40px 40px",
            opacity: 0.4,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
          
          {/* Scroll-driven title */}
          <motion.h2
            style={{
              position: "absolute",
              width: "100%",
              textAlign: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: titleSize,
              color: "#f8f8f5",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              lineHeight: 1,
              opacity: titleOpacity,
              y: titleY,
              margin: 0,
            }}
          >
            Tools of the
            <br />
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "#2563eb",
              }}
            >
              Trade
            </span>
          </motion.h2>

          {/* Scroll-driven sticker rows */}
          <motion.div
            style={{
              y: contentY,
              opacity: contentOpacity,
              display: "flex",
              flexDirection: "column",
              padding: "0 60px 80px",
              // Push it down below where the sticky title ends up
              paddingTop: "35vh",
            }}
          >
            <StickerRow label="Frontend" stickers={frontend} />
            <StickerRow label="Backend" stickers={backend} />
            <StickerRow label="Tools" stickers={tools} />
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}