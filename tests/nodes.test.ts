import { describe, it, expect } from 'vitest'
import { generateNodes, isCorrectNode, getNodeAt } from '@/utils/nodes'
import { createSnake } from '@/utils/snake'
import type { CodeNode, LevelConfig, Position } from '@/types/game'

const mockLevel: LevelConfig = {
  id: 1,
  type: 'order',
  title: 'Test',
  description: 'Test level',
  speed: 200,
  lives: 3,
  distractorCount: 2,
  correctOrder: ['a', 'b', 'c'],
  codeTemplate: '{1} {2} {3}',
  distractors: ['x', 'y'],
  explanation: 'Test explanation'
}

describe('nodes utils', () => {
  it('should generate correct and distractor nodes', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const nodes = generateNodes(snake, mockLevel, 0)

    expect(nodes).toHaveLength(3)
    expect(nodes.filter((n) => n.type === 'CORRECT')).toHaveLength(1)
    expect(nodes.filter((n) => n.type === 'DISTRACTOR')).toHaveLength(2)

    const correct = nodes.find((n) => n.type === 'CORRECT')
    expect(correct?.label).toBe('a')
    expect(correct?.orderIndex).toBe(0)
  })

  it('should identify correct node', () => {
    const node: CodeNode = {
      id: '1',
      label: 'a',
      type: 'CORRECT',
      position: { x: 0, y: 0 },
      orderIndex: 0
    }
    expect(isCorrectNode(node, 0)).toBe(true)
    expect(isCorrectNode(node, 1)).toBe(false)
  })

  it('should not generate distractors with the current correct label', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const level: LevelConfig = {
      ...mockLevel,
      distractorCount: 2,
      correctOrder: ['a'],
      codeTemplate: '{1}',
      distractors: ['a', 'x', 'y']
    }
    const nodes = generateNodes(snake, level, 0)
    const distractors = nodes.filter((node) => node.type === 'DISTRACTOR')

    expect(distractors).toHaveLength(2)
    expect(distractors.every((node) => node.label !== 'a')).toBe(true)
  })

  it('should not generate duplicate node labels', () => {
    const snake = createSnake({ x: 5, y: 5 })
    const level: LevelConfig = {
      ...mockLevel,
      distractorCount: 4,
      correctOrder: ['a'],
      codeTemplate: '{1}',
      distractors: ['a', 'x', 'x', 'y', 'z']
    }
    const nodes = generateNodes(snake, level, 0)
    const labels = nodes.map((node) => node.label)

    expect(new Set(labels).size).toBe(labels.length)
  })

  it('should find node at position', () => {
    const nodes: CodeNode[] = [
      {
        id: '1',
        label: 'a',
        type: 'CORRECT',
        position: { x: 1, y: 1 },
        orderIndex: 0
      }
    ]
    expect(getNodeAt(nodes, { x: 1, y: 1 })).toBeDefined()
    expect(getNodeAt(nodes, { x: 2, y: 2 })).toBeUndefined()
  })
})
