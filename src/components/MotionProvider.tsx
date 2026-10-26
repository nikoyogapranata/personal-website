'use client'

import { MotionConfig } from 'framer-motion'

// With reducedMotion="user", framer-motion skips transform/layout animations (keeping opacity
// and colour) for visitors who set prefers-reduced-motion. Scroll-linked values are handled
// per component with useReducedMotion().
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
