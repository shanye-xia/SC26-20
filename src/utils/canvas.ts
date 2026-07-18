import { COLORS, GRID_SIZE } from '@/constants/game'
import type { ActiveEffects, PowerUpType } from '@/types/game'

export interface CanvasState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  cellSize: number
  dpr: number
}

export function initCanvas(canvas: HTMLCanvasElement): CanvasState {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2d context')
  }

  return {
    canvas,
    ctx,
    cellSize: 0,
    dpr: window.devicePixelRatio || 1
  }
}

export function resizeCanvas(state: CanvasState, cssSize: number): void {
  const { canvas, ctx, dpr } = state
  state.cellSize = cssSize / GRID_SIZE

  canvas.width = cssSize * dpr
  canvas.height = cssSize * dpr
  canvas.style.width = `${cssSize}px`
  canvas.style.height = `${cssSize}px`

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssSize, cssSize)
}

export function drawBackground(state: CanvasState): void {
  const { ctx, canvas } = state
  const cssWidth = canvas.width / state.dpr
  const cssHeight = canvas.height / state.dpr

  ctx.fillStyle = COLORS.bgCode
  ctx.fillRect(0, 0, cssWidth, cssHeight)
}

export function drawGrid(state: CanvasState): void {
  const { ctx, cellSize } = state
  const cssSize = cellSize * GRID_SIZE

  ctx.strokeStyle = COLORS.gridLine
  ctx.lineWidth = 1
  ctx.beginPath()

  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = i * cellSize
    ctx.moveTo(pos, 0)
    ctx.lineTo(pos, cssSize)
    ctx.moveTo(0, pos)
    ctx.lineTo(cssSize, pos)
  }

  ctx.stroke()
}

export function drawCell(
  state: CanvasState,
  x: number,
  y: number,
  color: string,
  gap: number = 2
): void {
  const { ctx, cellSize } = state
  const px = x * cellSize + gap
  const py = y * cellSize + gap
  const size = cellSize - gap * 2

  ctx.fillStyle = color
  ctx.fillRect(px, py, size, size)
}

export function drawRoundedCell(
  state: CanvasState,
  x: number,
  y: number,
  color: string,
  radius: number = 4,
  gap: number = 2
): void {
  const { ctx, cellSize } = state
  const px = x * cellSize + gap
  const py = y * cellSize + gap
  const size = cellSize - gap * 2

  ctx.fillStyle = color
  roundRect(ctx, px, py, size, size, radius)
  ctx.fill()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function drawNode(
  state: CanvasState,
  x: number,
  y: number,
  label: string,
  isCurrentTarget: boolean,
  isDistractor: boolean
): void {
  const { ctx, cellSize } = state

  if (isDistractor) {
    drawDistractorNode(state, x, y)
  } else {
    drawCorrectNode(state, x, y, isCurrentTarget)
  }

  ctx.fillStyle = isDistractor ? COLORS.textPrimary : COLORS.bgPrimary
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxWidth = cellSize - 8
  const maxFontSize = Math.max(10, cellSize * 0.4)
  const minFontSize = Math.max(6, cellSize * 0.18)
  const fontSize = fitTextFontSize(ctx, label, maxWidth, maxFontSize, minFontSize)
  ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`

  ctx.fillText(
    label,
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2
  )
}

export function drawWall(state: CanvasState, x: number, y: number): void {
  const { ctx, cellSize } = state
  const gap = 2
  const px = x * cellSize + gap
  const py = y * cellSize + gap
  const size = cellSize - gap * 2

  ctx.fillStyle = COLORS.wallFill
  ctx.strokeStyle = COLORS.wallStroke
  ctx.lineWidth = 2
  roundRect(ctx, px, py, size, size, 4)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = COLORS.wallShadow
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(px + size * 0.2, py + size * 0.85)
  ctx.lineTo(px + size * 0.85, py + size * 0.2)
  ctx.moveTo(px + size * 0.55, py + size * 0.9)
  ctx.lineTo(px + size * 0.9, py + size * 0.55)
  ctx.stroke()
}

export function drawPowerUp(state: CanvasState, x: number, y: number, type: PowerUpType): void {
  const { ctx, cellSize } = state
  const cx = x * cellSize + cellSize / 2
  const cy = y * cellSize + cellSize / 2
  const radius = cellSize * 0.34
  const color = getPowerUpColor(type)

  ctx.fillStyle = color
  ctx.strokeStyle = COLORS.textPrimary
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLORS.bgPrimary
  ctx.font = `bold ${Math.max(10, cellSize * 0.34)}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(getPowerUpLabel(type), cx, cy)
}

export function drawProjectile(state: CanvasState, x: number, y: number): void {
  const { ctx, cellSize } = state
  const cx = x * cellSize + cellSize / 2
  const cy = y * cellSize + cellSize / 2

  ctx.fillStyle = COLORS.projectile
  ctx.strokeStyle = COLORS.powerShot
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(4, cellSize * 0.2), 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

function drawCorrectNode(state: CanvasState, x: number, y: number, isCurrentTarget: boolean): void {
  const { ctx, cellSize } = state
  const gap = 2
  const px = x * cellSize + gap
  const py = y * cellSize + gap
  const size = cellSize - gap * 2

  ctx.fillStyle = COLORS.accentString
  roundRect(ctx, px, py, size, size, 4)
  ctx.fill()

  if (isCurrentTarget) {
    ctx.strokeStyle = COLORS.accentVariable
    ctx.lineWidth = 2
    roundRect(ctx, px - 1, py - 1, size + 2, size + 2, 5)
    ctx.stroke()
  }
}

function drawDistractorNode(state: CanvasState, x: number, y: number): void {
  const { ctx, cellSize } = state
  const gap = 2
  const px = x * cellSize + gap
  const py = y * cellSize + gap
  const size = cellSize - gap * 2

  ctx.fillStyle = COLORS.bgPanel
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 1
  roundRect(ctx, px, py, size, size, 4)
  ctx.fill()
  ctx.stroke()
  ctx.setLineDash([])
}

function fitTextFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number
): number {
  for (let size = maxFontSize; size >= minFontSize; size -= 1) {
    ctx.font = `${size}px "JetBrains Mono", "Fira Code", monospace`
    if (ctx.measureText(text).width <= maxWidth) {
      return size
    }
  }

  return minFontSize
}

export function drawSnake(
  state: CanvasState,
  body: { x: number; y: number }[],
  headDirection: string,
  effects?: ActiveEffects
): void {
  body.forEach((segment, index) => {
    const isHead = index === 0
    const color = isHead ? lightenColor(COLORS.accentSnake, 20) : COLORS.accentSnake
    drawRoundedCell(state, segment.x, segment.y, color, isHead ? 6 : 4, 2)
    drawSnakeEffect(state, segment.x, segment.y, effects)

    if (isHead) {
      drawEyes(state, segment.x, segment.y, headDirection, (effects?.shots ?? 0) > 0)
    }
  })
}

function drawSnakeEffect(
  state: CanvasState,
  x: number,
  y: number,
  effects?: ActiveEffects
): void {
  if (!effects || (!effects.shield && !effects.invincibleMs && !effects.shots)) return

  const { ctx, cellSize } = state
  const px = x * cellSize + 1
  const py = y * cellSize + 1
  const size = cellSize - 2

  const primaryColor =
    effects.invincibleMs > 0
      ? COLORS.powerInvincible
      : effects.shots > 0
        ? COLORS.powerShot
        : COLORS.powerShield

  ctx.lineWidth = effects.invincibleMs > 0 ? 4 : effects.shots > 0 ? 3 : 2
  ctx.strokeStyle = primaryColor
  roundRect(ctx, px, py, size, size, 6)
  ctx.stroke()

  if (effects.shield > 0 && effects.invincibleMs <= 0 && effects.shots > 0) {
    ctx.lineWidth = 1
    ctx.strokeStyle = COLORS.powerShield
    roundRect(ctx, px + 3, py + 3, size - 6, size - 6, 4)
    ctx.stroke()
  }
}

function getPowerUpColor(type: PowerUpType): string {
  switch (type) {
    case 'SHIELD':
      return COLORS.powerShield
    case 'INVINCIBLE':
      return COLORS.powerInvincible
    case 'SHOT':
      return COLORS.powerShot
  }
}

function getPowerUpLabel(type: PowerUpType): string {
  switch (type) {
    case 'SHIELD':
      return '盾'
    case 'INVINCIBLE':
      return '无'
    case 'SHOT':
      return '弹'
  }
}

function drawEyes(
  state: CanvasState,
  x: number,
  y: number,
  direction: string,
  armed: boolean
): void {
  const { ctx, cellSize } = state
  const cx = x * cellSize + cellSize / 2
  const cy = y * cellSize + cellSize / 2
  const eyeRadius = Math.max(2, cellSize * 0.12)
  const offset = cellSize * 0.18

  ctx.fillStyle = armed ? COLORS.armedEye : COLORS.bgPrimary

  const eyePositions = getEyePositions(direction, cx, cy, offset)
  for (const eye of eyePositions) {
    ctx.beginPath()
    ctx.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2)
    ctx.fill()
  }
}

