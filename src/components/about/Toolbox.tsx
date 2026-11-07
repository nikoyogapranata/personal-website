'use client'

import { useEffect, useRef, useState } from 'react'
import { SKILL_CATEGORIES } from '@/data'
import type { ToolboxPhysics } from './toolbox-physics'

/**
 * Tech stack as brutalist chips. The chips are always a real <ul>. On desktop with a fine
 * pointer (and motion allowed), they drop in and pile up with physics; matter.js is only
 * downloaded when the section is near the viewport, and the simulation pauses off-screen.
 * Everywhere else, or if loading fails, they stay a neat wrapped grid.
 */

/** Same condition in CSS (arena height) and JS (whether to load physics) */
const PHYSICS_QUERY = '(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

export default function Toolbox() {
  const arenaRef = useRef<HTMLDivElement>(null)
  const listRef  = useRef<HTMLUListElement>(null)
  const [mode, setMode] = useState<'grid' | 'physics'>('grid')

  useEffect(() => {
    const arena = arenaRef.current, list = listRef.current
    if (!arena || !list) return
    const mq = window.matchMedia(PHYSICS_QUERY)
    let physics: ToolboxPhysics | null = null
    let cancelled = false
    let visible = false
    const observers: (IntersectionObserver | ResizeObserver)[] = []

    const teardown = () => {
      observers.splice(0).forEach(o => o.disconnect())
      physics?.destroy()
      physics = null
      list.dataset.physics = 'off'
      setMode('grid')
    }

    const setup = () => {
      if (!mq.matches) return
      // Load when within ~one screen of the viewport
      const near = new IntersectionObserver(async ([e]) => {
        if (!e.isIntersecting) return
        near.disconnect()
        try {
          const { startToolbox } = await import('./toolbox-physics')
          if (cancelled || !mq.matches) return
          setMode('physics')
          // Let the physics-mode styles apply before measuring the grid positions
          requestAnimationFrame(() => {
            if (cancelled) return
            physics = startToolbox(arena, [...list.children] as HTMLElement[])
            list.dataset.physics = 'ready'
            // Drop when a quarter of the arena is on screen; run only while it's visible
            const inView = new IntersectionObserver(([v]) => {
              visible = v.isIntersecting
              if (visible && v.intersectionRatio >= 0.25) physics?.drop()
              physics?.setActive(visible && !document.hidden)
              list.dataset.physics = visible ? 'running' : 'paused'
            }, { threshold: [0, 0.25] })
            inView.observe(arena)
            observers.push(inView)
            // A new width means new grid positions: start over
            let width = arena.clientWidth
            const ro = new ResizeObserver(() => {
              if (arena.clientWidth === width || !physics) return
              width = arena.clientWidth
              physics.destroy()
              physics = startToolbox(arena, [...list.children] as HTMLElement[])
              physics.drop()
              physics.setActive(visible)
            })
            ro.observe(arena)
            observers.push(ro)
          })
        } catch {
          list.dataset.physics = 'failed' // stays a grid
        }
      }, { rootMargin: '100% 0px' })
      near.observe(arena)
      observers.push(near)
    }

    const onVisibility = () => physics?.setActive(visible && !document.hidden)
    const onQuery = () => { teardown(); setup() }
    document.addEventListener('visibilitychange', onVisibility)
    mq.addEventListener('change', onQuery)
    setup()
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      mq.removeEventListener('change', onQuery)
      observers.splice(0).forEach(o => o.disconnect())
      physics?.destroy()
    }
  }, [])

  return (
    <section className="tb" data-tone="light" aria-labelledby="tb-title">
      <style>{CSS}</style>
      <div className="tb-head">
        <div>
          <h2 id="tb-title" className="tb-title">Toolbox</h2>
          <p className="tb-line">go on, throw them around</p>
        </div>
        <ul className="tb-legend" aria-label="Categories">
          {SKILL_CATEGORIES.map(c => (
            <li key={c.id}><span className={`tb-swatch chip--${c.id}`} aria-hidden="true" />{c.title}</li>
          ))}
        </ul>
      </div>

      <div ref={arenaRef} className="tb-arena">
        <ul ref={listRef} className="tb-chips" data-mode={mode} data-physics="off" aria-label="Tech stack">
          {SKILL_CATEGORIES.flatMap(c => c.skills.map(s => (
            <li key={`${c.id}-${s}`} className={`chip chip--${c.id}`}>
              {s}<span className="sr-only">, {c.title}</span>
            </li>
          )))}
        </ul>
      </div>
    </section>
  )
}

const CSS = `
.tb { padding: var(--section-y) max(var(--page-x), calc((100% - var(--content-max)) / 2)); }
.tb-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: var(--space-m); margin-bottom: var(--space-l); }
.tb-title {
  margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-section);
  line-height: 0.9; letter-spacing: -0.04em; text-transform: uppercase; color: var(--color-text);
}
/* Only where the chips can actually be thrown: shown by the physics media query below */
.tb-line { display: none; margin: 0.4em 0 0; font-family: var(--font-serif); font-style: italic; font-size: var(--text-h4); color: var(--color-accent-secondary); }
.tb-legend {
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, auto); gap: 8px 28px;
  font-family: var(--font-sans); font-size: var(--text-small); color: var(--color-text-muted);
}
.tb-legend li { display: flex; align-items: center; gap: 10px; }
.tb-swatch { width: 16px; height: 16px; border-radius: 50%; border: var(--border-ink); flex-shrink: 0; }
.tb-swatch.chip--design { border-style: dashed; }

.tb-arena { position: relative; }
.tb-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 12px 10px; }
.chip {
  display: inline-flex; align-items: center; white-space: nowrap; user-select: none;
  font-family: var(--font-display); font-weight: 600; font-size: clamp(15px, 1.1vw, 22px); line-height: 1;
  padding: 0.6em 1.1em; border: var(--border-ink); border-radius: var(--radius-pill); box-shadow: var(--shadow-chip);
}
.chip--frontend  { background: var(--color-accent-primary);       color: var(--color-text-inverse); }
.chip--backend   { background: var(--color-bg-dark);              color: var(--color-text-inverse); }
.chip--databases { background: #ffffff;                            color: var(--color-text); }
.chip--ios       { background: var(--color-accent-secondary);     color: #ffffff; }
.chip--ai        { background: var(--color-accent-primary-light); color: var(--color-text); }
/* Outline only, dashed, so it never reads as a white Databases chip */
.chip--design    { background: transparent; color: var(--color-text); border-style: dashed; box-shadow: none; }

/* Grid (phones, reduced motion, no physics): lift and tilt a little on hover */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .tb-chips[data-mode="grid"] .chip { transition: transform var(--dur-fast) var(--ease); }
  .tb-chips[data-mode="grid"] .chip:hover { transform: translateY(-4px) rotate(-2deg); }
}

/* Physics: a fixed-height arena (set before JS, so nothing shifts when it loads) */
@media ${PHYSICS_QUERY} {
  .tb-line { display: block; }
  .tb-arena { height: clamp(380px, 52svh, 560px); overflow: hidden; border-bottom: var(--border-ink); }
  .tb-chips[data-mode="physics"] { cursor: grab; }
  .tb-chips[data-mode="physics"] .chip { will-change: transform; }
  .tb-chips[data-mode="physics"]:active { cursor: grabbing; }
}

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
`
