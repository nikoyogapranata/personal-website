// Home page Work list: the cream fill + description marquee on hover and keyboard focus.
// Sizes, slide direction, row height, overflow, reduced motion, touch, a11y, contrast and frame rate.
import { chromium } from 'playwright'
import path from 'node:path'
import zlib from 'node:zlib'
import { BASE_URL, SKIP_LOADER, artifacts, contrast, reporter } from './lib.mjs'

const OUT = artifacts('home-work')
const { check, section, done } = reporter()
const b = await chromium.launch({ channel: 'chrome' })

const SIZES = [[1024, 768], [1440, 900], [2560, 1440]]

async function open(ctxOpts = {}) {
  const ctx = await b.newContext(ctxOpts)
  const p = await ctx.newPage()
  await p.addInitScript(SKIP_LOADER)
  await p.goto(BASE_URL + '/')
  await p.waitForSelector('.work-row')
  return { ctx, p }
}

/** Row geometry, fill offset (px, + is below) and marquee state */
const state = (p, i) => p.evaluate(i => {
  const r = document.querySelectorAll('.work-row')[i]
  const fill = r.querySelector('.work-row__fill'), track = r.querySelector('.work-row__track')
  const box = r.getBoundingClientRect()
  return {
    top: box.top, bottom: box.bottom, left: box.left, width: box.width, h: r.offsetHeight,
    active: r.hasAttribute('data-active'),
    fillY: new DOMMatrix(getComputedStyle(fill).transform).m42,
    trackX: track ? new DOMMatrix(getComputedStyle(track).transform).m41 : null,
    play: track ? getComputedStyle(track).animationPlayState : null,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }
}, i)

/** RGB of one screen pixel (a 1×1 PNG: filter byte, then RGB or RGBA) */
async function pixel(p, x, y) {
  const png = await p.screenshot({ clip: { x, y, width: 1, height: 1 } })
  const chunks = []
  for (let o = 8; o < png.length;) {
    const len = png.readUInt32BE(o), type = png.toString('ascii', o + 4, o + 8)
    if (type === 'IDAT') chunks.push(png.subarray(o + 8, o + 8 + len))
    o += 12 + len
  }
  return [...zlib.inflateSync(Buffer.concat(chunks)).subarray(1, 4)]
}

const heights = p => p.evaluate(() => [...document.querySelectorAll('.work-row')].map(r => r.offsetHeight))

async function centre(p, i) {
  await p.evaluate(i => document.querySelectorAll('.work-row')[i].scrollIntoView({ block: 'center' }), i)
  await p.waitForTimeout(900)
}

