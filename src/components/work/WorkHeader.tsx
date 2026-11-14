import './work.css'
import Reveal from '@/components/ui/Reveal'
import { PROJECTS } from '@/data'
import { DURATION, reveal } from '@/lib/motion'

const pad = (n: number) => String(n).padStart(2, '0')

/** WORK (08) and the intro line. The filter chips are the first row of the gallery below. */
export default function WorkHeader() {
  return (
    <header className="wh">
      <Reveal {...reveal({ onMount: true, duration: DURATION.slow })} className="wh-title-wrap">
        <h1 className="wh-title">
          WORK<span className="wh-count" aria-hidden="true">({pad(PROJECTS.length)})</span>
          <span className="sr-only">, {PROJECTS.length} projects</span>
        </h1>
      </Reveal>
      <Reveal {...reveal({ onMount: true, order: 2 })} className="wh-intro-wrap">
        <p className="wh-intro">
          Things I&apos;ve designed, built and shipped, <em>from the first pixel to the final deploy.</em>
        </p>
      </Reveal>
    </header>
  )
}
