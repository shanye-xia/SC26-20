import { nanoid } from 'nanoid'
import type { CodeNode, LevelConfig, Position, Snake } from '@/types/game'
import { getRandomEmptyPosition } from './grid'

export function createCorrectNode(
  snake: Snake,
  nodes: CodeNode[],
  label: string,
  orderIndex: number,
  blockedPositions: Position[] = []
): CodeNode {
  return {
    id: nanoid(),
    label,
    type: 'CORRECT',
    position: getRandomEmptyPosition(snake, nodes, blockedPositions),
    orderIndex
  }
}

export function createDistractorNode(
  snake: Snake,
  nodes: CodeNode[],
  label: string,
  blockedPositions: Position[] = []
): CodeNode {
  return {
    id: nanoid(),
    label,
    type: 'DISTRACTOR',
    position: getRandomEmptyPosition(snake, nodes, blockedPositions)
  }
}

export function generateNodes(
  snake: Snake,
  levelConfig: LevelConfig,
  collectedCount: number,
  blockedPositions: Position[] = []
): CodeNode[] {
  const nodes: CodeNode[] = []

  const correctLabel = levelConfig.correctOrder[collectedCount]
  if (correctLabel !== undefined) {
    const correctNode = createCorrectNode(snake, nodes, correctLabel, collectedCount, blockedPositions)
    nodes.push(correctNode)
  }

  const availableDistractors = getAvailableDistractors(levelConfig, correctLabel)
  const distractorCount = Math.min(levelConfig.distractorCount, availableDistractors.length)
  const selectedDistractors = pickRandomLabels(availableDistractors, distractorCount)

  for (const label of selectedDistractors) {
    const distractorNode = createDistractorNode(snake, nodes, label, blockedPositions)
    nodes.push(distractorNode)
  }

  return nodes
}

export function getNodeAt(nodes: CodeNode[], position: Position): CodeNode | undefined {
  return nodes.find((node) => node.position.x === position.x && node.position.y === position.y)
}

export function isCorrectNode(node: CodeNode, collectedCount: number): boolean {
  return node.type === 'CORRECT' && node.orderIndex === collectedCount
}

function getAvailableDistractors(levelConfig: LevelConfig, correctLabel?: string): string[] {
  const uniqueDistractors = Array.from(new Set(levelConfig.distractors))
  if (correctLabel === undefined) return uniqueDistractors
  return uniqueDistractors.filter((label) => label !== correctLabel)
}

function pickRandomLabels(labels: string[], count: number): string[] {
  const pool = [...labels]
  const picked: string[] = []

  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    const [label] = pool.splice(index, 1)
    picked.push(label)
  }

  return picked
}
