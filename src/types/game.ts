export interface Position {
  x: number
  y: number
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type NodeType = 'CORRECT' | 'DISTRACTOR'

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
  correctOrder: string[]
  codeTemplate: string
  distractors: string[]
  explanation: string
  difficulty?: number
}

export interface GameState {
  status: GameStatus
  levelIndex: number
  levelConfig: LevelConfig | null
  lives: number
  score: number
  snake: Snake
  nodes: CodeNode[]
  collectedCount: number
  speed: number
  growCounter: number
  errorFlash: boolean
}

export interface TickResult {
  ateNode: boolean
  isCorrect: boolean
  node: CodeNode | null
}
