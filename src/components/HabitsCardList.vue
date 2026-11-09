<template>
  <div class="space-y-3">
    <!-- 标题与状态 -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center space-x-1.5">
        <HeartPulse class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
        <span class="text-xs font-bold text-slate-800 dark:text-slate-100">桌面微健康打卡</span>
        <button
          type="button"
          class="text-[10px] text-ios-blue hover:underline cursor-pointer ml-1"
          title="去设置页自定义配置习惯"
          @click="store.activeTab = 'settings'"
        >
          [配置与新增]
        </button>
      </div>
      <span class="text-[11px] text-slate-400 font-medium">点击卡片打卡</span>
    </div>

    <!-- 习惯多维度分类筛选胶囊 (动作体态 / 营养膳食 / 身心恢复 - 纯正矢量图标风格) -->
    <div class="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
      <button
        v-for="cat in categoryTabs"
        :key="cat.id"
        type="button"
        class="flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
        :class="[
          selectedCategory === cat.id
            ? 'bg-ios-blue text-white shadow-xs'
            : 'bg-white/70 dark:bg-zinc-800/70 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200/50 dark:border-zinc-700/50'
        ]"
        @click="selectedCategory = cat.id"
      >
        <component
          :is="cat.icon"
          class="w-3.5 h-3.5"
          :class="[selectedCategory === cat.id ? 'text-white' : cat.iconColorClass]"
          :stroke-width="2.2"
        />
        <span>{{ cat.label }}</span>
        <span class="text-[10px] opacity-75 font-normal">({{ getCategoryCount(cat.id) }})</span>
      </button>
    </div>

    <!-- 卡片列表 (动态渲染已过滤启用的习惯) -->
    <div class="grid grid-cols-2 gap-2.5">
      <div
        v-for="habit in filteredHabits"
        :key="habit.id"
        class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-3.5 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between transition-all duration-200 active:scale-[0.98] cursor-pointer hover:bg-white dark:hover:bg-zinc-800/90"
        @click="handleHabitClick(habit.id)"
      >
        <!-- 头部图标与进度 -->
        <div class="flex items-start justify-between">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            :class="getHabitIconBgClass(habit.id)"
          >
            <component
              :is="getHabitIcon(habit.id)"
              class="w-4 h-4"
              :class="getHabitIconColorClass(habit.id)"
              :stroke-width="2.2"
            />
          </div>

          <div class="flex items-center space-x-1">
            <span
              class="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center space-x-0.5"
              :class="getCategoryBadgeClass(habit.category)"
            >
              <component :is="getCategoryIcon(habit.category)" class="w-2.5 h-2.5" :stroke-width="2.2" />
              <span>{{ getCategoryLabel(habit.category) }}</span>
            </span>
            <span
              class="text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors"
              :class="[
                habit.currentCount >= habit.targetCount
                  ? 'bg-ios-green/10 text-ios-green dark:text-ios-green-dark border-ios-green/20'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-transparent'
              ]"
            >
              {{ habit.currentCount }}/{{ habit.targetCount }}
            </span>
          </div>
        </div>

        <!-- 标题与描述 -->
        <div class="mt-3">
          <div class="flex items-center space-x-1.5">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ habit.title }}</h4>
            <CheckCircle2
              v-if="habit.currentCount >= habit.targetCount"
              class="w-3.5 h-3.5 text-ios-green dark:text-ios-green-dark"
              :stroke-width="2.5"
            />
          </div>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{{ habit.subTitle }}</p>
        </div>

        <!-- 点状胶囊进度指示器 -->
        <div class="flex items-center space-x-1 mt-2.5">
          <div
            v-for="n in habit.targetCount"
            :key="n"
            class="h-1.5 flex-1 rounded-full transition-colors duration-300"
            :class="[
              n <= habit.currentCount
                ? 'bg-ios-blue dark:bg-ios-blue-dark'
                : 'bg-slate-200/80 dark:bg-zinc-800'
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- 底部快速引导卡片 -->
    <div
      class="p-3 rounded-2xl bg-gradient-to-r from-ios-blue/5 to-cyan-500/5 dark:from-ios-blue/10 dark:to-cyan-500/10 border border-ios-blue/15 flex items-center justify-between cursor-pointer hover:bg-ios-blue/10 transition-colors"
      @click="store.activeTab = 'settings'"
    >
      <div class="flex items-center space-x-2">
        <Sparkles class="w-4 h-4 text-ios-blue" :stroke-width="2" />
        <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">想要定制自己的专属微习惯？</span>
      </div>
      <span class="text-xs text-ios-blue font-bold">前往设置 ➔</span>
    </div>

    <!-- 4-7-8 呼吸模态框 -->
    <BreathingModal v-if="showBreathingModal" @close="showBreathingModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import {
  HeartPulse,
  Activity,
  Eye,
  Pill,
  Wind,
  CheckCircle2,
  Sparkles,
  Dumbbell,
  Zap,
  Flame,
  Layers,
  Apple
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import BreathingModal from '@/components/BreathingModal.vue'

