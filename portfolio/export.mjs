// Renders portfolio/index.html to portfolio/portfolio.pdf with Playwright.
// Usage: pnpm export:portfolio
// Slides are 16:9 at 1920×1080 (Canva's standard), set by the @page rule in styles.css;
// the size passed to page.pdf below matches it.

import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const input = join(here, 'index.html')
const output = join(here, 'portfolio.pdf')

// Prefer the installed Chrome (as the e2e tests do); fall back to Playwright's own Chromium
async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome' })
  } catch {
    return await chromium.launch()
  }
}

const browser = await launch()
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.emulateMedia({ media: 'print' })
  await page.goto(pathToFileURL(input).href, { waitUntil: 'networkidle' })

  // Fonts and images must be ready before printing, or the PDF falls back to system faces
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})))
  })

  const missing = await page.evaluate(() =>
    ['Clash Display', 'Space Grotesk', 'Playfair Display']
      .filter(f => ![...document.fonts].some(ff => ff.family.replace(/"/g, '') === f && ff.status === 'loaded')),
  )
  if (missing.length) console.warn(`Warning: fonts not loaded: ${missing.join(', ')}`)

  await page.pdf({
    path: output,
    width: '1920px',
    height: '1080px',
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
  })
  console.log(`Wrote ${output}`)
} finally {
  await browser.close()
}
