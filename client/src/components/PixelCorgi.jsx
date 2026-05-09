import { useEffect, useRef } from 'react'
import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js'

const C = {
  orange:     0xD4883C,
  darkOrange: 0xBE7630,
  cream:      0xFFF3D4,
  white:      0xFFFFFF,
  darkBrown:  0x2D1B0E,
  pink:       0xFF9EAF,
  pinkDark:   0xE8879A,
  outline:    0x3D2B1F,
}

// 16x16 front-facing sitting corgi
// . = transparent  O = orange fur  E = dark orange ear  e = pink inner ear
// W = cream/white  D = dark brown (eye/outline)  h = white eye highlight
// N = dark nose    P = pink tongue  C = cream paw
const MAP = [
  '...EEE......EEE.',  // row  0  — ear tips
  '..EEEEE....EEEEE',  // row  1  — ears
  '..EEeEE....EEeEE',  // row  2  — ears with pink inner
  '..OOOOOOOOOOOO..',  // row  3  — top of head
  '.OOOOOWWWWOOOOOO',  // row  4  — forehead, white blaze (cols 5-8)
  '.OODhOWWWWOhDOO.',  // row  5  — eyes flanking blaze
  '.WWWWWWWNWWWWWW.',  // row  6  — white cheeks, dark nose at col 8
  '.WWWWWWWPWWWWWW.',  // row  7  — white cheeks, pink tongue col 8
  '..OOOOOWWWWOOO..',  // row  8  — neck / upper chest
  '.OOOOOOWWWOOOOOO',  // row  9  — body, white chest
  '.OOOOOOWWWOOOOOO',  // row 10  — body
  '.OOOOOOOOOOOOO..',  // row 11  — lower body
  '..OOCCOO..OOCCOO',  // row 12  — paw fronts (C=cream paw highlight)
  '..OCCCOO..OOCCC.',  // row 13  — paw bottoms
]

const COLOR_MAP = {
  O: C.orange,
  E: C.darkOrange,
  e: C.pink,
  W: C.cream,
  C: C.cream,
  D: C.darkBrown,
  h: C.white,
  N: C.darkBrown,
  P: C.pink,
}

// Opaque pixel set for outline detection
function isOpaque(row, col) {
  if (row < 0 || row >= MAP.length) return false
  const r = MAP[row]
  if (col < 0 || col >= r.length) return false
  return r[col] !== '.'
}

function drawCorgi(g, px) {
  g.clear()
  // Fill pixels
  for (let row = 0; row < MAP.length; row++) {
    for (let col = 0; col < MAP[row].length; col++) {
      const ch = MAP[row][col]
      if (ch === '.') continue
      const color = COLOR_MAP[ch]
      if (color == null) continue
      g.rect(col * px, row * px, px, px)
      g.fill(color)
    }
  }
  // Outline: 1px dark border on edges that border transparency
  for (let row = 0; row < MAP.length; row++) {
    for (let col = 0; col < MAP[row].length; col++) {
      if (!isOpaque(row, col)) continue
      // Top edge
      if (!isOpaque(row - 1, col)) {
        g.rect(col * px, row * px, px, 1); g.fill(C.outline)
      }
      // Bottom edge
      if (!isOpaque(row + 1, col)) {
        g.rect(col * px, row * px + px - 1, px, 1); g.fill(C.outline)
      }
      // Left edge
      if (!isOpaque(row, col - 1)) {
        g.rect(col * px, row * px, 1, px); g.fill(C.outline)
      }
      // Right edge
      if (!isOpaque(row, col + 1)) {
        g.rect(col * px + px - 1, row * px, 1, px); g.fill(C.outline)
      }
    }
  }
}

function drawThoughtBubble(g, px, dotCount) {
  g.clear()
  // Tail dots
  g.circle(6 * px, -0.8 * px, px * 0.3); g.fill(C.cream)
  g.stroke({ color: C.outline, width: 1 })
  g.circle(7 * px, -1.8 * px, px * 0.45); g.fill(C.cream)
  g.stroke({ color: C.outline, width: 1 })
  // Bubble
  g.roundRect(5 * px, -5.5 * px, 6 * px, 3 * px, px * 0.5)
  g.fill(C.white)
  g.stroke({ color: C.outline, width: 1.5 })
  // Animated dots
  for (let d = 0; d < 3; d++) {
    g.circle((6.5 + d * 1.5) * px, -4 * px, px * 0.28)
    g.fill({ color: C.darkBrown, alpha: d < dotCount ? 1 : 0.2 })
  }
}

