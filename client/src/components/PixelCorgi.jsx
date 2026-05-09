import { useEffect, useRef } from 'react'
import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js'

import excitedSprite from '../assets/corgi-states/excited.png'
import idleSprite from '../assets/corgi-states/idle.png'
import listeningSprite from '../assets/corgi-states/listening.png'
import readingSprite from '../assets/corgi-states/reading.png'
import servingSprite from '../assets/corgi-states/serving.png'
import sleepySprite from '../assets/corgi-states/sleepy.png'
import thinkingSprite from '../assets/corgi-states/thinking.png'

const SPRITES = {
  idle: idleSprite,
  listening: listeningSprite,
  thinking: thinkingSprite,
  excited: excitedSprite,
  serving: servingSprite,
  sleepy: sleepySprite,
  reading: readingSprite,
}

const STATE_NAMES = new Set(Object.keys(SPRITES))

function normalizeState(state) {
  return STATE_NAMES.has(state) ? state : 'idle'
}

function pxRect(g, x, y, w, h, color, alpha = 1) {
  g.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
  g.fill({ color, alpha })
}

function drawPlus(g, x, y, s, color) {
  pxRect(g, x + s, y, s, s * 3, color)
  pxRect(g, x, y + s, s * 3, s, color)
}

function drawStage(g, width, height, unit) {
  g.clear()

  pxRect(g, 0, 0, width, height, 0xFFE9BF)

  for (let y = 0; y < height; y += unit) {
    for (let x = 0; x < width; x += unit) {
      if ((x / unit + y / unit) % 2 === 0) {
        pxRect(g, x, y, unit, unit, 0xFFDDA8, 0.35)
      }
    }
  }

  const counterY = height - unit * 2.2
  pxRect(g, unit * 0.8, counterY, width - unit * 1.6, unit * 1.45, 0x2A1B2E)
  pxRect(g, unit * 1.2, counterY + unit * 0.25, width - unit * 2.4, unit * 0.7, 0x6F3A21)
  pxRect(g, unit * 1.2, counterY + unit * 0.95, width - unit * 2.4, unit * 0.25, 0xC36A2D)

  pxRect(g, unit * 1.4, unit * 1.2, unit * 2.3, unit * 1.25, 0x2A1B2E)
  pxRect(g, unit * 1.65, unit * 1.45, unit * 1.8, unit * 0.75, 0x8CA6B9)
  pxRect(g, unit * 1.9, unit * 1.65, unit * 0.34, unit * 0.18, 0xF7F1D7)
  pxRect(g, width - unit * 3.7, unit * 1.2, unit * 2.3, unit * 1.25, 0x2A1B2E)
  pxRect(g, width - unit * 3.45, unit * 1.45, unit * 1.8, unit * 0.75, 0x8CA6B9)
  pxRect(g, width - unit * 2.25, unit * 1.62, unit * 0.34, unit * 0.2, 0xF7F1D7)
}

function drawStateFx(g, state, elapsed, width, height, unit) {
  g.clear()
  const wobble = Math.sin(elapsed * 5)

  if (state === 'thinking' || state === 'reading') {
    const x = width - unit * 4.6
    const y = unit * 1.4 + Math.sin(elapsed * 2) * unit * 0.12
    pxRect(g, x, y, unit * 2.5, unit * 1.25, 0xFFFFFF)
    pxRect(g, x, y, unit * 2.5, unit * 1.25, 0x2A1B2E, 0.1)
    pxRect(g, x + unit * 0.25, y + unit * 0.3, unit * 0.4, unit * 0.18, 0x2A1B2E)
    pxRect(g, x + unit * 0.95, y + unit * 0.3, unit * 0.4, unit * 0.18, 0x2A1B2E)
    pxRect(g, x + unit * 1.65, y + unit * 0.3, unit * 0.4, unit * 0.18, 0x2A1B2E)
  }

  if (state === 'excited') {
    drawPlus(g, unit * 1.4, unit * 2.2 + wobble * 2, unit * 0.28, 0xF2B84B)
    drawPlus(g, width - unit * 2.4, unit * 2.8 - wobble * 2, unit * 0.24, 0xF2B84B)
    drawPlus(g, width - unit * 4.1, unit * 1.5, unit * 0.2, 0xF7F1D7)
  }

  if (state === 'sleepy') {
    const zX = width - unit * 4
    const zY = unit * 1.7 - (elapsed % 1.5) * unit
    pxRect(g, zX, zY, unit * 0.8, unit * 0.18, 0x2A1B2E, 0.8)
    pxRect(g, zX + unit * 0.48, zY + unit * 0.18, unit * 0.18, unit * 0.18, 0x2A1B2E, 0.8)
    pxRect(g, zX, zY + unit * 0.36, unit * 0.8, unit * 0.18, 0x2A1B2E, 0.8)
  }

  if (state === 'serving') {
    const steamX = width - unit * 3.25
    const steamY = height - unit * 5.5
    for (let i = 0; i < 3; i++) {
      pxRect(g, steamX + i * unit * 0.32, steamY - ((elapsed * 20 + i * 7) % 16), unit * 0.13, unit * 0.45, 0xF7F1D7, 0.8)
    }
  }
}

