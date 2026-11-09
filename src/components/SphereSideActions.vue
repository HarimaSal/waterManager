<template>
  <div class="w-full h-full flex items-center justify-between">
    <!-- 左栏：快捷容量（单击即打卡）+ 自定义毫升 -->
    <div class="flex flex-col space-y-1 shrink-0 h-full max-h-[calc(100vw-190px)] self-center justify-center">
      <button
        v-for="vol in presetVolumes"
        :key="vol"
        type="button"
        class="w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-slate-200/70 dark:border-zinc-700/70 text-slate-700 dark:text-slate-200 shadow-xs"
        :title="`记录 ${vol}ml ${selectedBeverage.name.split(' ')[0]}`"
        @click="commit(vol)"
      >
        <span class="text-[10px] font-black leading-none">+{{ vol }}</span>
        <span class="text-[7px] leading-none mt-0.5 opacity-60">ml</span>
      </button>

      <button
        type="button"
        class="w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border border-dashed border-slate-300 dark:border-zinc-600 flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer bg-white/60 dark:bg-zinc-900/60 text-slate-500 dark:text-slate-400"
        title="自定义毫升数与补记时间"
        @click="openCustom(presetVolumes[1] || presetVolumes[0] || 250)"
      >
        <Sliders class="w-3 h-3" :stroke-width="2.2" />
        <span class="text-[7px] leading-none mt-0.5">自定义</span>
      </button>
    </div>

    <!-- 圆球 -->
    <slot />

    <!-- 右栏：饮品快捷切换 + 更多饮品 -->
    <div class="flex flex-col space-y-1 shrink-0 h-full max-h-[calc(100vw-190px)] self-center justify-center">
      <button
        v-for="item in railBeverages"
        :key="item.id"
        type="button"
        class="w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer"
        :class="[
          selectedBeverageId === item.id
            ? 'bg-ios-blue text-white border-ios-blue shadow-sm'
            : 'bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-slate-200/70 dark:border-zinc-700/70 text-slate-600 dark:text-slate-300'
        ]"
        :title="`${item.name} · 有效补水 ${Math.round(item.hydrationFactor * 100)}%`"
        @click="selectedBeverageId = item.id"
      >
        <component :is="getBeverageIcon(item.id)" class="w-3 h-3" :stroke-width="2" />
        <span class="text-[7px] leading-none mt-0.5">{{ item.name.split(' ')[0] }}</span>
      </button>

      <button
        type="button"
        class="w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border border-dashed border-slate-300 dark:border-zinc-600 flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer bg-white/60 dark:bg-zinc-900/60 text-slate-500 dark:text-slate-400"
        title="展开全部饮品"
        @click="showMore = true"
      >
        <MoreHorizontal class="w-3 h-3" :stroke-width="2.4" />
        <span class="text-[7px] leading-none mt-0.5">更多</span>
      </button>
    </div>

    <!-- 撤销轻提示 -->
    <div
      v-if="toast"
      class="fixed bottom-[86px] left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2.5 pl-3.5 pr-2 py-1.5 rounded-full bg-slate-900/90 text-white shadow-xl"
    >
      <span class="text-[11px] font-semibold whitespace-nowrap">{{ toast.text }}</span>
      <button
        type="button"
        class="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-bold cursor-pointer transition-colors"
        @click="handleUndo"
      >
        撤销
      </button>
    </div>

    <!-- 全部饮品选择面板 -->
    <div
      v-if="showMore"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      @click.self="showMore = false"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-2xl border border-white/40 dark:border-white/10 select-none">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">选择饮品</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showMore = false"
          >
            ✕
          </button>
        </div>

        <div class="max-h-[52vh] overflow-y-auto scrollbar-none space-y-1 pr-0.5">
          <button
            v-for="item in beverages"
            :key="item.id"
            type="button"
            class="w-full p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2"
            :class="[
              selectedBeverageId === item.id
                ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue text-ios-blue dark:text-ios-blue-dark font-bold'
                : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-slate-300'
            ]"
            @click="selectBeverage(item.id)"
          >
            <component :is="getBeverageIcon(item.id)" class="w-4 h-4 shrink-0" :stroke-width="2" />
            <span class="text-xs flex-1 min-w-0 truncate">{{ item.name }}</span>
            <span class="text-[10px] font-semibold shrink-0 opacity-70">
              有效 {{ Math.round(item.hydrationFactor * 100) }}%
            </span>
          </button>
        </div>

        <button
          type="button"
          class="w-full mt-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          @click="goSettings"
        >
          去设置管理饮品与系数
        </button>
      </div>
    </div>

    <!-- 自定义毫升与补记时间 -->
    <div
      v-if="showCustom"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      @click.self="showCustom = false"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">自定义补水</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showCustom = false"
          >
            ✕
          </button>
        </div>

        <div class="my-3 flex flex-col items-center">
          <div class="flex items-baseline space-x-1">
            <span class="text-3xl font-black text-ios-blue dark:text-ios-blue-dark">{{ customVolume }}</span>
            <span class="text-sm font-semibold text-slate-400">ml</span>
          </div>

          <input
            type="range"
            min="30"
            max="1500"
            step="10"
            v-model.number="customVolume"
            class="w-full mt-4 accent-ios-blue cursor-pointer"
          />

          <div class="flex items-center space-x-2 mt-3">
            <button
              v-for="delta in [-100, -20, 20, 100]"
              :key="delta"
              type="button"
              class="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              @click="customVolume = Math.max(30, Math.min(1500, customVolume + delta))"
            >
              {{ delta > 0 ? '+' + delta : delta }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between px-1 py-1.5 text-[11px] text-slate-500 border-t border-slate-100 dark:border-zinc-800">
          <span class="font-medium">饮用时间点:</span>
          <div class="flex items-center space-x-1">
            <button
              v-for="timeOption in timeOptions"
              :key="timeOption.offsetMinutes"
              type="button"
              class="px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer"
              :class="[
                customOffset === timeOption.offsetMinutes
                  ? 'bg-ios-blue text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-700'
              ]"
              @click="customOffset = timeOption.offsetMinutes"
            >
              {{ timeOption.label }}
            </button>
          </div>
        </div>

        <div class="flex space-x-2 mt-3">
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            @click="showCustom = false"
          >
            取消
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-ios-blue text-white shadow-sm cursor-pointer"
            @click="commit(customVolume, customOffset)"
          >
            记录 +{{ customVolume }}ml
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, type Component } from 'vue'
import {
  Droplet,
  Leaf,
  Coffee,
  Milk,
  Sparkles,
  Zap,
  GlassWater,
  Dumbbell,
  Flame,
  Sliders,
  MoreHorizontal
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import { calculateEffectiveWater } from '@/utils/calculator'

const store = useHealthStore()

const presetVolumes = computed(() => store.settings.presetVolumes)
const beverages = computed(() => store.enabledBeverages)

const selectedBeverageId = ref<string>('pure_water')
const selectedBeverage = computed(() => {
  return (
    beverages.value.find((b) => b.id === selectedBeverageId.value) ||
    beverages.value[0] ||
    store.beverages[0]
  )
})

// 右栏快捷位：前三个常用饮品 + 当前选中饮品（在「更多」里选择后也能回显）
const railBeverages = computed(() => {
  const current = selectedBeverage.value
  const head = beverages.value.slice(0, 3)
  if (head.some((b) => b.id === current.id)) return beverages.value.slice(0, 4)
  return [...head, current]
})

const timeOptions = [
  { label: '刚刚', offsetMinutes: 0 },
  { label: '30分钟前', offsetMinutes: 30 },
  { label: '1小时前', offsetMinutes: 60 }
]

function getBeverageIcon(id: string): Component {
  switch (id) {
    case 'green_tea': return Leaf
    case 'black_coffee': return Coffee
    case 'latte': return Milk
    case 'sparkling_water': return Sparkles
    case 'electrolyte': return Zap
    case 'juice_soda': return GlassWater
    case 'whey_protein': return Dumbbell
    case 'bcaa_eaa': return Zap
    case 'pre_workout': return Flame
    default: return Droplet
  }
}

// 撤销轻提示
const toast = ref<{ recordId: string; text: string } | null>(null)
let toastTimer: number | null = null

function showToast(recordId: string, text: string): void {
  if (toastTimer !== null) clearTimeout(toastTimer)
  toast.value = { recordId, text }
  toastTimer = window.setTimeout(() => {
    toast.value = null
    toastTimer = null
  }, 3000)
}

function handleUndo(): void {
  if (toast.value) store.removeWaterRecord(toast.value.recordId)
  if (toastTimer !== null) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toast.value = null
}

function commit(volume: number, offsetMinutes = 0): void {
  const beverage = selectedBeverage.value
  const customTimestamp = offsetMinutes > 0 ? Date.now() - offsetMinutes * 60 * 1000 : undefined
  const recordId = store.addWaterRecord(
    volume,
    beverage.id,
    customTimestamp,
    offsetMinutes > 0 ? `${offsetMinutes} 分钟前` : undefined
  )
  const netMl = calculateEffectiveWater(volume, beverage.hydrationFactor)
  showToast(recordId, `已记录 ${volume}ml ${beverage.name.split(' ')[0]} · 净补水 ${netMl}ml`)
  showCustom.value = false
}

const showCustom = ref(false)
const customVolume = ref(250)
const customOffset = ref(0)

function openCustom(vol: number): void {
  customVolume.value = vol
  customOffset.value = 0
  showCustom.value = true
}

const showMore = ref(false)

function selectBeverage(id: string): void {
  selectedBeverageId.value = id
  showMore.value = false
}

function goSettings(): void {
  showMore.value = false
  store.activeTab = 'settings'
}

onUnmounted(() => {
  if (toastTimer !== null) clearTimeout(toastTimer)
})
</script>
