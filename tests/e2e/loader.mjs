// Loader checks. Run with: node tests/e2e/run.mjs (or BASE=… node tests/e2e/loader.mjs)
import { chromium } from 'playwright'
import { BASE_URL } from './lib.mjs'
const BASE = BASE_URL + '/'
let failures = 0
const check = (ok, msg) => { if (!ok) failures++; console.log(`  ${ok ? 'PASS' : 'FAIL'} ${msg}`) }

const state = p => p.evaluate(() => {
  const el = document.querySelector('.loading-screen'), cs = getComputedStyle(el)
  return {
    attr: document.documentElement.dataset.loader ?? 'none',
    shown: cs.display !== 'none' && cs.visibility !== 'hidden',
    num: document.querySelector('.ls-number').textContent,
    locked: getComputedStyle(document.body).overflow === 'hidden',
  }
})
const fmt = s => `attr=${s.attr} shown=${s.shown} num="${s.num}" locked=${s.locked}`

/** Polls until the loader is gone and the page unlocked; returns ms from start, the highest count seen, or null on timeout */
async function waitReleased(p, limitMs) {
  const t0 = Date.now(); let maxNum = -1
  while (Date.now() - t0 < limitMs) {
    const s = await state(p).catch(() => null)
    if (s) {
      if (s.num !== '') maxNum = Math.max(maxNum, Number(s.num))
      if (!s.shown && !s.locked) return { ms: Date.now() - t0, maxNum, s }
    }
    await p.waitForTimeout(50)
  }
  return { ms: null, maxNum, s: await state(p).catch(() => null) }
}

