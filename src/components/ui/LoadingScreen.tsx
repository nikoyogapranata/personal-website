'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'niko_session_loaded'
const DURATION    = 3000

export default function LoadingScreen() {
  const pathname              = usePathname()
  const initPath              = useRef(pathname)
  const [visible, setVisible] = useState(false)
  const [count,   setCount]   = useState(0)
  const rafRef                = useRef<number | null>(null)
  const startRef              = useRef<number | null>(null)

  // Dismiss instantly if the user navigates away mid-load
  useEffect(() => {
    if (pathname !== initPath.current && visible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setVisible(false)
    }
  }, [pathname, visible])

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return
    // Mark shown immediately so navigating away won't retrigger it
    sessionStorage.setItem(STORAGE_KEY, '1')
    document.body.style.overflow = 'hidden'
    setVisible(true)

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed  = now - startRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      setCount(Math.floor(progress * 100))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setVisible(false), 300)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const handleExitComplete = () => {
    document.body.style.overflow = ''
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position:        'fixed',
            inset:           0,
            zIndex:          9999,
            backgroundColor: '#5b21b6',
          }}
        >
          <style>{`
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
      )}
    </AnimatePresence>
  )
}
