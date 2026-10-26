# Layout at laptop viewports: analysis and proposal

**Status:** implemented on `main` (17 commits, `78265c4`…`902c92a`, not pushed). Results are in [§0](#0-result). Sections 1–3 describe the site **before** the change. Sections 4–5 are the original proposal, with notes where the final version differs.
**Date:** 2026-10-26 · production build (`pnpm build && next start`), Playwright with Edge.

## 0. Result

### Decisions applied
1. The /contact form stays below the fold.
2. Growth above 1920 is capped at 1.2×.
3. The navbar shrinks to 14px text and a 56px bar at 1536 and **never goes below that**. On phones this raises it from 13px to 14px.
4. Spacing snaps applied: project row padding 48→56px, experience role 30→28px.
5. **Browser zoom keeps working.** This changes the proposal: only display type and large spacing use `--u`. Body text, navbar, buttons, form fields and labels are rem-based (details below).

### The system as built ([globals.css](src/app/globals.css))

**Display type and large spacing** (`--text-poster`, `--text-marquee`, `--text-title`, `--text-section`, `--text-display`, `--text-statement`, `--text-lead`, `--text-hero`, `--text-h2/h3/h4`, `--space-*`, `--page-x`, `--page-top`, `--section-y`):

```css
--u: min(1.25vw, max(1vw, 12.8px), 1.7778svh);           /* 19.2px at 1920×1080 */
--text-hero: clamp(1.75rem, calc(4.0625 * var(--u)), 94px); /* 78 at 1920 */
```

- The coefficient is exactly (size at 1920) ÷ 19.2.
- Minimums are in rem, so the user's font-size setting raises the floor.
- Maximums are 1.2× the 1920 value.

**Readable text** (`--text-h5`, `--text-body-lg`, `--text-body`, `--text-small`, `--text-caption`, `--text-label`, `--text-nav`, `--nav-h`) is a rem base plus a small bonus that only grows on wide screens and is capped:

```css
--text-body-lg: calc(1rem + clamp(0px, (100vw - 1536px) / 96, 6px));     /* 16 up to 1536, 20 at 1920, 22 max */
--text-nav:     calc(0.875rem + clamp(0px, (100vw - 1536px) / 96, 6px)); /* 14 up to 1536, 18 at 1920, 20 max */
```

- **Zoom:** at 200% the CSS viewport halves, the bonus drops to 0 and the rem base doubles physically.
- **Font-size setting:** a larger default font size raises the base directly.
- **Buttons:** padding is in em, so buttons grow with their text.

**Breakpoints:** the two 1400px rules are gone. 600/768 merged into **640** and **900**. The hero's phone `scale()` steps are unchanged.

**Content width:** `--content-max: 2112px`. Subpages, Contact, TechExperience and the footer use `max(var(--page-x), (100% - var(--content-max)) / 2)` as side padding, so content stays centred above about 2300px.

### Final values (measured, CSS px)

| Element | 1280×720 | 1366×768 | 1440×900 | **1536×864** | **1536×730** | 1920×1080 | 2560×1440 |
|---|---|---|---|---|---|---|---|
| Hero text | 67 → 52 | 71 → 55 | 75 → 59 | **78 → 62** | **78 → 53** | 78 | 78 → 94 |
| Hero stack, % height | 79 → **69%** | 79 → **69%** | 71 → 62% | **79 → 69%** | **94 → 69%** | 69% | 52 → 63% |
| Gap between nav and first card | 8 → 45 | 13 → 52 | 63 → 103 | 24 → 67 | **−43 → 46** | 99 | 279 → 203 |
| Navbar text / height | 18/64 → 14/56 | 18/64 → 14/56 | 18/64 → 14/56 | 18/64 → **14/56** | 18/64 → 14/56 | 18/64 | 18/64 → 20/70 |
| About paragraph | 61 | 64 → 65 | **86 → 69** | **92 → 74** | 92 → 62 | 92 | 92 → 110 |
| About paragraph, % height | 89 → 88% | 77 → 88% | **123 → 80%** | **138 → 88%** | **163 → 79%** | 89% | 50 → 70% |
| Work title | 154 → 133 | 160 → 142 | **200 → 150** | 200 → 160 | 200 → 135 | 200 | 200 → 240 |
| Work title, % height | 67 → 58% | 66 → 58% | **93 → 53%** | 73 → 58% | 86 → 58% | 58% | 44 → 53% |
| Project row title | 51 → 43 | 55 → 46 | 58 → 48 | 61 → 51 | 61 → 43 | 64 | 64 → 77 |
| Statement | 102 → 83 | 109 → 88 | 115 → 93 | **123 → 99** (5 → 4 lines) | 123 → 84 | 124 | 124 → 149 |
| Statement, % height | 79 → 50% | 79 → 50% | 71 → 46% | 79 → 51% | 94 → 40% | 51% | 30 → 46% |
| GOT A PROJECT? | 384 → 300 | 410 → 320 | 432 → 338 | 450 → 360 | 450 → 304 | 450 | 450 → 540 |
| Contact headline | 115 → 93 | 123 → 100 | 130 → 105 | **138 → 112** (one-line WORK TOGETHER) | 138 → 95 | 140 | 140 → 168 |
| Contact section, % height | **141 → 91%** | **141 → 85%** | 125 → 76% | **129 → 84%** | 153 → 88% | 83% | 62 → 74% |
| Footer marquee | 230 → 187 | 246 → 199 | 259 → 210 | 276 → 224 | 276 → 189 | 280 | 280 → 336 |
| Loader number | 486 → 373 | 519 → 398 | 547 → 420 | 560 → 448 | 560 → 379 | 560 | 560 → 672 |
| Subpage title | 218 → 173 | 232 → 185 | 245 → 195 | **260 → 208** | 260 → 176 | 260 | 260 → 312 |
| Subpage content starts at, % height | **55 → 41%** | **54 → 41%** | 47 → 37% | **51 → 41%** | 60 → 41% | 41% | 31 → 37% |
| /work first card row fits | **no → yes** | **no → yes** | yes | **no → yes** | no (770 / 730) | yes | yes |
| /about body text | 19 → 16 | 20 → 16 | 20 → 16 | 20 → 16 | 20 → 16 | 20 | 20 → 22 |
| Form fields / labels | 18/13 → 16/13 | 18/13 → 16/13 | 18/13 → 16/13 | 18/13 → 16/13 | 18/13 → 16/13 | 18/13 | 18/13 → 19/15 |
| Home page length, in screens | 12.4 → 11.5 | 12.4 → 11.5 | 12.1 → 11.2 | 12.4 → 11.4 | 13.2 → 11.5 | 11.4 | 10.8 → 11.2 |

### Browser zoom: 1536×864 at 200% (768×432 CSS viewport, deviceScaleFactor 2)

Physical pixels = CSS px × 2:

| Text | 100% zoom | 200% zoom | Growth |
|---|---|---|---|
| /about body | 16 | 32 | 2.0× |
| Navbar | 14 | 28 | 2.0× |
| Form fields / labels / Send button | 16 / 13 / 13 | 32 / 26 / 26 | 2.0× |
| Menu links | 34.6 | 48 (was 34.6 before this change: no growth) | 1.4× |
| Hero / page titles (display) | 62 / 208 | 62 / 208 | — (sized to the screen, by design) |

- **Overlaps:** the automated check found **no overlapping text and no horizontal overflow** on any page or scroll position at 200% zoom. It looks for visible text boxes intersecting each other, with every page scrolled screen by screen.
- **Hero:** it fits (70% of the height). The top card's tilted corner reaches the transparent navbar's bottom edge (−1px), clear of the nav text.
- **The only flagged item** at any size is "GOT A PROJECT?" crossing the statement mid-scroll. That is the designed collision frame, now timed the same at every size.

### Phones and tablets
375×812 and 768×1024 match the before captures within 1–2px for all display sizes. The hero spacing deliberately keeps its pixel values below 640px. Intended differences:
- Navbar 13 → 14px and bar 64 → 56px (the "never below 14px / 56px" rule).
- Form fields 15 → 16px.
- The breakpoints at 769–900px now use the stacked layouts.

### 1920×1080 against the original
A pixel diff of every screenshot shows **0 changed pixels** on these first screens:
- /about, /work and 404
- the home About section, Work title and Contact section

The remaining differences are intended or come from animation:
- Work list rows: padding snap 48→56px.
- /contact description: 17→18px (`--text-body`).
- /about full page: 10px shorter (role 30→28px).
- Hero: 0.09% of pixels, sub-pixel anti-aliasing on two cards.
- Statement, footer and loader: the spring, marquee and counter caught at a different frame.

### What still doesn't fit
1. **/contact form** is below the fold at every size up to 1920, as decided. At 1536×864 the Send button sits about 100px below the fold (970 / 864).
2. **/work at 1536×730:** the first row of cards ends at 770px, 40px below the fold. Card height comes from column width, not window height, so a short window doesn't shrink it. It fits at 1536×864 and at every 16:9/16:10 laptop size. Fixing it would mean height-limited cards, a layout change I'd only make on request.
3. **Home Contact section at 200% zoom** is 132% of the screen height and scrolls normally. Nothing is clipped.
4. `global-error.tsx` keeps its own sizes. It replaces the root layout, so the tokens aren't guaranteed to load there.

### Screenshots
`C:\Users\pranata\AppData\Local\Temp\claude\d--Project-Web-personal-website\87f3089e-e27c-48ae-b808-ae7bf2cabd74\scratchpad\`
- `pairs\<viewport>-<shot>.png`: 140 side-by-side before/after images. Ten viewports: the seven above, plus 200% zoom (`768x432@2x`), `375x812` and `768x1024`. 14 shots each.
- `before\` and `after\`: the raw captures, `measure.json` and the overlap reports (`checks-*.txt`).

---

## Summary

At 1920×1080 the site looks the way it was designed. At 1536×864 it does not look like a 0.8× copy. The large elements are the **same pixel size as at 1920**, on a screen 20% smaller in both directions. Five root causes:

1. **Size caps are reached at about 1500px wide.** Every large `clamp()` uses a vw slope steep enough that it hits its maximum between 1290 and 1560px (table below). From 1536 to 2560 the hero, page titles, statement, contact headline and footer are all frozen at their 1920 size. So the site is too big at 1536 and doesn't grow at 2560.
2. **Nothing is sized by height.** All typography scales with `vw` only. A 1536×864 screen (or a real 1536×730 browser window) gets the same hero as 1536×1200 would. The hero takes 69% of the height at 1920×1080, 79% at 1536×864 and **94% in a maximized 1536 browser window, where the first card runs into the MENU button**.
3. **The 1400px breakpoint makes text bigger on wider screens.** Below 1400px, About and the Work title use smaller formulas. Above it they jump: About goes from 64 to 86px and the Work title from 160 to 200px. A 1440×900 laptop gets the About paragraph at **123% of the screen height** and the Work title at 93%, bigger than on 1366×768.
4. **Fixed pixel values inside scaled parts.** These don't shrink with the text around them: hero gaps, margins and `translateY(-9px)` serif offsets, the INDONESIA badge (16px, `0 20px` padding), the navbar (64px tall, 18px text) and the contact asterisk (1.9× the title). At smaller sizes the proportions drift.
5. **No content max-width.** At 2560 the subpages stretch edge to edge (the /about photo column is about 1170px square, the /work cards 1172×700) while the hero stays at its 1920 size. The page looks empty in the middle and stretched at the edges.

The fix is **one viewport unit that scales with the viewport's width and height**. Every size becomes a multiple of it, calibrated to 1920×1080. The proposal is in [§4](#4-proposed-sizing-system).

---

## 1. How this was measured

- **Viewports:** 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080 and 2560×1440. Also two real maximized-window sizes: **1536×730** (a 1536×864 screen minus the taskbar and browser toolbars) and **1920×950** (your old laptop's real window).
- **Pages:** every page, at the top of the page and full-page. Home was also captured at each scroll stage: hero, About, pinned Work title, project list, statement, "GOT A PROJECT?", contact, footer. Plus the loader (fresh session) and the open menu.
- **Measurements:** computed font sizes and element boxes compared with the viewport height. Script: `scratchpad/layout.mjs`. Raw numbers: `measure.json`.
- **Screenshots:** `C:\Users\pranata\AppData\Local\Temp\claude\d--Project-Web-personal-website\87f3089e-e27c-48ae-b808-ae7bf2cabd74\scratchpad\layout\` (`<w>x<h>-home-<stage>.png`, `<w>x<h>-<page>-fold.png`, `-full.png`, `-loader.png`, `-menu.png`, `-real-hero.png`).

> **Note on "1536×864".** That is the screen size at 125% scaling. A maximized browser loses about 130px of height to the taskbar, tabs and address bar, so the real viewport is about **1536×730**. Your old 1920×1080 at 100% was really about 1920×950. The height problem is therefore worse than the 864 figures below suggest, and it's why the proposal scales with height as well as width.

## 2. Current measurements

Sizes are in CSS px. "% vh" means the share of the viewport height. **Bold** marks values that look too big or don't fit.

| Element | 1280×720 | 1366×768 | 1440×900 | 1536×864 | 1920×1080 | 2560×1440 |
|---|---|---|---|---|---|---|
| Hero text | 67 | 71 | 75 | **78** | 78 | 78 |
| Hero stack, % vh | **79%** | **79%** | 71% | **79%** | 69% | 52% |
| Gap between nav and first card | **8** | **13** | 63 | **24** | 99 | 279 |
| About paragraph text | 61 | 64 | **86** | **92** | 92 | 92 |
| About paragraph, % vh | 89% | 77% | **123%** | **138%** | 89% | 50% |
| Work title ("A GLIMPSE OF…") | 154 | 160 | **200** | **200** | 200 | 200 |
| Work title, % vh | 67% | 66% | **93%** | 73% | 58% | 44% |
| Project row title | 51 | 55 | 58 | 61 | 64 | 64 |
| Statement text | 102 | 109 | 115 | **123** | 124 | 124 |
| Statement, % vh | 79% | 79% | 71% | **79% (5 lines)** | 51% (4 lines) | 30% |
| "GOT A PROJECT?" | 384 | 410 | 432 | **450** | 450 | 450 |
| Contact headline | 115 | 123 | 130 | **138** | 140 | 140 |
| Contact section, % vh | **141%** | **141%** | **125%** | **129%** | 83% | 62% |
| Footer marquee | 230 | 246 | 259 | **276** | 280 | 280 |
| Loader number | 486 | 519 | 547 | **560** | 560 | 560 |
| Nav: text / height | 18 / 64 | 18 / 64 | 18 / 64 | 18 / 64 | 18 / 64 | 18 / 64 |
| Page title (ABOUT, WORK, 404) | 218 | 232 | 245 | **260** | 260 | 260 |
| Subpage content starts at, % vh | **55%** | **54%** | 47% | **51%** | 41% | 31% |
| /work first card row fits on screen | **no** (801) | **no** (845) | yes | **no** (924) | yes | yes |
| /contact form bottom (px) | 1065 | 1085 | 1100 | 1113 | 1118 | 1118 |
| Home page length, in screens | 12.4 | 12.4 | 12.1 | 12.4 | 11.4 | 10.8 |

Real windows: the hero stack is **94% of the height at 1536×730**, with the first card overlapping MENU (`1536x730-real-hero.png`). At 1280×590 it's 97%. At 1920×950 it's 79%.

### Where each cap is reached

A cap reached below 1920 means the element stops shrinking below 1920 more slowly than the screen does. Most of these caps sit near 1536, which is why 1536 and 1920 look identical.

| Element | Value | Hits its cap at | File |
|---|---|---|---|
| Page top padding | `clamp(110px, 14vw, 180px)` | 1286px | [about/page.tsx:17](src/app/about/page.tsx#L17), [work/page.tsx:14](src/app/work/page.tsx#L14), [contact/page.tsx:22](src/app/contact/page.tsx#L22), [not-found.tsx:30](src/app/not-found.tsx#L30) |
| Side padding | `clamp(32px, 6vw, 80px)` | 1333px | same four pages, [Contact.tsx:41](src/components/sections/Contact.tsx#L41), [TechExperience.tsx:68](src/components/sections/TechExperience.tsx#L68), [Footer.tsx:112](src/components/sections/Footer.tsx#L112) |
| Section padding | `clamp(80px, 10vw, 140px)` | 1400px | [Contact.tsx:41](src/components/sections/Contact.tsx#L41), [TechExperience.tsx:68](src/components/sections/TechExperience.tsx#L68), [AboutV2.tsx:101](src/components/sections/AboutV2.tsx#L101) |
| Loader number | `clamp(200px, 38vw, 560px)` | 1474px | [LoadingScreen.tsx:68](src/components/ui/LoadingScreen.tsx#L68) |
| Hero text (×6) | `clamp(28px, 5.2vw, 78px)` | 1500px | [Hero.tsx:25](src/components/sections/Hero.tsx#L25), [51](src/components/sections/Hero.tsx#L51), [213](src/components/sections/Hero.tsx#L213), [257](src/components/sections/Hero.tsx#L257), [319](src/components/sections/Hero.tsx#L319), [351](src/components/sections/Hero.tsx#L351), [432](src/components/sections/Hero.tsx#L432) |
| "GOT A PROJECT?" | `clamp(180px, 30vw, 450px)` | 1500px | [Statement.tsx:231](src/components/sections/Statement.tsx#L231) |
| Page title | `clamp(88px, 17vw, 260px)` | 1529px | [PageHeader.tsx:17](src/components/ui/PageHeader.tsx#L17), [not-found.tsx:46](src/app/not-found.tsx#L46) |
| About paragraph | `clamp(40px, 6vw, 92px)` | 1533px | [AboutV2.tsx:107](src/components/sections/AboutV2.tsx#L107) |
| Statement (×7) | `clamp(48px, 8vw, 124px)` | 1550px | [Statement.tsx:107–200](src/components/sections/Statement.tsx#L107) |
| Contact headline | `clamp(52px, 9vw, 140px)` | 1556px | [Contact.tsx:75](src/components/sections/Contact.tsx#L75), spark [Contact.tsx:100](src/components/sections/Contact.tsx#L100) |
| Footer marquee | `clamp(100px, 18vw, 280px)` | 1556px | [Footer.tsx:67](src/components/sections/Footer.tsx#L67) |
| CONTACT page title | `clamp(80px, 14vw, 220px)` | 1571px | [contact/page.tsx:28](src/app/contact/page.tsx#L28) |
| Project row title | `clamp(28px, 4vw, 64px)` | 1600px | [Work.tsx:156](src/components/sections/Work.tsx#L156), [165](src/components/sections/Work.tsx#L165) |
| Work title | `clamp(72px, 15vw, 200px)`, `≤1400: clamp(60px, 12vw, 160px)` | 1333px, then jumps at 1401px | [Work.tsx:82](src/components/sections/Work.tsx#L82), [294–296](src/components/sections/Work.tsx#L294) |

The slopes are consistent: almost every one is about **1.25× what would reach its cap at exactly 1920**. The sizes were effectively tuned for a 1536px-wide layout and then capped. The proposal below keeps the same values and moves the point where they reach full size from about 1536 to 1920.

## 3. What looks too big at each size, and why

### 1280×720 and 1366×768 (150% scaling, and older 1366 laptops)
- **Hero is crowded under the nav.** The stack takes 79% of the height and the first card is 8px (1280) or 13px (1366) below the nav bar. Cause: the card height `clamp(100px, 10vw, 170px)` ([Hero.tsx:35](src/components/sections/Hero.tsx#L35)) and the text are width-based. 720px of height isn't considered.
- **Page headers take more than half the first screen** (55%): 110–180px top padding, a 218px title, and up to 100px below it ([PageHeader.tsx:17–19](src/components/ui/PageHeader.tsx#L17)). On /work the first card row is cut off at the bottom (it ends at 801px on a 720px screen).
- **Contact section is 141% of the height.** The headline plus the asterisk at 1.9× its height ([Contact.tsx:100](src/components/sections/Contact.tsx#L100)) and 115px of vertical padding push the email/LinkedIn/GitHub row below the fold.

### 1440×900 (16:10 laptops)
- **About paragraph doesn't fit (123% of the height).** Above 1400px the media query at [AboutV2.tsx:127–129](src/components/sections/AboutV2.tsx#L127) stops applying and the text jumps to the 86–92px formula. The scroll-linked colour reveal then plays on text partly off screen.
- **Work title fills 93% of the height** and touches the nav. Same breakpoint, at [Work.tsx:294](src/components/sections/Work.tsx#L294): 160px → 200px.

### 1536×864 (your laptop at 125%)
- **Hero:** text 78px, the same as 1920. The stack is 1215px wide (1920: 1216px) and takes 79% of the height with 24px below the nav. In the real 1536×730 window it takes 94% and overlaps MENU.
- **About paragraph: 138% of the height, 8 lines** (1920: 89%, 7 lines). Its text is at the cap while the line length (`8vw` padding) shrinks, so it wraps more.
- **Statement wraps to 5 lines** ("TO THE FINAL / DEPLOY,"). The font is at its cap (123px) but the width is 20% smaller.
- **Contact headline wraps badly.** "WORK TOGETHER" breaks onto two lines because a 138px title plus a 262px asterisk is wider than the 1376px row. It becomes three lines and the section grows to 129% of the height.
- **Subpages:** the title header (180 + 260 + 100px) is the same as at 1920, so it fills 51% of the screen. The /work first card row ends at 924px.
- The loader number (560px) and the footer marquee (276px) are also at their 1920 sizes. They're decorative and read fine, but they're out of proportion with everything else once the rest scales.

### 1920×1080
This is the reference. Everything fits except the /contact form, which ends at 1118px, about 40px below the fold.

### 2560×1440 (large screens)
- **Nothing grows past about 1550px.** The hero is 52% of the height, with 279px of empty space above it. The About paragraph is 50%, the statement 30%. Text isn't small in absolute terms, but the composition looks sparse.
- **Subpages stretch to full width** (no max-width). The /work cards are 1172×700 and the /about photo column is about 1170px square, while the headings next to them stay at their 1920 sizes.
- The nav at 18px and the 13px labels look small against a 1440px-tall screen. That's acceptable, but they could grow slightly.

### Things that are fine
- **Menu panel.** It's already height-based (`33vh` panel, `4vh` links, [FlowingMenu.css:34](src/components/ui/FlowingMenu.css#L34)) and reads well at every size.
- **Project list rows.** About 165px each. Slightly generous at 1536 but fine.
- **Mobile and tablet** (audited earlier at 375 and 768). The proposal leaves them unchanged.

## 4. Proposed sizing system

### 4.1 One unit, calibrated to 1920×1080

```css
:root {
  /* 1u = 19.2px at 1920×1080, the reference the design was built on.
     - Wide screens: scales with the 16:9 box that fits the viewport, so a short window shrinks too.
     - 1024–1280px: holds at 12.8px (the 1280×720 look) so small laptops don't drop further.
     - Below ~1024px: 1.25vw, which reproduces today's mobile/tablet sizes within ~2%. */
  --u: min(1.25vw, max(1vw, 12.8px), 1.7778svh);
}
```

| Viewport | 1280×720 | 1366×768 | 1440×900 | 1536×864 | 1536×730 (real) | 1920×1080 | 1920×950 (real) | 2560×1440 |
|---|---|---|---|---|---|---|---|---|
| `--u` | 12.8 | 13.65 | 14.4 (width-bound) | **15.36 = 0.8 × ref** | 12.98 (height-bound) | 19.2 | 16.9 (height-bound) | 25.6 → capped at 1.2× |

Every size token is `clamp(<today's mobile minimum>, <k> × var(--u), <1.2 × its 1920 value>)`:
- The minimum is the existing `clamp()` minimum, so phones are untouched.
- `k` is the element's 1920 size ÷ 19.2.
- The maximum lets 1920+ screens grow up to 20% (reached at 2304×1296) instead of stopping at about 1550px.

`svh` instead of `vh` keeps mobile sizes stable when the address bar hides. On desktop the two are identical.

### 4.2 Type scale

> **Changed in the final version (§0):**
> - `--text-h5`, `--text-body-lg`, `--text-body`, `--text-label`, `--text-nav` and the navbar height are **rem-based**, not `--u`-based, so they grow with browser zoom.
> - Added `--text-small` (16 at 1920) and `--text-caption` (14).
> - Display minimums are in rem.
> - `--text-section`'s minimum is 3.75rem (60px, the previous phone size).
> - Coefficients are exact (4.0625 instead of 4.06).
>
> `globals.css` is the source of truth.

The values are the current 1920 sizes, now named. Close duplicates are merged where noted.

```css
:root {
  --text-poster:    clamp(180px, calc(23.44 * var(--u)), 540px); /* GOT A PROJECT?           450 @ref */
  --text-marquee:   clamp(100px, calc(14.58 * var(--u)), 336px); /* footer marquee; loader = 2× 280 @ref */
  --text-title:     clamp( 88px, calc(13.54 * var(--u)), 312px); /* ABOUT / WORK / 404; CONTACT = 0.85× */
  --text-section:   clamp( 72px, calc(10.42 * var(--u)), 240px); /* A GLIMPSE OF…            200 @ref */
  --text-display:   clamp( 52px, calc( 7.29 * var(--u)), 168px); /* LET'S WORK TOGETHER      140 @ref */
  --text-statement: clamp( 48px, calc( 6.46 * var(--u)), 149px); /* FROM THE first pixel…    124 @ref */
  --text-lead:      clamp( 40px, calc( 4.79 * var(--u)), 110px); /* home About paragraph      92 @ref */
  --text-hero:      clamp( 28px, calc( 4.06 * var(--u)),  94px); /* hero cards; serif = 1.1×  78 @ref */
  --text-h2:        clamp( 28px, calc( 3.33 * var(--u)),  77px); /* project row titles        64 @ref */
  --text-h3:        clamp( 28px, calc( 2.92 * var(--u)),  67px); /* /about quote, See all projects (56) */
  --text-h4:        clamp( 24px, calc( 2.29 * var(--u)),  53px); /* /contact + 404 tagline     44 @ref */
  --text-h5:        clamp( 16px, calc( 1.46 * var(--u)),  32px); /* tech list, contact links, role (28; role 30→28) */
  --text-body-lg:   clamp( 16px, calc( 1.04 * var(--u)),  22px); /* /about body, contact description (20) */
  --text-body:      clamp( 15px, calc( 0.94 * var(--u)),  20px); /* inputs, info rows, link list (16–18) */
  --text-label:     clamp( 13px, calc( 0.68 * var(--u)),  15px); /* labels, captions, MENU   13 @ref, 13px floor */
  --text-nav:       clamp( 14px, calc( 0.94 * var(--u)),  20px); /* NIKO PRANATA / CONTACT    18 @ref */
}
```

### 4.3 Spacing and layout

```css
:root {
  --space-2xs: clamp( 8px, calc(0.42 * var(--u)),  10px); /*   8 — label/input gap */
  --space-xs:  clamp(12px, calc(0.83 * var(--u)),  19px); /*  16 — hero card gaps, link list */
  --space-s:   clamp(16px, calc(1.25 * var(--u)),  29px); /*  24 — form gaps, info row */
  --space-m:   clamp(24px, calc(2.08 * var(--u)),  48px); /*  40 — paragraph groups, row gaps */
  --space-l:   clamp(32px, calc(2.92 * var(--u)),  67px); /*  56 — grid gaps, dividers, row padding (48→56) */
  --space-xl:  clamp(40px, calc(3.75 * var(--u)),  86px); /*  72 — header→content, section intros */
  --space-2xl: clamp(64px, calc(6.25 * var(--u)), 144px); /* 120 — contact column gap, CTA blocks */

  --page-x:        clamp(32px, calc(4.17 * var(--u)),  96px); /*  80 — side padding everywhere */
  --page-top:      clamp(110px, calc(9.38 * var(--u)), 216px); /* 180 — subpage top padding */
  --section-y:     clamp(80px, calc(7.29 * var(--u)), 168px); /* 140 — section vertical padding */
  --nav-h:         clamp(56px, calc(3.33 * var(--u)),  72px); /*  64 — navbar + menu panel offset */
  --container-max: 2112px;                                    /* 1760 (1920 − 2×80) × 1.2 */
}
```

`--container-max` would apply to the subpage `<main>` and to the Contact, TechExperience and Footer rows (`margin-inline: auto`). Full-bleed backgrounds stay full-bleed and only the content is constrained. It only takes effect above about 2300px.

**Snaps:** row padding 48→56, experience role 30→28 and contact link list 18→16–18. All are ≤15% changes at 1920. Everything else keeps its exact 1920 value.

### 4.4 Breakpoints

| Today | Proposed |
|---|---|
| 380 / 430 / 520 / 640 (hero `scale()` steps) | **keep**: tuned for phones and audited |
| 600 · 640 (Contact, PageHeader, Nav, WorkGrid, about/contact grids) | **640**: single-column layouts |
| 768 · 900 (AboutV2, Work list, TechExperience, contact grids, loader) | **900**: two-column → stacked, row wrapping |
| **1400** (AboutV2, Work title) | **remove**: `--u` covers this; it's the cause of the 1440×900 jump |

Three breakpoints (640, 900, and the hero's phone steps) instead of eight. Desktop sizing never switches abruptly at a breakpoint again.

### 4.5 Hero-specific fixes (inside the token change)
- All six hero `fontSize` values and the card height use `var(--text-hero)` / `calc(var(--text-hero) * 2.18)`, so the cards stay in proportion with the text.
- Fixed-pixel offsets inside the cards become `em`, so they scale with the text:

  | Now | Becomes |
  |---|---|
  | gaps and margins of 12/16/18px | 0.15–0.23em |
  | serif `translateY(-9px)` | -0.115em |
  | INDONESIA badge 16px with `0 20px` padding | 0.2em, `0 0.25em` |

- The stack's `maxWidth: min(1100px, 94vw)` ([Hero.tsx:190](src/components/sections/Hero.tsx#L190)) isn't binding (cards are `fit-content`). Leave it.

### 4.6 Implementation notes
- The tokens go in [globals.css](src/app/globals.css) `:root`. Components replace their literal `clamp(...)` with `var(--text-…)` / `var(--space-…)` in the existing inline styles. **No visual change at 1920×1080; the scale changes everywhere else.**
- The `--text-*` names also match Tailwind v4's `@theme` namespace. Moving them into `@theme` later generates `text-hero`, `text-title` and similar utilities for the inline-style migration (AUDIT M13) without renaming anything.
- Scroll lengths in `vh` (300vh hero driver, 180vh Work pin, 300vh statement, `-25vh` / `-20vh` offsets) and `vw` horizontal travel in Statement stay as they are. They're motion distances, not sizes.

## 5. Before → after for the main elements

Sizes in px. "After" values are computed from the formulas above. 1920×1080 is unchanged by design. The real-window column is the browser on your laptop.

| Element | 1280×720 | 1536×864 | 1536×730 (real) | 1920×1080 | 2560×1440 |
|---|---|---|---|---|---|
| **Hero text** | 67 → **52** | 78 → **62** | 78 → **53** | 78 = 78 | 78 → **94** |
| Hero card height | 128 → 113 | 154 → 136 | 154 → 115 | 170 = 170 | 170 → 204 |
| Hero stack, % vh | 79% → **≈69%** | 79% → **69%** | 94% → **≈69%** | 69% | 52% → **≈62%** |
| Nav text / height | 18 / 64 → **14 / 56** | 18 / 64 → **14 / 56** | 18 / 64 → 14 / 56 | 18 / 64 | 18 / 64 → **20 / 70** |
| Subpage title | 218 → **173** | 260 → **208** | 260 → 176 | 260 | 260 → **312** |
| Subpage top padding | 180 → **120** | 180 → **144** | 180 → 122 | 180 | 180 → 216 |
| Content starts at, % vh | 55% → **≈41%** | 51% → **≈41%** | — | 41% | 31% → ≈37% |
| /work first card row fits | no → **yes** | no → **yes** | — | yes | yes |
| About paragraph (home) | 61 → 61 | 92 → **74** | 92 → 62 | 92 | 92 → **110** |
| About, % vh | 89% → ≈89% | 138% → **≈89%** | — | 89% | 50% → ≈60% |
| Work title | 154 → **133** | 200 → **160** | 200 → 135 | 200 | 200 → **240** |
| Work title at 1440×900 | — | 200 → **150** (93% → ≈52% vh) | — | — | — |
| Project row title | 51 → **43** | 61 → **51** | 61 → 43 | 64 | 64 → **77** |
| Statement | 102 → **83** | 123 → **99** (5 → 4 lines) | 123 → 84 | 124 | 124 → **149** |
| GOT A PROJECT? | 384 → **300** | 450 → **360** | 450 → 304 | 450 | 450 → **540** |
| Contact headline | 115 → **93** | 138 → **112** (one-line "WORK TOGETHER") | 138 → 95 | 140 | 140 → **168** |
| Footer marquee | 230 → **187** | 276 → **224** | 276 → 189 | 280 | 280 → **336** |
| Body text (/about) | 19 → **16** | 20 → **16** | 20 → 16 | 20 | 20 → **22** |
| Labels / MENU | 13 = 13 | 13 = 13 | 13 = 13 | 13 = 13 | 13 → **15** |
| Side padding | 77 → **53** | 80 → **64** | 80 → 54 | 80 | 80 → 96 (+ max-width) |

Mobile check (unchanged by design): at 375×812 every token resolves to today's `clamp()` minimum. At 768×1024 the hero is 39px (today 40px) and the page title 130px (today 131px).

## 6. Still open

> Decided on 2026-10-26: the form stays below the fold, the 1.2× cap stays, the navbar shrinks to 14px / 56px with no lower size, and the snaps are applied. See §0.

1. **/contact form.** It doesn't fit above the fold even at 1920 (it ends 38px below). After scaling, the header shrinks but the form is mostly 13–18px text with fixed padding, so at 1536×864 the Send button will still sit about 100px below the fold. Options: accept it (it's a normal scrolling page), or reduce the message box from 5 rows to 4 and tighten the field gaps. **My recommendation is to accept it.**
2. **Growth above 1920 is capped at 1.2×.** Raise it if you want 2560 and 4K to look like a scaled-up 1920. Lower it if you prefer large screens calmer.
3. **The nav shrinks to 14px / 56px at 1536.** This follows "1536 should feel like 1920 at 0.8×". If you'd rather keep the nav a fixed 18px / 64px at every size, I'll leave it out of the system.
4. **Snaps** (§4.3): fine to apply, or keep every current value exactly.

## 7. Implementation plan (after approval)

1. Add the tokens to `globals.css`. No visual change on its own.
2. Hero: tokens, card height and em-based offsets. Verify at all eight viewports, including the real windows.
3. Home sections (AboutV2, Work, Statement, Contact, Footer, Navbar, LoadingScreen): replace the clamps and remove the two 1400px breakpoints.
4. Subpages (PageHeader, about, work, contact, 404, TechExperience, WorkGrid, ContactForm): tokens and `--container-max`.
5. Merge the 600/768/900 breakpoints into 640/900.
6. Re-run this screenshot suite plus the original 375–1920 audit. Pixel-diff 1920×1080 against today (expect no change apart from the snaps) and check that mobile at 375 and 768 is unchanged. Commit per step and don't push.
