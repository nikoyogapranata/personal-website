'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion'

const PROJECTS = [
  { id: 1, title: 'Fitness Coach AI',  category: 'iOS · Mobile',      year: '2024', image: '/hero.jpeg',   link: '#' },
  { id: 2, title: 'Portfolio Website', category: 'Web · Frontend',    year: '2025', image: '/profile.png', link: '#' },
  { id: 3, title: 'Weather Dashboard', category: 'Web · Frontend',    year: '2024', image: '/profile.png', link: '#' },
  { id: 4, title: 'E-Commerce UI',     category: 'Web · Design',      year: '2024', image: '/profile.png', link: '#' },
  { id: 5, title: 'Brand Identity',    category: 'Design · Branding', year: '2024', image: '/profile.png', link: '#' },
]

export default function Work() {
  const sectionRef              = useRef<HTMLElement>(null)
  const titleRef                = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: titleRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping:   18,
    mass:      0.4,
    restDelta: 0.001,
  })

  const titleScale = useTransform(smoothProgress, [0, 0.85], [1, 0.26])

  const sectionBg = useTransform(
    smoothProgress,
    [0, 0.45],
    ['#2563eb', '#0a0a0a'],
  )

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cardX  = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.5 })
  const cardY  = useSpring(mouseY, { stiffness: 120, damping: 20, mass: 0.5 })

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
              fontSize:      'clamp(72px, 15vw, 200px)',
              color:         '#f8f8f5',
              letterSpacing: '-0.03em',
              lineHeight:    1.05,
              textAlign:     'center',
              margin:        0,
              scale:         titleScale,
              transformOrigin: 'center center',
            }}
          >
            <motion.div style={{ display: 'block' }}>A GLIMPSE OF</motion.div>
            <motion.div style={{ display: 'block' }}>WHAT I&apos;VE</motion.div>
            <motion.div style={{ display: 'block' }}>BEEN BUILDING</motion.div>
          </motion.h2>
        </div>
      </div>

      {/* ── Project list ── */}
      <div
        className="work-list"
        style={{ position: 'relative', zIndex: 2, marginTop: '-20vh' }}
        onMouseMove={(e) => {
          mouseX.set(e.clientX)
          mouseY.set(e.clientY)
        }}
      >
        {/* Rows 1–3 */}
        {PROJECTS.slice(0, 3).map((project, index) => {
          const isHovered = hoveredId === project.id
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
                minHeight:      120,
                borderTop:      '0.5px solid #1e1e1e',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '48px 60px',
                gap:            40,
              }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => window.open(project.link, '_blank')}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#888', letterSpacing: '0.1em', flexShrink: 0 }}>
                  {'0' + (index + 1)}
                </span>
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <motion.span
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 64px)', letterSpacing: '-0.02em', color: '#f8f8f5', lineHeight: 1.1, display: 'block' }}
                  >
                    {project.title}
                  </motion.span>
                  <motion.span
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: 0, left: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 64px)', letterSpacing: '-0.02em', color: '#2563eb', lineHeight: 1.1, whiteSpace: 'nowrap' }}
                  >
                    {project.title}
                  </motion.span>
                </span>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: isHovered ? '#aaa' : '#777', letterSpacing: '0.05em', transition: 'color 0.2s ease' }}>
                  {project.category}
                </span>
              </div>
            </motion.div>
          )
        })}

        {/* Rows 4–5 */}
        {PROJECTS.slice(3).map((project, i) => {
          const index     = i + 3
          const isLast    = i === PROJECTS.slice(3).length - 1
          const isHovered = hoveredId === project.id
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              className="work-row"
              style={{
                position:       'relative',
                overflow:       'hidden',
                minHeight:      120,
                borderTop:      '0.5px solid #1e1e1e',
                ...(isLast && { borderBottom: '0.5px solid #1e1e1e' }),
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '48px 60px',
                gap:            40,
              }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => window.open(project.link, '_blank')}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#888', letterSpacing: '0.1em', flexShrink: 0 }}>
                  {'0' + (index + 1)}
                </span>
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <motion.span
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 64px)', letterSpacing: '-0.02em', color: '#f8f8f5', lineHeight: 1.1, display: 'block' }}
                  >
                    {project.title}
                  </motion.span>
                  <motion.span
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: 0, left: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 64px)', letterSpacing: '-0.02em', color: '#2563eb', lineHeight: 1.1, whiteSpace: 'nowrap' }}
                  >
                    {project.title}
                  </motion.span>
                </span>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: isHovered ? '#aaa' : '#777', letterSpacing: '0.05em', transition: 'color 0.2s ease' }}>
                  {project.category}
                </span>
              </div>
            </motion.div>
          )
        })}

        {/* Cursor-following preview card */}
        <motion.div
          style={{
            position:      'fixed',
            top:           0,
            left:          0,
            x:             cardX,
            y:             cardY,
            translateX:    '-50%',
            translateY:    '-50%',
            zIndex:        100,
            pointerEvents: 'none',
            width:         560,
            height:        380,
            overflow:      'hidden',
            borderRadius:  4,
          }}
          animate={{
            opacity: hoveredId !== null ? 1 : 0,
            scale:   hoveredId !== null ? 1 : 0.85,
          }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeInOut' },
            scale:   { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          {PROJECTS.map(project => (
            <motion.div
              key={project.id}
              animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <img
                src={project.image}
                alt={project.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
            </motion.div>
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#f8f8f5', padding: '10px 24px', border: '1px solid rgba(248,248,245,0.7)' }}>
              View
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{
        display:        'flex',
        justifyContent: 'center',
        padding:        '80px 60px 120px',
      }}>
        <motion.a
          href="/work"
          style={{
            fontFamily:     'var(--font-serif)',
            fontStyle:      'italic',
            fontWeight:     400,
            fontSize:       'clamp(28px, 4vw, 56px)',
            color:          '#f8f8f5',
            textDecoration: 'none',
            position:       'relative',
            display:        'inline-block',
            letterSpacing:  '-0.01em',
            cursor:         'pointer',
          }}
          whileHover="hover"
          initial="rest"
        >
          See all projects<sup style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '0.35em',
            fontStyle:     'normal',
            fontWeight:    400,
            letterSpacing: '0.05em',
            verticalAlign: 'super',
            color:         '#f8f8f5',
            marginLeft:    '0.2em',
          }}>(5)</sup>
          <motion.span
            variants={{
              rest:  { scaleX: 0, originX: 0 },
              hover: { scaleX: 1, originX: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position:   'absolute',
              bottom:     -4,
              left:       0,
              right:      0,
              height:     '1px',
              background: '#2563eb',
              display:    'block',
            }}
          />
        </motion.a>
      </div>

      <style>{`
        .work-list {
          padding: 0 60px 120px;
        }
        .work-row {
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .work-list { padding: 0 0 80px; }
          .work-row  { flex-wrap: wrap; gap: 16px !important; padding: 32px 30px !important; }
        }
      `}</style>
    </motion.section>
  )
}
