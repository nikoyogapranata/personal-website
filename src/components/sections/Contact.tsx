"use client";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Contact() {
  return (
    <section
      id="contact"
      style={{
        background: "#0a0a0a",
        padding: "clamp(80px, 10vw, 140px) clamp(32px, 6vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Headline ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "clamp(40px, 5vw, 80px)",
        }}
      >
        {/* Text lines */}
        <div>
          {(["LET'S", "WORK TOGETHER"] as const).map((line, i) => (
            <div key={line} style={{ overflow: "hidden" }}>
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease }}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(52px, 9vw, 140px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                  color: "#f8f8f5",
                  display: "block",
                }}
              >
                {line}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Spark image — fills the full height of the headline block */}
        <motion.img
          src="/spark-2.png"
          alt=""
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          style={{
            flexShrink: 0,
            display: "block",
            /* two lines × lineHeight 0.95 */
            height: "calc(clamp(52px, 9vw, 140px) * 1.9)",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease }}
        style={{
          height: "0.5px",
          background: "#2a2a2a",
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
            color: "#aaa",
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
                (e.currentTarget as HTMLAnchorElement).style.color = "#2563eb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#f8f8f5";
              }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(16px, 1.8vw, 28px)",
                color: "#f8f8f5",
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

        {/* Col 3 — GET IN TOUCH box */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <motion.a
            href="/contact"
            whileHover={{ background: "#f8f8f5", color: "#0a0a0a" }}
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
              color: "#f8f8f5",
              background: "transparent",
              border: "1.5px solid #f8f8f5",
              borderRadius: 0,
              padding: "clamp(20px, 2vw, 28px) clamp(32px, 3.2vw, 52px)",
              textDecoration: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Get in Touch
          </motion.a>
        </motion.div>
      </div>

      {/* ── Mobile overrides ─────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