function getEyePositions(
  direction: string,
  cx: number,
  cy: number,
  offset: number
): { x: number; y: number }[] {
  switch (direction) {
    case 'UP':
      return [
        { x: cx - offset, y: cy - offset },
        { x: cx + offset, y: cy - offset }
      ]
    case 'DOWN':
      return [
        { x: cx - offset, y: cy + offset },
        { x: cx + offset, y: cy + offset }
      ]
    case 'LEFT':
      return [
        { x: cx - offset, y: cy - offset },
        { x: cx - offset, y: cy + offset }
      ]
    case 'RIGHT':
    default:
      return [
        { x: cx + offset, y: cy - offset },
        { x: cx + offset, y: cy + offset }
      ]
  }
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
}

export function createParticles(
  state: CanvasState,
  x: number,
  y: number,
  color: string,
  count: number = 10
): Particle[] {
  const { cellSize } = state
  const cx = x * cellSize + cellSize / 2
  const cy = y * cellSize + cellSize / 2
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = 1 + Math.random() * 2
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 250,
      maxLife: 250,
      color
    })
  }

  return particles
}

export function drawParticles(state: CanvasState, particles: Particle[]): void {
  const { ctx } = state

  particles.forEach((particle) => {
    const alpha = particle.life / particle.maxLife
    ctx.fillStyle = hexToRgba(particle.color, alpha)
    ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4)
  })
}

export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * deltaTime * 0.1,
      y: particle.y + particle.vy * deltaTime * 0.1,
      life: particle.life - deltaTime
    }))
    .filter((particle) => particle.life > 0)
}

export function drawErrorFlash(state: CanvasState): void {
  const { ctx, canvas } = state
  const cssWidth = canvas.width / state.dpr
  const cssHeight = canvas.height / state.dpr

  ctx.fillStyle = 'rgba(243, 139, 168, 0.3)'
  ctx.fillRect(0, 0, cssWidth, cssHeight)
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const R = (num >> 16) & 0xff
  const G = (num >> 8) & 0xff
  const B = num & 0xff
  return `rgba(${R}, ${G}, ${B}, ${alpha})`
}

export function drawGameOver(state: CanvasState): void {
  const { ctx, canvas } = state
  const cssWidth = canvas.width / state.dpr
  const cssHeight = canvas.height / state.dpr

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  ctx.fillStyle = COLORS.textPrimary
  ctx.font = 'bold 24px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('游戏结束', cssWidth / 2, cssHeight / 2)
}
