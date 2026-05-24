'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion'

const PROJECTS = [
  { id: 1, title: 'JAMUSARI',   category: 'Web · Fullstack',   year: '2025', image: '/jamusari.png',   link: 'https://jamusari.com' },
  { id: 2, title: 'HealthSync', category: 'Web · Fullstack',   year: '2025', image: '/healthsync.png', link: 'https://healthsync-7.vercel.app' },
  { id: 3, title: 'WETRACK',    category: 'Web · Fullstack',   year: '2024', image: '/wetrack.png',    link: 'https://github.com/nikoyogapranata/wetrack' },
  { id: 4, title: 'EduNovel',   category: 'Design · Branding', year: '2023', image: '/edunovel.png',   link: 'https://www.figma.com/proto/cY7vOHUdtTfLDkTYDthI1n/EduNovel?page-id=0%3A1&node-id=2-2397&p=f&viewport=308%2C326%2C0.03&t=n2kiA8gcGTPQdv0j-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A2397&show-proto-sidebar=1' },
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
    ['#5b21b6', '#0a0a0a'],
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
          overflow:       'hidden',
        }}>
          <motion.h2
            className="work-title"
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
                minHeight:      'clamp(80px, 8vw, 120px)',
                borderTop:      '0.5px solid #1e1e1e',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        'clamp(28px, 3.5vw, 48px) clamp(24px, 4vw, 60px)',
                gap:            'clamp(20px, 2.5vw, 40px)',
              }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => window.open(project.link, '_blank')}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(12px, 1.5vw, 24px)' }}>
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
                    style={{ position: 'absolute', top: 0, left: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 64px)', letterSpacing: '-0.02em', color: 'var(--color-accent-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}
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
                minHeight:      'clamp(80px, 8vw, 120px)',
                borderTop:      '0.5px solid #1e1e1e',
                ...(isLast && { borderBottom: '0.5px solid #1e1e1e' }),
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        'clamp(28px, 3.5vw, 48px) clamp(24px, 4vw, 60px)',
                gap:            'clamp(20px, 2.5vw, 40px)',
              }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => window.open(project.link, '_blank')}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(12px, 1.5vw, 24px)' }}>
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
                    style={{ position: 'absolute', top: 0, left: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 64px)', letterSpacing: '-0.02em', color: 'var(--color-accent-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}
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
            width:         'clamp(280px, 35vw, 560px)',
            height:        'clamp(200px, 24vw, 380px)',
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
              <Image
                src={project.image}
                alt={project.title}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
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
        padding:        'clamp(40px, 5vw, 80px) clamp(24px, 4vw, 60px) clamp(60px, 8vw, 120px)',
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
          }}>(4)</sup>
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
              background: 'var(--color-accent-primary)',
              display:    'block',
            }}
          />
        </motion.a>
      </div>

      <style>{`
        .work-list {
          padding: 0 clamp(24px, 4vw, 60px) clamp(60px, 8vw, 120px);
        }
        .work-row {
          cursor: pointer;
        }
        @media (max-width: 1400px) {
          .work-title {
            font-size: clamp(60px, 12vw, 160px) !important;
          }
        }
        @media (max-width: 768px) {
          .work-list { padding: 0 0 80px; }
          .work-row  { flex-wrap: wrap; gap: 16px !important; padding: clamp(20px, 3vw, 32px) clamp(16px, 3vw, 30px) !important; }
        }
      `}</style>
    </motion.section>
  )
}
