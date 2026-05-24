'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const TECH = [
  // Languages
  'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'Python', 'PHP', 'Java', 'Swift',
  // Frameworks & Libraries
  'React', 'Next.js', 'Tailwind CSS',
  'Framer Motion', 'Node.js', 'Express',
  // Mobile
  'SwiftUI',
  // Database & Backend
  'Supabase', 'Firebase', 'MySQL',
  'PostgreSQL', 'REST API',
  // Tools & Design
  'Figma', 'Git', 'GitHub',
  'VS Code', 'Xcode', 'Vercel',
]

const EXPERIENCE = [
  {
    role: 'IT Manager',
    company: 'HelloCation',
    period: 'Jan 2026 — Present',
    description: 'Restructured the IT division into specialized squads, led the full redesign of Hellocation.id, and directed a remote team of designers and developers — bridging technical execution with C-level strategy.',
  },
  {
    role: 'Web Developer',
    company: 'Jamusari',
    period: 'Aug 2025 — Nov 2025',
    description: 'Designed and built the Jamusari website end-to-end — from UI concept and asset curation to SEO implementation and launch — using WordPress and Elementor to deliver a maintainable, performant site promoting the Modern Jamu and TOGA conservation initiative.',
  },
  {
    role: 'UI/UX Designer',
    company: 'HelloCation',
    period: 'Mar 2024 — Jun 2024',
    description: 'Redesigned the full HelloCation website across all key pages — modernizing layouts, improving visual hierarchy, and ensuring consistent branding and responsive, user-friendly interfaces throughout using Figma.',
  },
]

const LABEL: React.CSSProperties = {
  fontFamily:    'var(--font-display)',
  fontWeight:    400,
  fontSize:      'clamp(13px, 1.2vw, 16px)',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color:         '#aaa',
  whiteSpace:    'nowrap',
  flexShrink:    0,
  width:         'clamp(100px, 12vw, 160px)',
}

const DIVIDER: React.CSSProperties = {
  width:      '100%',
  height:     '0.5px',
  background: '#d8d5d0',
}

export default function TechExperience() {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  return (
    <section style={{
      background: '#f8f8f5',
      padding:    'clamp(80px, 10vw, 140px) clamp(32px, 6vw, 80px)',
      position:   'relative',
    }}>

      {/* ── TECH STACK ── */}
      <div style={{ ...DIVIDER, marginBottom: 'clamp(32px, 4vw, 56px)' }} />

      <div className="te-row" style={{
        display:    'flex',
        alignItems: 'baseline',
        gap:        'clamp(200px, 28vw, 400px)',
      }}>
        <span style={LABEL}>Tech Stack</span>

        <div style={{
          display:    'flex',
          flexWrap:   'wrap',
          gap:        'clamp(16px, 2.5vw, 32px) 0',
          alignItems: 'baseline',
        }}>
          {TECH.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              style={{ display: 'inline-flex', alignItems: 'baseline' }}
            >
              <span
                onMouseEnter={() => setHoveredTech(name)}
                onMouseLeave={() => setHoveredTech(null)}
                style={{
                  fontFamily:    'var(--font-display)',
                  fontWeight:    500,
                  fontSize:      'clamp(16px, 2vw, 28px)',
                  color:         hoveredTech === name ? 'var(--color-accent-primary)' : '#0a0a0a',
                  letterSpacing: '-0.01em',
                  transition:    'color 0.2s ease',
                  cursor:        'default',
                }}
              >
                {name}
              </span>
              {i < TECH.length - 1 && (
                <span style={{
                  color:    'var(--color-accent-primary)',
                  fontSize: 'clamp(20px, 2.5vw, 36px)',
                  margin:   '0 clamp(12px, 1.8vw, 24px)',
                  lineHeight: 1,
                }}>
                  •
                </span>
              )}
            </motion.span>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ ...DIVIDER, margin: 'clamp(40px, 5vw, 72px) 0' }} />

      {/* ── EXPERIENCE ── */}
      <div className="te-row" style={{
        display:    'flex',
        alignItems: 'flex-start',
        gap:        'clamp(200px, 28vw, 400px)',
      }}>
        <span style={{ ...LABEL, paddingTop: 4 }}>Experience</span>

        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           0,
          width:         '100%',
        }}>
          {EXPERIENCE.map((item, i) => (
            <motion.div
              key={item.role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              style={{
                display:       'flex',
                justifyContent:'space-between',
                alignItems:    'flex-start',
                gap:           40,
                paddingBottom: 'clamp(32px, 4vw, 56px)',
                paddingTop:    i > 0 ? 'clamp(32px, 4vw, 56px)' : 0,
                borderBottom:  i < EXPERIENCE.length - 1 ? '0.5px solid #e5e5e0' : 'none',
              }}
            >
              {/* Left — role, company, description */}
              <div className="te-exp-left" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{
                  fontFamily:    'var(--font-display)',
                  fontWeight:    600,
                  fontSize:      'clamp(18px, 2.2vw, 30px)',
                  color:         '#0a0a0a',
                  letterSpacing: '-0.02em',
                }}>
                  {item.role}
                </span>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle:  'italic',
                  fontWeight: 400,
                  fontSize:   'clamp(16px, 1.8vw, 24px)',
                  color:      'var(--color-accent-secondary)',
                }}>
                  {item.company}
                </span>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize:   'clamp(13px, 1.2vw, 16px)',
                  color:      '#888',
                  lineHeight: 1.6,
                  marginTop:  4,
                  maxWidth:   480,
                  margin:     0,
                }}>
                  {item.description}
                </p>
              </div>

              {/* Right — period */}
              <span className="te-period" style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      'clamp(12px, 1vw, 14px)',
                color:         '#aaa',
                whiteSpace:    'nowrap',
                flexShrink:    0,
                letterSpacing: '0.05em',
              }}>
                {item.period}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM DIVIDER ── */}
      <div style={{ ...DIVIDER, marginTop: 'clamp(40px, 5vw, 72px)' }} />

      <style>{`
        @media (max-width: 768px) {
          .te-row {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .te-row > span:first-child {
            width: auto !important;
            margin-bottom: 16px;
          }
          .te-exp-left {
            width: 100%;
          }
          .te-period {
            margin-top: 8px;
          }
        }
      `}</style>
    </section>
  )
}