;(async () => {
  console.log(`BASE ${BASE}`)
  // Server HTML
  const html = await (await fetch(BASE)).text()
  const m = html.match(/class="ls-number"[^>]*>([^<]*)</)
  check(m && m[1] === '', `server HTML: ls-number is empty (${JSON.stringify(m && m[1])})`)

  const b = await chromium.launch({ channel: 'chrome' })
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })

  // 1. Normal first visit: full count, then exit
  let p = await ctx.newPage()
  await p.goto(BASE, { waitUntil: 'domcontentloaded' })
  let r = await waitReleased(p, 8000)
  check(r.ms !== null && r.maxNum === 100 && r.s.attr === 'none', `first visit: counted to ${r.maxNum}, released after ${r.ms}ms (from DOMContentLoaded), ${fmt(r.s)}`)

  // 2. Reload in the same tab: no loader
  await p.reload({ waitUntil: 'domcontentloaded' })
  let s = await state(p)
  await p.waitForTimeout(1500)
  const s2 = await state(p)
  check(!s.shown && !s2.shown && !s2.locked, `reload: never shown (${fmt(s2)})`)

  // 3. sessionStorage cleared, then reload: loader again, full run
  await p.evaluate(() => sessionStorage.clear())
  await p.reload({ waitUntil: 'domcontentloaded' })
  r = await waitReleased(p, 8000)
  check(r.ms !== null && r.maxNum === 100, `storage cleared + reload: counted to ${r.maxNum}, released after ${r.ms}ms`)

  // 4. New tab typed/opened fresh (sessionStorage is per tab): loader shows and completes
  const p2 = await ctx.newPage()
  await p2.goto(BASE, { waitUntil: 'domcontentloaded' })
  r = await waitReleased(p2, 8000)
  check(r.ms !== null && r.maxNum === 100, `new tab: counted to ${r.maxNum}, released after ${r.ms}ms`)

  // 5. Tab opened from the site (window.open copies sessionStorage): no loader
  const [p3] = await Promise.all([ctx.waitForEvent('page'), p.evaluate(u => window.open(u), BASE)])
  await p3.waitForLoadState('domcontentloaded'); await p3.waitForTimeout(1500)
  s = await state(p3)
  check(!s.shown && !s.locked, `tab opened from the site: no loader (${fmt(s)})`)
  await p2.close(); await p3.close()

  // 6. Skip on input
  await p.evaluate(() => sessionStorage.clear())
  await p.reload({ waitUntil: 'domcontentloaded' })
  await p.waitForFunction(() => document.documentElement.dataset.loader === 'running', null, { timeout: 15000 })
  await p.waitForTimeout(300)
  await p.keyboard.press('Shift')
  r = await waitReleased(p, 3000)
  check(r.ms !== null && r.maxNum < 100, `key press skips: released ${r.ms}ms after the key, count stopped at ${r.maxNum}`)
  await p.close(); await ctx.close()

  // 7. JS blocked: pending failsafe
  {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const q = await c.newPage()
    await q.route(/\/_next\/static\/chunks\/.*\.js(\?.*)?$/, rt => rt.abort())
    const t0 = Date.now()
    await q.goto(BASE, { waitUntil: 'domcontentloaded' })
    const before = await state(q)
    r = await waitReleased(q, 8000)
    await q.mouse.move(700, 400); await q.mouse.wheel(0, 1500); await q.waitForTimeout(500)
    const y = await q.evaluate(() => scrollY)
    check(before.shown && r.ms !== null && y > 0, `JS blocked: shown at first (${before.shown}), released ${Date.now() - t0 - 500}ms after navigation, scrolls (scrollY=${y})`)
    await c.close()
  }

  // 8. Slow JS (chunks delayed)
  for (const delay of [3000, 5000]) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const q = await c.newPage()
    await q.route(/\/_next\/static\/chunks\/.*\.js(\?.*)?$/, async rt => { await new Promise(res => setTimeout(res, delay)); rt.continue().catch(() => {}) })
    q.goto(BASE).catch(() => {})
    await q.waitForTimeout(200)
    r = await waitReleased(q, 12000)
    // After release it must stay released (no flash back when JS finally arrives)
    await q.waitForTimeout(2500)
    s = await state(q)
    check(r.ms !== null && !s.shown && !s.locked, `JS delayed ${delay}ms: released ${r.ms + 200}ms after navigation, still released 2.5s later (${fmt(s)})`)
    await c.close()
  }

  // 9. Loader code misbehaves after it starts running: animation frames never fire.
  //    Only the JS watchdog (setTimeout) or the CSS watchdog can release the page.
  for (const [desc, killTimers] of [['frozen rAF, CSS watchdog disabled → JS watchdog', false], ['frozen rAF + no long timers → CSS watchdog', true]]) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
    await c.addInitScript((killTimers) => {
      // Isolate the JS watchdog: switch the CSS one off
      if (!killTimers) document.addEventListener('DOMContentLoaded', () => {
        const st = document.createElement('style')
        st.textContent = 'html[data-loader="running"] .loading-screen, html[data-loader="running"] body { animation: none !important; }'
        document.head.appendChild(st)
      })
      const raf = window.requestAnimationFrame.bind(window), st = window.setTimeout.bind(window)
      window.requestAnimationFrame = (cb) => document.documentElement.dataset.loader === 'running' ? 0 : raf(cb)
      if (killTimers) window.setTimeout = (cb, ms, ...a) => (ms >= 1000 && document.documentElement.dataset.loader === 'running') ? 0 : st(cb, ms, ...a)
      new MutationObserver(() => { if (document.documentElement.dataset.loader === 'running' && !window.__runAt) window.__runAt = performance.now() })
        .observe(document, { attributes: true, subtree: true, attributeFilter: ['data-loader'] })
    }, killTimers)
    const q = await c.newPage()
    await q.goto(BASE, { waitUntil: 'domcontentloaded' })
    r = await waitReleased(q, 10000)
    const sinceRunning = await q.evaluate(() => Math.round(performance.now() - window.__runAt))
    // The JS watchdog also clears the attribute; the CSS one only hides and unlocks
    check(r.ms !== null && (killTimers || r.s.attr === 'none'), `${desc}: released ~${sinceRunning}ms after "running" was set (${fmt(r.s)})`)
    await c.close()
  }

  console.log(`\n${failures} failure(s)`)
  process.exitCode = failures ? 1 : 0
  await b.close()
})().catch(e => { console.error(e); process.exit(1) })
