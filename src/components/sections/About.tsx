'use client'

import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function S({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'var(--font-serif)',
      fontStyle:  'italic',
      fontWeight: 400,
      color:      '#2563eb',
      fontSize:   '1.1em',
    }}>
      {children}
    </span>
  )
}

const STATS = [
  { label: 'Years Coding',      suffix: '+' },
  { label: 'Projects Built',    suffix: '+' },
  { label: 'Frontend Projects', suffix: '+' },
] as const

export default function About() {
  const { count: c1, ref: r1 } = useCountUp(3,  1500)
  const { count: c2, ref: r2 } = useCountUp(12, 1800)
  const { count: c3, ref: r3 } = useCountUp(7,  1600)

  const counts = [
    { count: c1, ref: r1 },
    { count: c2, ref: r2 },
    { count: c3, ref: r3 },
  ]

  return (
    <section
      id="about"
      style={{
        background: '#f8f8f5',
        minHeight:  '100vh',
        padding:    '120px 60px',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      <div
        className="about-grid"
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 460px 1fr',
          gap:                 60,
          alignItems:          'center',
          maxWidth:            1400,
          margin:              '0 auto',
        }}
      >
        {/* ── LEFT — hook text + bio ─────────────────────────── */}
        <motion.div
          className="about-left"
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'center',
          }}
        >
          <p className="about-hook" style={{
            fontFamily:    'var(--font-display)',
            fontWeight:    700,
            fontSize:      'clamp(36px, 5vw, 72px)',
            color:         '#0a0a0a',
            lineHeight:    1.15,
            letterSpacing: '-0.02em',
            margin:        0,
            marginBottom:  32,
          }}>
            I bridge the gap between{' '}
            <S>engineering</S>
            {' '}and{' '}
            <S>visual design.</S>
          </p>

          <p className="about-bio" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize:   'clamp(15px, 1.5vw, 18px)',
            lineHeight: 1.8,
            color:      '#555',
            margin:     0,
          }}>
            A CS student who got too interested in how things look. I spend most
            of my time at the intersection of code and design — building
            interfaces that are fast, intentional, and actually nice to use.
            Currently studying, always shipping.
          </p>
        </motion.div>

        {/* ── CENTER — photo ─────────────────────────────────── */}
        <motion.div
          className="about-center"
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <div style={{
            position:    'relative',
            width:       '100%',
            aspectRatio: '2/3',
            overflow:    'hidden',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile.png"
              alt="Niko Pranata"
              style={{
                width:          '100%',
                height:         '100%',
                objectFit:      'cover',
                objectPosition: 'top center',
                filter:         'grayscale(15%)',
                display:        'block',
              }}
            />
            <div style={{
              position:      'absolute',
              bottom:        0,
              left:          0,
              right:         0,
              height:        '50%',
              background:    'linear-gradient(to bottom, transparent 0%, #f8f8f5 100%)',
              pointerEvents: 'none',
              zIndex:        1,
            }} />
          </div>
        </motion.div>

        {/* ── RIGHT — sticky stats ───────────────────────────── */}
        <div
          className="about-right"
          style={{
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'center',
            gap:            0,
          }}
        >
          {STATS.map(({ label, suffix }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
              style={{
                paddingTop:    48,
                paddingBottom: 48,
                borderBottom:  i < STATS.length - 1 ? '0.5px solid #e5e5e0' : 'none',
              }}
            >
              <span
                ref={counts[i].ref}
                style={{
                  fontFamily:    'var(--font-display)',
                  fontWeight:    700,
                  fontSize:      'clamp(64px, 8vw, 120px)',
                  color:         '#0a0a0a',
                  letterSpacing: '-0.04em',
                  lineHeight:    1,
                  display:       'block',
                }}
              >
                {counts[i].count}
                <span style={{
                  fontFamily:    'var(--font-serif)',
                  fontStyle:     'italic',
                  fontWeight:    400,
                  fontSize:      '0.6em',
                  color:         '#2563eb',
                  verticalAlign: 'super',
                }}>
                  {suffix}
                </span>
              </span>
              <span style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      13,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color:         '#888',
                marginTop:     8,
                display:       'block',
              }}>
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Responsive styles ──────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .about-center { order: 1; }
          .about-left   { order: 2; padding-top: 0 !important; }
          .about-right  { order: 3; }
          .about-right {
            position: static !important;
            top: auto !important;
            flex-direction: row !important;
          }
          .about-right > div {
            flex: 1;
            text-align: center;
            padding-left: 8px;
            padding-right: 8px;
          }
          section#about {
            padding: 80px 30px !important;
          }
        }
      `}</style>
    </section>
  )
}
