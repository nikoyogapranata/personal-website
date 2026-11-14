// Keyboard focus never lands on something you can't see. Strict for: the shared Contact section
// (every page that has it), the home Work rows, and "GOT A PROJECT?" (which must also stay put
// while focused). Every other Tab stop is reported. Run: pnpm test:e2e -- keyboard
import { chromium } from 'playwright'
import { BASE_URL as BASE, MODE, SKIP_LOADER, reporter } from './lib.mjs'

const r = reporter()
const PAGES = ['/', '/about', '/work', '/contact']

/** Is the focused element actually visible right now? (opacity up the tree, reveal offsets, on screen) */
const FOCUS_STATE = () => {
  const a = document.activeElement
  if (!a || a === document.body) return null
  let minOpacity = 1, moved = false
  for (let e = a; e && e !== document.body; e = e.parentElement) {
    const cs = getComputedStyle(e)
    minOpacity = Math.min(minOpacity, +cs.opacity)
    // Reveals start 24px off or at 0.9 scale; small focus nudges (6px) are fine
    if (cs.transform !== 'none') { const m = new DOMMatrix(cs.transform); if (Math.abs(m.m42) > 10 || Math.abs(m.a - 1) > 0.02) moved = true }
  }
  const b = a.getBoundingClientRect()
  const kind = a.closest('#contact') ? 'contact' : a.closest('.work-row') ? 'work' : /GOT A PROJECT/.test(a.textContent) ? 'got' : 'other'
  // GOT A PROJECT? is wider than the screen, so part of it is almost always on screen: require its
  // start ("GOT") to be visible, not just some part of it
  const onScreen = kind === 'got'
    ? b.left >= 0 && b.left < innerWidth * 0.5 && b.top < innerHeight - 10 && b.bottom > 10
    : b.left < innerWidth - 20 && b.right > 20 && b.top < innerHeight - 10 && b.bottom > 10
  return { label: (a.getAttribute('aria-label') || a.textContent).trim().replace(/\s+/g, ' ').slice(0, 30), kind, minOpacity, moved, onScreen, left: Math.round(b.left) }
}
const ok = s => s.minOpacity >= 0.999 && !s.moved && s.onScreen
const why = s => `${s.label} (opacity ${s.minOpacity.toFixed(2)}${s.moved ? ', mid-reveal' : ''}${s.onScreen ? '' : `, off-screen at x=${s.left}`})`
const twoFrames = p => p.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res))))

async function tabThrough(p) {
  const stops = []
  for (let i = 0; i < 70; i++) {
    await p.keyboard.press('Tab')
    // Two frames: enough for a focus handler to act, far short of a 0.6–0.9s reveal
    await twoFrames(p)
    const s = await p.evaluate(FOCUS_STATE)
    if (!s) continue
    stops.push(s)
    if (await p.evaluate(() => !!document.activeElement.closest('footer'))) break
  }
  return stops
}

;(async () => {
  console.log(`BASE ${BASE} (${MODE})`)
  const browser = await chromium.launch({ channel: 'chrome' })

  for (const [w, h, rm] of [[1440, 900, false], [375, 812, false], [1440, 900, true]]) {
    const tag = `${w}px${rm ? ' reduced motion' : ''}`
    for (const route of PAGES) {
      if (rm && route === '/contact') continue // no shared Contact section there
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: rm ? 'reduce' : 'no-preference' })
      await ctx.addInitScript(SKIP_LOADER)
      const p = await ctx.newPage()
      await p.goto(BASE + route, { waitUntil: 'networkidle' })
      await p.waitForTimeout(1500) // on-load reveals (e.g. the /work grid) finish first
      const stops = await tabThrough(p)
      const of = k => stops.filter(s => s.kind === k)

      if (route !== '/contact') {
        const c = of('contact')
        r.check(c.length >= 5 && c.every(ok), `${tag} ${route}: ${c.length} Contact links shown on focus${c.every(ok) ? '' : ' — NOT: ' + c.filter(s => !ok(s)).map(why).join(', ')}`)
      }
      if (route === '/') {
        const wr = of('work'), got = of('got')
        r.check(wr.length === 5 && wr.every(ok), `${tag} /: ${wr.length} Work rows shown on focus${wr.every(ok) ? '' : ' — NOT: ' + wr.filter(s => !ok(s)).map(why).join(', ')}`)
        r.check(got.length === 1 && got.every(ok), `${tag} /: GOT A PROJECT? on screen and visible on focus${got.every(ok) ? ` (x=${got[0]?.left})` : ' — NOT: ' + got.filter(s => !ok(s)).map(why).join(', ')}`)
      }
      const others = of('other').filter(s => !ok(s))
      if (others.length) r.info(`${tag} ${route}, other stops not shown on focus (not covered by this fix): ${others.map(why).join(', ')}`)
      await ctx.close()
    }
  }

  // GOT A PROJECT? stays put while focused: scroll with it focused, then release on blur
  for (const rm of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: rm ? 'reduce' : 'no-preference' })
    await ctx.addInitScript(SKIP_LOADER)
    const p = await ctx.newPage()
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    await p.waitForTimeout(800)
    let s = null
    for (let i = 0; i < 40 && !(s && s.kind === 'got'); i++) { await p.keyboard.press('Tab'); await twoFrames(p); s = await p.evaluate(FOCUS_STATE) }
    const atFocus = s
    await p.mouse.move(720, 450)
    for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, -150); await p.waitForTimeout(60) } // scroll back up while focused
    await p.waitForTimeout(600)
    const held = await p.evaluate(FOCUS_STATE)
    r.check(atFocus?.kind === 'got' && ok(atFocus) && held?.kind === 'got' && ok(held),
      `1440px${rm ? ' reduced motion' : ''}: GOT A PROJECT? held on screen while focused and scrolled 600px up (x ${atFocus?.left} → ${held?.left})${ok(atFocus ?? {}) && ok(held ?? {}) ? "" : ` — at focus: ${atFocus ? why(atFocus) : "never focused"}; after scroll: ${held ? why(held) + " [" + held.kind + "]" : "-"}`}`)
    await p.keyboard.press('Tab'); await p.waitForTimeout(800)
    const released = await p.evaluate(() => { const a = [...document.querySelectorAll('a')].find(x => /GOT A PROJECT/.test(x.textContent)); return Math.round(a.getBoundingClientRect().left) })
    r.info(`after Tab away: GOT A PROJECT? back under scroll control at x=${released}`)
    await ctx.close()
  }

  r.done()
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })
