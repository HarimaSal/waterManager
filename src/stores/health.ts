import { defineStore } from 'pinia'
import confetti from 'canvas-confetti'
import {
  type BeverageType,
  type WaterRecord,
  type HealthHabitItem,
  type DailySummary,
  type UserSettings,
  type AppMode,
  type TrainingIntensity,
  type CompanionMorph,
  type CompanionScene,
  type SoundscapeTrack,
  type NavigationTab,
  type PomodoroMode,
  type PomodoroState,
  type PomodoroSession,
  POMODORO_PRESETS,
  PRESET_BEVERAGES,
  FITNESS_HABITS,
  type HydrationScheduleSlot
} from '@/types'
import {
  calculateDailyWaterGoal,
  calculateFitnessWaterGoal,
  calculateEffectiveWater,
  calculateHydrationProgress,
  formatDateKey,
  allocateScheduleSlots
} from '@/utils/calculator'
import {
  playWaterDropSound,
  playCelebrationSound,
  startSoundscape,
  stopSoundscape,
  switchSoundscape,
  setSoundscapeVolume as setAudioSoundscapeVolume
} from '@/utils/audio'

const STORAGE_KEY = 'vitalpulse_health_data_v3'
let pomodoroIntervalId: number | null = null
let soundscapeStartedByPomodoro = false

const DEFAULT_SETTINGS: UserSettings = {
  weightKg: 65,
  activityLevel: 'sedentary',
  customDailyWaterGoalMl: null,
  presetVolumes: [150, 250, 350, 500],
  soundEnabled: true,
  soundscapeActive: false,
  soundscapeTrack: 'stream',
  soundscapeVolume: 0.15,
  enableCompanion: true,
  closeBehavior: 'minimize',
  theme: 'light',
  dndEnabled: true,
  dndStart: '22:00',
  dndEnd: '08:00',
  enableMiniWidget: false,
  autoLaunch: false,
  appMode: 'daily',
  trainingIntensity: 'moderate',
  isTakingCreatine: false,
  isHighProteinDiet: false,
  companionMorph: 'classic_aqua',
  companionScene: 'zen_study',
  autoSoundscapeSync: true,
  promptHydrationOnPomodoroComplete: true,
  customPomodoroMinutes: 30
}

const DEFAULT_HABITS: HealthHabitItem[] = [
  {
    id: 'sedentary',
    title: '久坐舒展',
    subTitle: '每小时起身活动 2 分钟，释放腰椎压力',
    icon: 'Activity',
    color: '#F59E0B',
    enabled: true,
    targetCount: 6,
    currentCount: 0,
    intervalMinutes: 60,
    lastRemindTimestamp: Date.now(),
    isSystem: true,
    category: 'movement'
  },
  {
    id: 'eye_rest',
    title: '20-20-20 护眼',
    subTitle: '每20分钟远眺20英尺(6米)外20秒',
    icon: 'Eye',
    color: '#10B981',
    enabled: true,
    targetCount: 8,
    currentCount: 0,
    intervalMinutes: 20,
    lastRemindTimestamp: Date.now(),
    isSystem: true,
    category: 'mindfulness'
  },
  {
    id: 'vitamins',
    title: '每日营养/维生素',
    subTitle: '复合维生素、鱼油或日常保健用药',
    icon: 'Pill',
    color: '#8B5CF6',
    enabled: true,
    targetCount: 2,
    currentCount: 0,
    isSystem: true,
    category: 'nutrition'
  },
  {
    id: 'breathing',
    title: '4-7-8 深度呼吸',
    subTitle: '吸气4秒，屏息7秒，呼气8秒平复焦虑',
    icon: 'Wind',
    color: '#06B6D4',
    enabled: true,
    targetCount: 3,
    currentCount: 0,
    isSystem: true,
    category: 'mindfulness'
  }
]

