# Portfolio Audit — nikopranata.vercel.app

**Date:** 2026-10-26  **Commit audited:** `326c977` (main, clean tree)
**Method:** I read every file under `src/`, plus the config files, `CLAUDE.md`, `PRODUCT.md` and the root backup files. I ran `pnpm build`, `pnpm lint` and `pnpm audit`, then ran `next build` and `next start` locally. I drove the production build with Playwright (Edge) at 375 / 768 / 1024 / 1280 / 1440 / 1920 px, taking 12 scroll positions on `/` and full-page captures of `/about`, `/work`, `/contact` and a 404 route. I also tested with JS disabled, with `prefers-reduced-motion: reduce`, and with keyboard Tab order. Contrast ratios were computed with the WCAG formula from the actual hex values in code.

No code was changed. The only side effect: `pnpm build` triggered a pnpm 12 auto-install, which created two untracked files, `pnpm-lock.yaml` and `pnpm-workspace.yaml` (see M9).

> **Correction to the brief:** this site does **not** use three.js. `three` and `@types/three` are installed but imported nowhere. The only WebGL code is `ogl` in `src/components/ui/Ribbons.tsx`, and its only consumer (`<RibbonsCursor />`) is commented out in `layout.tsx:87`. The three.js items in the brief (lazy loading, disposal on unmount, the WebGL-unavailable fallback) therefore don't apply. They are covered under "unused dependencies" and L6.

---

## Summary

