'use client'
import { useRef, useState, useEffect, useId } from 'react'
import './StickerPeel.css'

interface StickerPeelProps {
  imageSrc: string
  rotate?: number
  peelBackHoverPct?: number
  peelBackActivePct?: number
  peelEasing?: string
  peelHoverEasing?: string
  width?: number
  shadowIntensity?: number
  lightingIntensity?: number
  initialPosition?: 'center' | { x: number; y: number }
  peelDirection?: number
  className?: string
}

export default function StickerPeel({
  imageSrc,
  rotate            = 0,
  peelBackHoverPct  = 30,
  peelBackActivePct = 40,
  width             = 200,
  shadowIntensity   = 0.6,
  lightingIntensity = 0.1,
  initialPosition,
  peelDirection     = 0,
  className         = '',
}: StickerPeelProps) {
  const rawId = useId()
  const uid   = rawId.replace(/[^a-zA-Z0-9]/g, '')

  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (!initialPosition || initialPosition === 'center') return { x: 0, y: 0 }
    return initialPosition
  })
  const [touchActive, setTouchActive] = useState(false)

  const containerRef          = useRef<HTMLDivElement>(null)
  const dragTargetRef         = useRef<HTMLDivElement>(null)
  const pointLightRef         = useRef<SVGFEPointLightElement>(null)
  const pointLightFlippedRef  = useRef<SVGFEPointLightElement>(null)
  const draggableInstanceRef  = useRef<any>(null)

  const dragging  = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  // Dynamic point light — follows cursor within the sticker
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x    = e.clientX - rect.left
      const y    = e.clientY - rect.top
      if (pointLightRef.current) {
        pointLightRef.current.setAttribute('x', String(x))
        pointLightRef.current.setAttribute('y', String(y))
      }
      if (pointLightFlippedRef.current) {
        // flap is scaleY(-1), so y is mirrored
        pointLightFlippedRef.current.setAttribute('x', String(x))
        pointLightFlippedRef.current.setAttribute('y', String(rect.height - y))
      }
    }
    el.addEventListener('mousemove', onMouseMove)
    return () => el.removeEventListener('mousemove', onMouseMove)
  }, [])

  // Window-level drag tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({
        x: dragStart.current.px + e.clientX - dragStart.current.mx,
        y: dragStart.current.py + e.clientY - dragStart.current.my,
      })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current  = true
    draggableInstanceRef.current = { startX: pos.x, startY: pos.y }
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchActive(true)
    const t = e.touches[0]
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0]
    setPos({
      x: dragStart.current.px + t.clientX - dragStart.current.mx,
      y: dragStart.current.py + t.clientY - dragStart.current.my,
    })
  }
  const onTouchEnd = () => setTouchActive(false)

  const cssVars = {
    '--peel-direction':            `${peelDirection}deg`,
    '--sticker-rotate':            `${rotate}deg`,
    '--sticker-peelback-hover':    `${peelBackHoverPct}%`,
    '--sticker-peelback-active':   `${peelBackActivePct}%`,
    '--sticker-width':             `${width}px`,
    '--sticker-shadow-opacity':    String(shadowIntensity),
    '--sticker-lighting-constant': String(lightingIntensity),
  } as React.CSSProperties

  return (
    <div
      ref={dragTargetRef}
      className={`draggable ${className}`}
      style={{ left: pos.x, top: pos.y } as React.CSSProperties}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Per-instance SVG filter defs */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <filter id={`dropShadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity={shadowIntensity} />
          </filter>

          {/* Dynamic point light — tracks mouse position via ref */}
          <filter id={`pointLight-${uid}`} x="-20%" y="-20%" width="140%" height="140%"
            colorInterpolationFilters="sRGB">
            <feDiffuseLighting in="SourceAlpha" lightingColor="white"
              diffuseConstant={lightingIntensity} result="lit">
              <fePointLight ref={pointLightRef} x={width / 2} y={width / 2} z={width * 1.5} />
            </feDiffuseLighting>
            {/* k2=1 keeps src, k3=1 adds lit highlight */}
            <feComposite in="SourceGraphic" in2="lit" operator="arithmetic"
              k1="0" k2="1" k3="1" k4="0" />
          </filter>

          <filter id={`pointLightFlipped-${uid}`} x="-20%" y="-20%" width="140%" height="140%"
            colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.7" result="desat" />
            <feDiffuseLighting in="SourceAlpha" lightingColor="white"
              diffuseConstant={lightingIntensity * 0.5} result="lit">
              <fePointLight ref={pointLightFlippedRef} x={width / 2} y={width / 2} z={width * 1.5} />
            </feDiffuseLighting>
            <feComposite in="desat" in2="lit" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>

          <filter id={`expandAndFill-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
            <feMorphology operator="dilate" radius="2" in="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className={`sticker-container${touchActive ? ' touch-active' : ''}`}
        style={cssVars}
      >
        {/* Flap — back face of peeling sticker */}
        <div className="flap">
          <div className="flap-lighting" style={{ filter: `url(#pointLightFlipped-${uid})` }}>
            <img
              className="flap-image"
              src={imageSrc}
              alt=""
              draggable={false}
              onContextMenu={e => e.preventDefault()}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
              style={{ filter: `url(#expandAndFill-${uid})` }}
            />
          </div>
        </div>

        {/* Main sticker face */}
        <div className="sticker-main" style={{ filter: `url(#dropShadow-${uid})` }}>
          <div className="sticker-lighting" style={{ filter: `url(#pointLight-${uid})` }}>
            <img
              className="sticker-image"
              src={imageSrc}
              alt=""
              draggable={false}
              onContextMenu={e => e.preventDefault()}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
