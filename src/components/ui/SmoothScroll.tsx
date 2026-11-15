'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { SCROLL_LERP, SMOOTH_SCROLL_QUERY, setLenis } from '@/lib/scroll'

/**
 * Eased wheel and trackpad scrolling (Lenis) on the window. Lenis only smooths wheel input and
 * then sets window.scrollY, so everything scroll-driven (useScroll, scroll timelines, sticky,
 * the tone observer) keeps reading native scroll.
 *
 * Off (no instance at all) for touch-first devices, where scrolling stays native, and under
 * reduced motion; it follows changes to either.
 *
 * Lenis ignores native scrolls that land while it's easing and writes its own position back on
 * the next frame. So whatever scrolls natively mid-glide (keyboard, focus moving, back/forward,
 * a #hash jump) first stops the glide where it is; programmatic scrolls go through lenis.scrollTo
 * (src/lib/scroll.ts).
 */
export default function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia(SMOOTH_SCROLL_QUERY)
    const root = document.documentElement
    let lenis: Lenis | null = null

    // The intro loader locks scrolling with overflow: hidden, which a programmatic scroll ignores
    const followLoader = () => {
      if (!lenis) return
      if (root.dataset.loader) lenis.stop()
      else lenis.start()
    }
    const loaderObserver = new MutationObserver(followLoader)
    loaderObserver.observe(root, { attributes: true, attributeFilter: ['data-loader'] })

    // Stop a glide where it is: an immediate scroll to the current position resets Lenis's target
    const settle = () => {
      if (lenis?.isScrolling === 'smooth') lenis.scrollTo(lenis.actualScroll, { immediate: true, force: true })
    }
    const SETTLE_ON = ['keydown', 'focusin', 'popstate', 'hashchange'] as const

    const sync = () => {
      if (mq.matches && !lenis) {
        lenis = new Lenis({
          lerp: SCROLL_LERP,
          smoothWheel: true,
          syncTouch: false,          // touch scrolling stays native
          autoRaf: true,
          stopInertiaOnNavigate: true,
        })
        setLenis(lenis)
        followLoader()
      } else if (!mq.matches && lenis) {
        lenis.destroy()
        lenis = null
        setLenis(null)
      }
    }
    sync()
    mq.addEventListener('change', sync)
    SETTLE_ON.forEach(e => window.addEventListener(e, settle, true))
    return () => {
      mq.removeEventListener('change', sync)
      SETTLE_ON.forEach(e => window.removeEventListener(e, settle, true))
      loaderObserver.disconnect()
      lenis?.destroy()
      setLenis(null)
    }
  }, [])

  return null
}