function drawGlasses(g, px) {
  g.clear()
  // Left lens — over left eye area (cols 3-4, row 5)
  g.roundRect(2.8 * px, 4.8 * px, 2.2 * px, 1.6 * px, 2)
  g.fill({ color: C.white, alpha: 0.35 })
  g.stroke({ color: C.darkBrown, width: 1 })
  // Right lens — over right eye area (cols 11-12, row 5)
  g.roundRect(10.8 * px, 4.8 * px, 2.2 * px, 1.6 * px, 2)
  g.fill({ color: C.white, alpha: 0.35 })
  g.stroke({ color: C.darkBrown, width: 1 })
  // Bridge connecting them
  g.moveTo(5 * px, 5.6 * px); g.lineTo(10.8 * px, 5.6 * px)
  g.stroke({ color: C.darkBrown, width: 1 })
}

function drawCup(g, px) {
  g.clear()
  const bw = 3 * px
  const bh = 2.5 * px
  // Body
  g.rect(0, 0, bw, bh); g.fill(C.darkBrown)
  g.rect(px * 0.25, px * 0.25, bw - px * 0.5, bh - px * 0.25); g.fill(0x7B4F35)
  // Handle
  g.roundRect(bw, px * 0.4, px * 0.8, px * 1.6, 3)
  g.fill({ color: C.darkBrown, alpha: 0 })
  g.stroke({ color: C.darkBrown, width: 1.5 })
  // Steam wisps
  for (let i = 0; i < 3; i++) {
    g.rect((0.4 + i * 0.9) * px, -px * 1.2, px * 0.25, px * 0.8)
    g.fill({ color: C.cream, alpha: 0.7 })
  }
}

function drawSparkle(g, x, y, r, alpha) {
  g.clear()
  g.alpha = alpha
  const points = 4
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    g.moveTo(x, y)
    g.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r)
    g.stroke({ color: 0xFFD700, width: 2 })
  }
  g.circle(x, y, r * 0.2); g.fill(0xFFFFAA)
}

function drawSleepyEyes(g, px) {
  g.clear()
  // Half-lid over left eye (cols 2-4 area, row 5)
  g.rect(2.8 * px, 5 * px, 2.5 * px, px * 0.55); g.fill(C.orange)
  // Half-lid over right eye (cols 10-12 area, row 5)
  g.rect(10.8 * px, 5 * px, 2.5 * px, px * 0.55); g.fill(C.orange)
  // Bottom lash lines
  g.rect(2.8 * px, 5 * px + px * 0.55, 2.5 * px, 1); g.fill(C.darkBrown)
  g.rect(10.8 * px, 5 * px + px * 0.55, 2.5 * px, 1); g.fill(C.darkBrown)
}

