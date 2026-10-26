# Niko Pranata — Portfolio

Personal portfolio of Niko Pranata, a CS student and frontend developer based in Yogyakarta, Indonesia.
Live at **[nikopranata.vercel.app](https://nikopranata.vercel.app)**.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, statically prerendered pages)
- TypeScript (strict)
- Framer Motion for scroll-linked and entrance animation; GSAP for the menu marquee (lazy-loaded)
- Tailwind CSS v4 (base layer)
- Contact form sent through [Resend](https://resend.com) from a Route Handler
- Deployed on Vercel

## How it's built

- **Scroll choreography.** The home page is a sequence of pinned scenes driven by `useScroll` and
  `useTransform`: the hero cards fly apart, the work title shrinks into the project list, and a
  statement is knocked off-screen by "GOT A PROJECT?".
- **Reduced motion.** `MotionConfig reducedMotion="user"` covers declarative animations. Scroll-linked
  scenes branch on a hydration-safe `usePrefersReducedMotion()` hook and crossfade in place instead of
  moving.
- **Works without JavaScript.** Entrance reveals are marked `data-reveal`, and a `<noscript>` style
  shows them, so content is never stuck at `opacity: 0`.
- **No loader flash.** An inline `<head>` script decides before first paint whether to show the intro
  loader (first visit per session, never with reduced motion). Any input skips it.
- **Navbar contrast.** The navbar samples the painted background under itself with
  `elementsFromPoint`, so it stays readable over animated section colours.

## Getting started

Requires Node 20+ and pnpm (the version is pinned in `package.json`).

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm lint
```

### Environment variables

The contact form needs these (see `.env.example`). Without them the form shows an error and offers the
email address instead.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_EMAIL` | Inbox that receives messages |
| `CONTACT_FROM` | Optional sender; must be on a domain verified in Resend (defaults to `onboarding@resend.dev`) |

## Project structure

```
src/
  app/          routes, metadata files (robots, sitemap, share image), /api/contact
  components/   page sections and UI pieces
  hooks/        shared hooks (usePrefersReducedMotion)
  lib/          site constants, metadata helper, loader boot script
public/         images and fonts
```
