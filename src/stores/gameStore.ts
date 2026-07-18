import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import {
  GAME_CONSTANTS,
  GRID_SIZE
} from '@/constants/game'
import type {
  CodeNode,
  Direction,
  GameState,
  LevelConfig,
  Position,
  TickResult
} from '@/types/game'
import {
  drawBackground,
  drawErrorFlash,
  drawGameOver,
  drawGrid,
  drawNode,
  drawParticles,
  drawSnake,
  createParticles,
  type CanvasState,
  type Particle,
  updateParticles
} from '@/utils/canvas'
import { getNodeAt, generateNodes, isCorrectNode } from '@/utils/nodes'
import { isOutOfBounds, isSelfCollision } from '@/utils/grid'
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
    levelConfig: null,
    lives: GAME_CONSTANTS.initialLives,
    score: 0,
    snake: createSnake(CENTER),
    nodes: [],
    collectedCount: 0,
    speed: 200,
    growCounter: 0,
    errorFlash: false
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

  function resetState(): void {
    Object.assign(state, createInitialState())
  }

  async function startLevel(levelIndex: number): Promise<void> {
    const levelConfig = await loadLevel(levelIndex)
    state.levelIndex = levelIndex
    state.levelConfig = levelConfig
    state.lives = levelConfig.lives
    state.score = 0
    state.snake = createSnake(CENTER)
    state.collectedCount = 0
    state.speed = levelConfig.speed
    state.growCounter = 0
    state.errorFlash = false
    state.nodes = generateNodes(state.snake, levelConfig, state.collectedCount)
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

    const growBy = state.growCounter > 0 ? 1 : 0
    if (state.growCounter > 0) {
      state.growCounter--
    }

    state.snake = moveSnake(state.snake, growBy)
    const head = state.snake.body[0]

    if (isOutOfBounds(head) || isSelfCollision(state.snake, head)) {
      state.status = 'LEVEL_FAILED'
      return { ateNode: false, isCorrect: false, node: null }
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
        state.status = 'LEVEL_PASSED'
      } else {
        state.nodes = generateNodes(
          state.snake,
          state.levelConfig as LevelConfig,
          state.collectedCount
        )
      }

      return { ateNode: true, isCorrect: true, node }
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
      state.collectedCount
    )

    return { ateNode: true, isCorrect: false, node }
  }

  function retryLevel(): void {
    startLevel(state.levelIndex)
  }

  function nextLevel(): void {
    if (state.levelIndex >= 5) {
      state.status = 'ALL_LEVELS_CLEARED'
      return
    }
    startLevel(state.levelIndex + 1)
  }

  function resetGame(): void {
    resetState()
    startLevel(1)
  }

  function renderCanvas(canvasState: CanvasState, particles: Particle[]): Particle[] {
    drawBackground(canvasState)
    drawGrid(canvasState)

    state.nodes.forEach((node) => {
      drawNode(
        canvasState,
        node.position.x,
        node.position.y,
        node.label,
        node.type === 'CORRECT' && node.orderIndex === state.collectedCount,
        node.type === 'DISTRACTOR'
      )
    })

    drawSnake(canvasState, state.snake.body, state.snake.direction)

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

  return {
    state,
    currentTargetLabel,
    currentCodeLines,
    isGameOver,
    isPaused,
    startLevel,
    togglePause,
    setDirection,
    tick,
    retryLevel,
    nextLevel,
    resetGame,
    renderCanvas
  }
})
