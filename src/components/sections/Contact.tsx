"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { EMAIL, SOCIAL } from "@/lib/site";
import { EASE } from "@/lib/motion";

const MotionLink = motion.create(Link);


export default function Contact({
  theme = "dark",
}: {
  theme?: "dark" | "light";
}) {
  const c =
    theme === "dark"
      ? {
          bg: "#0a0a0a",
          text: "#f8f8f5",
          muted: "#aaa",
          divider: "#2a2a2a",
          linkLeave: "#f8f8f5",
          ctaHoverBg: "#f8f8f5",
          ctaHoverText: "#0a0a0a",
        }
      : {
          bg: "#f8f8f5",
          text: "#0a0a0a",
          muted: "#666",
          divider: "#e0e0da",
          linkLeave: "#0a0a0a",
          ctaHoverBg: "#0a0a0a",
          ctaHoverText: "#f8f8f5",
        };

  return (
    <section
      id="contact"
      style={{
        background: c.bg,
        // Side padding grows past --content-max so the content stays centred on very wide screens
        padding: "var(--section-y) max(var(--page-x), calc((100% - var(--content-max)) / 2))",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Headline ─────────────────────────────────────────────── */}
      <div
        className="contact-headline"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "clamp(40px, calc(4.1667 * var(--u)), 96px)",
        }}
      >
        <h2 style={{ margin: 0, font: "inherit" }}>
          {(["LET'S", "WORK TOGETHER"] as const).map((line, i) => (
            <motion.span
              key={line}
              style={{ overflow: "hidden", display: "block" }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.span data-reveal
                variants={{
                  hidden: { y: "100%", opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
                className="contact-title-line"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-display)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                  color: c.text,
                  display: "block",
                }}
              >
                {line}{i === 0 ? " " : ""}
              </motion.span>
            </motion.span>
          ))}
        </h2>

        <motion.div
          data-reveal
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          className="contact-spark"
          style={{
            position: "relative",
            flexShrink: 0,
            height: "calc(var(--text-display) * 1.9)",
            aspectRatio: "1",
          }}
        >
          {/* 1.9 × --text-display: up to 319px; 56px on phones */}
          <Image
            src="/spark-2.png"
            alt=""
            fill
            sizes="(max-width: 640px) 56px, 320px"
            style={{ objectFit: "contain" }}
          />
        </motion.div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <motion.div
        data-reveal
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        style={{
          height: "0.5px",
          background: c.divider,
          marginBottom: "clamp(40px, calc(4.1667 * var(--u)), 96px)",
          transformOrigin: "left",
        }}
      />

      {/* ── Three-column grid ────────────────────────────────────── */}
      <div
        className="contact-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          columnGap: "var(--space-2xl)",
          rowGap: "clamp(32px, calc(3.125 * var(--u)), 72px)",
          alignItems: "start",
        }}
      >
        {/* Col 1 — description */}
        <motion.p
          data-reveal
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "max(1.125rem, var(--text-h5))",
            lineHeight: 1.7,
            color: c.muted,
            margin: 0,
          }}
        >
          Open to freelance projects and internships. Based in Yogyakarta and
          available remotely, I design it, build it, and ship it - end to end.
        </motion.p>

        {/* Col 2 — email & socials */}
        <motion.div
          data-reveal
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(16px, calc(1.25 * var(--u)), 29px)",
          }}
        >
          {[
            { href: `mailto:${EMAIL}`, label: EMAIL },
            { href: SOCIAL.linkedin, label: "LinkedIn", target: "_blank" },
            { href: SOCIAL.github, label: "GitHub", target: "_blank" },
          ].map(({ href, label, target }) => (
            <motion.a
              key={href}
              href={href}
              target={target}
              rel={target === "_blank" ? "noopener noreferrer" : undefined}
              whileHover={{ x: 8 }}
              transition={{ duration: 0.2 }}
              className="hover-accent"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "var(--text-h5)",
                color: c.linkLeave,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s ease",
              }}
            >
              {label}
            </motion.a>
          ))}
        </motion.div>

        {/* Col 3 — GET IN TOUCH */}
        <motion.div
          data-reveal
          initial={{ x: 30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="contact-cta-col"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <MotionLink
            href="/contact"
            whileHover={{ background: c.ctaHoverBg, color: c.ctaHoverText }}
            transition={{ duration: 0.22 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-small)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: c.text,
              background: "transparent",
              border: `1.5px solid ${c.text}`,
              borderRadius: 0,
              padding: "1.75em 3.25em",
              textDecoration: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Get in Touch
          </MotionLink>
        </motion.div>
      </div>

      {/* ── Mobile overrides ─────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .contact-grid          { grid-template-columns: 1fr !important; gap: 40px !important; }
          .contact-title-line    { font-size: clamp(28px, 9vw, 52px) !important; }
          .contact-spark         { height: 56px !important; width: 56px !important; }
          .contact-cta-col       { justify-content: flex-start !important; }
        }
      `}</style>
    </section>
  );
}
