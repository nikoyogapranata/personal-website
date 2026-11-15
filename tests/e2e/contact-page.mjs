// /contact: layout at every width (no overflow, the sentence, the one-line email, cards), the
// status-bar clock (no shift, ticks on the minute), keyboard-only fill and submit (arrow keys on
// the topic chips), validation (blur, submit, focus, aria), server-side validation, API failures,
// the sent state and "send another", copy to clipboard (and its fallback), reduced motion, no JS,
// curtain in and out, CLS, and contrast on every text colour.
// /api/contact is mocked with page.route for every send, so no real email goes out; the only real
// requests to it carry invalid data (or the honeypot), which the route rejects before Resend.
// Run: pnpm test:e2e   (or: pnpm test:e2e -- contact-page)
import { chromium } from 'playwright'
import path from 'node:path'
import { BASE_URL as BASE, MODE, artifacts, SKIP_LOADER, reporter, contrast } from './lib.mjs'

const OUT = artifacts('contact-page')
const r = reporter()
const SIZES = { 375: 812, 768: 1024, 1024: 768, 1440: 900, 2560: 1440 }
const EMAIL = 'nikopranatabusiness@gmail.com'
const shot = (p, name, full = false) => p.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full })

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
const go = async (p, url = '/contact') => { await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(900) }

/** Mock the API. `reply` is { status, body } or 'abort'; posted bodies are collected in p.__posted */
async function mockApi(p, reply = { status: 200, body: { ok: true } }, delay = 0) {
  p.__posted = []
  await p.unroute('**/api/contact').catch(() => {})
  await p.route('**/api/contact', async route => {
    p.__posted.push(JSON.parse(route.request().postData() || '{}'))
    if (delay) await new Promise(res => setTimeout(res, delay))
    if (reply === 'abort') return route.abort('failed')
    return route.fulfill({ status: reply.status, contentType: 'application/json', body: JSON.stringify(reply.body) })
  })
}

/** Scroll top to bottom so every whileInView reveal has played */
const revealAll = async p => {
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) }
    scrollTo(0, document.body.scrollHeight)
  })
  await p.waitForTimeout(900)
}

/** Elements whose box pokes out of the viewport sideways */
const overflow = p => p.evaluate(() => {
  const bad = []
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('.sr-only, .sf-honeypot')) continue
    const b = el.getBoundingClientRect()
    if (b.width && (b.left < -1 || b.right > innerWidth + 1)) bad.push(`${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60) + ` ${Math.round(b.left)}–${Math.round(b.right)}`)
  }
  return { scroll: document.documentElement.scrollWidth - innerWidth, bad: bad.slice(0, 5) }
})

const state = p => p.evaluate(() => ({
  path: location.pathname,
  fg: document.documentElement.dataset.fg,
  topTone: document.querySelector('.ct-top')?.dataset.tone,
  focus: document.activeElement ? `${document.activeElement.tagName}#${document.activeElement.id}${document.activeElement.type === 'radio' ? `[${document.activeElement.value}]` : ''}` : '',
  sent: !!document.querySelector('.ss'),
  form: !!document.querySelector('form.sf'),
  errors: Object.fromEntries([...document.querySelectorAll('.sf-error')].map(e => [e.id, e.textContent])),
  apiError: document.querySelector('.sf-api-error')?.textContent.trim() ?? '',
  live: [...document.querySelectorAll('[role="status"]')].map(e => e.textContent).join(' | '),
  button: document.querySelector('.sf-send')?.textContent.trim(),
  values: Object.fromEntries(['contact-name', 'contact-message', 'contact-email'].map(id => [id, document.getElementById(id)?.value])),
  topic: document.querySelector('input[name="topic"]:checked')?.value ?? null,
}))

/** Fill the form like a person would, through the fields' own events */
async function fill(p, { name = 'Ada Lovelace', topic = 'internship', message = 'I have a frontend internship opening.', email = 'ada@example.com' } = {}) {
  if (name !== null) await p.fill('#contact-name', name)
  if (topic) await p.check(`input[name="topic"][value="${topic}"]`, { force: true })
  if (message !== null) await p.fill('#contact-message', message)
  if (email !== null) await p.fill('#contact-email', email)
}

