'use client'

import { motion } from 'framer-motion'

/* ── data ─────────────────────────────────────────────────── */
type Tech = { name: string; icon: string; isVercel?: boolean }

const FRONTEND: Tech[] = [
  { name: 'Next.js',       icon: 'devicon-nextjs-plain' },
  { name: 'TypeScript',    icon: 'devicon-typescript-plain colored' },
  { name: 'React',         icon: 'devicon-react-original colored' },
  { name: 'Tailwind',      icon: 'devicon-tailwindcss-plain colored' },
  { name: 'Framer Motion', icon: 'devicon-framermotion-original' },
  { name: 'Swift',         icon: 'devicon-swift-plain colored' },
]

const BACKEND: Tech[] = [
  { name: 'Python',   icon: 'devicon-python-plain colored' },
  { name: 'Java',     icon: 'devicon-java-plain colored' },
  { name: 'PHP',      icon: 'devicon-php-plain colored' },
  { name: 'Supabase', icon: 'devicon-supabase-plain colored' },
  { name: 'MySQL',    icon: 'devicon-mysql-plain colored' },
  { name: 'Firebase', icon: 'devicon-firebase-plain colored' },
]

const TOOLS: Tech[] = [
  { name: 'Figma',   icon: 'devicon-figma-plain colored' },
  { name: 'Git',     icon: 'devicon-git-plain colored' },
  { name: 'GitHub',  icon: 'devicon-github-plain' },
  { name: 'VS Code', icon: 'devicon-vscode-plain colored' },
]

const ENV: Tech[] = [
  { name: 'Vercel',    icon: '',                              isVercel: true },
  { name: 'Xcode',     icon: 'devicon-xcode-plain colored' },
  { name: 'WordPress', icon: 'devicon-wordpress-plain colored' },
]

/* ── shared anim config ───────────────────────────────────── */
const CELL_ANIM = {
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, amount: 0.1 },
}

/* ── sub-components ──────────────────────────────────────── */
function CategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily:    'var(--font-display)',
      fontSize:      11,
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color:         '#888',
      marginBottom:  40,
      marginTop:     0,
    }}>
      {children}
    </p>
  )
}

function TechItem({
  tech,
  iconSize,
  light,
}: {
  tech: Tech
  iconSize: number
  light?: boolean
}) {
  return (
    <div className="stack-tech-item">
      {tech.isVercel ? (
        <span className="stack-vercel-mark">▲</span>
      ) : (
        <i
          className={`${tech.icon} ${light ? 'stack-icon-light' : 'stack-icon'}`}
          style={{ fontSize: iconSize, lineHeight: 1, display: 'block' }}
        />
      )}
      <span className={`stack-tech-name${light ? ' stack-tech-name-light' : ''}`}>
        {tech.name}
      </span>
    </div>
  )
}

