'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * Hydration-safe reduced-motion preference. framer-motion's useReducedMotion() reports the real
 * value on the first client render, which mismatches the server HTML, and React then keeps stale
 * server-rendered styles. Here hydration uses the server snapshot (false) and React re-renders
 * with the real value straight after.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
