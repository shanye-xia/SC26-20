<template>
  <n-modal
    :show="isVisible"
    :mask-closable="false"
    preset="card"
    :title="modalTitle"
    class="level-modal"
    style="width: 500px; max-width: 90vw"
    closable
    @close="handleModalAction"
  >
    <div class="modal-content">
      <pre class="result-code"><code>{{ fullCode }}</code></pre>

      <n-card v-if="explanation" class="knowledge-card" size="small" title="知识点">
        {{ explanation }}
      </n-card>

      <div class="modal-actions">
        <n-button type="primary" @click="handleModalAction">
          {{ actionLabel }}
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NCard, NButton } from 'naive-ui'
import { useGameStore } from '@/stores/gameStore'
import { renderCodeTemplate } from '@/utils/levelLoader'

const store = useGameStore()

const isVisible = computed(() => {
  return (
    store.state.status === 'LEVEL_PASSED' ||
    store.state.status === 'LEVEL_FAILED' ||
    store.state.status === 'ALL_LEVELS_CLEARED'
  )
})

const modalTitle = computed(() => {
  switch (store.state.status) {
    case 'LEVEL_PASSED':
      return store.state.levelIndex >= store.availableLevels.length ? '全部通关！' : '关卡完成！'
    case 'LEVEL_FAILED':
      return '关卡失败'
    case 'ALL_LEVELS_CLEARED':
      return '恭喜通关全部关卡！'
    default:
      return ''
  }
})

const actionLabel = computed(() => {
  switch (store.state.status) {
    case 'LEVEL_PASSED':
      return store.state.levelIndex >= store.availableLevels.length ? '完成' : '下一关'
    case 'LEVEL_FAILED':
      return '重试本关'
    case 'ALL_LEVELS_CLEARED':
      return '再玩一次'
    default:
      return '关闭'
  }
})

const fullCode = computed(() => {
  const config = store.state.levelConfig
  if (!config) return ''
  return renderCodeTemplate(config.codeTemplate, config.correctOrder)
})

const explanation = computed(() => store.state.levelConfig?.explanation ?? '')

function handleModalAction(): void {
  switch (store.state.status) {
    case 'LEVEL_PASSED':
      store.nextLevel()
      break
    case 'LEVEL_FAILED':
      store.retryLevel()
      break
    case 'ALL_LEVELS_CLEARED':
      store.resetGame()
      break
  }
}
</script>

<style scoped>
.level-modal {
  background-color: var(--bg-panel);
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-code {
  margin: 0;
  padding: 16px;
  background-color: var(--bg-code);
  border-radius: 8px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
  line-height: 1.6;
  color: var(--accent-string);
  overflow-x: auto;
  white-space: pre;
}

.knowledge-card {
  background-color: var(--bg-code);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
