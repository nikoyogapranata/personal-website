'use client'

import { TOPICS, type TopicId } from '@/lib/contact'

type Props = {
  value: string
  error?: string
  onChange: (id: TopicId) => void
  /** The first radio, for moving focus here when no topic is picked */
  firstRef?: React.Ref<HTMLInputElement>
}

/**
 * The topic blank: three chips that are real radio buttons, so the group, the arrow keys and
 * the announcements all come from the browser. Nothing is picked until the visitor picks.
 */
export default function TopicChips({ value, error, onChange, firstRef }: Props) {
  return (
    <fieldset
      className="sf-topics"
      data-picked={value ? '' : undefined}
    >
      <legend className="sr-only">What you&apos;d like to talk about</legend>
      {TOPICS.map((t, i) => {
        const chip = (
          <label key={t.id} className="sf-chip">
            <input
              ref={i === 0 ? firstRef : undefined}
              type="radio"
              name="topic"
              value={t.id}
              checked={value === t.id}
              onChange={() => onChange(t.id)}
              aria-describedby={error ? 'contact-topic-error' : undefined}
              className="sr-only"
            />
            {t.label}
          </label>
        )
        // The sentence's full stop rides with the last chip, so it never starts a line
        return i < TOPICS.length - 1 ? chip : (
          <span key={t.id} className="sf-chip-last">{chip}<span className="sf-suffix">.</span></span>
        )
      })}
      {error && <span id="contact-topic-error" className="sf-error sf-error--topics">{error}</span>}
    </fieldset>
  )
}
