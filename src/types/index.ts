// 饮品类型定义
export interface BeverageType {
  id: string
  name: string
  icon: string
  hydrationFactor: number // 补水系数 (如 1.0 表示 100% 补水，0.8 表示 80% 有效补水)
  color: string // 主题色
  category: 'water' | 'tea' | 'coffee' | 'milk' | 'juice' | 'healthy' | 'custom'
  description: string
  isFixed?: boolean // 是否为基础必选饮品（纯净水固定不可删除）
  enabled?: boolean // 是否启用展示
}

// 单次喝水记录
export interface WaterRecord {
  id: string
  timestamp: number // 毫秒级时间戳
  amountMl: number // 饮入量
  effectiveAmountMl: number // 结合饮品系数折算后的净水分
  beverageId: string
  beverageName: string
  customTimeNote?: string // 补记时间说明（如"半小时前"、"09:30"）
}

export type HabitCategory = 'movement' | 'nutrition' | 'mindfulness'

// 通用健康习惯定义
export interface HealthHabitItem {
  id: string
  title: string
  subTitle: string
  icon: string
  color: string
  enabled: boolean
  targetCount: number // 每日目标次数
  currentCount: number // 当日已完成次数
  intervalMinutes?: number // 提醒间隔（分钟）
  lastRemindTimestamp?: number
  isSystem?: boolean // 是否系统内置
  category?: HabitCategory // 习惯所属分类：动作体态 / 营养膳食 / 身心恢复
}

// 每日健康打卡汇总归档（计入历史日历）
export interface DailySummary {
  date: string // YYYY-MM-DD
  waterTotalMl: number // 当日累计净补水量
  waterTargetMl: number // 当日目标量
  completedHabits: string[] // 达成目标的习惯 ID 列表
  habitCounts?: Record<string, number> // 当天各习惯完成的具体次数
  streakDays: number
  focusMinutes?: number // 当日累计专注总分钟数
  focusTomatoes?: number // 当日达成番茄数
}

// 全天智能补水时段定义 (Apple Health 灵感)
export interface HydrationScheduleSlot {
  id: string
  name: string
  timeRange: string
  suggestedMl: number
  desc: string
  startHour: number
  endHour: number
  icon: string
  ratio?: number // 占当日总补水量科学配比比例 (如 0.15, 0.25)
}

export type AppMode = 'daily' | 'fitness'
export type TrainingIntensity = 'rest' | 'light' | 'moderate' | 'intense'
export type CompanionMorph = 'classic_aqua' | 'frost_crystal' | 'matcha_spirit' | 'cyber_spark'
export type CompanionScene = 'zen_study' | 'polar_glacier' | 'matcha_garden' | 'cyber_nebula'
export type SoundscapeTrack = 'stream' | 'rain' | 'forest' | 'campfire' | 'waves' | 'nebula'
export type NavigationTab = 'water' | 'habits' | 'focus' | 'stats' | 'settings'

export type PomodoroMode = 'classic' | 'deep' | 'blitz' | 'custom'
export type PomodoroState = 'idle' | 'running' | 'paused' | 'break'

// 单次番茄钟历史记录
export interface PomodoroSession {
  id: string
  timestamp: number // 结束完成的时间戳
  durationMinutes: number // 专注分钟数
  mode: PomodoroMode
  tag: string // 关联标签（如：健康办公、代码沉浸、深度阅读等）
  waterReplenishedMl?: number // 结束后关联补充的水量
}

// 番茄时钟预设模式定义
export interface PomodoroPresetItem {
  id: PomodoroMode
  name: string
  focusMinutes: number
  breakMinutes: number
  icon: string
  tag: string
  desc: string
  color: string
}

export const POMODORO_PRESETS: PomodoroPresetItem[] = [
  {
    id: 'classic',
    name: '经典番茄',
    focusMinutes: 25,
    breakMinutes: 5,
    icon: 'Timer',
    tag: '节奏平衡',
    desc: '25分钟专注 + 5分钟小憩，平衡脑力与精力',
    color: '#0284C7'
  },
  {
    id: 'deep',
    name: '深度心流',
    focusMinutes: 50,
    breakMinutes: 10,
    icon: 'Compass',
    tag: '长效沉浸',
    desc: '50分钟深度钻研 + 10分钟休整，适合编程与研读',
    color: '#6366F1'
  },
  {
    id: 'blitz',
    name: '闪电突击',
    focusMinutes: 15,
    breakMinutes: 3,
    icon: 'Flame',
    tag: '敏捷攻坚',
    desc: '15分钟高效攻坚，专克拖延与解决棘手要事',
    color: '#F59E0B'
  },
  {
    id: 'custom',
    name: '自由定制',
    focusMinutes: 30,
    breakMinutes: 5,
    icon: 'SlidersHorizontal',
    tag: '自主掌控',
    desc: '自由微调 1~120 分钟专属心流时长',
    color: '#0D9488'
  }
]

