"use client";
import { useEffect, useRef, useState } from "react";
import { motion, transform, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SCROLL_SPRING } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import Image from "next/image";
import Link from "next/link";

/**
 * Scroll length of the track. Progress (scrollYProgress) runs 0 → 1 over its full height, from its
 * top at the viewport bottom to its bottom there, so 0.01 of progress is 3.8vh of scroll. The scene
 * pins at 100 / 380 ≈ 0.26 and unpins at 1.
 */
const TRACK_VH = 380;

/** Scroll phases, as [start, end] progress. The early ones keep the scroll distances they had on the old 300vh track. */
const PHASE = {
  /** The window's clip-path opens to full screen (0 → 68vh) */
  clip:       [0, 0.18],
  /** The inline photo grows into the line (19 → 61vh) */
  image:      [0.05, 0.16],
  /** The statement is knocked out to the left (91 → 209vh) */
  statOut:    [0.24, 0.55],
  /** GOT A PROJECT? slides in from the right until its start sits at the left padding (30 → 224vh) */
  gotIn:      [0.08, 0.59],
  /** It keeps going left until its end sits at the right padding (224 → 342vh), then holds there to the unpin (342 → 380vh) */
  gotThrough: [0.59, 0.90],
  /** Reduced motion: crossfade the statement out, then GOT A PROJECT? in, in place */
  statFade:   [0.24, 0.39],
  gotFade:    [0.36, 0.51],
} satisfies Record<string, [number, number]>;
/** The window stays a cream island over the dark backdrop until here (91vh), see `island` */
const ISLAND_UNTIL = 0.24;
/** GOT A PROJECT? starts this far right (vw), and its end rests this far from the right edge (matching its left padding) */
const GOT_FROM_VW = 120;
const GOT_EDGE_VW = 4;

// Tone zones (see page.tsx): light from the top of the track, dark from 40vh down. A zone switches
// when it crosses the viewport midline, i.e. at progress (50vh + offset) / TRACK_VH: light at 0.13,
// as the window opens, and dark at 0.24, as the window goes transparent and the statement is hit.
const DARK_FROM = "40vh";

