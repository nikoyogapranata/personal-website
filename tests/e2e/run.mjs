// Runs the e2e suites in order against one server and reports a summary.
//
//   pnpm test:e2e                 against BASE (default http://localhost:3000, i.e. `pnpm dev`)
//   pnpm test:e2e:prod            builds, starts `next start` on :3199, runs, stops it
//   pnpm test:e2e -- about loader only the named suites
//
// Needs Google Chrome installed (suites launch it through Playwright's `channel: 'chrome'`).
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'

const SUITES = ['loader', 'transitions', 'leftover', 'prepush', 'contact', 'about']
const args = process.argv.slice(2)
const prod = args.includes('--prod')
const only = args.filter(a => !a.startsWith('--'))
const suites = only.length ? SUITES.filter(s => only.includes(s)) : SUITES
const root = path.resolve(import.meta.dirname, '../..')
const shell = process.platform === 'win32'

async function waitFor(url, ms = 120_000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    try { if ((await fetch(url)).ok) return true } catch {}
    await new Promise(r => setTimeout(r, 1000))
  }
  return false
}

let server = null
let base = (process.env.BASE || 'http://localhost:3000').replace(/\/$/, '')
let mode = process.env.MODE || 'dev'

if (prod) {
  base = 'http://localhost:3199'
  mode = 'prod'
  console.log('▶ next build')
  if (spawnSync('pnpm', ['build'], { cwd: root, stdio: 'inherit', shell }).status !== 0) process.exit(1)
  console.log('▶ next start -p 3199')
  server = spawn('pnpm', ['exec', 'next', 'start', '-p', '3199'], { cwd: root, stdio: 'ignore', shell })
}

const stopServer = () => {
  if (!server) return
  // pnpm → node → next: kill the whole tree
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
  else server.kill('SIGTERM')
  server = null
}
process.on('exit', stopServer)
process.on('SIGINT', () => { stopServer(); process.exit(130) })

if (!(await waitFor(base + '/'))) {
  console.error(`✗ No server at ${base}. Start one with \`pnpm dev\`, or use \`pnpm test:e2e:prod\`.`)
  process.exit(1)
}

const results = []
for (const s of suites) {
  console.log(`\n▶ ${s} (${mode}, ${base})`)
  const t0 = Date.now()
  const r = spawnSync(process.execPath, [path.join(import.meta.dirname, `${s}.mjs`)], {
    cwd: root, stdio: 'inherit', env: { ...process.env, BASE: base, MODE: mode },
  })
  results.push({ s, ok: r.status === 0, sec: Math.round((Date.now() - t0) / 1000) })
}

stopServer()
console.log(`\n── e2e summary (${mode}) ──`)
for (const { s, ok, sec } of results) console.log(`${ok ? '✓' : '✗'} ${s.padEnd(12)} ${sec}s`)
process.exitCode = results.every(r => r.ok) ? 0 : 1