export interface SoundscapePresetItem {
  id: SoundscapeTrack
  name: string
  subtitle: string
  icon: string
  tag: string
  description: string
  color: string
}

export const SOUNDSCAPE_PRESETS: SoundscapePresetItem[] = [
  {
    id: 'stream',
    name: '高山清溪',
    subtitle: '潺潺泉鸣',
    icon: 'Droplets',
    tag: '专注办公',
    description: '潺潺清泉与流动水珠，平复心率与工作紧张，营造清凉专注的心流场域。',
    color: '#0284C7'
  },
  {
    id: 'rain',
    name: '雨落窗台',
    subtitle: '淅沥春雨',
    icon: 'CloudRain',
    tag: '深度心流',
    description: '双层淅沥雨声掩蔽外界突发杂音，适合深度编程、设计与长时间沉浸思考。',
    color: '#6366F1'
  },
  {
    id: 'forest',
    name: '林海松风',
    subtitle: '苍翠松涛',
    icon: 'Trees',
    tag: '身心舒缓',
    description: '苍翠松林微风与树叶沙沙轻响，缓解久坐屏幕后的眼部疲劳与精神紧绷。',
    color: '#10B981'
  },
  {
    id: 'campfire',
    name: '围炉暖火',
    subtitle: '暖木微响',
    icon: 'Flame',
    tag: '温暖治愈',
    description: '融融暖火与木柴随机爆裂脆响，营造踏实温暖的庇护感，适合晚间微饮小憩。',
    color: '#F97316'
  },
  {
    id: 'waves',
    name: '潮汐海浪',
    subtitle: '节律潮涌',
    icon: 'Waves',
    tag: '呼吸冥想',
    description: '8秒规律浪涌与缓慢退潮，与 4-7-8 深度呼吸节律共振，舒缓神经平稳脉搏。',
    color: '#06B6D4'
  },
  {
    id: 'nebula',
    name: '深空星云',
    subtitle: '空间共振',
    icon: 'Sparkles',
    tag: '极客沉浸',
    description: '低频阿尔法双耳共振与太空白噪音混响，深夜灵感迸发与深度入定。',
    color: '#8B5CF6'
  }
]

// 用户个性化设置
export interface UserSettings {
  weightKg: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'heavy'
  customDailyWaterGoalMl: number | null
  presetVolumes: number[] // 快捷打卡毫升数 (如 [150, 250, 350, 500])
  soundEnabled: boolean
  soundscapeActive: boolean // 潮汐自然流水白噪音开关
  soundscapeTrack?: SoundscapeTrack // 当前选定的声景类型
  soundscapeVolume?: number // 声景音量 (0.0 ~ 1.0, 默认 0.15)
  enableCompanion: boolean // 水滴精灵·小若水桌面伴侣开关
  closeBehavior: 'minimize' | 'exit' // 窗口关闭行为：最小化到托盘 vs 直接退出
  theme: 'light' | 'dark' | 'system'
  dndEnabled: boolean
  dndStart: string
  dndEnd: string
  enableMiniWidget: boolean
  autoLaunch: boolean
  appMode?: AppMode // 运行模式：日常模式 vs 硬核健身模式
  trainingIntensity?: TrainingIntensity // 健身模式今日训练强度
  isTakingCreatine?: boolean // 是否服用肌酸
  isHighProteinDiet?: boolean // 是否高蛋白增肌期
  companionMorph?: CompanionMorph // 水滴精灵外貌形态 (经典若水 / 极地冰晶 / 治愈茶灵 / 电光星核)
  companionScene?: CompanionScene // 水滴精灵所在场景 (晨曦书桌 / 极地冰原 / 禅意茶庭 / 赛博星舱)
  autoSoundscapeSync?: boolean // 专注启动时是否自动联动开启白噪音
  promptHydrationOnPomodoroComplete?: boolean // 专注倒计时结束是否主动弹出工间补水引导
  customPomodoroMinutes?: number // 自定义专注分钟数 (默认 30)
}

