import localFont from 'next/font/local'
import Reveal from '@/components/ui/Reveal'
import CityClock from './CityClock'
import { PROFILE } from '@/data'
import { DURATION, EASE, VIEWPORT } from '@/lib/motion'

// Only the four Chinese characters used here (日惹南京, 1.7 KB), not a full CJK font
const cjk = localFont({
  src: '../../../public/fonts/NotoSerifSC-subset.woff2',
  variable: '--font-cjk',
  display: 'swap',
  weight: '500',
  preload: false,
})

const CITIES = [
  { id: 'yogyakarta', zh: '日惹', name: 'Yogyakarta', timeZone: 'Asia/Jakarta', zone: 'WIB, UTC+7' },
  { id: 'nanjing',    zh: '南京', name: 'Nanjing',    timeZone: 'Asia/Shanghai', zone: 'CST, UTC+8' },
] as const

const school = (field: string) => PROFILE.education.find(e => e.field === field)

/** The two campuses, on the dark tone */
export default function TwoCities() {
  const uii = school('Informatics')
  const nxu = school('Software Engineering')
  const draw = { duration: DURATION.slow, ease: EASE }

  return (
    <section className={`cities ${cjk.variable}`} data-tone="dark" aria-label="Two campuses">
      <style>{CSS}</style>
      <p className="cities-label">(Two campuses, one hour apart)</p>

      {CITIES.map((c, i) => (
        <div key={c.id} className={`city city--${i === 0 ? 'first' : 'second'}`}>
          <p className="city-zh" lang="zh-Hans">{c.zh}</p>
          <h2 className="city-name">{c.name}</h2>
          <p className="city-time">
            <CityClock timeZone={c.timeZone} /> <span className="city-zone">{c.zone}</span>
          </p>
        </div>
      ))}

      {/* Hairline between the cities: draws left to right on entering */}
      <div className="cities-line" aria-hidden="true">
        <Reveal className="cities-dot" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={VIEWPORT} transition={draw} />
        <Reveal className="cities-rule" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEWPORT} transition={draw} />
        <Reveal className="cities-dot cities-dot--end" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={VIEWPORT} transition={{ ...draw, delay: DURATION.slow * 0.8 }} />
        <Reveal className="cities-pill" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEWPORT} transition={{ ...draw, delay: DURATION.slow * 0.5 }}>
          +1H
        </Reveal>
      </div>

      {uii && nxu && (
        <p className="cities-note">
          {uii.field} at {uii.institution}, and a double degree in {nxu.field} at {nxu.institution}.
        </p>
      )}
    </section>
  )
}

const CSS = `
.cities {
  position: relative;
  min-height: 100svh;
  display: grid;
  /* Each city gets the full width (the names are huge); minmax(0, …) so they can't widen the grid */
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "label" "first" "line" "second" "note";
  row-gap: var(--space-l);
  column-gap: var(--space-xl);
  align-content: center;
  padding: var(--section-y) max(var(--page-x), calc((100% - var(--content-max)) / 2));
  color: var(--color-text-inverse);
}
.cities-label {
  grid-area: label; margin: 0;
  font-family: var(--font-sans); font-size: var(--text-label); letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--color-text-faint-inverse);
}
.city--first  { grid-area: first; }
.city--second { grid-area: second; text-align: right; justify-self: end; }
.city-zh {
  margin: 0 0 0.1em;
  font-family: var(--font-cjk), var(--font-serif), "Songti SC", "SimSun", serif;
  font-style: italic; font-weight: 500; font-size: var(--text-h3); line-height: 1;
  color: var(--color-accent-primary-light);
}
.city-name {
  margin: 0;
  font-family: var(--font-display); font-weight: 700; font-size: min(var(--text-title), 11.5vw);
  line-height: 0.88; letter-spacing: -0.04em; text-transform: uppercase;
}
.city-time { margin: 0.6em 0 0; font-family: var(--font-sans); font-size: var(--text-body); letter-spacing: 0.04em; }
.city-clock { display: inline-block; width: 5ch; text-align: left; font-variant-numeric: tabular-nums; font-weight: 600; }
.city--second .city-clock { text-align: right; }
.city-zone { color: var(--color-text-faint-inverse); }

.cities-line { grid-area: line; position: relative; height: 32px; display: flex; align-items: center; }
.cities-rule { position: absolute; left: 6px; right: 6px; top: 50%; height: 1px; background: var(--color-text-inverse); transform-origin: 0 50%; }
.cities-dot { position: absolute; left: 0; top: 50%; width: 11px; height: 11px; margin-top: -5.5px; border-radius: 50%; background: var(--color-text-inverse); }
.cities-dot--end { left: auto; right: 0; }
.cities-pill {
  position: absolute; left: 50%; top: 50%; translate: -50% -50%;
  padding: 0.45em 1em; border-radius: var(--radius-pill);
  font-family: var(--font-display); font-weight: 700; font-size: var(--text-small); letter-spacing: 0.06em;
  background: var(--color-accent-primary-light); color: var(--color-text);
  border: 1.5px solid var(--color-text-inverse); box-shadow: 3px 3px 0 var(--color-text-inverse);
}
.cities-note {
  grid-area: note; align-self: end; margin: 0; max-width: 30rem;
  font-family: var(--font-sans); font-size: var(--text-body-lg); line-height: 1.6;
  color: var(--color-text-faint-inverse);
}

@media (max-width: 767px) {
  .cities { row-gap: var(--space-m); }
}
`
