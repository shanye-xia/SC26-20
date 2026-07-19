<template>
  <n-card class="debug-panel" size="small" title="调试面板">
    <div class="debug-summary">
      <span>DEV</span>
      <span>关卡 {{ store.state.levelIndex }}</span>
      <span>状态 {{ store.state.status }}</span>
      <span>道具 {{ store.state.powerUps.length }}</span>
      <n-button size="tiny" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </n-button>
    </div>

    <div v-if="expanded" class="debug-body">
      <div class="debug-grid">
        <label>
          <span>关卡</span>
          <input
            v-model.number="targetLevel"
            class="debug-input"
            type="number"
            min="1"
            :max="maxLevel"
          >
        </label>
        <n-button size="small" @click="store.debugStartLevel(targetLevel)">
          跳转
        </n-button>
        <n-button size="small" @click="store.debugUnlockAllLevels()">
          解锁全部
        </n-button>
        <n-button size="small" @click="store.debugSetUnlockedLevel(targetLevel)">
          解锁到此
        </n-button>
      </div>

      <div class="debug-grid">
        <label>
          <span>护盾</span>
          <input v-model.number="shield" class="debug-input" type="number" min="0">
        </label>
        <label>
          <span>无敌秒</span>
          <input v-model.number="invincibleSeconds" class="debug-input" type="number" min="0">
        </label>
        <label>
          <span>弹药</span>
          <input v-model.number="shots" class="debug-input" type="number" min="0">
        </label>
        <n-button size="small" @click="applyEffects">
          应用效果
        </n-button>
      </div>

      <div class="debug-actions">
        <n-button size="small" @click="store.debugGrantPowerUp('SHIELD')">
          +护盾
        </n-button>
        <n-button size="small" @click="store.debugGrantPowerUp('INVINCIBLE')">
          +无敌
        </n-button>
        <n-button size="small" @click="store.debugGrantPowerUp('SHOT')">
          +弹药
        </n-button>
        <n-button size="small" @click="store.debugGrantPowerUp('HEALTH')">
          +生命
        </n-button>
        <n-button size="small" @click="store.fireShot()">
          发射
        </n-button>
      </div>

      <div class="debug-actions">
        <n-button size="small" @click="store.debugSpawnPowerUp('SHIELD')">
          生成护盾
        </n-button>
        <n-button size="small" @click="store.debugSpawnPowerUp('INVINCIBLE')">
          生成无敌
        </n-button>
        <n-button size="small" @click="store.debugSpawnPowerUp('SHOT')">
          生成攻击
        </n-button>
        <n-button size="small" @click="store.debugSpawnPowerUp('HEALTH')">
          生成生命
        </n-button>
        <n-button size="small" @click="store.debugClearPowerUps()">
          清道具
        </n-button>
      </div>

      <div class="debug-actions">
        <n-switch
          :value="store.state.hardMode"
          @update:value="store.setHardMode"
        />
        <span>困难模式</span>
        <span>状态 {{ store.state.status }}</span>
        <span>道具 {{ store.state.powerUps.length }}</span>
        <span>墙 {{ store.state.obstacles.length }}</span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NCard, NSwitch } from 'naive-ui'
import { GAME_CONSTANTS } from '@/constants/game'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
const maxLevel = GAME_CONSTANTS.maxLevel
const expanded = ref(false)
const targetLevel = ref(store.state.levelIndex)
const shield = ref(store.state.activeEffects.shield)
const invincibleSeconds = ref(Math.ceil(store.state.activeEffects.invincibleMs / 1000))
const shots = ref(store.state.activeEffects.shots)

watch(
  () => store.state.levelIndex,
  (levelIndex) => {
    targetLevel.value = levelIndex
  }
)

watch(
  () => store.state.activeEffects,
  (effects) => {
    shield.value = effects.shield
    invincibleSeconds.value = Math.ceil(effects.invincibleMs / 1000)
    shots.value = effects.shots
  },
  { deep: true }
)

function applyEffects(): void {
  store.debugSetEffects(shield.value, invincibleSeconds.value * 1000, shots.value)
}
</script>

<style scoped>
.debug-panel {
  width: 100%;
  max-width: 1200px;
  margin: 16px auto 0;
  border: 1px dashed var(--accent-error);
  background-color: var(--bg-panel);
  box-shadow: 0 12px 36px rgb(0 0 0 / 18%);
}

.debug-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.debug-summary span {
  padding: 2px 6px;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.debug-body {
  margin-top: 8px;
}

.debug-grid,
.debug-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.debug-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 12px;
}

.debug-input {
  width: 100%;
  min-width: 0;
  padding: 4px 6px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--bg-code);
  color: var(--text-primary);
}

.debug-actions span {
  color: var(--text-secondary);
  font-size: 12px;
}

@media (max-width: 768px) {
  .debug-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