const store = useHealthStore()
const habits = computed(() => store.enabledHabits)
const showBreathingModal = ref(false)

const selectedCategory = ref<string>('all')

const categoryTabs: {
  id: string
  label: string
  icon: Component
  iconColorClass: string
}[] = [
  { id: 'all', label: '全部', icon: Layers, iconColorClass: 'text-slate-500' },
  { id: 'movement', label: '动作体态', icon: Activity, iconColorClass: 'text-amber-500' },
  { id: 'nutrition', label: '营养膳食', icon: Apple, iconColorClass: 'text-emerald-500' },
  { id: 'mindfulness', label: '身心恢复', icon: Sparkles, iconColorClass: 'text-purple-500' }
]

const filteredHabits = computed(() => {
  if (selectedCategory.value === 'all') return habits.value
  return habits.value.filter((h) => (h.category || 'mindfulness') === selectedCategory.value)
})

function getCategoryCount(catId: string): number {
  if (catId === 'all') return habits.value.length
  return habits.value.filter((h) => (h.category || 'mindfulness') === catId).length
}

function getCategoryLabel(cat?: string): string {
  switch (cat) {
    case 'movement': return '动作'
    case 'nutrition': return '营养'
    case 'mindfulness': return '身心'
    default: return '健康'
  }
}

function getCategoryIcon(cat?: string): Component {
  switch (cat) {
    case 'movement': return Activity
    case 'nutrition': return Apple
    case 'mindfulness': return Sparkles
    default: return HeartPulse
  }
}

function getCategoryBadgeClass(cat?: string): string {
  switch (cat) {
    case 'movement':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    case 'nutrition':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    case 'mindfulness':
    default:
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
  }
}

function getHabitIcon(id: string): Component {
  switch (id) {
    case 'sedentary': return Activity
    case 'eye_rest': return Eye
    case 'vitamins': return Pill
    case 'breathing': return Wind
    case 'creatine': return Flame
    case 'whey_protein': return Dumbbell
    case 'post_stretch': return Activity
    case 'posture_reset': return Zap
    default: return Sparkles
  }
}

function getHabitIconBgClass(id: string): string {
  switch (id) {
    case 'sedentary': return 'bg-amber-500/10 dark:bg-amber-500/20'
    case 'eye_rest': return 'bg-emerald-500/10 dark:bg-emerald-500/20'
    case 'vitamins': return 'bg-purple-500/10 dark:bg-purple-500/20'
    case 'breathing': return 'bg-sky-500/10 dark:bg-sky-500/20'
    case 'creatine': return 'bg-orange-500/10 dark:bg-orange-500/20'
    case 'whey_protein': return 'bg-blue-500/10 dark:bg-blue-500/20'
    case 'post_stretch': return 'bg-emerald-500/10 dark:bg-emerald-500/20'
    case 'posture_reset': return 'bg-indigo-500/10 dark:bg-indigo-500/20'
    default: return 'bg-ios-blue/10 dark:bg-ios-blue/20'
  }
}

function getHabitIconColorClass(id: string): string {
  switch (id) {
    case 'sedentary': return 'text-amber-500'
    case 'eye_rest': return 'text-emerald-500'
    case 'vitamins': return 'text-purple-500'
    case 'breathing': return 'text-sky-500'
    case 'creatine': return 'text-orange-500'
    case 'whey_protein': return 'text-blue-500'
    case 'post_stretch': return 'text-emerald-500'
    case 'posture_reset': return 'text-indigo-500'
    default: return 'text-ios-blue'
  }
}

function handleHabitClick(id: string): void {
  if (id === 'breathing') {
    showBreathingModal.value = true
  } else {
    store.incrementHabit(id)
  }
}
</script>
