'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { PROFILE } from '@/data'
import aboutHero from '../../../public/about-hero.jpg'
import aboutFill from '../../../public/about-fill.jpg'

/* ── The photos ─────────────────────────────────────────────────
   Two files, both replaceable as-is (sizes are read at build time); crops are set here only.
   - public/about-hero.jpg: the portrait in frames A and B (grows from the small window to fill the
     screen, gray and darkened behind the bio).
   - public/about-fill.jpg: frame C. A landscape photo ≥ 2560px wide; it crossfades in over the
     portrait during the B → C change. */
// TODO(photo): about-fill.jpg is still a copy of the portrait, as a placeholder. Replace it with the
// landscape stock photo; the about e2e suite re-measures the frame C headline contrast over it.
const PHOTO = {
  src: aboutHero,
  alt: 'Portrait of Niko Pranata',
  /** The point of the portrait kept in view when it fills the screen, as fractions of width/height */
  focus: { x: 0.5, y: 0.32 },
  /** Frame A window in px, desktop and phones (< 768px wide) */
  window: { desktop: { w: 220, h: 290 }, phone: { w: 150, h: 198 } },
  /**
   * Frame C photo, shown full screen (object-fit: cover). position matches the portrait's focus,
   * so the placeholder crossfades without a double image; retune it for the real photo.
   */
  fill: { src: aboutFill, position: '50% 32%' },
}
const PHONE_MAX = 767
const ASPECT = PHOTO.src.width / PHOTO.src.height

/* ── Timeline, as fractions of the pinned scroll ────────────────
   A (0): name, small photo. B (~0.3–0.7): photo full screen, gray, 30% bright, bio read word by
   word. C (~0.8–1): full colour, bottom third shaded, closing line. */
const T = {
  nameOut: [0.03, 0.2],
  grow:    [0.04, 0.32],
  gray:    [0.06, 0.2],
  dark:    [0.1, 0.32],
  bioIn:   [0.3, 0.34],
  read:    [0.34, 0.68],
  bioOut:  [0.7, 0.75],
  color:   [0.73, 0.84],
  /** Portrait → frame C photo, opacity only, with a slight scale settle */
  fill:    [0.72, 0.84],
  /** Done at 0.95: only 5% of the track is left holding frame C before the bio */
  closing: [0.84, 0.95],
} as const
/** Overlay opacity in frame B: the photo at 30% brightness, so cream text holds 4.5:1 over any photo */
const DARK = 0.7

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const at = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

type Geometry = {
  vw: number
  vh: number
  /** Photo laid out to cover the viewport, px */
  W: number
  H: number
  win: { w: number; h: number }
  /** Scale at which the photo just covers the frame-A window */
  k0: number
}

function measure(el: HTMLElement): Geometry {
  const vw = el.clientWidth
  const vh = el.clientHeight
  const W = Math.max(vw, vh * ASPECT)
  const H = W / ASPECT
  const win = vw <= PHONE_MAX ? PHOTO.window.phone : PHOTO.window.desktop
  return { vw, vh, W, H, win, k0: Math.max(win.w / W, win.h / H) }
}

/** One word of the bio's top (read) copy: fades in as the reader reaches it */
function ReadWord({ text, accent, progress, start, end }: {
  text: string
  accent?: boolean
  progress: MotionValue<number>
  start: number
  end: number
}) {
  const opacity = useTransform(progress, [start, end], [0, 1])
  return <motion.span className={accent ? 'story-accent' : undefined} style={{ opacity }}>{text}</motion.span>
}

