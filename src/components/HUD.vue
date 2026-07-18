<template>
  <n-card class="hud" size="small">
    <div class="hud-content">
      <div class="level-info">
        <h2 class="level-title">{{ store.state.levelConfig?.title || 'Code Snake' }}</h2>
        <p class="level-description">{{ store.state.levelConfig?.description || '按正确顺序吃掉代码节点' }}</p>

        <div class="rules-box">
          <strong>规则：</strong>
          <span>{{ store.state.levelConfig?.rules || '按正确顺序吃掉代码节点；吃错扣生命并增长蛇身。使用方向键或 WASD 控制。' }}</span>
        </div>

        <div class="level-stats">
          <span>关卡 {{ store.state.levelIndex }}/5</span>
          <span>难度 {{ store.state.levelConfig?.difficulty ?? store.state.levelIndex }}</span>
          <span>目标 {{ store.state.levelConfig?.correctOrder.length ?? 0 }}</span>
          <span>初始长度 {{ store.state.levelConfig?.initialSnakeLength ?? 3 }}</span>
          <span>墙壁 {{ store.state.obstacles.length }}</span>
        </div>
      </div>

      <div class="progress">
        <span class="progress-label">进度：</span>
        <span
          v-for="(item, index) in progressItems"
          :key="index"
          class="progress-item"
          :class="{ lit: index < store.state.collectedCount, current: index === store.state.collectedCount }"
        >
          {{ item }}
        </span>
      </div>

      <div v-if="store.state.status === 'PAUSED'" class="start-hint">
        按方向键或 WASD 开始游戏
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard } from 'naive-ui'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()

const progressItems = computed(() => {
  const order = store.state.levelConfig?.correctOrder ?? []
  return order.map((item, index) => {
    if (index < store.state.collectedCount) return item
    return '?'
  })
})
</script>

<style scoped>
.hud {
  background-color: var(--bg-panel);
  margin-bottom: 12px;
}

.hud-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-title {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.level-description {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.progress-label {
  color: var(--text-secondary);
}

.progress-item {
  padding: 2px 8px;
  border-radius: 4px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  background-color: var(--bg-code);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.progress-item.lit {
  color: #000000 !important;
  background-color: var(--progress-lit-bg) !important;
  font-weight: 700;
}

.progress-item.current {
  color: var(--accent-variable);
  box-shadow: 0 0 0 1px var(--accent-variable);
}

.start-hint {
  font-size: 13px;
  color: var(--accent-variable);
  padding: 6px 10px;
  background-color: rgba(249, 226, 175, 0.1);
  border-radius: 4px;
  text-align: center;
}

.rules-box {
  margin-top: 8px;
  padding: 8px 10px;
  background-color: var(--rules-bg);
  border-left: 4px solid var(--rules-accent);
  color: var(--text-primary);
  font-size: 13px;
  border-radius: 6px;
}
.rules-box strong {
  margin-right: 6px;
  color: var(--rules-accent);
}

.level-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.level-stats span {
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--bg-code);
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
