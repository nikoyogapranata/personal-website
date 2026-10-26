// Film grain overlay. grain.webp is the same feTurbulence noise (baseFrequency 0.65,
// 3 octaves, desaturated) pre-rendered to a seamless 128px tile. A live SVG filter with
// mix-blend-mode over the whole viewport had to be re-blended on every scroll frame.
export default function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        backgroundImage: 'url(/grain.webp)',
        backgroundRepeat: 'repeat',
        opacity: 0.06,
      }}
    />
  )
}
