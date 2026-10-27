'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { TONE_COLOR, useTone } from '../ui/Tone'
import { DURATION, EASE, EASE_IN_OUT } from '@/lib/motion'

// FlowingMenu pulls in GSAP; only load it when the menu is about to open
const loadFlowingMenu = () => import('../ui/FlowingMenu')
const FlowingMenu = dynamic(loadFlowingMenu, { ssr: false })

const menuItems = [
  { link: '/',      text: 'Home',     image: '/menu-spring.webp' },
  { link: '/about', text: 'About Me', image: '/menu-autumn.webp' },
  { link: '/work',  text: 'Work',     image: '/menu-winter.webp' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen]               = useState(false)
  const pathname                              = usePathname()
  // Same signal as the page backdrop: the bar's surface changes with it, its text at the midpoint
  const tone                                  = useTone()
  const isDark                                = tone.fg !== 'light'
  const [atTop, setAtTop]                     = useState(true)
  const [overHero, setOverHero]               = useState(false)
  const menuButtonRef                         = useRef<HTMLButtonElement>(null)
  const panelRef                              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Transparent while a [data-nav-transparent] area (the home hero) is under the bar
  useEffect(() => {
    const areas = document.querySelectorAll('[data-nav-transparent]')
    if (!areas.length) return
    const under = new Set<Element>()
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) under.add(e.target)
        else under.delete(e.target)
      }
      setOverHero(under.size > 0)
    }, { rootMargin: '0px 0px -95% 0px' }) // the top 5% of the viewport, where the bar sits
    areas.forEach(el => io.observe(el))
    return () => {
      io.disconnect()
      setOverHero(false) // the next page may have no hero
    }
  }, [pathname])

  // Solid once past the hero so content never runs under the links
  const surface = atTop || overHero ? null : TONE_COLOR[tone.bg]

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
          .nav-name, .nav-contact { letter-spacing: 0.04em !important; }
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
          height:              'var(--nav-h)',
          padding:             '0 40px',
          // Solid once past the hero so content never runs under the links
          background:          surface ?? 'transparent',
          borderBottom:        `1px solid ${
            surface === null ? 'transparent' : isDark ? 'var(--color-border)' : 'var(--color-border-light)'
          }`,
          // Matches the backdrop crossfade. Clearing to transparent is instant, so after a route
          // change the old page's bar doesn't fade out over the new page's top.
          transition:          surface === null
            ? 'none'
            : 'background-color var(--dur-base) var(--ease-in-out), border-color var(--dur-base) var(--ease-in-out)',
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
            fontSize:      'var(--text-nav)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:         base,
            lineHeight:    1,
            transition:    'color var(--dur-fast) var(--ease)',
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
            transition={{ duration: DURATION.fast, ease: EASE }}
            style={{ height: '1.5px', width: '100%' }}
          />
          <span style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      'var(--text-label)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color:         menuOpen ? accent : base,
            lineHeight:    1,
            transition:    'color var(--dur-fast) var(--ease)',
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
              fontSize:      'var(--text-nav)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color:         base,
              lineHeight:    1,
              transition:    'color var(--dur-fast) var(--ease)',
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
              transition={{ duration: DURATION.fast, ease: EASE_IN_OUT }}
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
              transition={{ duration: DURATION.base, ease: EASE }}
              style={{
                position: 'fixed',
                top:      'var(--nav-h)',
                left:     0,
                width:    '100%',
                // At high zoom 33vh gets short, so keep room for three rem-sized links
                height:   'max(33vh, 9rem)',
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
