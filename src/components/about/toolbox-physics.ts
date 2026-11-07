import Matter from 'matter-js'

/**
 * Physics for the /about toolbox, loaded only when the section is near the viewport.
 *
 * The chips stay in the page's normal flow (a real <ul>), laid out as a grid. Each one gets a
 * rectangle body; every frame its position and angle are applied as a transform relative to its
 * grid position. Nothing moves in layout, so there's no layout shift, and screen readers and
 * crawlers see the plain list.
 */

export type ToolboxPhysics = {
  /** Let the chips fall (called when the section scrolls into view) */
  drop(): void
  /** Run or stop the simulation loop (off-screen / hidden tab) */
  setActive(active: boolean): void
  destroy(): void
}

const WALL = 400 // thick walls so a fast flick can't tunnel through

export function startToolbox(arena: HTMLElement, chips: HTMLElement[]): ToolboxPhysics {
  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Sleeping } = Matter
  const W = arena.clientWidth
  const H = arena.clientHeight
  const arenaBox = arena.getBoundingClientRect()

  // Grid (flow) centre of each chip, relative to the arena
  const items = chips.map((el, i) => {
    el.style.transform = ''
    const r = el.getBoundingClientRect()
    const w = r.width, h = r.height
    const x0 = r.left - arenaBox.left + w / 2
    const y0 = r.top - arenaBox.top + h / 2
    // Start above the arena, scattered across its width, in a loose staggered column
    const body = Bodies.rectangle(
      w / 2 + Math.random() * Math.max(1, W - w),
      -h - i * (h * 0.9) - Math.random() * 40,
      w, h,
      { chamfer: { radius: Math.min(h / 2, 18) }, restitution: 0.25, friction: 0.5, frictionAir: 0.012, density: 0.002 },
    )
    Body.setAngle(body, (Math.random() - 0.5) * 1.1)
    return { el, body, x0, y0 }
  })

  const engine = Engine.create({ enableSleeping: true })
  engine.gravity.y = 1
  const floor = Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, { isStatic: true })
  // Side walls run from below the floor to above the highest parked chip
  const top = Math.min(...items.map(i => i.body.bounds.min.y)) - WALL
  const sideH = H + WALL - top
  const left  = Bodies.rectangle(-WALL / 2, top + sideH / 2, WALL, sideH, { isStatic: true })
  const right = Bodies.rectangle(W + WALL / 2, top + sideH / 2, WALL, sideH, { isStatic: true })
  const ceiling = Bodies.rectangle(W / 2, -WALL / 2, W + WALL * 2, WALL, { isStatic: true })
  let ceilingAdded = false
  Composite.add(engine.world, [floor, left, right, ...items.map(i => i.body)])

  // Drag and flick. Matter's Mouse also takes over the wheel and touch events (preventDefault),
  // which would stop the page scrolling over the arena: remove those. Releasing outside the
  // arena must still let go, so mouseup is forwarded from the window.
  const mouse = Mouse.create(arena)
  const m = mouse as unknown as Record<string, EventListener>
  arena.removeEventListener('wheel', m.mousewheel)
  arena.removeEventListener('touchmove', m.mousemove)
  arena.removeEventListener('touchstart', m.mousedown)
  arena.removeEventListener('touchend', m.mouseup)
  const release = (e: MouseEvent) => m.mouseup(e)
  window.addEventListener('mouseup', release)
  const grab = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, damping: 0.1 } })
  Composite.add(engine.world, grab)

  const paint = () => {
    for (const { el, body, x0, y0 } of items) {
      if (body.isSleeping && el.style.transform) continue
      el.style.transform = `translate3d(${body.position.x - x0}px, ${body.position.y - y0}px, 0) rotate(${body.angle}rad)`
    }
  }
  paint() // parked above the arena (clipped) until the drop

  let dropped = false
  let active = false
  let frame = 0
  let last = 0

  const step = (now: number) => {
    const dt = last ? Math.min(now - last, 1000 / 30) : 1000 / 60
    last = now
    Engine.update(engine, dt)

    if (!ceilingAdded && items.every(i => i.body.bounds.min.y > 0)) {
      Composite.add(engine.world, ceiling)
      ceilingAdded = true
    }
    // Safety net: anything that escapes the arena is put back inside
    for (const { body } of items) {
      const { x, y } = body.position
      if (x < 0 || x > W || y > H || (ceilingAdded && y < 0)) {
        Body.setPosition(body, { x: Math.min(W - 40, Math.max(40, x)), y: Math.min(H - 40, Math.max(40, y)) })
        Body.setVelocity(body, { x: 0, y: 0 })
        Sleeping.set(body, false)
      }
    }
    paint()
    frame = requestAnimationFrame(step)
  }

  const run = () => {
    if (frame || !dropped || !active) return
    last = 0
    frame = requestAnimationFrame(step)
  }
  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  return {
    drop() {
      if (dropped) return
      dropped = true
      run()
    },
    setActive(next) {
      active = next
      if (active) run()
      else stop()
    },
    destroy() {
      stop()
      window.removeEventListener('mouseup', release)
      Mouse.clearSourceEvents(mouse)
      arena.removeEventListener('mousemove', m.mousemove)
      arena.removeEventListener('mousedown', m.mousedown)
      arena.removeEventListener('mouseup', m.mouseup)
      Composite.clear(engine.world, false)
      Engine.clear(engine)
      for (const { el } of items) el.style.transform = ''
    },
  }
}