export const useHealthStore = defineStore('health', {
  state: () => {
    let savedData: Record<string, unknown> | null = null
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('vitalpulse_health_data_v2') ||
        localStorage.getItem('vitalpulse_health_data_v1')
      if (raw) savedData = JSON.parse(raw)
    } catch {
      // 容错处理
    }

    const today = formatDateKey()
    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      ...((savedData?.settings as Partial<UserSettings>) || {})
    }
    if (!settings.presetVolumes || settings.presetVolumes.length === 0) {
      settings.presetVolumes = [150, 250, 350, 500]
    }

    const rawRecords = (savedData?.waterRecords as WaterRecord[]) || []
    const todayRecords = rawRecords.filter((r) => formatDateKey(new Date(r.timestamp)) === today)
    const historicalRecords = (savedData?.historicalRecords as Record<string, DailySummary>) || {}
    const pomodoroSessions = (savedData?.pomodoroSessions as PomodoroSession[]) || []

    // 合并饮品库（仅纯净水不可删除，补入新增健身专属饮品）
    let beverages: BeverageType[] = [...PRESET_BEVERAGES]
    if (savedData?.beverages && Array.isArray(savedData.beverages)) {
      beverages = savedData.beverages as BeverageType[]
      const hasWater = beverages.some((b) => b.id === 'pure_water')
      if (!hasWater) {
        beverages.unshift(PRESET_BEVERAGES[0])
      } else {
        const waterItem = beverages.find((b) => b.id === 'pure_water')
        if (waterItem) waterItem.isFixed = true
      }
      PRESET_BEVERAGES.forEach((pb) => {
        if (!beverages.some((b) => b.id === pb.id)) {
          beverages.push({ ...pb })
        }
      })
    }

    let habits: HealthHabitItem[] = [...DEFAULT_HABITS, ...FITNESS_HABITS]
    if (savedData?.habits && Array.isArray(savedData.habits)) {
      const savedHabits = savedData.habits as HealthHabitItem[]
      const lastSavedDate = savedData?.todayDate as string
      habits = savedHabits.map((item) => {
        let cat = item.category
        if (!cat) {
          if (item.id === 'sedentary' || item.id === 'post_stretch' || item.id === 'posture_reset') cat = 'movement'
          else if (item.id === 'vitamins' || item.id === 'creatine' || item.id === 'whey_protein') cat = 'nutrition'
          else cat = 'mindfulness'
        }
        return {
          ...item,
          category: cat,
          currentCount: lastSavedDate === today ? item.currentCount : 0
        }
      })
      FITNESS_HABITS.forEach((fh) => {
        if (!habits.some((h) => h.id === fh.id)) {
          habits.push({ ...fh })
        }
      })
    }

    return {
      todayDate: today,
      settings,
      waterRecords: todayRecords,
      habits,
      beverages,
      historicalRecords,
      pomodoroSessions,
      isMiniMode: false,
      activeTab: 'water' as NavigationTab,
      pomodoroMode: 'classic' as PomodoroMode,
      pomodoroState: 'idle' as PomodoroState,
      pomodoroRemainingSeconds: 25 * 60,
      pomodoroTotalSeconds: 25 * 60,
      pomodoroTag: '健康办公',
      showHydrationBreakModal: false,
      lastCompletedSession: null as PomodoroSession | null,
      hasCelebratedToday: false
    }
  },

  getters: {
    dailyGoalMl(state): number {
      if (state.settings.appMode === 'fitness') {
        return calculateFitnessWaterGoal(
          state.settings.weightKg,
          state.settings.trainingIntensity || 'moderate',
          Boolean(state.settings.isTakingCreatine),
          Boolean(state.settings.isHighProteinDiet),
          state.settings.customDailyWaterGoalMl
        )
      }
      return calculateDailyWaterGoal(
        state.settings.weightKg,
        state.settings.activityLevel,
        state.settings.customDailyWaterGoalMl
      )
    },

    scheduleSlots(state): HydrationScheduleSlot[] {
      return allocateScheduleSlots(
        this.dailyGoalMl,
        state.settings.appMode === 'fitness'
      )
    },

    totalEffectiveWaterMl(state): number {
      return state.waterRecords.reduce((sum, item) => sum + item.effectiveAmountMl, 0)
    },

    progressPercent(): number {
      return calculateHydrationProgress(this.totalEffectiveWaterMl, this.dailyGoalMl)
    },

    isGoalAchieved(): boolean {
      return this.totalEffectiveWaterMl >= this.dailyGoalMl
    },

    lastDrinkTime(state): string | null {
      if (state.waterRecords.length === 0) return null
      const last = state.waterRecords[state.waterRecords.length - 1]
      const d = new Date(last.timestamp)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },

    enabledBeverages(state): BeverageType[] {
      return state.beverages.filter((b) => b.enabled !== false)
    },

    enabledHabits(state): HealthHabitItem[] {
      return state.habits.filter((h) => h.enabled !== false)
    },

    // 连续打卡天数统计
    streakDays(state): number {
      let count = 0
      const now = new Date()
      let checkDate = new Date(now)
      if (this.isGoalAchieved) {
        count = 1
        checkDate.setDate(checkDate.getDate() - 1)
      }

      while (true) {
        const key = formatDateKey(checkDate)
        const summary = state.historicalRecords[key]
        if (summary && summary.waterTotalMl >= summary.waterTargetMl) {
          count++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
      return count
    },

    totalHistoricalLiters(state): number {
      let totalMl = this.totalEffectiveWaterMl
      for (const key in state.historicalRecords) {
        if (key !== state.todayDate) {
          totalMl += state.historicalRecords[key].waterTotalMl || 0
        }
      }
      return Number((totalMl / 1000).toFixed(1))
    },

    totalHabitCheckIns(state): number {
      let count = state.habits.reduce((acc, h) => acc + h.currentCount, 0)
      for (const key in state.historicalRecords) {
        const rec = state.historicalRecords[key]
        if (rec.habitCounts) {
          for (const hid in rec.habitCounts) {
            count += rec.habitCounts[hid] || 0
          }
        } else if (rec.completedHabits) {
          count += rec.completedHabits.length
        }
      }
      return count
    },

    // 当前处于全天哪一个黄金时段
    currentScheduleSlot(): HydrationScheduleSlot | null {
      const now = new Date()
      const currentHour = now.getHours() + now.getMinutes() / 60
      return (
        this.scheduleSlots.find(
          (slot: HydrationScheduleSlot) => currentHour >= slot.startHour - 0.5 && currentHour <= slot.endHour + 0.5
        ) || null
      )
    },

    // 检查哪些时段已完成打卡
    completedSlotIds(state): string[] {
      const completed: string[] = []
      this.scheduleSlots.forEach((slot: HydrationScheduleSlot) => {
        const hit = state.waterRecords.some((r) => {
          const d = new Date(r.timestamp)
          const h = d.getHours() + d.getMinutes() / 60
          return h >= slot.startHour - 0.5 && h <= slot.endHour + 0.5
        })
        if (hit) completed.push(slot.id)
      })
      return completed
    },

    beverageDistribution(state): { name: string; amountMl: number; percent: number; color: string }[] {
      const map: Record<string, number> = {}
      let total = 0
      state.waterRecords.forEach((r) => {
        const bevName = r.beverageName.split(' ')[0]
        map[bevName] = (map[bevName] || 0) + r.amountMl
        total += r.amountMl
      })

      if (total === 0) return []

      return Object.keys(map).map((name) => {
        const bev = state.beverages.find((b) => b.name.startsWith(name))
        return {
          name,
          amountMl: map[name],
          percent: Math.round((map[name] / total) * 100),
          color: bev?.color || '#007AFF'
        }
      })
    },

    // 今日完成的心流专注记录
    todayFocusSessions(state): PomodoroSession[] {
      const today = state.todayDate
      return state.pomodoroSessions.filter((s) => formatDateKey(new Date(s.timestamp)) === today)
    },

    // 今日累计专注分钟数
    todayFocusMinutes(): number {
      return this.todayFocusSessions.reduce((sum: number, s: PomodoroSession) => sum + s.durationMinutes, 0)
    },

    // 今日达成番茄钟个数
    todayFocusTomatoes(): number {
      return this.todayFocusSessions.length
    },

    // 历史生涯累计专注分钟数
    totalHistoricalFocusMinutes(state): number {
      return state.pomodoroSessions.reduce((sum: number, s: PomodoroSession) => sum + s.durationMinutes, 0)
    },

    // 历史生涯累计番茄数
    totalHistoricalFocusTomatoes(state): number {
      return state.pomodoroSessions.length
    },

    // 番茄钟倒计时百分比 (0 ~ 100)
    pomodoroProgressPercent(state): number {
      if (state.pomodoroTotalSeconds <= 0) return 0
      const passed = state.pomodoroTotalSeconds - state.pomodoroRemainingSeconds
      const pct = (passed / state.pomodoroTotalSeconds) * 100
      return Math.min(100, Math.max(0, Math.round(pct)))
    },

    // 格式化剩余分秒
    formattedPomodoroMinutes(state): string {
      const m = Math.floor(state.pomodoroRemainingSeconds / 60)
      return String(m).padStart(2, '0')
    },

    formattedPomodoroSeconds(state): string {
      const s = state.pomodoroRemainingSeconds % 60
      return String(s).padStart(2, '0')
    }
  },

  actions: {
    // 记录单次喝水（支持补记时间戳与自定义备注）
    addWaterRecord(
      amountMl: number,
      beverageId: string = 'pure_water',
      customTimestamp?: number,
      customTimeNote?: string
    ) {
      this.checkDateRollover()
      const beverage = this.beverages.find((b) => b.id === beverageId) || this.beverages[0]
      const effectiveAmountMl = calculateEffectiveWater(amountMl, beverage.hydrationFactor)

      const record: WaterRecord = {
        id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: customTimestamp || Date.now(),
        amountMl,
        effectiveAmountMl,
        beverageId: beverage.id,
        beverageName: beverage.name,
        customTimeNote
      }

      this.waterRecords.push(record)

      if (this.settings.soundEnabled) {
        playWaterDropSound()
      }

      if (this.isGoalAchieved && !this.hasCelebratedToday) {
        this.hasCelebratedToday = true
        if (this.settings.soundEnabled) {
          playCelebrationSound()
        }
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        })
        window.electronAPI?.sendNotification(
          '太棒了！今日饮水达标 🎉',
          `您已摄入 ${this.totalEffectiveWaterMl}ml 纯净水分，继续保持健康好状态！`
        )
      }

      this.saveToStorage()
    },

    removeWaterRecord(id: string) {
      this.waterRecords = this.waterRecords.filter((r) => r.id !== id)
      this.saveToStorage()
    },

    // 习惯打卡
    incrementHabit(habitId: string) {
      this.checkDateRollover()
      const habit = this.habits.find((h) => h.id === habitId)
      if (!habit) return

      if (habit.currentCount < habit.targetCount) {
        habit.currentCount += 1
      } else {
        habit.currentCount = 0
      }

      habit.lastRemindTimestamp = Date.now()

      if (habit.currentCount === habit.targetCount) {
        if (this.settings.soundEnabled) {
          playCelebrationSound()
        }
        window.electronAPI?.sendNotification('习惯达成 🌟', `您已完成「${habit.title}」今日全部目标！`)
      } else if (this.settings.soundEnabled) {
        playWaterDropSound()
      }

      this.saveToStorage()
    },

    addCustomHabit(newHabit: Omit<HealthHabitItem, 'id' | 'currentCount' | 'isSystem'>) {
      const item: HealthHabitItem = {
        ...newHabit,
        id: `custom_habit_${Date.now()}`,
        currentCount: 0,
        isSystem: false,
        lastRemindTimestamp: Date.now()
      }
      this.habits.push(item)
      this.saveToStorage()
    },

    updateHabit(id: string, updates: Partial<HealthHabitItem>) {
      const index = this.habits.findIndex((h) => h.id === id)
      if (index !== -1) {
        this.habits[index] = { ...this.habits[index], ...updates }
        this.saveToStorage()
      }
    },

    deleteHabit(id: string) {
      this.habits = this.habits.filter((h) => h.id !== id)
      this.saveToStorage()
    },

    // 饮品管理：支持删除除纯水外的一切饮品
    addCustomBeverage(newBeverage: Omit<BeverageType, 'id' | 'isFixed'>) {
      const item: BeverageType = {
        ...newBeverage,
        id: `custom_bev_${Date.now()}`,
        isFixed: false,
        enabled: true
      }
      this.beverages.push(item)
      this.saveToStorage()
    },

    updateBeverage(id: string, updates: Partial<BeverageType>) {
      const index = this.beverages.findIndex((b) => b.id === id)
      if (index !== -1) {
        this.beverages[index] = { ...this.beverages[index], ...updates }
        this.saveToStorage()
      }
    },

    deleteBeverage(id: string) {
      const target = this.beverages.find((b) => b.id === id)
      if (target?.isFixed) {
        return // 纯净水绝对不可删除
      }
      this.beverages = this.beverages.filter((b) => b.id !== id)
      this.saveToStorage()
    },

    // 恢复出厂默认饮品库
    resetDefaultBeverages() {
      this.beverages = [...PRESET_BEVERAGES]
      this.saveToStorage()
    },

    updatePresetVolumes(volumes: number[]) {
      this.settings.presetVolumes = [...volumes]
      this.saveToStorage()
    },

    // 潮汐/Calm 多轨自然声景开关与控制
    toggleSoundscape() {
      this.settings.soundscapeActive = !this.settings.soundscapeActive
      if (this.settings.soundscapeActive) {
        startSoundscape(this.settings.soundscapeTrack || 'stream', this.settings.soundscapeVolume ?? 0.15)
      } else {
        stopSoundscape()
      }
      this.saveToStorage()
    },

    setSoundscapeTrack(track: SoundscapeTrack) {
      this.settings.soundscapeTrack = track
      if (this.settings.soundscapeActive) {
        switchSoundscape(track, this.settings.soundscapeVolume ?? 0.15)
      }
      this.saveToStorage()
    },

    setSoundscapeVolume(volume: number) {
      this.settings.soundscapeVolume = volume
      setAudioSoundscapeVolume(volume)
      this.saveToStorage()
    },

    startSoundscapeTrack(track: SoundscapeTrack) {
      this.settings.soundscapeTrack = track
      this.settings.soundscapeActive = true
      startSoundscape(track, this.settings.soundscapeVolume ?? 0.15)
      this.saveToStorage()
    },

    checkDateRollover() {
      const today = formatDateKey()
      if (today !== this.todayDate) {
        this.archiveDaySummary(this.todayDate)
        this.todayDate = today
        this.waterRecords = []
        this.hasCelebratedToday = false
        this.habits.forEach((h) => {
          h.currentCount = 0
          h.lastRemindTimestamp = Date.now()
        })
        this.saveToStorage()
      }
    },

    archiveDaySummary(dateKey: string) {
      const dayTotal = this.totalEffectiveWaterMl
      const completedHabits = this.habits
        .filter((h) => h.currentCount >= h.targetCount)
        .map((h) => h.id)

      const habitCounts: Record<string, number> = {}
      this.habits.forEach((h) => {
        habitCounts[h.id] = h.currentCount
      })

      const daySessions = this.pomodoroSessions.filter(
        (s) => formatDateKey(new Date(s.timestamp)) === dateKey
      )
      const focusMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0)
      const focusTomatoes = daySessions.length

      this.historicalRecords[dateKey] = {
        date: dateKey,
        waterTotalMl: dayTotal,
        waterTargetMl: this.dailyGoalMl,
        completedHabits,
        habitCounts,
        streakDays: this.streakDays,
        focusMinutes,
        focusTomatoes
      }
    },

    setAppMode(mode: AppMode) {
      this.settings.appMode = mode
      this.saveToStorage()
    },

    setTrainingIntensity(intensity: TrainingIntensity) {
      this.settings.trainingIntensity = intensity
      this.saveToStorage()
    },

    toggleCreatine() {
      this.settings.isTakingCreatine = !this.settings.isTakingCreatine
      this.saveToStorage()
    },

    toggleHighProteinDiet() {
      this.settings.isHighProteinDiet = !this.settings.isHighProteinDiet
      this.saveToStorage()
    },

    setCompanionMorph(morph: CompanionMorph) {
      this.settings.companionMorph = morph
      this.saveToStorage()
    },

    setCompanionScene(scene: CompanionScene) {
      this.settings.companionScene = scene
      this.saveToStorage()
    },

    clearTodayWaterRecords() {
      this.waterRecords = []
      this.hasCelebratedToday = false
      this.saveToStorage()
    },

    updateSettings(newSettings: Partial<UserSettings>) {
      this.settings = {
        ...this.settings,
        ...newSettings
      }
      this.saveToStorage()
    },

    // ==================== 心流番茄钟 Actions ====================
    resetPomodoroToMode(mode: PomodoroMode) {
      let minutes = 25
      if (mode === 'deep') minutes = 50
      else if (mode === 'blitz') minutes = 15
      else if (mode === 'custom') minutes = this.settings.customPomodoroMinutes || 30

      this.pomodoroTotalSeconds = minutes * 60
      this.pomodoroRemainingSeconds = minutes * 60
    },

    startPomodoro() {
      if (this.pomodoroState === 'running') return

      if (this.pomodoroState === 'idle') {
        this.resetPomodoroToMode(this.pomodoroMode)
      }

      // 声景联动：若开启随专注自动播放白噪音且当前未激活
      if (this.settings.autoSoundscapeSync && !this.settings.soundscapeActive) {
        this.toggleSoundscape()
        soundscapeStartedByPomodoro = true
      }

      this.pomodoroState = 'running'

      if (pomodoroIntervalId !== null) {
        clearInterval(pomodoroIntervalId)
      }

      pomodoroIntervalId = window.setInterval(() => {
        if (this.pomodoroRemainingSeconds > 1) {
          this.pomodoroRemainingSeconds--
        } else {
          this.pomodoroRemainingSeconds = 0
          if (this.pomodoroState === 'running') {
            this.completeFocusPhase()
          } else if (this.pomodoroState === 'break') {
            this.completeBreakPhase()
          }
        }
      }, 1000)
    },

    pausePomodoro() {
      if (this.pomodoroState !== 'running' && this.pomodoroState !== 'break') return
      if (pomodoroIntervalId !== null) {
        clearInterval(pomodoroIntervalId)
        pomodoroIntervalId = null
      }
      if (this.settings.autoSoundscapeSync && this.settings.soundscapeActive && soundscapeStartedByPomodoro) {
        this.toggleSoundscape()
      }
      if (this.pomodoroState === 'running') {
        this.pomodoroState = 'paused'
      }
    },

    resumePomodoro() {
      if (this.pomodoroState !== 'paused') return
      this.startPomodoro()
    },

    resetPomodoro() {
      if (pomodoroIntervalId !== null) {
        clearInterval(pomodoroIntervalId)
        pomodoroIntervalId = null
      }
      if (this.settings.autoSoundscapeSync && this.settings.soundscapeActive && soundscapeStartedByPomodoro) {
        this.toggleSoundscape()
        soundscapeStartedByPomodoro = false
      }
      this.pomodoroState = 'idle'
      this.resetPomodoroToMode(this.pomodoroMode)
    },

    setPomodoroMode(mode: PomodoroMode) {
      if (this.pomodoroState === 'running' || this.pomodoroState === 'paused') {
        this.resetPomodoro()
      }
      this.pomodoroMode = mode
      this.resetPomodoroToMode(mode)
      this.saveToStorage()
    },

    setCustomPomodoroMinutes(minutes: number) {
      const clamped = Math.max(1, Math.min(120, Math.round(minutes)))
      this.settings.customPomodoroMinutes = clamped
      if (this.pomodoroMode === 'custom' && this.pomodoroState === 'idle') {
        this.resetPomodoroToMode('custom')
      }
      this.saveToStorage()
    },

    setPomodoroTag(tag: string) {
      this.pomodoroTag = tag
      this.saveToStorage()
    },

    completeFocusPhase() {
      if (pomodoroIntervalId !== null) {
        clearInterval(pomodoroIntervalId)
        pomodoroIntervalId = null
      }

      if (this.settings.soundEnabled) {
        playCelebrationSound()
      }

      if (this.settings.autoSoundscapeSync && this.settings.soundscapeActive && soundscapeStartedByPomodoro) {
        this.toggleSoundscape()
        soundscapeStartedByPomodoro = false
      }

      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.55 }
      })

      const durationMinutes = Math.max(1, Math.round(this.pomodoroTotalSeconds / 60))
      const session: PomodoroSession = {
        id: `pomo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        durationMinutes,
        mode: this.pomodoroMode,
        tag: this.pomodoroTag
      }
      this.pomodoroSessions.push(session)
      this.lastCompletedSession = session

      window.electronAPI?.sendNotification(
        '心流专注达成 ⏱️',
        `太棒了！您已达成一轮 ${durationMinutes} 分钟「${this.pomodoroTag}」心流周期。起来活动身心、补水蓄能吧！`
      )

      const preset = POMODORO_PRESETS.find((p) => p.id === this.pomodoroMode)
      const breakMinutes = preset ? preset.breakMinutes : 5
      this.pomodoroState = 'break'
      this.pomodoroTotalSeconds = breakMinutes * 60
      this.pomodoroRemainingSeconds = breakMinutes * 60

      if (this.settings.promptHydrationOnPomodoroComplete !== false) {
        this.showHydrationBreakModal = true
      }

      pomodoroIntervalId = window.setInterval(() => {
        if (this.pomodoroRemainingSeconds > 1) {
          this.pomodoroRemainingSeconds--
        } else {
          this.pomodoroRemainingSeconds = 0
          this.completeBreakPhase()
        }
      }, 1000)

      this.saveToStorage()
    },

    completeBreakPhase() {
      if (pomodoroIntervalId !== null) {
        clearInterval(pomodoroIntervalId)
        pomodoroIntervalId = null
      }

      if (this.settings.soundEnabled) {
        playWaterDropSound()
      }

      window.electronAPI?.sendNotification(
        '休息结束 🌟',
        '身心舒缓完毕，状态已就绪，随时开启下一轮专注！'
      )

      this.pomodoroState = 'idle'
      this.showHydrationBreakModal = false
      this.resetPomodoroToMode(this.pomodoroMode)
      this.saveToStorage()
    },

    skipBreak() {
      if (pomodoroIntervalId !== null) {
        clearInterval(pomodoroIntervalId)
        pomodoroIntervalId = null
      }
      this.showHydrationBreakModal = false
      this.pomodoroState = 'idle'
      this.resetPomodoroToMode(this.pomodoroMode)
      this.saveToStorage()
    },

    recordBreakHydration(amountMl: number) {
      this.addWaterRecord(amountMl)
      if (this.lastCompletedSession) {
        this.lastCompletedSession.waterReplenishedMl =
          (this.lastCompletedSession.waterReplenishedMl || 0) + amountMl
      }
      this.showHydrationBreakModal = false
    },

    setMiniMode(mini: boolean) {
      this.isMiniMode = mini
      window.electronAPI?.toggleMiniMode(mini)
    },

    exportDataJson(): string {
      return JSON.stringify(
        {
          version: '3.0',
          exportedAt: new Date().toISOString(),
          settings: this.settings,
          beverages: this.beverages,
          habits: this.habits,
          waterRecords: this.waterRecords,
          historicalRecords: this.historicalRecords,
          pomodoroSessions: this.pomodoroSessions
        },
        null,
        2
      )
    },

    importDataJson(rawJson: string): boolean {
      try {
        const parsed = JSON.parse(rawJson)
        if (parsed.settings) this.settings = { ...DEFAULT_SETTINGS, ...parsed.settings }
        if (Array.isArray(parsed.beverages)) this.beverages = parsed.beverages
        if (Array.isArray(parsed.habits)) this.habits = parsed.habits
        if (Array.isArray(parsed.waterRecords)) this.waterRecords = parsed.waterRecords
        if (parsed.historicalRecords) this.historicalRecords = parsed.historicalRecords
        if (Array.isArray(parsed.pomodoroSessions)) this.pomodoroSessions = parsed.pomodoroSessions
        this.saveToStorage()
        return true
      } catch {
        return false
      }
    },

    async loadLocalDiskData() {
      try {
        if (!window.electronAPI?.loadData) return
        const rawJson = await window.electronAPI.loadData()
        if (!rawJson) {
          // 首次启动，若本地文件尚未建立，先主动持久化一份
          this.saveToStorage()
          return
        }
        const parsed = JSON.parse(rawJson)
        if (parsed.settings) {
          this.settings = { ...DEFAULT_SETTINGS, ...this.settings, ...parsed.settings }
        }
        if (Array.isArray(parsed.beverages) && parsed.beverages.length > 0) {
          this.beverages = parsed.beverages
        }
        if (Array.isArray(parsed.habits) && parsed.habits.length > 0) {
          this.habits = parsed.habits
        }
        if (Array.isArray(parsed.waterRecords)) {
          this.waterRecords = parsed.waterRecords
        }
        if (parsed.historicalRecords) {
          this.historicalRecords = parsed.historicalRecords
        }
        if (Array.isArray(parsed.pomodoroSessions)) {
          this.pomodoroSessions = parsed.pomodoroSessions
        }
        if (parsed.todayDate) {
          this.todayDate = parsed.todayDate
        }
        localStorage.setItem(STORAGE_KEY, rawJson)
      } catch (err) {
        console.error('Failed to load local disk data:', err)
      }
    },

    saveToStorage() {
      try {
        const payload = {
          version: '3.0',
          todayDate: this.todayDate,
          settings: this.settings,
          beverages: this.beverages,
          habits: this.habits,
          waterRecords: this.waterRecords,
          historicalRecords: this.historicalRecords,
          pomodoroSessions: this.pomodoroSessions
        }
        const jsonStr = JSON.stringify(payload, null, 2)
        localStorage.setItem(STORAGE_KEY, jsonStr)
        // 绿色便携本地数据落地至应用包下的 data/vitalpulse_data.json
        window.electronAPI?.saveData(jsonStr).catch(() => {
          // 容错处理
        })
      } catch (err) {
        console.error('Failed to save to storage:', err)
      }
    }
  }
})
