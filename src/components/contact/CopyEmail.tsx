'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, EASE } from '@/lib/motion'
import { EMAIL } from '@/lib/site'

const SHOWN_MS = 2000

/**
 * The address in huge type. With JavaScript it's a button that copies it; without, CSS shows a
 * mailto link styled the same instead (html[data-js] is set before paint, so nothing swaps
 * after load). If the clipboard isn't available or refuses, the click opens the mail app.
 */
export default function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  const mailto = useRef<HTMLAnchorElement>(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), SHOWN_MS)
    } catch {
      // No clipboard (old browser, insecure origin, permission refused): open the mail app via
      // the no-JS link, which is in the page anyway
      mailto.current?.click()
    }
  }

  return (
    <div className="ch-email-wrap" style={{ ['--chars' as string]: EMAIL.length }}>
      <span className="ch-email-box">
        <button type="button" className="ch-email ch-email--js" onClick={copy}>
          {EMAIL}
          <span className="sr-only"> (copy email address)</span>
        </button>
        <a ref={mailto} href={`mailto:${EMAIL}`} className="ch-email ch-email--nojs">{EMAIL}</a>

        <AnimatePresence>
          {copied && (
            <motion.span
              key="pill"
              className="ch-pill"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.6, rotate: -14 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE }}
            >
              Copied ✓
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <p role="status" className="sr-only">{copied ? 'Email address copied to the clipboard.' : ''}</p>
    </div>
  )
}
