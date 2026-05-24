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
  const start      = (index / total) * 0.5
  const end        = Math.min(start + (1 / total) * 6, 1)
  const finalColor = font === 'serif' ? '#c41e3a' : '#0a0a0a'

  const color = useTransform(scrollProgress, [start, end], ['#cccccc', finalColor])

  return (
    <motion.span
      style={{
        fontFamily: font === 'serif' ? 'var(--font-serif)' : 'var(--font-display)',
        fontWeight: font === 'serif' ? 400 : 600,
        fontStyle:  font === 'serif' ? 'italic' : 'normal',
        fontSize:   font === 'serif' ? '1.08em' : '1em',
        display:    'inline',
        color,
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
      style={{
        background:     '#f8f8f5',
        minHeight:      '150vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'clamp(80px, 10vw, 140px) 8vw',
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      <p style={{
        fontSize:      'clamp(40px, 6vw, 92px)',
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
        @media (max-width: 1400px) {
          section#about p {
            font-size: clamp(28px, 4.8vw, 64px) !important;
          }
        }
        @media (max-width: 768px) {
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
