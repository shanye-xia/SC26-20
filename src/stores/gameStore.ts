import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { nanoid } from 'nanoid'
import {
  DIRECTION_VECTORS,
  GAME_CONSTANTS,
  GRID_SIZE
} from '@/constants/game'
import type {
  CodeNode,
  Direction,
  GameState,
  LevelConfig,
  PowerUp,
  PowerUpType,
  Position,
  Projectile,
  TickResult
} from '@/types/game'
import {
  drawBackground,
  drawErrorFlash,
  drawGameOver,
  drawGrid,
  drawNode,
  drawParticles,
  drawPowerUp,
  drawProjectile,
  drawSnake,
  drawWall,
  createParticles,
  type CanvasState,
  type Particle,
  updateParticles
} from '@/utils/canvas'
import { getNodeAt, generateNodes, isCorrectNode } from '@/utils/nodes'
import { generateObstacles, getRandomEmptyPosition, isOutOfBounds, isSelfCollision, positionInList, positionsEqual } from '@/utils/grid'
import { loadLevel } from '@/utils/levelLoader'
import { createSnake, moveSnake, canChangeDirection } from '@/utils/snake'

const CENTER: Position = {
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2)
}

function createInitialState(): GameState {
  return {
    status: 'IDLE',
    levelIndex: 1,
    maxUnlockedLevel: 1,
    levelConfig: null,
    lives: GAME_CONSTANTS.initialLives,
    score: 0,
    snake: createSnake(CENTER),
    obstacles: [],
    nodes: [],
    powerUps: [],
    projectiles: [],
    activeEffects: {
      shield: 0,
      invincibleMs: 0,
      shots: 0
    },
    collectedCount: 0,
    speed: 200,
    growCounter: 0,
    errorFlash: false,
    hardMode: false
  }
}

