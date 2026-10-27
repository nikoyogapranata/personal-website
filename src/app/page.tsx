'use client'

import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import Hero      from '@/components/sections/Hero'
import AboutV2   from '@/components/sections/AboutV2'
import Work      from '@/components/sections/Work'
import Statement from '@/components/sections/Statement'
import Contact   from '@/components/sections/Contact'
import Footer    from '@/components/sections/Footer'

// Sections are transparent over the tone backdrop (components/ui/Tone.tsx); each declares its
// tone with data-tone and the backdrop crossfades as one crosses the middle of the viewport.
export default function Home() {
  // The hero animates over its own scroll driver, so other sections' lengths can't shift it
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroPointerEvents = useTransform(heroProgress, (v) => v > 0.5 ? 'none' : 'auto')

  return (
    <main style={{ position: 'relative' }}>

      {/* Fixed hero comes first in the DOM so its h1 precedes the section h2s */}
      <motion.div style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100vh',
        zIndex:        6,
        pointerEvents: heroPointerEvents,
      }}>
        <Hero progress={heroProgress} />
      </motion.div>

      {/* Scroll driver for the hero: About starts arriving as the cards leave */}
      <div ref={heroRef} data-nav-transparent data-tone="light" style={{ height: '150vh' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <AboutV2 />
        <Work />
        <Statement />

        {/* Opaque, and above Statement, so it covers the pinned GOT A PROJECT? as it slides in */}
        <div data-tone="dark" style={{ position: 'relative', zIndex: 11, background: 'var(--color-bg-dark)' }}>
          <Contact />
          <Footer />
        </div>
      </div>

    </main>
  )
}
