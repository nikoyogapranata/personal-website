'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

/**
 * Entrance animation wrapper so server components can animate without becoming client
 * components. data-reveal lets the <noscript> rule in the root layout show it without JS.
 */
export default function Reveal(props: HTMLMotionProps<'div'>) {
  return <motion.div data-reveal {...props} />
}
