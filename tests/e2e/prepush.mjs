// Three pre-push checks. Run with: node tests/e2e/run.mjs (or BASE=… node tests/e2e/prepush.mjs)
import { chromium } from 'playwright'
import { BASE_URL, MODE } from './lib.mjs'
const BASE = BASE_URL
const DEV = MODE === 'dev'
let failures = 0
const check = (ok, msg) => { if (!ok) failures++; console.log(`  ${ok ? 'PASS' : 'FAIL'} ${msg}`) }
const SKIP_LOADER = () => { try { sessionStorage.setItem('niko_session_loaded', '1') } catch {} }

;(async () => {
  console.log(`BASE ${BASE}${DEV ? ' (dev)' : ' (production)'}`)
  const b = await chromium.launch({ channel: 'chrome' })

  // ── 1. Late intro is never interrupted by the boot-script backup timer (fires at 4.5s)
  console.log('=== 1. LATE INTRO vs BACKUP TIMER')
  for (const delay of [3000, 2000, 2300]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
    // Per-frame trace of the loader from navigation start
    await ctx.addInitScript(() => {
      const trace = window.__lt = []
      const tick = () => {
        const el = document.querySelector('.loading-screen')
        if (el) {
          const cs = getComputedStyle(el)
          trace.push({ t: Math.round(performance.now()), attr: document.documentElement.dataset.loader ?? 'none', vis: cs.visibility, disp: cs.display, y: Math.round(new DOMMatrix(cs.transform).m42), n: document.querySelector('.ls-number')?.textContent ?? '' })
        }
        if (performance.now() < 9000) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    const p = await ctx.newPage()
    await p.route(/\/_next\/static\/chunks\/.*\.js(\?.*)?$/, async r => { await new Promise(res => setTimeout(res, delay)); r.continue().catch(() => {}) })
    p.goto(BASE + '/').catch(() => {})
    await p.waitForTimeout(9500)
    const tr = await p.evaluate(() => window.__lt)
    const runStart = tr.find(f => f.attr === 'running')
    const counts = tr.filter(f => f.attr === 'running' && f.n !== '').map(f => Number(f.n))
    const maxCount = counts.length ? Math.max(...counts) : null
    // Interrupted = hidden while still running (CSS failsafe/watchdog) or attribute dropped before the slide finished
    const hiddenWhileRunning = tr.find(f => f.attr === 'running' && f.vis === 'hidden')
    const lastRunning = [...tr].reverse().find(f => f.attr === 'running')
    const removedAt = tr.find((f, i) => i > 0 && tr[i - 1].attr === 'running' && f.attr === 'none')
    const slidOut = lastRunning && lastRunning.y <= -0.9 * 900
    const spanned45 = runStart && removedAt && runStart.t < 4500 && removedAt.t > 4500
    check(runStart && !hiddenWhileRunning && slidOut && removedAt,
      `JS delayed ${delay}ms: running at ${runStart?.t}ms, count reached ${maxCount ?? '(skipped: late start)'}, ` +
      `slid fully out (last y=${lastRunning?.y}) and released at ${removedAt?.t}ms; spans the 4.5s backup timer=${!!spanned45}; hidden mid-run=${!!hiddenWhileRunning}`)
    await ctx.close()
  }

  // ── 2. Hover prefetching with the global click listener in place
  console.log('=== 2. HOVER PREFETCH')
  if (DEV) {
    console.log('  SKIP next dev never prefetches (Next only prefetches in production)')
  } else {
    // Next 16: a <Link> is queued for prefetch when it becomes visible; hovering it raises that
    // task to "intent" priority (onNavigationIntent). Prefetch responses are held for 2.5s here so
    // the queue backs up, which makes the hover's effect observable as request order.
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript(SKIP_LOADER)
    const p = await ctx.newPage()
    const rsc = []
    let hold = false
    await p.route(/[?&]_rsc=/, async r => { if (hold) await new Promise(res => setTimeout(res, 2500)); r.continue().catch(() => {}) })
    p.on('request', r => { if (r.url().includes('_rsc=')) rsc.push({ path: new URL(r.url()).pathname, t: Date.now() }) })
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await p.waitForTimeout(1500)
    console.log(`    on load: ${rsc.length} prefetch request(s) for ${[...new Set(rsc.map(r => r.path))].join(', ')} (visible links)`)

    // Scroll the footer in (Home, About, Work, Contact links become visible together), then hover Work
    hold = true
    const before = rsc.length
    const work = p.locator('footer nav a[href="/work"]')
    await work.scrollIntoViewIfNeeded()
    const tHover = Date.now()
    await work.hover()
    await p.waitForTimeout(3500)
    const after = rsc.slice(before).map(r => `${r.path}@+${r.t - tHover}ms`)
    const workReq = rsc.slice(before).find(r => r.path.startsWith('/work'))
    check(!!workReq, `scroll footer in + hover Work: requests ${after.join(', ') || '(none)'}`)

    // Click: the curtain navigation should be served from the prefetch cache
    hold = false
    await p.waitForTimeout(3500) // let the held second round finish
    const beforeClick = rsc.length
    await work.click()
    await p.waitForURL(BASE + '/work'); await p.waitForTimeout(1200)
    const clickReqs = rsc.slice(beforeClick)
    check(clickReqs.length === 0, `click: ${clickReqs.length} new RSC request(s) during the curtain navigation (served from the prefetch cache) ${clickReqs.map(r => r.path).join(', ')}`)
    await ctx.close()

    // Hover with nothing else queued: the hovered link's prefetch should be issued promptly
    const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx2.addInitScript(SKIP_LOADER)
    const q = await ctx2.newPage()
    const r2 = []
    q.on('request', r => { if (r.url().includes('_rsc=')) r2.push({ path: new URL(r.url()).pathname, t: Date.now() }) })
    await q.goto(BASE + '/work', { waitUntil: 'networkidle' }); await q.waitForTimeout(1500)
    await q.click('button[aria-controls="site-menu"]'); await q.waitForSelector('#site-menu a'); await q.waitForTimeout(800)
    const menuReqs = r2.filter(r => ['/', '/about'].includes(r.path))
    check(menuReqs.length > 0, `menu links (lazy-loaded FlowingMenu <Link>s) prefetched once visible: ${menuReqs.map(r => r.path).join(', ')}`)
    const b2 = r2.length
    await q.hover('#site-menu a:text-is("About Me")'); await q.waitForTimeout(600)
    console.log(`    hover About Me after its prefetch completed: ${r2.length - b2} new request(s) (expected 0: already cached)`)
    await ctx2.close()
  }

  // ── 3. Hash links (the site has none; inject plain anchors into the live page)
  console.log('=== 3. HASH LINKS')
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript(SKIP_LOADER)
    await ctx.addInitScript(() => {
      // Did the curtain become visible since the last reset?
      window.__curtain = false
      const tick = () => { const c = document.querySelector('.page-curtain'); if (c && getComputedStyle(c).visibility === 'visible') window.__curtain = true; requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    })
    const p = await ctx.newPage()
    const inject = (href) => p.evaluate((href) => {
      const a = document.createElement('a'); a.href = href; a.id = 'test-hash-link'; a.textContent = 'TEST ' + href
      Object.assign(a.style, { position: 'fixed', left: '10px', bottom: '10px', zIndex: 200, background: '#ff0', padding: '8px' })
      document.body.appendChild(a)
    }, href)
    const landing = () => p.evaluate(() => {
      const id = decodeURIComponent(location.hash.slice(1)), el = id && document.getElementById(id)
      return { url: location.pathname + location.hash, scrollY: Math.round(scrollY), targetTop: el ? Math.round(el.getBoundingClientRect().top) : null, curtain: window.__curtain, focus: document.activeElement === document.body ? 'body' : `${document.activeElement.tagName}#${document.activeElement.id}` }
    })

    // Same-page anchor: no curtain, scrolls to the section
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' })
    await inject('#contact'); await p.evaluate(() => { window.__curtain = false })
    await p.click('#test-hash-link'); await p.waitForTimeout(1200)
    let s = await landing()
    check(!s.curtain && s.url === '/about#contact' && s.scrollY > 0 && Math.abs(s.targetTop) <= 2, `same page /about → #contact: curtain=${s.curtain}, url=${s.url}, scrollY=${s.scrollY}, target top=${s.targetTop}`)

    // Cross-page anchors: curtain plays, lands on the anchor
    for (const [from, href] of [['/work', '/about#contact'], ['/contact', '/work#contact'], ['/about', '/#work']]) {
      await p.goto(BASE + from, { waitUntil: 'networkidle' })
      await inject(href); await p.evaluate(() => { window.__curtain = false })
      await p.click('#test-hash-link')
      await p.waitForFunction(() => { const c = document.querySelector('.page-curtain'); return window.__curtain && getComputedStyle(c).visibility === 'hidden' }, null, { timeout: 8000 }).catch(() => {})
      await p.waitForTimeout(400)
      s = await landing()
      check(s.curtain && s.url === href && Math.abs(s.targetTop) <= 2, `${from} → ${href}: curtain=${s.curtain}, url=${s.url}, scrollY=${s.scrollY}, target top=${s.targetTop}, focus=${s.focus}`)
    }

    // Plain cross-page link still lands at the top (no regression)
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' })
    const l = p.locator('footer nav a[href="/about"]'); await l.scrollIntoViewIfNeeded()
    await l.click(); await p.waitForURL(BASE + '/about'); await p.waitForTimeout(1200)
    s = await landing()
    check(s.scrollY === 0, `plain /work → /about still lands at top: scrollY=${s.scrollY}, focus=${s.focus}`)
    await ctx.close()
  }

  console.log(`\n${failures} failure(s)`)
  process.exitCode = failures ? 1 : 0
  await b.close()
})().catch(e => { console.error(e); process.exit(1) })
