<template>
  <div ref="boardRef" class="game-board">
    <canvas ref="canvasRef" class="game-canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameLoop } from '@/composables/useGameLoop'

const store = useGameStore()
const boardRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { render } = useGameLoop(canvasRef)

watch(
  () => store.state.status,
  (newStatus) => {
    if (
      newStatus === 'LEVEL_FAILED' ||
      newStatus === 'ALL_LEVELS_CLEARED' ||
      newStatus === 'PAUSED' ||
      newStatus === 'PLAYING'
    ) {
      render()
    }
  }
)

watch(
  () => store.state.errorFlash,
  () => {
    render()
  }
)
</script>

<style scoped>
.game-board {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-code);
  border-radius: 8px;
  overflow: hidden;
}

.game-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
</style>