export default function StoryHero() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const geo = useMotionValue<Geometry | null>(null)

  const { scrollYProgress: p } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  useLayoutEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const update = () => geo.set(measure(el))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [geo])

  // Photo: laid out at full cover size, shrunk to fit the frame-A window, then grown (transform
  // only). The window itself is a clip-path: the one non-transform property here, because the
  // photo changes shape (portrait window → full screen) and scale alone can't do that.
  // These auto-track the motion values they read on their FIRST run, so each reads both the
  // progress and the geometry before any early return (geometry is null until measured).
  const grow = useTransform(() => easeInOut(at(p.get(), T.grow)))
  const boxX = useTransform(() => {
    const t = grow.get(), g = geo.get(); if (!g) return 0
    return lerp(g.vw / 2 - (g.W * g.k0) / 2, (g.vw - g.W) * PHOTO.focus.x, t)
  })
  const boxY = useTransform(() => {
    const t = grow.get(), g = geo.get(); if (!g) return 0
    return lerp(g.vh / 2 - (g.H * g.k0) / 2, (g.vh - g.H) * PHOTO.focus.y, t)
  })
  const boxScale = useTransform(() => {
    const t = grow.get(), g = geo.get(); if (!g) return 1
    return lerp(g.k0, 1, t)
  })
  const clipPath = useTransform(() => {
    const t = grow.get(), g = geo.get(); if (!g) return 'inset(50% 50%)'
    const w = lerp(g.win.w, g.vw, t), h = lerp(g.win.h, g.vh, t)
    return `inset(${(g.vh - h) / 2}px ${(g.vw - w) / 2}px round ${lerp(12, 0, t)}px)`
  })
  const photoShown = useTransform(() => (geo.get() ? 1 : 0))

  const grayOpacity  = useTransform(() => at(p.get(), T.gray) * (1 - at(p.get(), T.color)))
  const darkOpacity  = useTransform(() => DARK * at(p.get(), T.dark) * (1 - at(p.get(), T.color)))
  const shadeOpacity = useTransform(() => at(p.get(), T.color))
  const fillOpacity  = useTransform(() => at(p.get(), T.fill))
  const fillScale    = useTransform(() => 1.08 - 0.08 * easeInOut(at(p.get(), T.fill)))

  const nameOpacity = useTransform(() => 1 - at(p.get(), T.nameOut))
  const name1X      = useTransform(() => `${-8 * at(p.get(), T.nameOut)}vw`)
  const name2X      = useTransform(() => `${8 * at(p.get(), T.nameOut)}vw`)

  const bioOpacity     = useTransform(() => at(p.get(), T.bioIn) * (1 - at(p.get(), T.bioOut)))
  const closingOpacity = useTransform(() => at(p.get(), T.closing))
  const closingY       = useTransform(() => `${(1 - easeInOut(at(p.get(), T.closing))) * 0.4}em`)

  const words = PROFILE.bio.story
  const [r0, r1] = T.read
  const span = (r1 - r0) / words.length

  return (
    <section className="story" aria-labelledby="about-title">
      <style>{CSS}</style>
      {/* Reduced motion and no-JS: the same content as a static column, set in CSS so nothing
          shifts when JavaScript arrives */}
      <style>{`@media (prefers-reduced-motion: reduce) { ${STATIC_CSS} }`}</style>
      <noscript><style>{STATIC_CSS}</style></noscript>

      <div ref={trackRef} className="story-track" data-nav-transparent>
        {/* Tone zones (see ToneProvider): cream for frame A, near-black once the photo grows */}
        <div className="story-zone story-zone-light" data-tone="light" />
        <div className="story-zone story-zone-dark" data-tone="dark" />

        <div ref={stickyRef} className="story-sticky">
          {/* ── Frame A ── */}
          <h1 id="about-title" className="story-name">
            <motion.span className="story-name-1" style={{ x: name1X, opacity: nameOpacity }}>Niko Yoga</motion.span>{' '}
            <motion.span className="story-name-2" style={{ x: name2X, opacity: nameOpacity }}>Pranata</motion.span>
          </h1>
          <motion.p className="story-tagline" style={{ opacity: nameOpacity }}>{PROFILE.bio.tagline}</motion.p>

          {/* ── The photo, frames A → C ── */}
          <motion.div className="story-photo" style={{ clipPath, opacity: photoShown }}>
            <PhotoBox x={boxX} y={boxY} scale={boxScale} size={geo} grayOpacity={grayOpacity} />
            {/* Frame C photo: crossfades in over the portrait (decorative, so no alt text) */}
            <motion.div className="story-fill" aria-hidden="true" style={{ opacity: fillOpacity, scale: fillScale }}>
              <Image src={PHOTO.fill.src} alt="" fill sizes="100vw" preload className="story-img" style={{ objectPosition: PHOTO.fill.position }} />
            </motion.div>
            <motion.div className="story-dark" aria-hidden="true" style={{ opacity: darkOpacity }} />
            <motion.div className="story-shade" aria-hidden="true" style={{ opacity: shadeOpacity }} />
          </motion.div>

          {/* ── Frame B: the bio, read word by word ── */}
          <motion.div className="story-bio" style={{ opacity: bioOpacity }}>
            <div className="story-bio-text">
              {/* Base copy: unread grey, and what assistive tech reads */}
              <p className="story-bio-base">
                {words.map((w, i) => <span key={i} className={w.accent ? 'story-accent' : undefined}>{w.text}</span>)}
              </p>
              {/* Read copy, stacked exactly on top: cream (accents light violet), word by word */}
              <p className="story-bio-read" aria-hidden="true">
                {words.map((w, i) => (
                  <ReadWord key={i} text={w.text} accent={w.accent} progress={p} start={r0 + i * span} end={r0 + i * span + span * 4} />
                ))}
              </p>
            </div>
          </motion.div>

          {/* ── Frame C ── */}
          <motion.p className="story-closing" style={{ opacity: closingOpacity, y: closingY }}>
            <span className="story-closing-1">Studying, shipping,</span>{' '}
            <span className="story-closing-2">always building.</span>
          </motion.p>
        </div>
      </div>
    </section>
  )
}

