<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div class="app">
      <HUD class="hud" />

      <div class="main-content">
        <GameBoard class="game-board" />
        <CodePanel class="code-panel" />
      </div>

      <StatusBar class="status-bar" />
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
import LevelModal from '@/components/LevelModal.vue'

const store = useGameStore()
useInput()

const themeOverrides = {
  common: {
    primaryColor: '#89b4fa',
    primaryColorHover: '#b4befe',
    primaryColorPressed: '#74c7ec'
  },
  Card: {
    color: '#2a2a3c',
    textColor: '#cdd6f4',
    borderColor: '#45475a'
  },
  Modal: {
    color: '#2a2a3c',
    textColor: '#cdd6f4'
  },
  Button: {
    textColor: '#cdd6f4'
  }
}

onMounted(() => {
  store.startLevel(1)
})
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: calc(100vh - 32px);
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
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
