<template>
  <n-card class="hud" size="small">
    <div class="hud-content">
      <div class="brand">
        <h1>Code Snake</h1>
        <span>方向键 / WASD 控制</span>
      </div>

      <div class="general-info">
        <span>关卡 {{ store.state.levelIndex }}</span>
        <span>已解锁 {{ store.state.maxUnlockedLevel }}/{{ store.availableLevels.length }}</span>
        <span>得分 {{ store.state.score }}</span>
        <span>{{ statusLabel }}</span>
      </div>

      <div class="rules-box">
        <strong>规则：</strong>
        <span>{{ store.state.levelConfig?.rules || '按正确顺序吃掉代码节点；吃错扣生命并增长蛇身。使用方向键或 WASD 控制。' }}</span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard } from 'naive-ui'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()

const statusLabel = computed(() => {
  switch (store.state.status) {
    case 'PLAYING':
      return '进行中'
    case 'PAUSED':
      return '等待开始'
    case 'LEVEL_PASSED':
      return '关卡完成'
    case 'LEVEL_FAILED':
      return '关卡失败'
    case 'ALL_LEVELS_CLEARED':
      return '全部通关'
    default:
      return '准备中'
  }
})
</script>

<style scoped>
.hud {
  background-color: var(--bg-panel);
  margin-bottom: 12px;
}

.hud-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.brand h1 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.brand span,
.general-info span {
  color: var(--text-secondary);
  font-size: 13px;
}

.general-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.general-info span {
  padding: 3px 8px;
  border-radius: 4px;
  background-color: var(--bg-code);
}

.rules-box {
  width: 100%;
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

</style>
