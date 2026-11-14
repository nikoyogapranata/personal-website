// /about: layout at every width, the scroll story (frames + contrast over the real photo), reduced
// motion, no JS, keyboard, curtain navigation in and out mid-scroll, back/forward, clocks,
// physics, and frame rate at 4x CPU throttling. Run: pnpm test:e2e
import { chromium } from 'playwright'
import path from 'node:path'
import { createRequire } from 'node:module'
import { BASE_URL as BASE, MODE, artifacts, SKIP_LOADER, reporter, contrast, hex } from './lib.mjs'

const sharp = createRequire(createRequire(import.meta.url).resolve('next'))('sharp')
const OUT = artifacts('about')
const r = reporter()
const SIZES = { 375: 812, 768: 1024, 1024: 768, 1440: 900, 2560: 1440 }
const CREAM = hex('#f8f8f5'), VIOLET_LIGHT = hex('#a78bfa')

async function open(browser, w, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: SIZES[w] || 900 }, ...opts })
  if (opts.javaScriptEnabled !== false) await ctx.addInitScript(SKIP_LOADER)
  await ctx.addInitScript(() => {
    window.__cls = 0
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) } catch {}
  })
  const page = await ctx.newPage()
  page.__errors = []
  page.on('pageerror', e => page.__errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error' && !/Download the React DevTools/.test(m.text())) page.__errors.push(m.text().slice(0, 200)) })
  return page
}

/** Top of an element in page coordinates, and how far its pinned track scrolls */
const track = (p, sel) => p.evaluate(sel => {
  const el = document.querySelector(sel)
  return { top: el.getBoundingClientRect().top + scrollY, scroll: Math.max(0, el.offsetHeight - innerHeight) }
}, sel)
const scrollTo = async (p, y, wait = 700) => { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(wait) }

/** Scroll the whole page in steps (lets every observer and reveal fire), checking overflow on the way */
async function walk(p) {
  const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  let maxOverflow = 0
  for (let y = 0; y <= H; y += Math.round((await p.evaluate(() => innerHeight)) * 0.6)) {
    await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(120)
    maxOverflow = Math.max(maxOverflow, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth))
  }
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(400)
  return maxOverflow
}

const outline = p => p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({ level: +h.tagName[1], text: h.textContent.trim() })))

/** Min contrast of text against what's behind it: screenshot with and without the text, sample under each word */
async function textContrast(p, { hideSel, wordSel, fg, accentFg, accentSel }) {
  const shot = async () => sharp(await p.screenshot()).raw().toBuffer({ resolveWithObject: true })
  // Next's dev-tools badge (dev only) sits bottom-left over the page: not part of the design
  await p.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
  await p.addStyleTag({ content: `${hideSel} { visibility: hidden !important; }` })
  await p.waitForTimeout(250)
  const bg = await shot()
  await p.evaluate(sel => { for (const s of document.querySelectorAll('style')) if (s.textContent.includes(sel + ' { visibility: hidden')) s.remove() }, hideSel)
  await p.waitForTimeout(250)
  const dpr = await p.evaluate(() => devicePixelRatio)
  const rects = await p.evaluate(({ wordSel, accentSel }) => [...document.querySelectorAll(wordSel)].map(el => {
    const r = el.getBoundingClientRect()
    return { x: r.left, y: r.top, w: r.width, h: r.height, accent: accentSel ? el.matches(accentSel) : false, text: el.textContent.trim() }
  }).filter(r => r.w > 2 && r.h > 2 && r.y >= 0 && r.y + r.h <= innerHeight), { wordSel, accentSel })
  // Worst case tracked per colour: cream and accent text have different thresholds
  const worst = { plain: { ratio: Infinity, text: '' }, accent: { ratio: Infinity, text: '' } }
  for (const rc of rects) {
    // Brightest background pixel behind the word: the worst case for light text
    let maxL = -1, px = null
    for (let y = Math.floor(rc.y * dpr); y < Math.min(bg.info.height, (rc.y + rc.h) * dpr); y += 2)
      for (let x = Math.floor(rc.x * dpr); x < Math.min(bg.info.width, (rc.x + rc.w) * dpr); x += 2) {
        const i = (y * bg.info.width + x) * bg.info.channels
        const c = [bg.data[i], bg.data[i + 1], bg.data[i + 2]]
        const l = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722
        if (l > maxL) { maxL = l; px = c }
      }
    if (!px) continue
    const ratio = contrast(rc.accent ? accentFg : fg, px)
    const slot = rc.accent ? worst.accent : worst.plain
    if (ratio < slot.ratio) Object.assign(slot, { ratio, text: rc.text })
  }
  return { words: rects.length, ...worst }
}

/** Watches script responses; true once one of them is matter.js (by content: names are hashed in production) */
function watchMatter(p) {
  const state = { loaded: false, scripts: 0 }
  p.on('response', async res => {
    if (res.request().resourceType() !== 'script') return
    state.scripts++
    // The library's own `Matter.name = 'matter-js'` (dev chunks also mention the package path)
    try { if (/name\s*=\s*["']matter-js["']/.test(await res.text())) state.loaded = true } catch {}
  })
  return state
}

;(async () => {
  console.log(`BASE ${BASE} (${MODE})`)
  const browser = await chromium.launch({ channel: 'chrome' })

  // ── Every width: overflow, headings, CLS, console errors, screenshots
  r.section('WIDTHS')
  for (const w of [375, 768, 1024, 1440, 2560]) {
    const p = await open(browser, w)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await p.waitForTimeout(600)
    const h = await outline(p)
    const h1s = h.filter(x => x.level === 1)
    const skips = h.filter((x, i) => i > 0 && x.level > h[i - 1].level + 1)
    const h3s = h.filter(x => x.level === 3).map(x => x.text)
    r.check(h1s.length === 1 && h1s[0].text === 'Niko Yoga Pranata', `${w}px h1: ${JSON.stringify(h1s.map(x => x.text))}`)
    r.check(skips.length === 0 && h3s.length === 4, `${w}px heading outline: ${h.map(x => 'h' + x.level + ' ' + x.text.slice(0, 18)).join(' · ')}`)

    if (w === 1440 || w === 375) {
      // Section screenshots (the story frames are captured separately below)
      for (const [name, sel, frac] of [['bio', '.about-bio', 0], ['experience-start', '.xp-track', 0], ['experience-end', '.xp-track', 1], ['toolbox', '.tb', 0], ['cities', '.cities', 0], ['contact', '#contact', 0]]) {
        const t = await track(p, sel)
        await scrollTo(p, t.top + t.scroll * frac - (name === 'toolbox' ? 60 : 0), name === 'toolbox' ? 3500 : 1100)
        await p.screenshot({ path: path.join(OUT, `${w}-${name}.png`) })
      }
    }
    const overflow = await walk(p)
    const cls = await p.evaluate(() => window.__cls)
    r.check(overflow <= 0, `${w}px no horizontal overflow anywhere on the page (max ${overflow}px)`)
    r.check(cls === 0, `${w}px CLS over a full scroll: ${cls.toFixed(4)}`)
    r.check(p.__errors.length === 0, `${w}px console errors: ${p.__errors.length ? p.__errors.join(' | ') : 'none'}`)
    await p.context().close()
  }

  // ── Scroll story: frames A, B, C at 1440 and 375, contrast over the real photo
  r.section('STORY FRAMES + CONTRAST')
  for (const w of [1440, 375, 2560]) {
    const p = await open(browser, w)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    const t = await track(p, '.story-track')
    const at = f => scrollTo(p, t.top + t.scroll * f, 900)
    await at(0)
    const a = await p.evaluate(() => ({
      sticky: getComputedStyle(document.querySelector('.story-sticky')).position,
      photo: (() => { const r = document.querySelector('.story-photo-box').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] })(),
      fg: document.documentElement.dataset.fg,
    }))
    if (w !== 2560) await p.screenshot({ path: path.join(OUT, `${w}-story-A.png`) })
    r.check(a.sticky === 'sticky' && a.fg === 'light', `${w}px frame A: pinned, cream tone (fg=${a.fg})`)
    // Frame B: every word read (just before the bio fades out)
    await at(0.69)
    const b = await p.evaluate(() => ({ fg: document.documentElement.dataset.fg, dark: getComputedStyle(document.querySelector('.story-dark')).opacity }))
    if (w !== 2560) await p.screenshot({ path: path.join(OUT, `${w}-story-B.png`) })
    const cb = await textContrast(p, { hideSel: '.story-bio', wordSel: '.story-bio-read > span', accentSel: '.story-accent', fg: CREAM, accentFg: VIOLET_LIGHT })
    r.check(b.fg === 'dark' && Math.abs(+b.dark - 0.7) < 0.01, `${w}px frame B: dark tone, photo overlay at ${(+b.dark).toFixed(2)} (30% brightness)`)
    r.check(cb.plain.ratio >= 4.5, `${w}px frame B cream text over the real photo: min ${cb.plain.ratio.toFixed(2)}:1 on "${cb.plain.text}" (≥ 4.5), ${cb.words} words`)
    r.check(cb.accent.ratio >= 3, `${w}px frame B light-violet accents over the real photo: min ${cb.accent.ratio.toFixed(2)}:1 on "${cb.accent.text}" (large text ≥ 3)`)
    // Frame C
    await at(0.97)
    if (w !== 2560) await p.screenshot({ path: path.join(OUT, `${w}-story-C.png`) })
    const cc = await textContrast(p, { hideSel: '.story-closing', wordSel: '.story-closing > span', accentSel: '.story-closing-2', fg: CREAM, accentFg: VIOLET_LIGHT })
    const c = await p.evaluate(() => {
      const img = document.querySelector('.story-fill img')
      return {
        gray: getComputedStyle(document.querySelector('.story-gray')).opacity,
        fill: getComputedStyle(document.querySelector('.story-fill')).opacity,
        sizes: img.getAttribute('sizes'),
        preload: [...document.querySelectorAll('link[rel=preload][as=image]')].some(l => /about-fill/.test(l.getAttribute('imagesrcset') || l.href)),
      }
    })
    r.check(+c.gray === 0 && +c.fill === 1 && c.sizes === '100vw' && c.preload, `${w}px frame C: shows the frame C photo (fill ${c.fill}, gray ${c.gray}), sizes="${c.sizes}", preloaded=${c.preload}`)
    r.check(cc.plain.ratio >= 4.5 && cc.accent.ratio >= 3, `${w}px frame C headline over the frame C photo: cream min ${cc.plain.ratio.toFixed(2)}:1 (≥ 4.5), violet min ${cc.accent.ratio.toFixed(2)}:1 (≥ 3)`)
    // After the story: back to cream
    const bio = await track(p, '.about-bio')
    await scrollTo(p, bio.top - 200, 1200)
    r.check(await p.evaluate(() => document.documentElement.dataset.fg) === 'light', `${w}px tone back to cream after the story`)
    await p.context().close()
  }

  // ── Experience stack: counter tracks scroll (desktop), plain list (phone)
  r.section('EXPERIENCE')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    const t = await track(p, '.xp-track')
    const seen = []
    for (const f of [0, 0.3, 0.62, 1]) { await scrollTo(p, t.top + t.scroll * f, 900); seen.push(await p.evaluate(() => document.querySelector('.xp-count-now').textContent)) }
    r.check(seen.join(',') === '01,02,03,04', `1440px counter while scrolling: ${seen.join(' → ')}`)
    const tilt = await p.evaluate(() => [...document.querySelectorAll('.xp-slot')].map(s => getComputedStyle(s).transform))
    r.check(tilt.every(tf => tf === 'none' || /matrix\(1, 0, 0, 1, 0, -?0(\.\d+)?\)/.test(tf)), `1440px all cards settled at 0° at the end`)
    await p.context().close()
    const q = await open(browser, 375)
    await q.goto(BASE + '/about', { waitUntil: 'networkidle' })
    const phone = await q.evaluate(() => ({ sticky: getComputedStyle(document.querySelector('.xp-sticky')).position, cards: [...document.querySelectorAll('.xp-card')].map(c => getComputedStyle(c.parentElement).position) }))
    r.check(phone.sticky === 'static' && phone.cards.every(pos => pos === 'static'), `375px experience is a plain list (sticky=${phone.sticky})`)
    await q.context().close()
  }

  // ── Toolbox: lazy physics, stays inside, drag, pause off-screen; grid on phones
  r.section('TOOLBOX')
  {
    const p = await open(browser, 1440)
    const matter = watchMatter(p)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await p.waitForTimeout(800)
    r.check(!matter.loaded, `matter.js not loaded on page load (${matter.scripts} scripts checked by content)`)
    const t = await track(p, '.tb')
    await scrollTo(p, t.top - 60, 4000)
    const st = await p.evaluate(() => {
      const a = document.querySelector('.tb-arena').getBoundingClientRect()
      const chips = [...document.querySelectorAll('.tb-chips > li')]
      return {
        status: document.querySelector('.tb-chips').dataset.physics,
        n: chips.length,
        outside: chips.filter(c => { const b = c.getBoundingClientRect(); const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2; return cx < a.left || cx > a.right || cy < a.top || cy > a.bottom }).map(c => c.textContent),
        names: chips.map(c => c.firstChild.textContent),
      }
    })
    r.check(matter.loaded && st.status === 'running', `physics loaded near the section and running (${st.status})`)
    r.check(st.outside.length === 0, `all ${st.n} chips inside the arena after the drop${st.outside.length ? ': outside ' + st.outside.join(', ') : ''}`)
    const required = ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Figma', 'Spring Boot', 'Jakarta EE', 'Thymeleaf', 'PHP', 'MySQL', 'PostgreSQL', 'Supabase', 'Firebase', 'SwiftUI', 'ARKit', 'Core ML', 'HealthKit', 'Python', 'crewAI', 'Gemini']
    const missing = required.filter(s => !st.names.includes(s))
    r.check(missing.length === 0, `toolbox list covers the brief's skills${missing.length ? ': missing ' + missing.join(', ') : ''}`)
    // A chip that's on top at its own centre (in a pile, others can cover it)
    const top = await p.evaluate(() => [...document.querySelectorAll('.tb-chips > li')].findIndex(c => {
      const b = c.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
      return hit && c.contains(hit)
    }))
    const chip = p.locator('.tb-chips > li').nth(Math.max(0, top))
    const bx = await chip.boundingBox()
    await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down()
    // Drag: while the button is held, the chip should follow the pointer (~300px left)
    const arenaMid = await p.evaluate(() => { const a = document.querySelector('.tb-arena').getBoundingClientRect(); return a.left + a.width / 2 })
    const dir = bx.x + bx.width / 2 < arenaMid ? 1 : -1 // toward the middle, away from the walls
    for (let i = 1; i <= 10; i++) { await p.mouse.move(bx.x + bx.width / 2 + dir * i * 30, bx.y + bx.height / 2 - i * 12); await p.waitForTimeout(30) }
    await p.waitForTimeout(400)
    const held = await chip.boundingBox()
    await p.mouse.up(); await p.waitForTimeout(1500)
    const after = await chip.boundingBox()
    r.check(dir * (held.x - bx.x) > 150, `drag: chip follows the pointer (x ${Math.round(bx.x)} → ${Math.round(held.x)} while held, ${Math.round(after.x)} after release)`)
    await scrollTo(p, 0, 600)
    r.check(await p.evaluate(() => document.querySelector('.tb-chips').dataset.physics) === 'paused', 'physics paused off-screen')
    await p.context().close()
    const q = await open(browser, 375)
    await q.goto(BASE + '/about', { waitUntil: 'networkidle' })
    const tq = await track(q, '.tb'); await scrollTo(q, tq.top, 1500)
    const grid = await q.evaluate(() => ({ mode: document.querySelector('.tb-chips').dataset.mode, moved: [...document.querySelectorAll('.tb-chips > li')].filter(c => c.style.transform).length }))
    r.check(grid.mode === 'grid' && grid.moved === 0, `375px toolbox is a grid, no physics (mode=${grid.mode})`)
    await q.context().close()
  }

  // ── Clocks
  r.section('CLOCKS')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await p.waitForTimeout(500)
    const c = await p.evaluate(() => [...document.querySelectorAll('.city-clock')].map(el => {
      const tz = el.dataset.tz
      const want = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(new Date())
      return { tz, shown: el.textContent, want }
    }))
    r.check(c.length === 2 && c.every(x => x.shown === x.want), `clocks: ${c.map(x => `${x.tz} ${x.shown} (expected ${x.want})`).join(', ')}`)
    const html = await (await fetch(BASE + '/about')).text()
    r.check((html.match(/class="city-clock"[^>]*>--:--</g) || []).length === 2, 'server HTML renders the clocks as "--:--" (time only after mount)')
    await p.context().close()
  }

  // ── Reduced motion: no pinning, no physics, no word-by-word
  r.section('REDUCED MOTION')
  for (const w of [1440, 375]) {
    const p = await open(browser, w, { reducedMotion: 'reduce' })
    const matter = watchMatter(p)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await walk(p)
    const st = await p.evaluate(() => ({
      pinned: ['.story-sticky', '.xp-sticky'].map(s => getComputedStyle(document.querySelector(s)).position),
      readCopy: getComputedStyle(document.querySelector('.story-bio-read')).display,
      bioOpacity: getComputedStyle(document.querySelector('.story-bio')).opacity,
      photo: getComputedStyle(document.querySelector('.story-photo')).opacity,
      chipsMoved: [...document.querySelectorAll('.tb-chips > li')].filter(c => c.style.transform).length,
      cls: window.__cls,
    }))
    r.check(st.pinned.every(x => x !== 'sticky') && st.readCopy === 'none' && st.bioOpacity === '1' && st.photo === '1', `${w}px reduced motion: nothing pinned (${st.pinned.join(', ')}), bio shown statically, photo visible`)
    r.check(!matter.loaded && st.chipsMoved === 0, `${w}px reduced motion: no physics`)
    r.check(st.cls === 0, `${w}px reduced motion: CLS ${st.cls.toFixed(4)}`)
    await p.screenshot({ path: path.join(OUT, `${w}-reduced-motion-top.png`) })
    await p.context().close()
  }

  // ── JavaScript blocked: everything readable
  r.section('JS BLOCKED')
  for (const w of [1440, 375]) {
    const p = await open(browser, w, { javaScriptEnabled: false })
    await p.goto(BASE + '/about', { waitUntil: 'load' })
    await p.waitForTimeout(500)
    const st = await p.evaluate(() => {
      const shown = el => { const cs = getComputedStyle(el); let e = el; while (e) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || c.opacity === '0') return false; e = e.parentElement } return el.getBoundingClientRect().height > 0 && cs.display !== 'none' }
      return {
        h1: shown(document.querySelector('h1')),
        bio: shown(document.querySelector('.story-bio-base')),
        photo: shown(document.querySelector('.story-photo')),
        cards: [...document.querySelectorAll('.xp-card')].filter(shown).length,
        chips: [...document.querySelectorAll('.tb-chips > li')].filter(shown).length,
        cities: [...document.querySelectorAll('.city-name')].filter(shown).length,
        line: shown(document.querySelector('.cities-rule')),
        short: shown(document.querySelector('.about-bio p')),
        closing: shown(document.querySelector('.story-closing')),
      }
    })
    r.check(Object.values(st).every(v => v === true || v === 4 || v === 32 || v === 2), `${w}px no JS: ${JSON.stringify(st)}`)
    await p.screenshot({ path: path.join(OUT, `${w}-nojs-full.png`), fullPage: true })
    await p.context().close()
  }

  // ── Keyboard
  r.section('KEYBOARD')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    const stops = []
    for (let i = 0; i < 40; i++) {
      await p.keyboard.press('Tab')
      // Two frames, far short of a 0.6–0.9s reveal: focused links must already be shown (Contact
      // reveals its column on focus)
      await p.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res))))
      const s = await p.evaluate(() => {
        const a = document.activeElement
        if (!a || a === document.body) return null
        const r = a.getBoundingClientRect()
        let hidden = false; for (let e = a; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.visibility === 'hidden' || +c.opacity === 0) hidden = true }
        return { label: (a.getAttribute('aria-label') || a.textContent).trim().slice(0, 30), visible: r.bottom > 0 && r.top < innerHeight && !hidden, footer: !!a.closest('footer') }
      })
      if (!s) continue
      stops.push(s)
      if (s.footer && stops.filter(x => x.footer).length >= 4) break
    }
    const invisible = stops.filter(s => !s.visible)
    r.check(invisible.length === 0, `Tab order (${stops.length} stops) all visible when focused: ${stops.map(s => s.label).join(' → ')}`)
    r.check(stops.some(s => /Download CV/.test(s.label)) && stops.some(s => s.footer), 'keyboard reaches the CV link and the footer')
    await p.context().close()
  }

  // ── Curtain navigation in and out mid-scroll, back/forward, tone
  r.section('NAVIGATION')
  {
    const p = await open(browser, 1440)
    await p.addInitScript(() => {
      window.__curtainSeen = false
      const t = () => { const c = document.querySelector('.page-curtain'); if (c && getComputedStyle(c).visibility === 'visible') window.__curtainSeen = true; requestAnimationFrame(t) }
      requestAnimationFrame(t)
    })
    const settle = async () => {
      await p.waitForFunction(() => window.__curtainSeen && getComputedStyle(document.querySelector('.page-curtain')).visibility === 'hidden', null, { timeout: 8000 }).catch(() => {})
      await p.waitForTimeout(900)
    }
    const state = () => p.evaluate(() => ({ path: location.pathname, y: Math.round(scrollY), fg: document.documentElement.dataset.fg, curtain: getComputedStyle(document.querySelector('.page-curtain')).visibility }))

    // Into /about from mid-way down /work
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    const footerAbout = p.locator('footer nav a[href="/about"]')
    await footerAbout.scrollIntoViewIfNeeded(); await footerAbout.click(); await settle()
    let s = await state()
    const photoShown = await p.evaluate(() => getComputedStyle(document.querySelector('.story-photo')).opacity)
    r.check(s.path === '/about' && s.y === 0 && s.fg === 'light' && photoShown === '1', `/work (scrolled) → /about: top, cream, photo shown (${JSON.stringify(s)})`)

    // Out of /about mid-story (frame B, dark tone), then back
    const t = await track(p, '.story-track')
    await scrollTo(p, t.top + t.scroll * 0.5, 1200)
    const leftAt = await state()
    await p.click('nav.nav-root a[href="/contact"]'); await settle()
    s = await state()
    r.check(s.path === '/contact' && s.y === 0 && s.fg === 'light' && s.curtain === 'hidden', `/about frame B (dark) → /contact: top, cream (${JSON.stringify(s)})`)
    await p.goBack(); await p.waitForTimeout(1800)
    s = await state()
    r.check(s.path === '/about' && Math.abs(s.y - leftAt.y) < 4 && s.fg === leftAt.fg, `back → /about restores scroll ${s.y} (left at ${leftAt.y}) and tone ${s.fg} (was ${leftAt.fg})`)
    const geo = await p.evaluate(() => getComputedStyle(document.querySelector('.story-dark')).opacity)
    r.check(+geo > 0.5, `story state restored on back (overlay ${(+geo).toFixed(2)})`)
    await p.goForward(); await p.waitForTimeout(1500)
    s = await state()
    r.check(s.path === '/contact', `forward → ${s.path}`)

    // Out of /about mid-experience via the menu, then back
    await p.goBack(); await p.waitForTimeout(1500)
    const x = await track(p, '.xp-track')
    await scrollTo(p, x.top + x.scroll * 0.5, 1200)
    const left2 = await state()
    await p.click('button[aria-controls="site-menu"]'); await p.waitForSelector('#site-menu a'); await p.waitForTimeout(700)
    await p.click('#site-menu a:text-is("Work")'); await settle()
    s = await state()
    r.check(s.path === '/work' && s.y === 0 && s.fg === 'light', `/about mid-experience → menu → /work (${JSON.stringify(s)})`)
    await p.goBack(); await p.waitForTimeout(1800)
    s = await state()
    const counter = await p.evaluate(() => document.querySelector('.xp-count-now').textContent)
    r.check(s.path === '/about' && Math.abs(s.y - left2.y) < 4 && s.fg === 'light', `back → /about mid-experience at ${s.y} (left at ${left2.y}), counter ${counter}`)
    await p.context().close()
  }

  // ── Frame rate at 4x CPU throttling
  r.section('PERFORMANCE (4x CPU throttle)')
  for (const [name, sel] of [['story', '.story-track'], ['toolbox', '.tb']]) {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    const t = await track(p, sel)
    const start = name === 'toolbox' ? t.top - 900 : t.top
    const end = name === 'toolbox' ? t.top + 300 : t.top + t.scroll
    await scrollTo(p, start, name === 'toolbox' ? 200 : 600)
    const cdp = await p.context().newCDPSession(p)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await p.evaluate(() => {
      window.__frames = []
      let last = performance.now()
      const tick = now => { window.__frames.push(now - last); last = now; if (!window.__stopFrames) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    })
    // Wheel-scroll through the section like a trackpad: 100px steps every ~16ms
    await p.mouse.move(720, 450)
    const steps = Math.ceil((end - start) / 100)
    const t0 = Date.now()
    for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(16) }
    if (name === 'toolbox') await p.waitForTimeout(2500) // chips dropping and settling
    const ms = Date.now() - t0
    const f = await p.evaluate(() => { window.__stopFrames = true; return window.__frames.slice(2) })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    const sorted = [...f].sort((a, b) => a - b)
    const avg = f.reduce((a, b) => a + b, 0) / f.length
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const long = f.filter(x => x > 50).length
    r.info(`${name}: ${f.length} frames in ${ms}ms → ${(1000 / avg).toFixed(1)} fps average, p95 frame ${p95.toFixed(1)}ms, ${long} frames over 50ms`)
    r.check(1000 / avg >= 30, `${name} at 4x throttle averages ≥ 30 fps (${(1000 / avg).toFixed(1)})`)
    await p.context().close()
  }

  r.done()
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })
