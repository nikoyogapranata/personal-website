"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import TechExperience from "@/components/sections/TechExperience";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AboutPage() {
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
            marginBottom: "clamp(56px, 7vw, 100px)",
          }}
        >
          <h1
            className="about-title"
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
            ABOUT
          </h1>

          <Image
            src="/spark.png"
            alt=""
            width={260}
            height={260}
            className="about-spark"
            style={{
              height: "clamp(64px, 12vw, 180px)",
              width: "auto",
              objectFit: "contain",
              flexShrink: 0,
              filter: "hue-rotate(40deg) saturate(1.3)",
            }}
          />
        </motion.div>

        {/* ── Two-column section ── */}
        <div
          className="about-body"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, 4vw, 64px)",
            alignItems: "start",
          }}
        >
          {/* Left — quote + paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 3vw, 40px)" }}
          >
            {/* Big quote */}
            <blockquote
              style={{
                margin: 0,
                padding: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(28px, 3.6vw, 56px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "#0a0a0a",
                  margin: 0,
                }}
              >
                I build interfaces that feel{" "}
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-accent-secondary)" }}>considered,</span>
                {" "}where every detail has a{" "}
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-accent-secondary)" }}>reason.</span>
              </p>
            </blockquote>

            {/* Paragraph */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "clamp(14px, 1.6vw, 22px)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "clamp(16px, 1.5vw, 20px)",
                  lineHeight: 1.75,
                  color: "#555",
                  margin: 0,
                }}
              >
                I&apos;m Niko Pranata, a CS student and frontend developer based in Yogyakarta, Indonesia. I&apos;ve always been drawn to the parts of design that most people never notice: the easing curve on a transition, the spacing between letters, the moment a layout just clicks into place. Those details are what separate something functional from something that actually feels good to use.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "clamp(16px, 1.5vw, 20px)",
                  lineHeight: 1.75,
                  color: "#555",
                  margin: 0,
                }}
              >
                My work lives at the intersection of design and engineering. I build with Next.js, TypeScript, and Framer Motion, and I bring the same level of care to the code as I do to the visual. Things should work well and feel right. For me those aren&apos;t two separate goals.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "clamp(16px, 1.5vw, 20px)",
                  lineHeight: 1.75,
                  color: "#555",
                  margin: 0,
                }}
              >
                I&apos;m currently studying Informatics and looking for a frontend web developer internship where I can work on real products, learn from experienced teams, and contribute something that matters.
              </p>
            </div>
          </motion.div>

          {/* Right — squared hero image */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: EASE }}
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: "12px",
              background: "#e8e8e5",
            }}
          >
            <Image
              src="/hero.jpeg"
              alt="Niko Pranata"
              fill
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .about-body  { grid-template-columns: 1fr !important; }
            .about-title { font-size: clamp(52px, 16vw, 88px) !important; }
            .about-spark { height: clamp(40px, 11vw, 64px) !important; margin-left: 16px !important; }
          }
        `}</style>
      </main>

      <TechExperience />
      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
