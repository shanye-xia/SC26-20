import { onMounted, onUnmounted, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import type { Direction } from '@/types/game'

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT'
}

const CODE_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  KeyW: 'UP',
  KeyS: 'DOWN',
  KeyA: 'LEFT',
  KeyD: 'RIGHT'
}

export function resolveDirection(event: Pick<KeyboardEvent, 'key' | 'code'>): Direction | undefined {
  return KEY_MAP[event.key] ?? CODE_MAP[event.code]
}

export function useInput() {
  const store = useGameStore()
  const lastDirection = ref<Direction | null>(null)

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'p' || event.key === 'P') {
      store.togglePause()
      return
    }

    if (event.key === 'r' || event.key === 'R') {
      if (store.state.status === 'LEVEL_FAILED') {
        store.retryLevel()
      } else if (store.state.status === 'LEVEL_PASSED') {
        store.nextLevel()
      }
      return
    }

    const direction = resolveDirection(event)
    if (direction) {
      event.preventDefault()
      lastDirection.value = direction
      store.setDirection(direction)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    lastDirection
  }
}
