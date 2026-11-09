<template>
  <main class="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-100 select-none relative font-sans antialiased">
    <!-- 桌面柔和漫射环境背景光 -->
    <div class="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-sky-400/10 dark:bg-sky-500/10 filter blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 filter blur-3xl"></div>

    <!-- 迷你桌面悬浮组件形态 -->
    <template v-if="isMiniMode">
      <MiniWidget />
    </template>

    <!-- 标准完整控制中心窗口形态 -->
    <template v-else>
      <!-- 自定义 iOS 顶栏 -->
      <AppTitleBar />

      <!-- 主视图滚动区域 (预留充分的底部悬浮 Tab 避让空间，防止内容被遮挡) -->
      <div class="flex-1 overflow-y-auto px-4 py-3 pb-28 scrollbar-none z-10">
        <!-- 标签页 1: 喝水打卡 -->
        <section v-show="activeTab === 'water'" class="space-y-3 animate-in fade-in duration-150">
          <WaterWave />
          <BeverageSelector />
        </section>

        <!-- 标签页 2: 微健康习惯矩阵 -->
        <section v-show="activeTab === 'habits'" class="animate-in fade-in duration-150">
          <HabitsCardList />
        </section>

        <!-- 标签页 3: 心流专注与工间律动 (新增) -->
        <section v-show="activeTab === 'focus'" class="animate-in fade-in duration-150">
          <FocusView />
        </section>

        <!-- 标签页 4: 趋势分析与明细 -->
        <section v-show="activeTab === 'stats'" class="animate-in fade-in duration-150">
          <StatsView />
        </section>

        <!-- 标签页 4: 偏好设置 -->
        <section v-show="activeTab === 'settings'" class="animate-in fade-in duration-150">
          <SettingsView />
        </section>
      </div>

      <!-- 底部悬浮 iOS 导航栏 -->
      <BottomTabBar />
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useHealthStore } from '@/stores/health'
import AppTitleBar from '@/components/AppTitleBar.vue'
import WaterWave from '@/components/WaterWave.vue'
import BeverageSelector from '@/components/BeverageSelector.vue'
import HabitsCardList from '@/components/HabitsCardList.vue'
import FocusView from '@/components/FocusView.vue'
import StatsView from '@/components/StatsView.vue'
import SettingsView from '@/components/SettingsView.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import MiniWidget from '@/components/MiniWidget.vue'

const store = useHealthStore()

const isMiniMode = computed(() => store.isMiniMode)
const activeTab = computed(() => store.activeTab)

let healthCheckTimer: number | null = null

// 桌面端健康定时轮询与提醒引擎
function setupHealthReminderInterval(): void {
  healthCheckTimer = window.setInterval(() => {
    store.checkDateRollover()

    // 检查免打扰设置
    if (store.settings.dndEnabled) {
      const now = new Date()
      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      if (currentHM >= store.settings.dndStart || currentHM < store.settings.dndEnd) {
        return // 处于免打扰时段，抑制弹窗
      }
    }

    // 检查久坐舒展
    const sedentary = store.habits.find((h) => h.id === 'sedentary' && h.enabled)
    if (sedentary && sedentary.lastRemindTimestamp) {
      const elapsedMinutes = (Date.now() - sedentary.lastRemindTimestamp) / 60000
      if (elapsedMinutes >= (sedentary.intervalMinutes || 60)) {
        sedentary.lastRemindTimestamp = Date.now()
        window.electronAPI?.sendNotification(
          '久坐舒展提醒 🧘',
          '您已连续专注工作超 1 小时，起来喝杯温水、眺望窗外活动一下肩颈吧！'
        )
      }
    }

    // 检查护眼法则
    const eyeRest = store.habits.find((h) => h.id === 'eye_rest' && h.enabled)
    if (eyeRest && eyeRest.lastRemindTimestamp) {
      const elapsedMinutes = (Date.now() - eyeRest.lastRemindTimestamp) / 60000
      if (elapsedMinutes >= (eyeRest.intervalMinutes || 20)) {
        eyeRest.lastRemindTimestamp = Date.now()
        window.electronAPI?.sendNotification(
          '20-20-20 护眼时刻 👁',
          '请将视线从屏幕移开，远眺 6 米外景物 20 秒，让眼睫状肌充分放松。'
        )
      }
    }
  }, 30000)
}

onMounted(async () => {
  // 绿色便携模式：优先读取应用目录下的 data/vitalpulse_data.json
  await store.loadLocalDiskData()

  if (store.settings.theme === 'dark') {
    document.documentElement.classList.add('dark')
  }

  // 监听模式切换与托盘通信
  if (typeof window !== 'undefined') {
    const ipc = (window as unknown as { ipcRenderer?: { on: (event: string, cb: (...args: unknown[]) => void) => void } }).ipcRenderer
    if (ipc) {
      ipc.on('quick-add-water', (_: unknown, amount: unknown) => {
        store.addWaterRecord(Number(amount) || 250, 'pure_water')
      })
      ipc.on('mode-changed', (_: unknown, mode: unknown) => {
        store.isMiniMode = mode === 'mini'
      })
    }
  }

  setupHealthReminderInterval()
})

onUnmounted(() => {
  if (healthCheckTimer !== null) {
    clearInterval(healthCheckTimer)
  }
})
</script>

<style>
/* 隐藏滚动条 */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
