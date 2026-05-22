'use client'

export default function UniversalGrain() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9998,
        pointerEvents: 'none',
        // 1. Difference mode automatically adapts to light AND dark backgrounds
        mixBlendMode: 'difference', 
        // 2. Kept fairly low because 'difference' can be intense on light themes
        opacity: 0.06, 
      }}
    >
      <filter id="film-grain">
        <feTurbulence
          type="fractalNoise"
          // 3. Slightly smoothed out the frequency
          baseFrequency="0.65" 
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#film-grain)" />
    </svg>
  )
}