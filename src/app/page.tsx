'use client'

import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import Hero      from '@/components/sections/Hero'
import AboutV2   from '@/components/sections/AboutV2'
import Work      from '@/components/sections/Work'
import Statement from '@/components/sections/Statement'

export default function Home() {
  const { scrollYProgress } = useScroll()

  const overlayOpacity    = useTransform(scrollYProgress, [0.3, 0.75], [1, 0])
  const heroPointerEvents = useTransform(scrollYProgress, (v) => v > 0.6 ? 'none' : 'auto')

  const workRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: workProgress } = useScroll({
    target: workRef,
    offset: ['start end', 'start start'],
  })
  const aboutY   = useTransform(workProgress, [0, 1], [0, -50])
  const aboutDim = useTransform(workProgress, [0, 1], [0, 0.55])

  return (
    <main style={{ background: '#f8f8f5', position: 'relative' }}>

      {/* Scroll driver — 200vh for hero animation */}
      <div style={{ height: '200vh' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, background: '#f8f8f5' }}>

        {/* About */}
        <motion.div style={{ position: 'sticky', top: '-25vh', zIndex: 1, y: aboutY }}>
          <AboutV2 />
          <motion.div style={{
            position:      'absolute',
            inset:         0,
            background:    '#0a0a0a',
            opacity:       aboutDim,
            pointerEvents: 'none',
          }} />
        </motion.div>

        {/* Work — zIndex 2, dark bg covers About beneath */}
        <div ref={workRef} style={{ position: 'relative', zIndex: 2, background: '#0a0a0a' }}>
          <Work />
        </div>

        {/* Statement — manages its own sticky container, zIndex 10 */}
        <Statement />

      </div>

      {/* Fixed overlay — fades out during scroll */}
      <motion.div style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100vh',
        zIndex:        5,
        background:    '#f8f8f5',
        opacity:       overlayOpacity,
        pointerEvents: 'none',
      }} />

      {/* Hero — fixed on top */}
      <motion.div style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100vh',
        zIndex:        6,
        pointerEvents: heroPointerEvents,
      }}>
        <Hero />
      </motion.div>

    </main>
  )
}
