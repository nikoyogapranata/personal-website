"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PROJECTS } from "@/lib/projects";
import { EASE } from "@/lib/motion";

const INFO: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 400,
  fontSize: "clamp(13px, 1.2vw, 16px)",
  letterSpacing: "0.02em",
  color: "var(--color-text-muted)",
};

// /work project grid: hovering or focusing one card dims the others
export default function WorkGrid() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <>
      {/* ── Project grid ── */}
      <div
        className="work-page-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(32px, 4vw, 56px) clamp(32px, 4vw, 56px)",
        }}
      >
        {PROJECTS.map((project, i) => {
          const isHovered = hoveredId === project.id;
          const isDimmed = hoveredId !== null && !isHovered;

          return (
            <motion.a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              data-reveal
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.12 + i * 0.09,
                ease: EASE,
              }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(project.id)}
              onBlur={() => setHoveredId(null)}
              style={{
                display: "block",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {/* ── Info row ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  marginBottom: "clamp(8px, 1vw, 14px)",
                }}
              >
                <span
                  style={{
                    ...INFO,
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.01em",
                    textTransform: "uppercase",
                    flex: 1,
                  }}
                >
                  {project.title}
                </span>
                <span style={{ ...INFO, flex: 1, textAlign: "center" }}>
                  {project.year}
                </span>
                <span style={{ ...INFO, flex: 1, textAlign: "right" }}>
                  {project.category}
                </span>
              </div>

              {/* ── Image container ── */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  background: "var(--color-bg)",
                }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isHovered ? 0.95 : 1,
                    filter: isDimmed ? "grayscale(100%)" : "grayscale(0%)",
                  }}
                  transition={{ duration: 1.0, ease: EASE }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={i < 2}
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                    }}
                  />

                  <motion.div
                    initial={false}
                    animate={{ opacity: isHovered ? 0.22 : 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "#000",
                      pointerEvents: "none",
                    }}
                  />
                </motion.div>
              </div>
            </motion.a>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .work-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