/** Colour and grayscale copies of the photo, sized to cover the viewport and moved as one */
function PhotoBox({ x, y, scale, size, grayOpacity }: {
  x: MotionValue<number>
  y: MotionValue<number>
  scale: MotionValue<number>
  size: MotionValue<Geometry | null>
  grayOpacity: MotionValue<number>
}) {
  const width  = useTransform(() => size.get()?.W ?? 0)
  const height = useTransform(() => size.get()?.H ?? 0)
  // Rendered width is the cover width: the viewport width, or more on tall screens
  const sizes = `max(100vw, ${Math.round(ASPECT * 100)}svh)`
  return (
    // width/height only change on resize; per-frame motion is the transform
    <motion.div className="story-photo-box" style={{ x, y, scale, width, height }}>
      <Image src={PHOTO.src} alt={PHOTO.alt} fill sizes={sizes} preload className="story-img" />
      <motion.div className="story-gray" aria-hidden="true" style={{ opacity: grayOpacity }}>
        <Image src={PHOTO.src} alt="" fill sizes={sizes} className="story-img" />
      </motion.div>
    </motion.div>
  )
}

const CSS = `
.story-track {
  --story-scroll: 200svh;
  --win-h: ${PHOTO.window.desktop.h}px;
  --win-w: ${PHOTO.window.desktop.w}px;
  position: relative;
  height: calc(100svh + var(--story-scroll));
}
@media (max-width: ${PHONE_MAX}px) {
  .story-track { --story-scroll: 120svh; --win-h: ${PHOTO.window.phone.h}px; --win-w: ${PHOTO.window.phone.w}px; }
}
.story-zone { position: absolute; left: 0; right: 0; pointer-events: none; }
/* The backdrop turns dark when the viewport's midline passes this: 6% into the pinned scroll */
.story-zone-light { top: 0; height: calc(50svh + var(--story-scroll) * 0.06); }
.story-zone-dark  { top: calc(50svh + var(--story-scroll) * 0.06); bottom: 0; }

.story-sticky {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}

.story-name {
  position: absolute;
  inset: 0 var(--page-x);
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.5rem, min(12.5vw, 21svh), 300px);
  line-height: 0.85;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--tone-fg);
  pointer-events: none;
  z-index: 1;
}
.story-name-1, .story-name-2 { position: absolute; white-space: nowrap; display: block; }
/* Both lines overlap the photo window by about a third of a line */
.story-name-1 { left: 0;  bottom: calc(50% + var(--win-h) / 2 - 0.35em); }
.story-name-2 { right: 0; top:    calc(50% + var(--win-h) / 2 - 0.35em); }

.story-tagline {
  position: absolute;
  margin: 0;
  left: calc(50% + var(--win-w) / 2 + clamp(16px, 1.7vw, 40px));
  top: 50%;
  transform: translateY(-50%);
  max-width: 13ch;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(1.25rem, 1.9vw, 2.75rem);
  line-height: 1.1;
  color: var(--color-accent-secondary);
  z-index: 3;
}
@media (max-width: ${PHONE_MAX}px) {
  .story-tagline { left: var(--page-x); top: auto; bottom: calc(clamp(16px, 4svh, 48px) + 2.2em); transform: none; max-width: none; }
}

.story-photo { position: absolute; inset: 0; z-index: 2; }
.story-photo-box { position: absolute; left: 0; top: 0; transform-origin: 0 0; will-change: transform; }
.story-img { object-fit: cover; }
.story-gray { position: absolute; inset: 0; }
.story-fill { position: absolute; inset: 0; will-change: opacity, transform; }
/* Static filter (never animated): the copy crossfades with opacity */
.story-gray .story-img { filter: grayscale(1); }
.story-dark, .story-shade { position: absolute; inset: 0; pointer-events: none; }
.story-dark { background: #000; }
/* Frame C: only the bottom third is darkened, under the closing line. 0.8 keeps the light-violet
   line above 3:1 over a white shirt even with the film grain on top */
.story-shade { background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.8) 22%, rgba(0,0,0,0) 36%); }

.story-bio {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--nav-h) + 16px) var(--page-x) 32px;
  z-index: 4;
  pointer-events: none;
}
.story-bio-text { position: relative; max-width: 25em; font-size: clamp(24px, 3vw, 64px); }
.story-bio-base, .story-bio-read {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1em;
  line-height: 1.12;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}
.story-bio-base { color: var(--color-text-faint-inverse); }
.story-bio-read { position: absolute; inset: 0; color: var(--color-text-inverse); }
.story-accent {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 1.08em;
  text-transform: none;
  letter-spacing: 0;
}
.story-bio-read .story-accent { color: var(--color-accent-primary-light); }

.story-closing {
  position: absolute;
  left: var(--page-x);
  right: var(--page-x);
  bottom: clamp(24px, 5svh, 64px);
  margin: 0;
  font-size: clamp(32px, 4.6vw, 96px);
  line-height: 0.95;
  z-index: 4;
  pointer-events: none;
}
.story-closing-1 {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-text-inverse);
}
.story-closing-2 {
  display: block;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-accent-primary-light);
}
`

