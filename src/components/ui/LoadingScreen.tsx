'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { DURATION, EASE_IN_OUT } from '@/lib/motion'
import { LOADER_FAILSAFE_MS, LOADER_PENDING, LOADER_RUNNING, LOADER_WATCHDOG_MS } from '@/lib/loader'

// Visibility is decided before first paint by loaderBootScript (src/lib/loader.ts).
// Count + hold + exit ≈ 2s.
const COUNT_MS = 1400
const HOLD_MS  = 100

const SKIP_EVENTS = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const

export default function LoadingScreen() {
  // null until the count starts, so the server HTML never contains a number
  const [count, setCount] = useState<number | null>(null)
  const [done,  setDone]  = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    // Pending: first run after the boot script. Running: this effect already ran and was cleaned
    // up before finishing (React Strict Mode's mount → cleanup → mount in dev, or a hot reload).
    // The cleanup cancelled that run's count, so either way start the intro from scratch.
    if (root.dataset.loader !== LOADER_PENDING && root.dataset.loader !== LOADER_RUNNING) return

    // A failsafe already hid the loader: JS arrived too late, so don't bring it back
    if (ref.current && getComputedStyle(ref.current).visibility === 'hidden') {
      delete root.dataset.loader
      return
    }
    // Taking over: the pending failsafe stops matching and the running watchdog takes its place
    root.dataset.loader = LOADER_RUNNING

    let frame = 0
    let timer = 0
    let start = 0

    // Watchdog: if the intro hasn't exited in time, whatever went wrong, drop the loader and
    // unlock scrolling. Cleared and re-armed with every (re)start of this effect.
    const watchdog = window.setTimeout(() => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      setDone(true)
      delete root.dataset.loader
    }, LOADER_WATCHDOG_MS)

    // Any interaction skips the intro
    const finish = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      SKIP_EVENTS.forEach(e => window.removeEventListener(e, finish))
      setDone(true)
    }

    const tick = (now: number) => {
      if (!start) start = now
      const progress = Math.min((now - start) / COUNT_MS, 1)
      setCount(Math.floor(progress * 100))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else timer = window.setTimeout(finish, HOLD_MS)
    }

    SKIP_EVENTS.forEach(e => window.addEventListener(e, finish, { passive: true }))
    // Hydrated late (slow connection): skip the count and go straight to the exit
    frame = requestAnimationFrame(performance.now() > LOADER_FAILSAFE_MS - COUNT_MS ? finish : tick)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      clearTimeout(watchdog)
      SKIP_EVENTS.forEach(e => window.removeEventListener(e, finish))
    }
  }, [])

  return (
    <motion.div
      ref={ref}
      className="loading-screen"
      aria-hidden="true"
      initial={false}
      animate={{ y: done ? '-100%' : 0 }}
      transition={{ duration: DURATION.base, ease: EASE_IN_OUT }}
      onAnimationComplete={() => {
        if (done) delete document.documentElement.dataset.loader
      }}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        backgroundColor: 'var(--color-accent-primary)',
      }}
    >
      <style>{`
        .loading-screen { display: none; }
        html[data-loader] .loading-screen { display: block; }
        html[data-loader] body { overflow: hidden; }
        /* Failsafe: if JS hasn't taken over (data-loader still "${LOADER_PENDING}") after
           ${LOADER_FAILSAFE_MS / 1000}s, hide the loader and unlock scrolling. Pure CSS, so it works
           when the app bundle is slow, blocked or throws. */
        html[data-loader="${LOADER_PENDING}"] .loading-screen {
          animation: loader-failsafe-hide 0s ${LOADER_FAILSAFE_MS}ms forwards;
        }
        html[data-loader="${LOADER_PENDING}"] body {
          animation: loader-failsafe-unlock 0s ${LOADER_FAILSAFE_MS}ms forwards;
        }
        @keyframes loader-failsafe-hide   { to { visibility: hidden; pointer-events: none; } }
        @keyframes loader-failsafe-unlock { to { overflow: visible; } }
        /* Watchdog: the same release ${LOADER_WATCHDOG_MS / 1000}s after the loader starts running,
           in case the loader's JS misbehaves or the main thread hangs. Separate keyframe names, so
           the animation restarts when the attribute switches from pending to running. */
        html[data-loader="${LOADER_RUNNING}"] .loading-screen {
          animation: loader-watchdog-hide 0s ${LOADER_WATCHDOG_MS}ms forwards;
        }
        html[data-loader="${LOADER_RUNNING}"] body {
          animation: loader-watchdog-unlock 0s ${LOADER_WATCHDOG_MS}ms forwards;
        }
        @keyframes loader-watchdog-hide   { to { visibility: hidden; pointer-events: none; } }
        @keyframes loader-watchdog-unlock { to { overflow: visible; } }
        .ls-number { font-size: calc(var(--text-marquee) * 2); }
        @media (max-width: 900px) { .ls-number { font-size: 52vw; } }
      `}</style>
      <div className="ls-number" style={{
        position:      'absolute',
        bottom:        '-0.08em',
        right:         'clamp(32px, calc(3.125 * var(--u)), 72px)',
        fontFamily:    'var(--font-display)',
        fontWeight:    700,
        color:         '#ffffff',
        lineHeight:    1,
        letterSpacing: '-0.04em',
        userSelect:    'none',
      }}>
        {count}
      </div>
    </motion.div>
  )
}
