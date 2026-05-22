"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, MotionValue } from "framer-motion";

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
    [clipTop, clipRight, clipBottom, clipLeft] as any,
    ([t, r, b, l]: number[]) => `inset(${t}% ${r}% ${b}% ${l}%)`,
  );

  const imgWidthRaw = useTransform(scrollYProgress, [0.06, 0.20], ["0em", "1.1em"]);
  const imgWidth    = useSpring(imgWidthRaw, springCfg);

  // Phase 2: collision then full scroll-through
  const smooth = useSpring(scrollYProgress, springCfg);

  // GOT A PROJECT? enters (collision), then continues scrolling left to reveal full text
  const gotX     = useTransform(smooth, [0.10, 0.75, 1.2], ["120vw", "0vw", "-240vw"]);
  const clipBg   = useTransform(smooth, [0.25, 0.60], ["#f8f8f5", "#0a0a0a"]);
  const gotColor = useTransform(smooth, [0.25, 0.60], ["#0a0a0a", "#f8f8f5"]);

  // Statement gets pushed out — starts moving after GOT A PROJECT? is already mid-screen
  const statX = useTransform(smooth, [0.30, 0.70], ["0vw", "-130vw"]);

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
        height:     "450vh",
        zIndex:     10,
        background: "#0a0a0a",
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
            clipPath,
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
              x:              statX,
              willChange:     "transform",
            }}
          >
            <p style={{ margin: 0, padding: 0, textAlign: "center" }}>
              <span style={{ display: "block", lineHeight: 1.05 }}>
                <span
                  style={{
                    fontFamily:    "var(--font-display)",
                    fontWeight:    700,
                    fontSize:      "clamp(48px, 8vw, 124px)",
                    letterSpacing: "-0.03em",
                    color:         "#0a0a0a",
                  }}
                >
                  FROM THE{" "}
                </span>
                <span
                  style={{
                    fontFamily:    "var(--font-serif)",
                    fontStyle:     "italic",
                    fontWeight:    400,
                    fontSize:      "clamp(48px, 8vw, 124px)",
                    letterSpacing: "-0.03em",
                    color:         "#2563eb",
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
                  fontSize:      "clamp(48px, 8vw, 124px)",
                  letterSpacing: "-0.03em",
                  color:         "#0a0a0a",
                }}
              >
                TO THE FINAL DEPLOY,
              </span>

              <span style={{ display: "block", lineHeight: 1.05 }}>
                <span
                  style={{
                    fontFamily:    "var(--font-display)",
                    fontWeight:    700,
                    fontSize:      "clamp(48px, 8vw, 124px)",
                    letterSpacing: "-0.03em",
                    color:         "#0a0a0a",
                  }}
                >
                  I
                </span>
                <motion.span
                  style={{
                    display:       "inline-block",
                    fontSize:      "clamp(48px, 8vw, 124px)",
                    height:        "0.72em",
                    width:         imgWidth,
                    verticalAlign: "middle",
                    transform:     "translateY(-0.3em)",
                    margin:        "0 0.1em",
                    overflow:      "hidden",
                    borderRadius:  8,
                    flexShrink:    0,
                  }}
                >
                  <img
                    src="/hero.jpeg"
                    alt=""
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
                    fontSize:      "clamp(48px, 8vw, 124px)",
                    letterSpacing: "-0.03em",
                    color:         "#0a0a0a",
                  }}
                >
                  HANDLE THE WHOLE{" "}
                </span>
                <span
                  style={{
                    fontFamily:    "var(--font-serif)",
                    fontStyle:     "italic",
                    fontWeight:    400,
                    fontSize:      "clamp(48px, 8vw, 124px)",
                    letterSpacing: "-0.03em",
                    color:         "#2563eb",
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
              x:          gotX,
              willChange: "transform",
            }}
          >
            <motion.span
              className="got-text"
              style={{
                fontFamily:    "var(--font-display)",
                fontWeight:    800,
                fontSize:      "clamp(180px, 30vw, 450px)",
                letterSpacing: "-0.04em",
                color:         gotColor,
                lineHeight:    1,
                userSelect:    "none",
                whiteSpace:    "nowrap",
                paddingLeft:   "4vw",
              }}
            >
              GOT A PROJECT?
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Exit dim — driven from page.tsx as Contact slides in */}
        {exitDim && (
          <motion.div
            style={{
              position:      "absolute",
              inset:         0,
              background:    "#0a0a0a",
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
