<template>
  <div class="relative flex-1 min-h-0 w-full flex flex-col items-center py-1 select-none">
    <!-- 植物保姆 / Tamagotchi 灵感：水滴精灵微景观常驻首页 -->
    <WaterCompanion
      v-if="store.settings.enableCompanion !== false"
      class="w-full flex-[1000_1_0%] min-h-[254px] max-h-[318px]"
    />

    <!-- 弹性间距：让各图块在页面内均匀分布，避免上下大片留白 -->
    <div class="flex-1 min-h-[12px]"></div>

    <!-- 核心区：左侧快捷容量 / 水球 / 右侧饮品切换（水球按可用高度自适应，宽度受两侧按钮约束） -->
    <div class="flex-[1000_1_0%] min-h-[150px] max-h-[calc(100vw-190px)] w-full flex items-center justify-center">
      <SphereSideActions>
        <div class="relative h-full aspect-square shrink-0 flex items-center justify-center">
          <!-- 柔和呼吸背光 -->
          <div
            class="absolute inset-2 rounded-full filter blur-xl opacity-40 transition-colors duration-700"
            :class="progressGlowClass"
          ></div>

          <!-- 仿生拟态水球画布 (按 devicePixelRatio 取真实像素，避免放大发虚) -->
          <canvas
            ref="canvasRef"
            width="156"
            height="156"
            class="relative w-full h-full rounded-full shadow-ios-float ring-4 ring-white/70 dark:ring-white/10"
          ></canvas>

          <!-- 中心数值覆盖层 -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-4xl font-black tracking-tight drop-shadow-sm text-slate-800 dark:text-white">
              {{ progressPercent }}<span class="text-xl font-semibold ml-0.5">%</span>
            </span>
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 drop-shadow-sm">
              {{ totalWater }} / {{ goalWater }} ml
            </span>
          </div>
        </div>
      </SphereSideActions>
    </div>

    <div class="flex-1 min-h-[12px]"></div>

    <!-- 底部状态轻提示 -->
    <div class="shrink-0 text-center w-full">
      <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
        <Droplets class="w-3 h-3 shrink-0 text-ios-blue dark:text-ios-blue-dark" :stroke-width="2.2" />
        <span class="truncate">{{ statusBadgeText }}</span>
      </p>
    </div>

    <!-- 健身模式：今日训练负荷一键切换与补剂补偿状态 -->
    <div
      v-if="store.settings.appMode === 'fitness'"
      class="mt-0.5 shrink-0 w-full max-w-sm px-2 flex flex-col items-center animate-in fade-in duration-200"
    >
      <div class="flex items-center space-x-0.5 p-0.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-[10px]">
        <span class="font-bold text-amber-600 dark:text-amber-400 px-1 flex items-center space-x-0.5">
          <Flame class="w-3 h-3" :stroke-width="2.5" />
          <span>训练计划:</span>
        </span>
        <button
          v-for="opt in intensityOptions"
          :key="opt.value"
          type="button"
          class="px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer"
          :class="[
            currentIntensity === opt.value
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
          ]"
          @click="store.setTrainingIntensity(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- 补剂额外水合状态提示 -->
      <div
        v-if="store.settings.isTakingCreatine || store.settings.isHighProteinDiet"
        class="flex items-center space-x-1.5 mt-1 text-[9px] text-slate-400 dark:text-slate-500"
      >
        <span v-if="store.settings.isTakingCreatine" class="px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/20">
          ⚡ 肌酸水合 +500ml
        </span>
        <span v-if="store.settings.isHighProteinDiet" class="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
          🥩 高蛋白补偿 +300ml
        </span>
      </div>
    </div>

    <div class="flex-1 min-h-[12px]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Droplets, Flame } from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import WaterCompanion from '@/components/WaterCompanion.vue'
import SphereSideActions from '@/components/SphereSideActions.vue'
import type { TrainingIntensity } from '@/types'

const store = useHealthStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null
let waveOffset = 0

const intensityOptions: { label: string; value: TrainingIntensity }[] = [
  { label: '休息日', value: 'rest' },
  { label: '轻度(+300)', value: 'light' },
  { label: '力量(+600)', value: 'moderate' },
  { label: '高强(+1000)', value: 'intense' }
]
const currentIntensity = computed(() => store.settings.trainingIntensity || 'moderate')

