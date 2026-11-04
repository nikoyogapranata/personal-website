import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { reveal } from "@/lib/motion";
import TechExperience from "@/components/sections/TechExperience";
import { PROFILE } from "@/data";

export default function AboutPage() {
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
        <PageHeader title="ABOUT" />

        {/* ── Two-column section ── */}
        <div
          className="about-body"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, calc(3.3333 * var(--u)), 77px)",
            alignItems: "start",
          }}
        >
          {/* Left - quote + paragraph */}
          <Reveal
            {...reveal({ onMount: true, order: 1 })}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-m)" }}
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
                  fontSize: "var(--text-h3)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                I build interfaces that feel{" "}
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-accent-secondary)" }}>considered,</span>
                {" "}where every detail has a{" "}
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-accent-secondary)" }}>reason.</span>
              </p>
            </blockquote>

            {/* Paragraphs */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "clamp(14px, calc(1.1458 * var(--u)), 26px)",
              }}
            >
              {PROFILE.bio.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "var(--text-body-lg)",
                    lineHeight: 1.75,
                    color: "var(--color-text-muted)",
                    margin: 0,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          {/* Right - squared hero image */}
          <Reveal
            {...reveal({ onMount: true, order: 2 })}
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
              alt={PROFILE.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </Reveal>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .about-body  { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>

      <TechExperience />
      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
