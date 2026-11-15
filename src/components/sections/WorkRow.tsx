'use client'

import { useId, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { DURATION, EASE, reveal } from '@/lib/motion'

/**
 * Marquee speed, in ems of the marquee text per second, so it feels the same at every size.
 * 0.9 matches the site menu (FlowingMenu at speed 12: ~393px per loop at 36px text).
 * The one number to tune.
 */
const MARQUEE_EM_PER_SEC = 0.9

type Edge = 'top' | 'bottom'

// Mirrors the touch rule: no hover effect where there's no real hover
const NO_HOVER = '(hover: none), (pointer: coarse)'

interface WorkRowProps {
  index: number
  href: string
  title: string
  category: string
  description: string
}

/**
 * One row of the home page Work list. Hover or keyboard focus fills it with ink from the edge the
 * pointer crossed (top or bottom, as in FlowingMenu) and loops the project's description across it.
 */
export default function WorkRow({ index, href, title, category, description }: WorkRowProps) {
  const reduceMotion = usePrefersReducedMotion()
  const descId       = useId()
  const rowRef       = useRef<HTMLAnchorElement>(null)
  const itemRef      = useRef<HTMLSpanElement>(null)

  const hovered = useRef(false)
  const focused = useRef(false)
  const activeRef = useRef(false)
  const [active, setActive]       = useState(false)
  // Copies per half of the track (each half must be at least as wide as the row) and seconds per loop
  const [copies, setCopies]       = useState(1)
  const [loopSecs, setLoopSecs]   = useState(20)

  // Fill position, in % of the row's height: 101 below, -101 above, 0 in place.
  // The inner wrap moves the opposite way, so the text stays put while the fill slides past it.
  const fill    = useMotionValue(101)
  const fillY   = useTransform(fill, v => `${v}%`)
  const innerY  = useTransform(fill, v => `${-v}%`)

  const edgeOf = (clientY: number): Edge => {
    const r = rowRef.current!.getBoundingClientRect()
    return clientY - r.top < r.height / 2 ? 'top' : 'bottom'
  }

  const measure = () => {
    const row = rowRef.current, item = itemRef.current
    if (!row || !item || reduceMotion) return
    const w = item.offsetWidth
    if (!w) return
    const n = Math.max(1, Math.ceil(row.offsetWidth / w))
    const em = parseFloat(getComputedStyle(item).fontSize) || 16
    setCopies(n)
    setLoopSecs((n * w) / (em * MARQUEE_EM_PER_SEC))
  }

  const sync = (edge: Edge) => {
    const next = hovered.current || focused.current
    if (next === activeRef.current) return
    activeRef.current = next
    setActive(next)
    if (reduceMotion) {
      fill.jump(next ? 0 : 101)
      return
    }
    const out = edge === 'top' ? -101 : 101
    if (next) {
      measure()
      // Start from the edge it came in through, even if it was last sent out through the other one
      fill.jump(out)
      animate(fill, 0, { duration: DURATION.base, ease: EASE })
    } else {
      animate(fill, out, { duration: DURATION.base, ease: EASE })
    }
  }

  const item = (
    <>
      <span>{description}</span>
      <span className="work-row__sep">·</span>
    </>
  )

  return (
    <motion.a
      ref={rowRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-describedby={descId}
      {...reveal({ order: index % 3 })}
      // Shown at once when it gets keyboard focus (globals.css)
      data-focus-reveal=""
      data-active={active || undefined}
      className="work-row"
      // A tap also fires enter events; touch gets no effect (the link opens a new tab)
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch' || window.matchMedia(NO_HOVER).matches) return
        hovered.current = true
        sync(edgeOf(e.clientY))
      }}
      onPointerLeave={(e) => {
        if (!hovered.current) return
        hovered.current = false
        sync(edgeOf(e.clientY))
      }}
      onFocus={(e) => {
        // Keyboard only: a click or tap focuses too
        if (!e.currentTarget.matches(':focus-visible')) return
        focused.current = true
        sync('bottom')
      }}
      onBlur={() => {
        if (!focused.current) return
        focused.current = false
        sync('bottom')
      }}
    >
      <span className="work-row__lead">
        <span className="work-row__num">{'0' + (index + 1)}</span>
        <span className="work-row__title">{title}</span>
      </span>
      <span className="work-row__cat">{category}</span>
      {/* Read once by screen readers; the visible copies below are decoration */}
      <span id={descId} hidden>{description}</span>

      <motion.span className="work-row__fill" aria-hidden="true" style={{ y: fillY }}>
        <motion.span className="work-row__fill-inner" style={{ y: innerY }}>
          {reduceMotion ? (
            <span className="work-row__static">{description}</span>
          ) : (
            <span className="work-row__track" style={{ animationDuration: `${loopSecs}s` }}>
              {[0, 1].map(half => (
                <span key={half} className="work-row__half">
                  {Array.from({ length: copies }, (_, i) => (
                    <span key={i} className="work-row__item" ref={half === 0 && i === 0 ? itemRef : undefined}>
                      {item}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          )}
        </motion.span>
      </motion.span>
    </motion.a>
  )
}
