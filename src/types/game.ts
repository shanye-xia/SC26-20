export interface Position {
  x: number
  y: number
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type NodeType = 'CORRECT' | 'DISTRACTOR'
export type PowerUpType = 'SHIELD' | 'INVINCIBLE' | 'SHOT' | 'HEALTH'

export type LevelType = 'order' | 'output' | 'bugfix' | 'matching' | 'flow'

export type GameStatus =
  | 'IDLE'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_PASSED'
  | 'LEVEL_FAILED'
  | 'ALL_LEVELS_CLEARED'

export interface CodeNode {
  id: string
  label: string
  type: NodeType
  position: Position
  orderIndex?: number
}

export interface PowerUp {
  id: string
  type: PowerUpType
  position: Position
}

export interface ActiveEffects {
  shield: number
  invincibleMs: number
  shots: number
}

export interface Projectile {
  id: string
  position: Position
  direction: Direction
}

export interface Snake {
  body: Position[]
  direction: Direction
  nextDirection: Direction
}

export interface LevelConfig {
  id: number
  type: LevelType
  title: string
  description: string
  speed: number
  lives: number
  distractorCount: number
  initialSnakeLength?: number
  obstacleCount?: number
  powerUps?: PowerUpType[]
  correctOrder: string[]
  codeTemplate: string
  distractors: string[]
  rules?: string
  explanation: string
  difficulty?: number
}

export interface GameState {
  status: GameStatus
  levelIndex: number
  maxUnlockedLevel: number
  levelConfig: LevelConfig | null
  lives: number
  score: number
  snake: Snake
  obstacles: Position[]
  nodes: CodeNode[]
  powerUps: PowerUp[]
  projectiles: Projectile[]
  activeEffects: ActiveEffects
  collectedCount: number
  speed: number
  growCounter: number
  errorFlash: boolean
  hardMode: boolean
  blockedAfterCollision: boolean
}

export interface TickResult {
  ateNode: boolean
  isCorrect: boolean
  node: CodeNode | null
}
