'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PROFILE } from '@/data'

// The statement lives in src/data/profile.ts (shared with the /about scroll story)
const words = PROFILE.bio.story.map(w => ({ text: w.text, font: w.accent ? 'serif' as const : 'display' as const }))

interface ProgressiveWordProps {
  text: string
  font: 'display' | 'serif'
  index: number
  total: number
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress']
}

function ProgressiveWord({ text, font, index, total, scrollProgress }: ProgressiveWordProps) {
  const start = (index / total) * 0.5
  const end = Math.min(start + (1 / total) * 6, 1)
  // Words fade up from 36%: on cream that's the #a3a3a3 grey the paragraph used to start from.
  // Colour comes from the tone tokens, so a word still on screen flips with the backdrop.
  const opacity = useTransform(scrollProgress, [start, end], [0.36, 1])

  return (
    <motion.span
      style={{
        fontFamily: font === 'serif' ? 'var(--font-serif)' : 'var(--font-display)',
        fontWeight: font === 'serif' ? 400 : 600,
        fontStyle: font === 'serif' ? 'italic' : 'normal',
        fontSize: font === 'serif' ? '1.08em' : '1em',
        display: 'inline',
        color: font === 'serif' ? 'var(--tone-serif)' : 'var(--tone-fg)',
        opacity,
      }}
    >
      {text}
    </motion.span>
  )
}

export default function AboutV2() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.3', 'end end'],
  })

  return (
    <section
      ref={sectionRef}
      id="about"
      data-tone="light"
      style={{
        minHeight: '150vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--section-y) 8vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <p style={{
        fontSize: 'var(--text-lead)',
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
        textAlign: 'center',
        maxWidth: '100%',
        margin: 0,
      }}>
        {words.map((word, i) => (
          <ProgressiveWord
            key={i}
            text={word.text}
            font={word.font}
            index={i}
            total={words.length}
            scrollProgress={scrollYProgress}
          />
        ))}
      </p>

      <style>{`
        @media (max-width: 900px) {
          section#about {
            padding: clamp(48px, 6vw, 80px) 6vw !important;
            min-height: 100vh !important;
          }
          section#about p {
            font-size: clamp(24px, 7vw, 40px) !important;
          }
        }
      `}</style>
    </section>
  )
}
