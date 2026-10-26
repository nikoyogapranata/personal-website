import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/sections/ContactForm";
import Footer from "@/components/sections/Footer";
import { EASE } from "@/lib/motion";
import { EMAIL, RESUME_PATH, SOCIAL } from "@/lib/site";

const LINKS = [
  { label: EMAIL,             href: `mailto:${EMAIL}` },
  { label: "LinkedIn",        href: SOCIAL.linkedin, target: "_blank" },
  { label: "GitHub",          href: SOCIAL.github,   target: "_blank" },
  { label: "Download Resume", href: RESUME_PATH,     target: "_blank" },
];

export default function ContactPage() {
  return (
    <>
      <main
        style={{
          background: "var(--color-bg)",
          minHeight: "100vh",
          padding: "clamp(110px, 14vw, 180px) clamp(32px, 6vw, 80px) clamp(80px, 10vw, 140px)",
        }}
      >
        {/* Smaller than /about and /work: CONTACT is a longer word and must leave room for the asterisk */}
        <PageHeader
          title="CONTACT"
          fontSize="clamp(80px, 14vw, 220px)"
          mobileFontSize="clamp(44px, 12vw, 88px)"
        />

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
          <Reveal
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
              color: "var(--color-text)",
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
              color: "var(--color-text-faint)",
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
                <a
                  key={href}
                  href={href}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textDecoration: "none",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "clamp(14px, 1.4vw, 18px)",
                    color: "var(--color-text)",
                    transition: "color 0.2s ease, transform 0.2s ease",
                  }}
                  className="hover-accent hover-nudge"
                >
                  <span aria-hidden="true" style={{ fontSize: "0.85em", opacity: 0.5 }}>↗</span>
                  {label}
                </a>
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
                color: "var(--color-text-faint)",
              }}>
                Available for work
              </span>
            </div>
          </Reveal>

          {/* ── RIGHT — contact form ── */}
          <ContactForm />
        </div>

        <style>{`
          @media (max-width: 768px) {
            .contact-page-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>

      <Footer theme="light" />
    </>
  );
}
