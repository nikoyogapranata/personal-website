import Reveal from '@/components/ui/Reveal'
import CopyEmail from './CopyEmail'
import { cjk } from '@/components/about/cjkFont'
import { PROFILE } from '@/data'
import { reveal } from '@/lib/motion'
import { CITY, EMAIL, RESUME_PATH, SOCIAL } from '@/lib/site'

const CARDS = [
  { href: SOCIAL.linkedin, kicker: 'Profile', title: 'LinkedIn',    arrow: '↗', tone: 'violet', newTab: true },
  { href: SOCIAL.github,   kicker: 'Code',    title: 'GitHub',      arrow: '↗', tone: 'white',  newTab: true },
  { href: RESUME_PATH,     kicker: 'PDF',     title: 'Download CV', arrow: '↓', tone: 'crimson', newTab: true },
] as const

/** (02) The address to copy, three channel cards, and where I am / what I speak. Works without JS. */
export default function Channels() {
  return (
    <section className={`ch ${cjk.variable}`} data-tone="light" aria-labelledby="ch-title">
      <Reveal {...reveal()} data-focus-reveal="">
        <p className="ch-label">(02) Rather not use a form?</p>
        <h2 id="ch-title" className="ch-title">Just write to me.</h2>
      </Reveal>

      <Reveal {...reveal({ order: 1 })} data-focus-reveal="">
        <CopyEmail />
        <p className="ch-hint">
          <span className="ch-hint-js">Click to copy. Or </span>
          <a href={`mailto:${EMAIL}`} className="ch-mailto hover-accent">
            <span className="ch-hint-js">open</span><span className="ch-hint-nojs">Open</span> it in your mail app{' '}
            <span aria-hidden="true">↗</span>
          </a>
        </p>
      </Reveal>

      <ul className="ch-cards">
        {CARDS.map((c, i) => (
          <li key={c.title}>
            <Reveal {...reveal({ order: 2 + i })} data-focus-reveal="" className="ch-card-wrap">
              <a
                href={c.href}
                className={`ch-card ch-card--${c.tone}`}
                target={c.newTab ? '_blank' : undefined}
                rel={c.newTab ? 'noopener noreferrer' : undefined}
              >
                <span className="ch-card-kicker">{c.kicker}</span>
                <span className="ch-card-title">{c.title}</span>
                <span className="ch-card-arrow" aria-hidden="true">{c.arrow}</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      <div className="ch-bottom">
        <p>Based in {CITY.name}, working remotely</p>
        <p>
          <span className="ch-speaks-label">Speaks</span>{' '}
          {PROFILE.speaks.map((l, i) => (
            <span key={l.label}>
              <span lang={l.lang}>{l.label}</span>
              {i < PROFILE.speaks.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
