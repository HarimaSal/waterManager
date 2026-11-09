<template>
  <nav class="fixed bottom-3 inset-x-4 h-14 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl rounded-2xl shadow-ios-float border border-white/60 dark:border-white/10 flex items-center justify-around px-2 z-40 select-none">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
      :class="[
        activeTab === tab.id
          ? 'text-ios-blue dark:text-ios-blue-dark font-bold bg-ios-blue/10 dark:bg-ios-blue-dark/20'
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
      ]"
      @click="store.activeTab = tab.id"
    >
      <component :is="tab.icon" class="w-5 h-5" :stroke-width="activeTab === tab.id ? 2.3 : 1.8" />
      <span class="text-[10px] mt-0.5 leading-tight">{{ tab.name }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Droplets, HeartPulse, Timer, BarChart3, Settings2 } from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'

const store = useHealthStore()
const activeTab = computed(() => store.activeTab)

const tabs = [
  { id: 'water' as const, name: '喝水', icon: Droplets },
  { id: 'habits' as const, name: '习惯', icon: HeartPulse },
  { id: 'focus' as const, name: '专注', icon: Timer },
  { id: 'stats' as const, name: '统计', icon: BarChart3 },
  { id: 'settings' as const, name: '设置', icon: Settings2 }
]
</script>