export default function PixelCorgi({ state = 'idle', size = 256 }) {
  const containerRef = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    let destroyed = false
    let pixiApp
    let initDone = false

    async function init() {
      const px = Math.max(1, Math.floor(size / 16))
      const cw = px * 16 + px * 4   // 2px padding each side
      const ch = px * 16 + px * 8   // top/bottom padding for overlays

      const app = new Application()
      await app.init({
        width: cw,
        height: ch,
        backgroundAlpha: 0,
        antialias: false,
        resolution: 1,
        resizeTo: undefined,
      })

      // React StrictMode may destroy before init completes
      if (destroyed) {
        try { app.destroy(true) } catch (_) {}
        return
      }

      pixiApp = app
      initDone = true

      const canvas = pixiApp.canvas
      canvas.style.imageRendering = 'pixelated'
      canvas.style.imageRendering = 'crisp-edges'
      canvas.style.display = 'block'
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(canvas)
      }

      // Stage root — corgi sits at top-left after the padding offset
      const root = new Container()
      root.x = px * 2
      root.y = px * 4    // leave room above for thought bubble
      pixiApp.stage.addChild(root)

      // --- Corgi body ---
      const corgiG = new Graphics()
      drawCorgi(corgiG, px)
      root.addChild(corgiG)

      // --- Overlay layers ---
      const thoughtG   = new Graphics()
      const glassesG   = new Graphics()
      const sleepyG    = new Graphics()
      const cupG       = new Graphics()

      root.addChild(thoughtG)
      root.addChild(glassesG)
      root.addChild(sleepyG)
      root.addChild(cupG)

      // Sparkle pool
      const SPARKLE_POSITIONS = [
        [-2 * px, 3 * px], [18 * px, 3 * px],
        [-3 * px, 8 * px], [17 * px, 9 * px],
        [1 * px, -1 * px], [14 * px, -1 * px],
      ]
      const sparkleGs = SPARKLE_POSITIONS.map(() => {
        const sg = new Graphics()
        root.addChild(sg)
        return sg
      })

      // ZZZ texts
      const zzzItems = [
        { text: 'z',  size: px * 1.2, bx: 13 * px, phase: 0 },
        { text: 'z',  size: px * 1.5, bx: 14 * px, phase: 1.5 },
        { text: 'zz', size: px * 0.9, bx: 12 * px, phase: 3.0 },
      ].map(({ text, size: fs, bx, phase }) => {
        const t = new Text({
          text,
          style: new TextStyle({ fontFamily: 'monospace', fontSize: fs, fill: 0x7DB87D, fontWeight: 'bold' }),
        })
        t.alpha = 0
        root.addChild(t)
        return { t, bx, phase }
      })

      let elapsed = 0
      let cupTargetX = 18 * px
      let cupCurrentX = 18 * px

      pixiApp.ticker.add((ticker) => {
        elapsed += ticker.deltaMS / 1000
        const s = stateRef.current

        // Reset transforms each tick
        root.rotation = 0
        root.pivot.set(0, 0)
        root.x = px * 2
        root.y = px * 4
        root.scale.set(1, 1)

        // Clear overlays
        thoughtG.clear()
        glassesG.clear()
        sleepyG.clear()
        for (const sg of sparkleGs) sg.clear()
        for (const zz of zzzItems) zz.t.alpha = 0

        // ---- idle ----
        if (s === 'idle') {
          root.y = px * 4 + Math.sin(elapsed * 1.3) * px * 0.5
        }

        // ---- listening ----
        if (s === 'listening') {
          // Rotate around center of head
          const pivotX = 8 * px
          const pivotY = 5 * px
          root.pivot.set(pivotX, pivotY)
          root.x = px * 2 + pivotX
          root.y = px * 4 + pivotY + Math.sin(elapsed * 1.5) * px * 0.3
          root.rotation = -0.10
        }

        // ---- thinking ----
        if (s === 'thinking') {
          root.y = px * 4
          const dotCount = Math.floor(elapsed * 2) % 4
          drawThoughtBubble(thoughtG, px, dotCount)
        }

        // ---- excited ----
        if (s === 'excited') {
          const hop = Math.abs(Math.sin(elapsed * 6)) * px * 4
          root.y = px * 4 - hop
          const squashX = 1 + Math.sin(elapsed * 6) * 0.07
          root.scale.set(squashX, 2 - squashX)
          // Sparkles
          const sparklePhases = SPARKLE_POSITIONS.map((_, i) => (elapsed * 3 + i * 1.1) % (Math.PI * 2))
          sparklePhases.forEach((phase, i) => {
            const a = (Math.sin(phase) + 1) / 2
            const [sx, sy] = SPARKLE_POSITIONS[i]
            drawSparkle(sparkleGs[i], sx, sy, px * (0.5 + a * 0.5), a)
          })
        }

        // ---- serving ----
        if (s === 'serving') {
          root.y = px * 4 + Math.sin(elapsed * 1.0) * px * 0.3
          cupTargetX = 16 * px
          cupCurrentX += (cupTargetX - cupCurrentX) * 0.08
          cupG.x = cupCurrentX
          cupG.y = 10 * px
          drawCup(cupG, px)
        } else {
          cupTargetX = 20 * px
          cupCurrentX += (cupTargetX - cupCurrentX) * 0.12
          cupG.clear()
        }

        // ---- sleepy ----
        if (s === 'sleepy') {
          root.y = px * 4 + Math.sin(elapsed * 0.5) * px * 0.4
          root.rotation = Math.sin(elapsed * 0.4) * 0.04
          root.pivot.set(8 * px, 8 * px)
          root.x = px * 2 + 8 * px
          root.y = px * 4 + 8 * px + Math.sin(elapsed * 0.5) * px * 0.4
          drawSleepyEyes(sleepyG, px)
          // ZZZ
          for (const zz of zzzItems) {
            const phase = (elapsed * 0.7 + zz.phase) % (Math.PI * 2)
            const progress = phase / (Math.PI * 2)
            zz.t.x = zz.bx + Math.sin(phase * 2) * px * 0.8
            zz.t.y = px * 2 - progress * px * 4
            zz.t.alpha = Math.max(0, Math.sin(progress * Math.PI))
          }
        }

        // ---- reading ----
        if (s === 'reading') {
          root.y = px * 4 + Math.sin(elapsed * 0.8) * px * 0.25
          drawGlasses(glassesG, px)
        }
      })
    }

    init().catch(console.error)

    return () => {
      destroyed = true
      if (pixiApp && initDone) {
        try { pixiApp.destroy(true) } catch (_) {}
        pixiApp = null
      }
    }
  }, [size])

  return (
    <div
      ref={containerRef}
      style={{ display: 'inline-block', lineHeight: 0, userSelect: 'none' }}
    />
  )
}
