// Keyboard focus into the shared Contact section: a link's column must be fully shown right away,
// not mid fade-in. Checked on every page that renders <Contact>. Run: pnpm test:e2e -- contact
import { chromium } from 'playwright'
import { BASE_URL as BASE, MODE, SKIP_LOADER, reporter } from './lib.mjs'

const r = reporter()
const PAGES = ['/', '/about', '/work']

/** Opacity and transform of the focused element and every ancestor: is it actually visible now? */
const FOCUS_STATE = () => {
  const a = document.activeElement
  if (!a || a === document.body) return null
  let minOpacity = 1, moved = false
  for (let e = a; e && e !== document.body; e = e.parentElement) {
    const cs = getComputedStyle(e)
    minOpacity = Math.min(minOpacity, +cs.opacity)
    // A reveal at rest is no transform (or identity); mid-reveal it is translated/scaled
    if (cs.transform !== 'none') { const m = new DOMMatrix(cs.transform); if (Math.abs(m.m41) > 0.5 || Math.abs(m.m42) > 0.5 || Math.abs(m.a - 1) > 0.01) moved = true }
  }
  return { label: (a.getAttribute('aria-label') || a.textContent).trim().slice(0, 28), inContact: !!a.closest('#contact'), minOpacity, moved }
}

;(async () => {
  console.log(`BASE ${BASE} (${MODE})`)
  const browser = await chromium.launch({ channel: 'chrome' })
  for (const [w, h] of [[1440, 900], [375, 812]]) {
    for (const route of PAGES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } })
      await ctx.addInitScript(SKIP_LOADER)
      const p = await ctx.newPage()
      await p.goto(BASE + route, { waitUntil: 'networkidle' })
      await p.waitForTimeout(500)
      const contact = [], others = []
      for (let i = 0; i < 60; i++) {
        await p.keyboard.press('Tab')
        // Two frames: enough for a focus handler to act, far short of a 0.6–0.9s reveal
        await p.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res))))
        const s = await p.evaluate(FOCUS_STATE)
        if (!s) continue
        ;(s.inContact ? contact : others).push(s)
        if (await p.evaluate(() => !!document.activeElement.closest('footer'))) break
      }
      const bad = contact.filter(s => s.minOpacity < 1 || s.moved)
      r.check(contact.length >= 5 && bad.length === 0,
        `${w}px ${route}: ${contact.length} Contact links fully shown on focus${bad.length ? ' — NOT: ' + bad.map(s => `${s.label} (opacity ${s.minOpacity.toFixed(2)}${s.moved ? ', moving' : ''})`).join(', ') : ''}`)
      const hiddenElsewhere = others.filter(s => s.minOpacity < 1 || s.moved)
      if (hiddenElsewhere.length) r.info(`elsewhere on ${route}: ${hiddenElsewhere.length} stop(s) not yet shown on focus: ${hiddenElsewhere.map(s => s.label).join(', ')}`)
      await ctx.close()
    }
  }
  r.done()
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })
