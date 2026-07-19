<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div class="app">
      <HUD class="hud" />

      <div class="main-content">
        <GameBoard class="game-board" />
        <CodePanel class="code-panel" />
      </div>

      <StatusBar class="status-bar" />
      <DebugPanel v-if="isDev" />
      <LevelModal />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { useGameStore } from '@/stores/gameStore'
import { useInput } from '@/composables/useInput'
import HUD from '@/components/HUD.vue'
import GameBoard from '@/components/GameBoard.vue'
import CodePanel from '@/components/CodePanel.vue'
import StatusBar from '@/components/StatusBar.vue'
import DebugPanel from '@/components/DebugPanel.vue'
import LevelModal from '@/components/LevelModal.vue'

const store = useGameStore()
useInput()
const isDev = import.meta.env.DEV

const themeOverrides = {
  common: {
    primaryColor: '#20e7ff',
    primaryColorHover: '#68f3ff',
    primaryColorPressed: '#00b7db'
  },
  Card: {
    color: 'rgba(8, 18, 34, 0.86)',
    textColor: '#e6f7ff',
    borderColor: 'rgba(32, 200, 255, 0.38)',
    borderRadius: '8px'
  },
  Modal: {
    color: 'rgba(8, 18, 34, 0.96)',
    textColor: '#e6f7ff'
  },
  Button: {
    textColor: '#e6f7ff',
    borderRadiusSmall: '6px'
  }
}

onMounted(() => {
  store.startLevel(1)
})
</script>

<style scoped>
.app {
  position: relative;
  max-width: 1680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: calc(100vh - 32px);
}

.app::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(32, 200, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(32, 200, 255, 0.045) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at 50% 45%, black, transparent 78%);
}

.main-content {
  display: grid;
  grid-template-columns: minmax(560px, 1.48fr) minmax(360px, 0.94fr);
  gap: 16px;
  flex: 1;
  min-height: 0;
  align-items: start;
}

.game-board {
  min-width: 0;
}

.code-panel {
  min-width: 280px;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .code-panel {
    min-width: auto;
  }
}
</style>
