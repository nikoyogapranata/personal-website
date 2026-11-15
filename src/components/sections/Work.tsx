'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useSpring, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { CATEGORY_LABEL, FEATURED_PROJECTS, PROJECTS, isTodo } from '@/data'
import { DURATION, EASE, SCROLL_SPRING } from '@/lib/motion'
import WorkRow from './WorkRow'

const MotionLink = motion.create(Link)

export default function Work() {
  const sectionRef              = useRef<HTMLElement>(null)
  const titleRef                = useRef<HTMLDivElement>(null)

  // The `featured` flag picks them (src/data/projects.ts); every one has a live link
  const featuredProjects = FEATURED_PROJECTS.flatMap(p =>
    !p.link || isTodo(p.link) ? [] : [{ ...p, href: p.link.url }],
  )

  const { scrollYProgress } = useScroll({
    target: titleRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, SCROLL_SPRING)

  const reduceMotion = usePrefersReducedMotion()
  const titleScale   = useTransform(smoothProgress, [0, 0.85], [1, 0.26])
  // Reduced motion: fade the pinned title out instead of shrinking it
  const titleFade    = useTransform(smoothProgress, [0, 0.85], [1, 0])

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
            {/* Spans, not divs (headings only take phrasing content). The {" "} keep the
                words apart in the text; whitespace between block boxes isn't rendered. */}
            <span style={{ display: 'block' }}>A GLIMPSE OF</span>{' '}
            <span style={{ display: 'block' }}>WHAT I&apos;VE</span>{' '}
            <span style={{ display: 'block' }}>BEEN BUILDING</span>
          </motion.h2>
        </div>
      </div>

      {/* ── Project list ── */}
      <div
        className="work-list"
        data-tone="dark"
        style={{ position: 'relative', zIndex: 2, marginTop: '-20vh' }}
      >
        {featuredProjects.map((project, index) => (
          <WorkRow
            key={project.slug}
            index={index}
            href={project.href}
            title={project.title}
            category={CATEGORY_LABEL[project.category]}
            description={project.description}
          />
        ))}
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
          {/* The count sits inside the sentence, so it can't be read as the length of the list above */}
          See all {PROJECTS.length} projects
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
          position: relative;
          overflow: hidden;
          min-height: clamp(80px, calc(6.25 * var(--u)), 144px);
          border-top: 0.5px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-l) clamp(24px, calc(3.125 * var(--u)), 72px);
          gap: var(--space-m);
          color: inherit;
          text-decoration: none;
          cursor: pointer;
        }
        a.work-row:last-of-type {
          border-bottom: 0.5px solid var(--color-border);
        }
        .work-row__lead {
          display: flex;
          align-items: baseline;
          gap: clamp(12px, calc(1.25 * var(--u)), 29px);
        }
        .work-row__num {
          font-family: var(--font-sans);
          font-size: var(--text-label);
          color: #888;
          letter-spacing: 0.1em;
          flex-shrink: 0;
        }
        .work-row__title {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: var(--text-h2);
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--tone-fg);
        }
        .work-row__cat {
          flex-shrink: 0;
          font-family: var(--font-sans);
          font-size: var(--text-label);
          letter-spacing: 0.05em;
          color: var(--tone-faint);
        }

        /* Hover/focus fill (WorkRow). Absolute and clipped by the row, so it never changes its size */
        .work-row__fill {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
          background: var(--color-bg-dark);
          color: var(--color-text-inverse);
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
          font-size: var(--text-h2);
          letter-spacing: -0.01em;
          line-height: 1.1;
          white-space: nowrap;
        }
        .work-row__fill-inner {
          display: flex;
          align-items: center;
          height: 100%;
        }
        /* Two identical halves, so -50% is exactly one half: a seamless loop.
           Paused unless the row is active; the duration is set inline from MARQUEE_EM_PER_SEC. */
        .work-row__track {
          display: flex;
          width: max-content;
          animation: work-marquee 20s linear infinite paused;
        }
        .work-row[data-active] .work-row__track {
          animation-play-state: running;
          will-change: transform;
        }
        .work-row__half,
        .work-row__item {
          display: flex;
          flex-shrink: 0;
        }
        .work-row__sep {
          padding: 0 0.5em;
        }
        /* Reduced motion: still, one line, cut with an ellipsis */
        .work-row__static {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 clamp(24px, calc(3.125 * var(--u)), 72px);
        }
        @keyframes work-marquee {
          to { transform: translateX(-50%); }
        }
        @media (max-width: 900px) {
          .work-list { padding: 0 0 80px; }
          .work-row  { flex-wrap: wrap; gap: 16px !important; padding: clamp(20px, 3vw, 32px) clamp(16px, 3vw, 30px) !important; }
        }
      `}</style>
    </section>
  )
}