| # | Severity | Issue | Where |
|---|---|---|---|
| C1 | **Critical** | Contact form says "Message sent" but sends nothing | `src/app/contact/page.tsx:21-25` |
| C2 | **Critical** | `next@16.2.6` has published critical RCE advisories (incl. Image Optimization API, which the site uses) | `package.json:15` |
| H1 | High | Navbar text disappears on dark sections and collides with content | `Navbar.tsx:20-40` |
| H2 | High | "Download Resume" links to `/resume.pdf`, which returns 404 | `contact/page.tsx:14` |
| H3 | High | MENU toggle is a `<div>`: no keyboard access, no ARIA, no Escape | `Navbar.tsx:94-120` |
| H4 | High | Home project rows are `div onClick`, not links: keyboard users can't open projects | `Work.tsx:102-123, 160-182` |
| H5 | High | Zero `prefers-reduced-motion` support despite heavy scroll-driven motion | whole codebase |
| H6 | High | Content is invisible without JS / before hydration (`/work` shows **no projects**) | all `initial={{opacity:0}}` sites |
| H7 | High | Forced 3-second fake loading screen on first visit to any route | `LoadingScreen.tsx` |
| H8 | High | 2–6 MB source PNGs (4000 px), no `sizes`, unoptimized menu backgrounds | `public/`, `Work.tsx:246`, `FlowingMenu.tsx:145` |
| H9 | High | Render-blocking, unpinned third-party CSS (`devicon@latest`) loaded on every page for dead code | `layout.tsx:79-82` |
| H10 | High | Text contrast failures (several at 1.4–2.7:1) | see table in H10 |
| H11 | High | No OG image, sitemap, robots, canonical, favicon.ico (404), structured data; `/contact` has no title; home has no `<h1>` | `layout.tsx:37-68` |
| M1 | Medium | Two different LinkedIn URLs | `Contact.tsx:169` vs `contact/page.tsx:12` |
| M2 | Medium | Horizontal scroll on `/contact` at 375–1440 px | `contact/page.tsx:63-76` |
| M3 | Medium | Form inputs: no label association, `outline: none`, no `name`/`required`/`autocomplete` | `contact/page.tsx:228-281, 338-349` |
| M4 | Medium | Every page is `"use client"`; static copy shipped as JS | 4 pages + all sections |
| M5 | Medium | GSAP (31 KB gz) loaded on every page just for the menu marquee | `Navbar.tsx:6` → `FlowingMenu.tsx:3` |
| M6 | Medium | Always-on paint cost: full-viewport blend-mode grain, perpetual footer rAF, animated blur | `FilmGrain.tsx`, `Footer.tsx:18`, `Hero.tsx:146` |
| M7 | Medium | Unused font (Aktura) preloaded on every page | `layout.tsx:30-35` |
| M8 | Medium | `pnpm lint` fails: 3 errors, 197 warnings (most from un-ignored folders) | `eslint.config.mjs` |
| M9 | Medium | Package-manager mismatch; `pnpm build` aborts with `ERR_PNPM_IGNORED_BUILDS` | `package-lock.json`, pnpm 12 |
| M10 | Medium | Large amount of dead code, backup files and unused assets (~25 MB) committed | see list |
| M11 | Medium | Unused dependencies: `three`, `@types/three`, `ogl`, `clsx`, `tailwind-merge`, `motion` | `package.json` |
| M12 | Medium | Design tokens defined but bypassed (124 hex literals vs 24 token uses); stale "blue" naming | everywhere |
| M13 | Medium | Styling architecture: 265 inline style objects, 13 runtime `<style>` tags, 39 `!important` | everywhere |
| M14 | Medium | Docs claim dark mode / "dark-first"; there is no theme at all | `CLAUDE.md`, `PRODUCT.md:39` |
| M15 | Medium | Default unstyled 404; no `error.tsx` / `global-error.tsx` | `src/app/` |
| M16 | Medium | Home page is ~13 viewport heights of scroll before contact info; navbar overlaps "See all projects" | `page.tsx:37`, `Work.tsx:56`, `Statement.tsx:57` |
| M17 | Medium | Duplicated logic and data (two project lists, copy-pasted rows, copy-pasted page headers) | `Work.tsx`, `work/page.tsx`, `lib/data.ts` |
| L1 | Low | Screen-reader noise: marquee text read 6×, decorative images with alt text, fake-clickable hero cards | `Footer.tsx:61`, `Hero.tsx` |
| L2 | Low | Small text: 11 px form labels, 12 px footer/dates, 13 px nav | various |
| L3 | Low | Internal links use `<a href>` → full page reloads | `Work.tsx:268`, `FlowingMenu.tsx:116` |
| L4 | Low | `window.open(url, '_blank')` without `noopener` | `Work.tsx:122, 181` |
| L5 | Low | Hardcoded `© 2025` (it's 2026) | `Footer.tsx:114` |
| L6 | Low | `Ribbons` (ogl) never disposes GL context/programs on unmount | `Ribbons.tsx:227-234` |
| L7 | Low | Navbar scroll handler does DOM queries + layout reads per scroll event | `Navbar.tsx:20-34` |
| L8 | Low | ESLint 9 is EOL; other packages behind | `package.json` |
| L9 | Low | `.claude/settings.local.json` committed (machine-local, contains local paths and broad allow rules) | `.claude/` |
| L10 | Low | Stale docs: CLAUDE.md says Next.js 15; README is create-next-app boilerplate | `CLAUDE.md:10`, `README.md` |
| L11 | Low | Off-palette magenta asterisk from `hue-rotate(40deg)` | `Footer.tsx:39`, page headers |

---

## Build & lint results

**`pnpm build`** did not reach Next. pnpm 12.3.4 runs a dependency check before scripts, which reinstalled `node_modules` and then aborted:

```
Error: ERR_PNPM_IGNORED_BUILDS
  Ignored build scripts: sharp@0.34.5, unrs-resolver@1.12.2
```

`next build` run directly **succeeds** with no warnings. All 5 routes (`/`, `/_not-found`, `/about`, `/contact`, `/work`) are static. Total client JS is **~1.0 MB raw / ~303 KB gzip**: framer-motion is spread over ~6 chunks totalling ~92 KB gz, and GSAP is its own 31.5 KB gz chunk. Page weight measured in the browser was 1.14 MB (404) to 1.83 MB (`/` at ≥1280 px).

**`pnpm lint`** exits 1 with **3 errors, 197 warnings**:
- `LoadingScreen.tsx:31`: `react-hooks/set-state-in-effect` (error)
- `RibbonsCursor.tsx:13`: `react-hooks/set-state-in-effect` (error, dead file)
- `StickerPeel.tsx:45`: `no-explicit-any` (error, dead file)
- `layout.tsx:4`: unused `RibbonsCursor` import
- `Contact.tsx:87`: unused `eslint-disable` directive
- The remaining ~190 warnings come from `.agents/skills/**`, `.claude/skills/**` and `backup-work.tsx`, which ESLint is not told to ignore.

---

## Critical

### C1. The contact form silently discards messages
**Where:** `src/app/contact/page.tsx:21-25` (`handleSubmit`), success UI at `:203-221`
**What:** `handleSubmit` calls `preventDefault()` and then `setSubmitted(true)` (`// TODO: connect to email service`). Nothing is sent anywhere, but the user sees "✓ Message sent. I'll be in touch soon."
**Why it matters:** this is the single highest-value conversion on the site (PRODUCT.md: "Success means a recruiter reaches out"). A recruiter who uses the form believes they made contact and never hears back. That is worse than having no form.
**Fix:** either wire it up (a Server Action or Route Handler posting to Resend / Formspree / Web3Forms, with loading, error and success states), or remove the form and keep the `mailto:` link until then. Don't ship the fake success state in either case.

### C2. Next.js 16.2.6 has critical published advisories
**Where:** `package.json:15`
**What:** `pnpm audit` reports 27 advisories (5 critical, 11 high), almost all in `next` and its bundled `postcss`/`sharp`. The criticals include *unauthenticated RCE in the Image Optimization API (AVIF and SVG inputs)*, *RCE in `next/og` ImageResponse*, and *RCE on Windows-hosted servers*. They are fixed in 16.3.3 to 16.4.1; the current release is **16.4.3**.
**Why it matters:** the site uses `next/image`, so the image optimizer is live. On Vercel, image optimization runs on Vercel's infrastructure, which likely shields this specific deployment from the optimizer RCEs. Even so, a portfolio that ships known-critical CVEs is a bad signal to any reviewer who runs `npm audit` on the repo, and the fix costs almost nothing.
**Fix:** `pnpm add next@16.4.3 eslint-config-next@16.4.3`, rebuild, re-run `pnpm audit`. Read the 16.3/16.4 notes in `node_modules/next/dist/docs/` first, as AGENTS.md requires.

---

## High

### H1. Navbar becomes invisible or illegible over much of the home page
**Where:** `src/components/sections/Navbar.tsx:20-40`
**What:** `isDark` is only true when the nav overlaps `#tech-stack` or `#work`. `#tech-stack` exists only in the dead `Stack`/`StackV2` components. The Statement section (turns `#0a0a0a`), Contact (`#0a0a0a`) and Footer (`#0a0a0a`) are not checked, so the nav renders `#0a0a0a` text on a `#0a0a0a` background. Screenshots at `home-*-s080` and `s100` show **no navbar at all**. The nav also has a transparent background, so on mobile it overlaps the flying hero card (`s022`) and the About paragraph (`s030`), and on desktop the centered MENU sits on top of "See all projects" (`home-1440-s060`).
**Why it matters:** for roughly the last third of the home page, a user has no visible way to navigate.
**Fix:** drive the colour from data, not from an ID list. Put `data-nav-theme="dark"` on every dark section and use one `IntersectionObserver` with `rootMargin: '0px 0px -95% 0px'` to read the theme under the nav. Alternatively, use `mix-blend-mode: difference` on the nav text. Also give the nav a background or blur once the page has scrolled past the hero, so text never collides.

### H2. "Download Resume" is a dead link
**Where:** `src/app/contact/page.tsx:14`
**What:** `href: "/resume.pdf"`, but `public/resume.pdf` does not exist. `GET /resume.pdf` returns **404**.
**Why it matters:** a recruiter clicking "Download Resume" on an internship-seeking portfolio and getting a 404 does real damage.
**Fix:** add `public/resume.pdf` (and consider `download="Niko-Pranata-Resume.pdf"`), or remove the link.

### H3. The menu button can't be used from a keyboard
**Where:** `src/components/sections/Navbar.tsx:94-120`
**What:** the MENU toggle is a `<div onClick>`. Tab order (verified) goes `Niko Pranata` → `Contact` and skips MENU entirely. There is no `aria-expanded` or `aria-controls`, no Escape-to-close, no focus moved into the panel, and no focus return on close. The menu panel (`FlowingMenu`) also has no Contact item, and has `Home` while the nav already has "Niko Pranata → top".
**Why it matters:** keyboard and switch users can't reach About or Work from the header (only from the footer at the very bottom of a ~13-screen page). It fails WCAG 2.1.1 and 4.1.2.
**Fix:** use a `<button type="button" aria-expanded={menuOpen} aria-controls="site-menu">`. Close on Escape and on route change, move focus to the first menu link on open, and return it to the button on close.

### H4. Home-page projects are not links
**Where:** `src/components/sections/Work.tsx:102-123` and `:160-182`
**What:** each project row is a `motion.div` with `onClick={() => window.open(project.link, '_blank')}`. It isn't focusable and has no link role, so middle-click, ⌘-click, "copy link" and status-bar URL preview don't work. Verified: the Tab order on `/` jumps from `Contact` straight to `See all projects`.
**Why it matters:** the projects are the content. Keyboard users, screen-reader users and anyone who wants to open several in tabs can't do so from the home page.
**Fix:** render each row as `<motion.a href={project.link} target="_blank" rel="noopener noreferrer">` and remove the `onClick`. Mirror the hover state on `:focus-visible` so keyboard users get the same preview. Collapse the two duplicated map blocks into one (see M17).

### H5. No `prefers-reduced-motion` support anywhere
**Where:** grep finds zero occurrences of `prefers-reduced-motion`, `useReducedMotion` or `MotionConfig` in `src/`.
**What:** with reduced motion requested, the site still plays:
- the 3 s loading counter (verified in Playwright)
- the hero zoom to `scale: 4.5` with a 14 px blur (`Hero.tsx:144-147`)
- cards flying ±300% with ±25° rotation
- a 300vh pinned title that scales 1 → 0.26
- the clip-path expansion and horizontal text crash in Statement (`Statement.tsx:17-44`)
- two perpetual marquees and the pulsing availability dot (`contact/page.tsx:181`)

**Why it matters:** large-scale zoom and parallax are exactly the vestibular triggers this preference exists for. PRODUCT.md:39 explicitly promises "Respect prefers-reduced-motion for all animations".
**Fix:**
1. Wrap the app in `<MotionConfig reducedMotion="user">`. This disables transform animations from `animate`/`whileInView`.
2. Scroll-linked `useTransform` values are *not* covered by that. In `page.tsx`, `Hero`, `Work` and `Statement`, read `useReducedMotion()` and either return static values or render a non-pinned static layout (for example, the hero cards stacked statically, and Statement as plain text without the 450vh scroller).
3. Add a CSS `@media (prefers-reduced-motion: reduce)` block for the `pulse-dot` keyframe and the GSAP and footer marquees (pause them).

### H6. Content is invisible without JavaScript and until hydration
**Where:** every `initial={{ opacity: 0, … }}`. For example `work/page.tsx:142`, `Work.tsx:104`, `about/page.tsx:24,77,156`, `TechExperience.tsx:93,149`, `Contact.tsx:57-82`, `contact/page.tsx:91,198`
**What:** framer-motion server-renders the `initial` state as inline `opacity:0`. Measured with JS disabled:
- `/work`: 10 hidden text blocks. **The page shows a title-less blank area and zero projects** (screenshot `nojs-work.png`).
- `/about`: 36 hidden blocks, including the `<h1>` and the whole tech stack.
- `/`: the project list and "LET'S WORK TOGETHER" are hidden.

On a slow phone the same thing happens for the seconds before hydration finishes.
**Why it matters:** link-preview scrapers, some crawlers, reader modes, people on flaky connections, and anyone whose JS bundle fails to load all see an empty portfolio.
**Fix:** for above-the-fold page headers, don't animate opacity from 0. Animate `y` only, or use `initial={false}` on the server render. For reveal-on-scroll, add a global no-JS escape hatch: `<noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>` plus `data-reveal` on the motion elements. Alternatively, do the reveal with CSS scroll-driven animations, which degrade to visible.

### H7. Forced 3-second loading screen
**Where:** `src/components/ui/LoadingScreen.tsx:8, 26-46`; mounted in `layout.tsx:85`
**What:** on the first visit per session, on *any* route, a full-screen violet panel counts 0 → 100 over a fixed 3000 ms. It then waits 300 ms and plays a 0.8 s exit. That is ~4.1 s before anything is usable. The counter measures elapsed time, not loading. Other problems:
- It locks `body` scroll.
- It mounts in an effect, so the real page paints first and then gets covered (a flash of content).
- It ignores reduced motion.
- `setTimeout` at line 41 is never cleared.
- Line 31 is the lint error.

**Why it matters:** PRODUCT.md says the audience scans "within the first 10 seconds"; this burns 40% of that. A recruiter deep-linking to `/work` from a résumé also gets the loader. It contradicts the anti-reference "flashy intros".
**Fix:** delete it, or limit it to `/`, cap it at ~800 ms, skip it entirely under reduced motion, and decide visibility *before* paint (an inline `<script>` in `<head>` that sets a class on `<html>` from `sessionStorage`) so there's no flash.

### H8. Image weight
**Where:** `public/` sources; usage in `Work.tsx:246`, `work/page.tsx:201`, `about/page.tsx:167`, `FlowingMenu.tsx:145`, `Hero.tsx:212-266`

| File | Dimensions | Size |
|---|---|---|
| `jamusari.png` | 4098×2420 | 6.0 MB |
| `edunovel.png` | 3480×2160 | 6.1 MB |
| `wetrack.png` | 4062×2299 | 3.0 MB |
| `healthsync.png` | 4156×2464 | 2.2 MB |
| `spring.jpg` (menu bg) | 2981×4472 | 2.3 MB |

**What:**
- Every `fill` image has no `sizes` prop, so Next emits `sizes="100vw"` (verified in DOM) and serves 1920–3840 px variants. On `/work` the cards are ~50vw, and the home hover preview is at most 560 px wide.
- The home hover-preview card is `position: fixed` and always "in the viewport", so all four project images download on home-page load even though they're `loading="lazy"`. That is why `/` weighs 1.83 MB vs 1.27 MB for `/about`.
- Menu images (`spring.jpg` etc.) are CSS `background-image`, completely bypassing optimization. Opening the menu downloads the raw 2.3 MB JPEG.
- `Hero.tsx` uses raw `<img>` for `hero.jpeg` and the three PNG icons, with eslint suppressed. These are the LCP-area images.

**Fix:**
- Re-export the project screenshots at ~2400 px wide as WebP/AVIF; that typically cuts them 90%+.
- Add `sizes="(max-width: 640px) 100vw, 50vw"` on `/work` and `sizes="560px"` on the preview.
- Render the preview images only after the first hover, or set `loading="lazy"` with the card `display:none` until hovered.
- Pre-size the menu images to ~400×140, or render them with `next/image`.
- Switch the Hero images to `next/image` with `priority` on the portrait.

### H9. Render-blocking, unpinned third-party stylesheet for unused code
**Where:** `src/app/layout.tsx:79-82`, and `globals.css:21-30` (`.devicon-light`)
**What:** `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css">` is in `<head>` on every page. Devicon classes are only used in `Stack.tsx`, which is dead code. `@latest` means the CSS can change under you at any time.
**Why it matters:** it is a cross-origin, render-blocking request (DNS + TLS + download) before first paint on every page, for zero visual output, plus a small supply-chain exposure.
**Fix:** delete the `<link>` and the `.devicon-light` rules. If icons return later, inline the few SVGs you need.

### H10. Colour-contrast failures
Computed from the code's hex values against their actual backgrounds (WCAG AA: 4.5:1 body text, 3:1 large text and UI boundaries):

| Element | Colours | Ratio | Where |
|---|---|---|---|
| About paragraph words before scroll-reveal | `#ccc` on `#f8f8f5` | **1.51** | `AboutV2.tsx:64` |
| Input underline (the only field boundary) | `#d8d5d0` on `#f8f8f5` | **1.38** | `contact/page.tsx:342` |
| Placeholder text | `#bbb` on `#f8f8f5` | **1.80** | `contact/page.tsx:321` |
| "Tech Stack" / "Experience" labels, dates | `#aaa` on `#f8f8f5` | **2.18** | `TechExperience.tsx:52, 201` |
| Project title hover (violet serif) | `#5b21b6` on `#0a0a0a` | **2.20** | `Work.tsx:139` |
| Footer copyright + nav (dark) | `#555` on `#0a0a0a` | **2.66** | `Footer.tsx:72` |
| Footer copyright + nav (light) | `#999` on `#f8f8f5` | **2.68** | `Footer.tsx:78` |
| Form labels (11 px), contact description, experience copy | `#888` on `#f8f8f5` | **3.33** | `contact/page.tsx:125,189,335`, `TechExperience.tsx:187` |
| Project categories | `#777` on `#0a0a0a` | 4.42 (borderline) | `Work.tsx:146` |

The About reveal is a deliberate effect, but the sticky positioning (`page.tsx:43`, `top: -25vh`) means part of the paragraph can sit on screen at near-invisible contrast. Start the reveal colour at ≥ `#8a8a8a` (≈3.4:1, acceptable for text this large), or reveal with opacity on a readable base colour.
**Fix:** define `--color-text-muted` as `#6b6b6b` or darker on cream and `#9a9a9a` or lighter on near-black, and use those tokens. Use `#f8f8f5`-family or the crimson accent for hover on dark (crimson `#c41e3a` on `#0a0a0a` is also low; test a lightened variant). Give inputs a `#8a8a8a`+ underline.

### H11. SEO and sharing metadata gaps
**Where:** `src/app/layout.tsx:37-68`; no `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.*` or `app/icon.*`
**What (verified over HTTP):**
- `/robots.txt` → 404, `/sitemap.xml` → 404, `/opengraph-image` → 404, `/favicon.ico` → 404. The `favicon.ico` file sits in the repo root, where Next doesn't serve it.
- No `metadataBase`, so relative OG URLs can't resolve; no `og:image`, no `og:url`, no canonical link.
- `twitter.card` is `summary_large_image` but there is no image, so shares on LinkedIn, X and Slack render as a bare text link.
- No JSON-LD `Person` schema (name, jobTitle, sameAs → GitHub/LinkedIn).
- `/contact` has the default title "Niko Pranata | Frontend Web Developer" because the page is a client component with no `layout.tsx` exporting metadata (`/about` and `/work` have one).
- Every page reuses the root description.
- The home page has **no `<h1>`**. The only heading is the `<h2>` "A GLIMPSE OF WHAT I'VE BEEN BUILDING"; the hero name is spans.
- The OG title format "Niko Pranata - Frontend Developer" differs from the `<title>` format "Niko Pranata | …".

**Fix:**
- Set `metadataBase: new URL('https://nikopranata.vercel.app')` and `alternates: { canonical: '/' }`, plus per-route canonicals.
- Add `app/opengraph-image.tsx` (generated after the C2 upgrade) or a static 1200×630 `opengraph-image.png`.
- Add `app/robots.ts` and `app/sitemap.ts`, and move the favicon to `app/icon.png` / `app/favicon.ico`.
- Add `app/contact/layout.tsx` with metadata, plus a per-page `description`.
- Wrap the hero's first card in an `<h1>`, or add a visually hidden `<h1>Niko Pranata — Frontend Web Developer</h1>`.
- Add a JSON-LD `<script>` in the root layout.

---

## Medium

### M1. Conflicting LinkedIn URLs
`Contact.tsx:169` → `linkedin.com/in/nikopranata`; `contact/page.tsx:12` → `linkedin.com/in/nikoyogapranata`. At most one of these is your profile. Verify which, then move all social links into one constant (`src/lib/site.ts`).

### M2. Horizontal scroll on `/contact`
**Where:** `contact/page.tsx:48-76`. Measured `scrollWidth` vs viewport: 388/375, 789/768, 1052/1024, 1315/1280, 1473/1440 (fine at 1920). The `CONTACT` heading is wider than "ABOUT"/"WORK", and with `justify-content: space-between` and `flexShrink: 0` the spark image is pushed past the right edge. It's visible in `contact-375-full.png`.
**Fix:** allow the image to shrink (`flexShrink: 1; minWidth: 0`), or size the heading with `clamp(…, 14vw, …)` for this page, or hide the spark below ~1500 px. Add `overflow-x: clip` on `body` as a safety net, but fix the cause.

### M3. Form accessibility and semantics
**Where:** `contact/page.tsx:228-281, 330-349`
- The four `<label>`s have no `htmlFor` and inputs have no `id`. Playwright found **4 unlabeled fields**, so screen readers announce "edit text" only.
- `outline: "none"` on inputs; the only focus cue is a 0.5 px underline colour change.
- No `name`, `required` or `autoComplete` (`name`, `email`) attributes, and no error states.

**Fix:** associate labels, use `:focus-visible` with a 2 px outline or a 2 px underline, and add `required`, `name` and `autoComplete`. Handle this together with C1.

### M4. Everything is a client component
**Where:** all 4 `page.tsx` files and all 9 live section components start with `"use client"`.
**What:** static copy (about paragraphs, experience list, tech list, footer links, project metadata) is serialized into JS and hydrated. Page-level `"use client"` also prevents per-page `export const metadata` (the cause of `/contact`'s missing title).
**Fix:** make the `page.tsx` files server components. Extract small client islands: a `<Reveal>` wrapper for `whileInView`, `<HoverPreview>`, `<Marquee>`, `<ContactForm>`. The home scroll choreography in `page.tsx` legitimately needs the client, but it can be a `HomeScroll` client component rendered from a server `page.tsx`.

### M5. GSAP shipped globally for one hover effect
**Where:** `Navbar.tsx:6` imports `FlowingMenu`, which imports `gsap` (`FlowingMenu.tsx:3`). Navbar is in the root layout, so a separate 82 KB / 31.5 KB gz chunk loads on every page, though the menu only renders after a click. That leaves two animation libraries for one site.
**Fix:** `const FlowingMenu = dynamic(() => import('../ui/FlowingMenu'), { ssr: false })`. Better still, re-implement its two tweens (marquee loop plus edge-slide) with framer-motion, which is already loaded, and drop `gsap`.

### M6. Continuous rendering cost on low-end devices
- **`FilmGrain.tsx`**: a full-viewport `position: fixed` SVG with `feTurbulence` (3 octaves) and `mix-blend-mode: difference`, at `z-index: 9998`. Blend modes over the whole viewport force the compositor to re-blend every frame of every scroll and animation. It is the most likely cause of jank on low-end Android. **Fix:** render the noise once to a small tiled PNG/WebP (`background: url(grain.webp)`), and drop the blend mode or apply it only where needed.
- **`Footer.tsx:18-23`**: `useAnimationFrame` runs forever on every page, even when the footer is off-screen, and reads `offsetWidth` (a layout read) every frame. **Fix:** a CSS `@keyframes` translate on the duplicated track, paused off-screen via `IntersectionObserver` or `animation-play-state`.
- **`Hero.tsx:146-147`**: animating `filter: blur(0→14px)` on a full-screen layer that is also scaling to 4.5×. Blur cost scales with layer area, so this is the most expensive single frame on the site. **Fix:** fade opacity only, or blur a small pre-scaled layer.
- **`FlowingMenu.tsx:77-82`**: three infinite GSAP tweens run as soon as the menu opens, even for items not hovered.
- **`Statement.tsx`**: six springs plus clip-path animation over 450vh; `clip-path: inset()` animation triggers repaint of the full layer every frame.

### M7. Unused font preloaded on every page
**Where:** `layout.tsx:30-35`. Aktura is loaded via `next/font/local` (which preloads by default; the built filename contains `.p.`, which confirms it) but `--font-aktura` is only referenced in the dead `Stack.tsx:111`. Also, `public/fonts/ClashDisplay-{Bold,Extralight,Medium,Semibold}.woff2` are unused because only the variable font is loaded. The site loads four font families in total (Clash Display, Space Grotesk, Playfair Display normal + italic, Aktura).
**Fix:** remove the Aktura `localFont` call and the unused static Clash files. Consider limiting Playfair to the italic style only; normal Playfair doesn't appear to be used.

### M8. Lint doesn't pass and is noisy
**Where:** `eslint.config.mjs:9-15`
**Fix:** add `.agents/**`, `.claude/**` and the root backup files (or delete them, M10) to `globalIgnores`. Fix `LoadingScreen.tsx:31` (initialise visibility from a lazy `useState(() => …)` guarded for SSR, or the head-script approach in H7). The other two errors disappear with the dead files.

### M9. Package manager mismatch; `pnpm build` is broken locally
**Where:** `package-lock.json` (npm) is committed; there was no `pnpm-lock.yaml` until this audit's `pnpm build` created one. `node_modules/.pnpm` shows you install with pnpm.
**What:** Vercel picks the package manager from the lockfile, so production installs with **npm** from a lockfile you don't maintain, while you develop against pnpm's resolution (for example framer-motion 12.43.0 locally). pnpm 12 also refuses to run scripts until `sharp`/`unrs-resolver` build approval is set. The generated `pnpm-workspace.yaml` currently contains placeholder values (`sharp: set this to true or false`).
**Fix:** pick one. For pnpm: delete `package-lock.json`, commit `pnpm-lock.yaml`, set `allowBuilds: { sharp: true, unrs-resolver: true }` in `pnpm-workspace.yaml` (or run `pnpm approve-builds`), and add `"packageManager": "pnpm@12.x"` to `package.json`. Otherwise delete the two new untracked pnpm files.

### M10. Dead code, backups and unused assets
None of these are imported by any live route:
- **Components:** `sections/About.tsx`, `sections/Stack.tsx`, `sections/StackV2.tsx`, `ui/StickerPeel.tsx` + `.css`, `ui/SectionWipe.tsx`, `ui/BlurText.tsx`, `ui/Ribbons.tsx` + `.css`, `ui/RibbonsCursor.tsx` (imported in `layout.tsx:4` but its usage is commented out), `hooks/useCountUp.ts`, `lib/stickerUtils.ts`, `lib/utils.ts`, `lib/data.ts` (contains stale "Fitness Coach AI" / "TBD" content that contradicts the real projects).
- **Root backup files:** `aboutv2`, `backup-hero`, `backup-statement`, `backup-work-2`, `backup-work.tsx` (50 KB, and `backup-work.tsx` gets linted). Git history already keeps old versions.
- **Unused `public/` files:** `cursor.png`, `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`, `world.png`, `profile.png` (2.8 MB), `profile - 2.png` (2.9 MB, with a space in the filename), `profile-3.png` (1.1 MB), 4 static Clash Display weights. Root `favicon.ico` is unused as placed.
- `.agents/skills` and `.claude/skills` are byte-identical duplicates (1.2 MB each).

**Why it matters:** reviewers open the repo. Twelve dead components and five backup files read as "unfinished" and make the codebase harder to follow.
**Fix:** delete them (git keeps the history).

### M11. Unused or duplicate dependencies
- `three`, `@types/three`: imported nowhere.
- `ogl`: only in dead `Ribbons.tsx`.
- `clsx`, `tailwind-merge`: only in dead `lib/utils.ts`.
- `motion`: same library as `framer-motion` (both 12.x); everything imports `framer-motion`. Keep one. `motion` is the current package name, so migrate imports to `motion/react` and drop `framer-motion`.
- `gsap`: see M5.
- `tailwindcss`: installed, but no Tailwind utility classes are used anywhere (all styling is inline). Either adopt it (M13) or drop it and keep a plain CSS reset.

None of these inflate the client bundle today (tree-shaken), but they inflate install time, the audit surface and reviewer confusion.

### M12. Design tokens exist but are bypassed; naming is stale
**Where:** `globals.css:4-14` defines `--color-bg`, `--color-text`, `--color-text-muted`, etc. Live components contain **124 hex literals** against **24** `var(--color-*)` uses. `#0a0a0a` appears 44 times and `#f8f8f5` 35 times. There are nine different greys for "muted" text (`#555`, `#666`, `#777`, `#888`, `#999`, `#aaa`, `#bbb`, `#ccc`, plus `#d8d5d0`) and four for dividers (`#1e1e1e`, `#2a2a2a`, `#e0e0da`, `#e5e5e0`).
- `Hero.tsx:17`: `const BLUE = "var(--color-accent-secondary)"`, which is crimson. `Navbar.tsx:38` comment: "accent stays blue". These are leftovers from an earlier blue palette.
- `Work.tsx:42`: `['#5b21b6', '#0a0a0a']` hardcodes the accent token value; `AboutV2.tsx:62` hardcodes `#c41e3a`; `LoadingScreen.tsx:63` hardcodes `#5b21b6`.
- `globals.css:5` labels violet "interactive" and crimson "typographic", but violet is also used as a background (hero card, loader, Work section) and crimson as a card fill.

**Fix:** define a small scale: `--bg`, `--bg-inverse`, `--fg`, `--fg-muted`, `--fg-subtle`, `--line`, `--line-inverse`, `--accent`, `--accent-2`, each with a dark-section counterpart. Replace literals, rename `BLUE`, and register the tokens in Tailwind's `@theme` so they're usable as utilities.

### M13. Styling architecture fights responsiveness
**Where:** everywhere. There are 265 `style={{…}}` objects, 13 `<style>{…}</style>` tags injected at render time, and **39 `!important`** declarations. Each breakpoint override has to use `!important` to beat inline styles; for example `Work.tsx:321-329` and `AboutV2.tsx:125-140`, which also target `section#about p`. Font sizes are defined as clamp in inline styles and then redefined as different clamps in media queries, so each size has two sources of truth. Hover states are implemented by mutating `style.color` in `onMouseEnter`/`onMouseLeave` (`Contact.tsx:186-192`, `Footer.tsx:132-133`, `contact/page.tsx:156-161`), which gives no `:focus-visible` parity and doesn't work on touch.
**Fix:** move static styles to Tailwind classes (already installed) or CSS Modules, keep `style` for MotionValues only, and use `:hover, :focus-visible` in CSS. This would also make M12 straightforward.

### M14. Docs promise dark mode; there is none
`CLAUDE.md` ("Dark mode supported") and `PRODUCT.md:39` ("Dark-first: dark theme is the designed and intentional state; light mode is a supported alternate"). There is no `prefers-color-scheme` query, no theme toggle and no theme state. The site is one fixed light/dark choreography. Contrast was therefore audited for the one theme that exists. Either implement it (after M12, it becomes token swaps) or correct the docs so future work isn't steered by a false premise.

### M15. No custom 404 or error boundary
`/does-not-exist` renders Next's default 404 in system font (`does-not-exist-1440-full.png`), which is off-brand. There is no `app/error.tsx` or `app/global-error.tsx`, so a runtime error in any client section blanks the page. **Fix:** add `app/not-found.tsx` (in the site's typography, with links home and to `/work`) and `app/error.tsx`.

### M16. Home page length and Work-section behaviour on small screens
- The scroll budget is: hero driver 300vh (`page.tsx:37`; the comment says "400vh"), About 150vh (100vh mobile), Work title pin 300vh (`Work.tsx:56`), Statement **450vh** (`Statement.tsx:57`), then Contact. That is roughly 13 viewport heights of scrolling before an email address, and most of it shows only a title or a single phrase. The audience in PRODUCT.md skims.
- Sticky Work section on mobile: no layout breakage found at any width. The title scales cleanly and rows wrap. But at 375 px the unscaled title ("A GLIMPSE OF / WHAT I'VE / BEEN / BUILDING", 5 lines at 60 px) is taller than the sticky viewport at scroll start, so "BUILDING" is clipped (`home-375-s030`). Most of its 300vh is spent on a title alone.
- On desktop the centered MENU overlaps "See all projects" (`home-1440-s060`).
- "GOT A PROJECT?" is the strongest CTA moment on the page, but it isn't a link.

**Fix:** cut the Work pin to ~150vh and Statement to ~250vh, and shorten them further under ~768 px. Start the mobile title at a size that fits in 100svh. Make "GOT A PROJECT?" scroll to or link to contact.

### M17. Duplicated logic and data
- `Work.tsx:99-152` and `:155-211` are the same row markup copy-pasted, differing only in `isLast`. Replace with one `PROJECTS.map` and `:last-child` styling.
- The project list is defined twice: `Work.tsx:13-18` and `work/page.tsx:11-56` (with descriptions and tags that `/work` never renders). A third, stale list lives in `lib/data.ts`. Make one typed `PROJECTS` in `src/lib/projects.ts`.
- The page header block (huge H1 + spark, the same `<style>` overrides) is duplicated in `about/page.tsx:23-63`, `work/page.tsx:81-121` and `contact/page.tsx:37-77`. Extract `<PageHeader title=… />`.
- Contact links are defined in `Contact.tsx:163-177` and `contact/page.tsx:10-15`; that is how M1 happened.
- The `EASE` constant is redefined in 5 files.
- `/work` builds `description` and `tags` per project but never renders them. Showing a one-line description and the stack per project would improve the page, since PRODUCT.md says "Show, don't list".

---

## Low

### L1. Screen-reader noise and false affordances
- `Footer.tsx:60-61`: the marquee renders "NIKO PRANATA" 6× without `aria-hidden`. Wrap the track in `aria-hidden="true"`.
- `Hero.tsx:214, 257, 347, 428`: decorative icons have alt text "Spark", "Hero", "Location", "Arrow Top Right". The first three are decorative (`alt=""`); the portrait should be `alt="Portrait of Niko Pranata"`.
- `Hero.tsx:196, 282, 329, 408`: cards have `cursor: pointer` and hover motion but no action. Remove the pointer cursor.
- Statement text and "LET'S WORK TOGETHER" (`Contact.tsx:56`) are `div`/`p` rather than headings, so the home outline is a single `<h2>`.
- No skip link. With the nav being three items it is less critical, but cheap to add.

### L2. Small text
11 px form labels (`contact/page.tsx:332`), 12 px footer text and dates (`Footer.tsx:109`, `TechExperience.tsx:200`), 12 px project indices (`Work.tsx:125`), and 13 px nav on mobile plus MENU at every width (`Navbar.tsx:47, 111`). Uppercase tracking helps, but combined with the H10 contrast values these are hard to read. Use a 13–14 px floor for anything meaningful.

### L3. Full page reloads for internal navigation
`Work.tsx:268` (`<motion.a href="/work">`) and `FlowingMenu.tsx:116` (`<a href={link}>`) bypass the Next router, so each click reloads JS and fonts and re-evaluates the loader. Use `next/link`, or `motion.create(Link)` as `Contact.tsx:5` already does (note that `motion(Link)` is the deprecated form of `motion.create(Link)`).

### L4. `window.open` without `noopener`
`Work.tsx:122, 181`: `window.open(url, '_blank')` gives the opened page `window.opener` access. It becomes moot once H4 converts these to anchors with `rel="noopener noreferrer"`.

### L5. Hardcoded copyright year
`Footer.tsx:114`: `© 2025`. Use `new Date().getFullYear()`. Fine in a server component; in a static client component it is evaluated at build time, which is acceptable with regular deploys.

### L6. ogl renderer never released (dead code today)
`Ribbons.tsx:227-234` cancels the rAF and removes the canvas but never calls `gl.getExtension('WEBGL_lose_context')?.loseContext()` or removes the polyline programs. Browsers cap live WebGL contexts (~16), so re-mounting the component leaks one each time. The effect also re-runs when the `colors` / `backgroundColor` array identity changes (worked around in `RibbonsCursor.tsx:6-7`). There is no WebGL-unavailable check either: `new Renderer()` throws if WebGL is unavailable, and with no error boundary (M15) that would blank the page. All of this is moot if the file is deleted per M10. If the cursor returns, fix these and gate it behind `(pointer: fine)` and no reduced motion.

### L7. Navbar scroll handler
`Navbar.tsx:20-34` runs `querySelectorAll` plus `getBoundingClientRect` on every scroll event and calls `setState` each time. It is cheap in isolation, but it's layout reads during scroll on a page that is already paint-heavy. The `IntersectionObserver` fix in H1 replaces it.

### L8. Outdated tooling
`eslint@9.39.5` is marked unsupported on npm ("This version is no longer supported"); latest is 10.13. `eslint-config-next` 16.2.6 → 16.4.3 (upgrade with C2). `react` 19.2.4 → 19.3.1. `typescript` 5.9 → 7.0 and `framer-motion`/`motion` 12 → 14 are major versions; plan those separately and don't bundle them with the security fix. `@types/node@20` while running Node 24.

### L9. Local Claude settings committed
`.claude/settings.local.json` is by convention machine-local. It contains paths from another machine (`C:\Users\Nikk\…`) and broad allow rules (`Bash(curl *)`, `Bash(Remove-Item *)`). It contains no secrets. Add it to `.gitignore`. **Secrets check:** no `process.env` usage, no API keys or tokens in `src/`, and `.env*` is gitignored and absent from history. The only personal data exposed is the business email, which is intentional.

### L10. Stale docs
`CLAUDE.md:10` says "Next.js 15"; the project is on 16.2.6. `README.md` is the create-next-app boilerplate (mentions `app/page.tsx` and Geist). For a portfolio repo, a real README (stack, design decisions, how the scroll choreography works, Lighthouse scores) is itself a portfolio piece.

### L11. Off-palette asterisk
`filter: hue-rotate(40deg) saturate(1.3)` on `spark.png` (`Footer.tsx:39`, and the about/work/contact page headers) turns the violet asterisk **magenta** (visible in every page-header and footer screenshot). That is a third accent outside the violet/crimson system. Remove the filter, or export a correctly coloured asset.

---

## Recommended fix order

Ordered by impact on a recruiter's first visit relative to effort.

1. **Stop losing contacts:** fix C1 (wire up the form or remove it), H2 (add `resume.pdf`), M1 (fix the LinkedIn URL). Under an hour; these directly cost opportunities.
2. **Security upgrade:** C2 (`next` + `eslint-config-next` → 16.4.3). Resolve M9 (pick pnpm or npm, commit the right lockfile) in the same PR so Vercel installs what you test.
3. **Free performance wins:** H9 (remove devicon CSS), M7 (remove Aktura), H8 (re-export images, add `sizes`, lazy preview card, resize menu backgrounds), M5 (lazy-load or replace GSAP).
4. **Navigation works everywhere:** H1 (nav theme via `data-nav-theme` + background), H3 (real menu button), H4 (project rows as links). After this the site is keyboard-navigable.
5. **Motion respects users:** H5 (`MotionConfig` + reduced-motion static paths), H7 (remove or trim the loader), H6 (no-JS reveal fallback).
6. **Discoverability:** H11 (metadataBase, OG image, robots, sitemap, favicon, `/contact` metadata, home `<h1>`, JSON-LD), M15 (custom 404 + error boundary).
7. **Clean the repo before anyone reads it:** M10 (delete dead code and backups), M11 (drop unused deps), M8 (lint passes with 0 errors and the ignore list fixed), L9, L10.
8. **Readability:** H10 contrast, M2 contact overflow, M3 form a11y, L1, L2.
9. **Refactor for maintainability** (larger, do on a branch): M12 tokens → M13 move styling to Tailwind/CSS, with `:hover`/`:focus-visible` → M17 dedupe project data and page header → M4 server components with client islands. Doing M12 first makes M14 (real dark mode) a small follow-up if you want it.
10. **Polish:** M6 (grain as a static texture, CSS marquee, no animated blur), M16 (shorten scroll budgets, link "GOT A PROJECT?"), L3–L8, L11.
