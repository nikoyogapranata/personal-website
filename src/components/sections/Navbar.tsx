'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { EASE } from '@/lib/motion'

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

type Surface = {
  dark:  boolean
  /** Background for the bar, or null to stay transparent (home hero, top of a page) */
  color: string | null
}

// What's painted under (x, y)? Skips the navbar itself; pointer-events:none overlays are skipped
// by hit-testing, and clip-path is respected, so this tracks what's actually visible.
function surfaceAt(x: number, y: number, ignore: (el: Element) => boolean): Surface {
  const hit = document.elementsFromPoint(x, y).find(el => !ignore(el)) ?? null
  const transparent = window.scrollY < 8 || !!hit?.closest('[data-nav-transparent]')
  for (let el: Element | null = hit; el; el = el.parentElement) {
    const color = getComputedStyle(el).backgroundColor
    const l = luminance(color)
    // 0.18 is where #0a0a0a and #f8f8f5 text have equal contrast, so this picks the more readable one
    if (l !== null) return { dark: l < 0.18, color: transparent ? null : color }
  }
  return { dark: false, color: null }
}

const sameSurface = (a: Surface, b: Surface) => a.dark === b.dark && a.color === b.color

export default function Navbar() {
  const [menuOpen, setMenuOpen]               = useState(false)
  const [surface, setSurface]                 = useState<Surface>({ dark: false, color: null })
  const isDark                                = surface.dark
  const navRef                                = useRef<HTMLElement>(null)
  const menuButtonRef                         = useRef<HTMLButtonElement>(null)
  const panelRef                              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    let sampleUntil = 0
    const sample = () => {
      const nav = navRef.current
      if (nav) {
        const next = surfaceAt(window.innerWidth / 2, 32, el => nav.contains(el))
        setSurface(prev => (sameSurface(prev, next) ? prev : next))
      }
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
          // Solid once past the hero so content never runs under the links
          background:          surface.color ?? 'transparent',
          borderBottom:        `1px solid ${
            surface.color === null ? 'transparent' : isDark ? 'var(--color-border)' : 'var(--color-border-light)'
          }`,
          transition:          'background-color 0.25s ease, border-color 0.25s ease',
        }}
      >
        {/* LEFT — NIKO PRANATA */}
        <button
          onClick={goTop}
          className="hover-accent-text"
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
            color:         base,
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
            transition={{ duration: 0.3, ease: EASE }}
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
            className="hover-accent-text"
            style={{ textDecoration: 'none' }}
          >
            <span className="nav-contact" style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      18,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color:         base,
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
              transition={{ duration: 0.5, ease: EASE }}
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
                textColor='var(--color-text)'
                bgColor='var(--color-bg)'
                marqueeBgColor='var(--color-bg-dark)'
                marqueeTextColor='var(--color-text-inverse)'
                borderColor='var(--color-border-light)'
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