// 预设饮品库（仅纯净水 isFixed: true 不可删除，其余均可删除）
export const PRESET_BEVERAGES: BeverageType[] = [
  {
    id: 'pure_water',
    name: '纯净水 / 温开水',
    icon: 'Droplet',
    hydrationFactor: 1.0,
    color: '#007AFF',
    category: 'water',
    description: '最纯粹的补水之源，100% 被身体吸收',
    isFixed: true,
    enabled: true
  },
  {
    id: 'green_tea',
    name: '绿茶 / 乌龙茶',
    icon: 'Leaf',
    hydrationFactor: 0.95,
    color: '#10B981',
    category: 'tea',
    description: '富含茶多酚与抗氧化物，补水效率极高',
    isFixed: false,
    enabled: true
  },
  {
    id: 'black_coffee',
    name: '美式 / 黑咖啡',
    icon: 'Coffee',
    hydrationFactor: 0.8,
    color: '#F59E0B',
    category: 'coffee',
    description: '提神醒脑，含微量咖啡因轻度利尿',
    isFixed: false,
    enabled: true
  },
  {
    id: 'latte',
    name: '拿铁 / 纯牛奶',
    icon: 'Milk',
    hydrationFactor: 0.85,
    color: '#06B6D4',
    category: 'milk',
    description: '补充优质蛋白质与钙质，吸收持久',
    isFixed: false,
    enabled: true
  },
  {
    id: 'sparkling_water',
    name: '气泡水 / 柠檬水',
    icon: 'Sparkles',
    hydrationFactor: 1.0,
    color: '#6366F1',
    category: 'water',
    description: '清爽口感，促进肠道活力',
    isFixed: false,
    enabled: true
  },
  {
    id: 'electrolyte',
    name: '电解质水 / 运动饮料',
    icon: 'Zap',
    hydrationFactor: 1.05,
    color: '#EAB308',
    category: 'healthy',
    description: '运动后补水锁水利器',
    isFixed: false,
    enabled: true
  },
  {
    id: 'juice_soda',
    name: '果汁 / 含糖汽水',
    icon: 'GlassWater',
    hydrationFactor: 0.65,
    color: '#EC4899',
    category: 'juice',
    description: '含有额外糖分，建议适度饮用',
    isFixed: false,
    enabled: true
  },
  {
    id: 'whey_protein',
    name: '乳清蛋白冲饮',
    icon: 'Dumbbell',
    hydrationFactor: 0.9,
    color: '#0EA5E9',
    category: 'healthy',
    description: '增肌修补黄金蛋白液，水解吸收轻度耗水',
    isFixed: false,
    enabled: true
  },
  {
    id: 'bcaa_eaa',
    name: '支链氨基酸水 (BCAA)',
    icon: 'Zap',
    hydrationFactor: 0.98,
    color: '#10B981',
    category: 'healthy',
    description: '围训练期防掉肌肉，维持水合平衡',
    isFixed: false,
    enabled: true
  },
  {
    id: 'pre_workout',
    name: '氮泵 / 训前饮',
    icon: 'Flame',
    hydrationFactor: 0.88,
    color: '#F97316',
    category: 'healthy',
    description: '扩张血管提升力量泵感与充盈水合',
    isFixed: false,
    enabled: true
  }
]

