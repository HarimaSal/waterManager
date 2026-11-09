<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
    <div class="w-full max-w-xs bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-200">
      <!-- 顶部关闭与说明 -->
      <div class="w-full flex items-center justify-between mb-3">
        <div class="flex items-center space-x-1.5">
          <Wind class="w-4 h-4 text-sky-500" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">4-7-8 正念深呼吸</span>
        </div>
        <button
          type="button"
          class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          @click="closeModal"
        >
          <X class="w-3.5 h-3.5" :stroke-width="2.5" />
        </button>
      </div>

      <!-- 呼吸动态光环 -->
      <div class="relative w-40 h-40 flex items-center justify-center my-3">
        <!-- 扩散外光晕 -->
        <div
          class="absolute inset-0 rounded-full bg-sky-400/25 filter blur-xl transition-all duration-1000"
          :class="haloScaleClass"
        ></div>

        <!-- 呼吸中心球体 -->
        <div
          class="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-ios-blue shadow-ios-glow-blue flex flex-col items-center justify-center text-white transition-transform duration-1000 ease-in-out"
          :class="circleScaleClass"
        >
          <span class="text-sm font-black">{{ phaseText }}</span>
          <span class="text-xs font-semibold opacity-90 mt-0.5">{{ phaseSecondsLeft }}s</span>
        </div>
      </div>

      <!-- 提示语与指引 -->
      <p class="text-xs text-center font-medium text-slate-500 dark:text-slate-400 mt-2 h-9 flex items-center justify-center px-2">
        {{ phaseInstruction }}
      </p>

      <!-- 底部控制按键 -->
      <div class="w-full flex space-x-2 mt-4">
        <button
          type="button"
          class="flex-1 py-2.5 rounded-full text-xs font-bold bg-ios-blue hover:bg-ios-blue/90 text-white shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-1 cursor-pointer"
          @click="toggleTimer"
        >
          <component :is="isRunning ? Pause : Play" class="w-3.5 h-3.5" :stroke-width="2.5" />
          <span>{{ isRunning ? '暂停呼吸' : '开始练习' }}</span>
        </button>
        <button
          type="button"
          class="px-3.5 py-2.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
          @click="finishSession"
        >
          <Check class="w-3.5 h-3.5 text-ios-green" :stroke-width="2.5" />
          <span>打卡</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Wind, X, Play, Pause, Check } from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useHealthStore()

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale'

const isRunning = ref(false)
const currentPhase = ref<Phase>('ready')
const phaseSecondsLeft = ref(4)
let timerId: number | null = null

const phaseText = computed(() => {
  switch (currentPhase.value) {
    case 'inhale': return '吸气'
    case 'hold': return '屏息'
    case 'exhale': return '呼气'
    default: return '准备'
  }
})

const phaseInstruction = computed(() => {
  switch (currentPhase.value) {
    case 'inhale': return '用鼻子深长吸气，感受腹部隆起 (4秒)'
    case 'hold': return '平稳屏住呼吸，专注当下心神 (7秒)'
    case 'exhale': return '用嘴巴缓慢呼气，完全排空浊气 (8秒)'
    default: return '找个舒适的坐姿，挺直脊背，点击开始'
  }
})

const circleScaleClass = computed(() => {
  if (currentPhase.value === 'inhale') return 'scale-125'
  if (currentPhase.value === 'hold') return 'scale-125 ring-4 ring-white/50'
  if (currentPhase.value === 'exhale') return 'scale-90 opacity-80'
  return 'scale-100'
})

const haloScaleClass = computed(() => {
  if (currentPhase.value === 'inhale' || currentPhase.value === 'hold') return 'scale-150 opacity-60'
  return 'scale-95 opacity-20'
})

function startPhase(phase: Phase, duration: number): void {
  currentPhase.value = phase
  phaseSecondsLeft.value = duration
}

function tick(): void {
  if (phaseSecondsLeft.value > 1) {
    phaseSecondsLeft.value -= 1
  } else {
    if (currentPhase.value === 'inhale') {
      startPhase('hold', 7)
    } else if (currentPhase.value === 'hold') {
      startPhase('exhale', 8)
    } else {
      startPhase('inhale', 4)
    }
  }
}

function toggleTimer(): void {
  if (isRunning.value) {
    stopTimer()
  } else {
    isRunning.value = true
    if (currentPhase.value === 'ready') {
      startPhase('inhale', 4)
    }
    timerId = window.setInterval(tick, 1000)
  }
}

function stopTimer(): void {
  isRunning.value = false
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

function finishSession(): void {
  stopTimer()
  store.incrementHabit('breathing')
  emit('close')
}

function closeModal(): void {
  stopTimer()
  emit('close')
}

onUnmounted(() => {
  stopTimer()
})
</script>
