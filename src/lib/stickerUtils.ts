const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

export interface StickerData {
  name: string
  img:  string
  cat:  'frontend' | 'backend' | 'tools'
  x:    number
  y:    number
  rotate:        number
  peelDirection: number
}

const ROTS:  readonly number[] = [-8, -4, 0, 4, 8]
const PEELS: readonly number[] = [0, 180, 0, 180, 0]

export const TECH_STICKERS: StickerData[] = [
  // ── frontend (5) — x: 100 280 460 640 820 ────────────────────────────
  { name: 'Next.js',    img: `${BASE}/nextjs/nextjs-original.svg`,           cat: 'frontend', x: 100, y: -15, rotate: ROTS[0], peelDirection: PEELS[0] },
  { name: 'TypeScript', img: `${BASE}/typescript/typescript-original.svg`,   cat: 'frontend', x: 280, y:  15, rotate: ROTS[1], peelDirection: PEELS[1] },
  { name: 'React',      img: `${BASE}/react/react-original.svg`,             cat: 'frontend', x: 460, y: -15, rotate: ROTS[2], peelDirection: PEELS[2] },
  { name: 'Tailwind',   img: `${BASE}/tailwindcss/tailwindcss-original.svg`, cat: 'frontend', x: 640, y:  15, rotate: ROTS[3], peelDirection: PEELS[3] },
  { name: 'Swift',      img: `${BASE}/swift/swift-original.svg`,             cat: 'frontend', x: 820, y: -15, rotate: ROTS[4], peelDirection: PEELS[4] },
  // ── backend (6) — x: 60 220 380 540 700 860 ──────────────────────────
  { name: 'Python',   img: `${BASE}/python/python-original.svg`,    cat: 'backend', x:  60, y: -15, rotate: ROTS[0], peelDirection: PEELS[0] },
  { name: 'Java',     img: `${BASE}/java/java-original.svg`,         cat: 'backend', x: 220, y:  15, rotate: ROTS[1], peelDirection: PEELS[1] },
  { name: 'PHP',      img: `${BASE}/php/php-original.svg`,           cat: 'backend', x: 380, y: -15, rotate: ROTS[2], peelDirection: PEELS[2] },
  { name: 'Supabase', img: `${BASE}/supabase/supabase-original.svg`, cat: 'backend', x: 540, y:  15, rotate: ROTS[3], peelDirection: PEELS[3] },
  { name: 'MySQL',    img: `${BASE}/mysql/mysql-original.svg`,       cat: 'backend', x: 700, y: -15, rotate: ROTS[4], peelDirection: PEELS[4] },
  { name: 'Firebase', img: `${BASE}/firebase/firebase-plain.svg`,    cat: 'backend', x: 860, y:  15, rotate: ROTS[0], peelDirection: PEELS[0] },
  // ── tools (5) — x: 200 380 560 740 920 ───────────────────────────────
  { name: 'Figma',   img: `${BASE}/figma/figma-original.svg`,   cat: 'tools', x: 200, y: -15, rotate: ROTS[0], peelDirection: PEELS[0] },
  { name: 'Git',     img: `${BASE}/git/git-original.svg`,        cat: 'tools', x: 380, y:  15, rotate: ROTS[1], peelDirection: PEELS[1] },
  { name: 'GitHub',  img: `${BASE}/github/github-original.svg`,  cat: 'tools', x: 560, y: -15, rotate: ROTS[2], peelDirection: PEELS[2] },
  { name: 'VS Code', img: `${BASE}/vscode/vscode-original.svg`,  cat: 'tools', x: 740, y:  15, rotate: ROTS[3], peelDirection: PEELS[3] },
  { name: 'Xcode',   img: `${BASE}/xcode/xcode-original.svg`,    cat: 'tools', x: 920, y: -15, rotate: ROTS[4], peelDirection: PEELS[4] },
]
