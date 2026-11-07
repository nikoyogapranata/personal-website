// Curtain transition checks against the production server. Run with: node tests/e2e/run.mjs (or BASE=… node tests/e2e/transitions.mjs)
import { chromium } from 'playwright'
import path from 'node:path'
import { BASE_URL, artifacts } from './lib.mjs'
const OUT = artifacts('transitions')
const BASE = BASE_URL
const ROUTES = ['/', '/about', '/work', '/contact']
let failures = 0
const check = (ok, msg) => { if (!ok) failures++; console.log(`  ${ok ? 'PASS' : 'FAIL'} ${msg}`) }

// In-page recorder: samples the curtain every frame from the click until it's hidden again
const ARM = () => {
  const el = document.querySelector('.page-curtain')
  const t0 = performance.now()
  const trace = { label: '', visibleFrames: 0, start: null, end: null, maxCover: 0 }
  window.__trace = trace
  const tick = () => {
    const cs = getComputedStyle(el)
    const t = performance.now() - t0
    if (cs.visibility === 'visible') {
      if (trace.start === null) trace.start = t
      trace.visibleFrames++
      const m = new DOMMatrix(cs.transform)
      trace.maxCover = Math.max(trace.maxCover, 1 - Math.abs(m.m42) / innerHeight)
      trace.label = el.textContent
      requestAnimationFrame(tick)
    } else if (trace.start === null && t < 1500) requestAnimationFrame(tick)
    else trace.end = t
  }
  requestAnimationFrame(tick)
}

const settle = async (p) => {
  await p.waitForFunction(() => window.__trace && window.__trace.end !== null, null, { timeout: 6000 }).catch(() => {})
  await p.waitForTimeout(150)
}

const pageState = (p) => p.evaluate(() => {
  const layers = [...document.querySelectorAll('.tone-layer')]
  const top = layers.filter(l => getComputedStyle(l).opacity === '1').map(l => l.style.background)
  const a = document.activeElement
  return {
    path: location.pathname,
    scrollY: Math.round(scrollY),
    fg: document.documentElement.dataset.fg,
    toneLayers: top.join(','),
    focus: a === document.body ? 'body' : `${a.tagName}:${a.textContent.trim().slice(0, 20)}`,
    menuOpen: document.querySelector('button[aria-controls="site-menu"]').getAttribute('aria-expanded'),
    menuInDom: !!document.getElementById('site-menu'),
    curtainVis: getComputedStyle(document.querySelector('.page-curtain')).visibility,
  }
})

async function newPage(b, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  await ctx.addInitScript(() => { try { sessionStorage.setItem('niko_session_loaded', '1') } catch {} })
  return ctx.newPage()
}