export default function Statement() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const springCfg = SCROLL_SPRING;

  // Phase 1: clip-path expands
  const clipTopRaw    = useTransform(scrollYProgress, PHASE.clip, [28, 0]);
  const clipRightRaw  = useTransform(scrollYProgress, PHASE.clip, [20, 0]);
  const clipBottomRaw = useTransform(scrollYProgress, PHASE.clip, [28, 0]);
  const clipLeftRaw   = useTransform(scrollYProgress, PHASE.clip, [20, 0]);

  const clipTop    = useSpring(clipTopRaw,    springCfg);
  const clipRight  = useSpring(clipRightRaw,  springCfg);
  const clipBottom = useSpring(clipBottomRaw, springCfg);
  const clipLeft   = useSpring(clipLeftRaw,   springCfg);

  const clipPath = useTransform(
    [clipTop, clipRight, clipBottom, clipLeft] as [typeof clipTop, typeof clipRight, typeof clipBottom, typeof clipLeft],
    ([t, r, b, l]: number[]) => `inset(${t}% ${r}% ${b}% ${l}%)`,
  );

  const imgWidthRaw = useTransform(scrollYProgress, PHASE.image, ["0em", "1.1em"]);
  const imgWidth    = useSpring(imgWidthRaw, springCfg);

  // Phase 2: collision then full scroll-through
  const smooth = useSpring(scrollYProgress, springCfg);

  // GOT A PROJECT? enters (collision), then continues left to reveal the full text and rests with
  // its end in view. It is about two screens wide, by an amount that depends on the viewport (its
  // font size is clamped), so the resting x is measured: the screen width less its own width.
  const gotRef = useRef<HTMLSpanElement>(null);
  const gotEnd = useMotionValue(GOT_EDGE_VW - 200); // vw; replaced by the measurement on mount
  useEffect(() => {
    const el = gotRef.current;
    if (!el) return;
    const measure = () => gotEnd.set(100 - GOT_EDGE_VW - (el.offsetWidth / window.innerWidth) * 100);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [gotEnd]);
  const gotX = useTransform(
    [smooth, gotEnd] as [typeof smooth, typeof gotEnd],
    ([v, end]: number[]) =>
      `${transform(v, [PHASE.gotIn[0], PHASE.gotThrough[0], PHASE.gotThrough[1]], [GOT_FROM_VW, 0, end])}vw`,
  );
  // While it opens, the window is a cream panel inside the dark tone from Work. Once the light
  // tone has taken over the backdrop it goes transparent, so the later switch to dark is the
  // backdrop's crossfade rather than a scrubbed cream → black blend.
  const [island, setIsland] = useState(true);
  useMotionValueEvent(scrollYProgress, "change", (v) => setIsland(v < ISLAND_UNTIL));

  // Statement gets pushed out — starts moving after GOT A PROJECT? is already mid-screen
  const statX = useTransform(smooth, PHASE.statOut, ["0vw", "-130vw"]);

  // Reduced motion: no clip zoom or horizontal travel — crossfade the two layers in place
  const reduceMotion = usePrefersReducedMotion();
  const statFade     = useTransform(smooth, PHASE.statFade, [1, 0]);
  const gotFade      = useTransform(smooth, PHASE.gotFade, [0, 1]);

  // GOT A PROJECT? is a link, but for most of this track it's off-screen (sliding in or out) or
  // faded. While it has focus, CSS (data-focus-reveal / data-focus-clip in globals.css) holds its
  // layer at x = 0, fully opaque, with the window open. Keyboard focus, or any focus while it
  // isn't visible, also scrolls the page to that resting point, so the scene around it matches
  // (the statement already gone), and skips the spring's lag.
  const GOT_REST = PHASE.gotThrough[0];
  const onGotFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const offScreen = r.left >= innerWidth || r.right <= 0 || r.top >= innerHeight || r.bottom <= 0;
    if (!offScreen && !e.currentTarget.matches(":focus-visible")) return; // a click on a visible link
    const track = containerRef.current;
    if (track) {
      // Progress runs from the track's top at the viewport bottom ("start end") to its bottom
      // there ("end end"), i.e. over its full height
      const top = track.getBoundingClientRect().top + window.scrollY;
      scrollToY(top - innerHeight + GOT_REST * track.offsetHeight);
    }
    smooth.jump(GOT_REST);
  };

  return (
    <>
    <style>{`
      @media (max-width: 640px) {
        .got-text { font-size: clamp(72px, 22vw, 180px) !important; }
      }
    `}</style>
    <div
      ref={containerRef}
      style={{
        position:   "relative",
        height:     `${TRACK_VH}vh`,
        zIndex:     10,
      }}
    >
      <div data-tone="light" style={{ position: "absolute", top: 0, left: 0, right: 0, height: DARK_FROM }} />
      <div data-tone="dark" style={{ position: "absolute", top: DARK_FROM, left: 0, right: 0, bottom: 0 }} />
      <div
        style={{
          position: "sticky",
          top:      0,
          height:   "100vh",
          // clip, not hidden: a hidden box is still a scroll container, and focusing the oversized
          // GOT A PROJECT? link made the browser scroll it sideways (~1500px) out of place
          overflow: "clip",
        }}
      >
        <motion.div
          data-tone-island={island ? "" : undefined}
          // Window fully open while GOT A PROJECT? has focus
          data-focus-clip=""
          style={{
            position:   "absolute",
            inset:      0,
            clipPath:   reduceMotion ? "none" : clipPath,
            background: island ? "var(--color-bg)" : "transparent",
            overflow:   "clip",
          }}
        >
          {/* Layer 1: Statement text — exits left after being "hit" */}
          <motion.div
            style={{
              position:       "absolute",
              inset:          0,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              padding:        "0 8vw",
              x:              reduceMotion ? 0 : statX,
              opacity:        reduceMotion ? statFade : 1,
              willChange:     "transform",
            }}
          >
            <p style={{ margin: 0, padding: 0, textAlign: "center" }}>
              <span style={{ display: "block", lineHeight: 1.05 }}>
                <span
                  style={{
                    fontFamily:    "var(--font-display)",
                    fontWeight:    700,
                    fontSize:      "var(--text-statement)",
                    letterSpacing: "-0.03em",
                    color:         "var(--tone-fg)",
                  }}
                >
                  FROM THE{" "}
                </span>
                <span
                  style={{
                    fontFamily:    "var(--font-serif)",
                    fontStyle:     "italic",
                    fontWeight:    400,
                    fontSize:      "var(--text-statement)",
                    letterSpacing: "-0.03em",
                    color:         "var(--tone-serif)",
                  }}
                >
                  first pixel
                </span>
              </span>

              <span
                style={{
                  display:       "block",
                  lineHeight:    1.05,
                  fontFamily:    "var(--font-display)",
                  fontWeight:    700,
                  fontSize:      "var(--text-statement)",
                  letterSpacing: "-0.03em",
                  color:         "var(--tone-fg)",
                }}
              >
                TO THE FINAL DEPLOY,
              </span>

              <span style={{ display: "block", lineHeight: 1.05 }}>
                <span
                  style={{
                    fontFamily:    "var(--font-display)",
                    fontWeight:    700,
                    fontSize:      "var(--text-statement)",
                    letterSpacing: "-0.03em",
                    color:         "var(--tone-fg)",
                  }}
                >
                  I
                </span>
                <motion.span
                  style={{
                    display:       "inline-block",
                    fontSize:      "var(--text-statement)",
                    height:        "0.72em",
                    width:         reduceMotion ? "1.1em" : imgWidth,
                    verticalAlign: "middle",
                    transform:     "translateY(-0.3em)",
                    margin:        "0 0.1em",
                    overflow:      "hidden",
                    borderRadius:  8,
                    flexShrink:    0,
                  }}
                >
                  <Image
                    src="/hero.jpeg"
                    alt=""
                    width={1280}
                    height={1600}
                    sizes="160px"
                    style={{
                      height:         "100%",
                      width:          "1.1em",
                      objectFit:      "cover",
                      objectPosition: "center",
                      display:        "block",
                      flexShrink:     0,
                    }}
                  />
                </motion.span>
                <span
                  style={{
                    fontFamily:    "var(--font-display)",
                    fontWeight:    700,
                    fontSize:      "var(--text-statement)",
                    letterSpacing: "-0.03em",
                    color:         "var(--tone-fg)",
                  }}
                >
                  HANDLE THE WHOLE{" "}
                </span>
                <span
                  style={{
                    fontFamily:    "var(--font-serif)",
                    fontStyle:     "italic",
                    fontWeight:    400,
                    fontSize:      "var(--text-statement)",
                    letterSpacing: "-0.03em",
                    color:         "var(--tone-serif)",
                  }}
                >
                  product.
                </span>
              </span>
            </p>
          </motion.div>

          {/* Layer 2: GOT A PROJECT? — oversized, crashes in from right */}
          <motion.div
            // Held at x = 0, fully shown, while the link has focus (see onGotFocus)
            data-focus-reveal=""
            style={{
              position:   "absolute",
              inset:      0,
              display:    "flex",
              alignItems: "center",
              justifyContent: reduceMotion ? "center" : undefined,
              x:          reduceMotion ? 0 : gotX,
              opacity:    reduceMotion ? gotFade : 1,
              willChange: "transform",
            }}
          >
            <Link
              href="/contact"
              onFocus={onGotFocus}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <motion.span
                ref={gotRef}
                className={reduceMotion ? undefined : "got-text"}
                style={{
                  fontFamily:    "var(--font-display)",
                  fontWeight:    800,
                  // Reduced motion: the text can't scroll across, so size it to fit and let it wrap
                  fontSize:      reduceMotion ? "clamp(3.5rem, calc(10.4167 * var(--u)), 240px)" : "var(--text-poster)",
                  letterSpacing: "-0.04em",
                  color:         "var(--tone-fg)",
                  lineHeight:    1,
                  userSelect:    "none",
                  whiteSpace:    reduceMotion ? "normal" : "nowrap",
                  textAlign:     reduceMotion ? "center" : undefined,
                  paddingLeft:   reduceMotion ? 0 : "4vw",
                }}
              >
                GOT A PROJECT?
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </div>
    </>
  );
}
