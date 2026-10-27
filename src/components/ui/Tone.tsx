'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { DURATION } from '@/lib/motion'

/**
 * Light/dark "tone" of the page. Sections declare data-tone="light|violet|dark"; whichever one
 * sits under the viewport's midline sets the tone. Fixed backdrop layers crossfade to it, and
 * text colour tokens (--tone-fg etc., set from html[data-fg]) flip halfway through the
 * crossfade, so text is never mid-grey on mid-grey. With prefers-reduced-motion both switch
 * instantly. Sections on top of the backdrop leave their background transparent.
 */

const TONES = ['light', 'violet', 'dark'] as const
export type Tone = (typeof TONES)[number]

/** Solid colour of each tone, for UI that paints its own surface (the navbar) */
export const TONE_COLOR: Record<Tone, string> = {
  light:  'var(--color-bg)',
  violet: 'var(--color-accent-primary)',
  dark:   'var(--color-bg-dark)',
}

/** bg changes at the start of a crossfade, fg at its midpoint */
const ToneContext = createContext<{ bg: Tone; fg: Tone }>({ bg: 'light', fg: 'light' })
export const useTone = () => useContext(ToneContext)

const isTone = (v: string | undefined): v is Tone => TONES.includes(v as Tone)
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ToneProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [bg, setBg] = useState<Tone>('light')
  const [fg, setFg] = useState<Tone>('light')
  const layers = useRef<Partial<Record<Tone, HTMLDivElement>>>({})
  // Visible layers, bottom to top; the top one is the current tone
  const stack = useRef<Tone[]>(['light'])
  // The first tone after load or a route change is applied without a crossfade
  const instant = useRef(true)
  const fgTimer = useRef(0)

  // Which tone is under the midline? A zero-height root at 50% reports the sections crossing it.
  useEffect(() => {
    instant.current = true
    const sections = [...document.querySelectorAll<HTMLElement>('[data-tone]')]
    const crossing = new Set<Element>()
    const pick = () => {
      // Sections can overlap (Work's list starts inside its title area): the later one wins
      const last = sections.filter(el => crossing.has(el)).at(-1)
      const tone = last?.dataset.tone
      setBg(isTone(tone) ? tone : 'light')
    }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) crossing.add(e.target)
        else crossing.delete(e.target)
      }
      pick()
    }, { rootMargin: '-50% 0px -50% 0px' })
    sections.forEach(el => io.observe(el))
    if (!sections.length) pick()
    return () => io.disconnect()
  }, [pathname])

  // Crossfade the backdrop to bg and flip fg at the midpoint
  useEffect(() => {
    const els = layers.current
    const s = stack.current
    const set = (tone: Tone, opacity: 0 | 1, animate: boolean) => {
      const el = els[tone]
      if (!el) return
      el.style.transition = animate ? '' : 'none'
      el.style.opacity = String(opacity)
    }
    window.clearTimeout(fgTimer.current)

    if (instant.current || prefersReducedMotion()) {
      instant.current = false
      TONES.forEach(t => set(t, t === bg ? 1 : 0, false))
      stack.current = [bg]
      setFg(bg)
      return
    }
    if (s.at(-1) === bg) return

    if (s.at(-2) === bg) {
      // Reversed before the last crossfade finished: fade the incoming layer back out
      set(s.pop()!, 0, true)
    } else {
      const i = s.indexOf(bg)
      if (i >= 0) {
        s.splice(i, 1)
        set(bg, 0, false)
      }
      s.push(bg)
      s.forEach((t, z) => { if (els[t]) els[t].style.zIndex = String(z) })
      void els[bg]?.offsetWidth // commit opacity 0 before transitioning from it
      set(bg, 1, true)
    }
    fgTimer.current = window.setTimeout(() => setFg(bg), (DURATION.base * 1000) / 2)
  }, [bg])

  // Once the top layer is fully in, hide the ones beneath it
  const onFadeEnd = (tone: Tone, el: HTMLDivElement) => {
    const s = stack.current
    // Check the rendered opacity, not the target: a stray transitionend can arrive as a fade starts
    if (s.at(-1) !== tone || getComputedStyle(el).opacity !== '1') return
    s.slice(0, -1).forEach(t => {
      const el = layers.current[t]
      if (el) { el.style.transition = 'none'; el.style.opacity = '0' }
    })
    stack.current = [tone]
  }

  useEffect(() => {
    document.documentElement.dataset.fg = fg
  }, [fg])

  return (
    <ToneContext.Provider value={{ bg, fg }}>
      <div aria-hidden="true" className="tone-backdrop">
        {TONES.map(t => (
          <div
            key={t}
            ref={el => { if (el) layers.current[t] = el }}
            className="tone-layer"
            onTransitionEnd={(e) => {
              if (e.target === e.currentTarget && e.propertyName === 'opacity') onFadeEnd(t, e.currentTarget)
            }}
            style={{ background: TONE_COLOR[t], opacity: t === 'light' ? 1 : 0 }}
          />
        ))}
      </div>
      {children}
    </ToneContext.Provider>
  )
}
