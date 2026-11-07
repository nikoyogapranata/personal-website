'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { EASE, EASE_IN_OUT } from '@/lib/motion'

/**
 * Curtain transition for internal navigation: a panel slides up over the page, shows the
 * destination's name, the route changes underneath, then the panel slides off the top.
 *
 * One capture-phase click listener on document handles every link (next/link, motion links,
 * the menu): it calls preventDefault(), which next/link respects, and navigates itself once the
 * page is covered. Left alone, so the browser or Next handles them as usual: external links,
 * target="_blank", downloads, mailto:, modified clicks, routes not listed below, back/forward,
 * clicks while the intro loader is up, and prefers-reduced-motion (an instant swap).
 *
 * Colours come from --curtain-bg / --curtain-fg in globals.css.
 */

/** Routes the curtain runs for, and the name it shows for each */
const ROUTE_NAMES: Record<string, string> = {
  '/':        'Home',
  '/about':   'About',
  '/work':    'Work',
  '/contact': 'Contact',
}

// Cover + route swap (~2 frames once prefetched) + reveal ≈ 700ms
const COVER_S  = 0.28
const REVEAL_S = 0.3
/** Reveal anyway if the route hasn't changed by then (offline, slow server) */
const NAV_TIMEOUT_MS = 4000

type Phase = 'idle' | 'cover' | 'covered' | 'reveal'

const panel: Variants = {
  idle:   { y: '100%', transition: { duration: 0 } },
  cover:  { y: '0%',    transition: { duration: COVER_S,  ease: EASE_IN_OUT } },
  reveal: { y: '-100%', transition: { duration: REVEAL_S, ease: EASE_IN_OUT } },
}
const label: Variants = {
  idle:   { opacity: 0, y: '0.25em', transition: { duration: 0 } },
  cover:  { opacity: 1, y: 0, transition: { duration: 0.24, delay: 0.08, ease: EASE } },
  reveal: { opacity: 1, y: 0 },
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Move focus to the new page's heading, so keyboard and screen-reader users start at the top */
function focusHeading() {
  const h1 = document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('h1')
  if (!h1) return
  if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1')
  h1.focus({ preventScroll: true })
}

export default function PageTransition() {
  const router   = useRouter()
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('idle')
  const [name,  setName]  = useState('')
  const phaseRef = useRef<Phase>('idle')
  /** Path being navigated to; null once the transition no longer waits on it */
  const pending  = useRef<string | null>(null)
  const timeout  = useRef(0)

  const go = useCallback((next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  // The new page is in place (or we gave up waiting): reset scroll, then uncover it
  const uncover = useCallback(() => {
    if (phaseRef.current !== 'covered') return
    window.clearTimeout(timeout.current)
    pending.current = null
    window.scrollTo(0, 0)
    // Two frames: the new page lays out and the tone backdrop picks its colour before the reveal
    requestAnimationFrame(() => requestAnimationFrame(() => {
      focusHeading()
      go('reveal')
    }))
  }, [go])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!(a instanceof HTMLAnchorElement) || !a.getAttribute('href')) return
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return

      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || !(url.pathname in ROUTE_NAMES)) return
      const samePage = url.pathname === location.pathname && url.search === location.search
      if (samePage && url.hash) return // in-page anchor: leave it to the browser

      // Already on this page, or mid-transition: do nothing
      if (samePage || phaseRef.current !== 'idle') {
        e.preventDefault()
        return
      }
      // The intro loader owns the screen, or the visitor prefers no motion: plain navigation
      if (document.documentElement.dataset.loader || prefersReducedMotion()) return

      e.preventDefault()
      pending.current = url.pathname + url.search + url.hash
      setName(ROUTE_NAMES[url.pathname])
      go('cover')
    }

    // Back/forward during a transition: drop the pending push and uncover whatever loads
    const onPopState = () => {
      if (phaseRef.current === 'idle' || phaseRef.current === 'reveal') return
      pending.current = null
      if (phaseRef.current === 'covered') uncover()
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
      window.clearTimeout(timeout.current)
    }
  }, [go, uncover])

  // The route we pushed has rendered
  useEffect(() => {
    const target = pending.current
    if (phaseRef.current === 'covered' && target && new URL(target, location.href).pathname === pathname) uncover()
  }, [pathname, uncover])

  const onPanelDone = (variant: string) => {
    if (variant === 'cover' && phaseRef.current === 'cover') {
      go('covered')
      const target = pending.current
      if (!target) return uncover() // cancelled by back/forward while covering
      timeout.current = window.setTimeout(uncover, NAV_TIMEOUT_MS)
      router.push(target)
    } else if (variant === 'reveal' && phaseRef.current === 'reveal') {
      go('idle')
    }
  }

  const variant = phase === 'covered' ? 'cover' : phase

  return (
    <motion.div
      aria-hidden="true"
      className="page-curtain"
      initial={false}
      animate={variant}
      variants={panel}
      onAnimationComplete={onPanelDone}
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        9000, // over the navbar and menu; under the film grain and the intro loader
        background:    'var(--curtain-bg)',
        color:         'var(--curtain-fg)',
        visibility:    phase === 'idle' ? 'hidden' : 'visible',
        pointerEvents: phase === 'idle' ? 'none' : 'auto',
        overflow:      'hidden',
      }}
    >
      {/* Same corner and scale as the loader's counter, so the two read as one system */}
      <motion.span
        variants={label}
        style={{
          position:      'absolute',
          bottom:        '-0.08em',
          right:         'clamp(32px, calc(3.125 * var(--u)), 72px)',
          fontFamily:    'var(--font-display)',
          fontWeight:    700,
          // CONTACT is the widest name; 18vw keeps it inside a 375px phone
          fontSize:      'min(var(--text-title), 18vw)',
          textTransform: 'uppercase',
          letterSpacing: '-0.04em',
          lineHeight:    1,
          whiteSpace:    'nowrap',
          userSelect:    'none',
        }}
      >
        {name}
      </motion.span>
    </motion.div>
  )
}
