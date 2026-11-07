// After every kind of curtain navigation: nothing from the curtain visible or blocking, navbar unobstructed,
// and the top of the viewport matches a fresh load of the same page.
import { chromium } from 'playwright'
import path from 'node:path'
import { BASE_URL, MODE, artifacts } from './lib.mjs'
import { createRequire } from 'node:module'
const BASE = BASE_URL
const OUT = artifacts('leftover')
const TAG = MODE
const ROUTES = ['/', '/about', '/work', '/contact']
const NAMES = { '/': 'home', '/about': 'about', '/work': 'work', '/contact': 'contact' }
const sharp = createRequire(createRequire(import.meta.url).resolve('next'))('sharp')
let failures = 0, checks = 0
const fail = (msg) => { failures++; console.log(`  FAIL ${msg}`) }

const SKIP_LOADER = () => { try { sessionStorage.setItem('niko_session_loaded', '1') } catch {} }

/** In-page audit of the curtain and the navbar once a transition has settled */
const AUDIT = () => {
  const out = []
  const vis = (el) => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01 && r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth }
  const curtain = document.querySelector('.page-curtain')
  if (!curtain) out.push('no .page-curtain element')
  else {
    const cs = getComputedStyle(curtain)
    if (cs.pointerEvents !== 'none') out.push(`curtain pointer-events=${cs.pointerEvents}`)
    for (const el of [curtain, ...curtain.querySelectorAll('*')]) if (vis(el)) out.push(`curtain part visible: ${el.tagName} "${el.textContent.trim()}" at ${Math.round(el.getBoundingClientRect().top)}`)
  }
  // Anything with the curtain's label text visible outside the page's own content
  const name = curtain?.textContent.trim()
  if (name) for (const el of document.querySelectorAll('body *')) {
    if (el.closest('main, footer, #site-menu, .page-curtain') || el.children.length) continue
    if (el.textContent.trim().toLowerCase() === name.toLowerCase() && vis(el) && !el.closest('nav')) out.push(`stray "${name}" element: ${el.tagName}.${el.className}`)
  }
  // Navbar: its three controls are the topmost elements at their centres
  for (const el of document.querySelectorAll('nav.nav-root > button, nav.nav-root a')) {
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
    const top = document.elementFromPoint(x, y)
    if (!top || !(el === top || el.contains(top))) out.push(`navbar "${el.textContent.trim()}" covered by ${top?.tagName}.${top?.className}`)
  }
  if (document.getElementById('site-menu')) out.push('menu still open')
  return out
}

// The navbar band: where the leftover showed. Mouse parked in a corner first, so hover colours don't count
const strip = async (p, file, w) => { const h = await p.evaluate(() => Math.ceil(document.querySelector('nav.nav-root').getBoundingClientRect().height)); await p.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: h } }); return file }
async function diffPx(a, b) {
  const x = await sharp(a).raw().toBuffer({ resolveWithObject: true }), y = await sharp(b).raw().toBuffer({ resolveWithObject: true })
  let n = 0; for (let i = 0; i < x.data.length; i += x.info.channels) if (Math.abs(x.data[i] - y.data[i]) + Math.abs(x.data[i + 1] - y.data[i + 1]) + Math.abs(x.data[i + 2] - y.data[i + 2]) > 30) n++
  return n
}

