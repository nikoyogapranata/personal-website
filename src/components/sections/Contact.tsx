"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const MotionLink = motion(Link);

const ease = [0.16, 1, 0.3, 1] as const;

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
        padding: "clamp(80px, 10vw, 140px) clamp(32px, 6vw, 80px)",
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
          marginBottom: "clamp(40px, 5vw, 80px)",
        }}
      >
        <div>
          {(["LET'S", "WORK TOGETHER"] as const).map((line, i) => (
            <motion.div
              key={line}
              style={{ overflow: "hidden" }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                variants={{
                  hidden: { y: "100%", opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                transition={{ duration: 0.8, delay: i * 0.1, ease }}
                className="contact-title-line"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(52px, 9vw, 140px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                  color: c.text,
                  display: "block",
                }}
              >
                {line}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/spark-2.png"
          alt=""
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="contact-spark"
          style={{
            flexShrink: 0,
            display: "block",
            height: "calc(clamp(52px, 9vw, 140px) * 1.9)",
            width: "auto",
            objectFit: "contain",
            filter: "none",
          }}
        />
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease }}
        style={{
          height: "0.5px",
          background: c.divider,
          marginBottom: "clamp(40px, 5vw, 80px)",
          transformOrigin: "left",
        }}
      />

      {/* ── Three-column grid ────────────────────────────────────── */}
      <div
        className="contact-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          columnGap: "clamp(64px, 8vw, 120px)",
          rowGap: "clamp(32px, 4vw, 60px)",
          alignItems: "start",
        }}
      >
        {/* Col 1 — description */}
        <motion.p
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(18px, 2vw, 28px)",
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
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(16px, 2vw, 24px)",
          }}
        >
          {[
            {
              href: "mailto:nikopranatabusiness@gmail.com",
              label: "nikopranatabusiness@gmail.com",
            },
            {
              href: "https://linkedin.com/in/nikopranata",
              label: "LinkedIn",
              target: "_blank",
            },
            {
              href: "https://github.com/nikoyogapranata",
              label: "GitHub",
              target: "_blank",
            },
          ].map(({ href, label, target }) => (
            <motion.a
              key={href}
              href={href}
              target={target}
              rel={target === "_blank" ? "noopener noreferrer" : undefined}
              whileHover={{ x: 8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-accent-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  c.linkLeave;
              }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(16px, 1.8vw, 28px)",
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
          initial={{ x: 30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
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
              fontSize: "clamp(13px, 1.1vw, 16px)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: c.text,
              background: "transparent",
              border: `1.5px solid ${c.text}`,
              borderRadius: 0,
              padding: "clamp(20px, 2vw, 28px) clamp(32px, 3.2vw, 52px)",
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
        @media (max-width: 600px) {
          .contact-grid          { grid-template-columns: 1fr !important; gap: 40px !important; }
          .contact-title-line    { font-size: clamp(28px, 9vw, 52px) !important; }
          .contact-spark         { height: 56px !important; width: 56px !important; object-fit: contain !important; }
          .contact-cta-col       { justify-content: flex-start !important; }
        }
      `}</style>
    </section>
  );
}
