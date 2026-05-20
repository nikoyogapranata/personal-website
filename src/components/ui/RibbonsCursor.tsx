'use client'
import { useState, useEffect } from 'react'
import Ribbons from './Ribbons'

// Stable references so the Ribbons effect dep-array never sees a new array
const COLORS = ['#2563eb', '#2563eb88']
const BG     = [0, 0, 0, 0]

export default function RibbonsCursor() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div style={{
      position:      'fixed',
      top:           0,
      left:          0,
      width:         '100%',
      height:        '100%',
      zIndex:        9999,
      pointerEvents: 'none',
    }}>
      <Ribbons
        colors={COLORS}
        baseThickness={25}
        enableFade={true}
        enableShaderEffect={true}
        effectAmplitude={3}
        speedMultiplier={0.5}
        maxAge={500}
        backgroundColor={BG}
      />
    </div>
  )
}
