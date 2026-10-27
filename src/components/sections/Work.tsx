'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { PROJECTS } from '@/lib/projects'
import { DURATION, EASE, EASE_IN_OUT, SCROLL_SPRING, reveal } from '@/lib/motion'

const MotionLink = motion.create(Link)

export default function Work() {
  const sectionRef              = useRef<HTMLElement>(null)
  const titleRef                = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  // The preview card is fixed and always "in view", so lazy loading alone would fetch every image on page load
  const [previewReady, setPreviewReady] = useState(false)

  const enterRow = (id: number) => {
    setHoveredId(id)
    setPreviewReady(true)
  }

  const { scrollYProgress } = useScroll({
    target: titleRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, SCROLL_SPRING)

  const reduceMotion = usePrefersReducedMotion()
  const titleScale   = useTransform(smoothProgress, [0, 0.85], [1, 0.26])
  // Reduced motion: fade the pinned title out instead of shrinking it
  const titleFade    = useTransform(smoothProgress, [0, 0.85], [1, 0])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cardX  = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.5 })
  const cardY  = useSpring(mouseY, { stiffness: 120, damping: 20, mass: 0.5 })

  return (
    <section
      ref={sectionRef}
      id="work"
      style={{ position: 'relative' }}
    >
      {/* Violet while the title is large; the list below switches the page to dark */}
      <div ref={titleRef} data-tone="violet" style={{ minHeight: '180vh', position: 'relative', zIndex: 1 }}>
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
              fontSize:      'var(--text-section)',
              color:         'var(--tone-fg)',
              letterSpacing: '-0.03em',
              lineHeight:    1.05,
              // Own layer, so scaling doesn't re-raster the glyphs every frame
              willChange:    'transform',
              textAlign:     'center',
              margin:        0,
              scale:         reduceMotion ? 1 : titleScale,
              opacity:       reduceMotion ? titleFade : 1,
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
        data-tone="dark"
        style={{ position: 'relative', zIndex: 2, marginTop: '-20vh' }}
        onMouseMove={(e) => {
          mouseX.set(e.clientX)
          mouseY.set(e.clientY)
        }}
      >
        {PROJECTS.map((project, index) => {
          const isHovered = hoveredId === project.id
          return (
            <motion.a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              {...reveal({ order: index % 3 })}
              className="work-row"
              style={{
                position:       'relative',
                overflow:       'hidden',
                minHeight:      'clamp(80px, calc(6.25 * var(--u)), 144px)',
                borderTop:      '0.5px solid var(--color-border)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        'var(--space-l) clamp(24px, calc(3.125 * var(--u)), 72px)',
                gap:            'var(--space-m)',
                color:          'inherit',
                textDecoration: 'none',
              }}
              // A tap also fires enter events; touch gets no preview (the link opens a new tab)
              onPointerEnter={(e) => { if (e.pointerType !== 'touch') enterRow(project.id) }}
              onPointerLeave={() => setHoveredId(null)}
              onFocus={(e) => {
                // Keyboard focus: show the same preview, anchored to the row (a tap focuses too)
                if (!e.currentTarget.matches(':focus-visible')) return
                const rect = e.currentTarget.getBoundingClientRect()
                mouseX.set(rect.left + rect.width / 2)
                mouseY.set(rect.top + rect.height / 2)
                enterRow(project.id)
              }}
              onBlur={() => setHoveredId(null)}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(12px, calc(1.25 * var(--u)), 29px)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label)', color: '#888', letterSpacing: '0.1em', flexShrink: 0 }}>
                  {'0' + (index + 1)}
                </span>
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <motion.span
                    initial={false}
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    transition={{ duration: DURATION.base, ease: EASE_IN_OUT }}
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--text-h2)', letterSpacing: '-0.02em', color: 'var(--tone-fg)', lineHeight: 1.1, display: 'block' }}
                  >
                    {project.title}
                  </motion.span>
                  <motion.span
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: DURATION.base, ease: EASE_IN_OUT }}
                    style={{ position: 'absolute', top: 0, left: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'var(--text-h2)', letterSpacing: '-0.02em', color: 'var(--color-accent-primary-light)', lineHeight: 1.1, whiteSpace: 'nowrap' }}
                  >
                    {project.title}
                  </motion.span>
                </span>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label)', color: isHovered ? '#aaa' : 'var(--tone-faint)', letterSpacing: '0.05em', transition: 'color var(--dur-fast) var(--ease)' }}>
                  {project.category}
                </span>
              </div>
            </motion.a>
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
            width:         'clamp(280px, calc(29.1667 * var(--u)), 672px)',
            height:        'clamp(200px, calc(19.7917 * var(--u)), 456px)',
            overflow:      'hidden',
            borderRadius:  4,
          }}
          initial={false}
          animate={{
            opacity: hoveredId !== null ? 1 : 0,
            scale:   hoveredId !== null ? 1 : 0.85,
          }}
          transition={{
            opacity: { duration: DURATION.base, ease: EASE_IN_OUT },
            scale:   { duration: DURATION.fast, ease: EASE },
          }}
        >
          {previewReady && PROJECTS.map(project => (
            <motion.div
              key={project.id}
              initial={false}
              animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
              transition={{ duration: DURATION.fast, ease: EASE_IN_OUT }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <Image
                src={project.image}
                alt=""
                fill
                // Card is max(280px, min(29.17 × --u, 672px)): 280 on phones, ≤374 up to 1280, then ~29vw
                sizes="(max-width: 767px) 280px, (max-width: 1280px) 374px, min(29.2vw, 672px)"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </motion.div>
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-text-inverse)', padding: '0.77em 1.85em', border: '1px solid rgba(248,248,245,0.7)' }}>
              View
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom CTA ── */}
      <div data-tone="dark" style={{
        display:        'flex',
        justifyContent: 'center',
        padding:        'clamp(40px, calc(4.1667 * var(--u)), 96px) clamp(24px, calc(3.125 * var(--u)), 72px) var(--space-2xl)',
      }}>
        <MotionLink
          href="/work"
          style={{
            fontFamily:     'var(--font-serif)',
            fontStyle:      'italic',
            fontWeight:     400,
            fontSize:       'var(--text-h3)',
            color:          'var(--tone-fg)',
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
            color:         'var(--tone-fg)',
            marginLeft:    '0.2em',
          }}>(4)</sup>
          <motion.span
            variants={{
              rest:  { scaleX: 0, originX: 0 },
              hover: { scaleX: 1, originX: 0 },
            }}
            transition={{ duration: DURATION.fast, ease: EASE }}
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
        </MotionLink>
      </div>

      <style>{`
        .work-list {
          padding: 0 clamp(24px, calc(3.125 * var(--u)), 72px) var(--space-2xl);
        }
        .work-row {
          cursor: pointer;
        }
        a.work-row:last-of-type {
          border-bottom: 0.5px solid var(--color-border);
        }
        @media (max-width: 900px) {
          .work-list { padding: 0 0 80px; }
          .work-row  { flex-wrap: wrap; gap: 16px !important; padding: clamp(20px, 3vw, 32px) clamp(16px, 3vw, 30px) !important; }
        }
      `}</style>
    </section>
  )
}
