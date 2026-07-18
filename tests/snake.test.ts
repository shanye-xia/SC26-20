import { describe, it, expect } from 'vitest'
import { createSnake, moveSnake, getNextHead, canChangeDirection } from '@/utils/snake'

describe('snake utils', () => {
  it('should create snake facing right', () => {
    const snake = createSnake({ x: 5, y: 5 })
    expect(snake.body).toHaveLength(3)
    expect(snake.body[0]).toEqual({ x: 5, y: 5 })
    expect(snake.direction).toBe('RIGHT')
  })

  it('should calculate next head', () => {
    const snake = createSnake({ x: 5, y: 5 })
    expect(getNextHead(snake)).toEqual({ x: 6, y: 5 })

    snake.nextDirection = 'DOWN'
    expect(getNextHead(snake)).toEqual({ x: 5, y: 6 })
  })

  it('should move snake without growing', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const moved = moveSnake(snake, 0)
    expect(moved.body).toHaveLength(3)
    expect(moved.body[0]).toEqual({ x: 6, y: 5 })
    expect(moved.body[moved.body.length - 1]).toEqual({ x: 4, y: 5 })
  })

  it('should grow snake when growBy > 0', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const grown = moveSnake(snake, 1)
    expect(grown.body).toHaveLength(4)
    expect(grown.body[0]).toEqual({ x: 6, y: 5 })
    expect(grown.body[grown.body.length - 1]).toEqual({ x: 3, y: 5 })
  })

  it('should prevent 180 degree turns', () => {
    expect(canChangeDirection('UP', 'DOWN')).toBe(false)
    expect(canChangeDirection('LEFT', 'RIGHT')).toBe(false)
    expect(canChangeDirection('UP', 'LEFT')).toBe(true)
    expect(canChangeDirection('UP', 'UP')).toBe(true)
  })
})
