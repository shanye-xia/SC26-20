import { describe, it, expect } from 'vitest'
import { countPlaceholders, renderCodeTemplate, validateLevelConfig } from '@/utils/levelLoader'
import type { LevelConfig } from '@/types/game'

const validLevel: LevelConfig = {
  id: 1,
  type: 'order',
  title: 'Test',
  description: 'Test',
  speed: 200,
  lives: 3,
  distractorCount: 2,
  correctOrder: ['a', 'b', 'c'],
  codeTemplate: '{1} {2} {3}',
  distractors: ['x'],
  explanation: 'Test'
}

describe('levelLoader utils', () => {
  it('should count placeholders', () => {
    expect(countPlaceholders('{1} {2} {3}')).toBe(3)
    expect(countPlaceholders('no placeholders')).toBe(0)
    expect(countPlaceholders('{1} {3}')).toBe(3)
  })

  it('should render code template', () => {
    expect(renderCodeTemplate('{1} {2}', ['hello', 'world'])).toBe('hello world')
  })

  it('should validate correct config', () => {
    expect(() => validateLevelConfig(validLevel)).not.toThrow()
  })

  it('should throw on mismatch', () => {
    const invalidLevel = { ...validLevel, correctOrder: ['a', 'b'] }
    expect(() => validateLevelConfig(invalidLevel)).toThrow()
  })
})
