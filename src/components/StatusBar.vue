<template>
  <n-card class="status-bar" size="small">
    <div class="status-content">
      <div class="status-item">
        <span class="status-label">生命值</span>
        <div class="hearts">
          <Heart
            v-for="i in store.state.levelConfig?.lives || 3"
            :key="i"
            class="heart-icon"
            :class="{ filled: i <= store.state.lives, empty: i > store.state.lives }"
            :size="20"
          />
        </div>
      </div>

      <div class="status-item">
        <span class="status-label">得分</span>
        <span class="status-value">{{ store.state.score }}</span>
      </div>

      <div class="status-item">
        <span class="status-label">长度</span>
        <span class="status-value">{{ store.state.snake.body.length }}</span>
      </div>

      <div class="status-item controls">
        <n-button size="small" @click="store.togglePause()">
          {{ store.isPaused ? '继续' : '暂停' }}
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NButton } from 'naive-ui'
import { Heart } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
</script>

<style scoped>
.status-bar {
  background-color: var(--bg-panel);
  margin-top: 12px;
}

.status-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-variable);
  font-family: "JetBrains Mono", "Fira Code", monospace;
}

.hearts {
  display: flex;
  gap: 4px;
}

.heart-icon {
  transition: all 0.2s ease;
}

.heart-icon.filled {
  color: var(--accent-health);
  fill: var(--accent-health);
}

.heart-icon.empty {
  color: var(--grid-line);
}

.controls {
  margin-left: auto;
}
</style>
