import { nanoid } from 'nanoid'
import type { CodeNode, LevelConfig, Position, Snake } from '@/types/game'
import { getRandomEmptyPosition } from './grid'

export function createCorrectNode(
  snake: Snake,
  nodes: CodeNode[],
  label: string,
  orderIndex: number
): CodeNode {
  return {
    id: nanoid(),
    label,
    type: 'CORRECT',
    position: getRandomEmptyPosition(snake, nodes),
    orderIndex
  }
}

export function createDistractorNode(
  snake: Snake,
  nodes: CodeNode[],
  label: string
): CodeNode {
  return {
    id: nanoid(),
    label,
    type: 'DISTRACTOR',
    position: getRandomEmptyPosition(snake, nodes)
  }
}

export function generateNodes(
  snake: Snake,
  levelConfig: LevelConfig,
  collectedCount: number
): CodeNode[] {
  const nodes: CodeNode[] = []

  const correctLabel = levelConfig.correctOrder[collectedCount]
  if (correctLabel !== undefined) {
    const correctNode = createCorrectNode(snake, nodes, correctLabel, collectedCount)
    nodes.push(correctNode)
  }

  const distractorCount = Math.min(
    levelConfig.distractorCount,
    levelConfig.distractors.length
  )

  for (let i = 0; i < distractorCount; i++) {
    const label =
      levelConfig.distractors[Math.floor(Math.random() * levelConfig.distractors.length)]
    const distractorNode = createDistractorNode(snake, nodes, label)
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
