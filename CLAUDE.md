@AGENTS.md

# Portfolio Project — Claude Code Instructions

## About this project
Personal portfolio and project showcase for Niko Pranata, 
a CS student and aspiring frontend developer.
## Tech stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion (for animations); GSAP only in the lazy-loaded menu
- React Bits components (copy-pasted from reactbits.dev)
- Deployed on Vercel

## Design philosophy
- No generic AI aesthetics — no purple gradients, no Inter font, no card-on-card layouts
- Every component must feel intentional and memorable
- Mobile-first, fully responsive
- One fixed palette: cream (#f8f8f5) pages with near-black (#0a0a0a) sections; no theme switching
- Respect prefers-reduced-motion (MotionConfig + usePrefersReducedMotion)

## Project structure
- src/app/ — pages and layouts
- src/components/ — reusable components
- src/lib/ — utilities
- public/ — static assets

## Commands
- pnpm dev — start dev server
- pnpm build — production build
- pnpm lint — check for errors

## Internship target
Frontend web developer internship. The portfolio itself 
should demonstrate real frontend skill — clean code, 
great design, working animations, responsive layout.