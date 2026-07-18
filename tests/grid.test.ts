import { describe, it, expect } from 'vitest'
import { GRID_SIZE } from '@/constants/game'
import {
  isOutOfBounds,
  isSelfCollision,
  getRandomEmptyPosition,
  getOccupiedPositions,
  generateObstacles,
  positionsEqual
} from '@/utils/grid'
import { createSnake } from '@/utils/snake'
import type { Position } from '@/types/game'

describe('grid utils', () => {
  it('should detect out of bounds', () => {
    expect(isOutOfBounds({ x: -1, y: 0 })).toBe(true)
    expect(isOutOfBounds({ x: 0, y: GRID_SIZE })).toBe(true)
    expect(isOutOfBounds({ x: 0, y: 0 })).toBe(false)
    expect(isOutOfBounds({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 })).toBe(false)
  })

  it('should detect self collision', () => {
    const snake = createSnake({ x: 5, y: 5 })
    // 头部自身不算自撞
    expect(isSelfCollision(snake, { x: 5, y: 5 })).toBe(false)
    expect(isSelfCollision(snake, { x: 4, y: 5 })).toBe(true)
    expect(isSelfCollision(snake, { x: 3, y: 5 })).toBe(true)
    expect(isSelfCollision(snake, { x: 10, y: 10 })).toBe(false)
  })

  it('should get occupied positions', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const nodes = [{ position: { x: 10, y: 10 } }]
    const occupied = getOccupiedPositions(snake, nodes)
    expect(occupied).toHaveLength(4)
  })

  it('should generate random empty position', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const nodes: { position: Position }[] = []
    const empty = getRandomEmptyPosition(snake, nodes)
    expect(isOutOfBounds(empty)).toBe(false)
    expect(isSelfCollision(snake, empty)).toBe(false)
  })

  it('should generate obstacles away from the snake', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const obstacles = generateObstacles(snake, 4)

    expect(obstacles).toHaveLength(4)
    obstacles.forEach((obstacle) => {
      expect(isOutOfBounds(obstacle)).toBe(false)
      expect(isSelfCollision(snake, obstacle)).toBe(false)
    })
  })

  it('should compare positions', () => {
    expect(positionsEqual({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true)
    expect(positionsEqual({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false)
  })
})
