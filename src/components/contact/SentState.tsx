'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { topicLabel, type ContactFields, type TopicId } from '@/lib/contact'
import { CITY } from '@/lib/site'

/** Long messages are cut short on the card; the full text went in the email */
const ECHO_MAX = 280
const echo = (s: string) => (s.length > ECHO_MAX ? s.slice(0, ECHO_MAX).trimEnd() + '…' : s)
/** The sentence's own full stop, unless the message already ends a sentence */
const stop = (s: string) => (/[.!?…]$/.test(s) ? '' : '.')

/**
 * What replaces the form after a send. Everything the visitor typed is rendered as React text
 * children, never as HTML.
 */
export default function SentState({ sent, time, onReset }: {
  sent: ContactFields
  /** HH:MM in CITY.timeZone when the message went out */
  time: string
  onReset: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const topic = topicLabel(sent.topic as TopicId)

  // Focus the heading and bring it to the middle of the screen: that is also where the tone
  // backdrop looks, so the page turns dark around it
  useEffect(() => {
    const h = heading.current
    if (!h) return
    h.focus({ preventScroll: true })
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    h.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  return (
    <div className="ss">
      <div className="ss-main">
        <p className="ss-label">
          Message sent · {time}, {CITY.name}
        </p>
        <h2 ref={heading} tabIndex={-1} className="ss-title">
          Got it, <em>{sent.name}</em>
        </h2>
        <p className="ss-line">
          Thanks for reaching out about {topic}. I&apos;ll reply to <span className="ss-email">{sent.email}</span> within
          a day, usually sooner.
        </p>
        <div className="ss-actions">
          <Link href="/work" className="ct-btn ct-btn--cream">
            See my work <span aria-hidden="true">↗</span>
          </Link>
          <button type="button" className="ct-btn ct-btn--ghost" onClick={onReset}>
            Send another
          </button>
        </div>
      </div>

      {/* Their sentence, echoed back on a cream card */}
      <figure className="ss-card" data-tone-island="">
        <figcaption className="ss-card-label">Your message</figcaption>
        <blockquote className="ss-card-text">
          Hi Niko, my name is <em>{sent.name}</em> and I&apos;d like to talk about <em>{topic}</em>.
          Here&apos;s the short version: <em>{echo(sent.message)}</em>{stop(echo(sent.message))} You can reach me
          at <em>{sent.email}</em>.
        </blockquote>
      </figure>
    </div>
  )
}
