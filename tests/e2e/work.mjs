// /work: layout at every width, the pinned gallery (centring, tilt, counter, scroll length), each
// filter (chips, URL, back/forward, hard load with ?filter before hydration, mid-gallery reset),
// reduced motion, no JS, keyboard (Tab centres each card), contrast on every card fill, images,
// curtain navigation in and out mid-gallery, the home list, and frame rate at 4x CPU throttling.
// Run: pnpm test:e2e
import { chromium } from 'playwright'
import path from 'node:path'
import { BASE_URL as BASE, MODE, artifacts, SKIP_LOADER, reporter, contrast } from './lib.mjs'

const OUT = artifacts('work')
const r = reporter()
const SIZES = { 375: 812, 768: 1024, 1024: 768, 1440: 900, 2560: 1440 }
/** Keep in sync with STEP_SVH in src/components/work/WorkGallery.tsx */
const STEP = 0.6
const COUNTS = { all: 8, web: 4, ios: 2, cms: 2 }
const shot = (p, name) => p.screenshot({ path: path.join(OUT, `${name}.png`) })

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

/** Gallery geometry and state, read in the page */
const state = p => p.evaluate(() => {
  const pin = document.querySelector('.wg-pin')
  const items = [...document.querySelectorAll('.wg-item')].filter(el => getComputedStyle(el).display !== 'none')
  const cx = innerWidth / 2
  const centred = items.map(el => { const r = el.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - cx) }).map((d, i) => [d, i]).sort((a, b) => a[0] - b[0])[0]
  return {
    url: location.pathname + location.search,
    y: Math.round(scrollY),
    pinTop: Math.round(pin.getBoundingClientRect().top + scrollY),
    pinH: pin.offsetHeight,
    vh: innerHeight,
    sticky: getComputedStyle(document.querySelector('.wg-frame')).position === 'sticky',
    cards: items.filter(el => !el.classList.contains('wg-item--end')).map(el => el.dataset.cat),
    pressed: [...document.querySelectorAll('.wg-chip[aria-pressed="true"]')].map(b => b.dataset.f),
    counter: document.querySelector('.wg-counter')?.textContent.replace(/\s+/g, ' ').trim(),
    hint: document.querySelector('.wg-hint')?.textContent.trim(),
    end: document.querySelector('.wg-end-title')?.textContent.replace(/\s+/g, ' ').trim(),
    centred: centred ? { index: centred[1], off: Math.round(centred[0]) } : null,
    trackOpacity: getComputedStyle(document.querySelector('.wg-track')).opacity,
    bootAttr: document.documentElement.dataset.workFilter ?? null,
  }
})
const scrollToStep = async (p, k, n, wait = 700) => {
  await p.evaluate(({ k, n }) => {
    const pin = document.querySelector('.wg-pin')
    const top = pin.getBoundingClientRect().top + scrollY
    scrollTo(0, top + (pin.offsetHeight - innerHeight) * (k / n))
  }, { k, n })
  await p.waitForTimeout(wait)
}
const near = (a, b, tol = 3) => Math.abs(a - b) <= tol