// 全天 5 大科学黄金补水节律 (日常办公模式，比例总和 100%)
export const SMART_SCHEDULE_SLOTS: HydrationScheduleSlot[] = [
  {
    id: 'morning_wake',
    name: '晨起唤醒',
    timeRange: '08:00 - 09:30',
    suggestedMl: 300,
    ratio: 0.15,
    desc: '促进肠道微循环，唤醒身体基础代谢活力',
    startHour: 8,
    endHour: 9.5,
    icon: 'Sunrise'
  },
  {
    id: 'work_focus',
    name: '工间提神',
    timeRange: '10:30 - 11:30',
    suggestedMl: 500,
    ratio: 0.25,
    desc: '缓解高强度工作脑疲劳，保持专注力',
    startHour: 10.5,
    endHour: 11.5,
    icon: 'Briefcase'
  },
  {
    id: 'lunch_refresh',
    name: '餐后清润',
    timeRange: '13:30 - 14:30',
    suggestedMl: 400,
    ratio: 0.2,
    desc: '餐后 1 小时温和补水，促进营养吸收',
    startHour: 13.5,
    endHour: 14.5,
    icon: 'Utensils'
  },
  {
    id: 'afternoon_boost',
    name: '傍晚充能',
    timeRange: '16:00 - 17:00',
    suggestedMl: 500,
    ratio: 0.25,
    desc: '冲散下午困倦，支撑下班前高效产出',
    startHour: 16,
    endHour: 17,
    icon: 'Zap'
  },
  {
    id: 'night_sip',
    name: '睡前微饮',
    timeRange: '20:30 - 21:30',
    suggestedMl: 350,
    ratio: 0.15,
    desc: '少量微抿，防止夜间呼吸微脱水',
    startHour: 20.5,
    endHour: 21.5,
    icon: 'Moon'
  }
]

// 围训练期黄金节律补水 (硬核健身模式，比例总和 100%)
export const FITNESS_SCHEDULE_SLOTS: HydrationScheduleSlot[] = [
  {
    id: 'morning_kickstart',
    name: '晨起代谢激活',
    timeRange: '07:00 - 08:30',
    suggestedMl: 450,
    ratio: 0.15,
    desc: '早起空腹补水，唤醒肠胃与基础代谢',
    startHour: 7,
    endHour: 8.5,
    icon: 'Sunrise'
  },
  {
    id: 'pre_workout',
    name: '训前储水充能',
    timeRange: '11:30 - 13:30',
    suggestedMl: 700,
    ratio: 0.25,
    desc: '训前充盈细胞外液与肌糖原，提升力量泵感',
    startHour: 11.5,
    endHour: 13.5,
    icon: 'Dumbbell'
  },
  {
    id: 'intra_workout',
    name: '训中电解质水',
    timeRange: '15:00 - 17:30',
    suggestedMl: 600,
    ratio: 0.2,
    desc: '微量慢啜补充钠钾，维持肌肉耐力防抽筋掉泵',
    startHour: 15,
    endHour: 17.5,
    icon: 'Zap'
  },
  {
    id: 'post_workout',
    name: '训后蛋白吸收',
    timeRange: '18:00 - 19:30',
    suggestedMl: 700,
    ratio: 0.25,
    desc: '黄金代谢窗口，加速蛋白粉吸收与肌纤维修补',
    startHour: 18,
    endHour: 19.5,
    icon: 'Flame'
  },
  {
    id: 'night_restoration',
    name: '夜间肌肉修护',
    timeRange: '21:00 - 22:30',
    suggestedMl: 450,
    ratio: 0.15,
    desc: '微量慢饮，保障夜间生长激素与肌糖原超量恢复',
    startHour: 21,
    endHour: 22.5,
    icon: 'Moon'
  }
]

// 健身模式专属微健康习惯
export const FITNESS_HABITS: HealthHabitItem[] = [
  {
    id: 'creatine',
    title: '每日一水肌酸',
    subTitle: '5g肌酸足量温水送服，充盈肌细胞',
    icon: 'Pill',
    color: '#F97316',
    enabled: true,
    targetCount: 1,
    currentCount: 0,
    isSystem: true,
    category: 'nutrition'
  },
  {
    id: 'whey_protein',
    title: '乳清蛋白补充',
    subTitle: '训后或两餐间补充 25g 优质蛋白质',
    icon: 'Dumbbell',
    color: '#0EA5E9',
    enabled: true,
    targetCount: 2,
    currentCount: 0,
    isSystem: true,
    category: 'nutrition'
  },
  {
    id: 'post_stretch',
    title: '训后肌肉拉伸',
    subTitle: '针对当日训练肌群拉伸放松 10 分钟',
    icon: 'Activity',
    color: '#10B981',
    enabled: true,
    targetCount: 1,
    currentCount: 0,
    isSystem: true,
    category: 'movement'
  },
  {
    id: 'posture_reset',
    title: '深蹲/体态复位',
    subTitle: '徒手深蹲激活臀腿，改善久坐骨盆前倾',
    icon: 'Zap',
    color: '#8B5CF6',
    enabled: true,
    targetCount: 3,
    currentCount: 0,
    isSystem: true,
    category: 'movement'
  }
]
