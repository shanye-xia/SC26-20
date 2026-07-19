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
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background:
    radial-gradient(circle at 50% 45%, rgba(32, 200, 255, 0.1), transparent 48%),
    linear-gradient(135deg, rgba(7, 19, 35, 0.98), rgba(2, 8, 18, 0.98));
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--panel-glow);
}

.game-board::before,
.game-board::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 8px;
}

.game-board::before {
  background-image:
    linear-gradient(rgba(32, 200, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(32, 200, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
}

.game-board::after {
  border: 1px solid rgba(32, 231, 255, 0.18);
  box-shadow: inset 0 0 38px rgba(32, 200, 255, 0.1);
}

.game-canvas {
  position: relative;
  z-index: 1;
  display: block;
  max-width: 100%;
  max-height: 100%;
  border-radius: 7px;
  filter: drop-shadow(0 0 20px rgba(27, 216, 255, 0.08));
}
</style>
