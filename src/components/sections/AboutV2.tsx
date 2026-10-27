'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const words = [
  { text: 'A ',             font: 'display' },
  { text: 'developer ',     font: 'display' },
  { text: 'with ',          font: 'display' },
  { text: 'a ',             font: 'display' },
  { text: "designer's",     font: 'serif'   },
  { text: ' eye. ',         font: 'display' },
  { text: 'I ',             font: 'display' },
  { text: 'build ',         font: 'display' },
  { text: 'interfaces ',    font: 'display' },
  { text: 'that ',          font: 'display' },
  { text: 'feel ',          font: 'display' },
  { text: 'as ',            font: 'display' },

  { text: 'good ',          font: 'display' },
  { text: 'as ',            font: 'display' },
  { text: 'they ',          font: 'display' },
  { text: 'look ',          font: 'display' },
  { text: '— ',             font: 'display' },
  { text: 'obsessed ',      font: 'display' },
  { text: 'with ',          font: 'display' },
  { text: 'motion,',        font: 'serif'   },
  { text: ' the ',          font: 'display' },
  { text: 'type, ',         font: 'display' },
  { text: 'and ',           font: 'display' },
  { text: 'the ',           font: 'display' },
  { text: 'details',        font: 'serif'   },
  { text: ' others ',       font: 'display' },
  { text: 'skip. ',         font: 'display' },
  { text: 'Studying ',      font: 'display' },
  { text: 'computer ',      font: 'display' },
  { text: 'science, ',      font: 'display' },
  { text: 'always ',        font: 'display' },
  { text: 'building. ',     font: 'display' },
  { text: 'Somewhere ',     font: 'display' },
  { text: 'between ',       font: 'display' },
  { text: 'engineering ',   font: 'display' },
  { text: 'and ',           font: 'display' },
  { text: 'design — ',      font: 'display' },
  { text: "that's ",        font: 'display' },
  { text: 'where ',         font: 'display' },
  { text: 'I ',             font: 'display' },
  { text: 'live.',          font: 'serif'   },
] as const

interface ProgressiveWordProps {
  text: string
  font: 'display' | 'serif'
  index: number
  total: number
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress']
}

function ProgressiveWord({ text, font, index, total, scrollProgress }: ProgressiveWordProps) {
  const start   = (index / total) * 0.5
  const end     = Math.min(start + (1 / total) * 6, 1)
  // Words fade up from 36%: on cream that's the #a3a3a3 grey the paragraph used to start from.
  // Colour comes from the tone tokens, so a word still on screen flips with the backdrop.
  const opacity = useTransform(scrollProgress, [start, end], [0.36, 1])

  return (
    <motion.span
      style={{
        fontFamily: font === 'serif' ? 'var(--font-serif)' : 'var(--font-display)',
        fontWeight: font === 'serif' ? 400 : 600,
        fontStyle:  font === 'serif' ? 'italic' : 'normal',
        fontSize:   font === 'serif' ? '1.08em' : '1em',
        display:    'inline',
        color:      font === 'serif' ? 'var(--tone-serif)' : 'var(--tone-fg)',
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
        minHeight:      '150vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'var(--section-y) 8vw',
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      <p style={{
        fontSize:      'var(--text-lead)',
        lineHeight:    1.2,
        letterSpacing: '-0.025em',
        textAlign:     'center',
        maxWidth:      '100%',
        margin:        0,
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
