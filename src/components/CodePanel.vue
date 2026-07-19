<template>
  <n-card class="code-panel" size="small">
    <section class="panel-block hero-block">
      <div class="level-summary">
        <h2 class="level-title">{{ store.state.levelConfig?.title || 'Code Snake' }}</h2>
        <p class="level-description">{{ store.state.levelConfig?.description || '按正确顺序吃掉代码节点' }}</p>
      </div>
      <div class="block-title">
        <span>目标代码</span>
      </div>
      <pre class="target-code"><code v-html="renderedCode" /></pre>
    </section>

    <section class="panel-block">
      <div class="block-title">
        <span>当前进度</span>
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
    </section>

    <section class="panel-block next-target">
      <div class="block-title gold">
        <span>下一个节点</span>
      </div>
      <div class="target-card">
        <span>{{ store.currentTargetLabel || '完成' }}</span>
        <ChevronRight :size="34" />
      </div>
    </section>

    <section class="stat-strip" aria-label="关卡统计">
      <span><BarChart3 :size="16" /> 难度 {{ store.state.levelConfig?.difficulty ?? store.state.levelIndex }}</span>
      <span><Target :size="16" /> 目标 {{ store.state.levelConfig?.correctOrder.length ?? 0 }}</span>
      <span><KeyRound :size="16" /> 初始长度 {{ store.state.levelConfig?.initialSnakeLength ?? 3 }}</span>
      <span><BrickWall :size="16" /> 墙壁 {{ store.state.obstacles.length }}</span>
      <span><LockKeyhole :size="16" /> 已解锁 {{ store.state.maxUnlockedLevel }}/{{ store.availableLevels.length }}</span>
    </section>

    <section class="panel-block code-section">
      <div class="block-title">
        <span>当前代码</span>
        <i />
      </div>
      <div class="editor-shell">
        <span class="line-number">1</span>
        <pre class="code-block"><code v-html="renderedCode" /></pre>
      </div>

      <div v-if="errorMessage" class="error-toast">
        {{ errorMessage }}
      </div>
    </section>

    <section class="panel-block mode-panel">
      <div class="block-title">
        <span>挑战模式</span>
      </div>
      <div class="mode-options">
        <button
          type="button"
          class="mode-option"
          :class="{ active: !store.state.hardMode }"
          @click="store.setHardMode(false)"
        >
          <Gamepad2 :size="20" />
          普通
        </button>
        <button
          type="button"
          class="mode-option"
          :class="{ active: store.state.hardMode }"
          @click="store.setHardMode(true)"
        >
          <Skull :size="20" />
          专家
        </button>
      </div>
    </section>

    <section v-if="availablePowerUps.length" class="panel-block power-card">
      <div class="block-title">
        <span>{{ store.state.status === 'PAUSED' ? '本关提示' : '道具状态' }}</span>
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
    </section>

    <section class="panel-block level-section">
      <div class="block-title">
        <span>关卡选择</span>
      </div>
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
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCard } from 'naive-ui'
import {
  BarChart3,
  BrickWall,
  ChevronRight,
  Gamepad2,
  KeyRound,
  LockKeyhole,
  Skull,
  Target
} from 'lucide-vue-next'
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
      case 'HEALTH':
        return { type, label: '生命', description: '恢复 1 点生命' }
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
  background:
    linear-gradient(145deg, rgba(7, 19, 36, 0.96), rgba(3, 10, 22, 0.94));
  color: var(--text-primary);
  border: 1px solid var(--panel-border-soft);
  box-shadow: var(--panel-glow);
}

.code-panel :deep(.n-card-header__main),
.code-panel :deep(.n-card__content) {
  color: var(--text-primary);
}

.code-panel :deep(.n-card__content) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
}

.panel-block {
  position: relative;
  padding: 16px 18px;
  border: 1px solid var(--panel-border-soft);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(8, 22, 40, 0.88), rgba(4, 11, 23, 0.9));
  box-shadow: inset 0 0 22px rgba(32, 200, 255, 0.07);
  overflow: hidden;
}

.panel-block::before {
  content: "";
  position: absolute;
  top: -1px;
  left: -1px;
  width: 28px;
  height: 28px;
  border-top: 2px solid var(--neon-cyan);
  border-left: 2px solid var(--neon-cyan);
}

.panel-block::after {
  content: "";
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 28px;
  height: 28px;
  border-right: 2px solid rgba(32, 231, 255, 0.55);
  border-bottom: 2px solid rgba(32, 231, 255, 0.55);
}

.hero-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-summary {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 4px;
}

.block-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.block-title span {
  text-shadow: 0 0 10px rgba(32, 231, 255, 0.22);
}

.block-title.gold {
  color: var(--neon-gold);
}

.block-title i {
  display: inline-flex;
  width: 44px;
  height: 10px;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(32, 231, 255, 0.45) 0 34%, transparent 36%) 0 0 / 16px 10px repeat-x;
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
  gap: 8px;
}

