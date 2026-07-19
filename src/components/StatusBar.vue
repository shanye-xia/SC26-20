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
  background:
    linear-gradient(135deg, rgba(8, 22, 40, 0.94), rgba(3, 10, 22, 0.92));
  border: 1px solid var(--panel-border-soft);
  margin-top: 12px;
  box-shadow: var(--panel-glow);
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
  min-height: 34px;
  padding: 5px 10px;
  border: 1px solid rgba(67, 122, 180, 0.34);
  border-radius: 7px;
  background: rgba(6, 14, 28, 0.74);
}

.status-label {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 0;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--neon-gold);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  text-shadow: 0 0 10px rgba(255, 215, 90, 0.3);
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
  filter: drop-shadow(0 0 7px rgba(255, 111, 136, 0.5));
}

.heart-icon.empty {
  color: var(--grid-line);
}

.controls {
  margin-left: auto;
}

.controls :deep(.n-button) {
  border-color: rgba(32, 231, 255, 0.42);
  background: rgba(3, 19, 37, 0.86);
  color: var(--neon-cyan);
  box-shadow: inset 0 0 14px rgba(32, 231, 255, 0.08);
}
</style>
