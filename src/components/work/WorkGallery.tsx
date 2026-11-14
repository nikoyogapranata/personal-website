'use client'

import './work.css'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, type MotionValue } from 'framer-motion'
import { CATEGORIES, PROJECTS } from '@/data'
import { DURATION, EASE } from '@/lib/motion'
import { countFor, filterHref, parseFilter, type WorkFilter } from '@/lib/workFilter'
import ProjectCard, { type PillHandlers } from './ProjectCard'
import EndCard from './EndCard'

/*
 * /work gallery. Desktop: the section pins and vertical scroll slides the track sideways; the card
 * at the centre is flat and full size, its neighbours smaller and tilted. Phones, reduced motion
 * and no JS get the same cards as a vertical list (work.css, all in CSS, so nothing shifts after
 * hydration). The filter lives in ?filter= (src/lib/workFilter.ts).
 */

/** Scroll per step, in svh: one step moves the next card (or the end card) to the centre */
export const STEP_SVH = 60

/** When the track pins. Keep in sync with the @media rules in work.css */
const PINNED_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
/** When the VIEW pill follows the cursor; otherwise it's anchored in the card */
const FOLLOW_QUERY = '(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

const pad = (n: number) => String(n).padStart(2, '0')
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

const CHIPS: { id: WorkFilter; chip: string }[] = [{ id: 'all', chip: 'All' }, ...CATEGORIES.map(c => ({ id: c.id, chip: c.chip }))]

/* Before hydration, html[data-work-filter] (set by workBootScript) applies a ?filter in CSS: hides
   the other cards, sets the pinned length and marks the chip. Counts come from the data. */
const ACTIVE_CHIP = 'background:var(--color-text);color:var(--color-text-inverse);box-shadow:3px 3px 0 var(--color-accent-primary)'
const INACTIVE_CHIP = 'background:#fff;color:var(--color-text);box-shadow:var(--shadow-chip)'
const BOOT_CSS = CATEGORIES.map(({ id }) => `
html[data-work-filter="${id}"] .wg-item:not(.wg-item--end):not([data-cat="${id}"]) { display: none; }
html[data-work-filter="${id}"] .wg-pin { --steps: ${countFor(id)} !important; }
html[data-work-filter="${id}"] .wg-chip[data-f="${id}"] { ${ACTIVE_CHIP} }
html[data-work-filter="${id}"] .wg-chip[data-f="${id}"] .wg-chip-x { opacity: 1; }`).join('') + `
html[data-work-filter] .wg-chip[data-f="all"] { ${INACTIVE_CHIP} }`