/* ── main ────────────────────────────────────────────────── */
export default function Stack() {
  return (
    <section
      id="tech-stack"
      style={{
        background: '#f8f8f5',
        padding:    '120px 60px',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* Title */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            16,
        marginBottom:   80,
      }}>
        <span style={{ fontSize: 24, color: '#2563eb' }}>✦</span>
        <span style={{
          fontFamily: 'var(--font-aktura)',
          fontSize:   42,
          color:      '#0a0a0a',
          lineHeight: 1,
        }}>
          stack
        </span>
        <span style={{ fontSize: 24, color: '#2563eb' }}>✦</span>
      </div>

      {/* Magazine grid */}
      <div
        className="stack-grid"
        style={{
          display:             'grid',
          gridTemplateColumns: '2fr 1.4fr 1fr',
          gap:                 2,
          maxWidth:            1400,
          margin:              '0 auto',
          border:              '1.5px solid #0a0a0a',
          background:          '#0a0a0a',
        }}
      >
        {/* Cell 1 — FRONTEND (spans both rows) */}
        <motion.div
          className="stack-cell"
          {...CELL_ANIM}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0 }}
          style={{
            gridColumn: 1,
            gridRow:    '1 / 3',
            padding:    40,
            background: '#f8f8f5',
            overflow:   'hidden',
            position:   'relative',
          }}
        >
          <CategoryLabel>Frontend</CategoryLabel>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 32,
          }}>
            {FRONTEND.map(t => <TechItem key={t.name} tech={t} iconSize={40} />)}
          </div>
        </motion.div>

        {/* Cell 2 — BACKEND */}
        <motion.div
          className="stack-cell"
          {...CELL_ANIM}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            gridColumn: 2,
            gridRow:    1,
            padding:    40,
            background: '#f8f8f5',
            overflow:   'hidden',
            position:   'relative',
          }}
        >
          <CategoryLabel>Backend</CategoryLabel>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap:                 28,
          }}>
            {BACKEND.map(t => <TechItem key={t.name} tech={t} iconSize={36} />)}
          </div>
        </motion.div>

        {/* Cell 3 — TOOLS */}
        <motion.div
          className="stack-cell"
          {...CELL_ANIM}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            gridColumn: 2,
            gridRow:    2,
            padding:    40,
            background: '#f8f8f5',
            overflow:   'hidden',
            position:   'relative',
          }}
        >
          <CategoryLabel>Tools</CategoryLabel>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap:                 24,
          }}>
            {TOOLS.map(t => <TechItem key={t.name} tech={t} iconSize={32} />)}
          </div>
        </motion.div>

        {/* Cell 4 — ENV (dark accent, spans both rows) */}
        <motion.div
          {...CELL_ANIM}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{
            gridColumn: 3,
            gridRow:    '1 / 3',
            background: '#0a0a0a',
            overflow:   'hidden',
            position:   'relative',
          }}
        >
          {/* Rotated watermark */}
          <span style={{
            position:      'absolute',
            top:           '50%',
            left:          '50%',
            transform:     'translate(-50%, -50%) rotate(-90deg)',
            whiteSpace:    'nowrap',
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(32px, 4vw, 56px)',
            fontWeight:    700,
            color:         '#f8f8f5',
            opacity:       0.15,
            letterSpacing: '-0.03em',
            pointerEvents: 'none',
            userSelect:    'none',
          }}>
            TOOLS &amp; ENV
          </span>
          {/* Items */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           20,
            padding:       40,
            position:      'relative',
          }}>
            {ENV.map(t => <TechItem key={t.name} tech={t} iconSize={28} light />)}
          </div>
        </motion.div>
      </div>

      {/* ── styles ────────────────────────────────────────── */}
      <style>{`
        .stack-cell {
          transition: background 0.3s ease;
        }
        .stack-cell:hover {
          background: #f0ede8 !important;
        }
        .stack-tech-item {
          display:        flex;
          flex-direction: column;
          align-items:    flex-start;
          gap:            12px;
          cursor:         default;
        }
        .stack-icon {
          color:      #0a0a0a;
          filter:     grayscale(100%);
          transition: filter 0.3s ease;
        }
        .stack-tech-item:hover .stack-icon {
          filter: grayscale(0%);
        }
        .stack-icon-light {
          color:      #f8f8f5;
          filter:     grayscale(100%) brightness(2);
          transition: filter 0.3s ease;
        }
        .stack-tech-item:hover .stack-icon-light {
          filter: grayscale(0%) brightness(1.5);
        }
        .stack-vercel-mark {
          font-family: var(--font-display);
          font-size:   28px;
          color:       #f8f8f5;
          line-height: 1;
          display:     block;
        }
        .stack-tech-name {
          font-family:    var(--font-sans);
          font-size:      12px;
          color:          #0a0a0a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition:     color 0.3s ease;
        }
        .stack-tech-item:hover .stack-tech-name {
          color: #2563eb;
        }
        .stack-tech-name-light {
          color: rgba(248, 248, 245, 0.7);
        }
        .stack-tech-item:hover .stack-tech-name-light {
          color: #f8f8f5;
        }
        @media (max-width: 900px) {
          .stack-grid {
            grid-template-columns: 1fr !important;
          }
          .stack-grid > * {
            grid-column: 1 !important;
            grid-row: auto !important;
          }
        }
      `}</style>
    </section>
  )
}
