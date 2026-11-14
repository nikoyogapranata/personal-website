'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { CATEGORY_LABEL, isTodo, type Project } from '@/data'
import { DURATION, EASE } from '@/lib/motion'

/** Fills cycle in this order through PROJECTS (offset so the last card isn't ink beside the ink end card) */
const FILLS = ['white', 'violet', 'crimson', 'ink'] as const
export type Fill = (typeof FILLS)[number]
export const fillFor = (projectIndex: number): Fill => FILLS[(projectIndex + 1) % FILLS.length]

/** Neighbours of the centred card: this much smaller, this many degrees tilted */
const SHRINK = 0.1
const TILT = 4

/** Rendered width of a landscape screenshot: the card width in each layout (see work.css) */
const SHOT_SIZES = '(max-width: 767px) calc(100vw - 64px), (prefers-reduced-motion: reduce) 720px, (orientation: portrait) 72vw, min(46vw, 1040px)'
const PHONE_SIZES = '(max-width: 767px) 40vw, 320px'

const pad = (n: number) => String(n).padStart(2, '0')

/** Card i's place relative to the scroll position f (both in cards): 0 centred, ±1 one card away */
export function useCardPose(index: number, f: MotionValue<number>, instant: boolean) {
  const at = useMotionValue(index)
  // A filter moves the card to a new slot: ease its pose there along with the layout animation
  useEffect(() => {
    if (instant) { at.set(index); return }
    const a = animate(at, index, { duration: DURATION.base, ease: EASE })
    return () => a.stop()
  }, [at, index, instant])
  const d = (fv: number, i: number) => Math.max(-1, Math.min(1, i - fv))
  const scale = useTransform<number, number>([f, at], ([fv, i]) => 1 - SHRINK * Math.abs(d(fv, i)))
  const rotate = useTransform<number, number>([f, at], ([fv, i]) => TILT * d(fv, i))
  return { scale, rotate }
}

/** Exit and layout timing; `instant` when a filter is applied behind a fade or before first paint */
export const itemExit = {
  exit: (instant: boolean) => ({
    opacity: 0,
    y: 48,
    transition: instant ? { duration: 0 } : { duration: DURATION.fast, ease: EASE },
  }),
}
export const layoutTransition = (instant: boolean) => ({
  layout: instant ? { duration: 0 } : { duration: DURATION.base, ease: EASE },
})

export type PillHandlers = {
  onEnter: (e: React.PointerEvent) => void
  onMove: (e: React.PointerEvent) => void
  onLeave: () => void
}

export default function ProjectCard({ ref, project, projectIndex, index, f, instant, preload, register, onFocusCard, pill }: {
  /** From AnimatePresence (popLayout measures the card as it leaves) */
  ref?: React.Ref<HTMLLIElement>
  project: Project
  /** Place in PROJECTS: fixes the fill, so a card keeps its colour through filtering */
  projectIndex: number
  /** Place among the visible cards */
  index: number
  f: MotionValue<number>
  instant: boolean
  preload: boolean
  register: (slug: string, el: HTMLLIElement | null) => void
  onFocusCard: (index: number) => void
  pill: PillHandlers
}) {
  const { scale, rotate } = useCardPose(index, f, instant)
  const fill = fillFor(projectIndex)
  const link = project.link && !isTodo(project.link) ? project.link : null
  const ios = project.category === 'ios'
  const titleId = `wg-${project.slug}`

  return (
    <motion.li
      ref={el => {
        register(project.slug, el)
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      layout="position"
      className="wg-item"
      data-cat={project.category}
      variants={itemExit}
      exit="exit"
      transition={layoutTransition(instant)}
      onFocus={() => onFocusCard(index)}
    >
      <motion.div className="wg-tilt" style={{ scale, rotate }}>
        <div
          className={`wg-obj wg-obj--${fill}`}
          {...(link ? { onPointerEnter: pill.onEnter, onPointerMove: pill.onMove, onPointerLeave: pill.onLeave } : {})}
        >
          <article
            className={`wg-card wg-card--${fill}${ios ? ' wg-card--ios' : ''}`}
            aria-labelledby={titleId}
            // Only cards with no link at all take focus themselves, so Tab still reaches every card
            tabIndex={link ? undefined : 0}
          >
            <div className="wg-shot">
              {ios ? (
                <div className="wg-phone">
                  <div className="wg-phone-screen">
                    {isTodo(project.screenshot)
                      ? <Placeholder title={project.title} />
                      : <Image src={project.screenshot.src} alt={`Screenshot of ${project.title}`} fill sizes={PHONE_SIZES} preload={preload} style={{ objectFit: 'cover' }} />}
                  </div>
                </div>
              ) : isTodo(project.screenshot) ? (
                <Placeholder title={project.title} />
              ) : (
                <Image
                  src={project.screenshot.src}
                  alt={`Screenshot of ${project.title}`}
                  fill
                  sizes={SHOT_SIZES}
                  preload={preload}
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                />
              )}
              {project.teamLead && <span className="wg-sticker">Team lead</span>}
              {link && <span className="wg-pill wg-pill--anchor" aria-hidden="true">View <span>↗</span></span>}
            </div>

            <div className="wg-body">
              <p className="wg-meta">
                <span className="wg-num">{pad(index + 1)}</span>
                {!isTodo(project.period) && <span>{project.period.replace(' to ', ' – ')}</span>}
              </p>
              <h2 id={titleId} className="wg-name">{project.title}</h2>
              <p className="wg-cat">{CATEGORY_LABEL[project.category]}</p>
              <p className="wg-desc">{project.description}</p>
              <p className="wg-stack"><span className="sr-only">Built with </span>{project.stack.join(' · ')}</p>
              {link && (
                <a className="wg-link" href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.kind === 'github' ? 'GitHub' : 'Visit'}
                  <span className="sr-only"> {project.title}{link.kind === 'github' ? ' repository' : ''} (opens in new tab)</span>
                  <span aria-hidden="true"> ↗</span>
                </a>
              )}
            </div>
          </article>
        </div>
      </motion.div>
    </motion.li>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="wg-placeholder" aria-hidden="true">
      <span>{title}</span>
      <span className="wg-placeholder-note">Screenshot soon</span>
    </div>
  )
}
