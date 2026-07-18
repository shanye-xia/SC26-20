<template>
  <n-card class="code-panel" title="关卡信息" size="small">
    <section class="level-section">
      <h3 class="section-title">关卡选择</h3>
      <div class="level-picker" aria-label="关卡选择">
        <n-button
          v-for="item in visibleLevels"
          :key="item.level"
          size="small"
          class="level-button"
          :class="{ active: item.current, locked: !item.unlocked }"
          :disabled="!item.unlocked"
          @click="store.selectLevel(item.level)"
        >
          {{ item.level }}
        </n-button>
        <n-button
          v-if="hasMoreLevels"
          size="small"
          class="level-button all-button"
          @click="showAllLevels = !showAllLevels"
        >
          {{ showAllLevels ? '收起' : '全部' }}
        </n-button>
      </div>
    </section>

    <section class="level-section current-level">
      <h2 class="level-title">{{ store.state.levelConfig?.title || 'Code Snake' }}</h2>
      <p class="level-description">{{ store.state.levelConfig?.description || '按正确顺序吃掉代码节点' }}</p>

      <div class="progress-card">
        <div class="progress-header">
          <span>当前关卡进度</span>
          <strong>下一个：{{ store.currentTargetLabel || '完成' }}</strong>
        </div>
        <div
          class="progress-steps"
          :style="progressGridStyle"
          aria-label="当前关卡进度"
        >
          <span
            v-for="(item, index) in progressItems"
            :key="index"
            class="progress-item"
            :class="{ lit: index < store.state.collectedCount, current: index === store.state.collectedCount }"
          >
            {{ item }}
          </span>
        </div>
      </div>

      <div class="level-stats">
        <span>难度 {{ store.state.levelConfig?.difficulty ?? store.state.levelIndex }}</span>
        <span>目标 {{ store.state.levelConfig?.correctOrder.length ?? 0 }}</span>
        <span>初始长度 {{ store.state.levelConfig?.initialSnakeLength ?? 3 }}</span>
        <span>墙壁 {{ store.state.obstacles.length }}</span>
        <span>已解锁 {{ store.state.maxUnlockedLevel }}/{{ store.availableLevels.length }}</span>
      </div>

      <div class="mode-row">
        <div>
          <strong>困难模式</strong>
          <span>正确节点不再额外标记</span>
        </div>
        <n-switch
          :value="store.state.hardMode"
          @update:value="store.setHardMode"
        />
      </div>

      <div v-if="availablePowerUps.length" class="power-card">
        <div class="power-header">
          <strong>{{ store.state.status === 'PAUSED' ? '本关开始前提示' : '道具状态' }}</strong>
          <span>空格发射攻击</span>
        </div>
        <div class="power-list">
          <span
            v-for="powerUp in availablePowerUps"
            :key="powerUp.type"
            class="power-chip"
          >
            {{ powerUp.label }}：{{ powerUp.description }}
          </span>
        </div>
        <div class="effect-row">
          <span>护盾 {{ store.state.activeEffects.shield }}</span>
          <span>无敌 {{ invincibleSeconds }}s</span>
          <span>弹药 {{ store.state.activeEffects.shots }}</span>
        </div>
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
import { computed, ref } from 'vue'
import { NButton, NCard, NSwitch } from 'naive-ui'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
const showAllLevels = ref(false)

const visibleLevels = computed(() => {
  if (showAllLevels.value) return store.availableLevels
  return store.availableLevels.slice(0, 5)
})

const hasMoreLevels = computed(() => store.availableLevels.length > 5)
const availablePowerUps = computed(() => {
  const types = store.state.levelConfig?.powerUps ?? []
  return types.map((type) => {
    switch (type) {
      case 'SHIELD':
        return { type, label: '护盾', description: '抵消一次撞击或吃错' }
      case 'INVINCIBLE':
        return { type, label: '无敌', description: '短时间免疫伤害' }
      case 'SHOT':
        return { type, label: '攻击', description: '按空格击碎墙壁' }
    }
  })
})

const invincibleSeconds = computed(() => Math.ceil(store.state.activeEffects.invincibleMs / 1000))

const totalTargets = computed(() => store.state.levelConfig?.correctOrder.length ?? 0)

const progressGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(totalTargets.value, 1)}, minmax(0, 1fr))`
}))

const progressItems = computed(() => {
  const order = store.state.levelConfig?.correctOrder ?? []
  return order.map((item, index) => {
    if (index <= store.state.collectedCount) return item
    return '?'
  })
})

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
  color: var(--text-primary);
}

.code-panel :deep(.n-card-header__main),
.code-panel :deep(.n-card__content) {
  color: var(--text-primary);
}

.level-section,
.code-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.current-level {
  margin-top: 16px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.level-button {
  min-width: 0;
  font-family: "JetBrains Mono", "Fira Code", monospace;
}

.level-button :deep(.n-button__content) {
  color: var(--text-primary);
}

.level-button.active {
  color: var(--text-primary);
  background-color: rgba(137, 180, 250, 0.28);
  border-color: var(--accent-function);
  font-weight: 700;
}

.level-button.active :deep(.n-button__content) {
  color: var(--text-primary);
}

.level-button.locked {
  opacity: 0.45;
}

.level-button.locked :deep(.n-button__content) {
  color: var(--text-secondary);
}

.all-button {
  border-color: var(--accent-variable);
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

.mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--bg-code);
}

.mode-row div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mode-row strong {
  color: var(--text-primary);
  font-size: 13px;
}

.mode-row span {
  color: var(--text-secondary);
  font-size: 12px;
}

.power-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--bg-code);
}

.power-header,
.effect-row,
.power-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.power-header {
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
}

.power-header strong {
  color: var(--accent-variable);
}

.power-chip,
.effect-row span {
  padding: 3px 8px;
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
}

.progress-card {
  padding: 10px;
  background-color: var(--bg-code);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.progress-header strong {
  color: var(--accent-variable);
  font-family: "JetBrains Mono", "Fira Code", monospace;
}

.progress-steps {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--bg-primary);
}

.progress-item {
  min-width: 0;
  min-height: 30px;
  padding: 5px 6px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-right: 1px solid var(--border);
  transition: background-color 0.25s ease, color 0.25s ease;
}

.progress-item:last-child {
  border-right: 0;
}

.progress-item.lit {
  color: #000000;
  background-color: var(--progress-lit-bg);
  font-weight: 700;
}

.progress-item.current {
  background-color: rgba(249, 226, 175, 0.16);
  color: var(--accent-variable);
  box-shadow: inset 0 0 0 1px var(--accent-variable);
  font-weight: 700;
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
