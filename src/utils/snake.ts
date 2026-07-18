import { DIRECTION_VECTORS } from '@/constants/game'
import type { Direction, Position, Snake } from '@/types/game'

export function createSnake(start: Position): Snake {
  return {
    body: [start, { x: start.x - 1, y: start.y }, { x: start.x - 2, y: start.y }],
    direction: 'RIGHT',
    nextDirection: 'RIGHT'
  }
}

export function getNextHead(snake: Snake): Position {
  const head = snake.body[0]
  const vector = DIRECTION_VECTORS[snake.nextDirection]
  return {
    x: head.x + vector.x,
    y: head.y + vector.y
  }
}

export function applyDirectionChange(snake: Snake): Snake {
  return {
    ...snake,
    direction: snake.nextDirection,
    nextDirection: snake.nextDirection
  }
}

export function canChangeDirection(current: Direction, next: Direction): boolean {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT'
  }
  return opposites[current] !== next
}

export function moveSnake(snake: Snake, growBy: number): Snake {
  const newHead = getNextHead(snake)
  const newBody = [newHead, ...snake.body]

  if (growBy <= 0) {
    newBody.pop()
  }

  return {
    body: newBody,
    direction: snake.nextDirection,
    nextDirection: snake.nextDirection
  }
}
