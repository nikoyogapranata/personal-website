import { PROFILE } from '@/data'
import { RESUME_PATH } from '@/lib/site'
import { cjk } from './cjkFont'

/**
 * The bio after the story. Desktop: the quote on the left, the paragraph, "Speaks" line and CV
 * link on the right. Phones: stacked, quote first.
 */
export default function AboutBio() {
  const { quote, short } = PROFILE.bio
  return (
    <section className={`about-bio ${cjk.variable}`} data-tone="light" aria-label="Bio">
      <style>{CSS}</style>
      <p className="about-quote">{quote}</p>
      <div className="about-bio-body">
        <p className="about-bio-text">{short}</p>
        <p className="about-speaks">
          <span className="about-speaks-label">Speaks</span>{' '}
          {PROFILE.speaks.map((l, i) => (
            <span key={l.label}>
              <span lang={l.lang}>{l.label}</span>
              {i < PROFILE.speaks.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
        <a href={RESUME_PATH} target="_blank" rel="noopener noreferrer" className="hover-accent hover-nudge about-cv">
          <span aria-hidden="true">↗</span> Download CV
        </a>
      </div>
    </section>
  )
}

const CSS = `
.about-bio {
  /* Tight to the story above and Experience below (see the e2e spacing check) */
  padding: var(--space-xl) max(var(--page-x), calc((100% - var(--content-max)) / 2)) var(--space-l);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: var(--space-2xl);
  row-gap: var(--space-m);
  align-items: start;
}
.about-quote {
  margin: 0;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2.25rem, 4.4vw, 6rem);
  line-height: 1.02;
  letter-spacing: -0.01em;
  color: var(--color-text);
  max-width: 9em;
}
.about-bio-body { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-m); }
.about-bio-text {
  margin: 0; max-width: 38rem;
  font-family: var(--font-sans); font-size: var(--text-body-lg); line-height: 1.75;
  color: var(--color-text-muted);
}
.about-speaks {
  margin: 0;
  font-family: var(--font-sans); font-size: var(--text-body); line-height: 1.6;
  color: var(--color-text);
}
.about-speaks-label {
  margin-right: 0.9em;
  font-size: var(--text-label); letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--color-text-faint);
}
.about-speaks [lang|="zh"] { font-family: var(--font-cjk), var(--font-serif), "Songti SC", "SimSun", serif; }
.about-cv {
  display: inline-flex; align-items: center; gap: 12px; text-decoration: none;
  font-family: var(--font-display); font-weight: 500; font-size: var(--text-body);
  color: var(--color-text);
  transition: color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
}
.about-cv span { font-size: 0.85em; opacity: 0.5; }

/* Phones: stacked, quote first */
@media (max-width: 767px) {
  .about-bio { grid-template-columns: minmax(0, 1fr); }
}
`