const progressPercent = computed(() => store.progressPercent)
const totalWater = computed(() => store.totalEffectiveWaterMl)
const goalWater = computed(() => store.dailyGoalMl)

// 随进度变化的光晕等级
const progressGlowClass = computed(() => {
  if (store.isGoalAchieved) return 'bg-ios-green dark:bg-ios-green-dark'
  if (store.progressPercent >= 50) return 'bg-ios-blue dark:bg-ios-blue-dark'
  return 'bg-ios-teal dark:bg-ios-teal-dark'
})

const statusBadgeText = computed(() => {
  if (store.isGoalAchieved) return '今日饮水目标已圆满达成！'
  if (store.lastDrinkTime) return `上次饮水: ${store.lastDrinkTime} · 保持节律`
  return '今天还没有饮水记录，先喝一杯温水吧'
})

// 双谐波物理水波渲染
function drawWave(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 统一在 208 逻辑坐标系绘制，按设备像素比缩放，避免画布放大后发虚
  const scale = canvas.width / 208
  ctx.setTransform(scale, 0, 0, scale, 0, 0)

  const width = 208
  const height = 208
  const radius = width / 2

  ctx.clearRect(0, 0, width, height)

  ctx.save()
  ctx.beginPath()
  ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  const isDark = document.documentElement.classList.contains('dark')
  ctx.fillStyle = isDark ? '#18181B' : '#F1F5F9'
  ctx.fillRect(0, 0, width, height)

  const currentRatio = Math.min(1.0, Math.max(0.04, store.progressPercent / 100))
  const waterLevelY = height * (1 - currentRatio)

  waveOffset += 0.035

  // 后层水波
  ctx.beginPath()
  ctx.moveTo(0, height)
  for (let x = 0; x <= width; x += 4) {
    const y = waterLevelY + Math.sin(x * 0.035 + waveOffset) * 6
    ctx.lineTo(x, y)
  }
  ctx.lineTo(width, height)
  ctx.closePath()

  const backGrad = ctx.createLinearGradient(0, waterLevelY, 0, height)
  backGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)')
  backGrad.addColorStop(1, 'rgba(2, 132, 199, 0.65)')
  ctx.fillStyle = backGrad
  ctx.fill()

  // 前层主波
  ctx.beginPath()
  ctx.moveTo(0, height)
  for (let x = 0; x <= width; x += 4) {
    const y = waterLevelY + Math.sin(x * 0.04 - waveOffset * 1.2 + Math.PI / 2) * 5
    ctx.lineTo(x, y)
  }
  ctx.lineTo(width, height)
  ctx.closePath()

  const frontGrad = ctx.createLinearGradient(0, waterLevelY, 0, height)
  if (store.isGoalAchieved) {
    frontGrad.addColorStop(0, 'rgba(52, 199, 89, 0.88)')
    frontGrad.addColorStop(1, 'rgba(16, 185, 129, 0.95)')
  } else {
    frontGrad.addColorStop(0, 'rgba(6, 182, 212, 0.88)')
    frontGrad.addColorStop(1, 'rgba(0, 122, 255, 0.95)')
  }
  ctx.fillStyle = frontGrad
  ctx.fill()

  // 玻璃反光
  ctx.beginPath()
  ctx.ellipse(radius, 32, radius * 0.65, 14, 0, 0, Math.PI * 2)
  const glossGrad = ctx.createLinearGradient(0, 18, 0, 46)
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.38)')
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)')
  ctx.fillStyle = glossGrad
  ctx.fill()

  ctx.restore()

  animationFrameId = requestAnimationFrame(drawWave)
}

function syncCanvasSize(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const cssSize = canvas.clientWidth || 208
  canvas.width = Math.round(cssSize * dpr)
  canvas.height = Math.round(cssSize * dpr)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  syncCanvasSize()
  drawWave()
  // 水球尺寸随窗口自适应，尺寸变化后同步画布像素缓冲，避免发虚
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => syncCanvasSize())
    resizeObserver.observe(canvasRef.value)
  }
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => store.settings.theme,
  () => {
    // 监听重绘
  }
)
</script>
