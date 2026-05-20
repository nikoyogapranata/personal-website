'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount]   = useState(0)
  const ref                  = useRef<HTMLSpanElement>(null)
  const inView               = useInView(ref, { once: true, margin: '-50px' })
  const started              = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(end)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration])

  return { count, ref }
}
