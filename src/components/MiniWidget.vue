<template>
  <div class="w-full h-full p-2 select-none flex items-center justify-between app-drag-region bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-2xl shadow-ios-float border border-white/60 dark:border-white/10">
    <!-- 左侧：环形进度与百分比 -->
    <div class="flex items-center space-x-2.5 pl-1 no-drag">
      <div class="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
        <!-- SVG 环形进度条 -->
        <svg class="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15"
            class="stroke-slate-200 dark:stroke-zinc-800"
            stroke-width="3"
            fill="none"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            :class="[
              store.isGoalAchieved ? 'stroke-ios-green dark:stroke-ios-green-dark' : 'stroke-ios-blue dark:stroke-ios-blue-dark'
            ]"
            stroke-width="3"
            stroke-linecap="round"
            fill="none"
            :stroke-dasharray="dashArray"
            :stroke-dashoffset="dashOffset"
            class="transition-all duration-500 ease-out"
          />
        </svg>

        <span class="absolute text-[10px] font-black tracking-tighter text-slate-800 dark:text-slate-100">
          {{ store.progressPercent }}%
        </span>
      </div>

      <!-- 水量数值与专注计时展示 -->
      <div class="flex flex-col">
        <div v-if="store.pomodoroState === 'running' || store.pomodoroState === 'break'" class="flex items-center space-x-1">
          <Timer class="w-3 h-3 text-rose-500 animate-pulse" :stroke-width="2.5" />
          <span class="text-xs font-black font-mono tracking-tight text-rose-500 leading-tight">
            {{ store.formattedPomodoroMinutes }}:{{ store.formattedPomodoroSeconds }}
          </span>
        </div>
        <div v-else class="flex items-baseline space-x-0.5">
          <span class="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">
            {{ store.totalEffectiveWaterMl }}
          </span>
          <span class="text-[9px] font-medium text-slate-400">ml</span>
        </div>
        <span class="text-[9px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
          {{ (store.pomodoroState === 'running' || store.pomodoroState === 'break') ? store.pomodoroTag : `目标 ${store.dailyGoalMl}` }}
        </span>
      </div>
    </div>

    <!-- 右侧：快捷打卡与展开/收起按钮组 -->
    <div class="flex items-center space-x-1.5 pr-1 no-drag">
      <!-- 快捷打卡：使用第一个预设容量 -->
      <button
        type="button"
        class="no-drag px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-ios-blue hover:bg-ios-blue/90 text-white shadow-sm active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
        :title="`快捷补水 +${quickAmount}ml`"
        @click.stop="handleQuickDrink"
      >
        <Plus class="w-3 h-3" :stroke-width="3" />
        <span>{{ quickAmount }}</span>
      </button>

      <!-- 展开主控制面板 -->
      <button
        type="button"
        class="no-drag w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
        title="展开主面板"
        @click.stop="handleExpand"
      >
        <Maximize2 class="w-3.5 h-3.5" :stroke-width="2" />
      </button>

      <!-- 隐藏到托盘 -->
      <button
        type="button"
        class="no-drag w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
        title="隐藏至系统托盘"
        @click.stop="handleMinimizeToTray"
      >
        <Minus class="w-3.5 h-3.5" :stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Maximize2, Minus, Timer } from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'

const store = useHealthStore()

const quickAmount = computed(() => {
  return store.settings.presetVolumes[1] || store.settings.presetVolumes[0] || 250
})

const circleCircumference = 2 * Math.PI * 15 // ≈ 94.248
const dashArray = `${circleCircumference} ${circleCircumference}`

const dashOffset = computed(() => {
  const percent = Math.min(100, Math.max(0, store.progressPercent))
  return circleCircumference - (percent / 100) * circleCircumference
})

function handleQuickDrink(): void {
  store.addWaterRecord(quickAmount.value, 'pure_water')
}

function handleExpand(): void {
  store.setMiniMode(false)
}

function handleMinimizeToTray(): void {
  if (window.electronAPI) {
    window.electronAPI.close()
  } else {
    const ipc = (window as unknown as { ipcRenderer?: { send: (c: string) => void } }).ipcRenderer
    ipc?.send('window:close')
  }
}
</script>

<style scoped>
.app-drag-region {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
  cursor: pointer;
}
</style>
