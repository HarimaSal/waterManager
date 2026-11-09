<template>
  <div class="relative w-full h-full flex items-center justify-between">
    <!-- 左栏：快捷容量（单击即打卡）+ 自定义毫升 -->
    <div class="flex flex-col space-y-1 shrink-0 h-full max-h-[calc(100vw-190px)] self-center justify-center">
      <button
        v-for="vol in presetVolumes"
        :key="vol"
        type="button"
        class="group/rail relative hover:z-40 w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-slate-200/70 dark:border-zinc-700/70 text-slate-700 dark:text-slate-200 shadow-xs"
        @click="commit(vol)"
      >
        <span class="text-[10px] font-black leading-none">+{{ vol }}</span>
        <span class="text-[7px] leading-none mt-0.5 opacity-60">ml</span>

        <!-- 悬浮提示：补水容量 -->
        <span class="pointer-events-none absolute left-full top-1/2 z-40 ml-2 -translate-y-1/2 rounded-xl border border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-2.5 py-1.5 shadow-[0_10px_28px_-8px_rgba(15,23,42,0.3)] opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100">
          <span class="block text-[10px] font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">+{{ vol }} ml 补水</span>
          <span class="block text-[9px] font-bold text-ios-blue dark:text-ios-blue-dark whitespace-nowrap">
            {{ selectedBeverage.name.split(' ')[0] }} · 净补水
            {{ calculateEffectiveWater(vol, selectedBeverage.hydrationFactor) }} ml
          </span>
        </span>
      </button>

      <button
        type="button"
        class="group/rail relative hover:z-40 w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border border-dashed border-slate-300 dark:border-zinc-600 flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer bg-white/60 dark:bg-zinc-900/60 text-slate-500 dark:text-slate-400"
        @click="openCustom(presetVolumes[1] || presetVolumes[0] || 250)"
      >
        <Sliders class="w-3 h-3" :stroke-width="2.2" />
        <span class="text-[7px] leading-none mt-0.5">自定义</span>

        <!-- 悬浮提示：自定义 -->
        <span class="pointer-events-none absolute left-full top-1/2 z-40 ml-2 -translate-y-1/2 rounded-xl border border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-2.5 py-1.5 shadow-[0_10px_28px_-8px_rgba(15,23,42,0.3)] opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100">
          <span class="block text-[10px] font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">自定义毫升</span>
          <span class="block text-[9px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">支持补记饮用时间点</span>
        </span>
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
        class="group/rail relative hover:z-40 w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer"
        :class="[
          selectedBeverageId === item.id
            ? 'bg-ios-blue text-white border-ios-blue shadow-sm'
            : 'bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-slate-200/70 dark:border-zinc-700/70 text-slate-600 dark:text-slate-300'
        ]"
        @click="selectedBeverageId = item.id"
      >
        <component :is="getBeverageIcon(item.id)" class="w-3 h-3" :stroke-width="2" />
        <span class="text-[7px] leading-none mt-0.5">{{ item.name.split(' ')[0] }}</span>

        <!-- 悬浮提示：饮品分类 -->
        <span class="pointer-events-none absolute right-full top-1/2 z-40 mr-2 -translate-y-1/2 rounded-xl border border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-2.5 py-1.5 shadow-[0_10px_28px_-8px_rgba(15,23,42,0.3)] opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100">
          <span class="block text-[10px] font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">{{ item.name }}</span>
          <span class="block text-[9px] font-bold text-ios-blue dark:text-ios-blue-dark whitespace-nowrap">
            有效补水 {{ Math.round(item.hydrationFactor * 100) }}%
          </span>
        </span>
      </button>

      <button
        type="button"
        class="group/rail relative hover:z-40 w-10 flex-1 min-h-[28px] max-h-[54px] rounded-lg border border-dashed border-slate-300 dark:border-zinc-600 flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer bg-white/60 dark:bg-zinc-900/60 text-slate-500 dark:text-slate-400"
        @click="showMore = true"
      >
        <MoreHorizontal class="w-3 h-3" :stroke-width="2.4" />
        <span class="text-[7px] leading-none mt-0.5">更多</span>

        <!-- 悬浮提示：更多饮品 -->
        <span class="pointer-events-none absolute right-full top-1/2 z-40 mr-2 -translate-y-1/2 rounded-xl border border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-2.5 py-1.5 shadow-[0_10px_28px_-8px_rgba(15,23,42,0.3)] opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100">
          <span class="block text-[10px] font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">更多饮品</span>
          <span class="block text-[9px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">查看全部饮品与补水系数</span>
        </span>
      </button>
    </div>

    <!-- 补水成功浮条：玻璃卡片 + 3 秒倒计时撤销 -->
    <div
      v-if="toast"
      :key="toast.recordId"
      class="hydrate-toast absolute left-1/2 bottom-0 z-50 overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-[0_12px_32px_-10px_rgba(15,23,42,0.35)]"
    >
      <div class="flex items-center space-x-2 py-1 pl-2 pr-1.5">
        <span class="w-6 h-6 shrink-0 rounded-full bg-ios-blue/10 dark:bg-ios-blue-dark/20 text-ios-blue dark:text-ios-blue-dark flex items-center justify-center">
          <Droplet class="w-3.5 h-3.5" :stroke-width="2.4" />
        </span>
        <span class="text-[11px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
          {{ toast.text }}
        </span>
        <button
          type="button"
          class="ml-0.5 shrink-0 whitespace-nowrap px-2.5 py-1 rounded-xl bg-ios-blue hover:bg-ios-blue/90 text-white text-[10px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
          @click="handleUndo"
        >
          撤销
        </button>
      </div>
      <div class="h-0.5 bg-ios-blue/15 dark:bg-ios-blue-dark/20">
        <div class="hydrate-toast__bar h-full bg-gradient-to-r from-ios-blue to-cyan-400"></div>
      </div>
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
