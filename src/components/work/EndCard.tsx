'use client'

import Link from 'next/link'
import { motion, type MotionValue } from 'framer-motion'
import { RESUME_PATH } from '@/lib/site'
import { layoutTransition, useCardPose } from './ProjectCard'

const pad = (n: number) => String(n).padStart(2, '0')

/** Closes the track: "Yours could be number 09.", where 09 is the visible count plus one */
export default function EndCard({ index, f, instant, register, onFocusCard }: {
  /** = the visible count: it sits right after the last card */
  index: number
  f: MotionValue<number>
  instant: boolean
  register: (el: HTMLLIElement | null) => void
  onFocusCard: (index: number) => void
}) {
  const { scale, rotate } = useCardPose(index, f, instant)

  return (
    <motion.li
      ref={register}
      layout="position"
      className="wg-item wg-item--end"
      transition={layoutTransition(instant)}
      onFocus={() => onFocusCard(index)}
    >
      <motion.div className="wg-tilt" style={{ scale, rotate }}>
        <div className="wg-obj wg-obj--end">
          <article className="wg-card wg-end" aria-labelledby="wg-end-title">
            <p className="wg-end-label">End of the list, for now</p>
            <h2 id="wg-end-title" className="wg-end-title">
              Yours <span className="wg-end-br">could be</span> <em>number {pad(index + 1)}.</em>
            </h2>
            <div className="wg-end-actions">
              <Link href="/contact" className="wg-end-cta">
                Start a project <span aria-hidden="true">↗</span>
              </Link>
              <a href={RESUME_PATH} className="wg-end-cv" download>
                Download CV
              </a>
            </div>
          </article>
        </div>
      </motion.div>
    </motion.li>
  )
}