.level-button {
  min-width: 0;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  background: rgba(4, 14, 29, 0.86);
  border-color: rgba(85, 129, 181, 0.38);
}

.level-button :deep(.n-button__content) {
  color: var(--text-primary);
}

.level-button.active {
  color: var(--text-primary);
  background: rgba(32, 231, 255, 0.16);
  border-color: var(--neon-cyan);
  font-weight: 700;
  box-shadow: 0 0 14px rgba(32, 231, 255, 0.2);
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

.stat-strip,
.effect-row,
.power-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-strip {
  padding: 0;
}

.stat-strip span,
.power-chip,
.effect-row span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 5px 9px;
  border: 1px solid rgba(67, 122, 180, 0.38);
  border-radius: 7px;
  background: rgba(4, 14, 29, 0.84);
  color: var(--text-secondary);
  font-size: 12px;
}

.stat-strip svg {
  color: var(--neon-cyan);
}

.progress-steps {
  display: grid;
  position: relative;
  z-index: 1;
  gap: 10px;
}

.progress-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 50px;
  padding: 8px 10px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  background: rgba(4, 14, 29, 0.88);
  border: 1px solid rgba(85, 129, 181, 0.58);
  border-radius: 7px;
  color: var(--text-secondary);
  font-size: 20px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}

.progress-item.lit {
  color: var(--accent-lit-text);
  background: var(--progress-lit-bg);
  border-color: var(--neon-green);
  font-weight: 700;
  box-shadow: 0 0 14px rgba(30, 240, 189, 0.2);
}

.progress-item.current {
  background: rgba(255, 215, 90, 0.13);
  border-color: var(--neon-gold);
  color: var(--neon-gold);
  box-shadow: var(--gold-glow);
  font-weight: 700;
}

.next-target {
  border-color: rgba(255, 215, 90, 0.68);
  box-shadow: var(--gold-glow);
}

.next-target::before,
.next-target::after {
  border-color: var(--neon-gold);
}

.target-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 10px 16px;
  border: 1px solid var(--neon-gold);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(255, 215, 90, 0.12), rgba(255, 215, 90, 0.04)),
    radial-gradient(circle at 50% 55%, rgba(255, 215, 90, 0.16), transparent 48%);
  color: var(--neon-gold);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 24px;
  font-weight: 800;
  text-shadow: 0 0 14px rgba(255, 215, 90, 0.5);
}

.target-card svg {
  flex: 0 0 auto;
  filter: drop-shadow(0 0 8px rgba(255, 215, 90, 0.7));
}

.target-code {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 14px 16px;
  border: 1px solid rgba(85, 129, 181, 0.45);
  border-radius: 8px;
  background: rgba(4, 14, 29, 0.82);
  color: var(--text-primary);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 20px;
  line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
}

.code-block {
  margin: 0;
  padding: 16px 18px;
  flex: 1;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 21px;
  line-height: 1.6;
  color: var(--text-primary);
  overflow-x: auto;
  white-space: pre;
}

.editor-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  min-height: 112px;
  border: 1px solid rgba(85, 129, 181, 0.45);
  border-radius: 8px;
  background: rgba(4, 14, 29, 0.84);
  overflow: hidden;
}

.line-number {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 17px;
  border-right: 1px solid rgba(85, 129, 181, 0.45);
  color: #7088aa;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 20px;
}

.code-segment {
  transition: color 0.3s ease, opacity 0.3s ease;
  border-radius: 3px;
  padding: 1px 4px;
}

.code-segment.lit {
  color: var(--accent-lit-text) !important;
  background-color: transparent !important;
  font-weight: 700;
  opacity: 1;
  text-shadow: 0 0 10px rgba(255, 215, 90, 0.35);
}

.code-segment.dim {
  color: var(--text-secondary);
  opacity: 0.72;
}

.error-toast {
  position: relative;
  z-index: 1;
  padding: 11px 12px;
  background-color: rgba(243, 139, 168, 0.2);
  border-left: 3px solid var(--accent-error);
  border-radius: 4px;
  color: var(--accent-error);
  font-size: 13px;
}

.mode-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.mode-option {
  min-width: 0;
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid rgba(85, 129, 181, 0.55);
  border-radius: 8px;
  background: rgba(4, 14, 29, 0.86);
  color: var(--text-secondary);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.mode-option.active {
  border-color: var(--neon-cyan);
  background: rgba(32, 231, 255, 0.14);
  color: var(--neon-cyan);
  box-shadow: 0 0 18px rgba(32, 231, 255, 0.18);
}

.mode-option:not(.active):hover {
  border-color: rgba(32, 231, 255, 0.42);
  color: var(--text-primary);
}

.power-card {
  gap: 10px;
}

@media (max-width: 1100px) {
  .level-picker {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .target-card {
    font-size: 22px;
  }
}

@media (max-width: 768px) {
  .code-panel :deep(.n-card__content) {
    padding: 0;
  }

  .target-card {
    min-height: 48px;
    font-size: 20px;
  }

  .progress-item {
    min-height: 42px;
    font-size: 15px;
  }
}
</style>
