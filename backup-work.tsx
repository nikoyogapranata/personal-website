'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PROJECTS = [
  {
    id:       1,
    title:    'Fitness Coach AI',
    category: 'iOS · Mobile',
    year:     '2024',
    image:    '/profile.png',
    link:     '#',
  },
  {
    id:       2,
    title:    'Portfolio Website',
    category: 'Web · Frontend',
    year:     '2025',
    image:    '/profile.png',
    link:     '#',
  },
  {
    id:       3,
    title:    'Weather Dashboard',
    category: 'Web · Frontend',
    year:     '2024',
    image:    '/profile.png',
    link:     '#',
  },
  {
    id:       4,
    title:    'E-Commerce UI',
    category: 'Web · Design',
    year:     '2024',
    image:    '/profile.png',
    link:     '#',
  },
]

export default function Work() {
  const sectionRef              = useRef<HTMLElement>(null)
  const titleRef                = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: titleRef,
    offset: ['start start', 'end start'],
  })

  const titleSize = useTransform(
    scrollYProgress,
    [0, 0.85],
    ['clamp(72px, 15vw, 200px)', 'clamp(36px, 3.6vw, 52px)'],
  )

  const sectionBg = useTransform(
    scrollYProgress,
    [0, 0.45],
    ['#2563eb', '#0a0a0a'],
  )

  return (
    <motion.section
      ref={sectionRef}
      id="work"
      style={{ background: sectionBg, position: 'relative' }}
    >
      <div ref={titleRef} style={{ minHeight: '300vh', position: 'relative', zIndex: 1 }}>
        <div style={{
          position:       'sticky',
          top:            0,
          height:         '100vh',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          zIndex:         1,
        }}>
          <motion.h2
            style={{
              fontFamily:    'var(--font-display)',
              fontWeight:    700,
              fontSize:      titleSize,
              color:         '#f8f8f5',
              letterSpacing: '-0.03em',
              lineHeight:    1.05,
              textAlign:     'center',
              margin:        0,
            }}
          >
            <motion.div style={{ display: 'block' }}>SELECTED WORKS</motion.div>
            <motion.div style={{ display: 'block' }}>(2024—2025)</motion.div>
          </motion.h2>
        </div>
      </div>

      {/* ── Project list ── */}
      <div className="work-list" style={{ position: 'relative', zIndex: 2, marginTop: '-30vh' }}>
        {PROJECTS.map((project, index) => {
          const isHovered = hoveredId === project.id
          const isLast    = index === PROJECTS.length - 1

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
              className="work-row"
              style={{
                position:       'relative',
                overflow:       'hidden',
                minHeight:      isHovered ? 700 : 120,
                borderTop:      '0.5px solid #1e1e1e',
                ...(isLast && { borderBottom: '0.5px solid #1e1e1e' }),
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '48px 60px',
                gap:            40,
                transition:     'min-height 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => window.open(project.link, '_blank')}
            >
              {/* Background image — fades in on hover */}
              <motion.div
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: 0, zIndex: 0 }}
              >
                <img
                  src={project.image}
                  alt=""
                  style={{
                    width:          '100%',
                    height:         '100%',
                    objectFit:      'cover',
                    objectPosition: 'center',
                    filter:         isHovered ? 'grayscale(0%)' : 'grayscale(80%)',
                    transition:     'filter 0.5s ease',
                  }}
                />
                <div style={{
                  position:   'absolute',
                  inset:      0,
                  background: 'rgba(10, 10, 10, 0.55)',
                }} />
              </motion.div>

              {/* Left — number + title */}
              <motion.div
                animate={{ opacity: isHovered ? 0 : 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'baseline', gap: 24 }}
              >
                <span style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      12,
                  color:         '#444',
                  letterSpacing: '0.1em',
                  flexShrink:    0,
                }}>
                  {'0' + (index + 1)}
                </span>
                <span style={{
                  fontFamily:    'var(--font-display)',
                  fontWeight:    600,
                  fontSize:      'clamp(28px, 4vw, 64px)',
                  letterSpacing: '-0.02em',
                  color:         '#f8f8f5',
                  lineHeight:    1.1,
                }}>
                  {project.title}
                </span>
              </motion.div>

              {/* Right — category + year */}
              <motion.div
                animate={{ opacity: isHovered ? 0 : 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 48, flexShrink: 0 }}
              >
                <span style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      13,
                  color:         '#555',
                  letterSpacing: '0.05em',
                }}>
                  {project.category}
                </span>
                <span className="work-year" style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      12,
                  color:         '#444',
                  letterSpacing: '0.05em',
                }}>
                  {project.year}
                </span>
              </motion.div>

              {/* Centered View button — appears on hover */}
              <div style={{
                position:      'absolute',
                top:           '50%',
                left:          '50%',
                transform:     'translate(-50%, -50%)',
                zIndex:        3,
                pointerEvents: isHovered ? 'auto' : 'none',
              }}>
              <motion.div
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale:   isHovered ? 1 : 0.9,
                }}
                transition={{ duration: 0.3, delay: isHovered ? 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(project.link, '_blank')
                  }}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           12,
                    fontFamily:    'var(--font-display)',
                    fontSize:      14,
                    fontWeight:    600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color:         '#f8f8f5',
                    padding:       '16px 40px',
                    border:        '1.5px solid #f8f8f5',
                    borderRadius:  0,
                    background:    'transparent',
                    cursor:        'pointer',
                    transition:    'background 0.2s ease, color 0.2s ease',
                    whiteSpace:    'nowrap',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLDivElement).style.background = '#f8f8f5'
                    ;(e.currentTarget as HTMLDivElement).style.color = '#0a0a0a'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLDivElement).style.color = '#f8f8f5'
                  }}
                >
                  View Project →
                </div>
              </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="work-cta">
        <span
          className="work-cta-link"
          onClick={() => window.open('https://github.com', '_blank')}
          style={{
            fontFamily:    'var(--font-display)',
            fontWeight:    600,
            fontSize:      'clamp(18px, 2vw, 28px)',
            color:         '#f8f8f5',
            cursor:        'pointer',
            transition:    'color 0.2s ease',
            letterSpacing: '-0.01em',
          }}
        >
          More on GitHub →
        </span>
        <span style={{
          fontFamily:    'var(--font-sans)',
          fontSize:      12,
          color:         '#444',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}>
          04 projects
        </span>
      </div>

      <style>{`
        .work-list {
          padding: 0 0 120px;
        }
        .work-cta {
          padding:         60px 60px;
          border-top:      0.5px solid #1e1e1e;
          display:         flex;
          align-items:     center;
          justify-content: space-between;
        }
        .work-cta-link:hover {
          color: #2563eb !important;
        }

        @media (max-width: 768px) {
          .work-list {
            padding: 0 0 80px;
          }
          .work-cta {
            padding: 40px 30px;
          }
          .work-row {
            flex-wrap: wrap;
            gap:       16px !important;
            padding:   32px 30px !important;
          }
          .work-year {
            display: none;
          }
        }
      `}</style>
    </motion.section>
  )
}
