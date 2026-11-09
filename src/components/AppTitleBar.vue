<template>
  <header class="h-11 w-full flex items-center justify-between px-2.5 select-none app-drag-region bg-white/80 dark:bg-zinc-900/85 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] z-50">
    <!-- 左侧：仅保留应用标志与名称，无任何多余左侧按钮 (不收缩) -->
    <div class="flex items-center space-x-1.5 shrink-0">
      <div class="w-6 h-6 rounded-lg bg-ios-blue/10 dark:bg-ios-blue-dark/20 flex items-center justify-center text-ios-blue dark:text-ios-blue-dark">
        <Droplets class="w-3.5 h-3.5" :stroke-width="2.5" />
      </div>
      <div class="flex items-center space-x-1">
        <span class="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap">VitalPulse 若水</span>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="运行良好"></span>
      </div>
    </div>

    <!-- 中间：拖拽区域与核心模式切换胶囊 (固定不压缩、绝不折行) -->
    <div class="shrink-0 mx-1 flex items-center justify-center app-drag-region">
      <div class="flex items-center p-0.5 rounded-full bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200/50 dark:border-zinc-700/50 no-drag text-[10px] whitespace-nowrap shadow-xs">
        <button
          type="button"
          class="px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center space-x-1"
          :class="[
            store.settings.appMode !== 'fitness'
              ? 'bg-white dark:bg-zinc-700 text-ios-blue shadow-xs'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          ]"
          @click.stop="store.setAppMode('daily')"
        >
          <Droplets class="w-3 h-3" :stroke-width="2.2" />
          <span>日常</span>
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center space-x-1"
          :class="[
            store.settings.appMode === 'fitness'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          ]"
          @click.stop="store.setAppMode('fitness')"
        >
          <Flame class="w-3 h-3" :stroke-width="2.2" />
          <span>健身</span>
        </button>
      </div>
    </div>

    <!-- 右侧：功能快捷与 Windows 窗口控制区 (保持紧凑防挤压) -->
    <div class="flex items-center space-x-1 shrink-0 no-drag">
      <!-- 潮汐风格：自然白噪音与声景矩阵选择器按钮 -->
      <div class="relative">
        <button
          type="button"
          class="no-drag relative w-7 h-7 rounded-lg transition-all flex items-center justify-center cursor-pointer shrink-0"
          :class="[
            store.settings.soundscapeActive
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-slate-400'
          ]"
          :title="store.settings.soundscapeActive ? ('正在播放：' + (currentSoundscapeMeta?.name || '白噪音') + '（点击管理）') : '选择并开启自然白噪音'"
          @click.stop="toggleSoundscapePopover"
        >
          <Waves class="w-3.5 h-3.5" :class="{ 'animate-pulse text-emerald-500': store.settings.soundscapeActive }" :stroke-width="2" />
          <span
            v-if="store.settings.soundscapeActive"
            class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500"
          ></span>
        </button>

        <!-- Apple 风格毛玻璃声景管理悬浮卡片 (Soundscape Popover) -->
        <div
          v-if="showSoundscapePopover"
          class="fixed left-2 right-2 top-12 w-auto p-3 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] z-50 text-slate-800 dark:text-slate-100 select-none animate-in fade-in zoom-in-95 duration-150"
          @click.stop
        >
          <!-- 弹窗顶栏：标题与主开关 (纯正矢量风格，彻底去除生硬 Emoji) -->
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div class="flex items-center space-x-1.5">
              <div class="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Headphones class="w-3.5 h-3.5" :stroke-width="2.2" />
              </div>
              <span class="text-xs font-bold">自然声景 · 专注白噪音</span>
            </div>
            <!-- 主播放/暂停快速切换胶囊 -->
            <button
              type="button"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
              :class="[
                store.settings.soundscapeActive
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
              ]"
              @click="handleToggleMasterSound"
            >
              <span v-if="store.settings.soundscapeActive">背景音开 ⏸</span>
              <span v-else>背景音关 ▶</span>
            </button>
          </div>

          <!-- 1. 声景轨道矩阵列表 (纯矢量统一图标，2列整齐排列无溢出) -->
          <div class="grid grid-cols-2 gap-1.5 my-2">
            <button
              v-for="preset in SOUNDSCAPE_PRESETS"
              :key="preset.id"
              type="button"
              class="p-2 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between overflow-hidden min-w-0"
              :class="[
                selectedTrackId === preset.id
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500/40 shadow-xs'
                  : 'bg-slate-50/80 dark:bg-zinc-800/60 border-slate-200/70 dark:border-zinc-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              ]"
              @click="handleSelectTrack(preset.id)"
            >
              <!-- 顶部：项目统一矢量图标容器、名称与状态标签 -->
              <div class="flex items-center justify-between w-full min-w-0">
                <div class="flex items-center space-x-1.5 min-w-0">
                  <div
                    class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    :class="getSoundscapeBadgeClass(preset.id)"
                  >
                    <component :is="getSoundscapeIcon(preset.icon)" class="w-3.5 h-3.5" :stroke-width="2.2" />
                  </div>
                  <span class="text-[11px] font-bold tracking-tight truncate">{{ preset.name }}</span>
                </div>
                <span
                  v-if="store.settings.soundscapeTrack === preset.id && store.settings.soundscapeActive"
                  class="text-[8px] px-1 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0"
                >
                  运行中
                </span>
                <span
                  v-else-if="selectedTrackId === preset.id"
                  class="text-[8px] px-1 py-0.2 rounded font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"
                >
                  已选中
                </span>
              </div>

              <!-- 底部：4字精致副标题与分类标签 -->
              <div class="mt-1.5 flex items-center justify-between w-full min-w-0 text-[9px]">
                <span class="text-slate-400 dark:text-slate-500 font-medium truncate min-w-0 flex-1 mr-1">
                  {{ preset.subtitle }}
                </span>
                <span class="px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 opacity-70 shrink-0">
                  {{ preset.tag }}
                </span>
              </div>
            </button>
          </div>

          <!-- 2. 选中声景专属详情卡片 (统一矢量风格) -->
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 my-2">
            <div class="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
              <div class="flex items-center space-x-1.5">
                <div
                  class="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  :class="getSoundscapeBadgeClass(selectedPresetMeta.id)"
                >
                  <component :is="getSoundscapeIcon(selectedPresetMeta.icon)" class="w-3 h-3" :stroke-width="2.2" />
                </div>
                <span>{{ selectedPresetMeta.name }}</span>
                <span class="text-[10px] font-normal text-slate-400">（{{ selectedPresetMeta.tag }}）</span>
              </div>
              <span v-if="isCurrentlyActive" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
                <Check class="w-3 h-3" />
                <span>当前应用中</span>
              </span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed break-words whitespace-normal">
              {{ selectedPresetMeta.description }}
            </p>
          </div>

          <!-- 3. 【试听】与【应用】双核心操作按钮 (无多余 Emoji 尾缀，统一矢量图标) -->
          <div class="grid grid-cols-2 gap-2 my-2">
            <!-- 试听按钮 -->
            <button
              type="button"
              class="py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer border"
              :class="[
                isPreviewing
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs animate-pulse'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
              ]"
              @click="handleTogglePreview"
            >
              <Volume2 v-if="!isPreviewing" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
              <VolumeX v-else class="w-3.5 h-3.5 text-white" />
              <span>{{ isPreviewing ? '停止试听' : '试听此声景' }}</span>
            </button>

            <!-- 应用按钮 -->
            <button
              type="button"
              class="py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              :class="[
                isCurrentlyActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'
              ]"
              @click="handleApplySoundscape"
            >
              <Check class="w-3.5 h-3.5" />
              <span>{{ isCurrentlyActive ? '已应用当前' : '应用此声景' }}</span>
            </button>
          </div>

          <!-- 4. 底部音量调节滑块 -->
          <div class="mt-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between space-x-2">
            <div class="flex items-center space-x-1 text-slate-400 text-[10px] shrink-0">
              <Volume2 class="w-3.5 h-3.5" />
              <span>音量</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.4"
              step="0.01"
              :value="store.settings.soundscapeVolume ?? 0.15"
              class="flex-1 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              @input="handleVolumeChange"
            />
            <span class="text-[10px] font-bold text-slate-500 w-8 text-right shrink-0">
              {{ Math.round(((store.settings.soundscapeVolume ?? 0.15) / 0.4) * 100) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 切换迷你桌面悬浮胶囊 -->
      <button
        type="button"
        class="no-drag w-7 h-7 rounded-lg bg-ios-blue/10 hover:bg-ios-blue/20 dark:bg-ios-blue-dark/20 text-ios-blue dark:text-ios-blue-dark active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
        title="收起为桌面悬浮小组件"
        @click.stop="handleToggleMini"
      >
        <Minimize2 class="w-3 h-3" :stroke-width="2.2" />
      </button>

      <!-- 最小化窗口 -->
      <button
        type="button"
        class="no-drag w-7 h-7 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
        title="最小化窗口"
        @click.stop="handleMinimize"
      >
        <Minus class="w-3.5 h-3.5" :stroke-width="2.5" />
      </button>

      <!-- 关闭窗口（根据设置自动执行最小化托盘或直接退出） -->
      <button
        type="button"
        class="no-drag w-7 h-7 rounded-lg text-slate-500 hover:text-white hover:bg-ios-red active:scale-90 transition-all flex items-center justify-center cursor-pointer"
        :title="store.settings.closeBehavior === 'exit' ? '退出应用程序' : '最小化并隐藏至托盘'"
        @click.stop="handleClose"
      >
        <X class="w-3.5 h-3.5" :stroke-width="2.5" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue'
import {
  Droplets,
  CloudRain,
  Trees,
  Flame,
  Waves,
  Sparkles,
  Headphones,
  Minus,
  X,
  Minimize2,
  Volume2,
  VolumeX,
  Check
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import { SOUNDSCAPE_PRESETS, type SoundscapeTrack } from '@/types'
import { startSoundscape, stopSoundscape } from '@/utils/audio'

const store = useHealthStore()

// 0. 自然声景弹窗控制与当前交互状态
const showSoundscapePopover = ref(false)
const selectedTrackId = ref<SoundscapeTrack>(store.settings.soundscapeTrack || 'stream')
const isPreviewing = ref(false)

const soundscapeIconMap: Record<string, Component> = {
  Droplets,
  CloudRain,
  Trees,
  Flame,
  Waves,
  Sparkles
}

function getSoundscapeIcon(iconName: string): Component {
  return soundscapeIconMap[iconName] || Waves
}

function getSoundscapeBadgeClass(id: string): string {
  switch (id) {
    case 'stream':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400'
    case 'rain':
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400'
    case 'forest':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400'
    case 'campfire':
      return 'bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400'
    case 'waves':
      return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 dark:text-cyan-400'
    case 'nebula':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400'
    default:
      return 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
  }
}

const currentSoundscapeMeta = computed(() => {
  return (
    SOUNDSCAPE_PRESETS.find((p) => p.id === store.settings.soundscapeTrack) ||
    SOUNDSCAPE_PRESETS[0]
  )
})

const selectedPresetMeta = computed(() => {
  return (
    SOUNDSCAPE_PRESETS.find((p) => p.id === selectedTrackId.value) ||
    SOUNDSCAPE_PRESETS[0]
  )
})

const isCurrentlyActive = computed(() => {
  return (
    store.settings.soundscapeTrack === selectedTrackId.value &&
    store.settings.soundscapeActive
  )
})

function toggleSoundscapePopover(): void {
  showSoundscapePopover.value = !showSoundscapePopover.value
  if (showSoundscapePopover.value) {
    selectedTrackId.value = store.settings.soundscapeTrack || 'stream'
  } else {
    resetPreviewIfAny()
  }
}

function closeSoundscapePopover(): void {
  if (showSoundscapePopover.value) {
    showSoundscapePopover.value = false
    resetPreviewIfAny()
  }
}

function resetPreviewIfAny(): void {
  if (isPreviewing.value) {
    isPreviewing.value = false
    if (store.settings.soundscapeActive) {
      startSoundscape(store.settings.soundscapeTrack || 'stream', store.settings.soundscapeVolume ?? 0.15)
    } else {
      stopSoundscape(true)
    }
  }
}

function handleToggleMasterSound(): void {
  if (isPreviewing.value) {
    isPreviewing.value = false
  }
  store.toggleSoundscape()
}

function handleSelectTrack(trackId: SoundscapeTrack): void {
  selectedTrackId.value = trackId
  if (isPreviewing.value) {
    startSoundscape(trackId, store.settings.soundscapeVolume ?? 0.15)
  }
}

function handleTogglePreview(): void {
  if (isPreviewing.value) {
    // 停止试听并还原
    isPreviewing.value = false
    if (store.settings.soundscapeActive) {
      startSoundscape(store.settings.soundscapeTrack || 'stream', store.settings.soundscapeVolume ?? 0.15)
    } else {
      stopSoundscape(true)
    }
  } else {
    // 开启试听
    isPreviewing.value = true
    startSoundscape(selectedTrackId.value, store.settings.soundscapeVolume ?? 0.15)
  }
}

function handleApplySoundscape(): void {
  isPreviewing.value = false
  store.startSoundscapeTrack(selectedTrackId.value)
}

function handleVolumeChange(e: Event): void {
  const target = e.target as HTMLInputElement
  const vol = parseFloat(target.value)
  store.setSoundscapeVolume(vol)
}

onMounted(() => {
  window.addEventListener('click', closeSoundscapePopover)
})

onUnmounted(() => {
  window.removeEventListener('click', closeSoundscapePopover)
  resetPreviewIfAny()
})

function handleClose(): void {
  const behavior = store.settings.closeBehavior || 'minimize'
  try {
    if (window.electronAPI) {
      window.electronAPI.close(behavior)
    } else {
      const ipc = (window as unknown as { ipcRenderer?: { send: (channel: string, arg?: string) => void } }).ipcRenderer
      ipc?.send('window:close', behavior)
    }
  } catch (err) {
    console.error('Failed to close window:', err)
  }
}

function handleMinimize(): void {
  try {
    if (window.electronAPI) {
      window.electronAPI.minimize()
    } else {
      const ipc = (window as unknown as { ipcRenderer?: { send: (channel: string) => void } }).ipcRenderer
      ipc?.send('window:minimize')
    }
  } catch (err) {
    console.error('Failed to minimize window:', err)
  }
}

function handleToggleMini(): void {
  store.setMiniMode(true)
}
</script>