export const useGameStore = defineStore('game', () => {
  const state = reactive<GameState>(createInitialState())

  const currentTargetLabel = computed(() => {
    if (!state.levelConfig) return ''
    return state.levelConfig.correctOrder[state.collectedCount] ?? ''
  })

  const currentCodeLines = computed(() => {
    if (!state.levelConfig) return []
    return state.levelConfig.codeTemplate.split('\n')
  })

  const isGameOver = computed(() => state.status === 'LEVEL_FAILED' || state.status === 'ALL_LEVELS_CLEARED')

  const isPaused = computed(() => state.status === 'PAUSED')

  const availableLevels = computed(() => {
    return Array.from({ length: GAME_CONSTANTS.maxLevel }, (_, index) => {
      const level = index + 1
      return {
        level,
        unlocked: level <= state.maxUnlockedLevel,
        current: level === state.levelIndex
      }
    })
  })

  function resetState(): void {
    Object.assign(state, createInitialState())
  }

  async function startLevel(levelIndex: number): Promise<void> {
    const levelConfig = await loadLevel(levelIndex)
    state.levelIndex = levelIndex
    state.levelConfig = levelConfig
    state.lives = levelConfig.lives
    state.score = 0
    state.snake = createSnake(CENTER, levelConfig.initialSnakeLength ?? GAME_CONSTANTS.initialSnakeLength)
    state.obstacles = generateObstacles(state.snake, levelConfig.obstacleCount ?? 0)
    state.nodes = []
    state.powerUps = generatePowerUps(levelConfig, state.snake, state.obstacles)
    state.projectiles = []
    state.activeEffects = { shield: 0, invincibleMs: 0, shots: 0 }
    state.collectedCount = 0
    state.speed = levelConfig.speed
    state.growCounter = 0
    state.errorFlash = false
    state.nodes = generateNodes(
      state.snake,
      levelConfig,
      state.collectedCount,
      getBlockedPositions()
    )
    state.status = 'PAUSED'
  }

  function togglePause(): void {
    if (state.status === 'PLAYING') {
      state.status = 'PAUSED'
    } else if (state.status === 'PAUSED') {
      state.status = 'PLAYING'
    }
  }

  function setDirection(direction: Direction): void {
    if (state.status === 'PAUSED') {
      state.status = 'PLAYING'
    }
    if (state.status !== 'PLAYING') return
    if (canChangeDirection(state.snake.direction, direction)) {
      state.snake.nextDirection = direction
    }
  }

  function tick(canvasState?: CanvasState, particles?: Particle[]): TickResult {
    if (state.status !== 'PLAYING') {
      return { ateNode: false, isCorrect: false, node: null }
    }

    state.activeEffects.invincibleMs = Math.max(0, state.activeEffects.invincibleMs - state.speed)
    moveProjectiles()

    const growBy = state.growCounter > 0 ? 1 : 0
    if (state.growCounter > 0) {
      state.growCounter--
    }

    state.snake = moveSnake(state.snake, growBy)
    const head = state.snake.body[0]

    if (isOutOfBounds(head) || isSelfCollision(state.snake, head) || positionInList(state.obstacles, head)) {
      if (consumeProtection()) {
        return { ateNode: false, isCorrect: false, node: null }
      }
      state.status = 'LEVEL_FAILED'
      return { ateNode: false, isCorrect: false, node: null }
    }

    const powerUp = getPowerUpAt(head)
    if (powerUp) {
      collectPowerUp(powerUp)
    }

    const node = getNodeAt(state.nodes, head)
    if (node) {
      return handleEatNode(node, canvasState, particles)
    }

    return { ateNode: false, isCorrect: false, node: null }
  }

  function handleEatNode(node: CodeNode, canvasState?: CanvasState, particles?: Particle[]): TickResult {
    state.nodes = state.nodes.filter((n) => n.id !== node.id)

    if (isCorrectNode(node, state.collectedCount)) {
      state.collectedCount++
      state.score += GAME_CONSTANTS.correctScore
      state.growCounter += GAME_CONSTANTS.correctGrowth

      if (canvasState && particles) {
        particles.push(
          ...createParticles(
            canvasState,
            node.position.x,
            node.position.y,
            '#a6e3a1',
            GAME_CONSTANTS.particleCount
          )
        )
      }

      if (
        state.levelConfig &&
        state.collectedCount >= state.levelConfig.correctOrder.length
      ) {
        state.maxUnlockedLevel = Math.max(
          state.maxUnlockedLevel,
          Math.min(state.levelIndex + 1, GAME_CONSTANTS.maxLevel)
        )
        state.status = 'LEVEL_PASSED'
      } else {
        state.nodes = generateNodes(
          state.snake,
          state.levelConfig as LevelConfig,
          state.collectedCount,
          getBlockedPositions()
        )
      }

      return { ateNode: true, isCorrect: true, node }
    }

    if (consumeProtection()) {
      state.nodes = generateNodes(
        state.snake,
        state.levelConfig as LevelConfig,
        state.collectedCount,
        getBlockedPositions()
      )
      return { ateNode: true, isCorrect: false, node }
    }

    state.lives--
    state.growCounter += GAME_CONSTANTS.wrongGrowth
    state.errorFlash = true
    setTimeout(() => {
      state.errorFlash = false
    }, GAME_CONSTANTS.errorFlashDuration)

    if (state.lives <= 0) {
      state.status = 'LEVEL_FAILED'
      return { ateNode: true, isCorrect: false, node }
    }

    state.nodes = generateNodes(
      state.snake,
      state.levelConfig as LevelConfig,
      state.collectedCount,
      getBlockedPositions()
    )

    return { ateNode: true, isCorrect: false, node }
  }

  function retryLevel(): void {
    startLevel(state.levelIndex)
  }

  function nextLevel(): void {
    if (state.levelIndex >= GAME_CONSTANTS.maxLevel) {
      state.status = 'ALL_LEVELS_CLEARED'
      return
    }
    startLevel(state.levelIndex + 1)
  }

  function selectLevel(levelIndex: number): void {
    if (levelIndex < 1 || levelIndex > state.maxUnlockedLevel) return
    startLevel(levelIndex)
  }

  function resetGame(): void {
    resetState()
    startLevel(1)
  }

  function renderCanvas(canvasState: CanvasState, particles: Particle[]): Particle[] {
    drawBackground(canvasState)
    drawGrid(canvasState)

    state.obstacles.forEach((obstacle) => {
      drawWall(canvasState, obstacle.x, obstacle.y)
    })

    state.nodes.forEach((node) => {
      drawNode(
        canvasState,
        node.position.x,
        node.position.y,
        node.label,
        !state.hardMode && node.type === 'CORRECT' && node.orderIndex === state.collectedCount,
        state.hardMode || node.type === 'DISTRACTOR'
      )
    })

    state.powerUps.forEach((powerUp) => {
      drawPowerUp(canvasState, powerUp.position.x, powerUp.position.y, powerUp.type)
    })

    state.projectiles.forEach((projectile) => {
      drawProjectile(canvasState, projectile.position.x, projectile.position.y)
    })

    drawSnake(canvasState, state.snake.body, state.snake.direction, state.activeEffects)

    let updatedParticles = updateParticles(particles, 16)
    drawParticles(canvasState, updatedParticles)

    if (state.errorFlash) {
      drawErrorFlash(canvasState)
    }

    if (state.status === 'LEVEL_FAILED') {
      drawGameOver(canvasState)
    }

    return updatedParticles
  }

  function setHardMode(enabled: boolean): void {
    state.hardMode = enabled
  }

  async function debugStartLevel(levelIndex: number): Promise<void> {
    const targetLevel = Math.min(Math.max(1, levelIndex), GAME_CONSTANTS.maxLevel)
    state.maxUnlockedLevel = Math.max(state.maxUnlockedLevel, targetLevel)
    await startLevel(targetLevel)
  }

  function debugUnlockAllLevels(): void {
    state.maxUnlockedLevel = GAME_CONSTANTS.maxLevel
  }

  function debugSetUnlockedLevel(levelIndex: number): void {
    state.maxUnlockedLevel = Math.min(Math.max(1, levelIndex), GAME_CONSTANTS.maxLevel)
  }

  function debugGrantPowerUp(type: PowerUpType): void {
    switch (type) {
      case 'SHIELD':
        state.activeEffects.shield += 1
        break
      case 'INVINCIBLE':
        state.activeEffects.invincibleMs = GAME_CONSTANTS.invincibleDurationMs
        break
      case 'SHOT':
        state.activeEffects.shots += GAME_CONSTANTS.shotCharges
        break
    }
  }

  function debugSpawnPowerUp(type: PowerUpType): void {
    state.powerUps.push({
      id: nanoid(),
      type,
      position: getRandomEmptyPosition(
        state.snake,
        [...state.nodes, ...state.powerUps.map((powerUp) => ({ position: powerUp.position }))],
        state.obstacles
      )
    })
  }

  function debugClearPowerUps(): void {
    state.powerUps = []
  }

  function debugSetEffects(shield: number, invincibleMs: number, shots: number): void {
    state.activeEffects = {
      shield: Math.max(0, shield),
      invincibleMs: Math.max(0, invincibleMs),
      shots: Math.max(0, shots)
    }
  }

  function fireShot(): void {
    if (state.status === 'PAUSED') {
      state.status = 'PLAYING'
    }
    if (state.status !== 'PLAYING' || state.activeEffects.shots <= 0) return

    state.activeEffects.shots--
    state.projectiles.push({
      id: nanoid(),
      position: { ...state.snake.body[0] },
      direction: state.snake.direction
    })
  }

  function moveProjectiles(): void {
    const nextProjectiles: Projectile[] = []

    for (const projectile of state.projectiles) {
      const vector = DIRECTION_VECTORS[projectile.direction]
      const nextPosition = {
        x: projectile.position.x + vector.x,
        y: projectile.position.y + vector.y
      }

      if (isOutOfBounds(nextPosition)) continue

      const obstacleIndex = state.obstacles.findIndex((obstacle) => positionsEqual(obstacle, nextPosition))
      if (obstacleIndex >= 0) {
        state.obstacles.splice(obstacleIndex, 1)
        continue
      }

      nextProjectiles.push({
        ...projectile,
        position: nextPosition
      })
    }

    state.projectiles = nextProjectiles
  }

  function consumeProtection(): boolean {
    if (state.activeEffects.invincibleMs > 0) return true
    if (state.activeEffects.shield > 0) {
      state.activeEffects.shield--
      return true
    }
    return false
  }

  function getPowerUpAt(position: Position): PowerUp | undefined {
    return state.powerUps.find((powerUp) => positionsEqual(powerUp.position, position))
  }

  function collectPowerUp(powerUp: PowerUp): void {
    state.powerUps = state.powerUps.filter((item) => item.id !== powerUp.id)

    switch (powerUp.type) {
      case 'SHIELD':
        state.activeEffects.shield += 1
        break
      case 'INVINCIBLE':
        state.activeEffects.invincibleMs = GAME_CONSTANTS.invincibleDurationMs
        break
      case 'SHOT':
        state.activeEffects.shots += GAME_CONSTANTS.shotCharges
        break
    }
  }

  function generatePowerUps(
    levelConfig: LevelConfig,
    snake: ReturnType<typeof createSnake>,
    obstacles: Position[]
  ): PowerUp[] {
    const types = levelConfig.powerUps ?? []
    const powerUps: PowerUp[] = []

    for (const type of types.slice(0, GAME_CONSTANTS.powerUpSpawnCount)) {
      const occupiedPowerUps = powerUps.map((powerUp) => ({ position: powerUp.position }))
      powerUps.push({
        id: nanoid(),
        type,
        position: getRandomEmptyPosition(snake, [...state.nodes, ...occupiedPowerUps], obstacles)
      })
    }

    return powerUps
  }

  function getBlockedPositions(): Position[] {
    return [
      ...state.obstacles,
      ...state.powerUps.map((powerUp) => powerUp.position)
    ]
  }

  return {
    state,
    currentTargetLabel,
    currentCodeLines,
    isGameOver,
    isPaused,
    availableLevels,
    startLevel,
    togglePause,
    setDirection,
    tick,
    retryLevel,
    nextLevel,
    selectLevel,
    setHardMode,
    debugStartLevel,
    debugUnlockAllLevels,
    debugSetUnlockedLevel,
    debugGrantPowerUp,
    debugSpawnPowerUp,
    debugClearPowerUps,
    debugSetEffects,
    fireShot,
    resetGame,
    renderCanvas
  }
})
