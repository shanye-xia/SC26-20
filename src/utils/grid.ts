import { GRID_SIZE } from '@/constants/game'
import type { Position, Snake } from '@/types/game'

export function isOutOfBounds(pos: Position): boolean {
  return pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE
}

export function isSelfCollision(snake: Snake, head: Position): boolean {
  // 排除头部自身，只检查是否撞到身体其他部分
  return snake.body.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
}

export function getOccupiedPositions(snake: Snake, nodes: { position: Position }[]): Position[] {
  const occupied = new Set<string>()
  const result: Position[] = []

  for (const segment of snake.body) {
    const key = `${segment.x},${segment.y}`
    if (!occupied.has(key)) {
      occupied.add(key)
      result.push(segment)
    }
  }

  for (const node of nodes) {
    const key = `${node.position.x},${node.position.y}`
    if (!occupied.has(key)) {
      occupied.add(key)
      result.push(node.position)
    }
  }

  return result
}

export function getRandomEmptyPosition(
  snake: Snake,
  nodes: { position: Position }[],
  blockedPositions: Position[] = []
): Position {
  const occupied = [...getOccupiedPositions(snake, nodes), ...blockedPositions]
  const occupiedSet = new Set(occupied.map((p) => `${p.x},${p.y}`))
  const empty: Position[] = []

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupiedSet.has(`${x},${y}`)) {
        empty.push({ x, y })
      }
    }
  }

  if (empty.length === 0) {
    throw new Error('No empty position available')
  }

  return empty[Math.floor(Math.random() * empty.length)]
}

export function positionInList(positions: Position[], target: Position): boolean {
  return positions.some((position) => positionsEqual(position, target))
}

export function generateObstacles(
  snake: Snake,
  count: number,
  reservedPositions: Position[] = []
): Position[] {
  const obstacles: Position[] = []
  const safeCount = Math.max(0, count)

  for (let i = 0; i < safeCount; i++) {
    obstacles.push(getRandomEmptyPosition(snake, obstacles.map((position) => ({ position })), reservedPositions))
  }

  return obstacles
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}
