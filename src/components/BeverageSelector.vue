<template>
  <div class="space-y-3">
    <!-- 标杆竞品 (Apple Health) 灵感：全天 5 大科学黄金补水节律卡片 -->
    <div class="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-3.5 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-1.5">
          <Clock class="w-3.5 h-3.5" :class="store.settings.appMode === 'fitness' ? 'text-amber-500' : 'text-ios-blue'" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">
            {{ store.settings.appMode === 'fitness' ? '围训练期黄金补水节律' : '科学补水时段建议' }}
          </span>
        </div>
        <span class="text-[10px] text-slate-400">已点亮 {{ completedSlotCount }}/5 个时段</span>
      </div>

      <!-- 5 大时段等分网格按钮 (彻底消除横向滚动与截断，点击即刻高亮切换) -->
      <div class="grid grid-cols-5 gap-1.5">
        <button
          v-for="slot in scheduleSlots"
          :key="slot.id"
          type="button"
          class="px-1 py-1.5 rounded-xl border flex flex-col items-center justify-between transition-all duration-200 cursor-pointer active:scale-95"
          :class="[
            selectedSlotId === slot.id
              ? 'bg-ios-blue text-white border-ios-blue shadow-sm ring-2 ring-ios-blue/30 font-bold'
              : isSlotCompleted(slot.id)
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                : isSlotCurrent(slot.id)
                  ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue/40 text-ios-blue dark:text-ios-blue-dark font-semibold'
                  : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-slate-400'
          ]"
          @click="selectSlot(slot)"
        >
          <div class="flex items-center space-x-0.5">
            <span class="text-[10px] tracking-tight leading-none">{{ slot.name }}</span>
            <CheckCircle2 v-if="isSlotCompleted(slot.id)" class="w-2.5 h-2.5 text-emerald-500" :stroke-width="3" />
          </div>
          <span
            class="text-[9px] mt-1 leading-none"
            :class="selectedSlotId === slot.id ? 'text-white/90' : 'opacity-75'"
          >
            {{ slot.suggestedMl }}ml
          </span>
        </button>
      </div>

      <!-- 选定时段的精美解说卡片 (位于按钮正下方，点击时段实时联动切换，告别原生丑陋悬浮框) -->
      <div
        v-if="activeSelectedSlot"
        class="mt-2.5 p-2.5 rounded-xl bg-slate-50/90 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/60 transition-all duration-200"
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center space-x-1.5">
            <span
              class="w-2 h-2 rounded-full"
              :class="isSlotCompleted(activeSelectedSlot.id) ? 'bg-emerald-500' : 'bg-ios-blue'"
            ></span>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ activeSelectedSlot.name }}</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({{ activeSelectedSlot.timeRange }})</span>
          </div>

          <div class="flex items-center space-x-1.5">
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              :class="[
                isSlotCompleted(activeSelectedSlot.id)
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-ios-blue/10 text-ios-blue dark:text-ios-blue-dark border-ios-blue/20'
              ]"
            >
              {{ isSlotCompleted(activeSelectedSlot.id) ? '✓ 已打卡点亮' : `建议 ${activeSelectedSlot.suggestedMl}ml` }}
            </span>
            <button
              v-if="selectedVolume !== activeSelectedSlot.suggestedMl"
              type="button"
              class="text-[10px] text-ios-blue dark:text-ios-blue-dark font-bold hover:underline cursor-pointer px-1"
              @click="applySlotSuggestion(activeSelectedSlot)"
            >
              一键填入
            </button>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {{ activeSelectedSlot.desc }}
        </p>
      </div>
    </div>

    <!-- 饮品与容量主控制面板 -->
    <div class="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
      <!-- 标头与当前选中饮品补水系数 -->
      <div class="flex items-center justify-between mb-2.5">
        <div class="flex items-center space-x-1.5">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">选择饮品类型</span>
          <button
            type="button"
            class="text-[10px] text-ios-blue hover:underline cursor-pointer ml-1"
            title="去设置页管理饮品与系数"
            @click="store.activeTab = 'settings'"
          >
            [管理]
          </button>
        </div>
        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ios-blue/10 dark:bg-ios-blue-dark/20 text-ios-blue dark:text-ios-blue-dark border border-ios-blue/20">
          有效补水率 {{ Math.round(selectedBeverage.hydrationFactor * 100) }}%
        </span>
      </div>

      <!-- 饮品自适应网格选择器 (彻底解决右侧遮挡截断，4列网格随饮品数量自适应换行) -->
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="item in beverages"
          :key="item.id"
          type="button"
          class="flex items-center justify-center space-x-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer border"
          :class="[
            selectedBeverageId === item.id
              ? 'bg-ios-blue text-white border-ios-blue shadow-sm ring-1 ring-ios-blue/40'
              : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          ]"
          @click="selectedBeverageId = item.id"
        >
          <component :is="getBeverageIcon(item.id)" class="w-3.5 h-3.5 flex-shrink-0" :stroke-width="2" />
          <span class="truncate">{{ item.name.split(' ')[0] }}</span>
        </button>
      </div>

      <!-- Waterllama 拟物杯型容器与快捷容量预设 -->
      <div class="grid grid-cols-5 gap-1.5 my-3">
        <button
          v-for="(vol, idx) in presetVolumes"
          :key="vol"
          type="button"
          class="py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer border"
          :class="[
            selectedVolume === vol && !isCustomVolumeMode
              ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue dark:border-ios-blue-dark text-ios-blue dark:text-ios-blue-dark shadow-sm'
              : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200/50 dark:border-zinc-700/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          ]"
          @click="handleSelectPreset(vol)"
        >
          <component :is="getContainerIcon(idx)" class="w-3.5 h-3.5 mb-0.5 opacity-80" :stroke-width="2" />
          <span class="text-xs">+{{ vol }}</span>
          <span class="text-[9px] opacity-70 font-normal">ml</span>
        </button>

        <!-- 自定义容量触发按钮 -->
        <button
          type="button"
          class="py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer border"
          :class="[
            isCustomVolumeMode
              ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue dark:border-ios-blue-dark text-ios-blue dark:text-ios-blue-dark shadow-sm'
              : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200/50 dark:border-zinc-700/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          ]"
          @click="showCustomModal = true"
        >
          <Sliders class="w-3.5 h-3.5 mb-0.5 opacity-80" :stroke-width="2" />
          <span class="text-xs">{{ isCustomVolumeMode ? selectedVolume : '自定义' }}</span>
          <span class="text-[9px] opacity-70 font-normal">ml</span>
        </button>
      </div>

      <!-- Waterllama 灵感：补记时间选择器 (Backdating) -->
      <div class="flex items-center justify-between px-1 py-1.5 mb-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-zinc-800">
        <span class="font-medium">饮用时间点:</span>
        <div class="flex items-center space-x-1">
          <button
            v-for="timeOption in timeOptions"
            :key="timeOption.label"
            type="button"
            class="px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer"
            :class="[
              selectedTimeOffset === timeOption.offsetMinutes
                ? 'bg-ios-blue text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-700'
            ]"
            @click="selectedTimeOffset = timeOption.offsetMinutes"
          >
            {{ timeOption.label }}
          </button>
        </div>
      </div>

      <!-- 确认一键记录按钮 -->
      <button
        type="button"
        class="w-full mt-1 py-3 rounded-full bg-ios-blue hover:bg-ios-blue/95 text-white font-bold text-xs tracking-wide shadow-ios-float active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer"
        @click="handleAddWater"
      >
        <Plus class="w-4 h-4" :stroke-width="2.5" />
        <span>打卡记录 +{{ selectedVolume }}ml {{ selectedBeverage.name.split(' ')[0] }}</span>
        <span class="text-[11px] opacity-80 font-normal">(净补水 {{ effectivePreview }}ml)</span>
      </button>

      <!-- 自定义毫升数弹窗 (Modal) -->
      <div
        v-if="showCustomModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      >
        <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100">输入自定义饮水容量</span>
            <button
              type="button"
              class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              @click="showCustomModal = false"
            >
              ✕
            </button>
          </div>

          <div class="my-4 flex flex-col items-center">
            <div class="flex items-baseline space-x-1">
              <span class="text-3xl font-black text-ios-blue dark:text-ios-blue-dark">{{ tempVolume }}</span>
              <span class="text-sm font-semibold text-slate-400">ml</span>
            </div>

            <input
              type="range"
              min="30"
              max="1500"
              step="10"
              v-model.number="tempVolume"
              class="w-full mt-4 accent-ios-blue cursor-pointer"
            />

            <div class="flex items-center space-x-2 mt-3">
              <button
                v-for="delta in [-100, -20, +20, +100]"
                :key="delta"
                type="button"
                class="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                @click="tempVolume = Math.max(30, Math.min(2500, tempVolume + delta))"
              >
                {{ delta > 0 ? '+' + delta : delta }}
              </button>
            </div>
          </div>

          <div class="flex space-x-2 mt-4">
            <button
              type="button"
              class="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              @click="showCustomModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="flex-1 py-2 rounded-xl text-xs font-bold bg-ios-blue text-white shadow-sm cursor-pointer"
              @click="applyCustomVolume"
            >
              确认使用
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import {
  Droplet,
  Leaf,
  Coffee,
  Milk,
  Sparkles,
  Zap,
  GlassWater,
  Plus,
  Sliders,
  Clock,
  CheckCircle2,
  CupSoda,
  Dumbbell,
  Flame
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import { calculateEffectiveWater } from '@/utils/calculator'
import type { HydrationScheduleSlot } from '@/types'

const store = useHealthStore()

const beverages = computed(() => store.enabledBeverages)
const presetVolumes = computed(() => store.settings.presetVolumes)
const scheduleSlots = computed(() => store.scheduleSlots)

const selectedBeverageId = ref<string>('pure_water')
const selectedVolume = ref<number>(250)
const isCustomVolumeMode = ref<boolean>(false)

// 当前选中的补水时段 (默认指向当前系统时刻对应的时段)
const selectedSlotId = ref<string>(store.currentScheduleSlot?.id || 'morning_wake')

// 模式切换时自动同步时段选择
watch(
  () => store.scheduleSlots,
  (newSlots) => {
    if (newSlots && newSlots.length > 0) {
      if (!newSlots.some((s) => s.id === selectedSlotId.value)) {
        selectedSlotId.value = newSlots[0].id
        selectedVolume.value = newSlots[0].suggestedMl
      }
    }
  }
)

const activeSelectedSlot = computed<HydrationScheduleSlot>(() => {
  return (
    scheduleSlots.value.find((s) => s.id === selectedSlotId.value) ||
    scheduleSlots.value[0]
  )
})

const showCustomModal = ref<boolean>(false)
const tempVolume = ref<number>(250)

// 补记时间选项
const selectedTimeOffset = ref<number>(0)
const timeOptions = [
  { label: '刚刚', offsetMinutes: 0 },
  { label: '30分钟前', offsetMinutes: 30 },
  { label: '1小时前', offsetMinutes: 60 }
]

const selectedBeverage = computed(() => {
  return (
    beverages.value.find((b) => b.id === selectedBeverageId.value) ||
    beverages.value[0] ||
    store.beverages[0]
  )
})

const effectivePreview = computed(() => {
  return calculateEffectiveWater(selectedVolume.value, selectedBeverage.value.hydrationFactor)
})

const completedSlotCount = computed(() => {
  return store.completedSlotIds.length
})

function isSlotCompleted(slotId: string): boolean {
  return store.completedSlotIds.includes(slotId)
}

function isSlotCurrent(slotId: string): boolean {
  return store.currentScheduleSlot?.id === slotId
}

// 点击时段卡片：联动切换选中时段与对应建议饮水量
function selectSlot(slot: HydrationScheduleSlot): void {
  selectedSlotId.value = slot.id
  selectedVolume.value = slot.suggestedMl
  isCustomVolumeMode.value = false
}

function applySlotSuggestion(slot: HydrationScheduleSlot): void {
  selectedSlotId.value = slot.id
  selectedVolume.value = slot.suggestedMl
  isCustomVolumeMode.value = false
}

function handleSelectPreset(vol: number): void {
  selectedVolume.value = vol
  isCustomVolumeMode.value = false
}

function applyCustomVolume(): void {
  selectedVolume.value = tempVolume.value
  isCustomVolumeMode.value = true
  showCustomModal.value = false
}

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

// 拟物容器杯型
function getContainerIcon(idx: number): Component {
  switch (idx) {
    case 0: return Coffee // 浓缩/小杯
    case 1: return GlassWater // 玻璃杯
    case 2: return CupSoda // 马克杯
    default: return Droplet // 保温壶
  }
}

function handleAddWater(): void {
  const customTimestamp =
    selectedTimeOffset.value > 0 ? Date.now() - selectedTimeOffset.value * 60 * 1000 : undefined
  const timeNote = selectedTimeOffset.value > 0 ? `${selectedTimeOffset.value}分钟前` : undefined

  store.addWaterRecord(selectedVolume.value, selectedBeverageId.value, customTimestamp, timeNote)
  selectedTimeOffset.value = 0 // 重置为刚刚
}
</script>
