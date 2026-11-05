'use client'

import { motion } from 'framer-motion'
import { reveal, STAGGER_TIGHT } from '@/lib/motion'
import { EXPERIENCES, SKILL_CATEGORIES, type ExperienceRole } from '@/data'

const LABEL: React.CSSProperties = {
  fontFamily:    'var(--font-display)',
  fontWeight:    400,
  fontSize:      'var(--text-small)',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color:         'var(--color-text-faint)',
  whiteSpace:    'nowrap',
  flexShrink:    0,
  width:         '10em',
}

const DIVIDER: React.CSSProperties = {
  width:      '100%',
  height:     '0.5px',
  background: '#d8d5d0',
}

const GROUP_LABEL: React.CSSProperties = {
  display:       'block',
  fontFamily:    'var(--font-display)',
  fontWeight:    400,
  fontSize:      'var(--text-caption)',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color:         'var(--color-text-faint)',
  marginBottom:  'clamp(8px, calc(0.625 * var(--u)), 14px)',
}

const ROLE_TITLE: React.CSSProperties = {
  fontFamily:    'var(--font-display)',
  fontWeight:    600,
  fontSize:      'max(1.125rem, var(--text-h5))',
  color:         'var(--color-text)',
  letterSpacing: '-0.02em',
}

const COMPANY: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontStyle:  'italic',
  fontWeight: 400,
  fontSize:   'max(1rem, calc(var(--text-h5) * 0.8571))',
  color:      'var(--color-accent-secondary)',
}

/** One role: title, optional company or team line, description, and the period on the right */
function RoleRow({ role, subtitle }: { role: ExperienceRole; subtitle?: string }) {
  return (
    <div
      className="te-exp-row"
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        gap:            40,
      }}
    >
      <div className="te-exp-left" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={ROLE_TITLE}>{role.role}</span>
        {subtitle && <span style={COMPANY}>{subtitle}</span>}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          fontSize:   'var(--text-small)',
          color:      'var(--color-text-faint)',
          lineHeight: 1.6,
          maxWidth:   '30rem',
          margin:     0,
        }}>
          {role.description}
        </p>
      </div>

      <span className="te-period" style={{
        fontFamily:    'var(--font-sans)',
        fontSize:      'var(--text-caption)',
        color:         'var(--color-text-faint)',
        whiteSpace:    'nowrap',
        flexShrink:    0,
        letterSpacing: '0.05em',
      }}>
        {role.period}
      </span>
    </div>
  )
}

export default function TechExperience() {
  return (
    <section style={{
      background: 'var(--color-bg)',
      padding:    'var(--section-y) max(var(--page-x), calc((100% - var(--content-max)) / 2))',
      position:   'relative',
    }}>

      {/* ── TECH STACK ── */}
      <div style={{ ...DIVIDER, marginBottom: 'var(--space-l)' }} />

      <div className="te-row" style={{
        display:    'flex',
        alignItems: 'baseline',
        gap:        'clamp(200px, calc(20.8333 * var(--u)), 480px)',
      }}>
        <span style={LABEL}>Tech Stack</span>

        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           'var(--space-m)',
          width:         '100%',
          minWidth:      0,
        }}>
          {SKILL_CATEGORIES.map((group) => (
            <div key={group.title}>
              <span style={GROUP_LABEL}>{group.title}</span>
              <div style={{
                display:    'flex',
                flexWrap:   'wrap',
                gap:        'clamp(6px, calc(0.625 * var(--u)), 14px) 0',
                alignItems: 'baseline',
              }}>
                {group.skills.map((name, i) => (
                  <motion.span
                    key={name}
                    {...reveal({ order: i, stagger: STAGGER_TIGHT })}
                    style={{ display: 'inline-flex', alignItems: 'baseline' }}
                  >
                    <span
                      className="hover-accent"
                      style={{
                        fontFamily:    'var(--font-display)',
                        fontWeight:    500,
                        fontSize:      'var(--text-h5)',
                        color:         'var(--color-text)',
                        letterSpacing: '-0.01em',
                        transition:    'color var(--dur-fast) var(--ease)',
                        cursor:        'default',
                      }}
                    >
                      {name}
                    </span>
                    {i < group.skills.length - 1 && (
                      <span style={{
                        color:    'var(--color-accent-primary)',
                        fontSize: 'calc(var(--text-h5) * 1.2857)',
                        margin:   '0 0.67em',
                        lineHeight: 1,
                      }}>
                        •
                      </span>
                    )}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ ...DIVIDER, margin: 'var(--space-xl) 0' }} />

      {/* ── EXPERIENCE ── */}
      <div className="te-row" style={{
        display:    'flex',
        alignItems: 'flex-start',
        gap:        'clamp(200px, calc(20.8333 * var(--u)), 480px)',
      }}>
        <span style={{ ...LABEL, paddingTop: 4 }}>Experience</span>

        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           0,
          width:         '100%',
        }}>
          {EXPERIENCES.map((entry, i) => (
            <motion.div
              key={entry.id}
              {...reveal({ order: i })}
              style={{
                paddingBottom: 'var(--space-l)',
                paddingTop:    i > 0 ? 'var(--space-l)' : 0,
                borderBottom:  i < EXPERIENCES.length - 1 ? '0.5px solid var(--color-border-light)' : 'none',
              }}
            >
              {entry.roles.length > 1 ? (
                // Several roles at one company: company first, roles stacked under a hairline
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, calc(1.1458 * var(--u)), 26px)' }}>
                  <span style={{ ...COMPANY, fontSize: 'max(1.125rem, var(--text-h5))' }}>{entry.company}</span>
                  <div
                    className="te-exp-roles"
                    style={{
                      display:       'flex',
                      flexDirection: 'column',
                      gap:           'var(--space-m)',
                      borderLeft:    '0.5px solid var(--color-border-light)',
                      paddingLeft:   'clamp(14px, calc(1.25 * var(--u)), 29px)',
                    }}
                  >
                    {entry.roles.map((role) => (
                      <RoleRow key={role.id} role={role} subtitle={role.team} />
                    ))}
                  </div>
                </div>
              ) : (
                <RoleRow role={entry.roles[0]} subtitle={entry.company} />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM DIVIDER ── */}
      <div style={{ ...DIVIDER, marginTop: 'var(--space-xl)' }} />

      <style>{`
        @media (max-width: 900px) {
          .te-row {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .te-row > span:first-child {
            width: auto !important;
            margin-bottom: 16px;
          }
          .te-exp-left {
            width: 100%;
          }
          .te-period {
            margin-top: 8px;
          }
        }
        @media (max-width: 640px) {
          .te-exp-row {
            flex-direction: column;
            gap: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}
