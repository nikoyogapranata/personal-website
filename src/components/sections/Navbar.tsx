'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import FlowingMenu from '../ui/FlowingMenu'

const menuItems = [
  { link: '/',      text: 'Home',     image: '/spring.jpg' },
  { link: '/about', text: 'About Me', image: '/autumn.jpg' },
  { link: '/work',  text: 'Work',     image: '/winter.jpg' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen]               = useState(false)
  const [isDark, setIsDark]                   = useState(false)
  const [nikoHovered, setNikoHovered]         = useState(false)
  const [contactHovered, setContactHovered]   = useState(false)

  useEffect(() => {
    const update = () => {
      // mark isDark when navbar (bottom edge = 64px) sits inside a dark section
      const darkSections = document.querySelectorAll('#tech-stack, #work')
      let over = false
      darkSections.forEach(el => {
        const { top, bottom } = el.getBoundingClientRect()
        if (top <= 64 && bottom > 0) over = true
      })
      setIsDark(over)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // base color flips with background; accent stays blue; transitions on every text element
  const base   = isDark ? '#f8f8f5' : '#0a0a0a'
  const accent = '#2563eb'

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .nav-root { padding: 0 20px !important; }
          .nav-name, .nav-contact { font-size: 13px !important; letter-spacing: 0.04em !important; }
        }
      `}</style>
      <nav
        className="nav-root"
        style={{
          position:            'fixed',
          top:                 0,
          left:                0,
          width:               '100%',
          zIndex:              100,
          display:             'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems:          'center',
          height:              64,
          padding:             '0 40px',
          background:          'transparent',
        }}
      >
        {/* LEFT — NIKO PRANATA */}
        <button
          onClick={goTop}
          onMouseEnter={() => setNikoHovered(true)}
          onMouseLeave={() => setNikoHovered(false)}
          style={{
            display:        'flex',
            alignItems:     'center',
            background:     'none',
            border:         'none',
            padding:        0,
            cursor:         'pointer',
          }}
        >
          <span className="nav-name" style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      18,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:         nikoHovered ? accent : base,
            lineHeight:    1,
            transition:    'color 0.25s ease',
          }}>
            Niko Pranata
          </span>
        </button>

        {/* CENTER — MENU */}
        <div
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           6,
            cursor:        'pointer',
          }}
        >
          <motion.div
            animate={{ background: menuOpen ? accent : base }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '1.5px', width: '100%' }}
          />
          <span style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      13,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color:         menuOpen ? accent : base,
            lineHeight:    1,
            transition:    'color 0.25s ease',
          }}>
            MENU
          </span>
        </div>

        {/* RIGHT — CONTACT */}
        <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link
            href="/contact"
            onMouseEnter={() => setContactHovered(true)}
            onMouseLeave={() => setContactHovered(false)}
            style={{ textDecoration: 'none' }}
          >
            <span className="nav-contact" style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      18,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color:         contactHovered ? accent : base,
              lineHeight:    1,
              transition:    'color 0.25s ease',
            }}>
              Contact
            </span>
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop — click to close */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position:       'fixed',
                inset:          0,
                zIndex:         98,
                background:     'rgba(0,0,0,0.15)',
                backdropFilter: 'blur(2px)',
              }}
            />

            {/* FlowingMenu panel — slides down from top */}
            <motion.div
              key="panel"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top:      64,
                left:     0,
                width:    '100%',
                height:   'calc(33vh - 0px)',
                zIndex:   99,
              }}
            >
              <FlowingMenu
                items={menuItems}
                speed={12}
                textColor='#0a0a0a'
                bgColor='#f8f8f5'
                marqueeBgColor='#0a0a0a'
                marqueeTextColor='#f8f8f5'
                borderColor='#e5e5e0'
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
