// The site's motion scale. CSS has the same values as custom properties in globals.css
// (--ease, --ease-in-out, --dur-*); keep the two in sync.

// Main easing (expo-out): anything that arrives — entrances, hovers, the menu panel
export const EASE = [0.16, 1, 0.3, 1] as const
// Secondary easing (quart-in-out): symmetric changes — crossfades, tone changes, the loader exit
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const

export const DURATION = {
  fast: 0.25, // hovers, colour changes, small UI
  base: 0.6,  // content reveals, crossfades, the light/dark tone change
  slow: 0.9,  // display type and other large moves
} as const

/** Travel of a rise or slide reveal, in px */
export const DISTANCE = 24
/** Delay between siblings in a reveal sequence, in s */
export const STAGGER = 0.08
/** For long lists (the tech stack), where STAGGER would take seconds to reach the last item */
export const STAGGER_TIGHT = 0.03

/** Shared whileInView options: reveal once, when a quarter of the element is visible */
export const VIEWPORT = { once: true, amount: 0.25 } as const

/** The one spring that smooths scroll-linked values (Work title, Statement) */
export const SCROLL_SPRING = { stiffness: 60, damping: 18, mass: 0.5, restDelta: 0.001 } as const

type From = 'below' | 'left' | 'right' | 'scale'

const OFFSET: Record<From, Record<string, number>> = {
  below: { y: DISTANCE },
  left:  { x: -DISTANCE },
  right: { x: DISTANCE },
  scale: { scale: 0.9 },
}
const REST = { x: 0, y: 0, scale: 1 }

/**
 * Props for a reveal: spread onto a motion element (or <Reveal>).
 * `order` is the element's place in its sequence; `onMount` plays on page load instead of on scroll.
 */
export function reveal({
  from = 'below',
  order = 0,
  duration = DURATION.base,
  stagger = STAGGER,
  onMount = false,
}: {
  from?: From
  order?: number
  duration?: number
  stagger?: number
  onMount?: boolean
} = {}) {
  const offset = OFFSET[from]
  const rest = Object.fromEntries(Object.keys(offset).map((k) => [k, REST[k as keyof typeof REST]]))
  const target = { opacity: 1, ...rest }
  return {
    // Lets the <noscript> rule in the root layout show it without JS
    'data-reveal': '',
    initial: { opacity: 0, ...offset },
    ...(onMount ? { animate: target } : { whileInView: target, viewport: VIEWPORT }),
    transition: { duration, ease: EASE, delay: order * stagger },
  }
}
