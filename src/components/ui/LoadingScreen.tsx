'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'niko_session_loaded'
const WORDS = ['NIKO', 'PRANATA']

const letterMap = WORDS.flatMap((word, wi) =>
  word.split('').map((ch, li) => ({
    ch,
    wordIdx: wi,
    globalIdx: WORDS.slice(0, wi).reduce((acc, w) => acc + w.length, 0) + li,
  }))
)
const totalLetters = letterMap.length

export default function LoadingScreen() {
  const [visible, setVisible]   = useState(true)
  const [skipped, setSkipped]   = useState(false)
  const [animDone, setAnimDone] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setSkipped(true)
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

  return (
    <>
      <style>{`
        .ls-letter {
          font-size: clamp(42px, 12vw, 160px);
        }
        @media (min-width: 1401px) {
          .ls-letter {
            font-size: clamp(80px, 16vw, 220px);
          }
        }
        .ls-words {
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        @media (min-width: 768px) {
          .ls-words {
            flex-direction: row;
            gap: clamp(20px, 4vw, 64px);
          }
        }
      `}</style>
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
              backgroundColor: '#1432ff',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            <div className="ls-words" style={{ display: 'flex' }}>
              {WORDS.map((word, wi) => (
                <div key={wi} style={{ display: 'flex', overflow: 'hidden', gap: '0.01em' }}>
                  {letterMap
                    .filter(l => l.wordIdx === wi)
                    .map(({ ch, globalIdx }) => (
                      <motion.span
                        key={globalIdx}
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        transition={{
                          duration: 1.0,
                          ease:     [0.16, 1, 0.3, 1],
                          delay:    0.3 + globalIdx * 0.12,
                        }}
                        onAnimationComplete={
                          globalIdx === totalLetters - 1
                            ? () => setAnimDone(true)
                            : undefined
                        }
                        className="ls-letter"
                        style={{
                          display:       'inline-block',
                          fontFamily:    'var(--font-display)',
                          fontWeight:    700,
                          color:         '#ffffff',
                          letterSpacing: '-0.03em',
                          lineHeight:    1,
                        }}
                      >
                        {ch}
                      </motion.span>
                    ))
                  }
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
