'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'niko_session_loaded'
const NAME = 'NIKO PRANATA'

export default function LoadingScreen() {
  // Default true so the screen covers the page from the very first paint —
  // no flicker. useEffect immediately hides it for return visits.
  const [visible, setVisible]   = useState(true)
  const [skipped, setSkipped]   = useState(false)
  const [animDone, setAnimDone] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setSkipped(true)  // instant removal, no slide-up
      return
    }
    document.body.style.overflow = 'hidden'
  }, [])

  useEffect(() => {
    if (!animDone) return
    const timer = setTimeout(() => setVisible(false), 800)
    return () => clearTimeout(timer)
  }, [animDone])

  const handleExitComplete = () => {
    document.body.style.overflow = ''
    sessionStorage.setItem(STORAGE_KEY, '1')
  }

  if (skipped) return null

  const letters = NAME.split('')

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
          }}
          style={{
            position:        'fixed',
            inset:           0,
            zIndex:          9999,
            backgroundColor: '#1432ff',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            flexDirection:   'column',
            gap:             16,
          }}
        >
          {/* Name letters */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '0.02em',
            overflow:   'hidden',
          }}>
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{
                  duration: 1.0,
                  ease:     [0.16, 1, 0.3, 1],
                  delay:    0.3 + i * 0.18,
                }}
                onAnimationComplete={
                  i === letters.length - 1
                    ? () => setAnimDone(true)
                    : undefined
                }
                style={{
                  display:    'inline-block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize:   'clamp(80px, 16vw, 220px)',
                  color:      '#ffffff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  whiteSpace: letter === ' ' ? 'pre' : 'normal',
                  width:      letter === ' ' ? '0.4em' : 'auto',
                }}
              >
                {letter === ' ' ? ' ' : letter}
              </motion.span>
            ))}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
