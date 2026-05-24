"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

const EASE = [0.16, 1, 0.3, 1] as const;

const PROJECTS = [
  {
    id: 1,
    title: "JAMUSARI",
    category: "Web · Fullstack",
    year: "2025",
    description: "A fullstack web platform built for modern needs.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    image: "/jamusari.png",
    link: "https://jamusari.com",
    featured: true,
  },
  {
    id: 2,
    title: "HealthSync",
    category: "Web · Fullstack",
    year: "2025",
    description: "Health tracking dashboard with real-time data sync.",
    tags: ["React", "Node.js", "Firebase"],
    image: "/healthsync.png",
    link: "https://healthsync-7.vercel.app",
    featured: false,
  },
  {
    id: 3,
    title: "WETRACK",
    category: "Web · Fullstack",
    year: "2024",
    description: "Collaborative project tracking tool for teams.",
    tags: ["Next.js", "Prisma", "PostgreSQL"],
    image: "/wetrack.png",
    link: "https://github.com/nikoyogapranata/wetrack",
    featured: false,
  },
  {
    id: 4,
    title: "EduNovel",
    category: "Design · Branding",
    year: "2023",
    description: "Brand identity and UI design for an ed-tech startup.",
    tags: ["Figma", "Branding", "UI Design"],
    image: "/edunovel.png",
    link: "https://www.figma.com/proto/cY7vOHUdtTfLDkTYDthI1n/EduNovel?page-id=0%3A1&node-id=2-2397&p=f&viewport=308%2C326%2C0.03&t=n2kiA8gcGTPQdv0j-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A2397&show-proto-sidebar=1",
    featured: false,
  },
];


const INFO: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 400,
  fontSize: "clamp(13px, 1.2vw, 16px)",
  letterSpacing: "0.02em",
  color: "#555",
};

export default function WorkPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <>
      <main
        style={{
          background: "#f8f8f5",
          minHeight: "100vh",
          padding:
            "clamp(110px, 14vw, 180px) clamp(32px, 6vw, 80px) clamp(80px, 10vw, 140px)",
        }}
      >
        {/* ── Title row ── */}
        <motion.div
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
              color: "#0a0a0a",
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
              filter: "hue-rotate(40deg) saturate(1.3)",
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
                    background: "#f8f8f5",
                  }}
                >
                  <motion.div
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
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                      }}
                    />

                    <motion.div
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