/** Reduced motion and no-JS: no pinning, nothing animated, everything in reading order on cream */
const STATIC_CSS = `
.story-track { height: auto !important; }
.story-zone-dark { display: none !important; }
.story-sticky {
  position: relative !important; height: auto !important; overflow: visible !important;
  display: flex; flex-direction: column; gap: var(--space-m);
  padding: var(--page-top) var(--page-x) var(--space-xl);
}
.story-name, .story-name-1, .story-name-2, .story-tagline,
.story-photo, .story-bio, .story-closing {
  position: static !important; inset: auto !important; transform: none !important; opacity: 1 !important;
}
.story-bio-read, .story-gray, .story-fill, .story-dark, .story-shade { display: none !important; }
.story-name { color: var(--color-text); }
.story-name-1, .story-name-2 { white-space: normal; }
.story-name-2 { text-align: right; }
.story-tagline { max-width: none; }
.story-photo {
  position: relative !important; clip-path: none !important;
  width: min(100%, 420px); aspect-ratio: ${PHOTO.src.width} / ${PHOTO.src.height};
  border-radius: var(--radius-md); overflow: hidden;
}
.story-photo-box { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; transform: none !important; }
.story-bio { padding: 0; display: block; }
.story-bio-text { max-width: 30em; font-size: clamp(22px, 2.4vw, 44px); }
.story-bio-base { color: var(--color-text); }
.story-accent { color: var(--color-accent-secondary); }
.story-closing-1 { color: var(--color-text); }
.story-closing-2 { color: var(--color-accent-secondary); }
`
