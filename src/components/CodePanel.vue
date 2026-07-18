<template>
  <n-card class="code-panel" title="关卡信息" size="small">
    <section class="level-section">
      <h2 class="level-title">{{ store.state.levelConfig?.title || 'Code Snake' }}</h2>
      <p class="level-description">{{ store.state.levelConfig?.description || '按正确顺序吃掉代码节点' }}</p>

      <div class="level-picker" aria-label="关卡选择">
        <n-button
          v-for="item in store.availableLevels"
          :key="item.level"
          size="small"
          class="level-button"
          :class="{ active: item.current, locked: !item.unlocked }"
          :disabled="!item.unlocked"
          @click="store.selectLevel(item.level)"
        >
          {{ item.level }}
        </n-button>
      </div>

      <div class="level-stats">
        <span>难度 {{ store.state.levelConfig?.difficulty ?? store.state.levelIndex }}</span>
        <span>目标 {{ store.state.levelConfig?.correctOrder.length ?? 0 }}</span>
        <span>初始长度 {{ store.state.levelConfig?.initialSnakeLength ?? 3 }}</span>
        <span>墙壁 {{ store.state.obstacles.length }}</span>
        <span>已解锁 {{ store.state.maxUnlockedLevel }}/5</span>
      </div>

      <div class="rules-box">
        <strong>规则：</strong>
        <span>{{ store.state.levelConfig?.rules || '按正确顺序吃掉代码节点；吃错扣生命并增长蛇身。使用方向键或 WASD 控制。' }}</span>
      </div>
    </section>

    <section class="code-section">
      <h3 class="section-title">当前代码</h3>
      <pre class="code-block"><code v-html="renderedCode" /></pre>

      <div v-if="errorMessage" class="error-toast">
        {{ errorMessage }}
      </div>

      <div class="target-hint">
        下一个目标：<span class="target-label">{{ store.currentTargetLabel || '即将通关' }}</span>
      </div>
    </section>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCard } from 'naive-ui'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()

const renderedCode = computed(() => {
  const config = store.state.levelConfig
  if (!config) return ''

  const collected = store.state.collectedCount
  const lines = config.codeTemplate.split('\n')

  return lines
    .map((line) => {
      let html = escapeHtml(line)

      for (let i = 1; i <= config.correctOrder.length; i++) {
        const isLit = i <= collected
        const colorClass = isLit ? 'lit' : 'dim'
        html = html.replace(
          new RegExp(`\\{${i}\\}`, 'g'),
          `<span class="code-segment ${colorClass}">${
            isLit ? escapeHtml(config.correctOrder[i - 1]) : '?'
          }</span>`
        )
      }

      return html
    })
    .join('\n')
})

const errorMessage = computed(() => {
  if (!store.state.errorFlash) return ''
  return `不是这个节点，再想想应该吃哪个！`
})

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<style scoped>
.code-panel {
  height: 100%;
  background-color: var(--bg-panel);
}

.level-section,
.code-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.code-section {
  margin-top: 16px;
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

.level-picker {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.level-button {
  min-width: 0;
  font-family: "JetBrains Mono", "Fira Code", monospace;
}

.level-button.active {
  color: #000000;
  background-color: var(--accent-variable);
  border-color: var(--accent-variable);
  font-weight: 700;
}

.level-button.locked {
  opacity: 0.45;
}

.level-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.level-stats span {
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--bg-code);
  color: var(--text-secondary);
  font-size: 12px;
}

.rules-box {
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

.section-title {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
}

.code-block {
  margin: 0;
  padding: 16px;
  background-color: var(--bg-code);
  border-radius: 8px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: var(--code-font-size);
  line-height: 1.6;
  color: var(--text-primary);
  overflow-x: auto;
  white-space: pre;
}

.code-segment {
  transition: color 0.3s ease, opacity 0.3s ease;
  border-radius: 3px;
  padding: 1px 4px;
}

.code-segment.lit {
  color: var(--accent-lit-text) !important;
  background-color: var(--accent-lit-bg) !important;
  font-weight: 700;
  opacity: 1;
  border-radius: 4px;
  padding: 2px 6px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.35);
}

.code-segment.dim {
  color: var(--text-secondary);
  opacity: 0.5;
}

.error-toast {
  margin-top: 12px;
  padding: 10px 12px;
  background-color: rgba(243, 139, 168, 0.2);
  border-left: 3px solid var(--accent-error);
  border-radius: 4px;
  color: var(--accent-error);
  font-size: 13px;
}

.target-hint {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.target-label {
  margin-left: 6px;
  color: var(--accent-variable);
  font-family: "JetBrains Mono", "Fira Code", monospace;
}
</style>
