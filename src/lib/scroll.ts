import type Lenis from 'lenis'

/**
 * Wheel smoothing (Lenis lerp): the share of the remaining distance covered each frame.
 * Lower is floatier, 1 is no smoothing. The one number to tune the feel.
 */
export const SCROLL_LERP = 0.1

/** Distance per wheel tick, as a multiple of the native delta. Below 1 is shorter steps. */
export const SCROLL_WHEEL_MULTIPLIER = 0.85

/** Lenis runs only for a fine pointer with hover (mouse, trackpad) and motion allowed */
export const SMOOTH_SCROLL_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

/**
 * Programmatic smooth scrolls (back to top, focus centring) run for a fixed time with the site's
 * expo-out instead of the wheel lerp, whose tail takes seconds to cover the last few pixels.
 */
const PROGRAMMATIC = { duration: 0.8, easing: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)) }

let lenis: Lenis | null = null

/** Set by SmoothScroll as it creates and destroys its instance */
export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis() {
  return lenis
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Every programmatic page scroll goes through here. With Lenis on, a native window.scrollTo made
 * while Lenis is easing a wheel scroll would be overwritten on its next frame, so Lenis does the
 * scroll. Its cached page height can be stale (a route just changed), so it re-measures first.
 * `smooth` falls back to an instant jump under reduced motion.
 */
export function scrollToY(top: number, { smooth = false }: { smooth?: boolean } = {}) {
  const animate = smooth && !prefersReducedMotion()
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(top, animate ? { ...PROGRAMMATIC, force: true } : { immediate: true, force: true })
  } else {
    window.scrollTo({ top, behavior: animate ? 'smooth' : 'instant' })
  }
}

/** Scroll an element into view: its top to the viewport top (minus its scroll-margin), or centred */
export function scrollToElement(el: Element, { smooth = false, block = 'start' }: { smooth?: boolean; block?: 'start' | 'center' } = {}) {
  const r = el.getBoundingClientRect()
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  const top = block === 'center'
    ? r.top + window.scrollY - (window.innerHeight - r.height) / 2
    : r.top + window.scrollY - margin
  scrollToY(Math.max(0, top), { smooth })
}
