'use client'

import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import Hero      from '@/components/sections/Hero'
import AboutV2   from '@/components/sections/AboutV2'
import Work      from '@/components/sections/Work'
import Statement from '@/components/sections/Statement'
import Contact   from '@/components/sections/Contact'
import Footer    from '@/components/sections/Footer'

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

  const contactRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: contactProgress } = useScroll({
    target: contactRef,
    offset: ['start end', 'start start'],
  })
  const statementDim = useTransform(contactProgress, [0, 1], [0, 0.55])

  return (
    <main style={{ background: '#f8f8f5', position: 'relative' }}>

      {/* Scroll driver — 400vh for hero animation */}
      <div style={{ height: '300vh' }} />

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

        {/* Statement — receives dim MotionValue so Contact can fade it out */}
        <Statement exitDim={statementDim} />

        {/* Contact — zIndex 11 so it slides over Statement */}
        <div ref={contactRef} style={{ position: "relative", zIndex: 11, background: "#0a0a0a" }}>
          <Contact />
          <Footer />
        </div>

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
