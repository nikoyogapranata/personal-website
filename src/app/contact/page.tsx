"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Footer from "@/components/sections/Footer";

const EASE = [0.16, 1, 0.3, 1] as const;

const LINKS = [
  { label: "nikopranatabusiness@gmail.com", href: "mailto:nikopranatabusiness@gmail.com" },
  { label: "LinkedIn",        href: "https://linkedin.com/in/nikoyogapranata", target: "_blank" },
  { label: "GitHub",          href: "https://github.com/nikoyogapranata",      target: "_blank" },
  { label: "Download Resume", href: "/resume.pdf",                             target: "_blank" },
];

export default function ContactPage() {
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to email service
    setSubmitted(true);
  };

  return (
    <>
      <main
        style={{
          background: "#f8f8f5",
          minHeight: "100vh",
          padding: "clamp(110px, 14vw, 180px) clamp(32px, 6vw, 80px) clamp(80px, 10vw, 140px)",
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
            className="contact-page-title"
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
            CONTACT
          </h1>

          <Image
            src="/spark.png"
            alt=""
            width={260}
            height={260}
            className="contact-page-spark"
            style={{
              height: "clamp(64px, 12vw, 180px)",
              width: "auto",
              objectFit: "contain",
              flexShrink: 0,
              filter: "hue-rotate(40deg) saturate(1.3)",
            }}
          />
        </motion.div>

        {/* ── Two-column grid ── */}
        <div
          className="contact-page-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(48px, 8vw, 120px)",
            alignItems: "start",
          }}
        >
          {/* ── LEFT — contact info ── */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {/* Tagline */}
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 44px)",
              color: "#0a0a0a",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "clamp(24px, 3vw, 40px)",
              marginTop: 0,
            }}>
              Open to freelance projects,{" "}
              <br />
              <span style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--color-accent-secondary)",
              }}>
                internships,
              </span>
              {" "}and collaborations.
            </p>

            {/* Description */}
            <p style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              fontSize: "clamp(14px, 1.3vw, 17px)",
              color: "#888",
              lineHeight: 1.8,
              marginBottom: "clamp(32px, 4vw, 56px)",
              maxWidth: 360,
              marginTop: 0,
            }}>
              Based in Yogyakarta, available remotely.
              I typically respond within 24 hours.
            </p>

            {/* Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {LINKS.map(({ label, href, target }) => (
                <motion.a
                  key={href}
                  href={href}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textDecoration: "none",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "clamp(14px, 1.4vw, 18px)",
                    color: "#0a0a0a",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-accent-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0a0a0a";
                  }}
                >
                  <span style={{ fontSize: "0.85em", opacity: 0.5 }}>↗</span>
                  {label}
                </motion.a>
              ))}
            </div>

            {/* Availability badge */}
            <div style={{
              marginTop: "clamp(32px, 4vw, 48px)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#16a34a",
                animation: "pulse-dot 2s infinite",
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#888",
              }}>
                Available for work
              </span>
            </div>
          </motion.div>

          {/* ── RIGHT — contact form ── */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          >
            {submitted ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
                <span style={{
                  fontSize: 48,
                  color: "var(--color-accent-primary)",
                  lineHeight: 1,
                }}>
                  ✓
                </span>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(18px, 2vw, 26px)",
                  color: "#0a0a0a",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}>
                  Message sent. I&apos;ll be in touch soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 2.5vw, 28px)" }}
              >
                {/* Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={LABEL_STYLE}>Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={fields.name}
                    onChange={(e) => setFields(f => ({ ...f, name: e.target.value }))}
                    style={INPUT_STYLE}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--color-accent-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#d8d5d0"; }}
                  />
                </div>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={LABEL_STYLE}>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={fields.email}
                    onChange={(e) => setFields(f => ({ ...f, email: e.target.value }))}
                    style={INPUT_STYLE}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--color-accent-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#d8d5d0"; }}
                  />
                </div>

                {/* Subject */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={LABEL_STYLE}>Subject</label>
                  <input
                    type="text"
                    placeholder="What's this about?"
                    value={fields.subject}
                    onChange={(e) => setFields(f => ({ ...f, subject: e.target.value }))}
                    style={INPUT_STYLE}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--color-accent-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#d8d5d0"; }}
                  />
                </div>

                {/* Message */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={LABEL_STYLE}>Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell me about your project..."
                    value={fields.message}
                    onChange={(e) => setFields(f => ({ ...f, message: e.target.value }))}
                    style={{ ...INPUT_STYLE, resize: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--color-accent-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#d8d5d0"; }}
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ backgroundColor: "var(--color-accent-primary)", gap: "20px" }}
                  transition={{ duration: 0.2 }}
                  style={{
                    marginTop: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#0a0a0a",
                    color: "#f8f8f5",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    padding: "16px 32px",
                    border: "none",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  Send Message →
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .contact-page-title { font-size: clamp(52px, 16vw, 88px) !important; }
            .contact-page-spark { height: clamp(40px, 11vw, 64px) !important; margin-left: 16px !important; }
          }
          @media (max-width: 768px) {
            .contact-page-grid { grid-template-columns: 1fr !important; }
          }
          input::placeholder, textarea::placeholder { color: #bbb; }
        `}</style>
      </main>

      <Footer theme="light" />
    </>
  );
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "#888",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "0.5px solid #d8d5d0",
  padding: "12px 0",
  fontFamily: "var(--font-display)",
  fontSize: "clamp(15px, 1.4vw, 18px)",
  color: "#0a0a0a",
  outline: "none",
  transition: "border-color 0.2s ease",
};
