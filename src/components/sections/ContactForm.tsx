"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DURATION, EASE, reveal } from "@/lib/motion";
import { EMAIL } from "@/lib/site";

// Right column of /contact: the form posts to /api/contact (Resend) and shows sending/error/sent states
export default function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Your message could not be sent.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your message could not be sent.");
      setStatus("error");
    }
  };

  return (
    <motion.div
      {...reveal({ from: "right", order: 2 })}
    >
      {status === "sent" ? (
        <div role="status" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
          <span style={{
            fontSize: "3rem",
            color: "var(--color-accent-primary)",
            lineHeight: 1,
          }}>
            ✓
          </span>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "max(1.125rem, var(--text-h5))",
            color: "var(--color-text)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Message sent. I&apos;ll be in touch soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, calc(1.4583 * var(--u)), 34px)" }}
        >
          {/* Honeypot — hidden from people, filled by bots */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={fields.company}
            onChange={(e) => setFields(f => ({ ...f, company: e.target.value }))}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />

          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="contact-name" style={LABEL_STYLE}>Name</label>
            <input
              id="contact-name"
              className="contact-field"
              type="text"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Your name"
              value={fields.name}
              onChange={(e) => setFields(f => ({ ...f, name: e.target.value }))}
              style={INPUT_STYLE}
            />
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="contact-email" style={LABEL_STYLE}>Email</label>
            <input
              id="contact-email"
              className="contact-field"
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={200}
              placeholder="your@email.com"
              value={fields.email}
              onChange={(e) => setFields(f => ({ ...f, email: e.target.value }))}
              style={INPUT_STYLE}
            />
          </div>

          {/* Subject */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="contact-subject" style={LABEL_STYLE}>Subject</label>
            <input
              id="contact-subject"
              className="contact-field"
              type="text"
              name="subject"
              maxLength={200}
              placeholder="What's this about?"
              value={fields.subject}
              onChange={(e) => setFields(f => ({ ...f, subject: e.target.value }))}
              style={INPUT_STYLE}
            />
          </div>

          {/* Message */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="contact-message" style={LABEL_STYLE}>Message</label>
            <textarea
              id="contact-message"
              className="contact-field"
              rows={5}
              name="message"
              required
              maxLength={5000}
              placeholder="Tell me about your project..."
              value={fields.message}
              onChange={(e) => setFields(f => ({ ...f, message: e.target.value }))}
              style={{ ...INPUT_STYLE, resize: "none" }}
            />
          </div>

          {status === "error" && (
            <p role="alert" style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-body)",
              color: "var(--color-accent-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}>
              {error} Please try again, or email me at{" "}
              <a href={`mailto:${EMAIL}`} style={{ color: "inherit" }}>
                {EMAIL}
              </a>.
            </p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={status === "sending"}
            whileHover={{ backgroundColor: "var(--color-accent-primary)", gap: "1.54em" }}
            transition={{ duration: DURATION.fast, ease: EASE }}
            style={{
              marginTop: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.92em",
              background: "var(--color-bg-dark)",
              color: "var(--color-text-inverse)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--text-label)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              padding: "1.23em 2.46em",
              border: "none",
              cursor: status === "sending" ? "wait" : "pointer",
              opacity: status === "sending" ? 0.6 : 1,
              alignSelf: "flex-start",
            }}
          >
            {status === "sending" ? "Sending…" : "Send Message →"}
          </motion.button>
        </form>
      )}
      <style>{`
        input::placeholder, textarea::placeholder { color: var(--color-text-faint); }
        .contact-field {
          border-bottom: 1px solid var(--color-line-strong) !important;
          outline: none;
          transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
        }
        /* 2px accent underline: visible focus without shifting layout */
        .contact-field:focus-visible {
          border-bottom-color: var(--color-accent-primary) !important;
          box-shadow: 0 1px 0 0 var(--color-accent-primary);
        }
      `}</style>
    </motion.div>
  );
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-label)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "var(--color-text-faint)",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  padding: "0.75rem 0",
  fontFamily: "var(--font-display)",
  fontSize: "var(--text-body)",
  color: "var(--color-text)",
};
