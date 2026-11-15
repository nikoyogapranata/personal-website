// Lenis smooth scrolling: on for a mouse, off on touch and under reduced motion (and follows a
// change), stopped behind the intro loader, and every scroll that isn't a wheel (curtain
// navigation, #hash, back/forward, keyboard, focus) lands where it should and stays there even
// when it starts in the middle of a wheel glide.
import { chromium } from 'playwright'
import { BASE_URL, SKIP_LOADER, reporter } from './lib.mjs'

const { check, section, done } = reporter()
const b = await chromium.launch({ channel: 'chrome' })

async function open(ctxOpts = {}, { url = '/', loader = false, wait = 1200, noLenis = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOpts })
  const p = await ctx.newPage()
  if (!loader) await p.addInitScript(SKIP_LOADER)
  // Baseline without Lenis on the same mouse setup: its media query reports no match
  if (noLenis) await p.addInitScript(() => {
    const mm = window.matchMedia.bind(window)
    window.matchMedia = q => /pointer: fine\) and \(prefers-reduced-motion/.test(q) ? { ...mm('(min-width: 99999px)'), media: q, addEventListener() {}, removeEventListener() {} } : mm(q)
  })
  await p.goto(BASE_URL + url)
  await p.waitForTimeout(wait)
  return { ctx, p }
}

const on = p => p.evaluate(() => document.documentElement.classList.contains('lenis'))
const y = p => p.evaluate(() => Math.round(scrollY))
/** scrollY now and again after `ms`: equal when the page has come to rest */
async function rest(p, ms = 1500) {
  const a = await y(p); await p.waitForTimeout(ms); const c = await y(p)
  return { a, c, still: Math.abs(a - c) <= 1 }
}
/** Start a wheel glide over the middle of the page and return before it finishes */
async function glide(p, dy = 1200) {
  await p.mouse.move(720, 450)
  await p.mouse.wheel(0, dy)
  await p.waitForTimeout(120)
}

// ── On with a mouse, eased ─────────────────────────────────────────
section('mouse: eased wheel')
for (const url of ['/', '/about', '/work']) {
  const { ctx, p } = await open({}, { url })
  check(await on(p), `${url}: Lenis on (html.lenis)`)
  const y0 = await y(p)
  await p.mouse.move(720, 450)
  await p.mouse.wheel(0, 600)
  const samples = []
  for (let i = 0; i < 12; i++) { await p.waitForTimeout(50); samples.push(await y(p) - y0) }
  await p.waitForTimeout(2000)
  const r = await rest(p, 500)
  const eased = samples[0] > 0 && samples[0] < 500 && samples.some((v, i) => i && v > samples[i - 1])
  check(eased && Math.abs(r.c - y0 - 600) <= 2 && r.still, `${url}: one 600px wheel eases in (${samples.slice(0, 6).join(', ')}…) and rests at +${r.c - y0}`)
  await ctx.close()
}

// ── Off on touch and under reduced motion ──────────────────────────
section('off: touch, reduced motion')
{
  const { ctx, p } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  check(!(await on(p)), 'phone (touch): Lenis off, scrolling native')
  await ctx.close()
}
{
  const { ctx, p } = await open({ viewport: { width: 1024, height: 1366 }, hasTouch: true, isMobile: true })
  check(!(await on(p)), 'tablet (touch): Lenis off')
  await ctx.close()
}
{
  const { ctx, p } = await open({ reducedMotion: 'reduce' })
  check(!(await on(p)), 'reduced motion: Lenis off')
  const y0 = await y(p)
  await p.mouse.move(720, 450); await p.mouse.wheel(0, 600); await p.waitForTimeout(60)
  check(await y(p) - y0 === 600, `reduced motion: wheel jumps straight to +${await y(p) - y0}`)
  // Live change: turning reduced motion off starts it, on again stops it
  await p.emulateMedia({ reducedMotion: 'no-preference' }); await p.waitForTimeout(100)
  const started = await on(p)
  await p.emulateMedia({ reducedMotion: 'reduce' }); await p.waitForTimeout(100)
  check(started && !(await on(p)), `follows the preference live (on ${started}, then off)`)
  await ctx.close()
}