// ── Hover, every row, from both edges, at three widths ─────────────
for (const [w, h] of SIZES) {
  section(`hover ${w}×${h}`)
  const { ctx, p } = await open({ viewport: { width: w, height: h } })
  await centre(p, 0)
  const n = await p.evaluate(() => document.querySelectorAll('.work-row').length)
  check(n === 5, `${n} rows`)
  const h0 = await heights(p)

  for (let i = 0; i < n; i++) {
    await centre(p, i)
    let s = await state(p, i)
    const x = s.left + s.width / 2

    // Enter through the top edge
    await p.mouse.move(x, s.top - 2)
    await p.mouse.move(x, s.top + 3)
    await p.waitForTimeout(60)
    const mid = await state(p, i)
    check(mid.active && mid.fillY < -1, `row ${i} enters from top (fill y ${mid.fillY.toFixed(0)} mid-slide)`)
    await p.waitForTimeout(800)
    s = await state(p, i)
    const x0 = s.trackX
    await p.waitForTimeout(300)
    const s2 = await state(p, i)
    check(Math.abs(s.fillY) < 0.5 && s.play === 'running' && s2.trackX < x0,
      `row ${i} filled, marquee running (moved ${(x0 - s2.trackX).toFixed(1)}px in 300ms)`)
    const covered = await p.evaluate(i => {
      // The fill has pointer-events: none, so test geometry and paint order instead of hit-testing
      const r = document.querySelectorAll('.work-row')[i], fill = r.querySelector('.work-row__fill')
      const f = fill.getBoundingClientRect(), cs = getComputedStyle(fill)
      return ['.work-row__num', '.work-row__title', '.work-row__cat'].every(sel => {
        const t = r.querySelector(sel).getBoundingClientRect()
        return t.top >= f.top - 0.5 && t.bottom <= f.bottom + 0.5 && t.left >= f.left && t.right <= f.right
      }) && cs.position === 'absolute' && Number(cs.zIndex) >= 1 && cs.backgroundColor === 'rgb(248, 248, 245)'
    }, i)
    check(covered, `row ${i} content hidden under the fill`)
    // One tagline (plus separator) passes in 6–8s: the loop is one half of the track, `copies` items long
    const pass = await p.evaluate(i => {
      const r = document.querySelectorAll('.work-row')[i], half = r.querySelector('.work-row__half')
      return parseFloat(getComputedStyle(r.querySelector('.work-row__track')).animationDuration) / half.children.length
    }, i)
    check(pass >= 6 && pass <= 8, `row ${i} one tagline pass takes ${pass.toFixed(1)}s`)
    if (i === 0 && w === 1440) await p.screenshot({ path: path.join(OUT, `hover-${w}.png`) })

    // Leave through the top edge: it slides back up
    await p.mouse.move(x, s.top - 2)
    await p.waitForTimeout(800)
    s = await state(p, i)
    check(!s.active && s.fillY < -0.95 * s.h && s.play === 'paused', `row ${i} leaves upward and pauses (fill y ${s.fillY.toFixed(0)})`)

    // Enter through the bottom edge, leave through it
    await p.mouse.move(x, s.bottom + 2)
    await p.mouse.move(x, s.bottom - 3)
    await p.waitForTimeout(60)
    const midB = await state(p, i)
    check(midB.active && midB.fillY > 1, `row ${i} enters from bottom (fill y ${midB.fillY.toFixed(0)} mid-slide)`)
    await p.waitForTimeout(800)
    await p.mouse.move(x, s.bottom + 2)
    await p.waitForTimeout(800)
    s = await state(p, i)
    check(!s.active && s.fillY > 0.95 * s.h, `row ${i} leaves downward (fill y ${s.fillY.toFixed(0)})`)
    check(!s.overflow, `row ${i} no horizontal overflow`)
  }
  check(JSON.stringify(await heights(p)) === JSON.stringify(h0), `row heights unchanged ${JSON.stringify(h0)}`)

  // ── Keyboard: Tab through the rows ──
  await p.mouse.move(1, 1)
  await p.evaluate(() => { window.scrollTo(0, 0); document.activeElement?.blur() })
  let hits = 0
  for (let k = 0; k < 80 && hits < n; k++) {
    await p.keyboard.press('Tab')
    const idx = await p.evaluate(() => [...document.querySelectorAll('.work-row')].indexOf(document.activeElement))
    if (idx < 0) continue
    const op = await p.evaluate(() => getComputedStyle(document.activeElement).opacity)
    await p.waitForTimeout(800)
    const s = await state(p, idx)
    const prev = idx > 0 ? await state(p, idx - 1) : null
    check(op === '1' && s.active && Math.abs(s.fillY) < 0.5 && s.play === 'running' && (!prev || (!prev.active && prev.play === 'paused')),
      `Tab → row ${idx}: shown at once (opacity ${op}), filled, previous row reversed`)
    check(!s.overflow, `Tab → row ${idx}: no overflow`)
    // The ring sits 4–6px inside the row, over the cream fill
    const ring = await pixel(p, Math.round(s.left + 5), Math.round((s.top + s.bottom) / 2))
    const cream = await pixel(p, Math.round(s.left + 12), Math.round(s.top + 12))
    check(ring.every(c => c < 40) && cream.every(c => c > 230), `Tab → row ${idx}: ink focus ring on cream (ring ${ring}, fill ${cream})`)
    hits++
  }
  check(hits === n, `focused all ${n} rows by keyboard`)
  await p.keyboard.press('Tab')
  await p.waitForTimeout(800)
  const last = await state(p, n - 1)
  check(!last.active && last.fillY > 0.95 * last.h, 'blur reverses the last row')
  check(JSON.stringify(await heights(p)) === JSON.stringify(h0), 'row heights unchanged after keyboard pass')
  await ctx.close()
}

// ── Accessibility and contrast ────────────────────────────────────
section('a11y + contrast')
{
  const { ctx, p } = await open({ viewport: { width: 1440, height: 900 } })
  const a = await p.evaluate(() => [...document.querySelectorAll('.work-row')].map(r => {
    const d = document.getElementById(r.getAttribute('aria-describedby'))
    const fill = r.querySelector('.work-row__fill')
    const fs = getComputedStyle(fill)
    return {
      desc: d?.textContent.length ?? 0, descHidden: d?.hidden,
      fillHidden: fill.getAttribute('aria-hidden'),
      // What a screen reader gets as the link text: hidden elements and the aria-hidden fill drop out
      name: r.innerText.replace(/\s+/g, ' ').trim(),
      fg: fs.color, bg: fs.backgroundColor,
    }
  }))
  const rgb = s => s.match(/\d+/g).slice(0, 3).map(Number)
  for (const [i, r] of a.entries()) {
    check(r.desc > 20 && r.desc <= 60 && r.descHidden && r.fillHidden === 'true', `row ${i}: tagline via aria-describedby (${r.desc} chars), copies aria-hidden`)
    const tree = await p.locator('.work-row').nth(i).ariaSnapshot()
    check(tree.split('\n').length <= 3 && !/·/.test(tree), `row ${i}: accessible link "${tree.replace(/\s+/g, ' ').slice(0, 60)}"`)
    const c = contrast(rgb(r.fg), rgb(r.bg))
    check(c >= 7, `row ${i}: ink on cream ${c.toFixed(1)}:1 (${r.fg} on ${r.bg})`)
  }
  await ctx.close()
}

// ── Reduced motion ────────────────────────────────────────────────
section('reduced motion')
{
  const { ctx, p } = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  for (let i = 0; i < 5; i++) {
    await centre(p, i)
    let s = await state(p, i)
    const x = s.left + s.width / 2
    await p.mouse.move(x, s.top - 2)
    await p.mouse.move(x, s.top + 3)
    await p.waitForTimeout(30)
    s = await state(p, i)
    const st = await p.evaluate(i => {
      const r = document.querySelectorAll('.work-row')[i], el = r.querySelector('.work-row__static')
      if (!el) return null
      const lineH = parseFloat(getComputedStyle(el).lineHeight)
      const one = () => el.offsetHeight <= lineH * 1.5 && el.offsetHeight <= r.offsetHeight
      const res = { ell: getComputedStyle(el).textOverflow, fits: one(), track: !!r.querySelector('.work-row__track') }
      // A line too long for the row (the description fallback) is cut, still on one line
      const text = el.textContent
      el.textContent = text + ' ' + text + ' ' + text
      res.longCut = el.scrollWidth > el.clientWidth && one()
      el.textContent = text
      return res
    }, i)
    check(s.active && Math.abs(s.fillY) < 0.5 && st && !st.track && st.ell === 'ellipsis' && st.fits && st.longCut,
      `row ${i}: fill at once, static one line; a long line is cut with an ellipsis`)
    if (i === 0) await p.screenshot({ path: path.join(OUT, 'reduced.png') })
    await p.mouse.move(x, s.top - 2)
    await p.waitForTimeout(30)
    s = await state(p, i)
    check(!s.active && s.fillY > 0.95 * s.h, `row ${i}: gone at once on leave`)
  }
  await ctx.close()
}

// ── Hero cards stay gone below the hero ───────────────────────────
// The fixed hero (I'M NIKO YOGA cards) fades out over its scroll driver. Framer runs that fade as
// a native scroll-timeline animation; with keyframes only mid-range the browser filled the end with
// the inline opacity, so the hero came back and, under reduced motion (cards not flown off), showed
// through the transparent sections over the Work list.
section('hero gone below the hero')
for (const reducedMotion of ['reduce', 'no-preference']) {
  const { ctx, p } = await open({ viewport: { width: 1440, height: 900 }, reducedMotion })
  const heroOp = () => p.evaluate(() => Number(getComputedStyle(document.querySelector('main > div:first-child section')).opacity))
  for (const [label, sel] of [['about', '#about, [data-tone] h2'], ['work title', '#work'], ['work list', '.work-row'], ['last row', '.work-row:last-of-type'], ['contact', '#contact']]) {
    await p.evaluate(sel => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), sel)
    await p.waitForTimeout(500)
    const op = await heroOp()
    check(op === 0, `${reducedMotion}: hero opacity ${op} at ${label}`)
  }
  // And it returns at the top
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(500)
  check(await heroOp() === 1, `${reducedMotion}: hero back at the top`)
  await ctx.close()
}

// ── Touch ─────────────────────────────────────────────────────────
section('touch')
{
  const { ctx, p } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  check(await p.evaluate(() => matchMedia('(hover: none), (pointer: coarse)').matches), 'touch emulation reports no hover')
  for (let i = 0; i < 5; i++) {
    await centre(p, i)
    const s = await state(p, i)
    const popup = ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null)
    await p.touchscreen.tap(s.left + s.width / 2, s.top + s.h / 2)
    const pg = await popup
    await p.waitForTimeout(700)
    const after = await state(p, i)
    check(!!pg && !after.active && after.fillY > 0.95 * after.h, `row ${i}: tap opens a tab, no fill (active ${after.active}, fill y ${after.fillY.toFixed(0)}/${after.h})`)
    await pg?.close()
  }
  await ctx.close()
}

// ── Frame rate while hovering, 4× CPU throttling ──────────────────
section('frame rate, 4× CPU')
{
  const { ctx, p } = await open({ viewport: { width: 1440, height: 900 } })
  await centre(p, 0)
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const s = await state(p, 0)
  await p.mouse.move(s.left + s.width / 2, s.top - 2)
  const fps = p.evaluate(() => new Promise(res => {
    const t = []; const t0 = performance.now()
    const f = now => { t.push(now); if (now - t0 < 3000) requestAnimationFrame(f); else res(t) }
    requestAnimationFrame(f)
  }))
  await p.mouse.move(s.left + s.width / 2, s.top + 3)
  const t = await fps
  const gaps = t.slice(1).map((v, i) => v - t[i])
  const rate = (gaps.length / ((t.at(-1) - t[0]) / 1000))
  const long = gaps.filter(g => g > 34).length
  check(rate >= 50 && long <= 3, `${rate.toFixed(1)} fps over 3s while sliding in and scrolling, ${long} frame(s) over 34ms, worst ${Math.max(...gaps).toFixed(1)}ms`)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  await ctx.close()
}

await b.close()
done()
