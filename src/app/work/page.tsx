"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { PROJECTS } from "@/lib/projects";
import { EASE } from "@/lib/motion";


const INFO: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 400,
  fontSize: "clamp(13px, 1.2vw, 16px)",
  letterSpacing: "0.02em",
  color: "var(--color-text-muted)",
};

export default function WorkPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <>
      <main
        style={{
          background: "var(--color-bg)",
          minHeight: "100vh",
          padding:
            "clamp(110px, 14vw, 180px) clamp(32px, 6vw, 80px) clamp(80px, 10vw, 140px)",
        }}
      >
        {/* ── Title row ── */}
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "clamp(40px, 5vw, 72px)",
          }}
        >
          <h1
            className="work-title"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(88px, 17vw, 260px)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            WORK
          </h1>

          <Image
            src="/spark.png"
            alt=""
            width={260}
            height={260}
            className="work-spark"
            style={{
              height: "clamp(64px, 12vw, 180px)",
              width: "auto",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
        </motion.div>

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
            .work-title     { font-size: clamp(52px, 16vw, 88px) !important; }
            .work-spark     { height: clamp(40px, 11vw, 64px) !important; margin-left: 16px !important; }
          }
        `}</style>
      </main>

      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