/** Text colour vs the colour actually behind it, for every visible text run in `scope` */
const textContrast = (p, scope) => p.evaluate(scope => {
  const rgb = s => { const m = s.match(/[\d.]+/g); return m ? m.slice(0, 4).map(Number) : null }
  const page = document.documentElement.dataset.fg === 'dark' ? [10, 10, 10] : [248, 248, 245]
  const bgOf = el => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const c = rgb(getComputedStyle(e).backgroundColor)
      if (c && (c.length < 4 || c[3] > 0.9)) return c.slice(0, 3)
    }
    return page
  }
  const out = []
  const seen = new Set()
  for (const el of document.querySelectorAll(scope)) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let n = walker.currentNode; n; n = walker.nextNode()) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue
      const host = n.parentElement
      const cs = getComputedStyle(host)
      if (host.closest('.sr-only, .sf-mirror, [aria-hidden="true"]') || cs.visibility === 'hidden' || !host.getClientRects().length) continue
      const key = `${cs.color}|${bgOf(host)}|${cs.fontSize}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ text: n.textContent.trim().slice(0, 24), fg: rgb(cs.color).slice(0, 3), bg: bgOf(host), px: parseFloat(cs.fontSize), bold: +cs.fontWeight >= 700 })
    }
  }
  // Placeholders and typed text in the blanks
  for (const f of document.querySelectorAll(`${scope} .sf-field`)) {
    const ph = getComputedStyle(f, '::placeholder')
    out.push({ text: `placeholder ${f.id}`, fg: rgb(ph.color).slice(0, 3), bg: bgOf(f), px: parseFloat(getComputedStyle(f).fontSize), bold: false })
    out.push({ text: `typed ${f.id}`, fg: rgb(getComputedStyle(f).color).slice(0, 3), bg: bgOf(f), px: parseFloat(getComputedStyle(f).fontSize), bold: false })
  }
  return out
}, scope)
const checkContrast = (list, label) => {
  for (const t of list) {
    const large = t.px >= 24 || (t.bold && t.px >= 18.66)
    const need = large ? 3 : 4.5
    const c = contrast(t.fg, t.bg)
    r.check(c >= need, `${label}: "${t.text}" ${c.toFixed(2)}:1 (need ${need}, ${Math.round(t.px)}px)`)
  }
}

;(async () => {
  console.log(`BASE ${BASE} (${MODE})`)
  const browser = await chromium.launch({ channel: 'chrome' })

  // ── Every width: overflow (empty and with long text), title, sentence size, email on one line,
  //    cards, CLS, console errors
  r.section('WIDTHS')
  for (const w of [375, 768, 1024, 1440, 2560]) {
    const p = await open(browser, w)
    await go(p)
    const h1 = await p.$$eval('h1', hs => hs.map(h => h.textContent.trim()))
    r.check(h1.length === 1 && h1[0] === "LET'S TALK.", `${w}: one h1 (${h1.join(' | ')})`)
    const g = await p.evaluate(() => {
      const fs = parseFloat(getComputedStyle(document.querySelector('.sf-sentence')).fontSize)
      const blanks = [...document.querySelectorAll('.sf-blank')].map(b => Math.round(b.getBoundingClientRect().width))
      const sentenceW = Math.round(document.querySelector('.sf-sentence').getBoundingClientRect().width)
      const stop = document.querySelector('.ct-title-stop')
      return { fs, blanks, sentenceW, stopFont: getComputedStyle(stop).fontFamily, stopColor: getComputedStyle(stop).color, stopStyle: getComputedStyle(stop).fontStyle }
    })
    if (w === 1440) r.check(Math.abs(g.fs - 52) < 1, `1440: sentence at ${g.fs.toFixed(1)}px (target 52)`)
    r.check(/Playfair/i.test(g.stopFont) && g.stopStyle === 'italic' && g.stopColor === 'rgb(196, 30, 58)', `${w}: title full stop in Playfair italic crimson`)
    if (w <= 640) r.check(g.blanks.every(b => Math.abs(b - g.sentenceW) <= 1), `${w}: blanks full width (${g.blanks.join(', ')} of ${g.sentenceW})`)
    // CLS from load and hydration (before the scripted fill below, whose growth isn't user input to the browser)
    const cls = await p.evaluate(() => window.__cls)
    r.check(cls < 0.001, `${w}: CLS ${cls.toFixed(4)}`)
    let o = await overflow(p)
    r.check(o.scroll <= 0 && !o.bad.length, `${w}: no overflow, empty form (scroll +${o.scroll}${o.bad.length ? '; ' + o.bad.join('; ') : ''})`)

    // Long input: a 600-character message with an unbroken URL, a long name and email
    await fill(p, {
      name: 'Maximiliana Wilhelmina Bartholomew-Fitzgerald',
      message: 'Here is the brief: ' + 'we need a fast, accessible marketing site with motion. '.repeat(9) + 'https://example.com/' + 'a'.repeat(120),
      email: 'a.very.long.address.for.testing@subdomain.example-company.co.uk',
    })
    await p.waitForTimeout(200)
    o = await overflow(p)
    r.check(o.scroll <= 0 && !o.bad.length, `${w}: no overflow, long input (scroll +${o.scroll}${o.bad.length ? '; ' + o.bad.join('; ') : ''})`)
    const ta = await p.$eval('#contact-message', t => ({ h: t.clientHeight, sh: t.scrollHeight, w: t.getBoundingClientRect().width }))
    r.check(ta.sh <= ta.h + 2 && ta.h > 100, `${w}: message blank grew to fit (${ta.h}px tall, content ${ta.sh}px)`)

    await revealAll(p)
    const e = await p.evaluate(() => {
      const b = document.querySelector('.ch-email--js').getBoundingClientRect()
      const fs = parseFloat(getComputedStyle(document.querySelector('.ch-email--js')).fontSize)
      const cards = [...document.querySelectorAll('.ch-cards > li')].map(li => [li.offsetLeft, li.offsetTop])
      return { oneLine: b.height < fs * 1.6, right: b.right, fs, cards }
    })
    r.check(e.oneLine && e.right <= w, `${w}: email on one line at ${e.fs.toFixed(1)}px, right edge ${Math.round(e.right)}`)
    const stacked = e.cards.every(c => c[0] === e.cards[0][0])
    const row = e.cards.every(c => Math.abs(c[1] - e.cards[0][1]) <= 1)
    r.check(w < 768 ? stacked : row, `${w}: channel cards ${w < 768 ? 'stacked' : 'in a row'}`)
    o = await overflow(p)
    r.check(o.scroll <= 0 && !o.bad.length, `${w}: no overflow, channels (scroll +${o.scroll})`)
    r.check(!p.__errors.length, `${w}: no console errors${p.__errors.length ? ' — ' + p.__errors.join(' / ') : ''}`)
    await p.context().close()
  }

  // ── Screenshots: empty form and channels
  r.section('SCREENSHOTS')
  for (const w of [1440, 375]) {
    const p = await open(browser, w)
    await go(p)
    await shot(p, `${w}-empty`)
    await revealAll(p)
    await p.$eval('.ch', el => el.scrollIntoView({ block: 'start' }))
    await p.waitForTimeout(300)
    await shot(p, `${w}-channels`)
    r.check(true, `${w}: empty + channels saved`)
    await p.context().close()
  }

  // ── Clock: renders after mount, same width as its placeholder, ticks on the minute
  r.section('CLOCK')
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript(SKIP_LOADER)
    const p = await ctx.newPage()
    // 14:49:50 in Yogyakarta (UTC+7)
    await p.clock.install({ time: new Date('2026-11-15T07:49:50Z') })
    await p.goto(BASE + '/contact', { waitUntil: 'domcontentloaded' })
    await p.clock.runFor(1500)
    const html = await (await p.request.get(BASE + '/contact')).text()
    r.check(/--:--/.test(html), 'server render shows the --:-- placeholder')
    const t1 = await p.$eval('.ct-status-time', e => e.textContent.replace(/\s+/g, ' ').trim())
    r.check(/It.s 14:49 in Yogyakarta/i.test(t1) && /reply within a day/i.test(t1), `status: "${t1}"`)
    const widths = await p.$eval('.ct-clock .city-clock', el => {
      const w1 = el.getBoundingClientRect().width; const t = el.textContent
      el.textContent = '--:--'; const w2 = el.getBoundingClientRect().width; el.textContent = t
      return [w1, w2]
    })
    r.check(Math.abs(widths[0] - widths[1]) < 0.5, `clock and placeholder same width (${widths.map(x => x.toFixed(1)).join(' / ')})`)
    await p.clock.runFor(15_000)
    const t2 = await p.$eval('.ct-clock', e => e.textContent)
    r.check(t2 === '14:50', `ticks on the minute → ${t2}`)
    const left = await p.$eval('.ct-status-item', e => e.textContent.trim())
    r.check(/Open to internships and freelance/i.test(left), `status left: "${left}"`)
    await ctx.close()
  }

  // ── Keyboard only: Tab to the form, type, arrow keys on the chips, submit
  r.section('KEYBOARD')
  {
    const p = await open(browser, 1440)
    await go(p)
    await mockApi(p)
    let s, i = 0
    do { await p.keyboard.press('Tab'); s = await state(p) } while (s.focus !== 'INPUT#contact-name' && ++i < 40)
    r.check(s.focus === 'INPUT#contact-name', `Tab ×${i + 1} reaches the name blank`)
    await p.keyboard.type('Grace Hopper')
    await p.keyboard.press('Tab')
    s = await state(p)
    r.check(s.focus === 'INPUT#[internship]' && s.topic === null, `Tab → first chip, nothing picked yet (${s.focus}, ${s.topic})`)
    const ring = await p.$eval('.sf-chip:has(:focus-visible)', el => getComputedStyle(el).outlineStyle).catch(() => 'none')
    r.check(ring === 'solid', `focused chip shows a ring (${ring})`)
    await p.keyboard.press('ArrowRight'); s = await state(p)
    r.check(s.topic === 'freelance' && s.focus === 'INPUT#[freelance]', `ArrowRight → ${s.topic}`)
    await p.keyboard.press('ArrowRight'); s = await state(p)
    r.check(s.topic === 'other', `ArrowRight → ${s.topic}`)
    await p.keyboard.press('ArrowRight'); s = await state(p)
    r.check(s.topic === 'internship', `ArrowRight wraps → ${s.topic}`)
    await p.keyboard.press('ArrowLeft'); s = await state(p)
    r.check(s.topic === 'other', `ArrowLeft → ${s.topic}`)
    await p.keyboard.press('ArrowUp'); s = await state(p)
    r.check(s.topic === 'freelance', `ArrowUp → ${s.topic}`)
    await p.waitForTimeout(400) // let the chip transitions finish
    const chip = await p.$eval('.sf-chip:has(:checked)', el => { const cs = getComputedStyle(el); return { bg: cs.backgroundColor, shadow: cs.boxShadow, t: cs.transform } })
    r.check(chip.bg === 'rgb(10, 10, 10)' && /91, 33, 182/.test(chip.shadow) && /matrix\(1, 0, 0, 1, 2, 2\)/.test(chip.t), `picked chip: ink, violet shadow, pressed 2px (${chip.t})`)
    const dim = await p.$$eval('.sf-chip:not(:has(:checked))', els => els.map(e => getComputedStyle(e).color))
    r.check(dim.every(c => c === 'rgb(110, 110, 110)'), `other chips dimmed to the faint text colour (${dim.join(', ')})`)
    await p.keyboard.press('Tab')
    r.check((await state(p)).focus === 'TEXTAREA#contact-message', 'Tab → message')
    const uw = await p.$eval('#contact-message', el => getComputedStyle(el).getPropertyValue('--sf-uw').trim())
    r.check(uw === '4px', `focused blank: thicker underline (${uw})`)
    await p.keyboard.type('Looking for a frontend intern.')
    await p.keyboard.press('Shift+Enter')
    await p.keyboard.type('Remote is fine')
    await p.keyboard.press('Tab')
    await p.keyboard.type('grace@example.com')
    await p.keyboard.press('Tab')
    r.check((await state(p)).focus === 'BUTTON#', 'Tab → SEND IT')
    await p.keyboard.press('Enter')
    await p.waitForTimeout(1600)
    s = await state(p)
    const body = p.__posted[0] || {}
    r.check(body.name === 'Grace Hopper' && body.topic === 'freelance' && body.email === 'grace@example.com' && body.message === 'Looking for a frontend intern.\nRemote is fine' && body.company === '', `posted ${JSON.stringify(body)}`)
    r.check(s.sent && s.focus === 'H2#' && s.fg === 'dark', `sent: focus on heading (${s.focus}), tone ${s.fg}`)
    await p.context().close()
  }

  // ── Validation: submit empty, focus order, aria links, blur, live clearing
  r.section('VALIDATION')
  for (const w of [1440, 375]) {
    const p = await open(browser, w)
    await go(p)
    await mockApi(p)
    await p.click('.sf-send')
    await p.waitForTimeout(200)
    let s = await state(p)
    const ids = Object.keys(s.errors).sort().join(',')
    r.check(ids === 'contact-email-error,contact-message-error,contact-name-error,contact-topic-error', `${w}: empty submit → four errors (${ids})`)
    r.check(s.focus === 'INPUT#contact-name', `${w}: focus → name (${s.focus})`)
    r.check(p.__posted.length === 0, `${w}: nothing posted`)
    const aria = await p.evaluate(() => [...document.querySelectorAll('#contact-name, #contact-message, #contact-email, input[name="topic"]')].map(el => {
      const d = el.getAttribute('aria-describedby')
      return { id: el.id || el.value, ok: !!d && !!document.getElementById(d)?.textContent, inv: el.getAttribute('aria-invalid') }
    }))
    r.check(aria.every(a => a.ok), `${w}: every field (and radio) points at its error with aria-describedby`)
    r.check(aria.filter(a => a.id.startsWith('contact-')).every(a => a.inv === 'true'), `${w}: text fields aria-invalid`)
    const errStyle = await p.$eval('#contact-name-error', e => ({ c: getComputedStyle(e).color, t: e.textContent }))
    r.check(errStyle.c === 'rgb(196, 30, 58)' && errStyle.t.length > 5, `${w}: error is crimson text ("${errStyle.t}")`)
    if (w === 1440) {
      // Below the blank: the error's top is under the field's bottom
      const under = await p.evaluate(() => [['contact-name'], ['contact-email']].every(([id]) => document.getElementById(`${id}-error`).getBoundingClientRect().top >= document.getElementById(id).getBoundingClientRect().bottom - 1))
      r.check(under, `${w}: errors sit under their blanks`)
    }
    await p.fill('#contact-name', 'Ada')
    s = await state(p)
    r.check(!s.errors['contact-name-error'], `${w}: name error clears as you type`)
    await p.click('.sf-send'); await p.waitForTimeout(200); s = await state(p)
    r.check(s.focus === 'INPUT#[internship]', `${w}: next submit → focus first chip (${s.focus})`)
    r.check(/pick what you/i.test(s.errors['contact-topic-error'] || ''), `${w}: topic error under the chips ("${s.errors['contact-topic-error']}")`)
    const topicUnder = await p.evaluate(() => document.getElementById('contact-topic-error').getBoundingClientRect().top >= Math.max(...[...document.querySelectorAll('.sf-chip')].map(c => c.getBoundingClientRect().bottom)) - 1)
    r.check(topicUnder, `${w}: topic error below the chips`)
    await p.check('input[value="other"]', { force: true })
    s = await state(p)
    r.check(!s.errors['contact-topic-error'], `${w}: topic error clears on pick`)
    // Blur: a bad email shows its error on leaving the field; an untouched field stays quiet
    await p.click('.sf-send'); await p.waitForTimeout(150) // re-raises message + email
    await p.fill('#contact-message', 'Hello there')
    await p.fill('#contact-email', 'ada@nowhere')
    await p.focus('#contact-name')
    s = await state(p)
    r.check(/look like an email/i.test(s.errors['contact-email-error'] || ''), `${w}: blur → invalid email ("${s.errors['contact-email-error']}")`)
    if (w === 1440) await shot(p, '1440-error')
    if (w === 375) { await p.$eval('#contact-email', el => el.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200); await shot(p, '375-error') }
    await p.fill('#contact-email', 'ada@nowhere.org')
    s = await state(p)
    r.check(!s.errors['contact-email-error'], `${w}: fixing the email clears it`)
    await p.context().close()
  }
  {
    // Tabbing through an untouched form doesn't paint it red
    const p = await open(browser, 1440)
    await go(p)
    await p.focus('#contact-name'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab')
    const s = await state(p)
    r.check(!Object.keys(s.errors).length, 'blur on untouched fields: no errors')
    await p.context().close()
  }

  // ── The server validates on its own (requests go straight to the route, bypassing the form)
  r.section('SERVER VALIDATION')
  {
    const p = await open(browser, 1440)
    const post = async data => { const res = await p.request.post(BASE + '/api/contact', { data }); return { status: res.status(), body: await res.json().catch(() => ({})) } }
    let x = await post({})
    r.check(x.status === 400 && ['name', 'topic', 'message', 'email'].every(k => x.body.errors?.[k]), `empty → 400 with ${Object.keys(x.body.errors || {}).join(',')}`)
    const valid = { name: 'Ada', topic: 'internship', message: 'Hi', email: 'ada@example.com' }
    x = await post({ ...valid, topic: 'bogus' })
    r.check(x.status === 400 && Object.keys(x.body.errors) .join() === 'topic', `bad topic → 400 (${JSON.stringify(x.body.errors)})`)
    x = await post({ ...valid, topic: undefined })
    r.check(x.status === 400 && x.body.errors?.topic, 'missing topic → 400')
    for (const bad of ['ada@example.com\r\nBcc: victim@example.com', 'Ada <ada@example.com>', 'a@b', 'ada@example.com, b@example.com']) {
      x = await post({ ...valid, email: bad })
      r.check(x.status === 400 && x.body.errors?.email, `email ${JSON.stringify(bad)} → 400`)
    }
    x = await post({ ...valid, message: 'x'.repeat(5001) })
    r.check(x.status === 400 && x.body.errors?.message, 'message over 5000 → 400')
    x = await post({ ...valid, name: 123 })
    r.check(x.status === 400 && x.body.errors?.name, 'non-string name → 400')
    const raw = await p.request.post(BASE + '/api/contact', { data: 'not json', headers: { 'Content-Type': 'application/json' } })
    r.check(raw.status() === 400, `invalid JSON → ${raw.status()}`)
    x = await post({ ...valid, company: 'Spam Co' })
    r.check(x.status === 200 && x.body.ok === true, 'honeypot filled → silent 200, nothing sent')
    await p.context().close()
  }

  // ── API failures: error from the API, network failure, field errors from the server, sending state
  r.section('API FAILURE')
  {
    const p = await open(browser, 1440)
    await go(p)
    await mockApi(p, { status: 502, body: { error: 'Your message could not be sent.' } }, 700)
    await fill(p)
    await p.click('.sf-send')
    await p.waitForTimeout(250)
    let s = await state(p)
    const dis = await p.$eval('.sf-send', b => b.getAttribute('aria-disabled'))
    r.check(s.button === 'Sending…' && dis === 'true', `sending state: "${s.button}", aria-disabled=${dis}`)
    await p.click('.sf-send', { force: true }) // a second press while sending is ignored
    await p.waitForTimeout(900)
    s = await state(p)
    r.check(p.__posted.length === 1, `one request despite a double press (${p.__posted.length})`)
    r.check(!s.sent && /could not be sent/.test(s.apiError) && /still here/.test(s.apiError), `502 → inline error ("${s.apiError.slice(0, 70)}…")`)
    r.check(s.values['contact-name'] === 'Ada Lovelace' && s.values['contact-email'] === 'ada@example.com' && s.topic === 'internship' && /internship opening/.test(s.values['contact-message']), 'everything typed is still there')
    r.check(/Send it/.test(s.button), `button back to "${s.button}"`)
    const role = await p.$eval('.sf-api-error', e => e.getAttribute('role'))
    r.check(role === 'alert', 'API error is in a role=alert region')
    await shot(p, '1440-api-error')

    await mockApi(p, 'abort')
    await p.click('.sf-send'); await p.waitForTimeout(600); s = await state(p)
    r.check(/reach the server/i.test(s.apiError) && s.values['contact-name'] === 'Ada Lovelace', `network failure → "${s.apiError.slice(0, 40)}…", input kept`)

    await mockApi(p, { status: 400, body: { error: 'Please check the highlighted fields.', errors: { email: 'That doesn’t look like an email address. Check for typos?' } } })
    await p.click('.sf-send'); await p.waitForTimeout(400); s = await state(p)
    r.check(s.errors['contact-email-error'] && s.focus === 'INPUT#contact-email' && !s.apiError, `server field errors → shown inline, focus ${s.focus}`)
    await p.context().close()
  }

  // ── Sent state, text-only rendering, "send another", screenshots
  r.section('SENT')
  for (const w of [1440, 375]) {
    const p = await open(browser, w)
    await go(p)
    await mockApi(p)
    const name = 'Ada Lovelace'
    // Markup in the message must come back as text
    await fill(p, { name, topic: 'freelance', message: 'Build me a <b>site</b> <img src=x onerror="window.__xss=1">', email: 'ada@example.com' })
    await p.click('.sf-send')
    await p.waitForTimeout(1800)
    const s = await state(p)
    const v = await p.evaluate(() => ({
      label: document.querySelector('.ss-label')?.textContent.replace(/\s+/g, ' ').trim(),
      title: document.querySelector('.ss-title')?.textContent.replace(/\s+/g, ' ').trim(),
      line: document.querySelector('.ss-line')?.textContent.replace(/\s+/g, ' ').trim(),
      card: document.querySelector('.ss-card-text')?.textContent.replace(/\s+/g, ' ').trim(),
      img: !!document.querySelector('.ss img, .ss b'),
      xss: window.__xss,
      nameColor: getComputedStyle(document.querySelector('.ss-title em')).color,
      nameFont: getComputedStyle(document.querySelector('.ss-title em')).fontFamily,
      tilt: getComputedStyle(document.querySelector('.ss-card')).transform,
      cardEm: getComputedStyle(document.querySelector('.ss-card-text em')).color,
      dark: getComputedStyle(document.querySelectorAll('.tone-layer')[2]).opacity,
    }))
    r.check(s.sent && s.fg === 'dark' && v.dark === '1', `${w}: tone dark (fg=${s.fg}, layer=${v.dark})`)
    r.check(/^Message sent · \d\d:\d\d, Yogyakarta$/i.test(v.label), `${w}: label "${v.label}"`)
    r.check(v.title?.startsWith('Got it,') && v.title.includes(name), `${w}: title "${v.title?.slice(0, 50)}"`)
    r.check(/Playfair/.test(v.nameFont) && v.nameColor === 'rgb(167, 139, 250)', `${w}: name in Playfair italic light violet`)
    r.check(v.line === 'Thanks for reaching out about a freelance project. I\'ll reply to ada@example.com within a day, usually sooner.', `${w}: "${v.line}"`)
    r.check(v.card?.includes(name) && v.card.includes('<b>site</b> <img src=x') && v.cardEm === 'rgb(91, 33, 182)', `${w}: echo card repeats their sentence in violet`)
    r.check(!v.img && v.xss === undefined, `${w}: visitor text rendered as text, never HTML`)
    r.check(v.tilt !== 'none', `${w}: card tilted (${v.tilt})`)
    r.check(s.focus === 'H2#' && /Message sent\. Thanks, /.test(s.live), `${w}: focus on heading, announced ("${s.live.slice(0, 50)}…")`)
    await shot(p, `${w}-sent`)
    checkContrast(await textContrast(p, '.ct-top'), `${w} sent`)

    await p.click('text=Send another')
    await p.waitForTimeout(1600)
    const s2 = await state(p)
    r.check(s2.form && !s2.sent && Object.values(s2.values).every(x => x === '') && s2.topic === null, `${w}: "Send another" → empty form`)
    r.check(s2.focus === 'INPUT#contact-name' && s2.fg === 'light', `${w}: focus → name (${s2.focus}), tone ${s2.fg}`)
    await p.context().close()
  }

  // ── Copy to clipboard, the pill, the announcement, and the mailto fallback
  r.section('COPY')
  {
    const p = await open(browser, 1440, { permissions: ['clipboard-read', 'clipboard-write'] })
    await go(p)
    await revealAll(p)
    await p.click('.ch-email--js')
    await p.waitForTimeout(400)
    const c = await p.evaluate(async () => ({
      clip: await navigator.clipboard.readText(),
      pill: document.querySelector('.ch-pill')?.textContent,
      tilt: document.querySelector('.ch-pill') && getComputedStyle(document.querySelector('.ch-pill')).transform,
      live: document.querySelector('.ch-email-wrap [role="status"]').textContent,
    }))
    r.check(c.clip === EMAIL, `clipboard has ${c.clip}`)
    r.check(c.pill === 'Copied ✓' && c.tilt && c.tilt !== 'none', `"Copied ✓" pill shown, tilted`)
    r.check(/copied/i.test(c.live), `announced: "${c.live}"`)
    await p.$eval('.ch-email-wrap', el => el.scrollIntoView({ block: 'center' }))
    await shot(p, '1440-copied')
    await p.waitForTimeout(2300)
    const gone = await p.evaluate(() => ({ pill: !!document.querySelector('.ch-pill'), live: document.querySelector('.ch-email-wrap [role="status"]').textContent }))
    r.check(!gone.pill && !gone.live, 'pill and announcement gone after ~2s')
    const hint = await p.$eval('.ch-hint', e => e.innerText.trim())
    r.check(/^Click to copy\. Or open it in your mail app/.test(hint), `hint: "${hint}"`)
    const kbd = await p.evaluate(() => document.querySelector('.ch-email--js').tagName)
    r.check(kbd === 'BUTTON', 'the address is a <button>')
    await p.context().close()
  }
  {
    // No clipboard API: the click opens the mail app instead
    const p = await open(browser, 1440)
    await p.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }) })
    await go(p)
    await revealAll(p)
    await p.evaluate(() => {
      window.__mailto = null
      document.querySelector('.ch-email--nojs').addEventListener('click', e => { window.__mailto = e.currentTarget.href; e.preventDefault() })
    })
    await p.click('.ch-email--js')
    const m = await p.evaluate(() => window.__mailto)
    r.check(m === `mailto:${EMAIL}`, `no clipboard → mailto fallback (${m})`)
    await p.context().close()
  }

  // ── Reduced motion: fades only, tone switches without a crossfade
  r.section('REDUCED MOTION')
  {
    const p = await open(browser, 1440, { reducedMotion: 'reduce' })
    await go(p)
    await mockApi(p)
    await fill(p)
    await p.click('.sf-send')
    const samples = []
    for (let i = 0; i < 12; i++) {
      samples.push(await p.evaluate(() => {
        const el = document.querySelector('.ss')?.parentElement || document.querySelector('form.sf')
        return el ? getComputedStyle(el).transform : 'none'
      }))
      await p.waitForTimeout(80)
    }
    const moved = samples.filter(t => t !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(t))
    r.check(!moved.length, `no transform during the swap (${moved.length ? moved[0] : 'none seen'})`)
    const s = await state(p)
    r.check(s.sent && s.fg === 'dark', `sent, tone ${s.fg}`)
    const dot = await p.$eval('.ct-dot', e => getComputedStyle(e).animationIterationCount)
    r.check(dot === '1', `availability dot doesn't pulse (iterations ${dot})`)
    await p.context().close()
  }

  // ── No JavaScript: a note with the address instead of the form; section 4 complete
  r.section('NO JS')
  for (const w of [1440, 375]) {
    const p = await open(browser, w, { javaScriptEnabled: false })
    await p.goto(BASE + '/contact', { waitUntil: 'load' })
    const n = await p.evaluate(() => {
      const vis = el => !!el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0
      return {
        form: vis(document.querySelector('.sf-wrap')),
        note: vis(document.querySelector('.sf-nojs')),
        noteLink: document.querySelector('.sf-nojs a')?.getAttribute('href'),
        btn: vis(document.querySelector('.ch-email--js')),
        link: vis(document.querySelector('.ch-email--nojs')),
        hint: document.querySelector('.ch-hint').innerText.trim(),
        cards: [...document.querySelectorAll('.ch-card')].filter(c => vis(c) && getComputedStyle(c.closest('[data-reveal]')).opacity === '1').length,
        bottom: vis(document.querySelector('.ch-bottom')),
        h1: getComputedStyle(document.querySelector('h1').closest('[data-reveal]')).opacity,
        clock: document.querySelector('.ct-clock').textContent,
      }
    })
    r.check(!n.form && n.note && n.noteLink === `mailto:${EMAIL}`, `${w}: form hidden, note with mailto shown`)
    r.check(!n.btn && n.link, `${w}: copy button swapped for a mailto link`)
    r.check(/^Open it in your mail app/.test(n.hint), `${w}: hint "${n.hint}"`)
    r.check(n.cards === 3 && n.bottom && n.h1 === '1', `${w}: cards, bottom row and title visible`)
    r.check(n.clock === '--:--', `${w}: clock keeps its placeholder (${n.clock})`)
    const o = await overflow(p)
    r.check(o.scroll <= 0, `${w}: no overflow (+${o.scroll})`)
    await shot(p, `${w}-nojs`, true)
    await p.context().close()
  }

  // ── Curtain: in from the navbar, out through "See my work"
  r.section('CURTAIN')
  {
    const ARM = () => {
      const el = document.querySelector('.page-curtain')
      const t0 = performance.now()
      const trace = { visibleFrames: 0, start: null, end: null }
      window.__trace = trace
      const tick = () => {
        const cs = getComputedStyle(el)
        const t = performance.now() - t0
        if (cs.visibility === 'visible') { if (trace.start === null) trace.start = t; trace.visibleFrames++; requestAnimationFrame(tick) }
        else if (trace.start === null && t < 1500) requestAnimationFrame(tick)
        else trace.end = t
      }
      requestAnimationFrame(tick)
    }
    const settle = async p => { await p.waitForFunction(() => window.__trace && window.__trace.end !== null, null, { timeout: 6000 }).catch(() => {}); await p.waitForTimeout(300) }
    const p = await open(browser, 1440)
    await go(p, '/about')
    await p.evaluate(ARM)
    await p.click('nav.nav-root a[href="/contact"]')
    await settle(p)
    let t = await p.evaluate(() => window.__trace)
    let s = await state(p)
    r.check(s.path === '/contact' && t.visibleFrames > 5 && s.focus === 'H1#', `/about → /contact: curtain ${t.visibleFrames} frames, focus ${s.focus}`)
    await p.waitForTimeout(600)
    await mockApi(p)
    await fill(p)
    await p.click('.sf-send')
    await p.waitForTimeout(1600)
    await p.evaluate(ARM)
    await p.click('text=See my work')
    await settle(p)
    t = await p.evaluate(() => window.__trace)
    s = await state(p)
    r.check(s.path === '/work' && t.visibleFrames > 5 && s.fg === 'light', `sent → "See my work": curtain ${t.visibleFrames} frames, landed ${s.path}, tone ${s.fg}`)
    r.check(!p.__errors.length, `no console errors${p.__errors.length ? ' — ' + p.__errors.join(' / ') : ''}`)
    await p.context().close()
  }

  // ── Contrast on every text colour: empty form, picked chip, errors, channels
  r.section('CONTRAST')
  for (const w of [1440, 375]) {
    const p = await open(browser, w)
    await go(p)
    await p.check('input[value="freelance"]', { force: true })
    await p.fill('#contact-name', 'Ada')
    await p.click('.sf-send'); await p.waitForTimeout(200)
    checkContrast(await textContrast(p, '.ct-top'), `${w} form`)
    await revealAll(p)
    checkContrast(await textContrast(p, '.ch'), `${w} channels`)
    await p.context().close()
  }

  await browser.close()
  r.done()
})()