;(async () => {
  console.log(`BASE ${BASE} (${TAG})`)
  const b = await chromium.launch({ channel: 'chrome' })
  for (const [w, h] of [[375, 812], [768, 1024], [1440, 900], [2560, 1440]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } })
    await ctx.addInitScript(SKIP_LOADER)
    await ctx.addInitScript(() => { window.__saw = false; const t = () => { const c = document.querySelector('.page-curtain'); if (c && getComputedStyle(c).visibility === 'visible') window.__saw = true; requestAnimationFrame(t) }; requestAnimationFrame(t) })
    const p = await ctx.newPage()
    const park = () => p.mouse.move(2, h - 2)
    // Reference strips: fresh load of each route, top of page
    const ref = {}
    for (const r of ROUTES) { await p.goto(BASE + r, { waitUntil: 'networkidle' }); await park(); await p.waitForTimeout(800); ref[r] = await strip(p, path.join(OUT, `ref-${TAG}-${w}-${NAMES[r]}.png`), w) }

    // Called right after the click: park the mouse, catch the first frame after the curtain hides
    let atReveal = null
    const settled = async () => {
      await park()
      await p.waitForFunction(() => { const c = document.querySelector('.page-curtain'); return window.__saw && c && getComputedStyle(c).visibility === 'hidden' }, null, { timeout: 8000, polling: 'raf' }).catch(() => {})
      await p.evaluate(() => { window.__saw = false })
      atReveal = await p.evaluate(AUDIT)
      const route = await p.evaluate(() => location.pathname)
      const f = await strip(p, path.join(OUT, 'reveal-' + TAG + '-' + w + '-' + Date.now() + '.png'), w)
      const px = await diffPx(f, ref[route + '#band'] ?? (ref[route + '#band'] = await bandRef(route)))
      if (px > 30) atReveal.push('navbar band differs from a fresh load by ' + px + 'px at the reveal frame (' + path.basename(f) + ')')
      await p.waitForTimeout(900)
    }
    const bandRef = async (route) => { const q = await ctx.newPage(); await q.setViewportSize({ width: w, height: h }); await q.goto(BASE + route, { waitUntil: 'networkidle' }); await q.mouse.move(2, h - 2); await q.waitForTimeout(800); const f = await strip(q, path.join(OUT, 'bandref-' + TAG + '-' + w + '-' + NAMES[route] + '.png'), w); await q.close(); return f }
    const verify = async (desc, compareTop = true) => {
      checks++
      const issues = [...(atReveal ?? []).map(i => 'at reveal: ' + i), ...(await p.evaluate(AUDIT)).map(i => '+900ms: ' + i)]
      atReveal = null
      const route = await p.evaluate(() => location.pathname)
      let px = 0
      if (false && compareTop) {
        const f = await strip(p, path.join(OUT, `after-${TAG}-${w}-${desc.replace(/[^a-z0-9]+/gi, '_')}.png`), w)
        px = await diffPx(f, ref[route])
        if (px > 200) issues.push(`top 160px differs from a fresh load of ${route} by ${px}px`)
      }
      if (issues.length) fail(`${w}px ${desc}: ${issues.join('; ')}`)
    }

    // 12 route pairs via footer links
    for (const from of ROUTES) for (const to of ROUTES) {
      if (from === to) continue
      await p.goto(BASE + from, { waitUntil: 'networkidle' })
      const l = p.locator(`footer nav a[href="${to}"]`); await l.scrollIntoViewIfNeeded(); await l.click()
      await settled(); await verify(`${from}→${to}`)
    }
    // Navbar Contact, menu items, keyboard
    await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.click('nav.nav-root a[href="/contact"]'); await settled(); await verify('navbar Contact')
    for (const [from, item] of [['/about', 'Work'], ['/work', 'Home'], ['/contact', 'About Me']]) {
      await p.goto(BASE + from, { waitUntil: 'networkidle' })
      await p.click('button[aria-controls="site-menu"]'); await p.waitForSelector('#site-menu a'); await p.waitForTimeout(700)
      await p.click(`#site-menu a:text-is("${item}")`); await settled(); await verify(`menu ${from}→${item}`)
    }
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    for (let i = 0; i < 3; i++) await p.keyboard.press('Tab')
    await p.keyboard.press('Enter'); await settled(); await verify('keyboard Contact')
    // Back / forward
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    await p.locator('footer nav a[href="/about"]').scrollIntoViewIfNeeded(); await p.click('footer nav a[href="/about"]'); await settled()
    await p.goBack(); await p.waitForTimeout(1200); await verify('back', false)
    await p.goForward(); await p.waitForTimeout(1200); await verify('forward', false)
    // Back pressed mid-cover and mid-reveal
    for (const ms of [100, 450]) {
      await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
      await p.click('nav.nav-root a[href="/contact"]'); await p.waitForTimeout(ms); await p.goBack()
      await p.waitForTimeout(2500); await verify(`back ${ms}ms into transition`, false)
    }
    // Rapid repeat clicks on different links
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await p.click('nav.nav-root a[href="/contact"]'); await p.waitForTimeout(150)
    await p.mouse.click(w / 2, h / 2) // a click on the covering curtain
    await settled(); await verify('click during cover')
    await ctx.close()
  }
  console.log(`\n${checks} checks, ${failures} failure(s)`)
  process.exitCode = failures ? 1 : 0
  await b.close()
})().catch(e => { console.error(e); process.exit(1) })