function useMedia(query: string) {
  return useSyncExternalStore(
    cb => { const m = matchMedia(query); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => matchMedia(query).matches,
    () => false,
  )
}

export default function WorkGallery() {
  const [filter, setFilter] = useState<WorkFilter>('all')
  /** The last filter change happened behind a fade (or before paint): no exit or layout animation */
  const [instant, setInstant] = useState(false)
  const [announce, setAnnounce] = useState('')

  const visible = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => filter === 'all' || p.category === filter)
  const count = visible.length

  const pinRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const items = useRef(new Map<string, HTMLLIElement>())
  const endRef = useRef<HTMLLIElement | null>(null)
  const filterRef = useRef(filter)
  const slugsRef = useRef<string[]>([])
  const slugs = visible.map(v => v.p.slug).join(' ')
  // Declared first, so the layout effects below see this render's values
  useLayoutEffect(() => {
    filterRef.current = filter
    slugsRef.current = slugs.split(' ')
  }, [filter, slugs])

  /** Pin position (page px), its scroll length, and each visible card's centre on the track */
  const geo = useRef({ pinTop: 0, range: 0, centers: [] as number[] })
  /** Scroll position in cards: 0 = first card centred, count = end card centred */
  const f = useMotionValue(0)
  const x = useMotionValue(0)
  const progress = useMotionValue(0)
  const trackOpacity = useMotionValue(1)
  const fadeIn = useRef(false)
  const pending = useRef(0)

  const measure = useCallback(() => {
    const pin = pinRef.current, frame = frameRef.current
    if (!pin || !frame) return
    const els = [...slugsRef.current.map(s => items.current.get(s)), endRef.current]
    geo.current = {
      pinTop: pin.getBoundingClientRect().top + window.scrollY,
      range: Math.max(0, pin.offsetHeight - frame.offsetHeight),
      // offsetLeft ignores transforms, so layout animations and tilts don't disturb it
      centers: els.flatMap(el => (el ? [el.offsetLeft + el.offsetWidth / 2] : [])),
    }
  }, [])

  const update = useCallback(() => {
    const { pinTop, range, centers } = geo.current
    const n = centers.length - 1
    if (n < 0) return
    const p = range > 0 ? clamp((window.scrollY - pinTop) / range, 0, 1) : 0
    const fv = p * n
    const k = Math.min(Math.floor(fv), n - 1)
    const at = k < 0 ? centers[0] : centers[k] + (centers[k + 1] - centers[k]) * (fv - k)
    f.set(fv)
    progress.set(p)
    x.set(centers[0] - at)
  }, [f, progress, x])

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', update)

  useEffect(() => {
    const ro = new ResizeObserver(() => { measure(); update() })
    if (pinRef.current) ro.observe(pinRef.current)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [measure, update])

  // After every filter change: new centres and pin length, then fade back in if we faded out
  useLayoutEffect(() => {
    measure()
    update()
    if (fadeIn.current) {
      fadeIn.current = false
      animate(trackOpacity, 1, { duration: DURATION.base, ease: EASE })
    }
  }, [filter, measure, update, trackOpacity])

  const apply = useCallback((next: WorkFilter, push: boolean) => {
    if (next === filterRef.current) return
    if (push) window.history.pushState(null, '', filterHref(next))
    setAnnounce(`Showing ${countFor(next)} of ${PROJECTS.length} projects`)
    const token = ++pending.current
    const pin = pinRef.current
    const pinTop = pin ? pin.getBoundingClientRect().top + window.scrollY : 0

    if (matchMedia(PINNED_QUERY).matches && window.scrollY > pinTop + 2) {
      // Mid-gallery: fade the track out, jump to the start of the pin (the pinned frame looks the
      // same at any point of it, so the jump can't be seen), swap the cards, fade back in
      animate(trackOpacity, 0, { duration: DURATION.fast, ease: EASE }).then(() => {
        if (token !== pending.current) return
        window.scrollTo({ top: pinTop, behavior: 'instant' })
        fadeIn.current = true
        setInstant(true)
        setFilter(next)
      })
      return
    }
    // At the start, or the list layout: animate in place
    trackOpacity.set(1)
    setInstant(false)
    setFilter(next)
    if (!matchMedia(PINNED_QUERY).matches && pin && pin.getBoundingClientRect().top < 0) {
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56
      window.scrollTo({ top: pinTop - nav, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }
  }, [trackOpacity])

  // Take over a ?filter from the URL (hard load: the boot script already applied it in CSS; client
  // navigation: set the same attribute now, before paint), and follow back/forward
  useLayoutEffect(() => {
    const html = document.documentElement
    const initial = parseFilter(window.location.search)
    if (initial !== 'all') {
      html.dataset.workFilter = initial
      // The URL is outside React and the static HTML can't know it: sync it here, before paint
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstant(true)
      setFilter(initial)
    } else {
      delete html.dataset.workFilter
    }
    const onPop = () => apply(parseFilter(window.location.search), false)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      delete html.dataset.workFilter
    }
  }, [apply])

  // The CSS takeover ends once React has removed the filtered-out cards
  const onExitComplete = () => { delete document.documentElement.dataset.workFilter }

  // Keyboard focus on a card (or a link in it) brings that card to the centre
  const onFocusCard = useCallback((i: number) => {
    if (!matchMedia(PINNED_QUERY).matches) return
    if (!document.activeElement?.matches(':focus-visible')) return
    const { pinTop, range, centers } = geo.current
    const n = centers.length - 1
    window.scrollTo({ top: pinTop + (n > 0 ? (i / n) * range : 0), behavior: 'smooth' })
  }, [])

  const register = useCallback((slug: string, el: HTMLLIElement | null) => {
    if (el) items.current.set(slug, el)
    else items.current.delete(slug)
  }, [])

  // VIEW pill: follows the cursor over a linked card on desktop
  const follow = useMedia(FOLLOW_QUERY)
  const [pillOn, setPillOn] = useState(false)
  const pillX = useSpring(0, { stiffness: 500, damping: 40, mass: 0.4 })
  const pillY = useSpring(0, { stiffness: 500, damping: 40, mass: 0.4 })
  const pill = useMemo<PillHandlers>(() => ({
    onEnter: e => {
      if (e.pointerType !== 'mouse') return
      pillX.jump(e.clientX); pillY.jump(e.clientY)
      setPillOn(true)
    },
    onMove: e => { if (e.pointerType === 'mouse') { pillX.set(e.clientX); pillY.set(e.clientY) } },
    onLeave: () => setPillOn(false),
  }), [pillX, pillY])

  return (
    <section className="wg" data-tone="light" data-pill={follow ? 'follow' : undefined} aria-label="Projects">
      <style>{BOOT_CSS}</style>
      <div ref={pinRef} className="wg-pin" style={{ ['--steps' as string]: count, ['--step' as string]: `${STEP_SVH}svh` }}>
        <div ref={frameRef} className="wg-frame">
          <div className="wg-top">
            <div className="wg-chips" role="group" aria-label="Filter projects by type">
              {CHIPS.map(c => {
                const on = filter === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="wg-chip"
                    data-f={c.id}
                    aria-pressed={on}
                    onClick={() => apply(on && c.id !== 'all' ? 'all' : c.id, true)}
                  >
                    <span>{c.chip}</span>
                    <span className="wg-chip-count">{pad(countFor(c.id))}</span>
                    {/* Always there (opacity only), so the active chip doesn't push its neighbours */}
                    {c.id !== 'all' && <span className="wg-chip-x" aria-hidden="true">✕</span>}
                    {on && c.id !== 'all' && <span className="sr-only">, clear filter</span>}
                  </button>
                )
              })}
            </div>
            {filter !== 'all' && <p className="wg-hint">Showing {count} of {PROJECTS.length}</p>}
            <p className="sr-only" role="status">{announce}</p>
          </div>

          <div className="wg-viewport">
            <motion.ol ref={trackRef} className="wg-track" style={{ x, opacity: trackOpacity }}>
              <AnimatePresence mode="popLayout" custom={instant} initial={false} onExitComplete={onExitComplete}>
                {visible.map(({ p, i }, vi) => (
                  <ProjectCard
                    key={p.slug}
                    project={p}
                    projectIndex={i}
                    index={vi}
                    f={f}
                    instant={instant}
                    preload={i === 0}
                    register={register}
                    onFocusCard={onFocusCard}
                    pill={pill}
                  />
                ))}
              </AnimatePresence>
              <EndCard index={count} f={f} instant={instant} register={el => { endRef.current = el }} onFocusCard={onFocusCard} />
            </motion.ol>
          </div>

          <BottomBar f={f} progress={progress} names={visible.map(v => v.p.title)} />
        </div>
      </div>

      {follow && (
        <motion.div
          className="wg-pill wg-pill--follow"
          aria-hidden="true"
          style={{ x: pillX, y: pillY }}
          initial={false}
          animate={{ opacity: pillOn ? 1 : 0, scale: pillOn ? 1 : 0.6 }}
          transition={{ duration: DURATION.fast, ease: EASE }}
        >
          View <span>↗</span>
        </motion.div>
      )}
    </section>
  )
}

/** "03 / 08", the current name and the progress bar. Its own component: the counter changes as
    you scroll, and only this needs to re-render for it */
function BottomBar({ f, progress, names }: { f: MotionValue<number>; progress: MotionValue<number>; names: string[] }) {
  const count = names.length
  const at = (v: number) => clamp(Math.round(v), 0, Math.max(0, count - 1))
  const [current, setCurrent] = useState(() => at(f.get()))
  useMotionValueEvent(f, 'change', v => setCurrent(at(v)))
  const c = Math.min(current, count - 1)
  return (
    <div className="wg-bottom" aria-hidden="true">
      <p className="wg-counter">
        <span className="wg-counter-now">{pad(c + 1)}</span>{' '}
        <span className="wg-counter-of">/ {pad(count)}</span>
      </p>
      <div className="wg-now">
        <span className="wg-now-name">{names[c]}</span>
        <span className="wg-progress"><motion.span style={{ scaleX: progress }} /></span>
      </div>
    </div>
  )
}
