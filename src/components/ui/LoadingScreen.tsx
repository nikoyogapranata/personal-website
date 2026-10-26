'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Visibility is decided before first paint by loaderBootScript (src/lib/loader.ts)
const DURATION = 3000

const SKIP_EVENTS = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const

export default function LoadingScreen() {
  const [count, setCount] = useState(0)
  const [done,  setDone]  = useState(false)

  useEffect(() => {
    if (document.documentElement.dataset.loader !== '1') return

    let frame = 0
    let timer = 0
    let start = 0

    // Any interaction skips the intro
    const finish = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      SKIP_EVENTS.forEach(e => window.removeEventListener(e, finish))
      setDone(true)
    }

    const tick = (now: number) => {
      if (!start) start = now
      const progress = Math.min((now - start) / DURATION, 1)
      setCount(Math.floor(progress * 100))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else timer = window.setTimeout(finish, 300)
    }

    SKIP_EVENTS.forEach(e => window.addEventListener(e, finish, { passive: true }))
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      SKIP_EVENTS.forEach(e => window.removeEventListener(e, finish))
    }
  }, [])

  return (
    <motion.div
      className="loading-screen"
      aria-hidden="true"
      initial={false}
      animate={{ y: done ? '-100%' : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
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
        .ls-number { font-size: clamp(200px, 38vw, 560px); }
        @media (max-width: 768px) { .ls-number { font-size: 52vw; } }
      `}</style>
      <div className="ls-number" style={{
        position:      'absolute',
        bottom:        '-0.08em',
        right:         'clamp(32px, 5vw, 60px)',
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
