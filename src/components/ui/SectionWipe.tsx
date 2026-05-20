'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface SectionWipeProps {
  children: React.ReactNode
}

export default function SectionWipe({ children }: SectionWipeProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.2'],
  })

  const lineWidth = useTransform(scrollYProgress, [0, 0.5],    ['0%', '100%'])
  const lineOpacity = useTransform(scrollYProgress, [0.4, 0.65], [1, 0])
  const contentOpacity = useTransform(scrollYProgress, [0.45, 0.85], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.45, 0.85], [30, 0])

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* Sweeping line */}
      <div style={{
        position:      'sticky',
        top:           '50%',
        height:        0,
        zIndex:        10,
        pointerEvents: 'none',
        overflow:      'visible',
      }}>
        <motion.div style={{
          position:        'absolute',
          top:             0,
          left:            0,
          height:          '1.5px',
          background:      '#0a0a0a',
          width:           lineWidth,
          opacity:         lineOpacity,
          transformOrigin: 'left center',
        }} />
      </div>

      {/* Section content fades in */}
      <motion.div style={{
        opacity: contentOpacity,
        y:       contentY,
      }}>
        {children}
      </motion.div>

    </div>
  )
}
