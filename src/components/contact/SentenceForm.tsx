'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from '@/components/ui/Reveal'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import Blank from './Blank'
import TopicChips from './TopicChips'
import SentState from './SentState'
import { FIELDS, MAX, clean, validate, validateField, type ContactFields, type Field, type FieldErrors } from '@/lib/contact'
import { DURATION, EASE, EASE_IN_OUT, reveal } from '@/lib/motion'
import { CITY, EMAIL } from '@/lib/site'

const EMPTY: ContactFields = { name: '', topic: '', message: '', email: '' }
type Status = 'idle' | 'sending' | 'error' | 'sent'

const sentTime = () =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: CITY.timeZone }).format(new Date())

/**
 * The top of /contact: the status bar and title (passed in, server-rendered) and the sentence
 * form, which posts to /api/contact. After a send the whole block turns to the dark tone and
 * the form gives way to SentState.
 */
export default function SentenceForm({ header }: { header: React.ReactNode }) {
  const [values, setValues] = useState<ContactFields>(EMPTY)
  const [company, setCompany] = useState('') // honeypot
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [apiError, setApiError] = useState('')
  const [sent, setSent] = useState<{ fields: ContactFields; time: string } | null>(null)
  const [announce, setAnnounce] = useState('')
  // Focus moves after the render that shows the errors, so the field is read with its error
  const [focusTo, setFocusTo] = useState<Field | null>(null)
  const dirty = useRef(new Set<Field>())
  // Set by "Send another": once the form is back, focus the first blank
  const refocus = useRef(false)
  // Reduced motion: the swap is a plain fade (MotionConfig alone still jumps to the exit offset)
  const reduce = usePrefersReducedMotion()
  const rise = reduce ? 0 : 24
  const lift = reduce ? 0 : -16

  const nameRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const topicRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const emailRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!focusTo) return
    const refs = { name: nameRef, topic: topicRef, message: messageRef, email: emailRef }
    refs[focusTo].current?.focus()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot request, cleared once handled
    setFocusTo(null)
  }, [focusTo])

  const showErrors = (next: FieldErrors) => {
    setErrors(next)
    const first = FIELDS.find(f => next[f])
    if (first) setFocusTo(first)
  }

  const change = (f: Field, v: string) => {
    setValues(prev => ({ ...prev, [f]: v }))
    dirty.current.add(f)
    // Once a field shows an error, it updates as you type, so it clears the moment it's fixed
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: validateField(f, clean(f, v)) ?? undefined }))
  }

  // On blur, but only for fields you've typed in or that already show an error: tabbing through
  // an empty form doesn't paint it red
  const blur = (f: Field) => {
    if (!dirty.current.has(f) && !errors[f]) return
    setErrors(prev => ({ ...prev, [f]: validateField(f, clean(f, values[f])) ?? undefined }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    const { values: cleaned, errors: found } = validate(values)
    if (Object.keys(found).length) return showErrors(found)

    setStatus('sending')
    setApiError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cleaned, company }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 400 && data.errors && Object.keys(data.errors).length) {
        setStatus('idle')
        return showErrors(data.errors)
      }
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Your message could not be sent.')
      setSent({ fields: cleaned, time: sentTime() })
      setStatus('sent')
      setAnnounce(`Message sent. Thanks, ${cleaned.name}. I'll reply to ${cleaned.email} within a day.`)
    } catch (err) {
      setStatus('error')
      setApiError(err instanceof TypeError
        ? 'Couldn’t reach the server.'
        : err instanceof Error ? err.message : 'Your message could not be sent.')
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setApiError('')
    setAnnounce('')
    dirty.current.clear()
    refocus.current = true
    setStatus('idle')
  }

  const sending = status === 'sending'

  return (
    <div className="ct-top" data-tone={status === 'sent' ? 'dark' : 'light'}>
      {header}

      <section className="sf-section" aria-label="Contact form">
        {/* Without JavaScript the form can't post to the JSON API: offer the address instead */}
        <p className="sf-nojs">
          The form needs JavaScript, but email works just as well:{' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>

        {/* Always in the page, so screen readers pick up the change when it's filled in */}
        <p role="status" className="sr-only">{announce}</p>

        <Reveal {...reveal({ onMount: true, order: 2 })} data-focus-reveal="" className="sf-wrap">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'sent' && sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: rise }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: lift }}
                transition={{ duration: DURATION.base, ease: EASE }}
              >
                <SentState sent={sent.fields} time={sent.time} onReset={reset} />
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="sf"
                noValidate
                onSubmit={submit}
                // Back from the sent state: the form has just mounted, so focus can go in now
                onAnimationStart={() => {
                  if (!refocus.current) return
                  refocus.current = false
                  nameRef.current?.focus()
                }}
                initial={{ opacity: 0, y: rise }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: lift }}
                transition={{ duration: DURATION.base, ease: EASE_IN_OUT }}
              >
                {/* Honeypot: hidden from people, filled by bots */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="sf-honeypot"
                />

                <div className="sf-sentence">
                  Hi Niko, my name is{' '}
                  <Blank
                    ref={nameRef}
                    id="contact-name"
                    label="Your name"
                    placeholder="your name"
                    autoComplete="name"
                    maxLength={MAX.name}
                    value={values.name}
                    error={errors.name}
                    onChange={v => change('name', v)}
                    onBlur={() => blur('name')}
                  />{' '}
                  and I&apos;d like to talk about{' '}
                  <TopicChips
                    firstRef={topicRef}
                    value={values.topic}
                    error={errors.topic}
                    onChange={id => change('topic', id)}
                  />{' '}
                  Here&apos;s the short version:{' '}
                  <Blank
                    ref={messageRef}
                    id="contact-message"
                    label="Your message"
                    placeholder="what you have in mind"
                    multiline
                    maxLength={MAX.message}
                    value={values.message}
                    error={errors.message}
                    onChange={v => change('message', v)}
                    onBlur={() => blur('message')}
                    suffix="."
                  />{' '}
                  You can reach me at{' '}
                  <Blank
                    ref={emailRef}
                    id="contact-email"
                    label="Your email"
                    placeholder="your@email.com"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={MAX.email}
                    value={values.email}
                    error={errors.email}
                    onChange={v => change('email', v)}
                    onBlur={() => blur('email')}
                    suffix="."
                  />
                </div>

                <div className="sf-actions">
                  <button
                    type="submit"
                    className="ct-btn ct-btn--violet sf-send"
                    aria-disabled={sending || undefined}
                  >
                    {sending ? 'Sending…' : <>Send it <span aria-hidden="true">↗</span></>}
                  </button>
                  <p role="alert" className="sf-api-error">
                    {status === 'error' && (
                      <>
                        {apiError} Everything you wrote is still here, so try again, or email me
                        at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                      </>
                    )}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </section>
    </div>
  )
}
