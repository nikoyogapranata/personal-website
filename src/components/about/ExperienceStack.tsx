'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { EXPERIENCE_CARDS, type ExperienceCard } from '@/data'

/* Work cards. Desktop: pinned, each next card slides up (tilted, settling to 0°) and stacks on the
   previous ones, which stay as strips above it. Phones, reduced motion, no JS: a plain list. */

const PHONE_MAX = 767
/** Scroll per incoming card, svh */
const PER_CARD = 80
/** Height of each older card's strip above the one in front, px */
const PEEK = 16
const SHRINK = 0.035
const TILT = 5

/** Fill per card, in order. Text colours on each pass AA (see tests/e2e/about) */
const FILLS = ['violet', 'white', 'crimson', 'ink'] as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - (1 - t) ** 3

export default function ExperienceStack() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const n = EXPERIENCE_CARDS.length
  const seg = 1 / (n - 1)

  // How far card k (1..n-1) has come in: 0 waiting below, 1 settled. Card 0 starts in place.
  const enter = (k: number, v: number) => (k === 0 ? 1 : clamp01((v - (k - 1) * seg) / (seg * 0.75)))

  const [active, setActive] = useState(0)
  useMotionValueEvent(p, 'change', v => {
    let a = 0
    for (let k = 1; k < n; k++) if (enter(k, v) > 0.5) a = k
    setActive(prev => (prev === a ? prev : a))
  })

  return (
    <section className="xp" data-tone="light" aria-labelledby="xp-title">
      <style>{CSS}</style>
      <style>{`@media (max-width: ${PHONE_MAX}px), (prefers-reduced-motion: reduce) { ${STATIC_CSS} }`}</style>
      <noscript><style>{STATIC_CSS}</style></noscript>

      <div ref={trackRef} className="xp-track" style={{ ['--xp-scroll' as string]: `${(n - 1) * PER_CARD}svh` }}>
        <div className="xp-sticky">
          <div className="xp-index">
            <h2 id="xp-title" className="xp-title">Experience</h2>
            <ol className="xp-list" aria-hidden="true">
              {EXPERIENCE_CARDS.map((c, i) => (
                <li key={c.id} className={i === active ? 'is-active' : undefined}>
                  <span className="xp-list-name">{c.label ?? c.company}</span>
                  {i === active && <span className="xp-now">now reading</span>}
                </li>
              ))}
            </ol>
            <p className="xp-count" aria-hidden="true">
              <span className="xp-count-now">{String(active + 1).padStart(2, '0')}</span>
              <span className="xp-count-of"> / {String(n).padStart(2, '0')}</span>
            </p>
          </div>

          <ol className="xp-stage">
            {EXPERIENCE_CARDS.map((card, i) => (
              <StackedCard key={card.id} card={card} index={i} total={n} p={p} enter={enter} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function StackedCard({ card, index, total, p, enter }: {
  card: ExperienceCard
  index: number
  total: number
  p: MotionValue<number>
  enter: (k: number, v: number) => number
}) {
  // Incoming: from below the stage, tilted, settling to 0°
  const y      = useTransform(p, v => `${(1 - easeOut(enter(index, v))) * 100}svh`)
  const rotate = useTransform(p, v => (1 - easeOut(enter(index, v))) * TILT)
  // Pushed back by every card that has come in on top of it
  const depth  = (v: number) => { let d = 0; for (let k = index + 1; k < total; k++) d += easeOut(enter(k, v)); return d }
  const peekY  = useTransform(p, v => -depth(v) * PEEK)
  const scale  = useTransform(p, v => 1 - depth(v) * SHRINK)

  return (
    <motion.li className="xp-slot" style={{ y, rotate, zIndex: index + 1 }}>
      <motion.article className={`xp-card xp-card--${FILLS[index % FILLS.length]}`} style={{ y: peekY, scale }}>
        <div className="xp-card-top">
          <span className="xp-card-num">{String(index + 1).padStart(2, '0')}</span>
          <span className="xp-card-period">{card.period}</span>
        </div>
        <h3 className="xp-card-role">{card.role}</h3>
        <p className="xp-card-company">{card.company}</p>
        {card.previously && <p className="xp-card-prev">previously {card.previously}</p>}
        <p className="xp-card-summary">{card.summary}</p>
        {card.skills.length > 0 && (
          <ul className="xp-chips" aria-label="Skills">
            {card.skills.map(s => <li key={s}>{s}</li>)}
          </ul>
        )}
      </motion.article>
    </motion.li>
  )
}

const CSS = `
.xp { padding-top: var(--section-y); }
.xp-track { position: relative; height: calc(100svh + var(--xp-scroll)); }
.xp-sticky {
  position: sticky; top: 0; height: 100svh;
  display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: var(--space-xl); align-items: center;
  padding: calc(var(--nav-h) + var(--space-m)) max(var(--page-x), calc((100% - var(--content-max)) / 2)) var(--space-m);
}
.xp-index { display: flex; flex-direction: column; gap: var(--space-m); align-self: stretch; justify-content: center; }
.xp-title {
  margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-h2);
  letter-spacing: -0.03em; line-height: 1; text-transform: uppercase; color: var(--color-text);
}
.xp-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; font-size: var(--text-h5); }
.xp-list li { display: flex; align-items: baseline; gap: 0.6em; font-family: var(--font-display); font-weight: 500; color: var(--color-text-faint); transition: color var(--dur-fast) var(--ease); }
.xp-list li.is-active { font-weight: 700; color: var(--color-text); }
.xp-now { font-family: var(--font-serif); font-style: italic; font-weight: 400; font-size: 0.85em; color: var(--color-accent-secondary); }
.xp-count { margin: 0; font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; }
.xp-count-now { font-size: var(--text-section); color: var(--color-text); }
.xp-count-of  { font-size: var(--text-h3); color: var(--color-text-faint); }

.xp-stage {
  list-style: none; margin: 0; padding: 0; position: relative;
  height: calc(var(--xp-card-h) + ${PEEK * 3}px);
  --xp-card-h: clamp(360px, 54svh, 500px);
}
.xp-slot { position: absolute; left: 0; right: 0; bottom: 0; will-change: transform; }
.xp-card {
  height: var(--xp-card-h); max-width: 640px;
  display: flex; flex-direction: column; gap: 0.75rem;
  padding: clamp(20px, 2.2vw, 40px);
  border: var(--border-ink); border-radius: var(--radius-md); box-shadow: var(--shadow-card);
  transform-origin: 50% 0;
}
.xp-card-top { display: flex; justify-content: space-between; gap: 1rem; font-family: var(--font-sans); font-size: var(--text-small); letter-spacing: 0.08em; text-transform: uppercase; }
.xp-card-num { font-weight: 700; }
.xp-card-role { margin: 0.5rem 0 0; font-family: var(--font-display); font-weight: 700; font-size: clamp(1.75rem, 2.6vw, 3rem); line-height: 1; letter-spacing: -0.03em; }
.xp-card-company { margin: 0; font-family: var(--font-serif); font-style: italic; font-size: max(1.125rem, var(--text-h5)); line-height: 1.2; }
.xp-card-prev { margin: 0; font-family: var(--font-sans); font-size: var(--text-caption); letter-spacing: 0.04em; }
.xp-card-summary { margin: 0; font-family: var(--font-sans); font-size: var(--text-body); line-height: 1.55; max-width: 34rem; }
.xp-chips { list-style: none; margin: auto 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 8px; }
.xp-chips li {
  font-family: var(--font-sans); font-size: var(--text-caption); letter-spacing: 0.02em;
  padding: 3px 10px; border: 1.5px solid currentColor; border-radius: var(--radius-pill);
}
/* Fills. Every text colour here is ≥ 4.5:1 on its fill */
.xp-card--violet  { background: var(--color-accent-primary);   color: var(--color-text-inverse); }
.xp-card--white   { background: #ffffff;                       color: var(--color-text); }
.xp-card--white .xp-card-company { color: var(--color-accent-secondary); }
.xp-card--crimson { background: var(--color-accent-secondary); color: #ffffff; }
.xp-card--ink     { background: var(--color-bg-dark);          color: var(--color-text-inverse); }
.xp-card--ink .xp-card-company { color: var(--color-accent-primary-light); }
`

/** Phones, reduced motion, no JS: the same cards as a plain vertical list */
const STATIC_CSS = `
.xp-track { height: auto !important; }
.xp-sticky {
  position: static !important; height: auto !important; display: block !important;
  padding: 0 var(--page-x) var(--section-y) !important;
}
.xp-index { display: block !important; margin-bottom: var(--space-l); }
.xp-list, .xp-count { display: none !important; }
.xp-stage { height: auto !important; display: flex !important; flex-direction: column; gap: var(--space-m); }
.xp-slot { position: static !important; transform: none !important; }
.xp-card { height: auto !important; transform: none !important; max-width: none; }
`