// Expected tone at the top of each route, from a fresh load
async function freshTones(b) {
  const p = await newPage(b), out = {}
  for (const r of ROUTES) { await p.goto(BASE + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(300); const s = await pageState(p); out[r] = s.fg + '|' + s.toneLayers }
  await p.context().close()
  return out
}

;(async () => {
  const b = await chromium.launch({ channel: 'chrome' })
  const expectedTone = await freshTones(b)

  // 1. Every route → every other route, via the footer nav (present on all pages), from mid-page
  console.log('=== ALL PAIRS (footer links, from scrolled position)')
  {
    const p = await newPage(b)
    const durations = []
    for (const from of ROUTES) for (const to of ROUTES) {
      if (from === to) continue
      await p.goto(BASE + from, { waitUntil: 'networkidle' })
      const link = p.locator(`footer nav a[href="${to}"]`)
      await link.scrollIntoViewIfNeeded()
      await p.evaluate(ARM)
      await link.click()
      await settle(p)
      const t = await p.evaluate(() => window.__trace)
      const s = await pageState(p)
      durations.push(t.end)
      check(s.path === to && t.visibleFrames > 5 && t.maxCover > 0.99 && s.scrollY === 0 && s.curtainVis === 'hidden'
        && (s.fg + '|' + s.toneLayers) === expectedTone[to],
        `${from} → ${to}: label="${t.label}" ${Math.round(t.end)}ms scrollY=${s.scrollY} tone=${s.fg} (expected ${expectedTone[to].split('|')[0]}) focus=${s.focus}`)
    }
    console.log(`  durations ms: min ${Math.round(Math.min(...durations))}, max ${Math.round(Math.max(...durations))}, avg ${Math.round(durations.reduce((a, c) => a + c) / durations.length)}`)
    await p.context().close()
  }

  // 2. Specific entry points
  console.log('=== ENTRY POINTS')
  {
    const p = await newPage(b)
    const via = async (from, locator, to, prep) => {
      await p.goto(BASE + from, { waitUntil: 'networkidle' })
      if (prep) await prep()
      const l = p.locator(locator).first()
      await l.scrollIntoViewIfNeeded().catch(() => {})
      await p.evaluate(ARM)
      await l.click()
      await settle(p)
      const t = await p.evaluate(() => window.__trace), s = await pageState(p)
      check(s.path === to && t.visibleFrames > 5 && !s.menuInDom && s.scrollY === 0, `${from} ${locator} → ${s.path} label="${t.label}" menuInDom=${s.menuInDom}`)
    }
    await via('/', 'nav a[href="/contact"]', '/contact')
    await via('/', 'a[href="/work"]:has-text("See all projects")', '/work')
    await via('/about', '#contact a[href="/contact"]', '/contact')                       // Get in Touch CTA
    await via('/', 'a[href="/contact"]:has-text("GOT A PROJECT?")', '/contact', async () => {
      // Scroll to where GOT A PROJECT? sits mid-screen
      const y = await p.evaluate(() => { const el = [...document.querySelectorAll('a')].find(a => a.textContent.includes('GOT A PROJECT')); const track = el.closest('div[style*="300vh"]'); return track.getBoundingClientRect().top + scrollY + track.offsetHeight * 0.5 })
      await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1500)
    })
    // Menu open → click item
    for (const [from, item, to] of [['/about', 'Work', '/work'], ['/work', 'Home', '/'], ['/contact', 'About Me', '/about']]) {
      await p.goto(BASE + from, { waitUntil: 'networkidle' })
      await p.click('button[aria-controls="site-menu"]')
      await p.waitForSelector('#site-menu a'); await p.waitForTimeout(700)
      await p.evaluate(ARM)
      await p.click(`#site-menu a:text-is("${item}")`)
      await p.waitForTimeout(380)
      if (from === '/about') await p.screenshot({ path: path.join(OUT, 'curtain-from-menu-mid.png') })
      const midMenu = await p.evaluate(() => !!document.getElementById('site-menu'))
      await settle(p)
      await p.waitForTimeout(400)
      const t = await p.evaluate(() => window.__trace), s = await pageState(p)
      check(s.path === to && t.visibleFrames > 5 && !s.menuInDom && s.menuOpen === 'false', `menu on ${from} → "${item}": path=${s.path} menu still open while covered=${midMenu}, after: open=${s.menuOpen} inDom=${s.menuInDom}`)
    }
    // Menu link to the current page: menu closes, no transition
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.click('button[aria-controls="site-menu"]'); await p.waitForSelector('#site-menu a'); await p.waitForTimeout(700)
    await p.evaluate(ARM)
    await p.click('#site-menu a:text-is("Work")'); await p.waitForTimeout(1000)
    let t = await p.evaluate(() => window.__trace), s = await pageState(p)
    check(s.path === '/work' && t.start === null && s.menuOpen === 'false', `menu "Work" on /work: no curtain=${t.start === null}, menu closed=${s.menuOpen === 'false'}`)
    await p.context().close()
  }

  // 3. Things that must NOT trigger the curtain
  console.log('=== NOT INTERCEPTED')
  {
    const p = await newPage(b)
    const none = async (desc, fn, expectPath) => {
      await p.evaluate(ARM)
      await fn()
      await p.waitForTimeout(900)
      const t = await p.evaluate(() => window.__trace).catch(() => null)
      const s = await pageState(p)
      check(t && t.start === null && s.path === expectPath, `${desc}: curtain=${t && t.start !== null} path=${s.path}`)
    }
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle' })
    await p.evaluate(() => scrollTo(0, 300))
    await none('same page (navbar Contact on /contact)', () => p.click('nav a[href="/contact"]'), '/contact')
    console.log(`    scroll kept: ${await p.evaluate(() => scrollY)}`)
    await none('mailto link', async () => { await p.evaluate(() => document.querySelector('a[href^="mailto:"]').addEventListener('click', e => e.preventDefault(), { once: true })); await p.click('main a[href^="mailto:"]') }, '/contact')
    await none('CV download (target=_blank)', async () => { const [popup] = await Promise.all([p.context().waitForEvent('page'), p.click('main a[href="/cv.pdf"]')]); await popup.close() }, '/contact')
    await none('ctrl+click footer Work', async () => { const [popup] = await Promise.all([p.context().waitForEvent('page'), p.click('footer nav a[href="/work"]', { modifiers: ['Control'] })]); console.log(`    new tab opened: ${popup.url()}`); await popup.close() }, '/contact')
    await none('middle click footer About', async () => { const pr = p.context().waitForEvent('page', { timeout: 3000 }).catch(() => null); await p.click('footer nav a[href="/about"]', { button: 'middle' }); const pop = await pr; if (pop) await pop.close() }, '/contact')
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await none('external project card (target=_blank)', async () => { const [popup] = await Promise.all([p.context().waitForEvent('page'), p.click('main a[target="_blank"]')]); await popup.close() }, '/work')
    await p.context().close()
  }

  // 4. Back / forward + scroll restoration
  console.log('=== BACK / FORWARD')
  {
    const p = await newPage(b)
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    await p.evaluate(() => scrollTo(0, 2600)); await p.waitForTimeout(600)

    // See all projects → /work
    const l = p.locator('a[href="/work"]:has-text("See all projects")')
    await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(400)
    const homeYAtClick = await p.evaluate(() => Math.round(scrollY))
    await p.evaluate(ARM); await l.click(); await settle(p)
    await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(400)
    // /work → /about via footer
    const f = p.locator('footer nav a[href="/about"]'); await f.scrollIntoViewIfNeeded()
    const workYAtClick = await p.evaluate(() => Math.round(scrollY))
    await p.evaluate(ARM); await f.click(); await settle(p)
    let s = await pageState(p)
    check(s.path === '/about' && s.scrollY === 0, `forward chain landed on /about at top (scrollY=${s.scrollY})`)
    await p.goBack(); await p.waitForTimeout(1200); s = await pageState(p)
    check(s.path === '/work' && Math.abs(s.scrollY - workYAtClick) < 5 && s.curtainVis === 'hidden', `back → /work scrollY=${s.scrollY} (left at ${workYAtClick}) tone=${s.fg}`)
    await p.goBack(); await p.waitForTimeout(1500); s = await pageState(p)
    const homeTone = await p.evaluate(() => document.documentElement.dataset.fg)
    check(s.path === '/' && Math.abs(s.scrollY - homeYAtClick) < 5, `back → / scrollY=${s.scrollY} (left at ${homeYAtClick}) tone=${homeTone}`)
    await p.screenshot({ path: path.join(OUT, 'back-to-home.png') })
    await p.goForward(); await p.waitForTimeout(1200); s = await pageState(p)
    check(s.path === '/work', `forward → /work scrollY=${s.scrollY}`)
    await p.goForward(); await p.waitForTimeout(1200); s = await pageState(p)
    check(s.path === '/about', `forward → /about scrollY=${s.scrollY}`)
    // Back pressed while the curtain is covering
    await p.evaluate(ARM); await p.click('nav a[href="/contact"]'); await p.waitForTimeout(120); await p.goBack(); await p.waitForTimeout(2000)
    s = await pageState(p)
    check(s.curtainVis === 'hidden', `back pressed mid-cover: ended on ${s.path}, curtain hidden=${s.curtainVis === 'hidden'}`)
    await p.context().close()
  }

  // 5. Loader overlap: clicking a link while the intro loader is up
  console.log('=== LOADER OVERLAP')
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }) // fresh session → loader shows
    const p = await ctx.newPage()
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    const loaderUp = await p.evaluate(() => document.documentElement.dataset.loader)
    // The loader covers the page, so a pointer can't reach links; the keyboard can.
    // Tab's keydown skips the intro; Enter lands while the loader is still sliding out.
    await p.evaluate(ARM)
    await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab')
    const stillUp = await p.evaluate(() => document.documentElement.dataset.loader ?? 'none')
    await p.keyboard.press('Enter')
    console.log(`    loader at Enter: ${stillUp}`)
    await p.waitForTimeout(1500)
    const t = await p.evaluate(() => window.__trace), s = await pageState(p)
    const loader = await p.evaluate(() => document.documentElement.dataset.loader ?? 'none')
    check(loaderUp && t.start === null && s.path === '/contact' && loader === 'none', `click during loader (${loaderUp}): curtain=${t.start !== null}, path=${s.path}, loader now=${loader}`)
    await ctx.close()
  }

  // 6. Reduced motion
  console.log('=== REDUCED MOTION')
  {
    const p = await newPage(b, { reducedMotion: 'reduce' })
    for (const [from, to] of [['/', '/work'], ['/work', '/about'], ['/about', '/contact'], ['/contact', '/']]) {
      await p.goto(BASE + from, { waitUntil: 'networkidle' })
      const l = p.locator(`footer nav a[href="${to}"]`); await l.scrollIntoViewIfNeeded()
      await p.evaluate(ARM)
      const t0 = Date.now(); await l.click()
      await p.waitForURL(BASE + to); const ms = Date.now() - t0
      await p.waitForTimeout(500)
      const t = await p.evaluate(() => window.__trace).catch(() => ({ start: null })), s = await pageState(p)
      check(t.start === null && s.path === to && s.scrollY === 0, `${from} → ${to}: curtain=${t.start !== null}, url changed in ${ms}ms, scrollY=${s.scrollY}`)
    }
    await p.context().close()
  }

  // 7. Keyboard
  console.log('=== KEYBOARD')
  {
    const p = await newPage(b)
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    for (let i = 0; i < 3; i++) await p.keyboard.press('Tab')
    const f = await p.evaluate(() => document.activeElement.textContent.trim())
    await p.evaluate(ARM); await p.keyboard.press('Enter'); await settle(p)
    let s = await pageState(p)
    const t = await p.evaluate(() => window.__trace)
    await p.keyboard.press('Tab')
    const next = await p.evaluate(() => `${document.activeElement.tagName}:${document.activeElement.textContent.trim().slice(0, 25)}`)
    check(s.path === '/contact' && t.visibleFrames > 5 && s.focus.startsWith('H1'), `Tab×3 ("${f}") + Enter → ${s.path}, curtain ran, focus=${s.focus}, next Tab=${next}`)
    // Footer link via keyboard, from /contact to /work
    await p.focus('footer nav a[href="/work"]')
    await p.evaluate(ARM); await p.keyboard.press('Enter'); await settle(p)
    s = await pageState(p)
    await p.keyboard.press('Tab')
    const next2 = await p.evaluate(() => `${document.activeElement.tagName}:${document.activeElement.textContent.trim().slice(0, 25)}`)
    check(s.path === '/work' && s.focus.startsWith('H1') && s.scrollY === 0, `footer Work + Enter → ${s.path}, focus=${s.focus}, next Tab=${next2}`)
    // Menu via keyboard
    await p.focus('button[aria-controls="site-menu"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(800)
    await p.keyboard.press('Tab') // Home → About Me
    await p.evaluate(ARM); await p.keyboard.press('Enter'); await settle(p); await p.waitForTimeout(300)
    s = await pageState(p)
    check(s.path === '/about' && !s.menuInDom && s.focus.startsWith('H1'), `menu via keyboard → ${s.path}, menu gone=${!s.menuInDom}, focus=${s.focus}`)
    await p.context().close()
  }

  // 8. Widths: one transition each, mid-curtain + landed screenshots
  console.log('=== WIDTHS')
  for (const [w, h] of [[375, 812], [768, 1024], [1440, 900], [2560, 1440]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } })
    await ctx.addInitScript(() => { try { sessionStorage.setItem('niko_session_loaded', '1') } catch {} })
    const p = await ctx.newPage()
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    const l = p.locator('footer nav a[href="/contact"]'); await l.scrollIntoViewIfNeeded()
    await p.evaluate(ARM); await l.click()
    await p.waitForTimeout(400)
    await p.screenshot({ path: path.join(OUT, `curtain-mid-${w}.png`) })
    const labelBox = await p.evaluate(() => { const r = document.querySelector('.page-curtain span').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), innerWidth] })
    await settle(p)
    const s = await pageState(p)
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    check(s.path === '/contact' && labelBox[0] >= 0 && labelBox[1] <= labelBox[2] && overflow <= 0, `${w}px: label x ${labelBox[0]}–${labelBox[1]} of ${labelBox[2]}, landed ${s.path}, h-overflow=${overflow}`)
    await ctx.close()
  }

  console.log(`\n${failures} failure(s)`)
  process.exitCode = failures ? 1 : 0
  await b.close()
})().catch(e => { console.error(e); process.exit(1) })