// ── Intro loader: stopped while it's up ────────────────────────────
section('intro loader')
{
  // Fresh context, so the session's one intro shows
  const { ctx, p } = await open({}, { loader: true, wait: 300 })
  const during = await p.evaluate(() => ({ loader: !!document.documentElement.dataset.loader, stopped: document.documentElement.classList.contains('lenis-stopped') }))
  await p.mouse.move(720, 450); await p.mouse.wheel(0, 800); await p.waitForTimeout(300)
  const yDuring = await y(p)
  await p.waitForFunction(() => !document.documentElement.dataset.loader, null, { timeout: 6000 })
  await p.waitForTimeout(200)
  const after = await p.evaluate(() => document.documentElement.classList.contains('lenis-stopped'))
  check(during.loader && during.stopped && yDuring === 0 && !after, `stopped behind the loader (stopped ${during.stopped}, wheel moved ${yDuring}px), started after (${!after})`)
  await ctx.close()
}

// ── Curtain navigation mid-glide ───────────────────────────────────
section('curtain navigation')
{
  const { ctx, p } = await open()
  await glide(p, 2000)
  await p.click('nav a[href="/about"], header a[href="/about"]').catch(async () => {
    await p.click('button[aria-controls="site-menu"]'); await p.waitForSelector('#site-menu a'); await p.click('#site-menu a:text-is("About")')
  })
  await p.waitForURL('**/about'); await p.waitForTimeout(900)
  const r = await rest(p)
  check(r.c === 0 && r.still && await on(p), `/ → /about while gliding: lands at the top and stays (${r.a} → ${r.c})`)

  // To a #hash on another page: a link added for the test (the site has none yet)
  await glide(p, 1500)
  await p.evaluate(() => { const a = document.createElement('a'); a.href = '/#contact'; a.id = 'hash-test'; a.textContent = 'x'; a.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:8000'; document.body.append(a) })
  await p.click('#hash-test')
  await p.waitForURL('**/#contact'); await p.waitForTimeout(1000)
  const h = await rest(p)
  const top = await p.evaluate(() => Math.round(document.getElementById('contact').getBoundingClientRect().top))
  check(Math.abs(top) <= 2 && h.still, `/about → /#contact while gliding: #contact at the top (${top}px) and stays`)
  await ctx.close()
}

// ── Same-page #hash and back/forward ───────────────────────────────
section('hash and history')
{
  const { ctx, p } = await open()
  await glide(p, 1500)
  await p.evaluate(() => { const a = document.createElement('a'); a.href = '#contact'; a.id = 'hash-test'; a.textContent = 'x'; a.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:8000'; document.body.append(a) })
  await p.click('#hash-test'); await p.waitForTimeout(300)
  const r = await rest(p)
  const top = await p.evaluate(() => Math.round(document.getElementById('contact').getBoundingClientRect().top))
  check(Math.abs(top) <= 2 && r.still, `same-page #contact while gliding: at the top (${top}px), not pulled back`)

  // Back to the top of the page (no hash) by history, mid-glide: the browser's position wins
  await p.goBack(); await p.waitForTimeout(200)
  await glide(p, 600); await p.goForward(); await p.waitForTimeout(600)
  const f = await rest(p)
  const topF = await p.evaluate(() => Math.round(document.getElementById('contact').getBoundingClientRect().top))
  check(Math.abs(topF) <= 2 && f.still, `forward to #contact mid-glide: back at #contact (${topF}px)`)

  // Page to page: leave /work part-way, come back
  await p.goto(BASE_URL + '/work'); await p.waitForTimeout(1200)
  await p.mouse.move(720, 450); await p.mouse.wheel(0, 900); await p.waitForTimeout(1600)
  const left = await y(p)
  await p.click('nav a[href="/contact"]').catch(() => {})
  await p.waitForURL('**/contact'); await p.waitForTimeout(900)
  await glide(p, 800)
  await p.goBack(); await p.waitForTimeout(1500)
  const back = await rest(p)
  check(p.url().endsWith('/work') && Math.abs(back.c - left) <= 5 && back.still, `back to /work mid-glide: restored to ${back.c} (left at ${left})`)
  await ctx.close()
}

// ── Keyboard scrolling with Lenis on ───────────────────────────────
section('keyboard')
{
  const { ctx, p } = await open()
  await p.evaluate(() => document.activeElement?.blur())
  for (const key of ['PageDown', 'ArrowDown', 'Space', 'End', 'Home', 'PageUp']) {
    const before = await y(p)
    await p.keyboard.press(key); await p.waitForTimeout(700)
    const after = await rest(p, 400)
    const ok = key === 'Home' ? after.c === 0 : ['PageUp'].includes(key) ? after.c <= before : after.c > before
    check(ok && after.still, `${key}: ${before} → ${after.c}`)
    if (key === 'End') await p.waitForTimeout(300)
  }
  // Mid-glide: the key's scroll isn't pulled back to the glide
  await p.keyboard.press('Home'); await p.waitForTimeout(600)
  await glide(p, 1500)
  const mid = await y(p)
  await p.keyboard.press('PageDown'); await p.waitForTimeout(900)
  const k = await rest(p)
  check(k.c > mid && k.c < mid + 900 + 50 && k.still, `PageDown mid-glide (at ${mid}): rests at ${k.c}, the glide stopped`)
  await ctx.close()
}

// ── Menu panel scrolls on its own ──────────────────────────────────
section('menu')
{
  const { ctx, p } = await open()
  await p.click('button[aria-controls="site-menu"]'); await p.waitForSelector('#site-menu a'); await p.waitForTimeout(700)
  check(await p.$eval('#site-menu', e => e.hasAttribute('data-lenis-prevent')), 'menu panel has data-lenis-prevent')
  await ctx.close()
}

// ── Frame rate while gliding, 4× CPU ───────────────────────────────
section('frame rate, 4× CPU')
// Lenis turns a few wheel notches into a scroll that changes every frame, as a trackpad does. So
// the baseline is native scrolling with trackpad-like input (many small wheel deltas): Lenis
// mustn't cost more than that. (/work's gallery restyles every card each scroll frame; that cost
// is the gallery's, and trackpad users already pay it.)
async function frames(url, { noLenis, trackpad }) {
  const { ctx, p } = await open({}, { url, noLenis, wait: 2500 })
  const lenisOn = await on(p)
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await p.mouse.move(720, 450)
  const done = p.evaluate(() => new Promise(res => {
    const t = []; const t0 = performance.now()
    const f = now => { t.push(now); if (now - t0 < 2500) requestAnimationFrame(f); else res(t) }
    requestAnimationFrame(f)
  }))
  if (trackpad) for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, 33); await p.waitForTimeout(16) }
  else for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 250); await p.waitForTimeout(150) }
  const t = await done
  await ctx.close()
  const gaps = t.slice(1).map((v, i) => v - t[i])
  return { lenisOn, n: gaps.length, long: gaps.filter(g => g > 50).length, worst: Math.round(Math.max(...gaps)) }
}
for (const url of ['/', '/about', '/work']) {
  const native = await frames(url, { noLenis: true, trackpad: true })
  const lenis = await frames(url, { noLenis: false, trackpad: false })
  check(lenis.lenisOn && !native.lenisOn && lenis.long <= native.long + 3,
    `${url}: Lenis (wheel) ${lenis.n} frames, ${lenis.long} over 50ms (worst ${lenis.worst}ms) · native trackpad ${native.n} frames, ${native.long} over 50ms (worst ${native.worst}ms)`)
}

await b.close()
done()
