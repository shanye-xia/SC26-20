import type { LevelConfig } from '@/types/game'

export async function loadLevel(levelIndex: number): Promise<LevelConfig> {
  const response = await fetch(`/levels/level-${String(levelIndex).padStart(2, '0')}.json`)

  if (!response.ok) {
    throw new Error(`Failed to load level ${levelIndex}: ${response.statusText}`)
  }

  const levelConfig = (await response.json()) as LevelConfig
  validateLevelConfig(levelConfig)
  return levelConfig
}

export function validateLevelConfig(config: LevelConfig): void {
  if (!config.correctOrder || !Array.isArray(config.correctOrder)) {
    throw new Error('Level config must have a correctOrder array')
  }

  if (!config.codeTemplate || typeof config.codeTemplate !== 'string') {
    throw new Error('Level config must have a codeTemplate string')
  }

  const placeholderCount = countPlaceholders(config.codeTemplate)

  if (placeholderCount !== config.correctOrder.length) {
    throw new Error(
      `codeTemplate has ${placeholderCount} placeholders but correctOrder has ${config.correctOrder.length} items`
    )
  }
}

export function countPlaceholders(template: string): number {
  const matches = template.match(/\{\d+\}/g)
  if (!matches) return 0

  const indices = matches.map((m) => parseInt(m.replace(/[{}]/g, ''), 10))
  return Math.max(...indices)
}

export function renderCodeTemplate(template: string, correctOrder: string[]): string {
  let result = template
  correctOrder.forEach((item, index) => {
    result = result.replace(new RegExp(`\\{${index + 1}\\}`, 'g'), item)
  })
  return result
}
