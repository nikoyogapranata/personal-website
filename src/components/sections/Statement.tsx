"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SCROLL_SPRING } from "@/lib/motion";
import Image from "next/image";
import Link from "next/link";

// Tone zones (see page.tsx): light from the top of the 300vh track, dark from 40vh down.
// A zone switches when it crosses the viewport midline, i.e. at progress (50 + offset) / 200:
// light at 0.25, as the window finishes opening, and dark at 0.45, as GOT A PROJECT? takes over.
const DARK_FROM = "40vh";

export default function Statement() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const springCfg = SCROLL_SPRING;

  // Phase 1 (0 → 0.23): clip-path expands — same feel, rescaled for taller container
  const clipTopRaw    = useTransform(scrollYProgress, [0, 0.23], [28, 0]);
  const clipRightRaw  = useTransform(scrollYProgress, [0, 0.23], [20, 0]);
  const clipBottomRaw = useTransform(scrollYProgress, [0, 0.23], [28, 0]);
  const clipLeftRaw   = useTransform(scrollYProgress, [0, 0.23], [20, 0]);

  const clipTop    = useSpring(clipTopRaw,    springCfg);
  const clipRight  = useSpring(clipRightRaw,  springCfg);
  const clipBottom = useSpring(clipBottomRaw, springCfg);
  const clipLeft   = useSpring(clipLeftRaw,   springCfg);

  const clipPath = useTransform(
    [clipTop, clipRight, clipBottom, clipLeft] as [typeof clipTop, typeof clipRight, typeof clipBottom, typeof clipLeft],
    ([t, r, b, l]: number[]) => `inset(${t}% ${r}% ${b}% ${l}%)`,
  );

  const imgWidthRaw = useTransform(scrollYProgress, [0.06, 0.20], ["0em", "1.1em"]);
  const imgWidth    = useSpring(imgWidthRaw, springCfg);

  // Phase 2: collision then full scroll-through
  const smooth = useSpring(scrollYProgress, springCfg);

  // GOT A PROJECT? enters (collision), then continues scrolling left to reveal full text
  const gotX     = useTransform(smooth, [0.10, 0.75, 1.2], ["120vw", "0vw", "-240vw"]);
  // While it opens, the window is a cream panel inside the dark tone from Work. Once the light
  // tone has taken over the backdrop it goes transparent, so the later switch to dark is the
  // backdrop's crossfade rather than a scrubbed cream → black blend.
  const [island, setIsland] = useState(true);
  useMotionValueEvent(scrollYProgress, "change", (v) => setIsland(v < 0.3));

  // Statement gets pushed out — starts moving after GOT A PROJECT? is already mid-screen
  const statX = useTransform(smooth, [0.30, 0.70], ["0vw", "-130vw"]);

  // Reduced motion: no clip zoom or horizontal travel — crossfade the two layers in place
  const reduceMotion = usePrefersReducedMotion();
  const statFade     = useTransform(smooth, [0.30, 0.50], [1, 0]);
  const gotFade      = useTransform(smooth, [0.45, 0.65], [0, 1]);

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
        height:     "300vh",
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
          overflow: "hidden",
        }}
      >
        <motion.div
          data-tone-island={island ? "" : undefined}
          style={{
            position:   "absolute",
            inset:      0,
            clipPath:   reduceMotion ? "none" : clipPath,
            background: island ? "var(--color-bg)" : "transparent",
            overflow:   "hidden",
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
            <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }}>
              <motion.span
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
