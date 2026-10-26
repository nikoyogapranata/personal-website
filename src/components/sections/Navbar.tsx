'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// FlowingMenu pulls in GSAP; only load it when the menu is about to open
const loadFlowingMenu = () => import('../ui/FlowingMenu')
const FlowingMenu = dynamic(loadFlowingMenu, { ssr: false })

const menuItems = [
  { link: '/',      text: 'Home',     image: '/menu-spring.webp' },
  { link: '/about', text: 'About Me', image: '/menu-autumn.webp' },
  { link: '/work',  text: 'Work',     image: '/menu-winter.webp' },
]

// Relative luminance of a computed `rgb()/rgba()` colour, or null when it's (nearly) transparent
function luminance(color: string): number | null {
  const m = color.match(/[\d.]+/g)
  if (!m || m.length < 3 || (m.length > 3 && Number(m[3]) < 0.5)) return null
  const [r, g, b] = m.slice(0, 3).map(v => {
    const c = Number(v) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Is the painted background under (x, y) dark? Skips the navbar itself; pointer-events:none
// overlays are skipped by hit-testing, and clip-path is respected, so this tracks what's visible.
function isDarkAt(x: number, y: number, ignore: (el: Element) => boolean) {
  const hit = document.elementsFromPoint(x, y).find(el => !ignore(el))
  for (let el: Element | null = hit ?? null; el; el = el.parentElement) {
    const l = luminance(getComputedStyle(el).backgroundColor)
    if (l !== null) return l < 0.4
  }
  return false
}

export default function Navbar() {
  const [menuOpen, setMenuOpen]               = useState(false)
  const [isDark, setIsDark]                   = useState(false)
  const [nikoHovered, setNikoHovered]         = useState(false)
  const [contactHovered, setContactHovered]   = useState(false)
  const navRef                                = useRef<HTMLElement>(null)
  const menuButtonRef                         = useRef<HTMLButtonElement>(null)
  const panelRef                              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    let sampleUntil = 0
    const sample = () => {
      const nav = navRef.current
      if (nav) setIsDark(isDarkAt(window.innerWidth / 2, 32, el => nav.contains(el)))
      // Section backgrounds are spring-driven and keep changing briefly after scrolling stops
      if (performance.now() < sampleUntil) frame = requestAnimationFrame(sample)
    }
    const update = () => {
      sampleUntil = performance.now() + 800
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sample)
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // Escape closes the menu and returns focus to the toggle
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Move focus into the panel once its (lazy-loaded) links have rendered
  useEffect(() => {
    if (!menuOpen) return
    let frame = 0
    let tries = 0
    const focusFirst = () => {
      const link = panelRef.current?.querySelector('a')
      if (link) link.focus()
      else if (tries++ < 120) frame = requestAnimationFrame(focusFirst)
    }
    frame = requestAnimationFrame(focusFirst)
    return () => cancelAnimationFrame(frame)
  }, [menuOpen])

  const goTop = () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })

  // base color flips with the background under the navbar
  const base   = isDark ? '#f8f8f5' : '#0a0a0a'
  const accent = 'var(--color-accent-primary)'

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .nav-root { padding: 0 20px !important; }
          .nav-name, .nav-contact { font-size: 13px !important; letter-spacing: 0.04em !important; }
        }
      `}</style>
      <nav
        ref={navRef}
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
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen(v => !v)}
          onPointerEnter={loadFlowingMenu}
          onFocus={loadFlowingMenu}
          style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           6,
            cursor:        'pointer',
            background:    'none',
            border:        'none',
            padding:       0,
          }}
        >
          <motion.div
            initial={false}
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
        </button>

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
              id="site-menu"
              ref={panelRef}
              // Close after following a menu link (client-side navigation keeps the layout mounted)
              onClick={(e) => { if ((e.target as Element).closest('a')) setMenuOpen(false) }}
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
