<template>
  <n-card class="hud" size="small">
    <div class="hud-content">
      <div class="brand">
        <CodeXml class="brand-icon" :size="32" />
        <h1>Code Snake</h1>
        <span class="level-badge">LEVEL {{ store.state.levelIndex }}-1</span>
      </div>

      <div class="general-info">
        <span><Heart :size="18" /> {{ store.state.lives }}/{{ store.state.levelConfig?.lives || 3 }}</span>
        <span><Star :size="18" /> {{ store.state.score }}</span>
        <span><Gauge :size="18" /> {{ statusLabel }}</span>
        <span><Layers3 :size="18" /> {{ store.state.maxUnlockedLevel }}/{{ store.availableLevels.length }}</span>
      </div>

      <div class="rules-box">
        <strong>RULE</strong>
        <span>{{ store.state.levelConfig?.rules || '按正确顺序吃掉代码节点；吃错扣生命并增长蛇身。使用方向键或 WASD 控制。' }}</span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard } from 'naive-ui'
import { CodeXml, Gauge, Heart, Layers3, Star } from 'lucide-vue-next'
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
  position: relative;
  margin-bottom: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(8, 22, 40, 0.96), rgba(3, 10, 22, 0.9));
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-glow);
}

.hud::before,
.hud::after {
  content: "";
  position: absolute;
  width: 44px;
  height: 44px;
  border-color: var(--neon-cyan);
  pointer-events: none;
}

.hud::before {
  top: -1px;
  left: -1px;
  border-top: 2px solid;
  border-left: 2px solid;
}

.hud::after {
  right: -1px;
  bottom: -1px;
  border-right: 2px solid;
  border-bottom: 2px solid;
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
  align-items: center;
  gap: 14px;
}

.brand-icon {
  color: var(--neon-cyan);
  filter: drop-shadow(0 0 8px rgba(32, 231, 255, 0.65));
}

.brand h1 {
  margin: 0;
  color: var(--neon-cyan);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 28px;
  line-height: 1;
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 14px rgba(32, 231, 255, 0.55);
}

.level-badge {
  padding: 7px 14px;
  border: 1px solid rgba(32, 231, 255, 0.38);
  border-radius: 7px;
  background: rgba(4, 14, 30, 0.9);
  color: var(--neon-cyan);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 15px;
  box-shadow: inset 0 0 14px rgba(32, 231, 255, 0.08);
}

.general-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
}

.general-info span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 12px;
  border-left: 1px solid rgba(138, 164, 195, 0.28);
  color: var(--text-primary);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 18px;
}

.general-info span:first-child {
  border-left: 0;
}

.general-info svg {
  color: var(--neon-cyan);
}

.general-info span:first-child svg {
  color: var(--accent-health);
  fill: var(--accent-health);
}

.general-info span:nth-child(2) svg {
  color: var(--neon-gold);
  fill: var(--neon-gold);
}

.rules-box {
  width: 100%;
  padding: 10px 12px;
  background: linear-gradient(90deg, rgba(255, 215, 90, 0.1), rgba(32, 231, 255, 0.04));
  border: 1px solid rgba(255, 215, 90, 0.24);
  border-left: 4px solid var(--rules-accent);
  color: var(--text-primary);
  font-size: 13px;
  border-radius: 6px;
}

.rules-box strong {
  margin-right: 6px;
  color: var(--rules-accent);
  font-family: "JetBrains Mono", "Fira Code", monospace;
}

@media (max-width: 900px) {
  .brand h1 {
    font-size: 22px;
  }

  .general-info {
    justify-content: flex-start;
    gap: 8px;
  }

  .general-info span {
    border-left: 0;
    font-size: 14px;
  }
}

</style>
