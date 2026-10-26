import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { EASE } from "@/lib/motion";
import TechExperience from "@/components/sections/TechExperience";

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
            gap: "clamp(32px, 4vw, 64px)",
            alignItems: "start",
          }}
        >
          {/* Left — quote + paragraph */}
          <Reveal
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
                  color: "var(--color-text-muted)",
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
                  color: "var(--color-text-muted)",
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
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                I&apos;m currently studying Informatics and looking for a frontend web developer internship where I can work on real products, learn from experienced teams, and contribute something that matters.
              </p>
            </div>
          </Reveal>

          {/* Right — squared hero image */}
          <Reveal
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
