import { onMounted, onUnmounted, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { initCanvas, resizeCanvas, type CanvasState } from '@/utils/canvas'
import type { Particle } from '@/utils/canvas'

export function useGameLoop(canvasRef: ReactLikeRef<HTMLCanvasElement | null>) {
  const store = useGameStore()
  const canvasState = ref<CanvasState | null>(null)
  const particles = ref<Particle[]>([])
  const lastTickTime = ref(0)
  const animationFrameId = ref<number | null>(null)
  const containerSize = ref(0)

  function init() {
    if (!canvasRef.value) return

    canvasState.value = initCanvas(canvasRef.value)
    updateCanvasSize()

    window.addEventListener('resize', updateCanvasSize)
  }

  function updateCanvasSize() {
    if (!canvasRef.value || !canvasState.value) return

    const parent = canvasRef.value.parentElement
    if (!parent) return

    const viewportPadding = 32
    const availableViewportHeight = window.innerHeight - parent.getBoundingClientRect().top - viewportPadding
    const size = Math.max(
      240,
      Math.floor(Math.min(parent.clientWidth, parent.clientHeight, availableViewportHeight))
    )
    containerSize.value = size
    resizeCanvas(canvasState.value, size)
    render()
  }

  function render() {
    if (!canvasState.value) return
    particles.value = store.renderCanvas(canvasState.value, particles.value)
  }

  function loop(timestamp: number) {
    if (!canvasState.value) return

    if (lastTickTime.value === 0) {
      lastTickTime.value = timestamp
    }

    const delta = timestamp - lastTickTime.value

    if (delta >= store.state.speed) {
      store.tick(canvasState.value, particles.value)
      lastTickTime.value = timestamp
    }

    render()
    animationFrameId.value = requestAnimationFrame(loop)
  }

  function start() {
    if (animationFrameId.value !== null) return
    lastTickTime.value = 0
    animationFrameId.value = requestAnimationFrame(loop)
  }

  function stop() {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  onMounted(() => {
    init()
    start()
  })

  onUnmounted(() => {
    stop()
    window.removeEventListener('resize', updateCanvasSize)
  })

  return {
    canvasState,
    containerSize,
    start,
    stop,
    render
  }
}

interface ReactLikeRef<T> {
  value: T
}