export default function PixelCorgi({ state = 'idle', size = 256 }) {
  const containerRef = useRef(null)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    let destroyed = false
    let pixiApp
    let ticker

    async function init() {
      const stageWidth = Math.round(size * 1.42)
      const stageHeight = Math.round(size * 1.18)
      const unit = Math.max(6, Math.round(size / 18))
      const resolution = Math.min(window.devicePixelRatio || 1, 2)

      const app = new Application()
      await app.init({
        width: stageWidth,
        height: stageHeight,
        backgroundAlpha: 0,
        antialias: false,
        resolution,
      })

      if (destroyed) {
        try { app.destroy(true) } catch (error) { console.warn('Pixi destroy failed', error) }
        return
      }

      pixiApp = app
      const canvas = app.canvas
      canvas.style.width = `${stageWidth}px`
      canvas.style.height = `${stageHeight}px`
      canvas.style.display = 'block'
      canvas.style.imageRendering = 'pixelated'
      canvas.style.imageRendering = 'crisp-edges'

      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(canvas)
      }

      const textures = {}
      await Promise.all(Object.entries(SPRITES).map(async ([key, url]) => {
        const texture = await Assets.load(url)
        if (texture?.source) texture.source.scaleMode = 'nearest'
        textures[key] = texture
      }))

      if (destroyed) {
        try { app.destroy(true) } catch (error) { console.warn('Pixi destroy failed', error) }
        return
      }

      const stageG = new Graphics()
      const fxG = new Graphics()
      const root = new Container()
      const current = normalizeState(stateRef.current)
      const mascot = new Sprite(textures[current])

      drawStage(stageG, stageWidth, stageHeight, unit)
      mascot.anchor.set(0.5, 1)
      mascot.width = size
      mascot.height = size
      mascot.x = stageWidth / 2
      mascot.y = stageHeight - unit * 1.55

      root.addChild(mascot)
      app.stage.addChild(stageG)
      app.stage.addChild(root)
      app.stage.addChild(fxG)

      let elapsed = 0
      let lastState = current

      ticker = (frame) => {
        elapsed += frame.deltaMS / 1000
        const nextState = normalizeState(stateRef.current)

        if (nextState !== lastState) {
          mascot.texture = textures[nextState]
          lastState = nextState
        }

        root.x = 0
        root.y = 0
        root.rotation = 0
        root.pivot.set(0, 0)
        mascot.x = stageWidth / 2
        mascot.y = stageHeight - unit * 1.55
        mascot.scale.set(size / mascot.texture.width, size / mascot.texture.height)

        if (nextState === 'idle') {
          root.y = Math.sin(elapsed * 1.8) * unit * 0.12
        }
        if (nextState === 'listening') {
          root.pivot.set(stageWidth / 2, stageHeight * 0.54)
          root.x = stageWidth / 2
          root.y = stageHeight * 0.54
          root.rotation = Math.sin(elapsed * 1.8) * 0.045
        }
        if (nextState === 'thinking' || nextState === 'reading') {
          root.y = Math.sin(elapsed * 2.2) * unit * 0.08
        }
        if (nextState === 'excited') {
          root.y = -Math.abs(Math.sin(elapsed * 8)) * unit * 0.95
        }
        if (nextState === 'serving') {
          root.x = Math.sin(elapsed * 2) * unit * 0.15
        }
        if (nextState === 'sleepy') {
          root.pivot.set(stageWidth / 2, stageHeight * 0.72)
          root.x = stageWidth / 2
          root.y = stageHeight * 0.72 + Math.sin(elapsed * 1.1) * unit * 0.08
          root.rotation = Math.sin(elapsed * 0.8) * 0.025
        }

        drawStateFx(fxG, nextState, elapsed, stageWidth, stageHeight, unit)
      }

      app.ticker.add(ticker)
    }

    init().catch(console.error)

    return () => {
      destroyed = true
      if (pixiApp && ticker) pixiApp.ticker.remove(ticker)
      if (pixiApp) {
        try { pixiApp.destroy(true) } catch (error) { console.warn('Pixi destroy failed', error) }
        pixiApp = null
      }
    }
  }, [size])

  return (
    <div
      ref={containerRef}
      className="pixel-corgi-stage"
      aria-label={`Corgi mascot is ${normalizeState(state)}`}
      role="img"
    />
  )
}