;(async () => {
  console.log(`BASE ${BASE} (${MODE})`)
  const browser = await chromium.launch({ channel: 'chrome' })

  // ── Every width: overflow, headings, layout mode, CLS, console errors
  r.section('WIDTHS')
  for (const w of [375, 768, 1024, 1440, 2560]) {
    const p = await open(browser, w)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.waitForTimeout(800)
    const h = await p.evaluate(() => [...document.querySelectorAll('h1,h2')].map(h => ({ l: h.tagName, t: h.textContent.replace(/\s+/g, ' ').trim() })))
    const h1 = h.filter(x => x.l === 'H1'), h2 = h.filter(x => x.l === 'H2')
    r.check(h1.length === 1 && /^WORK/.test(h1[0].t), `${w}: one h1 (${h1.map(x => x.t).join(' | ')})`)
    r.check(h2.filter(x => /^(moink|HealthSync|Kelas Kampus|HelloCation\.id|KinetiQ|Wandr|JAMUSARI|WETRACK)$/.test(x.t)).length === 8, `${w}: an h2 per project`)
    const s = await state(p)
    r.check(s.sticky === (w >= 768), `${w}: ${w >= 768 ? 'pinned' : 'list'} layout`)
    if (w >= 768) {
      r.check(near(s.pinH, s.vh + 8 * STEP * s.vh, 2), `${w}: pin is 100svh + 8 × ${STEP * 100}svh (${s.pinH}px)`)
      const first = await p.evaluate(() => {
        const [a, b] = document.querySelectorAll('.wg-item')
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect()
        return { aTop: ra.top, aCx: ra.left + ra.width / 2, bLeft: rb.left, bTilt: getComputedStyle(b.querySelector('.wg-tilt')).transform }
      })
      r.check(first.aTop < innerHeightOf(w) - 120 && near(first.aCx, w / 2, 2), `${w}: first card visible under the header and centred (top ${Math.round(first.aTop)})`)
      r.check(first.bLeft < w && first.bTilt !== 'none', `${w}: second card peeks in tilted from the right (left ${Math.round(first.bLeft)})`)
    }
    let overflow = 0
    const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    for (let y = 0; y <= H; y += Math.round(SIZES[w] * 0.5)) {
      await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60)
      overflow = Math.max(overflow, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    }
    r.check(overflow === 0, `${w}: no horizontal overflow (${overflow}px)`)
    const cls = await p.evaluate(() => window.__cls)
    r.check(cls < 0.01, `${w}: CLS ${cls.toFixed(4)}`)
    r.check(p.__errors.length === 0, `${w}: no console errors ${p.__errors.length ? JSON.stringify(p.__errors.slice(0, 3)) : ''}`)
    await p.context().close()
  }
  function innerHeightOf(w) { return SIZES[w] }

  // ── The pinned track at 1440: each step centres the next card, flat and full size
  r.section('GALLERY (1440)')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.waitForTimeout(800)
    await shot(p, '1440-header')
    let ok = true
    for (let k = 0; k <= 8; k++) {
      await scrollToStep(p, k, 8, 450)
      const s = await state(p)
      const pose = await p.evaluate(i => {
        const el = [...document.querySelectorAll('.wg-item')][i]
        const m = new DOMMatrix(getComputedStyle(el.querySelector('.wg-tilt')).transform)
        return { scale: Math.hypot(m.a, m.b), rot: Math.atan2(m.b, m.a) * 180 / Math.PI }
      }, k)
      const counter = `${String(Math.min(k, 7) + 1).padStart(2, '0')} / 08`
      const good = s.centred.index === k && s.centred.off <= 3 && near(pose.scale, 1, 0.01) && Math.abs(pose.rot) < 0.5 && s.counter === counter
      if (!good) { ok = false; r.info(`step ${k}: ${JSON.stringify({ centred: s.centred, pose, counter: s.counter })}`) }
      if (k === 3) await shot(p, '1440-mid-gallery')
      if (k === 8) await shot(p, '1440-end-card')
    }
    r.check(ok, 'every step centres its card, flat and full size, with the right counter (01…08, then the end card)')
    const side = await p.evaluate(() => {
      const el = document.querySelectorAll('.wg-item')[7]
      const m = new DOMMatrix(getComputedStyle(el.querySelector('.wg-tilt')).transform)
      return { scale: Math.hypot(m.a, m.b), rot: Math.atan2(m.b, m.a) * 180 / Math.PI }
    })
    r.check(near(side.scale, 0.9, 0.01) && side.rot < -3, `neighbour of the centred card is ~0.9 and tilted (${side.scale.toFixed(2)}, ${side.rot.toFixed(1)}°)`)
    const s = await state(p)
    r.check(s.end === 'Yours could be number 09.', `end card: "${s.end}"`)
    // Past the pin, the page carries on to Contact
    await p.evaluate(() => { const pin = document.querySelector('.wg-pin'); scrollTo(0, pin.getBoundingClientRect().top + scrollY + pin.offsetHeight) })
    await p.waitForTimeout(500)
    const contactTop = await p.evaluate(() => document.querySelector('#contact')?.getBoundingClientRect().top)
    r.check(contactTop !== undefined && contactTop < 900, `section unpins into Contact (top ${Math.round(contactTop)})`)
    // Hover: lift + VIEW pill following the cursor
    await scrollToStep(p, 1, 8, 500)
    await p.mouse.move(700, 400); await p.waitForTimeout(150); await p.mouse.move(760, 420); await p.waitForTimeout(500)
    const hover = await p.evaluate(() => {
      const pill = document.querySelector('.wg-pill--follow')
      const card = document.querySelectorAll('.wg-item')[1].querySelector('.wg-card')
      const pr = pill.getBoundingClientRect()
      return { pill: getComputedStyle(pill).opacity, pillCx: pr.left + pr.width / 2, pillCy: pr.top + pr.height / 2, lift: getComputedStyle(card).transform }
    })
    r.check(+hover.pill > 0.9 && near(hover.pillCx, 760, 12) && near(hover.pillCy, 420, 12), `VIEW pill follows the cursor (${Math.round(hover.pillCx)}, ${Math.round(hover.pillCy)})`)
    r.check(/matrix\(1, 0, 0, 1, -4, -4\)/.test(hover.lift), `hovered card lifts up-left (${hover.lift})`)
    r.check(p.__errors.length === 0, `no console errors ${JSON.stringify(p.__errors.slice(0, 3))}`)
    await p.context().close()
  }

  // ── Card text contrast on every fill (solid fills, so computed colours are exact)
  r.section('CONTRAST')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    const pairs = await p.evaluate(() => {
      const rgb = s => s.match(/[\d.]+/g).slice(0, 3).map(Number)
      const out = []
      for (const card of document.querySelectorAll('.wg-card')) {
        const bg = rgb(getComputedStyle(card).backgroundColor)
        for (const el of card.querySelectorAll('.wg-meta, .wg-name, .wg-cat, .wg-desc, .wg-stack, .wg-link, .wg-end-label, .wg-end-title, .wg-end-title em, .wg-end-cv'))
          out.push({ cls: card.className.split(' ').at(-1) + ' ' + el.className, fg: rgb(getComputedStyle(el).color), bg })
      }
      return out
    })
    const bad = pairs.map(x => ({ ...x, ratio: contrast(x.fg, x.bg) })).filter(x => x.ratio < 4.5)
    r.check(pairs.length > 40 && bad.length === 0, `all ${pairs.length} card text colours ≥ 4.5:1 ${bad.map(b => `${b.cls} ${b.ratio.toFixed(2)}`).join('; ')}`)
    const fills = await p.evaluate(() => [...document.querySelectorAll('.wg-card')].map(c => c.className.match(/wg-card--(\w+)/)?.[1] ?? 'end'))
    r.check(fills.at(-2) !== 'ink', `last project card isn't ink beside the ink end card (${fills.join(', ')})`)
    await p.context().close()
  }

  // ── Images: sizes on every screenshot, one preload (the first card)
  r.section('IMAGES')
  {
    const html = await (await fetch(BASE + '/work')).text()
    const preloads = [...html.matchAll(/<link[^>]+rel="preload"[^>]+as="image"[^>]*>/g)].map(m => m[0])
    r.check(preloads.length === 1 && /moink/.test(preloads[0]), `one image preload, the first card (${preloads.length})`)
    const p = await open(browser, 1440)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    const imgs = await p.evaluate(() => [...document.querySelectorAll('.wg-shot img')].map(i => ({ sizes: i.sizes, alt: i.alt })))
    r.check(imgs.length === 6 && imgs.every(i => i.sizes && !/^100vw$/.test(i.sizes) && i.alt), `${imgs.length} screenshots, each with sizes and alt`)
    const ph = await p.evaluate(() => document.querySelectorAll('.wg-placeholder').length)
    r.check(ph === 2, `placeholders for the 2 missing iOS screenshots (${ph})`)
    await p.context().close()
  }

  // ── Filters
  r.section('FILTERS')
  for (const w of [1440, 375]) {
    const p = await open(browser, w)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.waitForTimeout(600)
    for (const f of ['web', 'ios', 'cms']) {
      await p.click(`.wg-chip[data-f="${f}"]`); await p.waitForTimeout(1100)
      const s = await state(p)
      const n = COUNTS[f]
      const ok = s.url === `/work?filter=${f}` && s.cards.length === n && s.cards.every(c => c === f) && s.pressed.join() === f &&
        s.hint === `Showing ${n} of 8` && s.end === `Yours could be number ${String(n + 1).padStart(2, '0')}.` &&
        (w < 768 || (near(s.pinH, s.vh + n * STEP * s.vh, 2) && s.counter === `01 / ${String(n).padStart(2, '0')}`))
      r.check(ok, `${w} ${f}: ${n} cards, URL, chip, hint, end number${w >= 768 ? ', counter, pin length' : ''} ${ok ? '' : JSON.stringify(s)}`)
      if (f === 'ios') await shot(p, `${w}-filtered-ios`)
    }
    // Clear with the active chip's ✕
    await p.click('.wg-chip[data-f="cms"]'); await p.waitForTimeout(1100)
    let s = await state(p)
    r.check(s.url === '/work' && s.cards.length === 8 && s.pressed.join() === 'all', `${w}: pressing the active chip clears the filter (${s.url}, ${s.cards.length})`)
    // Back/forward walk the filters
    await p.goBack(); await p.waitForTimeout(1100); s = await state(p)
    r.check(s.url === '/work?filter=cms' && s.cards.length === 2 && s.pressed.join() === 'cms', `${w}: back → cms (${s.url}, ${s.cards.join()})`)
    await p.goBack(); await p.waitForTimeout(1100); s = await state(p)
    r.check(s.url === '/work?filter=ios' && s.cards.join() === 'ios,ios', `${w}: back → ios (${s.url})`)
    await p.goForward(); await p.waitForTimeout(1100); s = await state(p)
    r.check(s.url === '/work?filter=cms' && s.pressed.join() === 'cms', `${w}: forward → cms (${s.url})`)
    if (w === 375) {
      await p.click('.wg-chip[data-f="ios"]'); await p.waitForTimeout(1100)
      await p.evaluate(() => document.querySelector('.wg-card--ios').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
      await shot(p, '375-ios-card')
    }
    r.check(p.__errors.length === 0, `${w}: no console errors ${JSON.stringify(p.__errors.slice(0, 3))}`)
    await p.context().close()
  }

  // Mid-gallery: the track fades out, the page goes back to the start of the pin, no jump
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await scrollToStep(p, 4, 8, 600)
    await p.evaluate(() => {
      window.__ys = []
      const t = () => { window.__ys.push(scrollY); if (window.__ys.length < 120) requestAnimationFrame(t) }
      requestAnimationFrame(t)
    })
    await p.click('.wg-chip[data-f="ios"]'); await p.waitForTimeout(1400)
    const s = await state(p)
    const ys = await p.evaluate(() => window.__ys)
    const jumps = ys.filter((y, i) => i && y !== ys[i - 1]).length
    r.check(s.y === s.pinTop && s.cards.length === 2 && s.counter === '01 / 02' && s.trackOpacity === '1' && jumps === 1,
      `mid-gallery filter: back to the pin start in one hidden jump, track faded back in (${JSON.stringify({ y: s.y, pinTop: s.pinTop, counter: s.counter, opacity: s.trackOpacity, scrollChanges: jumps })})`)
    await shot(p, '1440-filtered-ios')
    await scrollToStep(p, 1, 2, 600)
    await shot(p, '1440-ios-card')
    await p.context().close()
  }

  // Hard load with ?filter: applied in CSS before hydration (JS chunks held back), kept after
  {
    const p = await open(browser, 1440)
    let release
    const held = new Promise(res => { release = res })
    await p.route(/\/_next\/static\/chunks\/.*\.js/, async route => { await held; route.continue() })
    await p.goto(BASE + '/work?filter=ios', { waitUntil: 'commit' })
    await p.waitForSelector('.wg-item', { state: 'attached' })
    await p.waitForTimeout(400)
    const before = await state(p)
    release()
    await p.waitForLoadState('networkidle'); await p.waitForTimeout(1000)
    const after = await state(p)
    r.check(before.cards.join() === 'ios,ios' && before.pressed.length >= 1 && near(before.pinH, before.vh + 2 * STEP * before.vh, 2),
      `?filter=ios before hydration: 2 cards and the 2-card pin length (${before.cards.join()}, ${before.pinH})`)
    r.check(after.cards.join() === 'ios,ios' && after.pressed.join() === 'ios' && after.bootAttr === null && after.counter === '01 / 02',
      `?filter=ios after hydration: same cards, React owns the filter (${JSON.stringify({ cards: after.cards, pressed: after.pressed, boot: after.bootAttr, counter: after.counter })})`)
    const cls = await p.evaluate(() => window.__cls)
    r.check(cls < 0.01, `?filter=ios load CLS ${cls.toFixed(4)}`)
    await p.context().close()
  }

  // ── Reduced motion: list, no transforms, pill anchored
  r.section('REDUCED MOTION')
  {
    const p = await open(browser, 1440, { reducedMotion: 'reduce' })
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.waitForTimeout(600)
    const s = await state(p)
    const t = await p.evaluate(() => [...document.querySelectorAll('.wg-tilt, .wg-track')].every(el => getComputedStyle(el).transform === 'none'))
    r.check(!s.sticky && t, `list layout, no transforms (${s.sticky}, ${t})`)
    const follow = await p.evaluate(() => !!document.querySelector('.wg-pill--follow'))
    r.check(!follow, 'no cursor-following pill')
    await p.hover('.wg-item:first-child .wg-card'); await p.waitForTimeout(200)
    const anchor = await p.evaluate(() => getComputedStyle(document.querySelector('.wg-item:first-child .wg-pill--anchor')).opacity)
    r.check(anchor === '1', `VIEW pill anchored in the hovered card (${anchor})`)
    await p.click('.wg-chip[data-f="web"]'); await p.waitForTimeout(800)
    const f = await state(p)
    r.check(f.cards.length === 4 && f.url === '/work?filter=web', `filter works (${f.cards.length})`)
    await p.context().close()
  }

  // ── No JS: list, every card and link there, chips hidden
  r.section('NO JS')
  for (const w of [1440, 375]) {
    const p = await open(browser, w, { javaScriptEnabled: false })
    await p.goto(BASE + '/work', { waitUntil: 'load' })
    const s = await p.evaluate(() => ({
      sticky: getComputedStyle(document.querySelector('.wg-frame')).position,
      cards: [...document.querySelectorAll('.wg-item')].filter(el => getComputedStyle(el).display !== 'none').length,
      links: document.querySelectorAll('.wg-link').length,
      chips: getComputedStyle(document.querySelector('.wg-chips')).display,
      transforms: [...document.querySelectorAll('.wg-tilt, .wg-track')].every(el => getComputedStyle(el).transform === 'none'),
      h1: getComputedStyle(document.querySelector('.wh-title').parentElement).opacity,
    }))
    r.check(s.sticky !== 'sticky' && s.cards === 9 && s.links === 6 && s.chips === 'none' && s.transforms && s.h1 === '1', `${w}: ${JSON.stringify(s)}`)
    if (w === 1440) await p.screenshot({ path: path.join(OUT, '1440-nojs-full.png'), fullPage: true })
    await p.context().close()
  }

  // ── Keyboard: Tab through every card; focus centres it
  r.section('KEYBOARD')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.waitForTimeout(800)
    await p.focus('.wg-chip[data-f="cms"]')
    const seen = []
    for (let i = 0; i < 12; i++) {
      await p.keyboard.press('Tab'); await p.waitForTimeout(1000)
      const f = await p.evaluate(() => {
        const a = document.activeElement
        const li = a.closest('.wg-item')
        if (!li) return { out: a.tagName + ' ' + (a.textContent || '').trim().slice(0, 30) }
        const items = [...document.querySelectorAll('.wg-item')]
        const r = li.getBoundingClientRect()
        return { index: items.indexOf(li), off: Math.round(r.left + r.width / 2 - innerWidth / 2), what: a.className || a.tagName }
      })
      if (f.out) break
      seen.push(f)
    }
    const cards = [...new Set(seen.map(s => s.index))]
    r.check(cards.length === 9 && cards.every((c, i) => c === i), `Tab reaches all 8 cards and the end card in order (${cards.join(',')})`)
    const off = seen.filter(s => Math.abs(s.off) > 4)
    r.check(off.length === 0, `each focused card is centred ${off.length ? JSON.stringify(off) : ''}`)
    const noLink = seen.filter(s => /wg-card/.test(s.what)).length
    r.check(noLink === 2, `the 2 cards without a link take focus themselves (${noLink})`)
    await p.context().close()
  }

  // ── Curtain in and out mid-gallery, back/forward, scroll and filter restored
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
      await p.evaluate(() => { window.__curtainSeen = false })
    }
    const where = () => p.evaluate(() => ({ url: location.pathname + location.search, y: Math.round(scrollY), fg: document.documentElement.dataset.fg }))

    // In: /about → menu → /work
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await p.click('button[aria-controls="site-menu"]'); await p.waitForSelector('#site-menu a'); await p.waitForTimeout(700)
    await p.click('#site-menu a:text-is("Work")'); await settle()
    let s = await where()
    r.check(s.url === '/work' && s.y === 0 && s.fg === 'light', `/about → menu → /work: top, cream (${JSON.stringify(s)})`)

    // Out mid-gallery through the end card's "Start a project", then back
    await p.click('.wg-chip[data-f="web"]'); await p.waitForTimeout(1100)
    await scrollToStep(p, 4, 4, 800)
    const left = await state(p)
    await p.click('.wg-end-cta'); await settle()
    s = await where()
    r.check(s.url === '/contact' && s.y === 0, `end card → /contact through the curtain (${JSON.stringify(s)})`)
    await p.goBack(); await p.waitForTimeout(1800)
    let g = await state(p)
    r.check(g.url === '/work?filter=web' && g.cards.length === 4 && near(g.y, left.y, 4) && g.centred.index === 4,
      `back → /work?filter=web restores the filter and the scroll (${g.y}, left at ${left.y}), end card centred`)
    await p.goForward(); await p.waitForTimeout(1500)
    s = await where()
    r.check(s.url === '/contact', `forward → ${s.url}`)
    await p.goBack(); await p.waitForTimeout(1800)

    // Out mid-gallery through the navbar, then back
    await scrollToStep(p, 2, 4, 800)
    const left2 = await state(p)
    await p.click('nav.nav-root a[href="/contact"]'); await settle()
    await p.goBack(); await p.waitForTimeout(1800)
    g = await state(p)
    r.check(near(g.y, left2.y, 4) && g.counter === left2.counter && g.cards.length === 4, `navbar out and back mid-gallery: ${g.counter} at ${g.y} (left ${left2.counter} at ${left2.y})`)

    // Client navigation to a filtered URL goes through the curtain and opens filtered
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle' })
    await p.evaluate(() => { const a = document.createElement('a'); a.href = '/work?filter=cms'; a.id = 'tlink'; a.textContent = 'x'; document.body.append(a) })
    await p.click('#tlink'); await settle()
    g = await state(p)
    r.check(g.url === '/work?filter=cms' && g.cards.join() === 'cms,cms' && g.y === 0 && g.bootAttr === null, `curtain into /work?filter=cms opens filtered (${g.cards.join()})`)
    r.check(p.__errors.length === 0, `no console errors ${JSON.stringify(p.__errors.slice(0, 3))}`)
    await p.context().close()
  }

  // ── Home list uses the featured flag
  r.section('HOME')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    const home = await p.evaluate(() => ({
      rows: [...document.querySelectorAll('.work-row')].map(a => a.textContent.replace(/\s+/g, ' ').trim()),
      all: [...document.querySelectorAll('a[href="/work"]')].map(a => a.textContent.replace(/\s+/g, ' ').trim()),
    }))
    const names = ['moink', 'HealthSync', 'Kelas Kampus', 'HelloCation.id', 'JAMUSARI']
    r.check(home.rows.length === 5 && names.every((n, i) => home.rows[i].includes(n)), `5 featured rows (${home.rows.map(x => x.slice(0, 18)).join(' | ')})`)
    r.check(home.all.some(t => t === 'See all 8 projects'), `"See all 8 projects" link (${home.all.join(' | ')})`)
    await p.context().close()
  }

  // ── Frame rate at 4x CPU throttling, scrolling the whole gallery
  r.section('PERFORMANCE (4x CPU throttle)')
  {
    const p = await open(browser, 1440)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    const t = await state(p)
    await p.evaluate(y => scrollTo(0, y), t.pinTop); await p.waitForTimeout(600)
    const cdp = await p.context().newCDPSession(p)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await p.evaluate(() => {
      window.__frames = []
      let last = performance.now()
      const tick = now => { window.__frames.push(now - last); last = now; if (!window.__stopFrames) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    })
    await p.mouse.move(720, 450)
    const steps = Math.ceil((t.pinH - t.vh) / 100)
    const t0 = Date.now()
    for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(16) }
    const ms = Date.now() - t0
    const f = await p.evaluate(() => { window.__stopFrames = true; return window.__frames.slice(2) })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    const sorted = [...f].sort((a, b) => a - b)
    const avg = f.reduce((a, b) => a + b, 0) / f.length
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    r.info(`gallery: ${f.length} frames in ${ms}ms → ${(1000 / avg).toFixed(1)} fps average, p95 frame ${p95.toFixed(1)}ms, ${f.filter(x => x > 50).length} frames over 50ms`)
    r.check(1000 / avg >= 30, `gallery at 4x throttle averages ≥ 30 fps (${(1000 / avg).toFixed(1)})`)
    await p.context().close()
  }

  // ── Remaining screenshots at 375
  {
    const p = await open(browser, 375)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.waitForTimeout(600)
    await shot(p, '375-header')
    await p.evaluate(() => document.querySelectorAll('.wg-item')[2].scrollIntoView({ block: 'center' })); await p.waitForTimeout(500)
    await shot(p, '375-mid-gallery')
    await p.evaluate(() => document.querySelector('.wg-item--end').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500)
    await shot(p, '375-end-card')
    await p.click('.wg-chip[data-f="cms"]').catch(() => {})
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1000)
    await shot(p, '375-filtered-cms')
    await p.context().close()
  }

  r.done()
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })
