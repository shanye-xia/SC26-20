export const GRID_SIZE = 15

export const DIRECTION_VECTORS: Record<
  import('@/types/game').Direction,
  { x: number; y: number }
> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

export const OPPOSITE_DIRECTIONS: Record<
  import('@/types/game').Direction,
  import('@/types/game').Direction
> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
}

export const COLORS = {
  bgPrimary: '#030813',
  bgPanel: '#0a1728',
  bgCode: '#061121',
  gridLine: '#18304b',
  textPrimary: '#e6f7ff',
  textSecondary: '#8aa4c3',
  accentKeyword: '#f38ba8',
  accentVariable: '#ffd75a',
  accentString: '#20f6d2',
  accentFunction: '#20c8ff',
  accentError: '#ff5d8f',
  accentHealth: '#ff6f88',
  accentSnake: '#1bd8ff',
  accentNode: '#ff66bd',
  wallFill: '#12243a',
  wallStroke: '#ffd75a',
  wallShadow: '#8a6b1d',
  powerShield: '#b36bff',
  powerInvincible: '#ffd75a',
  powerShot: '#ff9f4a',
  powerHealth: '#ff6f88',
  projectile: '#ff9f4a',
  armedEye: '#ff3b30',
  border: '#315173'
} as const

export const GAME_CONSTANTS = {
  maxLevel: 10,
  initialLives: 3,
  initialSnakeLength: 3,
  correctScore: 10,
  correctGrowth: 1,
  wrongGrowth: 2,
  errorFlashDuration: 200,
  invincibleDurationMs: 5000,
  powerUpSpawnCount: 4,
  shotCharges: 3,
  projectileStepsPerTick: 3,
  particleCount: 10,
  particleLife: 250
} as const
