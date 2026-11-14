// Shared settings for the e2e suites. The runner (run.mjs) sets BASE and MODE.
import path from 'node:path'
import fs from 'node:fs'

/** Server under test, no trailing slash. Default: `pnpm dev` on :3000 */
export const BASE_URL = (process.env.BASE || 'http://localhost:3000').replace(/\/$/, '')
/** 'dev' or 'prod': labels artifacts and gates checks that only make sense in one mode (e.g. prefetch) */
export const MODE = process.env.MODE || (BASE_URL.includes(':3199') ? 'prod' : 'dev')

/** Screenshots and other output: tests/e2e/.artifacts/<mode>/<suite> (gitignored) */
export function artifacts(suite) {
  const dir = path.join(import.meta.dirname, '.artifacts', MODE, suite)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * Feature flags, read from src/lib/features.ts (the one place they're set), so suites skip the
 * checks for sections that are switched off
 */
const featuresSrc = fs.readFileSync(path.join(import.meta.dirname, '../../src/lib/features.ts'), 'utf8')
const flag = name => new RegExp(`export const ${name}\\s*=\\s*true\\b`).test(featuresSrc)
export const FEATURES = { cities: flag('SHOW_CITIES') }

/** Skip the once-per-session intro loader */
export const SKIP_LOADER = () => { try { sessionStorage.setItem('niko_session_loaded', '1') } catch {} }

/** Tally of pass/fail lines; call done() at the end to print and set the exit code */
export function reporter() {
  let failures = 0, checks = 0
  return {
    check(ok, msg) { checks++; if (!ok) failures++; console.log(`  ${ok ? 'PASS' : 'FAIL'} ${msg}`); return ok },
    info(msg) { console.log(`    ${msg}`) },
    section(title) { console.log(`=== ${title}`) },
    done() { console.log(`\n${checks} checks, ${failures} failure(s)`); process.exitCode = failures ? 1 : 0 },
  }
}

/** WCAG relative luminance and contrast */
export function luminance([r, g, b]) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
export const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
export const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
