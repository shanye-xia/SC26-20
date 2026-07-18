<template>
  <n-card class="code-panel" title="当前代码" size="small">
    <pre class="code-block"><code v-html="renderedCode" /></pre>

    <div v-if="errorMessage" class="error-toast">
      {{ errorMessage }}
    </div>

    <div class="target-hint">
      下一个目标：<span class="target-label">{{ store.currentTargetLabel || '即将通关' }}</span>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard } from 'naive-ui'
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

.code-block {
  margin: 0;
  padding: 16px;
  background-color: var(--bg-code);
  border-radius: 8px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
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
  color: var(--accent-string);
  background-color: rgba(166, 227, 161, 0.15);
  opacity: 1;
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
