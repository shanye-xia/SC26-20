import { onMounted, onUnmounted, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import type { Direction } from '@/types/game'

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT'
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

    const direction = KEY_MAP[event.key]
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
