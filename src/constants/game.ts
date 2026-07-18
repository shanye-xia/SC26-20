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
  bgPrimary: '#1e1e2e',
  bgPanel: '#2a2a3c',
  bgCode: '#1a1b26',
  gridLine: '#3b3d52',
  textPrimary: '#cdd6f4',
  textSecondary: '#a6adc8',
  accentKeyword: '#f38ba8',
  accentVariable: '#f9e2af',
  accentString: '#a6e3a1',
  accentFunction: '#89b4fa',
  accentError: '#f38ba8',
  accentHealth: '#f7768e',
  accentSnake: '#89dceb',
  accentNode: '#b4befe',
  wallFill: '#f2cd5c',
  wallStroke: '#fff1a8',
  wallShadow: '#8f5d00',
  powerShield: '#cba6f7',
  powerInvincible: '#f9e2af',
  powerShot: '#fab387',
  projectile: '#ff6b35',
  armedEye: '#ff3b30',
  border: '#45475a'
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
  powerUpSpawnCount: 3,
  shotCharges: 3,
  projectileStepsPerTick: 3,
  particleCount: 10,
  particleLife: 250
} as const
