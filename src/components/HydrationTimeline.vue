<template>
  <div class="relative w-full shrink-0 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl rounded-xl px-2 py-1 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
    <div class="flex items-center space-x-1.5">
      <Clock class="w-3 h-3 shrink-0" :class="isFitness ? 'text-amber-500' : 'text-ios-blue'" :stroke-width="2.2" />

      <!-- 5 大时段单行等分：单击仅高亮查看建议，补水由圆球两侧按钮完成 -->
      <div class="flex-1 min-w-0 grid grid-cols-5 gap-1.5">
        <button
          v-for="slot in scheduleSlots"
          :key="slot.id"
          type="button"
          class="py-1.5 rounded-lg border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer active:scale-95"
          :class="[
            selectedSlotId === slot.id
              ? 'bg-ios-blue text-white border-ios-blue shadow-sm ring-1 ring-ios-blue/25 font-bold'
              : isSlotCompleted(slot.id)
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                : isSlotCurrent(slot.id)
                  ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue/40 text-ios-blue dark:text-ios-blue-dark font-semibold'
                  : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-slate-400'
          ]"
          :aria-label="`${slot.name} ${slot.timeRange}，建议 ${slot.suggestedMl} 毫升`"
          @click="selectedSlotId = slot.id"
          @mouseenter="hoveredSlot = slot"
          @mouseleave="hoveredSlot = null"
          @focus="hoveredSlot = slot"
          @blur="hoveredSlot = null"
        >
          <span class="text-[10px] tracking-tight leading-none truncate max-w-full">{{ slot.name }}</span>
          <span
            class="text-[8px] mt-1 leading-none whitespace-nowrap"
            :class="selectedSlotId === slot.id ? 'text-white/90' : 'opacity-70'"
          >
            {{ compactRange(slot.timeRange) }}
          </span>
          <span
            class="text-[9px] mt-0.5 leading-none"
            :class="selectedSlotId === slot.id ? 'text-white/90' : 'opacity-70'"
          >
            {{ slot.suggestedMl }}ml
          </span>
        </button>
      </div>

      <span class="text-[9px] font-bold text-slate-400 shrink-0 whitespace-nowrap">
        {{ completedSlotCount }}/5
      </span>
    </div>

    <!-- 选中时段的科学补水提示 -->
    <p class="mt-1.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400 truncate">
      <span
        class="font-bold mr-1"
        :class="isSlotCompleted(activeSlot.id) ? 'text-emerald-600 dark:text-emerald-400' : 'text-ios-blue dark:text-ios-blue-dark'"
      >
        {{ isSlotCompleted(activeSlot.id) ? '✓ 已打卡' : activeSlot.name }}
      </span>
      {{ activeSlot.desc }}
    </p>

    <!-- 时段悬浮提示：统一渲染在时段条上方，避免贴边溢出 -->
    <div v-if="hoveredSlot" class="slot-tip pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-52">
      <div class="relative rounded-xl border border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-[0_10px_28px_-8px_rgba(15,23,42,0.3)] px-3 py-2">
        <div class="flex items-center justify-between space-x-2">
          <span class="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">
            {{ hoveredSlot.name }}
          </span>
          <span class="text-[9px] font-mono font-bold text-slate-400 shrink-0">
            {{ compactRange(hoveredSlot.timeRange) }}
          </span>
        </div>
        <div class="mt-1.5 flex items-center space-x-1">
          <Droplet class="w-3 h-3 shrink-0 text-ios-blue dark:text-ios-blue-dark" :stroke-width="2.4" />
          <span class="text-[10px] font-bold text-ios-blue dark:text-ios-blue-dark">
            建议补水 {{ hoveredSlot.suggestedMl }} ml
          </span>
        </div>
        <p class="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
          {{ hoveredSlot.desc }}
        </p>
        <span
          class="absolute left-1/2 -bottom-[5px] w-2.5 h-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-white/95 dark:bg-zinc-900/95 border-r border-b border-black/[0.06] dark:border-white/10"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Clock, Droplet } from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import type { HydrationScheduleSlot } from '@/types'

const store = useHealthStore()

const isFitness = computed(() => store.settings.appMode === 'fitness')
const scheduleSlots = computed(() => store.scheduleSlots)
const completedSlotCount = computed(() => store.completedSlotIds.length)

const selectedSlotId = ref<string>(store.currentScheduleSlot?.id || 'morning_wake')

// 模式切换后时段集合可能变化，重置到首个时段避免高亮丢失
watch(scheduleSlots, (slots) => {
  if (slots.length > 0 && !slots.some((s) => s.id === selectedSlotId.value)) {
    selectedSlotId.value = slots[0].id
  }
})

const activeSlot = computed<HydrationScheduleSlot>(() => {
  return scheduleSlots.value.find((s) => s.id === selectedSlotId.value) || scheduleSlots.value[0]
})

// 悬停/聚焦的时段，用于展示自绘提示气泡
const hoveredSlot = ref<HydrationScheduleSlot | null>(null)

// 08:00 - 09:30 → 08:00-09:30，窄格子内显示更省空间
function compactRange(range: string): string {
  return range.replace(/\s/g, '')
}

function isSlotCompleted(slotId: string): boolean {
  return store.completedSlotIds.includes(slotId)
}

function isSlotCurrent(slotId: string): boolean {
  return store.currentScheduleSlot?.id === slotId
}
</script>
