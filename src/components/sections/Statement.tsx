"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import Image from "next/image";
import Link from "next/link";

export default function Statement({ exitDim }: { exitDim?: MotionValue<number> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const springCfg = { stiffness: 60, damping: 18, mass: 0.6 };

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
  // Literal hex: interpolated colours can't be CSS variables (--color-bg / --color-bg-dark)
  const clipBg   = useTransform(smooth, [0.25, 0.60], ["#f8f8f5", "#0a0a0a"]);
  const gotColor = useTransform(smooth, [0.25, 0.60], ["#0a0a0a", "#f8f8f5"]);

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
        background: "var(--color-bg-dark)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top:      0,
          height:   "100vh",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            position:   "absolute",
            inset:      0,
            clipPath:   reduceMotion ? "none" : clipPath,
            background: clipBg,
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
                    color:         "var(--color-text)",
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
                    color:         "var(--color-accent-secondary)",
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
                  color:         "var(--color-text)",
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
                    color:         "var(--color-text)",
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
                    color:         "var(--color-text)",
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
                    color:         "var(--color-accent-secondary)",
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
                  color:         gotColor,
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

        {/* Exit dim — driven from page.tsx as Contact slides in */}
        {exitDim && (
          <motion.div
            style={{
              position:      "absolute",
              inset:         0,
              background:    "var(--color-bg-dark)",
              opacity:       exitDim,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
    </>
  );
}
