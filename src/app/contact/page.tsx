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
          padding: "var(--page-top) max(var(--page-x), calc((100% - var(--content-max)) / 2)) var(--section-y)",
        }}
      >
        {/* Smaller than /about and /work: CONTACT is a longer word and must leave room for the asterisk */}
        <PageHeader
          title="CONTACT"
          fontSize="calc(var(--text-title) * 0.8462)"
          mobileFontSize="clamp(44px, 12vw, 88px)"
        />

        {/* ── Two-column grid ── */}
        <div
          className="contact-page-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(48px, calc(6.25 * var(--u)), 144px)",
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
              fontSize: "var(--text-h4)",
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "var(--space-m)",
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
              fontSize: "var(--text-body)",
              color: "var(--color-text-faint)",
              lineHeight: 1.8,
              marginBottom: "var(--space-l)",
              maxWidth: "22.5rem",
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
                    fontSize: "var(--text-body)",
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
              marginTop: "clamp(32px, calc(2.5 * var(--u)), 58px)",
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
                fontSize: "var(--text-label)",
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
          @media (max-width: 900px) {
            .contact-page-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>

      <Footer theme="light" />
    </>
  );
}
